package com.smartadv.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String googleSub;

    @Column(nullable = false)
    private String email;

    private String name;

    @Column(length = 1000)
    private String picture;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public User(String googleSub, String email, String name, String picture) {
        this.googleSub = googleSub;
        this.email = email;
        this.name = name;
        this.picture = picture;
    }

    public void updateProfile(String name, String picture) {
        this.name = name;
        this.picture = picture;
    }
}
