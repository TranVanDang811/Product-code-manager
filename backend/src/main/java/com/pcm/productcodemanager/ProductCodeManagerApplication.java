package com.pcm.productcodemanager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
public class ProductCodeManagerApplication {

    private static final Logger log = LoggerFactory.getLogger(ProductCodeManagerApplication.class);

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(ProductCodeManagerApplication.class, args);
    }

    /**
     * Tự động nạp các biến cấu hình từ file .env vào System Properties
     * Tìm kiếm lần lượt tại: thư mục hiện tại, thư mục cha (gốc project), hoặc thư mục backend.
     */
    public static void loadDotEnv() {
        File[] candidates = new File[] {
            new File(".env"),
            new File("../.env"),
            new File("backend/.env")
        };

        for (File file : candidates) {
            if (file.exists() && file.isFile()) {
                log.info("Loading environment variables from .env file: {}", file.getAbsolutePath());
                try (BufferedReader reader = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                } catch (IOException e) {
                    log.warn("Could not read .env file at {}: {}", file.getAbsolutePath(), e.getMessage());
                }
                break;
            }
        }
    }
}

