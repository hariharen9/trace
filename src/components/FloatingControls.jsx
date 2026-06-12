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
  const { mapStyle, changeMapStyle, satOn, toggleSatellite, openAIModal: openSearchModal } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const styles = ['dark', 'topo', 'streets', 'outdoor', 'ocean', 'pastel', 'satellite'];

  return (
    <div className="top-bar-float fixed top-4 right-4 flex flex-col items-end gap-2 z-[40] max-md:top-[70px] max-md:right-4">
      <div className="flex gap-2 relative">
        {/* Desktop button (untouched behavior) */}
        <button
          onClick={toggleSatellite}
          className="max-md:hidden flex items-center gap-1.5 rounded-full text-t2 py-2 px-3.5 text-xs font-medium cursor-pointer transition-all duration-200 border whitespace-nowrap hover:border-ba hover:text-ta"
          style={satOn
            ? { background: 'rgba(20,184,166,.18)', borderColor: 'rgba(20,184,166,.4)', color: '#14b8a6' }
            : { background: 'var(--color-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'var(--color-b2)' }
          }>
          {satOn ? '🗺️ Streets' : <><Globe size={13} /> Satellite</>}
        </button>

        {/* Mobile button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex items-center gap-1.5 rounded-full text-t2 py-2 px-3.5 text-xs font-medium cursor-pointer transition-all duration-200 border whitespace-nowrap hover:border-ba hover:text-ta"
          style={mapStyle === 'satellite'
            ? { background: 'rgba(20,184,166,.18)', borderColor: 'rgba(20,184,166,.4)', color: '#14b8a6' }
            : { background: 'var(--color-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'var(--color-b2)' }
          }>
          <Globe size={13} className={mapStyle === 'satellite' ? 'text-teal animate-pulse' : ''} />
          <span className="capitalize">{mapStyle}</span>
        </button>

        <button
          onClick={openSearchModal}
          className="md:flex hidden items-center gap-1.5 rounded-full py-2 px-3.5 text-xs font-bold cursor-pointer transition-all duration-200 border border-transparent text-black whitespace-nowrap bg-white hover:bg-gray-200 shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
          <Search size={13} />
          ⌘K  Global Search
        </button>
      </div>

      {/* Mobile style selector dropdown */}
      {isOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
          <div 
            className="md:hidden w-44 rounded-2xl border border-b2 bg-black/95 backdrop-blur-xl p-2 shadow-2xl flex flex-col gap-1 animate-fade-in"
            style={{ 
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}>
            <div className="text-[9px] uppercase tracking-wider font-mono text-t3 px-2.5 py-1 border-b border-b1 mb-1 font-bold">
              Select Style
            </div>
            {styles.map(s => (
              <button
                key={s}
                onClick={() => {
                  changeMapStyle(s);
                  setIsOpen(false);
                }}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[12px] font-medium transition-all duration-150 capitalize cursor-pointer flex items-center justify-between
                  ${mapStyle === s 
                    ? 'bg-elevated text-t1 border border-b1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                    : 'text-t3 bg-transparent hover:text-t2 hover:bg-elevated/45'
                  }`}
              >
                <span>{s}</span>
                {mapStyle === s && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Bottom Bar ── */
function BottomBar() {
  const { mapStyle, changeMapStyle, isSidebarCollapsed } = useApp();
  const styles = ['dark', 'topo', 'streets', 'outdoor', 'ocean', 'pastel', 'satellite'];
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`bottom-bar-float max-md:hidden fixed bottom-5 -translate-x-1/2 z-[40] flex gap-1.5 rounded-full p-1.5 border border-b2 transition-all duration-300 ${isSidebarCollapsed ? 'left-1/2' : 'left-[calc(50vw+170px)]'}`}
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
    <div className="zoom-float max-md:hidden fixed right-4 bottom-[140px] z-[40] flex flex-col gap-[5px]">
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
  const { locateMe, isLocating } = useApp();
  return (
    <button onClick={locateMe} title="My location"
      disabled={isLocating}
      className={`geo-float fixed bottom-20 right-4 max-md:bottom-[100px] w-[46px] h-[46px] rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 z-[40] 
        ${isLocating 
          ? 'border-[#6c63ff] text-[#6c63ff] cursor-wait' 
          : 'border-b2 text-t2 hover:border-ba hover:text-primary hover:scale-105 hover:shadow-[0_0_15px_rgba(108,99,255,0.2)] active:scale-95'
        }`}
      style={{
        background: isLocating ? 'rgba(108, 99, 255, 0.15)' : 'var(--color-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isLocating 
          ? '0 0 0 6px rgba(108, 99, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
      }}>
      <Crosshair size={18} className={isLocating ? 'animate-spin' : ''} />
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
    <div className="onboard-float onboard-enter fixed top-[68px] right-4 border border-ba rounded-lg p-3 px-[15px] z-[40] max-w-[230px]"
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
