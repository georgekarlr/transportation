# Build & Deployment Guide: Roadwise Navigator

This document explains how to build, test, package, and deploy **Roadwise Navigator** for production environments.

---

## 1. Prerequisites

To build the application using the automated bundling pipeline:
- **Node.js**: Version `18.0.0` or higher (LTS recommended)
- **npm**: Version `9.0.0` or higher (comes with Node.js)

You can verify your versions by running:
```bash
node -v
npm -v
```

---

## 2. Quick Build Steps

### Step 1: Clone or Open the Repository
Open a terminal in the root directory of the project.

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run Syntax & Type Verification (Linting)
```bash
npm run lint
```
This runs `tsc --noEmit` to verify code integrity across all JavaScript and configuration files without generating output files.

### Step 4: Run Production Build
```bash
npm run build
```
This executes Vite's build command (`vite build`).

---

## 3. Build Output Structure

Once the build completes, a self-contained, optimized static bundle is generated in the **`dist/`** directory:

```
dist/
├── index.html                  # Minified entry point
├── assets/
│   ├── index-[hash].js         # Bundled & minified ES module logic
│   └── index-[hash].css        # Purged and minified Tailwind & custom CSS
└── ...
```

### Key Optimizations Performed:
- **CSS Tree-Shaking**: Tailwind CSS purges all unused utility classes, reducing the stylesheet size.
- **Minification**: JavaScript and HTML are minified, removing comments, whitespace, and debug logs.
- **Fingerprinted Assets**: Files in `assets/` include cache-busting content hashes (`[name]-[hash].js`) for seamless client-side browser caching.

---

## 4. Testing the Production Build Locally

Before deploying to live hosting, you can preview the exact contents of the `dist/` folder:

```bash
npm run preview
```
This starts Vite's local preview web server (usually at `http://localhost:4173/`).

Alternatively, test `dist/` with Python or npx:
```bash
# Using Python
python3 -m http.server --directory dist 8080

# Or using serve
npx serve dist -p 8080
```

---

## 5. Deployment Options

The output inside `dist/` is **100% static** (no server-side runtime, no backend language required). You can deploy it to any cloud host or web server.

### Option A: Vercel
1. Install Vercel CLI (`npm i -g vercel`) or connect your GitHub repository in the Vercel Dashboard.
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Click **Deploy**.

---

### Option B: Netlify
1. Connect your repository to Netlify.
2. Build settings:
   - **Base directory**: `.` (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Click **Deploy Site**.

*Manual drag-and-drop:* You can also drag the generated `dist/` folder directly into [Netlify Drop](https://app.netlify.com/drop).

---

### Option C: GitHub Pages (Automated GitHub Action)
Create a file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

### Option D: Docker (Nginx Alpine)
To package Roadwise into a lightweight, secure Docker container:

Create a `Dockerfile` in the root:
```dockerfile
# Step 1: Build static assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine-slim
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run the container:
```bash
docker build -t roadwise-navigator:latest .
docker run -d -p 8080:80 roadwise-navigator:latest
```
Access the application at `http://localhost:8080`.

---

### Option E: Traditional Nginx Server
If serving on an Ubuntu/Debian server:
1. Copy the contents of `dist/` to `/var/www/roadwise`:
   ```bash
   sudo mkdir -p /var/www/roadwise
   sudo cp -r dist/* /var/www/roadwise/
   ```
2. In your Nginx site configuration (`/etc/nginx/sites-available/roadwise`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       root /var/www/roadwise;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, no-transform";
       }
   }
   ```
3. Test and reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 6. Configuration & Custom Endpoints

If you want to configure or point to your own self-hosted routing (OSRM) or geocoding servers, edit **`/src/services/config.js`**:

```javascript
export const APP_CONFIG = {
  // Center of operation (Pagadian City)
  DEFAULT_CENTER: [7.8285, 123.4347],
  DEFAULT_ZOOM: 14,

  // Routing API endpoint
  OSRM_BASE_URL: 'https://router.project-osrm.org',

  // Geocoding API endpoint
  NOMINATIM_BASE_URL: 'https://nominatim.openstreetmap.org',
  
  // ...
};
```
Any changes made to `config.js` are baked into the bundle when `npm run build` is executed.

---

## 7. Troubleshooting Build Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `vite: command not found` | Dependencies not installed | Run `npm install` |
| `Port 3000 in use` | Another server running | Stop previous process or use `npm run dev -- --port 3001` |
| `TypeError during build` | Syntax error | Run `npm run lint` to inspect file & line number |
| White screen on production | Incorrect relative base path | If hosting on a subfolder (e.g. `user.github.io/repo/`), set `base: './'` in `vite.config.ts` |
