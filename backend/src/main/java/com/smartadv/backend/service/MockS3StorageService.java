package com.smartadv.backend.service;

import com.smartadv.backend.common.exception.StorageException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "smartadv.aws.s3.bucket", matchIfMissing = true, havingValue = "mock")
public class MockS3StorageService implements StorageService {

    @Value("${smartadv.storage.mock-s3-dir}")
    private String mockStorageLocation;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(mockStorageLocation).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage directory", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new StorageException("Failed to store empty file.");
            }
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String generatedFileName = UUID.randomUUID() + extension;
            Path destinationFile = this.rootLocation.resolve(Paths.get(generatedFileName))
                    .normalize().toAbsolutePath();
            
            if (!destinationFile.getParent().equals(this.rootLocation)) {
                throw new StorageException("Cannot store file outside current directory.");
            }
            
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            
            // 향후 파이썬 모듈(advengine.py) 연동을 위해 로컬 파일 시스템의 명시적 경로 또는 mock-s3 리턴
            // 파이썬 엔진에서 그대로 읽을 수 있도록 file:// 형태나 절대 경로를 돌려줄 수도 있습니다.
            return "mock-s3://" + destinationFile.toString();
        } catch (IOException e) {
            throw new StorageException("Failed to store file.", e);
        }
    }

    @Override
    public String uploadFile(Path filePath) {
        try {
            if (!Files.exists(filePath)) {
                throw new StorageException("Failed to store missing file.");
            }
            String generatedFileName = UUID.randomUUID() + "_" + filePath.getFileName().toString();
            Path destinationFile = this.rootLocation.resolve(Paths.get(generatedFileName))
                    .normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(this.rootLocation)) {
                throw new StorageException("Cannot store file outside current directory.");
            }

            Files.copy(filePath, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            return "mock-s3://" + destinationFile.toString();
        } catch (IOException e) {
            throw new StorageException("Failed to store file.", e);
        }
    }

    @Override
    public void downloadFile(String s3Url, Path destination) {
        try {
            String localPathStr = s3Url.replace("mock-s3://", "");
            Path sourceFile = Paths.get(localPathStr);
            if (!Files.exists(sourceFile)) {
                throw new StorageException("Mock S3 source file does not exist: " + s3Url);
            }
            Files.copy(sourceFile, destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new StorageException("Failed to download file.", e);
        }
    }

    @Override
    public org.springframework.core.io.Resource loadAsResource(String url) {
        if (url == null || !url.startsWith("mock-s3://")) {
            throw new StorageException("Invalid mock-s3 URL: " + url);
        }
        String localPathStr = url.replace("mock-s3://", "");
        Path path = Paths.get(localPathStr);
        return new org.springframework.core.io.FileSystemResource(path);
    }

    @Override
    public long getRemainingCapacityBytes() {
        try {
            return this.rootLocation.toFile().getFreeSpace();
        } catch (Exception e) {
            return 50L * 1024 * 1024 * 1024; // 50 GB Fallback
        }
    }
}
