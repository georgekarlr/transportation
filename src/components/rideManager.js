/**
 * Ride Booking & Dispatch Manager
 * Handles vehicle options (Motorcycle/Cab), driver matching, ride simulation, and incident alerts
 */

export const DRIVERS_POOL = [
  { name: 'Jun Santos', vehicle: 'Honda TMX 125', plate: 'ZG-8492', rating: '4.9 ⭐', trips: 1420, phone: '0917-555-8921' },
  { name: 'Mark Villanueva', vehicle: 'Toyota Vios Sedan', plate: 'NAE-4912', rating: '4.8 ⭐', trips: 890, phone: '0922-841-3301' },
  { name: 'Ronnie Cruz', vehicle: 'Yamaha Sight', plate: 'PAG-3310', rating: '4.9 ⭐', trips: 2100, phone: '0919-482-9901' },
  { name: 'Ana Reyes', vehicle: 'Mitsubishi Mirage', plate: 'KAA-8219', rating: '5.0 ⭐', trips: 650, phone: '0918-333-1492' },
  { name: 'Rico Bautista', vehicle: 'Kawasaki Barako', plate: 'ZDS-9014', rating: '4.8 ⭐', trips: 1780, phone: '0908-112-4456' },
];

export class RideManager {
  constructor(options = {}) {
    this.currentRideType = null;
    this.currentDriver = null;
    this.state = 'idle'; // 'idle' | 'matching' | 'dispatched' | 'completed'
    this.distanceKm = 0;
    this.onStateChange = options.onStateChange || null;
    this.matchingTimeout = null;
  }

  calculatePrices(distanceKm = 3) {
    this.distanceKm = distanceKm;
    const motorFare = Math.max(40, Math.round(30 + (distanceKm * 12)));
    const cabFare = Math.max(80, Math.round(60 + (distanceKm * 20)));
    return {
      motorcycle: motorFare,
      cab: cabFare,
    };
  }

  requestRide(type, distanceKm) {
    this.currentRideType = type;
    this.distanceKm = distanceKm;
    this.state = 'matching';
    this.emitState();

    if (this.matchingTimeout) clearTimeout(this.matchingTimeout);

    // Simulate driver matching after 2.5 seconds
    this.matchingTimeout = setTimeout(() => {
      if (this.state !== 'matching') return;
      const driver = DRIVERS_POOL[Math.floor(Math.random() * DRIVERS_POOL.length)];
      this.currentDriver = driver;
      this.state = 'dispatched';
      this.emitState();
    }, 2500);
  }

  cancelRide() {
    if (this.matchingTimeout) clearTimeout(this.matchingTimeout);
    this.state = 'idle';
    this.currentRideType = null;
    this.currentDriver = null;
    this.emitState();
  }

  completeRide() {
    this.state = 'completed';
    this.emitState();
  }

  emitState() {
    if (this.onStateChange) {
      this.onStateChange({
        state: this.state,
        rideType: this.currentRideType,
        driver: this.currentDriver,
        distanceKm: this.distanceKm,
        prices: this.calculatePrices(this.distanceKm),
      });
    }
  }
}
