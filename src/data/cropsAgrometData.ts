export interface CropMetadata {
  id: string;
  name: string;
  hindiName: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Annual';
  optimalTempRange: [number, number]; // [min, max] in C
  maxWindSpeedForSprayingKmh: number;
  criticalRainAvoidanceMm: number;
  highHumidityFungalRiskThreshold: number; // percentage
  commonPests: string[];
}

export const CROPS_DATA: CropMetadata[] = [
  {
    id: 'cotton',
    name: 'Cotton',
    hindiName: 'कपास (Kapas)',
    season: 'Kharif',
    optimalTempRange: [21, 35],
    maxWindSpeedForSprayingKmh: 14,
    criticalRainAvoidanceMm: 5,
    highHumidityFungalRiskThreshold: 75,
    commonPests: ['Pink Bollworm', 'Whitefly', 'Thrips']
  },
  {
    id: 'wheat',
    name: 'Wheat',
    hindiName: 'गेहूं (Gehun)',
    season: 'Rabi',
    optimalTempRange: [15, 25],
    maxWindSpeedForSprayingKmh: 15,
    criticalRainAvoidanceMm: 8,
    highHumidityFungalRiskThreshold: 70,
    commonPests: ['Yellow Rust', 'Aphids', 'Termites']
  },
  {
    id: 'rice',
    name: 'Paddy / Rice',
    hindiName: 'धान / चावल (Dhan)',
    season: 'Kharif',
    optimalTempRange: [22, 36],
    maxWindSpeedForSprayingKmh: 12,
    criticalRainAvoidanceMm: 20,
    highHumidityFungalRiskThreshold: 85,
    commonPests: ['Brown Planthopper', 'Stem Borer', 'Blast']
  },
  {
    id: 'mustard',
    name: 'Mustard',
    hindiName: 'सरसों (Sarson)',
    season: 'Rabi',
    optimalTempRange: [15, 26],
    maxWindSpeedForSprayingKmh: 12,
    criticalRainAvoidanceMm: 5,
    highHumidityFungalRiskThreshold: 75,
    commonPests: ['Mustard Aphid', 'White Rust', 'Alternaria Blight']
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    hindiName: 'गन्ना (Ganna)',
    season: 'Annual',
    optimalTempRange: [20, 38],
    maxWindSpeedForSprayingKmh: 18,
    criticalRainAvoidanceMm: 25,
    highHumidityFungalRiskThreshold: 80,
    commonPests: ['Early Shoot Borer', 'Pyrilla', 'Red Rot']
  },
  {
    id: 'soybean',
    name: 'Soybean',
    hindiName: 'सोयाबीन (Soybean)',
    season: 'Kharif',
    optimalTempRange: [20, 32],
    maxWindSpeedForSprayingKmh: 14,
    criticalRainAvoidanceMm: 10,
    highHumidityFungalRiskThreshold: 80,
    commonPests: ['Girdle Beetle', 'Spodoptera', 'Yellow Mosaic']
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    hindiName: 'मूंगफली (Mungfali)',
    season: 'Kharif',
    optimalTempRange: [22, 34],
    maxWindSpeedForSprayingKmh: 15,
    criticalRainAvoidanceMm: 10,
    highHumidityFungalRiskThreshold: 78,
    commonPests: ['Tikka Disease', 'Spodoptera Litura', 'Leaf Miner']
  },
  {
    id: 'tomato',
    name: 'Tomato',
    hindiName: 'टमाटर (Tamatar)',
    season: 'Rabi',
    optimalTempRange: [18, 30],
    maxWindSpeedForSprayingKmh: 12,
    criticalRainAvoidanceMm: 5,
    highHumidityFungalRiskThreshold: 70,
    commonPests: ['Early Blight', 'Late Blight', 'Fruit Borer']
  },
  {
    id: 'potato',
    name: 'Potato',
    hindiName: 'आलू (Aloo)',
    season: 'Rabi',
    optimalTempRange: [15, 24],
    maxWindSpeedForSprayingKmh: 14,
    criticalRainAvoidanceMm: 6,
    highHumidityFungalRiskThreshold: 72,
    commonPests: ['Late Blight', 'Aphids', 'Cutworms']
  }
];
