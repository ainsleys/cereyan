# Scripts

Utility scripts for maintaining the Cereyan website.

## update-weekly-screenings.js

Updates the screenings database from a CSV file.

### Usage

```bash
node scripts/update-weekly-screenings.js <path-to-csv>
```

### Example

```bash
node scripts/update-weekly-screenings.js ~/Downloads/Cereyan\ Schedule\ -\ jan12-jan18.csv
```

### What it does

1. Reads the CSV file (format defined in `templates/weekly-screenings-template.csv`)
2. Determines the date range from the CSV
3. Removes existing screenings in that date range
4. Adds all screenings from the CSV
5. Writes the updated `src/data/screenings.json`

### CSV Columns

| Column | Description |
|--------|-------------|
| Tarih | Date (DD.MM.YYYY) |
| Gösterim | Film title (Turkish) |
| Gösterim (EN) | Film title (English, optional) |
| Saat | Time (HH:MM) or "Farklı Saatler" |
| Mekan | Venue name |
| Etkinlik | Event series name |
| Link | Ticket/info URL |
| Yönetmen | Director |
| Yıl | Release year |
| Süre | Runtime in minutes |
| Star | Put "X" for Cereyan Selects |
| Not | Programmer's note (Turkish) |
| Not (EN) | Programmer's note (English) |

### Adding New Venues

If a venue is not recognized, the script will warn you. To add it:

1. Add the venue to `src/data/venues.json`
2. Add the mapping to `venueMap` in this script

### After Running

```bash
git add -A && git commit -m "Update screenings for [week]" && git push origin main
npx vercel --prod --yes
```

