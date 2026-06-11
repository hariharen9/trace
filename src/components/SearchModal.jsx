import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseMapUrlOrCoordinates, isInstantQuery, isGoogleMapsLink } from '../utils/urlParser';

export default function SearchModal() {
  const { aiModalOpen: searchModalOpen, closeAIModal: closeSearchModal, dropPin, mapRef } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolvingUrl, setResolvingUrl] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef(null);

  // Parse Google Maps URLs and Coordinates
  const processQuery = async (searchQuery) => {
    const parsed = await parseMapUrlOrCoordinates(searchQuery);

    if (parsed.error || parsed.type === 'coordinate') {
      return parsed; // already fully resolved coordinate or error
    }

    // Fallback to Nominatim Search for places
    const fallbackQuery = parsed.query || searchQuery;
    
    setLoading(true);
    try {
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=10`;
      
      const map = mapRef.current;
      if (map) {
        const bounds = map.getBounds();
        const viewbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        url += `&viewbox=${viewbox}&bounded=0`;
      }
      
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      
      return data.map(d => {
        const parts = d.display_name.split(', ');
        return {
          id: d.place_id,
          title: parts[0],
          desc: parts.slice(1).join(', '),
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
          type: d.type || d.class || 'location'
        };
      });
    } catch (err) {
      console.error("Geocoding failed", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setResolvingUrl(false);
      return;
    }
    
    if (isGoogleMapsLink(query)) {
      setResolvingUrl(true);
    }

    const delay = isInstantQuery(query) ? 100 : 800;

    const timeoutId = setTimeout(async () => {
      const res = await processQuery(query.trim());
      setResolvingUrl(false);
      if (Array.isArray(res)) {
        setResults(res);
      } else if (res) {
        setResults([res]);
      } else {
        setResults([]);
      }
      setFocusIdx(0);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [query, mapRef]);

  // Reset modal on open
  useEffect(() => {
    if (searchModalOpen) {
      setQuery(''); setResults([]); setFocusIdx(0); setLoading(false); setResolvingUrl(false);
      setTimeout(() => inputRef.current?.focus(), 110);
    }
  }, [searchModalOpen]);

  const handleSelect = (r) => {
    if (r.error) return;
    closeSearchModal();
    const zoom = r.type === 'coordinate' ? 18.5 : (['city', 'town', 'suburb', 'postcode', 'country', 'state', 'administrative', 'region'].includes(r.type) ? 14 : 18.5);
    dropPin({ lat: r.lat, lng: r.lng }, zoom, '🔍');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[focusIdx]) handleSelect(results[focusIdx]);
    }
  };

  if (!searchModalOpen) return null;

  return (
    <div
      className={`modal-open fixed inset-0 z-[600] flex items-center justify-center transition-opacity duration-200 ${searchModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(7,7,13,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closeSearchModal(); }}
    >
      <div className="modal-panel bg-layer border border-b2 rounded-2xl w-[520px] max-w-[calc(100vw-32px)] max-h-[90vh] overflow-hidden flex flex-col"
        style={{ boxShadow: '0 36px 100px rgba(0,0,0,.7)' }}>

        {/* Command bar */}
        <div className="flex items-center gap-3 p-4 px-5 border-b border-b1 shrink-0">
          <Search size={18} className="text-t3 shrink-0" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-t1 font-body text-base outline-none placeholder:text-t3"
            placeholder="Search, paste coordinates, or Google Maps URL..." autoComplete="off" />
          <span className="font-mono text-[10px] text-t3 bg-elevated py-1 px-2 rounded-md border border-b1">ESC to cancel</span>
        </div>

        {/* Results */}
        <div className="overflow-y-auto custom-scroll flex-1 p-2 max-h-[400px]">
          {resolvingUrl ? (
            <div className="flex flex-col items-center gap-3 py-8 px-4 text-sm text-t3 justify-center">
              <LinkIcon size={24} className="text-accent opacity-80 animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="flex gap-0.5">
                  <span className="bounce-dot" /><span className="bounce-dot" /><span className="bounce-dot" />
                </span>
                Resolving Google Maps Link...
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 py-8 px-4 text-sm text-t3 justify-center">
              <span className="flex gap-0.5">
                <span className="bounce-dot" /><span className="bounce-dot" /><span className="bounce-dot" />
              </span>
              Searching global map data...
            </div>
          ) : query.trim() && results.length === 0 ? (
             <div className="text-center py-8 text-t3 text-sm">No places found for "{query}"</div>
          ) : !query.trim() ? (
            <div className="text-center py-8 text-t3 text-sm flex flex-col items-center gap-4">
              <div className="flex gap-4 opacity-40">
                <MapPin size={24} />
                <LinkIcon size={24} />
              </div>
              <div>
                Type to search the world...<br/>
                <span className="text-xs opacity-60">You can also paste coordinates or Google Maps links</span>
              </div>
            </div>
          ) : (
            results.map((r, i) => (
              <div key={r.id || i}
                onMouseEnter={() => setFocusIdx(i)}
                onClick={() => handleSelect(r)}
                className={`flex items-center gap-3 py-3 px-3.5 rounded-xl transition-colors duration-150
                  ${r.error ? 'cursor-default' : 'cursor-pointer'}
                  ${i === focusIdx && !r.error ? 'bg-elevated border-b1 border' : 'hover:bg-elevated border border-transparent'}`}>
                <div className={`w-10 h-10 rounded-lg bg-surface border border-b1 flex items-center justify-center shrink-0
                  ${r.error ? 'text-red-400' : r.type === 'coordinate' ? 'text-accent' : 'text-t2'}`}>
                  {r.error ? <AlertCircle size={16} /> : r.type === 'coordinate' ? <LinkIcon size={16} /> : <MapPin size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${r.error ? 'text-red-400' : 'text-t1'}`}>{r.title}</div>
                  <div className="text-xs text-t3 mt-0.5 truncate">{r.desc}</div>
                </div>
                {!r.error && (
                  <div className="text-[10px] text-t3 bg-surface py-1 px-2 rounded border border-b1 capitalize shrink-0">
                    {r.type === 'coordinate' ? 'Coordinates' : r.type.replace('_', ' ')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
