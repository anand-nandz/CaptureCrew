const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        lemon: ['Lemon', 'sans-serif'],
        'judson': ['Judson', 'serif'],
      },
      boxShadow: {
        'custom': '10px 10px 10px rgba(0, 0, 0, 0.25)',
      },
      colors: {
        primary: '#0072F5',
        secondary: '#9750DD',
        warning: '#F5A524',
        danger: '#FF5630',
        success: '#17C964',
        'navbar-dark': '#1a202c',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        BgAnimation: {
          '0%': { backgroundImage: "url('/images/home1.jpg')" },
          '30%': { backgroundImage: "url('/images/home2.jpg')" },
          '60%': { backgroundImage: "url('/images/home3.jpg')" },
          '100%': { backgroundImage: "url('/images/home4.jpg')" },
        },
      },
      animation: {
        fadeIn: 'fadeIn 2s ease-in forwards',
        slideIn: 'slideIn 1.5s ease-in forwards',
        BgAnimation: 'BgAnimation 10s linear infinite',
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
}