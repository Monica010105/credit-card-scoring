/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        approve: '#10b981', // green-500
        review: '#f59e0b', // amber-500
        reject: '#ef4444', // red-500
      }
    },
  },
  plugins: [],
}
