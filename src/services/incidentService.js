/**
 * Incident & Traffic Reporting Service
 * Stores road hazard alerts, traffic reports, and crash warnings
 */

export const INCIDENT_TYPES = {
  traffic: { label: 'Traffic Jam', icon: '🚦', color: '#f59e0b', desc: 'Heavy stop-and-go congestion' },
  crash: { label: 'Car Accident', icon: '🚨', color: '#ef4444', desc: 'Lane blocked by collision' },
  hazard: { label: 'Road Hazard', icon: '⚠️', color: '#eab308', desc: 'Debris or pothole on road' },
  camera: { label: 'Speed Check', icon: '📷', color: '#3b82f6', desc: 'Traffic enforcement ahead' },
  closure: { label: 'Roadwork', icon: '🚧', color: '#f97316', desc: 'Maintenance in progress' },
};

export class IncidentService {
  constructor() {
    this.incidents = [
      {
        id: 'inc_1',
        type: 'traffic',
        lat: 7.8270,
        lng: 123.4360,
        title: 'Moderate Traffic',
        details: 'Slow moving traffic along Rizal Ave',
        timeAgo: '4m ago',
        votes: 12,
      },
      {
        id: 'inc_2',
        type: 'hazard',
        lat: 7.8310,
        lng: 123.4440,
        title: 'Road Maintenance',
        details: 'Drainage repair right lane',
        timeAgo: '18m ago',
        votes: 7,
      },
      {
        id: 'inc_3',
        type: 'camera',
        lat: 7.8220,
        lng: 123.4480,
        title: 'Speed Monitor',
        details: '40 km/h speed limit active',
        timeAgo: '32m ago',
        votes: 15,
      }
    ];
    this.listeners = [];
  }

  getIncidents() {
    return [...this.incidents];
  }

  /**
   * Add a new road incident report
   */
  reportIncident(type, lat, lng, details = '') {
    const config = INCIDENT_TYPES[type] || INCIDENT_TYPES.traffic;
    const newIncident = {
      id: `inc_${Date.now()}`,
      type,
      lat,
      lng,
      title: config.label,
      details: details || config.desc,
      timeAgo: 'Just now',
      votes: 1,
    };
    this.incidents.unshift(newIncident);
    this.notify();
    return newIncident;
  }

  onUpdate(callback) {
    this.listeners.push(callback);
    callback(this.incidents);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.incidents));
  }
}

export const incidentService = new IncidentService();
