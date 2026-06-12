import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Trash2, Edit2, MapPin, Search, Plus, Calendar, Map } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function formatDateRange(start, end) {
  if (!start) return '';
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  const s = new Date(start + 'T00:00:00');
  const sStr = s.toLocaleDateString('en-US', opts);
  if (!end) return sStr;
  const e = new Date(end + 'T00:00:00');
  const eStr = e.toLocaleDateString('en-US', opts);
  return `${sStr} – ${eStr}`;
}

function getDuration(start, end) {
  if (!start || !end) return null;
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  if (diff <= 0) return null;
  return `${diff} ${diff === 1 ? 'day' : 'days'}`;
}

const STATUS_CONFIG = {
  active:    { bg: 'rgba(245,158,11,0.14)', color: '#f59e0b', label: 'Active', order: 0 },
  planning:  { bg: 'rgba(108,99,255,0.14)', color: '#a78bfa', label: 'Planning', order: 1 },
  completed: { bg: 'rgba(16,185,129,0.14)', color: '#10b981', label: 'Completed', order: 2 },
};

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-elevated border border-b1 rounded-2xl p-4 mb-3 animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-layer rounded-xl" />
            <div className="flex-1">
              <div className="h-4 bg-layer rounded w-3/4 mb-2" />
              <div className="h-3 bg-layer rounded w-1/2" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-layer rounded-lg flex-1" />
            <div className="h-8 bg-layer rounded-lg flex-1" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState({ onCreateTrip }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-4xl mb-4">✈️</div>
      <div className="font-display text-sm font-bold mb-2">No trips yet</div>
      <p className="text-xs text-t3 mb-5 leading-relaxed">
        Plan your next adventure — organize stops,<br />link saved places, and track your journeys.
      </p>
      <button
        onClick={onCreateTrip}
        className="py-2 px-5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 border border-ba bg-pglow text-ta hover:bg-primary hover:text-black hover:border-primary">
        + Plan a trip
      </button>
    </div>
  );
}

function TripCard({ trip, index, savedPlaces }) {
  const { deleteTrip, openTripModal, flyTo, mapRef, showToast } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusCfg = STATUS_CONFIG[trip.status] || STATUS_CONFIG.planning;
  const dateStr = formatDateRange(trip.startDate, trip.endDate);
  const duration = getDuration(trip.startDate, trip.endDate);
  const totalStops = (trip.days || []).reduce((sum, d) => sum + (d.stops || []).length, 0);
  const daysWithStops = (trip.days || []).filter(d => (d.stops || []).length > 0).length;
  const totalDays = (trip.days || []).length;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
      return;
    }
    deleteTrip(trip.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    openTripModal(trip);
  };

  const handleViewOnMap = (e) => {
    e.stopPropagation();
    // Collect all coordinates from stops linked to saved places
    const coords = [];
    (trip.days || []).forEach(day => {
      (day.stops || []).forEach(stop => {
        if (stop.type === 'place' && stop.placeId) {
          const place = savedPlaces.find(p => p.id === stop.placeId);
          if (place && place.lat && place.lng) {
            coords.push([place.lng, place.lat]);
          }
        }
      });
    });

    if (coords.length === 0) {
      showToast('📍 No linked places to show on map');
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    if (coords.length === 1) {
      flyTo(coords[0][1], coords[0][0], 15);
    } else {
      // Fit bounds to all coordinates
      const lngs = coords.map(c => c[0]);
      const lats = coords.map(c => c[1]);
      map.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 60, duration: 1200 }
      );
    }
    showToast(`🗺️ Viewing ${trip.name} on map`, 'ok');
  };

  return (
    <div
      className="bg-elevated border border-b1 rounded-2xl overflow-hidden mb-3 cursor-pointer transition-all duration-200 hover:border-b2 hover:-translate-y-0.5 animate-fade-in group"
      style={{ animationDelay: `${index * 0.05}s`, borderLeftWidth: '3px', borderLeftColor: statusCfg.color + '66' }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-b1"
          style={{ background: trip.coverColor || 'var(--color-layer)' }}>
          {trip.emoji}
        </div>
        <div className="flex-1 min-w-0 mt-0.5">
          <div className="font-display text-base font-bold mb-0.5 truncate text-t1">{trip.name}</div>
          {trip.destination && (
            <div className="text-xs text-t3 mb-1">{trip.destination}</div>
          )}
          {dateStr && (
            <div className="flex items-center gap-1.5 text-xs text-t3 font-mono">
              <Calendar size={10} />
              <span>{dateStr}</span>
              {duration && <span className="text-t2 font-semibold">· {duration}</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-semibold py-1 px-3 rounded-full tracking-[0.05em]"
            style={{ background: statusCfg.bg, color: statusCfg.color }}>
            {statusCfg.label}
          </span>
          <div className={`transition-transform duration-200 text-t3 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 pb-3 flex items-center gap-3">
        <span className="text-[10px] text-t3 font-mono">{totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
        <span className="text-[10px] text-t3">·</span>
        <span className="text-[10px] text-t3 font-mono">{totalStops} {totalStops === 1 ? 'stop' : 'stops'}</span>
        {totalDays > 0 && trip.status === 'planning' && (
          <>
            <span className="text-[10px] text-t3">·</span>
            <span className="text-[10px] font-mono" style={{ color: statusCfg.color }}>
              {daysWithStops}/{totalDays} days planned
            </span>
          </>
        )}
      </div>

      {/* Notes preview */}
      {trip.notes && !expanded && (
        <div className="px-4 pb-3">
          <div className="text-xs text-t2 italic truncate">"{trip.notes}"</div>
        </div>
      )}

      {/* Expanded: Day-by-day breakdown */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-b1 pt-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          {trip.notes && (
            <div className="text-xs text-t2 italic mb-3 leading-relaxed bg-layer border border-b1 rounded-lg p-3">
              "{trip.notes}"
            </div>
          )}

          {(trip.days || []).length === 0 ? (
            <div className="text-center py-4 text-xs text-t3">
              No itinerary days yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(trip.days || []).map((day, di) => (
                <div key={di} className="bg-layer border border-b1 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[10px] text-primary font-bold min-w-10">{day.label}</span>
                    <span className="text-xs text-t1 font-medium">{day.title}</span>
                    <span className="ml-auto text-[10px] text-t3 font-mono">
                      {(day.stops || []).length} {(day.stops || []).length === 1 ? 'stop' : 'stops'}
                    </span>
                  </div>
                  {(day.stops || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(day.stops || []).map((stop, si) => {
                        const place = stop.type === 'place' ? savedPlaces.find(p => p.id === stop.placeId) : null;
                        const stopEmoji = place ? place.emoji : stop.emoji || '📍';
                        const stopName = place ? place.name : stop.name;
                        const isClickable = place && place.lat && place.lng;

                        return (
                          <span key={si}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isClickable) flyTo(place.lat, place.lng);
                            }}
                            className={`inline-flex items-center gap-1 text-[10px] py-1 px-2 bg-elevated border border-b1 rounded-md
                              ${isClickable ? 'cursor-pointer hover:border-ba hover:text-primary transition-all' : 'text-t2'}`}>
                            <span className="text-xs">{stopEmoji}</span>
                            {stopName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-b1">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all duration-150 border bg-transparent border-b1 text-t3 hover:border-b2 hover:text-t2">
              <Edit2 size={11} /> Edit
            </button>
            <button
              onClick={handleViewOnMap}
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all duration-150 border bg-transparent border-b1 text-t3 hover:border-b2 hover:text-t2">
              <Map size={11} /> View on Map
            </button>
            <div className="flex-1" />
            <button
              onClick={handleDelete}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all duration-150 border
                ${confirmDelete
                  ? 'bg-[rgba(244,63,94,0.14)] border-[rgba(244,63,94,0.3)] text-rose'
                  : 'bg-transparent border-b1 text-t3 hover:border-[rgba(244,63,94,0.3)] hover:text-rose'
                }`}>
              <Trash2 size={11} />
              {confirmDelete ? 'Confirm?' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


export default function TripsPanel() {
  const { trips, tripsLoading, openTripModal, savedPlaces } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const { active, planning, completed } = useMemo(() => {
    let filtered = [...trips];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) ||
        (t.destination || '').toLowerCase().includes(q) ||
        (t.notes || '').toLowerCase().includes(q)
      );
    }

    return {
      active: filtered.filter(t => t.status === 'active'),
      planning: filtered.filter(t => t.status === 'planning'),
      completed: filtered.filter(t => t.status === 'completed'),
    };
  }, [trips, searchQuery]);

  if (tripsLoading) return <LoadingSkeleton />;
  if (trips.length === 0 && !searchQuery) {
    return <EmptyState onCreateTrip={() => openTripModal()} />;
  }

  const totalFiltered = active.length + planning.length + completed.length;

  return (
    <div className="flex flex-col h-full overflow-visible">
      {/* Header Controls */}
      <div className="sticky -top-5 -mt-5 -mx-5 px-5 pt-5 bg-base z-10 pb-4 mb-2 border-b border-b1">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-elevated border border-b1 rounded-lg py-2 pl-8 pr-4 text-xs outline-none focus:border-primary transition-colors placeholder:text-t3"
            />
          </div>
          <button
            onClick={() => openTripModal()}
            className="py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all duration-150 border border-ba bg-pglow text-ta hover:bg-primary hover:text-black hover:border-primary flex items-center gap-1 shrink-0">
            <Plus size={12} strokeWidth={2.5} /> New Trip
          </button>
        </div>
      </div>

      {/* Trip groups */}
      <div className="flex-1 overflow-visible">
        {searchQuery && totalFiltered === 0 && (
          <div className="text-center py-8 text-t3 text-xs">No trips match "{searchQuery}".</div>
        )}

        {active.length > 0 && (
          <>
            <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-2 mb-3 mx-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              Active · {active.length}
            </p>
            {active.map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} savedPlaces={savedPlaces} />)}
          </>
        )}

        {planning.length > 0 && (
          <>
            <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Planning · {planning.length}
            </p>
            {planning.map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} savedPlaces={savedPlaces} />)}
          </>
        )}

        {completed.length > 0 && (
          <>
            <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-mint" />
              Completed · {completed.length}
            </p>
            {completed.map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} savedPlaces={savedPlaces} />)}
          </>
        )}
      </div>
    </div>
  );
}
