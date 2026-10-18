# Deploying to Hostinger (shared hosting — no VPS)

This monorepo splits into two deployables:

| Part | How it's hosted on Hostinger | Plan needed |
| --- | --- | --- |
| **Frontend** (`apps/web`) | **Static files** uploaded to `public_html` | Any plan |
| **Backend API** (`apps/api`) | A **Node.js app** (hPanel → Setup Node.js App) | Premium / Business / Cloud |
| **Database** | **MySQL** (hPanel → Databases) | Any plan |

We'll use `yourdomain.com` for the site and a subdomain `api.yourdomain.com` for the API.

> The frontend is a client-side SPA, so it exports to plain HTML/CSS/JS — no Node
> needed for the website itself. Only the API needs Node.js.

---

## Step 1 — Create the MySQL database

1. hPanel → **Databases → MySQL Databases**.
2. Create a database (e.g. `u123_artrust`), a database user, and a strong password.
3. Note the **database name, user, password, and host** (host is usually `localhost`).

---

## Step 2 — Create the API subdomain

1. hPanel → **Domains → Subdomains** → create `api.yourdomain.com`.
2. Enable **SSL** for it later (hPanel → SSL).

---

## Step 3 — Deploy the API as a Node.js app

1. hPanel → **Advanced → Node.js** → **Create application**:
   - **Node version:** 20.x
   - **Application root:** upload the repo and point here to the **repo root** (so the
     `@ar-trust/shared` workspace links correctly)
   - **Application URL:** `api.yourdomain.com`
   - **Application startup file:** `apps/api/dist/server.js`
2. Upload the project (Git, or File Manager / SFTP) into the application root.
3. Open the app's **terminal** (hPanel gives one) and run from the repo root:
   ```bash
   npm install
   npm run build -w @ar-trust/api
   npm run db:generate -w @ar-trust/api
   ```
4. Create **`apps/api/.env`**:
   ```
   DATABASE_URL="mysql://DBUSER:DBPASS@localhost:3306/DBNAME"
   CORS_ORIGIN="https://yourdomain.com"
   JWT_SECRET="put-a-long-random-string-here"
   JWT_EXPIRES_IN="7d"
   NODE_ENV=production
   ```
   (Hostinger sets `PORT` automatically; the server already reads `process.env.PORT`.)
5. Create the tables and seed the login users:
   ```bash
   npm run prisma:deploy -w @ar-trust/api      # creates tables (migrate deploy)
   npm run prisma:seed   -w @ar-trust/api      # admin + demo users
   npm run prisma:seed:data -w @ar-trust/api   # (optional) rich demo data
   ```
6. In the Node.js app page, set the **startup file** to `apps/api/dist/server.js` and click **Restart**.
7. Test: open `https://api.yourdomain.com/health` → should return `{"ok":true,"data":"healthy"}`.

---

## Step 4 — Build the frontend (static)

On your computer (recommended) or the server:

1. Point the frontend at your live API — create **`apps/web/.env.local`**:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```
2. Build the static site from the repo root:
   ```bash
   npm run build:web:static
   ```
3. This produces **`apps/web/out/`** — a complete static website.

> The API URL is baked in at build time. If you change it, rebuild.

---

## Step 5 — Upload the frontend

1. hPanel → **File Manager** → open **`public_html`** (the main domain's folder).
2. Upload **everything inside `apps/web/out/`** into `public_html`:
   `index.html`, `_next/`, `media/`, `.htaccess`, `404.html`, …
   (Easiest: zip the *contents* of `out/`, upload the zip, then Extract.)
3. The included **`.htaccess`** makes deep links like `/dashboard` work (SPA fallback).
4. Visit `https://yourdomain.com` → the site loads. Log in with your seeded admin
   (`admin` / `admin123` — **change this password**).

---

## Step 6 — Final checks

- [ ] `https://api.yourdomain.com/health` returns ok
- [ ] `CORS_ORIGIN` in the API `.env` exactly matches your site origin (`https://yourdomain.com`)
- [ ] `NEXT_PUBLIC_API_URL` used at build time matches the API URL
- [ ] SSL enabled for **both** `yourdomain.com` and `api.yourdomain.com`
- [ ] Changed the seeded admin password (and `JWT_SECRET` is long & random)

---

## If your plan has NO Node.js support

The API must run on Node. Either upgrade to a Business/Cloud plan, **or** host just the
API for free on Render / Railway (both give Node + a URL), create a MySQL there or use
Hostinger's MySQL with remote access, and set `NEXT_PUBLIC_API_URL` to that API URL.
The static frontend still goes on Hostinger exactly as above.

---

## Updating later

- **Frontend change:** rebuild `npm run build:web:static`, re-upload `out/` to `public_html`.
- **Backend change:** upload code, `npm run build -w @ar-trust/api`, run `prisma:deploy`
  if the schema changed, then **Restart** the Node.js app.
