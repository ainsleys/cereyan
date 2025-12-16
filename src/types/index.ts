/**
 * Core type definitions for Cereyan - Istanbul Film Calendar
 */

// =============================================================================
// Screening Types
// =============================================================================

/**
 * Represents a single film screening event
 */
export interface Screening {
  /** Unique identifier for the screening */
  id: string;
  /** ISO format date: "2025-12-17" */
  date: string;
  /** Original Turkish date format: "17.12.2025" */
  dateDisplay: string;
  /** Film title (in Turkish) */
  filmTitle: string;
  /** Screening time: "19:00" or "Farklı Saatler" for variable times */
  time: string;
  /** Venue display name */
  venue: string;
  /** Normalized venue ID for filtering (e.g., "sinematek", "salt-beyoglu") */
  venueId?: string;
  /** Event series or retrospective name (e.g., "Rüya Çıkmazı") */
  eventSeries?: string;
  /** External link to tickets or more info */
  link?: string;
  /** Editorial note from the programmer */
  programmersNote?: string;
  /** Film synopsis */
  synopsis?: string;
  /** True if screening spans multiple days (e.g., "13-17.12.2025") */
  isDateRange?: boolean;
  /** End date for date ranges (ISO format) */
  endDate?: string;
  /** True if format is "until date" (e.g., "18.12.2025'ye kadar") */
  isUntilDate?: boolean;
}

// =============================================================================
// Venue Types
// =============================================================================

/**
 * Represents a cinema venue
 */
export interface Venue {
  /** Unique identifier (slug format) */
  id: string;
  /** Display name */
  name: string;
  /** Istanbul neighborhood: Kadıköy, Beyoğlu, etc. */
  neighborhood: string;
  /** Full street address */
  address?: string;
  /** Venue website URL */
  website?: string;
  /** Turkish description */
  description?: string;
  /** English description */
  descriptionEn?: string;
}

// =============================================================================
// Calendar Types
// =============================================================================

/**
 * Represents a week in the calendar
 */
export interface Week {
  /** ISO week format: "2025-W51" */
  id: string;
  /** Week start date (ISO format) */
  startDate: string;
  /** Week end date (ISO format) */
  endDate: string;
  /** Turkish label: "16-22 Aralık" */
  label: string;
  /** English label: "December 16-22" */
  labelEn: string;
  /** Screenings within this week */
  screenings: Screening[];
}

/**
 * Group of screenings for a single day
 */
export interface DayGroup {
  /** ISO format date */
  date: string;
  /** Localized day name: "Pazartesi" / "Monday" */
  dayName: string;
  /** Localized date: "16 Aralık" / "December 16" */
  dateFormatted: string;
  /** Screenings on this day */
  screenings: Screening[];
}

// =============================================================================
// CSV Import Types
// =============================================================================

/**
 * Raw CSV row structure matching the expected import format
 * Column names are in Turkish to match the source spreadsheet
 */
export interface CSVRow {
  /** Date: DD.MM.YYYY format */
  Tarih: string;
  /** Film title */
  Gösterim: string;
  /** Time */
  Saat: string;
  /** Venue */
  Mekan: string;
  /** Event/Series name (optional) */
  Etkinlik?: string;
  /** External link (optional) */
  Link?: string;
  /** Programmer's note (optional) */
  Not?: string;
  /** Synopsis (optional) */
  Özet?: string;
}
