import { useState } from 'react';
import { MapPin, Activity, Plane, BookOpen, BarChart3, PanelLeftClose, PanelLeftOpen, Search, LogOut } from 'lucide-react';
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
  const { activeTab, switchTab, openPlaceModal, openAIModal: openSearchModal, isSidebarCollapsed: isCollapsed, setIsSidebarCollapsed: setIsCollapsed } = useApp();
  const { user, signOut } = useAuth();
  const ActivePanel = PANELS[activeTab];

  return (
    <>
      <aside className={`app-sidebar w-[340px] h-full shrink-0 flex flex-col z-20 relative bg-base border-r border-b1 transition-all duration-300 ${isCollapsed ? '-ml-[340px]' : 'ml-0'}`}>
        {/* Drag handle (mobile) */}
        <div className="drag-handle hidden w-10 h-1 rounded-sm mx-auto mt-2 bg-b2" />

        {/* ── Header Area ── */}
        <div className="flex flex-col px-5 pt-5 pb-3">
          {/* Logo & Actions */}
          <div className="flex items-center justify-between mb-5">
            <div className="font-display text-[15px] font-bold tracking-wider flex items-center gap-2 text-t1 uppercase">
              <div className="w-2.5 h-2.5 bg-t1" />
              TRACE
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setIsCollapsed(true)} className="w-8 h-8 rounded bg-transparent text-t3 flex items-center justify-center transition-colors duration-150 hover:bg-elevated hover:text-t1 cursor-pointer" title="Close Sidebar">
                <PanelLeftClose size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Command input (Raycast style) */}
          <div
            className="relative w-full group cursor-pointer flex items-center rounded-lg border border-b1 bg-layer transition-colors duration-200 hover:border-b2"
            onClick={openSearchModal}
          >
            <Search size={14} className="absolute left-3 text-t3" />
            <input
              className="w-full bg-transparent border-none py-2 pr-12 pl-9 text-t1 font-mono text-[13px] outline-none placeholder:text-t3 cursor-pointer pointer-events-none"
              placeholder="Search the world..."
              autoComplete="off"
              readOnly
            />
            <div className="absolute right-2 flex gap-1">
              <kbd className="font-mono text-[10px] text-t3 bg-base border border-b1 rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* ── User info (Minimal) ── */}
        {user && (
          <div className="flex items-center gap-2.5 mx-5 mb-4 py-2 px-2.5 rounded-lg border border-transparent hover:border-b1 hover:bg-layer transition-colors duration-200 group">
            <img
              src={user.photoURL}
              alt=""
              className="w-6 h-6 rounded border border-b2 transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1 flex items-center justify-between">
              <div className="text-[13px] font-bold bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent transition-opacity hover:opacity-80">{user.displayName}</div>
            </div>
          </div>
        )}

        {/* ── Nav tabs ── */}
        <div className="px-5 pb-3 border-b border-b1">
          <nav className="flex p-0.5 bg-layer border border-b1 rounded-lg gap-0.5">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id}
                onClick={() => switchTab(id)}
                className={`flex-1 py-1.5 rounded-md text-[11px] font-medium cursor-pointer flex flex-col items-center gap-1 transition-all duration-150
                ${activeTab === id
                    ? 'bg-elevated text-t1 border border-b2 shadow-[0_1px_3px_rgba(0,0,0,0.4)]'
                    : 'bg-transparent text-t3 border border-transparent hover:text-t2 hover:bg-elevated/40'}`}>
                <Icon size={13} strokeWidth={2} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Panel content ── */}
        <div className="custom-scroll flex-1 overflow-y-auto overflow-x-hidden p-5 pb-4">
          <ActivePanel />
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-b1 bg-base flex items-center justify-between">
          <div className="text-[10px] text-t3 font-medium">
            &copy; 2026 TRACE · Built by <a href="https://hariharen.site" target="_blank" rel="noreferrer" className="text-t1 hover:underline underline-offset-2">Hariharen</a>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 text-t3 hover:text-rose transition-colors text-[10px] font-bold cursor-pointer" title="Sign out">
            <LogOut size={12} strokeWidth={2.5} /> SIGN OUT
          </button>
        </div>
      </aside>

      {/* Floating Open Button */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute top-5 left-5 z-[800] w-9 h-9 rounded-lg bg-base border border-b1 text-t2 flex items-center justify-center transition-all hover:text-t1 hover:border-b2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer"
          title="Open Sidebar"
        >
          <PanelLeftOpen size={16} />
        </button>
      )}
    </>
  );
}
