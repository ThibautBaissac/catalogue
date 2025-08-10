/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/**/*.{html,js,ts,jsx,tsx}',
    './src/renderer/index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f0f0f',
        'dark-card': '#1a1a1a',
        'dark-hover': '#2a2a2a',
        'dark-border': '#333333',
        'dark-text-primary': '#ffffff',
        'dark-text-secondary': '#a3a3a3',
        'dark-text-muted': '#737373'
      }
    }
  },
  plugins: [],
};
