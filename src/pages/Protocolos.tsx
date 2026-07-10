import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Crown,
  Lock,
  FlaskConical,
  Dumbbell,
  X,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Gauge,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { useUser, useAlunos, isPremiumUnlocked, uid } from "@/lib/store";
import { exercises } from "@/data/exercises";
import { getParam } from "@/data/monitoringParameters";
import { bibliografia } from "@/data/referencias";
import {
  protocolos,
  PROTOCOLO_CATEGORIAS,
  type Protocolo,
} from "@/data/protocolos";
import { useDialog } from "@/lib/useDialog";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const nomeEx = (slug: string) => exercises.find((e) => e.slug === slug)?.nome ?? slug;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));

export function Protocolos() {
  const plan = useUser((s) => s.plan);
  const premium = isPremiumUnlocked(plan);
  const { alunos, prescricoes } = useAlunos();
  const nomeAluno = (id: string) => alunos.find((a) => a.id === id)?.nome ?? "aluno";
  const [aplicar, setAplicar] = React.useState<Protocolo | null>(null);
  const [base, setBase] = React.useState<Protocolo | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Exclusivo Profissional"
        icon={<Crown className="h-3 w-3" />}
        title="Protocolos"
        subtitle="Modelos por objetivo, com o respaldo da literatura e a estrutura da semana, prontos para aplicar a um aluno. Inclui o histórico das suas prescrições."
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
          className={cn("space-y-7", !premium && "pointer-events-none select-none blur-[5px] saturate-50")}
          aria-hidden={!premium}
        >
          {/* Modelos por categoria */}
          {PROTOCOLO_CATEGORIAS.map((cat) => {
            const lista = protocolos
              .filter((p) => p.categoria === cat)
              .sort((a, b) => (a.ordemFase ?? 0) - (b.ordemFase ?? 0));
            if (lista.length === 0) return null;
            const emFamilia = lista.length > 1 && lista.every((p) => p.familia);
            return (
              <section key={cat}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-ink">{cat}</h2>
                  {emFamilia && (
                    <span className="text-xs text-ink-3">Jornada em {lista.length} fases por tempo de treino</span>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {lista.map((p, i) => (
                    <ProtocoloCard
                      key={p.id}
                      p={p}
                      passo={emFamilia ? { atual: i + 1, total: lista.length } : undefined}
                      onAplicar={() => setAplicar(p)}
                      onBase={() => setBase(p)}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Suas prescrições */}
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Suas prescrições</h2>
            {prescricoes.length === 0 ? (
              <Card className="p-6 text-center text-sm text-ink-2">
                Ainda não há prescrições. Use o Prescrever e salve no perfil de um aluno, ou aplique um modelo acima.
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

        {!premium && (
          <div className="absolute inset-0 z-10 grid place-items-center p-4">
            <div className="max-w-sm rounded-card border border-border bg-surface/95 p-6 text-center shadow-elevated backdrop-blur">
              <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full gradient-cta text-white">
                <Lock className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-bold text-ink">Protocolos é do plano Profissional</h3>
              <p className="mt-1 text-sm text-ink-2">
                Modelos por objetivo com respaldo da literatura e o histórico das suas prescrições liberam ao assinar.
              </p>
              <Link to="/pricing" className={cn(buttonClasses("primary"), "mt-4")}>
                <Crown className="h-4 w-4" /> Assinar Profissional
              </Link>
            </div>
          </div>
        )}
      </div>

      {base && <BaseCientificaModal p={base} onClose={() => setBase(null)} />}
      {aplicar && <AplicarProtocoloModal modelo={aplicar} onClose={() => setAplicar(null)} />}
    </div>
  );
}

const TONE_ICON: Record<string, string> = {
  primary: "bg-primary-tint text-primary",
  analysis: "bg-[#e0f7f9] text-analysis",
  success: "bg-[#e7f8ee] text-success",
  cta: "bg-[#fff1e6] text-[color:var(--cta-text)]",
  warning: "bg-[#fdf3e3] text-[color:var(--cta-text)]",
};

function ProtocoloCard({
  p,
  passo,
  onAplicar,
  onBase,
}: {
  p: Protocolo;
  passo?: { atual: number; total: number };
  onAplicar: () => void;
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
              <span className="text-[11px] font-medium text-ink-3">
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
      <p className="mb-3 text-sm text-ink-2">{p.resumo}</p>

      <ul className="mb-3 space-y-1.5">
        {p.itens.map((it) => (
          <li key={it.slug} className="flex items-center justify-between gap-2 text-sm">
            <Link
              to={`/movement-lab/${it.slug}`}
              className="inline-flex min-w-0 items-center gap-1.5 text-ink hover:text-primary"
            >
              <FlaskConical className="h-3.5 w-3.5 shrink-0 text-ink-3" />
              <span className="truncate">{nomeEx(it.slug)}</span>
            </Link>
            <span className="shrink-0 text-xs text-ink-3">{it.series}</span>
          </li>
        ))}
      </ul>

      <div className="mb-3 rounded-xl bg-surface-soft p-2.5 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1 font-semibold text-ink">
          <CalendarDays className="h-3.5 w-3.5 text-ink-3" /> {p.frequencia}
        </span>
        <span className="mx-1.5 text-ink-3">·</span>
        {p.estruturaSemanal}
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <button onClick={onBase} className={cn(buttonClasses("ghost", "sm"), "flex-1")}>
          <BookOpen className="h-4 w-4" /> Base científica
        </button>
        <button onClick={onAplicar} className={cn(buttonClasses("secondary", "sm"), "flex-1")}>
          <Dumbbell className="h-4 w-4" /> Aplicar a um aluno
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
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-card bg-surface shadow-elevated outline-none"
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
            <div className="rounded-xl border border-[#f4d9b8] bg-[#fdf6ec] p-3">
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

        <div className="border-t border-border p-4 text-[11px] leading-relaxed text-ink-3">
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

/** Aplica um modelo de protocolo a um aluno ativo, criando uma prescrição de verdade. */
function AplicarProtocoloModal({ modelo, onClose }: { modelo: Protocolo; onClose: () => void }) {
  const navigate = useNavigate();
  const { alunos, addPrescricao } = useAlunos();
  const ativos = alunos.filter((a) => a.status === "ativo");
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const tituloDoc = modelo.fase ? `${modelo.titulo} (${modelo.fase})` : modelo.titulo;

  const aplicar = (alunoId: string) => {
    const aluno = alunos.find((a) => a.id === alunoId);
    if (!aluno) return;
    addPrescricao({
      id: uid(),
      alunoId,
      data: Date.now(),
      titulo: tituloDoc,
      answers: {
        objetivo: modelo.objetivo,
        grupoMuscular: "Corpo todo",
        prioridade: modelo.prioridade,
        nivel: aluno.nivel,
        restricao: aluno.restricoes[0] ?? "Nenhuma",
        equipamentos: aluno.equipamentos,
      },
      itens: modelo.itens.map((it) => ({ slug: it.slug, score: 0, series: it.series })),
      status: "ativa",
      frequenciaSemanal: modelo.frequencia,
      parametrosControle: modelo.parametros,
      criteriosProgressao: modelo.progressao ? [modelo.progressao] : undefined,
      raciocinio: modelo.base,
      observacoes:
        "Aplicado a partir de um modelo de protocolo; ajuste séries, cargas e as restrições do aluno antes de conduzir a sessão.",
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
          Modelo <span className="font-semibold text-ink">{tituloDoc}</span>. Escolha o aluno; a prescrição entra no
          perfil dele para você ajustar séries e cargas.
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
