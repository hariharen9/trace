import { useEffect, useState } from 'react';
import { Globe, Plus, Minus, Crosshair, Compass, Search, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FloatingControls() {
  return (
    <>
      <TopBar />
      <BottomBar />
      <ZoomControls />
      <GeoButton />
      <OnboardChip />
    </>
  );
}

/* ── Top Bar ── */
function TopBar() {
  const { satOn, toggleSatellite, openAIModal: openSearchModal } = useApp();

  return (
    <div className="top-bar-float fixed top-4 right-4 flex gap-2 z-[800]">
      <button
        onClick={toggleSatellite}
        className="flex items-center gap-1.5 rounded-full text-t2 py-2 px-3.5 text-xs font-medium cursor-pointer transition-all duration-200 border whitespace-nowrap hover:border-ba hover:text-ta"
        style={satOn
          ? { background: 'rgba(20,184,166,.18)', borderColor: 'rgba(20,184,166,.4)', color: '#14b8a6' }
          : { background: 'var(--color-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'var(--color-b2)' }
        }>
        {satOn ? '🗺️ Streets' : <><Globe size={13} /> Satellite</>}
      </button>
      <button
        onClick={openSearchModal}
        className="flex items-center gap-1.5 rounded-full py-2 px-3.5 text-xs font-bold cursor-pointer transition-all duration-200 border border-transparent text-black whitespace-nowrap bg-white hover:bg-gray-200 shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
        <Search size={13} />
        ⌘K  Global Search
      </button>
    </div>
  );
}

/* ── Bottom Bar ── */
function BottomBar() {
  const { mapStyle, changeMapStyle, isSidebarCollapsed } = useApp();
  const styles = ['dark', 'topo', 'streets', 'outdoor', 'ocean', 'pastel', 'satellite'];
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`bottom-bar-float fixed bottom-5 -translate-x-1/2 z-[800] flex gap-1.5 rounded-full p-1.5 border border-b2 transition-all duration-300 ${isSidebarCollapsed ? 'left-1/2' : 'left-[calc(50vw+170px)]'}`}
      style={{ background: 'var(--color-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      {styles.map(s => (
        <button key={s}
          onClick={() => { changeMapStyle(s); setShowTooltip(false); }}
          className={`py-[7px] px-3.5 rounded-full text-xs font-medium cursor-pointer border-none transition-all duration-200 font-body capitalize
            ${mapStyle === s ? 'bg-elevated text-t1' : 'bg-transparent text-t3'}`}>
          {s === 'dark' ? 'Dark' : s === 'topo' ? 'Topo' : s === 'streets' ? 'Streets' : s === 'outdoor' ? 'Outdoor' : s === 'ocean' ? 'Ocean' : s === 'pastel' ? 'Pastel' : 'Satellite'}
        </button>
      ))}
      
      {/* Divider */}
      <div className="w-[1px] h-5 bg-b2 mx-0.5 my-auto" />
      
      {/* Info Button */}
      <div className="relative flex">
        <button 
          onClick={() => setShowTooltip(!showTooltip)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showTooltip ? 'bg-elevated text-t1' : 'text-t3 hover:bg-layer hover:text-t2'}`}>
          <Info size={14} />
        </button>

        {showTooltip && (
          <div className="absolute bottom-[calc(100%+16px)] right-0 w-[300px] bg-elevated border border-ba rounded-2xl p-5 shadow-2xl animate-fade-in text-left">
            <h4 className="font-display font-bold text-ta text-sm mb-3 flex items-center gap-2">
              <Info size={14} className="text-primary" /> Map Styles Guide
            </h4>
            <div className="space-y-3 text-xs leading-relaxed max-h-[40vh] overflow-y-auto">
              <div><span className="font-bold text-t1 block mb-0.5">Dark</span> High-contrast, minimalist night view. Best for letting your saved places pop.</div>
              <div><span className="font-bold text-t1 block mb-0.5">Topo</span> Topographical terrain map with elevation lines and hillshading.</div>
              <div><span className="font-bold text-t1 block mb-0.5">Streets</span> Classic, bright city map optimized for clear navigation.</div>
              <div><span className="font-bold text-t1 block mb-0.5">Outdoor</span> Emphasizes parks, hiking trails, and natural landscapes.</div>
              <div><span className="font-bold text-t1 block mb-0.5">Ocean</span> Features stunning bathymetric deep blue gradients of the ocean floor.</div>
              <div><span className="font-bold text-t1 block mb-0.5">Pastel</span> A softer, stylized, and beautifully vibrant alternative city map.</div>
              <div><span className="font-bold text-t1 block mb-0.5">Satellite</span> High-res photographic imagery overlaid with standard street labels.</div>
            </div>
            
            {/* Close button inside tooltip */}
            <button 
              onClick={() => setShowTooltip(false)}
              className="mt-4 w-full py-2 bg-layer border border-b2 rounded-lg text-xs font-semibold text-t2 hover:text-t1 hover:border-b1 transition-colors">
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Zoom & 3D Controls ── */
function ZoomControls() {
  const { mapRef } = useApp();
  return (
    <div className="zoom-float fixed right-4 bottom-[140px] z-[800] flex flex-col gap-[5px]">
      <button onClick={() => mapRef.current?.resetNorthPitch({ duration: 1000 })}
        title="Reset 3D tilt & bearing"
        className="w-9 h-9 mb-1 rounded-md border border-b2 text-t2 text-[17px] cursor-pointer transition-all duration-200 flex items-center justify-center hover:border-ba hover:text-ta"
        style={{ background: 'var(--color-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <Compass size={17} />
      </button>
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


/* ── Onboard Chip ── */
function OnboardChip() {
  const { onboardVisible, setOnboardVisible } = useApp();

  useEffect(() => {
    if (onboardVisible) {
      const timer = setTimeout(() => {
        setOnboardVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [onboardVisible, setOnboardVisible]);

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
