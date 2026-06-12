import { useState, useMemo } from 'react';
import { ChevronRight, Pin, Trash2, Edit2, Search, Plus, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BADGE_STYLES, CATEGORY_OPTIONS } from '../../data';

function PlaceCard({ place, index }) {
  const { flyTo, deletePlace, togglePin, openPlaceModal } = useApp();
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

  const handleEdit = (e) => {
    e.stopPropagation();
    openPlaceModal(null, place);
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

      {/* Actions */}
      <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-300">
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-b1">
            <button
              onClick={handlePin}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all duration-150 border
                ${place.pinned
                  ? 'bg-pglow border-ba text-ta'
                  : 'bg-transparent border-b1 text-t3 hover:border-b2 hover:text-t2 hover:bg-layer'
                }`}
              title={place.pinned ? 'Unpin' : 'Pin'}>
              <Pin size={11} />
              {place.pinned ? 'Pinned' : 'Pin'}
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all duration-150 border bg-transparent border-b1 text-t3 hover:border-b2 hover:text-t2 hover:bg-layer"
              title="Edit">
              <Edit2 size={11} />
              Edit
            </button>
            <div className="flex-1" />
            <button
              onClick={handleDelete}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all duration-150 border
                ${confirmDelete
                  ? 'bg-[rgba(244,63,94,0.14)] border-[rgba(244,63,94,0.3)] text-rose'
                  : 'bg-transparent border-b1 text-t3 hover:border-[rgba(244,63,94,0.3)] hover:text-rose hover:bg-[rgba(244,63,94,0.05)]'
                }`}
              title="Delete">
              <Trash2 size={11} />
              {confirmDelete ? 'Confirm?' : 'Delete'}
            </button>
          </div>
        </div>
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

function EmptyState({ openPlaceModal }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-4xl mb-4">📍</div>
      <div className="font-display text-sm font-bold mb-2">No places yet</div>
      <p className="text-xs text-t3 mb-5 leading-relaxed">
        Right-click the map to save your first place,<br />or press <strong className="text-ta">N</strong> to add one.
      </p>
      <button
        onClick={() => openPlaceModal()}
        className="py-2 px-5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 border border-ba bg-pglow text-ta hover:bg-primary hover:text-black hover:border-primary">
        + Add a place
      </button>
    </div>
  );
}

export default function PlacesPanel() {
  const { savedPlaces, placesLoading, collections, collectionsLoading, openPlaceModal, openCollectionModal, deleteCollection, showToast } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'oldest', 'alpha'
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);

  const filteredPlaces = useMemo(() => {
    let result = [...savedPlaces];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.addr.toLowerCase().includes(q));
    }

    // Category Filter
    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Collection Filter
    if (selectedCollectionId) {
      result = result.filter(p => p.collectionId === selectedCollectionId);
    }

    // Sort
    if (sortBy === 'oldest') {
      result.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // recent (default from firestore)
      result.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    }

    return result;
  }, [savedPlaces, searchQuery, categoryFilter, sortBy, selectedCollectionId]);

  if (placesLoading || collectionsLoading) return <LoadingSkeleton />;
  if (savedPlaces.length === 0 && !searchQuery && categoryFilter === 'All' && !selectedCollectionId) {
     return <EmptyState openPlaceModal={openPlaceModal} />;
  }

  const isFiltering = searchQuery || categoryFilter !== 'All' || selectedCollectionId || sortBy !== 'recent';

  return (
    <div className="flex flex-col h-full overflow-visible">
      {/* Top Controls */}
      <div className="sticky -top-5 -mt-5 -mx-5 px-5 pt-5 bg-base z-10 pb-4 mb-2 border-b border-b1">
        <div className="relative mb-3">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
          <input 
            type="text" 
            placeholder="Filter saved places..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-elevated border border-b1 rounded-lg py-2 pl-8 pr-4 text-xs outline-none focus:border-primary transition-colors placeholder:text-t3"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-layer border border-b1 rounded-lg py-1.5 px-3 text-xs text-t2 outline-none flex-1 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-layer border border-b1 rounded-lg py-1.5 px-3 text-xs text-t2 outline-none flex-1 cursor-pointer"
          >
            <option value="recent">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alpha">A-Z</option>
          </select>
        </div>
      </div>

      {/* Selected Collection Header (if any) */}
      {selectedCollectionId && (
        <div className="flex items-center justify-between bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.2)] rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{collections.find(c => c.id === selectedCollectionId)?.emoji}</span>
            <span className="font-semibold text-sm text-ta">{collections.find(c => c.id === selectedCollectionId)?.name}</span>
          </div>
          <button 
            onClick={() => setSelectedCollectionId(null)}
            className="text-xs text-primary hover:underline"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* List Content */}
      <div className="flex-1 overflow-visible">
        {isFiltering ? (
          <>
            <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mb-3 mx-1">
              Results · {filteredPlaces.length}
            </p>
            {filteredPlaces.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
            {filteredPlaces.length === 0 && (
              <div className="text-center py-8 text-t3 text-xs">No places match your filters.</div>
            )}
          </>
        ) : (
          <>
            {/* Standard View */}
            {filteredPlaces.filter(p => p.pinned).length > 0 && (
              <>
                <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-2 mb-3 mx-1">
                  📌 Pinned · {filteredPlaces.filter(p => p.pinned).length}
                </p>
                {filteredPlaces.filter(p => p.pinned).map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
              </>
            )}

            {/* Collections Block */}
            <div className="mt-5 mb-3 mx-1 flex items-center justify-between">
              <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase">
                Collections
              </p>
              <button 
                onClick={openCollectionModal}
                className="text-[10px] font-bold text-[#10b981] bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.2)] hover:text-[#34d399] hover:border-[rgba(16,185,129,0.3)] transition-all px-2 py-1.5 rounded-md flex items-center gap-1"
              >
                <Plus size={10} strokeWidth={2.5} /> NEW
              </button>
            </div>
            
            {collections.length === 0 ? (
              <div className="text-center py-4 bg-elevated border border-b1 rounded-xl text-xs text-t3 mb-2">
                Create a collection to organize your places.
              </div>
            ) : (
              collections.map(c => {
                const count = savedPlaces.filter(p => p.collectionId === c.id).length;
                return (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-elevated border border-b1 rounded-xl mb-2 cursor-pointer transition-all duration-200 hover:border-b2 hover:translate-x-0.5 animate-fade-in group"
                    onClick={() => { setSelectedCollectionId(c.id); showToast(`Viewing ${c.name}`); }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                      style={{ background: c.color }}>
                      {c.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-0.5">{c.name}</div>
                      <div className="text-xs text-t3">{count} {count === 1 ? 'place' : 'places'}</div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteCollection(c.id); }}
                      className="p-1.5 text-t3 hover:text-rose opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Collection"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={16} className="text-t3" />
                  </div>
                );
              })
            )}

            {/* Recent Block */}
            {filteredPlaces.filter(p => !p.pinned).length > 0 && (
              <>
                <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1">
                  Recent · {filteredPlaces.filter(p => !p.pinned).length}
                </p>
                {filteredPlaces.filter(p => !p.pinned).map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
