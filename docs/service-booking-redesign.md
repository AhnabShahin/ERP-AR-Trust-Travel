# AR Trust — Service, Fleet & Booking Workflow Redesign (Design Spec)

Status: **DRAFT for review** · Author: Claude · Date: 2026-10-27

This is the design to review **before** any code is written. Approve or mark up each
section; I'll build in the phases at the bottom once it's signed off.

Decisions already made with you:
- The service/trip record **extends the existing `Booking` model** (no separate table).
- We produce **this design doc first**, then build.

---

## 1. Goals

1. **Driver type** — every driver is `first-party` or `third-party`.
2. **Decouple drivers from vehicles** — Drivers and Vehicles are two independent
   lists; no free-text vehicle on a driver. A vehicle is picked **per trip**.
3. **Service/trip entries** for the 3 service types — **Tour Service, Tour Package,
   Transfer** — each logged with customer + assigned driver + assigned vehicle.
4. **Auto occupancy** — starting a trip marks its driver **and** vehicle "On Trip"
   (can't be double-booked); completing it auto-releases them.
5. **Booking → Invoice** relations completed (a service produces an invoice slip).
6. **Reports Center** holds all reports (P&L moves here; menu already removed).

---

## 2. Data model changes

### 2.1 `Driver` (`drivers`)
| Change | Field | Notes |
|---|---|---|
| **add** | `driverType String @default("first-party")` | `first-party` \| `third-party` |
| **add** | `company String?` | third-party company/vendor name |
| **remove** | `vehicle`, `plateNumber`, `vehicleType` | the free-text vehicle fields go away |
| keep | `fleetVehicleId String?` | optional **default/home** vehicle (not the trip assignment) |
| keep/normalize | `status` | `Available` \| `On Trip` \| `Standby` \| `Off Duty` \| `Maintenance` |

### 2.2 `FleetVehicle` (`fleet_vehicles`)
| Change | Field | Notes |
|---|---|---|
| **add** | `status String @default("Available")` | `Available` \| `On Trip` \| `Maintenance` \| `Reserved` |
| **add** | `ownership String @default("owned")` | `owned` \| `third-party` (so a 3rd-party driver's car lives here — **see open Q1**) |
| keep | `assignedDriverId?` | optional default pairing only |

### 2.3 `Booking` (`bookings`) — now the unified service/trip record
| Change | Field | Notes |
|---|---|---|
| **add** | `serviceType String @default("tour-service")` | `tour-service` \| `tour-package` \| `transfer` (defaulted from the chosen catalog item's `serviceType`) |
| **add** | `vehicleId String?`, `vehicleName String?`, `vehiclePlate String?` | the vehicle assigned **for this trip** (replaces `driverVehicle` text) |
| **add** | `tripStatus String @default("Scheduled")` | `Scheduled` \| `On Trip` \| `Completed` \| `Cancelled` \| `No Show` |
| **add** | `scheduledStart DateTime?`, `scheduledEnd DateTime?`, `startedAt DateTime?`, `completedAt DateTime?` | trip window + actual times |
| **add** | `customerId String?` | link to `Guest` (CRM) |
| keep | `driverId/driverName/driverPhone`, `guideId/guideName` | assignment stays |
| keep | `qrStatus` | **voucher / check-in** state — separate concern from `tripStatus` |
| deprecate | `driverVehicle` | superseded by `vehicleId/vehicleName`; filled for back-compat then dropped |

> **`qrStatus` vs `tripStatus`:** `qrStatus` = the guest voucher/check-in lifecycle
> (pending → checked-in …). `tripStatus` = the operational trip lifecycle
> (Scheduled → On Trip → Completed). They move independently.

### 2.4 New `TripStatusLog` (`trip_status_logs`) — the service-entry timeline
So you can later see *when which service was taken / assigned / completed*:
```
id, bookingId, serviceType, fromStatus, toStatus,
driverId?, vehicleId?, actorId?, actorName?, note?, at DateTime
```
(The `Booking` row is the primary entry; this table is its lifecycle log, used for reports.)

### 2.5 `Invoice` (`invoices`) — relations completed
- Already has `bookingId`, `bookingPnr`, `source` (Manual | Booking). We complete the
  flow: a completed/confirmed booking can **generate an invoice** (items from the
  service + extras), and invoice payments stay in sync with the booking.

---

## 3. Status lifecycle & occupancy automation

**Booking.tripStatus:**
```
Scheduled ──dispatch──▶ On Trip ──complete──▶ Completed
    │                      │
    └──────cancel──────────┴──────────────▶ Cancelled
Scheduled ──no-show──▶ No Show
```

**Occupancy side-effects (the automation):**
- **Dispatch → On Trip:** set `driver.status = On Trip` and `vehicle.status = On Trip`.
- **Assignment guard:** a driver/vehicle already `On Trip` **cannot** be assigned to
  another overlapping trip — enforced in the API, and the assignment dropdowns only
  list **Available** drivers/vehicles.
- **Complete / Cancel / No Show:** release driver → `Standby`, vehicle → `Available`
  (only if they have no other still-active trip).
- Source of truth = active bookings; `driver.status`/`vehicle.status` are the cached
  display value, recomputed on every transition and written to `TripStatusLog`.

---

## 4. Workflows

1. **Create Transfer** (New Booking / Agent Desk / Unified Bookings): pick service
   (`transfer`) → customer → schedule → assign **Available** driver + **Available**
   vehicle → save (`Scheduled`). Dispatch → `On Trip` (occupies both). Complete →
   releases both, updates guest totals, offers invoice.
2. **Tour Service / Tour Package**: same flow; driver/vehicle optional, guide optional.
3. **Booking → Invoice**: generate on confirm/complete; payments reconcile both ways.
4. **Reporting feed**: every booking carries serviceType, tripStatus, driver, vehicle,
   customer, amounts, timestamps → Reports Center.

---

## 5. Backend changes
- Prisma migration for §2 (on Windows: stop the API dev server before `prisma migrate`).
- `bookings.service`: `assign`, `dispatch`, `complete`, `cancel` transitions with
  occupancy validation + auto driver/vehicle status + `TripStatusLog` writes.
- `drivers` / `fleet`: `status` fields + an **available** query.
- `invoices`: `generate-from-booking`.
- `reports.service`: add serviceType breakdown + driver/vehicle utilization.

## 6. Frontend changes
- **Fleet view**: Drivers tab (no vehicle text; shows type + status) and Vehicles tab
  (shows status) — fully separate. Add-driver form loses vehicle fields; gains type.
- **New Booking / Unified Bookings**: service-type selector; driver + vehicle dropdowns
  filtered to Available; dispatch/complete/cancel actions on a booking.
- **Reports Center**: report cards (below).
- (Done already: Financial Reports & P&L menu removed; Passenger Slips removed.)

## 7. Reports Center — proposed report set
Revenue by service type · Bookings/trips log (filterable by type & status) ·
Driver utilization & trips · Vehicle utilization · **P&L** (moved here) ·
Accounts-receivable / outstanding invoices · Commissions · EOD/cash reconciliation.

---

## 8. Phased build plan
- **Phase 1** — Schema migration + API (driver type, vehicle decouple, Vehicle.status,
  Booking service/trip fields, TripStatusLog, transition endpoints).
- **Phase 2** — Drivers/Vehicles UI decoupled + type + status.
- **Phase 3** — Service/booking create + assignment + occupancy automation + lifecycle.
- **Phase 4** — Booking→Invoice relations.
- **Phase 5** — Reports Center reports.

Each phase: build → type-check → verify in browser → show you → next.

---

## 9. Open questions (please confirm)
1. **Third-party driver's vehicle:** a 3rd-party driver who brings their own car — do we
   record that car as a **Fleet vehicle with `ownership: third-party`** (my assumption),
   or should a driver be allowed a lightweight "own vehicle" note? (Keeping it in Fleet
   keeps the two lists clean and lets occupancy work.)
2. **Default pairing:** keep the optional "home/default vehicle" on a driver (pre-selects
   in the trip form but editable), or no pairing at all?
3. **Invoice generation:** auto-create the invoice when a booking is **completed**, or
   only on a manual "Generate Invoice" click? (I lean: manual button + optional auto.)
4. **Reports set** in §7 — anything to add or drop?
