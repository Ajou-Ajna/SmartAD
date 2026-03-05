# 파이썬 외부 터미널을 사용하기 위함
import subprocess

# 파이토치 임포트
import torch
# 운영체제와 상호작용하기 위한 모듈
import os

# 실행 시간 측정 및 CPU 모니터링 모듈
import time
import psutil

# FFmpeg 로그 분석을 위한 정규표현식 모듈
import re

# --설정 영역 start--

# 분석할 원본 동영상 파일
INPUT_FILE = "input.mp4"

# Silero VAD 모델이 분석하기 위해 사용할 임시 오디오 파일의 이름
TEMP_WAV = "tmep_16k.wav"

# 잘라낸 무음 구간 클립들을 모아둘 폴더명
OUTPUT_DIR = "output_clips"

# 너무 짧은 구간을 무시하기 위한 최소길이 (초)
MIN_SILENCE_DURATION = 3.0

# 장면 전환(카메라 컷) 감지 민감도 (기본 0.3)
SCENE_THRESHOLD = 0.3

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


def detect_scene_changes(video_path, threshold=0.3):
    """FFmpeg를 이용해 영상 내 카메라 구도가 바뀌는 타임스탬프를 추출합니다."""
    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-filter:v", f"select='gt(scene,{threshold})',showinfo",
        "-f", "null", "-"
    ]
    result = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.DEVNULL, text=True, encoding='utf-8')

    scene_times = []
    for line in result.stderr.splitlines():
        if "Parsed_showinfo" in line and "pts_time:" in line:
            match = re.search(r"pts_time:([0-9.]+)", line)
            if match:
                time_val = float(match.group(1))
                if time_val > 0.1:  # 극초반 0초에 잡히는 가짜 컷은 무시
                    scene_times.append(time_val)
    return scene_times


def main():
    # 초정밀 타이머 시작 및 CPU 점유율 측정 기준점 설정
    start_time = time.perf_counter()
    psutil.cpu_percent(percpu=True)  # 첫 호출로 0%부터 측정 시작을 위한 베이스라인 세팅

    # OUTPUT_DIR이 존재하지 않는 경우, 생성
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 🌟 연산 디바이스(Device) 결정 로직 (크로스 플랫폼 지원 🌟)
    if CPU_ONLY:
        device = torch.device('cpu')
        print("🖥️ [시스템] 연산 장치: 강제 CPU 모드로 실행됩니다.")
    elif torch.cuda.is_available():
        # 윈도우 데스크탑 (NVIDIA GPU)
        device = torch.device('cuda')
        print(f"🚀 [시스템] 연산 장치: 윈도우 GPU ({torch.cuda.get_device_name(0)}) 모드로 실행됩니다.")
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        # 맥북 M4 Pro 등 (Apple Silicon GPU)
        device = torch.device('mps')
        print("🍏 [시스템] 연산 장치: Mac Apple Silicon (MPS) 모드로 실행됩니다.")
    else:
        # GPU를 쓸 수 없는 기타 환경
        device = torch.device('cpu')
        print("🖥️ [시스템] 연산 장치: 사용 가능한 GPU가 없어 CPU 모드로 실행됩니다.")

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

    # STEP 4. FFmpeg로 무음 구간 원본 영상에서 잘라내기 및 장면 분석

    print(f"[4/4] 총 {len(silence_timestamps)}개의 무음 구간을 FFmpeg로 분할 및 분석합니다...")

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
        ]

        # 잘라내기 명령어 실행 (마찬가지로 로그는 화면에 보이지 않게 숨김 처리)
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"\n생성됨: {out_file} (구간: {start:.2f}초 ~ {end:.2f}초, 길이: {duration:.2f}초)")

        # --- 추가된 부분: 장면 전환(컷) 분석 및 프레임/샷 분할 ---
        scene_times = detect_scene_changes(out_file, threshold=SCENE_THRESHOLD)

        if scene_times:
            print(f"   -> {len(scene_times)}번의 장면 전환 발견. 프레임 이미지 추출 및 샷 분할 시작...")

            # 컷 전/후 프레임 이미지 추출 (직전 0.1초, 직후 0.1초 캡처)
            for idx, stime in enumerate(scene_times):
                before_time = max(0.0, stime - 0.1)
                after_time = stime + 0.1

                img_before = os.path.join(OUTPUT_DIR, f"silence_{clip_count:03d}_cut{idx + 1:02d}_before.jpg")
                img_after = os.path.join(OUTPUT_DIR, f"silence_{clip_count:03d}_cut{idx + 1:02d}_after.jpg")

                # 직전 프레임 추출 (-ss 옵션을 -i 앞에 두어 속도 최적화)
                subprocess.run([
                    "ffmpeg", "-y", "-ss", str(before_time), "-i", out_file,
                    "-vframes", "1", "-q:v", "2", img_before
                ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

                # 직후 프레임 추출
                subprocess.run([
                    "ffmpeg", "-y", "-ss", str(after_time), "-i", out_file,
                    "-vframes", "1", "-q:v", "2", img_after
                ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            # 발견된 전환점을 기준으로 무음 영상을 더 잘게(Shot) 쪼개기
            cut_points = [0.0] + scene_times + [duration]

            for i in range(len(cut_points) - 1):
                shot_start = cut_points[i]
                shot_end = cut_points[i + 1]
                shot_duration = shot_end - shot_start

                # 0.5초보다 짧은 샷은 의미가 없으므로 무시
                if shot_duration < 0.5:
                    continue

                shot_out_file = os.path.join(OUTPUT_DIR, f"silence_{clip_count:03d}_shot{i + 1:02d}{file_ext}")

                shot_cmd = [
                    "ffmpeg", "-y", "-i", out_file,
                    "-ss", str(shot_start), "-to", str(shot_end),
                    "-c", "copy", shot_out_file
                ]
                subprocess.run(shot_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            # 샷으로 모두 쪼갰으니 통짜 무음 영상은 삭제하여 용량 확보
            os.remove(out_file)
            print(f"   -> 샷 분할 완료 및 원본 무음 파일 삭제.")
        else:
            print(f"   -> 장면 전환 없음. 통짜 파일 유지.")

    # 영상 자르기가 모두 끝났으므로, 처음에 만들었던 임시 오디오 파일(temp_16k.wav)을 지워서 용량 확보
    if os.path.exists(TEMP_WAV):
        os.remove(TEMP_WAV)

    print("\n모든 작업이 완료되었습니다")

    #  [모니터링 종료 및 결과 출력]
    end_time = time.perf_counter()
    cpu_loads = psutil.cpu_percent(percpu=True)

    print("\n" + "=" * 40)
    print("[시스템 성능 프로파일링 결과]")
    print("=" * 40)
    print(f" 총 실행 시간 : {end_time - start_time:.3f} 초")
    print(f"코어별 평균 CPU 점유율:")
    for i, load in enumerate(cpu_loads):
        print(f"   - Core {i:02d}: {load:5.1f}%")
    print("=" * 40)


# 이 파이썬 파일을 직접 실행했을 때만 main() 함수가 작동하도록 하는 파이썬의 표준적인 관용구
if __name__ == "__main__":
    main()