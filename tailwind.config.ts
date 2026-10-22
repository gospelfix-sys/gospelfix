import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        gf: {
          bg: 'var(--gf-bg)',
          white: 'var(--gf-white)',
          black: 'var(--gf-black)',
          gray1: 'var(--gf-gray1)',
          gray2: 'var(--gf-gray2)',
          gray3: 'var(--gf-gray3)',
          border: 'var(--gf-border)',
          orange: 'var(--gf-orange)',
          orange2: 'var(--gf-orange2)',
          'orange-bg': 'var(--gf-orange-bg)',
          line: 'var(--gf-line)',
          surface: 'var(--gf-surface)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: '0.5rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['var(--font-kr)', 'Pretendard', 'sans-serif'],
        en: ['var(--font-en)', 'DM Sans', 'sans-serif'],
        kr: ['var(--font-kr)', 'Pretendard', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      animation: {
        ticker: 'ticker 24s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
