import * as React from "react";
import { ChevronLeft, ChevronRight, Clock, Check, Maximize2, Dumbbell } from "lucide-react";
import { cn, withBase } from "@/lib/utils";
import { LinhaDeTokens, TokenRotulado } from "@/components/ui/primitives";
import { ExercicioSheet } from "@/components/student/ExercicioSheet";
import {
  nomeDoBloco,
  tokensDoBloco,
  exercicioDoBloco,
  temFolhaExercicio,
  iconeModalidade,
  modalidadeDoBloco,
  RegistroBloco,
} from "@/components/student/blocoRegistro";
import { modalidadeImagem } from "@/data/modalities";
import { getParam } from "@/data/monitoringParameters";
import { refCurta } from "@/data/referencias";
import { PONTOS_POR_REGISTRO } from "@/lib/gamificacao";
import { agruparBlocosPorMetodo, getMetodo, type Sessao, type BlocoSessao } from "@/data/periodizacao";
import type { Execucao, SessaoFeedback } from "@/data/execucao";

/**
 * Modo guiado do treino do aluno ("Iniciar treino"). Ocupa o app inteiro (no lugar
 * das abas) e leva o aluno por um SEGMENTO por vez (bloco solo ou grupo de método
 * inteiro), com o visual da Onda B em destaque e os MESMOS campos de registro do
 * BlocoRow (via RegistroBloco: id e upsert idênticos aos do registro inline).
 *
 * Ao concluir, a tela de fechamento traz números REAIS (exercícios registrados,
 * duração MEDIDA pelo cronômetro e pontos ganhos) e a percepção de esforço da SESSÃO
 * (escala de Borg, base do sRPE de Foster), com um recado opcional ao professor.
 *
 * Sem número inventado: a duração vem do cronômetro (nunca estimada) e some se o aluno
 * sair sem concluir; os pontos seguem a regra da gamificação (10 por registro).
 */
export function TreinoGuiado({
  sessao,
  semana,
  cor,
  planoId,
  alunoId,
  execucoes,
  onRegistrar,
  onDesfazer,
  onFeedback,
  feedbackExistente,
  preview,
  onSair,
}: {
  sessao: Sessao;
  semana: number;
  cor: string;
  planoId: string;
  alunoId: string;
  execucoes: Execucao[];
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  onFeedback?: (f: SessaoFeedback) => void;
  /** feedback já registrado desta sessão (pré-preenche a conclusão se voltar a ela) */
  feedbackExistente?: SessaoFeedback;
  preview?: boolean;
  onSair: () => void;
}) {
  const segmentos = agruparBlocosPorMetodo(sessao.blocos);
  const [idx, setIdx] = React.useState(0);
  const [fase, setFase] = React.useState<"guiado" | "conclusao">("guiado");

  // Cronômetro real a partir do "Iniciar": vira a duração MEDIDA no feedback. Roda só
  // na fase guiada; para no unmount (intervalo limpo) e ao concluir.
  const inicioRef = React.useRef(Date.now());
  const [fimMs, setFimMs] = React.useState<number | null>(null);
  const [agora, setAgora] = React.useState(Date.now());
  React.useEffect(() => {
    if (fase !== "guiado") return;
    const t = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [fase]);

  // PSE e recado da sessão (pré-preenchidos se já houver feedback desta sessão).
  const [pse, setPse] = React.useState<number | null>(feedbackExistente?.pse ?? null);
  const [obs, setObs] = React.useState(feedbackExistente?.observacao ?? "");
  const obsId = React.useId();

  const N = segmentos.length;
  const ultimo = idx >= N - 1;
  const decorridoS = Math.floor(((fimMs ?? agora) - inicioRef.current) / 1000);
  const mmss = `${String(Math.floor(decorridoS / 60)).padStart(2, "0")}:${String(decorridoS % 60).padStart(2, "0")}`;

  // Progresso já registrado nesta sessão/semana: governa o aviso ao sair.
  const houveProgresso = sessao.blocos.some((b) => execucoes.some((e) => e.semana === semana && e.blocoRef === b.id));
  const sair = () => {
    // Sair sem concluir NÃO grava feedback nem duração; o que já foi registrado fica
    // salvo (o store já persistiu cada registro). Confirma só quando há progresso.
    if (houveProgresso && !preview && !window.confirm("Sair do treino? O que você já registrou fica salvo.")) return;
    onSair();
  };
  const concluir = () => {
    setFimMs(Date.now());
    setFase("conclusao");
  };
  const avancar = () => (ultimo ? concluir() : setIdx((i) => Math.min(N - 1, i + 1)));
  const voltar = () => setIdx((i) => Math.max(0, i - 1));

  if (fase === "conclusao") {
    const registrados = sessao.blocos.filter((b) => execucoes.some((e) => e.semana === semana && e.blocoRef === b.id)).length;
    const total = sessao.blocos.length;
    const pontos = registrados * PONTOS_POR_REGISTRO;
    const duracaoMin = Math.max(1, Math.round(((fimMs ?? Date.now()) - inicioRef.current) / 60000));
    const faixaSel = pse != null ? rotuloFaixaPse(pse) : null;

    const enviar = () => {
      // PSE e observação são opcionais: enviar vazio só fecha a sessão (com a duração
      // medida e concluidaEm). Id estável por sessão+semana: reenviar sobrescreve.
      onFeedback?.({
        id: `fb-${sessao.id}-s${semana}`,
        alunoId,
        planoId,
        semana,
        sessaoRef: sessao.id,
        pse: pse ?? undefined,
        duracaoMin,
        observacao: obs.trim() || undefined,
        concluidaEm: Date.now(),
      });
      onSair();
    };

    return (
      <div className="min-h-[100dvh] w-full overflow-y-auto bg-bg">
        <div className="animate-surgir px-4 py-8">
          <div className="text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full text-white" style={{ background: cor }}>
              <Check className="h-10 w-10" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-ink">Treino concluído</h2>
            <p className="mt-1 text-sm text-ink-3">{sessao.nome}</p>
          </div>

          {/* Números reais: registrados / duração medida / pontos (10 por registro). */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <NumeroCard valor={`${registrados}/${total}`} rotulo="exercícios" />
            <NumeroCard valor={`${duracaoMin} min`} rotulo="duração" />
            <NumeroCard valor={`+${pontos}`} rotulo="pontos" />
          </div>

          {/* Percepção de esforço da SESSÃO (rótulos de p-rpe, escala de Borg). */}
          <section className="mt-6">
            <h3 className="font-display text-base font-bold text-ink">Como foi o esforço do treino de hoje?</h3>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
                const sel = pse === n;
                const { familia, forte } = bandaPse(n);
                const rot = rotuloFaixaPse(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPse(sel ? null : n)}
                    aria-pressed={sel}
                    aria-label={`Esforço ${n}${rot.rotulo ? ` · ${rot.rotulo}` : ""}`}
                    className={cn(
                      "flex min-h-[44px] items-center justify-center rounded-xl text-base font-bold",
                      !sel && TINT_PSE[familia],
                      !sel && forte && cn("ring-1 ring-inset", RING_PSE[familia]),
                    )}
                    // Selecionado ganha a cor cheia; o número usa a tint da mesma família
                    // (par com AA garantido nas duas aparências, claro e escuro).
                    style={sel ? { background: `var(--${familia})`, color: `var(--${familia}-tint)` } : undefined}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            {faixaSel && (
              <p className="mt-2 text-center text-sm font-semibold text-ink">
                {faixaSel.faixa} {faixaSel.rotulo}
              </p>
            )}
            <p className="mt-2 text-2xs text-ink-3">
              Escala de esforço percebido: {refCurta("borg-1982")}; carga da sessão: {refCurta("foster-2001")}
            </p>
          </section>

          {/* Recado opcional ao professor. */}
          <section className="mt-5">
            <label htmlFor={obsId} className="block text-sm font-semibold text-ink">
              Quer registrar algo para seu professor?
            </label>
            <textarea
              id={obsId}
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={3}
              placeholder="Opcional"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-3/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </section>

          <button
            onClick={enviar}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg px-4 text-base font-bold text-white"
            style={{ background: cor }}
          >
            Enviar e fechar
          </button>
        </div>
      </div>
    );
  }

  const seg = segmentos[idx];
  const progresso = N > 0 ? ((idx + 1) / N) * 100 : 0;

  const blocoProps = { cor, semana, planoId, alunoId, sessaoRef: sessao.id, execucoes, onRegistrar, onDesfazer, preview };

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-bg">
      {/* Cabeçalho: progresso, cronômetro discreto e sair. */}
      <header className="shrink-0 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-2xs font-semibold uppercase tracking-wide text-ink-3">{sessao.nome}</div>
            <div className="font-display text-base font-bold text-ink">
              Exercício {idx + 1} de {N}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="tabular flex items-center gap-1 text-sm font-semibold text-ink-2">
              <Clock className="h-4 w-4 text-ink-3" aria-hidden />
              {mmss}
            </span>
            <button
              onClick={sair}
              className="inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold text-ink-2 hover:bg-surface-soft hover:text-ink"
            >
              Sair
            </button>
          </div>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-soft" role="img" aria-label={`Exercício ${idx + 1} de ${N}`}>
          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${progresso}%`, background: cor }} />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        {seg.tipo === "grupo" ? (
          <div className="rounded-card border-2 p-2" style={{ borderColor: cor }}>
            <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
              <span className="rounded-full px-2 py-0.5 text-2xs font-bold text-white" style={{ background: cor }}>
                {getMetodo(seg.metodo)?.nome}
              </span>
              {getMetodo(seg.metodo)?.descricao && (
                <span className="min-w-0 flex-1 text-2xs leading-tight text-ink-2">{getMetodo(seg.metodo)?.descricao}</span>
              )}
            </div>
            <div className="space-y-3">
              {seg.blocos.map((b) => (
                <BlocoGuiado key={b.id} bloco={b} {...blocoProps} />
              ))}
            </div>
          </div>
        ) : (
          <BlocoGuiado bloco={seg.bloco} {...blocoProps} />
        )}
      </main>

      {/* Navegação: Anterior / Pular / Próximo (vira Concluir no último). */}
      <nav className="shrink-0 flex items-center gap-2 border-t border-border bg-surface px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <button
          onClick={voltar}
          disabled={idx === 0}
          className="inline-flex h-12 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-ink-2 hover:bg-surface-soft disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>
        <button
          onClick={avancar}
          className="inline-flex h-12 items-center px-3 text-sm font-medium text-ink-3 hover:text-ink"
        >
          Pular
        </button>
        <button
          onClick={avancar}
          className="ml-auto inline-flex h-12 items-center gap-1.5 rounded-lg px-5 text-sm font-bold text-white"
          style={{ background: cor }}
        >
          {ultimo ? "Concluir treino" : <>Próximo <ChevronRight className="h-4 w-4" /></>}
        </button>
      </nav>
    </div>
  );
}

/* --------------------------- Bloco no modo guiado ------------------------- */

// Um bloco em destaque no modo guiado: o visual grande (foto tocável abre a folha da
// Onda B), a dose e os MESMOS campos de registro (RegistroBloco, sempre visível aqui).
function BlocoGuiado({
  bloco,
  cor,
  semana,
  planoId,
  alunoId,
  sessaoRef,
  execucoes,
  onRegistrar,
  onDesfazer,
  preview,
}: {
  bloco: BlocoSessao;
  cor: string;
  semana: number;
  planoId: string;
  alunoId: string;
  sessaoRef: string;
  execucoes: Execucao[];
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  preview?: boolean;
}) {
  const aerobio = bloco.tipo === "aerobio";
  const tokens = tokensDoBloco(bloco);
  const ex = exercicioDoBloco(bloco);
  const temFolha = !aerobio && temFolhaExercicio(ex);
  const [sheetAberto, setSheetAberto] = React.useState(false);
  const [imgOk, setImgOk] = React.useState(true);
  const gatilhoRef = React.useRef<HTMLButtonElement>(null);
  const fechar = () => {
    setSheetAberto(false);
    gatilhoRef.current?.focus();
  };
  const modalidade = aerobio ? modalidadeDoBloco(bloco) : undefined;
  const [modOk, setModOk] = React.useState(true);
  const IconeAerobio = iconeModalidade(bloco.modalidade, modalidade?.ambiente);
  const execFeita = execucoes.find((e) => e.semana === semana && e.blocoRef === bloco.id);

  const temFotoForca = !aerobio && !!ex?.imagem && imgOk;
  const temFotoModalidade = aerobio && !!modalidade && modOk;

  return (
    <div className="rounded-card border border-border bg-surface-soft p-3">
      {/* Visual grande */}
      {temFolha && temFotoForca ? (
        <button
          ref={gatilhoRef}
          type="button"
          onClick={() => setSheetAberto(true)}
          aria-haspopup="dialog"
          aria-label={`Ver o exercício ${nomeDoBloco(bloco)}`}
          className="group block w-full"
        >
          <div className="mx-auto aspect-[4/3] w-full max-w-[280px] overflow-hidden rounded-xl border border-border bg-surface">
            <img
              src={withBase(ex!.imagem!)}
              alt={nomeDoBloco(bloco)}
              loading="lazy"
              onError={() => setImgOk(false)}
              className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            />
          </div>
        </button>
      ) : temFotoModalidade ? (
        <div className="mx-auto aspect-[4/3] w-full max-w-[280px] overflow-hidden rounded-xl border border-border bg-surface">
          <img
            src={withBase(modalidadeImagem(modalidade!.id))}
            alt={modalidade!.nome}
            loading="lazy"
            onError={() => setModOk(false)}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="mx-auto grid aspect-[4/3] w-full max-w-[280px] place-items-center rounded-xl border border-border bg-surface">
          <span className="grid h-16 w-16 place-items-center rounded-xl text-white" style={{ background: cor }}>
            {aerobio ? <IconeAerobio className="h-8 w-8" /> : <Dumbbell className="h-8 w-8" />}
          </span>
        </div>
      )}

      {/* Nome (abre a folha quando há conteúdo) */}
      <div className="mt-2 flex items-center gap-2">
        {temFolha ? (
          <button
            type="button"
            onClick={() => setSheetAberto(true)}
            aria-haspopup="dialog"
            aria-label={`Ver o exercício ${nomeDoBloco(bloco)}`}
            className="group flex min-h-[44px] min-w-0 flex-1 items-center gap-1.5 text-left"
          >
            <span className="min-w-0 flex-1 font-display text-base font-bold text-ink underline-offset-2 group-hover:underline">
              {nomeDoBloco(bloco)}
            </span>
            <Maximize2 className="h-4 w-4 shrink-0 text-ink-3" aria-hidden />
          </button>
        ) : (
          <span className="min-w-0 flex-1 font-display text-base font-bold text-ink">{nomeDoBloco(bloco)}</span>
        )}
      </div>

      {tokens.length > 0 && (
        <LinhaDeTokens className="mt-1.5">
          {tokens.map((t) => (
            <TokenRotulado key={t.label} label={t.label} value={t.value} />
          ))}
        </LinhaDeTokens>
      )}

      {bloco.observacao && <p className="mt-1 text-xs text-ink-3">{bloco.observacao}</p>}

      <RegistroBloco
        bloco={bloco}
        cor={cor}
        semana={semana}
        planoId={planoId}
        alunoId={alunoId}
        sessaoRef={sessaoRef}
        execFeita={execFeita}
        onRegistrar={onRegistrar}
        onDesfazer={onDesfazer}
        preview={preview}
        sempreMostrar
      />

      {sheetAberto && ex && (
        <ExercicioSheet exercicioSlug={ex.slug} nome={nomeDoBloco(bloco)} tokens={tokens} cor={cor} onClose={fechar} />
      )}
    </div>
  );
}

function NumeroCard({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-soft p-3 text-center">
      <div className="font-display text-lg font-bold text-ink">{valor}</div>
      <div className="text-2xs text-ink-3">{rotulo}</div>
    </div>
  );
}

/* ------------------------------- PSE da sessão ---------------------------- */

// A escala rotulada de p-rpe (0 Repouso a 10 Máximo), lida do parâmetro para não
// inventar rótulo. Cada entrada vira uma faixa numérica + o rótulo base (antes do ":").
const escalaPse = getParam("p-rpe")?.escala ?? [];

function faixaNumerica(valor: string): [number, number] {
  const nums = (valor.match(/\d+/g) ?? []).map(Number);
  if (nums.length === 0) return [NaN, NaN];
  return [nums[0], nums.length > 1 ? nums[1] : nums[0]];
}

// Rótulo da faixa de p-rpe de um valor (ex.: 6 -> "6-7" / "Intenso"). Usa hífen no
// intervalo (nunca travessão) e o rótulo EXATO do parâmetro (Repouso/Muito leve/...).
function rotuloFaixaPse(n: number): { faixa: string; rotulo: string } {
  for (const e of escalaPse) {
    const [a, b] = faixaNumerica(e.valor);
    if (Number.isFinite(a) && n >= a && n <= b) {
      return { faixa: a === b ? String(a) : `${a}-${b}`, rotulo: e.rotulo.split(":")[0].trim() };
    }
  }
  return { faixa: String(n), rotulo: "" };
}

// Cor do chip por faixa: 0-3 success, 4-5 warning suave, 6-7 warning (com anel),
// 8-10 danger. Segue os tokens (tint + texto da mesma família = par com AA garantido).
function bandaPse(n: number): { familia: "success" | "warning" | "danger"; forte: boolean } {
  if (n <= 3) return { familia: "success", forte: false };
  if (n <= 5) return { familia: "warning", forte: false };
  if (n <= 7) return { familia: "warning", forte: true };
  return { familia: "danger", forte: false };
}

const TINT_PSE: Record<"success" | "warning" | "danger", string> = {
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-danger-tint text-danger",
};
const RING_PSE: Record<"success" | "warning" | "danger", string> = {
  success: "ring-success/50",
  warning: "ring-warning/50",
  danger: "ring-danger/50",
};
