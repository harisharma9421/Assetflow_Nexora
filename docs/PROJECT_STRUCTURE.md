# Project Structure

```text
Assetflow_Nexora/
+-- backend/
|   +-- src/
|       +-- main/
|       |   +-- java/com/assetflow/nexora/
|       |   |   +-- config/
|       |   |   +-- controller/
|       |   |   +-- dto/
|       |   |   +-- entity/
|       |   |   +-- exception/
|       |   |   +-- repository/
|       |   |   +-- security/
|       |   |   +-- service/
|       |   |   +-- scheduler/
|       |   +-- resources/
|       |       +-- db/migration/
|       |       +-- static/
|       |       +-- templates/
|       +-- test/
|           +-- java/com/assetflow/nexora/
+-- frontend/
|   +-- src/
|       +-- app/
|       +-- components/
|       +-- features/
|       +-- hooks/
|       +-- lib/
|       +-- store/
|       +-- styles/
|       +-- types/
+-- docs/
|   +-- ARCHITECTURE.md
|   +-- PROJECT_STRUCTURE.md
|   +-- README.md
+-- storage/
|   +-- reports/
|   +-- uploads/
+-- README.md
+-- .gitignore
```

## Folder Purpose

- `frontend/`: Next.js client application.
- `backend/`: Spring Boot REST API and ERP workflow logic.
- `docs/`: Architecture, project notes, decisions, and setup details.
- `storage/uploads/`: Local uploaded asset photos, documents, and attachments.
- `storage/reports/`: Locally generated PDF and Excel reports.
