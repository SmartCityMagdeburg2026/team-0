/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brick: '#D6492A',
        terracotta: '#C44D36',
        petrol: '#006080',
        sun: '#E98300',
        ink: '#542D24',
        page: '#F5F4F2',
        line: '#E8E8E8',
        muted: '#585858',
        body: '#383838',
      },
      fontFamily: {
        headline: ['Public Sans', 'system-ui', 'sans-serif'],
        body: ['Public Sans', 'system-ui', 'sans-serif'],
        label: ['Public Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '0.5rem', lg: '1rem', xl: '1.5rem', full: '9999px' },
    },
  },
  plugins: [],
}
