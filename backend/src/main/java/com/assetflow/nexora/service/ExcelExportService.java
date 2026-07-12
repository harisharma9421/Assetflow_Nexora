package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.GeneratedExport;
import java.io.*;
import java.time.LocalDate;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ExcelExportService {
    private final JdbcTemplate jdbc; private final ReportStorageService storage;
    public ExcelExportService(JdbcTemplate jdbc,ReportStorageService storage){this.jdbc=jdbc;this.storage=storage;}
    public GeneratedExport assets(){return workbook("Asset Register",new String[]{"Asset Tag","Name","Serial Number","Condition","Status","Location"},jdbc.queryForList("SELECT asset_tag,name,serial_number,condition::text AS condition,status::text AS status,location FROM assets ORDER BY asset_tag"),"assets");}
    public GeneratedExport maintenance(){return workbook("Maintenance Requests",new String[]{"Asset ID","Issue","Priority","Status","Technician","Raised At"},jdbc.queryForList("SELECT asset_id,issue_description,priority::text AS priority,status::text AS status,technician_name,created_at FROM maintenance_requests ORDER BY created_at DESC"),"maintenance");}
    private GeneratedExport workbook(String title,String[] headers,List<Map<String,Object>> rows,String prefix){try(Workbook book=new XSSFWorkbook();ByteArrayOutputStream out=new ByteArrayOutputStream()){Sheet sheet=book.createSheet(title); CellStyle header=book.createCellStyle();header.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());header.setFillPattern(FillPatternType.SOLID_FOREGROUND);Font font=book.createFont();font.setColor(IndexedColors.WHITE.getIndex());font.setBold(true);header.setFont(font);Row h=sheet.createRow(0);for(int i=0;i<headers.length;i++){Cell c=h.createCell(i);c.setCellValue(headers[i]);c.setCellStyle(header);}for(int row=0;row<rows.size();row++){Row line=sheet.createRow(row+1);int col=0;for(Object value:rows.get(row).values()){line.createCell(col++).setCellValue(value==null?"":String.valueOf(value));}}sheet.createFreezePane(0,1);for(int i=0;i<headers.length;i++)sheet.autoSizeColumn(i);book.write(out);String name=prefix+"-"+LocalDate.now()+".xlsx";return new GeneratedExport(name,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",storage.store(name,out.toByteArray()));}catch(IOException e){throw new IllegalStateException("Unable to generate Excel report",e);}}
}
