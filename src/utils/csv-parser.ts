/**
 * CSV parsing utilities for importing screening data
 */

import type { Screening, CSVRow } from '../types';
import { parseTurkishDate } from './dates';

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Generate a unique, URL-safe ID for a screening
 */
function generateId(row: CSVRow, index: number): string {
  const dateSlug = row.Tarih.replace(/[.\s']/g, '-').toLowerCase();
  const titleSlug = row.Gösterim
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöç]/gi, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
  return `${dateSlug}-${titleSlug}-${index}`;
}

/** Mapping of venue display names to URL-safe IDs */
const VENUE_ID_MAP: Record<string, string> = {
  'Sinematek': 'sinematek',
  'Fransız Kültür': 'fransiz-kultur',
  'SALT Beyoğlu': 'salt-beyoglu',
  'İstanbul Modern': 'istanbul-modern',
  'Atlas 1948': 'atlas-1948',
  'Beyoğlu Sineması': 'beyoglu-sinemasi',
  'Cine Majestic': 'cine-majestic',
  'CKM': 'ckm',
  'Postane': 'postane',
  'Farklı Mekanlar': 'various',
};

/**
 * Normalize venue name to URL-safe ID
 */
function normalizeVenueId(venue: string): string {
  return VENUE_ID_MAP[venue] ?? venue.toLowerCase().replace(/[^a-z0-9]/gi, '-');
}

/** Parsed date information */
interface ParsedDateInfo {
  date: string;
  dateDisplay: string;
  isDateRange: boolean;
  endDate?: string;
  isUntilDate: boolean;
}

/**
 * Parse date string and detect special formats (ranges, "until" dates)
 */
function parseDateInfo(dateStr: string): ParsedDateInfo {
  const isUntilDate = dateStr.includes("'ye kadar");
  const cleanDate = dateStr.replace(/'ye kadar$/, '').trim();

  // Check for date range "13-17.12.2025"
  const rangeMatch = cleanDate.match(/^(\d{1,2})-(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (rangeMatch) {
    const [, startDay, endDay, month, year] = rangeMatch;
    return {
      date: `${year}-${month.padStart(2, '0')}-${startDay.padStart(2, '0')}`,
      dateDisplay: dateStr,
      isDateRange: true,
      endDate: `${year}-${month.padStart(2, '0')}-${endDay.padStart(2, '0')}`,
      isUntilDate,
    };
  }

  return {
    date: parseTurkishDate(cleanDate),
    dateDisplay: dateStr,
    isDateRange: false,
    isUntilDate,
  };
}

/**
 * Parse a single CSV line, properly handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Handle escaped quotes ("")
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Parse CSV content into an array of Screening objects
 * Expects CSV format: Tarih,Gösterim,Saat,Mekan,Etkinlik,Link,Not,Özet
 */
export function parseCSV(csvContent: string): Screening[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  // Skip header row
  const screenings: Screening[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 4) continue;

    const row: CSVRow = {
      Tarih: values[0]?.trim() ?? '',
      Gösterim: values[1]?.trim() ?? '',
      Saat: values[2]?.trim() ?? '',
      Mekan: values[3]?.trim() ?? '',
      Etkinlik: values[4]?.trim() || undefined,
      Link: values[5]?.trim() || undefined,
      Not: values[6]?.trim() || undefined,
      Özet: values[7]?.trim() || undefined,
    };

    // Skip rows without required fields
    if (!row.Tarih || !row.Gösterim) continue;

    const dateInfo = parseDateInfo(row.Tarih);

    screenings.push({
      id: generateId(row, i),
      date: dateInfo.date,
      dateDisplay: dateInfo.dateDisplay,
      filmTitle: row.Gösterim,
      time: row.Saat,
      venue: row.Mekan,
      venueId: normalizeVenueId(row.Mekan),
      eventSeries: row.Etkinlik,
      link: row.Link,
      programmersNote: row.Not,
      synopsis: row.Özet,
      isDateRange: dateInfo.isDateRange,
      endDate: dateInfo.endDate,
      isUntilDate: dateInfo.isUntilDate,
    });
  }

  // Sort by date, then by time
  return screenings.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

/**
 * Convert screenings array back to CSV format
 * Useful for exporting/editing data
 */
export function toCSV(screenings: Screening[]): string {
  const headers = ['Tarih', 'Gösterim', 'Saat', 'Mekan', 'Etkinlik', 'Link', 'Not', 'Özet'];
  const lines = [headers.join(',')];

  for (const s of screenings) {
    const values = [
      s.dateDisplay,
      s.filmTitle,
      s.time,
      s.venue,
      s.eventSeries ?? '',
      s.link ?? '',
      s.programmersNote ?? '',
      s.synopsis ?? '',
    ].map((v) =>
      v.includes(',') || v.includes('"') || v.includes('\n')
        ? `"${v.replace(/"/g, '""')}"`
        : v
    );
    lines.push(values.join(','));
  }

  return lines.join('\n');
}
