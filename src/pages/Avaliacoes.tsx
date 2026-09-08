import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2, Plus } from "lucide-react";
import { Card, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { AvaliacaoModal } from "@/components/app/AvaliacaoModal";
import { useAlunos } from "@/lib/store";
import { dataReavaliacao } from "@/lib/gps/proximoPasso";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
/** "29 ago", como no protótipo: dia + mês curto, sem "de" e sem ponto. */
const fmtDataCurta = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(new Date(ts))
    .replace(/ de /g, " ")
    .replace(".", "");
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);
const fmtDelta = (n: number, unidade: string) => `${n > 0 ? "+" : ""}${n.toFixed(1).replace(".", ",")} ${unidade}`;
const fmtNum = (n: number) => String(n).replace(".", ",");

/**
 * Tinta do avatar quadrado por FAMÍLIA de cor, como no protótipo (fundo tint +
 * texto da família). A escolha é determinística pelo id, para o mesmo aluno
 * carregar sempre a mesma tinta em todas as listas desta tela.
 */
const TINTAS_AVATAR = [
  "bg-primary-tint text-primary",
  "bg-analysis-tint text-analysis-text",
  "bg-warning-tint text-warning",
] as const;
const tintaDe = (id: string) =>
  TINTAS_AVATAR[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % TINTAS_AVATAR.length];

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

  // Largura das barras de delta: |delta| normalizado pelo maior |delta| da
  // carteira em cada métrica, para as barras serem comparáveis entre alunos.
  const maxDPeso = Math.max(0, ...evolucao.map((e) => Math.abs(e.dPeso ?? 0)));
  const maxDGord = Math.max(0, ...evolucao.map((e) => Math.abs(e.dGord ?? 0)));
  const larguraDelta = (d: number | undefined, max: number) =>
    d == null || max === 0 ? 0 : Math.round((Math.abs(d) / max) * 100);

  /**
   * ESTE MÊS: contagens REAIS de avaliações dos últimos 6 meses, derivadas de
   * `avaliacoes` (nada decorativo). O mês corrente é a última coluna.
   */
  const meses = React.useMemo(() => {
    const agora = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(agora.getFullYear(), agora.getMonth() - (5 - i), 1);
      const ini = d.getTime();
      const fim = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      const total = avaliacoes.filter((av) => av.data >= ini && av.data < fim).length;
      const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d).replace(".", "");
      return { label, total, atual: i === 5 };
    });
  }, [avaliacoes]);
  const noMes = meses[5].total;
  const maxMes = Math.max(...meses.map((m) => m.total));

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
        <Card className="border-2 border-ink p-5 md:p-6">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-ink">De qual aluno?</h2>
            <p className="m-0 text-sm text-ink-2">
              A avaliação entra no perfil dele e passa a valer como gate para a próxima prescrição.
            </p>
          </div>
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            {ativos.map((a) => (
              <button
                key={a.id}
                onClick={() => setAvaliando(a.id)}
                className="rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-soft hover:text-ink"
              >
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

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* ---------------- Coluna principal ---------------- */}
        <div className="grid gap-4">
          {/* Quem precisa agora */}
          <Card className="p-5 md:p-6">
            <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-ink">Quem precisa agora</h2>
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
              <div className="mt-3.5 space-y-2">
                {precisamAgora.map(({ aluno: a, tipo, em, acao }) => {
                  const d = tipo === "primeira" ? 0 : diasAte(em);
                  // A frase diz o MOTIVO, como no mockup, não só um contador solto.
                  const motivo =
                    tipo === "primeira"
                      ? "Primeira avaliação pendente"
                      : tipo === "vencida"
                        ? `Vencida há ${Math.abs(d)} ${Math.abs(d) === 1 ? "dia" : "dias"}`
                        : `Reavaliação em ${d} ${d === 1 ? "dia" : "dias"} · ${fmtData(em)}`;
                  // Filete 4px na cor da urgência + avatar tintado pela mesma família.
                  const filete =
                    tipo === "vencida"
                      ? "var(--danger-fill)"
                      : tipo === "chegando"
                        ? "var(--warning-fill)"
                        : "var(--primary)";
                  return (
                    <div
                      key={a.id}
                      className="grid grid-cols-[4px_40px_minmax(0,1fr)_auto] items-center gap-3.5 overflow-hidden rounded-[14px] border border-border pr-3 transition-colors hover:bg-surface-soft"
                    >
                      <span aria-hidden className="self-stretch rounded-r-[3px]" style={{ background: filete }} />
                      <Link
                        to={`/alunos/${a.id}?aba=avaliacoes`}
                        className="col-span-2 grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-3.5 py-3"
                      >
                        <span
                          className={cn(
                            "grid h-10 w-10 shrink-0 place-items-center rounded-control font-display text-xs font-bold",
                            tipo === "chegando" && "bg-analysis-tint text-analysis-text",
                            tipo === "primeira" && "bg-primary-tint text-primary",
                          )}
                          style={tipo === "vencida" ? { background: "#E8A317", color: "#0B1628" } : undefined}
                        >
                          {a.iniciais}
                        </span>
                        <span className="min-w-0">
                          <b className="block truncate text-sm font-semibold text-ink">{a.nome}</b>
                          <span
                            className={cn(
                              "block truncate text-xs",
                              tipo === "vencida" ? "text-danger" : "text-ink-2",
                            )}
                          >
                            {motivo}
                          </span>
                        </span>
                      </Link>
                      {/* ação direta: registrar sem caçar o botão dentro do perfil */}
                      <Link
                        to={`/alunos/${a.id}?avaliar=1`}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-[background-color,filter]",
                          tipo === "vencida"
                            ? "bg-ink text-surface hover:brightness-[1.15]"
                            : "bg-bg text-ink hover:bg-surface-mute",
                        )}
                      >
                        {acao}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Evolução da carteira: a visão agregada prometida no painel */}
          <Card className="p-5 md:p-6">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-ink">Evolução da carteira</h2>
              <span className="text-xs text-ink-3">primeira → última avaliação</span>
            </div>
            {evolucao.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-2">
                A evolução aparece quando um aluno tiver 2 ou mais avaliações registradas.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {evolucao.map(({ aluno: a, dPeso, dGord, dias, n }) => (
                  <Link
                    key={a.id}
                    to={`/alunos/${a.id}?aba=avaliacoes`}
                    className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3.5 rounded-[14px] p-2 transition-colors hover:bg-surface-soft"
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-control font-display text-xs font-bold",
                        tintaDe(a.id),
                      )}
                    >
                      {a.iniciais}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                        <b className="truncate text-sm font-semibold text-ink">{a.nome}</b>
                        <span className="text-xs text-ink-3">
                          {a.objetivo} · {n} avaliações em {dias} dias
                        </span>
                      </div>
                      {/* Delta NEUTRO de propósito: sem leitura de objetivo no motor,
                          verde diria "melhorou" sem saber o que o aluno busca. */}
                      <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                        {dPeso != null && (
                          <div>
                            <span className="text-xs text-ink-2">
                              Peso <b className="tabular font-semibold text-ink">{fmtDelta(dPeso, "kg")}</b>
                            </span>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-mute">
                              <div
                                className="h-full rounded-full bg-ink-2"
                                style={{ width: `${larguraDelta(dPeso, maxDPeso)}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {dGord != null && (
                          <div>
                            <span className="text-xs text-ink-2">
                              Gordura <b className="tabular font-semibold text-ink">{fmtDelta(dGord, "pp")}</b>
                            </span>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-mute">
                              <div
                                className="h-full rounded-full bg-ink-2"
                                style={{ width: `${larguraDelta(dGord, maxDGord)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <p className="mt-3.5 text-xs leading-relaxed text-ink-3">
              Delta da primeira à última avaliação registrada. A leitura depende do objetivo: em
              hipertrofia, ganhar peso pode ser o esperado.
            </p>
          </Card>
        </div>

        {/* ---------------- Coluna lateral ---------------- */}
        <div className="grid gap-4">
          {/* Este mês: contagem real do mês corrente + colunas dos últimos 6 meses */}
          <div
            className="relative overflow-hidden rounded-card p-5 md:p-6"
            style={{ background: "#0B1628", color: "#F3F1EA" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[60px] -top-[80px] h-[220px] w-[220px] rounded-full"
              style={{ background: "radial-gradient(circle,rgba(232,163,23,.3),rgba(232,163,23,0) 65%)" }}
            />
            <p
              className="relative m-0 text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: "#7FE3D8" }}
            >
              Este mês
            </p>
            <p className="relative mb-0 mt-2.5 font-display text-4xl font-bold leading-none tracking-[-0.03em]">
              {noMes}{" "}
              <span className="text-sm font-medium" style={{ color: "#8FA0B5" }}>
                {noMes === 1 ? "avaliação" : "avaliações"}
              </span>
            </p>
            {maxMes > 0 && (
              <>
                <div className="relative mt-3.5 flex h-10 items-end gap-[3px]">
                  {meses.map((m, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-[3px]"
                      style={
                        m.total === 0
                          ? { height: 3, background: "#24406A", opacity: 0.5 }
                          : {
                              height: `${Math.round((m.total / maxMes) * 100)}%`,
                              background: m.atual ? "#7FE3D8" : "#24406A",
                            }
                      }
                      title={`${m.label}: ${m.total}`}
                    />
                  ))}
                </div>
                <p className="relative mb-0 mt-2 text-xs" style={{ color: "#8FA0B5" }}>
                  {meses.map((m, i) => (
                    <React.Fragment key={i}>
                      {m.atual ? <b style={{ color: "#7FE3D8" }}>{m.label}</b> : m.label}
                      {i < meses.length - 1 && " · "}
                    </React.Fragment>
                  ))}
                </p>
              </>
            )}
          </div>

          {/* Últimas avaliações */}
          <Card className="p-5">
            <h2 className="font-display text-base font-bold tracking-[-0.02em] text-ink">Últimas avaliações</h2>
            {recentes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
                <p className="text-sm text-ink-2">Nenhuma avaliação registrada ainda.</p>
              </div>
            ) : (
              <ol className="mt-2">
                {recentes.map((av) => {
                  // Só campos que EXISTEM no registro entram na linha.
                  const partes = [fmtDataCurta(av.data)];
                  if (av.medidas.peso != null) partes.push(`${fmtNum(av.medidas.peso)} kg`);
                  if (av.medidas.percentualGordura != null)
                    partes.push(`${fmtNum(av.medidas.percentualGordura)}% gordura`);
                  if (av.dorEscala != null) partes.push(`dor ${av.dorEscala}`);
                  return (
                    <li key={av.id} className="border-b border-surface-mute last:border-b-0">
                      <Link
                        /* A AVALIAÇÃO CLICADA É O DESTINO, e não a ficha do aluno.
                           O Filipe: "se eu cliquei para ver a última avaliação quero ver os detalhes
                           dessa última avaliação". Sem `?aba=`, o destino caía na Visão, que é o
                           padrão, e a avaliação que ele acabou de clicar ficava duas ações adiante.
                           `?av=` leva o link até o registro exato, não só até a aba dele. */
                        to={`/alunos/${av.alunoId}?aba=avaliacoes&av=${av.id}`}
                        className="flex items-center gap-2.5 rounded-[10px] py-2.5 transition-colors hover:bg-surface-soft"
                      >
                        <span
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-[10px] font-display text-2xs font-bold",
                            tintaDe(av.alunoId),
                          )}
                        >
                          {iniciais(av.alunoId)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <b className="block truncate text-sm font-semibold text-ink">{nomeAluno(av.alunoId)}</b>
                          <span className="block truncate text-xs text-ink-3">{partes.join(" · ")}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
