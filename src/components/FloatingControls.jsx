import { Globe, Sparkles, Plus, Minus, Crosshair } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LEGEND_ITEMS } from '../data';

export default function FloatingControls() {
  return (
    <>
      <TopBar />
      <BottomBar />
      <ZoomControls />
      <GeoButton />
      <MapLegend />
      <OnboardChip />
    </>
  );
}

/* ── Top Bar ── */
function TopBar() {
  const { satOn, toggleSatellite, openAIModal } = useApp();

  return (
    <div className="top-bar-float fixed top-4 right-4 flex gap-2 z-[800]">
      <button
        onClick={toggleSatellite}
        className="flex items-center gap-1.5 rounded-full text-t2 py-2 px-3.5 text-xs font-medium cursor-pointer transition-all duration-200 border whitespace-nowrap hover:border-ba hover:text-ta"
        style={satOn
          ? { background: 'rgba(20,184,166,.18)', borderColor: 'rgba(20,184,166,.4)', color: '#14b8a6' }
          : { background: 'var(--color-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'var(--color-b2)' }
        }>
        {satOn ? '🌑 Dark map' : <><Globe size={13} /> Satellite</>}
      </button>
      <button
        onClick={openAIModal}
        className="flex items-center gap-1.5 rounded-full py-2 px-3.5 text-xs font-medium cursor-pointer transition-all duration-200 border border-transparent text-white whitespace-nowrap bg-primary hover:bg-[#5a52dd]">
        <Sparkles size={13} />
        ⌘K  AI Search
      </button>
    </div>
  );
}

/* ── Bottom Bar ── */
function BottomBar() {
  const { mapStyle, changeMapStyle } = useApp();
  const styles = ['dark', 'topo', 'streets', 'satellite'];

  return (
    <div className="bottom-bar-float fixed bottom-5 left-1/2 -translate-x-1/2 z-[800] flex gap-1.5 rounded-full p-1.5 border border-b2"
      style={{ background: 'var(--color-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      {styles.map(s => (
        <button key={s}
          onClick={() => changeMapStyle(s)}
          className={`py-[7px] px-3.5 rounded-full text-xs font-medium cursor-pointer border-none transition-all duration-200 font-body capitalize
            ${mapStyle === s ? 'bg-elevated text-t1' : 'bg-transparent text-t3'}`}>
          {s === 'dark' ? 'Dark' : s === 'topo' ? 'Topo' : s === 'streets' ? 'Streets' : 'Satellite'}
        </button>
      ))}
    </div>
  );
}

/* ── Zoom ── */
function ZoomControls() {
  const { mapRef } = useApp();
  return (
    <div className="zoom-float fixed right-4 bottom-[140px] z-[800] flex flex-col gap-[5px]">
      <button onClick={() => mapRef.current?.zoomIn()}
        className="w-9 h-9 rounded-md border border-b2 text-t2 text-[19px] cursor-pointer transition-all duration-200 flex items-center justify-center hover:border-ba hover:text-ta"
        style={{ background: 'var(--color-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <Plus size={19} />
      </button>
      <button onClick={() => mapRef.current?.zoomOut()}
        className="w-9 h-9 rounded-md border border-b2 text-t2 text-[19px] cursor-pointer transition-all duration-200 flex items-center justify-center hover:border-ba hover:text-ta"
        style={{ background: 'var(--color-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <Minus size={19} />
      </button>
    </div>
  );
}

/* ── Geo Button ── */
function GeoButton() {
  const { locateMe } = useApp();
  return (
    <button onClick={locateMe} title="My location"
      className="geo-float fixed bottom-20 right-4 w-[42px] h-[42px] rounded-full border border-b2 text-t2 flex items-center justify-center cursor-pointer transition-all duration-200 z-[800] hover:border-ba hover:text-primary"
      style={{ background: 'var(--color-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <Crosshair size={17} />
    </button>
  );
}

/* ── Map Legend ── */
function MapLegend() {
  return (
    <div className="legend-float fixed left-[calc(340px+12px)] bottom-[70px] z-[800] border border-b1 rounded-lg py-2 px-[13px] flex gap-[11px] items-center"
      style={{ background: 'var(--color-glass)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <span className="font-mono text-[9px] tracking-[0.1em] text-t3 uppercase">Legend</span>
      {LEGEND_ITEMS.map(item => (
        <span key={item.label} className="text-xs text-t2">{item.emoji} {item.label}</span>
      ))}
    </div>
  );
}

/* ── Onboard Chip ── */
function OnboardChip() {
  const { onboardVisible, setOnboardVisible } = useApp();
  if (!onboardVisible) return null;
  return (
    <div className="onboard-float onboard-enter fixed top-[68px] right-4 border border-ba rounded-lg p-3 px-[15px] z-[800] max-w-[230px]"
      style={{ background: 'var(--color-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <p className="text-xs text-t2 leading-relaxed mb-[7px]">
        Right-click the map to <strong className="text-ta">save a place</strong> or add a memory. Press <strong className="text-ta">⌘K</strong> for AI search.
      </p>
      <span onClick={() => setOnboardVisible(false)}
        className="text-[11px] text-t3 cursor-pointer underline underline-offset-2 hover:text-t2">
        Got it
      </span>
    </div>
  );
}
