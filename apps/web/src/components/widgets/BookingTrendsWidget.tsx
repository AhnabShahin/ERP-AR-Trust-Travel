import React, { useState, useMemo } from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRENT_APP_DATE, parseRecordDate } from '../../utils/dateFilter';
import type { Booking } from '../../types';

const DESK_SOURCES = ['Airport Desk', 'Agent Desk'];
const ONLINE_SOURCES = [
  'Website Direct Lead',
  'Web Integration API',
  'Online Web',
  'Website Online Gateway',
  'Website Online Lead',
  'OTA Partner',
];

const isDesk = (b: Booking) => DESK_SOURCES.includes(b.source);
const isOnline = (b: Booking) => ONLINE_SOURCES.includes(b.source);

// Parse a booking's sale timestamp (createdAt). Handles the "13:05 PM Today",
// ISO strings and the generic date formats used across the app.
function saleDateTime(b: Booking): Date | null {
  const s = (b.createdAt || b.bookingDate || '').trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (lower.includes('today') || lower.includes('yesterday') || lower.includes('now')) {
    const base = lower.includes('yesterday')
      ? new Date(2026, 9, 8)
      : new Date(CURRENT_APP_DATE);
    const tm = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (tm) {
      let h = parseInt(tm[1], 10);
      const m = parseInt(tm[2], 10);
      const mer = tm[3]?.toUpperCase();
      if (mer === 'PM' && h < 12) h += 12;
      if (mer === 'AM' && h === 12) h = 0;
      base.setHours(h, m, 0, 0);
    }
    return base;
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  return parseRecordDate(s);
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Bucket {
  label: string;
  desk: number;
  online: number;
  deskVal: number;
  onlineVal: number;
}

export const BookingTrendsWidget: React.FC = () => {
  const { language, convertAmount, bookings } = useApp();
  const [timeline, setTimeline] = useState<'today' | '7d' | '30d'>('today');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Bookings within the selected timeline window (relative to the app's date).
  const windowList = useMemo(() => {
    const today = dayStart(CURRENT_APP_DATE);
    return bookings.filter((b) => {
      const dt = saleDateTime(b);
      if (!dt) return false;
      if (timeline === 'today') return sameDay(dt, CURRENT_APP_DATE);
      const diff = (today.getTime() - dayStart(dt).getTime()) / 86400000;
      if (timeline === '7d') return diff >= 0 && diff < 7;
      return diff >= 0 && diff < 30;
    });
  }, [bookings, timeline]);

  const metrics = useMemo(() => {
    const total = windowList.length;
    const deskList = windowList.filter(isDesk);
    const onlineList = windowList.filter(isOnline);
    const deskCount = deskList.length;
    const onlineCount = onlineList.length;
    const deskRevQAR = deskList.reduce((s, b) => s + (b.totalQAR || 0), 0);
    const onlineRevQAR = onlineList.reduce((s, b) => s + (b.totalQAR || 0), 0);
    const classified = deskCount + onlineCount;
    const deskShare = classified > 0 ? Math.round((deskCount / classified) * 100) : 0;
    const onlineShare = classified > 0 ? 100 - deskShare : 0;
    return { total, deskCount, onlineCount, deskRevQAR, onlineRevQAR, deskShare, onlineShare };
  }, [windowList]);

  // Time-series buckets built from the real windowed bookings.
  const chartData = useMemo<Bucket[]>(() => {
    const today = dayStart(CURRENT_APP_DATE);

    const add = (bucket: Bucket, b: Booking) => {
      if (isDesk(b)) {
        bucket.desk += 1;
        bucket.deskVal += b.totalQAR || 0;
      } else {
        // everything not an explicit desk sale counts as online/web channel
        bucket.online += 1;
        bucket.onlineVal += b.totalQAR || 0;
      }
    };

    if (timeline === 'today') {
      const slots = [6, 8, 10, 12, 14, 16, 18, 20];
      const buckets: Bucket[] = slots.map((h) => ({
        label: `${String(h).padStart(2, '0')}:00`,
        desk: 0,
        online: 0,
        deskVal: 0,
        onlineVal: 0,
      }));
      for (const b of windowList) {
        const dt = saleDateTime(b);
        if (!dt) continue;
        const h = dt.getHours();
        let idx = slots.findIndex((s, i) => h >= s && (i === slots.length - 1 || h < slots[i + 1]));
        if (h < slots[0]) idx = 0;
        if (idx === -1) idx = slots.length - 1;
        add(buckets[idx], b);
      }
      return buckets;
    }

    if (timeline === '7d') {
      const buckets: Bucket[] = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(today.getTime() - i * 86400000);
        buckets.push({ label: WEEKDAY_SHORT[day.getDay()], desk: 0, online: 0, deskVal: 0, onlineVal: 0 });
      }
      for (const b of windowList) {
        const dt = saleDateTime(b);
        if (!dt) continue;
        const diff = Math.floor((today.getTime() - dayStart(dt).getTime()) / 86400000);
        const idx = 6 - diff;
        if (idx >= 0 && idx < 7) add(buckets[idx], b);
      }
      return buckets;
    }

    // 30d → 4 weekly buckets (Week 1 = oldest)
    const buckets: Bucket[] = [0, 1, 2, 3].map((w) => ({
      label: `Week ${w + 1}`,
      desk: 0,
      online: 0,
      deskVal: 0,
      onlineVal: 0,
    }));
    for (const b of windowList) {
      const dt = saleDateTime(b);
      if (!dt) continue;
      const diff = Math.floor((today.getTime() - dayStart(dt).getTime()) / 86400000);
      const weekFromNow = Math.min(3, Math.floor(diff / 7));
      add(buckets[3 - weekFromNow], b);
    }
    return buckets;
  }, [windowList, timeline]);

  // SVG Chart Dimensions
  const width = 500;
  const height = 150;
  const paddingX = 30;
  const paddingY = 20;

  const maxVal = useMemo(() => {
    const highest = Math.max(...chartData.map((d) => Math.max(d.desk, d.online)), 4);
    return Math.ceil(highest * 1.25);
  }, [chartData]);

  const getX = (index: number) =>
    paddingX + (index * (width - 2 * paddingX)) / Math.max(1, chartData.length - 1);
  const getY = (val: number) => height - paddingY - (val * (height - 2 * paddingY)) / maxVal;

  const deskPoints = chartData.map((d, i) => `${getX(i)},${getY(d.desk)}`).join(' ');
  const onlinePoints = chartData.map((d, i) => `${getX(i)},${getY(d.online)}`).join(' ');

  const deskArea = `${deskPoints} ${getX(chartData.length - 1)},${height - paddingY} ${getX(0)},${height - paddingY}`;
  const onlineArea = `${onlinePoints} ${getX(chartData.length - 1)},${height - paddingY} ${getX(0)},${height - paddingY}`;

  const currentHover =
    hoveredPoint !== null ? chartData[hoveredPoint] : chartData[chartData.length - 1];

  // Peak bucket (by total bookings) for the footer note.
  const peak = useMemo(() => {
    let best = chartData[0];
    for (const d of chartData) if (d.desk + d.online > (best?.desk || 0) + (best?.online || 0)) best = d;
    return best;
  }, [chartData]);

  const gridLines = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'ar'
                    ? 'مؤشر مبيعات الجولات والخدمات (أونلاين مقابل مكاتب الوكلاء)'
                    : 'Service & Tour Booking Trends (Online vs. Agent Desk)'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  Excursions & Safaris
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'مقارنة حجم حجوزات الجولات الصحراوية والرحلات البحرية والتنقلات الفاخرة'
                  : 'Real-time sales velocity & channel distribution for Qatar excursions and tours'}
              </p>
            </div>
          </div>
        </div>

        {/* Time period switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs shrink-0">
          <button
            onClick={() => setTimeline('today')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              timeline === 'today'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? 'اليوم' : 'Today'}
          </button>
          <button
            onClick={() => setTimeline('7d')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              timeline === '7d'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? '7 أيام' : '7 Days'}
          </button>
          <button
            onClick={() => setTimeline('30d')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              timeline === '30d'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? '30 يوماً' : '30 Days'}
          </button>
        </div>
      </div>

      {/* Metric Breakdown Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3.5">
        {/* Agent Desk POS */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                {language === 'ar' ? 'مكاتب الوكلاء (Agent Desk)' : 'Agent Desk POS'}
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              {metrics.deskShare}% share <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                {metrics.deskCount}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">
                Services Booked
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
              {convertAmount(metrics.deskRevQAR).formatted}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            Direct sales at HIA Airport Counters 4 & 7 and hotel stations
          </div>
        </div>

        {/* Online Web & OTA */}
        <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/40">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span className="font-bold text-blue-800 dark:text-blue-300">
                {language === 'ar' ? 'أونلاين وبوابة الموقع (Web/OTA)' : 'Online Web & OTA Direct'}
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
              {metrics.onlineShare}% share <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                {metrics.onlineCount}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">
                Services Booked
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
              {convertAmount(metrics.onlineRevQAR).formatted}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            Website Direct Leads (Services • Packages • Fleet)
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative pt-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id="deskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="onlineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((v) => (
            <line
              key={v}
              x1={paddingX}
              y1={getY(v)}
              x2={width - paddingX}
              y2={getY(v)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
          ))}

          {/* Shaded Areas */}
          <polygon points={deskArea} fill="url(#deskFill)" />
          <polygon points={onlineArea} fill="url(#onlineFill)" />

          {/* Polyline strokes */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={deskPoints}
          />
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={onlinePoints}
          />

          {/* Data Points */}
          {chartData.map((d, i) => {
            const x = getX(i);
            const yDesk = getY(d.desk);
            const yOnline = getY(d.online);
            const isHovered = hoveredPoint === i;

            return (
              <g key={d.label} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(i)}>
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={height - paddingY}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
                <circle
                  cx={x}
                  cy={yDesk}
                  r={isHovered ? 5 : 3.5}
                  className="fill-emerald-500 stroke-white dark:stroke-slate-900 transition-all"
                  strokeWidth="2"
                />
                <circle
                  cx={x}
                  cy={yOnline}
                  r={isHovered ? 5 : 3.5}
                  className="fill-blue-500 stroke-white dark:stroke-slate-900 transition-all"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="flex justify-between px-6 text-[10px] font-mono text-slate-400 mt-1">
          {chartData.map((d, i) => (
            <span
              key={d.label}
              onMouseEnter={() => setHoveredPoint(i)}
              className={`cursor-pointer transition-colors ${
                hoveredPoint === i ? 'text-slate-900 dark:text-white font-bold' : ''
              }`}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>

      {/* Interactive Tooltip Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
            {currentHover?.label}:
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
            Desk: {currentHover?.desk ?? 0} bookings ({convertAmount(currentHover?.deskVal || 0).formatted})
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
            Web: {currentHover?.online ?? 0} bookings
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {peak && peak.desk + peak.online > 0 ? `Peak: ${peak.label}` : 'No sales in range'}
        </span>
      </div>
    </div>
  );
};
