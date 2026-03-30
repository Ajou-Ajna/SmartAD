package com.smartadv.backend.repository;

import com.smartadv.backend.domain.Video;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoRepository extends JpaRepository<Video, Long> {
}
