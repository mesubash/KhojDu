package com.khojdu.backend.dto.property;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class PropertyImageUploadRequest {
    private List<MultipartFile> images;
}
