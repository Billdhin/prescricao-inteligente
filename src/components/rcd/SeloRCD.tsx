import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Selo do mecanismo proprietário — "Motor RCD · Raciocínio Clínico Documentado".
 * A marca da tecnologia central do produto (exigência do estágio 3 de mercado:
 * nomear e ser dono do mecanismo). Usado no Prescrever, no Prontuário, na
 * landing e nos casos documentados.
 */
export function SeloRCD({
  variante = "claro",
  compacto = false,
  className,
}: {
  /** claro = sobre fundo claro; escuro = sobre fundo escuro/imagem */
  variante?: "claro" | "escuro";
  /** só "Motor RCD" (sem o nome por extenso) */
  compacto?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        variante === "claro"
          ? "border-[#0e7c8a]/30 bg-analysis-tint text-analysis-text"
          : "border-cyan-400/30 bg-slate-950/60 text-cyan-300 backdrop-blur-sm",
        className,
      )}
    >
      <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
      <span className="font-bold tracking-wide">Motor RCD</span>
      {!compacto && (
        <span className={cn("font-medium", variante === "claro" ? "text-[#0e7c8a]/80" : "text-cyan-300/80")}>
          · Raciocínio Clínico Documentado
        </span>
      )}
    </span>
  );
}

/** Nome oficial do mecanismo — usar em copy para consistência. */
export const RCD_NOME = "Raciocínio Clínico Documentado";
export const RCD_SIGLA = "RCD";
export const RCD_VERSAO = "RCD v1";
