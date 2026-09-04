import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#14181F",
        slate: {
          DEFAULT: "#1D2330",
          light: "#242B3B",
        },
        grid: "#2B3242",
        ink: {
          DEFAULT: "#E7EAF0",
          dim: "#8992A6",
          faint: "#5B6479",
        },
        signal: {
          amber: "#E8A93B",
          red: "#E5484D",
          green: "#3DBE8B",
          blue: "#4C8DFF",
          violet: "#9B7BE0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        none: "none",
      },
      backgroundImage: {
        "tick-row":
          "repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(139,146,166,0.14) 39px, rgba(139,146,166,0.14) 40px)",
      },
      keyframes: {
        pulse-dot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
