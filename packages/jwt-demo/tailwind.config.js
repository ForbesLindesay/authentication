const {colors, screens} = require('tailwindcss/defaultTheme');

module.exports = {
  purge: ['./src/**/*.ejs', './src/**/*.tsx', './src/**/*.ts'],

  theme: {
    container: {
      center: true,
      padding: '5vw',
      screens: {xl: screens.xl},
    },
  },

  variants: {
    display: [
      'responsive',
      'hover',
      'focus',
      'group-focus-within',
      'group-focus',
    ],
  },
  plugins: [require('tailwindcss-interaction-variants')],
};
