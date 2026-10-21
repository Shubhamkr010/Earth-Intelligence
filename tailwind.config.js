/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ocean: { 950: '#0A1C30', 900: '#0F2A45', 800: '#163A5C', 700: '#1F4A72' },
        frost: '#E8F0F4', mist: '#9DB3C2', citylight: '#F5A524',
        tide: '#5FA8C9', kelp: '#4CB88A', ember: '#FF6B4A', ice: '#BFE3F2',
      },
      fontFamily: {
        ui: ['Schibsted Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        data: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: { panel: '16px', card: '16px', control: '10px' },
    },
  },
  plugins: [],
}
