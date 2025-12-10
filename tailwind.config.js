/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-red': '#F8A8A8',
        'pastel-yellow': '#FFE08C',
        'pastel-blue': '#A8D8F8',
        'soft-black': '#4A4A4A',
        'cream': '#FFFDD0', // Keeping cream as a potential background variant
        'white': '#FFFFFF',
      },
      fontFamily: {
        'sans': ['"Gamja Flower"', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
