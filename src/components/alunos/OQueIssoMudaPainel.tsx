import * as React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText } from "lucide-react";
import { oQueIssoMuda, type OrigemMudanca } from "@/lib/gps/oQueIssoMuda";
import type { Aluno } from "@/data/alunos";
import { cn } from "@/lib/utils";

/** Cor da barra por origem: condição é semáforo, restrição é limite, medicação é
 *  leitura de intensidade, equipamento é catálogo. Estado nunca só por cor: cada
 *  item também traz a fonte escrita. */
const BARRA: Record<OrigemMudanca, string> = {
  condicao: "bg-danger",
  restricao: "bg-warning-fill",
  medicacao: "bg-primary",
};

/**
 * "O QUE ISSO MUDA": a coluna que responde, enquanto o profissional preenche, por
 * que valeu a pena preencher.
 *
 * Todo texto aqui é DERIVADO (src/lib/gps/oQueIssoMuda.ts) dos mesmos motores que
 * geram o plano, montam o checklist do dia e decidem a leitura de intensidade.
 * Este componente é uma folha: ele não sabe nenhuma regra, só desenha o que a
 * função devolveu. Quando não há nada declarado, ele diz isso, e não preenche o
 * silêncio com um exemplo.
 */
export function OQueIssoMudaPainel({ aluno }: { aluno: Aluno }) {
  const muda = React.useMemo(() => oQueIssoMuda(aluno), [aluno]);
  const vazio = !muda.semaforo && muda.itens.length === 0;

  return (
    <aside aria-label="O que isso muda" className="min-w-0 space-y-3 lg:sticky lg:top-6 lg:self-start">
      <h2 className="text-2xs font-bold uppercase tracking-wider text-ink-3">O que isso muda</h2>

      {vazio && (
        <p className="rounded-card border border-dashed border-border p-4 text-sm text-ink-2">
          Nada declarado ainda. Assim que a condição de saúde, uma restrição ou uma classe de
          medicação entrar, esta coluna mostra o que muda no treino, no semáforo e no app do aluno.
        </p>
      )}

      {muda.semaforo && (
        <div className="rounded-card border border-danger/30 bg-danger-tint p-4">
          <div className="mb-1 flex items-center gap-2 font-display font-bold text-danger-text">
            <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full bg-danger" />
            Semáforo diário ligado
          </div>
          <p className="text-sm leading-relaxed text-ink">
            {muda.semaforo.grupo}: {muda.semaforo.perguntas} pergunta
            {muda.semaforo.perguntas === 1 ? "" : "s"} antes de cada sessão, começando por{" "}
            {primeiraEmMinuscula(muda.semaforo.primeira)}.
          </p>
        </div>
      )}

      {muda.itens.map((it) => (
        <div key={it.id} className="flex gap-3">
          <span aria-hidden className={cn("w-1 shrink-0 rounded-full", BARRA[it.origem])} />
          <div className="min-w-0">
            <div className="text-sm font-bold text-ink">{it.fonte}</div>
            <ul className="mt-0.5 space-y-1">
              {it.efeitos.map((e) => (
                <li key={e} className="text-sm leading-relaxed text-ink-2">
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {muda.catalogo && (
        <p className="text-sm leading-relaxed text-ink-3">{muda.catalogo}</p>
      )}

      {muda.noAppDoAluno.length > 0 && (
        <div className="rounded-card bg-surface-soft p-4">
          <div className="mb-1 text-2xs font-bold uppercase tracking-wider text-ink-3">No app do aluno</div>
          <ul className="space-y-1">
            {muda.noAppDoAluno.map((t) => (
              <li key={t} className="text-sm leading-relaxed text-ink-2">
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {muda.protocolo && (
        <div>
          <div className="mb-2 text-2xs font-bold uppercase tracking-wider text-ink-3">Protocolo sugerido</div>
          <Link
            to={`/special-groups/${muda.protocolo.slug}`}
            className="flex gap-3 rounded-card border border-border bg-surface p-3.5 transition-colors hover:bg-surface-soft"
          >
            <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-analysis-tint text-analysis-text">
              <FileText className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-ink">{muda.protocolo.nome}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-ink-2">
                Entra pela fase {muda.protocolo.fase.toLowerCase()}. {muda.protocolo.estrutura}
              </span>
            </span>
          </Link>
        </div>
      )}

      {/* A ressalva vive junto da consequência, não numa página de termos: quem lê
          "o motor evita isso" precisa ler ali mesmo que isto não é diagnóstico. */}
      <p className="flex items-start gap-2 rounded-card bg-analysis-tint p-3 text-xs leading-relaxed text-ink-2">
        <ShieldCheck aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-analysis-text" />
        <span>
          <strong className="font-bold uppercase tracking-wide text-analysis-text">Cuidado de segurança</strong>{" "}
          não é diagnóstico. Apoia a decisão do profissional habilitado e não substitui avaliação de
          profissional de saúde.
        </span>
      </p>
    </aside>
  );
}

/** A pergunta do checklist vem com maiúscula (é frase inteira); no meio da nossa
 *  frase ela entra em minúscula, sem alterar siglas como PA e PSE. */
function primeiraEmMinuscula(t: string): string {
  const [primeira, ...resto] = t.split(" ");
  const ehSigla = primeira === primeira.toUpperCase() && primeira.length <= 4;
  return [ehSigla ? primeira : primeira.toLowerCase(), ...resto].join(" ");
}
