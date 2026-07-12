-- =====================================================================
--  AssetFlow — Enterprise Asset & Resource Management System
--  Database Schema  |  Target: PostgreSQL 14+
--  Design goals: 3NF core tables, explicit lifecycle/state history,
--  DB-enforced conflict rules (no double allocation, no overlapping
--  bookings), and full auditability (who/when for every mutation).
-- =====================================================================

-- Needed for the booking overlap EXCLUDE constraint (GiST on ranges)
CREATE EXTENSION IF NOT EXISTS btree_gist;
-- Needed for fast fuzzy/partial search on asset tag, serial number, etc.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================================
-- 1. ENUM TYPES
-- =====================================================================
CREATE TYPE user_status           AS ENUM ('Active','Inactive');
CREATE TYPE department_status     AS ENUM ('Active','Inactive');
CREATE TYPE asset_status          AS ENUM ('Available','Allocated','Reserved','Under Maintenance','Lost','Retired','Disposed');
CREATE TYPE asset_condition       AS ENUM ('New','Good','Fair','Poor','Damaged');
CREATE TYPE holder_type           AS ENUM ('Employee','Department');
CREATE TYPE allocation_status     AS ENUM ('Active','Returned','Overdue');
CREATE TYPE transfer_status       AS ENUM ('Requested','Approved','Rejected','Completed');
CREATE TYPE booking_status        AS ENUM ('Upcoming','Ongoing','Completed','Cancelled');
CREATE TYPE maintenance_priority  AS ENUM ('Low','Medium','High','Critical');
CREATE TYPE maintenance_status    AS ENUM ('Pending','Approved','Rejected','Technician Assigned','In Progress','Resolved');
CREATE TYPE audit_cycle_status    AS ENUM ('Planned','In Progress','Closed');
CREATE TYPE verification_status  AS ENUM ('Pending','Verified','Missing','Damaged');
CREATE TYPE discrepancy_type      AS ENUM ('Missing','Damaged');
CREATE TYPE discrepancy_status    AS ENUM ('Open','Resolved');
CREATE TYPE field_data_type       AS ENUM ('Text','Number','Date','Boolean');
CREATE TYPE notification_type AS ENUM (
    'Asset Assigned','Maintenance Approved','Maintenance Rejected',
    'Booking Confirmed','Booking Cancelled','Booking Reminder',
    'Transfer Approved','Overdue Return Alert','Audit Discrepancy Flagged'
);

-- =====================================================================
-- 2. IDENTITY & ORG STRUCTURE
-- =====================================================================

-- Fixed role catalogue. Roles are NEVER self-assigned at signup;
-- only an Admin can promote a user (enforced in application layer +
-- promoted_by/promoted_at audit columns below).
CREATE TABLE roles (
    role_id     SMALLSERIAL PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE      -- Admin | Asset Manager | Department Head | Employee
);

CREATE TABLE departments (
    department_id         BIGSERIAL PRIMARY KEY,
    name                   VARCHAR(150) NOT NULL UNIQUE,
    parent_department_id   BIGINT REFERENCES departments(department_id) ON DELETE SET NULL,
    head_user_id           BIGINT,               -- FK added below (circular w/ users)
    status                  department_status NOT NULL DEFAULT 'Active',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_dept_not_own_parent CHECK (department_id <> parent_department_id)
);

CREATE TABLE users (
    user_id         BIGSERIAL PRIMARY KEY,
    full_name        VARCHAR(150) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    department_id    BIGINT REFERENCES departments(department_id) ON DELETE SET NULL,
    role_id          SMALLINT NOT NULL REFERENCES roles(role_id),
    status           user_status NOT NULL DEFAULT 'Active',
    promoted_by      BIGINT REFERENCES users(user_id) ON DELETE SET NULL,  -- Admin who assigned the role
    promoted_at      TIMESTAMPTZ,
    last_login_at    TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE departments
    ADD CONSTRAINT fk_department_head
    FOREIGN KEY (head_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

CREATE TABLE password_reset_tokens (
    token_id     BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash   VARCHAR(255) NOT NULL,
    expires_at   TIMESTAMPTZ NOT NULL,
    used_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role       ON users(role_id);

-- =====================================================================
-- 3. ASSET CATEGORIES  (+ optional category-specific fields, EAV style)
-- =====================================================================
CREATE TABLE asset_categories (
    category_id   BIGSERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL UNIQUE,   -- Electronics, Furniture, Vehicles...
    description    TEXT,
    status          department_status NOT NULL DEFAULT 'Active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Category-defined custom attributes, e.g. "Warranty Period" for Electronics
CREATE TABLE category_custom_fields (
    field_id      BIGSERIAL PRIMARY KEY,
    category_id   BIGINT NOT NULL REFERENCES asset_categories(category_id) ON DELETE CASCADE,
    field_name    VARCHAR(100) NOT NULL,
    field_type    field_data_type NOT NULL DEFAULT 'Text',
    is_required   BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (category_id, field_name)
);

-- =====================================================================
-- 4. ASSETS
-- =====================================================================
CREATE TABLE assets (
    asset_id           BIGSERIAL PRIMARY KEY,
    asset_tag           VARCHAR(30) NOT NULL UNIQUE,     -- auto-generated e.g. AF-0001
    name                 VARCHAR(150) NOT NULL,
    category_id          BIGINT NOT NULL REFERENCES asset_categories(category_id),
    serial_number         VARCHAR(100),
    qr_code                VARCHAR(150) UNIQUE,
    acquisition_date       DATE,
    acquisition_cost        NUMERIC(14,2),               -- reporting only, not linked to accounting
    condition                asset_condition NOT NULL DEFAULT 'New',
    location                  VARCHAR(150),
    status                     asset_status NOT NULL DEFAULT 'Available',
    is_bookable                BOOLEAN NOT NULL DEFAULT false,  -- shared/bookable resource flag
    owning_department_id       BIGINT REFERENCES departments(department_id) ON DELETE SET NULL,
    created_by                  BIGINT NOT NULL REFERENCES users(user_id),
    created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assets_category   ON assets(category_id);
CREATE INDEX idx_assets_status     ON assets(status);
CREATE INDEX idx_assets_department ON assets(owning_department_id);
CREATE INDEX idx_assets_location   ON assets(location);
CREATE INDEX idx_assets_serial     ON assets(serial_number);

-- Values for category_custom_fields, keyed per asset
CREATE TABLE asset_custom_field_values (
    value_id    BIGSERIAL PRIMARY KEY,
    asset_id     BIGINT NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
    field_id     BIGINT NOT NULL REFERENCES category_custom_fields(field_id) ON DELETE CASCADE,
    field_value  TEXT,
    UNIQUE (asset_id, field_id)
);

-- Photos / supporting documents per asset
CREATE TABLE asset_documents (
    document_id   BIGSERIAL PRIMARY KEY,
    asset_id       BIGINT NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
    file_url        VARCHAR(500) NOT NULL,
    file_type        VARCHAR(50),               -- photo, warranty_doc, invoice_copy...
    uploaded_by       BIGINT NOT NULL REFERENCES users(user_id),
    uploaded_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Immutable log of every lifecycle state transition (Available <-> Under
-- Maintenance, Allocated -> Available, -> Lost, -> Retired, -> Disposed...)
CREATE TABLE asset_status_history (
    history_id    BIGSERIAL PRIMARY KEY,
    asset_id       BIGINT NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
    from_status     asset_status,
    to_status        asset_status NOT NULL,
    reason            VARCHAR(255),
    changed_by         BIGINT NOT NULL REFERENCES users(user_id),
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_status_history_asset ON asset_status_history(asset_id);

-- =====================================================================
-- 5. ALLOCATION & TRANSFER
-- =====================================================================
CREATE TABLE asset_allocations (
    allocation_id          BIGSERIAL PRIMARY KEY,
    asset_id                BIGINT NOT NULL REFERENCES assets(asset_id),
    holder_type              holder_type NOT NULL,             -- Employee or Department
    holder_employee_id        BIGINT REFERENCES users(user_id),
    holder_department_id      BIGINT REFERENCES departments(department_id),
    allocated_by                BIGINT NOT NULL REFERENCES users(user_id),
    allocation_date               DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_return_date           DATE,
    actual_return_date              DATE,
    return_condition_notes           TEXT,
    returned_to                       BIGINT REFERENCES users(user_id),  -- who processed the return
    status                             allocation_status NOT NULL DEFAULT 'Active',
    created_at                          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_holder_reference CHECK (
        (holder_type = 'Employee'   AND holder_employee_id   IS NOT NULL AND holder_department_id IS NULL) OR
        (holder_type = 'Department' AND holder_department_id IS NOT NULL AND holder_employee_id   IS NULL)
    )
);

-- CORE CONFLICT RULE: an asset can have at most one *Active* allocation
-- at a time. Any second attempt fails at the DB layer -> the app catches
-- the violation and offers the Transfer Request flow instead.
CREATE UNIQUE INDEX uq_one_active_allocation_per_asset
    ON asset_allocations(asset_id)
    WHERE status = 'Active';

CREATE INDEX idx_allocations_asset       ON asset_allocations(asset_id);
CREATE INDEX idx_allocations_employee    ON asset_allocations(holder_employee_id);
CREATE INDEX idx_allocations_department  ON asset_allocations(holder_department_id);
CREATE INDEX idx_allocations_overdue     ON asset_allocations(expected_return_date) WHERE status = 'Active';

CREATE TABLE transfer_requests (
    transfer_id             BIGSERIAL PRIMARY KEY,
    asset_id                 BIGINT NOT NULL REFERENCES assets(asset_id),
    current_allocation_id     BIGINT NOT NULL REFERENCES asset_allocations(allocation_id),
    requested_by                BIGINT NOT NULL REFERENCES users(user_id),
    requested_to_employee_id     BIGINT REFERENCES users(user_id),
    requested_to_department_id    BIGINT REFERENCES departments(department_id),
    reason                          TEXT,
    status                           transfer_status NOT NULL DEFAULT 'Requested',
    approved_by                      BIGINT REFERENCES users(user_id),
    new_allocation_id                 BIGINT REFERENCES asset_allocations(allocation_id), -- set once re-allocated
    requested_at                       TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at                         TIMESTAMPTZ
);

CREATE INDEX idx_transfer_asset  ON transfer_requests(asset_id);
CREATE INDEX idx_transfer_status ON transfer_requests(status);

-- =====================================================================
-- 6. RESOURCE BOOKING  (shared/bookable assets, time-slot based)
-- =====================================================================
CREATE TABLE resource_bookings (
    booking_id       BIGSERIAL PRIMARY KEY,
    asset_id          BIGINT NOT NULL REFERENCES assets(asset_id),
    booked_by          BIGINT NOT NULL REFERENCES users(user_id),
    department_id        BIGINT REFERENCES departments(department_id),  -- booked on behalf of
    purpose                VARCHAR(255),
    start_time              TIMESTAMPTZ NOT NULL,
    end_time                 TIMESTAMPTZ NOT NULL,
    status                    booking_status NOT NULL DEFAULT 'Upcoming',
    cancelled_by                BIGINT REFERENCES users(user_id),
    cancelled_at                 TIMESTAMPTZ,
    created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_booking_time_order CHECK (end_time > start_time)
);

-- CORE CONFLICT RULE: no two active bookings for the same asset may
-- overlap in time. A request for 10:00-11:00 right after a 9:00-10:00
-- booking is allowed (ranges are half-open); 9:30-10:30 is rejected.
ALTER TABLE resource_bookings
    ADD CONSTRAINT excl_no_overlapping_bookings
    EXCLUDE USING gist (
        asset_id WITH =,
        tstzrange(start_time, end_time, '[)') WITH &&
    )
    WHERE (status IN ('Upcoming','Ongoing'));

CREATE INDEX idx_bookings_asset  ON resource_bookings(asset_id);
CREATE INDEX idx_bookings_user   ON resource_bookings(booked_by);
CREATE INDEX idx_bookings_window ON resource_bookings(start_time, end_time);

-- =====================================================================
-- 7. MAINTENANCE MANAGEMENT
-- =====================================================================
CREATE TABLE maintenance_requests (
    request_id        BIGSERIAL PRIMARY KEY,
    asset_id            BIGINT NOT NULL REFERENCES assets(asset_id),
    raised_by             BIGINT NOT NULL REFERENCES users(user_id),
    issue_description       TEXT NOT NULL,
    priority                  maintenance_priority NOT NULL DEFAULT 'Medium',
    status                     maintenance_status NOT NULL DEFAULT 'Pending',
    approved_by                  BIGINT REFERENCES users(user_id),
    approved_at                   TIMESTAMPTZ,
    rejection_reason                TEXT,
    technician_name                   VARCHAR(150),
    technician_assigned_at              TIMESTAMPTZ,
    resolved_at                          TIMESTAMPTZ,
    resolution_notes                       TEXT,
    created_at                              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_maintenance_asset  ON maintenance_requests(asset_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);

CREATE TABLE maintenance_attachments (
    attachment_id  BIGSERIAL PRIMARY KEY,
    request_id      BIGINT NOT NULL REFERENCES maintenance_requests(request_id) ON DELETE CASCADE,
    file_url          VARCHAR(500) NOT NULL,
    uploaded_by         BIGINT NOT NULL REFERENCES users(user_id),
    uploaded_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 8. AUDIT CYCLES
-- =====================================================================
CREATE TABLE audit_cycles (
    audit_cycle_id     BIGSERIAL PRIMARY KEY,
    name                 VARCHAR(150) NOT NULL,
    scope_department_id    BIGINT REFERENCES departments(department_id),
    scope_location            VARCHAR(150),
    start_date                 DATE NOT NULL,
    end_date                     DATE NOT NULL,
    status                        audit_cycle_status NOT NULL DEFAULT 'Planned',
    created_by                     BIGINT NOT NULL REFERENCES users(user_id),
    closed_by                        BIGINT REFERENCES users(user_id),
    closed_at                          TIMESTAMPTZ,
    created_at                           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_audit_date_order CHECK (end_date >= start_date)
);

CREATE TABLE audit_cycle_auditors (
    audit_cycle_id   BIGINT NOT NULL REFERENCES audit_cycles(audit_cycle_id) ON DELETE CASCADE,
    auditor_user_id    BIGINT NOT NULL REFERENCES users(user_id),
    assigned_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (audit_cycle_id, auditor_user_id)
);

-- One row per asset in scope for a given cycle
CREATE TABLE audit_cycle_assets (
    audit_cycle_asset_id  BIGSERIAL PRIMARY KEY,
    audit_cycle_id          BIGINT NOT NULL REFERENCES audit_cycles(audit_cycle_id) ON DELETE CASCADE,
    asset_id                  BIGINT NOT NULL REFERENCES assets(asset_id),
    verification_status         verification_status NOT NULL DEFAULT 'Pending',
    verified_by                    BIGINT REFERENCES users(user_id),
    verified_at                      TIMESTAMPTZ,
    notes                              TEXT,
    UNIQUE (audit_cycle_id, asset_id)
);

CREATE TABLE discrepancy_reports (
    discrepancy_id     BIGSERIAL PRIMARY KEY,
    audit_cycle_id        BIGINT NOT NULL REFERENCES audit_cycles(audit_cycle_id) ON DELETE CASCADE,
    asset_id                BIGINT NOT NULL REFERENCES assets(asset_id),
    issue_type                discrepancy_type NOT NULL,
    description                  TEXT,
    resolution_status              discrepancy_status NOT NULL DEFAULT 'Open',
    resolved_by                      BIGINT REFERENCES users(user_id),
    resolved_at                        TIMESTAMPTZ,
    created_at                           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_discrepancy_cycle ON discrepancy_reports(audit_cycle_id);
CREATE INDEX idx_discrepancy_asset ON discrepancy_reports(asset_id);

-- =====================================================================
-- 9. NOTIFICATIONS & ACTIVITY LOGS
-- =====================================================================
CREATE TABLE notifications (
    notification_id    BIGSERIAL PRIMARY KEY,
    user_id               BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type                    notification_type NOT NULL,
    title                     VARCHAR(150) NOT NULL,
    message                     TEXT NOT NULL,
    related_entity_type          VARCHAR(50),    -- e.g. 'asset','booking','maintenance_request'
    related_entity_id              BIGINT,
    is_read                          BOOLEAN NOT NULL DEFAULT false,
    created_at                         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;

-- Generic append-only trail of who did what, when, across every module
CREATE TABLE activity_logs (
    log_id          BIGSERIAL PRIMARY KEY,
    user_id           BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    action              VARCHAR(100) NOT NULL,     -- e.g. 'ASSET_ALLOCATED','BOOKING_CANCELLED'
    entity_type           VARCHAR(50) NOT NULL,
    entity_id               BIGINT NOT NULL,
    details                   JSONB,
    ip_address                 INET,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user   ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_time   ON activity_logs(created_at);

-- =====================================================================
-- 10. SEED DATA (fixed role catalogue)
-- =====================================================================
INSERT INTO roles (role_name) VALUES
    ('Admin'), ('Asset Manager'), ('Department Head'), ('Employee');

-- =====================================================================
-- 11. AUTOMATION — generic "touch updated_at" trigger
-- =====================================================================
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_touch_departments  BEFORE UPDATE ON departments  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_users        BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_categories   BEFORE UPDATE ON asset_categories FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_assets       BEFORE UPDATE ON assets       FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_allocations  BEFORE UPDATE ON asset_allocations FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_bookings     BEFORE UPDATE ON resource_bookings FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_maintenance  BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- =====================================================================
-- 12. AUTOMATION — auto-generated Asset Tag (AF-0001, AF-0002, ...)
-- =====================================================================
CREATE SEQUENCE asset_tag_seq START 1;

CREATE OR REPLACE FUNCTION generate_asset_tag() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.asset_tag IS NULL THEN
        NEW.asset_tag := 'AF-' || LPAD(nextval('asset_tag_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_asset_tag
    BEFORE INSERT ON assets
    FOR EACH ROW EXECUTE FUNCTION generate_asset_tag();

-- =====================================================================
-- 13. AUTOMATION — asset status auto-sync
-- These triggers are what make the lifecycle diagram in the problem
-- statement (Available <-> Under Maintenance, Allocated -> Available,
-- Missing -> Lost) *self-enforcing* instead of relying on the app to
-- remember to update `assets.status` everywhere.
-- =====================================================================

-- 13a. Allocation created / returned -> Allocated / Available
CREATE OR REPLACE FUNCTION sync_asset_status_on_allocation() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'Active' THEN
        UPDATE assets SET status = 'Allocated' WHERE asset_id = NEW.asset_id;
        INSERT INTO asset_status_history (asset_id, from_status, to_status, reason, changed_by)
        VALUES (NEW.asset_id, 'Available', 'Allocated', 'Asset allocated', NEW.allocated_by);

    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'Active' AND NEW.status = 'Returned' THEN
        UPDATE assets SET status = 'Available' WHERE asset_id = NEW.asset_id;
        INSERT INTO asset_status_history (asset_id, from_status, to_status, reason, changed_by)
        VALUES (NEW.asset_id, 'Allocated', 'Available', 'Asset returned',
                COALESCE(NEW.returned_to, NEW.allocated_by));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_asset_status_allocation
    AFTER INSERT OR UPDATE ON asset_allocations
    FOR EACH ROW EXECUTE FUNCTION sync_asset_status_on_allocation();

-- 13b. Maintenance approved / resolved -> Under Maintenance / Available
CREATE OR REPLACE FUNCTION sync_asset_status_on_maintenance() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status = 'Approved' THEN
            UPDATE assets SET status = 'Under Maintenance' WHERE asset_id = NEW.asset_id;
            INSERT INTO asset_status_history (asset_id, to_status, reason, changed_by)
            VALUES (NEW.asset_id, 'Under Maintenance', 'Maintenance request approved', NEW.approved_by);

        ELSIF NEW.status = 'Resolved' THEN
            UPDATE assets SET status = 'Available' WHERE asset_id = NEW.asset_id;
            INSERT INTO asset_status_history (asset_id, to_status, reason, changed_by)
            VALUES (NEW.asset_id, 'Available', 'Maintenance resolved', NEW.approved_by);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_asset_status_maintenance
    AFTER UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION sync_asset_status_on_maintenance();

-- 13c. Booking upcoming/ongoing -> Reserved, completed/cancelled -> Available
-- (only applies while the asset isn't already Allocated/Under Maintenance)
CREATE OR REPLACE FUNCTION sync_asset_status_on_booking() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('Upcoming','Ongoing') THEN
        UPDATE assets SET status = 'Reserved'
        WHERE asset_id = NEW.asset_id AND status = 'Available';
    ELSIF NEW.status IN ('Completed','Cancelled') THEN
        UPDATE assets SET status = 'Available'
        WHERE asset_id = NEW.asset_id AND status = 'Reserved';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_asset_status_booking
    AFTER INSERT OR UPDATE ON resource_bookings
    FOR EACH ROW EXECUTE FUNCTION sync_asset_status_on_booking();

-- 13d. Audit verification flags Missing/Damaged -> auto-generate discrepancy report
CREATE OR REPLACE FUNCTION generate_discrepancy_report() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_status IN ('Missing','Damaged')
       AND (OLD.verification_status IS DISTINCT FROM NEW.verification_status) THEN
        INSERT INTO discrepancy_reports (audit_cycle_id, asset_id, issue_type, description)
        VALUES (NEW.audit_cycle_id, NEW.asset_id, NEW.verification_status::text::discrepancy_type, NEW.notes);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_discrepancy
    AFTER UPDATE ON audit_cycle_assets
    FOR EACH ROW EXECUTE FUNCTION generate_discrepancy_report();

-- 13e. Closing an audit cycle: lock it and flip confirmed-missing assets to Lost.
-- Exposed as a callable procedure so the "Close Audit Cycle" button maps to
-- one atomic call instead of the app hand-rolling multiple statements.
CREATE OR REPLACE FUNCTION close_audit_cycle(p_audit_cycle_id BIGINT, p_closed_by BIGINT) RETURNS VOID AS $$
BEGIN
    UPDATE audit_cycles
    SET status = 'Closed', closed_by = p_closed_by, closed_at = now()
    WHERE audit_cycle_id = p_audit_cycle_id;

    UPDATE assets a
    SET status = 'Lost'
    FROM audit_cycle_assets aca
    WHERE aca.audit_cycle_id = p_audit_cycle_id
      AND aca.asset_id = a.asset_id
      AND aca.verification_status = 'Missing';

    INSERT INTO asset_status_history (asset_id, to_status, reason, changed_by)
    SELECT aca.asset_id, 'Lost', 'Confirmed missing in audit cycle #' || p_audit_cycle_id, p_closed_by
    FROM audit_cycle_assets aca
    WHERE aca.audit_cycle_id = p_audit_cycle_id
      AND aca.verification_status = 'Missing';
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 14. SEARCH — trigram indexes for fast partial/fuzzy asset lookup
-- (Screen 4: search/filter by Asset Tag, Serial Number, QR code, ...)
-- =====================================================================
CREATE INDEX idx_assets_tag_trgm    ON assets USING gin (asset_tag gin_trgm_ops);
CREATE INDEX idx_assets_serial_trgm ON assets USING gin (serial_number gin_trgm_ops);
CREATE INDEX idx_assets_name_trgm   ON assets USING gin (name gin_trgm_ops);

-- =====================================================================
-- 15. REPORTING VIEWS
-- Pre-aggregated views backing the Dashboard (Screen 2) and Reports &
-- Analytics (Screen 9) so the frontend issues one simple SELECT instead
-- of re-deriving KPIs from raw tables on every page load.
-- =====================================================================

-- 15a. Dashboard KPI cards
CREATE OR REPLACE VIEW v_dashboard_kpis AS
SELECT
    (SELECT COUNT(*) FROM assets WHERE status = 'Available')                                   AS assets_available,
    (SELECT COUNT(*) FROM assets WHERE status = 'Allocated')                                    AS assets_allocated,
    (SELECT COUNT(*) FROM maintenance_requests
        WHERE status IN ('Technician Assigned','In Progress')
          AND technician_assigned_at::date = CURRENT_DATE)                                      AS maintenance_today,
    (SELECT COUNT(*) FROM resource_bookings WHERE status IN ('Upcoming','Ongoing'))              AS active_bookings,
    (SELECT COUNT(*) FROM transfer_requests WHERE status = 'Requested')                          AS pending_transfers,
    (SELECT COUNT(*) FROM asset_allocations
        WHERE status = 'Active' AND expected_return_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7) AS upcoming_returns;

-- 15b. Overdue allocations (feeds Dashboard + Notifications)
CREATE OR REPLACE VIEW v_overdue_allocations AS
SELECT a.allocation_id, a.asset_id, ast.asset_tag, ast.name AS asset_name,
       a.holder_employee_id, a.holder_department_id,
       a.expected_return_date, CURRENT_DATE - a.expected_return_date AS days_overdue
FROM asset_allocations a
JOIN assets ast ON ast.asset_id = a.asset_id
WHERE a.status = 'Active' AND a.expected_return_date < CURRENT_DATE;

-- 15c. Asset utilization — allocation days & booking count per asset
CREATE OR REPLACE VIEW v_asset_utilization AS
SELECT ast.asset_id, ast.asset_tag, ast.name,
       COUNT(DISTINCT al.allocation_id)                                          AS times_allocated,
       COALESCE(SUM(COALESCE(al.actual_return_date, CURRENT_DATE) - al.allocation_date), 0) AS total_days_allocated,
       COUNT(DISTINCT rb.booking_id)                                              AS times_booked
FROM assets ast
LEFT JOIN asset_allocations al ON al.asset_id = ast.asset_id
LEFT JOIN resource_bookings rb ON rb.asset_id = ast.asset_id AND rb.status = 'Completed'
GROUP BY ast.asset_id, ast.asset_tag, ast.name;

-- 15d. Maintenance frequency by category
CREATE OR REPLACE VIEW v_maintenance_frequency_by_category AS
SELECT ac.category_id, ac.name AS category_name, COUNT(mr.request_id) AS maintenance_count
FROM asset_categories ac
JOIN assets a ON a.category_id = ac.category_id
JOIN maintenance_requests mr ON mr.asset_id = a.asset_id
GROUP BY ac.category_id, ac.name;

-- 15e. Department-wise allocation summary
CREATE OR REPLACE VIEW v_department_allocation_summary AS
SELECT d.department_id, d.name AS department_name, COUNT(al.allocation_id) AS active_allocations
FROM departments d
LEFT JOIN asset_allocations al
       ON al.holder_department_id = d.department_id AND al.status = 'Active'
GROUP BY d.department_id, d.name;

-- 15f. Resource booking heatmap (bookings by day-of-week / hour-of-day)
CREATE OR REPLACE VIEW v_booking_heatmap AS
SELECT asset_id,
       EXTRACT(DOW FROM start_time)::INT  AS day_of_week,
       EXTRACT(HOUR FROM start_time)::INT AS hour_of_day,
       COUNT(*) AS booking_count
FROM resource_bookings
WHERE status IN ('Completed','Ongoing','Upcoming')
GROUP BY asset_id, day_of_week, hour_of_day;

-- =====================================================================
-- End of schema
-- =====================================================================
