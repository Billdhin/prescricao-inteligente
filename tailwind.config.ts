import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cada cor lê o companheiro `--<token>-rgb` (canais "R G B"), o que
        // habilita o modificador de alpha do Tailwind (bg-primary/40) E o tema:
        // o ThemeProvider troca os canais por paleta/modo. Os `--<token>` em hex
        // continuam existindo para os usos crus em SVG (fill="var(--primary)").
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        "surface-soft": "rgb(var(--surface-soft-rgb) / <alpha-value>)",
        border: "rgb(var(--border-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        "ink-2": "rgb(var(--ink-2-rgb) / <alpha-value>)",
        "ink-3": "rgb(var(--ink-3-rgb) / <alpha-value>)",
        primary: "rgb(var(--primary-rgb) / <alpha-value>)",
        "primary-tint": "rgb(var(--primary-tint-rgb) / <alpha-value>)",
        "on-primary": "rgb(var(--on-primary-rgb) / <alpha-value>)",
        "on-analysis": "rgb(var(--on-analysis-rgb) / <alpha-value>)",
        analysis: "rgb(var(--analysis-rgb) / <alpha-value>)",
        cta: "rgb(var(--cta-rgb) / <alpha-value>)",
        "cta-text": "rgb(var(--cta-text-rgb) / <alpha-value>)",
        "analysis-text": "rgb(var(--analysis-text-rgb) / <alpha-value>)",
        success: "rgb(var(--success-rgb) / <alpha-value>)",
        warning: "rgb(var(--warning-rgb) / <alpha-value>)",
        "success-tint": "rgb(var(--success-tint-rgb) / <alpha-value>)",
        "warning-tint": "rgb(var(--warning-tint-rgb) / <alpha-value>)",
        "cta-tint": "rgb(var(--cta-tint-rgb) / <alpha-value>)",
        "analysis-tint": "rgb(var(--analysis-tint-rgb) / <alpha-value>)",
        danger: "rgb(var(--danger-rgb) / <alpha-value>)",
        "danger-tint": "rgb(var(--danger-tint-rgb) / <alpha-value>)",
        "danger-fill": "rgb(var(--danger-fill-rgb) / <alpha-value>)",
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
