package com.smartadv.backend.service;

import com.smartadv.backend.common.exception.StorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Path;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "smartadv.aws.s3.bucket")
public class S3StorageService implements StorageService {

    private final S3Client s3Client;

    @Value("${smartadv.aws.s3.bucket}")
    private String bucketName;

    @Value("${smartadv.storage.mock-s3-dir:../mock-s3-storage}")
    private String storageLocation;

    private Path cacheLocation;

    private static final long MAX_S3_STORAGE_BYTES = 5L * 1024 * 1024 * 1024; // 5 GB

    public S3StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        this.cacheLocation = java.nio.file.Paths.get(storageLocation).toAbsolutePath().normalize().resolve("s3_cache");
        try {
            java.nio.file.Files.createDirectories(this.cacheLocation);
        } catch (java.io.IOException e) {
            // Ignored
        }
    }

    private void checkStorageLimit(long additionalBytes) {
        try {
            long totalSize = 0;
            software.amazon.awssdk.services.s3.model.ListObjectsV2Request request = 
                software.amazon.awssdk.services.s3.model.ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .build();
            
            software.amazon.awssdk.services.s3.model.ListObjectsV2Response response;
            do {
                response = s3Client.listObjectsV2(request);
                for (software.amazon.awssdk.services.s3.model.S3Object s3Object : response.contents()) {
                    totalSize += s3Object.size();
                }
                request = request.toBuilder().continuationToken(response.nextContinuationToken()).build();
            } while (response.isTruncated());

            if (totalSize + additionalBytes > MAX_S3_STORAGE_BYTES) {
                throw new StorageException(String.format("S3 Free Tier Storage limit exceeded. Current: %d bytes, Max: %d bytes.", totalSize, MAX_S3_STORAGE_BYTES));
            }
        } catch (Exception e) {
            if (e instanceof StorageException) {
                throw e;
            }
            throw new StorageException("Failed to check S3 storage limit.", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new StorageException("Failed to store empty file.");
            }
            
            // 프리티어 방어 5GB 제한 체크
            checkStorageLimit(file.getSize());
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String generatedFileName = UUID.randomUUID() + extension;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(generatedFileName)
                    // You might want to make it public read if you stream directly from S3
                    // .acl(ObjectCannedACL.PUBLIC_READ) 
                    .build();

            try (InputStream inputStream = file.getInputStream()) {
                s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(inputStream, file.getSize()));
            }

            // Return the S3 URL (assuming default aws endpoint)
            return String.format("https://%s.s3.amazonaws.com/%s", bucketName, generatedFileName);
        } catch (IOException e) {
            throw new StorageException("Failed to store file to S3.", e);
        }
    }

    @Override
    public String uploadFile(Path filePath) {
        try {
            // 프리티어 방어 5GB 제한 체크
            checkStorageLimit(java.nio.file.Files.size(filePath));
            
            String generatedFileName = UUID.randomUUID() + "_" + filePath.getFileName().toString();

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(generatedFileName)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromFile(filePath));

            return String.format("https://%s.s3.amazonaws.com/%s", bucketName, generatedFileName);
        } catch (Exception e) {
            throw new StorageException("Failed to store local file to S3.", e);
        }
    }

    @Override
    public void downloadFile(String s3Url, Path destination) {
        try {
            // Extract bucket and key from S3 URL
            // Format: https://bucket-name.s3.amazonaws.com/key
            URI uri = new URI(s3Url);
            String host = uri.getHost();
            if (host == null || !host.endsWith(".s3.amazonaws.com")) {
                throw new IllegalArgumentException("Invalid S3 URL format: " + s3Url);
            }
            
            String extractedBucket = host.substring(0, host.indexOf(".s3.amazonaws.com"));
            String key = uri.getPath().substring(1); // Remove leading slash

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(extractedBucket)
                    .key(key)
                    .build();

            java.nio.file.Files.deleteIfExists(destination);
            s3Client.getObject(getObjectRequest, ResponseTransformer.toFile(destination));
        } catch (Exception e) {
            throw new StorageException("Failed to download file from S3: " + s3Url, e);
        }
    }

    @Override
    public org.springframework.core.io.Resource loadAsResource(String s3Url) {
        if (s3Url == null || s3Url.isBlank()) {
            throw new StorageException("Empty URL provided");
        }

        // Fallback for mock-s3 URLs
        if (s3Url.startsWith("mock-s3://")) {
            String localPathStr = s3Url.replace("mock-s3://", "");
            return new org.springframework.core.io.FileSystemResource(localPathStr);
        }

        try {
            URI uri = new URI(s3Url);
            String host = uri.getHost();
            if (host == null || !host.endsWith(".s3.amazonaws.com")) {
                // If it's a standard path or does not fit amazon S3 but is a file path, try reading locally
                Path localPath = java.nio.file.Paths.get(s3Url);
                if (java.nio.file.Files.exists(localPath)) {
                    return new org.springframework.core.io.FileSystemResource(localPath);
                }
                throw new IllegalArgumentException("Invalid S3 URL format: " + s3Url);
            }
            
            String extractedBucket = host.substring(0, host.indexOf(".s3.amazonaws.com"));
            String key = uri.getPath().substring(1); // Remove leading slash

            // Ensure key is safe (replace directory separators just in case)
            String safeKey = key.replace("/", "_").replace("\\", "_");
            Path localCacheFile = this.cacheLocation.resolve(safeKey).normalize().toAbsolutePath();

            if (!java.nio.file.Files.exists(localCacheFile)) {
                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                        .bucket(extractedBucket)
                        .key(key)
                        .build();
                s3Client.getObject(getObjectRequest, ResponseTransformer.toFile(localCacheFile));
            }

            return new org.springframework.core.io.FileSystemResource(localCacheFile);
        } catch (Exception e) {
            throw new StorageException("Failed to load S3 file as resource: " + s3Url, e);
        }
    }

    @Override
    public long getRemainingCapacityBytes() {
        try {
            long totalSize = 0;
            software.amazon.awssdk.services.s3.model.ListObjectsV2Request request = 
                software.amazon.awssdk.services.s3.model.ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .build();
            
            software.amazon.awssdk.services.s3.model.ListObjectsV2Response response;
            do {
                response = s3Client.listObjectsV2(request);
                for (software.amazon.awssdk.services.s3.model.S3Object s3Object : response.contents()) {
                    totalSize += s3Object.size();
                }
                request = request.toBuilder().continuationToken(response.nextContinuationToken()).build();
            } while (response.isTruncated());

            long maxS3Bytes = 5L * 1024 * 1024 * 1024; // 5 GB
            return Math.max(0L, maxS3Bytes - totalSize);
        } catch (Exception e) {
            return 1024L * 1024 * 1024; // 1 GB Fallback
        }
    }
}
