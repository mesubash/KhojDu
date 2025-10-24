package com.khojdu.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.khojdu.backend.exception.FileStorageException;
import com.khojdu.backend.service.FileUploadService;
import com.khojdu.backend.util.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        log.info("Uploading image to folder: {}", folder);

        FileUtil.validateImageFile(file);

        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "quality", "auto:good",
                    "fetch_format", "auto",
                    "transformation", ObjectUtils.asMap(
                            "width", 1200,
                            "height", 800,
                            "crop", "limit"
                    )
            );

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String imageUrl = (String) uploadResult.get("secure_url");

            log.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;

        } catch (IOException e) {
            log.error("Failed to upload image", e);
            throw new FileStorageException("Failed to upload image: " + e.getMessage());
        }
    }

    @Override
    public String uploadDocument(MultipartFile file, String folder) {
        log.info("Uploading document to folder: {}", folder);

        FileUtil.validateDocumentFile(file);

        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "raw"
            );

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String documentUrl = (String) uploadResult.get("secure_url");

            log.info("Document uploaded successfully: {}", documentUrl);
            return documentUrl;

        } catch (IOException e) {
            log.error("Failed to upload document", e);
            throw new FileStorageException("Failed to upload document: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        log.info("Deleting file: {}", fileUrl);

        try {
            // Extract public ID from Cloudinary URL
            String publicId = extractPublicIdFromUrl(fileUrl);

            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("File deleted successfully: {}", fileUrl);
            }

        } catch (IOException e) {
            log.error("Failed to delete file: {}", fileUrl, e);
            // Don't throw exception for file deletion failures
        }
    }

    @Override
    public String generateThumbnail(String imageUrl, int width, int height) {
        log.info("Generating thumbnail for image: {}", imageUrl);

        try {
            String publicId = extractPublicIdFromUrl(imageUrl);

            if (publicId != null) {
                return cloudinary.url()
                        .transformation(new Transformation()
                                .width(width)
                                .height(height)
                                .crop("fill")
                                .gravity("center"))
                        .generate(publicId);
            }

            return imageUrl; // Return original if thumbnail generation fails

        } catch (Exception e) {
            log.error("Failed to generate thumbnail", e);
            return imageUrl; // Return original if thumbnail generation fails
        }
    }

    private String extractPublicIdFromUrl(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }

        try {
            // Extract public ID from Cloudinary URL
            String[] parts = url.split("/");
            String fileName = parts[parts.length - 1];
            String publicId = fileName.split("\\.")[0];

            // Include folder path if present
            for (int i = parts.length - 2; i >= 0; i--) {
                if (parts[i].equals("image") || parts[i].equals("raw")) {
                    break;
                }
                publicId = parts[i] + "/" + publicId;
            }

            return publicId;

        } catch (Exception e) {
            log.error("Failed to extract public ID from URL: {}", url, e);
            return null;
        }
    }
}
