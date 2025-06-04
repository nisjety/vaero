/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Norwegian Weather Color Palette
        'weather-purple': '#5B46BF',
        'weather-dusk': '#2E2B85',
        'weather-mist': '#8B9DC3',
        'weather-snow': '#F8FAFC',
        'weather-storm': '#1E293B',
        'weather-aurora': '#059669',
        'weather-sunset': '#F59E0B',
        
        // Semantic colors
        primary: {
          50: '#F0F0FF',
          100: '#E0E0FF',
          200: '#C7C7FF',
          300: '#A3A3FF',
          400: '#7575FF',
          500: '#5B46BF',
          600: '#4A37A0',
          700: '#3A2B80',
          800: '#2E2B85',
          900: '#1E1B5C',
        },
        muted: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      backgroundImage: {
        'weather-gradient': 'linear-gradient(135deg, #5B46BF 0%, #2E2B85 100%)',
        'dawn-gradient': 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
        'night-gradient': 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        'aurora-gradient': 'linear-gradient(135deg, #059669 0%, #0891B2 50%, #5B46BF 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        'weather': '1rem',
        'weather-lg': '1.5rem',
        'weather-xl': '2rem',
      },
      backdropBlur: {
        'weather': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'weather': '0 4px 20px rgba(91, 70, 191, 0.1)',
        'weather-lg': '0 8px 30px rgba(91, 70, 191, 0.15)',
      },
    },
  },
  plugins: [],
};
