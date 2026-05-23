package com.smartadv.backend.controller;

import com.smartadv.backend.repository.AnalysisJobRepository;
import com.smartadv.backend.repository.ResultRepository;
import com.smartadv.backend.service.StorageService;
import com.smartadv.backend.service.WorkerClientService;
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
    private final WorkerClientService workerClientService;
    private final StorageService storageService;

    @GetMapping("/jobs/{videoId}")
    public ResponseEntity<?> getJobStatus(@PathVariable Long videoId) {
        return analysisJobRepository.findByVideoId(videoId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @RequestMapping(value = "/jobs/{videoId}/cancel", method = {RequestMethod.DELETE, RequestMethod.POST})
    public ResponseEntity<?> cancelJob(@PathVariable Long videoId) {
        boolean cancelled = workerClientService.cancelJob(videoId);
        if (cancelled) {
            return ResponseEntity.ok().body("{\"message\":\"작업이 취소되었습니다.\"}");
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/results/video/{videoId}")
    public ResponseEntity<?> getResultByVideoId(@PathVariable Long videoId) {
        return analysisJobRepository.findByVideoId(videoId)
                .flatMap(job -> resultRepository.findByJobId(job.getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/storage/stream")
    public ResponseEntity<Resource> streamMedia(@RequestParam("url") String url) {
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Resource resource = storageService.loadAsResource(url);
            
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "application/octet-stream";
            if (url.endsWith(".mp4") || url.endsWith(".mov")) {
                contentType = "video/mp4";
            } else if (url.endsWith(".mp3")) {
                contentType = "audio/mpeg";
            } else if (url.endsWith(".m4a")) {
                contentType = "audio/mp4";
            } else if (url.endsWith(".wav")) {
                contentType = "audio/wav";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_TYPE, contentType);
            
            return new ResponseEntity<>(resource, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
