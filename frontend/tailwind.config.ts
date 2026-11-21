import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080D18",
        "background-secondary": "#101827",
        card: "#141F30",
        "card-hover": "#18263D",
        primary: {
          DEFAULT: "#3988FF",
          hover: "#2572E8",
          subtle: "#1D3B6C",
        },
        accent: {
          DEFAULT: "#35D5E8",
          hover: "#27B4C5",
          subtle: "#0E3847",
        },
        slate: {
          main: "#F1F5F9",
          muted: "#94A3B8",
          subtle: "#64748B",
          border: "#1E2B42",
          "border-subtle": "#162235",
        },
        threat: {
          safe: "#22C55E",
          "safe-bg": "rgba(34, 197, 94, 0.12)",
          warning: "#F59E0B",
          "warning-bg": "rgba(245, 158, 11, 0.12)",
          danger: "#EF4444",
          "danger-bg": "rgba(239, 68, 68, 0.12)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          "Consolas",
          '"Liberation Mono"',
          "Menlo",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
