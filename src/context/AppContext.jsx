import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import L from 'leaflet';
import { DEMO_PLACES, MAP_FILTERS } from '../data';

const AppContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);

/* ── Leaflet helpers ── */
function markerIcon(emoji, glow = false) {
  return L.divIcon({
    className: '',
    html: `<div style="font-size:24px;cursor:pointer;filter:drop-shadow(0 3px 9px rgba(0,0,0,.55))${glow ? ' drop-shadow(0 0 10px #6c63ff)' : ''};transition:transform .15s" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform=''">${emoji}</div>`,
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20],
  });
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

function addMarkerToMap(map, place, glow = false) {
  const m = L.marker([place.lat, place.lng], { icon: markerIcon(place.emoji, glow) });
  m.bindPopup(popupHTML(place), { maxWidth: 300 });
  m.addTo(map);
  return m;
}

/* ── Provider ── */
export function AppProvider({ children }) {
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const tempPinRef = useRef(null);

  const [activeTab, setActiveTab] = useState('places');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [ctxMenu, setCtxMenu] = useState({ show: false, x: 0, y: 0 });
  const [ctxLatLng, setCtxLatLng] = useState(null);
  const [mapStyle, setMapStyleState] = useState('dark');
  const [satOn, setSatOn] = useState(false);
  const [onboardVisible, setOnboardVisible] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState(() => {
    try { return JSON.parse(localStorage.getItem('trace_places') || '[]'); } catch { return []; }
  });

  // ── Sync saved places to localStorage ──
  useEffect(() => {
    localStorage.setItem('trace_places', JSON.stringify(savedPlaces));
  }, [savedPlaces]);

  // ── Core actions ──
  const flyTo = useCallback((lat, lng, zoom = 16) => {
    mapRef.current?.closePopup();
    mapRef.current?.flyTo([lat, lng], zoom, { duration: 1.0, easeLinearity: 0.18 });
  }, []);

  const showToast = useCallback((msg, type = '') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const switchTab = useCallback((panel) => setActiveTab(panel), []);

  // ── Modal controls ──
  const openAddModal = useCallback((latlng) => {
    if (latlng) setCtxLatLng(latlng);
    setAddModalOpen(true);
  }, []);
  const closeAddModal = useCallback(() => { setAddModalOpen(false); }, []);
  const openAIModal = useCallback(() => setAiModalOpen(true), []);
  const closeAIModal = useCallback(() => setAiModalOpen(false), []);

  // ── Context menu ──
  const showCtxMenu = useCallback((x, y, latlng) => {
    setCtxLatLng(latlng);
    setCtxMenu({ show: true, x, y });
  }, []);
  const hideCtxMenu = useCallback(() => setCtxMenu({ show: false, x: 0, y: 0 }), []);

  // ── Map style ──
  const applyMapFilter = useCallback((style) => {
    const tp = document.querySelector('.leaflet-tile-pane');
    if (tp) tp.style.filter = MAP_FILTERS[style] || MAP_FILTERS.dark;
  }, []);

  const changeMapStyle = useCallback((style) => {
    setMapStyleState(style);
    applyMapFilter(style);
  }, [applyMapFilter]);

  const toggleSatellite = useCallback(() => {
    setSatOn(prev => {
      const next = !prev;
      changeMapStyle(next ? 'satellite' : 'dark');
      return next;
    });
  }, [changeMapStyle]);

  // ── Add place ──
  const addPlace = useCallback((place) => {
    const map = mapRef.current;
    if (!map) return;
    const ll = ctxLatLng || map.getCenter();
    const newPlace = { ...place, lat: ll.lat, lng: ll.lng, id: Date.now() };
    const m = addMarkerToMap(map, newPlace, true);
    m.openPopup();
    map.flyTo([ll.lat, ll.lng], 16, { duration: 0.8 });
    setSavedPlaces(prev => [...prev, newPlace]);
    setCtxLatLng(null);
    closeAddModal();
    showToast(`${newPlace.emoji} "${newPlace.name}" saved`, 'ok');
  }, [ctxLatLng, closeAddModal, showToast]);

  // ── Map actions ──
  const dropPin = useCallback((latlng) => {
    const map = mapRef.current;
    if (!map || !latlng) return;
    if (tempPinRef.current) map.removeLayer(tempPinRef.current);
    tempPinRef.current = L.marker([latlng.lat, latlng.lng], { icon: markerIcon('📍') }).addTo(map);
    map.flyTo([latlng.lat, latlng.lng], 15, { duration: 0.6 });
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
        if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = L.marker([lat, lng], {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:14px;height:14px;border-radius:50%;background:#6c63ff;border:2.5px solid white;box-shadow:0 0 0 5px rgba(108,99,255,.25)"></div>',
            iconSize: [14, 14], iconAnchor: [7, 7],
          }),
        }).addTo(map);
        map.flyTo([lat, lng], 15, { duration: 0.9 });
        showToast('📍 You are here', 'ok');
      },
      () => {
        map.flyTo([12.9716, 77.5946], 14, { duration: 0.9 });
        showToast('📍 Location demo: Bengaluru');
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }, [showToast]);

  // ── Window globals for popup buttons ──
  useEffect(() => {
    window.__trace = {
      goJournal: (name) => {
        mapRef.current?.closePopup();
        setActiveTab('journal');
        showToast(`📓 Entry for ${name}`);
      },
      share: (name) => {
        mapRef.current?.closePopup();
        if (navigator.share) {
          navigator.share({ title: name, text: `Check out ${name} on TRACE`, url: location.href });
        } else {
          navigator.clipboard?.writeText(`${name} — saved in TRACE`);
          showToast('🔗 Copied');
        }
      },
      navigate: (lat, lng) => {
        mapRef.current?.closePopup();
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
        closeAddModal();
        closeAIModal();
        hideCtxMenu();
      } else if (e.key === 'n' && !e.target.matches('input, textarea')) {
        openAddModal();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openAIModal, closeAddModal, closeAIModal, hideCtxMenu, openAddModal]);

  // ── URL params on mount ──
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (p.get('action') === 'add') openAddModal();
    if (p.get('action') === 'search') openAIModal();
    if (p.get('tab')) setActiveTab(p.get('tab'));
  }, [openAddModal, openAIModal]);

  // ── Init map markers ──
  const initMarkers = useCallback((map) => {
    [...DEMO_PLACES, ...savedPlaces].forEach(p => addMarkerToMap(map, p));
  }, [savedPlaces]);

  const value = {
    mapRef, activeTab, switchTab,
    addModalOpen, openAddModal, closeAddModal,
    aiModalOpen, openAIModal, closeAIModal,
    ctxMenu, ctxLatLng, showCtxMenu, hideCtxMenu,
    mapStyle, changeMapStyle, satOn, toggleSatellite,
    onboardVisible, setOnboardVisible,
    toasts, showToast,
    savedPlaces, addPlace,
    flyTo, locateMe, dropPin, navigateTo, copyCoords,
    applyMapFilter, initMarkers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
