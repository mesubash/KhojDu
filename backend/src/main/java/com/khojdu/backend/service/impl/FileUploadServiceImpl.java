package com.khojdu.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.khojdu.backend.exception.FileStorageException;
import com.khojdu.backend.service.FileUploadService;
import com.khojdu.backend.util.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {

    private final Cloudinary cloudinary;

    // Inject and trim the secret for diagnostics (will not be logged in full)
    @Value("${file.cloudinary.api-secret:}")
    private String cloudinaryApiSecret;

    private static final Pattern STRING_TO_SIGN_PATTERN = Pattern.compile("String to sign - '(.+)'", Pattern.CASE_INSENSITIVE);
    private static final Pattern RECEIVED_SIG_PATTERN = Pattern.compile("Invalid Signature\s+([0-9a-fA-F]+)", Pattern.CASE_INSENSITIVE);

    @Override
    @SuppressWarnings({"rawtypes", "unchecked"})
    public String uploadImage(MultipartFile file, String folder) {
        log.info("Uploading image to folder: {}", folder);

        FileUtil.validateImageFile(file);

        try {
            // Use Cloudinary Transformation object instead of a Map for transformation
            Transformation transformation = new Transformation()
                    .width(1200)
                    .height(800)
                    .crop("limit");

            Map<String, Object> uploadParams = (Map) ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "quality", "auto:good",
                    "fetch_format", "auto",
                    "transformation", transformation
            );

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String imageUrl = (String) uploadResult.get("secure_url");

            log.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;

        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage(), e);
            throw new FileStorageException("Failed to upload image: " + e.getMessage());
        } catch (Exception ex) {
            // Catch Cloudinary specific runtime errors (invalid params etc.) and surface a clear message
            log.error("Cloudinary upload error: {}", ex.getMessage(), ex);

            // If signature mismatch, attempt to compute expected signature for diagnostics and retry without transformation
            String msg = ex.getMessage() == null ? "" : ex.getMessage();
            Matcher sigMatcher = RECEIVED_SIG_PATTERN.matcher(msg);
            Matcher strMatcher = STRING_TO_SIGN_PATTERN.matcher(msg);

            if (sigMatcher.find() && strMatcher.find()) {
                String receivedSig = sigMatcher.group(1);
                String stringToSign = strMatcher.group(1);

                String secret = cloudinaryApiSecret == null ? "" : cloudinaryApiSecret.trim();
                if (!secret.isEmpty()) {
                    String expected = DigestUtils.sha1Hex(stringToSign + secret);
                    String maskedExpected = maskHex(expected);
                    String maskedReceived = maskHex(receivedSig);
                    log.warn("Cloudinary signature mismatch — received={} expected={}. stringToSign='{}' (masked)", maskedReceived, maskedExpected, abbreviate(stringToSign, 200));
                } else {
                    log.warn("Cloudinary signature mismatch detected but 'file.cloudinary.api-secret' is empty; please set CLOUDINARY_API_SECRET and ensure it has no surrounding quotes or whitespace.");
                }
            }

            // If signature mismatch, retry without transformation to work around possible transformation encoding/signing mismatch
            String lower = msg.toLowerCase();
            if (lower.contains("invalid signature")) {
                log.warn("Cloudinary reported invalid signature. Retrying upload without transformation; please verify CLOUDINARY_API_SECRET and credentials in configuration.");
                try {
                    Map<String, Object> retryParams = (Map) ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "quality", "auto:good",
                            "fetch_format", "auto"
                    );

                    Map<?, ?> retryResult = cloudinary.uploader().upload(file.getBytes(), retryParams);
                    String imageUrl = (String) retryResult.get("secure_url");
                    log.info("Image uploaded successfully on retry (no transformation): {}", imageUrl);
                    return imageUrl;
                } catch (Exception retryEx) {
                    log.error("Retry upload without transformation also failed: {}", retryEx.getMessage(), retryEx);
                    // If retry also includes a String to sign, compute expected again
                    String retryMsg = retryEx.getMessage() == null ? "" : retryEx.getMessage();
                    Matcher retrySigMatcher = RECEIVED_SIG_PATTERN.matcher(retryMsg);
                    Matcher retryStrMatcher = STRING_TO_SIGN_PATTERN.matcher(retryMsg);
                    if (retrySigMatcher.find() && retryStrMatcher.find()) {
                        String rcv = retrySigMatcher.group(1);
                        String sts = retryStrMatcher.group(1);
                        String secret = cloudinaryApiSecret == null ? "" : cloudinaryApiSecret.trim();
                        if (!secret.isEmpty()) {
                            String expectedRetry = DigestUtils.sha1Hex(sts + secret);
                            log.warn("Retry signature mismatch — received={} expected={} stringToSign='{}'", maskHex(rcv), maskHex(expectedRetry), abbreviate(sts, 200));
                        }
                    }
                    throw new FileStorageException("Failed to upload image (Cloudinary) after retry: " + retryEx.getMessage());
                }
            }

            throw new FileStorageException("Failed to upload image (Cloudinary): " + ex.getMessage());
        }
    }

    private static String maskHex(String hex) {
        if (hex == null) return "";
        hex = hex.trim();
        if (hex.length() <= 8) return "****" + hex;
        return "****" + hex.substring(hex.length() - 8);
    }

    private static String abbreviate(String s, int maxLen) {
        if (s == null) return "";
        s = s.replaceAll("\\s+", " ");
        if (s.length() <= maxLen) return s;
        return s.substring(0, maxLen) + "...";
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
