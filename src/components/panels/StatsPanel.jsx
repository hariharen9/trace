import { useEffect, useRef, useCallback } from 'react';
import { STATS, BADGE_STYLES } from '../../data';

export default function StatsPanel() {
  const sparkRef = useRef(null);
  const heatmapRef = useRef(null);

  const drawSpark = useCallback(() => {
    const c = sparkRef.current;
    if (!c || !c.offsetWidth) return;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = c.offsetWidth, H = 48;
    c.width = W * dpr; c.height = H * dpr; ctx.scale(dpr, dpr);
    const data = STATS.sparkData;
    const max = Math.max(...data);
    const pts = data.map((v, i) => ({ x: i * (W / (data.length - 1)), y: H - (v / max) * (H - 10) - 5 }));
    ctx.clearRect(0, 0, W, H);
    // Gradient fill
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(108,99,255,.28)');
    g.addColorStop(1, 'rgba(108,99,255,.01)');
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) { const cx = (pts[i - 1].x + pts[i].x) / 2; ctx.bezierCurveTo(cx, pts[i - 1].y, cx, pts[i].y, pts[i].x, pts[i].y); }
    ctx.lineTo(pts[pts.length - 1].x, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    // Line stroke
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) { const cx = (pts[i - 1].x + pts[i].x) / 2; ctx.bezierCurveTo(cx, pts[i - 1].y, cx, pts[i].y, pts[i].x, pts[i].y); }
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
    // End dot
    const last = pts[pts.length - 1];
    ctx.beginPath(); ctx.arc(last.x, last.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#6c63ff'; ctx.fill();
    ctx.strokeStyle = '#07070d'; ctx.lineWidth = 2.5; ctx.stroke();
  }, []);

  const buildHeatmap = useCallback(() => {
    const g = heatmapRef.current;
    if (!g) return;
    let seed = 42;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
    const lvls = [0, 0, 0, 1, 1, 2, 2, 3, 4];
    const cells = [];
    for (let i = 0; i < 52 * 7; i++) {
      const l = rnd() < 0.42 ? 0 : lvls[Math.floor(rnd() * lvls.length)];
      cells.push(l);
    }
    g.innerHTML = cells.map(l =>
      `<div style="width:11px;height:11px;border-radius:2px;background:${l === 0 ? 'var(--color-layer)' : l === 1 ? 'rgba(108,99,255,.2)' : l === 2 ? 'rgba(108,99,255,.42)' : l === 3 ? 'rgba(108,99,255,.65)' : 'rgba(108,99,255,.9)'}"></div>`
    ).join('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { drawSpark(); buildHeatmap(); }, 80);
    return () => clearTimeout(timer);
  }, [drawSpark, buildHeatmap]);

  const statColors = ['text-amber', 'text-teal', 'text-coral', 'text-rose'];
  const statData = [
    { num: STATS.cafes, label: 'Cafés visited' },
    { num: STATS.trips, label: 'Trips taken' },
    { num: STATS.journals, label: 'Journal entries' },
    { num: STATS.cities, label: 'Cities explored' },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <div className="stats-glow bg-elevated border border-b1 rounded-2xl p-6 mb-3 text-center">
        <div className="gradient-text font-display text-[54px] font-extrabold leading-none mb-2">{STATS.total}</div>
        <div className="text-[10px] text-t3 tracking-[0.08em] uppercase font-mono">Places Explored · 2025</div>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {statData.map((s, i) => (
          <div key={i} className="bg-elevated border border-b1 rounded-xl p-4 transition-colors duration-200 hover:border-b2">
            <div className={`font-display text-3xl font-bold leading-none mb-1.5 ${statColors[i]}`}>{s.num}</div>
            <div className="text-xs text-t3">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Sparkline ── */}
      <div className="bg-elevated border border-b1 rounded-xl p-4 mb-2">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-t3">Places per month</span>
          <span className="font-display text-xl font-bold">↑ 23%</span>
        </div>
        <canvas ref={sparkRef} className="w-full block" style={{ height: '48px' }} height={48} />
      </div>

      {/* ── Heatmap ── */}
      <div className="bg-elevated border border-b1 rounded-xl p-4 mb-2">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-t3">Activity this year</span>
          <span className="font-display text-xl font-bold">147 days</span>
        </div>
        <div ref={heatmapRef} className="flex gap-1 mt-2 flex-wrap" />
      </div>

      {/* ── Top spots ── */}
      <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1">Top spots</p>
      {STATS.topSpots.map((spot, i) => {
        const badge = BADGE_STYLES[spot.badgeClass === 'bc' ? 'Café' : spot.badgeClass === 'bf' ? 'Food' : 'Photo'];
        return (
          <div key={i} className="bg-elevated border border-b1 rounded-xl p-4 mb-2 animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-layer rounded-lg flex items-center justify-center text-lg shrink-0 border border-b1">{spot.emoji}</div>
              <div className="flex-1 min-w-0 mt-0.5">
                <div className="font-display text-sm font-semibold mb-1">{spot.name}</div>
                <div className="text-xs text-t3">{spot.visits}</div>
              </div>
              <span className="text-[10px] font-semibold py-1 px-2.5 rounded-full tracking-[0.04em]"
                style={{ background: badge.bg, color: badge.color }}>
                {spot.rank}
              </span>
            </div>
          </div>
        );
      })}

      {/* ── Wrapped ── */}
      <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1">2025 Wrapped</p>
      <div className="wrapped-bg border border-ba rounded-2xl p-5 mb-2">
        <div className="font-display text-sm font-bold text-ta mb-3 tracking-[0.02em]">✦ Your Year in Places</div>
        {STATS.wrapped.map((row, i) => (
          <div key={i} className="flex justify-between items-center text-xs py-1.5">
            <span className="text-t2">{row.label}</span>
            <span className="text-t1 font-semibold">{row.value}</span>
          </div>
        ))}
      </div>

      {/* ── Keyboard shortcuts ── */}
      <div className="bg-elevated border border-b1 rounded-xl p-4 mb-2">
        <div className="font-mono text-[10px] tracking-[0.1em] text-t3 uppercase mb-3">Keyboard shortcuts</div>
        {STATS.shortcuts.map((s, i) => (
          <div key={i} className="flex justify-between items-center py-1.5">
            <span className="text-xs text-t2">{s.action}</span>
            <span className="font-mono text-[10px] text-t3 bg-layer py-1 px-2.5 rounded-md border border-b1">{s.key}</span>
          </div>
        ))}
      </div>
    </>
  );
}
