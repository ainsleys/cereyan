import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

export const prerender = false;

const AUTHORIZED_EMAILS = (import.meta.env.ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase());
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || '';

// Venue mapping (same as in the script)
const VENUE_MAP: Record<string, string> = {
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
  'Farklı Mekanlar': 'various',
  'Beyoğlu Sineması': 'beyoglu-sinemasi',
  'Robinson Crusoe 389': 'robinson-crusoe-389',
  '23,5 Hrant Dink Hafıza Mekânı': 'hrant-dink-hafiza'
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
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

function parseDate(dateStr: string): string {
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const auth = formData.get('auth') as string;
    const csvFile = formData.get('csv') as File;
    
    // Verify auth (base64 encoded email:password)
    let authValid = false;
    if (auth) {
      try {
        const decoded = atob(auth);
        const [authEmail, authPassword] = decoded.split(':');
        authValid = authEmail === email && 
                   AUTHORIZED_EMAILS.includes(email.toLowerCase()) && 
                   authPassword === ADMIN_PASSWORD;
      } catch (e) {
        authValid = false;
      }
    }
    
    if (!authValid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!csvFile) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate file type
    const fileName = csvFile.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
      return new Response(JSON.stringify({ 
        error: `Invalid file type: "${csvFile.name}". Please upload a .csv file.` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse CSV
    const csvText = await csvFile.text();
    const lines = csvText.trim().split('\n');
    
    // Check if file has content
    if (lines.length < 2) {
      return new Response(JSON.stringify({ 
        error: 'CSV file is empty or has no data rows.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate header row has required columns
    const header = lines[0].toLowerCase();
    const requiredColumns = ['tarih', 'gösterim', 'saat', 'mekan'];
    const missingColumns = requiredColumns.filter(col => !header.includes(col));
    
    if (missingColumns.length > 0) {
      return new Response(JSON.stringify({ 
        error: `CSV is missing required columns: ${missingColumns.join(', ')}. Make sure your CSV has: Tarih, Gösterim, Saat, Mekan` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    // Extract dates for range
    const dates: string[] = [];
    const unknownVenues: Set<string> = new Set();
    const screenings: any[] = [];
    let cereyanSelectCount = 0;
    
    for (const line of dataLines) {
      const fields = parseCSVLine(line);
      const [tarih, gosterim, gosterimEn, saat, mekan, etkinlik, link, yonetmen, yil, sure, star] = fields;
      
      if (!tarih || !gosterim) continue;
      
      const date = parseDate(tarih);
      dates.push(date);
      
      // Check for unknown venues
      if (mekan && !VENUE_MAP[mekan]) {
        unknownVenues.add(mekan);
      }
      
      if (star === 'X') {
        cereyanSelectCount++;
      }
      
      const screening = {
        date,
        filmTitle: gosterim,
        filmTitleEn: gosterimEn || '',
        time: saat || '',
        venue: mekan,
        venueId: VENUE_MAP[mekan] || 'various',
        eventSeries: etkinlik || '',
        link: link || '',
        director: yonetmen || '',
        year: yil ? parseInt(yil) : null,
        runtime: sure ? parseInt(sure) : null,
        isCereyanSelect: star === 'X'
      };
      
      screenings.push(screening);
    }
    
    // Check if we got any valid screenings
    if (screenings.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No valid screenings found in CSV. Make sure each row has at least a date (Tarih) and film title (Gösterim).' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    dates.sort();
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    
    // Validate dates are reasonable
    if (!minDate || !maxDate || minDate === 'undefined' || maxDate === 'undefined') {
      return new Response(JSON.stringify({ 
        error: 'Could not parse dates from CSV. Make sure dates are in DD.MM.YYYY format (e.g., 15.01.2026).' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Build warnings
    const warnings: string[] = [];
    if (unknownVenues.size > 0) {
      warnings.push(`Unknown venues: ${Array.from(unknownVenues).join(', ')}`);
    }
    
    // Build a summary of the data for Claude to review
    const screeningSummary = screenings.map(s => 
      `- ${s.date} ${s.time}: "${s.filmTitle}" at ${s.venue}${s.director ? ` (${s.director}${s.year ? ', ' + s.year : ''})` : ''}${s.isCereyanSelect ? ' ⭐' : ''}`
    ).join('\n');
    
    // Check for potential issues Claude should review
    const filmsWithoutDirector = screenings.filter(s => !s.director && !s.filmTitle.includes('Sanatçı Filmleri')).map(s => s.filmTitle);
    const filmsWithoutYear = screenings.filter(s => !s.year && s.director).map(s => s.filmTitle);
    const filmsWithoutLink = screenings.filter(s => !s.link).map(s => s.filmTitle);
    
    // Find potential duplicates (same film, same venue, same date)
    const seen = new Map();
    const potentialDuplicates: string[] = [];
    for (const s of screenings) {
      const key = `${s.filmTitle}-${s.venue}-${s.date}`;
      if (seen.has(key)) {
        potentialDuplicates.push(`${s.filmTitle} at ${s.venue} on ${s.date}`);
      }
      seen.set(key, true);
    }
    
    // Get Claude's help - actually analyze the data
    let claudeAssistance = '';
    if (import.meta.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({
          apiKey: import.meta.env.ANTHROPIC_API_KEY
        });
        
        const prompt = `You are a helpful assistant for Cereyan, an Istanbul film calendar website. A team member is uploading this week's film screenings. Please review the data and provide helpful feedback.

**Date Range:** ${minDate} to ${maxDate}
**Total Screenings:** ${screenings.length}
**Cereyan Selects (⭐):** ${cereyanSelectCount}

**All Screenings:**
${screeningSummary}

**Known venues:** ${Object.keys(VENUE_MAP).join(', ')}

**Potential Issues Found:**
${unknownVenues.size > 0 ? `- Unknown venues: ${Array.from(unknownVenues).join(', ')}` : ''}
${filmsWithoutDirector.length > 0 ? `- Films without director: ${filmsWithoutDirector.slice(0, 5).join(', ')}${filmsWithoutDirector.length > 5 ? '...' : ''}` : ''}
${filmsWithoutYear.length > 0 ? `- Films without year: ${filmsWithoutYear.slice(0, 5).join(', ')}${filmsWithoutYear.length > 5 ? '...' : ''}` : ''}
${potentialDuplicates.length > 0 ? `- Potential duplicates: ${potentialDuplicates.join(', ')}` : ''}
${filmsWithoutLink.length > 0 ? `- Films without ticket link (${filmsWithoutLink.length} total)` : ''}

Please provide a brief review (3-5 sentences):
1. Confirm what looks good
2. Point out any issues that need attention (unknown venues, missing data, etc.)
3. Note anything that looks unusual (wrong years, typos in film names if obvious)
4. End with whether it's ready to deploy or needs fixes first`;

        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: prompt
          }]
        });
        
        if (message.content[0].type === 'text') {
          claudeAssistance = message.content[0].text;
        }
      } catch (error) {
        console.error('Claude API error:', error);
      }
    }
    
    // Add detected issues to warnings
    if (potentialDuplicates.length > 0) {
      warnings.push(`Potential duplicates: ${potentialDuplicates.join(', ')}`);
    }
    
    return new Response(JSON.stringify({
      dateRange: `${minDate} to ${maxDate}`,
      totalScreenings: screenings.length,
      cereyanSelects: cereyanSelectCount,
      warnings,
      claudeAssistance,
      blockingIssues: false,
      csvData: csvText // Store for deployment
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
