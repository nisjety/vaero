// tailwind.config.ts
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'weather-gradient': 'var(--weather-gradient)',
        'dawn-gradient': 'var(--dawn-gradient)',
        'night-gradient': 'var(--night-gradient)',
        'aurora-gradient': 'var(--aurora-gradient)',
      },
    },
  },
  plugins: [],
};
