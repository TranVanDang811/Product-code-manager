/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochromatic Stealth Dark & Charcoal Gray (Đen xám tối giản hiện đại)
        brand: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        dark: {
          950: '#09090b', // True Matte Black (Zinc 950)
          900: '#121214', // Card surface / elevated
          850: '#141416', // Card surface
          800: '#1c1c1f', // Input & inner surface
          750: '#18181b', // Header / dropdown
          700: '#27272a', // Border (Zinc 800)
          650: '#3f3f46', // Border subtle
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        'dark-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'laser-scan': 'laserScan 2.2s ease-in-out infinite',
      },
      keyframes: {
        laserScan: {
          '0%, 100%': { top: '6%', opacity: '0.4' },
          '50%': { top: '92%', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};
