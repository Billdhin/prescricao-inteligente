import { Link } from "react-router-dom";
import { BarChart3, CalendarClock, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { useAlunos } from "@/lib/store";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);

export function Avaliacoes() {
  const { alunos, avaliacoes } = useAlunos();
  const nomeAluno = (id: string) => alunos.find((a) => a.id === id)?.nome ?? "—";
  const iniciais = (id: string) => alunos.find((a) => a.id === id)?.iniciais ?? "?";

  const aReavaliar = alunos
    .filter((a) => a.status === "ativo" && a.proximaReavaliacaoEm != null)
    .sort((a, b) => (a.proximaReavaliacaoEm ?? 0) - (b.proximaReavaliacaoEm ?? 0));

  const recentes = [...avaliacoes].sort((a, b) => b.data - a.data).slice(0, 12);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Atendimento"
        icon={<BarChart3 className="h-3 w-3" />}
        title="Avaliações"
        subtitle="Acompanhe reavaliações e o histórico de medidas dos seus alunos. Registre novas avaliações no perfil de cada aluno."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* A reavaliar */}
        <Card className="p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff1e6] text-[color:var(--cta-text)]">
              <CalendarClock className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-ink">A reavaliar</h2>
          </div>
          {aReavaliar.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-2">Nenhuma reavaliação agendada.</p>
          ) : (
            <div className="space-y-2.5">
              {aReavaliar.map((a) => {
                const d = diasAte(a.proximaReavaliacaoEm!);
                const vencida = d < 0;
                return (
                  <Link
                    key={a.id}
                    to={`/alunos/${a.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-surface-soft"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-brand text-xs font-bold text-white">
                      {a.iniciais}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-ink">{a.nome}</div>
                      <div className="text-xs text-ink-3">{a.objetivo}</div>
                    </div>
                    <Pill tone={vencida ? "warning" : "neutral"}>
                      {vencida ? `vencida ${Math.abs(d)}d` : `em ${d}d`}
                    </Pill>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {/* Últimas avaliações */}
        <Card className="p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e0f7f9] text-analysis">
              <Clock className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-ink">Últimas avaliações</h2>
          </div>
          {recentes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
              <p className="text-sm text-ink-2">Nenhuma avaliação registrada ainda.</p>
            </div>
          ) : (
            <ol className="space-y-2.5">
              {recentes.map((av) => (
                <Link
                  key={av.id}
                  to={`/alunos/${av.alunoId}`}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-surface-soft"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-soft text-xs font-bold text-ink-2">
                    {iniciais(av.alunoId)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink">{nomeAluno(av.alunoId)}</div>
                    <div className="flex flex-wrap gap-x-3 text-xs text-ink-3">
                      <span>{fmtData(av.data)}</span>
                      {av.medidas.peso != null && <span>{av.medidas.peso} kg</span>}
                      {av.medidas.percentualGordura != null && <span>{av.medidas.percentualGordura}% gord.</span>}
                      {av.dorEscala != null && <span>dor {av.dorEscala}/10</span>}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
                </Link>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <p className="text-sm text-ink-2">
          Para registrar uma avaliação, abra o aluno e use <span className="font-semibold text-ink">Nova avaliação</span>.
        </p>
        <Link to="/alunos" className={buttonClasses("secondary", "sm") + " ml-auto"}>
          Ir para Alunos <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  );
}
