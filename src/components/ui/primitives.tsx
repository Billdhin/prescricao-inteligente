import * as React from "react";
import { cn } from "@/lib/utils";

/* --------------------------------- Card ---------------------------------- */
// Dois níveis de ênfase para criar hierarquia: `raised` = âncora (no máx. 1 por
// tela), `soft` = apoio/satélite (fundo fosco, sem sombra). `base` = padrão.

export type CardVariant = "base" | "raised" | "soft";
export type CardTone = "warning" | "success" | "primary";

const cardVariants: Record<CardVariant, string> = {
  base: "border border-border bg-surface shadow-soft",
  raised: "border border-border bg-surface shadow-elevated",
  soft: "border border-border bg-surface-soft",
};

// Cartões de "aviso"/destaque tonal (sem sombra) — padroniza os que eram feitos
// à mão com hex+opacidade soltos. `tone` tem precedência sobre `variant`.
const cardTones: Record<CardTone, string> = {
  warning: "border border-warning/30 bg-[#fef4e2]/50",
  success: "border border-success/30 bg-[#e7f8ed]/50",
  primary: "border border-primary/25 bg-primary-tint/40",
};

export function Card({
  variant = "base",
  tone,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: CardVariant; tone?: CardTone }) {
  return <div className={cn("rounded-card", tone ? cardTones[tone] : cardVariants[variant], className)} {...props} />;
}

/* -------------------------------- Button --------------------------------- */

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md";

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  const base =
    "inline-flex select-none items-center justify-center gap-2 rounded-control font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const sizes: Record<ButtonSize, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-sm",
  };
  const variants: Record<ButtonVariant, string> = {
    primary: "gradient-cta text-white shadow-soft hover:opacity-95",
    secondary: "bg-surface border border-border text-ink hover:bg-surface-soft",
    outline: "border border-border bg-surface text-ink hover:bg-surface-soft",
    ghost: "text-ink-2 hover:bg-surface-soft hover:text-ink",
  };
  return cn(base, sizes[size], variants[variant]);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonClasses(variant, size), className)} {...props} />;
}

/* --------------------------------- Pill ---------------------------------- */

export type PillTone =
  | "primary"
  | "analysis"
  | "cta"
  | "success"
  | "warning"
  | "neutral";

const pillTones: Record<PillTone, string> = {
  primary: "bg-primary-tint text-primary",
  analysis: "bg-[#e0f7f9] text-analysis",
  cta: "bg-[#fff1e6] text-[color:var(--cta-text)]",
  success: "bg-[#e7f8ed] text-success",
  warning: "bg-[#fef4e2] text-warning",
  neutral: "bg-surface-soft text-ink-2",
};

export function Pill({
  tone = "neutral",
  icon,
  className,
  children,
}: {
  tone?: PillTone;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        pillTones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/* -------------------------------- StatBar -------------------------------- */

export type BarTone = "primary" | "cta" | "analysis" | "success";

const BAR_FILL: Record<BarTone, string> = {
  primary: "bg-primary",
  cta: "bg-cta",
  analysis: "bg-analysis",
  success: "bg-success",
};

/**
 * Trilho + preenchimento, sem número. Base do StatBar e do MetricaBar.
 * Existe separado para que quem já imprime o valor por fora não imprima de novo
 * dentro da barra (era o que fazia o mesmo número aparecer três vezes na aba Comparar).
 */
export function BarTrack({
  value,
  tone = "primary",
  className,
  srLabel,
}: {
  value: number;
  tone?: BarTone;
  className?: string;
  srLabel?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 min-w-0 overflow-hidden rounded-full bg-surface-soft", className)}
      role={srLabel ? "img" : undefined}
      aria-label={srLabel}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", BAR_FILL[tone])}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export function StatBar({
  label,
  value,
  tone = "primary",
  suffix = "/100",
  className,
  srLabel,
}: {
  /** Rótulo à esquerda da barra. Vazio/omitido = coluna some (a barra ocupa a largura toda). */
  label?: string;
  value: number;
  tone?: BarTone;
  /**
   * Sufixo da escala. O padrão é "/100" porque NENHUM número desta base é
   * porcentagem de um todo: são notas de 0 a 100 comparativas entre os exercícios
   * (ver `metricasGlossario.ts`). O padrão antigo era "%", e imprimia coisas como
   * "Gasto energético 70%", que não responde "70% de quê?".
   */
  suffix?: string;
  className?: string;
  /** Nome acessível da barra quando não há rótulo visível (leitor de tela). */
  srLabel?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("flex items-center gap-3", className)} aria-label={!label ? srLabel : undefined}>
      {label ? (
        <span className="w-32 shrink-0 text-sm leading-tight text-ink-2 sm:w-40 [overflow-wrap:anywhere]">
          {label}
        </span>
      ) : null}
      <BarTrack value={v} tone={tone} className="flex-1" />
      <span className="tabular w-14 shrink-0 text-right text-sm font-semibold text-ink">
        {v}
        {suffix ? <span className="text-xs font-medium text-ink-3">{suffix}</span> : null}
      </span>
    </div>
  );
}

/* --------------------------------- Progress ------------------------------ */

export function Progress({
  value,
  tone = "primary",
  className,
}: {
  value: number;
  tone?: "primary" | "analysis";
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-surface-soft", className)}>
      <div
        className={cn("h-full rounded-full", tone === "analysis" ? "bg-analysis" : "gradient-brand")}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

/* -------------------------------- ScoreRing ------------------------------ */

export function ScoreRing({
  value,
  size = 96,
  label,
  tone = "primary",
}: {
  value: number;
  size?: number;
  label?: string;
  tone?: "primary" | "analysis";
}) {
  const v = Math.max(0, Math.min(100, value));
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (v / 100) * c;
  const color = tone === "analysis" ? "var(--analysis)" : "var(--primary)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular font-display text-xl font-bold text-ink">{v}</span>
        {label && <span className="text-[10px] font-medium text-ink-3">{label}</span>}
      </div>
    </div>
  );
}

/* ----------------------------- SectionHeader ----------------------------- */

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <Pill tone="primary" icon={icon} className="mb-3">
            {eyebrow}
          </Pill>
        )}
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-ink-2">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
