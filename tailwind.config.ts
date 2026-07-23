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
        "cta-text": "var(--cta-text)",
        "analysis-text": "var(--analysis-text)",
        success: "var(--success)",
        warning: "var(--warning)",
        "success-tint": "var(--success-tint)",
        "warning-tint": "var(--warning-tint)",
        "cta-tint": "var(--cta-tint)",
        "analysis-tint": "var(--analysis-tint)",
        danger: "var(--danger)",
        "danger-tint": "var(--danger-tint)",
        "danger-fill": "var(--danger-fill)",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Inter"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px" }],
      },
      borderRadius: {
        card: "16px",
        control: "10px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,24,40,.05), 0 1px 3px rgba(16,24,40,.04)",
        elevated: "0 8px 24px rgba(16,24,40,.08)",
        // lift = elevação de hover de card clicável (um passo acima de elevated);
        // overlay = flutuação profunda para modais/dialogs sobre o overlay escuro.
        lift: "0 12px 28px rgba(16,24,40,.12), 0 2px 6px rgba(16,24,40,.06)",
        overlay: "0 24px 60px rgba(16,24,40,.22), 0 6px 16px rgba(16,24,40,.10)",
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
