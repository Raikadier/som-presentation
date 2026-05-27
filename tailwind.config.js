/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'deep': '#04040f',
        'surface': '#0d0d2b',
        'card': '#13133a',
        'primary': '#6366f1',
        'secondary': '#8b5cf6',
        'accent': '#f59e0b',
        'classA': '#10b981',
        'classB': '#f43f5e',
        'dead': '#475569',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
