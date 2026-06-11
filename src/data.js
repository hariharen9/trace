// ═══════════════════════════════════
//  MAPZ · Demo Data
// ═══════════════════════════════════

export const DEMO_PLACES = [
  { id: 1, lat: 12.9716, lng: 77.5946, emoji: '☕', name: 'Third Wave Coffee', addr: 'Indiranagar, Bengaluru', note: 'The cortado here hits different. Best work-from-café energy in the city.', category: 'Café', pinned: true, visitedAgo: 'visited 3 days ago', tags: ['work', 'morning'] },
  { id: 2, lat: 12.9352, lng: 77.6245, emoji: '🌅', name: 'Lalbagh Rock', addr: 'Lalbagh Botanical Garden', note: 'Golden hour here is unreal. 5:45pm is the sweet spot.', category: 'Photo', pinned: true, visitedAgo: 'visited 2 weeks ago', tags: ['photography'] },
  { id: 3, lat: 12.9698, lng: 77.7500, emoji: '🎮', name: 'Play Zone', addr: 'Whitefield, Bengaluru', note: '', category: 'Memory', pinned: false, visitedAgo: 'yesterday', tags: ['gaming', 'friends'] },
  { id: 4, lat: 12.9279, lng: 77.6271, emoji: '🍛', name: 'Meghana Foods', addr: 'Koramangala, Bengaluru', note: 'Best biryani in Bangalore. Period.', category: 'Food', pinned: false, visitedAgo: '3 days ago', tags: ['biryani'] },
  { id: 5, lat: 12.9716, lng: 77.6099, emoji: '💍', name: 'Matteo Coffea', addr: 'Church Street', note: 'First date. Filter coffee.', category: 'Memory', pinned: false },
  { id: 6, lat: 12.9783, lng: 77.6408, emoji: '🍺', name: 'Toit Brewpub', addr: 'Indiranagar', note: "Arjun's birthday rooftop", category: 'Food', pinned: false },
];

export const COLLECTIONS = [
  { id: 1, emoji: '☕', name: 'Best Cafés', count: '12 places · Bengaluru', color: 'rgba(245,158,11,0.12)' },
  { id: 2, emoji: '🌇', name: 'Date Spots', count: '7 places · Bengaluru', color: 'rgba(244,63,94,0.12)' },
  { id: 3, emoji: '🍜', name: 'Biryani Trail', count: '9 places · BLR + Hyd', color: 'rgba(16,185,129,0.12)' },
];

export const TIMELINE = [
  { id: 1, emoji: '🎂', title: "Arjun's Birthday Dinner", sub: 'Toit Brewpub · Jun 28 · 8pm', mood: '😄 Epic night', highlighted: true, month: 'June 2025' },
  { id: 2, emoji: '🌅', title: 'Lalbagh Sunrise Walk', sub: 'Lalbagh Garden · Jun 22 · 6am', mood: '🧘 Peaceful', highlighted: false },
  { id: 3, emoji: '☕', title: 'Deep work session', sub: 'Third Wave · Jun 20 · 9:30am', mood: '💻 Productive', highlighted: false },
  { id: 4, emoji: '🏖️', title: 'Goa Trip — Day 1', sub: 'Palolem Beach · May 18–22', mood: '🌊 Adventure', highlighted: true, month: 'May 2025' },
  { id: 5, emoji: '🍜', title: 'Best biryani ever?', sub: 'Meghana Foods · May 12', mood: '😭 Emotional', highlighted: false },
  { id: 6, emoji: '💍', title: 'First date — Noon', sub: 'Matteo Coffea · May 4', mood: '🫀 Heart full', highlighted: false },
  { id: 7, emoji: '🎓', title: 'Joined new company', sub: 'MG Road Area · May 1', mood: '🚀 New chapter', highlighted: false },
];

export const TRIPS = [
  {
    id: 1, flag: '🇯🇵', name: 'Tokyo · Kyoto', date: 'Sep 14 – Sep 28, 2025', status: 'Planning', statusClass: 'planning',
    days: [
      { label: 'Day 1', desc: 'Arrive · Shinjuku check-in', spots: '3 spots' },
      { label: 'Day 2', desc: 'Harajuku · Meiji · Shibuya', spots: '5 spots' },
      { label: 'Day 3', desc: 'TeamLab Planets · Odaiba', spots: '2 spots' },
      { label: 'Food', desc: 'Ramen · Sushi · Gyoza…', spots: '14 spots' },
    ],
  },
  {
    id: 2, flag: '🏖️', name: 'Goa Weekend', date: 'May 18 – 22, 2025', status: 'Done', statusClass: 'done',
    days: [
      { label: 'Stay', desc: 'Palolem Beach Huts', spots: '✓ Checked' },
      { label: 'Food', desc: 'La Plage · Sublime · Bhatti', spots: '8 spots' },
    ],
  },
  {
    id: 3, flag: '🏔️', name: 'Coorg Escape', date: 'Feb 3 – 5, 2025', status: 'Done', statusClass: 'done',
    days: [
      { label: 'Stay', desc: 'Tamara Coorg Resort', spots: '3 nights' },
    ],
  },
];

export const JOURNAL_ENTRIES = [
  { id: 1, day: '28', month: 'Jun', title: "Arjun's birthday — Toit nights", loc: '📍 Toit Brewpub, Indiranagar', body: 'Ten of us crammed into the rooftop corner. The mango wheat beer was cold, the laughter was loud, and somewhere between the nachos and midnight, I remembered why this city feels like home.' },
  { id: 2, day: '22', month: 'Jun', title: '6am walk at Lalbagh', loc: '📍 Lalbagh Botanical Garden', body: 'The giant rock at sunrise. Nobody around, just pigeons and morning light cutting through the jacaranda trees. Brought my AirPods and a coffee. Need to do this every week.' },
  { id: 3, day: '04', month: 'May', title: 'First date. Matteo Coffea.', loc: '📍 Matteo Coffea, Church Street', body: 'The filter coffee was excellent. The conversation was better. I keep coming back to this place now — it has an energy I can\'t quite explain.' },
];

export const STATS = {
  total: 147,
  cafes: 38,
  trips: 3,
  journals: 22,
  cities: 6,
  topSpots: [
    { emoji: '☕', name: 'Third Wave Coffee', visits: 'Visited 14× this year', rank: '#1', badgeClass: 'bc' },
    { emoji: '🍛', name: 'Meghana Foods', visits: 'Visited 8× this year', rank: '#2', badgeClass: 'bf' },
    { emoji: '🌅', name: 'Lalbagh Garden', visits: 'Visited 6× this year', rank: '#3', badgeClass: 'bp' },
  ],
  wrapped: [
    { label: '☕ Most visited category', value: 'Cafés (38)' },
    { label: '📍 Furthest from home', value: 'Palolem, Goa' },
    { label: '🔥 Longest streak', value: '14 days in a row' },
    { label: '⏰ Fav time to explore', value: '9–11am' },
    { label: '🌆 Most explored area', value: 'Indiranagar' },
  ],
  shortcuts: [
    { action: 'Global Search', key: '⌘K' },
    { action: 'New place', key: 'N' },
    { action: 'Context menu', key: 'Right-click map' },
    { action: 'Close / dismiss', key: 'Esc' },
  ],
  sparkData: [8, 12, 6, 15, 11, 18, 14, 22, 17, 25, 20, 29],
};



export const EMOJI_OPTIONS = [
  { group: 'Food & Drink', emojis: ['☕', '🍛', '🍺', '🍷', '🍔', '🍕', '🍜', '🍦', '🥂', '🥐'] },
  { group: 'Nature & Places', emojis: ['🌅', '🌿', '🌲', '🏕️', '🏖️', '🌊', '🏔️', '⛩️', '🏰'] },
  { group: 'Activities', emojis: ['🎮', '🎵', '📚', '🎬', '🎟️', '🚲', '⚽', '🎸'] },
  { group: 'Life & Work', emojis: ['💼', '💻', '🎓', '💍', '❤️', '🎉', '💡', '🏡', '🏠', '📍', '✈️', '📁'] }
];
export const CATEGORY_OPTIONS = ['Café', 'Food', 'Memory', 'Work', 'Photo spot', 'Hidden gem', 'Date spot'];
export const VIBE_OPTIONS = ['😄 Joyful', '🧘 Peaceful', '💻 Productive', '🌊 Adventure', '🫀 Emotional', '🚀 Energized'];


export const MAP_FILTERS = {
  dark: 'invert(1) hue-rotate(180deg) brightness(0.68) saturate(0.52) contrast(1.15)',
  topo: 'invert(0.82) hue-rotate(175deg) brightness(0.78) saturate(0.85)',
  streets: 'invert(0.9) hue-rotate(190deg) brightness(0.72) saturate(0.7) contrast(1.05)',
  satellite: 'brightness(1) saturate(1.1)',
};

export const BADGE_STYLES = {
  'Café': { bg: 'rgba(245,158,11,0.14)', color: '#f59e0b' },
  'Food': { bg: 'rgba(249,115,22,0.14)', color: '#f97316' },
  'Memory': { bg: 'rgba(108,99,255,0.14)', color: '#a78bfa' },
  'Work': { bg: 'rgba(20,184,166,0.14)', color: '#14b8a6' },
  'Photo': { bg: 'rgba(244,63,94,0.14)', color: '#f43f5e' },
  'Photo spot': { bg: 'rgba(244,63,94,0.14)', color: '#f43f5e' },
  'Hidden gem': { bg: 'rgba(108,99,255,0.14)', color: '#a78bfa' },
  'Date spot': { bg: 'rgba(244,63,94,0.14)', color: '#f43f5e' },
};
