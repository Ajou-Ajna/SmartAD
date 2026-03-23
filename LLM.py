import csv
import io
import os
import re
import time
from dotenv import load_dotenv
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from google import genai
from google.genai import types




# ===== 설정 =====

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output_clips"
SILENCE_SUMMARY_PATH = OUTPUT_DIR / "silence_summary.txt"
STT_SUMMARY_PATH = OUTPUT_DIR / "stt_summary.txt"

CONTEXT_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
GEMINI_MODEL = "gemini-3-flash-preview"
LLM_RAW_OUTPUT_PATH = OUTPUT_DIR / "gemini_ad_raw.txt"
LLM_CSV_OUTPUT_PATH = OUTPUT_DIR / "gemini_ad_script.csv"

LLM_TXT_OUTPUT_PATH = OUTPUT_DIR / "gemini_ad_script.txt"

GEMINI_CLEAR_FILES_BEFORE_REQUEST = os.getenv("GEMINI_CLEAR_FILES_BEFORE_REQUEST", "1") == "1"
GEMINI_DELETE_UPLOADED_FILES_AFTER_REQUEST = os.getenv("GEMINI_DELETE_UPLOADED_FILES_AFTER_REQUEST", "1") == "1"
GEMINI_FILE_POLL_INTERVAL_SECONDS = float(os.getenv("GEMINI_FILE_POLL_INTERVAL_SECONDS", "2.0"))
GEMINI_FILE_POLL_TIMEOUT_SECONDS = float(os.getenv("GEMINI_FILE_POLL_TIMEOUT_SECONDS", "60.0"))


# ===== 데이터 구조 =====
@dataclass
class SceneInfo:
    scene_id: int
    start_seconds: float
    end_seconds: float
    duration_seconds: float
    cut_time_seconds: Optional[float] = None
    before_image: Optional[Path] = None
    after_image: Optional[Path] = None


@dataclass
class SilenceInfo:
    silence_id: int
    start_seconds: float
    end_seconds: float
    scene_cut_seconds: List[float] = field(default_factory=list)
    context_before_lines: List[str] = field(default_factory=list)
    context_after_lines: List[str] = field(default_factory=list)
    scenes: List[SceneInfo] = field(default_factory=list)


# ===== 유틸 =====
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


def parse_silence_summary(path: Path) -> Dict[int, SilenceInfo]:
    if not path.exists():
        raise FileNotFoundError(f"무음 요약 파일이 없습니다: {path}")

    silences: Dict[int, SilenceInfo] = {}
    current_id: Optional[int] = None

    silence_re = re.compile(r"무음구간\s*(\d+)\.\s*\((\d{2}:\d{2}:\d{2})\s*~\s*(\d{2}:\d{2}:\d{2})\)")
    cut_re = re.compile(r"장면전환\s*(\d+)\s*(\d{2}:\d{2}:\d{2})")

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("["):
            continue

        silence_match = silence_re.match(line)
        if silence_match:
            silence_id = int(silence_match.group(1))
            start_seconds = hhmmss_to_seconds(silence_match.group(2))
            end_seconds = hhmmss_to_seconds(silence_match.group(3))
            silences[silence_id] = SilenceInfo(
                silence_id=silence_id,
                start_seconds=start_seconds,
                end_seconds=end_seconds,
            )
            current_id = silence_id
            continue

        if line == "장면전환 NULL":
            continue

        cut_match = cut_re.match(line)
        if cut_match and current_id is not None:
            silences[current_id].scene_cut_seconds.append(hhmmss_to_seconds(cut_match.group(2)))

    print(f"[입력] 무음구간 요약 파싱 완료: {len(silences)}개")
    return silences


def parse_stt_summary(path: Path, silences: Dict[int, SilenceInfo]) -> None:
    if not path.exists():
        raise FileNotFoundError(f"STT 요약 파일이 없습니다: {path}")

    current_id: Optional[int] = None
    current_side: Optional[str] = None
    header_re = re.compile(r"\[무음구간(\d+)\s+(전|후)\]")

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            continue

        header_match = header_re.match(line)
        if header_match:
            current_id = int(header_match.group(1))
            current_side = "before" if header_match.group(2) == "전" else "after"
            continue

        if current_id is None or current_side is None:
            continue
        if current_id not in silences:
            continue
        if line == "대사 없음":
            continue

        if current_side == "before":
            silences[current_id].context_before_lines.append(line)
        else:
            silences[current_id].context_after_lines.append(line)

    total_before = sum(len(s.context_before_lines) for s in silences.values())
    total_after = sum(len(s.context_after_lines) for s in silences.values())
    print(f"[입력] 전 대사 {total_before}개, 후 대사 {total_after}개 로드 완료")


def collect_scene_images(silences: Dict[int, SilenceInfo], image_dir: Path) -> None:
    # 파일명 예시: silence_001_cut01_before.jpg / silence_001_cut01_after.jpg
    image_map: Dict[Tuple[int, int], Dict[str, Path]] = {}
    collected_image_count = 0
    image_re = re.compile(r"silence_(\d+)_cut(\d+)_(before|after)\.(jpg|jpeg|png|webp)$", re.IGNORECASE)

    for file_path in image_dir.iterdir():
        if not file_path.is_file() or file_path.suffix.lower() not in CONTEXT_IMAGE_EXTENSIONS:
            continue
        match = image_re.match(file_path.name)
        if not match:
            continue
        silence_id = int(match.group(1))
        scene_id = int(match.group(2))
        side = match.group(3).lower()
        image_map.setdefault((silence_id, scene_id), {})[side] = file_path
        collected_image_count += 1

    for silence in silences.values():
        boundaries = [silence.start_seconds] + silence.scene_cut_seconds + [silence.end_seconds]
        scenes: List[SceneInfo] = []
        for idx in range(len(boundaries) - 1):
            scene_id = idx + 1
            start_seconds = boundaries[idx]
            end_seconds = boundaries[idx + 1]
            duration_seconds = max(0.0, end_seconds - start_seconds)
            pair = image_map.get((silence.silence_id, scene_id), {})
            scenes.append(
                SceneInfo(
                    scene_id=scene_id,
                    start_seconds=start_seconds,
                    end_seconds=end_seconds,
                    duration_seconds=duration_seconds,
                    cut_time_seconds=silence.scene_cut_seconds[idx] if idx < len(silence.scene_cut_seconds) else None,
                    before_image=pair.get("before"),
                    after_image=pair.get("after"),
                )
            )
        silence.scenes = scenes
    total_scene_count = sum(len(s.scenes) for s in silences.values())
    print(f"[입력] 키프레임 이미지 {collected_image_count}개, 장면 {total_scene_count}개 구성 완료")


def build_prompt(silences: Dict[int, SilenceInfo]) -> str:
    prompt_lines: List[str] = []
    prompt_lines.extend([
        "당신은 시각장애인을 위한 전문 오디오 화면해설(Audio Description) 작가입니다.",
        "입력으로 제공되는 무음구간 정보, 전후 대사 맥락, 그리고 각 장면의 before/after 키프레임 이미지를 분석하여 장면별 화면해설을 작성하십시오.",
        "모든 무음구간을 한 번에 분석하되, 결과는 반드시 구간별/장면별로 구분해서 출력하십시오.",
        "",
        "[핵심 규칙]",
        "1. 오직 무음구간 내부의 시각 정보만 묘사합니다.",
        "2. 전후 대사는 행동의 이유를 추론하는 참고용으로만 사용하고, 출력 문장에 직접 쓰지 않습니다.",
        "3. 감정 해석, 소리 묘사, 추측성 표현은 금지합니다.",
        "4. 장면 길이보다 최소 1초 이상 짧게 읽히도록 간결하게 작성합니다.",
        "5. 너무 짧아서 해설이 불가능한 장면은 text를 비우지 말고 status=skip, reason에 짧은 사유를 적습니다.",
        "6. 해설 가능 장면은 status=ok, reason은 빈 문자열로 둡니다.",
        "7. 출력은 반드시 CSV만 반환합니다. 코드블록, 설명문, 마크다운을 절대 추가하지 않습니다.",
        "",
        "[출력 CSV 스키마]",
        "silence_id,scene_id,start_time,end_time,status,reason,text",
        "- start_time, end_time: 원본 영상 기준 HH:MM:SS",
        "- status: ok 또는 skip",
        "- reason: skip인 경우만 짧게 작성, 아니면 빈 문자열",
        "- text: TTS에 바로 넣을 수 있는 평어체 한 문장 또는 두 문장",
        "",
        "[입력 데이터]",
    ])

    for silence_id in sorted(silences):
        silence = silences[silence_id]
        prompt_lines.append(f"## 무음구간 {silence.silence_id}")
        prompt_lines.append(
            f"구간: {seconds_to_hhmmss(silence.start_seconds)} ~ {seconds_to_hhmmss(silence.end_seconds)}"
        )
        if silence.context_before_lines:
            prompt_lines.append("[전 대사]")
            prompt_lines.extend(silence.context_before_lines)
        else:
            prompt_lines.append("[전 대사]\n대사 없음")

        if silence.context_after_lines:
            prompt_lines.append("[후 대사]")
            prompt_lines.extend(silence.context_after_lines)
        else:
            prompt_lines.append("[후 대사]\n대사 없음")

        if silence.scene_cut_seconds:
            prompt_lines.append(
                "장면전환 시각: " + ", ".join(seconds_to_hhmmss(t) for t in silence.scene_cut_seconds)
            )
        else:
            prompt_lines.append("장면전환 시각: 없음")

        prompt_lines.append("[장면 목록]")
        for scene in silence.scenes:
            prompt_lines.append(
                f"- scene_id={scene.scene_id}, "
                f"start={seconds_to_hhmmss(scene.start_seconds)}, "
                f"end={seconds_to_hhmmss(scene.end_seconds)}, "
                f"duration={scene.duration_seconds:.2f}s, "
                f"before_image={scene.before_image.name if scene.before_image else '없음'}, "
                f"after_image={scene.after_image.name if scene.after_image else '없음'}"
            )
        prompt_lines.append("")

    prompt_lines.append("반드시 CSV 헤더부터 출력하십시오.")
    prompt = "\n".join(prompt_lines)
    print(f"[프롬프트] 생성 완료: {len(prompt)}자")
    return prompt


def build_multimodal_contents(prompt: str, silences: Dict[int, SilenceInfo], client) -> Tuple[List[object], List[str]]:
    contents: List[object] = [prompt]
    uploaded_file_names: List[str] = []

    image_paths: List[Path] = []
    for silence_id in sorted(silences):
        silence = silences[silence_id]
        for scene in silence.scenes:
            if scene.before_image and scene.before_image.exists():
                image_paths.append(scene.before_image)
            if scene.after_image and scene.after_image.exists():
                image_paths.append(scene.after_image)

    total_images = len(image_paths)
    print(f"[프롬프트] Files API 업로드 시작: 총 이미지 {total_images}개")

    for idx, image_path in enumerate(image_paths, start=1):
        print(f"[Files API] 업로드 중 ({idx}/{total_images}): {image_path.name}")
        uploaded_file = upload_gemini_file(client, image_path)
        contents.append(uploaded_file)
        uploaded_file_names.append(uploaded_file.name)
        print(f"[Files API] 업로드 완료 ({idx}/{total_images}): {image_path.name} -> {uploaded_file.name}")

    print(f"[프롬프트] Files API 업로드 완료: 텍스트 1개 + 원격 이미지 {total_images}개")
    return contents, uploaded_file_names
def upload_gemini_file(client, file_path: Path):
    """단일 이미지를 Gemini Files API에 업로드하고 ACTIVE 상태가 될 때까지 대기합니다."""
    uploaded_file = client.files.upload(file=str(file_path))
    print(f"[Files API] 원격 처리 대기 시작: {file_path.name} -> {uploaded_file.name}")
    deadline = time.time() + GEMINI_FILE_POLL_TIMEOUT_SECONDS
    last_logged_state = None

    while time.time() < deadline:
        current = client.files.get(name=uploaded_file.name)
        state = getattr(current, "state", None)
        state_name = getattr(state, "name", str(state)) if state is not None else "UNKNOWN"

        if state_name != last_logged_state:
            print(f"[Files API] 상태 변경: {file_path.name} -> {state_name}")
            last_logged_state = state_name

        if state_name == "ACTIVE":
            return current
        if state_name == "FAILED":
            raise RuntimeError(f"Gemini Files API 처리 실패: {file_path} -> {uploaded_file.name}")

        time.sleep(GEMINI_FILE_POLL_INTERVAL_SECONDS)

    raise TimeoutError(f"Gemini Files API 활성화 대기 타임아웃: {file_path} -> {uploaded_file.name}")


def delete_uploaded_gemini_files(client, file_names: List[str]) -> None:
    """이번 요청에서 업로드한 Gemini Files API 파일만 정리합니다."""
    if not GEMINI_DELETE_UPLOADED_FILES_AFTER_REQUEST:
        print("[Gemini] 요청 후 업로드 파일 삭제 생략 설정됨")
        return

    deleted_count = 0
    failed_count = 0

    for file_name in file_names:
        try:
            client.files.delete(name=file_name)
            deleted_count += 1
        except Exception:
            failed_count += 1

    print(f"[Gemini] 요청 후 업로드 파일 정리 완료: 삭제 {deleted_count}개, 실패 {failed_count}개")


def _guess_mime_type(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in {".jpg", ".jpeg"}:
        return "image/jpeg"
    if suffix == ".png":
        return "image/png"
    if suffix == ".webp":
        return "image/webp"
    raise ValueError(f"지원하지 않는 이미지 확장자입니다: {path}")


def strip_code_fence(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    return cleaned


def normalize_csv_text(csv_text: str) -> str:
    cleaned = strip_code_fence(csv_text)
    rows = list(csv.reader(io.StringIO(cleaned)))
    if not rows:
        raise ValueError("Gemini 응답에서 CSV를 찾지 못했습니다.")

    expected_header = ["silence_id", "scene_id", "start_time", "end_time", "status", "reason", "text"]
    header = [cell.strip() for cell in rows[0]]
    if header != expected_header:
        raise ValueError(f"CSV 헤더가 예상과 다릅니다: {header}")

    output = io.StringIO()
    writer = csv.writer(output, lineterminator="\n")
    writer.writerow(expected_header)

    for row in rows[1:]:
        if not row or all(not cell.strip() for cell in row):
            continue
        normalized = (row + [""] * len(expected_header))[: len(expected_header)]
        normalized = [cell.strip() for cell in normalized]
        writer.writerow(normalized)

    return output.getvalue().strip() + "\n"



def csv_to_txt(csv_text: str) -> str:
    reader = csv.DictReader(io.StringIO(csv_text))
    blocks: List[str] = []

    for row in reader:
        silence_id = row["silence_id"]
        scene_id = row["scene_id"]
        start_time = row["start_time"]
        end_time = row["end_time"]
        status = row["status"]
        reason = row["reason"]
        text = row["text"]

        blocks.append(f"[무음구간{silence_id} 장면{scene_id}]")
        blocks.append(f"구간 {start_time} ~ {end_time}")
        if status == "skip":
            blocks.append(f"생성 불가 ({reason or '시간 부족'})")
        else:
            blocks.append(text)
        blocks.append("")

    return "\n".join(blocks).strip() + "\n"


def cleanup_gemini_files(client) -> None:
    """요청 시작 전에 Gemini Files API에 남아 있는 이전 업로드 파일들을 정리합니다."""
    if not GEMINI_CLEAR_FILES_BEFORE_REQUEST:
        print("[Gemini] Files API 사전 정리 생략 설정됨")
        return

    print("[Gemini] Files API 사전 정리 시작")
    deleted_count = 0
    failed_count = 0
    listed_count = 0

    try:
        for file_obj in client.files.list():
            listed_count += 1
            file_name = getattr(file_obj, "name", None)
            if not file_name:
                continue

            try:
                client.files.delete(name=file_name)
                deleted_count += 1
                print(f"[Gemini] 이전 업로드 파일 삭제: {file_name}")
            except Exception as exc:
                failed_count += 1
                print(f"[Gemini] 이전 업로드 파일 삭제 실패: {file_name} | {exc}")

        print(
            f"[Gemini] Files API 사전 정리 완료: 조회 {listed_count}개, 삭제 {deleted_count}개, 실패 {failed_count}개"
        )
    except Exception as exc:
        print(f"[Gemini] Files API 목록 조회/정리 실패: {exc}")


def call_gemini(prompt: str, silences: Dict[int, SilenceInfo]) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.")

    client = genai.Client(api_key=api_key)
    cleanup_gemini_files(client)
    contents, uploaded_file_names = build_multimodal_contents(prompt, silences, client)
    print(f"[Gemini] 요청 시작: model={GEMINI_MODEL}")

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="text/plain",
            ),
        )
    finally:
        delete_uploaded_gemini_files(client, uploaded_file_names)

    print("[Gemini] 응답 수신 완료")
    if not response.text:
        raise ValueError("Gemini 응답 텍스트가 비어 있습니다.")

    return response.text


def load_all_inputs() -> Dict[int, SilenceInfo]:
    print("[1/4] 입력 파일 파싱 시작")
    silences = parse_silence_summary(SILENCE_SUMMARY_PATH)
    parse_stt_summary(STT_SUMMARY_PATH, silences)
    collect_scene_images(silences, OUTPUT_DIR)
    print("[1/4] 입력 파일 파싱 완료")
    return silences


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    silences = load_all_inputs()
    print(f"[2/4] 무음구간 데이터 준비 완료: {len(silences)}개")
    if not silences:
        raise ValueError("처리할 무음구간 데이터가 없습니다.")

    print("[3/4] Gemini 프롬프트 생성 시작")
    prompt = build_prompt(silences)
    print("[3/4] Gemini 프롬프트 생성 완료")
    print("[4/4] Gemini 호출 시작")
    raw_response = call_gemini(prompt, silences)
    print(f"[4/4] Gemini 호출 완료: 응답 {len(raw_response)}자")

    print("[저장] 원본 응답 저장 시작")
    LLM_RAW_OUTPUT_PATH.write_text(raw_response, encoding="utf-8")
    print(f"[저장] 원본 응답 저장 완료: {LLM_RAW_OUTPUT_PATH}")

    print("[저장] 응답 후처리 및 파일 저장 시작")
    normalized_csv = normalize_csv_text(raw_response)
    LLM_CSV_OUTPUT_PATH.write_text(normalized_csv, encoding="utf-8")
    LLM_TXT_OUTPUT_PATH.write_text(csv_to_txt(normalized_csv), encoding="utf-8")
    print("[저장] 응답 후처리 및 파일 저장 완료")

    print(f"Gemini 원본 응답 저장: {LLM_RAW_OUTPUT_PATH}")
    print(f"Gemini CSV 저장: {LLM_CSV_OUTPUT_PATH}")
    print(f"Gemini TXT 저장: {LLM_TXT_OUTPUT_PATH}")


if __name__ == "__main__":
    main()