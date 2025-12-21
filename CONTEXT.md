# Cereyan - İstanbul Film Takvimi / Istanbul Film Calendar

## Project Overview

Cereyan is a bilingual (Turkish/English) static website that displays a weekly calendar of independent and art cinema screenings happening in Istanbul. 

**Live Site:** https://cereyan.vercel.app  
**Repository:** https://github.com/ainsleys/cereyan
**Content Source:** https://cereyan.substack.com

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Astro](https://astro.build/) | Static site generator |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| TypeScript | Type-safe development |
| [Vercel](https://vercel.com/) | Hosting & auto-deployment |

### Why Astro?

- **Static output:** Fast, SEO-friendly pages with zero JavaScript by default
- **Component islands:** Only hydrate interactive parts (filters, expandable cards)
- **TypeScript support:** Full type safety for data structures
- **Easy i18n:** File-based routing makes multi-language simple

---

## Project Structure

```
cereyan/
├── public/
│   ├── favicon.svg         # Browser tab icon
│   └── logo.svg            # Site logo (hexagonal design)
├── src/
│   ├── components/         # Reusable Astro components
│   │   ├── DaySection.astro     # Groups screenings by day
│   │   ├── Footer.astro         # Site footer with social links
│   │   ├── Header.astro         # Navigation & language toggle
│   │   ├── LanguageToggle.astro # TR/EN switcher
│   │   ├── ScreeningCard.astro  # Individual screening display
│   │   ├── VenueFilter.astro    # Multi-select venue filter
│   │   └── WeekSelector.astro   # Week navigation tabs
│   ├── data/               # JSON data files
│   │   ├── screenings.json      # All screening entries
│   │   └── venues.json          # Venue information
│   ├── i18n/
│   │   └── translations.ts      # All UI strings in TR/EN
│   ├── layouts/
│   │   └── Layout.astro         # Base HTML template
│   ├── pages/              # File-based routing
│   │   ├── index.astro          # Turkish homepage
│   │   ├── mekanlar.astro       # Turkish venues page
│   │   └── en/
│   │       ├── index.astro      # English homepage
│   │       └── venues.astro     # English venues page
│   ├── styles/
│   │   └── global.css           # Tailwind imports & custom styles
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── utils/
│       ├── csv-parser.ts        # CSV to JSON converter
│       └── dates.ts             # Date manipulation utilities
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

---

## Key Concepts

### 1. Data Flow

```
CSV (from Google Sheets) → csv-parser.ts → screenings.json → Astro pages
```

The owner provides screening data as a CSV. Use the `parseCSV()` function from `csv-parser.ts` to convert it to JSON format.

**CSV Format:**
```csv
Tarih,Gösterim,Saat,Mekan,Etkinlik,Link,Not,Özet
17.12.2025,Film Title,19:00,Sinematek,Event Series,https://...,Programmer note,Synopsis
```

### 2. Internationalization (i18n)

- **Default language:** Turkish (`tr`)
- **English routes:** Prefixed with `/en/` (e.g., `/en/venues`)
- **Translation function:** `t(lang, 'key.name')` returns localized string
- **Path helper:** `getLocalizedPath(lang, '/path')` adds language prefix if needed

All UI strings are in `src/i18n/translations.ts`. Film titles and notes remain in their original language.

### 3. Week-Based Navigation

Unlike day-by-day calendars, Cereyan uses a **week selector**:

- Weeks run Monday → Sunday
- Current week is highlighted with a dot indicator
- Past weeks are accessible for archive browsing
- URL parameter: `?week=2025-W51` (ISO week format)

### 4. Venue Filtering

The `VenueFilter` component allows multi-select filtering:

- Click "All" to reset
- Click individual venues to toggle them
- Multiple venues can be selected simultaneously
- Day sections with no visible screenings are hidden

### 5. Screening Cards

Each screening can include:
- **Required:** date, title, time, venue
- **Optional:** event series, link, programmer's note, synopsis
- Expandable sections for notes/synopsis (client-side JavaScript)

---

## Design System

### Colors (Tailwind classes)

| Token | Hex | Usage |
|-------|-----|-------|
| `cereyan-pink` | #E8A0D0 | Primary accent, links, highlights |
| `cereyan-pink-light` | #F2C4E3 | Hover states |
| `cinema-black` | #0A0A0A | Page background |
| `cinema-darker` | #121212 | Card backgrounds |
| `cinema-gray` | #2A2A2A | Borders |
| `cinema-text` | #E8E8E8 | Primary text |
| `cinema-text-muted` | #888888 | Secondary text |

### Typography

| Class | Font | Usage |
|-------|------|-------|
| `font-sans` | DM Sans | Body text |
| `font-display` | Instrument Serif | Headings, film titles |
| `font-mono` | IBM Plex Mono | Times, technical info |

### Component Classes (from global.css)

- `.screening-card` — Main card style with hover glow
- `.venue-tag` — Gray pill for venue name
- `.event-tag` — Pink pill for event series
- `.date-header` — Uppercase pink day header
- `.btn-primary` — Pink button with hover scale

---

## Common Tasks

### Adding a New Week's Screenings

1. Get CSV from Google Sheets or manual entry
2. Run through `parseCSV()` or manually create JSON
3. Add to `src/data/screenings.json`
4. Commit and push — Vercel auto-deploys

### Adding a New Venue

Add to `src/data/venues.json`:

```json
{
  "id": "venue-slug",
  "name": "Display Name",
  "neighborhood": "Kadıköy",
  "address": "Full address",
  "description": "Turkish description",
  "descriptionEn": "English description"
}
```

Also add to `VENUE_ID_MAP` in `src/utils/csv-parser.ts` if importing from CSV.

### Adding a Translation

Add to both `tr` and `en` objects in `src/i18n/translations.ts`:

```typescript
'key.name': 'Turkish text',
// and
'key.name': 'English text',
```

### Modifying Styles

1. **Tailwind utilities:** Use directly in components
2. **Custom classes:** Add to `src/styles/global.css` under `@layer components`
3. **Color/font changes:** Modify `tailwind.config.mjs`

---

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

Pushes to `main` branch automatically deploy to Vercel.

Manual deploy:
```bash
npx vercel --prod
```

---

## Data Types Reference

### Screening

```typescript
interface Screening {
  id: string;           // Unique identifier
  date: string;         // "2025-12-17" (ISO format)
  dateDisplay: string;  // "17.12.2025" (Turkish format)
  filmTitle: string;    // Film name
  time: string;         // "19:00" or "Farklı Saatler"
  venue: string;        // Display name
  venueId?: string;     // URL-safe slug for filtering
  eventSeries?: string; // Retrospective/series name
  link?: string;        // Ticket/info URL
  programmersNote?: string;
  synopsis?: string;
  isDateRange?: boolean;  // For "13-17.12.2025"
  endDate?: string;       // End of date range
  isUntilDate?: boolean;  // For "'ye kadar" format
}
```

### Venue

```typescript
interface Venue {
  id: string;
  name: string;
  neighborhood: string;   // Kadıköy, Beyoğlu, etc.
  address?: string;
  website?: string;
  description?: string;   // Turkish
  descriptionEn?: string; // English
}
```

---

## Known Issues & Future Improvements

### Current Limitations

- No search functionality
- No RSS feed
- No email subscription integration
- Screenings data is manually updated

### Potential Enhancements

1. **Substack API integration** — Auto-pull editorial notes
2. **iCal export** — Add to calendar feature
3. **Email reminders** — Subscribe to venue/series notifications
4. **Film database** — Link to TMDB/IMDB for film info
5. **Map view** — Show venues on Istanbul map

---

## Contact & Resources

- **Substack:** https://cereyan.substack.com
- **Instagram:** @cereyanistanbul
- **Vercel Dashboard:** https://vercel.com/ainsleys-projects-8547ac1c/cereyan

---

*Last updated: December 2024*



