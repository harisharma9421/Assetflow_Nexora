package com.assetflow.nexora.service;

import java.io.IOException;
import java.nio.file.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

@Service
public class ReportStorageService {
    private final Path directory;
    public ReportStorageService(@Value("${app.storage.report-dir:../storage/reports}") String directory) { this.directory=Path.of(directory).toAbsolutePath().normalize(); }
    public Resource store(String fileName, byte[] content) {
        try { Files.createDirectories(directory); Path file=directory.resolve(fileName); Files.write(file,content,StandardOpenOption.CREATE,StandardOpenOption.TRUNCATE_EXISTING); return new FileSystemResource(file); }
        catch(IOException exception){throw new IllegalStateException("Unable to store generated report",exception);}
    }
}
