import csv
import os
import shutil
import subprocess
import asyncio
import tempfile
from dotenv import load_dotenv
from dataclasses import dataclass
from pathlib import Path
from typing import List, Tuple

load_dotenv()


def report_progress(pct: int, message: str):
    """PROGRESS:XX:message 형식으로 stdout에 출력하여 Java 백엔드에 세부 진행률을 전달합니다."""
    print(f"PROGRESS:{pct}:{message}", flush=True)

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = Path(os.getenv("SMARTADV_OUTPUT", BASE_DIR / "output_clips"))
INPUT_VIDEO_PATH = Path(os.getenv("SMARTADV_INPUT", BASE_DIR / "input.mp4"))
LLM_CSV_PATH = OUTPUT_DIR / "gemini_ad_script.csv"

TTS_SEGMENTS_DIR = OUTPUT_DIR / "tts_segments"
TTS_TIMELINE_PATH = OUTPUT_DIR / "tts_timeline.csv"
NARRATION_MIX_PATH = OUTPUT_DIR / "ad_narration_mix.wav"
FINAL_VIDEO_PATH = OUTPUT_DIR / "input_with_ad.mp4"
FINAL_AUDIO_PATH = OUTPUT_DIR / "input_with_ad_audio.m4a"

# Edge TTS 설정
EDGE_TTS_VOICE = os.getenv("EDGE_TTS_VOICE", "ko-KR-SunHiNeural")
BASE_TTS_SPEED = float(os.getenv("EDGE_TTS_SPEED", "1.0"))
MAX_TTS_SPEED = float(os.getenv("EDGE_TTS_MAX_SPEED", "1.35"))

# 합성 관련 설정
READING_SAFETY_MARGIN_SECONDS = 0.8
TTS_VOLUME = 1.25
ORIGINAL_AUDIO_DUCK_THRESHOLD = 0.02
ORIGINAL_AUDIO_DUCK_RATIO = 8.0
ORIGINAL_AUDIO_DUCK_ATTACK_MS = 15
ORIGINAL_AUDIO_DUCK_RELEASE_MS = 350


@dataclass
class ADScriptRow:
    silence_id: int
    scene_id: int
    start_time: str
    end_time: str
    start_seconds: float
    end_seconds: float
    status: str
    reason: str
    text: str


@dataclass
class GeneratedSegment:
    row: ADScriptRow
    audio_path: Path
    start_ms: int
    duration_seconds: float
    synthesis_speed: float


# ===== 시간 유틸 =====
def hhmmss_to_seconds(value: str) -> float:
    parts = value.strip().split(":")
    if len(parts) != 3:
        raise ValueError(f"HH:MM:SS 형식이 아닙니다: {value}")
    hours, minutes, seconds = map(int, parts)
    return hours * 3600 + minutes * 60 + seconds



def seconds_to_hhmmss(seconds: float) -> str:
    total_seconds = max(0, int(round(seconds)))
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


# ===== 파일/CSV 로드 =====
def load_ad_rows(csv_path: Path) -> List[ADScriptRow]:
    if not csv_path.exists():
        raise FileNotFoundError(f"해설 CSV 파일이 없습니다: {csv_path}")

    rows: List[ADScriptRow] = []
    with csv_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        expected = ["silence_id", "scene_id", "start_time", "end_time", "status", "reason", "text"]
        if reader.fieldnames != expected:
            raise ValueError(f"CSV 헤더가 예상과 다릅니다: {reader.fieldnames}")

        for item in reader:
            if item["status"].strip().lower() != "ok":
                continue
            text = item["text"].strip()
            if not text:
                continue

            start_seconds = hhmmss_to_seconds(item["start_time"])
            end_seconds = hhmmss_to_seconds(item["end_time"])
            rows.append(
                ADScriptRow(
                    silence_id=int(item["silence_id"]),
                    scene_id=int(item["scene_id"]),
                    start_time=item["start_time"].strip(),
                    end_time=item["end_time"].strip(),
                    start_seconds=start_seconds,
                    end_seconds=end_seconds,
                    status=item["status"].strip(),
                    reason=item["reason"].strip(),
                    text=text,
                )
            )

    return rows


# ===== 시스템 유틸 =====
def ensure_ffmpeg_installed() -> None:
    if shutil.which("ffmpeg") is None:
        raise EnvironmentError("ffmpeg가 PATH에 없습니다. 먼저 ffmpeg를 설치하세요.")
    if shutil.which("ffprobe") is None:
        raise EnvironmentError("ffprobe가 PATH에 없습니다. 먼저 ffmpeg를 설치하세요.")



def get_media_duration_seconds(file_path: Path) -> float:
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(file_path),
    ]
    result = subprocess.check_output(cmd, text=True).strip()
    return float(result)



def run_ffmpeg(cmd: List[str]) -> None:
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


# ===== Edge TTS =====
def import_edge_tts():
    try:
        import edge_tts  # type: ignore
    except Exception as exc:  # pragma: no cover
        raise ImportError(
            "edge-tts가 설치되어 있지 않거나 불러올 수 없습니다. "
            "`pip install edge-tts` 후 다시 실행하세요."
        ) from exc
    return edge_tts


async def _synthesize_with_edge_tts_async(text: str, output_path: Path, rate_percent: int) -> None:
    edge_tts = import_edge_tts()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    rate_str = f"{rate_percent:+d}%"
    communicate = edge_tts.Communicate(text=text, voice=EDGE_TTS_VOICE, rate=rate_str)
    await communicate.save(str(output_path))


def synthesize_with_edge_tts(text: str, output_path: Path, speed: float) -> None:
    # edge-tts는 rate를 퍼센트 문자열로 받으므로 speed를 percent로 변환
    rate_percent = int(round((speed - 1.0) * 100))
    asyncio.run(_synthesize_with_edge_tts_async(text, output_path, rate_percent))


# ===== 세그먼트 음성 생성 =====
def fit_segment_audio_to_slot(src_path: Path, dst_path: Path, target_duration: float) -> float:
    actual_duration = get_media_duration_seconds(src_path)
    if target_duration <= 0:
        shutil.copy2(src_path, dst_path)
        return actual_duration

    if actual_duration <= target_duration:
        shutil.copy2(src_path, dst_path)
        return actual_duration

    speed_ratio = min(2.0, actual_duration / target_duration)
    atempo_filters: List[str] = []
    remaining = speed_ratio
    while remaining > 2.0:
        atempo_filters.append("atempo=2.0")
        remaining /= 2.0
    atempo_filters.append(f"atempo={remaining:.6f}")

    run_ffmpeg([
        "ffmpeg", "-y",
        "-i", str(src_path),
        "-filter:a", ",".join(atempo_filters),
        str(dst_path),
    ])
    return get_media_duration_seconds(dst_path)



def generate_tts_segments(rows: List[ADScriptRow]) -> List[GeneratedSegment]:
    print(f"Edge TTS voice 사용: {EDGE_TTS_VOICE}")

    generated: List[GeneratedSegment] = []
    for row in rows:
        available_duration = max(0.5, (row.end_seconds - row.start_seconds) - READING_SAFETY_MARGIN_SECONDS)
        temp_raw_path = TTS_SEGMENTS_DIR / f"silence_{row.silence_id:03d}_scene_{row.scene_id:03d}_raw.wav"
        final_path = TTS_SEGMENTS_DIR / f"silence_{row.silence_id:03d}_scene_{row.scene_id:03d}.wav"

        base_speed = BASE_TTS_SPEED
        synthesize_with_edge_tts(row.text, temp_raw_path, base_speed)
        raw_duration = get_media_duration_seconds(temp_raw_path)

        adaptive_speed = min(MAX_TTS_SPEED, max(BASE_TTS_SPEED, base_speed * (raw_duration / available_duration)))
        if adaptive_speed > base_speed + 0.01:
            synthesize_with_edge_tts(row.text, temp_raw_path, adaptive_speed)

        adjusted_duration = fit_segment_audio_to_slot(temp_raw_path, final_path, available_duration)

        generated.append(
            GeneratedSegment(
                row=row,
                audio_path=final_path,
                start_ms=int(round(row.start_seconds * 1000)),
                duration_seconds=adjusted_duration,
                synthesis_speed=adaptive_speed,
            )
        )
        print(
            f"생성 완료: {final_path.name} | start={row.start_time} | end={row.end_time} "
            f"| duration={adjusted_duration:.2f}s | speed={adaptive_speed:.2f}"
        )

    return generated


# ===== 타임라인 저장 =====
def write_tts_timeline(segments: List[GeneratedSegment], output_path: Path) -> None:
    with output_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "silence_id",
            "scene_id",
            "start_time",
            "end_time",
            "audio_file",
            "audio_duration_seconds",
            "synthesis_speed",
            "text",
        ])
        for segment in segments:
            writer.writerow([
                segment.row.silence_id,
                segment.row.scene_id,
                segment.row.start_time,
                segment.row.end_time,
                segment.audio_path.name,
                f"{segment.duration_seconds:.3f}",
                f"{segment.synthesis_speed:.3f}",
                segment.row.text,
            ])


def render_narration_mix(segments: List[GeneratedSegment]) -> Path:
    """장면별 TTS 세그먼트를 시간축에 맞춰 배치한 내레이션 전용 믹스를 생성합니다."""
    if not segments:
        raise ValueError("내레이션 믹스를 생성할 TTS 세그먼트가 없습니다.")

    narr_inputs: List[str] = []
    narr_parts: List[str] = []
    narr_labels: List[str] = []

    for idx, segment in enumerate(segments):
        narr_inputs.extend(["-i", str(segment.audio_path)])
        label = f"m{idx}"
        narr_parts.append(
            f"[{idx}:a]volume={TTS_VOLUME},adelay={segment.start_ms}|{segment.start_ms},aresample=48000[{label}]"
        )
        narr_labels.append(f"[{label}]")

    if len(narr_labels) == 1:
        narr_parts.append(f"{narr_labels[0]}anull[nout]")
    else:
        narr_parts.append(f"{''.join(narr_labels)}amix=inputs={len(narr_labels)}:normalize=0[nout]")

    narration_cmd = ["ffmpeg", "-y"] + narr_inputs + [
        "-filter_complex", ";".join(narr_parts),
        "-map", "[nout]",
        str(NARRATION_MIX_PATH),
    ]
    run_ffmpeg(narration_cmd)
    return NARRATION_MIX_PATH


def render_narration_and_final_mix(input_video_path: Path, segments: List[GeneratedSegment]) -> Tuple[Path, Path]:
    if not input_video_path.exists():
        raise FileNotFoundError(f"원본 영상 파일이 없습니다: {input_video_path}")

    if not segments:
        raise ValueError("합성할 TTS 세그먼트가 없습니다.")

    narration_mix_path = render_narration_mix(segments)

    # 원본 오디오와 내레이션 믹스를 2입력 구조로 다시 합성한다.
    # narration 트랙은 sidechaincompress용/최종 amix용으로 각각 사용해야 하므로 asplit으로 분기한다.
    filter_complex = (
        f"[0:a]aresample=48000[orig];"
        f"[1:a]aresample=48000,volume={TTS_VOLUME},asplit=2[narr_sc][narr_mix];"
        f"[orig][narr_sc]sidechaincompress="
        f"threshold={ORIGINAL_AUDIO_DUCK_THRESHOLD}:"
        f"ratio={ORIGINAL_AUDIO_DUCK_RATIO}:"
        f"attack={ORIGINAL_AUDIO_DUCK_ATTACK_MS}:"
        f"release={ORIGINAL_AUDIO_DUCK_RELEASE_MS}[ducked];"
        f"[ducked][narr_mix]amix=inputs=2:normalize=0[aout]"
    )

    # 최종 영상 생성
    video_cmd = [
        "ffmpeg", "-y",
        "-i", str(input_video_path),
        "-i", str(narration_mix_path),
        "-filter_complex", filter_complex,
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac",
        str(FINAL_VIDEO_PATH),
    ]
    run_ffmpeg(video_cmd)

    # 최종 오디오만 별도 저장
    audio_cmd = [
        "ffmpeg", "-y",
        "-i", str(input_video_path),
        "-i", str(narration_mix_path),
        "-filter_complex", filter_complex,
        "-map", "[aout]",
        "-c:a", "aac",
        str(FINAL_AUDIO_PATH),
    ]
    run_ffmpeg(audio_cmd)

    return FINAL_AUDIO_PATH, FINAL_VIDEO_PATH


def main() -> None:
    ensure_ffmpeg_installed()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TTS_SEGMENTS_DIR.mkdir(parents=True, exist_ok=True)

    report_progress(68, "해설 대본 CSV 로드 중...")
    rows = load_ad_rows(LLM_CSV_PATH)
    if not rows:
        raise ValueError("TTS로 변환할 해설 문장이 없습니다. gemini_ad_script.csv를 확인하세요.")

    report_progress(72, f"{len(rows)}개 해설 문장 TTS 음성 합성 중...")
    segments = generate_tts_segments(rows)
    write_tts_timeline(segments, TTS_TIMELINE_PATH)

    report_progress(85, "원본 영상과 해설 음성 믹싱 중...")
    final_audio_path, final_video_path = render_narration_and_final_mix(INPUT_VIDEO_PATH, segments)

    report_progress(99, "최종 영상 생성 완료!")
    print(f"TTS 타임라인 저장: {TTS_TIMELINE_PATH}")
    print(f"내레이션 믹스 저장: {NARRATION_MIX_PATH}")
    print(f"최종 오디오 저장: {final_audio_path}")
    print(f"최종 영상 저장: {final_video_path}")


if __name__ == "__main__":
    main()