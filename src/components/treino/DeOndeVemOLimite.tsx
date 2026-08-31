/**
 * DE ONDE VEM CADA LIMITE, incluindo a regra que PERDEU a disputa.
 *
 * O motor sempre fundiu certo (teto de carga pelo menor, reserva de repetições pela maior),
 * mas o resultado chegava à tela como número órfão: o plano dizia "até 80% de 1RM" e nada,
 * em lugar nenhum do produto, dizia qual condição tinha imposto aquilo. Pior, `cargaRelativaMax`
 * e `rirMinimo` não apareciam em tela alguma, então o profissional não via nem o número.
 *
 * A LINHA DO PRETERIDO É O PONTO DESTE PAINEL. Mostrar só a regra que valeu é uma lista de
 * limites; mostrar a que perdeu, com o número que ela pedia, é a decisão inteira. Um aluno de
 * 72 anos com hipertensão recebe reserva de 3 repetições porque a idade pediu 3 e a
 * hipertensão pedia 2, e ver essas duas linhas juntas é o que separa "o sistema decidiu" de
 * "eu entendi por quê". É a diferença que este produto vende.
 *
 * O painel nunca inventa: quando não há limite declarado, ele simplesmente não aparece.
 */
import * as React from "react";
import { combineRules, getGroupRule, type OrigemDoNumero } from "@/lib/gps/groupRules";
import { doseDoPerfilComIdade } from "@/lib/gps/esforco";
import { getSpecialGroup } from "@/data/specialGroups";
import { refCurta } from "@/data/referencias";

/** Nome legível da origem. "idade" não é condição clínica e por isso não passa pelo catálogo. */
function rotuloDaOrigem(de: string): string {
  if (de === "idade") return "Idade do aluno";
  return getSpecialGroup(de)?.nome ?? de;
}

function LinhaDoLimite({
  titulo,
  unidade,
  origem,
}: {
  titulo: string;
  unidade: (v: number) => string;
  origem: OrigemDoNumero;
}) {
  const refs = origem.refId.map(refCurta).filter(Boolean).join(" · ");
  return (
    <li className="border-l-2 border-primary pl-3">
      <p className="text-sm font-semibold text-ink">
        {titulo} {unidade(origem.valor)}
      </p>
      <p className="text-xs text-ink-2">
        Imposto por {rotuloDaOrigem(origem.de)}
        {refs ? ` · ${refs}` : ""}
      </p>
      {origem.preteridos.map((p) => (
        <p key={p.de} className="mt-0.5 text-xs text-ink-3">
          {rotuloDaOrigem(p.de)} pedia {unidade(p.valorPedido)}. Prevaleceu o mais conservador.
        </p>
      ))}
    </li>
  );
}

export function DeOndeVemOLimite({
  grupoEspecial,
  condicoesAtencao,
  idade,
}: {
  grupoEspecial?: string;
  condicoesAtencao?: string[];
  idade?: number;
}) {
  const dose = React.useMemo(() => {
    /*
     * A MESMA CHAMADA QUE O GERADOR FAZ, e não uma reconstrução paralela.
     *
     * `regraClinicaDoPlano` funde a condição principal com as demais antes de chegar aqui, e
     * é ela que o plano consome. Recalcular por outro caminho produziria uma tela que diz uma
     * coisa e um plano que faz outra, que é como quase todo defeito deste motor nasceu.
     */
    const slugs = [grupoEspecial, ...(condicoesAtencao ?? [])].filter((s): s is string => Boolean(s));
    if (!slugs.length && idade == null) return undefined;
    // Uma condição só: a regra dela. Mais de uma: combineRules, a mesma fusão do gerador.
    const regra = slugs.length > 1 ? combineRules(slugs) : getGroupRule(slugs[0]);
    return doseDoPerfilComIdade(regra, idade);
  }, [grupoEspecial, condicoesAtencao, idade]);

  const p = dose?.procedencia;
  if (!p?.cargaRelativaMax && !p?.rirMinimo) return null;

  return (
    <div>
      <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-3">De onde vem cada limite</h3>
      <ul className="mt-2 space-y-2.5">
        {p.cargaRelativaMax && (
          <LinhaDoLimite titulo="Carga até" unidade={(v) => `${v}% de 1RM`} origem={p.cargaRelativaMax} />
        )}
        {p.rirMinimo && (
          <LinhaDoLimite
            titulo="Nunca passar de"
            unidade={(v) => `${v} ${v === 1 ? "repetição" : "repetições"} de reserva`}
            origem={p.rirMinimo}
          />
        )}
      </ul>
      <p className="mt-2 text-2xs leading-snug text-ink-3">
        Quando duas condições pedem coisas diferentes, o limite mais conservador prevalece. A palavra final
        sobre a conduta continua sendo sua.
      </p>
    </div>
  );
}
