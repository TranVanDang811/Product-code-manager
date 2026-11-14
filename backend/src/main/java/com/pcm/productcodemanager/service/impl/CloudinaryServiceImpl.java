package com.pcm.productcodemanager.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.pcm.productcodemanager.exception.BadRequestException;
import com.pcm.productcodemanager.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
    );

    @Override
    public Map<String, String> uploadImage(MultipartFile file, String folder) {
        validateFile(file);

        try {
            log.info("Uploading image '{}' to Cloudinary folder: '{}'", file.getOriginalFilename(), folder);

            Map<String, Object> params = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "use_filename", true,
                    "unique_filename", true
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);

            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            log.info("Image uploaded successfully. Public ID: {}, URL: {}", publicId, secureUrl);

            Map<String, String> result = new HashMap<>();
            result.put("secure_url", secureUrl);
            result.put("public_id", publicId);
            return result;

        } catch (IOException ex) {
            log.error("Failed to upload image to Cloudinary", ex);
            throw new BadRequestException("Failed to upload image: " + ex.getMessage());
        }
    }

    @Override
    public void deleteImage(String publicId) {
        if (!StringUtils.hasText(publicId)) {
            return;
        }

        try {
            log.info("Deleting image asset from Cloudinary: {}", publicId);
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Cloudinary destroy result: {}", result);
        } catch (IOException ex) {
            log.warn("Failed to delete old image with publicId: {} on Cloudinary (non-fatal)", publicId, ex);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Image file size exceeds maximum limit of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file format. Only JPEG, PNG, and WEBP images are allowed");
        }
    }
}

