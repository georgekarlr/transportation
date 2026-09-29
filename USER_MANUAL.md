# Roadwise Navigator — User Manual & Technical Documentation

Welcome to **Roadwise Navigator**, a comprehensive Google Maps-style route finding and navigation application built with composable HTML5, CSS, and modern JavaScript.

---

## 1. Quick Start Guide

### 1.1 Setting an Origin and Destination
- **Default Origin**: Starts at the city center (Pagadian City, Philippines).
- **Use GPS**: Tap the **🎯 GPS** button to pinpoint your current live device position.
- **Search Destination**: Type into the **Where to?** input field. An autocomplete dropdown powered by OpenStreetMap Nominatim will suggest matching landmarks and street addresses.
- **Quick Preset Chips**: Tap any of the quick destination chips at the top:
  - 🏙️ **City Proper** (Central Business District)
  - ✈️ **Pagadian Airport (PAG)** (Muricay Airfield)
  - 🛒 **Agora Public Market** (Commercial & transport hub)
  - 🏥 **Zamboanga del Sur Medical Center** (Regional Hospital)
  - 🌳 **Plaza Luz & City Hall** (Civic Center)
  - 🛍️ **Gaisano Capital Mall** (Retail Center)
  - ⛵ **Pagadian Port Baywalk** (Illana Bay Coast)
  - 🚌 **Tiguma Bus Terminal** (Provincial Station)
- **Pin Directly on Map**: Click the 📍 button in the top-right tool ribbon and tap anywhere on the map to set a custom destination.
- **Draggable Pins**: Both the Origin pin (blue glowing pulse) and Destination pin (red drop marker) can be dragged anywhere on the map to re-route on the fly.
- **Swap Origin and Destination**: Click the **⇅** swap button to quickly invert the direction of travel.
- **In-App Guide**: Open the **📖 Guide** anytime to view quick tips. You can close it using the top **✕** button, the bottom **Got It** button, clicking outside the modal dialog, or pressing the **Escape** key.

---

## 2. Best Route Finding & Route Comparison

### 2.1 Multi-Route Comparison
Once origin and destination are specified, Roadwise queries the OpenStreetMap OSRM routing engine to calculate:
1. **Primary Route (Fastest)**: Highlighted in vibrant blue with travel duration, distance in km, and traffic status.
2. **Alternative Route(s)**: Shown in dashed lines and selectable via comparison cards to view alternative corridors (e.g., bypass or coastal roads).
3. **Interactive Route Switching**: Clicking either the route card or directly on any route line on the map immediately activates that route.

### 2.2 Travel Modes
Select between 5 distinct modes via the top mode selector:
- 🚗 **Drive**: Optimized road routing for private passenger cars.
- 🏍️ **Moto**: Motorcycle & Habal-habal mode with agile travel speeds.
- 🚕 **Cab / Taxi**: Metered taxi calculation with base and per-km fare breakdown.
- 🚲 **Bike**: Dedicated bicycle path and low-speed road calculation.
- 🚶 **Walk**: Pedestrian routing avoiding major highways where sidewalks are absent.

---

## 3. Turn-by-Turn Directions & Step Guidance

- Click **📋 View Steps** on any calculated route to expand the maneuver list.
- Each step displays:
  - Direction icon (turn left, turn right, straight, roundabout, arrive).
  - Explicit street name and maneuver instruction.
  - Step distance (in meters or kilometers).
- **Interactive Step Navigation**: Clicking any step in the list automatically flies and pans the map camera directly to that turn intersection.

---

## 4. Live Simulated Turn-by-Turn Navigation

- Tap **🧭 Start Navigation** to launch Google Maps-style guided navigation HUD:
  - **Top Navigation Banner**: Displays high-contrast green maneuver instruction ("In 200m, Turn Right onto Sanson St") with dynamic turn arrow.
  - **Animated Vehicle Marker**: Smoothly traverses along the road polyline, calculating heading angles (bearing) and rotating in the direction of travel.
  - **Live Speedometer**: Real-time speed indicator (e.g. 38–48 km/h).
  - **ETA & Distance Countdown**: Continuously tracks remaining distance and time.
  - **Simulation Speed**: Toggle between 1x, 2x, and 4x speed for quick previewing.
  - **Pause / Resume**: Freeze simulation at any time.
  - **Exit Navigation**: Safely returns to route overview.

---

## 5. Ride Booking (Motorcycle Habal-habal & Sedan Cab)

Preserved and elevated from the original Roadwise prototype:
- Tap **🚕 Book Ride for this Route** to open the booking panel.
- Choose between:
  - 🏍️ **Motorcycle** (Habal-habal — 1 seat, fast, dynamic fare).
  - 🚕 **Cab / Taxi** (Sedan — up to 4 seats, air-conditioned, metered fare).
- Tap to book:
  - Simulates driver dispatch with realistic matching spinner.
  - Matches nearby verified drivers (e.g. *Jun Santos - Honda TMX 125*, *Mark Villanueva - Toyota Vios*, *Ronnie Cruz*, etc.).
  - Displays driver rating, license plate number, and arrival countdown.
  - Includes quick in-trip road incident reporting and **End Trip** completion.

---

## 6. Live Traffic & Road Hazard Reporting

- Tap the **⚠️** button in the floating map toolbar or during an active trip:
  - 🚦 **Traffic Jam**: Heavy stop-and-go congestion.
  - 🚨 **Car Accident**: Collision blocking lanes.
  - ⚠️ **Road Hazard**: Potholes or debris on road.
  - 📷 **Speed Check**: Traffic enforcement monitor.
  - 🚧 **Roadwork / Closure**: Construction or road maintenance diversion.
- Reports instantly appear as interactive alert markers on the Leaflet map with tooltips and report counts.

---

## 7. Map Layers & View Customization

Switch base tile providers on the right toolbar:
- 🗺️ **Street**: Crisp OpenStreetMap vector tiles.
- 🛰️ **Satellite**: High-resolution Esri World Imagery.
- 🌙 **Dark**: Low-glare CartoDB dark basemap for night navigation.

---

## 8. Software Architecture & Composability

The application is built 100% in pure vanilla HTML5, CSS3, and modern modular JavaScript (ES Modules), with zero React runtime or dependencies:
- `index.html`: Pure semantic HTML structure and dialogs.
- `/src/index.css`: Tailwind utility rules and custom mapping styles.
- `/src/services/config.js`: City coordinates, travel mode profiles, presets, and tile providers.
- `/src/services/geocodingService.js`: OpenStreetMap Nominatim search, reverse geocoding, and geolocation.
- `/src/services/routingService.js`: OSRM route queries, alternative generation, step maneuvers parser, fallback curves.
- `/src/services/simulator.js`: Vehicle polyline interpolation, bearing calculation, speed telemetry, and event emitters.
- `/src/services/incidentService.js`: Road incident registry, community voting, and listener subscriptions.
- `/src/components/mapComponent.js`: Leaflet map orchestration, markers, dynamic route lines, and layer groups.
- `/src/components/turnDirections.js`: Turn-by-turn maneuver list and step highlight interactions.
- `/src/components/rideManager.js`: Ride dispatch lifecycle, driver pool, and fare calculators.
- `/src/app.js`: Root controller binding DOM elements, state transitions, and responsive events.

---

## 9. Running Locally

For complete step-by-step instructions on running Roadwise on your personal computer (with or without Node.js), please refer to [`LOCAL_SETUP.md`](./LOCAL_SETUP.md).

Quick options:
- **Without Node.js**: VS Code Live Server or Python HTTP server (`python3 -m http.server 8000`).
- **With Node.js**: Run `npm install` and `npm run dev` to launch on `http://localhost:3000`.

---

## 10. Building & Deploying for Production

For production bundling, minification, Docker containerization, and static hosting on Vercel, Netlify, GitHub Pages, or Nginx, refer to [`BUILD.md`](./BUILD.md).

Quick build command:
```bash
npm install
npm run build
```
Generates a production-ready static bundle in the `dist/` directory.

---

## 11. Engineering Story & How It Was Created

To understand how the application was planned, architected, and built from scratch (including the mathematical formulas for bearing, haversine distance, and coordinate interpolation), refer to [`HOW_IT_WAS_CREATED.md`](./HOW_IT_WAS_CREATED.md).

---

## 12. Presentation & Walkthrough Guide

To present or teach how this application was built step-by-step (with slide-by-slide breakdowns, speaker notes, architecture diagrams, and a live demonstration script), refer to [`PRESENTATION_HOW_TO_BUILD.md`](./PRESENTATION_HOW_TO_BUILD.md).

A formatted **Microsoft Word document (.docx)** version is also available:
- File: [`Roadwise_Navigator_Presentation_Build_Guide.docx`](./Roadwise_Navigator_Presentation_Build_Guide.docx)
- Or click **📥 Download Presentation (.docx)** inside the web app's User Manual dialog.
