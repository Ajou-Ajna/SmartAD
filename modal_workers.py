"""
SmartADV Modal GPU 워커

배포:  modal deploy modal_workers.py
테스트: modal run modal_workers.py

engine_backup.py에서 아래 두 함수를 .remote() / .map() 으로 호출합니다.
  - run_vad  : Silero VAD — 16kHz 모노 WAV 바이트 → 음성 구간 타임스탬프 목록
  - run_stt  : openai-whisper — 오디오 바이트 → 한국어 전사 세그먼트 목록
"""

import modal

app = modal.App("smartadv")

# 모델 캐시 볼륨: torch.hub(silero-vad)와 whisper 모델을 콜드 스타트마다
# 재다운로드하지 않도록 /root/.cache 를 영속 볼륨에 마운트합니다.
model_cache = modal.Volume.from_name("smartadv-model-cache", create_if_missing=True)

# Modal 실행 환경 이미지
# - ffmpeg : whisper가 오디오 디코딩에 내부적으로 사용
# - torch / torchaudio : Silero VAD 실행
# - openai-whisper : 한국어 STT (whisper.cpp 바이너리 의존성 제거)
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")
    .pip_install(
        "torch>=2.3.0",
        "torchaudio>=2.3.0",
        "openai-whisper",
    )
)


# ---------------------------------------------------------------------------
# VAD 워커
# ---------------------------------------------------------------------------

@app.function(
    gpu="T4",
    image=image,
    volumes={"/root/.cache": model_cache},
    timeout=600,   # 장편 영상 대응
    retries=1,
)
def run_vad(wav_bytes: bytes) -> list[dict]:
    """Silero VAD를 GPU에서 실행합니다.

    Args:
        wav_bytes: 16kHz 모노 WAV 파일의 바이트 (FFmpeg 추출 결과물).

    Returns:
        음성 구간 목록. 예: [{'start': 12.3, 'end': 15.7}, ...]
        engine_backup.py에서 silence 구간 계산에 사용됩니다.
    """
    import io
    import torch
    import torchaudio

    # bytes → FloatTensor
    buf = io.BytesIO(wav_bytes)
    wav, sr = torchaudio.load(buf)

    # 샘플레이트 보정 (혹시 16kHz가 아닌 경우)
    if sr != 16000:
        wav = torchaudio.transforms.Resample(sr, 16000)(wav)
    # 스테레오라면 모노로 다운믹스
    if wav.shape[0] > 1:
        wav = wav.mean(0, keepdim=True)
    wav = wav.squeeze(0)   # (samples,)

    # Silero VAD 로드 (Volume 캐시 → 재다운로드 없음)
    model, utils = torch.hub.load(
        repo_or_dir="snakers4/silero-vad",
        model="silero_vad",
        trust_repo=True,
    )
    model = model.to("cuda")
    get_speech_timestamps = utils[0]

    wav = wav.to("cuda")

    # 진폭 게이팅: engine_backup.py 원본과 동일한 -25 dB 임계값
    amplitude_limit = 10 ** (-25.0 / 20)
    wav[wav.abs() < amplitude_limit] = 0.0

    speech_timestamps = get_speech_timestamps(
        wav,
        model,
        sampling_rate=16000,
        return_seconds=True,
        threshold=0.9,
        min_speech_duration_ms=250,
        min_silence_duration_ms=100,
    )

    # JSON-serializable dict 형태로 변환
    return [{"start": float(ts["start"]), "end": float(ts["end"])} for ts in speech_timestamps]


# ---------------------------------------------------------------------------
# STT 워커
# ---------------------------------------------------------------------------

@app.function(
    gpu="T4",
    image=image,
    volumes={"/root/.cache": model_cache},
    timeout=120,   # 15초짜리 context audio 기준 충분
    retries=1,
)
def run_stt(audio_bytes: bytes) -> list[dict]:
    """openai-whisper를 GPU에서 실행합니다.

    engine_backup.py에서 .map(audio_bytes_list) 로 호출되어
    모든 context audio 클립을 병렬 전사합니다.

    Args:
        audio_bytes: 16kHz 모노 WAV 파일의 바이트 (context audio 클립).

    Returns:
        전사 세그먼트 목록. 예: [{'relative_start': 3, 'text': '안녕하세요'}, ...]
        relative_start는 해당 클립 내 발화 시작 시각(초, int).
    """
    import os
    import tempfile
    import whisper

    # whisper는 파일 경로를 요구하므로 임시 파일 경유
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_bytes)
        tmp_path = f.name

    try:
        model = whisper.load_model("small")   # Volume 캐시 → 재다운로드 없음
        result = model.transcribe(tmp_path, language="ko", task="transcribe")
    finally:
        os.unlink(tmp_path)

    segments = []
    for seg in result.get("segments", []):
        text = seg.get("text", "").strip()
        if text:
            segments.append({
                "relative_start": int(seg["start"]),
                "text": text,
            })
    return segments


# ---------------------------------------------------------------------------
# 로컬 테스트 엔트리포인트
# ---------------------------------------------------------------------------

@app.local_entrypoint()
def test():
    """modal run modal_workers.py 로 배포 상태를 빠르게 확인합니다."""
    print("✅ VAD  함수:", run_vad.get_info())
    print("✅ STT  함수:", run_stt.get_info())
    print("배포 확인 완료 — engine_backup.py에서 .remote() / .map() 으로 호출 가능합니다.")
