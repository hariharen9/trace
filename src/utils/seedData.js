import { doc, getDoc, setDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { DEMO_PLACES, JOURNAL_ENTRIES } from '../data';

// Session-level seeding lock to prevent React strict double-mount seeding race conditions
const activeSeeds = new Set();

const DEMO_TRIPS = [
  {
    emoji: '🇯🇵', name: 'Tokyo · Kyoto', destination: 'Japan',
    status: 'planning', startDate: '2025-09-14', endDate: '2025-09-28',
    coverColor: 'rgba(108,99,255,0.14)', notes: 'First time in Japan! Need to learn basic phrases.',
    days: [
      { label: 'Day 1', title: 'Arrive · Shinjuku check-in', stops: [
        { type: 'custom', name: 'Narita Airport', emoji: '✈️' },
        { type: 'custom', name: 'Shinjuku Hotel', emoji: '🏨' },
        { type: 'custom', name: 'Golden Gai', emoji: '🍺' },
      ]},
      { label: 'Day 2', title: 'Harajuku · Meiji · Shibuya', stops: [
        { type: 'custom', name: 'Meiji Shrine', emoji: '⛩️' },
        { type: 'custom', name: 'Takeshita Street', emoji: '🛍️' },
        { type: 'custom', name: 'Shibuya Crossing', emoji: '🚶' },
        { type: 'custom', name: 'Shibuya Sky', emoji: '🌃' },
        { type: 'custom', name: 'Ichiran Ramen', emoji: '🍜' },
      ]},
      { label: 'Day 3', title: 'TeamLab Planets · Odaiba', stops: [
        { type: 'custom', name: 'TeamLab Planets', emoji: '🎨' },
        { type: 'custom', name: 'Odaiba Seaside Park', emoji: '🌊' },
      ]},
      { label: 'Food', title: 'Must-try food spots', stops: [
        { type: 'custom', name: 'Tsukiji Outer Market', emoji: '🍣' },
        { type: 'custom', name: 'Afuri Ramen', emoji: '🍜' },
        { type: 'custom', name: 'Gyukatsu Motomura', emoji: '🥩' },
      ]},
    ],
  },
  {
    emoji: '🏖️', name: 'Goa Weekend', destination: 'Goa, India',
    status: 'completed', startDate: '2025-05-18', endDate: '2025-05-22',
    coverColor: 'rgba(16,185,129,0.14)', notes: 'Perfect beach escape. Need to go back for the monsoon season.',
    days: [
      { label: 'Day 1', title: 'Palolem Beach arrival', stops: [
        { type: 'custom', name: 'Palolem Beach Huts', emoji: '🏖️' },
        { type: 'custom', name: 'La Plage Restaurant', emoji: '🍽️' },
      ]},
      { label: 'Day 2', title: 'South Goa exploration', stops: [
        { type: 'custom', name: 'Cabo de Rama Fort', emoji: '🏰' },
        { type: 'custom', name: 'Cola Beach', emoji: '🌊' },
        { type: 'custom', name: 'Sublime Restaurant', emoji: '🍷' },
      ]},
      { label: 'Day 3', title: 'Food trail', stops: [
        { type: 'custom', name: 'Bhatti Village', emoji: '🍛' },
        { type: 'custom', name: 'Artjuna Garden Café', emoji: '☕' },
      ]},
    ],
  },
  {
    emoji: '🏔️', name: 'Coorg Escape', destination: 'Coorg, Karnataka',
    status: 'completed', startDate: '2025-02-03', endDate: '2025-02-05',
    coverColor: 'rgba(245,158,11,0.14)', notes: 'Coffee plantations and misty mornings. Short but sweet.',
    days: [
      { label: 'Day 1', title: 'Check-in & coffee trails', stops: [
        { type: 'custom', name: 'Tamara Coorg Resort', emoji: '🏡' },
        { type: 'custom', name: 'Coffee Plantation Walk', emoji: '☕' },
      ]},
      { label: 'Day 2', title: 'Abbey Falls & Raja Seat', stops: [
        { type: 'custom', name: 'Abbey Falls', emoji: '💧' },
        { type: 'custom', name: 'Raja Seat', emoji: '🌅' },
      ]},
    ],
  },
];

/**
 * Seeds demo places, journals & trips into a new user's Firestore on first login.
 * Idempotent — checks `users/{uid}/profile.seeded`, `seededJournals`, and `seededTrips` settings.
 */
export async function seedDemoData(uid) {
  if (activeSeeds.has(uid)) {
    return;
  }
  activeSeeds.add(uid);

  try {
    const profileRef = doc(db, 'users', uid, 'profile', 'settings');
    const profileSnap = await getDoc(profileRef);
    const data = profileSnap.exists() ? profileSnap.data() : {};

    const needsPlaces = !data.seeded;
    const needsJournals = !data.seededJournals;
    const needsTrips = !data.seededTrips;

    if (!needsPlaces && !needsJournals && !needsTrips) {
      return; // Already seeded everything
    }

    const batch = writeBatch(db);

    if (needsPlaces) {
      // Seed demo places
      DEMO_PLACES.forEach((place) => {
        const placeRef = doc(collection(db, 'users', uid, 'places'));
        batch.set(placeRef, {
          emoji: place.emoji,
          name: place.name,
          addr: place.addr,
          note: place.note || '',
          category: place.category,
          lat: place.lat,
          lng: place.lng,
          pinned: place.pinned || false,
          tags: place.tags || [],
          vibe: '',
          createdAt: serverTimestamp(),
        });
      });
      batch.set(profileRef, { seeded: true, seededAt: serverTimestamp() }, { merge: true });
    }

    if (needsJournals) {
      // Seed demo journals
      JOURNAL_ENTRIES.forEach((entry) => {
        const journalRef = doc(collection(db, 'users', uid, 'journals'));
        let lat = null;
        let lng = null;

        // Resolve coordinates & place link for seeded journals (matching default demo spots)
        if (entry.title.includes('Toit') || entry.loc.includes('Toit')) {
          lat = 12.9783; lng = 77.6408;
        } else if (entry.title.includes('Lalbagh') || entry.loc.includes('Lalbagh')) {
          lat = 12.9352; lng = 77.6245;
        } else if (entry.title.includes('Matteo') || entry.loc.includes('Matteo')) {
          lat = 12.9716; lng = 77.6099;
        }

        const date = new Date(`2025 ${entry.month} ${entry.day} 12:00:00`);

        batch.set(journalRef, {
          title: entry.title,
          body: entry.body,
          loc: entry.loc,
          placeId: '', // initially empty or optional link
          lat: lat,
          lng: lng,
          createdAt: date,
        });
      });
      batch.set(profileRef, { seededJournals: true, seededJournalsAt: serverTimestamp() }, { merge: true });
    }

    if (needsTrips) {
      // Seed demo trips
      DEMO_TRIPS.forEach((trip) => {
        const tripRef = doc(collection(db, 'users', uid, 'trips'));
        batch.set(tripRef, {
          ...trip,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      batch.set(profileRef, { seededTrips: true, seededTripsAt: serverTimestamp() }, { merge: true });
    }

    await batch.commit();
    console.log('[TRACE] Demo data seeding checked & updated');
  } catch (err) {
    activeSeeds.delete(uid);
    console.error('[TRACE] Seed error:', err);
  }
}
