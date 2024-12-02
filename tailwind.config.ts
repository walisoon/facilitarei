import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas para tema claro
        light: {
          primary: '#4F46E5', // indigo-600
          background: '#F9FAFB', // gray-50
          surface: '#FFFFFF',
          border: '#E5E7EB', // gray-200
          text: {
            primary: '#111827', // gray-900
            secondary: '#6B7280', // gray-500
          },
        },
        // Cores personalizadas para tema escuro
        dark: {
          primary: '#6366F1', // indigo-500
          background: '#111827', // gray-900
          surface: '#1F2937', // gray-800
          border: '#374151', // gray-700
          text: {
            primary: '#F9FAFB', // gray-50
            secondary: '#9CA3AF', // gray-400
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
