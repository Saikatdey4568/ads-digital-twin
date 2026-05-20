/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00f5ff',
        'neon-blue': '#0080ff',
        'neon-green': '#39ff14',
        'panel': '#0a0e1a',
        'panel-light': '#0d1224',
        'panel-border': '#1a2744',
        'sidebar': '#080c18',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Rajdhani', 'Orbitron', 'sans-serif'],
      }
    }
  },
  plugins: [],
}



