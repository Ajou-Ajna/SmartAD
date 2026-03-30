package com.smartadv.backend.service;

import com.smartadv.backend.domain.AnalysisJob;
import com.smartadv.backend.domain.Video;
import com.smartadv.backend.repository.AnalysisJobRepository;
import com.smartadv.backend.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final StorageService storageService;
    private final VideoRepository videoRepository;
    private final AnalysisJobRepository analysisJobRepository;
    private final WorkerClientService workerClientService;

    @Transactional
    public Video uploadVideo(MultipartFile file) {
        // 1. S3 (Mock)에 파일 업로드
        String storedUrl = storageService.uploadFile(file);

        // 2. DB에 파일 정보 저장
        Video video = Video.builder()
                .originalFileName(file.getOriginalFilename())
                .s3Url(storedUrl)
                .fileSize(file.getSize())
                .build();
        video = videoRepository.save(video);
        
        // 3. 작업(Job) 생성 및 파이프라인 트리거
        AnalysisJob job = AnalysisJob.builder().videoId(video.getId()).build();
        job = analysisJobRepository.save(job);
        
        workerClientService.executeMockPipeline(video.getId(), job);
        
        return video;
    }
}
