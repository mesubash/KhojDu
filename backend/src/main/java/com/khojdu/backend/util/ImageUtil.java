package com.khojdu.backend.util;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import javax.imageio.ImageIO;

public class ImageUtil {

    public static byte[] resizeImage(MultipartFile file, int width, int height) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            BufferedImage originalImage = ImageIO.read(inputStream);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Thumbnails.of(originalImage)
                    .size(width, height)
                    .keepAspectRatio(true)
                    .outputFormat("jpg")
                    .outputQuality(0.8)
                    .toOutputStream(outputStream);

            return outputStream.toByteArray();
        }
    }

    public static boolean isValidImageDimensions(MultipartFile file, int minWidth, int minHeight) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            BufferedImage image = ImageIO.read(inputStream);
            return image.getWidth() >= minWidth && image.getHeight() >= minHeight;
        }
    }
}
