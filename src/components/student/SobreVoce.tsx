import * as React from "react";
import { Check, ChevronLeft, ChevronRight, Pencil, Send } from "lucide-react";
import type { Aluno } from "@/data/alunos";
import type { Marca } from "@/lib/brand/BrandContext";
import {
  TELAS_SOBRE_VOCE,
  OBJETIVOS_DO_ALUNO,
  EQUIPAMENTOS_DO_ALUNO,
  CAMPOS_DE_DADO,
  NENHUM_REMEDIO,
  idDeclaracao,
  novoPedidoTreino,
  valorLegivel,
  type CampoDeDado,
  type DeclaracaoAluno,
} from "@/data/declaracoes";
import { ajustarParaContraste, corDeContraste } from "@/lib/theme/palettes";
import { cn } from "@/lib/utils";
import { soNumero } from "@/lib/numeroDigitado";

/**
 * "CONTE SOBRE VOCÊ": o aluno responde sobre a própria vida e pede o treino ao professor.
 *
 * O caminho tem começo, meio e fim, e a tela diz em que ponto dele a pessoa está:
 *
 *   1. ABERTURA: quem é o professor (a marca dele, a mesma do cabeçalho do app), o que vai
 *      acontecer em três etapas e quanto tempo leva. Quem abre o app pela primeira vez veio
 *      ver o treino; a abertura explica por que o treino ainda não está aqui.
 *   2. CINCO PASSOS com nome no indicador (Você, Objetivo, Rotina, Local, Saúde), cada um com
 *      a frase que diz para que serve a pergunta. Voltar e Continuar ficam presos ao rodapé,
 *      e nenhum passo é obrigatório: "Pular por agora" fecha tudo, e o passo vazio diz
 *      "Pular este passo" em vez de fingir que continuar é o mesmo que responder.
 *   3. REVISÃO: tudo o que foi respondido, com Editar em cada passo, e o recado opcional.
 *   4. FIM: o pedido saiu, e a mesma linha do tempo mostra que agora é a vez do professor.
 *
 * Cada passo grava ao continuar (nada se perde se a pessoa fechar), e grava SÓ o que mudou:
 * reenviar uma resposta igual devolvia ao professor, como pendente, o que ele já tinha
 * confirmado. O que a ficha já tem (o professor preencheu no cadastro) aparece marcado para o
 * aluno conferir, e só vira declaração se ele mudar.
 *
 * Linguagem de aluno, nunca de ficha: "que remédio você toma todo dia? escreva o nome da
 * caixa", e não "classe farmacológica". "Não sei" é resposta, distinta de deixar vazio,
 * porque silêncio não é resposta. E a pessoa nunca lê um rótulo clínico aqui: quem traduz
 * "tomo losartana" em conduta é o professor, do outro lado.
 */

type Resposta = { valor: string; naoSei: boolean };
type Fase = "inicio" | "revisao" | "fim" | number;

export function SobreVoce({
  aluno,
  cor,
  tinta: tintaDada,
  marca,
  professor = "seu professor",
  declaracoes,
  onDeclarar,
  onFechar,
  primeiraVez,
  pedirTreino = false,
  pedidoEnviadoEm,
  origem,
}: {
  aluno: Aluno;
  cor: string;
  /** a tinta que passa sobre `cor` (o app já calcula; sem ela, calcula aqui) */
  tinta?: string;
  /** a marca do professor, para a abertura mostrar quem vai montar o treino */
  marca?: Marca;
  /** como chamar o professor numa frase ("Ricardo", ou "seu professor") */
  professor?: string;
  /** o que já foi respondido antes (pré-preenche e mostra o status) */
  declaracoes: DeclaracaoAluno[];
  /** grava uma resposta; ausente na prévia do profissional (a tela mostra, não grava) */
  onDeclarar?: (d: DeclaracaoAluno) => void;
  onFechar: () => void;
  /** primeiro acesso: abre pela abertura, com o combinado sobre quem vê as respostas */
  primeiraVez?: boolean;
  /** o aluno está sem treino e sem pedido aberto: o envio final também pede o treino */
  pedirTreino?: boolean;
  /** já existe pedido aberto (a data dele): a tela diz isso em vez de pedir de novo */
  pedidoEnviadoEm?: number;
  /** de onde a tela foi aberta ("Perfil", "Hoje"): vira o rótulo do voltar do topo */
  origem?: string;
}) {
  const tinta = tintaDada ?? corDeContraste(cor);
  const Prof = professor.charAt(0).toUpperCase() + professor.slice(1);
  const total = TELAS_SOBRE_VOCE.length;

  // Respostas em edição: o que a ficha já tem por baixo, o que o aluno já declarou por cima.
  const [resp, setResp] = React.useState<Partial<Record<CampoDeDado, Resposta>>>(() => {
    const m: Partial<Record<CampoDeDado, Resposta>> = {};
    const ficha = fichaComoResposta(aluno);
    for (const c of CAMPOS_DE_DADO) if (ficha[c]) m[c] = { valor: ficha[c]!, naoSei: false };
    for (const d of declaracoes)
      if (d.alunoId === aluno.id && d.campo !== "pedido_treino") m[d.campo] = { valor: d.valor, naoSei: !!d.naoSei };
    return m;
  });
  const get = (c: CampoDeDado): Resposta => resp[c] ?? { valor: "", naoSei: false };
  const set = (c: CampoDeDado, valor: string, naoSei = false) => setResp((r) => ({ ...r, [c]: { valor, naoSei } }));
  const respondido = (c: CampoDeDado) => {
    const r = resp[c];
    return !!r && (r.naoSei || !!r.valor.trim());
  };

  // Quem já respondeu antes cai direto na revisão (vê tudo e muda o que mudou); quem nunca
  // respondeu começa pela abertura.
  const jaRespondeu = declaracoes.some((d) => d.alunoId === aluno.id && d.campo !== "pedido_treino");
  const [fase, setFase] = React.useState<Fase>(jaRespondeu && !primeiraVez ? "revisao" : "inicio");
  const [recado, setRecado] = React.useState("");
  // "Tomo remédio" com a caixa ainda vazia precisa existir na tela antes de existir no dado.
  const [tomaRemedio, setTomaRemedio] = React.useState(() => {
    const r = resp.remedios;
    return !!r && !r.naoSei && !!r.valor.trim() && r.valor.trim() !== NENHUM_REMEDIO;
  });

  // A cada troca de fase: o conteúdo volta ao topo e o foco vai para o título, para quem usa
  // leitor de tela ouvir onde chegou (e o teclado do celular não ficar aberto à toa).
  const rolagemRef = React.useRef<HTMLDivElement>(null);
  const tituloRef = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => {
    rolagemRef.current?.scrollTo({ top: 0 });
    tituloRef.current?.focus({ preventScroll: true });
  }, [fase]);

  /** Grava os campos informados, pulando o vazio, o que não mudou e o que a ficha já tem. */
  const gravar = (campos: CampoDeDado[]) => {
    if (!onDeclarar) return;
    const ficha = fichaComoResposta(aluno);
    for (const campo of campos) {
      const r = resp[campo];
      if (!r || (!r.valor.trim() && !r.naoSei)) continue; // vazio não é resposta: não grava
      const valor = r.naoSei ? "" : r.valor.trim();
      const anterior = declaracoes.find((d) => d.id === idDeclaracao(aluno.id, campo));
      if (anterior && !!anterior.naoSei === r.naoSei && mesmoValor(campo, anterior.valor, valor)) continue;
      if (!anterior && !r.naoSei && ficha[campo] != null && mesmoValor(campo, ficha[campo]!, valor)) continue;
      onDeclarar({
        id: idDeclaracao(aluno.id, campo),
        alunoId: aluno.id,
        campo,
        valor,
        naoSei: r.naoSei || undefined,
        status: "pendente",
        declaradaEm: Date.now(),
      });
    }
  };

  const passo = typeof fase === "number" ? fase : -1;
  const tela = passo >= 0 ? TELAS_SOBRE_VOCE[passo] : undefined;
  const passoVazio = !!tela && !tela.campos.some(respondido);

  const avancar = () => {
    if (tela) gravar(tela.campos);
    setFase(passo + 1 >= total ? "revisao" : passo + 1);
  };
  const voltar = () => {
    if (fase === "revisao") setFase(total - 1);
    else if (passo > 0) setFase(passo - 1);
    else setFase("inicio");
  };
  const irPara = (i: number) => {
    if (tela) gravar(tela.campos);
    setFase(i);
  };
  const enviar = () => {
    gravar(CAMPOS_DE_DADO);
    if (onDeclarar && pedirTreino) onDeclarar(novoPedidoTreino(aluno.id, recado));
    setFase("fim");
  };

  const respondidas = CAMPOS_DE_DADO.filter(respondido).length;
  const saudeVazia = !TELAS_SOBRE_VOCE[total - 1].campos.some(respondido);
  const primeiroNome = aluno.nome.split(" ")[0];
  const estiloMarca = { ["--marca" as string]: cor } as React.CSSProperties;

  /* ------------------------------ Os campos ------------------------------ */

  /*
   * FUNÇÕES DE RENDER, NÃO COMPONENTES. Isto já foi `const Campo = () => ...` usado como
   * `<Campo />`: a cada letra o React recebia uma função nova, desmontava o campo e montava
   * outro, e no celular o teclado fechava a cada tecla (relato de aluno, 10/09/2026). Chamadas
   * como função, o JSX entra direto na árvore desta tela e o <input> é sempre o mesmo.
   * `check:foco` trava a volta.
   */
  const botaoNaoSei = (campo: CampoDeDado, aoMarcar?: () => void) => {
    const r = get(campo);
    return (
      <Opcao
        ativa={r.naoSei}
        onClick={() => {
          set(campo, "", !r.naoSei);
          aoMarcar?.();
        }}
        cor={cor}
        tinta={tinta}
        discreta
      >
        Não sei informar
      </Opcao>
    );
  };

  /*
   * SOLTO: o passo tem UMA pergunta, e ela já é o título da tela (protótipo, tela 10). Aí o
   * campo vem sem o cartão em volta e sem repetir a pergunta; só a dica, quando houver.
   */
  const campoDaTela = (campo: CampoDeDado, solto = false) => {
    const r = get(campo);
    const pergunta = solto ? (
      DICA[campo] ? <p className="mb-3 text-xs leading-relaxed text-ink-2">{DICA[campo]}</p> : null
    ) : (
      <div className="mb-3">
        <div className="text-sm font-semibold leading-snug text-ink">{PERGUNTA[campo]}</div>
        {DICA[campo] && <p className="mt-1 text-xs leading-relaxed text-ink-2">{DICA[campo]}</p>}
      </div>
    );

    if (campo === "idade") {
      return (
        <Bloco>
          <label htmlFor="sv-idade">{pergunta}</label>
          <div className="relative w-36">
            <input
              id="sv-idade"
              value={r.valor}
              onChange={(e) => set("idade", soNumero(e.target.value, true))}
              inputMode="numeric"
              autoComplete="off"
              className={cn(CLASSE_CAMPO, "pr-14 tabular")}
              placeholder="34"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-3">anos</span>
          </div>
        </Bloco>
      );
    }
    if (campo === "sexo") {
      return (
        <Bloco>
          {pergunta}
          <div className="grid grid-cols-3 gap-2" role="group" aria-label={PERGUNTA.sexo}>
            {[
              ["F", "Feminino"],
              ["M", "Masculino"],
              ["Outro", "Outro"],
            ].map(([v, t]) => (
              <Opcao key={v} ativa={r.valor === v && !r.naoSei} onClick={() => set(campo, v)} cor={cor} tinta={tinta} centro>
                {t}
              </Opcao>
            ))}
          </div>
        </Bloco>
      );
    }
    if (campo === "telefone") {
      return (
        <Bloco>
          <label htmlFor="sv-telefone">{pergunta}</label>
          <input
            id="sv-telefone"
            value={r.valor}
            onChange={(e) => set(campo, e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            className={CLASSE_CAMPO}
            placeholder="(11) 99999-0000"
          />
        </Bloco>
      );
    }
    if (campo === "objetivo") {
      return (
        <Bloco solto={solto}>
          {pergunta}
          <div className="grid gap-2" role="radiogroup" aria-label={PERGUNTA.objetivo}>
            {OBJETIVOS_DO_ALUNO.map((o) => {
              const ativa = r.valor === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={ativa}
                  onClick={() => set(campo, o.id)}
                  className={cn(
                    "flex min-h-[52px] w-full items-center gap-3 rounded-control border px-3.5 text-left text-[15px] font-semibold transition-colors",
                    ativa ? "border-transparent" : "border-border bg-bg text-ink hover:border-ink-3",
                  )}
                  style={ativa ? { background: `${cor}1f`, borderColor: cor, color: "var(--ink)" } : undefined}
                >
                  <span
                    aria-hidden
                    className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border-2", !ativa && "border-ink-3")}
                    style={ativa ? { background: cor, borderColor: cor, color: tinta } : undefined}
                  >
                    {ativa && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  {o.rotulo}
                </button>
              );
            })}
          </div>
        </Bloco>
      );
    }
    if (campo === "disponibilidade") {
      const rot = lerRotina(r.valor);
      const mudar = (patch: Partial<Rotina>) => set(campo, montarRotina({ ...rot, ...patch }));
      return (
        <>
          <Bloco>
            <div className="mb-3 text-[15px] font-semibold leading-snug text-ink">Quantos dias por semana você consegue treinar?</div>
            <div className="grid grid-cols-7 gap-1.5" role="radiogroup" aria-label="Dias por semana">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <Opcao key={n} ativa={rot.dias === n} onClick={() => mudar({ dias: rot.dias === n ? null : n })} cor={cor} tinta={tinta} centro radio>
                  <span className="tabular">{n}</span>
                </Opcao>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-2">
              {rot.dias ? `${rot.dias} ${rot.dias === 1 ? "dia" : "dias"} por semana.` : "Conte os dias que você consegue de verdade, não os ideais."}
            </p>
          </Bloco>
          <Bloco>
            <div className="mb-3 text-[15px] font-semibold leading-snug text-ink">Quanto tempo você tem em cada treino?</div>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tempo por treino">
              {TEMPOS.map((t) => (
                <Opcao key={t} ativa={rot.tempo === t} onClick={() => mudar({ tempo: rot.tempo === t ? null : t })} cor={cor} tinta={tinta} centro radio>
                  {t}
                </Opcao>
              ))}
            </div>
          </Bloco>
          <Bloco>
            <label htmlFor="sv-rotina" className="mb-3 block">
              <span className="block text-[15px] font-semibold leading-snug text-ink">Algo mais sobre a sua rotina?</span>
              <span className="mt-1 block text-xs text-ink-2">Opcional. Horário, dias que não dá, viagens.</span>
            </label>
            <input
              id="sv-rotina"
              value={rot.obs}
              onChange={(e) => mudar({ obs: e.target.value })}
              className={CLASSE_CAMPO}
              placeholder="Ex.: só de manhã; sábado não dá"
            />
          </Bloco>
        </>
      );
    }
    if (campo === "equipamentos") {
      const ids = listaDe(r.valor);
      const alternar = (id: string) => set(campo, JSON.stringify(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
      const todosDeAcademia = DE_ACADEMIA.every((id) => ids.includes(id));
      return (
        <Bloco solto={solto}>
          {pergunta}
          <button
            type="button"
            onClick={() =>
              set(campo, JSON.stringify(todosDeAcademia ? ids.filter((x) => !DE_ACADEMIA.includes(x)) : [...new Set([...ids, ...DE_ACADEMIA])]))
            }
            aria-pressed={todosDeAcademia}
            className="mb-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-xs font-bold underline-offset-2 hover:underline"
            style={{ color: "var(--ink)", background: `${cor}1a` }}
          >
            {todosDeAcademia ? "Desmarcar os de academia" : "Treino numa academia completa"}
          </button>
          {/* Marcar vários: caixinhas em grade de dois (protótipo, tela 10), e não pílulas que
              enchem na cor da marca. A pílula cheia lia como "escolhido" de escolha única. */}
          <div className="grid grid-cols-2 gap-1.5">
            {EQUIPAMENTOS_DO_ALUNO.map((e) => (
              <OpcaoMarcar key={e.id} ativa={ids.includes(e.id)} onClick={() => alternar(e.id)} cor={cor} tinta={tinta}>
                {e.rotulo}
              </OpcaoMarcar>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-ink-2">
            {ids.length ? `${ids.length} ${ids.length === 1 ? "marcado" : "marcados"}.` : "Marque tudo o que você tem à mão. Pode ser mais de um."}
          </p>
        </Bloco>
      );
    }
    if (campo === "remedios") {
      const nenhum = r.valor.trim() === NENHUM_REMEDIO && !r.naoSei;
      return (
        <Bloco>
          {pergunta}
          <div className="flex flex-wrap gap-2">
            <Opcao
              ativa={tomaRemedio && !r.naoSei}
              onClick={() => {
                setTomaRemedio(true);
                if (nenhum || r.naoSei) set(campo, "");
              }}
              cor={cor}
              tinta={tinta}
              radio
            >
              Sim, tomo
            </Opcao>
            <Opcao
              ativa={nenhum}
              onClick={() => {
                setTomaRemedio(false);
                set(campo, NENHUM_REMEDIO);
              }}
              cor={cor}
              tinta={tinta}
              radio
            >
              Não tomo nenhum
            </Opcao>
            {botaoNaoSei(campo, () => setTomaRemedio(false))}
          </div>
          {tomaRemedio && !r.naoSei && (
            <div className="mt-3">
              <label htmlFor="sv-remedios" className="mb-1.5 block text-xs font-semibold text-ink-2">
                Escreva o nome que está na caixa, um por linha. Não precisa saber para que serve.
              </label>
              <textarea
                id="sv-remedios"
                value={nenhum ? "" : r.valor}
                onChange={(e) => set(campo, e.target.value)}
                rows={3}
                className={cn(CLASSE_CAMPO, "h-auto py-2.5")}
                placeholder="Ex.: losartana, metformina"
              />
            </div>
          )}
        </Bloco>
      );
    }
    if (campo === "saude") {
      const s = lerSaude(r.naoSei ? "" : r.valor);
      const mudar = (patch: Partial<Saude>) => set(campo, montarSaude({ ...s, ...patch }));
      const alternar = (q: string) => {
        if (q === NADA_DE_SAUDE) return mudar({ itens: s.itens.includes(q) ? [] : [q] });
        const semNada = s.itens.filter((x) => x !== NADA_DE_SAUDE);
        mudar({ itens: semNada.includes(q) ? semNada.filter((x) => x !== q) : [...semNada, q] });
      };
      return (
        <Bloco>
          {pergunta}
          <div className="grid grid-cols-2 gap-1.5">
            {[...QUEIXAS, NADA_DE_SAUDE].map((q) => (
              <OpcaoMarcar key={q} ativa={!r.naoSei && s.itens.includes(q)} onClick={() => alternar(q)} cor={cor} tinta={tinta}>
                {q}
              </OpcaoMarcar>
            ))}
          </div>
          <div className="mt-2">{botaoNaoSei(campo)}</div>
          {!r.naoSei && (
            <div className="mt-3">
              <label htmlFor="sv-saude" className="mb-1.5 block text-xs font-semibold text-ink-2">
                Conte do seu jeito: desde quando, onde dói, que cirurgia, há quanto tempo parou de treinar.
              </label>
              <textarea
                id="sv-saude"
                value={s.detalhe}
                onChange={(e) => mudar({ detalhe: e.target.value })}
                rows={3}
                className={cn(CLASSE_CAMPO, "h-auto py-2.5")}
                placeholder="Ex.: pressão alta desde 2022; dor no joelho direito ao agachar; parei há 8 meses"
              />
            </div>
          )}
        </Bloco>
      );
    }
    // liberacao
    return (
      <Bloco>
        {pergunta}
        <div className="grid gap-2">
          {LIBERACOES.map((t) => (
            <Opcao key={t} ativa={!r.naoSei && r.valor.startsWith(t)} onClick={() => set(campo, t)} cor={cor} tinta={tinta} radio larga>
              {t}
            </Opcao>
          ))}
        </div>
        <div className="mt-2">{botaoNaoSei(campo)}</div>
      </Bloco>
    );
  };

  /* ------------------------------ As fases ------------------------------ */

  const etapas = etapasDoPedido(Prof);

  let corpo: React.ReactNode;
  let rodape: React.ReactNode;

  if (fase === "inicio") {
    /*
     * A ABERTURA DO PRIMEIRO ACESSO (protótipo, tela 11): a logo do professor em papel
     * branco, de quem é o convite, o "bem-vindo" e as cinco etapas do que vem, cada uma com o
     * porquê. A linha do tempo do combinado (você conta, ele revisa, o treino aparece) fica
     * para quando já existe pedido, que é quando ela diz em que ponto a pessoa está; aqui ela
     * vira uma frase no fim da lista.
     */
    const saudacao =
      aluno.sexo === "F" ? `Bem-vinda, ${primeiroNome}` : aluno.sexo === "M" ? `Bem-vindo, ${primeiroNome}` : `Olá, ${primeiroNome}`;
    corpo = (
      <div className="pb-4 pt-5">
        <PainelDaMarca marca={marca} cor={cor} />
        {marca && <p className="mt-4 text-2xs text-ink-2">Convite de {marca.nome}</p>}
        <h2
          ref={tituloRef}
          tabIndex={-1}
          id="sobre-voce-titulo"
          className="mt-2 font-display text-2xl font-bold leading-[1.1] tracking-[-0.02em] text-ink outline-none"
        >
          {pedidoEnviadoEm ? `Seu treino está a caminho, ${primeiroNome}` : saudacao}
        </h2>
        <p className="mt-2.5 text-[12.5px] leading-[1.5] text-ink-2">
          {pedidoEnviadoEm
            ? `${Prof} já recebeu o seu pedido. Se algo mudou, atualize as respostas: elas vão junto.`
            : `Conte sobre você para ${professor} montar o seu treino. Leva uns 3 minutos. O que você responder fica visível só para ${professor}.`}
        </p>
        {pedidoEnviadoEm ? (
          <div className="mt-4 rounded-[16px] border border-border bg-surface p-3.5">
            <LinhaDoTempo etapas={etapas} feitas={1} cor={cor} tinta={tinta} professor={Prof} />
          </div>
        ) : (
          <>
            <ol className="mt-4 space-y-1.5">
              {TELAS_SOBRE_VOCE.map((t, i) => (
                <li key={t.titulo} className="flex items-start gap-2.5 rounded-control border border-border bg-surface px-3 py-[9px]">
                  <span className="tabular mt-px grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-surface-soft text-2xs font-bold text-ink-2">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-ink">{t.titulo}</span>
                    <span className="block text-2xs leading-snug text-ink-2">{t.porque}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-2xs text-ink-2">Depois, {professor} revisa e o treino aparece aqui no app.</p>
          </>
        )}
      </div>
    );
    rodape = (
      <>
        <BotaoPrincipal cor={cor} tinta={tinta} onClick={() => setFase(jaRespondeu ? "revisao" : 0)} className="h-12">
          {jaRespondeu ? "Revisar as respostas" : "Começar"} <ChevronRight className="h-4 w-4" aria-hidden />
        </BotaoPrincipal>
        <button
          type="button"
          onClick={onFechar}
          className="mt-1 min-h-[44px] w-full rounded-full text-[11.5px] text-ink-2 hover:text-ink"
        >
          Responder depois
        </button>
      </>
    );
  } else if (tela) {
    // Passo de UMA pergunta: a pergunta é o título (protótipo). A rotina tem três perguntas
    // dentro de um campo só, e os passos de várias perguntas ficam com o nome do passo.
    const unica = tela.campos.length === 1 && tela.campos[0] !== "disponibilidade";
    corpo = (
      <div className="space-y-3 pb-4">
        <div className="pb-1">
          <div className="mt-[18px] text-2xs font-bold uppercase tracking-[0.1em] text-primary-texto">{tela.curto}</div>
          <h2
            ref={tituloRef}
            tabIndex={-1}
            id="sobre-voce-titulo"
            className="mt-1 font-display text-xl font-bold leading-[1.15] tracking-[-0.02em] text-ink outline-none"
          >
            {unica ? PERGUNTA[tela.campos[0]] : tela.titulo}
          </h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-2">{tela.porque}</p>
        </div>
        {tela.campos.map((c) => (
          <React.Fragment key={c}>{campoDaTela(c, unica)}</React.Fragment>
        ))}
        {onDeclarar && (
          <p className="pt-1 text-2xs leading-relaxed text-ink-2">
            O que você responder fica visível só para o seu professor. Cada “Continuar” já grava.
          </p>
        )}
      </div>
    );
    rodape = (
      <div className="flex gap-2">
        <BotaoVoltar onClick={voltar} />
        <BotaoPrincipal cor={cor} tinta={tinta} onClick={avancar} className="flex-1">
          {passoVazio ? "Pular este passo" : passo + 1 >= total ? "Revisar respostas" : "Continuar"}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </BotaoPrincipal>
      </div>
    );
  } else if (fase === "revisao") {
    corpo = (
      <div className="space-y-2.5 pb-4">
        <div className="pb-1">
          <div className="mt-[18px] text-2xs font-bold uppercase tracking-[0.1em] text-primary-texto">Último passo</div>
          <h2
            ref={tituloRef}
            tabIndex={-1}
            id="sobre-voce-titulo"
            className="mt-1 font-display text-xl font-bold leading-[1.15] tracking-[-0.02em] text-ink outline-none"
          >
            Confira e envie
          </h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-2">
            {respondidas} de {CAMPOS_DE_DADO.length} perguntas respondidas. Toque em Editar para mudar qualquer resposta.
          </p>
        </div>

        {saudeVazia && (
          <div className="rounded-[16px] border border-warning/35 bg-warning-tint p-3.5">
            <p className="text-sm font-semibold text-ink">A parte de saúde ficou sem resposta</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-2">Ela ajuda {professor} a montar um treino seguro para você. Leva menos de um minuto.</p>
            <button
              type="button"
              onClick={() => setFase(total - 1)}
              className="mt-2 inline-flex min-h-[40px] items-center gap-1 rounded-full bg-surface px-3.5 text-xs font-bold text-ink"
            >
              Responder agora <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        )}

        {TELAS_SOBRE_VOCE.map((t, i) => (
          <section key={t.titulo} className="rounded-[16px] border border-border bg-surface px-3.5 py-3" aria-labelledby={`sv-rev-${i}`}>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-2xs font-bold tabular" style={{ background: `${cor}1f`, color: "var(--ink)" }}>
                {i + 1}
              </span>
              <h3 id={`sv-rev-${i}`} className="text-sm font-bold text-ink">
                {t.titulo}
              </h3>
              <button
                type="button"
                onClick={() => setFase(i)}
                className="ml-auto inline-flex min-h-[40px] items-center gap-1 rounded-full px-2.5 text-xs font-bold text-ink-2 hover:text-ink"
                aria-label={`Editar ${t.titulo.toLowerCase()}`}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden /> Editar
              </button>
            </div>
            <dl className="space-y-2 pl-8">
              {t.campos.map((c) => (
                <div key={c}>
                  <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-2">{ROTULO_REVISAO[c]}</dt>
                  <dd className={cn("text-[13px] leading-snug", respondido(c) ? "text-ink" : "italic text-ink-2")}>
                    {respondido(c) ? legivel(aluno.id, c, get(c)) : "Sem resposta"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        {pedirTreino && (
          <div className="rounded-[16px] border border-border bg-surface p-3.5">
            <label htmlFor="sv-recado" className="mb-2.5 block">
              <span className="block text-sm font-semibold text-ink">Quer deixar um recado para {professor}?</span>
              <span className="mt-1 block text-xs text-ink-2">Opcional. Vai junto com o pedido do treino.</span>
            </label>
            <textarea
              id="sv-recado"
              value={recado}
              onChange={(e) => setRecado(e.target.value.slice(0, 280))}
              rows={2}
              className={cn(CLASSE_CAMPO, "h-auto py-2.5")}
              placeholder="Ex.: prefiro treinar de manhã; tenho uma viagem no mês que vem"
            />
          </div>
        )}
      </div>
    );
    rodape = (
      <div className="flex gap-2">
        <BotaoVoltar onClick={voltar} />
        <BotaoPrincipal cor={cor} tinta={tinta} onClick={enviar} className="flex-1">
          <Send className="h-4 w-4" aria-hidden />
          {pedirTreino ? "Enviar e pedir meu treino" : `Enviar para ${professor}`}
        </BotaoPrincipal>
      </div>
    );
  } else {
    const pediu = pedirTreino || !!pedidoEnviadoEm;
    corpo = (
      <div className="space-y-4 pb-4 pt-8">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full" style={{ background: cor, color: tinta }}>
            <Check className="h-7 w-7" strokeWidth={3} aria-hidden />
          </span>
          <h2
            ref={tituloRef}
            tabIndex={-1}
            id="sobre-voce-titulo"
            className="mt-3 font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink outline-none"
          >
            {pedirTreino ? "Pedido enviado" : "Respostas enviadas"}
          </h2>
          <p className="mx-auto mt-1.5 max-w-[34ch] text-[12.5px] leading-[1.5] text-ink-2">
            {pediu
              ? `${Prof} vai revisar o que você contou e montar o seu treino. Quando ficar pronto, ele aparece no início do app.`
              : `${Prof} vai revisar o que mudou.`}{" "}
            Nada entra no seu treino sem ele confirmar.
          </p>
        </div>
        {pediu && (
          <div className="rounded-[16px] border border-border bg-surface p-3.5">
            <LinhaDoTempo etapas={etapas} feitas={1} cor={cor} tinta={tinta} professor={Prof} />
          </div>
        )}
        <p className="text-center text-2xs text-ink-2">Você pode atualizar essas respostas quando algo mudar, na aba Perfil.</p>
      </div>
    );
    rodape = (
      <BotaoPrincipal cor={cor} tinta={tinta} onClick={onFechar}>
        {pediu ? "Ir para o início" : "Voltar ao app"}
      </BotaoPrincipal>
    );
  }

  const comPassos = typeof fase === "number" || fase === "revisao";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg" role="dialog" aria-modal="true" aria-labelledby="sobre-voce-titulo" style={estiloMarca}>
      {/* Topo dos passos (protótipo, tela 10): à esquerda, sair para onde a pessoa estava
          ("‹ Perfil"); no primeiro acesso não há de onde ter vindo, e o mesmo lugar diz
          "Pular por agora". À direita, em que passo ela está. Voltar um passo mora no rodapé. */}
      {comPassos && (
        <header className="shrink-0 bg-bg">
          <div className="mx-auto max-w-md px-3.5 pt-1">
            <div className="flex min-h-[44px] items-center justify-between gap-2">
              <button
                type="button"
                onClick={onFechar}
                className="-ml-1 inline-flex min-h-[44px] items-center gap-0.5 rounded-full pl-0.5 pr-2 text-xs text-ink-2 hover:text-ink"
              >
                {origem ? (
                  <>
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> {origem}
                  </>
                ) : (
                  "Pular por agora"
                )}
              </button>
              <span className="tabular text-2xs text-ink-2" aria-hidden>
                {passo >= 0 ? `${passo + 1} de ${total}` : "Revisão"}
              </span>
            </div>
            <IndicadorDePassos
              atual={passo >= 0 ? passo : total}
              cor={cor}
              onIr={irPara}
              respondidos={TELAS_SOBRE_VOCE.map((t) => t.campos.some(respondido))}
            />
          </div>
        </header>
      )}

      <div ref={rolagemRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-md px-3.5">{corpo}</div>
      </div>

      <footer className="shrink-0 bg-bg px-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-2.5">
        <div className="mx-auto max-w-md">
          {rodape}
          {!onDeclarar && <p className="mt-2 text-center text-2xs text-ink-2">Prévia: aqui o aluno grava as respostas.</p>}
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------ Peças da tela ------------------------------ */

const CLASSE_CAMPO =
  "h-12 w-full rounded-control border border-border bg-bg px-3.5 text-base text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-[color:var(--marca)] disabled:opacity-50";

/**
 * Uma pergunta, no cartão de superfície do app. `solto`: o passo de uma pergunta só, em que
 * a pergunta já é o título da tela e o cartão em volta seria moldura sem conteúdo.
 */
function Bloco({ children, solto }: { children: React.ReactNode; solto?: boolean }) {
  if (solto) return <div>{children}</div>;
  return <div className="rounded-[16px] border border-border bg-surface p-3.5">{children}</div>;
}

/** Escolha ÚNICA (e o "Não sei informar"): pílula que enche na cor da marca. */
function Opcao({
  ativa,
  onClick,
  cor,
  tinta,
  larga,
  centro,
  radio,
  marcador,
  discreta,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  cor: string;
  tinta: string;
  /** ocupa a linha inteira, texto à esquerda */
  larga?: boolean;
  /** texto centrado (grade de opções do mesmo tamanho) */
  centro?: boolean;
  /** escolha única: anuncia como rádio */
  radio?: boolean;
  /** escolha múltipla: mostra o visto quando marcada */
  marcador?: boolean;
  /** "não sei": borda tracejada, para não competir com as respostas */
  discreta?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role={radio ? "radio" : undefined}
      aria-checked={radio ? ativa : undefined}
      aria-pressed={radio ? undefined : ativa}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
        larga && "w-full justify-start rounded-control text-left",
        centro && "justify-center px-2",
        ativa ? "border-transparent" : discreta ? "border-dashed border-ink-3/60 bg-transparent text-ink-2" : "border-border bg-bg text-ink hover:border-ink-3",
      )}
      style={ativa ? { background: cor, color: tinta } : undefined}
    >
      {marcador && ativa && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} aria-hidden />}
      {children}
    </button>
  );
}

/**
 * Escolha MÚLTIPLA (protótipo, tela 10): caixinha de marcar e a borda na cor da marca, com o
 * fundo só tingido. Encher a opção inteira de cor era a linguagem da escolha única, e o aluno
 * que marcava "Halteres" achava que tinha trocado a resposta em vez de somar uma.
 */
function OpcaoMarcar({
  ativa,
  onClick,
  cor,
  tinta,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  cor: string;
  tinta: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="checkbox"
      aria-checked={ativa}
      className={cn(
        "flex min-h-[44px] w-full items-center gap-2 rounded-control border-[1.5px] px-3 py-2.5 text-left text-xs font-semibold text-ink transition-colors",
        !ativa && "border-border bg-surface hover:border-ink-3",
      )}
      style={ativa ? { borderColor: cor, background: `${cor}1a` } : undefined}
    >
      <span
        aria-hidden
        className={cn("grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[4px]", !ativa && "border-[1.5px] border-ink-3")}
        style={ativa ? { background: cor, color: tinta } : undefined}
      >
        {ativa && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
      </span>
      <span className="min-w-0">{children}</span>
    </button>
  );
}

function BotaoPrincipal({
  cor,
  tinta,
  onClick,
  className,
  children,
}: {
  cor: string;
  tinta: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full px-5 text-sm font-bold transition-transform active:scale-[0.99]", className)}
      style={{ background: cor, color: tinta }}
    >
      {children}
    </button>
  );
}

/** Voltar um passo: o círculo de 44 px ao lado do Continuar (protótipo, tela 10). */
function BotaoVoltar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Voltar"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink-2 hover:bg-surface-soft hover:text-ink"
    >
      <ChevronLeft className="h-4 w-4" aria-hidden />
    </button>
  );
}

/**
 * O indicador: cinco traços finos (protótipo, tela 10). Respondido enche na cor da marca, o
 * atual na versão da marca que ESCREVE (mais forte), e o que falta fica no cinza da borda. O
 * nome de cada passo saiu de baixo dos traços porque ele agora é o rótulo acima do título.
 *
 * Cada traço continua tocável, com 44 px de altura invisível: nenhum passo é obrigatório,
 * então a ordem é sugestão, não trilho.
 */
function IndicadorDePassos({
  atual,
  cor,
  onIr,
  respondidos,
}: {
  atual: number;
  cor: string;
  onIr: (i: number) => void;
  respondidos: boolean[];
}) {
  return (
    <ol className="-mb-2.5 -mt-2.5 flex gap-[3px]" aria-label="Passos">
      {TELAS_SOBRE_VOCE.map((t, i) => {
        const aqui = i === atual;
        return (
          <li key={t.curto} className="flex-1">
            <button
              type="button"
              onClick={() => onIr(i)}
              aria-current={aqui ? "step" : undefined}
              aria-label={`Passo ${i + 1}: ${t.titulo}${respondidos[i] ? ", respondido" : ""}`}
              className="flex h-11 w-full items-center rounded-full"
            >
              <span
                aria-hidden
                className={cn("block h-1 w-full rounded-[2px] transition-colors", aqui ? "bg-primary-texto" : !respondidos[i] && "bg-border")}
                style={!aqui && respondidos[i] ? { background: cor } : undefined}
              />
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * O PAINEL DA MARCA na abertura (protótipo, tela 11): a logo do professor em papel branco,
 * grande, porque é o convite dele. Sem logo, a foto dele em círculo; sem as duas, a letra da
 * marca na cor dela puxada até 4,5:1 contra o BRANCO (a tinta da marca, que o protótipo usa,
 * some no papel quando é branca).
 */
function PainelDaMarca({ marca, cor }: { marca?: Marca; cor: string }) {
  if (!marca) return null;
  return (
    <div className="grid h-[120px] w-full place-items-center overflow-hidden rounded-card bg-white p-3.5">
      {marca.logoDataUrl ? (
        <img src={marca.logoDataUrl} alt={marca.nome} className="h-full w-full object-contain" />
      ) : marca.fotoDataUrl ? (
        <img src={marca.fotoDataUrl} alt={marca.nome} className="h-[72px] w-[72px] rounded-full object-cover" />
      ) : (
        <span
          aria-hidden
          className="font-display text-[30px] font-bold"
          style={{ color: ajustarParaContraste(marca.corPrimaria || cor, "#FFFFFF", 4.5) }}
        >
          {marca.nome.trim().charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

/** As três etapas do combinado entre aluno e professor, as mesmas na tela e no início do app. */
export function etapasDoPedido(Prof: string): { titulo: string; texto: string }[] {
  return [
    { titulo: "Você conta sobre você", texto: "Rotina, objetivo, onde treina e saúde. Uns 3 minutos." },
    { titulo: `${Prof} revisa e monta o treino`, texto: "Com base no que você contar, do seu jeito." },
    { titulo: "O treino aparece aqui no app", texto: "É só abrir e começar pelo treino de hoje." },
  ];
}

/**
 * As três etapas do combinado, com a de agora destacada. É uma sequência de verdade (o
 * treino não chega antes de o professor revisar), por isso os números.
 */
export function LinhaDoTempo({
  etapas,
  feitas,
  cor,
  tinta,
  professor,
}: {
  etapas: { titulo: string; texto: string }[];
  /** quantas já aconteceram; a seguinte é a de agora */
  feitas: number;
  cor: string;
  tinta: string;
  professor: string;
}) {
  return (
    <ol className="relative">
      {etapas.map((e, i) => {
        const feita = i < feitas;
        const agora = i === feitas;
        const ultima = i === etapas.length - 1;
        return (
          <li key={e.titulo} className={cn("relative flex gap-3", !ultima && "pb-4")}>
            {!ultima && (
              <span
                aria-hidden
                className="absolute left-[13px] top-7 bottom-0 w-0.5 rounded-full bg-border"
                style={feita ? { background: cor } : undefined}
              />
            )}
            <span
              className={cn(
                "relative z-[1] grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular",
                !feita && !agora && "bg-surface-soft text-ink-3",
              )}
              style={feita ? { background: cor, color: tinta } : agora ? { boxShadow: `inset 0 0 0 2px ${cor}`, background: `${cor}1f`, color: "var(--ink)" } : undefined}
            >
              {feita ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={cn("text-sm font-semibold", feita || agora ? "text-ink" : "text-ink-2")}>{e.titulo}</span>
                {agora && (
                  <span className="rounded-full px-2 py-0.5 text-2xs font-bold" style={{ background: `${cor}1f`, color: "var(--ink)" }}>
                    {i === 0 ? "Agora" : `Com ${professor} agora`}
                  </span>
                )}
                {feita && <span className="sr-only">(feito)</span>}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{e.texto}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------ Textos e dados ------------------------------ */

const PERGUNTA: Record<CampoDeDado, string> = {
  idade: "Quantos anos você tem?",
  sexo: "Sexo",
  telefone: "Um telefone para o seu professor falar com você",
  objetivo: "O que você mais quer com o treino?",
  disponibilidade: "Quantos dias por semana você consegue treinar, e quanto tempo por vez?",
  equipamentos: "Onde você vai treinar e o que tem lá?",
  remedios: "Você toma algum remédio todo dia?",
  saude: "Algum médico já te disse que você tem alguma condição? Sente alguma dor? Já operou algo?",
  liberacao: "Você tem liberação do médico para treinar?",
};

const DICA: Partial<Record<CampoDeDado, string>> = {
  telefone: "Com DDD. Pode ser o WhatsApp.",
  objetivo: "Escolha o principal. O resto você conversa com o seu professor.",
  saude: "Marque o que se aplica e, se quiser, conte os detalhes. Seu professor vai ler e conversar com você sobre isso.",
};

/** Rótulos da revisão, na voz do aluno. */
const ROTULO_REVISAO: Record<CampoDeDado, string> = {
  idade: "Idade",
  sexo: "Sexo",
  telefone: "Telefone",
  objetivo: "Objetivo",
  disponibilidade: "Rotina",
  equipamentos: "O que tem onde treina",
  remedios: "Remédios de todo dia",
  saude: "Saúde e histórico",
  liberacao: "Liberação do médico",
};

const TEMPOS = ["30 min", "45 min", "1 hora", "Mais de 1 hora"];
const LIBERACOES = ["Tenho liberação do médico para treinar", "Ainda não tenho", "Nunca precisei"];
const QUEIXAS = ["Pressão alta", "Diabetes", "Colesterol alto", "Dor nas costas", "Dor no joelho", "Dor no ombro", "Já fiz cirurgia"];
const NADA_DE_SAUDE = "Nenhum problema de saúde";
/** O atalho "academia completa": o que toda academia tem, sem piscina. */
const DE_ACADEMIA = ["Máquina", "Barra", "Halter", "Polia", "Esteira", "Bicicleta ergométrica", "Elíptico"];

const listaDe = (valor: string): string[] => {
  try {
    const v = JSON.parse(valor || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
};

/** A rotina é gravada como frase ("3 dias por semana, 45 min por treino. Só de manhã") e relida aqui. */
type Rotina = { dias: number | null; tempo: string | null; obs: string };
function lerRotina(valor: string): Rotina {
  const m = valor.match(/(\d)\s*dias?\b/);
  const tempo = [...TEMPOS].sort((a, b) => b.length - a.length).find((t) => valor.toLowerCase().includes(t.toLowerCase())) ?? null;
  if (!m && !tempo) return { dias: null, tempo: null, obs: valor };
  const i = valor.indexOf(". ");
  return { dias: m ? Number(m[1]) : null, tempo, obs: i >= 0 ? valor.slice(i + 2) : "" };
}
function montarRotina(r: Rotina): string {
  const base = [r.dias ? `${r.dias} ${r.dias === 1 ? "dia" : "dias"} por semana` : "", r.tempo ? `${r.tempo} por treino` : ""]
    .filter(Boolean)
    .join(", ");
  return [base, r.obs.trim() ? r.obs : ""].filter(Boolean).join(". ");
}

/** A saúde é gravada como "Pressão alta, Dor no joelho. <detalhes>" e relida aqui. */
type Saude = { itens: string[]; detalhe: string };
function lerSaude(valor: string): Saude {
  const i = valor.indexOf(". ");
  const cabeca = i >= 0 ? valor.slice(0, i) : valor;
  const partes = cabeca.split(", ").map((s) => s.trim()).filter(Boolean);
  const conhecidas = [...QUEIXAS, NADA_DE_SAUDE];
  if (partes.length && partes.every((p) => conhecidas.includes(p))) return { itens: partes, detalhe: i >= 0 ? valor.slice(i + 2) : "" };
  return { itens: [], detalhe: valor };
}
function montarSaude(s: Saude): string {
  const itens = [...QUEIXAS, NADA_DE_SAUDE].filter((q) => s.itens.includes(q));
  return [itens.join(", "), s.detalhe.trim() ? s.detalhe : ""].filter(Boolean).join(". ");
}

/** O que a ficha já tem, no formato da resposta: o aluno confere em vez de digitar de novo. */
function fichaComoResposta(a: Aluno): Partial<Record<CampoDeDado, string>> {
  const equip = (a.equipamentos ?? []).filter((id) => EQUIPAMENTOS_DO_ALUNO.some((e) => e.id === id));
  return {
    idade: a.idade != null ? String(a.idade) : undefined,
    sexo: a.sexo || undefined,
    telefone: a.telefone?.trim() || undefined,
    objetivo: OBJETIVOS_DO_ALUNO.some((o) => o.id === a.objetivo) ? a.objetivo : undefined,
    equipamentos: equip.length ? JSON.stringify(equip) : undefined,
  };
}

function mesmoValor(campo: CampoDeDado, a: string, b: string): boolean {
  if (campo === "equipamentos") return [...listaDe(a)].sort().join("|") === [...listaDe(b)].sort().join("|");
  return a.trim() === b.trim();
}

/** A resposta em edição, como o professor vai ler (a mesma função da tela dele). */
function legivel(alunoId: string, campo: CampoDeDado, r: Resposta): string {
  return valorLegivel({ id: "", alunoId, campo, valor: r.valor.trim(), naoSei: r.naoSei || undefined, status: "pendente", declaradaEm: 0 });
}

/** Resumo do status para o cartão do Perfil: quantas respostas, quantas já confirmadas. */
export function resumoSobreVoce(declaracoes: DeclaracaoAluno[], alunoId: string): { respondidas: number; confirmadas: number; total: number } {
  const minhas = declaracoes.filter((d) => d.alunoId === alunoId && d.campo !== "pedido_treino");
  return {
    respondidas: minhas.length,
    confirmadas: minhas.filter((d) => d.status === "confirmada").length,
    total: CAMPOS_DE_DADO.length,
  };
}
