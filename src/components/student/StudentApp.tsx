import * as React from "react";
import { CalendarDays, Dumbbell, TrendingUp, LogOut, ChevronDown, Clock, HeartPulse, CheckCircle2, Wallet } from "lucide-react";
import { Card, Pill } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { BrandProvider, type Marca } from "@/lib/brand/BrandContext";
import { Logo } from "@/components/brand/Logo";
import { GamificacaoView } from "@/components/student/GamificacaoView";
import { exercises } from "@/data/exercises";
import type { Aluno, Avaliacao } from "@/data/alunos";
import type { Execucao } from "@/data/execucao";
import { formatBRL, statusEfetivo, ROTULO_STATUS_COBRANCA } from "@/data/cobranca";
import {
  type PlanoTreino,
  type Microciclo,
  type Sessao,
  type BlocoSessao,
  semanaAtual,
  mesocicloAtual,
  getMetodo,
} from "@/data/periodizacao";

const nomeDoBloco = (b: BlocoSessao): string => {
  if (b.exercicioSlug) return exercises.find((e) => e.slug === b.exercicioSlug)?.nome ?? b.nome ?? b.exercicioSlug;
  return b.nome ?? b.modalidade ?? "Exercício";
};

const TIPO_SEMANA: Record<Microciclo["tipo"], { label: string; tone: "neutral" | "warning" | "success" }> = {
  carga: { label: "Semana de carga", tone: "success" },
  deload: { label: "Semana de descarga", tone: "warning" },
  teste: { label: "Semana de teste", tone: "neutral" },
};

type Aba = "hoje" | "plano" | "evolucao";

/**
 * Portal do aluno: o app com a marca do PROFISSIONAL, onde o aluno vê o próprio
 * treino e a periodização. Componente de apresentação puro, alimentado por
 * (aluno, plano, marca). Serve tanto para a prévia do profissional ("ver como o
 * aluno vê") quanto para a produção, quando o aluno logado carrega os próprios
 * dados via Supabase.
 */
export function StudentApp({
  aluno,
  plano,
  marca,
  avaliacoes = [],
  execucoes = [],
  onRegistrar,
  preview = false,
  onSair,
}: {
  aluno: Aluno;
  plano?: PlanoTreino;
  marca: Marca;
  avaliacoes?: Avaliacao[];
  /** o que o aluno já registrou (para marcar sessões feitas) */
  execucoes?: Execucao[];
  /** registra uma execução; ausente = portal só-leitura */
  onRegistrar?: (e: Execucao) => void;
  preview?: boolean;
  onSair?: () => void;
}) {
  const [aba, setAba] = React.useState<Aba>("hoje");
  const cor = marca.corPrimaria || "var(--primary)";

  return (
    <BrandProvider marca={marca}>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-bg" style={{ ["--primary" as string]: marca.corPrimaria || undefined }}>
        {preview && (
          <div className="px-4 py-1.5 text-center text-xs font-semibold text-white" style={{ background: cor }}>
            Prévia: é assim que o seu aluno vê o app
          </div>
        )}

        {/* Cabeçalho com a marca do profissional */}
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
          <Logo />
          {onSair && (
            <button
              onClick={onSair}
              className="rounded-lg p-2 text-ink-3 hover:bg-surface-soft hover:text-ink"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </header>

        <main className="flex-1 space-y-4 p-4 pb-24">
          <div>
            <p className="text-sm text-ink-3">Olá, {aluno.nome.split(" ")[0]}</p>
            <h1 className="font-display text-2xl font-bold text-ink">
              {aba === "hoje" ? "Seu treino" : aba === "plano" ? "Seu plano" : "Sua evolução"}
            </h1>
          </div>

          {aba === "hoje" && (
            <AbaHoje plano={plano} cor={cor} aluno={aluno} execucoes={execucoes} onRegistrar={onRegistrar} />
          )}
          {aba === "plano" && <AbaPlano plano={plano} cor={cor} aluno={aluno} />}
          {aba === "evolucao" && (
            <AbaEvolucao aluno={aluno} avaliacoes={avaliacoes} execucoes={execucoes} cor={cor} />
          )}
        </main>

        {/* Barra inferior */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
          aria-label="Navegação"
        >
          {(
            [
              { id: "hoje", label: "Treino", Icon: Dumbbell },
              { id: "plano", label: "Plano", Icon: CalendarDays },
              { id: "evolucao", label: "Evolução", Icon: TrendingUp },
            ] as const
          ).map(({ id, label, Icon }) => {
            const ativo = aba === id;
            return (
              <button
                key={id}
                onClick={() => setAba(id)}
                aria-current={ativo ? "page" : undefined}
                className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium leading-none transition-colors"
                style={ativo ? { color: cor } : undefined}
              >
                <Icon className={cn("h-5 w-5", !ativo && "text-ink-3")} />
                <span className={cn(!ativo && "text-ink-3")}>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </BrandProvider>
  );
}

/* ------------------------------- Aba: Hoje -------------------------------- */

function AbaHoje({
  plano,
  cor,
  aluno,
  execucoes,
  onRegistrar,
}: {
  plano?: PlanoTreino;
  cor: string;
  aluno: Aluno;
  execucoes: Execucao[];
  onRegistrar?: (e: Execucao) => void;
}) {
  if (!plano) return <SemPlano />;
  const semana = semanaAtual(plano);
  const meso = mesocicloAtual(plano);
  const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="primary">Semana {semana} de {plano.semanas}</Pill>
          {micro && <Pill tone={TIPO_SEMANA[micro.tipo].tone}>{TIPO_SEMANA[micro.tipo].label}</Pill>}
        </div>
        {meso && <p className="mt-2 text-sm text-ink-2">Fase atual: <strong className="text-ink">{meso.nome}</strong>. {meso.foco}</p>}
      </Card>

      {!micro || micro.sessoes.length === 0 ? (
        <Card className="p-6 text-center text-sm text-ink-2">Sem sessões nesta semana.</Card>
      ) : (
        micro.sessoes.map((s) => (
          <SessaoCard
            key={s.id}
            sessao={s}
            cor={cor}
            semana={semana}
            plano={plano}
            aluno={aluno}
            execucoes={execucoes}
            onRegistrar={onRegistrar}
          />
        ))
      )}
    </div>
  );
}

function SessaoCard({
  sessao,
  cor,
  semana,
  plano,
  aluno,
  execucoes,
  onRegistrar,
}: {
  sessao: Sessao;
  cor: string;
  semana: number;
  plano: PlanoTreino;
  aluno: Aluno;
  execucoes: Execucao[];
  onRegistrar?: (e: Execucao) => void;
}) {
  const [aberto, setAberto] = React.useState(false);
  const feitas = sessao.blocos.filter((b) => execucoes.some((e) => e.semana === semana && e.blocoRef === b.id)).length;
  return (
    <Card className="overflow-hidden p-0">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <div>
          <div className="font-display font-bold text-ink">{sessao.nome}</div>
          {sessao.foco && <div className="text-xs text-ink-3">{sessao.foco}</div>}
        </div>
        <div className="flex items-center gap-2">
          {feitas > 0 && <span className="text-xs font-semibold" style={{ color: cor }}>{feitas}/{sessao.blocos.length}</span>}
          <ChevronDown className={cn("h-5 w-5 shrink-0 text-ink-3 transition-transform", aberto && "rotate-180")} />
        </div>
      </button>
      {aberto && (
        <div className="space-y-2 border-t border-border p-3">
          {sessao.blocos.map((b) => (
            <BlocoRow
              key={b.id}
              bloco={b}
              cor={cor}
              semana={semana}
              planoId={plano.id}
              alunoId={aluno.id}
              sessaoRef={sessao.id}
              execFeita={execucoes.find((e) => e.semana === semana && e.blocoRef === b.id)}
              onRegistrar={onRegistrar}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function BlocoRow({
  bloco,
  cor,
  semana,
  planoId,
  alunoId,
  sessaoRef,
  execFeita,
  onRegistrar,
}: {
  bloco: BlocoSessao;
  cor: string;
  semana: number;
  planoId: string;
  alunoId: string;
  sessaoRef: string;
  execFeita?: Execucao;
  onRegistrar?: (e: Execucao) => void;
}) {
  const aerobio = bloco.tipo === "aerobio";
  const linhas = aerobio
    ? [bloco.formato, bloco.duracao, bloco.intensidade, bloco.recuperacao && bloco.recuperacao !== "-" ? `Recuperação: ${bloco.recuperacao}` : ""]
    : [bloco.series && bloco.reps ? `${bloco.series} x ${bloco.reps}` : bloco.series || bloco.reps, bloco.intensidade, bloco.intervalo ? `Intervalo: ${bloco.intervalo}` : ""];
  const detalhe = linhas.filter(Boolean).join(" · ");
  const metodo = getMetodo(bloco.metodo);
  const metodoVisivel = metodo && metodo.id !== "tradicional" ? metodo : undefined;

  const [carga, setCarga] = React.useState("");
  const [reps, setReps] = React.useState("");
  const [rpe, setRpe] = React.useState("");
  const podeRegistrar = !aerobio && !!onRegistrar;

  const registrar = () => {
    if (!onRegistrar) return;
    onRegistrar({
      id: `ex-${bloco.id}-s${semana}-${Date.now()}`,
      alunoId,
      planoId,
      semana,
      sessaoRef,
      blocoRef: bloco.id,
      exercicioSlug: bloco.exercicioSlug,
      cargaFeita: carga ? parseFloat(carga.replace(",", ".")) : undefined,
      repsFeitas: reps ? parseInt(reps, 10) : undefined,
      rpe: rpe ? parseInt(rpe, 10) : undefined,
      concluidoEm: Date.now(),
    });
    setCarga("");
    setReps("");
    setRpe("");
  };

  return (
    <div className="rounded-xl border border-border bg-surface-soft p-3">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: cor }}>
          {aerobio ? <HeartPulse className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1 font-semibold text-ink">{nomeDoBloco(bloco)}</span>
        {metodoVisivel && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
            style={{ background: cor }}
          >
            {metodoVisivel.nome}
          </span>
        )}
      </div>
      {detalhe && <p className="mt-1.5 text-sm text-ink-2">{detalhe}</p>}
      {metodoVisivel && <p className="mt-1 text-xs font-medium text-ink-2">Como fazer: {metodoVisivel.descricao}</p>}
      {bloco.observacao && <p className="mt-1 text-xs text-ink-3">{bloco.observacao}</p>}

      {podeRegistrar &&
        (execFeita ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold" style={{ color: cor }}>
            <CheckCircle2 className="h-4 w-4" />
            Feito: {execFeita.cargaFeita != null ? `${execFeita.cargaFeita} kg` : "sem carga"}
            {execFeita.repsFeitas != null ? ` x ${execFeita.repsFeitas}` : ""}
            {execFeita.rpe != null ? ` · RPE ${execFeita.rpe}` : ""}
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <CampoNum label="Carga (kg)" value={carga} onChange={setCarga} />
            <CampoNum label="Reps" value={reps} onChange={setReps} />
            <CampoNum label="RPE" value={rpe} onChange={setRpe} />
            <button
              onClick={registrar}
              className="rounded-lg px-3 py-2 text-xs font-bold text-white"
              style={{ background: cor }}
            >
              Registrar
            </button>
          </div>
        ))}
    </div>
  );
}

function CampoNum({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = React.useId();
  return (
    <div className="w-16">
      <label htmlFor={id} className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-ink-3">
        {label}
      </label>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}

/* ------------------------------- Aba: Plano ------------------------------- */

function AbaPlano({ plano, cor, aluno }: { plano?: PlanoTreino; cor: string; aluno: Aluno }) {
  const semana = plano ? semanaAtual(plano) : 0;
  if (!plano) {
    return (
      <div className="space-y-3">
        <MensalidadeCard aluno={aluno} cor={cor} />
        <SemPlano />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <MensalidadeCard aluno={aluno} cor={cor} />
      <Card className="p-4">
        <div className="font-display font-bold text-ink">{plano.titulo}</div>
        <p className="mt-1 text-sm text-ink-2">{plano.semanas} semanas · {plano.frequenciaSemanal}x por semana</p>
      </Card>
      {plano.macrociclo.mesociclos.map((m) => {
        const atual = semana >= m.semanaInicio && semana <= m.semanaFim;
        return (
          <Card key={m.id} className="p-4" style={atual ? { borderColor: cor, borderWidth: 2 } : undefined}>
            <div className="flex items-center justify-between gap-2">
              <div className="font-display font-bold text-ink">{m.nome}</div>
              {atual && <Pill tone="primary">Fase atual</Pill>}
            </div>
            <p className="mt-1 text-xs text-ink-3">Semanas {m.semanaInicio} a {m.semanaFim}</p>
            <p className="mt-1.5 text-sm text-ink-2">{m.foco}</p>
          </Card>
        );
      })}
    </div>
  );
}

function MensalidadeCard({ aluno, cor }: { aluno: Aluno; cor: string }) {
  const c = aluno.cobranca;
  if (!c) return null;
  const efetivo = statusEfetivo(c);
  const tone: Record<string, "success" | "warning" | "neutral"> = { pago: "success", pendente: "warning", isento: "neutral" };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: cor }}>
          <Wallet className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-ink">Mensalidade {formatBRL(c.valorCentavos)}</div>
          <div className="text-xs text-ink-3">Vence dia {c.diaVencimento}</div>
        </div>
        <Pill tone={tone[efetivo]}>{ROTULO_STATUS_COBRANCA[efetivo]}</Pill>
      </div>
      {efetivo !== "pago" && efetivo !== "isento" && (
        <div className="mt-3">
          {c.linkPagamento ? (
            /^https?:\/\//i.test(c.linkPagamento) ? (
              <a
                href={c.linkPagamento}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg py-2 text-center text-sm font-bold text-white"
                style={{ background: cor }}
              >
                Pagar mensalidade
              </a>
            ) : (
              <PixCopia chave={c.linkPagamento} cor={cor} />
            )
          ) : (
            <p className="text-xs text-ink-3">Combine o pagamento com o seu profissional.</p>
          )}
        </div>
      )}
    </Card>
  );
}

function PixCopia({ chave, cor }: { chave: string; cor: string }) {
  const [copiado, setCopiado] = React.useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(chave);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* sem clipboard: a chave segue visível abaixo */
    }
  };
  return (
    <div>
      <button
        onClick={copiar}
        className="block w-full rounded-lg py-2 text-center text-sm font-bold text-white"
        style={{ background: cor }}
      >
        {copiado ? "Chave PIX copiada" : "Copiar chave PIX"}
      </button>
      <p className="mt-1.5 break-all text-center text-[11px] text-ink-3">{chave}</p>
    </div>
  );
}

/* ------------------------------ Aba: Evolução ----------------------------- */

function AbaEvolucao({
  aluno,
  avaliacoes,
  execucoes,
  cor,
}: {
  aluno: Aluno;
  avaliacoes: Avaliacao[];
  execucoes: Execucao[];
  cor: string;
}) {
  const doAluno = avaliacoes.filter((a) => a.alunoId === aluno.id).sort((a, b) => b.data - a.data);
  const fmt = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
  return (
    <div className="space-y-4">
      {/* Liga, conquistas e feed a partir dos treinos registrados */}
      <GamificacaoView alunoId={aluno.id} execucoes={execucoes} cor={cor} />

      {/* Avaliações registradas pelo profissional */}
      <section className="space-y-2">
        <h2 className="font-display text-base font-bold text-ink">Avaliações</h2>
        {doAluno.length === 0 ? (
          <Card className="p-6 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-surface-soft text-ink-3">
              <Clock className="h-5 w-5" />
            </span>
            <p className="text-sm text-ink-2">Suas avaliações vão aparecer aqui conforme o seu profissional registrar.</p>
          </Card>
        ) : (
          doAluno.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="font-display font-bold text-ink">{fmt(a.data)}</div>
                {a.medidas.peso != null && <Pill tone="neutral">{a.medidas.peso} kg</Pill>}
              </div>
              {a.observacoes && <p className="mt-1.5 text-sm text-ink-2">{a.observacoes}</p>}
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

function SemPlano() {
  return (
    <Card className="p-6 text-center">
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-surface-soft text-ink-3">
        <CalendarDays className="h-5 w-5" />
      </span>
      <p className="text-sm text-ink-2">Seu profissional ainda não publicou um plano de treino para você.</p>
    </Card>
  );
}
