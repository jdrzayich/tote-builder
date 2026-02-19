/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "ryg-navy": "rgb(18 43 78)",
        "ryg-white": "rgb(255 255 255)",
        "ryg-blue": "rgb(112 147 169)",
        "ryg-orange": "rgb(252 108 3)",
      },
    },
  },
  plugins: [],
};
