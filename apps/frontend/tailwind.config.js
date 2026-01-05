/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff4ff',
          100: '#dbe7ff',
          200: '#b6cfff',
          300: '#86aeff',
          400: '#5585ff',
          500: '#3b66f5',
          600: '#2c4fd8',
          700: '#2440ae',
          800: '#223b8c',
          900: '#1f356f',
        },
      },
    },
  },
  plugins: [],
};
