"""
SmartADV Modal GPU 워커

배포:  modal deploy modal_workers.py
테스트: modal run modal_workers.py

engine_backup.py에서 아래 함수를 .map() 으로 호출합니다.
  - run_stt  : openai-whisper (GPU) — 오디오 바이트 → 한국어 전사 세그먼트 목록

[참고] Silero VAD는 GPU 미지원으로 EC2 CPU에서 로컬 실행합니다 (engine_backup.py 참고).
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
# STT 워커  (VAD는 EC2 CPU 로컬 실행 → engine_backup.py 참고)
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
    print("✅ STT  함수:", run_stt.get_info())
    print("배포 확인 완료 — engine_backup.py에서 .map() 으로 호출 가능합니다.")
