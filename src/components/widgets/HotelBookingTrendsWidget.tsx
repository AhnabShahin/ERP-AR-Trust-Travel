import React, { useState, useMemo } from 'react';
import { Building2, TrendingUp, ArrowUpRight, BedDouble, Globe, Store, ShieldCheck, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HotelBookingTrendsWidget: React.FC = () => {
  const { language, convertAmount, hotelBookings, hotelVendors } = useApp();
  const [timeline, setTimeline] = useState<'today' | '7d' | '30d'>('today');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Compute live metrics from real AppContext hotelBookings
  const metrics = useMemo(() => {
    const total = hotelBookings.length;
    const onlineList = hotelBookings.filter(
      (b) => b.bookingSource === 'Online Web Portal'
    );
    const deskList = hotelBookings.filter(
      (b) =>
        b.bookingSource === 'Agent Desk (Hotel Lobby)' ||
        b.bookingSource === 'Airport Desk Counter' ||
        b.bookingSource === 'VIP Concierge Direct' ||
        !b.bookingSource
    );

    const onlineCount = onlineList.length;
    const deskCount = deskList.length;

    const onlineRevQAR = onlineList.reduce((sum, b) => sum + (b.totalQAR || 0), 0);
    const deskRevQAR = deskList.reduce((sum, b) => sum + (b.totalQAR || 0), 0);
    const totalRevQAR = onlineRevQAR + deskRevQAR;

    const deskShare = total > 0 ? Math.round((deskCount / total) * 100) : 60;
    const onlineShare = total > 0 ? Math.round((onlineCount / total) * 100) : 40;

    return {
      total,
      onlineCount,
      deskCount,
      onlineRevQAR,
      deskRevQAR,
      totalRevQAR,
      deskShare,
      onlineShare,
    };
  }, [hotelBookings]);

  // Hourly / daily chart distribution for hotel reservations
  const timelineData = useMemo(() => {
    if (timeline === 'today') {
      return [
        { label: '06:00', desk: 2, online: 1, deskVal: 3800, onlineVal: 1900 },
        { label: '09:00', desk: 5, online: 3, deskVal: 9500, onlineVal: 5700 },
        { label: '12:00', desk: 8, online: 5, deskVal: 15200, onlineVal: 9500 },
        { label: '15:00', desk: 12, online: 7, deskVal: 22800, onlineVal: 13300 },
        { label: '18:00', desk: 16, online: 10, deskVal: 30400, onlineVal: 19000 },
        { label: '21:00', desk: 19, online: 13, deskVal: 36100, onlineVal: 24700 },
        { label: '23:00', desk: 22, online: 15, deskVal: 41800, onlineVal: 28500 },
      ];
    } else if (timeline === '7d') {
      return [
        { label: 'Mon', desk: 14, online: 9, deskVal: 26600, onlineVal: 17100 },
        { label: 'Tue', desk: 18, online: 11, deskVal: 34200, onlineVal: 20900 },
        { label: 'Wed', desk: 22, online: 14, deskVal: 41800, onlineVal: 26600 },
        { label: 'Thu', desk: 28, online: 19, deskVal: 53200, onlineVal: 36100 },
        { label: 'Fri', desk: 35, online: 24, deskVal: 66500, onlineVal: 45600 },
        { label: 'Sat', desk: 31, online: 22, deskVal: 58900, onlineVal: 41800 },
        { label: 'Sun', desk: 24, online: 16, deskVal: 45600, onlineVal: 30400 },
      ];
    } else {
      return [
        { label: 'Week 1', desk: 82, online: 54, deskVal: 155800, onlineVal: 102600 },
        { label: 'Week 2', desk: 96, online: 68, deskVal: 182400, onlineVal: 129200 },
        { label: 'Week 3', desk: 115, online: 79, deskVal: 218500, onlineVal: 150100 },
        { label: 'Week 4', desk: 138, online: 92, deskVal: 262200, onlineVal: 174800 },
      ];
    }
  }, [timeline]);

  // SVG Chart Dimensions
  const width = 500;
  const height = 150;
  const paddingX = 30;
  const paddingY = 20;

  const maxVal = useMemo(() => {
    const highest = Math.max(...timelineData.map((d) => Math.max(d.desk, d.online)), 20);
    return Math.ceil(highest * 1.2);
  }, [timelineData]);

  const getX = (index: number) =>
    paddingX + (index * (width - 2 * paddingX)) / (timelineData.length - 1);
  const getY = (val: number) =>
    height - paddingY - (val * (height - 2 * paddingY)) / maxVal;

  const deskPoints = timelineData.map((d, i) => `${getX(i)},${getY(d.desk)}`).join(' ');
  const onlinePoints = timelineData.map((d, i) => `${getX(i)},${getY(d.online)}`).join(' ');

  const deskArea = `${deskPoints} ${getX(timelineData.length - 1)},${height - paddingY} ${getX(0)},${height - paddingY}`;
  const onlineArea = `${onlinePoints} ${getX(timelineData.length - 1)},${height - paddingY} ${getX(0)},${height - paddingY}`;

  const currentHover = hoveredPoint !== null ? timelineData[hoveredPoint] : timelineData[timelineData.length - 1];

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
                {metrics.deskCount || 22}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">
                Stays Booked
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
              {convertAmount(metrics.deskRevQAR || 41800).formatted}
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
                {metrics.onlineCount || 15}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">
                Stays Booked
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
              {convertAmount(metrics.onlineRevQAR || 28500).formatted}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            Automated API confirmations via artrusttravel.com hotel portal
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
          {[0, Math.round(maxVal / 2), maxVal].map((v) => (
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
          {timelineData.map((d, i) => {
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
                {/* Desk dot */}
                <circle
                  cx={x}
                  cy={yDesk}
                  r={isHovered ? 5 : 3.5}
                  className="fill-purple-600 stroke-white dark:stroke-slate-900 transition-all"
                  strokeWidth="2"
                />
                {/* Online dot */}
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
          {timelineData.map((d, i) => (
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
            {currentHover.label}:
          </span>
          <span className="text-purple-600 dark:text-purple-400 font-semibold font-mono">
            Hotel Desk: {currentHover.desk} stays ({convertAmount(currentHover.deskVal).formatted})
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
            Online: {currentHover.online} stays ({convertAmount(currentHover.onlineVal).formatted})
          </span>
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          Top Hotel: Katara Towers (42% volume)
        </div>
      </div>
    </div>
  );
};
