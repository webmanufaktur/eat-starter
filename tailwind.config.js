/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.njk",
    "./src/**/*.html",
    "./src/**/*.md",
    "./src/**/*.js",
  ],
  theme: {
    extend: {
      screens: {
        xs: "375px",
      },
      // colors: {
      // brand: "#2480E6",
      // accent: "#e83561",
      // },
    },
  },
  // plugins: [require("@tailwindcss/typography")],
};
