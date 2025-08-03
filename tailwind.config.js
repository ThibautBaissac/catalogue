/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f0f0f',
          card: '#1a1a1a',
          hover: '#2a2a2a',
          border: '#333333',
          text: {
            primary: '#ffffff',
            secondary: '#a3a3a3',
            muted: '#737373'
          }
        }
      }
    },
  },
  plugins: [],
};
