import { doc, getDoc, setDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { DEMO_PLACES } from '../data';

/**
 * Seeds demo places into a new user's Firestore on first login.
 * Idempotent — checks `users/{uid}/profile.seeded` before writing.
 */
export async function seedDemoData(uid) {
  try {
    const profileRef = doc(db, 'users', uid, 'profile', 'settings');
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists() && profileSnap.data().seeded) {
      return; // Already seeded
    }

    const batch = writeBatch(db);

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

    // Mark as seeded
    batch.set(profileRef, { seeded: true, seededAt: serverTimestamp() });

    await batch.commit();
    console.log('[TRACE] Demo data seeded for new user');
  } catch (err) {
    console.error('[TRACE] Seed error:', err);
  }
}
