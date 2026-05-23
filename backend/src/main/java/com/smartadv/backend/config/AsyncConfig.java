package com.smartadv.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {

    @org.springframework.context.annotation.Bean(name = "pipelineExecutor")
    public java.util.concurrent.Executor pipelineExecutor() {
        org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor executor = 
            new org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);       // Core thread size = 1 (Only one job runs at a time)
        executor.setMaxPoolSize(1);        // Max thread size = 1
        executor.setQueueCapacity(100);    // Queue capacity = 100
        executor.setThreadNamePrefix("ADV-Pipeline-");
        executor.initialize();
        return executor;
    }
}
