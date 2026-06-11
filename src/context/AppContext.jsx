import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { seedDemoData } from '../utils/seedData';
import { MAP_STYLES } from '../components/MapView';

const AppContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);

/* ── MapLibre helpers ── */
function createMarkerElement(emoji, glow = false) {
  const el = document.createElement('div');
  el.style.fontSize = '24px';
  el.style.cursor = 'pointer';
  el.style.filter = `drop-shadow(0 3px 9px rgba(0,0,0,.55))${glow ? ' drop-shadow(0 0 10px #6c63ff)' : ''}`;
  el.style.transition = 'transform .15s';
  el.innerHTML = emoji;
  el.addEventListener('mouseover', () => el.style.transform = 'scale(1.2)');
  el.addEventListener('mouseout', () => el.style.transform = '');
  return el;
}

function popupHTML(p) {
  const safe = p.name.replace(/'/g, "\\'");
  return `<div class="popup-inner">
    <span class="popup-emoji">${p.emoji}</span>
    <div class="popup-name">${p.name}</div>
    <div class="popup-addr">${p.addr}</div>
    ${p.note ? `<div class="popup-note">"${p.note}"</div>` : ''}
    <div class="popup-actions">
      <button class="pop-btn" onclick="window.__trace.goJournal('${safe}')">📓 Journal</button>
      <button class="pop-btn" onclick="window.__trace.share('${safe}')">↗ Share</button>
      <button class="pop-btn" onclick="window.__trace.navigate(${p.lat},${p.lng})">→ Go</button>
    </div>
  </div>`;
}

function closeAllPopups() {
  const closeBtns = document.querySelectorAll('.maplibregl-popup-close-button');
  closeBtns.forEach(b => b.click());
}

function addMarkerToMap(map, place, glow = false) {
  const el = createMarkerElement(place.emoji, glow);
  const popup = new maplibregl.Popup({ offset: [0, -10], maxWidth: '300px' })
    .setHTML(popupHTML(place));
    
  return new maplibregl.Marker({ element: el })
    .setLngLat([place.lng, place.lat])
    .setPopup(popup)
    .addTo(map);
}

/* ── Provider ── */
export function AppProvider({ children }) {
  const { user } = useAuth();
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const tempPinRef = useRef(null);
  const markersRef = useRef([]);
  const seededRef = useRef(false);

  const [activeTab, setActiveTab] = useState('places');
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [placeToEdit, setPlaceToEdit] = useState(null);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [ctxMenu, setCtxMenu] = useState({ show: false, x: 0, y: 0 });
  const [ctxLatLng, setCtxLatLng] = useState(null);
  const [mapStyle, setMapStyleState] = useState('streets');
  const [satOn, setSatOn] = useState(false);
  const [onboardVisible, setOnboardVisible] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  // ── Seed demo data on first login, then subscribe to Firestore ──
  useEffect(() => {
    if (!user) {
      setSavedPlaces([]);
      setPlacesLoading(false);
      setCollections([]);
      setCollectionsLoading(false);
      return;
    }

    let unsubscribePlaces = () => {};
    let unsubscribeCols = () => {};

    const init = async () => {
      // Seed once per session
      if (!seededRef.current) {
        await seedDemoData(user.uid);
        seededRef.current = true;
      }

      // Subscribe to places
      const placesRef = query(
        collection(db, 'users', user.uid, 'places'),
        orderBy('createdAt', 'desc')
      );

      unsubscribePlaces = onSnapshot(placesRef, (snapshot) => {
        const places = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSavedPlaces(places);
        setPlacesLoading(false);

        // Sync markers on map
        const map = mapRef.current;
        if (map) {
          markersRef.current.forEach((m) => m.remove());
          markersRef.current = [];
          places.forEach((p) => {
            const m = addMarkerToMap(map, p);
            markersRef.current.push(m);
          });
        }
      }, (err) => {
        console.error('Firestore sync error:', err);
        setPlacesLoading(false);
      });

      // Subscribe to collections
      const colsRef = query(
        collection(db, 'users', user.uid, 'collections'),
        orderBy('createdAt', 'desc')
      );

      unsubscribeCols = onSnapshot(colsRef, (snapshot) => {
        const cols = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCollections(cols);
        setCollectionsLoading(false);
      }, (err) => {
        console.error('Firestore sync error (collections):', err);
        setCollectionsLoading(false);
      });
    };

    init();
    return () => {
      unsubscribePlaces();
      unsubscribeCols();
    };
  }, [user]);

  // ── Core actions ──
  const flyTo = useCallback((lat, lng, zoom = 16) => {
    closeAllPopups();
    mapRef.current?.flyTo({ center: [lng, lat], zoom, speed: 1.2 });
  }, []);

  const showToast = useCallback((msg, type = '') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const switchTab = useCallback((panel) => setActiveTab(panel), []);

  // ── Modal controls ──
  const openPlaceModal = useCallback((latlng = null, place = null) => {
    if (latlng) setCtxLatLng(latlng);
    setPlaceToEdit(place);
    setPlaceModalOpen(true);
  }, []);
  const closePlaceModal = useCallback(() => { 
    setPlaceModalOpen(false); 
    setPlaceToEdit(null);
  }, []);
  
  const openCollectionModal = useCallback(() => setCollectionModalOpen(true), []);
  const closeCollectionModal = useCallback(() => setCollectionModalOpen(false), []);

  const openAIModal = useCallback(() => setAiModalOpen(true), []);
  const closeAIModal = useCallback(() => setAiModalOpen(false), []);

  // ── Context menu ──
  const showCtxMenu = useCallback((x, y, latlng) => {
    setCtxLatLng(latlng);
    setCtxMenu({ show: true, x, y });
  }, []);
  const hideCtxMenu = useCallback(() => setCtxMenu({ show: false, x: 0, y: 0 }), []);

  // ── Map style (swap MapTiler style) ──
  const changeMapStyle = useCallback((style) => {
    setMapStyleState(style);
    const map = mapRef.current;
    if (!map) return;
    const url = MAP_STYLES[style] || MAP_STYLES.streets;
    map.setStyle(url);
  }, []);

  const toggleSatellite = useCallback(() => {
    setSatOn(prev => {
      const next = !prev;
      changeMapStyle(next ? 'satellite' : 'streets');
      return next;
    });
  }, [changeMapStyle]);

  // ── Add place (Firestore) ──
  const addPlace = useCallback(async (place) => {
    const map = mapRef.current;
    if (!map || !user) return;
    
    // maplibre getCenter returns an object {lng, lat}
    const center = map.getCenter();
    const ll = ctxLatLng || { lat: center.lat, lng: center.lng };

    const newPlace = {
      ...place,
      lat: ll.lat,
      lng: ll.lng,
      pinned: false,
      tags: place.tags || [],
      createdAt: serverTimestamp(),
    };

    try {
      const placesRef = collection(db, 'users', user.uid, 'places');
      await addDoc(placesRef, newPlace);
      map.flyTo({ center: [ll.lng, ll.lat], zoom: 16, speed: 1.2 });
      setCtxLatLng(null);
      closePlaceModal();
      showToast(`${newPlace.emoji} "${newPlace.name}" saved`, 'ok');
    } catch (err) {
      console.error('Error saving place:', err);
      showToast('❌ Failed to save place');
    }
  }, [user, ctxLatLng, closePlaceModal, showToast]);

  // ── Delete place (Firestore) ──
  const deletePlace = useCallback(async (placeId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'places', placeId));
      showToast('🗑️ Place removed', 'ok');
    } catch (err) {
      console.error('Error deleting place:', err);
      showToast('❌ Failed to delete');
    }
  }, [user, showToast]);

  // ── Toggle pin (Firestore) ──
  const togglePin = useCallback(async (placeId, currentPinned) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'places', placeId), {
        pinned: !currentPinned,
      });
      showToast(!currentPinned ? '📌 Pinned' : '📌 Unpinned', 'ok');
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  }, [user, showToast]);

  // ── Update place (Firestore) ──
  const updatePlace = useCallback(async (placeId, updates) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'places', placeId), updates);
      closePlaceModal();
      showToast('✏️ Place updated', 'ok');
    } catch (err) {
      console.error('Error updating place:', err);
      showToast('❌ Failed to update');
    }
  }, [user, closePlaceModal, showToast]);

  // ── Collection actions ──
  const addCollection = useCallback(async (col) => {
    if (!user) return;
    try {
      const colRef = collection(db, 'users', user.uid, 'collections');
      await addDoc(colRef, { ...col, createdAt: serverTimestamp() });
      closeCollectionModal();
      showToast(`📁 Collection created`, 'ok');
    } catch (err) {
      console.error('Error saving collection:', err);
      showToast('❌ Failed to save collection');
    }
  }, [user, closeCollectionModal, showToast]);

  const deleteCollection = useCallback(async (colId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'collections', colId));
      showToast('🗑️ Collection removed', 'ok');
    } catch (err) {
      console.error('Error deleting collection:', err);
      showToast('❌ Failed to delete collection');
    }
  }, [user, showToast]);

  // ── Map actions ──
  const dropPin = useCallback((latlng) => {
    const map = mapRef.current;
    if (!map || !latlng) return;
    if (tempPinRef.current) tempPinRef.current.remove();
    
    tempPinRef.current = new maplibregl.Marker({ element: createMarkerElement('📍') })
      .setLngLat([latlng.lng, latlng.lat])
      .addTo(map);
      
    map.flyTo({ center: [latlng.lng, latlng.lat], zoom: 15, speed: 1.2 });
    showToast('📍 Pin dropped');
  }, [showToast]);

  const navigateTo = useCallback((lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }, []);

  const copyCoords = useCallback((latlng) => {
    if (!latlng) return;
    const txt = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
    navigator.clipboard?.writeText(txt)
      .then(() => showToast(`📋 ${txt}`))
      .catch(() => showToast('Copied!'));
  }, [showToast]);

  const locateMe = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (userMarkerRef.current) userMarkerRef.current.remove();
        
        const el = document.createElement('div');
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.borderRadius = '50%';
        el.style.background = '#6c63ff';
        el.style.border = '2.5px solid white';
        el.style.boxShadow = '0 0 0 5px rgba(108,99,255,.25)';
        
        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);
          
        map.flyTo({ center: [lng, lat], zoom: 15, speed: 1.2 });
        showToast('📍 You are here', 'ok');
      },
      () => {
        map.flyTo({ center: [77.5946, 12.9716], zoom: 14, speed: 1.2 });
        showToast('📍 Location demo: Bengaluru');
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }, [showToast]);

  // ── Window globals for popup buttons ──
  useEffect(() => {
    window.__trace = {
      goJournal: (name) => {
        closeAllPopups();
        setActiveTab('journal');
        showToast(`📓 Entry for ${name}`);
      },
      share: (name) => {
        closeAllPopups();
        if (navigator.share) {
          navigator.share({ title: name, text: `Check out ${name} on TRACE`, url: location.href });
        } else {
          navigator.clipboard?.writeText(`${name} — saved in TRACE`);
          showToast('🔗 Copied');
        }
      },
      navigate: (lat, lng) => {
        closeAllPopups();
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      },
    };
    return () => { delete window.__trace; };
  }, [showToast]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openAIModal();
      } else if (e.key === 'Escape') {
        closePlaceModal();
        closeCollectionModal();
        closeAIModal();
        hideCtxMenu();
      } else if (e.key === 'n' && !e.target.matches('input, textarea')) {
        openPlaceModal();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openAIModal, closePlaceModal, closeCollectionModal, closeAIModal, hideCtxMenu, openPlaceModal]);

  // ── URL params on mount ──
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (p.get('action') === 'add') openPlaceModal();
    if (p.get('action') === 'search') openAIModal();
    if (p.get('tab')) setActiveTab(p.get('tab'));
  }, [openPlaceModal, openAIModal]);

  // ── Init map — no static markers, Firestore listener handles everything ──
  const initMarkers = useCallback((map) => {
    // Re-render any already-loaded places when map initializes
    savedPlaces.forEach(p => {
      const m = addMarkerToMap(map, p);
      markersRef.current.push(m);
    });
  }, [savedPlaces]);

  const value = {
    mapRef, activeTab, switchTab,
    placeModalOpen, placeToEdit, openPlaceModal, closePlaceModal,
    collectionModalOpen, openCollectionModal, closeCollectionModal,
    aiModalOpen, openAIModal, closeAIModal,
    ctxMenu, ctxLatLng, showCtxMenu, hideCtxMenu,
    mapStyle, changeMapStyle, satOn, toggleSatellite,
    onboardVisible, setOnboardVisible,
    toasts, showToast,
    savedPlaces, placesLoading, addPlace, deletePlace, togglePin, updatePlace,
    collections, collectionsLoading, addCollection, deleteCollection,
    flyTo, locateMe, dropPin, navigateTo, copyCoords,
    initMarkers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
