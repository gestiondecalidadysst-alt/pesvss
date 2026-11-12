/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Marca
        brand: {
          DEFAULT: '#0F766E', // teal petróleo
          dark: '#115E59',
          soft: '#CCFBF1',
        },
        info: '#2563EB', // azul de datos y enlaces
        // Estados (semáforo de cumplimiento) — solo para estados
        estado: {
          cumple: '#15803D',
          progreso: '#B45309',
          vencido: '#B91C1C',
          noaplica: '#64748B',
        },
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
