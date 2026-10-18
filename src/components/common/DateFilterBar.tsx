import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Filter,
  RotateCcw,
  Sparkles,
  Check,
  CalendarRange,
} from 'lucide-react';
import {
  DateFilterState,
  DEFAULT_DATE_FILTER,
  MONTH_NAMES_SHORT,
  getFilterSummaryLabel,
} from '../../utils/dateFilter';

interface DateFilterBarProps {
  filter: DateFilterState;
  onChange: (newFilter: DateFilterState) => void;
  totalCount?: number;
  filteredCount?: number;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  filter,
  onChange,
  totalCount,
  filteredCount,
  label = 'Date & Year Filter',
  className = '',
  compact = false,
}) => {
  const [showCustomRange, setShowCustomRange] = useState(filter.preset === 'CUSTOM');
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  const isFiltered =
    filter.year !== 'ALL' ||
    filter.month !== 'ALL' ||
    filter.preset !== 'ALL' ||
    Boolean(filter.startDate) ||
    Boolean(filter.endDate);

  const handlePresetSelect = (
    preset: DateFilterState['preset'],
    assignedYear?: number | 'ALL'
  ) => {
    if (preset === 'ALL') {
      setShowCustomRange(false);
      onChange({ ...DEFAULT_DATE_FILTER });
      return;
    }

    if (preset === 'TODAY' || preset === 'YESTERDAY' || preset === 'THIS_MONTH' || preset === 'THIS_YEAR') {
      setShowCustomRange(false);
      onChange({
        ...filter,
        preset,
        year: 2026,
        month: preset === 'THIS_MONTH' ? 9 : filter.month,
        startDate: '',
        endDate: '',
      });
      return;
    }

    if (preset === 'LAST_YEAR') {
      setShowCustomRange(false);
      onChange({
        ...filter,
        preset,
        year: 2025,
        startDate: '',
        endDate: '',
      });
      return;
    }

    if (preset === 'CUSTOM') {
      setShowCustomRange(true);
      onChange({
        ...filter,
        preset: 'CUSTOM',
      });
      return;
    }

    onChange({
      ...filter,
      preset,
      year: assignedYear !== undefined ? assignedYear : filter.year,
    });
  };

  const handleReset = () => {
    setShowCustomRange(false);
    setShowMonthSelector(false);
    onChange({ ...DEFAULT_DATE_FILTER });
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs transition-all ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Title and Active Filter Indicator */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {label}
              </span>
              {isFiltered && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white animate-pulse">
                  FILTER ACTIVE
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Selected:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {getFilterSummaryLabel(filter)}
              </span>
              {totalCount !== undefined && filteredCount !== undefined && (
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold ml-1">
                  ({filteredCount} of {totalCount} records)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right Side: Year Pills & Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Quick Presets */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => handlePresetSelect('ALL')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                filter.preset === 'ALL' && filter.year === 'ALL'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => handlePresetSelect('TODAY')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                filter.preset === 'TODAY'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handlePresetSelect('THIS_MONTH')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                filter.preset === 'THIS_MONTH'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => {
                setShowCustomRange(!showCustomRange);
                if (!showCustomRange) {
                  onChange({ ...filter, preset: 'CUSTOM' });
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                showCustomRange || filter.preset === 'CUSTOM'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarRange className="w-3 h-3" />
              <span>Custom Range</span>
            </button>
          </div>

          {/* Month Dropdown Button */}
          <button
            onClick={() => setShowMonthSelector(!showMonthSelector)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              filter.month !== 'ALL'
                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-400 text-blue-700 dark:text-blue-300 font-bold'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>
              {filter.month !== 'ALL' ? MONTH_NAMES_SHORT[filter.month] : 'Filter Month'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Reset Button */}
          {isFiltered && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Reset all date and year filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Month Selector Expandable Strip */}
      {showMonthSelector && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Select Month:</span>
          <button
            onClick={() => {
              onChange({ ...filter, month: 'ALL' });
            }}
            className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              filter.month === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Months
          </button>
          {MONTH_NAMES_SHORT.map((m, idx) => (
            <button
              key={m}
              onClick={() => {
                onChange({
                  ...filter,
                  month: idx,
                  year: filter.year === 'ALL' ? 2026 : filter.year,
                  preset: 'CUSTOM',
                });
              }}
              className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                filter.month === idx
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Custom Date Range Expandable Strip */}
      {showCustomRange && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <CalendarRange className="w-3.5 h-3.5 text-indigo-500" />
            <span>Select Date Range:</span>
          </span>

          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-500 dark:text-slate-400">From:</label>
            <input
              type="date"
              value={filter.startDate || ''}
              onChange={(e) =>
                onChange({
                  ...filter,
                  preset: 'CUSTOM',
                  startDate: e.target.value,
                })
              }
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-500 dark:text-slate-400">To:</label>
            <input
              type="date"
              value={filter.endDate || ''}
              onChange={(e) =>
                onChange({
                  ...filter,
                  preset: 'CUSTOM',
                  endDate: e.target.value,
                })
              }
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(filter.startDate || filter.endDate) && (
            <button
              onClick={() =>
                onChange({
                  ...filter,
                  startDate: '',
                  endDate: '',
                })
              }
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 text-xs font-medium cursor-pointer"
            >
              Clear Range
            </button>
          )}
        </div>
      )}
    </div>
  );
};
