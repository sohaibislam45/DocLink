/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          primary: "rgb(var(--bg-primary) / <alpha-value>)",
          secondary: "rgb(var(--bg-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--bg-tertiary) / <alpha-value>)",
        },
        accent: {
          primary: "rgb(var(--accent-primary) / <alpha-value>)",
          secondary: "rgb(var(--accent-secondary) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}
