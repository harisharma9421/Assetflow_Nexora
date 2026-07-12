# AssetFlow — Database Schema Documentation

**Target engine:** PostgreSQL 14+
**Companion file:** `assetflow_schema.sql`

This document explains *why* the schema is shaped the way it is, not just what
the tables are. It's written for judges/reviewers who want to see the
reasoning behind the design, and for teammates who need to build against it.

---

## 1. Design principles

1. **Business rules live in the database, not just the app.** Two rules are
   explicitly called out in the problem statement — no double-allocation of
   an asset, and no overlapping bookings for a resource. Both are enforced
   with native PostgreSQL constraints (a partial unique index and an
   `EXCLUDE` constraint), so they hold even if two requests race each other
   or a bug in the app layer forgets to check. This is the single
   highest-leverage design decision in the schema.
2. **Every workflow has a status enum and a history trail.** Assets,
   allocations, transfers, bookings, maintenance requests, and audit cycles
   all move through a fixed set of states. Each has a status column *and* an
   append-only history/log table, so "what happened and when" is always
   answerable without reconstructing it from timestamps scattered across
   other tables.
3. **Status transitions are automated with triggers, not app-side polling.**
   When a maintenance request is approved, the asset flips to
   `Under Maintenance` automatically. When an allocation is returned, the
   asset flips back to `Available` automatically. This removes an entire
   class of bugs where the UI and the database disagree about an asset's
   state.
4. **Reporting is pre-modeled as views, not left as an exercise for the
   frontend.** The Dashboard and Reports screens need aggregate numbers
   (KPI cards, utilization, heatmaps). Rather than have the frontend
   assemble these from raw tables on every page load, the schema ships SQL
   views that already do the joins/aggregation.
5. **Roles are never self-assigned.** `users.role_id` defaults to Employee
   at signup. The only way a user becomes a Department Head or Asset
   Manager is through an `UPDATE` performed by an Admin, and that mutation
   is itself logged (`promoted_by`, `promoted_at`).

---

## 2. Entity overview

| Table | Purpose |
|---|---|
| `roles` | Fixed catalogue: Admin, Asset Manager, Department Head, Employee |
| `departments` | Org units, with optional parent for hierarchy |
| `users` | Employee directory + login credentials + role/department |
| `password_reset_tokens` | Supports "forgot password" flow |
| `asset_categories` | Electronics, Furniture, Vehicles, ... |
| `category_custom_fields` | Optional per-category attributes (e.g. warranty period) |
| `asset_custom_field_values` | The actual per-asset values for those attributes |
| `assets` | The core asset record: tag, category, status, location, etc. |
| `asset_documents` | Photos / attachments per asset |
| `asset_status_history` | Immutable log of every lifecycle transition |
| `asset_allocations` | Who/what department currently holds an asset |
| `transfer_requests` | Requested → Approved → Re-allocated workflow |
| `resource_bookings` | Time-slot bookings of shared/bookable assets |
| `maintenance_requests` | Repair workflow: Pending → ... → Resolved |
| `maintenance_attachments` | Photos attached to a maintenance request |
| `audit_cycles` | A scoped, dated verification cycle |
| `audit_cycle_auditors` | Auditors assigned to a cycle (many-to-many) |
| `audit_cycle_assets` | Per-asset verification result within a cycle |
| `discrepancy_reports` | Auto-generated when an asset is flagged Missing/Damaged |
| `notifications` | Per-user alerts (overdue, approvals, reminders, etc.) |
| `activity_logs` | Generic "who did what, when" trail across all modules |

See `assetflow_schema.sql` §1–10 for full column definitions.

---

## 3. How the two conflict rules are enforced

### 3.1 No double-allocation

> "You can't allocate an asset that's already taken."

```sql
CREATE UNIQUE INDEX uq_one_active_allocation_per_asset
    ON asset_allocations(asset_id)
    WHERE status = 'Active';
```

This is a **partial unique index**: it only applies to rows where
`status = 'Active'`. An asset can have many *historical* (`Returned`) rows in
`asset_allocations`, but only ever one *Active* row. A second `INSERT` trying
to allocate an already-held asset fails at the database level — the app
catches that failure and surfaces the "currently held by Priya" message with
a Transfer Request button, exactly as described in the problem statement.

### 3.2 No overlapping bookings

> "Room B2 is booked 9:00–10:00. A 9:30–10:30 request is rejected; a
> 10:00–11:00 request is fine."

```sql
ALTER TABLE resource_bookings
    ADD CONSTRAINT excl_no_overlapping_bookings
    EXCLUDE USING gist (
        asset_id WITH =,
        tstzrange(start_time, end_time, '[)') WITH &&
    )
    WHERE (status IN ('Upcoming','Ongoing'));
```

This is an **`EXCLUDE` constraint** backed by a GiST index (`btree_gist`
extension). It says: for the same `asset_id`, no two rows may have
overlapping `[start_time, end_time)` ranges while their status is
`Upcoming` or `Ongoing`. The half-open range `'[)'` is what makes
back-to-back bookings (10:00–11:00 right after 9:00–10:00) legal — the
ranges touch but don't overlap. Cancelled/Completed bookings are excluded
from the check, so cancelling a slot immediately frees it up.

---

## 4. Status automation (triggers)

| Trigger | Fires on | Effect |
|---|---|---|
| `trg_generate_asset_tag` | `assets` insert | Auto-generates `AF-0001`, `AF-0002`, ... if not supplied |
| `trg_sync_asset_status_allocation` | `asset_allocations` insert/update | Asset → `Allocated` on allocate, → `Available` on return |
| `trg_sync_asset_status_maintenance` | `maintenance_requests` update | Asset → `Under Maintenance` on approval, → `Available` on resolution |
| `trg_sync_asset_status_booking` | `resource_bookings` insert/update | Asset → `Reserved` while a booking is upcoming/ongoing, → `Available` after |
| `trg_generate_discrepancy` | `audit_cycle_assets` update | Auto-inserts a `discrepancy_reports` row when an item is marked Missing/Damaged |
| `close_audit_cycle(...)` (function) | Called by the "Close Audit Cycle" action | Locks the cycle and flips confirmed-missing assets to `Lost`, with a history entry |

Every trigger that changes `assets.status` also writes a row to
`asset_status_history`, so the per-asset history view (Screen 4) is always
complete without extra app-side bookkeeping.

---

## 5. Reporting views

These map directly onto Screens 2 and 9 of the problem statement, so the
frontend can bind to a single `SELECT * FROM v_...` instead of composing
joins on every page load:

| View | Backs |
|---|---|
| `v_dashboard_kpis` | Dashboard KPI cards (available, allocated, maintenance today, active bookings, pending transfers, upcoming returns) |
| `v_overdue_allocations` | Dashboard "overdue" section + overdue-return notifications |
| `v_asset_utilization` | Reports: most-used vs. idle assets |
| `v_maintenance_frequency_by_category` | Reports: maintenance frequency by category |
| `v_department_allocation_summary` | Reports: department-wise allocation summary |
| `v_booking_heatmap` | Reports: resource booking heatmap (day-of-week × hour-of-day) |

---

## 6. Notable modeling decisions

- **`asset_allocations` uses a `holder_type` discriminator** (`Employee` /
  `Department`) with a `CHECK` constraint instead of two separate tables,
  because allocation, return, and transfer logic is identical either way —
  only *who* holds the asset differs.
- **`category_custom_fields` + `asset_custom_field_values`** is a small,
  deliberate EAV (entity-attribute-value) pattern. It's the one place in the
  schema that isn't strict 3NF, because the alternative — a new column or
  new table per category — doesn't scale as categories are added at runtime
  by an Admin.
- **`acquisition_cost` is stored on `assets` but never referenced by any
  other table.** This mirrors the problem statement's explicit instruction
  that cost is "kept for ranking/reports only, not linked to accounting" —
  the schema has no purchasing/invoicing tables on purpose.
- **Trigram (`pg_trgm`) indexes on `asset_tag`, `serial_number`, and
  `name`** support the fuzzy/partial search required by Screen 4 (search by
  tag, serial, QR code, etc.) without needing a separate search service.
- **`activity_logs.details` is `JSONB`**, not fixed columns, since the shape
  of "what changed" differs per action type (an allocation log entry looks
  nothing like a booking cancellation log entry).

---

## 7. What was intentionally left out

- No purchasing, invoicing, or accounting tables — explicitly out of scope
  per the problem statement.
- No dedicated "resources" table separate from `assets` — a bookable
  resource *is* an asset with `is_bookable = true`, since the same physical
  item (e.g. a projector) can be both allocated *and* booked over its
  lifetime, and duplicating it into two tables would require constant
  syncing.
- No materialized views — the reporting views are plain views for
  correctness-first simplicity. If dashboard read latency becomes a problem
  at scale, they can be swapped to `MATERIALIZED VIEW` + a refresh job with
  no change to the application layer.
