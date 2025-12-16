/**
 * Tailwind CSS configuration for Cereyan
 * @see https://tailwindcss.com/docs/configuration
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand colors derived from the logo
        cereyan: {
          pink: '#E8A0D0',
          'pink-light': '#F2C4E3',
          'pink-dark': '#D080B8',
        },
        // Cinema-inspired dark palette
        cinema: {
          black: '#0A0A0A',      // Primary background
          darker: '#121212',     // Card backgrounds
          dark: '#1A1A1A',       // Secondary surfaces
          gray: '#2A2A2A',       // Borders
          'gray-light': '#3A3A3A', // Lighter borders
          text: '#E8E8E8',       // Primary text
          'text-muted': '#888888', // Secondary text
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      letterSpacing: {
        'widest-xl': '0.25em',
      },
    },
  },
  plugins: [],
};
