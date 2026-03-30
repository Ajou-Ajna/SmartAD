package com.smartadv.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    /**
     * Store the file in Mock S3 (or real S3) and return the stored file URL or Key
     */
    String uploadFile(MultipartFile file);
}
