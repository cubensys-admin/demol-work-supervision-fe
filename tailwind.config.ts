import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#0092D8',
          50: '#E6F5FC',
          100: '#B3E0F7',
          200: '#80CBF2',
          300: '#4DB6ED',
          400: '#26A4E3',
          500: '#0092D8',
          600: '#0082C2',
          700: '#006BA0',
          800: '#00547D',
          900: '#003D5A',
        },
        secondary: {
          DEFAULT: '#6c757d',
          600: '#5a6268',
        },
        blue: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#0071c2',
        },
        gray: {
          50: '#F7F7F7',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#D2D2D2',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        }
      },
      fontFamily: {
        pretendard: ['Pretendard Variable', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.4) 100%), url('/img/main_hero.jpg')",
      },
      backdropFilter: {
        'blur-20': 'blur(20px) brightness(100%)',
      },
      boxShadow: {
        'card': '2px 4px 20px rgba(0, 0, 0, 0.05)',
        'sidebar': '2px 4px 10px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
} satisfies Config;