package com.khojdu.backend.util;

import com.khojdu.backend.exception.BadRequestException;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

public class FileUtil {

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final List<String> ALLOWED_DOCUMENT_TYPES = Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            // Also allow images for document-style uploads (e.g., citizenship photos)
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

    public static void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPEG, JPG, PNG, and WebP images are allowed");
        }

        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new BadRequestException("Image size should not exceed 10MB");
        }
    }

    public static void validateDocumentFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        if (!ALLOWED_DOCUMENT_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only PDF and Word documents are allowed");
        }

        if (file.getSize() > MAX_DOCUMENT_SIZE) {
            throw new BadRequestException("Document size should not exceed 25MB");
        }
    }

    public static String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf('.') == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }

    public static String generateFileName(String originalFileName) {
        String extension = getFileExtension(originalFileName);
        return System.currentTimeMillis() + "_" + Math.random() + "." + extension;
    }

    public static boolean isImageFile(String contentType) {
        return ALLOWED_IMAGE_TYPES.contains(contentType);
    }

    public static boolean isDocumentFile(String contentType) {
        return ALLOWED_DOCUMENT_TYPES.contains(contentType);
    }
}
