package com.smartadv.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Value("${smartadv.aws.access-key:}")
    private String accessKey;

    @Value("${smartadv.aws.secret-key:}")
    private String secretKey;

    @Value("${smartadv.aws.region:ap-northeast-2}")
    private String region;

    @Bean
    public S3Client s3Client() {
        if (accessKey.isEmpty() || secretKey.isEmpty()) {
            // Return a default client (might fail if no default creds exist, but we will rely on MockS3 anyway)
            return S3Client.builder().region(Region.of(region)).build();
        }

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }
}
