import { useState, useRef, useCallback, useEffect } from 'react';
import { MapPin, Activity, Plane, BookOpen, BarChart3, Plus, LogOut, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import PlacesPanel from './panels/PlacesPanel';
import TimelinePanel from './panels/TimelinePanel';
import TripsPanel from './panels/TripsPanel';
import JournalPanel from './panels/JournalPanel';
import StatsPanel from './panels/StatsPanel';

const TABS = [
  { id: 'places', label: 'Places', Icon: MapPin },
  { id: 'timeline', label: 'Timeline', Icon: Activity },
  { id: 'trips', label: 'Trips', Icon: Plane },
  { id: 'journal', label: 'Journal', Icon: BookOpen },
  { id: 'stats', label: 'Stats', Icon: BarChart3 },
];

const PANELS = { places: PlacesPanel, timeline: TimelinePanel, trips: TripsPanel, journal: JournalPanel, stats: StatsPanel };

export default function Sidebar() {
  const { activeTab, switchTab, openPlaceModal, openAIModal: openSearchModal, showToast, flyTo } = useApp();
  const { user, signOut } = useAuth();
  const ActivePanel = PANELS[activeTab];

  return (
    <aside className="app-sidebar w-[340px] h-full shrink-0 flex flex-col z-10 relative border-r border-b1"
      style={{ background: 'var(--color-glass)', backdropFilter: 'blur(28px) saturate(1.5)', WebkitBackdropFilter: 'blur(28px) saturate(1.5)' }}>

      {/* Drag handle (mobile) */}
      <div className="drag-handle hidden w-10 h-1 rounded-sm mx-auto mt-2" style={{ background: 'var(--color-b2)' }} />

      {/* ── Logo bar ── */}
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="font-display text-[21px] font-extrabold tracking-[-0.04em] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" style={{ boxShadow: '0 0 10px var(--color-primary)' }} />
          TRACE
        </div>
        <div className="flex gap-2">
          <button onClick={() => openPlaceModal()} className="w-9 h-9 rounded-lg bg-elevated border border-b1 text-t3 flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-b2 hover:text-t1 shrink-0" title="New place">
            <Plus size={16} strokeWidth={2.2} />
          </button>
          <button onClick={signOut} className="w-9 h-9 rounded-lg bg-elevated border border-b1 text-t3 flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-b2 hover:text-rose shrink-0" title="Sign out">
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── User info ── */}
      {user && (
        <div className="flex items-center gap-3 mx-6 mt-4 py-2.5 px-3.5 rounded-xl bg-elevated border border-b1">
          <img
            src={user.photoURL}
            alt=""
            className="w-7 h-7 rounded-full shrink-0 border border-b2"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-t1 truncate">{user.displayName}</div>
            <div className="text-[10px] text-t3 truncate">{user.email}</div>
          </div>
        </div>
      )}

      {/* ── Command input ── */}
      <div className="inline-search-area px-6 pt-4 pb-4 relative group cursor-pointer" onClick={openSearchModal}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl mx-6 mt-4 mb-4" style={{ top: '16px', bottom: '16px', left: '24px', right: '24px' }}></div>
        <Globe size={15} className="absolute left-9 top-1/2 -translate-y-1/2 text-ta transition-transform group-focus-within:scale-110 pointer-events-none" />
        <input
          className="w-full bg-elevated border border-b1 rounded-full py-2.5 pr-16 pl-10 text-t1 font-body text-sm outline-none transition-all duration-200 group-hover:border-ba group-hover:shadow-[0_0_0_3px_var(--color-pglow)] placeholder:text-t3 cursor-pointer pointer-events-none"
          placeholder="Search the world... (⌘K)"
          autoComplete="off"
          readOnly
        />
        <span className="absolute right-9 top-1/2 -translate-y-1/2 rounded-full py-0.5 px-2 text-[10px] font-semibold tracking-[0.05em] text-white pointer-events-none"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' }}>
          ⌘K
        </span>
      </div>

      {/* ── Nav tabs ── */}
      <nav className="flex px-5 gap-2 border-b border-b1">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id}
            onClick={() => switchTab(id)}
            className={`flex-1 py-3 pb-3.5 bg-transparent border-none text-[10px] font-medium tracking-[0.02em] cursor-pointer flex flex-col items-center gap-1 transition-colors duration-200 border-b-2 -mb-px
              ${activeTab === id ? 'text-ta border-b-primary' : 'text-t3 border-b-transparent hover:text-t2'}`}>
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </nav>

      {/* ── Panel content ── */}
      <div className="custom-scroll flex-1 overflow-y-auto overflow-x-hidden p-5 pb-8">
        <ActivePanel />
      </div>
    </aside>
  );
}
