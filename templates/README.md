# Weekly Screenings Template

Use `weekly-screenings-template.csv` to submit new screening data.

## Columns

| Column | Turkish | Required | Description |
|--------|---------|----------|-------------|
| Tarih | Date | ✓ | `DD.MM.YYYY` format |
| Gösterim | Film Title | ✓ | Turkish title |
| Gösterim (EN) | English Title | | Only if official English title exists |
| Saat | Time | ✓ | `HH:MM` format, or leave empty for all-day |
| Mekan | Venue | ✓ | Venue name |
| Etkinlik | Event Series | | Retrospective/series name |
| Link | Link | | Ticket or info URL |
| Yönetmen | Director | | Director name(s) |
| Yıl | Year | | Release year (number) |
| Süre | Runtime | | Duration in minutes (number) |
| Star | Cereyan Select | | Put `X` to mark as Cereyan Selects |
| Not | Note (TR) | | Cereyan's editorial note (Turkish) - optional |
| Not (EN) | Note (EN) | | Cereyan's editorial note (English) - optional |

## Special Formats

### Dates
- Standard: `22.12.2025`
- Date range: `22-28.12.2025`
- Until date: `28.12.2025'ye kadar`

### Time
- Standard: `19:00`
- Various times: `Farklı Saatler`
- All day: leave empty

### Venues
- Use exact venue names for proper filtering
- `Farklı Mekanlar` for multiple/various venues

## Tips

1. **English titles**: Only add if an official English title exists. Don't translate Turkish films that have no international release.

2. **Director format**: Use `&` for co-directors: `Ludovic & Zoran Boukherma`

3. **Cereyan Selects**: Put `X` in the Star column to highlight a film with a gold star. Notes are optional - you can mark a film as a Select without adding a note.

4. **Metadata priority**: Director, Year, Runtime can be filled in later if not immediately available.

## Example

```csv
Tarih,Gösterim,Gösterim (EN),Saat,Mekan,Etkinlik,Link,Yönetmen,Yıl,Süre,Star,Not,Not (EN)
22.12.2025,Ayrılma Kararı,Decision to Leave,19:00,Sinematek,Park Chan-wook Retrospektifi,https://sinematek.tv/film,Park Chan-wook,2022,138,X,Yılın en iyi filmlerinden,One of the year's best
23.12.2025,Dahomey,Dahomey,19:00,Pera Müzesi,Bütün O Sanat,https://example.com,Mati Diop,2024,68,X,,
24.12.2025,Kaybedenler Kulübü,,20:30,Atlas 1948,,https://atlas.com,Tolga Karaçelik,2011,118,,,
```




