export interface Screening {
  id: string;
  date: string;              // ISO format: "2025-12-17"
  dateDisplay: string;       // Original format: "17.12.2025"
  filmTitle: string;
  time: string;              // "19:00" or "Farklı Saatler"
  venue: string;
  venueId?: string;          // Normalized venue ID for filtering
  eventSeries?: string;      // "Rüya Çıkmazı", "Başka Çarşamba", etc.
  link?: string;
  programmersNote?: string;
  synopsis?: string;
  isDateRange?: boolean;     // For entries like "13-17.12.2025"
  endDate?: string;          // For date ranges
  isUntilDate?: boolean;     // For "18.12.2025'ye kadar"
}

export interface Venue {
  id: string;
  name: string;
  neighborhood: string;      // Kadıköy, Beyoğlu, etc.
  address?: string;
  website?: string;
  description?: string;
  descriptionEn?: string;
}

export interface Week {
  id: string;                // "2025-W51"
  startDate: string;         // ISO format
  endDate: string;           // ISO format
  label: string;             // "16-22 Aralık"
  labelEn: string;           // "December 16-22"
  screenings: Screening[];
}

export interface DayGroup {
  date: string;              // ISO format
  dayName: string;           // "Pazartesi" / "Monday"
  dateFormatted: string;     // "16 Aralık" / "December 16"
  screenings: Screening[];
}

// CSV Row type matching the expected CSV structure
export interface CSVRow {
  Tarih: string;
  Gösterim: string;
  Saat: string;
  Mekan: string;
  Etkinlik?: string;
  Link?: string;
  Not?: string;
  Özet?: string;
}

