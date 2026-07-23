import * as React from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Crown,
  Lock,
  FlaskConical,
  Dumbbell,
  X,
  BookOpen,
  CalendarDays,
  Gauge,
  ArrowUpRight,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  Users,
  Flame,
  Wind,
  Zap,
  Repeat,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, LinhaDeDose, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { useUser, useAlunos, isPremiumUnlocked } from "@/lib/store";
import { exercises } from "@/data/exercises";
import { getParam } from "@/data/monitoringParameters";
import { bibliografia } from "@/data/referencias";
import {
  protocolos,
  PROTOCOLO_CATEGORIAS,
  PROTOCOLO_CATEGORIA_META,
  type Protocolo,
  type ProtocoloCategoria,
} from "@/data/protocolos";
import { useDialog } from "@/lib/useDialog";
import { cn } from "@/lib/utils";

const CATEGORIA_ICON: Record<string, LucideIcon> = {
  Flame,
  Wind,
  Dumbbell,
  Zap,
  Repeat,
  HeartPulse,
  ShieldCheck,
};
const catTile: Record<string, string> = {
  primary: "bg-primary-tint text-primary",
  analysis: "bg-analysis-tint text-analysis",
  success: "bg-success-tint text-success",
  cta: "bg-cta-tint text-cta-text",
  warning: "bg-warning-tint text-cta-text",
};

const nomeEx = (slug: string) => exercises.find((e) => e.slug === slug)?.nome ?? slug;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));

export function Protocolos() {
  const { alunos, prescricoes } = useAlunos();
  const nomeAluno = (id: string) => alunos.find((a) => a.id === id)?.nome ?? "aluno";
  const [base, setBase] = React.useState<Protocolo | null>(null);
  // Navegação em dois níveis: escolhe a categoria e vê os protocolos dela.
  const [categoria, setCategoria] = React.useState<ProtocoloCategoria | null>(null);

  const listaDaCategoria = categoria
    ? protocolos.filter((p) => p.categoria === categoria).sort((a, b) => (a.ordemFase ?? 0) - (b.ordemFase ?? 0))
    : [];
  const emFamilia = listaDaCategoria.length > 1 && listaDaCategoria.every((p) => p.familia);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Estudo e referência"
        icon={<ClipboardList className="h-3 w-3" />}
        title="Protocolos"
        subtitle="Modelos por objetivo, com público-alvo, respaldo da literatura e a estrutura da semana. Material de estudo; escolha uma categoria para consultar."
      />

      {/* Página de ESTUDO: os protocolos são gerais. Cada aluno tem treino próprio, que
          nasce da avaliação e do direcionamento no perfil dele. */}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-tint text-primary">
          <Users className="h-4 w-4" />
        </span>
        <p className="min-w-0 flex-1 text-sm text-ink-2">
          Estes protocolos são gerais, para estudo. Cada aluno tem um treino próprio, que nasce da
          avaliação e do direcionamento no perfil dele.
        </p>
        <Link to="/alunos" className={buttonClasses("secondary", "sm")}>
          Ver meus alunos <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      <div className="relative">
        <div className="space-y-7">
          {/* Nível 1: blocos de categoria */}
          {!categoria ? (
            <section>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PROTOCOLO_CATEGORIAS.map((cat) => {
                  const qtd = protocolos.filter((p) => p.categoria === cat).length;
                  if (qtd === 0) return null;
                  const meta = PROTOCOLO_CATEGORIA_META[cat];
                  const Icon = CATEGORIA_ICON[meta.icon] ?? ClipboardList;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoria(cat)}
                      className="flex items-start gap-3 rounded-card border border-border bg-surface p-5 text-left shadow-soft transition-colors hover:border-primary hover:bg-primary-tint"
                    >
                      <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", catTile[meta.tone])}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-bold text-ink">{cat}</div>
                        <p className="mt-0.5 text-sm text-ink-2">{meta.descricao}</p>
                        <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                          {qtd} protocolo{qtd > 1 ? "s" : ""} <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            /* Nível 2: protocolos da categoria escolhida */
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <button onClick={() => setCategoria(null)} className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink">
                    <ArrowLeft className="h-4 w-4" /> Todas as categorias
                  </button>
                  <h2 className="font-display text-xl font-bold text-ink">{categoria}</h2>
                  <p className="text-sm text-ink-2">{PROTOCOLO_CATEGORIA_META[categoria].descricao}</p>
                </div>
                {emFamilia && (
                  <span className="text-xs text-ink-3">Jornada em {listaDaCategoria.length} fases por tempo de treino</span>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {listaDaCategoria.map((p, i) => (
                  <ProtocoloCard
                    key={p.id}
                    p={p}
                    passo={emFamilia ? { atual: i + 1, total: listaDaCategoria.length } : undefined}
                    onBase={() => setBase(p)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Suas prescrições */}
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Suas prescrições</h2>
            {prescricoes.length === 0 ? (
              <Card className="p-6 text-center text-sm text-ink-2">
                Ainda não há prescrições. Use o Prescrever exercício ou o Prescrever treino e salve no perfil de um aluno.
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
          </section>
        </div>
      </div>

      {base && <BaseCientificaModal p={base} onClose={() => setBase(null)} />}
    </div>
  );
}

const TONE_ICON: Record<string, string> = {
  primary: "bg-primary-tint text-primary",
  analysis: "bg-analysis-tint text-analysis",
  success: "bg-success-tint text-success",
  cta: "bg-cta-tint text-cta-text",
  warning: "bg-warning-tint text-cta-text",
};

function ProtocoloCard({
  p,
  passo,
  onBase,
}: {
  p: Protocolo;
  passo?: { atual: number; total: number };
  onBase: () => void;
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="mb-3 flex items-start gap-2">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", TONE_ICON[p.tone] ?? TONE_ICON.primary)}>
          <ClipboardList className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold leading-snug text-ink">{p.fase ? p.titulo : p.titulo}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {p.fase ? (
              <Pill tone={p.tone}>{p.fase}</Pill>
            ) : (
              <Pill tone="neutral">{p.nivelIndicado}</Pill>
            )}
            {passo && (
              <span className="text-2xs font-medium text-ink-3">
                Fase {passo.atual} de {passo.total}
              </span>
            )}
          </div>
        </div>
      </div>

      {p.tempoTreino && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-ink-2">
          <CalendarDays className="h-3.5 w-3.5 text-ink-3" /> {p.tempoTreino}
        </div>
      )}
      <p className="mb-2 text-sm text-ink-2">{p.resumo}</p>

      {/* Público-alvo: para quem este protocolo é indicado */}
      <div className="mb-3 flex items-start gap-1.5 rounded-xl bg-surface-soft p-2.5 text-xs text-ink-2">
        <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" />
        <span>
          <span className="font-semibold text-ink">Para quem. </span>
          {p.publico}
        </span>
      </div>

      {/* Nome e dose vinculados (LinhaDeDose): a dose fica logo abaixo do exercicio,
          nunca empurrada para a borda oposta por justify-between. */}
      <ul className="mb-3 overflow-hidden rounded-lg border border-border">
        {p.itens.map((it) => (
          <LinhaDeDose
            key={it.slug}
            icon={<FlaskConical className="h-3.5 w-3.5" />}
            nome={
              <Link to={`/movement-lab/${it.slug}`} className="hover:text-primary">
                {nomeEx(it.slug)}
              </Link>
            }
          >
            {it.series ? (
              <>
                <span className="text-ink-3">Dose: </span>
                {it.series}
              </>
            ) : null}
          </LinhaDeDose>
        ))}
      </ul>

      <div className="mb-3 rounded-xl bg-surface-soft p-2.5 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1 font-semibold text-ink">
          <CalendarDays className="h-3.5 w-3.5 text-ink-3" /> {p.frequencia}
        </span>
        <span className="mx-1.5 text-ink-3">·</span>
        {p.estruturaSemanal}
      </div>

      <div className="mt-auto">
        <button onClick={onBase} className={cn(buttonClasses("secondary", "sm"), "w-full")}>
          <BookOpen className="h-4 w-4" /> Base científica
        </button>
      </div>
    </Card>
  );
}

/** Detalha o respaldo do protocolo: indicação, base, parâmetros, progressão e bibliografia. */
function BaseCientificaModal({ p, onClose }: { p: Protocolo; onClose: () => void }) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const refs = bibliografia(p.refIds);
  const params = (p.parametros ?? []).map((id) => getParam(id)?.nome).filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Base científica: ${p.titulo}`}
        className="flex max-h-modal w-full max-w-lg flex-col overflow-hidden rounded-card bg-surface shadow-overlay outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-border p-5">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">Base científica</div>
            <h2 className="font-display text-lg font-bold text-ink">{p.titulo}</h2>
            {p.fase && <div className="mt-0.5 text-sm text-ink-2">{p.fase}{p.tempoTreino ? ` · ${p.tempoTreino}` : ""}</div>}
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-5">
          <Bloco titulo="Público-alvo" icon={<Users className="h-3.5 w-3.5" />}>{p.publico}</Bloco>
          <Bloco titulo="Para quem é indicado">{p.indicacao}</Bloco>
          <Bloco titulo="Por que este arranjo" icon={<BookOpen className="h-3.5 w-3.5" />}>
            {p.base}
          </Bloco>
          <Bloco titulo="Como fica a semana" icon={<CalendarDays className="h-3.5 w-3.5" />}>
            <span className="font-semibold text-ink">{p.frequencia}.</span> {p.estruturaSemanal}
          </Bloco>

          {params.length > 0 && (
            <div>
              <RotuloBloco icon={<Gauge className="h-3.5 w-3.5" />}>O que monitorar</RotuloBloco>
              <div className="flex flex-wrap gap-1.5">
                {params.map((n) => (
                  <Pill key={n} tone="analysis">
                    {n}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          {p.progressao && (
            <Bloco titulo="Critério para progredir" icon={<ArrowUpRight className="h-3.5 w-3.5" />}>
              {p.progressao}
            </Bloco>
          )}

          {p.cautelas && p.cautelas.length > 0 && (
            <div className="rounded-xl border border-[#f4d9b8] bg-warning-tint p-3">
              <RotuloBloco icon={<ShieldAlert className="h-3.5 w-3.5 text-[color:var(--cta-text)]" />}>
                Cuidados
              </RotuloBloco>
              <ul className="ml-4 list-disc space-y-1 text-sm text-ink-2">
                {p.cautelas.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {refs.length > 0 && (
            <div>
              <RotuloBloco icon={<BookOpen className="h-3.5 w-3.5" />}>Referências</RotuloBloco>
              <ol className="space-y-1.5 text-xs text-ink-2">
                {refs.map(({ n, ref }) => (
                  <li key={ref.id} className="flex gap-2">
                    <span className="font-semibold text-ink-3">{n}.</span>
                    <span>
                      {ref.autores}. <span className="italic">{ref.titulo}</span>. {ref.fonte}, {ref.ano}.
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 text-2xs leading-relaxed text-ink-3">
          Modelo de apoio à decisão do profissional habilitado. Ajuste séries, cargas, volume e restrições ao contexto
          do aluno; não substitui avaliação individualizada.
        </div>
      </div>
    </div>
  );
}

function Bloco({ titulo, icon, children }: { titulo: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <RotuloBloco icon={icon}>{titulo}</RotuloBloco>
      <p className="text-sm leading-relaxed text-ink-2">{children}</p>
    </div>
  );
}

function RotuloBloco({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">
      {icon}
      {children}
    </div>
  );
}
