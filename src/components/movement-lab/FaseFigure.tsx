import { ArrowDown, ArrowUp, Pause } from "lucide-react";
import { withBase } from "@/lib/utils";

/**
 * Figura da fase do movimento — explica VISUALMENTE (não só por texto) o que acontece na
 * fase. Se houver FOTO da pose (src), mostra a foto real da sequência (mesma pessoa nas 3
 * fases) com selo da ação + seta de sentido. Sem foto, cai no esquema vetorial do músculo
 * (alonga → ponto de virada → encurta), reutilizável em qualquer exercício. Animações via
 * transform respeitam prefers-reduced-motion (motion-safe:).
 */

export type FaseKind = "ecc" | "iso" | "con";

export function faseKind(nome: string, i: number, total: number): FaseKind {
  const n = nome.toLowerCase();
  if (/(excêntr|excentr|descid|desce|alonga|negativ)/.test(n)) return "ecc";
  if (/(concêntr|concentr|subid|sobe|empurr|puxa|elev|ascend)/.test(n)) return "con";
  if (/(isom|transi|pausa|sustenta|topo|contra[çc]|segura)/.test(n)) return "iso";
  if (total >= 3) return i === 0 ? "ecc" : i === total - 1 ? "con" : "iso";
  return i === 0 ? "ecc" : "con";
}

const CFG: Record<
  FaseKind,
  { belly: string; scale: string; loadDy: number; fill: string; glow: boolean; acao: string; chip: string }
> = {
  ecc: { belly: "excêntrica", scale: "scale(0.82,1.16)", loadDy: 20, fill: "#7AA5F2", glow: false, acao: "alonga sob carga", chip: "Alongando" },
  iso: { belly: "transição", scale: "scale(0.74,1.28)", loadDy: 30, fill: "#A9C7F9", glow: false, acao: "tensão no ponto de virada", chip: "Ponto de virada" },
  con: { belly: "concêntrica", scale: "scale(1.55,0.66)", loadDy: -16, fill: "#1D4ED8", glow: true, acao: "encurta e produz força", chip: "Encurtando" },
};

export function FaseFigure({
  kind,
  musculo,
  src,
  className,
}: {
  kind: FaseKind;
  musculo?: string;
  /** Foto da pose desta fase (sequência consistente). Sem ela, desenha o esquema. */
  src?: string;
  className?: string;
}) {
  const c = CFG[kind];
  const DirIcon = kind === "iso" ? Pause : kind === "con" ? ArrowUp : ArrowDown;

  return (
    <figure className={className}>
      {src ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface-soft">
          <img
            src={withBase(src)}
            alt={`Fase ${c.belly}: ${musculo ?? "músculo-alvo"} ${c.acao}`}
            className="h-44 w-full object-cover"
            loading="lazy"
          />
          <span className="absolute left-2 top-2 rounded-full border border-primary/20 bg-surface/90 px-2 py-0.5 text-[11px] font-semibold text-primary backdrop-blur-sm">
            {c.chip}
          </span>
          <span
            className={`absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full text-white shadow ring-1 ring-white/20 ${
              kind === "con" ? "bg-primary" : "bg-slate-900/75 backdrop-blur-sm"
            }`}
          >
            <DirIcon className="h-4 w-4" />
          </span>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-surface to-surface-soft">
          <svg viewBox="0 0 240 190" className="mx-auto h-44 w-full" role="img"
            aria-label={`Fase ${c.belly}: o músculo ${musculo ?? "alvo"} ${c.acao}`}>
            <defs>
              <filter id="fase-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#1D4ED8" floodOpacity="0.45" />
              </filter>
            </defs>
            <rect x="104" y="16" width="32" height="12" rx="6" fill="#CBD5E1" />
            <rect x="116" y="24" width="8" height="26" rx="4" fill="#E2E8F0" />
            <rect x="116" y="40" width="8" height="118" rx="4" fill="#E2E8F0" />
            <g
              className="motion-safe:transition-transform motion-safe:duration-500 ease-out"
              style={{ transform: `translateY(${c.loadDy}px)` }}
            >
              <rect x="98" y="150" width="44" height="18" rx="5" fill="#334155" />
              <rect x="94" y="154" width="6" height="10" rx="2" fill="#1E293B" />
              <rect x="140" y="154" width="6" height="10" rx="2" fill="#1E293B" />
            </g>
            <ellipse
              cx="120" cy="92" rx="15" ry="50"
              fill={c.fill}
              filter={c.glow ? "url(#fase-glow)" : undefined}
              className="motion-safe:transition-[transform,fill] motion-safe:duration-500 ease-out"
              style={{ transformBox: "fill-box", transformOrigin: "center", transform: c.scale }}
            />
            <line x1="120" y1="52" x2="120" y2="132" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5"
              className="motion-safe:transition-transform motion-safe:duration-500 ease-out"
              style={{ transformBox: "fill-box", transformOrigin: "center", transform: c.scale }} />
            <g transform="translate(196 96)">
              {kind === "iso" ? (
                <g fill="#64748B">
                  <rect x="-7" y="-16" width="6" height="32" rx="2" />
                  <rect x="3" y="-16" width="6" height="32" rx="2" />
                </g>
              ) : (
                <g
                  stroke={kind === "con" ? "#1D4ED8" : "#64748B"}
                  strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"
                  className="motion-safe:transition-transform motion-safe:duration-500 ease-out"
                  style={{ transform: kind === "con" ? "rotate(180deg)" : "none", transformBox: "fill-box", transformOrigin: "center" }}
                >
                  <line x1="0" y1="-18" x2="0" y2="18" />
                  <path d="M-9 7 L0 18 L9 7" />
                </g>
              )}
            </g>
          </svg>
          <span className="absolute left-2 top-2 rounded-full border border-primary/20 bg-surface/90 px-2 py-0.5 text-[11px] font-semibold text-primary backdrop-blur-sm">
            {c.chip}
          </span>
        </div>
      )}
      {musculo && (
        <figcaption className="mt-1.5 text-center text-[11px] text-ink-3">
          Músculo-alvo: <span className="font-medium text-ink-2">{musculo}</span>, {c.acao}
        </figcaption>
      )}
    </figure>
  );
}
