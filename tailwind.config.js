/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        structure: {
          light: '#86efac',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        program: {
          light: '#93c5fd',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        data: {
          light: '#fca5a5',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
      },
      animation: {
        breathe: 'breathe 4s ease-in-out infinite',
        'breathe-slow': 'breathe 6s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'bubble-rise': 'bubbleRise 12s linear infinite',
        'pulse-blob': 'pulseBlob 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        breathe: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.015)',
            opacity: '0.95',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-15px)',
          },
        },
        bubbleRise: {
          '0%': {
            transform: 'translateY(100vh) translateX(0) scale(0)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(-10vh) translateX(50px) scale(1)',
            opacity: '0',
          },
        },
        pulseBlob: {
          '0%, 100%': {
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            transform: 'scale(1) rotate(0deg)',
          },
          '50%': {
            borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
            transform: 'scale(1.08) rotate(2deg)',
          },
        },
        slideIn: {
          '0%': {
            transform: 'translateX(-10px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
