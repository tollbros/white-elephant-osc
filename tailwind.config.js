const tailwindConfig = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cranberryMist: {
          DEFAULT: '#E07A93', // Lighter Cranberry
        },
        softEvergreen: {
          DEFAULT: '#8FAF9C', // Lighter Green
        },
        goldenGlow: {
          DEFAULT: '#F3C77A', // Lighter Gold
        },
        icyBlue: {
          DEFAULT: '#C7E2F0', // Lighter Blue
        },
        lavenderHaze: {
          DEFAULT: '#B89BC6', // Lighter Purple
          
        },
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;