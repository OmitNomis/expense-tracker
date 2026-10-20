/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFD600",
        "primary-hover": "#E6C200",
        secondary: "#666666",
        yellow: "#FFD600",
        "yellow-dark": "#E6C200",
        cream: "#FFFDF7",
      },
      spacing: {
        section: "2rem",
      },
      borderRadius: {
        container: "0.5rem",
      },
      fontFamily: {
        sans: [
          "Inter Variable",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
      },
      boxShadow: {
        'brutal': '8px 8px 0px 0px #000000',
        'brutal-sm': '4px 4px 0px 0px #000000',
      },
    },
  },
  plugins: [],
}
