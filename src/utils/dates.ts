import type { Language } from '../i18n/translations';
import { t } from '../i18n/translations';

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Parse Turkish date format (DD.MM.YYYY) to ISO format
 */
export function parseTurkishDate(dateStr: string): string {
  // Handle date ranges like "13-17.12.2025"
  if (dateStr.includes('-') && !dateStr.includes('.')) {
    return dateStr; // Return as-is for special handling
  }
  
  // Handle "until" dates like "18.12.2025'ye kadar"
  const cleanDate = dateStr.replace(/'ye kadar$/, '').trim();
  
  // Check for date range format "13-17.12.2025"
  const rangeMatch = cleanDate.match(/^(\d{1,2})-(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (rangeMatch) {
    const [, startDay, endDay, month, year] = rangeMatch;
    return `${year}-${month.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
  }
  
  // Standard format "DD.MM.YYYY"
  const parts = cleanDate.split('.');
  if (parts.length !== 3) return dateStr;
  
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Format ISO date to localized display
 */
export function formatDate(isoDate: string, lang: Language): string {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = lang === 'tr' ? MONTHS_TR[date.getMonth()] : MONTHS_EN[date.getMonth()];
  return `${day} ${month}`;
}

/**
 * Get day name from ISO date
 */
export function getDayName(isoDate: string, lang: Language): string {
  const date = new Date(isoDate);
  return lang === 'tr' ? DAYS_TR[date.getDay()] : DAYS_EN[date.getDay()];
}

/**
 * Get the Monday of the week containing the given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
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
 * Get ISO week number
 */
export function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

/**
 * Format week range for display
 */
export function formatWeekRange(startDate: Date, endDate: Date, lang: Language): string {
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = lang === 'tr' ? MONTHS_TR[startDate.getMonth()] : MONTHS_EN[startDate.getMonth()];
  const endMonth = lang === 'tr' ? MONTHS_TR[endDate.getMonth()] : MONTHS_EN[endDate.getMonth()];
  
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDay}-${endDay} ${startMonth}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}

/**
 * Generate array of weeks for navigation
 */
export function generateWeeks(screenings: { date: string }[], weeksToShow: number = 8): { 
  id: string; 
  start: Date; 
  end: Date;
  label: string;
  labelEn: string;
  isCurrent: boolean;
}[] {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  
  // Find the earliest and latest dates in screenings
  const dates = screenings.map(s => new Date(s.date)).filter(d => !isNaN(d.getTime()));
  
  const weeks: { id: string; start: Date; end: Date; label: string; labelEn: string; isCurrent: boolean }[] = [];
  
  // Start from 4 weeks ago to show archive
  const archiveStart = new Date(currentWeekStart);
  archiveStart.setDate(archiveStart.getDate() - 28);
  
  for (let i = 0; i < weeksToShow + 4; i++) {
    const weekStart = new Date(archiveStart);
    weekStart.setDate(weekStart.getDate() + (i * 7));
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

/**
 * Check if a date falls within a week
 */
export function isDateInWeek(dateStr: string, weekStart: Date, weekEnd: Date): boolean {
  const date = new Date(dateStr);
  return date >= weekStart && date <= weekEnd;
}

/**
 * Format date for HTML date input/comparison
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

