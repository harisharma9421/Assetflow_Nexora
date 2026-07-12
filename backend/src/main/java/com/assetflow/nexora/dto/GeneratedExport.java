package com.assetflow.nexora.dto;

import org.springframework.core.io.Resource;

public record GeneratedExport(String fileName, String contentType, Resource resource) {}
