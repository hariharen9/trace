import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useApp } from '../context/AppContext';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

export const MAP_STYLES = {
  streets: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`,
  dark: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`,
  topo: `https://api.maptiler.com/maps/topo-v2/style.json?key=${MAPTILER_KEY}`,
  satellite: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`,
};

export default function MapView() {
  const containerRef = useRef(null);
  const initRef = useRef(false);
  const { mapRef, showCtxMenu, showToast } = useApp();

  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLES.streets,
      center: [77.5946, 12.9716],
      zoom: 12,
      pitch: 0,
      bearing: 0,
      maxPitch: 72,
      dragRotate: true,
    });

    // Navigation control is handled by FloatingControls
    mapRef.current = map;

    // ── Context menu (right-click release without drag) ──
    map.on('contextmenu', (e) => {
      const orig = e.originalEvent;
      if (orig) {
        showCtxMenu(orig.clientX, orig.clientY, { lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    });

    // ── Long press (mobile) ──
    let longPressTimer;

    map.on('touchstart', (e) => {
      const orig = e.originalEvent;
      const touch = orig?.touches?.[0] || orig?.changedTouches?.[0] || orig;
      if (touch) {
        const clientX = touch.clientX;
        const clientY = touch.clientY;
        longPressTimer = setTimeout(() => {
          showCtxMenu(clientX, clientY, { lat: e.lngLat.lat, lng: e.lngLat.lng });
        }, 600);
      }
    });

    map.on('touchmove', () => clearTimeout(longPressTimer));
    map.on('touchend', () => clearTimeout(longPressTimer));

    // ── Init toast ──
    map.on('load', () => {
      setTimeout(() => showToast('👋 Right-click map to save · drag right-click to tilt', 'ok'), 1100);
    });

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
