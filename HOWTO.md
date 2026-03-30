# SmartADV 개발 가이드 및 연동 명세 (HOWTO)

이 문서는 SmartADV 프로젝트의 **프론트엔드(React) - 백엔드(Spring Boot) 간 비동기 워커 Mock 파이프라인 연동**에 대한 세부 명세와 실행, 확장 방법을 안내합니다. 
향후 Python 기반의 AI 모듈(advengine.py, LLM.py, TTS.py 등) 및 실제 AWS S3 연동으로 손쉽게 전환할 수 있도록 구조화되어 있습니다.

## 1. 구현된 아키텍처 개요

현재 프로토타입은 **실제 외부 연산 서버(파이썬)와 AWS S3 버킷이 연결되지 않은 상태**이므로, 이를 백엔드 자체적으로 **가상(Mock) 처리**하여 전체 서비스 흐름이 테스트될 수 있도록 설계되었습니다.

* `frontend/`: React + Vite 기반 단일 페이지 어플리케이션(SPA). 사용자 드래그 앤 드롭 영상 업로드, 실시간 상태 조회 폴링(Polling), 영상 결과물의 스트리밍을 수행합니다.
* `backend/`: Spring Boot 3 + H2 DB 기반 API 서버. 프론트엔드와의 통신(CORS), 가상 S3 파일 저장, 백그라운드 스레드를 통한 Mock 파이프라인 처리를 담당합니다.
* `mock-s3-storage/`: AWS S3 버킷을 대신하여 업로드된 원본 영상과 처리 결과 오디오가제로 저장되는 로컬 폴더(임시 스토리지)입니다.

---

## 2. 세부 파이프라인 명세 (Flow)

전체적인 사용자의 작업 흐름과 시스템 데이터의 이동 흐름은 다음과 같습니다.

### Step 1. 영상 업로드 (프론트 -> 백엔드)
- **[Frontend]** `DragDrop.tsx` 뷰에서 사용자가 파일을 Drop하면 `FormData`로 변환하여 백엔드(`POST /api/videos/upload`)로 전송합니다.
- **[Backend]** 컨트롤러 및 `VideoService`가 파일을 받습니다. 이후 `MockS3StorageService`를 호출하여 물리적인 로컬 폴더 `../mock-s3-storage/` 에 저장하고, `mock-s3://...` 형태의 가짜 URL을 반환받습니다.
- DB의 `Video` 엔티티 테이블에 해당 URL 경로, 파일 이름, 용량이 저장됩니다.

### Step 2. 비동기 작업(Job) 모킹 시작
- 백엔드는 업로드 직후 진행 상태를 관리할 `AnalysisJob` 엔티티를 하나 생성(상태: `PENDING`)하고 `WorkerClientService.executeMockPipeline()`을 **비동기(@Async) 스레드**로 백그라운드 호출합니다.
- HTTP 응답은 즉각 프론트엔드로 리턴되며, 이를 받은 프론트엔드는 다음 대기 화면(`ProgressPage`)으로 이동합니다.

### Step 3. 실시간 연산 진행률 폴링 (Polling)
- **[Backend]** 동작 중인 비동기 워커(`WorkerClientService`)는 `Thread.sleep`을 이용해 인위적 딜레이를 주면서 DB 진행 상태를 단계별로 변경합니다.
  (`PREPROCESSING` -> `SCRIPT_GENERATING` -> `TTS_GENERATING` -> `DONE`)
- **[Frontend]** 사용자가 보고 있는 대기 화면(`ProgressPage.tsx`)은 매 1.5초마다 백엔드의 `GET /api/jobs/{videoId}` 상태 추적 API를 호출(Polling)합니다.
- 이 과정을 통해 사용자에게 로딩 퍼센티지 및 단계별 상태 텍스트 UI가 자연스럽게 변화하며 표시됩니다.

### Step 4. 결과 반환 및 파일 스트리밍
- 워커 스레드는 `DONE` 상태 돌입 전, 가상의 해설 더미 음성 파일(`result_{id}.mp3`)을 `mock-s3-storage`에 만들고 스트립트와 경로를 `Result` DB 테이블에 기록합니다.
- 프론트엔드는 폴링 중 `DONE` 을 감지하면 `GET /api/results/video/{videoId}`를 호출해 결과에 매핑된 최종 음성/영상 URL을 받아오고 시청 화면(`View.tsx`)으로 넘어갑니다.
- **스트리밍:** `View.tsx` 내부 `<audio>` 태그의 `src` 속성은 백엔드의 `GET /api/storage/stream?url=mock-s3://...` API를 바라보며 백엔드 서버를 파이프 삼아 해당 파일을 실시간으로 스트리밍받아 브라우저가 직접 오디오를 재생하게 됩니다.

---

## 3. 실행 방법 (테스트 가이드)

프로젝트 루트 디렉토리(`SDV/SmartADV/`) 기준으로 터미널 2개를 열고, 다음 명령어를 통해 두 애플리케이션을 각각 구동합니다.

### 백엔드 (API 처리) 
```bash
cd backend
./mvnw clean compile spring-boot:run
```
(포트: `8080`)

### 프론트엔드 (React 서버) 구동
```bash
cd frontend
npm install     # 초기 셋업 시 라이브러리 설치
npm start
```
(포트: `5173` 포트로 실행됩니다.)

서버가 켜지면 웹 브라우저(`http://localhost:5173`)에 접속해 영상을 Drag & Drop 하는 순간 테스트 사이클이 자동으로 진행됩니다!

---

## 4. 향후 서비스 (Production) 전환 방법론

이 프로토타입 뼈대는 추후 클라우드 및 연산 리소스를 도입하게 되면 내부 Mock 로직만 치환함으로써 완벽한 시스템으로 손쉽게 업그레이드되도록 분리 구성되었습니다.

1. **실제 AWS S3 스토리지 연동 (`StorageService`)**
   - 백엔드의 `MockS3StorageService.java` 파일을 지우고, 대신 AWS Java SDK (`spring-cloud-starter-aws`) 기반의 `AwsS3StorageService` 클래스를 Interface 규격에 맞춰 제작해 주입(DI)합니다. 
   - 가상 URL(`mock-s3://...`) 대신, AWS S3 버킷 액세스 가능한 Pre-signed URL을 프론트엔드에 리턴하게 설계하면 백엔드의 트래픽(스트리밍 등 부담)을 프론트-S3 간 직접 통신으로 분산시킬 수 있게 됩니다.

2. **실제 파이썬 워커 (advengine, LLM 엔진) 연결 (`WorkerClientService`)**
   - 현재 더미 타이머(Thread.sleep) 역할을 지우고, HTTP 클라이언트 모듈(`RestTemplate` 등)을 이용해 외부의 GCP 등에 떠 있는 실제 파이썬(FastAPI 등) API에 `/process-video` 요청을 쏴서 진짜로 엔진 분석을 수행하도록 작성합니다.
   - 트래픽이 많을 것을 대비해 **Kafka 혹은 RabbitMQ 기반의 큐 시스템 모델**로 쉽게 치환할 수도 있습니다.

3. **데이터베이스 구성 (Local H2 → RDBMS)**
   - `application.yml`의 JDBC Connection Url만 실서버의 MySQL / PostgreSQL 구조로 바꿉니다. JPA로 Entity/Repository가 이미 잡혀 있으므로 테이블 설계는 고스란히 반영됩니다.
