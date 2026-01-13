import type { APIRoute } from 'astro';

export const prerender = false;

// Add authorized emails here
const AUTHORIZED_EMAILS = (import.meta.env.ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase());

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({ authorized: false }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const authorized = AUTHORIZED_EMAILS.includes(email.toLowerCase());
    
    return new Response(JSON.stringify({ authorized }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ authorized: false, error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
