import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';

export default function MapView() {
  const containerRef = useRef(null);
  const initRef = useRef(false);
  const { mapRef, showCtxMenu, initMarkers, showToast } = useApp();

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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // ── Dark filter ──
    const applyDark = () => {
      const tp = document.querySelector('.leaflet-tile-pane');
      if (tp) tp.style.filter = 'invert(1) hue-rotate(180deg) brightness(0.68) saturate(0.52) contrast(1.15)';
    };
    setTimeout(applyDark, 200);
    map.on('tileload', applyDark);

    // ── Initial markers ──
    initMarkers(map);

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
