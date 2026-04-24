/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Surface palette - dark-first
        surface: {
          950: '#0B0D10',  // page background
          900: '#11141A',  // raised panels
          800: '#171B22',  // inner cards
          700: '#1F242C',  // hover
          600: '#2A3039',  // borders
          500: '#3A414C',
        },
        ink: {
          50: '#F5F7FA',   // primary text
          200: '#C4CAD3',  // secondary
          400: '#8A919C',  // tertiary
          600: '#5A6169',  // muted
        },
        accent: {
          DEFAULT: '#378ADD',
          soft: '#1E3A5F',
        },
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset',
      },
      animation: {
        'fade-in':   'fadeIn 200ms ease-out',
        'slide-up':  'slideUp 260ms cubic-bezier(0.2, 0.9, 0.3, 1)',
        'skeleton':  'shimmer 1.8s ease-in-out infinite',
        'toast-in':  'toastIn 220ms cubic-bezier(0.2, 0.9, 0.3, 1)',
        'stagger-1': 'slideUp 240ms cubic-bezier(0.2,0.9,0.3,1) both',
        'stagger-2': 'slideUp 240ms 40ms cubic-bezier(0.2,0.9,0.3,1) both',
        'stagger-3': 'slideUp 240ms 80ms cubic-bezier(0.2,0.9,0.3,1) both',
        'stagger-4': 'slideUp 240ms 120ms cubic-bezier(0.2,0.9,0.3,1) both',
        'stagger-5': 'slideUp 240ms 160ms cubic-bezier(0.2,0.9,0.3,1) both',
        'stagger-6': 'slideUp 240ms 200ms cubic-bezier(0.2,0.9,0.3,1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%':   { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        toastIn: {
          '0%':   { opacity: 0, transform: 'translateY(6px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
