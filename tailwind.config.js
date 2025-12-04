/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Fraunces', 'serif'],
        'body': ['Outfit', 'sans-serif'],
      },
      colors: {
        // Cloud Vibes Palette - Soft Pink Dominant
        'cloud-white': '#FDF5F7',
        'cloud-dark': '#4A3540',
        'cloud-pink': '#E8A0B5',
        'cloud-blue': '#B8D4E8',
        'cloud-lavender': '#C5B4D6',
        'cloud-blush': '#F5C6D6',
        // Legacy names for easier migration
        cream: '#FDF5F7',
        espresso: '#4A3540',
        blush: '#B8D4E8',
        coral: '#E8A0B5',
        sage: '#C5B4D6',
        gold: '#F5C6D6',
      },
    },
  },
  plugins: [],
}
