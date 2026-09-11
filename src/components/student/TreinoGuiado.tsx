import * as React from "react";
import { ChevronLeft, ChevronRight, Timer, Check, Maximize2, Dumbbell, Flame, Lightbulb } from "lucide-react";
import { cn, withBase } from "@/lib/utils";
import { ExercicioSheet } from "@/components/student/ExercicioSheet";
import {
  nomeDoBloco,
  tokensDoBloco,
  exercicioDoBloco,
  temFolhaExercicio,
  iconeModalidade,
  modalidadeDoBloco,
  RegistroBloco,
  chipsDoGuiado,
  seriesFeitas,
  blocoCompleto,
} from "@/components/student/blocoRegistro";
import { modalidadeImagem } from "@/data/modalities";
import { refCurta } from "@/data/referencias";
import { corDeContraste } from "@/lib/theme/palettes";
import { rotuloFaixaPse, bandaPse, TINT_PSE, RING_PSE } from "@/lib/pse";
import { agruparBlocosPorMetodo, getMetodo, type Sessao, type BlocoSessao } from "@/data/periodizacao";
import type { Execucao, SessaoFeedback } from "@/data/execucao";

/**
 * Modo guiado do treino do aluno ("Começar treino"). Ocupa o app inteiro (no lugar
 * das abas) e leva o aluno por um SEGMENTO por vez (bloco solo ou grupo de método
 * inteiro), com os MESMOS campos de registro do BlocoRow (via RegistroBloco: id e
 * upsert idênticos aos do registro inline).
 *
 * A forma segue o mockup: cabeçalho com o nome da sessão em eyebrow, "Exercício N
 * de M", cronômetro e Sair; barra de progresso; foto grande tocável; chips de
 * dose; a dica do professor destacada em âmbar; e o rodapé Anterior / Pular /
 * Próximo.
 *
 * Ao concluir, a tela de fechamento traz números REAIS (exercícios registrados e
 * duração MEDIDA pelo cronômetro) e a percepção de esforço da SESSÃO (escala de
 * Borg, base do sRPE de Foster), com um recado opcional ao professor.
 *
 * Sem número inventado: a duração vem do cronômetro (nunca estimada) e some se o aluno
 * sair sem concluir. Pontuação saiu a pedido do Filipe (31/07/2026): a proposta é
 * registro clínico, não jogo.
 */
export function TreinoGuiado({
  sessao,
  semana,
  cor,
  tinta: tintaDada,
  planoId,
  alunoId,
  execucoes,
  marcaNome,
  streakAtual,
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
  /** a tinta do par verificado da marca (parDeMarca); sem ela, calcula por luminância */
  tinta?: string;
  planoId: string;
  alunoId: string;
  execucoes: Execucao[];
  /** nome do profissional: assina a dica e o "recado para ..." */
  marcaNome?: string;
  /** sequência de dias ANTES desta sessão, para a frase honesta do fecho */
  streakAtual?: number;
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  onFeedback?: (f: SessaoFeedback) => void;
  /** feedback já registrado desta sessão (pré-preenche a conclusão se voltar a ela) */
  feedbackExistente?: SessaoFeedback;
  preview?: boolean;
  onSair: () => void;
}) {
  const segmentos = agruparBlocosPorMetodo(sessao.blocos);
  /*
   * O GUIADO ABRE ONDE O ALUNO PAROU, e não sempre no exercício 1. O início agora diz
   * "Continuar · 1 de 5 feitos"; abrir no primeiro exercício, já feito, desmentiria o botão
   * que acabou de ser tocado. O segmento pendente é o primeiro com algum bloco incompleto
   * (um bi-set só está feito quando os dois estão). Tudo feito: volta ao começo, para revisar.
   */
  const [idx, setIdx] = React.useState(() => {
    const i = segmentos.findIndex((seg) =>
      (seg.tipo === "grupo" ? seg.blocos : [seg.bloco]).some((b) => !blocoCompleto(b, execucoes, semana)),
    );
    return i < 0 ? 0 : i;
  });
  const [fase, setFase] = React.useState<"guiado" | "conclusao">("guiado");
  const tinta = tintaDada ?? corDeContraste(cor);
  const primeiroNomeProf = (marcaNome ?? "").split(" ")[0];

  // Cronômetro real a partir do "Começar": vira a duração MEDIDA no feedback. Roda só
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
    const registrados = sessao.blocos.filter((b) => blocoCompleto(b, execucoes, semana)).length;
    const total = sessao.blocos.length;
    // SÉRIES registradas nesta sessão e nesta semana: cada linha de execução é uma série
    // gravada (bloco de série única e aeróbio contam uma). É contagem do que foi feito, não do
    // que foi prescrito.
    const idsDaSessao = new Set(sessao.blocos.map((b) => b.id));
    const seriesRegistradas = execucoes.filter(
      (e) => e.alunoId === alunoId && e.semana === semana && idsDaSessao.has(e.blocoRef),
    ).length;
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
        <div className="animate-surgir px-3.5 pb-3.5 pt-[18px]">
          <div className="text-center">
            <span className="mx-auto mt-1.5 grid h-16 w-16 place-items-center rounded-full" style={{ background: cor, color: tinta }}>
              <Check className="h-7 w-7" strokeWidth={3} aria-hidden />
            </span>
            <h2 className="mt-3 font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">Treino concluído!</h2>
            <p className="mt-1 inline-flex flex-wrap items-center justify-center gap-x-1 text-xs text-ink-2">
              <span>{sessao.nome}</span>
              {/* A sequência só é anunciada quando já existe: "vai a 1" no primeiro
                  treino da vida seria confete sem conteúdo. */}
              {streakAtual && streakAtual > 0 ? (
                <span className="inline-flex items-center gap-1">
                  · <Flame className="h-3 w-3 text-warning" aria-hidden /> {streakAtual} {streakAtual === 1 ? "dia seguido" : "dias seguidos"}
                </span>
              ) : null}
            </p>
          </div>

          {/* Fecho de flexibilidade (onda F): lembrete curto ao encerrar a sessão, com o nome
              do que ele é na frente, como no protótipo. Sem o rótulo, a frase chegava solta. */}
          {sessao.fecho && (
            <div
              className="mt-3 rounded-control border border-border bg-surface px-3 py-[9px] text-left"
              style={{ borderLeftColor: cor, borderLeftWidth: 3 }}
            >
              {/* O texto do plano às vezes já abre com o rótulo; ele não se repete. */}
              <p className="text-2xs leading-[1.45] text-ink-2">
                <b className="text-ink">Fecho de flexibilidade:</b> {sessao.fecho.replace(/^\s*fecho de flexibilidade\s*:\s*/i, "")}
              </p>
            </div>
          )}

          {/* Números reais da sessão: o que foi registrado, quantas séries e quanto tempo
              levou. "Medidos" porque é o cronômetro, não uma estimativa. Pontuação saiu a
              pedido do Filipe: a proposta é registro clínico, não jogo. */}
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            <NumeroCard valor={`${registrados}/${total}`} rotulo={total === 1 ? "exercício" : "exercícios"} />
            <NumeroCard valor={String(seriesRegistradas)} rotulo={seriesRegistradas === 1 ? "série" : "séries"} />
            <NumeroCard valor={String(duracaoMin)} rotulo={duracaoMin === 1 ? "minuto medido" : "minutos medidos"} />
          </div>

          {/* Percepção de esforço da SESSÃO (rótulos de p-rpe, escala de Borg). As cores por
              faixa são as de `bandaPse`, compartilhadas com o painel do profissional ("Como o
              aluno sentiu"): trocar só aqui partiria o "Intenso" em duas cores. */}
          <section className="mt-3.5">
            <h3 className="font-display text-sm font-bold text-ink">Como foi o esforço de hoje?</h3>
            <div className="mt-2 grid grid-cols-6 gap-[5px]">
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
                      "tabular flex min-h-[44px] items-center justify-center rounded-full text-[12.5px] font-bold",
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
            {pse != null && faixaSel && (
              <p className="mt-1.5 text-center text-[11.5px] font-semibold text-ink">
                {pse}
                {faixaSel.rotulo ? ` · ${faixaSel.rotulo}` : ""}
              </p>
            )}
            <p className="mt-1.5 text-2xs text-ink-2">
              Escala de esforço percebido: {refCurta("borg-1982")}; carga da sessão: {refCurta("foster-2001")}
            </p>
          </section>

          {/* Recado opcional ao professor. */}
          <section className="mt-3">
            <label htmlFor={obsId} className="block text-xs font-semibold text-ink">
              Recado para {primeiroNomeProf || "o seu professor"} <span className="font-normal text-ink-2">(opcional)</span>
            </label>
            <textarea
              id={obsId}
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={2}
              placeholder="Senti o joelho na última série..."
              className="mt-1.5 min-h-[52px] w-full rounded-[10px] border border-border bg-surface px-2.5 py-2 text-[11.5px] text-ink placeholder:text-ink-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </section>

          <button
            onClick={enviar}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-bold"
            style={{ background: cor, color: tinta }}
          >
            Enviar e fechar
          </button>
        </div>
      </div>
    );
  }

  const seg = segmentos[idx];
  const progresso = N > 0 ? ((idx + 1) / N) * 100 : 0;

  const blocoProps = { cor, tinta, semana, planoId, alunoId, sessaoRef: sessao.id, execucoes, onRegistrar, onDesfazer, preview, professor: primeiroNomeProf };

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-bg">
      {/* Cabeçalho: sessão em eyebrow, posição, cronômetro e sair. */}
      <header className="shrink-0 px-3.5 pb-2.5 pt-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-2xs font-bold uppercase tracking-[0.1em] text-ink-2">{sessao.nome}</div>
            <div className="font-display text-lg font-bold leading-tight tracking-[-0.01em] text-ink">
              Exercício {idx + 1} de {N}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="tabular flex items-center gap-1 text-xs font-semibold text-ink-2">
              <Timer className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Tempo de treino </span>
              {mmss}
            </span>
            <button
              onClick={sair}
              className="inline-flex min-h-[44px] items-center rounded-full px-2.5 text-xs font-semibold text-ink hover:bg-surface-soft"
            >
              Sair
            </button>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-[3px] bg-surface-soft" role="img" aria-label={`Exercício ${idx + 1} de ${N}`}>
          <div
            className="h-full rounded-[3px] transition-[width] duration-500"
            style={{ width: `${progresso}%`, backgroundImage: `linear-gradient(90deg, ${cor} 0%, var(--brand-turquesa) 100%)` }}
          />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-3.5 pb-4">
        {seg.tipo === "grupo" ? (
          <div className="rounded-card border-2 p-2" style={{ borderColor: cor }}>
            <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
              <span className="rounded-full px-2 py-0.5 text-2xs font-bold" style={{ background: cor, color: tinta }}>
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
          /* A CHAVE É O BLOCO. Sem ela o React reaproveitava o mesmo registro de um exercício
             para o outro, e os campos chegavam ao exercício 2 com a carga do exercício 1 (e
             sem as repetições do alvo, que só entram quando o campo nasce). */
          <BlocoGuiado key={seg.bloco.id} bloco={seg.bloco} {...blocoProps} />
        )}
      </main>

      {/* Navegação: Anterior / Pular / Próximo (vira Concluir no último). */}
      <nav className="flex shrink-0 items-center gap-2 border-t border-border bg-surface px-3.5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2.5">
        <button
          onClick={voltar}
          disabled={idx === 0}
          className="inline-flex h-11 items-center gap-0.5 rounded-full px-2 text-[12.5px] font-semibold text-ink-2 hover:bg-surface-soft disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> Anterior
        </button>
        <button onClick={avancar} className="inline-flex h-11 items-center rounded-full px-2 text-[12.5px] font-medium text-ink-2 hover:text-ink">
          Pular
        </button>
        <button
          onClick={avancar}
          className="ml-auto inline-flex h-11 items-center gap-1.5 rounded-full px-[18px] text-[13px] font-bold"
          style={{ background: cor, color: tinta }}
        >
          {ultimo ? (
            <>
              <Flame className="h-4 w-4" aria-hidden /> Concluir treino
            </>
          ) : (
            <>
              Próximo <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </nav>
    </div>
  );
}

/* --------------------------- Bloco no modo guiado ------------------------- */

// Um bloco em destaque no modo guiado: a foto grande (tocável, abre a folha), os
// chips de dose, os MESMOS campos de registro e a dica do professor em âmbar.
function BlocoGuiado({
  bloco,
  cor,
  tinta,
  semana,
  planoId,
  alunoId,
  sessaoRef,
  execucoes,
  onRegistrar,
  onDesfazer,
  preview,
  professor,
}: {
  bloco: BlocoSessao;
  cor: string;
  tinta: string;
  semana: number;
  planoId: string;
  alunoId: string;
  sessaoRef: string;
  execucoes: Execucao[];
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  preview?: boolean;
  /** primeiro nome do profissional, para assinar a dica */
  professor?: string;
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
  const feitas = seriesFeitas(execucoes, semana, bloco.id);

  const temFotoForca = !aerobio && !!ex?.imagem && imgOk;
  const temFotoModalidade = aerobio && !!modalidade && modOk;
  const chips = chipsDoGuiado(bloco);

  return (
    <div className="mt-2.5 rounded-[18px] border border-border bg-surface p-2.5">
      {/* Visual grande, com o gesto de ampliar no canto (como no mockup). */}
      {temFolha && temFotoForca ? (
        <button
          ref={gatilhoRef}
          type="button"
          onClick={() => setSheetAberto(true)}
          aria-haspopup="dialog"
          aria-label={`Ver o exercício ${nomeDoBloco(bloco)}`}
          className="group relative block w-full overflow-hidden rounded-control"
        >
          <div className="aspect-[4/3] w-full overflow-hidden rounded-control bg-surface-soft">
            <img
              src={withBase(ex!.imagem!)}
              alt={nomeDoBloco(bloco)}
              loading="lazy"
              onError={() => setImgOk(false)}
              className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            />
          </div>
          <span
            aria-hidden
            className="absolute bottom-2.5 right-2.5 grid h-[34px] w-[34px] place-items-center rounded-full bg-surface/90 text-ink backdrop-blur"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        </button>
      ) : temFotoModalidade ? (
        <div className="aspect-[4/3] w-full overflow-hidden rounded-control bg-surface-soft">
          <img
            src={withBase(modalidadeImagem(modalidade!.id))}
            alt={modalidade!.nome}
            loading="lazy"
            onError={() => setModOk(false)}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="grid aspect-[4/3] w-full place-items-center rounded-control bg-surface-soft">
          <span className="grid h-16 w-16 place-items-center rounded-card" style={{ background: cor, color: tinta }}>
            {aerobio ? <IconeAerobio className="h-8 w-8" /> : <Dumbbell className="h-8 w-8" />}
          </span>
        </div>
      )}

      {/* Nome + "ver como fazer" (abre a folha quando há conteúdo). O link ESCREVE na cor da
          marca, então usa a versão dela que passa 4,5:1 (`--primary-texto`). */}
      <div className="mt-2 flex items-start justify-between gap-2">
        <h2 className="min-w-0 flex-1 pt-0.5 font-display text-[17px] font-bold leading-[1.15] tracking-[-0.01em] text-ink">
          {nomeDoBloco(bloco)}
        </h2>
        {temFolha && (
          <button
            type="button"
            onClick={() => setSheetAberto(true)}
            aria-haspopup="dialog"
            className="-my-2.5 inline-flex min-h-[44px] shrink-0 items-center gap-0.5 rounded-full text-[11.5px] font-semibold text-primary-texto"
          >
            ver como fazer <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      {/* Chips de dose: o primeiro na cor da análise (a dose principal), os outros
          neutros, como no mockup. Série e repetição em chips separados (chipsDoGuiado). */}
      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-[5px]">
          {chips.map((c, i) => (
            <span
              key={c.texto + i}
              className={cn(
                "rounded-full px-[9px] py-1 text-[11.5px]",
                c.principal ? "bg-analysis-tint font-bold text-analysis-text" : "bg-surface-soft font-semibold text-ink-2",
              )}
            >
              {c.texto}
            </span>
          ))}
        </div>
      )}

      <RegistroBloco
        bloco={bloco}
        cor={cor}
        tinta={tinta}
        semana={semana}
        planoId={planoId}
        alunoId={alunoId}
        sessaoRef={sessaoRef}
        feitas={feitas}
        onRegistrar={onRegistrar}
        onDesfazer={onDesfazer}
        preview={preview}
        sempreMostrar
      />

      {/* Dica do professor: a observação que ele escreveu neste bloco, assinada e
          destacada em âmbar. Sem observação, nada aparece (não existe dica
          genérica inventada pelo app). */}
      {bloco.observacao && (
        <div className="mt-2 rounded-control border border-warning/35 bg-warning-tint px-2.5 py-2">
          <p className="flex gap-1.5 text-2xs leading-[1.4] text-warning">
            <Lightbulb className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              {professor ? <strong>Dica de {professor}: </strong> : null}
              {bloco.observacao}
            </span>
          </p>
        </div>
      )}

      {sheetAberto && ex && (
        <ExercicioSheet
          exercicioSlug={ex.slug}
          nome={nomeDoBloco(bloco)}
          tokens={tokens}
          cor={cor}
          tinta={tinta}
          observacao={bloco.observacao}
          onClose={fechar}
        />
      )}
    </div>
  );
}

function NumeroCard({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-control border border-border bg-surface px-1.5 py-2.5 text-center">
      <div className="tabular font-display text-[17px] font-bold leading-tight text-ink">{valor}</div>
      <div className="mt-0.5 text-2xs leading-tight text-ink-2">{rotulo}</div>
    </div>
  );
}
