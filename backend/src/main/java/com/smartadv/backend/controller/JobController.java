package com.smartadv.backend.controller;

import com.smartadv.backend.repository.AnalysisJobRepository;
import com.smartadv.backend.repository.ResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class JobController {

    private final AnalysisJobRepository analysisJobRepository;
    private final ResultRepository resultRepository;

    @GetMapping("/jobs/{videoId}")
    public ResponseEntity<?> getJobStatus(@PathVariable Long videoId) {
        return analysisJobRepository.findByVideoId(videoId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/results/video/{videoId}")
    public ResponseEntity<?> getResultByVideoId(@PathVariable Long videoId) {
        return analysisJobRepository.findByVideoId(videoId)
                .flatMap(job -> resultRepository.findByJobId(job.getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/storage/stream")
    public ResponseEntity<Resource> streamMedia(@RequestParam("url") String mockS3Url) {
        if (mockS3Url == null || !mockS3Url.startsWith("mock-s3://")) {
            return ResponseEntity.badRequest().build();
        }
        
        String localPathStr = mockS3Url.replace("mock-s3://", "");
        Path path = Paths.get(localPathStr);
        Resource resource = new FileSystemResource(path);
        
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "application/octet-stream";
        if (localPathStr.endsWith(".mp4") || localPathStr.endsWith(".mov")) {
            contentType = "video/mp4";
        } else if (localPathStr.endsWith(".mp3")) {
            contentType = "audio/mpeg";
        } else if (localPathStr.endsWith(".m4a")) {
            contentType = "audio/mp4";
        } else if (localPathStr.endsWith(".wav")) {
            contentType = "audio/wav";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, contentType);
        
        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }
}
