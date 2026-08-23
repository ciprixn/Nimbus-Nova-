/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit Variable", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        bio: {
          void: "#09090B",
          panel: "#101012",
          line: "#232326",
          emerald: "#34D399",
          rose: "#FB7185",
          amber: "#FBBF24",
        },
      },
      },
      animation: {
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
      },
    },
  },
  plugins: [],
};
