/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'open-sans': ['"Open Sans Variable"', 'sans-serif'],
        'poppins': ['Poppins', '"Open Sans Variable"', 'sans-serif'],
      },
      colors: {
        green: {
          '50': '#fafaeb',
          '100': '#f1f4d3',
          '200': '#e4eaac',
          '300': '#d0db7b',
          DEFAULT: '#b6c649',
          '500': '#9dae34',
          '600': '#7a8a26',
          '700': '#5d6a21',
          '800': '#4b551f',
          '900': '#40491e',
          '950': '#21270c',
        },
        red: {
          '50': '#fdf3f3',
          '100': '#fce4e4',
          '200': '#facece',
          '300': '#f5acac',
          '400': '#ec7d7d',
          DEFAULT: '#e46767',
          '600': '#cc3636',
          '700': '#ac2929',
          '800': '#8e2626',
          '900': '#772525',
          '950': '#400f0f',
        },
        blue: {
          '50': '#effefd',
          '100': '#c9fef9',
          '200': '#92fdf4',
          '300': '#54f4ed',
          '400': '#21e0dd',
          DEFAULT: '#07b0b0',
          '600': '#039b9e',
          '700': '#077b7e',
          '800': '#0b6064',
          '900': '#0f4f52',
          '950': '#012e32',
        },

        orange: {
          '50': '#fef8ec',
          '100': '#fceac9',
          '200': '#f9d38e',
          '300': '#f7b652',
          DEFAULT: '#f49a25',
          '500': '#ee7a12',
          '600': '#d2580d',
          '700': '#af3b0e',
          '800': '#8e2e12',
          '900': '#752712',
          '950': '#431105',
        },
        brown: {
          '50': '#f7f6ef',
          '100': '#ebead6',
          '200': '#d8d5b0',
          '300': '#c1ba83',
          '400': '#aea261',
          '500': '#9f9053',
          '600': '#897645',
          DEFAULT: '#6e5b3a',
          '800': '#5e4d35',
          '900': '#524231',
          '950': '#2b2118',
        },
        light: '#F6F2EF',
        dark: '#2b2118',
        select: '#DACBBE',

      }
    },
  },
  daisyui: {
    themes: [
      {
        wortkuppler: {
          "primary": "#2b2118",
          "secondary": "#F6F2EF",
          "info": "#07b0b0",
          "success": "#b6c649",
          "warning": "#f49a25",
          "error": "#e46767",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
}
