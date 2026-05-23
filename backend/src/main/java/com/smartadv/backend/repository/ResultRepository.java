package com.smartadv.backend.repository;

import com.smartadv.backend.domain.Result;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Long> {
    Optional<Result> findByJobId(Long jobId);
    List<Result> findByUserIdOrderByCreatedAtDesc(Long userId);
}
