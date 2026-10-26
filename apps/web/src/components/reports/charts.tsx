'use client';

// Tiny dependency-free SVG charts for the Reports Center. Theme-aware via
// currentColor / explicit palette; responsive via viewBox. Kept intentionally
// simple (bars, grouped bars, donut, horizontal-bar list) — no chart library.

import React from 'react';

export const PALETTE = ['#0f766e', '#2563eb', '#f59e0b', '#db2777', '#7c3aed', '#059669', '#dc2626', '#0891b2'];

const fmtK = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000) return `${Math.round(n / 1000)}k`;
  return `${Math.round(n)}`;
};

// Grouped vertical bars for a time series with up to 3 measures per period.
export function GroupedBars({
  data,
  series,
  height = 220,
}: {
  data: Array<Record<string, number | string>>;
  series: { key: string; label: string; color: string }[];
  height?: number;
}) {
  if (!data.length) return <Empty />;
  const W = Math.max(data.length * 64, 320);
  const H = height;
  const padB = 28, padL = 36, padT = 10;
  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0)));
  const chartH = H - padB - padT;
  const groupW = (W - padL) / data.length;
  const barW = Math.min(16, (groupW - 8) / series.length);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="min-w-[320px]" role="img">
        {[0, 0.5, 1].map((g) => {
          const y = padT + chartH * (1 - g);
          return (
            <g key={g}>
              <line x1={padL} y1={y} x2={W} y2={y} stroke="currentColor" strokeOpacity={0.12} />
              <text x={4} y={y + 3} fontSize={9} fill="currentColor" fillOpacity={0.5}>{fmtK(max * g)}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const gx = padL + i * groupW + (groupW - barW * series.length) / 2;
          return (
            <g key={i}>
              {series.map((s, j) => {
                const v = Number(d[s.key]) || 0;
                const h = (v / max) * chartH;
                return <rect key={s.key} x={gx + j * barW} y={padT + chartH - h} width={barW - 2} height={Math.max(0, h)} rx={2} fill={s.color} />;
              })}
              <text x={padL + i * groupW + groupW / 2} y={H - 10} fontSize={9} fill="currentColor" fillOpacity={0.6} textAnchor="middle">
                {String(d.period).slice(2)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 mt-1 px-1">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} /> {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Donut with center total.
export function Donut({ segments, centerLabel, centerValue }: { segments: { label: string; value: number; color: string }[]; centerLabel?: string; centerValue?: string }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const R = 52, r = 34, C = 70;
  let acc = 0;
  const arcs = total > 0 ? segments.filter((s) => s.value > 0).map((s) => {
    const frac = s.value / total;
    const a0 = acc * 2 * Math.PI - Math.PI / 2;
    acc += frac;
    const a1 = acc * 2 * Math.PI - Math.PI / 2;
    const large = frac > 0.5 ? 1 : 0;
    const p = (ang: number, rad: number) => [C + rad * Math.cos(ang), C + rad * Math.sin(ang)];
    const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, r), [x3, y3] = p(a0, r);
    return { d: `M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 ${large} 0 ${x3},${y3} Z`, color: s.color };
  }) : [];

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" width={128} height={128} role="img">
        {arcs.length === 0 ? (
          <circle cx={C} cy={C} r={(R + r) / 2} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={R - r} />
        ) : (
          arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)
        )}
        <text x={C} y={C - 2} textAnchor="middle" fontSize={16} fontWeight={800} fill="currentColor">{centerValue ?? total}</text>
        {centerLabel && <text x={C} y={C + 14} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.5}>{centerLabel}</text>}
      </svg>
      <div className="space-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-slate-600 dark:text-slate-300">{s.label}</span>
            <span className="font-semibold text-slate-900 dark:text-white ml-auto">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal-bar breakdown list.
export function HBars({ items, format }: { items: { label: string; value: number }[]; format: (n: number) => string }) {
  if (!items.length) return <Empty />;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={it.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-300 truncate pr-2">{it.label}</span>
            <span className="font-semibold text-slate-900 dark:text-white shrink-0">{format(it.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(it.value / max) * 100}%`, background: PALETTE[i % PALETTE.length] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return <div className="py-8 text-center text-xs text-slate-400">No data for this period.</div>;
}
