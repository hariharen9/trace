import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AI_RESULTS, QUICK_PROMPTS } from '../data';

export default function AISearchModal() {
  const { aiModalOpen, closeAIModal, flyTo } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(AI_RESULTS);
  const [loading, setLoading] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (aiModalOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(''); setResults(AI_RESULTS); setFocusIdx(0); setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 110);
    }
  }, [aiModalOpen]);

  const handleInput = (val) => {
    setQuery(val);
    setLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setResults(AI_RESULTS);
      setFocusIdx(0);
      setLoading(false);
    }, val ? 600 : 0);
  };

  const handlePrompt = (q) => {
    setQuery(q);
    handleInput(q);
  };

  const handleSelect = () => {
    closeAIModal();
    flyTo(12.9716, 77.5946);
  };

  if (!aiModalOpen) return null;

  return (
    <div
      className={`modal-open fixed inset-0 z-[600] flex items-center justify-center transition-opacity duration-200 ${aiModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(7,7,13,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closeAIModal(); }}
    >
      <div className="modal-panel bg-layer border border-ba rounded-2xl w-[480px] max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 0 0 1px var(--color-pglow), 0 36px 100px rgba(0,0,0,.7)' }}>

        {/* Command bar */}
        <div className="flex items-center gap-3 p-4 px-5 border-b border-b1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' }}>
            ✦
          </div>
          <input ref={inputRef} value={query} onChange={(e) => handleInput(e.target.value)}
            className="flex-1 bg-transparent border-none text-t1 font-body text-base outline-none placeholder:text-t3"
            placeholder="Find me a quiet café with good wifi…" autoComplete="off" />
          <span className="font-mono text-[10px] text-t3 bg-elevated py-1 px-2 rounded-md border border-b1">⌘K</span>
        </div>

        {/* Results */}
        <div className="p-2">
          {loading ? (
            <div className="flex items-center gap-2 py-4 px-4 text-sm text-t3">
              <span className="flex gap-0.5">
                <span className="bounce-dot" /><span className="bounce-dot" /><span className="bounce-dot" />
              </span>
              Finding the best matches…
            </div>
          ) : (
            results.map((r, i) => (
              <div key={i}
                onClick={handleSelect}
                className={`flex items-center gap-3 py-3 px-3.5 rounded-xl cursor-pointer transition-colors duration-150
                  ${i === focusIdx ? 'bg-elevated' : 'hover:bg-elevated'}`}>
                <div className="w-10 h-10 rounded-lg bg-surface border border-b1 flex items-center justify-center text-xl shrink-0">
                  {r.emoji}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-t3 mt-0.5">{r.desc}</div>
                </div>
                <span className="text-[10px] py-1 px-2.5 rounded-full bg-elevated text-t3 border border-b1 whitespace-nowrap">{r.dist}</span>
              </div>
            ))
          )}
        </div>

        {/* Quick prompts */}
        <div className="px-5 py-3 pb-4 border-t border-b1 flex gap-2 flex-wrap">
          {QUICK_PROMPTS.map((p, i) => (
            <div key={i} onClick={() => handlePrompt(p.query)}
              className="text-xs text-t2 bg-elevated border border-b1 py-1.5 px-3 rounded-full cursor-pointer transition-all duration-150 whitespace-nowrap hover:border-ba hover:text-ta">
              {p.emoji} {p.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
