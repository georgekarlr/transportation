/**
 * Leaflet Map Component
 * Handles tiles, markers, route polylines, layers, and interactive events
 */

import { DEFAULT_CITY, TILE_PROVIDERS } from '../services/config.js';

export class MapComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.map = null;
    this.tileLayers = {};
    this.currentTileLayer = null;
    
    // Markers & Layers
    this.originMarker = null;
    this.destinationMarker = null;
    this.vehicleMarker = null;
    this.routePolylines = [];
    this.incidentLayer = null;
    this.trafficLayer = null;
    
    // Callbacks
    this.onOriginMove = options.onOriginMove || null;
    this.onDestinationMove = options.onDestinationMove || null;
    this.onMapClick = options.onMapClick || null;
    this.onRouteSelect = options.onRouteSelect || null;
    
    this.clickMode = null; // 'origin' | 'destination' | null

    this.initMap();
  }

  initMap() {
    if (!window.L) {
      console.error('Leaflet is not loaded yet');
      return;
    }

    this.map = window.L.map(this.containerId, {
      center: DEFAULT_CITY.center,
      zoom: DEFAULT_CITY.zoom,
      zoomControl: false, // Custom position
    });

    // Add zoom control to top-right
    window.L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Initialize Tile Providers
    Object.keys(TILE_PROVIDERS).forEach(key => {
      const config = TILE_PROVIDERS[key];
      this.tileLayers[key] = window.L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: config.maxZoom,
      });
    });

    // Default to streets
    this.setTileLayer('streets');

    // Incident Layer Group
    this.incidentLayer = window.L.layerGroup().addTo(this.map);

    // Click handler on map
    this.map.on('click', (e) => {
      if (this.onMapClick) {
        this.onMapClick(e.latlng, this.clickMode);
      }
    });
  }

  setTileLayer(key) {
    if (!this.tileLayers[key]) return;
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }
    this.currentTileLayer = this.tileLayers[key];
    this.currentTileLayer.addTo(this.map);
  }

  setClickMode(mode) {
    this.clickMode = mode;
    const container = document.getElementById(this.containerId);
    if (container) {
      if (mode) {
        container.style.cursor = 'crosshair';
      } else {
        container.style.cursor = '';
      }
    }
  }

  setOrigin(lat, lng, label = 'Your Location') {
    if (!this.map) return;
    const pos = [lat, lng];

    const originIcon = window.L.divIcon({
      className: 'custom-map-pin origin-pin',
      html: `<div class="pin-ring"><div class="pin-dot"></div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    if (!this.originMarker) {
      this.originMarker = window.L.marker(pos, {
        draggable: true,
        icon: originIcon,
      }).addTo(this.map);

      this.originMarker.bindTooltip(label, { permanent: false, direction: 'top' });

      this.originMarker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        if (this.onOriginMove) {
          this.onOriginMove([newPos.lat, newPos.lng]);
        }
      });
    } else {
      this.originMarker.setLatLng(pos);
      this.originMarker.setTooltipContent(label);
    }
  }

  setDestination(lat, lng, label = 'Destination') {
    if (!this.map) return;
    const pos = [lat, lng];

    const destIcon = window.L.divIcon({
      className: 'custom-map-pin destination-pin',
      html: `<div class="dest-marker"><span class="dest-icon">📍</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    if (!this.destinationMarker) {
      this.destinationMarker = window.L.marker(pos, {
        draggable: true,
        icon: destIcon,
      }).addTo(this.map);

      this.destinationMarker.bindTooltip(label, { permanent: false, direction: 'top' });

      this.destinationMarker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        if (this.onDestinationMove) {
          this.onDestinationMove([newPos.lat, newPos.lng]);
        }
      });
    } else {
      this.destinationMarker.setLatLng(pos);
      this.destinationMarker.setTooltipContent(label);
    }
  }

  clearDestination() {
    if (this.destinationMarker) {
      this.map.removeLayer(this.destinationMarker);
      this.destinationMarker = null;
    }
    this.clearRoutes();
  }

  renderRoutes(routes, activeRouteId) {
    this.clearRoutes();
    if (!routes || routes.length === 0) return;

    // Render non-active routes first so active route is on top
    const sorted = [...routes].sort((a, b) => {
      if (a.id === activeRouteId) return 1;
      if (b.id === activeRouteId) return -1;
      return 0;
    });

    sorted.forEach((route) => {
      const isActive = route.id === activeRouteId;
      
      const polyline = window.L.polyline(route.coordinates, {
        color: isActive ? '#2563eb' : '#94a3b8',
        weight: isActive ? 6 : 4,
        opacity: isActive ? 0.95 : 0.65,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: isActive ? null : '6 6',
      }).addTo(this.map);

      // Add clickable hover tooltip
      polyline.bindTooltip(`<b>${route.name}</b><br>${route.durationMin} min (${route.distanceKm} km)`, {
        sticky: true,
        direction: 'top',
      });

      polyline.on('click', () => {
        if (this.onRouteSelect) {
          this.onRouteSelect(route.id);
        }
      });

      this.routePolylines.push({ id: route.id, polyline, isActive });
    });

    // Fit map bounds to active route
    const activeRoute = routes.find(r => r.id === activeRouteId) || routes[0];
    if (activeRoute && activeRoute.coordinates.length > 0) {
      const bounds = window.L.latLngBounds(activeRoute.coordinates);
      // Desktop vs mobile padding
      const isMobile = window.innerWidth <= 768;
      this.map.fitBounds(bounds, {
        paddingTopLeft: isMobile ? [20, 20] : [60, 420],
        paddingBottomRight: isMobile ? [20, 280] : [40, 40],
        maxZoom: 16,
      });
    }
  }

  clearRoutes() {
    this.routePolylines.forEach(item => {
      this.map.removeLayer(item.polyline);
    });
    this.routePolylines = [];
  }

  updateVehicleMarker(position, bearing = 0, travelMode = 'driving') {
    if (!this.map) return;

    const iconEmoji = travelMode === 'motorcycle' ? '🏍️' : (travelMode === 'walk' ? '🚶' : (travelMode === 'bike' ? '🚲' : '🚗'));
    
    const vehicleIcon = window.L.divIcon({
      className: 'vehicle-nav-pin',
      html: `
        <div class="vehicle-pulsar" style="transform: rotate(${bearing}deg)">
          <div class="vehicle-pointer">▲</div>
          <div class="vehicle-body">${iconEmoji}</div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (!this.vehicleMarker) {
      this.vehicleMarker = window.L.marker(position, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(this.map);
    } else {
      this.vehicleMarker.setLatLng(position);
      this.vehicleMarker.setIcon(vehicleIcon);
    }

    // Smoothly pan map to follow vehicle if in navigation mode
    this.map.panTo(position, { animate: true, duration: 0.3 });
  }

  removeVehicleMarker() {
    if (this.vehicleMarker) {
      this.map.removeLayer(this.vehicleMarker);
      this.vehicleMarker = null;
    }
  }

  renderIncidents(incidents) {
    if (!this.incidentLayer) return;
    this.incidentLayer.clearLayers();

    incidents.forEach(inc => {
      const alertIcon = window.L.divIcon({
        className: 'incident-map-pin',
        html: `<div class="incident-badge inc-${inc.type}">${this.getIncidentEmoji(inc.type)}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = window.L.marker([inc.lat, inc.lng], { icon: alertIcon });
      marker.bindPopup(`
        <div class="incident-popup">
          <div class="inc-head"><b>${inc.title}</b></div>
          <div class="inc-desc">${inc.details}</div>
          <div class="inc-time">${inc.timeAgo} &bull; ${inc.votes} reports</div>
        </div>
      `);
      this.incidentLayer.addLayer(marker);
    });
  }

  getIncidentEmoji(type) {
    switch (type) {
      case 'traffic': return '🚦';
      case 'crash': return '🚨';
      case 'hazard': return '⚠️';
      case 'camera': return '📷';
      case 'closure': return '🚧';
      default: return '⚠️';
    }
  }

  panTo(coords, zoom = null) {
    if (zoom) {
      this.map.setView(coords, zoom, { animate: true });
    } else {
      this.map.panTo(coords, { animate: true });
    }
  }
}
