import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        rewaq: {
          dark: "#0c131f",
          darker: "#080c14",
          card: "#141d2e",
          border: "#1f2d47",
          gold: {
            DEFAULT: "#c5a059",
            light: "#dfb86c",
            dark: "#a6823c",
            50: "#fdfbf7",
            100: "#f9f4ea",
            500: "#c5a059",
            600: "#a6823c",
            700: "#87662c",
          },
          emerald: {
            DEFAULT: "#109e68",
            light: "#1dbf80",
            dark: "#0d7c52",
            50: "#f0fdf7",
            100: "#dcfce9",
            500: "#109e68",
            600: "#0d7c52",
            700: "#0a6140",
          }
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
