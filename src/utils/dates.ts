/**
 * Date manipulation utilities for Cereyan calendar
 */

import type { Language } from '../i18n/translations';

// =============================================================================
// Constants
// =============================================================================

/** Turkish month names */
const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
] as const;

/** English month names */
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** Turkish day names (starting from Sunday to match JS Date.getDay()) */
const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'] as const;

/** English day names */
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/** Milliseconds in a day */
const MS_PER_DAY = 86400000;

// =============================================================================
// Parsing Functions
// =============================================================================

/**
 * Parse Turkish date format (DD.MM.YYYY) to ISO format (YYYY-MM-DD)
 * Handles special formats like date ranges and "until" dates
 */
export function parseTurkishDate(dateStr: string): string {
  // Handle date ranges like "13-17.12.2025" - return start date
  if (dateStr.includes('-') && !dateStr.includes('.')) {
    return dateStr;
  }

  // Clean "until" suffix
  const cleanDate = dateStr.replace(/'ye kadar$/, '').trim();

  // Check for date range format "13-17.12.2025"
  const rangeMatch = cleanDate.match(/^(\d{1,2})-(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (rangeMatch) {
    const [, startDay, , month, year] = rangeMatch;
    return `${year}-${month.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
  }

  // Standard format "DD.MM.YYYY"
  const parts = cleanDate.split('.');
  if (parts.length !== 3) return dateStr;

  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// =============================================================================
// Formatting Functions
// =============================================================================

/**
 * Format ISO date to localized display (e.g., "16 Aralık" or "December 16")
 */
export function formatDate(isoDate: string, lang: Language): string {
  const date = new Date(isoDate);
  const day = date.getDate();
  const months = lang === 'tr' ? MONTHS_TR : MONTHS_EN;
  return `${day} ${months[date.getMonth()]}`;
}

/**
 * Get localized day name from ISO date
 */
export function getDayName(isoDate: string, lang: Language): string {
  const date = new Date(isoDate);
  const days = lang === 'tr' ? DAYS_TR : DAYS_EN;
  return days[date.getDay()];
}

/**
 * Format date for HTML date input/comparison (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format week range for display (e.g., "16-22 Aralık 2025" or "December 16-22, 2025")
 */
export function formatWeekRange(startDate: Date, endDate: Date, lang: Language): string {
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const months = lang === 'tr' ? MONTHS_TR : MONTHS_EN;
  const startMonth = months[startDate.getMonth()];
  const endMonth = months[endDate.getMonth()];
  const year = endDate.getFullYear();

  // Same month: "16-22 Aralık 2025" or "December 16-22, 2025"
  if (startDate.getMonth() === endDate.getMonth()) {
    return lang === 'tr' 
      ? `${startDay}-${endDay} ${startMonth} ${year}`
      : `${startMonth} ${startDay}-${endDay}, ${year}`;
  }

  // Different months: "30 Kasım - 6 Aralık 2025" or "November 30 - December 6, 2025"
  return lang === 'tr'
    ? `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`
    : `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

// =============================================================================
// Week Calculation Functions
// =============================================================================

/**
 * Get the Monday of the week containing the given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust: if Sunday (0), go back 6 days; otherwise go back (day - 1) days
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the Sunday of the week containing the given date
 */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

/**
 * Get ISO week string (e.g., "2025-W51")
 */
export function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Set to nearest Thursday (ISO week date system)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(
    ((d.getTime() - week1.getTime()) / MS_PER_DAY - 3 + ((week1.getDay() + 6) % 7)) / 7
  );
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

/**
 * Check if a date string falls within a week range
 */
export function isDateInWeek(dateStr: string, weekStart: Date, weekEnd: Date): boolean {
  const date = new Date(dateStr);
  return date >= weekStart && date <= weekEnd;
}

// =============================================================================
// Week Generation
// =============================================================================

/** Week data structure for navigation */
export interface WeekInfo {
  id: string;
  start: Date;
  end: Date;
  label: string;
  labelEn: string;
  isCurrent: boolean;
}

/**
 * Generate array of weeks for calendar navigation
 * Includes past weeks (archive) and future weeks
 */
export function generateWeeks(
  _screenings: { date: string }[],
  weeksToShow = 8
): WeekInfo[] {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);

  const weeks: WeekInfo[] = [];

  // Start from 4 weeks ago to show archive
  const archiveStart = new Date(currentWeekStart);
  archiveStart.setDate(archiveStart.getDate() - 28);

  const totalWeeks = weeksToShow + 4; // Include archive weeks

  for (let i = 0; i < totalWeeks; i++) {
    const weekStart = new Date(archiveStart);
    weekStart.setDate(weekStart.getDate() + i * 7);
    const weekEnd = getWeekEnd(weekStart);

    weeks.push({
      id: getISOWeek(weekStart),
      start: weekStart,
      end: weekEnd,
      label: formatWeekRange(weekStart, weekEnd, 'tr'),
      labelEn: formatWeekRange(weekStart, weekEnd, 'en'),
      isCurrent: weekStart.getTime() === currentWeekStart.getTime(),
    });
  }

  return weeks;
}
