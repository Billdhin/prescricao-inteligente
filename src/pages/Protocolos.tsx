import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, Crown, Lock, FlaskConical, Dumbbell, X, AlertTriangle } from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { useUser, useAlunos, isPremiumUnlocked, uid } from "@/lib/store";
import type { GpsObjetivo } from "@/lib/gps/engine";
import { exercises } from "@/data/exercises";
import { useDialog } from "@/lib/useDialog";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const nomeEx = (slug: string) => exercises.find((e) => e.slug === slug)?.nome ?? slug;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));

type Modelo = { titulo: string; objetivo: GpsObjetivo; tone: "primary" | "analysis" | "cta" | "success"; itens: { slug: string; series: string }[] };

const MODELOS: Modelo[] = [
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
  const nomeAluno = (id: string) => alunos.find((a) => a.id === id)?.nome ?? "aluno";
  const [aplicar, setAplicar] = React.useState<Modelo | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Exclusivo Profissional"
        icon={<Crown className="h-3 w-3" />}
        title="Protocolos"
        subtitle="Modelos de prescrição por objetivo, prontos para aplicar a um aluno, e o histórico das suas prescrições."
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
                  <button onClick={() => setAplicar(m)} className={cn(buttonClasses("secondary", "sm"), "mt-4")}>
                    <Dumbbell className="h-4 w-4" /> Aplicar a um aluno
                  </button>
                </Card>
              ))}
            </div>
          </div>

          {/* Suas prescrições */}
          <div>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Suas prescrições</h2>
            {prescricoes.length === 0 ? (
              <Card className="p-6 text-center text-sm text-ink-2">
                Ainda não há prescrições. Use o Prescrever e salve no perfil de um aluno.
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

      {aplicar && <AplicarProtocoloModal modelo={aplicar} onClose={() => setAplicar(null)} />}
    </div>
  );
}

/** Aplica um modelo de protocolo a um aluno ativo, criando uma prescrição de verdade. */
function AplicarProtocoloModal({ modelo, onClose }: { modelo: Modelo; onClose: () => void }) {
  const navigate = useNavigate();
  const { alunos, addPrescricao } = useAlunos();
  const ativos = alunos.filter((a) => a.status === "ativo");
  const dialogRef = useDialog<HTMLDivElement>(onClose);

  const aplicar = (alunoId: string) => {
    const aluno = alunos.find((a) => a.id === alunoId);
    if (!aluno) return;
    addPrescricao({
      id: uid(),
      alunoId,
      data: Date.now(),
      titulo: modelo.titulo,
      answers: {
        objetivo: modelo.objetivo,
        grupoMuscular: "Corpo todo",
        nivel: aluno.nivel,
        restricao: aluno.restricoes[0] ?? "Nenhuma",
        equipamentos: aluno.equipamentos,
      },
      itens: modelo.itens.map((it) => ({ slug: it.slug, score: 0, series: it.series })),
      status: "ativa",
      observacoes: "Aplicado a partir de um modelo de protocolo; ajuste séries e cargas ao contexto do aluno.",
    });
    toast(`Protocolo "${modelo.titulo}" aplicado a ${aluno.nome}`);
    navigate(`/alunos/${alunoId}`, { state: { prescricaoSalva: true } });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Aplicar ${modelo.titulo}`}
        className="max-h-[85vh] w-full max-w-md overflow-auto rounded-card bg-surface p-5 shadow-elevated outline-none md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-ink">Aplicar a um aluno</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-sm text-ink-2">
          Modelo <span className="font-semibold text-ink">{modelo.titulo}</span> ({modelo.objetivo}). Escolha o
          aluno; a prescrição entra no perfil dele para você ajustar séries e cargas.
        </p>
        {ativos.length === 0 ? (
          <Card className="p-5 text-center text-sm text-ink-2">
            Nenhum aluno ativo. Cadastre um aluno primeiro.
            <Link to="/alunos?novo=1" className={cn(buttonClasses("primary", "sm"), "mt-3")}>
              Cadastrar aluno
            </Link>
          </Card>
        ) : (
          <ul className="space-y-2">
            {ativos.map((a) => {
              const conflito = a.restricoes.length > 0;
              return (
                <li key={a.id}>
                  <button
                    onClick={() => aplicar(a.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary hover:bg-primary-tint"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
                      {a.iniciais}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{a.nome}</span>
                      <span className="block truncate text-xs text-ink-3">
                        {a.objetivo} · {a.nivel}
                      </span>
                    </span>
                    {conflito && (
                      <Pill tone="warning" icon={<AlertTriangle className="h-3 w-3" />}>
                        {a.restricoes[0]}
                      </Pill>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-[11px] leading-relaxed text-ink-3">
          Modelos são ponto de partida. Revise cargas, séries e as restrições do aluno antes de conduzir a sessão.
        </p>
      </div>
    </div>
  );
}
