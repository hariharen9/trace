import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

// MapTiler tile URLs for each style
const TILE_URLS = {
  streets: `https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
  dark: `https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
  topo: `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
  satellite: `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
};

export default function MapView() {
  const containerRef = useRef(null);
  const initRef = useRef(false);
  const { mapRef, tileLayerRef, showCtxMenu, showToast } = useApp();

  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    // ── Create map ──
    const map = L.map(containerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    // ── MapTiler tiles (streets default) ──
    const tileLayer = L.tileLayer(TILE_URLS.streets, {
      maxZoom: 20,
      tileSize: 512,
      zoomOffset: -1,
      crossOrigin: true,
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/">OSM</a>',
    }).addTo(map);

    mapRef.current = map;
    tileLayerRef.current = tileLayer;

    // ── Markers managed by Firestore listener in AppContext ──

    // ── Context menu (right-click) ──
    map.on('contextmenu', (e) => {
      showCtxMenu(e.originalEvent.clientX, e.originalEvent.clientY, e.latlng);
    });

    // ── Long press (mobile) ──
    let longPressTimer;
    map.on('mousedown touchstart', (e) => {
      longPressTimer = setTimeout(() => {
        if (!e.latlng) return;
        const oe = e.originalEvent;
        const x = oe.touches ? oe.touches[0].clientX : oe.clientX;
        const y = oe.touches ? oe.touches[0].clientY : oe.clientY;
        showCtxMenu(x, y, e.latlng);
      }, 600);
    });
    map.on('mouseup touchend mousemove', () => clearTimeout(longPressTimer));

    // ── Init toast ──
    setTimeout(() => showToast('👋 Right-click the map to save a place'), 1100);

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      initRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: 'var(--color-void)' }}
    />
  );
}
