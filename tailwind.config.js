/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#FFE4E6',
        'baby-blue': '#DBEAFE',
        'mint-green': '#D1FAE5',
        'soft-lavender': '#EDE9FE',
        'warm-cream': '#FEF7CD',
        'rose-soft': '#F43F5E',
        'blue-soft': '#60A5FA',
        'green-soft': '#34D399',
        'purple-soft': '#A78BFA',
        'yellow-soft': '#FBBF24',
      },
      fontFamily: {
        'nunito': ['Nunito', 'sans-serif'],
        'quicksand': ['Quicksand', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'dancing-script': ['Dancing Script', 'cursive'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
};
