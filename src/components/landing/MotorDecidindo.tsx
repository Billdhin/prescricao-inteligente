import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { casosDocumentados } from "@/data/casosDocumentados";
import { getSpecialGroup } from "@/data/specialGroups";
import { groupGpsRules } from "@/lib/gps/groupRules";
import { getReferencia } from "@/data/referencias";

/**
 * "NÃO PEÇA PARA CONFIAR. VEJA O MOTOR DECIDINDO."
 *
 * A landing vendia respaldo científico com adjetivo. Esta seção troca o adjetivo pela
 * coisa: seis casos documentados que JÁ EXISTEM em `casosDocumentados.ts`, cada um com
 * contexto real, decisão registrada e as diretrizes que a sustentam, e que até agora só
 * viviam em `/casos-rcd`, uma rota que a home não linkava.
 *
 * Duas regras que este componente segue e que o resto da página passou a seguir:
 *
 * 1. NADA aqui é escrito à mão. Título, contexto, decisão e referências saem dos mesmos
 *    dados que o produto usa para prescrever. Se o motor mudar, a home muda junto, e não
 *    existe a possibilidade de a vitrine dizer uma coisa e o sistema fazer outra, que foi
 *    exatamente o defeito que esta rodada de trabalho passou meses corrigindo.
 *
 * 2. As referências são RESOLVIDAS por `getReferencia`. Se um id não existir, ele
 *    simplesmente não aparece, em vez de imprimir o identificador cru na cara do
 *    visitante.
 */
export function MotorDecidindo({ WRAP, Eyebrow }: { WRAP: string; Eyebrow: React.ComponentType<{ children: React.ReactNode }> }) {
  const [ativo, setAtivo] = React.useState(0);
  const caso = casosDocumentados[ativo];
  const grupo = caso.grupoSlug ? getSpecialGroup(caso.grupoSlug) : undefined;

  // Duas primeiras referências da regra clínica do caso, resolvidas para autor e ano.
  const refs = (caso.grupoSlug ? (groupGpsRules[caso.grupoSlug]?.refs ?? []) : [])
    .map((id) => getReferencia(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .slice(0, 2);

  return (
    <section id="casos" className="scroll-mt-24 border-y border-[#EAE8E3] bg-white">
      <div className={`${WRAP} py-[84px]`}>
        <div>
          <div className="flex justify-center">
            <Eyebrow>Demonstração do mecanismo</Eyebrow>
          </div>
          <h2 className="mx-auto max-w-2xl text-center font-display text-[28px] font-bold leading-tight text-[#10233A] md:text-[36px]">
            Não peça para confiar. Veja o motor decidindo.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[16px] leading-relaxed text-[#5A6B7D]">
            Seis casos públicos, sem cadastro. Cada um mostra o contexto que chegou, a decisão
            que precisa ser tomada e a diretriz que a sustenta.
          </p>
        </div>

        <div>
          {/* Os seis casos como abas. Rolagem horizontal no celular em vez de quebrar em
              quatro linhas de chips, que é o que estraga esse padrão em tela estreita. */}
          <div
            role="tablist"
            aria-label="Casos documentados"
            className="mt-8 flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {casosDocumentados.map((c, i) => (
              <button
                key={c.slug}
                role="tab"
                aria-selected={i === ativo}
                onClick={() => setAtivo(i)}
                className={
                  "shrink-0 snap-start rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors " +
                  (i === ativo
                    ? "border-[#0D1A2B] bg-[#0D1A2B] text-white"
                    : "border-[#EAE8E3] bg-white text-[#5A6B7D] hover:border-[#c9c6bf] hover:text-[#10233A]")
                }
              >
                {c.buscaTipica}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 rounded-[18px] border border-[#EAE8E3] bg-[#FBFAF8] p-6 md:grid-cols-[1.15fr_1fr] md:p-8">
            <div>
              <div className="font-display text-[19px] font-bold leading-snug text-[#10233A] md:text-[22px]">
                {caso.titulo}
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-[#5A6B7D]">{caso.contexto}</p>
              {grupo && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#EAE8E3] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#10233A]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0E9E93]" />
                  {grupo.nome}
                  {caso.fase ? ` · Fase ${caso.fase}` : ""}
                </div>
              )}
            </div>

            <div className="rounded-[14px] border border-[#EAE8E3] bg-white p-5">
              {/* `CasoDocumentado.decisao` é a PERGUNTA que enquadra a leitura do caso
                  ("o que se decide aqui"), e não a conduta já tomada. Rotulei como
                  "Conduta registrada" na primeira versão e a tela passou a afirmar que
                  uma pergunta era uma decisão. O rótulo agora diz o que o campo é. */}
              <div className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#8A97A6]">
                O que se decide aqui
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-[#10233A]">{caso.decisao}</p>
              {refs.length > 0 && (
                <div className="mt-4 border-t border-[#EFEDE8] pt-3">
                  <div className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#8A97A6]">
                    Se apoia em
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {refs.map((r) => (
                      <li key={r.id} className="text-[13px] leading-snug text-[#5A6B7D]">
                        {r.autores.split(",")[0]}
                        {r.autores.includes(",") ? " et al." : ""} · {r.titulo.slice(0, 68)}
                        {r.titulo.length > 68 ? "…" : ""} ({r.ano})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link
                to={`/casos-rcd/${caso.slug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#10233A] hover:underline"
              >
                Abrir o caso completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
