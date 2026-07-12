package com.assetflow.nexora.service;

import com.assetflow.nexora.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ExportActivityLogService {
    private final JdbcTemplate jdbc; private final UserRepository users;
    public ExportActivityLogService(JdbcTemplate jdbc,UserRepository users){this.jdbc=jdbc;this.users=users;}
    public void record(String email,String format,String report,Long entityId){Long userId=users.findByEmail(email).orElseThrow(()->new IllegalStateException("Authenticated export user was not found")).id;jdbc.update("INSERT INTO activity_logs (user_id,action,entity_type,entity_id,details) VALUES (?,?,'report',?,CAST(? AS jsonb))",userId,"REPORT_EXPORTED_"+format,entityId==null?0:entityId,"{\"report\":\""+report+"\",\"format\":\""+format+"\"}");}
}
