/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f6741b',
          50: '#fef5ed',
          100: '#fde8d4',
          200: '#facda8',
          300: '#f6a871',
          400: '#f6741b',
          500: '#f35a0a',
          600: '#e44205',
          700: '#bc3008',
          800: '#95280d',
          900: '#78240e',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

