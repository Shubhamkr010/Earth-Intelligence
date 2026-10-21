/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        space: '#030303',
        panel: '#0a0c10',
        neon: {
          DEFAULT: '#22d3ee',
          dim: '#0891b2',
          glow: 'rgba(34, 211, 238, 0.45)',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 0 1px rgba(34,211,238,0.6), 0 0 18px rgba(34,211,238,0.45), 0 0 48px rgba(34,211,238,0.2)',
        'neon-soft': '0 0 0 1px rgba(34,211,238,0.25), 0 0 12px rgba(34,211,238,0.15)',
        panel: '0 10px 40px rgba(0,0,0,0.6)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.7)' },
        },
      },
      animation: {
        scan: 'scan 9s linear infinite',
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
