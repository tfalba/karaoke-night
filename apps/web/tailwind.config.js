/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        neon: "0 0 20px rgba(236,72,153,.35), 0 0 60px rgba(34,211,238,.15)"
      }
    }
  },
  plugins: []
};

