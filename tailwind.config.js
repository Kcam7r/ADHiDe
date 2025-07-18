/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'indie-flower': ['"Indie Flower"', 'cursive'],
      },
    },
  },
  plugins: [],
};