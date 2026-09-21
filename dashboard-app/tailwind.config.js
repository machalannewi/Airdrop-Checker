/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#000000",
          950: "#05060d",
          900: "#0b0c17",
          800: "#12142b",
          700: "#1b2140",
        },
        brand: {
          DEFAULT: "#2934ff",
          light: "#8aa5ff",
          dark: "#031457",
          soft: "rgba(41,52,255,0.12)",
        },
        muted: "rgba(230,236,255,0.7)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(96% 96% at 50% 7.5%, #121426 0%, #000000 100%)",
        "brand-glow":
          "radial-gradient(circle at 50% 50%, rgba(41,52,255,0.55) 0%, rgba(171,171,171,0) 100%)",
        "brand-glow-light":
          "radial-gradient(circle at 50% 50%, rgba(138,165,255,0.5) 0%, rgba(171,171,171,0) 100%)",
        "card-gradient": "linear-gradient(180deg, #12142b 0%, #0b0c17 100%)",
        "radial-dark": "radial-gradient(circle, #0b0c17, #05060d)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(41,52,255,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
