import React, { useState, useMemo } from 'react';
import { Building2, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRENT_APP_DATE, parseRecordDate } from '../../utils/dateFilter';
import type { HotelBooking } from '../../types';

const isOnline = (b: HotelBooking) => b.bookingSource === 'Online Web Portal';
const isDesk = (b: HotelBooking) =>
  b.bookingSource === 'Agent Desk (Hotel Lobby)' ||
  b.bookingSource === 'Airport Desk Counter' ||
  b.bookingSource === 'VIP Concierge Direct' ||
  !b.bookingSource;

// Parse a hotel booking's sale timestamp (createdAt), tolerant of the app's
// "13:05 PM Today", ISO and generic date formats.
function saleDateTime(b: HotelBooking): Date | null {
  const s = (b.createdAt || b.checkInDate || '').trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (lower.includes('today') || lower.includes('yesterday') || lower.includes('now')) {
    const base = lower.includes('yesterday') ? new Date(2026, 9, 8) : new Date(CURRENT_APP_DATE);
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

export const HotelBookingTrendsWidget: React.FC = () => {
  const { language, convertAmount, hotelBookings } = useApp();
  const [timeline, setTimeline] = useState<'today' | '7d' | '30d'>('today');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const windowList = useMemo(() => {
    const today = dayStart(CURRENT_APP_DATE);
    return hotelBookings.filter((b) => {
      const dt = saleDateTime(b);
      if (!dt) return false;
      if (timeline === 'today') return sameDay(dt, CURRENT_APP_DATE);
      const diff = (today.getTime() - dayStart(dt).getTime()) / 86400000;
      if (timeline === '7d') return diff >= 0 && diff < 7;
      return diff >= 0 && diff < 30;
    });
  }, [hotelBookings, timeline]);

  const metrics = useMemo(() => {
    const total = windowList.length;
    const onlineList = windowList.filter(isOnline);
    const deskList = windowList.filter(isDesk);
    const onlineCount = onlineList.length;
    const deskCount = deskList.length;
    const onlineRevQAR = onlineList.reduce((s, b) => s + (b.totalQAR || 0), 0);
    const deskRevQAR = deskList.reduce((s, b) => s + (b.totalQAR || 0), 0);
    const classified = deskCount + onlineCount;
    const deskShare = classified > 0 ? Math.round((deskCount / classified) * 100) : 0;
    const onlineShare = classified > 0 ? 100 - deskShare : 0;
    return { total, onlineCount, deskCount, onlineRevQAR, deskRevQAR, deskShare, onlineShare };
  }, [windowList]);

  const chartData = useMemo<Bucket[]>(() => {
    const today = dayStart(CURRENT_APP_DATE);
    const add = (bucket: Bucket, b: HotelBooking) => {
      if (isOnline(b)) {
        bucket.online += 1;
        bucket.onlineVal += b.totalQAR || 0;
      } else {
        bucket.desk += 1;
        bucket.deskVal += b.totalQAR || 0;
      }
    };

    if (timeline === 'today') {
      const slots = [6, 9, 12, 15, 18, 21, 23];
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

  // Top hotel by booking volume in the window.
  const topHotel = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of windowList) counts.set(b.hotelName, (counts.get(b.hotelName) || 0) + 1);
    let best: { name: string; count: number } | null = null;
    for (const [name, count] of counts) if (!best || count > best.count) best = { name, count };
    const pct = best && windowList.length > 0 ? Math.round((best.count / windowList.length) * 100) : 0;
    return best ? { name: best.name, pct } : null;
  }, [windowList]);

  const gridLines = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'ar'
                    ? 'مؤشر قنوات حجوزات الفنادق (أونلاين مقابل مكاتب الوكلاء)'
                    : 'Hotel Booking Channel Trends (Online vs. Agent Desk)'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                  Luxury Hotel Partner Network
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'مقارنة قنوات حجز الإقامات الفندقية الفاخرة عبر موقع الشركة ومكاتب اللوبي ومطار حمد'
                  : 'Channel velocity for luxury stays across direct web portals and agent desk hotel counters'}
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

      {/* Metric Breakdown Row: Hotel Agent Desk vs Hotel Online Portal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3.5">
        {/* Agent Desk Hotel Bookings */}
        <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/40">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
              <span className="font-bold text-purple-900 dark:text-purple-300">
                {language === 'ar' ? 'مكاتب الوكلاء والفنادق (Agent Desk)' : 'Agent Desk & Hotel Lobby Desks'}
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
              {metrics.deskShare}% share <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                {metrics.deskCount}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">Stays Booked</span>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
              {convertAmount(metrics.deskRevQAR).formatted}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            Walk-in check-ins at Katara Towers, Kempinski & HIA Arrivals
          </div>
        </div>

        {/* Online Web Portal Hotel Bookings */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/40">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
              <span className="font-bold text-indigo-900 dark:text-indigo-300">
                {language === 'ar' ? 'البوابة الإلكترونية (Online Portal / OTA)' : 'Online Web Portal & OTA Direct'}
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
              {metrics.onlineShare}% share <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                {metrics.onlineCount}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">Stays Booked</span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
              {convertAmount(metrics.onlineRevQAR).formatted}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            Automated API confirmations via artrusttravel.com hotel portal
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative pt-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id="hotelDeskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="hotelOnlineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
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
          <polygon points={deskArea} fill="url(#hotelDeskFill)" />
          <polygon points={onlineArea} fill="url(#hotelOnlineFill)" />

          {/* Polyline strokes */}
          <polyline
            fill="none"
            stroke="#9333ea"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={deskPoints}
          />
          <polyline
            fill="none"
            stroke="#6366f1"
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
                  className="fill-purple-600 stroke-white dark:stroke-slate-900 transition-all"
                  strokeWidth="2"
                />
                <circle
                  cx={x}
                  cy={yOnline}
                  r={isHovered ? 5 : 3.5}
                  className="fill-indigo-500 stroke-white dark:stroke-slate-900 transition-all"
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

      {/* Interactive Tooltip Footer & Hotel Partner Distribution */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
            {currentHover?.label}:
          </span>
          <span className="text-purple-600 dark:text-purple-400 font-semibold font-mono">
            Hotel Desk: {currentHover?.desk ?? 0} stays ({convertAmount(currentHover?.deskVal || 0).formatted})
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
            Online: {currentHover?.online ?? 0} stays ({convertAmount(currentHover?.onlineVal || 0).formatted})
          </span>
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          {topHotel ? `Top Hotel: ${topHotel.name} (${topHotel.pct}% volume)` : 'No hotel stays in range'}
        </div>
      </div>
    </div>
  );
};
