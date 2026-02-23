#파이썬 외부 터미널을 사용하기 위함
import subprocess

#파이토치 임포트
import torch
#운영체제와 상호작용하기 위한 모듈
import os

# 🌟 [추가됨] 실행 시간 측정 및 CPU 모니터링 모듈
import time
import psutil

# --설정 영역 start--

# 분석할 원본 동영상 파일
INPUT_FILE = "input.mkv"

# Silero VAD 모델이 분석하기 위해 사용할 임시 오디오 파일의 이름
TEMP_WAV = "tmep_16k.wav"

# 잘라낸 무음 구간 클립들을 모아둘 폴더명
OUTPUT_DIR = "output_clips"

# 너무 짧은 구간을 무시하기 위한 최소길이 (초)
MIN_SILENCE_DURATION = 3.0

# 하드웨어 가속 설정 (True: CPU 강제 사용, False: 가능하면 GPU 사용)
CPU_ONLY = False

# --설정 영역 end--

def get_video_duration(file_path):
    # 영상 전체 길이를 초 단위로 알아내기 위한 함수
    # ffprobe는 ffmpeg 화 함꼐 깔리는 미디어 정보 분석 도구
    # 영상 포맷 정보 중 duration 만 정확히 텍스트로 뽑아내도록 함

    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of",
        "default=noprint_wrappers=1:nokey=1", file_path
    ]

    # cmd에 저장한 명령어를 터미널에 입력하고, 나온 결과를 문자열로 치환후 양쪽 공백 제거
    result = subprocess.check_output(cmd).decode("utf-8").strip()

    return float(result)

def main():
    # 🌟 [모니터링 시작] 초정밀 타이머 시작 및 CPU 점유율 측정 기준점 설정
    start_time = time.perf_counter()
    psutil.cpu_percent(percpu=True)  # 첫 호출로 0%부터 측정 시작을 위한 베이스라인 세팅

    # OUTPUT_DIR이 존재하지 않는 경우, 생성
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 연산 디바이스(Device) 결정 로직 추가
    if CPU_ONLY or not torch.cuda.is_available():
        device = torch.device('cpu')
        print("[시스템] 연산 장치: CPU 모드로 실행됩니다.")
    else:
        device = torch.device('cuda')
        print(f"[시스템] 연산 장치: GPU ({torch.cuda.get_device_name(0)}) 모드로 실행됩니다.")

    # STEP1. ffmpeg를 통한 분석 오디오 추출

    print("[1/4] 영상에서 오디오를 추출하는 중...")

    # Silero VAD는 16KHZ 오디오를 가장 잘 인식하기에, 원본 소스를 16KHZ로 리샘플링
    # -y : 덮어쓰기 허용 / -vn : 비디오 제외 / -ac 1: 모노채널/ -ar 16000 16KHZ
    subprocess.run(["ffmpeg", "-y", "-i", INPUT_FILE, "-vn",
                    "-ac", "1", "-ar", "16k", TEMP_WAV],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    # DEVNULL : 터미널이 ffmpeg 로그로 지저분해지는 것을 막기위해 stdout와 stderr을 NULL로

    # STEP2. Silero VAD 로드 및 음성(대사) 구간 탐지

    print("[2/4] Silero VAD 모델 로드 및 대사 구간 탐지중...")

    # PyTorch Hub를 이용해 깃허브에서 Silero VAD 모델을 직접 가져옴
    # 로컬에 모델 파일이 없으면 자동으로 다운로드하고, 있으면 캐시된 모델을 빠르게 메모리에 올림.
    model, utils = torch.hub.load(repo_or_dir='snakers4/silero-vad',
                                  model='silero_vad',
                                  trust_repo=True)

    # AI 모델을 위에서 결정한 device(CPU 또는 GPU) 메모리에 올림
    model = model.to(device)

    # utils에서  필요한 함수 2개(타임스탬프 얻기, 오디오 읽기) 뽑아오기
    get_speech_timestamps, _, read_audio, _, _ = utils

    # 방금 전 FFmpeg로 만든 16kHz 임시 오디오 파일을 데이터로 읽어 들임
    wav = read_audio(TEMP_WAV)

    # 오디오 데이터(Tensor)도 모델과 똑같은 위치로 보냄
    wav = wav.to(device)

    # Torch 전처리 로직
    db_threshold = -25.0  # -35dB보다 작은 소리는 무시 (상황에 맞춰 -30, -40 등으로 조절)
    amplitude_limit = 10 ** (db_threshold / 20)
    wav[wav.abs() < amplitude_limit] = 0.0

    # VAD 모델에 오디오 데이터를 넣고 "대사가 있는 구간"을 찾음
    # return_seconds=True를 주면 프레임 단위가 아니라  '초(Second)' 단위로 결과 출력
    speech_timestamps = get_speech_timestamps(
        wav,
        model,
        sampling_rate=16000,
        return_seconds=True,
        threshold=0.9,  # (핵심) 기본값 0.5. 이 값을 0.7~0.8로 올리면 작거나 희미한 목소리는 무시합니다.
        min_speech_duration_ms=250,  # 250ms(0.25초)보다 짧은 소리(헛기침, 쩝 소리 등)는 대사로 치지 않습니다.
        min_silence_duration_ms=100  # 100ms 정도의 아주 짧은 묵음은 하나의 대사로 이어붙입니다.
    )


    # STEP 3. 무음(Non-speech) 구간 계산 (음성 구간의 반전)

    print("[3/4] 무음 구간 타임스탬프 계산 중...")

    # 영상의 총 길이를 먼저 구함.
    total_duration = get_video_duration(INPUT_FILE)
    silence_timestamps = []
    current_time = 0.0

    # VAD가 찾아낸 '대사가 있는 구간'들을 하나씩 꺼내보면서 그 사이사이의 빈틈(무음)을 찾음.
    for speech in speech_timestamps:
        start_speech = speech['start']  # 대사가 시작되는 시간
        end_speech = speech['end']  # 대사가 끝나는 시간

        # 이전 대사가 끝난 시간(current_time)보다 다음 대사가 늦게 시작한다면, 그 사이가 대사가 없는 구간임.
        if start_speech > current_time:
            # 찾아낸 무음 구간을 리스트에 저장
            silence_timestamps.append({'start': current_time, 'end': start_speech})

        # 탐색 위치를 방금 끝난 대사의 종료 시간으로 업데이트
        current_time = end_speech

    # 영상 맨 마지막에 대사가 끝나고 난 뒤부터 영상이 완전히 끝날 때까지의 남은 꼬리 부분도 무음 구간으로 처리
    if current_time < total_duration:
        silence_timestamps.append({'start': current_time, 'end': total_duration})


    # STEP 4. FFmpeg로 무음 구간 원본 영상에서 잘라내기

    print(f"[4/4] 총 {len(silence_timestamps)}개의 무음 구간을 FFmpeg로 분할합니다...")

    clip_count = 0
    # 찾아낸 무음 구간 리스트를 하나씩 꺼내어 영상을 자름.
    for silence in silence_timestamps:
        start = silence['start']
        end = silence['end']
        duration = end - start  # 잘라낼 영상의 길이 계산

        # 무음 구간이 설정한 최소 길이보다 짧으면 무시하고 넘어감. (너무 자잘한 클립 생성 방지)
        if duration < MIN_SILENCE_DURATION:
            continue

        clip_count += 1
        # 저장될 파일 이름을 001, 002 형식으로 보기 좋게 만듬. (예: output_clips/silence_001.mp4)
        file_ext = os.path.splitext(INPUT_FILE)[1]
        out_file = os.path.join(OUTPUT_DIR, f"silence_{clip_count:03d}{file_ext}")

        # 영상을 실제로 자르는 핵심 명령어
        # -ss: 자르기 시작할 시간 / -to: 자르기 끝낼 시간
        # -c copy: 비디오와 오디오를 인코딩(렌더링)하지 않고 그대로 복사
        # (이 옵션 덕분에 GPU/CPU 부하가 0에 가깝고, 1시간짜리 영상을 자를 때도 몇 초 안에 끝남.)
        cmd = [
            "ffmpeg", "-y", "-i", INPUT_FILE,
            "-ss", str(start), "-to", str(end),
            "-c", "copy", out_file

        # 잘라내기 명령어 실행 (마찬가지로 로그는 화면에 보이지 않게 숨김 처리)
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"생성됨: {out_file} (구간: {start:.2f}초 ~ {end:.2f}초, 길이: {duration:.2f}초)")

    # 영상 자르기가 모두 끝났으므로, 처음에 만들었던 임시 오디오 파일(temp_16k.wav)을 지워서 용량 확보
    if os.path.exists(TEMP_WAV):
        os.remove(TEMP_WAV)

    print("모든 작업이 완료되었습니다")

    #  [모니터링 종료 및 결과 출력]
    end_time = time.perf_counter()
    cpu_loads = psutil.cpu_percent(percpu=True)

    print("\n" + "="*40)
    print("[시스템 성능 프로파일링 결과]")
    print("="*40)
    print(f" 총 실행 시간 : {end_time - start_time:.3f} 초")
    print(f"코어별 평균 CPU 점유율:")
    for i, load in enumerate(cpu_loads):
        print(f"   - Core {i:02d}: {load:5.1f}%")
    print("="*40)


# 이 파이썬 파일을 직접 실행했을 때만 main() 함수가 작동하도록 하는 파이썬의 표준적인 관용구
if __name__ == "__main__":
    main()