/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'indie-flower': ['"Indie Flower"', 'cursive'],
      },
      fontSize: {
        '16xl': '16rem', // Nowy rozmiar czcionki, dwukrotnie większy niż 9xl
      }
    },
  },
  plugins: [],
};