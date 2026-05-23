package com.smartadv.backend.controller;

import com.smartadv.backend.common.security.UserContext;
import com.smartadv.backend.domain.AnalysisJob;
import com.smartadv.backend.domain.User;
import com.smartadv.backend.domain.Video;
import com.smartadv.backend.dto.VideoResponse;
import com.smartadv.backend.repository.AnalysisJobRepository;
import com.smartadv.backend.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final AnalysisJobRepository analysisJobRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in."));
        }

        // Apply 3-hour rate limit on general users
        if ("USER".equals(currentUser.getRole())) {
            Optional<AnalysisJob> lastDoneJob = analysisJobRepository.findFirstByUserIdAndStatusOrderByFinishedAtDesc(currentUser.getId(), "DONE");
            if (lastDoneJob.isPresent()) {
                LocalDateTime finishedAt = lastDoneJob.get().getFinishedAt();
                if (finishedAt != null && finishedAt.plusHours(3).isAfter(LocalDateTime.now())) {
                    LocalDateTime nextAvailable = finishedAt.plusHours(3);
                    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                            .body(Map.of(
                                    "error", "usage_limit",
                                    "message", "일반 사용자는 생성 성공 후 3시간에 1회만 해설 생성이 가능합니다.",
                                    "nextAvailableTime", nextAvailable.toString()
                            ));
                }
            }
        }

        Video savedVideo = videoService.uploadVideo(file, currentUser.getId());
        return ResponseEntity.ok(new VideoResponse(savedVideo));
    }
}
