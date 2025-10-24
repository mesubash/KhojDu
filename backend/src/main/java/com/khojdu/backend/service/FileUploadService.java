package com.khojdu.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {
    String uploadImage(MultipartFile file, String folder);
    String uploadDocument(MultipartFile file, String folder);
    void deleteFile(String fileUrl);
    String generateThumbnail(String imageUrl, int width, int height);
}

