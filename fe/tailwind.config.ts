import type { Config } from 'tailwindcss'
// FIX: Replaced require with an ES module import to resolve TypeScript error.
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#f26306',
          hover: '#e1430d',
          dark: '#c83a0b',
        }
      },
      animation: {
        'fade-in': 'fade-in 1s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'accordion-down': {
          'from': { height: '0px' },
          'to': { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          'from': { height: 'var(--radix-accordion-content-height)' },
          'to': { height: '0px' },
        },
      }
    },
  },
  plugins: [
    typography,
  ],
}
export default config