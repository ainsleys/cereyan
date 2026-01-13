import type { APIRoute } from 'astro';
import { Octokit } from '@octokit/rest';

export const prerender = false;

const AUTHORIZED_EMAILS = (import.meta.env.ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase());
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || '';

const VENUE_MAP: Record<string, string> = {
  'AKM Salonu': 'akm-salonu',
  'Sinematek': 'sinematek',
  'İstanbul Modern': 'istanbul-modern',
  'Pera Müzesi': 'pera-muzesi',
  'Atlas 1948': 'atlas-1948',
  'Kadıköy Sineması': 'kadikoy-sinemasi',
  'Fransız Kültür': 'fransiz-kultur',
  'Beyoğlu Sineması': 'beyoglu-sinemasi',
  'Robinson Crusoe 389': 'robinson-crusoe-389',
  '23,5 Hrant Dink Hafıza Mekânı': 'hrant-dink-hafiza',
  'Farklı Mekanlar': 'various'
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, auth, action, changes, newScreening } = await request.json();
    
    // Verify auth
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
    
    // GitHub setup
    const octokit = new Octokit({ auth: import.meta.env.GITHUB_TOKEN });
    const owner = 'ainsleys';
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
    let screenings = JSON.parse(
      Buffer.from(currentFile.content, 'base64').toString('utf-8')
    );
    
    let commitMessage = '';
    
    // Apply changes based on action
    if (action === 'edit' && changes && changes.length > 0) {
      for (const change of changes) {
        const idx = screenings.findIndex((s: any) => s.id === change.id);
        if (idx !== -1) {
          screenings[idx][change.field] = change.newValue;
        }
      }
      commitMessage = `Edit: ${changes.map((c: any) => c.field).join(', ')} via admin chat`;
      
    } else if (action === 'delete' && changes && changes.length > 0) {
      for (const change of changes) {
        screenings = screenings.filter((s: any) => s.id !== change.id);
      }
      commitMessage = `Delete screening via admin chat`;
      
    } else if (action === 'add' && newScreening) {
      // Generate ID
      const maxId = screenings.length > 0 ? Math.max(...screenings.map((s: any) => parseInt(s.id) || 0)) : 0;
      const newId = String(maxId + 1);
      
      const screening = {
        id: newId,
        date: newScreening.date,
        filmTitle: newScreening.filmTitle,
        time: newScreening.time || '',
        venue: newScreening.venue || '',
        venueId: VENUE_MAP[newScreening.venue] || 'various',
        eventSeries: newScreening.eventSeries || '',
        link: newScreening.link || '',
        director: newScreening.director || '',
        year: newScreening.year || null,
        runtime: newScreening.runtime || null,
        isCereyanSelect: newScreening.isCereyanSelect || false
      };
      
      screenings.push(screening);
      commitMessage = `Add: ${newScreening.filmTitle} on ${newScreening.date} via admin chat`;
      
    } else if (action === 'toggle_select' && changes && changes.length > 0) {
      for (const change of changes) {
        const idx = screenings.findIndex((s: any) => s.id === change.id);
        if (idx !== -1) {
          screenings[idx].isCereyanSelect = !screenings[idx].isCereyanSelect;
        }
      }
      commitMessage = `Toggle Cereyan Select via admin chat`;
      
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action or missing data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create commit
    const newContent = Buffer.from(JSON.stringify(screenings, null, 2)).toString('base64');
    
    const { data: commit } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: commitMessage,
      content: newContent,
      sha: currentFile.sha,
      branch
    });
    
    return new Response(JSON.stringify({
      success: true,
      commitSha: commit.commit.sha,
      message: commitMessage
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Apply error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Apply failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
