/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'radial-dark': 'radial-gradient(circle, #0d1b2a, #1b263b)',
        'radial-dark-2': 'radial-gradient(circle, #1b263b, #415a77)',
      },
    },
  },
  plugins: [],
}

