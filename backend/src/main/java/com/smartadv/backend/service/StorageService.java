package com.smartadv.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    /**
     * Store the file in Mock S3 (or real S3) and return the stored file URL or Key
     */
    String uploadFile(MultipartFile file);

    /**
     * Store a local file to S3
     */
    String uploadFile(java.nio.file.Path filePath);

    /**
     * Download a file from S3 to a local destination
     */
    void downloadFile(String s3Url, java.nio.file.Path destination);

    /**
     * Load the resource from the given URL (mock-s3:// or real S3 https://)
     */
    org.springframework.core.io.Resource loadAsResource(String url);
}
