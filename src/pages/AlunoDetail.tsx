import * as React from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Navigation,
  CalendarPlus,
  Target,
  Dumbbell,
  Activity,
  AlertTriangle,
  X,
  Clock,
  FlaskConical,
  HeartPulse,
  Route as RouteIcon,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { useAlunos, useUser, isPremiumUnlocked, uid } from "@/lib/store";
import { exercises } from "@/data/exercises";
import type { Aluno, Avaliacao } from "@/data/alunos";
import { getSpecialGroup } from "@/data/specialGroups";
import { ModalidadePills, ParametroPills, CriteriosLista } from "@/components/special/SpecialUI";
import { useDialog } from "@/lib/useDialog";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);
const nomeEx = (slug: string) => exercises.find((e) => e.slug === slug)?.nome ?? slug;

export function AlunoDetail() {
  const { id = "" } = useParams();
  const { alunos, avaliacoes, prescricoes, addAvaliacao, updateAluno } = useAlunos();
  const [avaliar, setAvaliar] = React.useState(false);

  const aluno = alunos.find((a) => a.id === id);
  if (!aluno) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-ink-2">Aluno não encontrado.</p>
        <Link to="/alunos" className={cn(buttonClasses("secondary"), "mt-4")}>
          Voltar para Alunos
        </Link>
      </div>
    );
  }

  const avals = avaliacoes.filter((a) => a.alunoId === id).sort((a, b) => a.data - b.data);
  const avalsDesc = [...avals].reverse();
  const prescs = prescricoes.filter((p) => p.alunoId === id).sort((a, b) => b.data - a.data);
  const reavaliacaoVencida = aluno.proximaReavaliacaoEm ? aluno.proximaReavaliacaoEm < Date.now() : false;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link to="/alunos" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Alunos
      </Link>

      {/* Cabeçalho */}
      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl gradient-brand text-xl font-bold text-white">
            {aluno.iniciais}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{aluno.nome}</h1>
              <Pill tone={aluno.status === "ativo" ? "success" : "neutral"}>{aluno.status}</Pill>
            </div>
            <p className="mt-1 text-sm text-ink-2">
              {aluno.idade ? `${aluno.idade} anos · ` : ""}
              {aluno.sexo ? `${aluno.sexo} · ` : ""}
              {aluno.objetivo} · {aluno.nivel}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {aluno.restricoes.length > 0 ? (
                aluno.restricoes.map((r) => (
                  <Pill key={r} tone="warning" icon={<AlertTriangle className="h-3 w-3" />}>
                    {r}
                  </Pill>
                ))
              ) : (
                <Pill tone="neutral">Sem restrição</Pill>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAvaliar(true)} className={buttonClasses("secondary")}>
              <CalendarPlus className="h-4 w-4" /> Nova avaliação
            </button>
            <Link to={`/gps?aluno=${aluno.id}`} className={buttonClasses("primary")}>
              <Navigation className="h-4 w-4" /> Prescrever
            </Link>
          </div>
        </div>
      </Card>

      {/* Jornada de Prescrição */}
      <JornadaCard aluno={aluno} onFase={(n) => updateAluno(aluno.id, { faseJornada: n })} />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Coluna principal: evolução + avaliações */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5 md:p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e0f7f9] text-analysis">
                <Activity className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg font-bold text-ink">Evolução</h2>
            </div>
            <Evolucao avals={avals} />
          </Card>

          <Card className="p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Avaliações</h2>
              <button onClick={() => setAvaliar(true)} className={buttonClasses("secondary", "sm")}>
                <CalendarPlus className="h-4 w-4" /> Registrar
              </button>
            </div>
            {avalsDesc.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-2">Nenhuma avaliação registrada ainda.</p>
            ) : (
              <ol className="space-y-3">
                {avalsDesc.map((av) => (
                  <li key={av.id} className="flex gap-3 rounded-xl border border-border p-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-soft text-ink-2">
                      <Clock className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="font-semibold text-ink">{fmtData(av.data)}</span>
                        {av.medidas.peso != null && <Medida label="Peso" value={`${av.medidas.peso} kg`} />}
                        {av.medidas.percentualGordura != null && (
                          <Medida label="% gordura" value={`${av.medidas.percentualGordura}%`} />
                        )}
                        {av.dorEscala != null && <Medida label="Dor" value={`${av.dorEscala}/10`} />}
                      </div>
                      {av.observacoes && <p className="mt-1 text-sm text-ink-2">{av.observacoes}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* Coluna lateral: perfil + prescrições */}
        <div className="space-y-4">
          <Card className="p-5 md:p-6">
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Perfil de treino</h2>
            <dl className="space-y-3 text-sm">
              <Info icon={<Target className="h-4 w-4 text-primary" />} label="Objetivo" value={aluno.objetivo} />
              <Info icon={<Activity className="h-4 w-4 text-analysis" />} label="Nível" value={aluno.nivel} />
              <div>
                <dt className="mb-1 flex items-center gap-2 text-ink-3">
                  <Dumbbell className="h-4 w-4" /> Equipamentos
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {aluno.equipamentos.map((eq) => (
                    <Pill key={eq} tone="neutral">
                      {eq}
                    </Pill>
                  ))}
                </dd>
              </div>
              {aluno.proximaReavaliacaoEm && (
                <Info
                  icon={<CalendarPlus className={cn("h-4 w-4", reavaliacaoVencida ? "text-warning" : "text-ink-3")} />}
                  label="Reavaliação"
                  value={
                    reavaliacaoVencida
                      ? `vencida (${fmtData(aluno.proximaReavaliacaoEm)})`
                      : `em ${diasAte(aluno.proximaReavaliacaoEm)} dias`
                  }
                />
              )}
            </dl>
            {aluno.observacoes && (
              <p className="mt-3 rounded-xl border border-border bg-surface-soft p-3 text-sm text-ink-2">
                {aluno.observacoes}
              </p>
            )}
          </Card>

          <Card className="p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Prescrições</h2>
              <Link to={`/gps?aluno=${aluno.id}`} className="text-sm font-semibold text-primary hover:underline">
                Nova
              </Link>
            </div>
            {prescs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center">
                <p className="text-sm text-ink-2">Sem prescrição ainda.</p>
                <Link to={`/gps?aluno=${aluno.id}`} className={cn(buttonClasses("primary", "sm"), "mt-3")}>
                  <Navigation className="h-4 w-4" /> Prescrever agora
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {prescs.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-ink">{p.titulo}</span>
                      <Pill tone={p.status === "ativa" ? "success" : "neutral"}>{p.status}</Pill>
                    </div>
                    <div className="tabular mb-2 text-xs text-ink-3">{fmtData(p.data)}</div>
                    <ul className="space-y-1">
                      {p.itens.map((it) => (
                        <li key={it.slug} className="flex items-center justify-between gap-2 text-sm">
                          <Link to={`/movement-lab/${it.slug}`} className="inline-flex min-w-0 items-center gap-1.5 text-ink hover:text-primary">
                            <FlaskConical className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                            <span className="truncate">{nomeEx(it.slug)}</span>
                          </Link>
                          {it.series && <span className="shrink-0 text-xs text-ink-3">{it.series}</span>}
                        </li>
                      ))}
                    </ul>
                    {p.observacoes && <p className="mt-2 text-xs text-ink-2">{p.observacoes}</p>}
                    {p.raciocinio && (
                      <p className="mt-1 text-xs text-ink-3">
                        <span className="font-semibold">Raciocínio: </span>
                        {p.raciocinio}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {avaliar && (
        <NovaAvaliacaoModal
          onClose={() => setAvaliar(false)}
          onSave={(av) => {
            addAvaliacao(av);
            setAvaliar(false);
          }}
          alunoId={aluno.id}
        />
      )}
    </div>
  );
}

function JornadaCard({ aluno, onFase }: { aluno: Aluno; onFase: (n: 1 | 2 | 3 | 4) => void }) {
  const unlocked = isPremiumUnlocked(useUser((s) => s.plan));
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;

  if (!grupo) {
    return (
      <Card className="flex flex-wrap items-center gap-3 p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
          <HeartPulse className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-ink">Jornada de Prescrição</div>
          <p className="text-sm text-ink-2">
            Associe um grupo especial para guiar modalidades, parâmetros e progressão deste aluno.
          </p>
        </div>
        <Link to="/special-groups" className={buttonClasses("secondary", "sm")}>
          Escolher grupo <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    );
  }

  if (grupo.premium && !unlocked) {
    return (
      <Card className="flex flex-wrap items-center gap-3 p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff1e6] text-[color:var(--cta-text)]">
          <HeartPulse className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-ink">Jornada de Prescrição · {grupo.nome}</div>
          <p className="text-sm text-ink-2">Este grupo faz parte do plano Profissional. Assine para ver a jornada.</p>
        </div>
        <Link to="/pricing" className={buttonClasses("primary", "sm")}>
          Assinar
        </Link>
      </Card>
    );
  }

  // Modalidades/parâmetros seguem a FASE selecionada (evita dessincronizar ao trocar de fase).
  const fase = (Math.min(4, Math.max(1, aluno.faseJornada ?? 1))) as 1 | 2 | 3 | 4;
  const faseObj = grupo.fases[fase - 1] ?? grupo.fases[0];
  const modalidades = faseObj.modalidades;
  const parametros = faseObj.parametros;

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
            <RouteIcon className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-ink">Jornada de Prescrição</h2>
        </div>
        <Link to={`/special-groups/${grupo.slug}`} className="text-sm font-semibold text-primary hover:underline">
          Ver jornada completa
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div>
            <RotuloJ>Grupo especial</RotuloJ>
            <div className="font-semibold text-ink">{grupo.nome}</div>
          </div>
          <div>
            <RotuloJ>Fase atual</RotuloJ>
            <div className="mb-2 flex gap-1.5">
              {([1, 2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => onFase(n)}
                  aria-label={`Definir fase ${n}`}
                  className={cn(
                    "h-8 w-8 rounded-full text-sm font-bold transition-colors",
                    n === fase ? "gradient-brand text-white" : "bg-surface-soft text-ink-2 hover:bg-primary-tint",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="text-sm font-semibold text-ink">{faseObj.nome}</div>
            <p className="text-sm text-ink-2">{faseObj.objetivo}</p>
          </div>
          <div>
            <RotuloJ>Modalidades recomendadas</RotuloJ>
            <ModalidadePills ids={modalidades} />
          </div>
          <div>
            <RotuloJ>Parâmetros a acompanhar</RotuloJ>
            <ParametroPills ids={parametros} />
          </div>
        </div>

        <div className="space-y-3">
          <CriteriosLista titulo="Próximos critérios para avançar" itens={faseObj.criteriosAvancar} tipo="avancar" />
          <div className="rounded-xl border border-warning/30 bg-[#fef4e2]/40 p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-warning">Cautelas</div>
            <ul className="space-y-1">
              {grupo.riscosCautelas.slice(0, 3).map((c) => (
                <li key={c} className="flex gap-2 text-sm text-ink-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <Link to={`/gps?aluno=${aluno.id}`} className={cn(buttonClasses("primary"), "w-full")}>
            <Navigation className="h-4 w-4" /> Gerar plano orientado por jornada
          </Link>
        </div>
      </div>
    </Card>
  );
}

function RotuloJ({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-3">{children}</div>;
}

function Medida({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-ink-2">
      {label}: <span className="font-semibold text-ink">{value}</span>
    </span>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-ink-3">
        {icon} {label}
      </dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Evolucao({ avals }: { avals: Avaliacao[] }) {
  const metrics: { key: "peso" | "percentualGordura"; label: string; unit: string }[] = [
    { key: "peso", label: "Peso", unit: "kg" },
    { key: "percentualGordura", label: "% gordura", unit: "%" },
  ];
  const disponiveis = metrics.filter((m) => avals.some((a) => a.medidas[m.key] != null));
  const [metric, setMetric] = React.useState(disponiveis[0]?.key ?? "peso");

  if (avals.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-2">Registre avaliações para ver a evolução.</p>;
  }

  const cfg = metrics.find((m) => m.key === metric) ?? metrics[0];
  const serie = avals.map((a) => a.medidas[cfg.key]).filter((v): v is number => v != null);
  const primeiro = serie[0];
  const ultimo = serie[serie.length - 1];
  const delta = ultimo != null && primeiro != null ? +(ultimo - primeiro).toFixed(1) : 0;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {disponiveis.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium",
                metric === m.key ? "bg-primary-tint text-primary" : "text-ink-2 hover:bg-surface-soft",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        {serie.length >= 2 && (
          <span className="text-sm text-ink-2">
            {cfg.label}: {ultimo}
            {cfg.unit} ·{" "}
            <span className={cn("font-semibold", delta <= 0 ? "text-success" : "text-[color:var(--cta-text)]")}>
              {delta > 0 ? "+" : ""}
              {delta}
              {cfg.unit}
            </span>{" "}
            no período
          </span>
        )}
      </div>
      {serie.length < 2 ? (
        <p className="py-4 text-center text-sm text-ink-3">Ao menos duas avaliações para traçar a curva.</p>
      ) : (
        <MiniLine values={serie} />
      )}
    </div>
  );
}

function MiniLine({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coord = (v: number, i: number) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 40 - ((v - min) / range) * 34 - 3;
    return { x, y };
  };
  const pts = values.map((v, i) => {
    const c = coord(v, i);
    return `${c.x},${c.y}`;
  });
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-28 w-full">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {values.map((v, i) => {
        const c = coord(v, i);
        return <circle key={i} cx={c.x} cy={c.y} r={3} fill="var(--primary)" vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}

function NovaAvaliacaoModal({
  onClose,
  onSave,
  alunoId,
}: {
  onClose: () => void;
  onSave: (av: Avaliacao) => void;
  alunoId: string;
}) {
  const [peso, setPeso] = React.useState("");
  const [gordura, setGordura] = React.useState("");
  const [dor, setDor] = React.useState("");
  const [obs, setObs] = React.useState("");
  const dialogRef = useDialog<HTMLDivElement>(onClose);

  const num = (s: string) => (s.trim() === "" ? undefined : Number(s.replace(",", ".")));

  const save = () => {
    onSave({
      id: uid(),
      alunoId,
      data: Date.now(),
      medidas: { peso: num(peso), percentualGordura: num(gordura) },
      dorEscala: num(dor),
      observacoes: obs.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Nova avaliação"
        className="w-full max-w-md rounded-card bg-surface p-5 shadow-elevated outline-none md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Nova avaliação</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Peso (kg)</span>
            <input value={peso} onChange={(e) => setPeso(e.target.value)} inputMode="decimal" placeholder="Ex.: 70" className="input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">% de gordura</span>
            <input value={gordura} onChange={(e) => setGordura(e.target.value)} inputMode="decimal" placeholder="Ex.: 28" className="input" />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Dor percebida (0–10)</span>
          <input value={dor} onChange={(e) => setDor(e.target.value.replace(/[^\d]/g, "").slice(0, 2))} inputMode="numeric" placeholder="Ex.: 2" className="input" />
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Observações</span>
          <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Evolução, queixas, ajustes..." className="input" />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className={buttonClasses("secondary", "sm")}>
            Cancelar
          </button>
          <button onClick={save} className={buttonClasses("primary", "sm")}>
            Salvar avaliação
          </button>
        </div>
      </div>
    </div>
  );
}
