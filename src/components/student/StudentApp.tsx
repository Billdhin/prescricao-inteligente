import * as React from "react";
import { CalendarDays, Dumbbell, TrendingUp, LogOut, ChevronDown, Clock, HeartPulse } from "lucide-react";
import { Card, Pill } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { BrandProvider, type Marca } from "@/lib/brand/BrandContext";
import { Logo } from "@/components/brand/Logo";
import { exercises } from "@/data/exercises";
import type { Aluno, Avaliacao } from "@/data/alunos";
import {
  type PlanoTreino,
  type Microciclo,
  type Sessao,
  type BlocoSessao,
  semanaAtual,
  mesocicloAtual,
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
  preview = false,
  onSair,
}: {
  aluno: Aluno;
  plano?: PlanoTreino;
  marca: Marca;
  avaliacoes?: Avaliacao[];
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

          {aba === "hoje" && <AbaHoje plano={plano} cor={cor} />}
          {aba === "plano" && <AbaPlano plano={plano} cor={cor} />}
          {aba === "evolucao" && <AbaEvolucao aluno={aluno} avaliacoes={avaliacoes} />}
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

function AbaHoje({ plano, cor }: { plano?: PlanoTreino; cor: string }) {
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
        micro.sessoes.map((s) => <SessaoCard key={s.id} sessao={s} cor={cor} />)
      )}
    </div>
  );
}

function SessaoCard({ sessao, cor }: { sessao: Sessao; cor: string }) {
  const [aberto, setAberto] = React.useState(false);
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
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-ink-3 transition-transform", aberto && "rotate-180")} />
      </button>
      {aberto && (
        <div className="space-y-2 border-t border-border p-3">
          {sessao.blocos.map((b) => (
            <BlocoRow key={b.id} bloco={b} cor={cor} />
          ))}
        </div>
      )}
    </Card>
  );
}

function BlocoRow({ bloco, cor }: { bloco: BlocoSessao; cor: string }) {
  const aerobio = bloco.tipo === "aerobio";
  const linhas = aerobio
    ? [bloco.formato, bloco.duracao, bloco.intensidade, bloco.recuperacao && bloco.recuperacao !== "-" ? `Recuperação: ${bloco.recuperacao}` : ""]
    : [bloco.series && bloco.reps ? `${bloco.series} x ${bloco.reps}` : bloco.series || bloco.reps, bloco.intensidade, bloco.intervalo ? `Intervalo: ${bloco.intervalo}` : ""];
  const detalhe = linhas.filter(Boolean).join(" · ");
  return (
    <div className="rounded-xl border border-border bg-surface-soft p-3">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: cor }}>
          {aerobio ? <HeartPulse className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1 font-semibold text-ink">{nomeDoBloco(bloco)}</span>
      </div>
      {detalhe && <p className="mt-1.5 text-sm text-ink-2">{detalhe}</p>}
      {bloco.observacao && <p className="mt-1 text-xs text-ink-3">{bloco.observacao}</p>}
    </div>
  );
}

/* ------------------------------- Aba: Plano ------------------------------- */

function AbaPlano({ plano, cor }: { plano?: PlanoTreino; cor: string }) {
  if (!plano) return <SemPlano />;
  const semana = semanaAtual(plano);
  return (
    <div className="space-y-3">
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

/* ------------------------------ Aba: Evolução ----------------------------- */

function AbaEvolucao({ aluno, avaliacoes }: { aluno: Aluno; avaliacoes: Avaliacao[] }) {
  const doAluno = avaliacoes.filter((a) => a.alunoId === aluno.id).sort((a, b) => b.data - a.data);
  const fmt = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
  if (doAluno.length === 0) {
    return (
      <Card className="p-6 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-surface-soft text-ink-3">
          <Clock className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink-2">Suas avaliações vão aparecer aqui conforme o seu profissional registrar.</p>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {doAluno.map((a) => (
        <Card key={a.id} className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="font-display font-bold text-ink">{fmt(a.data)}</div>
            {a.medidas.peso != null && <Pill tone="neutral">{a.medidas.peso} kg</Pill>}
          </div>
          {a.observacoes && <p className="mt-1.5 text-sm text-ink-2">{a.observacoes}</p>}
        </Card>
      ))}
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
