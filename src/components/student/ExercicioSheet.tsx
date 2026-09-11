import * as React from "react";
import { X, Target, Play, Pause } from "lucide-react";
import { cn, withBase } from "@/lib/utils";
import { getExercise } from "@/data/exercises";
import { getFasePose } from "@/data/fase-poses";
import { getMuscleMapPose } from "@/data/muscle-map-images";
import { getErroImagemPorIndice } from "@/data/aba-imagens";
import { corDeContraste } from "@/lib/theme/palettes";

/**
 * Folha inferior (bottom-sheet) do exercício, aberta ao tocar no thumb/nome de um
 * bloco de força no app do aluno. Mostra, nesta ordem: o MOVIMENTO (a tira das fases
 * reais quando o slug tem fotos de fase, senão a foto grande de execução), o boneco
 * muscular posado com o músculo primário, o "Como fazer" (resumo + fases), os erros comuns
 * e a DOSE prescrita do bloco. Só usa imagens que existem e foram verificadas (nunca gera
 * nem empresta a de outro exercício); toda imagem entra com loading lazy.
 *
 * Fica DENTRO do container do app (overlay `fixed` centrado em max-w-md, descendente
 * do container temado): sem portal para fora, para o tema white-label do profissional
 * continuar valendo por herança de variáveis CSS. Fecha por X, backdrop e Esc, trava o
 * scroll do fundo, sobe com animação leve (respeitando reduced motion) e leva o foco.
 */
export function ExercicioSheet({
  exercicioSlug,
  nome,
  tokens,
  cor,
  tinta: tintaDada,
  observacao,
  onClose,
}: {
  exercicioSlug: string;
  nome: string;
  /** doses do bloco já calculadas pelo BlocoRow (rótulo colado ao valor) */
  tokens: { label: string; value: string }[];
  cor: string;
  /** a tinta do par verificado da marca; sem ela, calcula por luminância */
  tinta?: string;
  /** a observação que o professor escreveu no bloco (vira aviso na dose, quando curta) */
  observacao?: string;
  onClose: () => void;
}) {
  const ex = getExercise(exercicioSlug);
  const tinta = tintaDada ?? corDeContraste(cor);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const fecharRef = React.useRef<HTMLButtonElement>(null);

  /*
   * O VÉU ACOMPANHA O TEMA DO ALUNO. Era um slate a 50% fixo: no escuro ele mal escurecia o
   * navy, e no claro virava uma mancha cinza-azulada pesada. O tema mora no `data-theme` do
   * container do app (aplicarPaleta), que é ancestral desta folha.
   */
  const [escuro, setEscuro] = React.useState(true);
  React.useLayoutEffect(() => {
    const tema = panelRef.current?.closest("[data-theme]")?.getAttribute("data-theme");
    setEscuro(tema !== "claro");
  }, []);

  // Trava o scroll do fundo enquanto a folha está aberta.
  React.useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);

  // Foco entra na folha ao abrir (o retorno ao gatilho é responsabilidade de quem
  // abriu). preventScroll: a folha já está no viewport, não empurra o fundo travado.
  React.useEffect(() => {
    fecharRef.current?.focus({ preventScroll: true });
  }, []);

  // Esc fecha; Tab fica preso na folha (focus trap leve).
  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const foco = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (foco.length === 0) return;
        const primeiro = foco[0];
        const ultimo = foco[foco.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onClose]);

  // As fotos das fases, quando o slug tem (mesma pessoa e câmera, só muda a posição).
  const fotosDeFase = ex
    ? ex.fases
        .slice(0, 3)
        .map((f, i) => ({ nome: f.nome, src: getFasePose(ex.slug, i) }))
        .filter((f): f is { nome: string; src: string } => !!f.src)
    : [];
  const temMovimento = fotosDeFase.length >= 2;
  const poseMuscular = getMuscleMapPose(exercicioSlug);

  // Músculo primário pelos nomes EXATOS do catálogo (papel "primário"; se nenhum vier
  // marcado, o de maior ativação). Sem número: só o nome, para não afirmar escala.
  const primarios = ex ? ex.ativacao.filter((a) => a.papel === "primário").map((a) => a.musculo) : [];
  const alvo =
    primarios.length > 0
      ? primarios
      : ex && ex.ativacao.length > 0
        ? [ex.ativacao.slice().sort((a, b) => b.percentual - a.percentual)[0].musculo]
        : [];

  const dose = tokensDaFolha(tokens);
  // A observação do professor: curta vira o chip de aviso da dose (protótipo: "amplitude
  // parcial"); longa não cabe num chip e vira a caixa de dica, com a frase inteira.
  const obs = observacao?.trim();
  const obsCurta = !!obs && obs.length <= 28;

  return (
    <>
      {/* Backdrop: dentro da coluna do app (mesma largura da barra inferior). */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="animate-surgir-backdrop fixed inset-0 z-40 mx-auto max-w-md"
        style={{ background: escuro ? "rgba(5,8,12,.55)" : "rgba(11,22,40,.45)" }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={nome}
        className="animate-subir-folha fixed inset-x-0 bottom-0 top-[50px] z-50 mx-auto flex w-full max-w-md flex-col rounded-t-[24px] border-t border-border bg-surface shadow-elevated"
      >
        {/* Puxador + cabeçalho fixo */}
        <div className="shrink-0 rounded-t-[24px] border-b border-border bg-surface px-3.5 pb-2.5 pt-2">
          <div className="mx-auto mb-2 h-1 w-[38px] rounded-[2px] bg-border" aria-hidden />
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 font-display text-[17px] font-bold leading-tight text-ink">{nome}</h2>
            <button
              ref={fecharRef}
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="-my-2 -mr-2.5 grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-soft hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3.5 pb-4 pt-3">
          {/* Mídia: a tira das fases reais, ou a foto grande de execução */}
          {temMovimento ? (
            <TiraDeFases fotos={fotosDeFase} cor={cor} nome={nome} />
          ) : ex?.imagem ? (
            <figure className="mx-auto max-w-[300px]">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-control bg-surface-soft">
                <img
                  src={withBase(ex.imagem)}
                  alt={`Execução: ${nome}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </figure>
          ) : null}

          {/* Boneco muscular posado + músculo(s) primário(s) pelo nome do catálogo. O boneco
              foi desenhado para papel claro, então o papel dele é claro nos dois temas: sobre
              o navy o desenho perdia o contorno. */}
          {poseMuscular && (
            <section className="flex items-center gap-3 rounded-[14px] border border-border bg-bg p-2.5">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[10px]" style={{ background: "#F2F6FC" }}>
                <img
                  src={withBase(poseMuscular)}
                  alt={`Músculos trabalhados em ${nome}`}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </div>
              {alvo.length > 0 && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-2xs font-bold uppercase tracking-[0.08em] text-ink-2">
                    <Target className="h-3 w-3" aria-hidden />
                    Músculo{alvo.length > 1 ? "s" : ""} principal{alvo.length > 1 ? "is" : ""}
                  </div>
                  <p className="mt-0.5 text-[13px] font-bold text-ink">{alvo.join(" · ")}</p>
                </div>
              )}
            </section>
          )}

          {/* Como fazer: resumo prático + as fases numeradas, uma por linha */}
          {ex && (ex.resumoPratico || ex.fases.length > 0) && (
            <section>
              <h3 className="font-display text-sm font-bold text-ink">Como fazer</h3>
              {ex.resumoPratico && <p className="mt-1 text-[11.5px] leading-[1.45] text-ink-2">{ex.resumoPratico}</p>}
              {ex.fases.length > 0 && (
                <ol className="mt-2 space-y-1.5">
                  {ex.fases.map((f, i) => (
                    <li key={f.nome} className="flex gap-2 text-[11.5px] leading-snug text-ink">
                      <span
                        aria-hidden
                        className="tabular mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-2xs font-bold"
                        style={{ background: cor, color: tinta }}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <b>{f.nome}</b>
                        <span className="text-ink-2"> · {f.descricao}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}

          {/*
            ERROS COMUNS (protótipo, tela 04).
            O aluno abria a folha, via como fazer e ia executar sem nunca ler o que evitar,
            que é a metade da orientação que evita lesão. O texto sai do catálogo
            (`errosComuns`) e a foto, quando existe, do índice de imagens de erro. Sem
            imagem o erro continua listado: a frase é o conteúdo, a foto é o reforço.
          */}
          {ex?.blocos.errosComuns && ex.blocos.errosComuns.length > 0 && (
            <section>
              <h3 className="font-display text-sm font-bold text-ink">Erros comuns</h3>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {ex.blocos.errosComuns.slice(0, 4).map((erro, i) => {
                  const img = getErroImagemPorIndice(exercicioSlug, i);
                  return (
                    <div key={erro} className="overflow-hidden rounded-control border border-border bg-bg">
                      {img && (
                        <img src={withBase(img)} alt="" loading="lazy" className="block aspect-[4/3] w-full object-cover" />
                      )}
                      <span className="block px-2 py-1.5 text-2xs leading-snug text-ink">
                        <X className="mr-0.5 inline h-3 w-3 align-[-2px] text-danger" strokeWidth={3} aria-hidden />
                        {erro}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Dose prescrita do bloco (mesma fonte de verdade da linha do treino), com o
              rótulo colado ao valor em cada chip. */}
          {(dose.length > 0 || obsCurta) && (
            <section>
              <h3 className="font-display text-sm font-bold text-ink">Sua dose de hoje</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {dose.map((t) => (
                  <span key={t.label} className="tabular rounded-[8px] bg-surface-soft px-2 py-1 text-[11.5px]">
                    <span className="text-ink-2">{t.label}</span> <b className="text-ink">{t.value}</b>
                  </span>
                ))}
                {obsCurta && (
                  <span className="rounded-[8px] bg-warning-tint px-2 py-1 text-[11.5px] font-semibold text-warning">{obs}</span>
                )}
              </div>
              {obs && !obsCurta && (
                <p className="mt-2 rounded-control border border-warning/35 bg-warning-tint px-2.5 py-2 text-2xs leading-[1.4] text-warning">
                  {obs}
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * A dose na voz do aluno, para os chips da folha.
 *
 * A dose central "3 x 12" vira "Séries 3" e "Reps 12" (dois números, dois papéis), e a sigla
 * RIR vira "Reserva 3 reps": a sigla nunca foi explicada em lugar nenhum do app do aluno, e
 * a lista do dia já diz a mesma coisa por extenso (`esforcoPorExtenso`, em blocoRegistro).
 */
function tokensDaFolha(tokens: { label: string; value: string }[]): { label: string; value: string }[] {
  return tokens.flatMap((t) => {
    if (t.label === "Série") {
      const par = t.value.match(/^(\d+)\s*x\s*(.+)$/);
      if (par) return [{ label: "Séries", value: par[1] }, { label: "Reps", value: par[2].trim() }];
    }
    if (t.label === "RIR") {
      const n = Number(t.value);
      if (!Number.isFinite(n)) return [{ label: "Reserva", value: t.value }];
      return [{ label: "Reserva", value: n === 0 ? "nenhuma" : `${n} ${n === 1 ? "rep" : "reps"}` }];
    }
    return [t];
  });
}

/*
 * A TIRA DAS FASES (protótipo, tela 04): as fotos reais de cada fase lado a lado, com a
 * ativa realçada na cor da marca e trocando no mesmo ritmo do player do Laboratório
 * (900 ms). O movimento continua, só que o aluno também vê as três posições de uma vez, que
 * é o que ele precisa para conferir a própria execução. Tocar numa foto fixa aquela fase;
 * o botão alterna a animação. Com movimento reduzido no aparelho, nasce parada.
 *
 * O `MovimentoPlayer` do Laboratório não muda: ele é compartilhado e tem outra função.
 */
function TiraDeFases({ fotos, cor, nome }: { fotos: { nome: string; src: string }[]; cor: string; nome: string }) {
  const reduzido = React.useMemo(
    () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const [ativa, setAtiva] = React.useState(0);
  const [tocando, setTocando] = React.useState(!reduzido);
  const total = fotos.length;

  React.useEffect(() => {
    if (!tocando || total < 2) return;
    const id = window.setInterval(() => setAtiva((f) => (f + 1) % total), 900);
    return () => window.clearInterval(id);
  }, [tocando, total]);

  return (
    <figure>
      <div className="grid grid-cols-3 gap-[5px]">
        {fotos.map((f, i) => (
          <button
            key={f.src}
            type="button"
            onClick={() => {
              setTocando(false);
              setAtiva(i);
            }}
            aria-pressed={i === ativa}
            aria-label={`Fase ${i + 1}: ${f.nome}`}
            className={cn(
              "block overflow-hidden rounded-control bg-surface-soft transition-opacity",
              i !== ativa && "opacity-70",
            )}
            style={i === ativa ? { outline: `2px solid ${cor}`, outlineOffset: -2 } : undefined}
          >
            <img
              src={withBase(f.src)}
              alt={`${nome}, ${f.nome}`}
              loading="lazy"
              draggable={false}
              className="aspect-square w-full object-cover"
            />
          </button>
        ))}
      </div>
      <figcaption className="mt-1 flex items-center gap-2">
        <span aria-hidden className="flex items-center gap-1">
          {fotos.map((f, i) => (
            <span
              key={f.src}
              className={cn("h-1 rounded-[2px] transition-all", i === ativa ? "w-[18px]" : "w-1 bg-border")}
              style={i === ativa ? { background: cor } : undefined}
            />
          ))}
        </span>
        <button
          type="button"
          onClick={() => setTocando((v) => !v)}
          aria-pressed={tocando}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-full text-2xs text-ink-2 hover:text-ink"
        >
          {tocando ? <Pause className="h-3 w-3" aria-hidden /> : <Play className="h-3 w-3" aria-hidden />}
          {tocando ? "Pausar o movimento" : "Ver o movimento"} · {total} {total === 1 ? "fase" : "fases"}
        </button>
      </figcaption>
    </figure>
  );
}
