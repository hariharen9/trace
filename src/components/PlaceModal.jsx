import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EMOJI_OPTIONS, CATEGORY_OPTIONS, VIBE_OPTIONS } from '../data';

export default function PlaceModal() {
  const { placeModalOpen, closePlaceModal, addPlace, updatePlace, ctxLatLng, placeToEdit, collections, defaultEmoji } = useApp();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [addr, setAddr] = useState('');
  const [emoji, setEmoji] = useState('☕');
  const [category, setCategory] = useState('Café');
  const [vibe, setVibe] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [nameError, setNameError] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const nameRef = useRef(null);

  // Reset form + reverse geocode when opened
  useEffect(() => {
    if (placeModalOpen) {
      if (placeToEdit) {
        setName(placeToEdit.name || '');
        setNote(placeToEdit.note || '');
        setAddr(placeToEdit.addr || '');
        setEmoji(placeToEdit.emoji || '☕');
        setCategory(placeToEdit.category || 'Café');
        setVibe(placeToEdit.vibe || '');
        setCollectionId(placeToEdit.collectionId || '');
        setNameError(false);
        setTimeout(() => nameRef.current?.focus(), 150);
      } else {
        setName(''); setNote(''); setAddr(''); setEmoji(defaultEmoji || '☕'); setCategory('Café'); setVibe(''); setCollectionId(''); setNameError(false);
        setTimeout(() => nameRef.current?.focus(), 150);

        // Reverse geocode if we have coordinates
        if (ctxLatLng) {
          setGeoLoading(true);
          setAddr(`${ctxLatLng.lat.toFixed(5)}, ${ctxLatLng.lng.toFixed(5)}`);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${ctxLatLng.lat}&lon=${ctxLatLng.lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' },
          })
            .then(r => r.json())
            .then(data => {
              if (data?.display_name) {
                // Shorten: take first 2-3 meaningful parts
                const parts = data.display_name.split(', ');
                const short = parts.slice(0, 3).join(', ');
                setAddr(short);
              }
            })
            .catch(() => { /* keep coordinate fallback */ })
            .finally(() => setGeoLoading(false));
        }
      }
    }
  }, [placeModalOpen, ctxLatLng, placeToEdit]);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      nameRef.current?.focus();
      setTimeout(() => setNameError(false), 1400);
      return;
    }
    const payload = {
      emoji,
      name: name.trim(),
      addr: addr.trim() || 'Saved location',
      note: note.trim(),
      category,
      vibe,
      collectionId: collectionId || null,
    };

    if (placeToEdit && placeToEdit.id) {
      updatePlace(placeToEdit.id, payload);
    } else {
      addPlace(payload);
    }
  };

  if (!placeModalOpen) return null;

  return (
    <div
      className={`modal-open fixed inset-0 z-[600] flex items-center justify-center transition-opacity duration-200 ${placeModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(7,7,13,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closePlaceModal(); }}
    >
      <div className="modal-panel bg-layer border border-b2 rounded-2xl w-[520px] max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 36px 100px rgba(0,0,0,.7)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-0 mb-6">
          <div className="font-display text-lg font-bold">{placeToEdit ? 'Edit place' : 'Save a place'}</div>
          <button onClick={closePlaceModal}
            className="w-8 h-8 rounded-lg bg-elevated border border-b1 text-t3 flex items-center justify-center cursor-pointer transition-all duration-150 text-lg leading-none hover:text-t1 hover:border-b2">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-8">
          {/* Emoji picker */}
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
              placeholder="What is this place?" />
          </div>

          {/* Address */}
          <div className="mb-5">
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 flex items-center gap-2">
              Address
              {geoLoading && <span className="text-primary text-[9px] font-normal normal-case">detecting…</span>}
            </label>
            <input value={addr} onChange={(e) => setAddr(e.target.value)}
              className="w-full bg-elevated border border-b1 rounded-lg py-3 px-4 text-t1 font-body text-sm outline-none transition-all duration-200 placeholder:text-t3 focus:border-ba focus:shadow-[0_0_0_3px_var(--color-pglow)]"
              placeholder="Address or location name" />
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

          {/* Collection */}
          {collections.length > 0 && (
            <div className="mb-5">
              <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Collection</label>
              <div className="flex gap-2 flex-wrap">
                <div onClick={() => setCollectionId('')}
                  className={`py-2 px-4 rounded-full text-xs cursor-pointer transition-all duration-150 border
                    ${!collectionId ? 'bg-pglow border-ba text-ta' : 'bg-elevated border-b1 text-t2 hover:border-b2'}`}>
                  None
                </div>
                {collections.map(c => (
                  <div key={c.id} onClick={() => setCollectionId(c.id)}
                    className={`py-2 px-4 rounded-full text-xs cursor-pointer transition-all duration-150 border flex items-center gap-1.5
                      ${collectionId === c.id ? 'bg-pglow border-ba text-ta' : 'bg-elevated border-b1 text-t2 hover:border-b2'}`}>
                    <span>{c.emoji}</span> {c.name}
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <button onClick={closePlaceModal}
              className="py-2.5 px-5 rounded-lg font-body text-sm font-medium cursor-pointer transition-all duration-150 border border-b1 bg-transparent text-t2 hover:bg-elevated hover:text-t1">
              Cancel
            </button>
            <button onClick={handleSave}
              className="py-2.5 px-5 rounded-lg font-body text-sm font-bold cursor-pointer transition-all duration-150 border border-transparent bg-white text-black hover:bg-gray-200 hover:-translate-y-px shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
              {placeToEdit ? 'Update place' : 'Save place'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
