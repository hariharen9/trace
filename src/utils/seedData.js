import { doc, getDoc, setDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { DEMO_PLACES, JOURNAL_ENTRIES } from '../data';

// Session-level seeding lock to prevent React strict double-mount seeding race conditions
const activeSeeds = new Set();

/**
 * Seeds demo places & journals into a new user's Firestore on first login.
 * Idempotent — checks `users/{uid}/profile.seeded` and `seededJournals` settings.
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

    if (!needsPlaces && !needsJournals) {
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

    await batch.commit();
    console.log('[TRACE] Demo data seeding checked & updated');
  } catch (err) {
    activeSeeds.delete(uid);
    console.error('[TRACE] Seed error:', err);
  }
}
