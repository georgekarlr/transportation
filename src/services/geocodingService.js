/**
 * Geocoding & Place Search Service
 * Integrates OpenStreetMap Nominatim and local presets
 */

import { PRESET_DESTINATIONS, DEFAULT_CITY } from './config.js';

export class GeocodingService {
  /**
   * Search places via text query (combines local presets and Nominatim API)
   * @param {string} query
   * @param {[number, number]} [nearCoords] - [lat, lng] to bias search
   * @returns {Promise<Array<{name: string, lat: number, lng: number, desc?: string, isPreset?: boolean}>>}
   */
  static async searchPlaces(query, nearCoords = DEFAULT_CITY.center) {
    if (!query || query.trim().length === 0) {
      return PRESET_DESTINATIONS.map(p => ({
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        desc: p.desc,
        icon: p.icon,
        isPreset: true,
      }));
    }

    const cleanQuery = query.trim().toLowerCase();
    
    // 1. Check local preset matches first
    const localMatches = PRESET_DESTINATIONS.filter(p =>
      p.name.toLowerCase().includes(cleanQuery) ||
      (p.desc && p.desc.toLowerCase().includes(cleanQuery))
    ).map(p => ({
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      desc: p.desc,
      icon: p.icon,
      isPreset: true,
    }));

    // 2. Fetch live results from Nominatim if query is at least 2 chars
    try {
      // Bounding box around Pagadian or current view for better relevance
      const viewbox = `${nearCoords[1] - 0.25},${nearCoords[0] + 0.25},${nearCoords[1] + 0.25},${nearCoords[0] - 0.25}`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=0&limit=6&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'RoadwiseApp/1.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const onlineResults = data.map(item => {
          const parts = item.display_name.split(',');
          const mainTitle = parts[0] || item.name || query;
          const subTitle = parts.slice(1, 4).join(',').trim();
          return {
            name: mainTitle,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            desc: subTitle || item.type,
            icon: '📍',
            isPreset: false,
          };
        });

        // Merge without duplicate coordinates
        const combined = [...localMatches];
        onlineResults.forEach(res => {
          const exists = combined.some(c => 
            Math.abs(c.lat - res.lat) < 0.001 && Math.abs(c.lng - res.lng) < 0.001
          );
          if (!exists) combined.push(res);
        });

        return combined;
      }
    } catch (err) {
      console.warn('Nominatim search failed, using local results:', err);
    }

    return localMatches;
  }

  /**
   * Reverse geocode coordinates into a readable address
   * @param {number} lat
   * @param {number} lng
   * @returns {Promise<string>}
   */
  static async reverseGeocode(lat, lng) {
    // Check if close to any preset
    const matchedPreset = PRESET_DESTINATIONS.find(p => 
      Math.abs(p.lat - lat) < 0.002 && Math.abs(p.lng - lng) < 0.002
    );
    if (matchedPreset) return matchedPreset.name;

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'RoadwiseApp/1.0',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.address) {
          const road = data.address.road || data.address.neighbourhood || data.address.suburb || data.address.city_district;
          const city = data.address.city || data.address.town || data.address.municipality || 'Pagadian';
          if (road) return `${road}, ${city}`;
        }
        return data.display_name.split(',').slice(0, 2).join(',').trim() || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      }
    } catch (e) {
      console.warn('Reverse geocode failed:', e);
    }
    return `Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }

  /**
   * Get user GPS coordinates with fallback
   * @returns {Promise<{lat: number, lng: number, accuracy?: number}>}
   */
  static getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return resolve({ lat: DEFAULT_CITY.center[0], lng: DEFAULT_CITY.center[1] });
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          // Graceful fallback to default center
          resolve({ lat: DEFAULT_CITY.center[0], lng: DEFAULT_CITY.center[1], isFallback: true });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    });
  }
}
