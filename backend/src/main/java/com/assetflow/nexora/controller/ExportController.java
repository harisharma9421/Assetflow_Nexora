package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.GeneratedExport;
import com.assetflow.nexora.service.PdfExportService;
import com.assetflow.nexora.service.ExcelExportService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exports")
public class ExportController {
    private final PdfExportService pdf; private final ExcelExportService excel;
    public ExportController(PdfExportService pdf,ExcelExportService excel){this.pdf=pdf;this.excel=excel;}
    @GetMapping("/assets.pdf") public ResponseEntity<Resource> assetsPdf(){return download(pdf.assets());}
    @GetMapping("/audit-cycles/{auditCycleId}.pdf") public ResponseEntity<Resource> auditPdf(@PathVariable Long auditCycleId){return download(pdf.auditCycle(auditCycleId));}
    @GetMapping("/assets.xlsx") public ResponseEntity<Resource> assetsExcel(){return download(excel.assets());}
    @GetMapping("/maintenance.xlsx") public ResponseEntity<Resource> maintenanceExcel(){return download(excel.maintenance());}
    private ResponseEntity<Resource> download(GeneratedExport export){return ResponseEntity.ok().contentType(MediaType.parseMediaType(export.contentType())).header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\""+export.fileName()+"\"").body(export.resource());}
}
