/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand colors from the logo
        cereyan: {
          pink: '#E8A0D0',
          'pink-light': '#F2C4E3',
          'pink-dark': '#D080B8',
        },
        // Cinema-inspired dark palette
        cinema: {
          black: '#0A0A0A',
          darker: '#121212',
          dark: '#1A1A1A',
          gray: '#2A2A2A',
          'gray-light': '#3A3A3A',
          text: '#E8E8E8',
          'text-muted': '#888888',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      letterSpacing: {
        'widest-xl': '0.25em',
      }
    },
  },
  plugins: [],
}

