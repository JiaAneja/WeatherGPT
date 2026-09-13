import { LocationResolver } from '../utils/locationResolver.js';

export type UserIntent =
  | 'FORECAST'
  | 'COMMUTE'
  | 'OUTDOOR_ACTIVITY'
  | 'AGRICULTURE'
  | 'TRAVEL'
  | 'DISASTER'
  | 'CLIMATE'
  | 'GENERAL';

export interface ExtractedQueryEntities {
  intent: UserIntent;
  location: string;
  detectedDistrictId: string;
  dateText: string;
  timeRange: string | null;
  activity: string | null;
  transport: string | null;
  crop: string | null;
  rawQuery: string;
}

export class QueryAnalyzer {
  static analyze(query: string, defaultLocation = 'Ahmedabad'): ExtractedQueryEntities {
    const lower = query.toLowerCase();

    // 1. Detect location from sentence
    const detectedInSentence = LocationResolver.findInSentence(query);
    const resolvedDistrict = detectedInSentence || LocationResolver.resolve(defaultLocation);

    // 2. Extract Date / Time window
    let dateText = 'today';
    if (lower.includes('tomorrow') || lower.includes('kal')) {
      dateText = 'tomorrow';
    } else if (lower.includes('weekend')) {
      dateText = 'this weekend';
    } else if (lower.includes('tonight')) {
      dateText = 'tonight';
    }

    let timeRange: string | null = null;
    const timeRegex = /(\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b)/i;
    const timeMatch = lower.match(timeRegex);
    if (timeMatch) {
      timeRange = timeMatch[1].toUpperCase();
    } else if (lower.includes('morning') || lower.includes('subah')) {
      timeRange = 'morning (06:00 - 10:00)';
    } else if (lower.includes('afternoon') || lower.includes('dopahar')) {
      timeRange = 'afternoon (12:00 - 16:00)';
    } else if (lower.includes('evening') || lower.includes('shaam')) {
      timeRange = 'evening (17:00 - 20:00)';
    } else if (lower.includes('night') || lower.includes('raat')) {
      timeRange = 'night (21:00 - 05:00)';
    }

    // 3. Extract transport
    let transport: string | null = null;
    if (lower.includes('bike') || lower.includes('motorcycle') || lower.includes('scooter') || lower.includes('two-wheeler')) {
      transport = 'two-wheeler (bike/scooter)';
    } else if (lower.includes('car') || lower.includes('drive') || lower.includes('driving')) {
      transport = 'car / personal vehicle';
    } else if (lower.includes('bus') || lower.includes('metro') || lower.includes('public transport')) {
      transport = 'public transit';
    }

    // 4. Extract Activity
    let activity: string | null = null;
    if (lower.includes('cricket')) activity = 'cricket';
    else if (lower.includes('football') || lower.includes('soccer')) activity = 'football';
    else if (lower.includes('run') || lower.includes('running') || lower.includes('jog')) activity = 'running';
    else if (lower.includes('cycling') || lower.includes('cycle')) activity = 'cycling';
    else if (lower.includes('walk') || lower.includes('walking')) activity = 'walking';
    else if (lower.includes('spray') || lower.includes('spraying') || lower.includes('pesticide')) activity = 'spraying';
    else if (lower.includes('irrigate') || lower.includes('irrigation') || lower.includes('pani')) activity = 'irrigation';
    else if (lower.includes('harvest') || lower.includes('harvesting') || lower.includes('katai')) activity = 'harvesting';
    else if (lower.includes('picnic') || lower.includes('outdoor')) activity = 'outdoor event';

    // 5. Extract Crop
    let crop: string | null = null;
    const cropKeywords = ['cotton', 'wheat', 'rice', 'paddy', 'groundnut', 'sugarcane', 'soybean', 'mustard', 'maize', 'pulses'];
    for (const c of cropKeywords) {
      if (lower.includes(c)) {
        crop = c.charAt(0).toUpperCase() + c.slice(1);
        break;
      }
    }

    // 6. Determine Primary Intent
    // Greetings and casual conversation must never be treated as weather queries.
    let intent: UserIntent = 'GENERAL';
    const greetingPattern = /\b(hi|hello|hey|hii|hiii|namaste|namaskar|sat sri akal|good morning|good afternoon|good evening|good night)\b/i;
    const casualPattern = /\b(thanks|thank you|thx|okay|ok|nice|great|cool|bye|goodbye|who are you|what can you do|help me|how are you)\b/i;

    if (greetingPattern.test(query) || casualPattern.test(query)) {
      intent = 'GENERAL';
    } else if (
      lower.includes('college') ||
      lower.includes('school') ||
      lower.includes('office') ||
      lower.includes('commute') ||
      transport !== null
    ) {
      intent = 'COMMUTE';
    } else if (
      lower.includes('farmer') ||
      lower.includes('kisan') ||
      lower.includes('crop') ||
      lower.includes('fasil') ||
      activity === 'spraying' ||
      activity === 'irrigation' ||
      activity === 'harvesting'
    ) {
      intent = 'AGRICULTURE';
    } else if (
      lower.includes('travel') ||
      lower.includes('highway') ||
      lower.includes('drive to') ||
      lower.includes('trip') ||
      lower.includes('safe to go')
    ) {
      intent = 'TRAVEL';
    } else if (
      activity === 'cricket' ||
      activity === 'football' ||
      activity === 'running' ||
      activity === 'cycling' ||
      lower.includes('play') ||
      lower.includes('match')
    ) {
      intent = 'OUTDOOR_ACTIVITY';
    } else if (
      lower.includes('warning') ||
      lower.includes('alert') ||
      lower.includes('cyclone') ||
      lower.includes('flood') ||
      lower.includes('heatwave')
    ) {
      intent = 'DISASTER';
    } else if (
      lower.includes('trend') ||
      lower.includes('climate') ||
      lower.includes('historical') ||
      lower.includes('monsoon departure') ||
      lower.includes('rainfall trend')
    ) {
      intent = 'CLIMATE';
    } else if (
      lower.includes('rain') ||
      lower.includes('umbrella') ||
      lower.includes('forecast') ||
      lower.includes('weather tomorrow') ||
      lower.includes('temperature')
    ) {
      intent = 'FORECAST';
    }

    return {
      intent,
      location: resolvedDistrict.name,
      detectedDistrictId: resolvedDistrict.id,
      dateText,
      timeRange,
      activity,
      transport,
      crop,
      rawQuery: query,
    };
  }
}
