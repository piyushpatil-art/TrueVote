/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        neon: {
          purple: '#a78bfa',
          blue: '#60a5fa',
          pink: '#ec4899',
          cyan: '#22d3ee',
        },
        web3: {
          dark: '#0f0f1a',
          card: '#1a1a2e',
          border: '#2d2d44',
          accent: '#7c3aed',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'web3-gradient': 'linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 100%)',
        'glow-purple': 'radial-gradient(circle at 30% 50%, rgba(124, 58, 237, 0.3) 0%, transparent 50%)',
        'glow-blue': 'radial-gradient(circle at 70% 50%, rgba(37, 99, 235, 0.3) 0%, transparent 50%)',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow': '0 0 30px rgba(124, 58, 237, 0.4)',
        'glow-lg': '0 0 60px rgba(124, 58, 237, 0.5)',
        'glow-blue': '0 0 30px rgba(37, 99, 235, 0.4)',
        'glow-cyan': '0 0 30px rgba(34, 211, 238, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(124, 58, 237, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
