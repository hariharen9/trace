import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EMOJI_OPTIONS, CATEGORY_OPTIONS, VIBE_OPTIONS } from '../data';

export default function AddPlaceModal() {
  const { addModalOpen, closeAddModal, addPlace } = useApp();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [emoji, setEmoji] = useState('☕');
  const [category, setCategory] = useState('Café');
  const [vibe, setVibe] = useState('');
  const [nameError, setNameError] = useState(false);
  const nameRef = useRef(null);

  // Reset form when opened
  useEffect(() => {
    if (addModalOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(''); setNote(''); setEmoji('☕'); setCategory('Café'); setVibe(''); setNameError(false);
      setTimeout(() => nameRef.current?.focus(), 150);
    }
  }, [addModalOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      nameRef.current?.focus();
      setTimeout(() => setNameError(false), 1400);
      return;
    }
    addPlace({ emoji, name: name.trim(), addr: 'Saved location', note: note.trim(), category });
  };

  if (!addModalOpen) return null;

  return (
    <div
      className={`modal-open fixed inset-0 z-[600] flex items-center justify-center transition-opacity duration-200 ${addModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(7,7,13,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closeAddModal(); }}
    >
      <div className="modal-panel bg-layer border border-b2 rounded-2xl w-[520px] max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 36px 100px rgba(0,0,0,.7)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-0 mb-6">
          <div className="font-display text-lg font-bold">Save a place</div>
          <button onClick={closeAddModal}
            className="w-8 h-8 rounded-lg bg-elevated border border-b1 text-t3 flex items-center justify-center cursor-pointer transition-all duration-150 text-lg leading-none hover:text-t1 hover:border-b2">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-8">
          {/* Emoji picker */}
          <div className="mb-5">
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Emoji</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map(e => (
                <div key={e} onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg bg-elevated text-lg cursor-pointer flex items-center justify-center transition-all duration-150 border-2 hover:bg-surface hover:border-b1
                    ${emoji === e ? 'border-primary bg-pglow' : 'border-transparent'}`}>
                  {e}
                </div>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="mb-5">
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Name</label>
            <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-elevated rounded-lg py-3 px-4 text-t1 font-body text-sm outline-none transition-all duration-200 placeholder:text-t3 focus:border-ba focus:shadow-[0_0_0_3px_var(--color-pglow)] border"
              style={{ borderColor: nameError ? 'var(--color-rose)' : 'var(--color-b1)' }}
              placeholder="What is this place?" />
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_OPTIONS.map(c => (
                <div key={c} onClick={() => setCategory(c)}
                  className={`py-2 px-4 rounded-full text-xs cursor-pointer transition-all duration-150 border
                    ${category === c ? 'bg-pglow border-ba text-ta' : 'bg-elevated border-b1 text-t2 hover:border-b2'}`}>
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mb-5">
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Note / Memory</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              className="w-full bg-elevated border border-b1 rounded-lg py-3 px-4 text-t1 font-body text-sm outline-none transition-all duration-200 resize-none placeholder:text-t3 focus:border-ba focus:shadow-[0_0_0_3px_var(--color-pglow)]"
              placeholder="What happened here? What do you want to remember?" />
          </div>

          {/* Vibe */}
          <div className="mb-6">
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Vibe</label>
            <div className="flex gap-2 flex-wrap">
              {VIBE_OPTIONS.map(v => (
                <div key={v} onClick={() => setVibe(vibe === v ? '' : v)}
                  className={`py-2 px-4 rounded-full text-xs cursor-pointer transition-all duration-150 border
                    ${vibe === v ? 'bg-pglow border-ba text-ta' : 'bg-elevated border-b1 text-t2 hover:border-b2'}`}>
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-5 border-t border-b1 mt-2">
            <button onClick={closeAddModal}
              className="py-2.5 px-5 rounded-lg font-body text-sm font-medium cursor-pointer transition-all duration-150 border border-b1 bg-transparent text-t2 hover:bg-elevated hover:text-t1">
              Cancel
            </button>
            <button onClick={handleSave}
              className="py-2.5 px-5 rounded-lg font-body text-sm font-medium cursor-pointer transition-all duration-150 border border-transparent bg-primary text-white hover:bg-[#5a52dd] hover:-translate-y-px">
              Save place
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
