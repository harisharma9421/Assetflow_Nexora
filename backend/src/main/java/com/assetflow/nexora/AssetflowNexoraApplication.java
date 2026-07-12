package com.assetflow.nexora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class AssetflowNexoraApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(AssetflowNexoraApplication.class, args);
        String port = context.getEnvironment().getProperty("local.server.port", "8080");
        System.out.println("AssetFlow Nexora server is running on port " + port);
    }
}
