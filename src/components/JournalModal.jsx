import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

export default function JournalModal() {
  const { 
    journalModalOpen, 
    closeJournalModal, 
    addJournalEntry, 
    updateJournalEntry, 
    journalToEdit, 
    savedPlaces, 
    ctxLatLng 
  } = useApp();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [customLoc, setCustomLoc] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [titleError, setTitleError] = useState(false);
  
  const titleRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize and reverse geocode if creating new entry with coordinates
  useEffect(() => {
    if (journalModalOpen) {
      if (journalToEdit) {
        setTitle(journalToEdit.title || '');
        setBody(journalToEdit.body || '');
        setPlaceId(journalToEdit.placeId || '');
        setCustomLoc(journalToEdit.loc || '');
        setTitleError(false);
        setTimeout(() => titleRef.current?.focus(), 150);
      } else {
        setTitle('');
        setBody('');
        setPlaceId('');
        setCustomLoc('📍 ');
        setTitleError(false);
        setTimeout(() => titleRef.current?.focus(), 150);

        if (ctxLatLng) {
          setGeoLoading(true);
          setCustomLoc(`📍 ${ctxLatLng.lat.toFixed(5)}, ${ctxLatLng.lng.toFixed(5)}`);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${ctxLatLng.lat}&lon=${ctxLatLng.lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' },
          })
            .then(r => r.json())
            .then(data => {
              if (data?.display_name) {
                const parts = data.display_name.split(', ');
                const short = parts.slice(0, 3).join(', ');
                setCustomLoc(`📍 ${short}`);
              }
            })
            .catch(() => {})
            .finally(() => setGeoLoading(false));
        }
      }
    }
  }, [journalModalOpen, journalToEdit, ctxLatLng]);

  const applyFormatting = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let prefix = '';
    let suffix = '';

    switch (type) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        break;
      case 'italic':
        prefix = '*';
        suffix = '*';
        break;
      case 'underline':
        prefix = '~';
        suffix = '~';
        break;
      case 'bullet':
        prefix = '\n- ';
        suffix = '';
        break;
      case 'number':
        prefix = '\n1. ';
        suffix = '';
        break;
      default:
        return;
    }

    let replacement = '';
    if (type === 'bullet' || type === 'number') {
      if (selectedText) {
        const lines = selectedText.split('\n');
        replacement = lines.map((line, idx) => {
          const marker = type === 'bullet' ? '- ' : `${idx + 1}. `;
          return line.startsWith(marker) ? line : `${marker}${line}`;
        }).join('\n');
      } else {
        const isStartOfLine = start === 0 || text.charAt(start - 1) === '\n';
        const actualPrefix = isStartOfLine ? prefix.trimStart() : prefix;
        replacement = actualPrefix;
      }
    } else {
      replacement = prefix + selectedText + suffix;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setBody(newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start, start + replacement.length);
      } else {
        if (type === 'bullet' || type === 'number') {
          textarea.setSelectionRange(start + replacement.length, start + replacement.length);
        } else {
          textarea.setSelectionRange(start + prefix.length, start + prefix.length);
        }
      }
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        applyFormatting('bold');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        applyFormatting('italic');
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        applyFormatting('underline');
      }
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      titleRef.current?.focus();
      setTimeout(() => setTitleError(false), 1400);
      return;
    }

    let locText = customLoc.trim();
    if (locText === '📍') {
      locText = '';
    }
    let lat = null;
    let lng = null;

    if (placeId) {
      const place = savedPlaces.find(p => p.id === placeId);
      if (place) {
        locText = `📍 ${place.name}, ${place.addr}`;
        lat = place.lat;
        lng = place.lng;
      }
    }

    const payload = {
      title: title.trim(),
      body: body.trim(),
      loc: locText || 'Unspecified location',
      placeId: placeId || '',
      lat,
      lng
    };

    if (journalToEdit) {
      updateJournalEntry(journalToEdit.id, payload);
    } else {
      addJournalEntry(payload);
    }
  };

  if (!journalModalOpen) return null;

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;

  return (
    <div
      className={`fixed inset-0 z-[600] flex items-center justify-center transition-opacity duration-200 ${journalModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(7,7,13,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closeJournalModal(); }}
    >
      <div 
        className="modal-panel bg-layer border border-b2 rounded-2xl w-[680px] max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto flex flex-col"
        style={{ boxShadow: '0 36px 100px rgba(0,0,0,.75)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-0 mb-4">
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-t3">
            {journalToEdit ? 'Edit Journal Entry' : 'Write Journal Entry'}
          </div>
          <button 
            onClick={closeJournalModal}
            className="w-8 h-8 rounded-lg bg-elevated border border-b1 text-t3 flex items-center justify-center cursor-pointer transition-all duration-150 text-lg leading-none hover:text-t1 hover:border-b2"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <div className="px-8 pb-8 flex-1 flex flex-col gap-5">
          {/* Title - distraction free */}
          <div className="border-b border-b1 pb-2">
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-transparent border-none text-xl font-bold font-display placeholder:text-t3 focus:outline-none focus:ring-0 text-t1"
              style={{ caretColor: 'white' }}
              placeholder="Title of your entry..."
            />
            {titleError && (
              <span className="text-[10px] text-rose font-mono">Title is required to save entry.</span>
            )}
          </div>

          {/* Place Link Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-t3">Link to Saved Place</label>
              <select
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                className="w-full bg-elevated border border-b1 rounded-lg py-2.5 px-4 text-xs text-t2 outline-none cursor-pointer focus:border-ba focus:shadow-[0_0_0_3px_var(--color-pglow)] transition-all"
              >
                <option value="">None / Custom Location</option>
                {savedPlaces.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            </div>

            {/* Custom Location Text Field */}
            {!placeId && (
              <div className="flex flex-col gap-1.5 animate-fade-in">
                <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-t3 flex items-center gap-2">
                  Location Text
                  {geoLoading && <span className="text-primary text-[8px] font-normal normal-case animate-pulse">resolving coordinates…</span>}
                </label>
                <input
                  value={customLoc}
                  onChange={(e) => setCustomLoc(e.target.value)}
                  className="w-full bg-elevated border border-b1 rounded-lg py-2.5 px-4 text-xs text-t1 outline-none focus:border-ba focus:shadow-[0_0_0_3px_var(--color-pglow)] transition-all placeholder:text-t3"
                  placeholder="Where are you writing this?"
                />
              </div>
            )}
          </div>

          {/* Body content - distraction free, spacious text canvas */}
          <div className="flex-1 flex flex-col min-h-[320px] gap-2.5">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 pb-2 border-b border-b1 text-t3 select-none">
              <button
                type="button"
                onClick={() => applyFormatting('bold')}
                className="p-1.5 rounded hover:bg-elevated hover:text-t1 cursor-pointer transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('italic')}
                className="p-1.5 rounded hover:bg-elevated hover:text-t1 cursor-pointer transition-colors"
                title="Italic (Ctrl+I)"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('underline')}
                className="p-1.5 rounded hover:bg-elevated hover:text-t1 cursor-pointer transition-colors"
                title="Underline (Ctrl+U)"
              >
                <Underline size={13} />
              </button>
              
              <div className="w-px h-4 bg-b1 mx-1" />
              
              <button
                type="button"
                onClick={() => applyFormatting('bullet')}
                className="p-1.5 rounded hover:bg-elevated hover:text-t1 cursor-pointer transition-colors"
                title="Bullet List"
              >
                <List size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('number')}
                className="p-1.5 rounded hover:bg-elevated hover:text-t1 cursor-pointer transition-colors"
                title="Numbered List"
              >
                <ListOrdered size={13} />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              required
              className="w-full flex-1 bg-transparent border-none text-sm leading-[1.8] text-t1 focus:outline-none focus:ring-0 resize-none placeholder:text-t3 font-body min-h-[260px]"
              style={{ caretColor: 'white' }}
              placeholder="What's on your mind? Capture the vibe, the people, the memories..."
            />
          </div>

          {/* Editor Stats / Info Row */}
          <div className="flex items-center justify-between text-[10px] font-mono text-t3 border-t border-b1 pt-4">
            <div>
              {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} {charCount === 1 ? 'character' : 'characters'}
            </div>
            <div>
              Auto-saved to TRACE
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end mt-2">
            <button
              onClick={closeJournalModal}
              className="py-2.5 px-5 rounded-lg font-body text-sm font-medium cursor-pointer transition-all duration-150 border border-b1 bg-transparent text-t2 hover:bg-elevated hover:text-t1"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="py-2.5 px-5 rounded-lg font-body text-sm font-bold cursor-pointer transition-all duration-150 border border-transparent bg-white text-black hover:bg-gray-200 hover:-translate-y-px shadow-[0_2px_10px_rgba(255,255,255,0.1)]"
            >
              {journalToEdit ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
