import { Link } from "react-router-dom";
import { ArrowLeft, Check, Crown } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";

export function Pricing() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <Logo />
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Voltar ao app
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-14 text-center md:px-6">
        <Pill tone="primary" icon={<Crown className="h-3 w-3" />} className="mb-3">
          Planos
        </Pill>
        <h1 className="font-display text-4xl font-extrabold text-ink">Comece grátis, evolua quando quiser.</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-2">
          Comece a prescrever com raciocínio hoje. Sem cartão para começar; assine o Profissional
          quando fizer sentido.
        </p>

        <div className="mt-10 grid gap-4 text-left md:grid-cols-2">
          <Plan
            nome="Grátis"
            preco="R$ 0"
            desc="Para começar a explorar."
            items={["Laboratório Visual (parcial)", "3 análises no GPS", "2 casos práticos", "Biblioteca essencial"]}
            cta="Continuar grátis"
          />
          <Plan
            destaque
            nome="Profissional"
            preco="R$ 39"
            desc="Para atuar com segurança."
            items={["Laboratório Visual completo", "GPS ilimitado + comparador", "Todos os casos com feedback", "Trilhas, progresso e favoritos"]}
            cta="Assinar Profissional"
          />
        </div>

        <p className="mt-8 text-xs text-ink-3">
          Conteúdo educacional — não substitui avaliação profissional individualizada.
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
    <Card className={`relative p-6 ${destaque ? "border-primary shadow-elevated" : ""}`}>
      {destaque && (
        <span className="absolute -top-3 left-6 rounded-full gradient-cta px-3 py-0.5 text-xs font-bold text-white">
          Mais escolhido
        </span>
      )}
      <div className="font-display text-lg font-bold text-ink">{nome}</div>
      <p className="text-sm text-ink-2">{desc}</p>
      <div className="mt-3 font-display text-3xl font-extrabold text-ink">
        {preco} <span className="text-sm font-medium text-ink-3">/mês</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-ink">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {i}
          </li>
        ))}
      </ul>
      <Link to="/dashboard" className={buttonClasses(destaque ? "primary" : "secondary") + " mt-5 w-full"}>
        {cta}
      </Link>
    </Card>
  );
}
