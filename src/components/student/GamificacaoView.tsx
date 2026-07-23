import * as React from "react";
import {
  Sparkles,
  Dumbbell,
  Trophy,
  CalendarCheck,
  CalendarRange,
  TrendingUp,
  Flame,
  Medal,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";
import type { Execucao } from "@/data/execucao";
import { resumoGamificacao } from "@/lib/gamificacao";

const ICONES: Record<string, LucideIcon> = {
  Sparkles,
  Dumbbell,
  Trophy,
  CalendarCheck,
  CalendarRange,
  TrendingUp,
  Flame,
};

const fmtDia = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).format(new Date(ts));

/**
 * Liga + conquistas + feed do aluno, tudo derivado dos treinos que ele
 * registrou. Se ainda não registrou nada, mostra o convite para começar.
 */
export function GamificacaoView({
  alunoId,
  execucoes,
  cor,
}: {
  alunoId: string;
  execucoes: Execucao[];
  cor: string;
}) {
  const r = React.useMemo(() => resumoGamificacao(alunoId, execucoes), [alunoId, execucoes]);

  if (r.totalTreinos === 0) {
    return (
      <Card className="p-6 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-card bg-surface-soft text-ink-3">
          <Medal className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink-2">
          Registre seus treinos na aba <strong className="text-ink">Treino</strong> para começar a subir de liga e
          desbloquear conquistas.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Liga atual + progresso para a próxima */}
      <Card className="p-4" style={{ borderColor: r.liga.atual.cor, borderWidth: 2 }}>
        <div className="flex items-center gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-card text-white"
            style={{ background: r.liga.atual.cor }}
          >
            <Medal className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-bold text-ink">Liga {r.liga.atual.nome}</div>
            <div className="text-xs text-ink-3">{r.pontos} pontos · {r.totalTreinos} treinos registrados</div>
          </div>
        </div>
        {r.liga.proxima && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-ink-3">
              <span>Rumo à liga {r.liga.proxima.nome}</span>
              <span>faltam {r.liga.faltam} pts</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.round(r.liga.progresso * 100)}%`, background: r.liga.proxima.cor }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Conquistas */}
      <Card className="p-4">
        <h2 className="mb-3 font-display text-base font-bold text-ink">Conquistas</h2>
        <div className="grid grid-cols-2 gap-2">
          {r.badges.map(({ badge, conquistada }) => {
            const Icon = ICONES[badge.icone] ?? Sparkles;
            return (
              <div
                key={badge.id}
                className="flex items-start gap-2.5 rounded-xl border p-2.5"
                style={
                  conquistada
                    ? { borderColor: cor, background: "var(--surface)" }
                    : { borderColor: "var(--border)", background: "var(--surface-soft)" }
                }
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
                  style={{ background: conquistada ? cor : "var(--ink-3)" }}
                >
                  {conquistada ? <Icon className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </span>
                <div className="min-w-0">
                  <div className={`text-sm font-bold ${conquistada ? "text-ink" : "text-ink-3"}`}>{badge.nome}</div>
                  <div className="text-2xs leading-tight text-ink-3">{badge.descricao}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Feed pessoal */}
      <Card className="p-4">
        <h2 className="mb-3 font-display text-base font-bold text-ink">Seu histórico</h2>
        <ol className="space-y-2.5">
          {r.feed.map((item) => (
            <li key={item.dia} className="flex items-center gap-3">
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white"
                style={{ background: cor }}
              >
                <Dumbbell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink">
                  {item.quantidade} exercício{item.quantidade > 1 ? "s" : ""} registrado{item.quantidade > 1 ? "s" : ""}
                </div>
                <div className="text-xs text-ink-3">{fmtDia(item.ts)}</div>
              </div>
              <span className="shrink-0 text-xs font-bold" style={{ color: cor }}>
                +{item.quantidade * 10} pts
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
