export interface DistrictRecord {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast';
  aliases?: string[];
}

export const INDIAN_DISTRICTS_DATA: DistrictRecord[] = [
  { id: 'delhi', name: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, region: 'North', aliases: ['delhi', 'ncr', 'noida', 'gurgaon', 'gurugram'] },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, region: 'West', aliases: ['bombay', 'navi mumbai', 'thane'] },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, region: 'South', aliases: ['bangalore', 'whitefield', 'electronic city'] },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, region: 'West', aliases: ['amdavad', 'gandhinagar'] },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, region: 'East', aliases: ['calcutta', 'howrah'] },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, region: 'South', aliases: ['madras'] },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, region: 'South', aliases: ['secunderabad', 'cyberabad'] },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, region: 'West', aliases: ['poona', 'pcmc'] },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, region: 'North', aliases: ['pink city'] },
  { id: 'surat', name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, region: 'West' },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, region: 'North' },
  { id: 'shimla', name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, region: 'North' },
  { id: 'guwahati', name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362, region: 'Northeast', aliases: ['gauhati', 'dispur', 'kamrup'] },
  { id: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245, region: 'East', aliases: ['cuttack', 'puri', 'odisha'] },
  { id: 'patna', name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, region: 'East' },
  { id: 'kochi', name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, region: 'South', aliases: ['cochin', 'ernakulam'] },
  { id: 'srinagar', name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973, region: 'North', aliases: ['kashmir'] },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, region: 'Central' },
  { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, region: 'Central' },
  { id: 'chandigarh', name: 'Chandigarh', state: 'Punjab / Haryana', lat: 30.7333, lng: 76.7794, region: 'North', aliases: ['mohali', 'panchkula'] },
  { id: 'amritsar', name: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723, region: 'North' },
  { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, region: 'North', aliases: ['banaras', 'kashi'] },
  { id: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, region: 'South', aliases: ['vizag'] },
  { id: 'rajkot', name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022, region: 'West', aliases: ['saurashtra'] },
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, region: 'Central' },
  { id: 'dehradun', name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322, region: 'North', aliases: ['doon', 'mussoorie', 'rishikesh'] },
  { id: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243, region: 'North', aliases: ['marwar'] },
  { id: 'shillong', name: 'Shillong', state: 'Meghalaya', lat: 25.5788, lng: 91.8933, region: 'Northeast' },
  { id: 'ranchi', name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3096, region: 'East' },
  { id: 'raipur', name: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lng: 81.6296, region: 'Central' },
  { id: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, region: 'South' },
  { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125, region: 'North' },
  { id: 'rohtak', name: 'Rohtak', state: 'Haryana', lat: 28.8955, lng: 76.6066, region: 'North' },
  { id: 'himmatnagar', name: 'Himmatnagar', state: 'Gujarat', lat: 23.5977, lng: 72.9698, region: 'West' },
  { id: 'shamlaji', name: 'Shamlaji', state: 'Gujarat', lat: 23.6896, lng: 73.3855, region: 'West' },
];

export class LocationResolver {
  static search(query: string): DistrictRecord[] {
    if (!query || !query.trim()) return INDIAN_DISTRICTS_DATA.slice(0, 10);
    const q = query.toLowerCase().trim();
    return INDIAN_DISTRICTS_DATA.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.aliases?.some((a) => a.includes(q))
    );
  }

  static findInSentence(sentence: string): DistrictRecord | null {
    if (!sentence) return null;
    const lower = sentence.toLowerCase();

    // Sort by name length descending so multi-word names like "New Delhi" match before "Delhi"
    const sorted = [...INDIAN_DISTRICTS_DATA].sort((a, b) => b.name.length - a.name.length);
    for (const d of sorted) {
      if (
        lower.includes(d.name.toLowerCase()) ||
        lower.includes(d.id.toLowerCase()) ||
        d.aliases?.some((a) => lower.includes(a.toLowerCase()))
      ) {
        return d;
      }
    }
    return null;
  }

  static resolve(queryOrCoords: string | { lat: number; lng: number }): DistrictRecord {
    if (typeof queryOrCoords === 'object' && queryOrCoords.lat !== undefined) {
      const { lat, lng } = queryOrCoords;
      let closest = INDIAN_DISTRICTS_DATA[0];
      let minDistance = Infinity;
      for (const d of INDIAN_DISTRICTS_DATA) {
        const dist = Math.hypot(d.lat - lat, d.lng - lng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = d;
        }
      }
      return closest;
    }

    const matches = this.search(queryOrCoords as string);
    if (matches.length > 0) return matches[0];
    return INDIAN_DISTRICTS_DATA.find((d) => d.id === 'ahmedabad') || INDIAN_DISTRICTS_DATA[0];
  }
}
