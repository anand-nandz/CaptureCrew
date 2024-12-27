// const { nextui } = require("@nextui-org/react");
import { nextui } from "@nextui-org/react";

export default {
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
        'custom-button': {
          DEFAULT: '#000000', // Black
          hover: '#1a1a1a',  // Slightly lighter black for hover
        },
        'custom-radio': {
          DEFAULT: '#000000',
          selected: '#000000',
          hover: '#f9fafb',
        },
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
        fadeTransition: {
          '0%': { opacity: '0' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        // swing: {
        //   '0%': { transform: 'rotate(10deg)' },
        //   '100%': { transform: 'rotate(-10deg)' }
        // },
        // swinghair: {
        //   '0%': { transform: 'rotate(6deg)' },
        //   '100%': { transform: 'rotate(-6deg)' }
        // }
      },
      animation: {
        fadeIn: 'fadeIn 2s ease-in forwards',
        slideIn: 'slideIn 1.5s ease-in forwards',
        BgAnimation: 'BgAnimation 10s linear infinite',
        fadeTransition: 'fadeTransition 1s ease-in-out',
        // swing: 'swing ease-in-out 1.3s infinite alternate',
        // swinghair: 'swinghair ease-in-out 1.3s infinite alternate'
        
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#000000",
            },
          },
        },
      },
    })],
}