import * as React from "react";
import { AlertTriangle, Check, ChevronDown, Lock } from "lucide-react";
import { Card, buttonClasses } from "@/components/ui/primitives";
import { exercises } from "@/data/exercises";
import type { Macrociclo, PlanoTreino, VariavelTravavel } from "@/data/periodizacao";
import { semCargaExterna, type Execucao, type SessaoFeedback } from "@/data/execucao";
import type { Aluno, Avaliacao } from "@/data/alunos";
import { ajustarCarga, faixaDeReps, incrementoDoExercicio, type AcaoCarga, type AjusteCarga, type CtxSeguranca, type ModProgressaoAjuste } from "@/lib/gps/autorregulacao";
import { renovarMicrociclo, aplicarRenovacao, type RenovacaoSugerida, type SugestaoRenovacao } from "@/lib/gps/renovarMicrociclo";
import { modAjusteDaForca } from "@/lib/gps/farmacos";
import type { EstadoSemaforo } from "@/lib/gps/semaforoDiario";
import { cn } from "@/lib/utils";

/*
 * AJUSTES SUGERIDOS, UM POR EXERCÍCIO.
 *
 * Antes a sugestão era um bloco só: a lista inteira e um "Aplicar no plano" que levava tudo
 * junto. Com o gate de segurança ligado (dor na última avaliação), a lista virava sete
 * cartões iguais dizendo "Manter" com o mesmo motivo, e o que pedia decisão sumia no meio.
 *
 * Agora: o que MUDA a dose (progredir, descarregar, encaminhar) vem em linha própria, com
 * Aplicar e Dispensar ao lado, como no protótipo. O que segue igual vira uma frase, com os
 * motivos a um toque. Aplicar continua sendo só sob clique, e só leva a mudança daquele
 * exercício para a semana seguinte do plano.
 */

const nomeEx = (slug?: string) => (slug ? exercises.find((e) => e.slug === slug)?.nome ?? slug : "Exercício");

const VAR_LABEL: Record<VariavelTravavel, string> = { volume: "volume", intensidade: "intensidade", complexidade: "complexidade" };

const ACAO: Record<AcaoCarga, { verbo: string; chip: string; linha: string }> = {
  subir: { verbo: "Progredir", chip: "bg-success-tint text-success", linha: "border-success/30 bg-success-tint/40" },
  descarregar: { verbo: "Reduzir", chip: "bg-warning-tint text-warning", linha: "border-warning/30 bg-warning-tint/40" },
  encaminhar: { verbo: "Encaminhar", chip: "bg-danger-tint text-danger", linha: "border-danger/30 bg-danger-tint/40" },
  manter: { verbo: "Manter", chip: "bg-surface-soft text-ink-2 ring-1 ring-inset ring-border", linha: "border-border" },
  "sem-dado": { verbo: "Sem dado", chip: "bg-surface-soft text-ink-2 ring-1 ring-inset ring-border", linha: "border-border" },
};

/** O que aplicar muda no plano, em palavras: "2 séries · 12 reps · RIR 3". */
function mudancaEmTexto(m: NonNullable<SugestaoRenovacao["mudancaAlvo"]>): string {
  return [
    m.seriesAlvo != null && `${m.seriesAlvo} séries`,
    m.repsAlvo != null && `${m.repsAlvo} reps`,
    m.rirAlvo != null && `RIR ${m.rirAlvo}`,
    m.cargaRelativaAlvo != null && `${m.cargaRelativaAlvo}% de 1RM`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Contexto de segurança do aluno (semáforo do dia + dor/sinais da última avaliação). */
function ctxSeguranca(estado?: EstadoSemaforo, ultimaAvaliacao?: Avaliacao): CtxSeguranca | undefined {
  const vermelhoPendente = Boolean(estado?.vermelhoPendente);
  const amareloHoje = estado?.hoje?.resultado === "amarelo";
  const dor = ultimaAvaliacao?.dorEscala;
  const sintomas = ultimaAvaliacao?.regioesDor;
  if (!vermelhoPendente && !amareloHoje && !dor && !(sintomas && sintomas.length)) return undefined;
  return { vermelhoPendente, amareloHoje, dor, sintomas };
}

/**
 * "Reduzir para 20 kg", "Progredir para 24 kg", "Encaminhar". Sem carga externa (peso do
 * corpo, elástico) o motor não devolve quilo nenhum, e o verbo sai sozinho.
 */
function rotuloDaAcao(ajuste: AjusteCarga): string {
  const meta = ACAO[ajuste.acao];
  if (ajuste.proximaCarga == null || ajuste.acao === "manter" || ajuste.acao === "encaminhar") return meta.verbo;
  return `${meta.verbo} para ${String(ajuste.proximaCarga).replace(".", ",")} kg`;
}

interface Linha {
  slug: string;
  nome: string;
  ajuste: AjusteCarga;
  travadas?: VariavelTravavel[];
  sugestao?: SugestaoRenovacao;
}

export function AjustesSugeridos({
  plano,
  execucoes,
  feedbacks,
  aluno,
  estadoSemaforo,
  ultimaAvaliacao,
  onAplicarPlano,
}: {
  plano?: PlanoTreino;
  execucoes: Execucao[];
  feedbacks: SessaoFeedback[];
  aluno?: Aluno;
  estadoSemaforo?: EstadoSemaforo;
  ultimaAvaliacao?: Avaliacao;
  /** aplica a mudança aprovada ao plano (nunca automático; só sob clique) */
  onAplicarPlano?: (planoId: string, patch: { macrociclo: Macrociclo }) => void;
}) {
  const [aplicados, setAplicados] = React.useState<Set<string>>(() => new Set());
  const [dispensados, setDispensados] = React.useState<Set<string>>(() => new Set());
  const [verMantidos, setVerMantidos] = React.useState(false);

  const seg = ctxSeguranca(estadoSemaforo, ultimaAvaliacao);
  // O teto de esforço da FORÇA e o passo do perfil (condição e idade), e não o teto do aeróbio.
  const modPerfil: ModProgressaoAjuste | undefined = aluno
    ? modAjusteDaForca({
        grupos: [aluno.grupoEspecial, ...(aluno.condicoesAtencao ?? [])],
        farmacos: aluno.farmacos,
        farmacosNaoInformado: aluno.farmacosNaoInformado,
        idade: aluno.idade,
      })
    : undefined;

  // Só os registros DESTE plano: registro de um plano arquivado não decide a semana deste.
  const execs = plano ? execucoes.filter((e) => e.planoId === plano.id) : execucoes;
  const fbs = plano ? feedbacks.filter((f) => f.planoId === plano.id) : feedbacks;

  const ultimaSemana = execs.length ? Math.max(...execs.map((e) => e.semana ?? 0)) : 0;
  const renovacao: RenovacaoSugerida | undefined =
    plano && ultimaSemana > 0 ? renovarMicrociclo(plano, ultimaSemana, execs, fbs, seg, { modPerfil }) : undefined;

  const faixaPorSlug = new Map<string, ReturnType<typeof faixaDeReps>>();
  plano?.macrociclo.mesociclos
    .flatMap((m) => m.microciclos)
    .flatMap((mc) => mc.sessoes)
    .flatMap((s) => s.blocos)
    .forEach((b) => {
      if (b.exercicioSlug && !faixaPorSlug.has(b.exercicioSlug)) faixaPorSlug.set(b.exercicioSlug, faixaDeReps(b.reps));
    });

  const linhas: Linha[] = renovacao
    ? renovacao.sugestoes
        .filter((s) => s.ajuste.acao !== "sem-dado")
        .map((s) => ({ slug: s.slug, nome: s.nomeExercicio, ajuste: s.ajuste, travadas: s.travadas, sugestao: s }))
    : [...new Set(execs.map((e) => e.exercicioSlug).filter(Boolean) as string[])]
        .map((slug) => ({
          slug,
          nome: nomeEx(slug),
          ajuste: ajustarCarga(
            execs.filter((e) => e.exercicioSlug === slug),
            faixaPorSlug.get(slug) ?? { min: 8, max: 12 },
            { seguranca: seg, incrementoPct: incrementoDoExercicio(slug).pct, modPerfil, semCargaExterna: semCargaExterna(exercises.find((e) => e.slug === slug)?.equipamento) },
          ),
        }))
        .filter((s) => s.ajuste.acao !== "sem-dado");

  if (linhas.length === 0) return null;

  const mudam = linhas.filter((l) => l.ajuste.acao !== "manter" && !dispensados.has(l.slug) && !aplicados.has(l.slug));
  const mantidos = linhas.filter((l) => l.ajuste.acao === "manter");
  const aplicavel = (l: Linha) => Boolean(l.sugestao?.mudancaAlvo && Object.keys(l.sugestao.mudancaAlvo).length > 0);
  const podeAplicar = Boolean(plano && renovacao?.semanaAlvo != null && onAplicarPlano);
  const aplicaveis = mudam.filter(aplicavel);
  // Um motivo só quando todos os mantidos dizem a mesma coisa (o caso do gate de segurança).
  const motivoUnico = new Set(mantidos.map((m) => m.ajuste.motivo)).size === 1 ? mantidos[0]?.ajuste.motivo : undefined;

  const aplicar = (alvo: Linha[]) => {
    if (!plano || !renovacao || !onAplicarPlano) return;
    const sugestoes = alvo.map((l) => l.sugestao).filter((s): s is SugestaoRenovacao => Boolean(s));
    onAplicarPlano(renovacao.planoId, aplicarRenovacao(plano, { ...renovacao, sugestoes }));
    setAplicados((s) => new Set([...s, ...alvo.map((l) => l.slug)]));
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-display text-lg font-bold text-ink">
          Ajustes sugeridos{" "}
          <span className="text-xs font-semibold text-ink-2">
            · {mudam.length === 0 ? "nenhuma mudança" : `${mudam.length} de ${linhas.length} ${linhas.length === 1 ? "exercício" : "exercícios"}`}
          </span>
        </h2>
        {podeAplicar && aplicaveis.length > 1 && (
          <button type="button" onClick={() => aplicar(aplicaveis)} className="text-sm font-semibold text-primary hover:underline">
            Aplicar os {aplicaveis.length}
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-2">
        Leitura do que o aluno registrou{renovacao ? ` na semana ${renovacao.semanaBase}` : ""}. A decisão é sua
        {renovacao?.semanaAlvo != null ? `: aplicar leva a mudança para a semana ${renovacao.semanaAlvo}.` : "."}
        {renovacao && renovacao.puladas.length > 0 &&
          ` ${renovacao.puladas.length === 1 ? `A semana ${renovacao.puladas[0]} é de descarga no plano e fica como está` : `As semanas ${renovacao.puladas.join(" e ")} são de descarga no plano e ficam como estão`}.`}
      </p>

      {seg && (
        <p className="mt-3 flex items-start gap-2 rounded-control border border-warning/30 bg-warning-tint px-3 py-2.5 text-xs text-ink-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          <span>
            <span className="font-semibold text-ink">Progressão travada por segurança</span>
            {seg.vermelhoPendente ? " (semáforo não liberado)" : seg.amareloHoje ? " (semáforo com ressalva)" : ""}
            {seg.dor ? `, dor ${`${seg.dor}`.replace(".", ",")}/10 na última avaliação` : ""}
            {seg.sintomas && seg.sintomas.length ? `, sinais: ${seg.sintomas.join(", ")}` : ""}. Enquanto isso, a
            decisão é manter, reduzir ou encaminhar.
          </span>
        </p>
      )}

      {mudam.length > 0 && (
        <ul className="mt-3.5 space-y-2">
          {mudam.map((l) => {
            const meta = ACAO[l.ajuste.acao];
            return (
              <li key={l.slug} className={cn("flex flex-wrap items-center gap-3 rounded-card border px-3.5 py-3", meta.linha)}>
                <div className="min-w-0 flex-1 basis-64">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{l.nome}</span>
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold", meta.chip)}>
                      {rotuloDaAcao(l.ajuste)}
                    </span>
                    {l.travadas && l.travadas.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-2xs font-medium text-ink-2">
                        <Lock className="h-3 w-3" aria-hidden /> {l.travadas.map((v) => VAR_LABEL[v]).join(" e ")} travada
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-2">{l.ajuste.motivo}</p>
                  {/* O que o botão faz, dito antes do clique. O plano prescreve séries,
                      repetições e esforço, não quilos: quando a sugestão é só de carga, não há
                      o que aplicar, e a linha diz isso em vez de esconder o botão calada. */}
                  <p className="mt-1 text-xs font-medium text-ink">
                    {podeAplicar && aplicavel(l) && l.sugestao?.mudancaAlvo
                      ? `Aplicar muda a semana ${renovacao?.semanaAlvo} para ${mudancaEmTexto(l.sugestao.mudancaAlvo)}.`
                      : l.ajuste.acao === "encaminhar"
                        ? "O plano segue igual até a sua decisão."
                        : `O plano segue igual: vale como orientação${l.ajuste.proximaCarga != null ? " de carga" : ""} para a próxima sessão.`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {podeAplicar && aplicavel(l) && (
                    <button type="button" onClick={() => aplicar([l])} className={buttonClasses("primary", "sm")}>
                      Aplicar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDispensados((s) => new Set([...s, l.slug]))}
                    className={buttonClasses("secondary", "sm")}
                  >
                    Dispensar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {aplicados.size > 0 && (
        <p className="mt-3 flex items-center gap-1.5 rounded-control border border-success/30 bg-success-tint px-3 py-2.5 text-xs font-medium text-success">
          <Check className="h-3.5 w-3.5" aria-hidden />
          {aplicados.size === 1 ? "Ajuste aplicado" : `${aplicados.size} ajustes aplicados`} na semana {renovacao?.semanaAlvo} do plano.
          Confira no editor quando quiser.
        </p>
      )}

      {mantidos.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-sm text-ink-2">
            <span className="font-semibold text-ink">
              {mantidos.length === 1 ? "1 exercício segue como está" : `${mantidos.length} exercícios seguem como estão`}
            </span>
            {/* Com a trava de segurança, o motivo comum já está no aviso logo acima. */}
            {motivoUnico && !seg ? `: ${motivoUnico}` : "."}
          </p>
          <button
            type="button"
            onClick={() => setVerMantidos((v) => !v)}
            aria-expanded={verMantidos}
            className="mt-1 inline-flex min-h-[32px] items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            {verMantidos ? "Esconder" : motivoUnico ? "Ver quais" : "Ver quais e por quê"}            <ChevronDown className={cn("h-4 w-4 transition-transform", verMantidos && "rotate-180")} aria-hidden />
          </button>
          {verMantidos && (
            <ul className="mt-1.5 space-y-1.5">
              {mantidos.map((l) => (
                <li key={l.slug} className="text-sm">
                  <span className="font-semibold text-ink">{l.nome}</span>
                  {!motivoUnico && <span className="block text-xs text-ink-2">{l.ajuste.motivo}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
