import type { APIRoute } from 'astro';
import { Octokit } from '@octokit/rest';

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
    const { email, auth, csvData } = await request.json();
    
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
    
    if (!import.meta.env.GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: 'GitHub token not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse CSV and generate screenings
    const lines = csvData.trim().split('\n');
    const dataLines = lines.slice(1).filter((line: string) => line.trim());
    
    const dates: string[] = [];
    const screenings: any[] = [];
    let id = 1; // Will be updated after fetching existing
    
    for (const line of dataLines) {
      const fields = parseCSVLine(line);
      const [tarih, gosterim, gosterimEn, saat, mekan, etkinlik, link, yonetmen, yil, sure, star] = fields;
      
      if (!tarih || !gosterim) continue;
      
      const date = parseDate(tarih);
      dates.push(date);
      
      const screening: any = {
        id: String(id++),
        date,
        filmTitle: gosterim,
        time: saat || '',
        venue: mekan,
        venueId: VENUE_MAP[mekan] || 'various',
        eventSeries: etkinlik || '',
        link: link || ''
      };
      
      if (gosterimEn) screening.filmTitleEn = gosterimEn;
      if (yonetmen) screening.director = yonetmen;
      if (yil && !isNaN(parseInt(yil))) screening.year = parseInt(yil);
      if (sure && !isNaN(parseInt(sure))) screening.runtime = parseInt(sure);
      if (star === 'X') screening.isCereyanSelect = true;
      
      screenings.push(screening);
    }
    
    dates.sort();
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    
    // GitHub API setup
    const octokit = new Octokit({ auth: import.meta.env.GITHUB_TOKEN });
    const owner = 'ainsleys'; // TODO: Make this configurable
    const repo = 'cereyan';
    const branch = 'main';
    const filePath = 'src/data/screenings.json';
    
    // Get current file
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch
    });
    
    if (!('content' in currentFile)) {
      throw new Error('Could not read screenings.json');
    }
    
    // Decode current screenings
    const existingScreenings = JSON.parse(
      Buffer.from(currentFile.content, 'base64').toString('utf-8')
    );
    
    // Filter out screenings in the date range
    const filtered = existingScreenings.filter((s: any) => {
      return !(s.date >= minDate && s.date <= maxDate);
    });
    
    // Generate new IDs
    const maxId = filtered.length > 0 ? Math.max(...filtered.map((s: any) => parseInt(s.id))) : 0;
    screenings.forEach((s, i) => {
      s.id = String(maxId + i + 1);
    });
    
    // Merge
    const merged = [...filtered, ...screenings];
    
    // Create commit
    const newContent = Buffer.from(JSON.stringify(merged, null, 2)).toString('base64');
    
    const { data: commit } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `Update ${minDate} to ${maxDate} (${screenings.length} screenings) via admin panel`,
      content: newContent,
      sha: currentFile.sha,
      branch
    });
    
    // Vercel will auto-deploy from the push
    
    return new Response(JSON.stringify({
      success: true,
      commitSha: commit.commit.sha,
      screeningsAdded: screenings.length,
      dateRange: `${minDate} to ${maxDate}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Deploy error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Deployment failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
