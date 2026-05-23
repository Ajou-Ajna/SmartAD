package com.smartadv.backend.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Result {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long jobId; // Associated Analysis Job ID

    private Long userId;

    @Lob
    @Column(columnDefinition="TEXT")
    private String scriptText;

    private String narrationAudioPath; // s3Url of Audio File
    private String mergedVideoPath; // s3Url of Merged Video File

    private LocalDateTime createdAt;

    @Builder
    public Result(Long jobId, Long userId, String scriptText, String narrationAudioPath, String mergedVideoPath) {
        this.jobId = jobId;
        this.userId = userId;
        this.scriptText = scriptText;
        this.narrationAudioPath = narrationAudioPath;
        this.mergedVideoPath = mergedVideoPath;
        this.createdAt = LocalDateTime.now();
    }
}
