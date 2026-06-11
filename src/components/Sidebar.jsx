import { useState, useRef, useCallback, useEffect } from 'react';
import { Map, MapPin, Search, CalendarDays, BookOpen, BarChart3, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { INLINE_SUGGESTIONS } from '../data';
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
  const { activeTab, switchTab, openPlaceModal, showToast, flyTo } = useApp();
  const { user, signOut } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [showInline, setShowInline] = useState(false);
  const [inlineResults, setInlineResults] = useState([]);
  const [inlineLoading, setInlineLoading] = useState(false);
  const searchTimer = useRef(null);

  const handleFocus = () => {
    setShowInline(true);
    setInlineLoading(true);
    setTimeout(() => setInlineLoading(false), 400);
  };

  const handleSearch = useCallback((val) => {
    setSearchValue(val);
    if (!val) { setInlineResults([]); setInlineLoading(false); return; }
    setInlineLoading(true);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setInlineResults(INLINE_SUGGESTIONS);
      setInlineLoading(false);
    }, 680);
  }, []);

  // Close inline when clicking outside
  useEffect(() => {
    if (!showInline) return;
    const handler = (e) => {
      if (!e.target.closest('.inline-search-area')) setShowInline(false);
    };
    setTimeout(() => document.addEventListener('click', handler), 10);
    return () => document.removeEventListener('click', handler);
  }, [showInline]);

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
      <div className="inline-search-area px-6 pt-4 pb-4 relative group">
        <Sparkles size={15} className="absolute left-9 top-1/2 -translate-y-1/2 text-ta transition-transform group-focus-within:scale-110" />
        <input
          className="w-full bg-elevated border border-b1 rounded-full py-2.5 pr-16 pl-10 text-t1 font-body text-sm outline-none transition-all duration-200 focus:border-ba focus:shadow-[0_0_0_3px_var(--color-pglow)] placeholder:text-t3"
          placeholder="Ask AI or search mapz..."
          autoComplete="off"
          value={searchValue}
          onFocus={handleFocus}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <span className="absolute right-9 top-1/2 -translate-y-1/2 rounded-full py-0.5 px-2 text-[10px] font-semibold tracking-[0.05em] text-white pointer-events-none"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' }}>
          ⌘K
        </span>

        {/* Inline AI results dropdown */}
        {showInline && (
          <div className="absolute top-16 left-4 right-4 bg-layer border border-ba rounded-xl p-2 z-[400]"
            style={{ boxShadow: '0 16px 48px rgba(0,0,0,.55)' }}>
            {inlineLoading || inlineResults.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-t3">
                <span className="flex gap-0.5">
                  <span className="bounce-dot" /><span className="bounce-dot" /><span className="bounce-dot" />
                </span>
                {searchValue ? 'Searching…' : 'Thinking about your places…'}
              </div>
            ) : (
              inlineResults.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-elevated"
                  onClick={() => { setShowInline(false); flyTo(12.9716, 77.6099); }}>
                  <span className="text-lg">{r.emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm text-t1 font-medium">{r.name}</div>
                    <div className="text-xs text-t3 mt-0.5">{r.sub}</div>
                  </div>
                  <span className="font-mono text-[10px] text-teal">{r.dist}</span>
                </div>
              ))
            )}
          </div>
        )}
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
