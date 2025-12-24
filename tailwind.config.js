/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Sophisticated Palette
        'pastel-red': '#FF8A8A', // Slightly more vibrant/warm red for Toma
        'pastel-yellow': '#FFD56B', // More golden/warm yellow for Chie
        'pastel-blue': '#8AC6FF', // Clearer sky blue for Belle
        'mint-bg': '#D2F9F2', // User requested base background
        'soft-black': '#374151', // Cool gray-black (Gray 700)
        'cream': '#FFFDF5', // Warmer cream
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
