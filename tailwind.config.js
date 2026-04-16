/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // We use class for dark mode explicitly
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        card: 'var(--card)',
        border: 'var(--border)',
        textMain: 'var(--text-main)',
        textMuted: 'var(--text-muted)',
        sidebar: 'var(--sidebar)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          foreground: 'var(--primary-text)',
        },
        secondary: {
          DEFAULT: '#27272a',
          hover: '#3f3f46',
        },
        accent: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#059669', // emerald-600
        },
        destructive: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
        },
        muted: {
          DEFAULT: '#a1a1aa', // zinc-400
          hover: '#d4d4d8', // zinc-300
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
