import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, Target, HelpCircle } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { getCase } from "@/data/cases";
import type { CaseOption } from "@/data/types";

/**
 * /casos-praticos/:slug — o caso de decisão que o profissional resolve escolhendo
 * uma alternativa e lendo a análise de cada uma.
 *
 * ## Por que esta página existe
 *
 * `src/data/cases.ts` tem DEZ casos completos (contexto, pergunta, três alternativas
 * cada uma com análise, critério e o que levar adiante). Eles não tinham rota: a
 * página antiga `/cases` virou redirecionamento para `/aprender/casos`, que é outro
 * catálogo, com outros três casos e outros slugs.
 *
 * O resultado era que os oito grupos especiais e os três itens de trilha que linkam
 * "Casos práticos relacionados" montavam o cartão com o título vindo DAQUI e mandavam
 * o clique para lá, onde o slug não existe. Onze links, todos caindo em "Caso não
 * encontrado", com a interseção entre os dois conjuntos de slugs sendo exatamente zero.
 *
 * A correção podia ser apagar as onze referências. Seria jogar fora dez casos escritos
 * para não consertar um endereço. Em vez disso, o destino voltou a existir.
 */
export function CasoPratico() {
  const { slug = "" } = useParams();
  const caso = getCase(slug);
  const [escolha, setEscolha] = React.useState<string | null>(null);

  // Trocar de caso pela navegação sem desmontar a página manteria a resposta anterior
  // marcada no caso novo, mostrando o veredito de uma pergunta que não foi feita.
  React.useEffect(() => setEscolha(null), [slug]);

  if (!caso) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-ink-2">Caso não encontrado.</p>
        <Link to="/special-groups" className={cn(buttonClasses("secondary"), "mt-4")}>
          Voltar aos grupos especiais
        </Link>
      </div>
    );
  }

  const acertou = escolha === caso.melhorOpcaoId;
  const escolhida = caso.opcoes.find((o) => o.id === escolha);

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10">
      <Link
        to="/special-groups"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Grupos Especiais
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="analysis">{caso.tema}</Pill>
          <Pill tone="neutral">{caso.dificuldade}</Pill>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink md:text-3xl">{caso.titulo}</h1>
      </div>

      <Card className="p-5">
        <div className="text-2xs font-bold uppercase tracking-[0.14em] text-ink-3">O caso</div>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{caso.contexto}</p>
        <div className="mt-4 flex gap-2.5 rounded-card bg-bg-2 p-4">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-[15px] font-semibold text-ink">{caso.pergunta}</p>
        </div>
      </Card>

      <div className="space-y-3">
        {caso.opcoes.map((o) => (
          <Alternativa
            key={o.id}
            opcao={o}
            melhor={o.id === caso.melhorOpcaoId}
            escolhida={escolha === o.id}
            respondido={escolha != null}
            onEscolher={() => setEscolha(o.id)}
          />
        ))}
      </div>

      {escolhida && (
        <Card
          className={cn("p-5", acertou ? "border-success/40 bg-success-tint" : "border-warning/40 bg-warning-tint")}
        >
          <div className="flex items-center gap-2">
            {acertou ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Target className="h-5 w-5 text-warning" />
            )}
            <span className="font-display text-base font-bold text-ink">
              {acertou ? "É a escolha mais prudente aqui." : "Há uma escolha mais prudente para este caso."}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            <b className="text-ink">Critério:</b> {escolhida.criterio}
          </p>
          <p className="mt-2 flex gap-2 text-sm leading-relaxed text-ink-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <b className="text-ink">Para levar adiante:</b> {escolhida.lembrar}
            </span>
          </p>
          {/* O rótulo de confiança é da casa: diz ao profissional o peso do que ele
              acabou de ler, para não tratar tendência prática como se fosse diretriz. */}
          <p className="mt-3 border-t border-border pt-3 text-xs text-ink-3">
            Nível de confiança deste caso: {caso.trustLevel}. A decisão final é sempre sua.
          </p>
          {!acertou && (
            <button onClick={() => setEscolha(null)} className={cn(buttonClasses("secondary", "sm"), "mt-3")}>
              Tentar de novo
            </button>
          )}
        </Card>
      )}
    </div>
  );
}

function Alternativa({
  opcao,
  melhor,
  escolhida,
  respondido,
  onEscolher,
}: {
  opcao: CaseOption;
  melhor: boolean;
  escolhida: boolean;
  respondido: boolean;
  onEscolher: () => void;
}) {
  return (
    <button
      onClick={onEscolher}
      disabled={respondido}
      className={cn(
        "w-full rounded-card border p-4 text-left transition-colors",
        !respondido && "border-border bg-surface hover:border-primary/50 hover:bg-surface-soft",
        respondido && melhor && "border-success/50 bg-success-tint",
        respondido && !melhor && escolhida && "border-danger/50 bg-danger-tint",
        respondido && !melhor && !escolhida && "border-border bg-surface opacity-70",
      )}
    >
      <div className="flex items-start gap-2.5">
        {respondido ? (
          melhor ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
          )
        ) : (
          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border text-2xs font-bold text-ink-3">
            {opcao.id.toUpperCase()}
          </span>
        )}
        <span className="text-[15px] font-semibold text-ink">{opcao.texto}</span>
      </div>
      {/* A análise de TODAS as alternativas aparece depois de responder, não só a da
          escolhida: entender por que as outras não servem é metade do aprendizado. */}
      {respondido && <p className="mt-2.5 pl-6.5 text-sm leading-relaxed text-ink-2">{opcao.analise}</p>}
    </button>
  );
}
