# SMARTAD EC2 Deployment Notes

SMARTAD currently runs as three parts on one EC2 instance:

1. Spring Boot backend on `:8080`
2. React static frontend served by Nginx
3. Python engine scripts launched by the backend

The important deployment rule is: do not hard-code local paths in code. Set paths and API keys through environment variables.

## 1. EC2 Packages

Install the system tools first.

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk nodejs npm python3 python3-venv python3-pip ffmpeg git nginx build-essential cmake
```

Install Poetry.

```bash
curl -sSL https://install.python-poetry.org | python3 -
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## 2. Whisper.cpp

Install Whisper.cpp somewhere stable, for example `/opt/whisper.cpp`.

```bash
cd /opt
sudo git clone https://github.com/ggml-org/whisper.cpp.git
sudo chown -R $USER:$USER /opt/whisper.cpp
cd /opt/whisper.cpp
cmake -B build
cmake --build build --config Release
./models/download-ggml-model.sh small
```

Then set:

```bash
export WHISPER_CPP_BIN=/opt/whisper.cpp/build/bin/whisper-cli
export WHISPER_MODEL=/opt/whisper.cpp/models/ggml-small.bin
```

If STT is not ready yet, keep the rest of the pipeline testable with:

```bash
export SMARTADV_ENABLE_STT=0
```

## 3. Application Environment

Create an environment file such as `/opt/smartadv/smartadv.env`.

```bash
GEMINI_API_KEY=replace-with-your-key
GEMINI_MODEL=gemini-3-flash-preview
SMARTADV_STORAGE_DIR=/opt/smartadv/storage
SMARTADV_ENGINE_ROOT_DIR=/opt/smartadv/app
SMARTADV_ENGINE_COMMAND=poetry run python
SMARTADV_CORS_ALLOWED_ORIGINS=http://your-domain-or-ec2-public-dns
WHISPER_CPP_BIN=/opt/whisper.cpp/build/bin/whisper-cli
WHISPER_MODEL=/opt/whisper.cpp/models/ggml-small.bin
SMARTADV_ENABLE_STT=1
```

Create the storage directory:

```bash
sudo mkdir -p /opt/smartadv/storage
sudo chown -R $USER:$USER /opt/smartadv
```

## 4. Python Engine

From the project root:

```bash
cd /opt/smartadv/app
poetry install
```

The backend launches:

```bash
poetry run python engine_backup.py
poetry run python LLM.py
poetry run python TTS.py
```

Those scripts receive `SMARTADV_INPUT` and `SMARTADV_OUTPUT` from the backend for each uploaded video.

## 5. Backend

Build the backend:

```bash
cd /opt/smartadv/app/backend
./mvnw clean package -DskipTests
```

Example systemd service:

```ini
[Unit]
Description=SMARTAD Backend
After=network.target

[Service]
WorkingDirectory=/opt/smartadv/app/backend
EnvironmentFile=/opt/smartadv/smartadv.env
ExecStart=/usr/bin/java -jar /opt/smartadv/app/backend/target/backend-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Save it as `/etc/systemd/system/smartadv-backend.service`, then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable smartadv-backend
sudo systemctl start smartadv-backend
sudo journalctl -u smartadv-backend -f
```

## 6. Frontend

Build the frontend:

```bash
cd /opt/smartadv/app/frontend
npm ci
npm run build
```

Serve `frontend/build` with Nginx.

```nginx
server {
    listen 80;
    server_name _;

    client_max_body_size 500M;

    root /opt/smartadv/app/frontend/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 7. AWS Checklist

- EC2 security group allows inbound `80` from users.
- Keep backend `8080` private if Nginx proxies `/api`.
- EC2 disk is large enough for uploaded videos and generated outputs.
- `GEMINI_API_KEY` is set in the service environment, not committed.
- `ffmpeg`, `ffprobe`, `poetry`, `java`, and `whisper-cli` are visible to the backend service user.
- For first deployment, test with a short video before large files.

