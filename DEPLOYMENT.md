# 🚀 AR Trust Travel & Tourism - Production Deployment Guide

This project is fully prepared for multi-platform deployment across any cloud hosting service, VPS, Docker container, or serverless provider.

---

## 📁 Included Deployment Configuration Files

| File | Purpose | Target Platforms |
| :--- | :--- | :--- |
| [`deploy.zip`](file:///e:/office/AR-Trust-Travel-ERP-System/deploy.zip) | Ready-to-upload zip bundle for Hostinger public_html | Hostinger hPanel, cPanel |
| [`Dockerfile`](file:///e:/office/AR-Trust-Travel-ERP-System/Dockerfile) | Multi-stage production build + Nginx Alpine image | Docker, Kubernetes, AWS ECS, GCP Cloud Run, CapRover, Coolify |
| [`docker-compose.yml`](file:///e:/office/AR-Trust-Travel-ERP-System/docker-compose.yml) | One-command containerized production run | Any Linux VPS (Ubuntu/Debian), DigitalOcean, Hetzner |
| [`nginx.conf`](file:///e:/office/AR-Trust-Travel-ERP-System/nginx.conf) | Nginx config with Gzip, SPA rewrites & security headers | Nginx on VPS, Docker |
| [`vercel.json`](file:///e:/office/AR-Trust-Travel-ERP-System/vercel.json) | Vercel zero-config with clean URLs and SPA rewrites | Vercel |
| [`netlify.toml`](file:///e:/office/AR-Trust-Travel-ERP-System/netlify.toml) | Netlify build & 200 redirect rules | Netlify |
| [`public/_redirects`](file:///e:/office/AR-Trust-Travel-ERP-System/public/_redirects) | Fallback SPA routing rule for static hosts | Cloudflare Pages, Netlify, Render Static |
| [`public/.htaccess`](file:///e:/office/AR-Trust-Travel-ERP-System/public/.htaccess) | LiteSpeed/Apache SPA rewrites, Gzip & caching | Hostinger, Apache, cPanel |
| [`server.js`](file:///e:/office/AR-Trust-Travel-ERP-System/server.js) | Express production server for Node.js environments | Render, Railway, Heroku, cPanel Node.js |

---

## 🟣 Option 1: Deploy on Hostinger (Using `deploy.zip`)

Follow these simple steps to deploy on Hostinger Web Hosting:

1. Log in to your **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Go to **Websites** and click **Manage** on your domain.
3. In the sidebar or search, open **File Manager** (Files -> File Manager).
4. Navigate into the **`public_html`** directory.
5. (Optional) If there is a default Hostinger `default.php` file, delete or move it.
6. Click the **Upload** icon at the top right, select **File**, and upload **`deploy.zip`**.
7. Once uploaded, right-click on `deploy.zip` and click **Extract**.
8. Select the destination as `.` or `/public_html` (extract directly inside `public_html`).
9. Delete the `deploy.zip` file after extracting.
10. **Done!** Your website and ERP system are now live at your domain with full SPA routing (`.htaccess`), browser caching, and compression automatically active!

---

## ⚡ Option 1: Deploy on Vercel (Recommended & Easiest)

1. Push your repository to **GitHub** / **GitLab** / **Bitbucket**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Settings are automatically detected from [`vercel.json`](file:///e:/office/AR-Trust-Travel-ERP-System/vercel.json):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**. Your website is live with global SSL in under 1 minute!

---

## ⚡ Option 2: Deploy on Netlify

1. Push your repository to **GitHub**.
2. Go to [netlify.com](https://netlify.com) and select **"Add new site"** -> **"Import an existing project"**.
3. Connect your repository.
4. Build settings are auto-detected from [`netlify.toml`](file:///e:/office/AR-Trust-Travel-ERP-System/netlify.toml):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy Site"**.

---

## 🐳 Option 3: Deploy with Docker / Docker Compose (Any VPS)

To deploy on any Linux VPS (Ubuntu, Debian, etc.):

### Step 1: Install Docker & Docker Compose (if not already installed)
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
```

### Step 2: Clone & Launch
```bash
git clone <YOUR_REPO_URL>
cd AR-Trust-Travel-ERP-System

# Start production container in background
docker compose up -d --build
```

### Step 3: Verify
Visit your VPS IP address in the browser: `http://<YOUR_VPS_IP>`.

To view container logs or stop:
```bash
# View logs
docker compose logs -f

# Stop container
docker compose down
```

---

## 🟢 Option 4: Deploy on Render / Railway / Node.js Host

1. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
2. Set the following build and start commands:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start` (Runs [`server.js`](file:///e:/office/AR-Trust-Travel-ERP-System/server.js))
3. Environment variables:
   - `PORT`: (Auto-provided by the host, defaults to 3000)
   - `NODE_ENV`: `production`

---

## 🌐 Option 5: Deploy to Apache / cPanel or Static Hosting

1. Run the local build command:
   ```bash
   npm run build
   ```
2. Upload the entire contents of the **`dist/`** folder into your cPanel `public_html/` directory.
3. For Apache servers, ensure an `.htaccess` file exists inside `public_html/` with the following rewrite rule:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## 🔒 Production Verification Checklist
- [x] Tested production build with `npm run build` (Status: PASSED in 0.9s).
- [x] Client-side SPA routing fallback enabled for `/dashboard`, `/login`, `/tours`, `/fleet`.
- [x] Gzip compression enabled for all static assets.
- [x] 1-year immutable cache-control headers for images, CSS, and JS.
- [x] Security headers configured (X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
