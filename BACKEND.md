# SmartADV Backend API 명세서

> Spring Boot 기반 백엔드 서버의 REST API 엔드포인트 정의 문서입니다.
> 
> **Base URL**: `http://localhost:8080`

---

## 아키텍처 개요

프론트엔드(React)와 백엔드(Spring Boot) 사이의 통신은 **전통적인 REST API (POST/GET)** 를 사용합니다.

```
┌──────────────┐    REST API     ┌──────────────────┐   ProcessBuilder   ┌────────────────────┐
│  Frontend    │ ──────────────> │  Spring Boot     │ ────────────────> │  Python Scripts    │
│  (React)     │ <────────────── │  Backend         │ <──────────────── │  (engine, LLM,     │
│  :5173       │    JSON/Stream  │  :8080           │    stdout/exit    │   TTS)             │
└──────────────┘                 └──────────────────┘                   └────────────────────┘
                                        │
                                        ▼
                                 ┌──────────────┐
                                 │  H2 DB       │
                                 │  (In-Memory) │
                                 └──────────────┘
```

---

## 엔드포인트 목록

### 1. 영상 업로드

| 항목 | 내용 |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/videos/upload` |
| **Controller** | `VideoController` |
| **Content-Type** | `multipart/form-data` |

**Request**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `file` | `MultipartFile` | ✅ | 업로드할 동영상 파일 (.mp4 등) |

**Response** (`200 OK`)
```json
{
  "id": 1,
  "originalFileName": "input.mp4",
  "s3Url": "mock-s3:///Users/.../mock-s3-storage/uuid.mp4",
  "fileSize": 27208852,
  "createdAt": "2026-03-30T23:03:00"
}
```

**동작 설명**
1. 파일을 Mock S3 스토리지(`mock-s3-storage/`)에 UUID 기반 이름으로 저장
2. DB에 `Video` 레코드 생성
3. `AnalysisJob` 레코드 생성 (초기 상태: `PENDING`)
4. **비동기(`@Async`)로 Python 분석 파이프라인 자동 트리거**
   - `engine_backup.py` → `LLM.py` → `TTS.py` 순차 실행

---

### 2. 작업 상태 조회 (폴링)

| 항목 | 내용 |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/jobs/{videoId}` |
| **Controller** | `JobController` |

**Path Parameter**
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `videoId` | `Long` | 업로드 시 반환된 Video ID |

**Response** (`200 OK`)
```json
{
  "id": 1,
  "videoId": 1,
  "status": "SCRIPT_GENERATING",
  "progress": 45,
  "statusDetail": "이미지 업로드 중 (40/114): silence_001_cut20_after.jpg",
  "errorMessage": null,
  "startedAt": "2026-03-30T23:03:00",
  "finishedAt": null
}
```

**status 필드 값 정의**
| 값 | 의미 | progress 범위 |
|---|---|---|
| `PENDING` | 작업 대기 중 | 0% |
| `PREPROCESSING` | engine_backup.py 실행 중 (VAD, 무대사 구간 감지, STT) | 1% ~ 33% |
| `SCRIPT_GENERATING` | LLM.py 실행 중 (이미지 업로드, Gemini AI 호출) | 34% ~ 66% |
| `TTS_GENERATING` | TTS.py 실행 중 (음성 합성, 영상 믹싱) | 67% ~ 99% |
| `DONE` | 모든 처리 완료 | 100% |
| `FAILED` | 오류 발생 | 0% |

> 프론트엔드에서 1.5초 간격으로 이 API를 폴링하여 로딩 진행률을 갱신합니다.

---

### 3. 분석 결과 조회

| 항목 | 내용 |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/results/video/{videoId}` |
| **Controller** | `JobController` |

**Path Parameter**
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `videoId` | `Long` | Video ID |

**Response** (`200 OK`) — 작업이 `DONE`인 경우에만 결과 존재
```json
{
  "id": 1,
  "jobId": 1,
  "scriptText": "자동 추출된 화면 해설 스크립트 기반 생성 결과물입니다.",
  "narrationAudioPath": "mock-s3:///Users/.../output_clips/input_with_ad_audio.m4a",
  "mergedVideoPath": "mock-s3:///Users/.../output_clips/input_with_ad.mp4",
  "createdAt": "2026-03-30T23:43:47"
}
```

**Response** (`404 Not Found`) — 아직 처리 중이거나 실패한 경우

---

### 4. 미디어 스트리밍

| 항목 | 내용 |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/storage/stream` |
| **Controller** | `JobController` |

**Query Parameter**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `url` | `String` | ✅ | Mock S3 URL (예: `mock-s3:///Users/.../input_with_ad.mp4`) |

**Response** (`200 OK`)
- `Content-Type`: 파일 확장자에 따라 자동 결정
  - `.mp4`, `.mov` → `video/mp4`
  - `.mp3` → `audio/mpeg`
  - 그 외 → `application/octet-stream`
- **Body**: 바이너리 파일 스트림

**사용 예시**
```
GET /api/storage/stream?url=mock-s3%3A%2F%2F%2FUsers%2F...%2Finput_with_ad.mp4
```

> 프론트엔드의 `<video>` 태그가 이 URL을 `src`로 사용하여 결과 영상을 바로 재생합니다.

---

## 프론트엔드 호출 흐름

```
사용자가 영상 Drag & Drop
       │
       ▼
POST /api/videos/upload  ──────>  Video 저장 + Job 생성 + 파이프라인 시작
       │
       │  응답: { id: 1 }
       ▼
GET /api/jobs/1  (1.5초 폴링)  ──>  { status: "PREPROCESSING", progress: 20 }
GET /api/jobs/1  (1.5초 폴링)  ──>  { status: "SCRIPT_GENERATING", progress: 45 }
GET /api/jobs/1  (1.5초 폴링)  ──>  { status: "TTS_GENERATING", progress: 85 }
GET /api/jobs/1  (1.5초 폴링)  ──>  { status: "DONE", progress: 100 }
       │
       ▼
GET /api/results/video/1  ────>  { mergedVideoPath: "mock-s3://...", ... }
       │
       ▼
GET /api/storage/stream?url=...  ──>  최종 영상 바이너리 스트리밍
       │
       ▼
<video src="..."> 로 결과 영상 재생
```

---

## 향후 변경 예정 사항

| 현재 (Mock) | 향후 (Production) |
|---|---|
| Mock S3 (로컬 폴더 `mock-s3-storage/`) | AWS S3 실제 버킷 |
| H2 In-Memory DB | PostgreSQL / MySQL |
| `ProcessBuilder`로 Python 직접 호출 | GCP Cloud Run / AWS Lambda API 호출 |
| `/api/storage/stream`으로 로컬 파일 스트리밍 | S3 Pre-signed URL 또는 CloudFront CDN |
