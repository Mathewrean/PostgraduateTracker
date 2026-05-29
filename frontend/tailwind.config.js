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
        'display': ['var(--font-display)'],
        'sans': ['var(--font-sans)'],
      },
      colors: {
        // JOOUST Colors - using CSS variables for theming
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'accent': 'var(--color-accent)',
        'bg-primary': 'var(--bg-main)',
        'bg-secondary': 'var(--bg-surface)',
        'bg-tertiary': 'var(--bg-muted)',
        'bg-elevated': 'var(--bg-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',
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
