# Cereyan - İstanbul Film Takvimi

A calendar maintained by the Cereyan team of independent and arthouse film screenings in Istanbul.

**Live:** [cereyan.vercel.app](https://cereyan.vercel.app) • **Newsletter:** [cereyan.substack.com](https://cereyan.substack.com)

## Quick Start

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (localhost:4321)
npm run build    # Build for production
```

## Updating the Calendar

### From CSV (Recommended)

Prepare a CSV with these columns:

| Column | Required | Description |
|--------|----------|-------------|
| Tarih | ✓ | Date: `DD.MM.YYYY` |
| Gösterim | ✓ | Film title |
| Saat | ✓ | Time: `19:00` or `Farklı Saatler` |
| Mekan | ✓ | Venue name |
| Etkinlik | | Event series name |
| Link | | Ticket/info URL |
| Not | | Programmer's note |
| Özet | | Synopsis |

**Special formats:**
- Date ranges: `13-17.12.2025`
- Until dates: `18.12.2025'ye kadar`
- Multiple venues: `Farklı Mekanlar`

### Direct JSON Edit

Edit `src/data/screenings.json`:

```json
{
  "id": "unique-id",
  "date": "2025-12-17",
  "dateDisplay": "17.12.2025",
  "filmTitle": "Film Adı",
  "time": "19:00",
  "venue": "Sinematek",
  "venueId": "sinematek",
  "eventSeries": "Retrospektif",
  "link": "https://...",
  "programmersNote": "Editorial note"
}
```

## Project Structure

```
src/
├── components/     # Astro UI components
├── data/           # screenings.json, venues.json
├── i18n/           # Turkish/English translations
├── layouts/        # Base HTML template
├── pages/          # Routes (/ and /en/)
├── styles/         # Tailwind + custom CSS
├── types/          # TypeScript interfaces
└── utils/          # Date & CSV utilities
```

## Deployment

Auto-deploys to Vercel on push to `main`. Manual deploy:

```bash
npx vercel --prod
```

## Documentation

See [CONTEXT.md](./CONTEXT.md) for detailed architecture, design system, and development guide.

---

Made with ♡ for Istanbul's cinema lovers.
