# AR Trust Travel ERP — Data Readiness Audit & Go-Live Checklist

> **Scope:** What data must be collected, configured and imported to launch this
> system from a clean MySQL database for AR Trust Travel & Tourism.
> **Method:** Static analysis only — Prisma schema, API modules, CRUD registry,
> services, seed/scripts, env files and frontend config. No code was modified.
> **Database driver:** MySQL (Prisma 6). **Schema:** `apps/api/prisma/schema.prisma` (31 models).

---

## Section 1 — Project Overview

**What it is.** A travel & tourism ERP + public website for **AR Trust Travel &
Tourism W.L.L.** (Doha, Qatar). It runs the company's airport-transfer / tour
desk operation end to end: walk-in and OTA bookings, driver & vehicle dispatch,
hotel-desk reservations, multi-currency cash/finance, invoicing, payroll/commission
for desk staff, a CRM, and a public marketing website driven by an editable CMS.

**Architecture** (from memory + `apps/`):
- `apps/api` — standalone Express + Prisma (MySQL) REST API on port 4400 (`:4000` default in env). Evidence: `apps/api/src/app.ts`, `apps/api/src/config/env.ts`.
- `apps/web` — Next.js dashboard + public site on port 3000. Evidence: `apps/web/.env.example` (`NEXT_PUBLIC_API_URL`).

**Major modules discovered** (`apps/api/src/app.ts`, `modules/resources.ts`):
Auth/Users · Roles · Staff (payroll ledger) · Bookings/Trips · Invoices · Reports ·
Notifications · Fleet · Drivers · Tour Guides · Guests/CRM · Guest Tiers ·
Hotel Vendors & Hotel Bookings · Expenses · Currencies & Currency History ·
Tour Packages · Service Categories · Locations · Airport Desks · Desk Assignments ·
Salary Records · Commission Rules · Platforms (OTA channels) · Payment Accounts ·
Reviews · Site Content (CMS) · Uploads · App Settings (key/value config).

**Scope & limitations.** FK relationships are mostly *logical* — stored as plain
string ids with **no database foreign keys** (only `Location→AirportDesk` and
`User→StaffLedgerEntry` are real Prisma relations). So referential integrity is
enforced in app logic / UI, not the DB. Union/enum fields are `String` columns
validated at the API with Zod (see `modules/resources.ts`, `bookings.controller.ts`).
This audit could not execute the app, so "application-required but DB-nullable"
calls are marked and a few runtime-only behaviours are flagged **Unverified**.

---

## Section 2 — Executive Summary

- **Total models/tables:** 31.
- **Client-provided master datasets (mandatory or near-mandatory):** 8 core —
  Users/Staff, Fleet Vehicles, Tour Guides, Hotel Vendors, Tour Packages & Services,
  Locations, Airport Desks, Payment Accounts. Plus Guests (CRM) and Platforms (OTA).
- **System configuration datasets:** 6 — App Settings (profiles, rates, POS maps),
  Service Categories, Guest Tiers, Commission Rules, Currencies, Site Content (CMS).
- **Conditional initial operational datasets:** 6 — open Bookings/Trips, active
  Hotel Bookings, outstanding Invoices, current Desk Assignments, current-month Staff
  Ledger, and opening balances (Payment Accounts / currency cash vaults).
- **System-generated (do NOT collect):** 7 — Uploads, Notifications, System Audit
  Logs, Trip Status Logs, Currency History, Salary Records (derived), plus all
  auto ids / numbers / timestamps.
- **Excluded historical:** completed/cancelled bookings, paid invoices, past hotel
  bookings, trip logs, currency history, notifications, audit logs, old payroll.

### Critical blockers / must-resolve before go-live
1. **The seed already contains AR Trust's real master data.** `apps/api/prisma/seed.ts`
   **wipes every table** and loads 13 fleet vehicles, 5 hotels, 17 OTA platforms,
   7 staff, 4 currencies, 6 tours + 3 packages, 6 reviews, 4 guest tiers, 3 airport
   desks, 3 drivers and the super-admin. **Decide: run the seed (accept/curate the
   baked-in data) OR start empty and import collected data.** Running the seed on a
   live DB destroys existing rows.
2. **Two parallel "staff" models.** The seed writes 7 rows to the legacy `employees`
   table (`seedStaff`), but the Staff screen reads **users with `role = staff`**
   (`modules/staff/staff.routes.ts`). After a seed the Staff screen is **empty**.
   A migration script exists (`scripts/migrate-employees-to-staff.ts`). Resolve which
   model is authoritative before collecting staff data. **(Confirmed inconsistency.)**
3. **Two parallel "driver" models.** A `drivers` table + `/api/drivers` CRUD exist,
   but the seed and trip workflow treat drivers as **users with `role = driver-guide`**
   (`seed.ts seedDrivers`, `bookings.service.ts transition` updates `user.staffStatus`).
   Confirm drivers are managed as users, not the `drivers` table. **(Confirmed inconsistency.)**
4. **Every created account starts `inactive`** and must be activated by an admin before
   it can log in (`auth.service.ts`, `users.routes.ts`, `staff.routes.ts`; only the
   seeded super-admin + 3 drivers are created `active`). Plan an activation pass after import.

---

## Section 3 — Mandatory Client Data

For each entity: purpose, required fields (application-level), key constraints,
dependencies. Field type key — `str`=string, `num`=number, `int`=integer,
`bool`=true/false, `json`=list/object. "Client?" = must the client supply it.
Audit columns (`createdBy/createdByName/updatedBy/updatedByName`) and
`id/createdAt/updatedAt` are **system-stamped — never collect** (`crud.factory.ts`
`stampAudit`; ids are cuid defaults).

### 3.1 Users / Staff / Drivers — `users` table
Single source of truth for every login: admins, operations, finance, transit agents,
**drivers (`driver-guide`)**, **desk staff (`staff`)**, vendor-partners, customers.
Created via `/api/users` (admin only) or `/api/staff` (staff shape). Super-admin is
**command-created only** (`scripts/create-superadmin.ts`) and cannot be set here.

| Field | Meaning | Type | Required? | Client? | Default / Auto | Constraints | Example |
|---|---|---|---|---|---|---|---|
| name | Full name | str | **Required** | Yes | — | — | `Tariq Al-Sulaiti` |
| username | Login handle | str | **Required** | Yes | lowercased | **unique** | `tariq.s` |
| email | Login / contact email | str | **Required** | Yes | lowercased | **unique** | `tariq@artrust.qa` |
| password | Initial password | str | Conditional | Optional | `changeme123` (users) / `staff12345` (staff) | ≥6 on self-signup | — |
| role | Access role | enum | **Required** | Yes | `customer` | one of role keys¹ | `transit-agent` |
| status | Account state | enum | Auto | No | `inactive` | `active`\|`inactive`; activate after import | `inactive` |
| phone | Phone | str | Optional | Yes | — | — | `+974 5527 8092` |
| nameAr | Arabic name | str | Optional | Yes | — | — | — |
| department | Dept / assignment | str | Optional | Yes | — | — | `Airport Operations — Day Shift` |
| jobTitle | Staff job title | str | Conditional (staff) | Yes | — | — | `Airport Representative` |
| driverType | Driver sourcing | str | Conditional (driver) | Yes | — | `first-party`\|`third-party` | `first-party` |
| companyName | 3rd-party company | str | Conditional | Yes | — | — | — |
| licenseNumber / licenseCategory / experienceYears | Driver license | str/str/int | Optional | Yes | — | — | — |
| spokenLanguages | Languages | json | Optional | Yes | — | string[] | `["English","Arabic"]` |
| hireDate | Hire date (staff) | str | Conditional (staff) | Yes | — | yyyy-mm-dd | `2026-01-15` |
| baseSalaryMonthlyQAR | Monthly base pay | num | Conditional (staff) | Yes | `0` | — | `4500` |
| monthlyServiceTarget | Monthly target | int | Conditional (staff) | Yes | `0` | — | `120` |
| commissionPerServiceQAR | Commission/service | num | Conditional (staff) | Yes | `0` | — | `15` |
| assignedAirport / assignedDeskId / assignedDeskName | Desk posting (staff) | str | Optional | Yes | — | should match a desk | — |
| nationality, passportNumber, passportExpiry, address, city, country, dietaryNotes, emergencyContact, emergencyPhone, preferredLanguage, bio, avatar | Profile extras | str/img | Optional | Yes | — | — | — |

¹ Role keys (`modules/roles/roles.data.ts`): `super-admin`, `admin`,
`operations-manager`, `transit-agent`, `driver-guide`, `finance-accountant`,
`vendor-partner`, `staff`, `customer`. **Roles & permissions are fixed in code — no
table, nothing to collect.** `super-admin` cannot be assigned via the API.

### 3.2 Fleet Vehicles — `fleet_vehicles`
The transport assets, also shown on the website. `/api/fleet` (public read).

| Field | Meaning | Type | Required? | Client? | Constraints / Notes | Example |
|---|---|---|---|---|---|---|
| name | Display name | str | **Required** | Yes | — | `Toyota Coaster` |
| category | Vehicle class | str | **Required** | Yes | free text | `Coaster 22 Pax` |
| passengers | Seat capacity | int | **Required** | Yes | — | `22` |
| luggage | Luggage capacity | int | **Required** | Yes | — | `7` |
| priceQAR | Rate | num | **Required** | Yes | — | `1500` |
| rateType | Rate basis | str | **Required** | Yes | e.g. `Per Trip` | `Per Trip` |
| features | Feature tags | json | **Required** | Yes | string[] | `["White","Model year 2022"]` |
| image | Photo ref | str | **Required** | Yes | `/api/uploads/<id>` or `/media/<f>` | `/media/toyota-coaster.jpg` |
| idealFor | Short blurb | str | **Required** | Yes | — | `Up to 22 passengers` |
| make / model / color / modelYear | Registry detail | str | Optional | Yes | — | `Toyota / Coaster / White / 2022` |
| plateNumber | Plate | str | Optional | Yes | — | `124547` |
| ownership | Owned vs hired | str | Optional | Yes | `owned`\|`third-party` (def `owned`) | `owned` |
| status | Availability | str | Optional | Yes | `Available`\|`On Trip`\|`Maintenance`\|`Reserved` (def `Available`) | `Available` |
| assignedDriverId / assignedDriverName | Home driver | str | Optional | Yes | should be a **user id** (driver) | — |
| showOnWebsite | Public listing | bool | Optional | Yes | def `true` | `true` |

### 3.3 Tour Guides — `tour_guides`
Only if the company assigns named guides. `/api/tour-guides`.

| Field | Type | Required? | Client? | Constraints | Example |
|---|---|---|---|---|---|
| name | str | **Required** | Yes | — | `Noor Al-Huda` |
| phone | str | **Required** | Yes | — | `+974 ...` |
| languages | json | **Required** | Yes | string[] | `["English","Arabic"]` |
| specialty | str | **Required** | Yes | — | `Heritage tours` |
| status | str | **Required** | Yes | `Assigned`\|`Available`\|`On Tour` | `Available` |
| nameAr, rating, toursLedToday, totalCommissionQAR | str/num | Optional | No/derived | counters default 0 | — |

### 3.4 Hotel Vendors — `hotel_vendors`
Partner hotels for hotel-desk bookings. `/api/hotel-vendors`.

| Field | Type | Required? | Client? | Constraints | Example |
|---|---|---|---|---|---|
| name | str | **Required** | Yes | — | `The Royal Riviera Hotel` |
| locationZone | str | **Required** | Yes | — | `Doha` |
| starRating | int | **Required** | Yes | 0–5 (seed uses 0 when unknown) | `5` |
| contactPerson | str | **Required** | Yes | desk rep | `Arafat` |
| contactPhone | str | **Required** | Yes | — | `+974 7011 9084` |
| contactEmail | str | **Required** | Yes | may be empty string in seed | — |
| address | str | **Required** | Yes | — | `Doha, Qatar` |
| contractStatus | str | **Required** | Yes | e.g. `Active` | `Active` |
| commissionRate | num | Optional | Yes | % (def 0) | `12` |
| desks / roomOptions / amenities | json | **Required** | Yes | arrays (may be `[]`) | `[]` |
| imageUrl, notes | str | Optional | Yes | — | — |
| totalBookings, totalRevenueQAR | num | Optional | No (derived) | def 0 | — |

> **Dependency:** `locations` resort rows and resort desks derive from hotel vendors
> (`scripts/seed-locations.ts`), so **load hotel vendors before** running location seeding.

### 3.5 Tour Packages & Services — `tour_packages`
Sellable tours + multi-day packages; also the website catalogue. `/api/tour-packages` (public read).

| Field | Type | Required? | Client? | Constraints | Example |
|---|---|---|---|---|---|
| name | str | **Required** | Yes | — | `Doha City Tour & Dhow Cruise` |
| category | str | **Required** | Yes | should match a Service Category | `City Tour` |
| duration | str | **Required** | Yes | — | `5 Hours` |
| priceQAR | num | **Required** | Yes | — | `250` |
| description | str | **Required** | Yes | — | — |
| includes | json | **Required** | Yes | string[] | `["Private AC vehicle", ...]` |
| serviceType | str | Optional | Yes | `Tour Service`\|`Tour Package`\|`Transfer Service` | `Tour Package` |
| isMultiDay / days / nights | bool/int | Conditional | Yes | for holiday packages | `true / 3 / 2` |
| highlights / excluded | json | Optional | Yes | string[] | — |
| image, badge, groupSize, departure, pickupLocation, nameAr, descriptionAr | str | Optional | Yes | image ref | — |
| originalPriceQAR, rating, reviewCount | num | Optional | Yes/derived | — | — |
| isFeatured / showOnWebsite | bool | Optional | Yes | def false / true | `true` |

### 3.6 Locations — `locations`
Airports + resorts; the desk "location" dropdown. `/api/locations` or `scripts/seed-locations.ts`.

| Field | Type | Required? | Client? | Constraints | Example |
|---|---|---|---|---|---|
| name | str | **Required** | Yes | — | `Hamad International Airport` |
| type | str | **Required** | Yes | `airport`\|`resort` | `airport` |
| code | str | **Required** | Yes | **unique** (IATA / short code) | `DOH` |
| city, address, nameAr | str | Optional | Yes | — | `Doha` |
| hotelVendorId | str | Conditional | Yes | resort → a hotel vendor id | — |
| active | bool | Optional | Yes | def `true` | `true` |

### 3.7 Airport / Hotel Desks — `airport_desks`
Physical sales desks. `/api/airport-desks`.

| Field | Type | Required? | Client? | Constraints | Example |
|---|---|---|---|---|---|
| airportCode | str | **Required** | Yes | matches a Location code | `DOH` |
| airportName | str | **Required** | Yes | — | `Hamad International Airport (DOH)` |
| deskCode | str | **Required** | Yes | **unique** | `HIA-CTR-04` |
| deskName | str | **Required** | Yes | — | `Main Arrivals Counter 4` |
| terminal | str | **Required** | Yes | — | `Terminal 1 - Arrivals Hall` |
| status | str | **Required** | Yes | e.g. `Active` | `Active` |
| locationId | str | Optional | Yes | a Location id (back-filled by script) | — |
| zone, shiftTiming, phoneExt, operatingHours, deskType, hotelName, hotelVendorId, deskNameAr, notes | str | Optional | Yes | — | — |
| dailyTargetQAR, currentDrawerCashQAR | num | Optional | Yes | opening drawer → §4 | — |
| assignedEmployeeId / Name / Role | str | Optional | Yes | should reference a real staff user | — |

### 3.8 Payment Accounts — `payment_accounts`
Bank/cash/wallet accounts used to record invoice payments. `/api/payment-accounts`.

| Field | Type | Required? | Client? | Constraints | Example |
|---|---|---|---|---|---|
| title | str | **Required** | Yes | — | `Qatar Bank` |
| openingDate | str | **Required** | Yes | yyyy-mm-dd | `2026-01-01` |
| currency | str | Optional | Yes | def `QAR` | `QAR` |
| openingBalance | num | Optional | Yes | def 0 → §4 | `50000` |
| currentBalance | num | Optional | No | auto-bumped on payments | — |
| accountNumber, note | str | Optional | Yes | — | — |
| isActive, sortOrder | bool/int | Optional | Yes | def true / 0 | — |

### 3.9 Guests (CRM) — `guests`  *(near-mandatory; see §4 for "skip" conditions)*
Repeat/VIP customer directory. `/api/guests`.

| Field | Type | Required? | Client? | Constraints | Example |
|---|---|---|---|---|---|
| name | str | **Required** | Yes | — | — |
| nationality | str | **Required** | Yes | — | — |
| phone | str | **Required** | Yes | — | — |
| email | str | **Required** | Yes | — | — |
| vipTier | str | **Required** | Yes | should match a Guest Tier name | `VIP Gold` |
| passportNo, specialPreferences, lastArrivalAirport, lastFlight, lastTripDate | str | Optional | Yes | — | — |
| totalBookings, totalSpentQAR | num | Optional | No (derived) | def 0 | — |

### 3.10 Platforms (OTA channels) — `platforms`
Booking sources (Trip Advisor, GetYourGuide, taxi aggregators…). `/api/platforms`.

| Field | Type | Required? | Client? | Constraints | Example |
|---|---|---|---|---|---|
| name | str | **Required** | Yes | — | `GetYourGuide` |
| type | str | **Required** | Yes | `tour`\|`airport-transfer` | `tour` |
| contactPhone, website, notes | str | Optional | Yes | — | — |
| isActive, sortOrder | bool/int | Optional | Yes | def true / 0 | — |

---

## Section 4 — Optional & Conditional Data

### Conditional **initial operational** data (collect only current/open records)
| Dataset | Table | Why it may be needed | When to SKIP |
|---|---|---|---|
| Open bookings / trips | `bookings` | In-flight trips (`tripStatus` Scheduled/On Trip) must continue | Skip all completed/cancelled/no-show — those are history |
| Active hotel bookings | `hotel_bookings` | Guests arriving/checked-in after cutover | Skip checked-out stays |
| Outstanding invoices | `invoices` | Unpaid/partial AR you still need to collect | Skip fully paid invoices |
| Current desk assignments | `desk_assignments` | Today's/this week's shift roster | Skip past rosters |
| Current-month staff ledger | `staff_ledger_entries` | So this month's salary/commission is accurate | Skip prior months |
| Opening balances | `payment_accounts.openingBalance`, `currency_items.cashVaultBalance`, `airport_desks.currentDrawerCashQAR` | Finance/cash reconciliation starts correct | Skip if finance starts fresh at zero |

> **Booking create constraints** (`bookings.controller.ts`): if you import open
> bookings, each needs a **unique `pnr`**, a **valid-email `passengerEmail`**, and
> `passengerPhone`, `nationality`, `flightNumber`, `arrivalAirport`, `arrivalTime`,
> `packageId`, `packageName`, `paymentMethod`. `driverId`/`vehicleId` should reference
> real user/fleet ids. Trip status transitions are guarded (Scheduled→On Trip→Completed).

### Optional / can be added later
- **Reviews** (`reviews`) — website testimonials; seed ships 6. Optional for launch.
- **Currency History** (`currency_history`) — audit of rate changes; generated as rates change.
- **Salary Records** (`salary_records`) — payroll summary; derivable/entered later.
- **Commission Rules** (`commission_rules`) — commission policy; configure when payroll goes live.
- **Notifications** — generated at runtime.

---

## Section 5 — System-Generated & Developer-Configured Data

### System-generated — DO NOT request from the client
| Data | Table / Field | Evidence |
|---|---|---|
| Primary keys | all `id` | `@default(cuid())` |
| Timestamps | `createdAt`, `updatedAt` | `@default(now())` / `@updatedAt` |
| Audit stamps | `createdBy/Name`, `updatedBy/Name` | `crud.factory.ts` `stampAudit` from the JWT user |
| Invoice number | `invoices.invoiceNumber` | `nextInvoiceNumber()` from `INV-260001` |
| Invoice public token | `invoices.publicToken` | `crypto.randomBytes` |
| Trip status logs | `trip_status_logs` | written on every transition |
| Uploads (binary) | `uploads` | created by `/api/uploads` on image upload |
| Audit log | `system_audit_logs` | runtime activity |
| Driver/vehicle occupancy | `user.staffStatus`, `fleet.status` | flipped by `bookings.service transition` |

### Developer / deployment configuration (not a client spreadsheet)
From `apps/api/.env.example`, `env.ts`, `uploads.routes.ts`, `seed.ts`, `apps/web/.env.example`:

| Variable | Purpose | Notes |
|---|---|---|
| `DATABASE_URL` | MySQL connection | `mysql://user:pass@host:port/db` |
| `JWT_SECRET` | Token signing | **long random secret — secure, not a spreadsheet** |
| `JWT_EXPIRES_IN` | Token TTL | def `7d` |
| `PORT` | API port | def 4000 (runs on 4400 locally per project convention) |
| `CORS_ORIGIN` | Allowed web origin | the public web URL in prod |
| `NODE_ENV` | Env mode | `production` for live |
| `UPLOAD_DIR` | Image storage dir | def `<api>/uploads`; **persist/back up this folder** |
| `NEXT_PUBLIC_API_URL` (web) | API base URL | must be browser-reachable in prod |
| `SUPERADMIN_NAME/USERNAME/EMAIL/PASSWORD` | Bootstrap super-admin | used by `create-superadmin` / seed |
| `DRIVER_PASSWORD` | Seeded driver default pwd | change after first login |

> Default dev secret `dev-insecure-secret-change-me` and seed passwords
> (`ArTrust@2026`, `Driver@2026`, `changeme123`, `staff12345`) **must be changed**.

---

## Section 6 — Excluded Legacy & Historical Data

Do **not** migrate these from any previous system (not required to operate):
`trip_status_logs`, `currency_history`, `notifications`, `system_audit_logs`,
completed/cancelled/no-show `bookings`, paid `invoices`, checked-out `hotel_bookings`,
historical `salary_records`, historical `staff_ledger_entries` (prior months),
and all `uploads` belonging to deleted records.

**Exceptions to keep:** current/unpaid rows in each operational table (see §4) and
the **current month** of the staff ledger. **`reviews`** are legacy-ish website
testimonials — optional; keep only if you want them displayed.

---

## Section 7 — Relationships & Import Order

Logical dependency graph (most are soft string-id links, enforced in UI/logic):

```
Developer config (.env, DB) ──► super-admin (command) ──► Users (admins/finance/ops)
Currencies ─► App Settings (rates, profiles, POS maps)
Service Categories ─► Tour Packages/Services
Guest Tiers ─► Guests
Hotel Vendors ─► Locations(resorts) ─► Airport/Hotel Desks ─► Desk Assignments
Users(driver-guide) ─► Fleet Vehicles(assignedDriver)
Users(staff) ─► Staff Ledger (current month)
Payment Accounts ─► Invoices(payments)
[Packages + Users(driver) + Fleet + Desks + Guests] ─► Open Bookings ─► Invoices(from booking)
```

**Recommended entry/import order:**
1. Deploy & env config; `create-superadmin`.
2. Currencies → App Settings (invoice/agency profile, rates, POS category maps).
3. Service Categories, Guest Tiers, Commission Rules.
4. Users (admins, ops, finance, transit agents), then **Drivers (role `driver-guide`)**, then **Staff (role `staff`)**.
5. Hotel Vendors → **run `seed-locations` / add Locations** → Airport & Hotel Desks.
6. Fleet Vehicles (link `assignedDriverId` to driver users).
7. Tour Packages & Services; Platforms (OTA); Payment Accounts (+ opening balances); Guests.
8. Site Content (CMS) + Reviews (optional).
9. **Activate** every account that needs to log in.
10. Conditional: current Desk Assignments, current-month Staff Ledger, open Bookings, active Hotel Bookings, outstanding Invoices.

**Relationship types to collect as mappings:** Fleet→Driver (vehicle's home driver),
Desk→Location, Desk→Staff (assigned employee), Resort Location→Hotel Vendor,
Guest→Guest Tier (by tier name), Booking→(Package, Driver, Vehicle, Guest, Desk).

---

## Section 8 — Client Data Collection Workbook (copy-ready CSV headers)

Prepare one sheet per dataset. **Do not add an `id` column** unless you want to
pin ids (the system generates cuid ids; a client-supplied `id` is honoured if sent).
Columns below are importable field names; omit system/derived fields.

```csv
# users_staff.csv (one row per login: admins, finance, ops, agents, drivers, staff)
name,username,email,role,phone,nameAr,department,jobTitle,driverType,companyName,licenseNumber,licenseCategory,experienceYears,hireDate,baseSalaryMonthlyQAR,monthlyServiceTarget,commissionPerServiceQAR,assignedAirport,assignedDeskName,nationality

# fleet_vehicles.csv
name,category,passengers,luggage,priceQAR,rateType,features,image,idealFor,make,model,color,modelYear,plateNumber,ownership,status,assignedDriverName,showOnWebsite

# tour_guides.csv
name,nameAr,phone,languages,specialty,status

# hotel_vendors.csv
name,nameAr,locationZone,starRating,contactPerson,contactPhone,contactEmail,address,contractStatus,commissionRate,amenities,imageUrl,notes

# tour_packages.csv
name,nameAr,category,serviceType,duration,priceQAR,description,includes,isMultiDay,days,nights,highlights,excluded,image,badge,groupSize,departure,pickupLocation,originalPriceQAR,isFeatured,showOnWebsite

# locations.csv
name,nameAr,type,code,city,address,hotelVendorCode,active

# airport_desks.csv
airportCode,airportName,deskCode,deskName,deskNameAr,terminal,zone,status,shiftTiming,phoneExt,operatingHours,deskType,hotelName,dailyTargetQAR,assignedEmployeeName,assignedEmployeeRole,notes

# payment_accounts.csv
title,openingDate,currency,openingBalance,accountNumber,note,isActive,sortOrder

# guests.csv
name,nationality,phone,email,vipTier,passportNo,specialPreferences

# platforms.csv
name,type,contactPhone,website,notes,isActive,sortOrder

# service_categories.csv
name,nameAr,serviceType

# guest_tiers.csv  (defaults are seeded; override only if different)
name,nameAr,discountPercentage,badgeColor,minSpendQAR,description

# commission_rules.csv  (optional / payroll)
targetRole,ruleDescription,type,rateValue,unit,appliesTo

# currencies.csv  (base QAR seeded; supply your live rates)
code,name,symbol,rateToQAR,isPegged,peggedNote,bankAccount,cashVaultBalance
```

**Relationship / mapping templates:**
```csv
# map_fleet_to_driver.csv   (vehicle's default/home driver)
vehiclePlate,driverName

# map_desk_to_staff.csv     (who staffs each desk)
deskCode,staffName,staffRole

# map_desk_to_location.csv
deskCode,locationCode
```

**JSON / list field formats** (cells that hold arrays):
- `features`, `amenities`, `includes`, `highlights`, `excluded`, `languages`,
  `spokenLanguages` → semicolon- or JSON-array list, e.g. `English; Arabic`
  or `["English","Arabic"]` (import script normalises to a JSON array).

**Config entered in the app (not CSV)** — App Settings via `/api/settings/<key>`
or the Settings screen: `invoiceProfile` (company name, address, TRN, license,
logo, signature, VAT %, prefix — code default in `invoiceShared.ts`), `agencyProfile`,
`rates` (seeded), `activeCurrency`, `packageCategories` & `categoryServiceMap`
(code defaults exist — not blockers), `shiftDrawer`, `whatsappTemplate`.
**Site Content** (29 CMS keys) and **images** are entered via the dashboard CMS /
upload UI, not a spreadsheet.

Formats accepted: Excel or CSV for the sheets above; app settings & CMS via the UI.

---

## Section 9 — Go-Live Readiness Checklist

**Deployment & config**
- [ ] MySQL provisioned; `DATABASE_URL` set; `prisma migrate deploy` run (11 migrations).
- [ ] `JWT_SECRET` set to a strong random value; `CORS_ORIGIN` + `NEXT_PUBLIC_API_URL` = real URLs.
- [ ] `UPLOAD_DIR` on persistent, backed-up storage.
- [ ] **Decision made on the seed** (run & curate AR Trust data, vs. start empty & import).
- [ ] `create-superadmin` run; default seed passwords changed.

**Master data**
- [ ] Users loaded for every real person who logs in; roles correct.
- [ ] **Driver-model decision applied** (drivers as `driver-guide` users).
- [ ] **Staff-model decision applied** (`employees` table vs `staff` users resolved; migration run if needed).
- [ ] Fleet, Tour Guides, Hotel Vendors, Tour Packages/Services, Platforms, Payment Accounts loaded.
- [ ] Locations + Desks loaded; `seed-locations` run so desks have `locationId`.
- [ ] Service Categories match package categories; Guest Tiers present; Guests loaded (if used).

**Configuration**
- [ ] Currencies + live `rates` set; `activeCurrency` chosen.
- [ ] `invoiceProfile` filled (company name, TRN, license, logo, signature, VAT %, prefix).
- [ ] POS `packageCategories` / `categoryServiceMap` verified (defaults fine, confirm anyway).
- [ ] Site Content (CMS) + images reviewed on the public site.

**Operational cutover**
- [ ] Opening balances entered (payment accounts, currency vaults, desk drawers).
- [ ] Current desk assignments + current-month staff ledger entered.
- [ ] Open bookings / active hotel bookings / outstanding invoices imported (unique PNRs, valid emails).
- [ ] **Every login account activated** (status → `active`).

**Validation tests**
- [ ] Log in as each role; role dashboards load.
- [ ] Create a booking, assign driver+vehicle, run Scheduled→On Trip→Completed.
- [ ] Generate an invoice, record a payment, open the public `/invoice/<token>` page.
- [ ] Public website shows fleet, packages, reviews, CMS content.

---

## Section 10 — Uncertainties & Questions (confirm with developer / owner)

1. **Seed strategy:** run `seed.ts` (wipes DB, loads baked-in AR Trust data) or start empty and import collected data? The two must not be mixed on a live DB.
2. **Driver model:** confirm drivers are managed as **users (`driver-guide`)** and the `drivers` table / `/api/drivers` is unused/legacy. *(Code strongly implies users; `drivers` table appears orphaned.)*
3. **Staff model:** confirm the **`users role=staff` + staff ledger** path is authoritative and the `employees` table / `/api/employees` is legacy. Should `migrate-employees-to-staff.ts` run after any employee import? *(Seed populates `employees`, Staff screen reads users — confirmed mismatch.)*
4. **Account activation:** is there a bulk-activate path, or must each imported account be activated individually in the UI?
5. **App Settings with no seeded value** (`agencyProfile`, `activeCurrency`, `shiftDrawer`, `whatsappTemplate`, `invoiceProfile`): confirm code defaults are acceptable for launch or supply real values. **Unverified** at runtime.
6. **Seeded placeholder data** in `seed.ts` (3 airport desks with fake `assignedEmployeeId` like `emp-101`, starRating 0 hotels, demo tour copy/prices): keep, edit, or replace?
7. **PNR generation** for walk-in bookings — who/what produces the unique PNR (agent-entered vs. generated elsewhere)? Not auto-generated in `bookings.service`.
8. **Service Categories vs package `category`:** is the category→service mapping manual in Settings, and must categories be created before packages reference them?

---

## Section 12 — Evidence Index (key references)

- Schema / all 31 tables & constraints: `apps/api/prisma/schema.prisma`.
- CRUD contract, audit stamping, public-read flag: `apps/api/src/lib/crud.factory.ts`, `apps/api/src/modules/resources.ts`.
- Roles (fixed, code-only): `apps/api/src/modules/roles/roles.data.ts`.
- Account creation / inactive default / super-admin rules: `apps/api/src/modules/auth/auth.service.ts`, `modules/users/users.routes.ts`, `scripts/create-superadmin.ts`.
- Staff ↔ users mapping: `apps/api/src/modules/staff/staff.routes.ts`.
- Booking/trip logic, occupancy, transitions: `apps/api/src/modules/bookings/bookings.service.ts` + `bookings.controller.ts`.
- Invoice numbering/token/totals: `apps/api/src/modules/invoices/invoices.service.ts`.
- Seed (what's pre-loaded + wipe): `apps/api/prisma/seed.ts`; locations: `scripts/seed-locations.ts`.
- Env / deployment: `apps/api/.env.example`, `apps/api/src/config/env.ts`, `uploads.routes.ts`, `apps/web/.env.example`.
- Settings keys & defaults: `apps/web/src/context/AppContext.tsx`, `components/invoices/invoiceShared.ts`, `components/views/SettingsView.tsx`.
