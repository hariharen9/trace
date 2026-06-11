import { useState, useMemo } from 'react';
import { Search, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseMarkdown } from '../../utils/markdown';

function LoadingSkeleton() {
  return (
    <>
      {[1, 2].map(i => (
        <div key={i} className="bg-elevated border border-b1 rounded-2xl p-4 mb-3 animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-layer rounded-lg" />
            <div className="flex-1">
              <div className="h-3.5 bg-layer rounded w-3/4 mb-2" />
              <div className="h-2.5 bg-layer rounded w-1/2" />
            </div>
          </div>
          <div className="h-2 bg-layer rounded w-full mb-1.5" />
          <div className="h-2 bg-layer rounded w-5/6" />
        </div>
      ))}
    </>
  );
}

function EmptyState({ onWrite }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-4xl mb-4">📓</div>
      <div className="font-display text-sm font-bold mb-2">No journal entries yet</div>
      <p className="text-xs text-t3 mb-5 leading-relaxed">
        Link entries to map coordinates to keep track of<br />your thoughts, memories, and observations.
      </p>
      <button
        onClick={onWrite}
        className="py-2 px-5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 border border-ba bg-pglow text-ta hover:bg-primary hover:text-black hover:border-primary"
      >
        + Write first entry
      </button>
    </div>
  );
}

export default function JournalPanel() {
  const { journals, journalsLoading, savedPlaces, openJournalModal, deleteJournalEntry, flyTo } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 2500);
      return;
    }
    deleteJournalEntry(id);
  };

  const handleLocClick = (entry, e) => {
    e.stopPropagation();
    if (entry.lat && entry.lng) {
      flyTo(entry.lat, entry.lng);
    }
  };

  const filteredJournals = useMemo(() => {
    let result = [...journals];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.body.toLowerCase().includes(q) || 
        j.loc.toLowerCase().includes(q)
      );
    }
    return result;
  }, [journals, searchQuery]);

  return (
    <div className="flex flex-col h-full overflow-visible">
      {/* Search and Header Controls */}
      <div className="sticky -top-5 -mt-5 -mx-5 px-5 pt-5 bg-base z-10 pb-4 mb-4 border-b border-b1">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
            <input 
              type="text" 
              placeholder="Search journal..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-elevated border border-b1 rounded-lg py-2 pl-8 pr-4 text-xs outline-none focus:border-primary transition-colors placeholder:text-t3"
            />
          </div>
          <button 
            onClick={() => openJournalModal()}
            className="py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all duration-150 border border-ba bg-pglow text-ta hover:bg-primary hover:text-black hover:border-primary flex items-center gap-1 shrink-0"
          >
            + Write
          </button>
        </div>
      </div>

      {/* Journal entries list */}
      <div className="flex-1 overflow-visible">
        {journalsLoading ? (
          <LoadingSkeleton />
        ) : filteredJournals.length === 0 ? (
          <EmptyState onWrite={() => openJournalModal()} />
        ) : (
          filteredJournals.map((entry, i) => {
            const date = entry.createdAt ? (entry.createdAt.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt)) : new Date();
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();

            const linkedPlace = entry.placeId ? savedPlaces.find(p => p.id === entry.placeId) : null;
            const locationDisplay = linkedPlace 
              ? `📍 ${linkedPlace.emoji} ${linkedPlace.name}, ${linkedPlace.addr}`
              : entry.loc;

            const isMapLinkable = linkedPlace || (entry.lat && entry.lng);

            return (
              <div 
                key={entry.id}
                className="bg-elevated border border-b1 rounded-2xl p-4 mb-3 cursor-default transition-colors duration-200 hover:border-b2 animate-fade-in group"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-pglow border border-ba rounded-lg py-1.5 px-2.5 text-center shrink-0">
                    <div className="font-display text-xl font-extrabold text-ta leading-none">{day}</div>
                    <div className="font-mono text-[9px] tracking-[0.1em] text-t3 uppercase mt-0.5">{month}</div>
                  </div>
                  <div className="mt-0.5 min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-display text-sm font-bold mb-1 text-t1 truncate">{entry.title}</div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openJournalModal(null, entry); }}
                          className="p-1 text-[10px] text-t3 transition-all hover:text-t2 rounded opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Edit journal entry"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(entry.id, e)}
                          className={`p-1 text-[10px] text-t3 transition-all hover:text-rose rounded shrink-0 flex items-center gap-0.5 cursor-pointer
                            ${confirmDeleteId === entry.id ? 'opacity-100 text-rose bg-rose/10 px-2' : 'opacity-0 group-hover:opacity-100'}`}
                          title="Delete journal entry"
                        >
                          <Trash2 size={11} />
                          {confirmDeleteId === entry.id ? ' Confirm?' : ''}
                        </button>
                      </div>
                    </div>
                    <div 
                      onClick={(e) => isMapLinkable && handleLocClick(linkedPlace || entry, e)}
                      className={`text-xs text-t3 truncate flex items-center gap-0.5
                        ${isMapLinkable ? 'cursor-pointer hover:underline hover:text-primary transition-all' : ''}`}
                      title={isMapLinkable ? 'Fly to location on map' : ''}
                    >
                      {locationDisplay}
                    </div>
                  </div>
                </div>
                {/* Body */}
                <div 
                  className="text-xs text-t2 leading-[1.7] markdown-content"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(entry.body) }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
