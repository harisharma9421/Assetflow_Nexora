package com.assetflow.nexora.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Database Initializer for PostgreSQL Custom Enum Casts
 *
 * Automatically creates IMPLICIT casts in PostgreSQL from VARCHAR/TEXT
 * to the custom enum types (like user_status, asset_status, etc.).
 *
 * This allows Spring Data JPA/Hibernate to save entities normally using standard
 * SQL parameters without throwing "column is of type user_status but expression
 * is of type character varying" JDBC errors.
 */
@Component
public class DatabaseCastInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseCastInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseCastInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        logger.info("Initializing PostgreSQL implicit enum casts...");

        List<String> enums = List.of(
                "user_status",
                "department_status",
                "asset_status",
                "asset_condition",
                "holder_type",
                "allocation_status",
                "transfer_status",
                "booking_status",
                "maintenance_priority",
                "maintenance_status",
                "audit_cycle_status",
                "verification_status",
                "discrepancy_type",
                "discrepancy_status",
                "field_data_type",
                "notification_type"
        );

        for (String enumName : enums) {
            try {
                // Check if the cast already exists to avoid throwing errors
                String checkSql = """
                        SELECT EXISTS (
                            SELECT 1 FROM pg_cast c
                            JOIN pg_type s ON c.castsource = s.oid
                            JOIN pg_type t ON c.casttarget = t.oid
                            WHERE s.typname = 'varchar' AND t.typname = ?
                        )
                        """;
                Boolean exists = jdbcTemplate.queryForObject(checkSql, Boolean.class, enumName);

                if (exists == null || !exists) {
                    logger.info("Creating IMPLICIT cast from VARCHAR to {}", enumName);
                    String createCastSql = String.format(
                            "CREATE CAST (varchar AS %s) WITH INOUT AS IMPLICIT",
                            enumName
                    );
                    jdbcTemplate.execute(createCastSql);
                }
            } catch (Exception e) {
                // Log and suppress if there's any permission issue or already exists
                logger.warn("Could not create cast for enum: {}. Error: {}", enumName, e.getMessage());
            }
        }
        logger.info("PostgreSQL enum casts initialized.");
    }
}
