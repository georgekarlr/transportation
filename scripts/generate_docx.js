import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
  BorderStyle
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Styling colors
const COLOR_PRIMARY = '0284C7';    // Sky-600
const COLOR_SECONDARY = '0F172A';  // Slate-900
const COLOR_MUTED = '475569';      // Slate-600
const COLOR_CODE_BG = 'F1F5F9';    // Slate-100
const COLOR_CALLOUT_BG = 'F8FAFC'; // Slate-50
const COLOR_PROMPT_BG = 'EFF6FF';  // Blue-50
const COLOR_PROMPT_BORDER = '3B82F6';

function createHeading(text, level) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 280, after: 120 }
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    spacing: { after: 100, line: 276 },
    children: [
      new TextRun({
        text,
        size: options.size || 22, // 11pt
        color: options.color || '1E293B',
        bold: options.bold || false,
        italics: options.italics || false,
        font: 'Segoe UI'
      })
    ]
  });
}

function createCodeBlock(codeText) {
  const lines = codeText.split('\n');
  return lines.map(line =>
    new Paragraph({
      spacing: { after: 40, line: 240 },
      shading: {
        type: ShadingType.CLEAR,
        fill: COLOR_CODE_BG
      },
      children: [
        new TextRun({
          text: line.length ? line : ' ',
          font: 'Consolas',
          size: 19, // 9.5pt
          color: '0F172A'
        })
      ]
    })
  );
}

function createPromptBox(promptText) {
  const lines = promptText.split('\n');
  return [
    new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({
          text: '🤖 Step Implementation Prompt:',
          bold: true,
          color: '1D4ED8',
          size: 21,
          font: 'Segoe UI'
        })
      ]
    }),
    ...lines.map(line =>
      new Paragraph({
        spacing: { after: 40, line: 240 },
        shading: {
          type: ShadingType.CLEAR,
          fill: COLOR_PROMPT_BG
        },
        indent: { left: 240 },
        children: [
          new TextRun({
            text: line.length ? line : ' ',
            font: 'Consolas',
            size: 19,
            color: '1E3A8A'
          })
        ]
      })
    ),
    new Paragraph({ spacing: { after: 120 } })
  ];
}

function createSpeakerNotes(notesText) {
  return [
    new Paragraph({
      spacing: { before: 120, after: 60 },
      children: [
        new TextRun({
          text: '🗣️ Speaker Notes:',
          bold: true,
          color: 'B45309', // Amber-700
          size: 21,
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 160, line: 276 },
      indent: { left: 240 },
      children: [
        new TextRun({
          text: notesText,
          italics: true,
          color: '475569',
          size: 21,
          font: 'Segoe UI'
        })
      ]
    })
  ];
}

function createTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    spacing: { after: 200 },
    rows: [
      new TableRow({
        children: headers.map(h => new TableCell({
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          children: [new Paragraph({
            children: [new TextRun({ text: h, bold: true, size: 20, font: 'Segoe UI' })]
          })]
        }))
      }),
      ...rows.map(row => new TableRow({
        children: row.map(cell => new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: cell, size: 20, font: 'Segoe UI' })]
          })]
        }))
      }))
    ]
  });
}

async function buildDocx() {
  const doc = new Document({
    creator: 'Roadwise Navigator Engineering Team',
    title: 'Presentation Guide: How to Build Roadwise Navigator Step-by-Step',
    description: 'Complete workshop guide and presentation slides for building a framework-free GIS navigation application.',
    sections: [
      {
        properties: {},
        children: [
          // Title & Meta Header
          new Paragraph({
            text: 'Roadwise Navigator',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: 'Presentation & Workshop Guide: How to Build This Application Step-by-Step',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: 'Target Location: Pagadian City, Philippines  |  Stack: Pure HTML5, Vanilla JavaScript, Leaflet, OSM, OSRM',
                color: COLOR_MUTED,
                size: 20,
                italics: true,
                font: 'Segoe UI'
              })
            ]
          }),

          // Slide Index Table
          createHeading('Presentation Agenda & Slide Index', HeadingLevel.HEADING_1),
          createTable(
            ['Slide', 'Topic', 'Focus Area'],
            [
              ['01', 'Title & Introduction', 'Project mission, goals, and Pagadian City context'],
              ['02', 'The Architectural Challenge', 'Why pure Vanilla Web Standards instead of React'],
              ['03', 'System Architecture & Composable Design', 'High-level data flow and modular structure'],
              ['04', 'Step 1: Building the UI & Spatial Canvas', 'HTML5 layout, Tailwind CSS, Leaflet integration'],
              ['05', 'Step 2: Connecting the Search Engine', 'Nominatim API, spatial bounding boxes, debouncing'],
              ['06', 'Step 3: Integrating Routing & Navigation', 'OSRM REST API, multi-modal transit, maneuver parser'],
              ['07', 'Step 4: Real-Time Drive Simulation & Physics', 'Haversine formula, heading bearing, smooth tracking'],
              ['08', 'Step 5: Community Road Hazard & Incident System', 'Event bus, modal forms, upvoting, pulsing markers'],
              ['09', 'Step 6: Local Ride-Hailing Dispatch Simulator', 'Fare calculation, driver pool state machine'],
              ['10', 'Step 7: Production Optimization & Deployment', 'Zero-Node static hosting, Docker, and Nginx'],
              ['11', 'Live Demonstration Script', 'Hands-on walkthrough for the presenter'],
              ['12', 'Summary & Key Takeaways', 'Lessons learned and Q&A prompts']
            ]
          ),

          // Slide 01
          createHeading('Slide 01: Title & Introduction', HeadingLevel.HEADING_1),
          createParagraph('Project: Roadwise Navigator - Framework-Free GIS Navigation & Transit Platform', { bold: true }),
          createParagraph('Location Focus: Pagadian City, Zamboanga del Sur, Philippines (7.8285° N, 123.4347° E)'),
          createParagraph('Core Mission: Provide fast, open-source turn-by-turn navigation, localized tricycle transit dispatching, and community hazard tracking with zero API costs and zero proprietary framework dependencies.'),
          ...createSpeakerNotes('"Welcome everyone. Today we present how we engineered Roadwise Navigator. Most modern mapping apps default to heavy frameworks and costly commercial APIs. Today, we demonstrate how you can build an equally powerful, production-grade application using 100% open-source web standards with zero API costs and zero runtime framework lock-in."'),

          // Slide 02
          createHeading('Slide 02: The Architectural Challenge', HeadingLevel.HEADING_1),
          createParagraph('Why We Chose Pure Vanilla Web Standards Over React / Next.js', { bold: true }),
          createTable(
            ['Aspect', 'The "Default" Heavy Approach', 'The Roadwise Approach'],
            [
              ['Framework', 'React 19 / Next.js (~150KB+ runtime JS)', 'Pure Vanilla JS ES Modules (0KB runtime overhead)'],
              ['Map Engine', 'Proprietary APIs (Billing & API keys required)', 'Leaflet.js + OpenStreetMap (100% Free & Open Source)'],
              ['Routing', 'Commercial routing APIs ($5–$10 per 1k requests)', 'OSRM Public Engine with Local Fallbacks'],
              ['Hosting', 'Requires Node.js SSR server / V8 container', '100% Static Files: Host on GitHub Pages, Netlify, or Nginx'],
              ['Maintainability', 'Framework churn, breaking updates', 'W3C Web Standards that will run untouched for decades']
            ]
          ),
          ...createSpeakerNotes('"By relying directly on native browser APIs—DOM manipulation, ES Modules, and the Fetch API—our application boots instantaneously, uses minimal battery on mobile devices, and can be hosted statically on any server for free."'),

          // Slide 03
          createHeading('Slide 03: System Architecture & Composable Design', HeadingLevel.HEADING_1),
          createParagraph('Modular Decoupling: Services Layer vs. Components Layer vs. UI', { bold: true }),
          createParagraph('The codebase follows strict separation of concerns across single-responsibility ES Modules:'),
          createParagraph('• Services Layer: Pure data, APIs, and kinematics (config.js, geocodingService.js, routingService.js, simulator.js, incidentService.js). Never touches the DOM.'),
          createParagraph('• Components Layer: Visual rendering and UI state (mapComponent.js, turnDirections.js, rideManager.js).'),
          createParagraph('• Coordinator: app.js binds user events, listens to service emissions, and directs component rendering.'),
          ...createSpeakerNotes('"Notice the clean separation. When the simulator computes vehicle movement, it doesn\'t manipulate the map directly; it emits coordinates. The map component subscribes and updates the pin. This makes each module testable in complete isolation."'),

          // Slide 04
          createHeading('Slide 04: Step 1 – Building the UI & Spatial Canvas', HeadingLevel.HEADING_1),
          createParagraph('Layout Architecture & Leaflet Basemaps', { bold: true }),
          createParagraph('1. Responsive HTML5 layout with split left glassmorphism sidebar (desktop) and collapsible bottom sheet (mobile).'),
          createParagraph('2. Leaflet map initialization centered on Pagadian City [7.8285, 123.4347] with custom zoom controls.'),
          createParagraph('3. Multi-provider tile layers: OpenStreetMap (Street), Esri World Imagery (Satellite), and CartoDB Dark Matter (Night driving).'),
          ...createCodeBlock(
`// src/components/mapComponent.js
import { APP_CONFIG } from '../services/config.js';

export function initMap(elementId) {
  const map = L.map(elementId, {
    center: APP_CONFIG.DEFAULT_CENTER, // [7.8285, 123.4347]
    zoom: APP_CONFIG.DEFAULT_ZOOM,     // 14
    zoomControl: false
  });
  L.tileLayer(APP_CONFIG.TILE_LAYERS.street.url, {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  return map;
}`
          ),
          ...createPromptBox(
`Create the foundation for a framework-free web mapping application centered on Pagadian City, Philippines (7.8285° N, 123.4347° E).
Requirements:
1. Build index.html using semantic HTML5 and Tailwind CSS. Create a split responsive layout:
   - A floating glassmorphic sidebar on desktop (with tabs for Navigation, Rides, and Hazard Reporting).
   - A collapsible swipe-friendly bottom drawer for mobile viewports.
   - A full-screen map container (#map).
2. Create src/services/config.js to define Pagadian's coordinate center [7.8285, 123.4347], default zoom 14, and tile layer configurations for OpenStreetMap (Standard), Esri World Imagery (Satellite), and CartoDB Dark Matter.
3. Create src/components/mapComponent.js to initialize Leaflet.js without default zoom controls, render the basemap layer, and expose methods to switch tile providers dynamically.
Do not use React or external UI libraries. Use pure ES Modules.`
          ),
          ...createSpeakerNotes('"Step 1 sets up our canvas. We load Leaflet via CDN in index.html. We center the map on Pagadian City and provide instant toggles between Street, Satellite, and Dark mode."'),

          // Slide 05
          createHeading('Slide 05: Step 2 – Connecting the Search & Geocoding Engine', HeadingLevel.HEADING_1),
          createParagraph('High-Performance Local Search Pipeline', { bold: true }),
          createParagraph('1. Debounced query input (250ms) to prevent redundant network requests.'),
          createParagraph('2. Local Pagadian landmark dictionary (Airport, Plaza Luz, Agora Market, C3 Mall, City Hall) providing instant 0ms autocomplete.'),
          createParagraph('3. Nominatim API integration with spatial bounding-box biasing (viewbox=123.38,7.78,123.50,7.88&bounded=0).'),
          createParagraph('4. Reverse geocoding on map click and HTML5 Geolocation with city center fallback.'),
          ...createCodeBlock(
`// src/services/geocodingService.js
export async function searchLocation(query) {
  const localMatch = findLocalPreset(query);
  if (localMatch) return [localMatch];

  const url = \`https://nominatim.openstreetmap.org/search?format=json\` +
              \`&q=\${encodeURIComponent(query)}\` +
              \`&viewbox=123.38,7.78,123.50,7.88&bounded=0&limit=5\`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  return await res.json();
}`
          ),
          ...createPromptBox(
`Implement an intelligent geocoding and local landmark search pipeline for Pagadian City in src/services/geocodingService.js.
Requirements:
1. Query the OpenStreetMap Nominatim search API with a spatial bounding box parameter (viewbox=123.38,7.78,123.50,7.88&bounded=0) to prioritize Pagadian City results.
2. Build an in-memory dictionary of major Pagadian landmarks (Pagadian City Airport, Plaza Luz, Agora Public Market, C3 Mall, City Hall, Provincial Capitol) that returns instant 0ms autocomplete matches before making remote API requests.
3. Support reverse geocoding from GPS coordinates to human-readable street names when clicking anywhere on the map.
4. Integrate navigator.geolocation to detect the user's current GPS position with graceful fallback to the city center if permission is denied.
5. In src/app.js, attach debounced event listeners (250ms) to the Origin and Destination inputs to populate search dropdown results smoothly.`
          ),
          ...createSpeakerNotes('"By passing the viewbox parameter containing Pagadian\'s geographical bounds, Nominatim guarantees local relevance. Furthermore, our instant in-memory landmark dictionary makes popular destinations appear instantaneously with zero network lag."'),

          // Slide 06
          createHeading('Slide 06: Step 3 – Integrating Routing & Navigation API', HeadingLevel.HEADING_1),
          createParagraph('Multi-Modal Pathfinding & Maneuver Parsing', { bold: true }),
          createParagraph('1. Connects to OSRM REST API for driving (car/taxi), bike (motorcycle/tricycle), and foot (walking).'),
          createParagraph('2. Queries OSRM with alternatives=true to present primary and bypass routes.'),
          createParagraph('3. Parses step maneuvers (turn-left, turn-right, roundabout, arrive) with visual icons and distance badges.'),
          createParagraph('4. Fallback generator: Generates bezier curvature trajectories if the public routing server is unreachable.'),
          ...createCodeBlock(
`// src/services/routingService.js
export async function getRoute(startCoords, endCoords, profile = 'driving') {
  const coordString = \`\${startCoords[1]},\${startCoords[0]};\${endCoords[1]},\${endCoords[0]}\`;
  const url = \`https://router.project-osrm.org/route/v1/\${profile}/\${coordString}\` +
              \`?overview=full&geometries=geojson&steps=true&alternatives=true\`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return parseOSRMRoute(data);
  } catch (err) {
    return generateFallbackRoute(startCoords, endCoords);
  }
}`
          ),
          ...createPromptBox(
`Build a multi-modal routing and turn-by-turn guidance engine in src/services/routingService.js and src/components/turnDirections.js.
Requirements:
1. Connect to the public OSRM (Open Source Routing Machine) REST API for three travel profiles: driving (car/taxi), bike (motorcycle/tricycle), and foot (walking).
2. Fetch route geometries (GeoJSON), total distance in kilometers, estimated travel duration, and detailed step maneuvers with alternatives=true.
3. Parse OSRM step maneuvers (turn-left, turn-right, roundabout, continue, arrive) and map them to directional icons and readable distance badges.
4. Create src/components/turnDirections.js to render the list of turn cards in the UI drawer with step-click interactions that pan the map to each turn waypoint.
5. Implement a mathematical fallback route generator using bezier curvature interpolation between start and destination coordinates to guarantee the app remains functional if the public routing server is offline.`
          ),
          ...createSpeakerNotes('"We connect to OSRM with full geometries and turn steps. If the remote service is unreachable, our smart mathematical fallback produces an authentic route curve so navigation never fails."'),

          // Slide 07
          createHeading('Slide 07: Step 4 – Real-Time Drive Simulation & Physics', HeadingLevel.HEADING_1),
          createParagraph('Turning Polyline Coordinates into a Dynamic Navigation Drive', { bold: true }),
          createParagraph('1. Haversine Formula: Spherical Earth distance calculation between waypoints.'),
          createParagraph('2. Trigonometric Bearing: Real-time heading calculation rotating the vehicle marker to face the direction of travel.'),
          createParagraph('3. 60 FPS Coordinate Interpolation using requestAnimationFrame for smooth movement.'),
          createParagraph('4. Active camera tracking following the vehicle, plus dynamic speed telemetry (km/h) and progress bar.'),
          ...createCodeBlock(
`// src/services/simulator.js
function calculateBearing(startLat, startLng, endLat, endLng) {
  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}`
          ),
          ...createPromptBox(
`Build a real-time vehicle drive simulator with telemetry and dynamic heading rotation in src/services/simulator.js.
Requirements:
1. Animate a vehicle marker along the route polyline using requestAnimationFrame and constant-speed kinematics.
2. Implement the trigonometric initial compass bearing formula to calculate the exact heading angle between consecutive coordinates in degrees:
   atan2(sin(Δλ)·cos(φ2), cos(φ1)·sin(φ2) - sin(φ1)·cos(φ2)·cos(Δλ))
3. Dynamically rotate the vehicle marker icon on the map using CSS transform to face the direction of travel.
4. Compute spherical travel distances using the Haversine formula.
5. Provide live telemetry updates to the UI: current speed (km/h), progress percentage, distance remaining, and ETA countdown.
6. Center and smoothly pan the Leaflet camera to follow the vehicle as it drives.
7. Support Start, Pause, Resume, and Stop controls with clean timer cleanup.`
          ),
          ...createSpeakerNotes('"As the simulated vehicle drives along the polyline, we calculate the trigonometric bearing between waypoints. We apply CSS transform rotate so the vehicle turns accurately on curves."'),

          // Slide 08
          createHeading('Slide 08: Step 5 – Community Road Hazard & Incident System', HeadingLevel.HEADING_1),
          createParagraph('Decentralized Crowdsourced Incident Engine', { bold: true }),
          createParagraph('1. Incident categories: Traffic Jams (🚗), Road Hazards/Roadwork (⚠️), and Accidents (🚨).'),
          createParagraph('2. Modal interface for submitting descriptions and severity ratings with pinpoint map placement.'),
          createParagraph('3. Custom pulsing SVG marker pins rendered on the Leaflet map.'),
          createParagraph('4. Community verification voting: Upvotes keep hazards active; downvotes automatically dismiss expired reports.'),
          ...createCodeBlock(
`// src/services/incidentService.js
export const incidentService = {
  incidents: [],
  reportIncident(type, coords, description) {
    this.incidents.push({ id: Date.now(), type, coords, description, votes: 1 });
    this.notifyListeners();
  }
};`
          ),
          ...createPromptBox(
`Implement a community-driven road hazard and traffic incident reporting system in src/services/incidentService.js and the map interface.
Requirements:
1. Create an in-memory incident event bus that manages reports of Traffic Jams (🚗), Road Hazards/Roadwork (⚠️), and Accidents (🚨).
2. Build an incident submission modal dialog in index.html with fields for incident category, severity rating, and descriptive note.
3. Allow users to pinpoint the hazard location by clicking directly on the map canvas.
4. Render custom animated, pulsing SVG marker pins on the Leaflet map for all active incidents.
5. Implement a verification voting mechanism: allow users to upvote ("Still here") or downvote ("Cleared") incidents with automatic marker removal when downvotes exceed threshold.`
          ),
          ...createSpeakerNotes('"Drivers can report hazards by clicking on the map. Other drivers verify them. Verified reports pulse prominently, while stale reports disappear."'),

          // Slide 09
          createHeading('Slide 09: Step 6 – Local Ride-Hailing Dispatch Simulator', HeadingLevel.HEADING_1),
          createParagraph('Pagadian Tricycle & Taxi Dispatch Lifecycle', { bold: true }),
          createParagraph('1. Models unique Pagadian transit: Standard Tricycle, Special Tricycle, and City Taxi.'),
          createParagraph('2. Transparent local fare rates: ₱15 base + ₱5/km (Tricycle) vs. ₱40 base + ₱15/km (Taxi).'),
          createParagraph('3. 5-Stage Dispatch Lifecycle: Search Drivers ➔ Driver Matched ➔ Driver En Route ➔ Trip In Transit ➔ Trip Complete & Receipt.'),
          createParagraph('4. Animated driver vehicle approaching pickup point on the map canvas.'),
          ...createPromptBox(
`Build a Pagadian City ride-hailing and transit dispatch simulation system in src/components/rideManager.js.
Requirements:
1. Model local vehicle classes: Pagadian Tricycle (Standard & Special) and City Taxi/Private Car.
2. Implement transparent fare algorithms based on Pagadian local rates:
   - Tricycle: ₱15 base fare + ₱5 per kilometer.
   - Taxi: ₱40 base fare + ₱15 per kilometer.
3. Build a full dispatch lifecycle state machine:
   - Stage 1: "Finding nearby drivers..." animation.
   - Stage 2: Driver matched (display driver name, vehicle plate, star rating, and ETA).
   - Stage 3: Driver en route to pickup with approaching vehicle animation on map.
   - Stage 4: Trip in transit with live distance countdown and running fare meter.
   - Stage 5: Arrival, summary dialog, and passenger rating prompt.
4. Render responsive ride cards in the sidebar/drawer with vehicle icons, seat capacities, and live fare estimates.`
          ),
          ...createSpeakerNotes('"We modeled the iconic Pagadian inclined tricycles and taxis with realistic local fares, dispatch state machines, and driver pickup animations."'),

          // Slide 10
          createHeading('Slide 10: Step 7 – Production Optimization & Deployment', HeadingLevel.HEADING_1),
          createParagraph('Zero-Node Static Production Architecture', { bold: true }),
          createParagraph('1. Minified bundle produced via Vite into dist/ with purged Tailwind CSS.'),
          createParagraph('2. Zero Node.js runtime needed in production; runs on any static host (GitHub Pages, Netlify, Cloudflare).'),
          createParagraph('3. Lightweight Docker container (node:20-alpine build ➔ nginx:alpine-slim runtime, ~25MB image).'),
          createParagraph('4. Can also run completely without Node locally using Python http.server or VS Code Live Server.'),
          ...createPromptBox(
`Optimize, containerize, and configure production deployment for the vanilla HTML5/JS navigation app.
Requirements:
1. Configure vite.config.ts to bundle semantic HTML5, purge unused Tailwind CSS, and generate fingerprinted, tree-shaken static assets in dist/.
2. Run npm run lint (tsc --noEmit) to ensure 100% type safety and zero missing imports.
3. Verify that the production build in dist/ is 100% static and requires zero Node.js runtime.
4. Create a multi-stage Dockerfile using node:20-alpine to build the static bundle and nginx:alpine-slim to serve it on port 80.
5. Provide sample configurations for deploying to GitHub Pages (GitHub Actions workflow), Netlify, and an Ubuntu Nginx server with asset caching headers.`
          ),
          ...createSpeakerNotes('"Our dist/ output is pure static web files. It deploys anywhere with zero backend runtime dependencies."'),

          // Slide 11
          createHeading('Slide 11: Live Demonstration Script', HeadingLevel.HEADING_1),
          createParagraph('Hands-On Demonstration Steps for the Presenter:', { bold: true }),
          createParagraph('1. Search & Autocomplete: Type "City Hall" and "Agora Market". Show 0ms instant local autocomplete.'),
          createParagraph('2. Route Rendering: Display primary and bypass routes; switch between Car, Tricycle, and Walking modes.'),
          createParagraph('3. Drive Simulation: Click "▶ Start Drive". Highlight the rotating vehicle pin, speedometer, and camera tracking.'),
          createParagraph('4. Report Hazard: Click "⚠️ Report Hazard", select Traffic Jam, drop pin on map, and observe the pulsing marker.'),
          createParagraph('5. Ride Hailing: Switch to the Rides tab, select Pagadian Tricycle (Special), view the estimated fare, and click "Book Ride". Observe driver dispatch.'),

          // Slide 12
          createHeading('Slide 12: Summary & Key Takeaways', HeadingLevel.HEADING_1),
          createParagraph('Key Engineering Lessons:', { bold: true }),
          createParagraph('1. Native Web Standards: Modern ES Modules and standard DOM APIs provide all the power needed for complex apps without framework bloat.'),
          createParagraph('2. Open GIS: Leaflet, OpenStreetMap, and OSRM offer high-performance mapping with zero vendor lock-in or recurring API costs.'),
          createParagraph('3. Clean Composability: Decoupling services from UI components makes each feature independently testable and maintainable.'),
          createParagraph('4. Local Tailoring: Grounding features in Pagadian City\'s unique terrain, landmarks, and transit culture creates authentic user value.'),
          ...createSpeakerNotes('"Thank you for your time! The entire codebase is modular, open-source, and fully documented. We now open the floor for questions."')
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  
  // 1. Write to root directory
  const rootPath = path.join(rootDir, 'Roadwise_Navigator_Presentation_Build_Guide.docx');
  fs.writeFileSync(rootPath, buffer);
  console.log(`Saved root DOCX: ${rootPath}`);

  // 2. Write to public/ directory for direct web download
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicPath = path.join(publicDir, 'Roadwise_Navigator_Presentation_Build_Guide.docx');
  fs.writeFileSync(publicPath, buffer);
  console.log(`Saved public DOCX: ${publicPath}`);

  // 3. Write base64 module for 100% in-browser client-side blob download (avoids iframe cookie auth blocks)
  const assetsDir = path.join(rootDir, 'src', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  const b64 = buffer.toString('base64');
  const b64Path = path.join(assetsDir, 'presentationDocxBase64.js');
  fs.writeFileSync(b64Path, `// Auto-generated base64 asset for in-memory client-side download\nexport const PRESENTATION_DOCX_BASE64 = "${b64}";\n`);
  console.log(`Saved in-memory base64 asset: ${b64Path} (${b64.length} chars)`);
}

buildDocx().catch(err => {
  console.error('Error generating DOCX:', err);
  process.exit(1);
});
