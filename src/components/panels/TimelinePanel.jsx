import { TIMELINE } from '../../data';

export default function TimelinePanel() {
  return (
    <div className="pt-2">
      {TIMELINE.map((item, i) => {
        const prevItem = TIMELINE[i - 1];
        const showMonth = item.month && item.month !== (prevItem?.month);

        return (
          <div key={item.id}>
            {showMonth && (
              <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1 first:mt-2">
                {item.month}
              </p>
            )}
            <div className="flex gap-4 py-3 relative animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
              {/* Connector line */}
              {i > 0 && (
                <div className="absolute left-[23px] top-0 w-px h-full bg-b1 pointer-events-none" />
              )}
              {/* Dot */}
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-xl shrink-0 relative z-[2]
                ${item.highlighted
                  ? 'bg-pglow border-ba'
                  : 'bg-elevated border-b2'
                }`}
                style={item.highlighted ? { boxShadow: '0 0 14px var(--color-pglow)' } : {}}>
                {item.emoji}
              </div>
              {/* Body */}
              <div className="flex-1 pt-1.5">
                <div className="font-display text-sm font-semibold mb-1">{item.title}</div>
                <div className="text-xs text-t3 mb-2">{item.sub}</div>
                <span className="inline-flex items-center gap-1 text-[10px] text-t2 bg-layer py-1 px-2.5 rounded-full border border-b1">
                  {item.mood}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
