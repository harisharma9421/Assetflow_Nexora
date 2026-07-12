package com.assetflow.nexora.service;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AssetFileStorageService {
    private final Path uploadDirectory;

    public AssetFileStorageService(@Value("${app.storage.upload-dir}") String uploadDirectory) {
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    public String store(Long assetId, MultipartFile file) {
        if (file.isEmpty())
            throw new IllegalArgumentException("Document file must not be empty");
        String original = Paths.get(file.getOriginalFilename() == null ? "document" : file.getOriginalFilename())
                .getFileName().toString();
        String fileName = UUID.randomUUID() + "-" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path folder = uploadDirectory.resolve("assets").resolve(assetId.toString());
        try {
            Files.createDirectories(folder);
            Files.copy(file.getInputStream(), folder.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/assets/" + assetId + "/" + fileName;
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to store asset document", exception);
        }
    }
}
