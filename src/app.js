/**
 * Roadwise Best Route Navigator - Main Application Orchestrator
 * Composable architecture integrating routing, geocoding, mapping, turn navigation, and ride booking.
 */

import { DEFAULT_CITY, PRESET_DESTINATIONS, TRAVEL_MODES } from './services/config.js';
import { GeocodingService } from './services/geocodingService.js';
import { RoutingService } from './services/routingService.js';
import { incidentService, INCIDENT_TYPES } from './services/incidentService.js';
import { navigationSimulator } from './services/simulator.js';
import { MapComponent } from './components/mapComponent.js';
import { TurnDirectionsComponent } from './components/turnDirections.js';
import { RideManager } from './components/rideManager.js';
import { PRESENTATION_DOCX_BASE64 } from './assets/presentationDocxBase64.js';
import { CAPSTONE_DOCX_BASE64 } from './assets/capstoneDocxBase64.js';
import { README_DOCX_BASE64 } from './assets/readmeDocxBase64.js';

class RoadwiseApp {
  constructor() {
    this.state = {
      origin: { coords: DEFAULT_CITY.center, name: 'My Location (Pagadian City)' },
      destination: null, // { coords: [lat, lng], name: '' }
      travelMode: 'driving',
      routes: [],
      activeRouteId: null,
      isNavigating: false,
      isBooking: false,
      simulationSpeed: 1,
      showDirections: false,
    };

    this.map = null;
    this.turnDirections = null;
    this.rideManager = null;
    this.searchDebounceTimer = null;

    this.init();
  }

  async init() {
    this.initMap();
    this.initComponents();
    this.renderPresetChips();
    this.attachDomEvents();
    this.tryDetectUserLocation();

    // Setup Incidents listener
    incidentService.onUpdate((incidents) => {
      this.map.renderIncidents(incidents);
    });
  }

  initMap() {
    this.map = new MapComponent('map-viewport', {
      onOriginMove: async (coords) => {
        const address = await GeocodingService.reverseGeocode(coords[0], coords[1]);
        this.state.origin = { coords, name: address };
        const input = document.getElementById('origin-input');
        if (input) input.value = address;
        this.recalculateRoutes();
      },
      onDestinationMove: async (coords) => {
        const address = await GeocodingService.reverseGeocode(coords[0], coords[1]);
        this.state.destination = { coords, name: address };
        const input = document.getElementById('dest-input');
        if (input) input.value = address;
        this.recalculateRoutes();
      },
      onMapClick: (latlng, mode) => {
        this.handleMapClick(latlng, mode);
      },
      onRouteSelect: (routeId) => {
        this.selectRoute(routeId);
      },
    });

    // Set initial origin pin
    this.map.setOrigin(this.state.origin.coords[0], this.state.origin.coords[1], this.state.origin.name);
  }

  initComponents() {
    // Turn Directions
    const dirContainer = document.getElementById('directions-container');
    this.turnDirections = new TurnDirectionsComponent(dirContainer, (step) => {
      if (step.location) {
        this.map.panTo(step.location, 16);
      }
    });

    // Ride Manager
    this.rideManager = new RideManager({
      onStateChange: (rideState) => {
        this.renderRideState(rideState);
      }
    });

    // Navigation Simulator Callbacks
    navigationSimulator.on('update', (data) => {
      this.onNavigationUpdate(data);
    });

    navigationSimulator.on('finish', () => {
      this.showToast('🏁 You have reached your destination!', 'success');
      this.stopNavigation();
    });
  }

  renderPresetChips() {
    const container = document.getElementById('preset-chips-container');
    if (!container) return;

    container.innerHTML = PRESET_DESTINATIONS.map(p => `
      <button class="preset-chip" data-id="${p.id}" data-lat="${p.lat}" data-lng="${p.lng}" data-name="${p.name}">
        <span>${p.icon}</span>
        <span>${p.name}</span>
      </button>
    `).join('');

    container.querySelectorAll('.preset-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const lat = parseFloat(btn.getAttribute('data-lat'));
        const lng = parseFloat(btn.getAttribute('data-lng'));
        const name = btn.getAttribute('data-name');
        this.setDestination([lat, lng], name);
      });
    });
  }

  attachDomEvents() {
    // Origin & Destination Inputs
    const originInput = document.getElementById('origin-input');
    const destInput = document.getElementById('dest-input');
    const originGpsBtn = document.getElementById('origin-gps-btn');
    const swapBtn = document.getElementById('swap-locations-btn');
    const clearDestBtn = document.getElementById('clear-dest-btn');
    const destDropdown = document.getElementById('dest-autocomplete');

    if (destInput) {
      destInput.addEventListener('input', (e) => {
        const query = e.target.value;
        this.handleSearchInput(query, destDropdown);
      });

      destInput.addEventListener('focus', (e) => {
        this.handleSearchInput(e.target.value, destDropdown);
      });
    }

    if (originGpsBtn) {
      originGpsBtn.addEventListener('click', () => this.locateUserGps());
    }

    if (swapBtn) {
      swapBtn.addEventListener('click', () => this.swapLocations());
    }

    if (clearDestBtn) {
      clearDestBtn.addEventListener('click', () => {
        this.clearDestination();
      });
    }

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#dest-search-row') && !e.target.closest('#dest-autocomplete')) {
        if (destDropdown) destDropdown.classList.add('hidden');
      }
    });

    // Travel Mode Tabs
    const modeTabs = document.querySelectorAll('.mode-tab');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.getAttribute('data-mode');
        this.setTravelMode(mode);
      });
    });

    // Map Tile Switcher Buttons
    const streetTileBtn = document.getElementById('tile-streets-btn');
    const satTileBtn = document.getElementById('tile-sat-btn');
    const darkTileBtn = document.getElementById('tile-dark-btn');

    if (streetTileBtn) {
      streetTileBtn.addEventListener('click', () => {
        this.map.setTileLayer('streets');
        this.updateActiveTileButton(streetTileBtn);
      });
    }
    if (satTileBtn) {
      satTileBtn.addEventListener('click', () => {
        this.map.setTileLayer('satellite');
        this.updateActiveTileButton(satTileBtn);
      });
    }
    if (darkTileBtn) {
      darkTileBtn.addEventListener('click', () => {
        this.map.setTileLayer('dark');
        this.updateActiveTileButton(darkTileBtn);
      });
    }

    // Floating Map Buttons
    const locateBtn = document.getElementById('map-locate-btn');
    const pinModeBtn = document.getElementById('map-pin-btn');
    const reportIncidentBtn = document.getElementById('map-report-btn');
    const helpBtn = document.getElementById('app-help-btn');

    if (locateBtn) locateBtn.addEventListener('click', () => this.locateUserGps());
    if (pinModeBtn) {
      pinModeBtn.addEventListener('click', () => {
        const isCrosshair = pinModeBtn.classList.toggle('active');
        this.map.setClickMode(isCrosshair ? 'destination' : null);
        if (isCrosshair) {
          this.showToast('📍 Click anywhere on map to set Destination');
        }
      });
    }
    if (reportIncidentBtn) {
      reportIncidentBtn.addEventListener('click', () => this.openIncidentModal());
    }
    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.openManualModal());
    }

    // Navigation HUD Controls
    const startNavBtn = document.getElementById('start-nav-btn');
    const toggleStepsBtn = document.getElementById('toggle-steps-btn');
    const bookRideBtn = document.getElementById('book-ride-btn');
    const stopNavBtn = document.getElementById('stop-nav-btn');
    const pauseNavBtn = document.getElementById('pause-nav-btn');
    const speedNavBtn = document.getElementById('speed-nav-btn');

    if (startNavBtn) startNavBtn.addEventListener('click', () => this.startNavigation());
    if (toggleStepsBtn) toggleStepsBtn.addEventListener('click', () => this.toggleDirections());
    if (bookRideBtn) bookRideBtn.addEventListener('click', () => this.openRideBooking());
    if (stopNavBtn) stopNavBtn.addEventListener('click', () => this.stopNavigation());
    if (pauseNavBtn) {
      pauseNavBtn.addEventListener('click', () => {
        if (navigationSimulator.isPaused) {
          navigationSimulator.resume();
          pauseNavBtn.innerHTML = '⏸️ Pause';
        } else {
          navigationSimulator.pause();
          pauseNavBtn.innerHTML = '▶️ Resume';
        }
      });
    }
    if (speedNavBtn) {
      speedNavBtn.addEventListener('click', () => {
        const speeds = [1, 2, 4];
        const nextIdx = (speeds.indexOf(this.state.simulationSpeed) + 1) % speeds.length;
        this.state.simulationSpeed = speeds[nextIdx];
        navigationSimulator.setSpeed(this.state.simulationSpeed);
        speedNavBtn.textContent = `${this.state.simulationSpeed}x`;
      });
    }

    // Ride Booking Panel Events
    this.attachRideBookingEvents();

    // Incident Modal Events
    this.attachIncidentModalEvents();

    // User Manual Modal Events
    this.attachManualModalEvents();

    // Global keyboard listener (Escape closes modals)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeManualModal();
        this.closeIncidentModal();
      }
    });
  }

  updateActiveTileButton(activeBtn) {
    document.querySelectorAll('.tile-switcher-btn').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  handleMapClick(latlng, clickMode) {
    const coords = [latlng.lat, latlng.lng];
    if (clickMode === 'origin') {
      GeocodingService.reverseGeocode(coords[0], coords[1]).then(name => {
        this.state.origin = { coords, name };
        document.getElementById('origin-input').value = name;
        this.map.setOrigin(coords[0], coords[1], name);
        this.recalculateRoutes();
      });
      this.map.setClickMode(null);
      document.getElementById('map-pin-btn')?.classList.remove('active');
    } else {
      // Default: click sets destination
      GeocodingService.reverseGeocode(coords[0], coords[1]).then(name => {
        this.setDestination(coords, name);
      });
      this.map.setClickMode(null);
      document.getElementById('map-pin-btn')?.classList.remove('active');
    }
  }

  handleSearchInput(query, dropdownEl) {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    
    this.searchDebounceTimer = setTimeout(async () => {
      const results = await GeocodingService.searchPlaces(query, this.state.origin.coords);
      if (!dropdownEl) return;

      if (results.length === 0) {
        dropdownEl.innerHTML = `<div class="p-3 text-xs text-slate-400">No locations found. Try another place name.</div>`;
        dropdownEl.classList.remove('hidden');
        return;
      }

      dropdownEl.innerHTML = results.map(item => `
        <div class="autocomplete-item" data-lat="${item.lat}" data-lng="${item.lng}" data-name="${item.name}">
          <div class="ac-icon">${item.icon || '📍'}</div>
          <div class="ac-text">
            <div class="ac-name">${item.name}</div>
            ${item.desc ? `<div class="ac-desc">${item.desc}</div>` : ''}
          </div>
        </div>
      `).join('');

      dropdownEl.classList.remove('hidden');

      dropdownEl.querySelectorAll('.autocomplete-item').forEach(el => {
        el.addEventListener('click', () => {
          const lat = parseFloat(el.getAttribute('data-lat'));
          const lng = parseFloat(el.getAttribute('data-lng'));
          const name = el.getAttribute('data-name');
          this.setDestination([lat, lng], name);
          dropdownEl.classList.add('hidden');
        });
      });
    }, 250);
  }

  async setDestination(coords, name) {
    this.state.destination = { coords, name };
    const input = document.getElementById('dest-input');
    if (input) input.value = name;

    const clearBtn = document.getElementById('clear-dest-btn');
    if (clearBtn) clearBtn.classList.remove('hidden');

    this.map.setDestination(coords[0], coords[1], name);
    await this.recalculateRoutes();
  }

  clearDestination() {
    this.state.destination = null;
    this.state.routes = [];
    this.state.activeRouteId = null;

    const input = document.getElementById('dest-input');
    if (input) input.value = '';

    const clearBtn = document.getElementById('clear-dest-btn');
    if (clearBtn) clearBtn.classList.add('hidden');

    this.map.clearDestination();
    this.renderRouteCards([]);
    
    // Hide directions & actions
    document.getElementById('route-actions-section')?.classList.add('hidden');
    document.getElementById('directions-section')?.classList.add('hidden');
    document.getElementById('ride-booking-panel')?.classList.add('hidden');
  }

  swapLocations() {
    if (!this.state.destination) {
      this.showToast('Please set a destination first to swap.');
      return;
    }

    const temp = { ...this.state.origin };
    this.state.origin = { ...this.state.destination };
    this.state.destination = temp;

    document.getElementById('origin-input').value = this.state.origin.name;
    document.getElementById('dest-input').value = this.state.destination.name;

    this.map.setOrigin(this.state.origin.coords[0], this.state.origin.coords[1], this.state.origin.name);
    this.map.setDestination(this.state.destination.coords[0], this.state.destination.coords[1], this.state.destination.name);

    this.recalculateRoutes();
  }

  async setTravelMode(mode) {
    this.state.travelMode = mode;
    if (this.state.destination) {
      await this.recalculateRoutes();
    }
  }

  async locateUserGps() {
    this.showToast('Locating your position...');
    const pos = await GeocodingService.getCurrentPosition();
    const address = await GeocodingService.reverseGeocode(pos.lat, pos.lng);

    this.state.origin = { coords: [pos.lat, pos.lng], name: address };
    const input = document.getElementById('origin-input');
    if (input) input.value = address;

    this.map.setOrigin(pos.lat, pos.lng, address);
    this.map.panTo([pos.lat, pos.lng], 15);

    if (pos.isFallback) {
      this.showToast('GPS unavailable. Defaulted to Pagadian center.');
    } else {
      this.showToast('Location updated!');
    }

    if (this.state.destination) {
      this.recalculateRoutes();
    }
  }

  async tryDetectUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          const name = await GeocodingService.reverseGeocode(coords[0], coords[1]);
          this.state.origin = { coords, name };
          const input = document.getElementById('origin-input');
          if (input) input.value = name;
          this.map.setOrigin(coords[0], coords[1], name);
        },
        () => {
          // Keep default
        },
        { timeout: 5000 }
      );
    }
  }

  async recalculateRoutes() {
    if (!this.state.destination) return;

    const routesLoading = document.getElementById('routes-loading');
    if (routesLoading) routesLoading.classList.remove('hidden');

    const routes = await RoutingService.calculateRoutes(
      this.state.origin.coords,
      this.state.destination.coords,
      this.state.travelMode
    );

    if (routesLoading) routesLoading.classList.add('hidden');

    this.state.routes = routes;
    this.state.activeRouteId = routes[0]?.id || null;

    this.renderRouteCards(routes);
    this.map.renderRoutes(routes, this.state.activeRouteId);

    // Update Directions
    const activeRoute = routes.find(r => r.id === this.state.activeRouteId) || routes[0];
    if (activeRoute) {
      this.turnDirections.render(activeRoute.steps, activeRoute.summary);
      document.getElementById('route-actions-section')?.classList.remove('hidden');
    }
  }

  selectRoute(routeId) {
    this.state.activeRouteId = routeId;
    this.map.renderRoutes(this.state.routes, routeId);

    // Update active class on cards
    document.querySelectorAll('.route-card').forEach(card => {
      if (card.getAttribute('data-route-id') === routeId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    const activeRoute = this.state.routes.find(r => r.id === routeId);
    if (activeRoute) {
      this.turnDirections.render(activeRoute.steps, activeRoute.summary);
    }
  }

  renderRouteCards(routes) {
    const container = document.getElementById('routes-list-container');
    if (!container) return;

    if (!routes || routes.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = routes.map((r, idx) => {
      const isSelected = r.id === this.state.activeRouteId;
      const mode = TRAVEL_MODES[this.state.travelMode];
      
      return `
        <div class="route-card ${isSelected ? 'selected' : ''}" data-route-id="${r.id}">
          <div class="route-top-row">
            <div class="route-name">${r.name}</div>
            <div class="route-badge">${idx === 0 ? 'Best Route' : 'Alternative'}</div>
          </div>
          <div class="route-metrics-row">
            <span class="route-eta">${r.durationMin} min</span>
            <span class="route-dist">${r.distanceKm} km</span>
            <span class="route-traffic">&bull; ${r.congestion}</span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span>Summary: ${r.summary}</span>
            ${mode.baseFare > 0 ? `<span class="text-emerald-400 font-semibold">Est. ₱${r.fare}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.route-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-route-id');
        this.selectRoute(id);
      });
    });
  }

  toggleDirections() {
    this.state.showDirections = !this.state.showDirections;
    const section = document.getElementById('directions-section');
    const btn = document.getElementById('toggle-steps-btn');
    if (section) {
      section.classList.toggle('hidden', !this.state.showDirections);
    }
    if (btn) {
      btn.innerHTML = this.state.showDirections ? '▲ Hide Steps' : '📋 View Steps';
    }
  }

  /* ---------------- LIVE SIMULATED NAVIGATION ---------------- */
  startNavigation() {
    const activeRoute = this.state.routes.find(r => r.id === this.state.activeRouteId) || this.state.routes[0];
    if (!activeRoute) {
      this.showToast('Please select a route first.');
      return;
    }

    this.state.isNavigating = true;
    document.getElementById('sidebar-panel')?.classList.add('hidden');
    document.getElementById('nav-hud-top')?.classList.remove('hidden');
    document.getElementById('nav-hud-bottom')?.classList.remove('hidden');

    navigationSimulator.start(activeRoute, this.state.simulationSpeed);
    this.showToast('🧭 Navigation started! Following best route.');
  }

  stopNavigation() {
    this.state.isNavigating = false;
    navigationSimulator.stop();
    this.map.removeVehicleMarker();

    document.getElementById('sidebar-panel')?.classList.remove('hidden');
    document.getElementById('nav-hud-top')?.classList.add('hidden');
    document.getElementById('nav-hud-bottom')?.classList.add('hidden');

    if (this.state.routes && this.state.activeRouteId) {
      this.map.renderRoutes(this.state.routes, this.state.activeRouteId);
    }
  }

  onNavigationUpdate(data) {
    if (!this.state.isNavigating) return;

    // Update map vehicle marker
    this.map.updateVehicleMarker(data.position, data.bearing, this.state.travelMode);

    // Update Top HUD
    const maneuverIcon = document.getElementById('nav-hud-icon');
    const navDistance = document.getElementById('nav-hud-distance');
    const navAction = document.getElementById('nav-hud-action');

    if (data.currentStep) {
      if (maneuverIcon) maneuverIcon.textContent = data.currentStep.icon || '⬆️';
      if (navDistance) navDistance.textContent = data.currentStep.distanceText || 'Ahead';
      if (navAction) navAction.textContent = data.currentStep.instruction || 'Proceed along route';
    }

    // Update Bottom HUD
    const speedEl = document.getElementById('nav-speed-value');
    const timeEl = document.getElementById('nav-time-value');
    const distEl = document.getElementById('nav-dist-value');
    const progressFill = document.getElementById('nav-progress-fill');

    if (speedEl) speedEl.textContent = `${data.speedKmh} km/h`;
    if (timeEl) timeEl.textContent = `${data.remainingTimeMin} min`;
    if (distEl) distEl.textContent = `${data.remainingDistKm} km`;
    if (progressFill) progressFill.style.width = `${data.progressPercent}%`;
  }

  /* ---------------- RIDE BOOKING (PRESERVED & ENHANCED) ---------------- */
  openRideBooking() {
    const activeRoute = this.state.routes.find(r => r.id === this.state.activeRouteId) || this.state.routes[0];
    if (!activeRoute) {
      this.showToast('Please pick a destination first.');
      return;
    }

    this.state.isBooking = true;
    document.getElementById('route-finder-section')?.classList.add('hidden');
    document.getElementById('ride-booking-panel')?.classList.remove('hidden');

    const destNameEl = document.getElementById('ride-dest-name');
    if (destNameEl) destNameEl.textContent = this.state.destination.name;

    const prices = this.rideManager.calculatePrices(activeRoute.distanceKm);
    document.getElementById('ride-motor-price').textContent = `₱${prices.motorcycle}`;
    document.getElementById('ride-cab-price').textContent = `₱${prices.cab}`;

    this.rideManager.cancelRide(); // reset state
  }

  closeRideBooking() {
    this.state.isBooking = false;
    this.rideManager.cancelRide();
    document.getElementById('route-finder-section')?.classList.remove('hidden');
    document.getElementById('ride-booking-panel')?.classList.add('hidden');
  }

  attachRideBookingEvents() {
    const motorRideBtn = document.getElementById('choose-motor-ride');
    const cabRideBtn = document.getElementById('choose-cab-ride');
    const cancelRideBtn = document.getElementById('cancel-ride-btn');
    const cancelWaitingBtn = document.getElementById('cancel-waiting-btn');
    const endTripBtn = document.getElementById('end-trip-btn');
    const backToRoutesBtn = document.getElementById('back-to-routes-btn');

    if (motorRideBtn) {
      motorRideBtn.addEventListener('click', () => {
        const activeRoute = this.state.routes.find(r => r.id === this.state.activeRouteId) || this.state.routes[0];
        this.rideManager.requestRide('Motorcycle', activeRoute?.distanceKm || 3);
      });
    }

    if (cabRideBtn) {
      cabRideBtn.addEventListener('click', () => {
        const activeRoute = this.state.routes.find(r => r.id === this.state.activeRouteId) || this.state.routes[0];
        this.rideManager.requestRide('Cab', activeRoute?.distanceKm || 3);
      });
    }

    if (cancelRideBtn) cancelRideBtn.addEventListener('click', () => this.closeRideBooking());
    if (cancelWaitingBtn) cancelWaitingBtn.addEventListener('click', () => this.rideManager.cancelRide());
    if (backToRoutesBtn) backToRoutesBtn.addEventListener('click', () => this.closeRideBooking());

    if (endTripBtn) {
      endTripBtn.addEventListener('click', () => {
        this.rideManager.completeRide();
        this.showToast('🎉 Trip completed! Thank you for riding with Roadwise.');
        this.closeRideBooking();
      });
    }

    // Incident reporting buttons during trip
    document.getElementById('trip-report-traffic')?.addEventListener('click', () => {
      this.reportTripIncident('traffic');
    });
    document.getElementById('trip-report-crash')?.addEventListener('click', () => {
      this.reportTripIncident('crash');
    });
    document.getElementById('trip-report-hazard')?.addEventListener('click', () => {
      this.reportTripIncident('hazard');
    });
  }

  renderRideState(rideState) {
    const choiceSubState = document.getElementById('ride-choice-substate');
    const waitingSubState = document.getElementById('ride-waiting-substate');
    const tripSubState = document.getElementById('ride-trip-substate');

    choiceSubState?.classList.add('hidden');
    waitingSubState?.classList.add('hidden');
    tripSubState?.classList.add('hidden');

    if (rideState.state === 'idle') {
      choiceSubState?.classList.remove('hidden');
    } else if (rideState.state === 'matching') {
      waitingSubState?.classList.remove('hidden');
    } else if (rideState.state === 'dispatched') {
      tripSubState?.classList.remove('hidden');
      if (rideState.driver) {
        document.getElementById('trip-driver-name').textContent = `🚗 ${rideState.driver.name}`;
        document.getElementById('trip-driver-vehicle').textContent = `${rideState.driver.vehicle} &bull; ${rideState.driver.plate}`;
        document.getElementById('trip-driver-rating').textContent = `${rideState.driver.rating} (${rideState.driver.trips} trips)`;
      }
      const activeRoute = this.state.routes.find(r => r.id === this.state.activeRouteId) || this.state.routes[0];
      document.getElementById('trip-eta-badge').textContent = `${activeRoute?.durationMin || 10} min remaining`;
    }
  }

  reportTripIncident(type) {
    const center = this.state.origin.coords;
    incidentService.reportIncident(type, center[0], center[1], `Reported by passenger on route`);
    this.showToast(`Reported ${type.toUpperCase()} alert sent to community!`);
  }

  /* ---------------- INCIDENT REPORT MODAL ---------------- */
  openIncidentModal() {
    const modal = document.getElementById('incident-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
  }

  closeIncidentModal() {
    const modal = document.getElementById('incident-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  attachIncidentModalEvents() {
    document.getElementById('close-incident-modal-btn')?.addEventListener('click', () => {
      this.closeIncidentModal();
    });

    // Close on backdrop overlay click
    const incidentModal = document.getElementById('incident-modal');
    incidentModal?.addEventListener('click', (e) => {
      if (e.target === incidentModal) {
        this.closeIncidentModal();
      }
    });

    const incidentTypeBtns = document.querySelectorAll('.incident-type-btn');
    incidentTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const pos = this.state.origin.coords;
        // Random subtle jitter so multiple markers don't overlap completely
        const jitterLat = pos[0] + (Math.random() - 0.5) * 0.004;
        const jitterLng = pos[1] + (Math.random() - 0.5) * 0.004;
        
        incidentService.reportIncident(type, jitterLat, jitterLng, `Live user report in corridor`);
        this.closeIncidentModal();
        this.showToast(`🚨 ${INCIDENT_TYPES[type].label} report pinned on map!`);
      });
    });
  }

  /* ---------------- USER MANUAL MODAL ---------------- */
  openManualModal() {
    const modal = document.getElementById('manual-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
  }

  closeManualModal() {
    const modal = document.getElementById('manual-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  attachManualModalEvents() {
    // Top-right close button
    document.getElementById('close-manual-modal-btn')?.addEventListener('click', () => {
      this.closeManualModal();
    });

    // Bottom "Got It" button
    document.getElementById('got-it-manual-modal-btn')?.addEventListener('click', () => {
      this.closeManualModal();
    });

    // In-memory 100% Client-Side DOCX Download (avoids iframe security cookie interception)
    const downloadDocxBtn = document.getElementById('download-presentation-btn');
    if (downloadDocxBtn) {
      downloadDocxBtn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          const binaryString = atob(PRESENTATION_DOCX_BASE64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'Roadwise_Navigator_Presentation_Build_Guide.docx';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
          this.showToast('Word presentation (.docx) downloaded successfully!', 'success');
        } catch (err) {
          console.error('Error in client-side docx download:', err);
          this.showToast('Failed to generate docx in browser.', 'info');
        }
      });
    }

    // In-memory 100% Client-Side Capstone Report DOCX Download
    const downloadCapstoneBtn = document.getElementById('download-capstone-btn');
    if (downloadCapstoneBtn) {
      downloadCapstoneBtn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          const binaryString = atob(CAPSTONE_DOCX_BASE64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'Roadwise_Capstone_Deployment_Report.docx';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
          this.showToast('Capstone Report (.docx) downloaded successfully!', 'success');
        } catch (err) {
          console.error('Error in client-side capstone docx download:', err);
          this.showToast('Failed to generate report docx in browser.', 'info');
        }
      });
    }

    // In-memory 100% Client-Side README Documentation DOCX Download
    const downloadReadmeBtn = document.getElementById('download-readme-btn');
    if (downloadReadmeBtn) {
      downloadReadmeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          const binaryString = atob(README_DOCX_BASE64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'Roadwise_README_Documentation.docx';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
          this.showToast('README Documentation (.docx) downloaded successfully!', 'success');
        } catch (err) {
          console.error('Error in client-side README docx download:', err);
          this.showToast('Failed to generate README docx in browser.', 'info');
        }
      });
    }

    // Copy Presentation Text to Clipboard
    const copyPresentationBtn = document.getElementById('copy-presentation-btn');
    if (copyPresentationBtn) {
      copyPresentationBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const res = await fetch('/PRESENTATION_HOW_TO_BUILD.md');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const text = await res.text();
          await navigator.clipboard.writeText(text);
          this.showToast('Presentation text copied to clipboard!', 'success');
        } catch (err) {
          console.warn('Clipboard fetch error:', err);
          // Fallback direct summary copy
          const fallback = '# Presentation Guide: How to Build Roadwise Navigator Step-by-Step\nSee PRESENTATION_HOW_TO_BUILD.md in repository root.';
          await navigator.clipboard.writeText(fallback);
          this.showToast('Copied presentation guide link!', 'success');
        }
      });
    }

    // Close on backdrop overlay click
    const manualModal = document.getElementById('manual-modal');
    manualModal?.addEventListener('click', (e) => {
      if (e.target === manualModal) {
        this.closeManualModal();
      }
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${type === 'success' ? '✅' : 'ℹ️'}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.roadwiseApp = new RoadwiseApp();
});
