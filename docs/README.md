# SmartAD

> **SmartAD : Automatic Audio Description Generation by Vision**
>
> 영상만 올리면 AI가 무음 구간을 찾아내고, 키프레임을 보고 해설 대본을 쓴 뒤,
> 한국어 음성으로 합성해 원본 영상에 자연스럽게 입혀 주는 **시각장애인용 자동 화면해설(Audio Description) 생성 솔루션**입니다.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white">
  <img alt="Spring Boot" src="https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?logo=springboot&logoColor=white">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white">
  <img alt="Gemini" src="https://img.shields.io/badge/Google-Gemini-4285F4?logo=googlegemini&logoColor=white">
  <img alt="Modal" src="https://img.shields.io/badge/Modal-GPU%20Worker-7C3AED">
  <img alt="AWS" src="https://img.shields.io/badge/AWS-EC2%20%2B%20S3-FF9900?logo=amazonaws&logoColor=white">
</p>

> 🌐 **배포 주소: [https://smartad.site](https://smartad.site)**

---

## 팀 소개 — Team Ajna

> **Ajna(아즈나)** — "보이지 않는 것을 보게 하는 제3의 눈"이라는 의미를 담아, 시각 정보를 소리로 전달하는 본 프로젝트의 지향점을 표현했습니다.
> **구성** - 이유준, 박지훈

---

## 1. 프로젝트 개요

기존 화면해설 방송(AD)은 전문 작가가 대본을 집필하고 성우가 녹음하는 **전적인 수작업** 방식이라
제작 비용과 시간 부담이 커, 극히 일부 콘텐츠에만 제공되고 있습니다.

**SmartAD**는 이 과정을 다음의 AI 파이프라인으로 자동화하여, 누구나 영상을 업로드(또는 유튜브 URL 입력)하는 것만으로
화면해설 음성이 입혀진 영상을 얻을 수 있도록 합니다.

```
무음 구간 탐지(VAD)  →  전후 대사 인식(STT)  →  키프레임 기반 해설 대본 생성(Vision-LLM)  →  음성 합성(TTS)  →  원본 영상 믹싱
```

사용자는 Google 계정으로 로그인한 뒤, 영상을 드래그 & 드롭하거나 유튜브 URL을 입력하고,
실시간으로 진행 상황을 확인한 후, 해설 음성이 입혀진 결과 영상을 브라우저에서 바로 시청·다운로드할 수 있습니다.
생성한 결과물은 개인 보관함(Archive)에 자동 저장되며, 좋아요 표시로 즐겨찾기할 수 있습니다.

---

## 2. 주요 기능

- **두 가지 입력 방식** — 로컬 영상 파일 드래그 & 드롭 업로드 / 유튜브 URL 입력(`yt-dlp`로 서버에서 직접 다운로드)
- **자동 무음 구간 탐지** — Silero VAD로 대사가 없는 "해설을 넣을 수 있는" 구간을 자동 검출
- **장면 전환 분석** — FFmpeg scene detection으로 무음 구간 내 장면(컷)을 추출하여 키프레임 확보
- **GPU 기반 음성 인식** — Modal T4 GPU 워커에서 Whisper로 전후 대사를 병렬 전사(STT)
- **문맥 기반 해설 생성** — Gemini 멀티모달 모델이 키프레임 + 전후 대사를 보고 해설 대본 작성
- **시간 정렬 음성 합성** — Edge TTS로 합성 후, 해설이 해당 장면 길이에 맞게 배속·정렬
- **지능형 오디오 믹싱** — 사이드체인 컴프레서로 해설 발화 시 원본 음량을 자동으로 낮춤(ducking)
- **Google 소셜 로그인** — Google OAuth 기반 로그인, 7일 유효 세션 토큰 발급
- **개인 보관함 & 좋아요** — 생성 결과를 사용자별로 보관하고 좋아요로 즐겨찾기
- **실시간 진행률 & 서버 혼잡도** — 단계별 진행률, 대기열 순번, 예상 대기 시간, 서버 CPU/메모리·S3 잔여 용량을 폴링으로 시각화
- **작업 취소** — 처리 중 페이지 이탈 시 실행 중인 워커 프로세스를 강제 종료하고 작업 디렉터리 정리
- **사용량 제한** — 일반 사용자(USER)는 생성 성공 후 3시간에 1회로 제한(관리자 ADMIN은 무제한)

---

## 3. 기술 스택

### Frontend
- React 19 + TypeScript 5.8
- Vite 6 (Dev 서버 / 빌드)
- MUI 7, Emotion, Tailwind CSS 4
- React Router 7 (`ProtectedRoute` 기반 인증 가드), Context API

### Backend
- Java 17, Spring Boot 4.0 (WebMVC, Data JPA, Validation)
- H2 In-Memory Database (기본) / MySQL 전환 가능 (Connector 포함)
- AWS SDK for Java v2 (S3) — 결과물 저장 및 스트리밍
- Google OAuth `tokeninfo` 검증 + 세션 토큰 기반 인증(`AuthInterceptor`, `UserContext`)
- `@Async` 비동기 워커(`pipelineExecutor`) + `ProcessBuilder`로 Python 엔진 호출
- Lombok, Maven

### AI / Media Engine (Python)
- Poetry (Python 3.11 ~ 3.14)
- PyTorch 2.8 (CPU 빌드) — Silero VAD 로컬 실행
- Silero VAD — 음성/무음 구간 탐지 (서버 CPU)
- Modal + OpenAI Whisper(`small`) — T4 GPU 워커에서 한국어 STT 병렬 처리
- Google Gemini (`gemini-3-flash-preview`) — 멀티모달 해설 대본 생성
- Microsoft Edge TTS (`ko-KR-SunHiNeural`) — 음성 합성
- FFmpeg / FFprobe — 장면 전환 분석, 오디오 추출, ducking 믹싱
- yt-dlp — 유튜브 영상 다운로드

### Infra / Storage
- AWS EC2 (Nginx 정적 호스팅 + `/api` 리버스 프록시, systemd 서비스)
- AWS S3 (결과물 저장, 프리티어 보호용 5GB 용량 가드 내장)
- Modal (서버리스 GPU 워커)
- 배포 도메인: **smartad.site**

---

## 4. 시스템 아키텍처

```
┌──────────────┐  REST/JSON    ┌───────────────┐  ProcessBuilder   ┌────────────────────┐
│  Frontend    │ ────────────> │  Spring Boot  │ ────────────────> │  Python 3-stage    │
│  React/Vite  │ <──────────── │  Backend      │ <──── stdout ──── │  Pipeline          │
│ (smartad.site)│   (Polling)  │  + H2/MySQL   │  PROGRESS:NN:msg  │  engine→LLM→TTS    │
└──────────────┘               │   :8080       │                   └─────────┬──────────┘
                                       │                                     │ .map()
                                       ▼                                     ▼
                               ┌──────────────┐                   ┌────────────────────┐
                               │   AWS  S3    │                   │  Modal T4 GPU      │
                               │ (결과물 저장)│                   │  Whisper STT 워커  │
                               └──────────────┘                   └────────────────────┘
```

- **백엔드는 얇은 오케스트레이터** 역할을 하며, 실제 영상 연산은 Python 서브프로세스가 담당합니다.
- Python 스크립트는 stdout에 `PROGRESS:<percent>:<message>` 라인을 출력하고,
  백엔드가 이를 파싱해 작업 진행률을 DB에 갱신합니다.
- 무거운 STT 연산은 Modal의 서버리스 T4 GPU 워커로 오프로딩하여 EC2 CPU 부하를 줄입니다.
- 최종 결과물은 AWS S3에 업로드되고, 작업 디렉터리는 처리 완료/취소 시 자동 정리됩니다.
- 프론트엔드는 1.5초 간격으로 작업 상태를 폴링하여 진행 화면을 갱신합니다.

---

## 5. 처리 파이프라인 (End-to-End)

| 단계 | 모듈 | 설명 | 진행률 |
|---|---|---|---|
| **0. 입력** | `DragDrop.tsx` / `Main.tsx` | 영상 드래그&드롭(`POST /api/videos/upload`) 또는 유튜브 URL 입력(`POST /api/videos/youtube`) | — |
| **1. 전처리/분석** | `engine.py` | 16kHz 오디오 추출 → Silero VAD로 무음 구간 검출 → FFmpeg 장면 전환 분석 → 키프레임 추출 → Modal GPU Whisper STT | 1 ~ 33% |
| **2. 대본 생성** | `LLM.py` | 키프레임 + 전후 대사를 Gemini에 멀티모달 전송 → 화면해설 대본 CSV 생성 | 34 ~ 66% |
| **3. 음성 합성/믹싱** | `TTS.py` | Edge TTS 합성 → 장면 길이에 맞게 배속·정렬 → 원본 영상과 ducking 믹싱 | 67 ~ 99% |
| **4. 결과 제공** | `View.tsx` / `Download.tsx` | S3에 업로드된 결과 영상 스트리밍 재생 및 다운로드 | 100% |

---

## 6. REST API

### 인증 (`/api/auth`)
| Method | URL | 설명 |
|---|---|---|
| `POST` | `/api/auth/google` | Google credential 검증 후 세션 토큰(7일) 발급 |
| `GET` | `/api/auth/me` | 현재 로그인 사용자 정보 조회 |
| `POST` | `/api/auth/logout` | 세션 토큰 폐기 |

### 영상 처리 (`/api/videos`, `/api/jobs`, `/api/results`, `/api/storage`)
| Method | URL | 설명 |
|---|---|---|
| `POST` | `/api/videos/upload` | 영상 파일 업로드, 작업 생성, 비동기 파이프라인 시작 |
| `POST` | `/api/videos/youtube` | 유튜브 URL로 영상 등록(서버에서 `yt-dlp` 다운로드) |
| `GET` | `/api/jobs/{videoId}` | 작업 상태·진행률·대기열·서버 메트릭 조회 (폴링) |
| `GET` | `/api/jobs/congestion` | 신규 작업 기준 서버 혼잡도/잔여 용량 조회 |
| `POST`/`DELETE` | `/api/jobs/{videoId}/cancel` | 진행 중인 작업 취소 |
| `GET` | `/api/results/video/{videoId}` | 완료된 결과(스크립트·미디어 URL) 조회 |
| `GET` | `/api/storage/stream?url=...` | 결과 미디어 파일 스트리밍 (S3 캐싱) |

### 보관함 (`/api/archive`)
| Method | URL | 설명 |
|---|---|---|
| `GET` | `/api/archive` | 로그인 사용자의 생성 결과 목록 조회 |
| `POST` | `/api/archive/{id}/like` | 결과 좋아요 토글 |

작업 상태 흐름:
`PENDING → PREPROCESSING → SCRIPT_GENERATING → TTS_GENERATING → DONE`
(오류 시 `FAILED`, 사용자 취소 시 `CANCELLED`)

> 자세한 API 명세는 [BACKEND.md](./BACKEND.md), 연동/실행 가이드는 [HOWTO.md](./HOWTO.md),
> 배포 가이드는 [DEPLOY_EC2.md](./DEPLOY_EC2.md)를 참고하세요.

---

## 7. 디렉터리 구조

```
SmartAD/
├── engine.py             # 1단계: VAD + 무음/장면 분석 + Modal GPU STT
├── LLM.py                # 2단계: Gemini 멀티모달 해설 대본 생성
├── TTS.py                # 3단계: Edge TTS 합성 + FFmpeg ducking 믹싱
├── modal_workers.py      # Modal T4 GPU Whisper STT 워커 (modal deploy)
├── pyproject.toml        # Poetry 의존성
├── backend/              # Spring Boot 백엔드
│   └── src/main/java/com/smartadv/backend/
│       ├── controller/   # Video / Job / Auth / Archive Controller
│       ├── service/      # VideoService, WorkerClientService,
│       │                 #   S3StorageService / MockS3StorageService(StorageService)
│       ├── domain/       # User, SessionToken, Video, AnalysisJob, Result (JPA Entity)
│       ├── repository/   # JPA Repository
│       ├── common/security/  # AuthInterceptor, UserContext
│       └── config/       # AsyncConfig, WebConfig(CORS), S3Config
├── frontend/             # React + Vite 프론트엔드
│   └── src/
│       ├── pages/        # DragDrop / Main(URL) / ProgressPage / View /
│       │                 #   Download / Login / Registeration / Archive / Likes
│       ├── components/   # NavigationRail, DropZone, YoutubePlayer, Progress ...
│       └── context/      # AppContext (인증 토큰 등)
├── mock-s3-storage/      # 작업 워크스페이스 + S3 캐시 (runtime)
├── BACKEND.md            # REST API 명세
├── HOWTO.md              # 실행/연동 가이드
└── DEPLOY_EC2.md         # EC2 배포 가이드
```

---

## 8. 결과 산출물

처리가 완료되면 작업 워크스페이스(`mock-s3-storage/job_{id}/output_clips/`)에 산출물이 생성되고,
최종 결과 영상·오디오는 AWS S3에 업로드됩니다. (워크스페이스는 완료 후 자동 정리)

| 파일 | 설명 |
|---|---|
| **`input_with_ad.mp4`** | **최종 결과 영상 (원본 + 해설 음성 믹스)** → S3 업로드 |
| `input_with_ad_audio.m4a` | 최종 해설 믹스 오디오 → S3 업로드 |
| `gemini_ad_script.csv` / `gemini_ad_raw.txt` | 생성된 화면해설 대본 |
| `silence_summary.txt` / `stt_summary.txt` | 무음 구간 / 전후 대사 분석 결과 |
| `silence{NNN}_scene{NNN}_cut{NN}.jpg` | 장면 키프레임 이미지 |
| `tts_timeline.csv` | TTS 세그먼트 배치/배속 타임라인 |

---

## 9. 실행 방법 (로컬 개발)

### 사전 요구사항
- Java 17, Node.js, Python 3.11+, Poetry
- FFmpeg / FFprobe (PATH에 등록), yt-dlp (유튜브 입력 사용 시)
- Modal 계정 및 토큰 (GPU STT 워커용)
- `.env` 설정 — 주요 항목:
  - `GEMINI_API_KEY`, `GEMINI_MODEL`
  - `MODAL_TOKEN_ID`, `MODAL_TOKEN_SECRET`
  - `EDGE_TTS_VOICE`, ducking 관련 파라미터 등
  - (운영 시) `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`
  - `SMARTADV_ADMIN_EMAILS` (관리자 이메일, 쉼표 구분)
  - 전체 항목은 [.env.example](./.env.example) 참고

### 1) Modal GPU 워커 배포
```bash
poetry install
modal deploy modal_workers.py
```

### 2) 백엔드 실행 (포트 8080)
```bash
cd backend
./mvnw clean compile spring-boot:run
```

### 3) 프론트엔드 실행 (포트 5173)
```bash
cd frontend
npm install
npm start
```

브라우저에서 **http://localhost:5173** 접속 → Google 로그인 후
영상을 드래그 & 드롭하거나 유튜브 URL을 입력하면 처리가 자동으로 시작됩니다.

> AWS S3 환경 변수(`smartadv.aws.s3.bucket`)를 설정하지 않으면
> 로컬 폴더 기반 `MockS3StorageService`로 자동 대체되어 S3 없이도 동작합니다.

---

## 10. 배포 (Production)

현재 **[smartad.site](https://smartad.site)** 에 배포되어 있으며, 구성은 다음과 같습니다.

| 구성 | 내용 |
|---|---|
| 호스팅 | AWS EC2 (Ubuntu) |
| 웹 서버 | Nginx — 프론트 정적 빌드 제공 + `/api` 리버스 프록시(`:8080`) |
| 백엔드 | systemd 서비스로 Spring Boot JAR 상시 구동 |
| GPU 연산 | Modal 서버리스 T4 GPU 워커(Whisper STT) |
| 결과 저장 | AWS S3 (프리티어 보호용 5GB 용량 가드) |
| DB | H2 In-Memory (운영 시 MySQL 전환 가능) |

자세한 단계는 [DEPLOY_EC2.md](./DEPLOY_EC2.md)를 참고하세요.

---

## 11. 라이선스 / 문의

본 프로젝트는 아주대학교 2026-1 자기주도 프로젝트의 일환으로 **Team Ajna (이유준, 박지훈)**가 제작했습니다.
</content>
</invoke>
