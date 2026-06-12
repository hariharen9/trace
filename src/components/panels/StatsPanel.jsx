import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BADGE_STYLES } from '../../data';

const SHORTCUTS = [
  { action: 'Global Search', key: '⌘K' },
  { action: 'New place', key: 'N' },
  { action: 'Context menu', key: 'Right-click map' },
  { action: 'Close / dismiss', key: 'Esc' },
];

function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

export default function StatsPanel() {
  const { savedPlaces, journals, trips } = useApp();
  const sparkRef = useRef(null);
  const heatmapRef = useRef(null);

  // ── Compute all stats from real data ──
  const computed = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Basic counts
    const totalPlaces = savedPlaces.length;
    const totalTrips = trips.length;
    const totalJournals = journals.length;

    // Category counts
    const categoryCounts = {};
    savedPlaces.forEach(p => {
      const cat = p.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const cafes = categoryCounts['Café'] || 0;

    // Cities — extract from addr field (take last meaningful part)
    const citySet = new Set();
    savedPlaces.forEach(p => {
      if (p.addr) {
        const parts = p.addr.split(',').map(s => s.trim()).filter(Boolean);
        // Take the last part as the city, or second-to-last if the last is a country
        const city = parts.length >= 2 ? parts[parts.length - 1] : parts[0];
        if (city) citySet.add(city);
      }
    });
    const cities = citySet.size;

    // Top spots — pinned first, then by most recent, take top 3
    const pinned = savedPlaces.filter(p => p.pinned);
    const unpinned = savedPlaces.filter(p => !p.pinned);
    const topSpots = [...pinned, ...unpinned].slice(0, 3).map((p, i) => ({
      emoji: p.emoji,
      name: p.name,
      category: p.category || 'Memory',
      subtitle: p.pinned ? '📌 Pinned place' : p.addr || 'Saved location',
      rank: `#${i + 1}`,
    }));

    // Sparkline — places per month for the last 12 months
    const sparkData = [];
    for (let m = 11; m >= 0; m--) {
      const d = new Date(currentYear, now.getMonth() - m, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const count = savedPlaces.filter(p => {
        const pd = toDate(p.createdAt);
        return pd && pd.getMonth() === month && pd.getFullYear() === year;
      }).length;
      sparkData.push(count);
    }

    // Sparkline trend — compare last month to previous
    const lastMonth = sparkData[sparkData.length - 1] || 0;
    const prevMonth = sparkData[sparkData.length - 2] || 0;
    let trendPct = 0;
    if (prevMonth > 0) {
      trendPct = Math.round(((lastMonth - prevMonth) / prevMonth) * 100);
    } else if (lastMonth > 0) {
      trendPct = 100;
    }
    const trendStr = trendPct >= 0 ? `↑ ${trendPct}%` : `↓ ${Math.abs(trendPct)}%`;

    // Heatmap — activity per day for the past year (based on createdAt dates)
    const activityDates = new Set();
    const allItems = [
      ...savedPlaces.map(p => toDate(p.createdAt)),
      ...journals.map(j => toDate(j.createdAt)),
      ...trips.map(t => toDate(t.createdAt)),
    ].filter(Boolean);

    allItems.forEach(d => {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      activityDates.add(key);
    });

    // Count active days for the current year
    const activeDays = [...activityDates].filter(d => d.startsWith(String(currentYear))).length;

    // Build heatmap cells — 52 weeks × 7 days
    const heatmapCells = [];
    const oneDay = 24 * 60 * 60 * 1000;
    const startDate = new Date(now.getTime() - (52 * 7 - 1) * oneDay);
    // Align to start of the week (Sunday)
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let i = 0; i < 52 * 7; i++) {
      const cellDate = new Date(startDate.getTime() + i * oneDay);
      const key = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
      // Count items on this date
      const count = allItems.filter(d => {
        const dk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return dk === key;
      }).length;
      heatmapCells.push(count);
    }

    // Wrapped — computed insights
    const mostVisitedCategory = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0];

    // Most explored area — most common address substring
    const areaCounts = {};
    savedPlaces.forEach(p => {
      if (p.addr) {
        const parts = p.addr.split(',').map(s => s.trim()).filter(Boolean);
        // Use second-to-last part as area (neighborhood/locality)
        const area = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
        if (area) areaCounts[area] = (areaCounts[area] || 0) + 1;
      }
    });
    const topArea = Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0];

    // Activity streak
    const sortedDates = [...activityDates].sort();
    let maxStreak = 0, currentStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1] + 'T00:00:00');
        const curr = new Date(sortedDates[i] + 'T00:00:00');
        const diff = (curr - prev) / oneDay;
        currentStreak = diff === 1 ? currentStreak + 1 : 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    // Completed trips destinations
    const completedTrips = trips.filter(t => t.status === 'completed');
    const furthestTrip = completedTrips.length > 0
      ? completedTrips[0].destination || completedTrips[0].name
      : 'No trips yet';

    const wrapped = [
      { label: '☕ Most saved category', value: mostVisitedCategory ? `${mostVisitedCategory[0]} (${mostVisitedCategory[1]})` : 'None yet' },
      { label: '✈️ Last completed trip', value: furthestTrip },
      { label: '🔥 Longest streak', value: maxStreak > 0 ? `${maxStreak} ${maxStreak === 1 ? 'day' : 'days'} in a row` : 'No streak yet' },
      { label: '🌆 Most explored area', value: topArea ? topArea[0] : 'Not enough data' },
      { label: '📊 Total data points', value: `${totalPlaces + totalJournals + totalTrips} items` },
    ];

    return {
      totalPlaces, cafes, totalTrips, totalJournals, cities,
      topSpots, sparkData, trendStr, heatmapCells, activeDays, wrapped,
    };
  }, [savedPlaces, journals, trips]);

  // ── Draw sparkline ──
  const drawSpark = useCallback(() => {
    const c = sparkRef.current;
    if (!c || !c.offsetWidth) return;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = c.offsetWidth, H = 48;
    c.width = W * dpr; c.height = H * dpr; ctx.scale(dpr, dpr);
    const data = computed.sparkData;
    const max = Math.max(...data, 1); // avoid division by 0
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
  }, [computed.sparkData]);

  // ── Build heatmap ──
  const buildHeatmap = useCallback(() => {
    const g = heatmapRef.current;
    if (!g) return;
    const cells = computed.heatmapCells;
    g.innerHTML = cells.map(count => {
      let bg;
      if (count === 0) bg = 'var(--color-layer)';
      else if (count === 1) bg = 'rgba(108,99,255,.2)';
      else if (count === 2) bg = 'rgba(108,99,255,.42)';
      else if (count <= 4) bg = 'rgba(108,99,255,.65)';
      else bg = 'rgba(108,99,255,.9)';
      return `<div style="width:11px;height:11px;border-radius:2px;background:${bg}"></div>`;
    }).join('');
  }, [computed.heatmapCells]);

  useEffect(() => {
    const timer = setTimeout(() => { drawSpark(); buildHeatmap(); }, 80);
    return () => clearTimeout(timer);
  }, [drawSpark, buildHeatmap]);

  const statColors = ['text-amber', 'text-teal', 'text-coral', 'text-rose'];
  const statData = [
    { num: computed.cafes, label: 'Cafés saved' },
    { num: computed.totalTrips, label: 'Trips planned' },
    { num: computed.totalJournals, label: 'Journal entries' },
    { num: computed.cities, label: 'Cities explored' },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* ── Hero ── */}
      <div className="stats-glow bg-elevated border border-b1 rounded-2xl p-6 mb-3 text-center">
        <div className="gradient-text font-display text-[54px] font-extrabold leading-none mb-2">{computed.totalPlaces}</div>
        <div className="text-[10px] text-t3 tracking-[0.08em] uppercase font-mono">Places Explored · {currentYear}</div>
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
          <span className="font-display text-xl font-bold">{computed.trendStr}</span>
        </div>
        <canvas ref={sparkRef} className="w-full block" style={{ height: '48px' }} height={48} />
      </div>

      {/* ── Heatmap ── */}
      <div className="bg-elevated border border-b1 rounded-xl p-4 mb-2">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-t3">Activity this year</span>
          <span className="font-display text-xl font-bold">{computed.activeDays} days</span>
        </div>
        <div ref={heatmapRef} className="flex gap-1 mt-2 flex-wrap" />
      </div>

      {/* ── Top spots ── */}
      <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1">Top spots</p>
      {computed.topSpots.length === 0 ? (
        <div className="text-center py-4 bg-elevated border border-b1 rounded-xl text-xs text-t3 mb-2">
          Save places to see your top spots here.
        </div>
      ) : (
        computed.topSpots.map((spot, i) => {
          const badge = BADGE_STYLES[spot.category] || BADGE_STYLES['Memory'];
          return (
            <div key={i} className="bg-elevated border border-b1 rounded-xl p-4 mb-2 animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-layer rounded-lg flex items-center justify-center text-lg shrink-0 border border-b1">{spot.emoji}</div>
                <div className="flex-1 min-w-0 mt-0.5">
                  <div className="font-display text-sm font-semibold mb-1">{spot.name}</div>
                  <div className="text-xs text-t3">{spot.subtitle}</div>
                </div>
                <span className="text-[10px] font-semibold py-1 px-2.5 rounded-full tracking-[0.04em]"
                  style={{ background: badge.bg, color: badge.color }}>
                  {spot.rank}
                </span>
              </div>
            </div>
          );
        })
      )}

      {/* ── Wrapped ── */}
      <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-t3 uppercase mt-5 mb-3 mx-1">{currentYear} Wrapped</p>
      <div className="wrapped-bg border border-ba rounded-2xl p-5 mb-2">
        <div className="font-display text-sm font-bold text-ta mb-3 tracking-[0.02em]">✦ Your Year in Places</div>
        {computed.wrapped.map((row, i) => (
          <div key={i} className="flex justify-between items-center text-xs py-1.5">
            <span className="text-t2">{row.label}</span>
            <span className="text-t1 font-semibold">{row.value}</span>
          </div>
        ))}
      </div>

      {/* ── Keyboard shortcuts ── */}
      <div className="bg-elevated border border-b1 rounded-xl p-4 mb-2">
        <div className="font-mono text-[10px] tracking-[0.1em] text-t3 uppercase mb-3">Keyboard shortcuts</div>
        {SHORTCUTS.map((s, i) => (
          <div key={i} className="flex justify-between items-center py-1.5">
            <span className="text-xs text-t2">{s.action}</span>
            <span className="font-mono text-[10px] text-t3 bg-layer py-1 px-2.5 rounded-md border border-b1">{s.key}</span>
          </div>
        ))}
      </div>
    </>
  );
}
