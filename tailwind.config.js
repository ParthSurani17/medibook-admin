/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b7d0ff",
          300: "#8bb0ff",
          400: "#5c8bff",
          500: "#3366ff",
          600: "#2050e6",
          700: "#1a3fb8",
          800: "#193a94",
          900: "#1a3576",
        },
        mint: {
          50: "#eafbf3",
          100: "#cdf5e3",
          200: "#9de9cb",
          300: "#66d8ac",
          400: "#3cc491",
          500: "#1fac79",
          600: "#158c62",
          700: "#136f51",
          800: "#125843",
          900: "#0f4738",
        },
        ink: {
          50: "#f6f7fb",
          100: "#eceef4",
          200: "#d7dae5",
          300: "#aab1c6",
          400: "#7c85a3",
          500: "#5b6280",
          600: "#434a66",
          700: "#333952",
          800: "#22263a",
          900: "#141726",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgba(20,23,38,0.06), 0 10px 30px -10px rgba(20,23,38,0.08)",
        card: "0 1px 2px rgba(20,23,38,0.04), 0 8px 24px -8px rgba(20,23,38,0.10)",
        lift: "0 20px 40px -16px rgba(26,63,184,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        pulseLine: {
          "0%,100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-4px)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        floatSlow: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        pulseLine: "pulseLine 2.4s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease-out both",
        floatSlow: "floatSlow 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
