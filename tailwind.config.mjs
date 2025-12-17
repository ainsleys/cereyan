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
        // Brand accent color
        cereyan: {
          pink: '#C74B9B',
          'pink-light': '#D86AAF',
          'pink-dark': '#A33D80',
        },
        // Light theme palette
        surface: {
          DEFAULT: '#FFFFFF',     // Page background
          card: '#F9FAFB',        // Card background (subtle gray)
          muted: '#F3F4F6',       // Secondary surfaces
        },
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        },
        text: {
          DEFAULT: '#171717',     // Primary text
          muted: '#737373',       // Secondary text
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
