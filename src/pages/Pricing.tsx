import { Link } from "react-router-dom";
import { ArrowLeft, Check, Crown, Calculator } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import {
  NOME_PLANO,
  PRECO_MENSAL,
  PRECO_MENSAL_AVULSO,
  PRECO_SEMESTRAL_MES,
  PRECO_SEMESTRAL,
  PRECO_ANUAL,
  ECONOMIA_ANUAL,
  ECONOMIA_SEMESTRAL,
  ANO_NO_MENSAL,
  ITENS_PLANO,
  fmtBRL,
} from "@/data/planos";

/**
 * A ESCADA, NA MESMA ORDEM DA LANDING.
 *
 * O produto é um só e nada fica atrás de upgrade: o que muda entre os degraus é só a forma
 * de pagar. Esta página mostrava um preço solto, sem dizer a qual plano ele pertencia, e
 * o valor que ela exibia (o mensal do anual) parecia contradizer a landing. Agora as duas
 * telas leem a mesma escada da fonte única.
 */
const DEGRAUS = [
  { nome: "Mensal", mes: PRECO_MENSAL_AVULSO, cobranca: "cobrado todo mês", ano: ANO_NO_MENSAL, economia: null },
  {
    nome: "Semestral",
    mes: PRECO_SEMESTRAL_MES,
    cobranca: `${fmtBRL(PRECO_SEMESTRAL)} a cada seis meses`,
    ano: PRECO_SEMESTRAL_MES * 12,
    economia: ECONOMIA_SEMESTRAL,
  },
  {
    nome: "Anual",
    mes: PRECO_MENSAL,
    cobranca: `${fmtBRL(PRECO_ANUAL)} uma vez`,
    ano: PRECO_ANUAL,
    economia: ECONOMIA_ANUAL,
    foco: true,
  },
];

// FAQs reaproveitadas VERBATIM da landing (as mais objecionáveis): substituição
// da avaliação profissional, acesso e celular. Nenhuma resposta nova de política
// é inventada aqui; não há FAQ de cancelamento na landing, então entra "acesso".
const FAQS = [
  {
    q: "Isso substitui minha avaliação profissional?",
    a: "Não, e nem deveria. Todo o conteúdo é educacional e de apoio à decisão. A plataforma organiza o raciocínio; a avaliação individualizada e a decisão final são suas.",
  },
  {
    q: "Como funciona o acesso?",
    a: "É um plano único, com tudo liberado: você cria a conta e usa o Motor RCD completo, sem versão limitada e sem recurso escondido atrás de upgrade.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. É uma plataforma web responsiva: funciona no celular, no tablet e no computador, sem instalar nada.",
  },
];

export function Pricing() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <Logo />
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Voltar ao app
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-14 text-center md:px-6">
        <Pill tone="primary" icon={<Crown className="h-3 w-3" />} className="mb-3">
          Plano
        </Pill>
        <h1 className="font-display text-4xl font-extrabold text-ink">Um plano, tudo liberado.</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-2">
          O sistema da tríade completo, registro, acompanhamento e direcionamento da prescrição, com
          todos os grupos, casos e ferramentas. Sem versão limitada. O que muda entre os planos é só
          a forma de pagar.
        </p>

        <div className="mt-10 text-left">
          <Plan
            destaque
            nome={NOME_PLANO}
            preco={fmtBRL(PRECO_MENSAL)}
            desc="O Motor RCD completo: decisão documentada e assinável."
            items={ITENS_PLANO}
            cta="Começar agora"
          />
        </div>

        <div className="mt-8 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-3">
            As três formas de pagar
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="bg-surface-soft text-left text-xs uppercase tracking-wide text-ink-3">
                  <th className="px-4 py-3 font-semibold">Plano</th>
                  <th className="px-4 py-3 font-semibold">Por mês</th>
                  <th className="px-4 py-3 font-semibold">Como é cobrado</th>
                  <th className="px-4 py-3 font-semibold">Economia no ano</th>
                </tr>
              </thead>
              <tbody>
                {DEGRAUS.map((d) => (
                  <tr key={d.nome} className={d.foco ? "bg-primary/10" : ""}>
                    <td className="border-t border-border px-4 py-3 font-semibold text-ink">
                      {d.nome}
                      {d.foco && <span className="ml-2 text-xs font-bold uppercase text-primary">recomendado</span>}
                    </td>
                    <td className="border-t border-border px-4 py-3 font-display font-bold tabular-nums text-ink">
                      {fmtBRL(d.mes)}
                    </td>
                    <td className="border-t border-border px-4 py-3 text-ink-2">{d.cobranca}</td>
                    <td className="border-t border-border px-4 py-3 tabular-nums text-ink-2">
                      {d.economia ? fmtBRL(d.economia) : "ponto de partida"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-ink-2">
            O anual é o que recomendamos: um mesociclo inteiro leva doze semanas, e é nesse prazo que
            dá para avaliar a prescrição de verdade.
          </p>
        </div>

        {/* Resto: dúvidas que mais travam a decisão de compra */}
        <div className="mx-auto mt-10 max-w-xl space-y-3 text-left">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-xl border border-border bg-surface p-4">
              <div className="font-semibold text-ink">{f.q}</div>
              <p className="mt-1 text-sm text-ink-2">{f.a}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-ink-3">
          Conteúdo educacional de apoio à decisão do profissional habilitado; não substitui
          avaliação profissional individualizada.
        </p>
      </div>
    </div>
  );
}

function Plan({
  nome,
  preco,
  desc,
  items,
  cta,
  destaque,
}: {
  nome: string;
  preco: string;
  desc: string;
  items: string[];
  cta: string;
  destaque?: boolean;
}) {
  return (
    <Card className="relative p-6">
      {destaque && (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-on-primary">
          Acesso completo
        </span>
      )}
      <div className="font-display text-lg font-bold text-ink">{nome}</div>
      <p className="text-sm text-ink-2">{desc}</p>

      {/* Ordem mobile fixa: preço, CTA, âncora (risco-reverso), resto (o que inclui). */}
      <div className="mt-3 font-display text-3xl font-extrabold text-ink">
        {preco} <span className="text-sm font-medium text-ink-3">/mês no plano anual</span>
      </div>
      <Link to="/dashboard" className={buttonClasses(destaque ? "primary" : "secondary") + " mt-4 w-full"}>
        {cta}
      </Link>

      {/* Âncora de valor prudente: hedged, sem afirmar a conta do comprador. A
          calculadora fica na página /roi (embutir aqui competiria com o CTA). */}
      <div className="mt-4 rounded-xl border border-border bg-surface-soft p-4">
        <p className="text-sm text-ink-2">
          Para a maioria dos personals, custa menos que meia mensalidade de um único aluno. Faça a
          conta com os seus números.
        </p>
        <Link to="/roi" className={buttonClasses("secondary", "sm") + " mt-3"}>
          <Calculator className="h-4 w-4" /> Abrir a calculadora
        </Link>
      </div>

      <ul className="mt-5 space-y-2 text-sm text-ink">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {i}
          </li>
        ))}
      </ul>
    </Card>
  );
}
