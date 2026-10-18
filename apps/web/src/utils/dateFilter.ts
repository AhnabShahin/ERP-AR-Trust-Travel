export interface DateFilterState {
  year: number | 'ALL'; // 2026 | 2025 | 2024 | 'ALL'
  month: number | 'ALL'; // 0..11 or 'ALL'
  preset: 'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'LAST_YEAR' | 'CUSTOM';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export const DEFAULT_DATE_FILTER: DateFilterState = {
  year: 'ALL',
  month: 'ALL',
  preset: 'ALL',
  startDate: '',
  endDate: '',
};

export const AVAILABLE_YEARS = [2026, 2025, 2024];

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Current anchor date in app environment (October 9, 2026)
export const CURRENT_APP_DATE = new Date(2026, 9, 9); // Month is 0-indexed, 9 = October

/**
 * Robustly parses various date formats used in the app into a standard Date object
 */
export function parseRecordDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const trimmed = dateStr.trim();
  const lower = trimmed.toLowerCase();

  // 1. Relative "Today", "Yesterday", "Just now" or "Now"
  if (lower.includes('today') || lower.includes('just now') || lower === 'now') {
    return new Date(2026, 9, 9);
  }
  if (lower.includes('yesterday')) {
    return new Date(2026, 9, 8);
  }

  // 2. ISO format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return new Date(year, month, day);
  }

  // 3. Month Name + Day + Year e.g. "Oct 04, 2026", "October 14, 2025"
  const mdyMatch = trimmed.match(/([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (mdyMatch) {
    const monthIndex = getMonthIndex(mdyMatch[1]);
    const day = parseInt(mdyMatch[2], 10);
    const year = parseInt(mdyMatch[3], 10);
    if (monthIndex !== -1) {
      return new Date(year, monthIndex, day);
    }
  }

  // 4. Day + Month + Year e.g. "04 Oct 2026"
  const dmyMatch = trimmed.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const monthIndex = getMonthIndex(dmyMatch[2]);
    const year = parseInt(dmyMatch[3], 10);
    if (monthIndex !== -1) {
      return new Date(year, monthIndex, day);
    }
  }

  // 5. Month + Year only e.g. "October 2026", "September 2025"
  const myMatch = trimmed.match(/([a-zA-Z]+)\s+(\d{4})/);
  if (myMatch) {
    const monthIndex = getMonthIndex(myMatch[1]);
    const year = parseInt(myMatch[2], 10);
    if (monthIndex !== -1) {
      return new Date(year, monthIndex, 1);
    }
  }

  // 6. Just a 4-digit year e.g. "2026", "2025"
  const yearOnlyMatch = trimmed.match(/\b(202\d)\b/);
  if (yearOnlyMatch) {
    const year = parseInt(yearOnlyMatch[1], 10);
    return new Date(year, 0, 1);
  }

  // Native parse fallback
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

function getMonthIndex(monthStr: string): number {
  const m = monthStr.toLowerCase();
  for (let i = 0; i < 12; i++) {
    if (
      MONTH_NAMES[i].toLowerCase().startsWith(m) ||
      MONTH_NAMES_SHORT[i].toLowerCase() === m
    ) {
      return i;
    }
  }
  return -1;
}

/**
 * Checks if a date string matches the provided DateFilterState
 */
export function matchesDateFilter(
  dateStr: string | undefined | null,
  filter: DateFilterState
): boolean {
  // If filter is completely open ('ALL' preset and 'ALL' year)
  if (
    filter.preset === 'ALL' &&
    filter.year === 'ALL' &&
    filter.month === 'ALL' &&
    !filter.startDate &&
    !filter.endDate
  ) {
    return true;
  }

  const d = parseRecordDate(dateStr);
  if (!d) {
    // If no date could be parsed, let it pass so freshly inputted or custom records are not hidden
    return true;
  }

  const recYear = d.getFullYear();
  const recMonth = d.getMonth();

  // 1. Check Year filter if explicitly set
  if (filter.year !== 'ALL') {
    if (recYear !== filter.year) return false;
  }

  // 2. Check Month filter if explicitly set
  if (filter.month !== 'ALL') {
    if (recMonth !== filter.month) return false;
  }

  // 3. Preset checks
  if (filter.preset === 'TODAY') {
    return recYear === 2026 && recMonth === 9 && d.getDate() === 9;
  }

  if (filter.preset === 'YESTERDAY') {
    return recYear === 2026 && recMonth === 9 && d.getDate() === 8;
  }

  if (filter.preset === 'THIS_MONTH') {
    return recYear === 2026 && recMonth === 9; // October 2026
  }

  if (filter.preset === 'LAST_MONTH') {
    return recYear === 2026 && recMonth === 8; // September 2026
  }

  if (filter.preset === 'THIS_YEAR') {
    return recYear === 2026;
  }

  if (filter.preset === 'LAST_YEAR') {
    return recYear === 2025;
  }

  // 4. Custom Start / End Date range check
  if (filter.preset === 'CUSTOM' || filter.startDate || filter.endDate) {
    if (filter.startDate) {
      const s = parseRecordDate(filter.startDate);
      if (s && d < new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0)) {
        return false;
      }
    }
    if (filter.endDate) {
      const e = parseRecordDate(filter.endDate);
      if (e && d > new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Returns formatted summary of active filter
 */
export function getFilterSummaryLabel(filter: DateFilterState, lang: 'en' | 'ar' = 'en'): string {
  if (
    filter.preset === 'ALL' &&
    filter.year === 'ALL' &&
    filter.month === 'ALL' &&
    !filter.startDate &&
    !filter.endDate
  ) {
    return lang === 'ar' ? 'كل التواريخ والسنوات' : 'All Dates & Years';
  }

  if (filter.preset === 'TODAY') {
    return lang === 'ar' ? 'اليوم (9 أكتوبر 2026)' : 'Today (Oct 9, 2026)';
  }

  if (filter.preset === 'THIS_MONTH') {
    return lang === 'ar' ? 'هذا الشهر (أكتوبر 2026)' : 'This Month (Oct 2026)';
  }

  if (filter.preset === 'THIS_YEAR') {
    return lang === 'ar' ? 'السنة الحالية (2026)' : 'This Year (2026)';
  }

  if (filter.preset === 'LAST_YEAR') {
    return lang === 'ar' ? 'العام الماضي (2025)' : 'Last Year (2025)';
  }

  if (filter.preset === 'CUSTOM' && (filter.startDate || filter.endDate)) {
    return `${filter.startDate || 'Start'} → ${filter.endDate || 'End'}`;
  }

  const parts: string[] = [];
  if (filter.year !== 'ALL') {
    parts.push(lang === 'ar' ? `سنة ${filter.year}` : `Year ${filter.year}`);
  }
  if (filter.month !== 'ALL') {
    parts.push(MONTH_NAMES[filter.month]);
  }

  return parts.length > 0 ? parts.join(' · ') : (lang === 'ar' ? 'مخصص' : 'Custom');
}
