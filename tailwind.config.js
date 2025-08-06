/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'patriot-red': '#DC2626',
        'patriot-blue': '#1D4ED8',
        'patriot-navy': '#1E3A8A',
        'patriot-white': '#FFFFFF',
        'patriot-gray': '#F3F4F6',
      },
    },
  },
  plugins: [],
}

