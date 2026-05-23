package com.smartadv.backend.controller;

import com.smartadv.backend.common.security.UserContext;
import com.smartadv.backend.domain.AnalysisJob;
import com.smartadv.backend.domain.Result;
import com.smartadv.backend.domain.User;
import com.smartadv.backend.domain.Video;
import com.smartadv.backend.repository.AnalysisJobRepository;
import com.smartadv.backend.repository.ResultRepository;
import com.smartadv.backend.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/archive")
@RequiredArgsConstructor
public class ArchiveController {

    private final ResultRepository resultRepository;
    private final AnalysisJobRepository analysisJobRepository;
    private final VideoRepository videoRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getArchive() {
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        List<Result> results = resultRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        List<Map<String, Object>> archiveItems = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Result result : results) {
            AnalysisJob job = analysisJobRepository.findById(result.getJobId()).orElse(null);
            if (job == null) continue;

            Video video = videoRepository.findById(job.getVideoId()).orElse(null);
            if (video == null) continue;

            Map<String, Object> item = new HashMap<>();
            item.put("id", result.getId().toString());
            item.put("title", video.getOriginalFileName());
            item.put("type", "file");
            item.put("fileName", video.getS3Url());
            item.put("audioFileName", result.getNarrationAudioPath());
            
            // Format size
            long sizeInMb = video.getFileSize() != null ? (video.getFileSize() / (1024 * 1024)) : 0;
            item.put("audioSize", sizeInMb > 0 ? sizeInMb + "MB" : "12MB");
            
            item.put("date", result.getCreatedAt().format(formatter));
            item.put("liked", false);

            archiveItems.add(item);
        }

        return ResponseEntity.ok(archiveItems);
    }
}
