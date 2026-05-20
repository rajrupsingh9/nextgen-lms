/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#3b82f6",
          dark: "#1d4ed8",
        }
      }
    },
  },
  plugins: [],
}