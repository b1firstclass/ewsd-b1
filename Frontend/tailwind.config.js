/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#01558a',
          dark: '#013d5f',
          light: '#026fa8',
        },
      },
    },
  },
  plugins: [],
}
