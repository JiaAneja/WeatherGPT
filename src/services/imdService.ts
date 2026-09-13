// Dedicated IMD Service Layer
// Models IMD national meteorological endpoints, radar metadata, and warning bulletins

export interface IMDBulletin {
  bulletinId: string;
  subdivision: string;
  hazardType: string;
  colorCode: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  validityFrom: string;
  validityTo: string;
  headline: string;
  synopticFeatures: string;
  warningInstructions: string;
}

export class IMDService {
  /**
   * Check color code meaning in IMD nomenclature
   */
  static getSeverityNomenclature(color: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'): {
    actionPhrase: string;
    description: string;
    colorHex: string;
  } {
    switch (color) {
      case 'RED':
        return {
          actionPhrase: 'TAKE ACTION (Warning)',
          description: 'Extremely bad weather expected. High risk to life and property. Immediate disaster response readiness required.',
          colorHex: '#ef4444'
        };
      case 'ORANGE':
        return {
          actionPhrase: 'BE PREPARED (Alert)',
          description: 'Very bad weather likely. High chance of disruption to road/rail traffic and power supply. Keep emergency provisions ready.',
          colorHex: '#f97316'
        };
      case 'YELLOW':
        return {
          actionPhrase: 'BE UPDATED (Watch)',
          description: 'Severely bad weather possible over next few days. Keep track of latest weather bulletins.',
          colorHex: '#eab308'
        };
      case 'GREEN':
      default:
        return {
          actionPhrase: 'NO WARNING (Normal)',
          description: 'No adverse weather conditions expected. Routine day-to-day operations can continue uninterrupted.',
          colorHex: '#10b981'
        };
    }
  }

  /**
   * Returns list of IMD Doppler Weather Radar (DWR) stations in India
   */
  static getDopplerRadars(): Array<{ name: string; state: string; lat: number; lng: number; rangeKm: number }> {
    return [
      { name: 'DWR Delhi (Palam)', state: 'Delhi', lat: 28.5665, lng: 77.1031, rangeKm: 250 },
      { name: 'DWR Mumbai (Colaba)', state: 'Maharashtra', lat: 18.9067, lng: 72.8147, rangeKm: 250 },
      { name: 'DWR Bhuj', state: 'Gujarat', lat: 23.2420, lng: 69.6669, rangeKm: 250 },
      { name: 'DWR Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, rangeKm: 250 },
      { name: 'DWR Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, rangeKm: 250 },
      { name: 'DWR Paradip', state: 'Odisha', lat: 20.3164, lng: 86.6114, rangeKm: 250 },
      { name: 'DWR Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, rangeKm: 250 },
      { name: 'DWR Mohanbari (Dibrugarh)', state: 'Assam', lat: 27.4728, lng: 94.9120, rangeKm: 250 },
      { name: 'DWR Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973, rangeKm: 250 },
    ];
  }
}
