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
    
    // Parse CSV
    const csvText = await csvFile.text();
    const lines = csvText.trim().split('\n');
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
    
    dates.sort();
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    
    // Build warnings
    const warnings: string[] = [];
    if (unknownVenues.size > 0) {
      warnings.push(`Unknown venues: ${Array.from(unknownVenues).join(', ')}`);
    }
    
    // Get Claude's help if there are warnings
    let claudeAssistance = '';
    if (warnings.length > 0 && import.meta.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({
          apiKey: import.meta.env.ANTHROPIC_API_KEY
        });
        
        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `I'm uploading a CSV of film screenings and found these issues:\n\n${warnings.join('\n')}\n\nKnown venues: ${Object.keys(VENUE_MAP).join(', ')}\n\nCan you help me understand what to do? Should I add these venues, or did I misspell something?`
          }]
        });
        
        if (message.content[0].type === 'text') {
          claudeAssistance = message.content[0].text;
        }
      } catch (error) {
        console.error('Claude API error:', error);
      }
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
