#!/usr/bin/env node
/**
 * Update Weekly Screenings Script
 * 
 * Usage: node scripts/update-weekly-screenings.js <path-to-csv>
 * 
 * CSV format (see templates/weekly-screenings-template.csv):
 * Tarih,Gösterim,Gösterim (EN),Saat,Mekan,Etkinlik,Link,Yönetmen,Yıl,Süre,Star,Not,Not (EN)
 * 
 * The script will:
 * 1. Parse the CSV file
 * 2. Remove existing screenings for the week covered by the CSV
 * 3. Add the new screenings
 * 4. Write the updated screenings.json
 */

const fs = require('fs');
const path = require('path');

// Get CSV path from command line
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/update-weekly-screenings.js <path-to-csv>');
  console.error('Example: node scripts/update-weekly-screenings.js ~/Downloads/Cereyan\\ Schedule\\ -\\ jan5-jan11.csv');
  process.exit(1);
}

// Resolve paths
const projectRoot = path.resolve(__dirname, '..');
const screeningsPath = path.join(projectRoot, 'src/data/screenings.json');

// Venue ID mapping
const venueMap = {
  'AKM Salonu': 'akm-salonu',
  'Sinematek': 'sinematek',
  'İstanbul Modern': 'istanbul-modern',
  'Pera Müzesi': 'pera-muzesi',
  'Atlas 1948': 'atlas-1948',
  'Kadıköy Sineması': 'kadikoy-sinemasi',
  'Caddebostan CKM': 'ckm',
  'CKM (Caddebostan Kültür Merkezi)': 'ckm',
  'Torun Center': 'torun-center',
  "Nişantaşı City's AVM Cinewam": 'nisantasi-citys',
  'Fransız Kültür': 'fransiz-kultur',
  'İstanbul Barosu Merkez Binası': 'istanbul-barosu',
  'Bonkör Büyükada': 'bonkor-buyukada',
  'Postane': 'postane',
  'Cine Majestic': 'cine-majestic',
  'Depo': 'depo',
  'Paribu Art': 'paribu-art',
  'Farklı Mekanlar': 'various'
};

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse date from DD.MM.YYYY to YYYY-MM-DD
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Main script
console.log(`Reading CSV: ${csvPath}`);
const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.trim().split('\n');

// Skip header
const dataLines = lines.slice(1).filter(line => line.trim());
console.log(`Found ${dataLines.length} data rows`);

// Parse all dates to find the date range
const dates = [];
for (const line of dataLines) {
  const fields = parseCSVLine(line);
  if (fields[0]) {
    dates.push(parseDate(fields[0]));
  }
}
const minDate = dates.sort()[0];
const maxDate = dates.sort().reverse()[0];
console.log(`Date range: ${minDate} to ${maxDate}`);

// Read existing screenings
console.log(`Reading existing screenings from ${screeningsPath}`);
const existing = JSON.parse(fs.readFileSync(screeningsPath, 'utf8'));

// Filter out screenings in the date range
const filtered = existing.filter(s => {
  return !(s.date >= minDate && s.date <= maxDate);
});
console.log(`Removed ${existing.length - filtered.length} existing screenings in date range`);

// Parse new screenings
const newScreenings = [];
let id = filtered.length > 0 ? Math.max(...filtered.map(s => parseInt(s.id))) + 1 : 1;
const unknownVenues = new Set();

for (const line of dataLines) {
  const fields = parseCSVLine(line);
  // Tarih,Gösterim,Gösterim (EN),Saat,Mekan,Etkinlik,Link,Yönetmen,Yıl,Süre,Star,Not,Not (EN)
  const [tarih, gosterim, gosterimEn, saat, mekan, etkinlik, link, yonetmen, yil, sure, star, not, notEn] = fields;
  
  if (!tarih || !gosterim) continue;
  
  // Check for unknown venue
  if (mekan && !venueMap[mekan]) {
    unknownVenues.add(mekan);
  }
  
  const screening = {
    id: String(id++),
    date: parseDate(tarih),
    filmTitle: gosterim,
    time: saat || '',
    venue: mekan,
    venueId: venueMap[mekan] || 'various',
    eventSeries: etkinlik || '',
    link: link || ''
  };
  
  // Add optional fields
  if (gosterimEn) screening.filmTitleEn = gosterimEn;
  if (yonetmen) screening.director = yonetmen;
  if (yil && !isNaN(parseInt(yil))) screening.year = parseInt(yil);
  if (sure && !isNaN(parseInt(sure))) screening.runtime = parseInt(sure);
  if (star === 'X') screening.isCereyanSelect = true;
  if (not) screening.programmersNote = not;
  if (notEn) screening.programmersNoteEn = notEn;
  
  newScreenings.push(screening);
}

// Warn about unknown venues
if (unknownVenues.size > 0) {
  console.warn('\n⚠️  Unknown venues (will use "various"):');
  for (const venue of unknownVenues) {
    console.warn(`   - "${venue}"`);
  }
  console.warn('   Add these to venueMap in this script and venues.json\n');
}

// Count stats
const selectCount = newScreenings.filter(s => s.isCereyanSelect).length;
console.log(`Parsed ${newScreenings.length} new screenings`);
console.log(`  - ${selectCount} Cereyan Selects`);

// Merge and write
const merged = [...filtered, ...newScreenings];
fs.writeFileSync(screeningsPath, JSON.stringify(merged, null, 2));
console.log(`\n✅ Wrote ${merged.length} total screenings to ${screeningsPath}`);
console.log('\nNext steps:');
console.log('  git add -A && git commit -m "Update screenings" && git push origin main');
console.log('  npx vercel --prod --yes');

