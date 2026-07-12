package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.GeneratedExport;
import com.assetflow.nexora.service.PdfExportService;
import com.assetflow.nexora.service.ExcelExportService;
import com.assetflow.nexora.service.ExportActivityLogService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/exports")
public class ExportController {
    private final PdfExportService pdf; private final ExcelExportService excel; private final ExportActivityLogService logs;
    public ExportController(PdfExportService pdf,ExcelExportService excel,ExportActivityLogService logs){this.pdf=pdf;this.excel=excel;this.logs=logs;}
    @GetMapping("/assets.pdf") public ResponseEntity<Resource> assetsPdf(Authentication a){GeneratedExport e=pdf.assets();logs.record(a.getName(),"PDF","assets",null);return download(e);}
    @GetMapping("/audit-cycles/{auditCycleId}.pdf") public ResponseEntity<Resource> auditPdf(@PathVariable Long auditCycleId,Authentication a){GeneratedExport e=pdf.auditCycle(auditCycleId);logs.record(a.getName(),"PDF","audit-cycle",auditCycleId);return download(e);}
    @GetMapping("/assets.xlsx") public ResponseEntity<Resource> assetsExcel(Authentication a){GeneratedExport e=excel.assets();logs.record(a.getName(),"XLSX","assets",null);return download(e);}
    @GetMapping("/maintenance.xlsx") public ResponseEntity<Resource> maintenanceExcel(Authentication a){GeneratedExport e=excel.maintenance();logs.record(a.getName(),"XLSX","maintenance",null);return download(e);}
    private ResponseEntity<Resource> download(GeneratedExport export){return ResponseEntity.ok().contentType(MediaType.parseMediaType(export.contentType())).header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\""+export.fileName()+"\"").body(export.resource());}
}
