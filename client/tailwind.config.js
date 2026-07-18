/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Sleek OLED dark background
        card: '#18181b', // Zinc card background
        accent: {
          primary: '#6366f1', // Indigo accent
          secondary: '#a855f7', // Purple accent
          success: '#10b981', // Emerald
          warning: '#f59e0b', // Amber
          error: '#ef4444' // Rose
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
