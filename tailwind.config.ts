/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "rgb(var(--ryg-navy) / <alpha-value>)",
          slate: "rgb(var(--ryg-slate) / <alpha-value>)",
          orange: "rgb(var(--ryg-orange) / <alpha-value>)",
          white: "rgb(var(--ryg-white) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
