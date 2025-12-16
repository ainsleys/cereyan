# Cereyan - İstanbul Film Takvimi

A minimal, elegant calendar of independent and arthouse film screenings in Istanbul.

![Cereyan Logo](public/favicon.svg)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Updating the Calendar

### Option 1: Edit JSON directly

Edit `src/data/screenings.json` with new screening entries:

```json
{
  "id": "unique-id",
  "date": "2025-12-17",
  "dateDisplay": "17.12.2025",
  "filmTitle": "Film Adı",
  "time": "19:00",
  "venue": "Sinematek",
  "venueId": "sinematek",
  "eventSeries": "Retrospektif Adı",
  "link": "https://...",
  "programmersNote": "Your editorial note here",
  "synopsis": "Film synopsis"
}
```

### Option 2: Use CSV (Recommended)

Prepare a CSV with the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| Tarih | ✓ | Date in DD.MM.YYYY format |
| Gösterim | ✓ | Film title |
| Saat | ✓ | Time (e.g., "19:00" or "Farklı Saatler") |
| Mekan | ✓ | Venue name |
| Etkinlik | | Event series / retrospective name |
| Link | | URL to tickets or more info |
| Not | | Programmer's note (editorial) |
| Özet | | Synopsis |

Example:
```csv
Tarih,Gösterim,Saat,Mekan,Etkinlik,Link,Not,Özet
17.12.2025,Zama,20:00,Sinematek,Rüya Çıkmazı,https://...,"Lucrecia Martel'in başyapıtı","18. yüzyıl sömürge dönemi hikayesi"
```

### Special Date Formats

- **Date ranges**: `13-17.12.2025` (festival spanning multiple days)
- **Until dates**: `18.12.2025'ye kadar` (running until a date)
- **Variable times**: Use `Farklı Saatler` in the Saat column
- **Multiple venues**: Use `Farklı Mekanlar` in the Mekan column

## Adding New Venues

Edit `src/data/venues.json`:

```json
{
  "id": "venue-slug",
  "name": "Venue Name",
  "neighborhood": "Kadıköy",
  "address": "Full address",
  "description": "Turkish description",
  "descriptionEn": "English description"
}
```

## Project Structure

```
src/
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── LanguageToggle.astro
│   ├── WeekSelector.astro
│   ├── DaySection.astro
│   └── ScreeningCard.astro
├── data/
│   ├── screenings.json    ← Main calendar data
│   └── venues.json        ← Venue directory
├── i18n/
│   └── translations.ts    ← Turkish/English translations
├── layouts/
│   └── Layout.astro
├── pages/
│   ├── index.astro        ← Turkish calendar
│   ├── mekanlar.astro     ← Turkish venues
│   └── en/
│       ├── index.astro    ← English calendar
│       └── venues.astro   ← English venues
├── styles/
│   └── global.css
├── types/
│   └── index.ts
└── utils/
    ├── csv-parser.ts
    └── dates.ts
```

## Customization

### Brand Colors

Edit `tailwind.config.mjs` to update the color palette:

```js
colors: {
  cereyan: {
    pink: '#E8A0D0',      // Primary accent
    'pink-light': '#F2C4E3',
    'pink-dark': '#D080B8',
  },
  cinema: {
    black: '#0A0A0A',     // Background
    // ...
  }
}
```

### Translations

Add or modify translations in `src/i18n/translations.ts`.

## Deployment

The site builds to static HTML and can be deployed to any static hosting:

- **Vercel**: `npm i -g vercel && vercel`
- **Netlify**: Connect your repo or `netlify deploy`
- **GitHub Pages**: Use the Astro GitHub Pages action

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- [Tailwind CSS](https://tailwindcss.com) - Styling
- TypeScript - Type safety

---

Made with ♡ for Istanbul's cinema lovers.

