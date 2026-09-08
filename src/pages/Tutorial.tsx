import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, Clock, LifeBuoy, PlayCircle } from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { tutorials, type Tutorial } from "@/data/tutorials";

const modoPill: Record<Tutorial["modo"], { label: string; tone: "primary" | "analysis" | "neutral" }> = {
  atender: { label: "Atender", tone: "primary" },
  aprender: { label: "Aprender", tone: "analysis" },
  ambos: { label: "Atender e Aprender", tone: "neutral" },
};

export function Tutorial() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <SectionHeader
        eyebrow="Passo a passo e suporte"
        icon={<GraduationCap className="h-3 w-3" />}
        title="Ajuda"
        subtitle="Guias visuais, passo a passo, das ações principais. Cada passo tem um atalho para fazer na hora, e o suporte fica a um clique."
      />

      {/* Guia em destaque */}
      <Card variant="raised" className="flex flex-col gap-4 border-l-4 border-l-primary p-5 md:flex-row md:items-center md:p-6">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-card bg-primary-tint text-primary">
          <PlayCircle className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-bold text-ink">Comece por aqui</h2>
          <p className="mt-1 text-ink-2">
            Se é seu primeiro contato, o guia <span className="font-semibold text-ink">“Prescreva para um aluno”</span> mostra
            o fluxo completo (do cadastro à prescrição em PDF) em poucos minutos.
          </p>
        </div>
        <Link to={`/tutorial/${tutorials[0].slug}`} className={buttonClasses("primary")}>
          Começar <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      {/* Tutoriais numerados (protótipo 08/09): quadrado navy com o número em
          teal, título e resumo ao lado. A numeração é a ordem real da lista. */}
      <div className="grid gap-4 sm:grid-cols-2">
        {tutorials.map((t, i) => {
          const m = modoPill[t.modo];
          return (
            <Link
              key={t.slug}
              to={`/tutorial/${t.slug}`}
              className="group flex flex-col rounded-card border border-border bg-surface p-5 shadow-soft transition-colors hover:bg-surface-soft"
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-control font-display text-xs font-bold"
                  style={{ background: "#0B1628", color: "#7FE3D8" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-lg font-bold text-ink">{t.titulo}</h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {t.duracao}
                    </span>
                    <span>·</span>
                    <span>{t.steps.length} passos</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-3 flex-1 text-sm text-ink-2">{t.resumo}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Pill tone={m.tone}>{m.label}</Pill>
                <Pill tone="neutral">{t.nivel}</Pill>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Fale com a gente: superfície navy fixa (fora do tema claro/escuro).
          O canal real de suporte do produto é a página /suporte (e-mail e
          formulário); não existe WhatsApp de suporte, então o CTA âmbar leva
          para lá. */}
      <section
        className="relative overflow-hidden rounded-card p-6"
        style={{ background: "#0B1628", color: "#F3F1EA" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[60px] -top-[80px] h-[220px] w-[220px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(232,163,23,.3),rgba(232,163,23,0) 65%)" }}
        />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1 basis-64">
            <b className="block font-display text-lg font-bold">Fale com a gente</b>
            <span className="text-sm" style={{ color: "#B9C6D6" }}>
              Não encontrou o que procurava? Dúvida, problema ou sugestão: o suporte responde por e-mail.
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/suporte"
              className="inline-flex h-10 items-center gap-2 rounded-control px-4 text-sm font-bold transition-[filter] hover:brightness-110"
              style={{ background: "#E8A317", color: "#0B1628" }}
            >
              <LifeBuoy className="h-4 w-4" aria-hidden /> Falar com o suporte
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
