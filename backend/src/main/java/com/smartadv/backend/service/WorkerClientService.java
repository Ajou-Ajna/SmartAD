package com.smartadv.backend.service;

import com.smartadv.backend.domain.AnalysisJob;
import com.smartadv.backend.domain.Result;
import com.smartadv.backend.domain.Video;
import com.smartadv.backend.repository.AnalysisJobRepository;
import com.smartadv.backend.repository.ResultRepository;
import com.smartadv.backend.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkerClientService {

    private final AnalysisJobRepository analysisJobRepository;
    private final ResultRepository resultRepository;
    private final VideoRepository videoRepository;

    @Value("${smartadv.storage.mock-s3-dir}")
    private String mockStorageLocation;

    @Value("${smartadv.engine.root-dir:..}")
    private String engineRootDir;

    @Value("${smartadv.engine.command:poetry run python}")
    private String engineCommand;

    private final StorageService storageService;

    // Pattern to match PROGRESS:XX:message from Python stdout
    private static final Pattern PROGRESS_PATTERN = Pattern.compile("^PROGRESS:(\\d+):(.+)$");

    @Async
    public void executeMockPipeline(Long videoId, AnalysisJob job) {
        try {
            log.info("Starting Actual Script Pipeline for video {}", videoId);

            // 0. Get original video
            Video video = videoRepository.findById(videoId)
                    .orElseThrow(() -> new RuntimeException("Video not found: " + videoId));

            // 1. Create Workspace
            Path workspace = Paths.get(mockStorageLocation).toAbsolutePath().normalize().resolve("job_" + job.getId());
            Files.createDirectories(workspace);

            Path inputVideoPath = workspace.resolve("input.mp4");
            
            // DOWNLOAD FROM S3
            if (video.getS3Url().startsWith("mock-s3://")) {
                String localOriginalPath = video.getS3Url().replace("mock-s3://", "");
                Files.copy(Paths.get(localOriginalPath), inputVideoPath, StandardCopyOption.REPLACE_EXISTING);
            } else {
                log.info("Downloading video from S3: {}", video.getS3Url());
                storageService.downloadFile(video.getS3Url(), inputVideoPath);
            }

            String smartadvInput = inputVideoPath.toString();
            String smartadvOutput = workspace.resolve("output_clips").toString();

            // 2. PREPROCESSING (0% ~ 33%)
            updateJobStatus(job.getId(), "PREPROCESSING", 1);
            updateJobDetail(job.getId(), "전처리 엔진 시작 중...", 1);
            int exitCode = runPythonProcess("engine_backup.py", smartadvInput, smartadvOutput, job.getId());
            if (exitCode != 0) throw new RuntimeException("engine_backup.py failed with exit code " + exitCode);

            // 3. SCRIPT_GENERATING (34% ~ 66%)
            updateJobStatus(job.getId(), "SCRIPT_GENERATING", 34);
            updateJobDetail(job.getId(), "해설 대본 생성 엔진 시작 중...", 34);
            exitCode = runPythonProcess("LLM.py", smartadvInput, smartadvOutput, job.getId());
            if (exitCode != 0) throw new RuntimeException("LLM.py failed with exit code " + exitCode);

            // 4. TTS_GENERATING (67% ~ 99%)
            updateJobStatus(job.getId(), "TTS_GENERATING", 67);
            updateJobDetail(job.getId(), "음성 합성 엔진 시작 중...", 67);
            exitCode = runPythonProcess("TTS.py", smartadvInput, smartadvOutput, job.getId());
            if (exitCode != 0) throw new RuntimeException("TTS.py failed with exit code " + exitCode);

            // 5. DONE -> Generate Result object
            Path finalVideo = workspace.resolve("output_clips").resolve("input_with_ad.mp4");
            Path finalAudio = workspace.resolve("output_clips").resolve("input_with_ad_audio.m4a");

            log.info("Uploading processed files to S3...");
            String finalVideoS3Url = storageService.uploadFile(finalVideo);
            String finalAudioS3Url = storageService.uploadFile(finalAudio);

            Result result = Result.builder()
                .jobId(job.getId())
                .scriptText("자동 추출된 화면 해설 스크립트 기반 생성 결과물입니다.")
                .narrationAudioPath(finalAudioS3Url)
                .mergedVideoPath(finalVideoS3Url)
                .build();
            resultRepository.save(result);

            updateJobDetail(job.getId(), "모든 처리 완료! 임시 파일 정리 중...", 99);
            
            // CLEAN UP WORKSPACE
            deleteDirectoryRecursively(workspace);

            updateJobDetail(job.getId(), "모든 처리 완료!", 100);
            updateJobStatus(job.getId(), "DONE", 100);
            log.info("Finished Pipeline for video {}", videoId);

        } catch (InterruptedException e) {
            log.error("Pipeline interrupted", e);
            updateJobStatus(job.getId(), "FAILED", 0);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Pipeline failed", e);
            updateJobDetail(job.getId(), "오류 발생: " + e.getMessage(), 0);
            updateJobStatus(job.getId(), "FAILED", 0);
        }
    }

    private void updateJobStatus(Long jobId, String status, int progress) {
        analysisJobRepository.findById(jobId).ifPresent(j -> {
            j.updateStatus(status, progress);
            analysisJobRepository.save(j);
        });
    }

    private void deleteDirectoryRecursively(Path path) {
        try {
            if (Files.exists(path)) {
                Files.walk(path)
                     .sorted(java.util.Comparator.reverseOrder())
                     .map(Path::toFile)
                     .forEach(java.io.File::delete);
            }
        } catch (java.io.IOException e) {
            log.warn("Failed to delete workspace: " + path, e);
        }
    }

    private void updateJobDetail(Long jobId, String detail, int progress) {
        analysisJobRepository.findById(jobId).ifPresent(j -> {
            j.updateStatusDetail(detail, progress);
            analysisJobRepository.save(j);
        });
    }

    private int runPythonProcess(String scriptName, String smartadvInput, String smartadvOutput, Long jobId) throws Exception {
        // SmartADV Python engine root directory (configurable via smartadv.engine.root-dir)
        Path projectRoot = Paths.get(engineRootDir).toAbsolutePath().normalize();
        List<String> command = new ArrayList<>(parseEngineCommand(engineCommand));
        command.add(scriptName);
        log.info("Executing {} (cwd={})", String.join(" ", command), projectRoot);

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(projectRoot.toFile());

        // Pass dynamic IO environment variables
        pb.environment().put("SMARTADV_INPUT", smartadvInput);
        pb.environment().put("SMARTADV_OUTPUT", smartadvOutput);
        pb.environment().put("PYTHONUNBUFFERED", "1");

        pb.redirectErrorStream(true);
        Process process = pb.start();

        StringBuilder lastLines = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                log.info("[{}] {}", scriptName, line);
                // 마지막 20줄 보관 (에러 발생 시 디버깅용)
                lastLines.append(line).append("\n");
                String[] stored = lastLines.toString().split("\n");
                if (stored.length > 20) {
                    lastLines = new StringBuilder();
                    for (int i = stored.length - 20; i < stored.length; i++) {
                        lastLines.append(stored[i]).append("\n");
                    }
                }

                // Parse PROGRESS:XX:message lines from Python
                Matcher m = PROGRESS_PATTERN.matcher(line);
                if (m.matches()) {
                    int pct = Integer.parseInt(m.group(1));
                    String detail = m.group(2);
                    updateJobDetail(jobId, detail, pct);
                }
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            log.error("[{}] 비정상 종료 (exit code {}). 마지막 출력:\n{}", scriptName, exitCode, lastLines);
        }
        return exitCode;
    }

    private List<String> parseEngineCommand(String command) {
        return Arrays.stream(command.trim().split("\\s+"))
                .filter(part -> !part.isBlank())
                .toList();
    }
}
