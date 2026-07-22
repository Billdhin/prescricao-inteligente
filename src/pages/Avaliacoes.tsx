import { Link } from "react-router-dom";
import { BarChart3, CalendarClock, Clock, ArrowRight, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { Card, Pill, SectionHeader, TokenRotulado, buttonClasses } from "@/components/ui/primitives";
import { useAlunos } from "@/lib/store";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);
const fmtDelta = (n: number, unidade: string) => `${n > 0 ? "+" : ""}${n.toFixed(1)} ${unidade}`;

export function Avaliacoes() {
  const { alunos, avaliacoes } = useAlunos();
  const nomeAluno = (id: string) => alunos.find((a) => a.id === id)?.nome ?? "–";
  const iniciais = (id: string) => alunos.find((a) => a.id === id)?.iniciais ?? "?";

  const aReavaliar = alunos
    .filter((a) => a.status === "ativo" && a.proximaReavaliacaoEm != null)
    .sort((a, b) => (a.proximaReavaliacaoEm ?? 0) - (b.proximaReavaliacaoEm ?? 0));

  const recentes = [...avaliacoes].sort((a, b) => b.data - a.data).slice(0, 12);

  // Evolução da carteira: delta da primeira à última avaliação, por aluno (2+ registros).
  const evolucao = alunos
    .filter((a) => a.status === "ativo")
    .map((a) => {
      const avs = avaliacoes.filter((av) => av.alunoId === a.id).sort((x, y) => x.data - y.data);
      if (avs.length < 2) return null;
      const primeira = avs[0];
      const ultima = avs[avs.length - 1];
      const dPeso =
        primeira.medidas.peso != null && ultima.medidas.peso != null
          ? ultima.medidas.peso - primeira.medidas.peso
          : undefined;
      const dGord =
        primeira.medidas.percentualGordura != null && ultima.medidas.percentualGordura != null
          ? ultima.medidas.percentualGordura - primeira.medidas.percentualGordura
          : undefined;
      const dias = Math.max(1, Math.round((ultima.data - primeira.data) / DIA));
      return { aluno: a, dPeso, dGord, dias, n: avs.length };
    })
    .filter(Boolean) as { aluno: (typeof alunos)[number]; dPeso?: number; dGord?: number; dias: number; n: number }[];

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
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-surface-soft"
                  >
                    <Link to={`/alunos/${a.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-brand text-xs font-bold text-white">
                        {a.iniciais}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-ink">{a.nome}</div>
                        <div className="text-xs text-ink-3">{a.objetivo}</div>
                      </div>
                    </Link>
                    <Pill tone={vencida ? "warning" : "neutral"}>
                      {vencida ? `vencida ${Math.abs(d)}d` : `em ${d}d`}
                    </Pill>
                    {/* ação direta: registrar sem caçar o botão dentro do perfil */}
                    <Link to={`/alunos/${a.id}?avaliar=1`} className={buttonClasses("secondary", "sm")}>
                      Registrar
                    </Link>
                  </div>
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
                    {/* Cada medida como token rotulado: o numero carrega o proprio nome,
                        em vez de "82 kg" e "18% gord." soltos numa fila. */}
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
                      <span>{fmtData(av.data)}</span>
                      {av.medidas.peso != null && <TokenRotulado label="Peso" value={`${av.medidas.peso} kg`} />}
                      {av.medidas.percentualGordura != null && (
                        <TokenRotulado label="Gordura" value={`${av.medidas.percentualGordura}%`} />
                      )}
                      {av.dorEscala != null && (
                        <TokenRotulado label="Dor" value={`${av.dorEscala}/10`} tone={av.dorEscala >= 4 ? "warning" : "neutral"} />
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
                </Link>
              ))}
            </ol>
          )}
        </Card>
      </div>

      {/* Evolução dos alunos: a visão agregada prometida no painel */}
      <Card className="p-5 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
            <TrendingDown className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-ink">Evolução dos alunos</h2>
        </div>
        {evolucao.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-2">
            A evolução aparece quando um aluno tiver 2 ou mais avaliações registradas.
          </p>
        ) : (
          <div className="space-y-2.5">
            {evolucao.map(({ aluno: a, dPeso, dGord, dias, n }) => (
              <Link
                key={a.id}
                to={`/alunos/${a.id}`}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-surface-soft"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-brand text-xs font-bold text-white">
                  {a.iniciais}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">{a.nome}</div>
                  <div className="text-xs text-ink-3">
                    {n} avaliações em {dias} dias
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dPeso != null && (
                    <Pill tone={dPeso <= 0 ? "success" : "warning"} icon={dPeso <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}>
                      Peso {fmtDelta(dPeso, "kg")}
                    </Pill>
                  )}
                  {dGord != null && (
                    <Pill tone={dGord <= 0 ? "success" : "warning"}>Gordura {fmtDelta(dGord, "pp")}</Pill>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        <p className={cn("mt-3 text-xs text-ink-3")}>
          Delta da primeira à última avaliação registrada. A leitura depende do objetivo: em
          hipertrofia, ganhar peso pode ser o esperado.
        </p>
      </Card>
    </div>
  );
}
