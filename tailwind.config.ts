export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: ['bg-emerald-100', 'bg-rose-100', 'bg-amber-100', 'bg-slate-100', 'bg-indigo-100', 'bg-purple-100', 'bg-pink-100', 'bg-orange-100', 'bg-blue-100'],
  theme: {
    extend: {
      fontFamily: {
        handwriting: ['"Patrick Hand"', "cursive"],
        nunito: ['"Nunito"', "sans-serif"],
      },
    },
  },
  plugins: [],
};