package com.pcm.productcodemanager.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.pcm.productcodemanager.exception.BadRequestException;
import com.pcm.productcodemanager.service.impl.CloudinaryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @InjectMocks
    private CloudinaryServiceImpl cloudinaryService;

    private Uploader uploader;

    @BeforeEach
    void setUp() {
        uploader = mock(Uploader.class);
    }

    @Test
    @DisplayName("Should successfully upload image and return secure_url and public_id (BR-11, BR-12)")
    void testUploadImageSuccess() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.png", "image/png", "sample image data".getBytes()
        );

        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://res.cloudinary.com/dltv44gle/image/upload/v1/products/sample.png");
        uploadResult.put("public_id", "products/sample_public_id");

        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        Map<String, String> result = cloudinaryService.uploadImage(file, "products");

        assertNotNull(result);
        assertEquals("https://res.cloudinary.com/dltv44gle/image/upload/v1/products/sample.png", result.get("secure_url"));
        assertEquals("products/sample_public_id", result.get("public_id"));
        verify(uploader).upload(any(byte[].class), anyMap());
    }

    @Test
    @DisplayName("Should reject empty file with BadRequestException")
    void testUploadEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.png", "image/png", new byte[0]
        );

        assertThrows(BadRequestException.class, () -> cloudinaryService.uploadImage(file, "products"));
    }

    @Test
    @DisplayName("Should reject non-image file with BadRequestException")
    void testUploadNonImageFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "document.pdf", "application/pdf", "pdf content".getBytes()
        );

        assertThrows(BadRequestException.class, () -> cloudinaryService.uploadImage(file, "products"));
    }

    @Test
    @DisplayName("Should delete image asset on Cloudinary")
    void testDeleteImage() throws IOException {
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.destroy(eq("products/sample_public_id"), anyMap())).thenReturn(new HashMap<>());

        cloudinaryService.deleteImage("products/sample_public_id");

        verify(uploader).destroy(eq("products/sample_public_id"), anyMap());
    }
}

