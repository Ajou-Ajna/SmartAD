package com.smartadv.backend.repository;

import com.smartadv.backend.domain.SessionToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionTokenRepository extends JpaRepository<SessionToken, String> {
}
