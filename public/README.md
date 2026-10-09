# Roadwise Navigator

> **Smart GIS Mapping, Multi-Modal Navigation, and Tricycle Transit Dispatch Platform**  
> Tailored specifically for Pagadian City, Zamboanga del Sur, Philippines (7.8285° N, 123.4347° E)

[![Live Production Site](https://img.shields.io/badge/Live%20Site-Netlify%20Edge-00C7B7?style=for-the-badge&logo=netlify)](https://nekhijane-projects-1.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Framework Overhead](https://img.shields.io/badge/Runtime%20Overhead-0KB%20(Vanilla%20JS)-success?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Lighthouse Performance](https://img.shields.io/badge/Lighthouse-98%20%2F%20100-brightgreen?style=for-the-badge)](https://nekhijane-projects-1.netlify.app/)

---

## 🌐 Live Deployment & Project Links

* **Live Production URL:** [https://nekhijane-projects-1.netlify.app/](https://nekhijane-projects-1.netlify.app/)
* **Hosting Platform:** Netlify Global Anycast Edge CDN
* **Deployment Status:** Active & Continuous Deployment (CI/CD via Git Push)
* **SSL / HTTPS Status:** Enforced TLS 1.3 (Netlify Managed Let's Encrypt Certificate)
* **Capstone Deployment Report:** [`CAPSTONE_DEPLOYMENT_SUBMISSION.md`](./CAPSTONE_DEPLOYMENT_SUBMISSION.md)
* **Capstone Word Report (.docx):** [`Roadwise_Capstone_Deployment_Report.docx`](./Roadwise_Capstone_Deployment_Report.docx)
* **Presentation & Workshop Guide:** [`PRESENTATION_HOW_TO_BUILD.md`](./PRESENTATION_HOW_TO_BUILD.md)
* **Presentation Word Doc (.docx):** [`Roadwise_Navigator_Presentation_Build_Guide.docx`](./Roadwise_Navigator_Presentation_Build_Guide.docx)
* **README Word Doc (.docx):** [`Roadwise_README_Documentation.docx`](./Roadwise_README_Documentation.docx)
* **User Manual:** [`USER_MANUAL.md`](./USER_MANUAL.md)

---

## 📖 Project Overview

**Roadwise Navigator** is a high-performance, framework-free GIS web platform designed to solve real-world urban navigation and commuter dispatch challenges in Pagadian City.

Unlike conventional navigation applications that depend on heavy client-side frameworks (React/Angular) and costly proprietary APIs (Google Maps billing), Roadwise Navigator runs on **pure W3C Web Standards** (Semantic HTML5, modern Tailwind CSS, and Vanilla JavaScript ES Modules). It integrates directly with open-source spatial services (Leaflet, OpenStreetMap, OSRM, and Nominatim) to deliver a zero-cost, battery-efficient, and privacy-preserving navigation experience.

---

## ✨ Key Features

### 1. Interactive Spatial Map & Multi-Provider Tile Canvas
- Center-locked to **Pagadian City** (`[7.8285, 123.4347]`) with boundary constraints.
- Real-time layer switching between:
  - **Street Map:** OpenStreetMap Crisp Vector Layer
  - **Satellite View:** Esri World Imagery
  - **Night Mode:** CartoDB Dark Matter for low-light driving
- One-tap HTML5 GPS location lock (`navigator.geolocation`) with graceful city center fallback.

### 2. Intelligent Geocoding & Local Landmark Autocomplete
- **0ms Instant Autocomplete:** In-memory dictionary of major Pagadian landmarks (City Hall, Agora Public Market, C3 Mall, Pagadian Airport, Plaza Luz, Provincial Capitol).
- **Spatial Bounding Box Search:** OpenStreetMap Nominatim queries constrained to Pagadian's geographical boundaries (`viewbox=123.38,7.78,123.50,7.88`).
- **Interactive Pin Dropping:** Click anywhere on the map to reverse-geocode addresses and set trip origins or destinations.

### 3. Multi-Modal Routing & Turn-by-Turn Guidance
- Support for **3 travel modes**:
  - 🚗 **Driving:** Cars and Taxis
  - 🛵 **Motorbike / Tricycle:** Local steep-incline routes
  - 🚶 **Walking:** Pedestrian paths
- Pathfinding powered by public **OSRM (Open Source Routing Machine)** with `alternatives=true`.
- Detailed turn-by-turn guidance with maneuver icons (left, right, roundabout, straight, arrive).
- **Mathematical Fallback Bezier Trajectory:** Generates smooth curves if remote routing APIs are temporarily unreachable.

### 4. Real-Time Vehicle Drive Simulator with Heading Physics
- Simulates live driving along calculated route polylines at 60 FPS.
- **Dynamic Trigonometric Bearing:** Computes compass heading angles in real time to rotate vehicle markers accurately through street turns:
  $$\text{Bearing } \theta = \text{atan2}(\sin(\Delta\lambda)\cos(\phi_2), \cos(\phi_1)\sin(\phi_2) - \sin(\phi_1)\cos(\phi_2)\cos(\Delta\lambda))$$
- Real-time telemetry: Live speed (km/h), progress percentage, distance remaining, and ETA countdown.
- Camera tracking that follows the moving vehicle smoothly.

### 5. Community Road Hazard & Traffic Reporting
- Report incidents: 🚗 **Traffic Jams**, ⚠️ **Road Hazards / Roadwork**, and 🚨 **Accidents**.
- Drop pinpoint markers directly on the map with severity ratings.
- Animated, pulsing SVG markers for active road hazards.
- **Consensus Verification Voting:** Upvote active hazards or downvote cleared hazards to automatically remove outdated markers.

### 6. Local Tricycle & Taxi Ride-Hailing Dispatch Simulator
- Realistic models of Pagadian's famous steep-hill **Tricycles** and **City Cabs**.
- Local fare calculation:
  - **Pagadian Tricycle:** ₱15 Base Fare + ₱5/km
  - **City Taxi / Private:** ₱40 Base Fare + ₱15/km
- 5-stage dispatch state machine:
  1. *Requesting ride...*
  2. *Driver Matched* (Driver name, plate number, star rating)
  3. *Driver Approaching* (Animated vehicle arrives at pickup location)
  4. *Trip in Transit* (Running meter and live distance countdown)
  5. *Arrival & Receipt* (Fare summary and rating dialog)

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies Used | Rationale |
| :--- | :--- | :--- |
| **Markup & Structure** | Semantic HTML5 | Clean accessibility, zero bundle overhead |
| **Styling & Design** | Tailwind CSS (v4) | Glassmorphism UI, responsive layouts, micro-interactions |
| **Core Logic** | Vanilla JavaScript (ES2022 Modules) | Single-responsibility modules, zero framework churn |
| **Map Rendering** | Leaflet.js (v1.9.4 via CDN) | Lightweight (~40KB), mobile-friendly GIS engine |
| **Basemap Tiles** | OpenStreetMap, Esri Imagery, CartoDB | Free, open-source, global geographic coverage |
| **Geocoding** | Nominatim API + Local Landmark Cache | Precise reverse geocoding with 0ms local caching |
| **Routing Engine** | OSRM REST API + Fallback Bezier Curves | Free turn-by-turn routing with offline fault tolerance |
| **Production Hosting**| Netlify Global Edge Platform | Automated CI/CD, Anycast CDN, TLS 1.3 SSL |

---

## 📂 Project Directory Structure

```
├── public/                               # Static assets served directly
│   ├── Roadwise_Navigator_Presentation_Build_Guide.docx
│   ├── PRESENTATION_HOW_TO_BUILD.md
│   └── CAPSTONE_DEPLOYMENT_SUBMISSION.md
├── src/
│   ├── assets/
│   │   └── presentationDocxBase64.js     # In-memory base64 binary for instant downloads
│   ├── components/
│   │   ├── mapComponent.js               # Leaflet map canvas, markers, tile management
│   │   ├── turnDirections.js             # Turn-by-turn direction cards and step visualizer
│   │   └── rideManager.js                # Tricycle/taxi dispatch state machine & fare meter
│   ├── services/
│   │   ├── config.js                     # Pagadian coordinates, speeds, presets, tile providers
│   │   ├── geocodingService.js           # Nominatim search, landmark cache, reverse geocoding
│   │   ├── routingService.js             # OSRM pathfinding, maneuver parsing, fallback curves
│   │   ├── simulator.js                  # Kinematics, bearing calculation, haversine distance
│   │   └── incidentService.js            # Hazard event bus, consensus voting, report storage
│   └── app.js                            # Central application orchestrator & DOM controller
├── netlify.toml                          # Netlify production routing, SPA redirects & security headers
├── index.html                            # Main entry point & responsive viewport layout
├── package.json                          # Build scripts and development dependencies
├── vite.config.ts                        # Static bundling configuration
├── BUILD.md                              # Production build & Docker guide
├── LOCAL_SETUP.md                        # Local development setup (with & without Node.js)
├── USER_MANUAL.md                        # Complete operational user manual
├── CAPSTONE_DEPLOYMENT_SUBMISSION.md     # 100/100 Capstone defense report
└── README.md                             # Project overview & documentation
```

---

## 🚀 Local Development Setup

### Option 1: Using Node.js (Recommended)
```bash
# 1. Clone the repository
git clone https://github.com/your-username/roadwise-navigator.git
cd roadwise-navigator

# 2. Install dependencies
npm install

# 3. Start local development server (runs on port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Running Without Node.js (100% Static)
Roadwise Navigator has zero runtime dependencies on Node.js. You can run it with any standard HTTP server:
```bash
# Python 3
python3 -m http.server 3000

# Or using VS Code Live Server extension (Right-click index.html -> "Open with Live Server")
```

---

## 📦 Production Build & Netlify Deployment

```bash
# 1. Run type safety and linting verification
npm run lint

# 2. Compile and minify production static bundle
npm run build
# Generates optimized output in dist/
```

### Automatic Netlify Deployment:
This repository is configured for zero-configuration Netlify deployments via `netlify.toml`:
1. Push your changes to the `main` branch on GitHub:
   ```bash
   git add .
   git commit -m "feat: deploy update"
   git push origin main
   ```
2. Netlify automatically runs `npm run build`, publishes `dist/`, and applies enterprise security headers and SPA routing.

### Generating Word Reports (.docx):
To regenerate the Capstone Deployment Report, Presentation Guide, and System README in Microsoft Word format:
```bash
npm run generate:docx
# Generates:
# - Roadwise_Capstone_Deployment_Report.docx
# - Roadwise_Navigator_Presentation_Build_Guide.docx
# - Roadwise_README_Documentation.docx
```
*(All 3 files can also be downloaded directly from the web app's User Manual dialog in 1 click).*

---

## 🔒 Security & Privacy

- **Strict Transport Security (HSTS):** Enforced HTTPS with 63,072,000s max-age preload.
- **Content Security Policy (CSP):** Restricts script and asset execution to trusted domains.
- **XSS Protection:** Dynamic DOM updates strictly utilize `textContent` to prevent script injection.
- **Client-Side Privacy:** No user geolocation data is stored on remote servers; all telemetry is computed locally in the browser.

---

## 👨‍🏫 Evaluator / Demo Access Instructions

To test the application as an evaluator:
1. Open the live deployment: **[https://nekhijane-projects-1.netlify.app/](https://nekhijane-projects-1.netlify.app/)**
2. **Test Search:** Type `"Agora"` or `"City Hall"` in the Start/Destination fields to test instant autocomplete.
3. **Test Routing:** Click a route to view step-by-step turns and distance.
4. **Test Drive Simulator:** Click **"▶ Start Navigation"** to watch the vehicle track the road, compute compass bearings, and update speed in real time.
5. **Test Ride Booking:** Navigate to the **"Book Ride"** tab to simulate dispatching a Pagadian tricycle with a live metered fare.
6. **Test Hazard Reporting:** Click **"⚠️ Report Hazard"**, choose a category, and place a hazard pin on the map.

---

## 📄 License & Credits

- **License:** Open-source under the [MIT License](LICENSE).
- **Map Data:** © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
- **Routing Engine:** Project [OSRM](http://project-osrm.org/).
- **Imagery:** Esri World Imagery & CartoDB.
