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
public class AnalysisJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long videoId; // Associated Video entity

    private Long userId;

    private String status; // PENDING, PREPROCESSING, SCRIPT_GENERATING, TTS_GENERATING, MERGING, DONE, FAILED

    private Integer progress;

    private String statusDetail; // Fine-grained step description

    private String errorMessage;

    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;

    @Builder
    public AnalysisJob(Long videoId, Long userId) {
        this.videoId = videoId;
        this.userId = userId;
        this.status = "PENDING";
        this.progress = 0;
        this.statusDetail = "";
        this.startedAt = LocalDateTime.now();
    }

    public void updateStatus(String status, Integer progress) {
        this.status = status;
        this.progress = progress;
        if ("DONE".equals(status) || "FAILED".equals(status)) {
            this.finishedAt = LocalDateTime.now();
        }
    }

    public void updateStatusDetail(String statusDetail, Integer progress) {
        this.statusDetail = statusDetail;
        this.progress = progress;
    }

    public void fail(String errorMessage) {
        this.status = "FAILED";
        this.errorMessage = errorMessage;
        this.finishedAt = LocalDateTime.now();
    }
}
