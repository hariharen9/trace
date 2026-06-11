import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';

export default function TimelinePanel() {
  const { savedPlaces, journals } = useApp();

  const timelineItems = useMemo(() => {
    // 1. Map Firestore places to timeline nodes
    const placesItems = savedPlaces.map((place) => {
      const date = place.createdAt ? (place.createdAt.toDate ? place.createdAt.toDate() : new Date(place.createdAt)) : new Date();
      
      const day = date.getDate();
      const monthName = date.toLocaleString('en-US', { month: 'short' });
      const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      
      return {
        id: `place-${place.id}`,
        emoji: place.emoji || '📍',
        title: place.name,
        sub: `${place.addr || 'Saved location'} · ${monthName} ${day}`,
        mood: place.vibe || place.category || 'Explored',
        highlighted: place.pinned || false,
        timestamp: date.getTime(),
        monthYear: monthYear,
      };
    });

    // 2. Map dynamic journals to timeline nodes
    const journalsItems = journals.map((entry) => {
      const date = entry.createdAt ? (entry.createdAt.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt)) : new Date();
      
      const day = date.getDate();
      const monthName = date.toLocaleString('en-US', { month: 'short' });
      const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      return {
        id: `journal-${entry.id}`,
        emoji: '📓',
        title: entry.title,
        sub: `${entry.loc || ''} · ${monthName} ${day}`,
        mood: '📝 Journal Entry',
        highlighted: true,
        timestamp: date.getTime(),
        monthYear: monthYear,
      };
    });

    // 3. Combine and sort descending (newest first)
    const combined = [...placesItems, ...journalsItems];
    combined.sort((a, b) => b.timestamp - a.timestamp);

    return combined;
  }, [savedPlaces, journals]);

  // Group items by monthYear for separate visual timelines per month
  const groupedTimeline = useMemo(() => {
    const groups = {};
    timelineItems.forEach((item) => {
      if (!groups[item.monthYear]) {
        groups[item.monthYear] = [];
      }
      groups[item.monthYear].push(item);
    });
    return Object.entries(groups);
  }, [timelineItems]);

  let globalIndex = -1;

  return (
    <div className="pt-2">
      {groupedTimeline.map(([monthYear, items]) => (
        <div key={monthYear} className="mb-6 last:mb-2">
          {/* Month Header */}
          <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mb-3 mx-1">
            {monthYear}
          </p>

          {/* Month Items */}
          <div>
            {items.map((item, idx) => {
              globalIndex++;
              const currentGlobalIndex = globalIndex;
              const isFirst = idx === 0;
              const isLast = idx === items.length - 1;
              const isSingle = items.length === 1;

              return (
                <div 
                  key={item.id} 
                  className="flex gap-4 py-3 relative animate-fade-in" 
                  style={{ animationDelay: `${currentGlobalIndex * 0.04}s` }}
                >
                  {/* Connector line */}
                  {!isSingle && (
                    <div 
                      className="absolute left-[23px] w-px bg-b1 pointer-events-none" 
                      style={{
                        top: isFirst ? '36px' : '0px',
                        bottom: isLast ? 'calc(100% - 36px)' : '0px'
                      }}
                    />
                  )}
                  {/* Dot */}
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-xl shrink-0 relative z-[2] transition-all duration-200
                    ${item.highlighted
                      ? 'bg-elevated border-primary shadow-[0_0_12px_rgba(255,255,255,0.12)]'
                      : 'bg-elevated border-b1'
                    }`}>
                    {item.emoji}
                  </div>
                  {/* Body */}
                  <div className="flex-1 pt-1.5">
                    <div className="font-display text-sm font-semibold mb-1 text-t1">{item.title}</div>
                    <div className="text-xs text-t3 mb-2">{item.sub}</div>
                    <span className="inline-flex items-center gap-1 text-[10px] text-t2 bg-layer py-1 px-2.5 rounded-full border border-b1">
                      {item.mood}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
