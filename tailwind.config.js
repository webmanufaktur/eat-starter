/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.njk", "./src/**/*.html", "./src/**/*.md", "./*.js"],
  theme: {
    extend: {
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
