import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cr: {
          red: '#E30613',
          dark: '#1a1a2e',
        },
      },
    },
  },
  plugins: [],
};

export default config;
