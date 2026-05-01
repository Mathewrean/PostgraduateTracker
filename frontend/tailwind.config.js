/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via class strategy
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        // JOOUST Primary Colors - using CSS variables for theming
        'jooust-primary': 'var(--jooust-primary)',
        'jooust-secondary': 'var(--jooust-secondary)',
        // Neutral colors
        'jooust-bg': 'var(--jooust-bg)',
        'jooust-bg-alt': 'var(--jooust-bg-alt)',
        'jooust-text': 'var(--jooust-text)',
        'jooust-border': 'var(--jooust-border)',
      },
    },
  },
  plugins: [],
}
