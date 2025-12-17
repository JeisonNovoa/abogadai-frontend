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
          DEFAULT: '#0b6dff',
          hover: '#0959d9',
          light: '#3d8aff',
          dark: '#0646b3',
        },
        cta: {
          DEFAULT: '#1b1b1b',
          hover: '#2b2b2b',
        },
        neutral: {
          100: '#ffffff',
          200: '#f6f6f6',
          300: '#ededed',
          400: '#cccccc',
          500: '#989898',
          600: '#575757',
          700: '#2b2b2b',
          800: '#080808',
          900: '#040e17',
        },
      },
    },
  },
  plugins: [],
}
