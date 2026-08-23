/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bio: {
          void: "#020617",
          panel: "#0B1220",
          line: "#1E293B",
          emerald: "#34D399",
          cyan: "#22D3EE",
          amber: "#FBBF24",
          red: "#F87171",
          rose: "#FB7185",
          muted: "#64748B",
          text: "#E2E8F0"
        }
      }
    }
  },
  plugins: []
};
