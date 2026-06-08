import { TRIPS } from '../../data';

export default function TripsPanel() {
  const planning = TRIPS.filter(t => t.status === 'Planning');
  const past = TRIPS.filter(t => t.status === 'Done');

  return (
    <>
      {planning.length > 0 && (
        <>
          <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-2 mb-3 mx-1">Planning</p>
          {planning.map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} />)}
        </>
      )}
      {past.length > 0 && (
        <>
          <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1">Past Trips</p>
          {past.map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} />)}
        </>
      )}
    </>
  );
}

function TripCard({ trip, index }) {
  return (
    <div className="bg-elevated border border-b1 rounded-2xl overflow-hidden mb-3 cursor-pointer transition-all duration-200 hover:border-ba hover:-translate-y-0.5 animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}>
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <span className="text-3xl">{trip.flag}</span>
        <div className="flex-1 mt-0.5">
          <div className="font-display text-base font-bold mb-1">{trip.name}</div>
          <div className="text-xs text-t3 font-mono">{trip.date}</div>
        </div>
        <span className={`text-[10px] font-semibold py-1 px-3 rounded-full tracking-[0.05em]
          ${trip.statusClass === 'planning'
            ? 'bg-[rgba(108,99,255,0.14)] text-primary-light'
            : 'bg-[rgba(16,185,129,0.14)] text-mint'
          }`}>
          {trip.status}
        </span>
      </div>
      {/* Days */}
      <div className="px-4 pb-4 flex flex-col gap-1.5">
        {trip.days.map((day, j) => (
          <div key={j} className="flex items-center gap-2 py-2 px-3 bg-layer rounded-lg text-xs text-t2">
            <span className="font-mono text-[10px] text-primary font-medium min-w-8">{day.label}</span>
            <span>{day.desc}</span>
            <span className="ml-auto text-[10px] text-t3">{day.spots}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
