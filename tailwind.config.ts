import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-soft": "var(--surface-soft)",
        border: "var(--border)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        primary: "var(--primary)",
        "primary-tint": "var(--primary-tint)",
        analysis: "var(--analysis)",
        cta: "var(--cta)",
        success: "var(--success)",
        warning: "var(--warning)",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Inter"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        control: "10px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,24,40,.05), 0 1px 3px rgba(16,24,40,.04)",
        elevated: "0 8px 24px rgba(16,24,40,.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%,100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.35)", opacity: ".6" },
        },
      },
      animation: {
        "fade-up": "fade-up .4s ease both",
        pulseDot: "pulseDot 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
