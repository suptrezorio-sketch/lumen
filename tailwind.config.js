/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lumen: {
          black: '#1A1A1A',
          dark: '#2C2C2E',
          card: '#F5F5F7',
          accent: '#007AFF',
          success: '#30D158',
          warning: '#FF9F0A',
          danger: '#FF453A',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}