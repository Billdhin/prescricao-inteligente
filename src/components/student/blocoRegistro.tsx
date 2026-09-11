import * as React from "react";
import { Check, CheckCircle2, ChevronDown, Footprints, Bike, Waves, HeartPulse, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { exercises, getExercise } from "@/data/exercises";
import { corDeContraste } from "@/lib/theme/palettes";
import { getFasePose } from "@/data/fase-poses";
import { getMuscleMapPose } from "@/data/muscle-map-images";
import { getModalidade } from "@/data/modalities";
import type { BlocoSessao, Sessao } from "@/data/periodizacao";
import { tokensAlvoForca, temAlvoForca, fmtIntervalo } from "@/lib/gps/alvoResumo";
import { tirosDaSemana } from "@/lib/gps/formatoAerobio";
import { modoDeRegistro, type Execucao } from "@/data/execucao";
import { soNumero } from "@/lib/numeroDigitado";

/**
 * Núcleo compartilhado do bloco do app do aluno: os helpers de apresentação (nome,
 * doses, exercício de catálogo, folha visual, modalidade) e o MIOLO DE REGISTRO
 * (carga/reps/RPE, com o id estável e o upsert). Vive aqui, e não no StudentApp, para
 * o registro inline (BlocoRow) e o registro do modo guiado (TreinoGuiado) usarem
 * exatamente a mesma lógica e nunca divergirem no id nem no que gravam.
 */

export const nomeDoBloco = (b: BlocoSessao): string => {
  if (b.exercicioSlug) return exercises.find((e) => e.slug === b.exercicioSlug)?.nome ?? b.nome ?? b.exercicioSlug;
  return b.nome ?? b.modalidade ?? "Exercício";
};

// Encurta valores de dose verbosos que quebram no mobile ("moderada a alta"
// vira "mod. a alta"). Só o texto muda; o número da dose segue intocado.
const abrevDose = (v: string): string => v.replace(/moderada a alta/gi, "mod. a alta");

// Os tokens de dose de um bloco (Série, Intensidade, Intervalo para força; Formato,
// Duração, Intensidade, Recuperação para aeróbio), com o rótulo colado ao valor.
// Fonte única lida pelo registro e pela leitura, para os dois nunca divergirem.
/**
 * O QUE O ALUNO VÊ É O ALVO DA SEMANA, NÃO A FAIXA DA DIRETRIZ.
 *
 * Achado de uma bateria funcional, e era o defeito mais caro do app do aluno. O plano de 12
 * semanas progride de "4 x 12, RIR 3" até "3 x 6, RIR 1", com descarga nas semanas 4, 8 e 12.
 * O aluno recebia, nas DOZE semanas, exatamente a mesma frase: "3 a 4 x 6 a 12 · 1 a 2 min".
 * Nem a progressão nem a descarga chegavam a ele.
 *
 * A onda inteira do alvo semanal existia para transformar a faixa citada num número concreto,
 * e esse número chegava ao editor do profissional e ao PDF, mas parava antes de quem executa
 * o treino. Agora o alvo vem primeiro, e a faixa citada continua disponível como referência.
 *
 * Bloco sem alvo (plano antigo, ou sessão montada à mão) cai na faixa, como antes.
 */
/**
 * O ISOMÉTRICO PRECISA DE ROTULAGEM PRÓPRIA, e a falta dela era um defeito de verdade.
 *
 * Medido antes de existir esta função: o bloco isométrico caía no ramo da força, e como ele
 * não tem repetição nem alvo de série, a linha saía **"4 · 2 min"**, em que o "2 min" é o
 * DESCANSO. O tempo de contração, que é o protocolo inteiro, não aparecia em lugar nenhum,
 * nem na linha curta, nem nos tokens, nem no PDF. Quem executa lia "4" e um tempo que não
 * era o tempo de segurar.
 *
 * A dose isométrica tem três números e os três precisam de rótulo: quantas contrações,
 * quanto tempo cada uma, e quanto se descansa entre elas.
 */
const ehIsometrico = (b: BlocoSessao) => b.tipo === "isometrico";
/** "4 x 2 min" (contrações × tempo sustentado). Nunca inventa: sai dos campos do bloco. */
function contracaoDoBloco(b: BlocoSessao): string {
  const series = b.series?.trim();
  const tempo = b.duracao?.trim();
  if (series && tempo) return `${series} x ${tempo}`;
  return tempo || series || "";
}

export function tokensDoBloco(bloco: BlocoSessao): { label: string; value: string }[] {
  const aerobio = bloco.tipo === "aerobio";
  const limpo = (v?: string | number | null) =>
    v != null && String(v).trim() && String(v).trim() !== "-" ? String(v) : "";
  const faixaSerie =
    bloco.series && bloco.reps ? `${bloco.series} x ${bloco.reps}` : limpo(bloco.series) || limpo(bloco.reps);
  if (ehIsometrico(bloco))
    return [
      // Prancha e equilíbrio são séries por tempo, não contrações de protocolo isométrico.
      { label: bloco.sustentado ? "Tempo" : "Contração", value: contracaoDoBloco(bloco) },
      { label: "Descanso", value: limpo(bloco.intervalo) || limpo(bloco.recuperacao) },
      { label: "Intensidade", value: abrevDose(limpo(bloco.intensidade)) },
    ].filter((t) => t.value);
  return (
    aerobio
      ? [
          { label: "Formato", value: limpo(bloco.formato) },
          // Num bloco de tiros, o que o aluno executa é o NÚMERO DE TIROS da semana; o tempo
          // total de trabalho fica ao lado como conferência, e a faixa como referência.
          { label: "Tiros", value: tirosDaSemana(bloco)?.texto ?? limpo(bloco.tiros) },
          {
            label: bloco.tiros ? "Trabalho" : "Duração",
            value: bloco.duracaoAlvoMin != null ? `${bloco.duracaoAlvoMin} min` : limpo(bloco.duracao),
          },
          { label: "Referência", value: bloco.duracaoAlvoMin != null ? limpo(bloco.duracao) : "" },
          { label: "Intensidade", value: abrevDose(limpo(bloco.intensidade)) },
          { label: "Recuperação", value: limpo(bloco.recuperacao) },
        ]
      : [
          ...tokensAlvoForca(bloco).map((t) => ({ label: t.label === "Alvo" ? "Série" : t.label, value: t.value })),
          // Sem alvo nenhum, a faixa É a dose. Com alvo, ela fica como referência declarada.
          { label: temAlvoForca(bloco) ? "Referência" : "Série", value: faixaSerie },
          { label: "Intensidade", value: abrevDose(limpo(bloco.intensidade)) },
          { label: "Intervalo", value: bloco.intervaloAlvoSeg != null ? "" : limpo(bloco.intervalo) },
        ]
  ).filter((t) => t.value);
}

/**
 * O RIR na VOZ DO ALUNO.
 *
 * Fonte única: a linha curta da lista e o chip do modo guiado dizem a mesma frase. Existe
 * porque a sigla nunca foi explicada em lugar nenhum do app do aluno, e a decisão do
 * projeto é que ela fique do lado do profissional (ver NA_LINHA_CURTA logo abaixo).
 */
export function esforcoPorExtenso(rirAlvo: number): string {
  return rirAlvo === 0
    ? "vá até não conseguir mais"
    : rirAlvo === 1
      ? "pare com 1 repetição de sobra"
      : `pare com ${rirAlvo} repetições de sobra`;
}

/**
 * O texto de um chip de dose na voz do aluno.
 *
 * `principal` é o primeiro chip, que aparece sem rótulo por ser a dose central ("3 x 12").
 * Rótulo que o valor NÃO dispensa volta mesmo sendo o primeiro: um chip escrito só "3" não
 * diz coisa nenhuma.
 */
export function textoDeChipDoAluno(t: { label: string; value: string }, principal: boolean): string {
  if (t.label === "RIR") {
    const n = Number(t.value);
    return Number.isFinite(n) ? esforcoPorExtenso(n) : `esforço ${t.value}`;
  }
  // Mesma escala que o rodapé do registro explica ("esforço de 0 a 10").
  if (t.label === "RPE") return `esforço ${t.value} de 10`;
  return principal ? t.value : `${t.label.toLowerCase()} ${t.value}`;
}

/**
 * A dose em UMA linha, do jeito que o app do aluno mostra sob o nome do
 * exercício na lista do dia: "3 x 12 · 60s" na força, "25 min · zona 2" no
 * aeróbio. É o resumo; a dose completa com rótulo colado (TokenRotulado) segue
 * existindo logo abaixo, para intensidade e intervalo.
 *
 * Nunca inventa: sai dos mesmos campos de `tokensDoBloco`, só que abreviada.
 */
export function doseCurta(bloco: BlocoSessao): string {
  const limpo = (v?: string | number | null) =>
    v != null && String(v).trim() && String(v).trim() !== "-" ? String(v).trim() : "";
  const partes: string[] = [];
  if (ehIsometrico(bloco)) {
    // "4 x 2 min · descanso 2 min". O rótulo "descanso" é obrigatório: sem ele os dois
    // tempos ficam lado a lado e o aluno não sabe qual é o de segurar.
    const contracao = contracaoDoBloco(bloco);
    if (contracao) partes.push(contracao);
    const descanso = limpo(bloco.intervalo) || limpo(bloco.recuperacao);
    if (descanso) partes.push(`descanso ${descanso}`);
    return partes.join(" · ");
  }
  if (bloco.tipo === "aerobio") {
    // Duração + formato. A intensidade do aeróbio é uma FRASE inteira ("cerca de
    // 64 a 76% da FCmáx, teste da conversa...") e não cabe numa linha de resumo;
    // ela fica nos tokens abaixo, com o rótulo colado.
    // Num intervalado a linha curta abre pelos tiros: "8 tiros de 30 s" diz o que fazer,
    // "4 min" sozinho não diz.
    const tiros = tirosDaSemana(bloco);
    if (tiros) partes.push(tiros.texto);
    else if (bloco.duracaoAlvoMin != null) partes.push(`${bloco.duracaoAlvoMin} min`);
    else if (limpo(bloco.duracao)) partes.push(limpo(bloco.duracao));
    if (limpo(bloco.formato)) partes.push(limpo(bloco.formato).toLowerCase());
  } else {
    // O ALVO da semana primeiro: é o que o aluno faz hoje (ver tokensDoBloco).
    if (bloco.seriesAlvo != null && bloco.repsAlvo != null) partes.push(`${bloco.seriesAlvo} x ${bloco.repsAlvo}`);
    else if (bloco.series && bloco.reps) partes.push(`${bloco.series} x ${bloco.reps}`);
    else if (limpo(bloco.series) || limpo(bloco.reps)) partes.push(limpo(bloco.series) || limpo(bloco.reps));
    // A sigla nunca foi explicada em lugar nenhum do app do aluno. Em vez de criar um
    // glossário para uma linha só, a linha diz o que a sigla quer dizer.
    if (bloco.rirAlvo != null) partes.push(esforcoPorExtenso(bloco.rirAlvo));
    if (bloco.intervaloAlvoSeg != null) partes.push(fmtIntervalo(bloco.intervaloAlvoSeg));
    else if (limpo(bloco.intervalo)) partes.push(limpo(bloco.intervalo));
  }
  return partes.join(" · ");
}

/**
 * O que a linha curta NÃO disse. A lista do dia mostra a `doseCurta` sob o nome
 * ("3 x 12 · 60s"); repetir a dose inteira logo abaixo em TokenRotulado era
 * ruído. Aqui ficam só os rótulos que sobraram (tipicamente a Intensidade, que
 * não cabe na linha curta), com o rótulo colado ao valor.
 */
// "RIR" entra aqui porque `doseCurta` ja carrega a informacao dele, agora por extenso
// ("3 x 15 · pare com 4 repeticoes de sobra · 30 s"), e o token cru reaparecia logo abaixo
// contra o proposito declarado de `tokensExtras` ("aqui ficam so os rotulos que sobraram").
// A sigla continua no lado do profissional, onde ela e o vocabulario certo.
const NA_LINHA_CURTA = new Set(["Série", "Intervalo", "Duração", "RIR"]);
export function tokensExtras(bloco: BlocoSessao): { label: string; value: string }[] {
  const naCurta =
    bloco.tipo === "aerobio"
      ? new Set(["Duração", "Formato"])
      : bloco.tipo === "isometrico"
        ? new Set(["Contração", "Tempo", "Descanso"])
        : NA_LINHA_CURTA;
  return tokensDoBloco(bloco).filter((t) => !naCurta.has(t.label));
}

/**
 * Minutos DECLARADOS de uma sessão: a soma do alvo dos blocos aeróbios. Existe
 * porque o mockup mostra "45 min" ao lado da contagem de exercícios, e o modelo
 * não tem duração de sessão. Somar tempo de musculação seria número inventado
 * (não existe descanso nem tempo sob tensão declarados), então só entra o que o
 * plano de fato declarou. Sem aeróbio com alvo, devolve undefined e a tela
 * simplesmente não mostra minutos.
 */
export function minutosDeclarados(sessao: Sessao): number | undefined {
  const total = sessao.blocos.reduce((soma, b) => soma + (b.tipo === "aerobio" ? (b.duracaoAlvoMin ?? 0) : 0), 0);
  return total > 0 ? total : undefined;
}

// Resolve o exercício de catálogo de um bloco (undefined quando o bloco não aponta
// para um slug catalogado). Governa o thumb e a folha do exercício.
export const exercicioDoBloco = (b: BlocoSessao) => (b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined);

// O exercício tem conteúdo visual/instrutivo para abrir a folha? (foto, movimento em
// fases, boneco muscular posado ou passo a passo). Sem isso, o nome segue como texto.
export const temFolhaExercicio = (ex?: ReturnType<typeof getExercise>): boolean =>
  !!ex && (!!ex.imagem || getFasePose(ex.slug, 1) != null || getMuscleMapPose(ex.slug) != null || ex.fases.length > 0);

// Ícone lucide coerente com a modalidade aeróbia quando não há foto de modalidade.
export const iconeModalidade = (raw?: string, ambiente?: string) => {
  const s = (raw ?? "").toLowerCase();
  if (ambiente === "aquático" || /aqua|hidro|nata|nado/.test(s)) return Waves;
  if (/bike|bicicleta|ciclo|spinning/.test(s)) return Bike;
  if (/caminh|marcha|corr|esteira|trote/.test(s)) return Footprints;
  return HeartPulse;
};

// Resolve a modalidade de um bloco aeróbio: aceita o id canônico ("m-bike") e o
// rótulo curto que os planos usam ("bike"/"caminhada").
export const modalidadeDoBloco = (b: BlocoSessao) =>
  b.modalidade ? getModalidade(b.modalidade) ?? getModalidade(`m-${b.modalidade}`) : undefined;

/**
 * A modalidade que REPRESENTA a sessão, para a figura do cartão de hoje.
 *
 * Os blocos VOTAM. A modalidade aeróbia mais frequente só vence se tiver mais blocos que a
 * força, e empate fica com a força. Sem isso, uma sessão de hipertrofia com cinco
 * exercícios e uma caminhada complementar no fim aparecia com uma esteira desenhada: a
 * primeira modalidade aeróbia da lista não é a representativa, a dominante é.
 *
 * Não inventa: só devolve chave que o catálogo de modalidades reconhece.
 */
export const modalidadeDaSessao = (sessao: Sessao): string => {
  const votos = new Map<string, number>();
  let forca = 0;
  for (const b of sessao.blocos) {
    const m = b.tipo === "aerobio" ? modalidadeDoBloco(b) : undefined;
    // Aeróbio sem modalidade nomeada não tem equipamento a desenhar, então não vota.
    if (m) votos.set(m.id, (votos.get(m.id) ?? 0) + 1);
    else if (b.tipo !== "aerobio") forca++;
  }
  let campeao = "";
  let melhor = 0;
  for (const [id, n] of votos) if (n > melhor) [campeao, melhor] = [id, n];
  return melhor > forca ? campeao : "m-musculacao";
};

/*
 * A regra de "quantas séries", "quais já foram" e "o bloco fechou?" mora em
 * src/data/execucao.ts, porque a periodização (sessão de hoje) e a gamificação precisam
 * da MESMA resposta que esta tela. Reexportada daqui para o registro inline, o modo guiado
 * e o guardrail continuarem importando do mesmo lugar.
 */
export { totalSeriesDe, seriesFeitas, blocoCompleto } from "@/data/execucao";
import { totalSeriesDe, seriesFeitas, blocoCompleto } from "@/data/execucao";

/**
 * O que o aluno fez, série por série, na linha de resumo do bloco fechado.
 *
 * Séries iguais se agrupam ("3x 60 kg x 12"), porque repetir a mesma linha três vezes só
 * gasta a tela. Diferentes aparecem inteiras ("60 kg x 12 · 60 kg x 10 · 55 kg x 8"), que
 * é a informação que o modelo por série existe para guardar.
 */
export const resumoDasSeries = (feitas: Execucao[]): string => {
  // Sem quilos, a linha é das repetições ("12 reps"), e não "sem carga x 12": em peso do
  // corpo e elástico não existe carga a declarar ausente.
  const linha = (e: Execucao) =>
    e.cargaFeita != null
      ? `${e.cargaFeita} kg${e.repsFeitas != null ? ` x ${e.repsFeitas}` : ""}`
      : e.repsFeitas != null
        ? `${e.repsFeitas} reps`
        : "";
  if (!feitas.length) return "sem registro";
  const rpes = feitas.map((e) => e.rpe).filter((r): r is number => r != null);
  const sufixo = rpes.length ? ` · RPE ${rpes.every((r) => r === rpes[0]) ? rpes[0] : rpes.join("/")}` : "";
  // Série por tempo (prancha, isométrico) não tem quilo nem repetição: conta as séries.
  if (feitas.every((e) => !linha(e))) return `${feitas.length} ${feitas.length === 1 ? "série" : "séries"}${sufixo}`;
  const partes: string[] = [];
  let atual = linha(feitas[0]);
  let n = 1;
  for (const e of feitas.slice(1)) {
    const t = linha(e);
    if (t === atual) n++;
    else {
      partes.push(n > 1 ? `${n}x ${atual}` : atual);
      atual = t;
      n = 1;
    }
  }
  partes.push(n > 1 ? `${n}x ${atual}` : atual);
  return partes.join(" · ") + sufixo;
};

// A sessão está concluída na semana dada? Todos os blocos com as séries prescritas
// registradas. Mesma regra que sessaoDeHojeIndex usa para a semana atual.
export const sessaoConcluida = (sessao: Sessao, semana: number, execucoes: Execucao[]): boolean =>
  sessao.blocos.length > 0 && sessao.blocos.every((b) => blocoCompleto(b, execucoes, semana));

/** O último registro de uma sessão numa semana (o momento em que ela fechou), ou undefined. */
export function ultimoRegistroDaSessao(sessao: Sessao, semana: number, execucoes: Execucao[]): number | undefined {
  const ids = new Set(sessao.blocos.map((b) => b.id));
  let ultimo: number | undefined;
  for (const e of execucoes) {
    if (e.semana !== semana || !ids.has(e.blocoRef)) continue;
    if (ultimo == null || e.concluidoEm > ultimo) ultimo = e.concluidoEm;
  }
  return ultimo;
}

const mesmoDiaCivil = (a: number, b: number): boolean => {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

/**
 * A SESSÃO QUE O ALUNO FECHOU HOJE (protótipo, tela 06), se houver.
 *
 * Sem isto o início pulava direto para a próxima sessão no instante em que a de hoje
 * fechava: o aluno terminava a Sessão B e a tela já o chamava para "Começar" a C, sem nenhum
 * "feito" do que ele acabou de fazer. Fechar hoje é uma de duas coisas, as duas registradas:
 * o fechamento do modo guiado (`SessaoFeedback.concluidaEm` no dia de hoje) ou, para quem
 * registrou pela lista sem passar pelo guiado, a sessão completa cujo último registro é de
 * hoje. Mais de uma no mesmo dia: vale a que fechou por último.
 */
export function sessaoConcluidaHoje(
  sessoes: Sessao[],
  semana: number,
  execucoes: Execucao[],
  feedbacks: { sessaoRef: string; semana: number; concluidaEm: number }[],
  agora = Date.now(),
): Sessao | undefined {
  let achada: { sessao: Sessao; em: number } | undefined;
  for (const s of sessoes) {
    const fb = feedbacks.find((f) => f.sessaoRef === s.id && f.semana === semana);
    let em: number | undefined;
    if (fb && mesmoDiaCivil(fb.concluidaEm, agora)) em = fb.concluidaEm;
    else if (!fb && sessaoConcluida(s, semana, execucoes)) {
      const ultimo = ultimoRegistroDaSessao(s, semana, execucoes);
      if (ultimo != null && mesmoDiaCivil(ultimo, agora)) em = ultimo;
    }
    if (em != null && (!achada || em > achada.em)) achada = { sessao: s, em };
  }
  return achada?.sessao;
}

/**
 * Os chips de dose do modo guiado, na voz do aluno (protótipo, tela 03).
 *
 * A dose central ("3 x 12") vira DOIS chips, "3 séries" e "12 reps": são dois números com
 * papéis diferentes, e juntos num chip só o aluno precisava saber que o primeiro é a série. A
 * faixa citada ("Referência") sai daqui: no meio da série ela é ruído, e continua na folha do
 * exercício, em "Sua dose de hoje". O resto sai de `textoDeChipDoAluno`, a mesma frase da
 * lista do dia ("pare com 3 repetições de sobra"), nunca um "esforço moderado" inventado.
 */
export function chipsDoGuiado(bloco: BlocoSessao): { texto: string; principal: boolean }[] {
  const out: { texto: string; principal: boolean }[] = [];
  tokensDoBloco(bloco)
    .filter((t) => t.label !== "Referência")
    .forEach((t, i) => {
      const par = i === 0 && t.label === "Série" ? t.value.match(/^(\d+)\s*x\s*(.+)$/) : null;
      if (par) {
        const n = Number(par[1]);
        out.push({ texto: `${n} ${n === 1 ? "série" : "séries"}`, principal: true });
        out.push({ texto: `${par[2].trim()} reps`, principal: false });
      } else out.push({ texto: textoDeChipDoAluno(t, i === 0), principal: i === 0 });
    });
  return out;
}

/**
 * O miolo de registro de um bloco: os mesmos campos e a mesma gravação do BlocoRow,
 * extraídos para o modo guiado reusar sem duplicar. O id é estável por bloco+semana
 * (`ex-<bloco>-s<semana>`); registrar de novo SOBRESCREVE (o store faz upsert), então
 * o registro guiado e o inline apontam para a mesma execução e nunca divergem.
 *
 * Portal só-leitura (sem onRegistrar): não mostra nada. Na prévia, o registro inline
 * some (a nota do rodapé da sessão explica); o modo guiado pede os campos visíveis
 * (`sempreMostrar`), e aí o registrar segue no-op, como hoje.
 */
export function RegistroBloco({
  bloco,
  cor,
  semana,
  planoId,
  alunoId,
  sessaoRef,
  feitas = [],
  onRegistrar,
  onDesfazer,
  preview,
  sempreMostrar,
  tinta: tintaDada,
}: {
  bloco: BlocoSessao;
  cor: string;
  /** a tinta que passa sobre `cor` (o app já calcula pelo par verificado; sem ela, calcula aqui) */
  tinta?: string;
  semana: number;
  planoId: string;
  alunoId: string;
  sessaoRef: string;
  /** as séries deste bloco já registradas nesta semana, em ordem (ver seriesFeitas) */
  feitas?: Execucao[];
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  preview?: boolean;
  /** modo guiado mostra os campos mesmo em preview (o registrar segue no-op) */
  sempreMostrar?: boolean;
}) {
  const aerobio = bloco.tipo === "aerobio";
  // Quilos só onde existe carga externa; repetição só onde a dose não é tempo.
  const modo = modoDeRegistro(bloco, bloco.exercicioSlug ? getExercise(bloco.exercicioSlug)?.equipamento : undefined);
  const pedeCarga = modo === "carga-e-reps";
  const pedeReps = modo === "carga-e-reps" || modo === "reps";
  // Pré-preenche só o que o plano prescreve de forma objetiva E numérica: as Reps.
  // A dose textual ("6 a 12") num campo numérico truncaria; então só pré-preenche
  // número puro. Carga e RPE entram vazios (a intensidade é relativa).
  /*
   * O ALVO DA SEMANA VEM ANTES DA FAIXA, e a ordem estava invertida.
   *
   * A regra original estava certa quando foi escrita: só pré-preencher número PURO, porque a
   * dose textual ("6 a 12") truncaria num campo numérico. O que mudou depois foi o motor
   * ganhar o ALVO concreto da semana (`repsAlvo`), que é número puro e é exatamente o que o
   * cartão mostra ao aluno logo acima.
   *
   * Medido em 2.277 blocos de força de planos do motor: ZERO tinham `reps` textual numérica,
   * e TODOS os 2.277 tinham `repsAlvo`. O pré-preenchimento nunca acontecia em plano nenhum
   * gerado pelo produto, e o mesmo valia para o contador de séries logo abaixo: o aluno via
   * "3 x 15" no cartão e recebia um registro de tiro único, sem os discos de série.
   *
   * A regra de não inventar contador continua valendo. O alvo NÃO é invenção: é o número
   * que o plano prescreveu para aquela semana.
   */
  const repsPrescrito =
    bloco.repsAlvo != null
      ? String(bloco.repsAlvo)
      : /^\d+$/.test(String(bloco.reps ?? "").trim())
        ? String(bloco.reps).trim()
        : "";
  const totalSeries = totalSeriesDe(bloco);
  const ultimaFeita = feitas[feitas.length - 1];
  const completo = blocoCompleto(bloco, feitas, semana);
  const [editando, setEditando] = React.useState(false);

  /*
   * A SÉRIE QUE ESTÁ SENDO REGISTRADA é a primeira que ainda não tem registro, e não um
   * contador de tela. Assim o aluno que fecha o app no meio do exercício volta na série
   * certa, e o professor recebe as três linhas do que aconteceu em vez de uma média
   * involuntária. Editando, o alvo é a última série gravada (é ela que se corrige).
   */
  const serieAtual = editando ? (ultimaFeita?.serie ?? 1) : Math.min(feitas.length + 1, totalSeries);
  const base = editando ? ultimaFeita : undefined;

  /*
   * A carga da série anterior fica no campo de propósito: quem faz três séries costuma
   * repetir a carga, e quem baixa no fim corrige um número. O oposto (campo vazio a cada
   * série) cobraria digitação três vezes e empurraria o aluno a fechar tudo de uma vez,
   * que é justamente o comportamento que este modelo veio desfazer.
   */
  // Vale também para quem volta ao app no meio do exercício: o campo nasce com a carga da
  // última série gravada, e não vazio.
  const [carga, setCarga] = React.useState(
    base?.cargaFeita != null ? String(base.cargaFeita) : ultimaFeita?.cargaFeita != null ? String(ultimaFeita.cargaFeita) : "",
  );
  const [reps, setReps] = React.useState(base?.repsFeitas != null ? String(base.repsFeitas) : repsPrescrito);
  const [rpe, setRpe] = React.useState(base?.rpe != null ? String(base.rpe) : "");
  const podeRegistrar = !!onRegistrar;
  /*
   * O id carrega a série. É chave composta desde sempre (bloco + semana) e ganhou o
   * sufixo `-r<n>` em 01/09/2026, o que faz cada série virar uma linha própria na nuvem
   * SEM depender de coluna nova: `execFromRow` lê a série de volta daqui. Bloco de série
   * única mantém o id antigo, então nada do que já foi gravado muda de identidade.
   */
  const execId = `ex-${bloco.id}-s${semana}` + (totalSeries > 1 ? `-r${serieAtual}` : "");
  const tintaDaCor = tintaDada ?? corDeContraste(cor);
  const rpeId = React.useId();

  /*
   * EDITAR TRAZ OS NÚMEROS DA SÉRIE QUE SE CORRIGE. Os campos nascem uma vez só (useState), e
   * antes o "Editar" apenas trocava o alvo: o aluno via nos campos o que tinha digitado para a
   * PRÓXIMA série, e salvar gravava isso por cima da série certa.
   */
  const editarUltima = () => {
    if (!ultimaFeita) return;
    setCarga(ultimaFeita.cargaFeita != null ? String(ultimaFeita.cargaFeita) : "");
    setReps(ultimaFeita.repsFeitas != null ? String(ultimaFeita.repsFeitas) : repsPrescrito);
    setRpe(ultimaFeita.rpe != null ? String(ultimaFeita.rpe) : "");
    setEditando(true);
  };

  // Só grava número quando é número de verdade; texto ("6 a 12") vira undefined
  // em vez de piso truncado ou NaN, que envenenaria o histórico do aluno.
  const numOuUndef = (v: string, f: (s: string) => number): number | undefined => {
    const n = f(v.replace(",", "."));
    return Number.isFinite(n) ? n : undefined;
  };
  const registrar = () => {
    if (!onRegistrar) return;
    onRegistrar({
      id: execId,
      alunoId,
      planoId,
      semana,
      sessaoRef,
      blocoRef: bloco.id,
      exercicioSlug: bloco.exercicioSlug,
      serie: totalSeries > 1 ? serieAtual : undefined,
      cargaFeita: pedeCarga && carga ? numOuUndef(carga, parseFloat) : undefined,
      repsFeitas: pedeReps && reps ? numOuUndef(reps, (s) => parseInt(s, 10)) : undefined,
      rpe: rpe ? numOuUndef(rpe, (s) => parseInt(s, 10)) : undefined,
      concluidoEm: Date.now(),
    });
    // A carga fica no campo para a próxima série; o RPE não, porque ele é a leitura
    // daquela série e repetir o número anterior seria responder pelo aluno.
    setRpe("");
    setEditando(false);
  };
  const concluirAerobio = () => {
    if (!onRegistrar) return;
    onRegistrar({ id: execId, alunoId, planoId, semana, sessaoRef, blocoRef: bloco.id, exercicioSlug: bloco.exercicioSlug, concluidoEm: Date.now() });
  };
  const desfazer = () => {
    // Desfaz a ÚLTIMA série registrada, não o exercício inteiro: o aluno que errou o
    // número da terceira série não deveria perder as duas primeiras.
    if (ultimaFeita && onDesfazer) onDesfazer(ultimaFeita.id);
    setEditando(false);
  };

  if (!podeRegistrar) return null;
  if (preview && !sempreMostrar) return null;

  /*
   * A TABELA DE SÉRIES (protótipo, tela 03). Uma linha por série prescrita, e cada linha é o
   * espelho do dado: a gravada mostra os números que foram GRAVADOS (não os do campo), a
   * atual abre os controles, e as que faltam ficam apagadas com hífen. Antes era uma fileira
   * de discos e UM formulário: o aluno via que tinha feito duas séries, mas não o quê.
   *
   * O protótipo desenha os controles da série atual numa linha só, com botões de 18 px. Isso
   * reprova o alvo de toque de 44 px e não cabe com dois campos e o esforço, então a linha
   * atual cresce para baixo: é a mesma linha realçada, só mais alta.
   */
  const rotuloDaSerie = (n: number) => (totalSeries > 1 ? `Série ${n} de ${totalSeries}` : "Sua série");
  const emEdicao = editando && ultimaFeita != null;
  const linhaAtual = !completo || emEdicao ? serieAtual : null;

  return (
    <div className="mt-2.5">
      {aerobio ? (
        completo ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Concluído
            </span>
            {onDesfazer && (
              <button
                onClick={desfazer}
                className="inline-flex min-h-[44px] items-center rounded-full px-1 text-xs font-medium text-ink-2 underline-offset-2 hover:underline"
              >
                Desfazer
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={concluirAerobio}
            className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold"
            style={{ background: cor, color: tintaDaCor }}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Concluí
          </button>
        )
      ) : (
        <>
          <div className="text-2xs font-bold uppercase tracking-[0.1em] text-ink-2">
            {totalSeries > 1 ? "Séries" : "Série"}
          </div>
          <ol className="mt-1.5 space-y-1" aria-label={`${feitas.length} de ${totalSeries} registradas`}>
            {Array.from({ length: totalSeries }, (_, i) => {
              const n = i + 1;
              const gravada = feitas.find((e) => (e.serie ?? 1) === n) ?? (totalSeries === 1 ? feitas[0] : undefined);
              const ehUltima = !!gravada && gravada.id === ultimaFeita?.id;

              if (n === linhaAtual) {
                return (
                  <li
                    key={n}
                    className="rounded-[10px] bg-bg px-2 py-2"
                    style={{ boxShadow: `inset 0 0 0 1.5px ${cor}` }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="tabular grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-2xs font-bold text-primary-texto"
                        style={{ boxShadow: `inset 0 0 0 1.5px ${cor}` }}
                      >
                        {n}
                      </span>
                      <span className="min-w-0 flex-1 text-xs font-bold text-ink">
                        {emEdicao ? `Corrigir a série ${n}` : rotuloDaSerie(n)}
                      </span>
                      <label htmlFor={rpeId} className="sr-only">
                        Esforço da série (RPE)
                      </label>
                      <RpeSelect id={rpeId} value={rpe} onChange={setRpe} />
                    </div>
                    {pedeReps ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {pedeCarga && <Stepper label="kg" value={carga} onChange={setCarga} passo={2.5} />}
                        <Stepper label="repetições" curto="reps" value={reps} onChange={setReps} passo={1} inteiro />
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-ink-2">Segure o tempo prescrito e registre a série quando terminar.</p>
                    )}
                    <button
                      onClick={registrar}
                      className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-bold"
                      style={{ background: cor, color: tintaDaCor }}
                    >
                      {emEdicao ? "Salvar" : totalSeries > 1 ? `Registrar série ${serieAtual}` : "Registrar"}
                    </button>
                    {emEdicao && (
                      <button
                        onClick={() => setEditando(false)}
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full text-xs font-medium text-ink-2 hover:text-ink"
                      >
                        Cancelar
                      </button>
                    )}
                  </li>
                );
              }

              if (gravada) {
                return (
                  <li key={n} className="flex min-h-[32px] items-center gap-2 rounded-[10px] bg-bg px-2 py-1.5 text-2xs">
                    <span
                      className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-success-fill text-on-success-fill"
                      aria-label={`Série ${n} registrada`}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden />
                    </span>
                    <span className="tabular flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2.5">
                      {pedeCarga && (
                        <span>
                          <span className="text-ink-2">kg</span> <b className="text-ink">{gravada.cargaFeita ?? "-"}</b>
                        </span>
                      )}
                      {pedeReps && (
                        <span>
                          <span className="text-ink-2">reps</span> <b className="text-ink">{gravada.repsFeitas ?? "-"}</b>
                        </span>
                      )}
                      {!pedeReps && <span className="text-ink-2">feita</span>}
                    </span>
                    {gravada.rpe != null && <span className="tabular shrink-0 text-ink-2">RPE {gravada.rpe}</span>}
                    {/* Só a última gravada se corrige (a regra de sempre): corrigir a primeira
                        depois de gravar as outras mudaria uma série no meio da sequência. */}
                    {ehUltima && !emEdicao && (
                      <button
                        onClick={editarUltima}
                        className="-my-1.5 inline-flex min-h-[44px] shrink-0 items-center rounded-full px-1.5 text-2xs font-bold text-primary-texto"
                        aria-label={`Editar a série ${n}`}
                      >
                        Editar
                      </button>
                    )}
                  </li>
                );
              }

              return (
                <li key={n} className="flex min-h-[32px] items-center gap-2 rounded-[10px] bg-bg px-2 py-1.5 text-2xs opacity-50">
                  <span
                    className="tabular grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full font-bold text-ink-2"
                    style={{ boxShadow: "inset 0 0 0 1.5px var(--border)" }}
                    aria-label={`Série ${n}, por fazer`}
                  >
                    {n}
                  </span>
                  <span aria-hidden className="flex min-w-0 flex-1 gap-x-2.5 text-ink-2">
                    {pedeCarga && <span>kg -</span>}
                    {pedeReps && <span>reps -</span>}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Corrigir no meio do exercício: sem isto, quem errou a série 1 só teria como
              consertar depois de gravar as outras duas por cima do erro. */}
          {!emEdicao && feitas.length > 0 && onDesfazer && (
            <button
              onClick={desfazer}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full text-xs font-medium text-ink-2 underline-offset-2 hover:underline"
            >
              Desfazer a série {ultimaFeita?.serie ?? feitas.length}
            </button>
          )}
          <p className={cn("text-2xs text-ink-2", !(feitas.length > 0 && onDesfazer) && "mt-2")}>
            RPE é o seu esforço de 0 a 10 (7 = difícil, 9 = quase a falha).
          </p>
        </>
      )}
    </div>
  );
}

/*
 * Seletor de RPE de 0 a 10 (esforço percebido), com âncoras nas notas que mais importam.
 * Substitui o campo livre para o aluno não digitar um valor sem sentido.
 *
 * Compacto, dentro da linha da série (protótipo: "RPE ▾"). A FACE mostra só "RPE 7"; o
 * `<select>` nativo fica por cima, transparente, e é ele que abre a lista com as âncoras
 * ("7 · difícil"). Um select estreito com a âncora no texto cortava a frase no meio ("RPE 9 ·
 * qua"), e tirar as âncoras tirava do aluno a régua de o que cada número quer dizer.
 */
function RpeSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const ancora: Record<number, string> = { 5: "moderado", 7: "difícil", 9: "quase a falha", 10: "falha" };
  return (
    <span className="relative inline-flex h-11 w-[76px] shrink-0 items-center justify-between rounded-control border border-border bg-surface pl-2.5 pr-1.5 focus-within:ring-2 focus-within:ring-primary">
      <span aria-hidden className="tabular text-xs font-bold text-ink">
        RPE {value || "-"}
      </span>
      <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 text-primary-texto" />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        <option value="">Sem esforço marcado</option>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <option key={n} value={n}>
            {n}
            {ancora[n] ? ` · ${ancora[n]}` : ""}
          </option>
        ))}
      </select>
    </span>
  );
}

/**
 * Controle de número em passo (menos, valor, mais), como no mockup: o aluno na
 * academia ajusta com o polegar, sem abrir o teclado. O campo continua digitável
 * para quem prefere escrever; os botões apenas somam e subtraem o passo.
 *
 * Alvos de 44px nos dois botões (regra de toque do Design System). Numa tela de 320 px os
 * dois controles lado a lado não cabem com folga: `min-w` faz o segundo descer para a linha
 * de baixo em vez de espremer o número.
 */
function Stepper({
  label,
  curto,
  value,
  onChange,
  passo,
  inteiro,
}: {
  label: string;
  /** o rótulo visível, quando o por extenso não cabe sob o número (o leitor de tela ouve o `label`) */
  curto?: string;
  value: string;
  onChange: (v: string) => void;
  passo: number;
  /** repetições são inteiras; carga aceita meio quilo */
  inteiro?: boolean;
}) {
  const id = React.useId();
  const num = () => {
    const n = parseFloat(value.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };
  const aplica = (delta: number) => {
    const bruto = Math.max(0, num() + delta);
    const v = inteiro ? String(Math.round(bruto)) : String(Number(bruto.toFixed(1)));
    onChange(v);
  };
  return (
    <div className="flex min-w-[136px] flex-1 items-center gap-1 rounded-control border border-border bg-surface p-1">
      <button
        type="button"
        onClick={() => aplica(-passo)}
        aria-label={`Diminuir ${label}`}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-surface-soft text-ink"
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <div className="min-w-0 flex-1 text-center">
        <input
          id={id}
          inputMode="decimal"
          value={value}
          placeholder="0"
          onChange={(e) => onChange(soNumero(e.target.value))}
          aria-label={label}
          className="tabular w-full bg-transparent text-center font-display text-lg font-bold leading-tight text-ink placeholder:text-ink-2 focus:outline-none"
        />
        <label htmlFor={id} className="block text-2xs leading-none text-ink-2">
          {curto ?? label}
        </label>
      </div>
      <button
        type="button"
        onClick={() => aplica(passo)}
        aria-label={`Aumentar ${label}`}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-surface-soft text-ink"
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
