import { ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEMO_PLACES, COLLECTIONS, BADGE_STYLES } from '../../data';

function PlaceCard({ place, index }) {
  const { flyTo } = useApp();
  const badge = BADGE_STYLES[place.category] || BADGE_STYLES['Memory'];

  return (
    <div
      className={`card-gradient bg-elevated border rounded-xl p-4 mb-2 cursor-pointer transition-all duration-200 hover:border-b2 hover:bg-surface hover:-translate-y-px animate-fade-in ${place.pinned ? 'border-ba' : 'border-b1'}`}
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
      {(place.visitedAgo || place.tags) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-b1">
          <span className="font-mono text-[10px] text-t3">{place.visitedAgo}</span>
          {place.tags && (
            <div className="flex gap-1.5">
              {place.tags.map(tag => (
                <span key={tag} className="text-[10px] text-t3 bg-layer border border-b1 py-0.5 px-2 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CollectionItem({ coll }) {
  const { switchTab, showToast } = useApp();
  return (
    <div className="flex items-center gap-3 p-3 bg-elevated border border-b1 rounded-xl mb-2 cursor-pointer transition-all duration-200 hover:border-b2 hover:translate-x-0.5 animate-fade-in"
      onClick={() => { switchTab('trips'); showToast(`📂 ${coll.name}`); }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
        style={{ background: coll.color }}>
        {coll.emoji}
      </div>
      <div>
        <div className="font-semibold text-sm mb-0.5">{coll.name}</div>
        <div className="text-xs text-t3">{coll.count}</div>
      </div>
      <ChevronRight size={16} className="ml-auto text-t3" />
    </div>
  );
}

export default function PlacesPanel() {
  const pinned = DEMO_PLACES.filter(p => p.pinned);
  const recent = DEMO_PLACES.filter(p => !p.pinned).slice(0, 2);

  return (
    <>
      <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-2 mb-3 mx-1">Pinned</p>
      {pinned.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}

      <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1">Collections</p>
      {COLLECTIONS.map(c => <CollectionItem key={c.id} coll={c} />)}

      <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1">Recently Visited</p>
      {recent.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
    </>
  );
}
