import { Link } from "react-router-dom";
import { ClipboardList, Crown, Lock, ArrowRight, FlaskConical, Dumbbell } from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { useUser, useAlunos, isPremiumUnlocked } from "@/lib/store";
import { exercises } from "@/data/exercises";
import { cn } from "@/lib/utils";

const nomeEx = (slug: string) => exercises.find((e) => e.slug === slug)?.nome ?? slug;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));

const MODELOS: { titulo: string; objetivo: string; tone: "primary" | "analysis" | "cta" | "success"; itens: { slug: string; series: string }[] }[] = [
  {
    titulo: "Hipertrofia de quadríceps",
    objetivo: "Hipertrofia",
    tone: "primary",
    itens: [
      { slug: "leg-press-45", series: "4 x 10–12" },
      { slug: "cadeira-extensora", series: "3 x 12–15" },
      { slug: "afundo-passada", series: "3 x 10 / perna" },
    ],
  },
  {
    titulo: "Retorno pós-lesão de joelho",
    objetivo: "Reabilitação/retorno",
    tone: "success",
    itens: [
      { slug: "leg-press-45", series: "3 x 15 (amplitude parcial)" },
      { slug: "cadeira-extensora", series: "3 x 15 leve" },
      { slug: "mesa-flexora", series: "3 x 12" },
    ],
  },
  {
    titulo: "Força de cadeia posterior",
    objetivo: "Força",
    tone: "analysis",
    itens: [
      { slug: "levantamento-terra-romeno", series: "4 x 6–8" },
      { slug: "hip-thrust", series: "3 x 8–10" },
      { slug: "mesa-flexora", series: "3 x 10" },
    ],
  },
  {
    titulo: "Superiores poupando o ombro",
    objetivo: "Resistência muscular",
    tone: "cta",
    itens: [
      { slug: "rosca-direta", series: "3 x 15" },
      { slug: "triceps-polia", series: "3 x 15" },
      { slug: "puxada-alta", series: "3 x 12" },
    ],
  },
];

export function Protocolos() {
  const plan = useUser((s) => s.plan);
  const premium = isPremiumUnlocked(plan);
  const { alunos, prescricoes } = useAlunos();
  const nomeAluno = (id: string) => alunos.find((a) => a.id === id)?.nome ?? "—";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Exclusivo Profissional"
        icon={<Crown className="h-3 w-3" />}
        title="Protocolos"
        subtitle="Modelos de prescrição por objetivo, prontos para aplicar a um aluno — e o histórico das suas prescrições."
        right={
          premium ? (
            <Pill tone="success">Ativo no seu plano</Pill>
          ) : (
            <Link to="/pricing" className={buttonClasses("primary", "sm")}>
              <Crown className="h-4 w-4" /> Assinar Profissional
            </Link>
          )
        }
      />

      <div className="relative">
        <div
          className={cn("space-y-6", !premium && "pointer-events-none select-none blur-[5px] saturate-50")}
          aria-hidden={!premium}
        >
          {/* Modelos por objetivo */}
          <div>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Modelos por objetivo</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {MODELOS.map((m) => (
                <Card key={m.titulo} className="flex flex-col p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-tint text-primary">
                      <ClipboardList className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-display font-bold text-ink">{m.titulo}</h3>
                      <Pill tone={m.tone}>{m.objetivo}</Pill>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {m.itens.map((it) => (
                      <li key={it.slug} className="flex items-center justify-between gap-2 text-sm">
                        <Link to={`/movement-lab/${it.slug}`} className="inline-flex min-w-0 items-center gap-1.5 text-ink hover:text-primary">
                          <FlaskConical className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                          <span className="truncate">{nomeEx(it.slug)}</span>
                        </Link>
                        <span className="shrink-0 text-xs text-ink-3">{it.series}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/alunos" className={cn(buttonClasses("secondary", "sm"), "mt-4")}>
                    <Dumbbell className="h-4 w-4" /> Aplicar a um aluno
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* Suas prescrições */}
          <div>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Suas prescrições</h2>
            {prescricoes.length === 0 ? (
              <Card className="p-6 text-center text-sm text-ink-2">
                Ainda não há prescrições. Gere uma no GPS e salve no perfil de um aluno.
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {prescricoes.map((p) => (
                  <Link
                    key={p.id}
                    to={`/alunos/${p.alunoId}`}
                    className="flex flex-col rounded-card border border-border bg-surface p-4 shadow-soft transition-colors hover:bg-surface-soft"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-ink">{p.titulo}</span>
                      <Pill tone={p.status === "ativa" ? "success" : "neutral"}>{p.status}</Pill>
                    </div>
                    <div className="mt-0.5 text-xs text-ink-3">
                      {nomeAluno(p.alunoId)} · {fmtData(p.data)}
                    </div>
                    <div className="mt-2 text-sm text-ink-2">
                      {p.itens.map((it) => nomeEx(it.slug)).join(" · ")}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {!premium && (
          <div className="absolute inset-0 z-10 grid place-items-center p-4">
            <div className="max-w-sm rounded-card border border-border bg-surface/95 p-6 text-center shadow-elevated backdrop-blur">
              <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full gradient-cta text-white">
                <Lock className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-bold text-ink">Protocolos é do plano Profissional</h3>
              <p className="mt-1 text-sm text-ink-2">
                Modelos prontos por objetivo e o histórico das suas prescrições liberam ao assinar.
              </p>
              <Link to="/pricing" className={cn(buttonClasses("primary"), "mt-4")}>
                <Crown className="h-4 w-4" /> Assinar Profissional
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
