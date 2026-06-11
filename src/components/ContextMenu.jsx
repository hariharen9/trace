import { useEffect, useRef } from 'react';
import { MapPin, BookOpen, MapPinned, Navigation, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ContextMenu() {
  const { ctxMenu, ctxLatLng, hideCtxMenu, openPlaceModal, switchTab, showToast, dropPin, navigateTo, copyCoords } = useApp();
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!ctxMenu.show) return;
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) hideCtxMenu();
    };
    setTimeout(() => document.addEventListener('click', handler), 10);
    return () => document.removeEventListener('click', handler);
  }, [ctxMenu.show, hideCtxMenu]);

  if (!ctxMenu.show) return null;

  // Keep menu within viewport
  const mw = 200, mh = 260; // Slightly larger due to standard padding
  const x = Math.min(ctxMenu.x, window.innerWidth - mw - 16);
  const y = Math.min(ctxMenu.y, window.innerHeight - mh - 16);

  const items = [
    { Icon: MapPin, label: 'Save this place', action: () => { hideCtxMenu(); openPlaceModal(ctxLatLng); } },
    { Icon: BookOpen, label: 'Journal entry here', action: () => { hideCtxMenu(); switchTab('journal'); showToast('📓 New entry started'); } },
    { Icon: MapPinned, label: 'Drop a pin', action: () => { hideCtxMenu(); dropPin(ctxLatLng); } },
    'sep',
    { Icon: Navigation, label: 'Navigate here', action: () => { hideCtxMenu(); if (ctxLatLng) navigateTo(ctxLatLng.lat, ctxLatLng.lng); } },
    { Icon: Copy, label: 'Copy coordinates', action: () => { hideCtxMenu(); copyCoords(ctxLatLng); } },
  ];

  return (
    <div ref={menuRef}
      className="fixed z-[500] bg-layer border border-b2 rounded-xl p-3 min-w-56 animate-fade-in"
      style={{ left: x, top: y, boxShadow: '0 14px 44px rgba(0,0,0,.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      {items.map((item, i) => {
        if (item === 'sep') return <div key={i} className="h-px bg-b1 my-2" />;
        const { Icon, label, action } = item;
        return (
          <div key={i} onClick={action}
            className="flex items-center gap-3 py-2.5 px-4 rounded-lg cursor-pointer text-sm text-t2 transition-all duration-100 hover:bg-elevated hover:text-t1">
            <Icon size={18} />
            {label}
          </div>
        );
      })}
    </div>
  );
}
