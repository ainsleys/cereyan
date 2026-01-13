import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const hasEmails = !!import.meta.env.ADMIN_EMAILS;
  const hasPassword = !!import.meta.env.ADMIN_PASSWORD;
  const hasGithub = !!import.meta.env.GITHUB_TOKEN;
  const hasClaude = !!import.meta.env.ANTHROPIC_API_KEY;
  
  return new Response(JSON.stringify({
    ADMIN_EMAILS: hasEmails,
    ADMIN_PASSWORD: hasPassword,
    GITHUB_TOKEN: hasGithub,
    ANTHROPIC_API_KEY: hasClaude,
    message: 'All four should be true for admin panel to work'
  }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
