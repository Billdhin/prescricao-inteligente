import * as React from "react";
import { Link } from "react-router-dom";
import { BarChart3, CalendarClock, Clock, ArrowRight, CheckCircle2, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { Card, Pill, SectionHeader, TokenRotulado, buttonClasses } from "@/components/ui/primitives";
import { AvaliacaoModal } from "@/components/app/AvaliacaoModal";
import { useAlunos } from "@/lib/store";
import { dataReavaliacao } from "@/lib/gps/proximoPasso";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);
const fmtDelta = (n: number, unidade: string) => `${n > 0 ? "+" : ""}${n.toFixed(1)} ${unidade}`;

export function Avaliacoes() {
  const { alunos, avaliacoes, planos, addAvaliacao } = useAlunos();
  // null = fechado. String vazia = escolhendo o aluno. Id = modal aberto naquele aluno.
  const [avaliando, setAvaliando] = React.useState<string | null>(null);
  const ativos = alunos.filter((a) => a.status === "ativo");
  const alunoEmAvaliacao = ativos.find((a) => a.id === avaliando);
  const avalsDoAluno = React.useMemo(
    () =>
      alunoEmAvaliacao
        ? avaliacoes.filter((av) => av.alunoId === alunoEmAvaliacao.id).sort((x, y) => x.data - y.data)
        : [],
    [avaliacoes, alunoEmAvaliacao],
  );
  const nomeAluno = (id: string) => alunos.find((a) => a.id === id)?.nome ?? "aluno removido";
  const iniciais = (id: string) => alunos.find((a) => a.id === id)?.iniciais ?? "?";

  /**
   * QUEM PRECISA AGORA. Três situações, na ordem de urgência do mockup:
   * reavaliação vencida, reavaliação chegando, e quem nunca foi avaliado.
   *
   * A data vem de `dataReavaliacao`, a MESMA fonte do perfil do aluno e da rota
   * do dia. Antes esta tela lia `aluno.proximaReavaliacaoEm` cru e ignorava o
   * macrociclo, então com plano ativo ela mostrava uma data e o perfil do aluno
   * mostrava outra.
   */
  const precisamAgora = alunos
    .filter((a) => a.status === "ativo")
    .map((a) => {
      const planoAtivo = planos.find((p) => p.alunoId === a.id && p.status === "ativo");
      const temAval = avaliacoes.some((av) => av.alunoId === a.id);
      const reav = dataReavaliacao(a, planoAtivo);
      if (!temAval) return { aluno: a, tipo: "primeira" as const, em: 0, acao: "Avaliar" };
      if (!reav) return null;
      const dias = diasAte(reav.em);
      if (dias < 0) return { aluno: a, tipo: "vencida" as const, em: reav.em, acao: "Reavaliar" };
      if (dias <= 14) return { aluno: a, tipo: "chegando" as const, em: reav.em, acao: "Reavaliar" };
      return null;
    })
    .filter(Boolean)
    .sort((x, y) => {
      const peso = { primeira: 0, vencida: 1, chegando: 2 } as const;
      return peso[x!.tipo] - peso[y!.tipo] || x!.em - y!.em;
    }) as { aluno: (typeof alunos)[number]; tipo: "primeira" | "vencida" | "chegando"; em: number; acao: string }[];

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
        title="Avaliar e reavaliar"
        subtitle="Acompanhe as reavaliações, veja o histórico de medidas e registre uma avaliação nova aqui mesmo."
        right={
          ativos.length > 0 ? (
            <button onClick={() => setAvaliando("")} className={buttonClasses("primary", "sm")}>
              <Plus className="h-4 w-4" /> Registrar avaliação
            </button>
          ) : undefined
        }
      />

      {avaliando === "" && (
        <Card className="p-5">
          <h2 className="font-display text-base font-bold text-ink">De qual aluno?</h2>
          <p className="mt-1 text-sm text-ink-2">
            A avaliação entra no perfil dele e passa a valer como gate para a próxima prescrição.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ativos.map((a) => (
              <button key={a.id} onClick={() => setAvaliando(a.id)} className={buttonClasses("secondary", "sm")}>
                {a.nome}
              </button>
            ))}
            <button onClick={() => setAvaliando(null)} className={buttonClasses("ghost", "sm")}>
              Cancelar
            </button>
          </div>
        </Card>
      )}

      {alunoEmAvaliacao && (
        <AvaliacaoModal
          onClose={() => setAvaliando(null)}
          onSave={(av) => {
            addAvaliacao(av);
            setAvaliando(null);
            toast(`Avaliação registrada para ${alunoEmAvaliacao.nome}`);
          }}
          alunoId={alunoEmAvaliacao.id}
          alunoNome={alunoEmAvaliacao.nome}
          alunoSexo={alunoEmAvaliacao.sexo}
          alunoIdade={alunoEmAvaliacao.idade}
          anterior={avalsDoAluno[avalsDoAluno.length - 1]}
          historico={avalsDoAluno}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quem precisa agora */}
        <Card className="p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-control bg-cta-tint text-cta-text">
              <CalendarClock className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-ink">Quem precisa agora</h2>
          </div>
          {precisamAgora.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-ink-2">
                Ninguém com avaliação pendente ou reavaliação nas próximas duas semanas.
              </p>
              {ativos.length > 0 && (
                <button
                  onClick={() => setAvaliando("")}
                  className={cn(buttonClasses("secondary", "sm"), "mt-3")}
                >
                  Registrar uma avaliação assim mesmo
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {precisamAgora.map(({ aluno: a, tipo, em, acao }) => {
                const d = tipo === "primeira" ? 0 : diasAte(em);
                // A frase diz o MOTIVO, como no mockup, não só um contador solto.
                const motivo =
                  tipo === "primeira"
                    ? "Primeira avaliação pendente"
                    : tipo === "vencida"
                      ? `Vencida há ${Math.abs(d)} ${Math.abs(d) === 1 ? "dia" : "dias"}`
                      : `Reavaliação em ${d} ${d === 1 ? "dia" : "dias"} · ${fmtData(em)}`;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-card border border-border p-3 transition-colors hover:bg-surface-soft"
                    style={{
                      borderLeftWidth: 4,
                      borderLeftColor: tipo === "chegando" ? "var(--border)" : "var(--warning)",
                    }}
                  >
                    <Link to={`/alunos/${a.id}?aba=avaliacoes`} className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-brand text-xs font-bold text-white">
                        {a.iniciais}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-ink">{a.nome}</div>
                        <div className="truncate text-xs text-ink-2">{motivo}</div>
                      </div>
                    </Link>
                    {/* ação direta: registrar sem caçar o botão dentro do perfil */}
                    <Link to={`/alunos/${a.id}?avaliar=1`} className={buttonClasses("secondary", "sm")}>
                      {acao}
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
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-analysis-tint text-analysis">
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
                  /* A AVALIAÇÃO CLICADA É O DESTINO, e não a ficha do aluno.
                     O Filipe: "se eu cliquei para ver a última avaliação quero ver os detalhes
                     dessa última avaliação". Sem `?aba=`, o destino caía na Visão, que é o
                     padrão, e a avaliação que ele acabou de clicar ficava duas ações adiante.
                     `?av=` leva o link até o registro exato, não só até a aba dele. */
                  to={`/alunos/${av.alunoId}?aba=avaliacoes&av=${av.id}`}
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
                to={`/alunos/${a.id}?aba=avaliacoes`}
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
