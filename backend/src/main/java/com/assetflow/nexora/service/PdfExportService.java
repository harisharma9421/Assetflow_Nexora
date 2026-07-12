package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.GeneratedExport;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import java.io.*;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class PdfExportService {
    private final JdbcTemplate jdbc; private final SpringTemplateEngine templates; private final ReportStorageService storage;
    public PdfExportService(JdbcTemplate jdbc,SpringTemplateEngine templates,ReportStorageService storage){this.jdbc=jdbc;this.templates=templates;this.storage=storage;}
    public GeneratedExport assets(){return render("assets-report",Map.of("title","Asset Register","generatedAt",OffsetDateTime.now(),"rows",jdbc.queryForList("SELECT asset_tag,name,serial_number,condition::text AS condition,status::text AS status,location FROM assets ORDER BY asset_tag")),"assets");}
    public GeneratedExport auditCycle(Long auditCycleId){Map<String,Object> cycle=jdbc.queryForMap("SELECT audit_cycle_id,name,start_date,end_date,status::text AS status,scope_location FROM audit_cycles WHERE audit_cycle_id=?",auditCycleId); List<Map<String,Object>> assets=jdbc.queryForList("SELECT a.asset_tag,a.name,aca.verification_status::text AS verification_status,aca.notes FROM audit_cycle_assets aca JOIN assets a ON a.asset_id=aca.asset_id WHERE aca.audit_cycle_id=? ORDER BY a.asset_tag",auditCycleId); return render("audit-cycle-report",Map.of("title","Audit Cycle Report","generatedAt",OffsetDateTime.now(),"cycle",cycle,"rows",assets),"audit-cycle-"+auditCycleId);}
    private GeneratedExport render(String template,Map<String,Object> values,String prefix){Context context=new Context();context.setVariables(values);String html=templates.process(template,context);try(ByteArrayOutputStream output=new ByteArrayOutputStream()){new PdfRendererBuilder().withHtmlContent(html,null).toStream(output).run();String name=prefix+"-"+LocalDate.now()+".pdf";return new GeneratedExport(name,"application/pdf",storage.store(name,output.toByteArray()));}catch(IOException exception){throw new IllegalStateException("Unable to generate PDF report",exception);}}
}
