/**
 * Tailwind CSS configuration for Cereyan
 * Palette (Oct 2026 rebrand): black, evergreen, alabaster, terracotta, dark cyan.
 * @see https://tailwindcss.com/docs/configuration
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand colours
        cereyan: {
          red: '#F2542D',         // terracotta: grounds, large type, rules
          'red-light': '#F5765A',
          'red-dark': '#C9411F',  // terracotta for small text (4.9:1 on white)
          black: '#030303',
          green: '#0D3E2D',       // evergreen
          alabaster: '#EAE1DF',
          cyan: '#0E9594',
        },
        // Light theme surfaces, warmed toward alabaster
        surface: {
          DEFAULT: '#FFFFFF',     // Page background
          card: '#F7F2F0',        // Card background
          muted: '#EAE1DF',       // Secondary surfaces (alabaster)
        },
        border: {
          DEFAULT: '#D9CFCC',
          light: '#EAE1DF',
        },
        text: {
          DEFAULT: '#030303',     // Primary text
          muted: '#5C5452',       // Secondary text
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      letterSpacing: {
        'widest-xl': '0.25em',
        brand: '0.22em',
      },
    },
  },
  plugins: [],
};
