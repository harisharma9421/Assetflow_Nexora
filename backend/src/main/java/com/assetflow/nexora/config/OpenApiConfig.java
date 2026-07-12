package com.assetflow.nexora.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI assetFlowOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("AssetFlow Nexora Backend API")
                        .description("REST API for the AssetFlow Enterprise Asset and Resource Management System.")
                        .version("0.0.1")
                        .license(new License().name("Hackathon Project")));
    }
}
