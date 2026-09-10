import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { oQueIssoMuda, type ItemMudanca, type OrigemMudanca } from "@/lib/gps/oQueIssoMuda";
import type { SecaoPerfilId } from "@/lib/gps/perfilAluno";
import type { Aluno } from "@/data/alunos";
import { cn } from "@/lib/utils";

/** Cor da barra por origem: condição é semáforo, restrição é limite, medicação é
 *  leitura de intensidade. Estado nunca só por cor: cada item também traz a fonte escrita. */
const BARRA: Record<OrigemMudanca, string> = {
  condicao: "bg-danger",
  restricao: "bg-warning-fill",
  medicacao: "bg-primary",
};

/**
 * Qual origem cada passo do perfil PRODUZ. É o que decide o destaque: quem está marcando
 * medicação quer ver primeiro o que a medicação acabou de mudar, e não reler a hipertensão
 * que declarou dois passos atrás. Os passos que não produzem consequência clínica (básicos,
 * objetivo, equipamentos, notas) não destacam nada, e a coluna fica na ordem de sempre.
 */
const ORIGENS_DO_PASSO: Partial<Record<SecaoPerfilId, OrigemMudanca[]>> = {
  saude: ["condicao", "restricao"],
  medicamentos: ["medicacao"],
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
 *
 * Desenho de 10/09/2026 (protótipo do perfil): o que o passo em foco acabou de mudar sobe
 * para o topo num cartão âmbar; o resto das consequências fica agrupado DENTRO do cartão do
 * semáforo, que é onde elas se encontram no dia do aluno; e o protocolo vira cartão próprio.
 */
export function OQueIssoMudaPainel({ aluno, secao }: { aluno: Aluno; secao?: SecaoPerfilId }) {
  const muda = React.useMemo(() => oQueIssoMuda(aluno), [aluno]);
  const vazio = !muda.semaforo && muda.itens.length === 0;

  const origensEmFoco = (secao && ORIGENS_DO_PASSO[secao]) ?? [];
  const emFoco = muda.itens.filter((it) => origensEmFoco.includes(it.origem));
  const demais = muda.itens.filter((it) => !origensEmFoco.includes(it.origem));

  return (
    <aside aria-label="O que isso muda" className="min-w-0 space-y-3 lg:sticky lg:top-6 lg:self-start">
      <h2 className="text-2xs font-bold uppercase tracking-[0.14em] text-ink-3">O que isso muda</h2>

      {vazio && (
        <p className="rounded-card border border-dashed border-border p-4 text-sm leading-relaxed text-ink-2">
          Nada declarado ainda. Assim que a condição de saúde, uma restrição ou uma classe de
          medicação entrar, esta coluna mostra o que muda no treino, no semáforo e no app do aluno.
        </p>
      )}

      {emFoco.map((it) => (
        <div key={it.id} className="rounded-card border border-warning-fill/40 bg-warning-tint p-4">
          <div className="flex items-center gap-2 font-display font-bold text-warning-text">
            <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full bg-warning-fill" />
            {it.fonte}
          </div>
          <Efeitos efeitos={it.efeitos} className="mt-1.5 text-ink" />
        </div>
      ))}

      {(muda.semaforo || demais.length > 0) && (
        <div className="space-y-4 rounded-card border border-border bg-surface p-4">
          {muda.semaforo && (
            <div>
              <div className="flex items-center gap-2 font-display font-bold text-ink">
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full bg-danger" />
                Semáforo diário ligado
              </div>
              {/* A pergunta entra entre aspas, como ela aparece no checklist: é frase inteira,
                  com a própria maiúscula e a própria interrogação. Costurada no meio da nossa
                  frase ela saía "começando por o joelho doeu?." */}
              <p className="mt-1 text-sm leading-relaxed text-ink-2">
                {muda.semaforo.grupo}: {muda.semaforo.perguntas} pergunta
                {muda.semaforo.perguntas === 1 ? "" : "s"} antes de cada sessão, começando por “
                {muda.semaforo.primeira}”
              </p>
            </div>
          )}
          {demais.map((it) => (
            <ItemComBarra key={it.id} item={it} />
          ))}
        </div>
      )}

      {muda.catalogo && <p className="px-1 text-sm leading-relaxed text-ink-3">{muda.catalogo}</p>}

      {muda.noAppDoAluno.length > 0 && (
        <div className="rounded-card bg-surface-soft p-4">
          <div className="mb-1 text-2xs font-bold uppercase tracking-[0.14em] text-ink-3">No app do aluno</div>
          <Efeitos efeitos={muda.noAppDoAluno} className="text-ink-2" />
        </div>
      )}

      {muda.protocolo && (
        <Link
          to={`/special-groups/${muda.protocolo.slug}`}
          className="group block rounded-card border border-border bg-surface p-4 transition-colors hover:bg-surface-soft"
        >
          <span className="block text-2xs font-bold uppercase tracking-[0.14em] text-ink-3">Protocolo sugerido</span>
          <span className="mt-1.5 flex items-center justify-between gap-2 font-display font-bold text-ink">
            {muda.protocolo.nome}
            <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-ink-2">
            Entra pela fase {muda.protocolo.fase.toLowerCase()}. {muda.protocolo.estrutura}
          </span>
        </Link>
      )}

      {/* A ressalva vive junto da consequência, não numa página de termos: quem lê
          "o motor evita isso" precisa ler ali mesmo que isto não é diagnóstico. */}
      <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-ink-3">
        <ShieldCheck aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-analysis-text" />
        Apoio à decisão do profissional habilitado. Não é diagnóstico nem substitui avaliação de saúde.
      </p>
    </aside>
  );
}

function ItemComBarra({ item }: { item: ItemMudanca }) {
  return (
    <div className="flex gap-3">
      <span aria-hidden className={cn("w-1 shrink-0 rounded-full", BARRA[item.origem])} />
      <div className="min-w-0">
        <div className="text-sm font-bold text-ink">{item.fonte}</div>
        <Efeitos efeitos={item.efeitos} className="mt-0.5 text-ink-2" />
      </div>
    </div>
  );
}

function Efeitos({ efeitos, className }: { efeitos: string[]; className?: string }) {
  return (
    <ul className={cn("space-y-1", className)}>
      {efeitos.map((e) => (
        <li key={e} className="text-sm leading-relaxed">
          {e}
        </li>
      ))}
    </ul>
  );
}
