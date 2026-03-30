package com.smartadv.backend.dto;

import com.smartadv.backend.domain.Video;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class VideoResponse {
    private Long id;
    private String originalFileName;
    private String s3Url;
    private Long fileSize;
    private LocalDateTime createdAt;

    public VideoResponse(Video video) {
        this.id = video.getId();
        this.originalFileName = video.getOriginalFileName();
        this.s3Url = video.getS3Url();
        this.fileSize = video.getFileSize();
        this.createdAt = video.getCreatedAt();
    }
}
