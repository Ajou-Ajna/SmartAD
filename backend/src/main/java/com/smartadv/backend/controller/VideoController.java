package com.smartadv.backend.controller;

import com.smartadv.backend.common.security.UserContext;
import com.smartadv.backend.domain.User;
import com.smartadv.backend.domain.Video;
import com.smartadv.backend.dto.VideoResponse;
import com.smartadv.backend.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    @PostMapping("/upload")
    public ResponseEntity<VideoResponse> uploadVideo(@RequestParam("file") MultipartFile file) {
        User currentUser = UserContext.getCurrentUser();
        Long userId = (currentUser != null) ? currentUser.getId() : null;
        Video savedVideo = videoService.uploadVideo(file, userId);
        return ResponseEntity.ok(new VideoResponse(savedVideo));
    }
}
