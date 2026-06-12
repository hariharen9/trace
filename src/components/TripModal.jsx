import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, MapPin, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EMOJI_OPTIONS, TRIP_COVER_COLORS } from '../data';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', color: 'rgba(108,99,255,0.14)', text: '#a78bfa' },
  { value: 'active', label: 'Active', color: 'rgba(245,158,11,0.14)', text: '#f59e0b' },
  { value: 'completed', label: 'Completed', color: 'rgba(16,185,129,0.14)', text: '#10b981' },
];

function StopChip({ stop, onRemove, savedPlaces, onFlyTo }) {
  const place = stop.type === 'place' ? savedPlaces.find(p => p.id === stop.placeId) : null;
  const emoji = place ? place.emoji : stop.emoji || '📍';
  const name = place ? place.name : stop.name;

  return (
    <div className="flex items-center gap-1.5 py-1 px-2 bg-layer border border-b1 rounded-lg text-xs group/chip animate-fade-in">
      <span className="text-sm">{emoji}</span>
      <span
        className={`text-t2 truncate max-w-[140px] ${place ? 'cursor-pointer hover:text-primary hover:underline' : ''}`}
        onClick={() => place && onFlyTo(place.lat, place.lng)}
      >
        {name}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="ml-0.5 text-t3 hover:text-rose cursor-pointer opacity-0 group-hover/chip:opacity-100 transition-opacity"
      >
        <X size={10} />
      </button>
    </div>
  );
}

function DayRow({ day, dayIndex, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast, savedPlaces, flyTo }) {
  const [showAddStop, setShowAddStop] = useState(false);
  const [stopMode, setStopMode] = useState(null); // 'place' | 'custom'
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('📍');
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const customRef = useRef(null);

  const addCustomStop = () => {
    if (!customName.trim()) return;
    const newStops = [...(day.stops || []), { type: 'custom', name: customName.trim(), emoji: customEmoji }];
    onUpdate({ ...day, stops: newStops });
    setCustomName('');
    setCustomEmoji('📍');
    setStopMode(null);
    setShowAddStop(false);
  };

  const addPlaceStop = () => {
    if (!selectedPlaceId) return;
    const newStops = [...(day.stops || []), { type: 'place', placeId: selectedPlaceId }];
    onUpdate({ ...day, stops: newStops });
    setSelectedPlaceId('');
    setStopMode(null);
    setShowAddStop(false);
  };

  const removeStop = (stopIndex) => {
    const newStops = (day.stops || []).filter((_, i) => i !== stopIndex);
    onUpdate({ ...day, stops: newStops });
  };

  return (
    <div className="bg-elevated border border-b1 rounded-xl p-3.5 animate-fade-in group/day">
      {/* Day header */}
      <div className="flex items-center gap-2 mb-2">
        <input
          value={day.label}
          onChange={(e) => onUpdate({ ...day, label: e.target.value })}
          className="w-16 bg-transparent border-none text-[11px] font-mono font-bold text-primary outline-none"
          placeholder="Day 1"
        />
        <input
          value={day.title}
          onChange={(e) => onUpdate({ ...day, title: e.target.value })}
          className="flex-1 bg-transparent border-none text-xs text-t1 outline-none placeholder:text-t3"
          placeholder="What's the plan for this day?"
        />
        <div className="flex items-center gap-0.5 opacity-0 group-hover/day:opacity-100 transition-opacity">
          {!isFirst && (
            <button onClick={onMoveUp} className="p-1 text-t3 hover:text-t1 cursor-pointer" title="Move up">
              <ChevronUp size={12} />
            </button>
          )}
          {!isLast && (
            <button onClick={onMoveDown} className="p-1 text-t3 hover:text-t1 cursor-pointer" title="Move down">
              <ChevronDown size={12} />
            </button>
          )}
          <button onClick={onRemove} className="p-1 text-t3 hover:text-rose cursor-pointer" title="Remove day">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Stops */}
      {(day.stops || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(day.stops || []).map((stop, si) => (
            <StopChip
              key={si}
              stop={stop}
              savedPlaces={savedPlaces}
              onRemove={() => removeStop(si)}
              onFlyTo={flyTo}
            />
          ))}
        </div>
      )}

      {/* Add stop */}
      {!showAddStop ? (
        <button
          onClick={() => setShowAddStop(true)}
          className="text-[10px] text-t3 hover:text-primary cursor-pointer flex items-center gap-1 transition-colors"
        >
          <Plus size={10} /> Add stop
        </button>
      ) : (
        <div className="mt-1.5 animate-fade-in">
          {!stopMode ? (
            <div className="flex gap-1.5">
              <button
                onClick={() => { setStopMode('place'); }}
                className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all duration-150 border border-b1 bg-layer text-t2 hover:border-ba hover:text-ta"
              >
                <MapPin size={10} /> Saved Place
              </button>
              <button
                onClick={() => { setStopMode('custom'); setTimeout(() => customRef.current?.focus(), 50); }}
                className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all duration-150 border border-b1 bg-layer text-t2 hover:border-ba hover:text-ta"
              >
                <Plus size={10} /> Custom
              </button>
              <button
                onClick={() => setShowAddStop(false)}
                className="py-1.5 px-2 rounded-lg text-[10px] text-t3 hover:text-t1 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : stopMode === 'place' ? (
            <div className="flex gap-1.5 items-center animate-fade-in">
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="flex-1 bg-layer border border-b1 rounded-lg py-1.5 px-2.5 text-[11px] text-t2 outline-none cursor-pointer"
              >
                <option value="">Select a saved place...</option>
                {savedPlaces.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
              <button
                onClick={addPlaceStop}
                className="py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer border border-ba bg-pglow text-ta hover:bg-primary hover:text-black transition-all"
              >
                Add
              </button>
              <button onClick={() => { setStopMode(null); }} className="py-1.5 px-2 text-[10px] text-t3 hover:text-t1 cursor-pointer">
                Back
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5 items-center animate-fade-in">
              <select
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                className="w-12 bg-layer border border-b1 rounded-lg py-1.5 px-1.5 text-sm outline-none cursor-pointer text-center"
              >
                {['📍','✈️','🏨','🍽️','☕','🏖️','⛩️','🎨','🚶','🛍️','🏰','🌊','💧','🌅','🏡','🍣','🍜','🥩','🍺','🍷'].map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <input
                ref={customRef}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomStop()}
                className="flex-1 bg-layer border border-b1 rounded-lg py-1.5 px-2.5 text-[11px] text-t1 outline-none placeholder:text-t3"
                placeholder="Stop name..."
              />
              <button
                onClick={addCustomStop}
                className="py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer border border-ba bg-pglow text-ta hover:bg-primary hover:text-black transition-all"
              >
                Add
              </button>
              <button onClick={() => { setStopMode(null); }} className="py-1.5 px-2 text-[10px] text-t3 hover:text-t1 cursor-pointer">
                Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default function TripModal() {
  const { tripModalOpen, closeTripModal, addTrip, updateTrip, tripToEdit, savedPlaces, flyTo } = useApp();

  const [emoji, setEmoji] = useState('✈️');
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState('planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverColor, setCoverColor] = useState(TRIP_COVER_COLORS[0]);
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState([]);
  const [nameError, setNameError] = useState(false);
  const nameRef = useRef(null);

  // Reset form on open
  useEffect(() => {
    if (tripModalOpen) {
      if (tripToEdit) {
        setEmoji(tripToEdit.emoji || '✈️');
        setName(tripToEdit.name || '');
        setDestination(tripToEdit.destination || '');
        setStatus(tripToEdit.status || 'planning');
        setStartDate(tripToEdit.startDate || '');
        setEndDate(tripToEdit.endDate || '');
        setCoverColor(tripToEdit.coverColor || TRIP_COVER_COLORS[0]);
        setNotes(tripToEdit.notes || '');
        setDays(tripToEdit.days || []);
      } else {
        setEmoji('✈️'); setName(''); setDestination(''); setStatus('planning');
        setStartDate(''); setEndDate(''); setCoverColor(TRIP_COVER_COLORS[0]);
        setNotes(''); setDays([]);
      }
      setNameError(false);
      setTimeout(() => nameRef.current?.focus(), 150);
    }
  }, [tripModalOpen, tripToEdit]);

  const addDay = () => {
    setDays(prev => [...prev, {
      label: `Day ${prev.length + 1}`,
      title: '',
      stops: [],
    }]);
  };

  const updateDay = (index, updated) => {
    setDays(prev => prev.map((d, i) => i === index ? updated : d));
  };

  const removeDay = (index) => {
    setDays(prev => prev.filter((_, i) => i !== index));
  };

  const moveDay = (index, direction) => {
    setDays(prev => {
      const arr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

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
      destination: destination.trim(),
      status,
      startDate,
      endDate,
      coverColor,
      notes: notes.trim(),
      days,
    };

    if (tripToEdit) {
      updateTrip(tripToEdit.id, payload);
    } else {
      addTrip(payload);
    }
  };

  if (!tripModalOpen) return null;

  const totalStops = days.reduce((sum, d) => sum + (d.stops || []).length, 0);

  return (
    <div
      className={`fixed inset-0 z-[600] flex items-center justify-center transition-opacity duration-200 ${tripModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(7,7,13,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closeTripModal(); }}
    >
      <div
        className="modal-panel bg-layer border border-b2 rounded-2xl w-[640px] max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto custom-scroll"
        style={{ boxShadow: '0 36px 100px rgba(0,0,0,.75)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-0 mb-4">
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-t3">
            {tripToEdit ? 'Edit Trip' : 'Plan a Trip'}
          </div>
          <button
            onClick={closeTripModal}
            className="w-8 h-8 rounded-lg bg-elevated border border-b1 text-t3 flex items-center justify-center cursor-pointer transition-all duration-150 text-lg leading-none hover:text-t1 hover:border-b2"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <div className="px-8 pb-8 flex flex-col gap-5">
          {/* Emoji picker */}
          <div>
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Emoji</label>
            <div className="max-h-[120px] overflow-y-auto pr-2 custom-scrollbar bg-[rgba(12,12,22,0.3)] border border-b1 rounded-xl p-3">
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

          {/* Name & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Trip Name *</label>
              <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-elevated rounded-lg py-3 px-4 text-t1 font-body text-sm outline-none transition-all duration-200 placeholder:text-t3 focus:border-ba focus:shadow-[0_0_0_3px_var(--color-pglow)] border"
                style={{ borderColor: nameError ? 'var(--color-rose)' : 'var(--color-b1)' }}
                placeholder="e.g. Tokyo · Kyoto" />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Destination</label>
              <input value={destination} onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-elevated border border-b1 rounded-lg py-3 px-4 text-t1 font-body text-sm outline-none transition-all duration-200 placeholder:text-t3 focus:border-ba focus:shadow-[0_0_0_3px_var(--color-pglow)]"
                placeholder="e.g. Japan" />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-elevated border border-b1 rounded-lg py-2.5 px-4 text-t1 font-body text-sm outline-none transition-all duration-200 focus:border-ba cursor-pointer [color-scheme:dark]" />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-elevated border border-b1 rounded-lg py-2.5 px-4 text-t1 font-body text-sm outline-none transition-all duration-200 focus:border-ba cursor-pointer [color-scheme:dark]" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(s => (
                <div key={s.value} onClick={() => setStatus(s.value)}
                  className={`py-2 px-4 rounded-full text-xs cursor-pointer transition-all duration-150 border flex items-center gap-1.5
                    ${status === s.value ? 'border-ba' : 'bg-elevated border-b1 text-t2 hover:border-b2'}`}
                  style={status === s.value ? { background: s.color, color: s.text, borderColor: s.text + '44' } : {}}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Cover Color */}
          <div>
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Cover Color</label>
            <div className="flex gap-2">
              {TRIP_COVER_COLORS.map(c => (
                <div key={c} onClick={() => setCoverColor(c)}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-150 border-2
                    ${coverColor === c ? 'border-t1 scale-110' : 'border-transparent hover:border-b2'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3 mb-2 block">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full bg-elevated border border-b1 rounded-lg py-3 px-4 text-t1 font-body text-sm outline-none transition-all duration-200 resize-none placeholder:text-t3 focus:border-ba focus:shadow-[0_0_0_3px_var(--color-pglow)]"
              placeholder="Any notes, ideas, or reminders for this trip..." />
          </div>

          {/* Day-by-Day Itinerary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-t3">
                Itinerary · {days.length} {days.length === 1 ? 'day' : 'days'} · {totalStops} {totalStops === 1 ? 'stop' : 'stops'}
              </label>
              <button onClick={addDay}
                className="text-[10px] font-bold text-[#10b981] bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.2)] hover:text-[#34d399] hover:border-[rgba(16,185,129,0.3)] transition-all px-2 py-1.5 rounded-md flex items-center gap-1 cursor-pointer">
                <Plus size={10} strokeWidth={2.5} /> ADD DAY
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {days.length === 0 && (
                <div className="text-center py-6 bg-elevated border border-b1 rounded-xl text-xs text-t3">
                  No days added yet. Click "Add Day" to start building your itinerary.
                </div>
              )}
              {days.map((day, i) => (
                <DayRow
                  key={i}
                  day={day}
                  dayIndex={i}
                  onUpdate={(d) => updateDay(i, d)}
                  onRemove={() => removeDay(i)}
                  onMoveUp={() => moveDay(i, -1)}
                  onMoveDown={() => moveDay(i, 1)}
                  isFirst={i === 0}
                  isLast={i === days.length - 1}
                  savedPlaces={savedPlaces}
                  flyTo={flyTo}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-5 border-t border-b1 mt-2">
            <button onClick={closeTripModal}
              className="py-2.5 px-5 rounded-lg font-body text-sm font-medium cursor-pointer transition-all duration-150 border border-b1 bg-transparent text-t2 hover:bg-elevated hover:text-t1">
              Cancel
            </button>
            <button onClick={handleSave}
              className="py-2.5 px-5 rounded-lg font-body text-sm font-bold cursor-pointer transition-all duration-150 border border-transparent bg-white text-black hover:bg-gray-200 hover:-translate-y-px shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
              {tripToEdit ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
