import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { OBJETIVOS, type GpsObjetivo } from "@/lib/gps/engine";
import {
  compatibilidadeObjetivos,
  secundariosDe,
  ROTULO_COMPAT,
  type EstadoCompat,
} from "@/lib/gps/objetivos";
import { bibliografia } from "@/data/referencias";
import { cn } from "@/lib/utils";

/**
 * Escolha do objetivo PRINCIPAL e do SECUNDÁRIO, com o veredito do par visível
 * na hora. Um componente só, usado no cadastro do aluno e no assistente do
 * Prescrever exercício: se as duas telas escolhessem objetivo por caminhos
 * diferentes, uma delas ia aceitar par que a outra recusa.
 *
 * A regra de forma: nada de aceitar em silêncio. Enquanto o par escolhido for
 * incompatível, o veredito diz o porquê E o que fazer no lugar, e quem chama
 * recebe `valido: false` para travar o salvar.
 */

const ICONE: Record<EstadoCompat, React.ComponentType<{ className?: string }>> = {
  soma: CheckCircle2,
  condicional: AlertTriangle,
  incompativel: XCircle,
};

const TOM: Record<EstadoCompat, string> = {
  soma: "border-success/30 bg-success-tint text-success",
  condicional: "border-warning/30 bg-warning-tint text-warning",
  incompativel: "border-danger/30 bg-danger-tint text-danger",
};

export function ObjetivoDuplo({
  objetivo,
  objetivoSecundario,
  onChange,
  compacto,
  somenteSecundario,
}: {
  objetivo: GpsObjetivo;
  objetivoSecundario?: GpsObjetivo;
  onChange: (o: GpsObjetivo, s?: GpsObjetivo) => void;
  /** true no modal (selects lado a lado), false no assistente (mais espaço para o texto). */
  compacto?: boolean;
  /**
   * O principal já foi escolhido fora daqui (no assistente ele é uma lista de cartões
   * com descrição, que é o padrão da casa). Esconde o seletor de principal para a tela
   * não perguntar a mesma coisa duas vezes.
   */
  somenteSecundario?: boolean;
}) {
  const opcoesSecundario = React.useMemo(() => secundariosDe(objetivo, OBJETIVOS), [objetivo]);
  const compat = compatibilidadeObjetivos(objetivo, objetivoSecundario);

  // Trocar o principal pode deixar um secundário que não vale mais (ex.: escolher
  // como principal o mesmo que estava de secundário). Em vez de guardar um par
  // invalido em silêncio, o secundário cai fora.
  const trocarPrincipal = (novo: GpsObjetivo) => {
    const aindaVale = opcoesSecundario.some(
      (x) => x.objetivo === objetivoSecundario && x.compat.estado !== "incompativel",
    );
    onChange(novo, novo === objetivoSecundario || !aindaVale ? undefined : objetivoSecundario);
  };

  return (
    <div className="space-y-3">
      <div className={cn("grid gap-3", somenteSecundario ? "" : compacto ? "grid-cols-2" : "sm:grid-cols-2")}>
        {!somenteSecundario && (<label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-2">Objetivo principal</span>
          <select
            value={objetivo}
            onChange={(e) => trocarPrincipal(e.target.value as GpsObjetivo)}
            className="input w-full"
          >
            {OBJETIVOS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <span className="mt-1 block text-2xs text-ink-3">Manda na dose e na ênfase da sessão.</span>
        </label>)}

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-2">
            Objetivo secundário (opcional)
          </span>
          <select
            value={objetivoSecundario ?? ""}
            onChange={(e) =>
              onChange(objetivo, e.target.value ? (e.target.value as GpsObjetivo) : undefined)
            }
            className="input w-full"
          >
            <option value="">Nenhum</option>
            {opcoesSecundario.map(({ objetivo: o, compat: c }) => (
              <option key={o} value={o}>
                {o} ({ROTULO_COMPAT[c.estado]})
              </option>
            ))}
          </select>
          <span className="mt-1 block text-2xs text-ink-3">Entra como ênfase, não como comando.</span>
        </label>
      </div>

      {compat && objetivoSecundario && <VereditoDoPar compat={compat} />}

      {!objetivoSecundario && !compacto && (
        <p className="flex items-start gap-1.5 text-xs text-ink-3">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          Um objetivo já resolve a maioria dos casos. O segundo só entra quando o aluno de fato
          persegue duas coisas, e o sistema diz na hora se elas somam ou se cobram um preço.
        </p>
      )}
    </div>
  );
}

function VereditoDoPar({ compat }: { compat: NonNullable<ReturnType<typeof compatibilidadeObjetivos>> }) {
  const Icone = ICONE[compat.estado];
  const refs = bibliografia(compat.refIds);
  return (
    <div className={cn("rounded-control border p-3", TOM[compat.estado])}>
      <div className="flex items-start gap-2">
        <Icone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-semibold">{ROTULO_COMPAT[compat.estado]}</p>
          <p className="text-sm text-ink-2">{compat.resumo}</p>
          {compat.condicao && (
            <p className="text-sm text-ink-2">
              <span className="font-semibold text-ink">Condição:</span> {compat.condicao}
            </p>
          )}
          {compat.emVezDisso && (
            <p className="text-sm text-ink-2">
              <span className="font-semibold text-ink">No lugar disso:</span> {compat.emVezDisso}
            </p>
          )}
          {refs.length > 0 && (
            <ul className="space-y-0.5 pt-0.5">
              {refs.map(({ n, ref }) => (
                <li key={ref.id} className="text-2xs text-ink-3">
                  [{n}] {ref.autores.split(",")[0]} ({ref.ano}), {ref.fonte}.{" "}
                  {ref.doi && (
                    <a
                      href={`https://doi.org/${ref.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      doi:{ref.doi}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
