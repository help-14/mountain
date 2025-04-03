/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    colors: {
      'code': '#D3C6AA',
      'menu': '#849289',
      '900': '#21272B',
      '500': '#272E32',
      'active': '#90A672',
      'hover': '#31383C'
    },
    extend: {},
  },
  darkMode: 'media',
  plugins: [
    require('flowbite/plugin'),
    require('flowbite-typography'),
  ],
}