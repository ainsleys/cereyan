import type { APIRoute } from 'astro';

export const prerender = false;

const AUTHORIZED_EMAILS = (import.meta.env.ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase());
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || '';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(JSON.stringify({ authorized: false }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check both email and password
    const emailAuthorized = AUTHORIZED_EMAILS.includes(email.toLowerCase());
    const passwordCorrect = password === ADMIN_PASSWORD;
    const authorized = emailAuthorized && passwordCorrect;
    
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
