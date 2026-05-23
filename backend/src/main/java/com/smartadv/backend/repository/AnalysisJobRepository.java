package com.smartadv.backend.repository;

import com.smartadv.backend.domain.AnalysisJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalysisJobRepository extends JpaRepository<AnalysisJob, Long> {
    Optional<AnalysisJob> findByVideoId(Long videoId);
    Optional<AnalysisJob> findFirstByUserIdAndStatusOrderByFinishedAtDesc(Long userId, String status);
}
