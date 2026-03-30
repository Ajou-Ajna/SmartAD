package com.smartadv.backend.controller;

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
        Video savedVideo = videoService.uploadVideo(file);
        return ResponseEntity.ok(new VideoResponse(savedVideo));
    }
}
