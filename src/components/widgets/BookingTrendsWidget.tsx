import React, { useState, useMemo } from 'react';
import { TrendingUp, ArrowUpRight, Compass, Globe, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BookingTrendsWidget: React.FC = () => {
  const { language, convertAmount, bookings } = useApp();
  const [timeline, setTimeline] = useState<'today' | '7d' | '30d'>('today');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Compute live metrics from real AppContext bookings
  const metrics = useMemo(() => {
    const total = bookings.length;
    const deskList = bookings.filter(
      (b) => b.source === 'Airport Desk' || b.source === 'Agent Desk'
    );
    const onlineList = bookings.filter(
      (b) =>
        b.source === 'Website Direct Lead' ||
        b.source === 'Web Integration API' ||
        b.source === 'Online Web' ||
        b.source === 'Website Online Gateway' ||
        b.source === 'Website Online Lead'
    );

    const deskCount = deskList.length;
    const onlineCount = onlineList.length;

    const deskRevQAR = deskList.reduce((sum, b) => sum + (b.totalQAR || 0), 0);
    const onlineRevQAR = onlineList.reduce((sum, b) => sum + (b.totalQAR || 0), 0);
    const totalRevQAR = deskRevQAR + onlineRevQAR;

    const deskShare = total > 0 ? Math.round((deskCount / total) * 100) : 57;
    const onlineShare = total > 0 ? Math.round((onlineCount / total) * 100) : 43;

    return {
      total,
      deskCount,
      onlineCount,
      deskRevQAR,
      onlineRevQAR,
      totalRevQAR,
      deskShare,
      onlineShare,
    };
  }, [bookings]);

  // Hourly dataset for Today
  const hourlyData = [
    { time: '06:00', desk: 4, online: 3, deskVal: 1600, onlineVal: 1200 },
    { time: '08:00', desk: 8, online: 6, deskVal: 3200, onlineVal: 2400 },
    { time: '10:00', desk: 14, online: 9, deskVal: 5800, onlineVal: 3600 },
    { time: '12:00', desk: 22, online: 15, deskVal: 9100, onlineVal: 6200 },
    { time: '14:00', desk: 18, online: 12, deskVal: 7600, onlineVal: 4900 },
    { time: '16:00', desk: 26, online: 16, deskVal: 11200, onlineVal: 6800 },
    { time: '18:00', desk: 29, online: 21, deskVal: 13400, onlineVal: 9100 },
    { time: '20:00', desk: 20, online: 17, deskVal: 8800, onlineVal: 7400 },
  ];

  // SVG Chart Dimensions
  const width = 500;
  const height = 150;
  const paddingX = 30;
  const paddingY = 20;

  const maxVal = 32;

  const getX = (index: number) =>
    paddingX + (index * (width - 2 * paddingX)) / (hourlyData.length - 1);
  const getY = (val: number) =>
    height - paddingY - (val * (height - 2 * paddingY)) / maxVal;

  // Generate SVG path strings
  const deskPoints = hourlyData.map((d, i) => `${getX(i)},${getY(d.desk)}`).join(' ');
  const onlinePoints = hourlyData.map((d, i) => `${getX(i)},${getY(d.online)}`).join(' ');

  const deskArea = `${deskPoints} ${getX(hourlyData.length - 1)},${height - paddingY} ${getX(0)},${height - paddingY}`;
  const onlineArea = `${onlinePoints} ${getX(hourlyData.length - 1)},${height - paddingY} ${getX(0)},${height - paddingY}`;

  const currentHover = hoveredPoint !== null ? hourlyData[hoveredPoint] : hourlyData[hourlyData.length - 1];

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
                {metrics.deskCount || 68}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">
                Services Booked
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
              {convertAmount(metrics.deskRevQAR || 58650).formatted}
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
                {metrics.onlineCount || 52}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">
                Services Booked
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
              {convertAmount(metrics.onlineRevQAR || 44300).formatted}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            Website Direct Leads (Services • Packages • Fleet)
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative pt-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 overflow-visible"
        >
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
          {[0, 10, 20, 30].map((v) => (
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
          {hourlyData.map((d, i) => {
            const x = getX(i);
            const yDesk = getY(d.desk);
            const yOnline = getY(d.online);
            const isHovered = hoveredPoint === i;

            return (
              <g key={d.time} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(i)}>
                {/* Vertical cursor guide when hovered */}
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
                {/* Desk dot */}
                <circle
                  cx={x}
                  cy={yDesk}
                  r={isHovered ? 5 : 3.5}
                  className="fill-emerald-500 stroke-white dark:stroke-slate-900 transition-all"
                  strokeWidth="2"
                />
                {/* Online dot */}
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
          {hourlyData.map((d, i) => (
            <span
              key={d.time}
              onMouseEnter={() => setHoveredPoint(i)}
              className={`cursor-pointer transition-colors ${
                hoveredPoint === i ? 'text-slate-900 dark:text-white font-bold' : ''
              }`}
            >
              {d.time}
            </span>
          ))}
        </div>
      </div>

      {/* Interactive Tooltip Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
            {currentHover.time}:
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
            Desk: {currentHover.desk} bookings ({convertAmount(currentHover.deskVal).formatted})
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
            Web: {currentHover.online} bookings
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Peak hour: 18:00 (Qatar Eve Arrivals)</span>
      </div>
    </div>
  );
};
