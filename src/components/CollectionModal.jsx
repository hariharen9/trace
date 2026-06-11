import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EMOJI_OPTIONS } from '../data';

const COLOR_OPTIONS = [
  'rgba(245,158,11,0.12)', // amber
  'rgba(244,63,94,0.12)',  // rose
  'rgba(16,185,129,0.12)', // emerald
  'rgba(59,130,246,0.12)', // blue
  'rgba(168,85,247,0.12)', // purple
];

export default function CollectionModal() {
  const { collectionModalOpen, closeCollectionModal, addCollection } = useApp();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [nameError, setNameError] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    if (collectionModalOpen) {
      setName(''); setEmoji('📁'); setColor(COLOR_OPTIONS[0]); setNameError(false);
      setTimeout(() => nameRef.current?.focus(), 150);
    }
  }, [collectionModalOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      nameRef.current?.focus();
      setTimeout(() => setNameError(false), 1400);
      return;
    }
    addCollection({
      name: name.trim(),
      emoji,
      color,
    });
  };

  if (!collectionModalOpen) return null;

  return (
    <div
      className={`modal-open fixed inset-0 z-[600] flex items-center justify-center transition-opacity duration-200 ${collectionModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(7,7,13,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closeCollectionModal(); }}
    >
      <div className="modal-panel bg-layer border border-b2 rounded-2xl w-[400px] max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 36px 100px rgba(0,0,0,.7)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-0 mb-6">
          <div className="font-display text-lg font-bold">New Collection</div>
          <button onClick={closeCollectionModal}
            className="w-8 h-8 rounded-lg bg-elevated border border-b1 text-t3 flex items-center justify-center cursor-pointer transition-all duration-150 text-lg leading-none hover:text-t1 hover:border-b2">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-8">
          {/* Emoji */}
          <div className="mb-5">
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Emoji</label>
            <div className="max-h-[140px] overflow-y-auto pr-2 custom-scrollbar bg-[rgba(12,12,22,0.3)] border border-b1 rounded-xl p-3">
              {EMOJI_OPTIONS.map((group) => (
                <div key={group.group} className="mb-3 last:mb-0">
                  <div className="text-[10px] text-t3 font-medium mb-1.5 pl-1">{group.group}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {group.emojis.map(e => (
                      <div key={e} onClick={() => setEmoji(e)}
                        className={`w-8 h-8 rounded-lg bg-elevated text-[15px] cursor-pointer flex items-center justify-center transition-all duration-150 border hover:bg-surface hover:border-b1
                          ${emoji === e ? 'border-primary bg-pglow scale-110 shadow-sm z-10' : 'border-transparent'}`}>
                        {e}
                      </div>
                    ))}
                  </div>
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
              placeholder="e.g. Best Pizza Spots" />
          </div>

          {/* Color */}
          <div className="mb-6">
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Color</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map(c => (
                <div key={c} onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-150 border-2
                    ${color === c ? 'border-primary' : 'border-transparent'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-5 border-t border-b1 mt-2">
            <button onClick={closeCollectionModal}
              className="py-2.5 px-5 rounded-lg font-body text-sm font-medium cursor-pointer transition-all duration-150 border border-b1 bg-transparent text-t2 hover:bg-elevated hover:text-t1">
              Cancel
            </button>
            <button onClick={handleSave}
              className="py-2.5 px-5 rounded-lg font-body text-sm font-medium cursor-pointer transition-all duration-150 border border-transparent bg-primary text-white hover:bg-[#5a52dd] hover:-translate-y-px">
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
