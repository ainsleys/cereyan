import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

export const prerender = false;

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
        backgroundColor: '#FAFAFA',
        padding: '40px',
      },
      children: [
        // Logo circle with starburst
        {
          type: 'div',
          props: {
            style: {
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#C74B9B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px',
            },
            children: {
              type: 'div',
              props: {
                style: {
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#0A0A0A',
                },
              },
            },
          },
        },
        // Title
        {
          type: 'div',
          props: {
            style: {
              fontSize: '72px',
              fontWeight: 700,
              color: '#0A0A0A',
              letterSpacing: '8px',
              marginBottom: '20px',
            },
            children: 'CEREYAN',
          },
        },
        // Subtitle
        {
          type: 'div',
          props: {
            style: {
              fontSize: '28px',
              color: '#666666',
              fontStyle: 'italic',
              marginBottom: '30px',
            },
            children: 'İstanbul Film Takvimi',
          },
        },
        // Accent line
        {
          type: 'div',
          props: {
            style: {
              width: '300px',
              height: '4px',
              backgroundColor: '#C74B9B',
              borderRadius: '2px',
            },
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



