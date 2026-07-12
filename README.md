# AssetFlow Nexora

Enterprise Asset & Resource Management System for tracking assets, allocations, bookings, maintenance, audits, reports, and notifications.

## Architecture

```mermaid
flowchart TB
    subgraph Users["Users"]
        Admin["Admin"]
        AssetManager["Asset Manager"]
        DeptHead["Department Head"]
        Employee["Employee"]
    end

    subgraph Frontend["Frontend - Next.js 15 + TypeScript"]
        Pages["App Screens\nDashboard, Assets, Allocation, Booking,\nMaintenance, Audit, Reports, Notifications"]
        UI["UI Layer\nshadcn/ui, Tailwind CSS, Lucide React"]
        Forms["Forms + Validation\nReact Hook Form + Zod"]
        UIState["Zustand\nlocal UI/session state"]
        APIState["TanStack Query\nserver state, caching, mutations"]
    end

    subgraph Backend["Backend - Java 21 + Spring Boot 3.5"]
        Auth["Authentication + Authorization\nSpring Security + JWT"]
        Controllers["REST Controllers\nDTO request/response APIs"]
        Services["Service Layer\nbusiness rules and workflows"]
        Jobs["Scheduled Jobs\noverdue returns, reminders, maintenance checks"]
        Repos["Spring Data JPA Repositories\nHibernate ORM"]
    end

    subgraph Domain["Core AssetFlow Modules"]
        Org["Organization Setup\ndepartments, categories, employee directory"]
        AssetReg["Asset Registry\nasset tags, lifecycle status, QR codes"]
        Allocation["Asset Allocation + Transfer\nconflict blocking, returns, history"]
        Booking["Resource Booking\ntime-slot overlap validation"]
        Maintenance["Maintenance Management\napproval workflow and repair status"]
        Audit["Asset Audit\ncycles, auditors, discrepancy reports"]
        Reports["Reports + Analytics\nKPIs, trends, exports"]
        Notifications["Activity Logs + Notifications"]
    end

    subgraph Data["Persistence + Files"]
        DB[("PostgreSQL\nmanaged through pgAdmin 4")]
        Flyway["Flyway\nschema migrations"]
        Files["Local File Storage\nasset photos, documents, attachments"]
    end

    subgraph Exports["Exports + Developer Tools"]
        PDF["PDF Reports\nThymeleaf -> HTML -> OpenHTMLToPDF"]
        Excel["Excel Export\nApache POI"]
        QR["QR Code\nZXing"]
        Swagger["API Docs\nspringdoc-openapi / Swagger UI"]
        Postman["API Testing\nPostman"]
    end

    Admin --> Pages
    AssetManager --> Pages
    DeptHead --> Pages
    Employee --> Pages

    Pages --> UI
    Pages --> Forms
    Pages --> UIState
    Pages --> APIState
    APIState -->|"JWT secured REST APIs"| Auth

    Auth --> Controllers
    Controllers --> Services
    Services --> Domain
    Services --> Repos
    Jobs --> Services

    Repos --> DB
    Flyway --> DB
    Services --> Files

    AssetReg --> QR
    Reports --> PDF
    Reports --> Excel
    Controllers --> Swagger
    Postman --> Controllers
```

Full architecture details: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
