import { useState } from 'react';
import { ChevronRight, Pin, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BADGE_STYLES, COLLECTIONS } from '../../data';

function PlaceCard({ place, index }) {
  const { flyTo, deletePlace, togglePin } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const badge = BADGE_STYLES[place.category] || BADGE_STYLES['Memory'];

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
      return;
    }
    deletePlace(place.id);
  };

  const handlePin = (e) => {
    e.stopPropagation();
    togglePin(place.id, place.pinned);
  };

  return (
    <div
      className={`card-gradient bg-elevated border rounded-xl p-4 mb-2 cursor-pointer transition-all duration-200 hover:border-b2 hover:bg-surface hover:-translate-y-px animate-fade-in group ${place.pinned ? 'border-ba' : 'border-b1'}`}
      style={{ animationDelay: `${index * 0.04}s` }}
      onClick={() => flyTo(place.lat, place.lng)}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 bg-layer rounded-lg flex items-center justify-center text-lg shrink-0 border border-b1">
          {place.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm font-semibold mb-0.5 truncate">{place.name}</div>
          <div className="text-xs text-t3 truncate">{place.addr}</div>
        </div>
        <span className="text-[10px] font-semibold py-1 px-2.5 rounded-full shrink-0 tracking-[0.04em]"
          style={{ background: badge.bg, color: badge.color }}>
          {place.category}
        </span>
      </div>

      {place.note && (
        <div className="text-xs text-t2 leading-relaxed italic mt-1">"{place.note}"</div>
      )}

      {place.vibe && (
        <span className="inline-flex items-center text-[10px] text-t2 bg-layer py-1 px-2.5 rounded-full border border-b1 mt-2">
          {place.vibe}
        </span>
      )}

      {place.tags && place.tags.length > 0 && (
        <div className="flex gap-1.5 mt-2">
          {place.tags.map(tag => (
            <span key={tag} className="text-[10px] text-t3 bg-layer border border-b1 py-0.5 px-2 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-b1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={handlePin}
          className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all duration-150 border
            ${place.pinned
              ? 'bg-pglow border-ba text-ta'
              : 'bg-transparent border-b1 text-t3 hover:border-b2 hover:text-t2'
            }`}
          title={place.pinned ? 'Unpin' : 'Pin'}>
          <Pin size={11} />
          {place.pinned ? 'Pinned' : 'Pin'}
        </button>
        <div className="flex-1" />
        <button
          onClick={handleDelete}
          className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all duration-150 border
            ${confirmDelete
              ? 'bg-[rgba(244,63,94,0.14)] border-[rgba(244,63,94,0.3)] text-rose'
              : 'bg-transparent border-b1 text-t3 hover:border-[rgba(244,63,94,0.3)] hover:text-rose'
            }`}
          title="Delete">
          <Trash2 size={11} />
          {confirmDelete ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-elevated border border-b1 rounded-xl p-4 mb-2 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-layer rounded-lg" />
            <div className="flex-1">
              <div className="h-3.5 bg-layer rounded w-3/4 mb-2" />
              <div className="h-2.5 bg-layer rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState() {
  const { openAddModal } = useApp();
  return (
    <div className="text-center py-12 px-4">
      <div className="text-4xl mb-4">📍</div>
      <div className="font-display text-sm font-bold mb-2">No places yet</div>
      <p className="text-xs text-t3 mb-5 leading-relaxed">
        Right-click the map to save your first place,<br />or press <strong className="text-ta">N</strong> to add one.
      </p>
      <button
        onClick={() => openAddModal()}
        className="py-2 px-5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 border border-ba bg-pglow text-ta hover:bg-primary hover:text-white hover:border-primary">
        + Add a place
      </button>
    </div>
  );
}

export default function PlacesPanel() {
  const { savedPlaces, placesLoading } = useApp();

  if (placesLoading) return <LoadingSkeleton />;
  if (savedPlaces.length === 0) return <EmptyState />;

  const pinned = savedPlaces.filter(p => p.pinned);
  const recent = savedPlaces.filter(p => !p.pinned);

  return (
    <>
      {pinned.length > 0 && (
        <>
          <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-2 mb-3 mx-1">
            📌 Pinned · {pinned.length}
          </p>
          {pinned.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
        </>
      )}

      {COLLECTIONS && COLLECTIONS.length > 0 && (
        <>
          <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1">
            Collections
          </p>
          {COLLECTIONS.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 bg-elevated border border-b1 rounded-xl mb-2 cursor-pointer transition-all duration-200 hover:border-b2 hover:translate-x-0.5 animate-fade-in"
              onClick={() => { switchTab('trips'); showToast(`📂 ${c.name}`); }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                style={{ background: c.color }}>
                {c.emoji}
              </div>
              <div>
                <div className="font-semibold text-sm mb-0.5">{c.name}</div>
                <div className="text-xs text-t3">{c.count}</div>
              </div>
              <ChevronRight size={16} className="ml-auto text-t3" />
            </div>
          ))}
        </>
      )}

      {recent.length > 0 && (
        <>
          <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1">
            Recent · {recent.length}
          </p>
          {recent.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
        </>
      )}
    </>
  );
}
