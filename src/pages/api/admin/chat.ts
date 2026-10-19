import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

const AUTHORIZED_EMAILS = (import.meta.env.ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase());
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || '';

// Read screenings data
function getScreenings(): any[] {
  try {
    const filePath = path.join(process.cwd(), 'src/data/screenings.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading screenings:', error);
    return [];
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, auth, message } = await request.json();
    
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
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiKey = import.meta.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get current screenings
    const screenings = getScreenings();
    
    // Format screenings for Claude (last 3 months only to keep prompt smaller)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentScreenings = screenings.filter(s => new Date(s.date) >= threeMonthsAgo);
    
    const screeningsList = recentScreenings.map(s => 
      `ID: ${s.id} | ${s.date} ${s.time} | "${s.filmTitle}" | ${s.venue} | Director: ${s.director || 'N/A'} | Year: ${s.year || 'N/A'} | Select: ${s.isCereyanSelect ? 'Yes' : 'No'}`
    ).join('\n');
    
    const anthropic = new Anthropic({ apiKey });
    
    const systemPrompt = `You are an assistant for Cereyan, an Istanbul film calendar website. You help admins manage film screenings.

CURRENT SCREENINGS (last 3 months):
${screeningsList}

You can help with:
1. EDIT - Change details of existing screenings (director, year, time, venue, title, etc.)
2. DELETE - Remove a screening
3. ADD - Add a new screening
4. TOGGLE SELECT - Mark/unmark as Cereyan Select
5. QUERY - Answer questions about the data

When proposing changes, respond with JSON in this exact format:
{
  "action": "edit" | "delete" | "add" | "toggle_select" | "query",
  "explanation": "Human readable explanation of what you'll do",
  "changes": [
    {
      "id": "screening-id",  // Required for edit/delete/toggle_select
      "field": "fieldName",  // For edit: which field to change
      "oldValue": "...",     // For edit: current value
      "newValue": "..."      // For edit/add: new value
    }
  ],
  "newScreening": {  // Only for "add" action
    "date": "YYYY-MM-DD",
    "filmTitle": "...",
    "time": "HH:MM",
    "venue": "...",
    "director": "...",
    "year": 2024,
    "isCereyanSelect": false
  }
}

For queries that don't require changes, respond with:
{
  "action": "query",
  "explanation": "Your answer here",
  "changes": []
}

Be precise. Match screening IDs exactly. If you can't find a screening, say so.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: message
      }]
    });
    
    let claudeResponse = '';
    if (response.content[0].type === 'text') {
      claudeResponse = response.content[0].text;
    }
    
    // Try to parse as JSON
    let parsed = null;
    try {
      // Extract JSON from response (Claude might include markdown code blocks)
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If not valid JSON, just return the text
    }
    
    return new Response(JSON.stringify({
      response: claudeResponse,
      parsed,
      screeningsCount: recentScreenings.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
