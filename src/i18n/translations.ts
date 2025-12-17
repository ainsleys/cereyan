/**
 * Internationalization (i18n) module for Cereyan
 * Supports Turkish (default) and English languages
 */

// =============================================================================
// Language Configuration
// =============================================================================

/** Available languages with their native names */
export const languages = {
  tr: 'Türkçe',
  en: 'English',
} as const;

/** Language code type */
export type Language = keyof typeof languages;

/** Default language for the site */
export const defaultLang: Language = 'tr';

// =============================================================================
// Translation Strings
// =============================================================================

export const translations = {
  tr: {
    // Navigation
    'nav.calendar': 'Takvim',
    'nav.venues': 'Mekanlar',
    'nav.about': 'Hakkında',
    'nav.archive': 'Arşiv',

    // Header
    'site.title': 'Cereyan',
    'site.subtitle': 'İstanbul Film Takvimi',

    // Calendar
    'calendar.thisWeek': 'Bu Hafta',
    'calendar.nextWeek': 'Gelecek Hafta',
    'calendar.previousWeek': 'Önceki Hafta',
    'calendar.noScreenings': 'Bu hafta gösterim bulunmuyor.',
    'calendar.selectWeek': 'Hafta Seçin',

    // Days of week
    'day.monday': 'Pazartesi',
    'day.tuesday': 'Salı',
    'day.wednesday': 'Çarşamba',
    'day.thursday': 'Perşembe',
    'day.friday': 'Cuma',
    'day.saturday': 'Cumartesi',
    'day.sunday': 'Pazar',

    // Months
    'month.january': 'Ocak',
    'month.february': 'Şubat',
    'month.march': 'Mart',
    'month.april': 'Nisan',
    'month.may': 'Mayıs',
    'month.june': 'Haziran',
    'month.july': 'Temmuz',
    'month.august': 'Ağustos',
    'month.september': 'Eylül',
    'month.october': 'Ekim',
    'month.november': 'Kasım',
    'month.december': 'Aralık',

    // Screening card
    'screening.time': 'Saat',
    'screening.venue': 'Mekan',
    'screening.event': 'Etkinlik',
    'screening.programmersNote': 'Programcı Notu',
    'screening.synopsis': 'Özet',
    'screening.moreInfo': 'Detaylı Bilgi',
    'screening.cereyanTake': "Cereyan'ın Yorumu",
    'screening.buyTickets': 'Bilet Al',
    'screening.variousTimes': 'Farklı Saatler',
    'screening.variousVenues': 'Farklı Mekanlar',
    'screening.until': "'ye kadar",
    'screening.withQA': 'Söyleşili',

    // Venues
    'venues.title': 'Mekanlar',
    'venues.subtitle': "İstanbul'da bağımsız sinema mekanları",
    'venues.address': 'Adres',
    'venues.description': 'Açıklama',

    // Filters
    'filter.all': 'Tümü',
    'filter.byVenue': 'Mekana Göre',
    'filter.byEvent': 'Etkinliğe Göre',

    // Archive
    'archive.title': 'Arşiv',
    'archive.subtitle': 'Geçmiş haftaların gösterimleri',
    'archive.backToCalendar': 'Takvime Dön',
    
    // Past screenings divider
    'calendar.pastScreenings': 'Geçmiş Gösterimler',
    'calendar.viewPastScreenings': 'Bu haftanın geçmiş gösterimlerini gör',

    // Footer
    'footer.madeWith': "İstanbul'da sinema sevgisiyle yapıldı",
    'footer.subscribe': 'Bültene Abone Ol',
    'footer.substack': "Substack'te takip et",
  },

  en: {
    // Navigation
    'nav.calendar': 'Calendar',
    'nav.venues': 'Venues',
    'nav.about': 'About',
    'nav.archive': 'Archive',

    // Header
    'site.title': 'Cereyan',
    'site.subtitle': 'Istanbul Film Calendar',

    // Calendar
    'calendar.thisWeek': 'This Week',
    'calendar.nextWeek': 'Next Week',
    'calendar.previousWeek': 'Previous Week',
    'calendar.noScreenings': 'No screenings this week.',
    'calendar.selectWeek': 'Select Week',

    // Days of week
    'day.monday': 'Monday',
    'day.tuesday': 'Tuesday',
    'day.wednesday': 'Wednesday',
    'day.thursday': 'Thursday',
    'day.friday': 'Friday',
    'day.saturday': 'Saturday',
    'day.sunday': 'Sunday',

    // Months
    'month.january': 'January',
    'month.february': 'February',
    'month.march': 'March',
    'month.april': 'April',
    'month.may': 'May',
    'month.june': 'June',
    'month.july': 'July',
    'month.august': 'August',
    'month.september': 'September',
    'month.october': 'October',
    'month.november': 'November',
    'month.december': 'December',

    // Screening card
    'screening.time': 'Time',
    'screening.venue': 'Venue',
    'screening.event': 'Event',
    'screening.programmersNote': "Programmer's Note",
    'screening.synopsis': 'Synopsis',
    'screening.moreInfo': 'More Info',
    'screening.cereyanTake': "Cereyan's Take",
    'screening.buyTickets': 'Get Tickets',
    'screening.variousTimes': 'Various Times',
    'screening.variousVenues': 'Various Venues',
    'screening.until': ' (until)',
    'screening.withQA': 'with Q&A',

    // Venues
    'venues.title': 'Venues',
    'venues.subtitle': 'Independent cinema venues in Istanbul',
    'venues.address': 'Address',
    'venues.description': 'Description',

    // Filters
    'filter.all': 'All',
    'filter.byVenue': 'By Venue',
    'filter.byEvent': 'By Event',

    // Archive
    'archive.title': 'Archive',
    'archive.subtitle': 'Past weeks screenings',
    'archive.backToCalendar': 'Back to Calendar',
    
    // Past screenings divider
    'calendar.pastScreenings': 'Past Screenings',
    'calendar.viewPastScreenings': "View this week's past screenings",

    // Footer
    'footer.madeWith': 'Made with cinema love in Istanbul',
    'footer.subscribe': 'Subscribe to Newsletter',
    'footer.substack': 'Follow on Substack',
  },
} as const;

/** Type for all available translation keys */
export type TranslationKey = keyof (typeof translations)['tr'];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get a translated string for the given language and key
 * Falls back to Turkish, then to the key itself if not found
 */
export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key] ?? translations.tr[key] ?? key;
}

/**
 * Get the localized path for a given language
 * Turkish (default) paths have no prefix, English paths get /en prefix
 */
export function getLocalizedPath(lang: Language, path: string): string {
  if (lang === defaultLang) {
    return path;
  }
  return `/${lang}${path}`;
}
