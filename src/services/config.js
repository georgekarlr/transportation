/**
 * Roadwise Navigation Configuration
 * Default city coordinates, presets, and constants
 */

export const DEFAULT_CITY = {
  name: 'Pagadian City',
  center: [7.8257, 123.4373], // [lat, lng]
  zoom: 14,
};

export const PRESET_DESTINATIONS = [
  { id: 'city_proper', name: 'City Proper', lat: 7.8257, lng: 123.4373, icon: '🏙️', desc: 'Central Business District' },
  { id: 'airport', name: 'Pagadian Airport (PAG)', lat: 7.8300, lng: 123.4600, icon: '✈️', desc: 'Muricay Airfield' },
  { id: 'market', name: 'Agora Public Market', lat: 7.8290, lng: 123.4350, icon: '🛒', desc: 'Fresh Market & Terminals' },
  { id: 'hospital', name: 'Zambo Sur Medical Center', lat: 7.8200, lng: 123.4400, icon: '🏥', desc: 'Regional General Hospital' },
  { id: 'park', name: 'Plaza Luz & City Hall', lat: 7.8350, lng: 123.4300, icon: '🌳', desc: 'Civic Center & Heritage Park' },
  { id: 'mall', name: 'Gaisano Capital Mall', lat: 7.8285, lng: 123.4385, icon: '🛍️', desc: 'Shopping & Dining' },
  { id: 'port', name: 'Pagadian Port Baywalk', lat: 7.8180, lng: 123.4420, icon: '⛵', desc: 'Illana Bay Coastal Promenade' },
  { id: 'terminal', name: 'Tiguma Integrated Bus Terminal', lat: 7.8420, lng: 123.4280, icon: '🚌', desc: 'Provincial Transport Hub' },
];

export const TRAVEL_MODES = {
  driving: { id: 'driving', name: 'Driving', icon: '🚗', osrmProfile: 'driving', speedFactor: 1.0, baseFare: 50, perKmRate: 15 },
  motorcycle: { id: 'motorcycle', name: 'Motorcycle', icon: '🏍️', osrmProfile: 'driving', speedFactor: 1.15, baseFare: 30, perKmRate: 10 },
  cab: { id: 'cab', name: 'Cab / Taxi', icon: '🚕', osrmProfile: 'driving', speedFactor: 0.95, baseFare: 60, perKmRate: 18 },
  bike: { id: 'bike', name: 'Bicycle', icon: '🚲', osrmProfile: 'bike', speedFactor: 0.45, baseFare: 0, perKmRate: 0 },
  walk: { id: 'walk', name: 'Walking', icon: '🚶', osrmProfile: 'foot', speedFactor: 0.15, baseFare: 0, perKmRate: 0 },
};

export const TILE_PROVIDERS = {
  streets: {
    name: 'Street View',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  dark: {
    name: 'Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  }
};
