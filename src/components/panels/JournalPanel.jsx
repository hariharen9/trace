import { JOURNAL_ENTRIES } from '../../data';

export default function JournalPanel() {
  return (
    <>
      <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-2 mb-3 mx-1">Recent entries</p>
      {JOURNAL_ENTRIES.map((entry, i) => (
        <div key={entry.id}
          className="bg-elevated border border-b1 rounded-2xl p-4 mb-3 cursor-pointer transition-colors duration-200 hover:border-b2 animate-fade-in"
          style={{ animationDelay: `${i * 0.05}s` }}>
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="bg-pglow border border-ba rounded-lg py-1.5 px-2.5 text-center shrink-0">
              <div className="font-display text-xl font-extrabold text-ta leading-none">{entry.day}</div>
              <div className="font-mono text-[9px] tracking-[0.1em] text-t3 uppercase mt-0.5">{entry.month}</div>
            </div>
            <div className="mt-0.5">
              <div className="font-display text-sm font-bold mb-1">{entry.title}</div>
              <div className="text-xs text-t3">{entry.loc}</div>
            </div>
          </div>
          {/* Body */}
          <div className="text-xs text-t2 leading-[1.7]">{entry.body}</div>
        </div>
      ))}
    </>
  );
}
