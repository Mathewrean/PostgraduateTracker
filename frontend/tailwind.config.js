/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['attribute', 'data-theme'], // Enable dark mode via data-theme attribute
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        // JOOUST Colors - using CSS variables for theming
        'primary': 'var(--color-primary)',
        'accent': 'var(--color-accent)',
        'bg-primary': 'var(--bg-main)',
        'bg-secondary': 'var(--bg-surface)',
        'bg-tertiary': 'var(--bg-muted)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border-primary': 'var(--border-color)',
        'border-secondary': 'var(--border-color)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'danger': 'var(--color-danger)',
        'brand': 'var(--color-brand)',
      },
    },
  },
  plugins: [],
}
