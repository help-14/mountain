/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
  },
  darkMode: 'media',
  plugins: [
    require('flowbite/plugin'),
    require('flowbite-typography'),
  ],
}