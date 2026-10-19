import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

export const prerender = false;

// Social share image: the wordmark on the terracotta ground.
export const GET: APIRoute = async () => {
  const html = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#F2542D',
        padding: '40px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: '120px',
              fontWeight: 700,
              color: '#EAE1DF',
              letterSpacing: '26px',
              marginLeft: '26px',
              marginBottom: '28px',
            },
            children: 'CEREYAN',
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: '26px',
              color: '#030303',
              letterSpacing: '6px',
              textTransform: 'uppercase',
            },
            children: 'İstanbul · Sinema Takvimi',
          },
        },
      ],
    },
  };

  return new ImageResponse(html, {
    width: 1200,
    height: 630,
  });
};
