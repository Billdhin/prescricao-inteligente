/**
 * Guardrail: o catálogo de exercícios está íntegro, e o que falta nele é VISÍVEL.
 *
 * Roda com `npm run check:catalogo`. Ele faz duas coisas diferentes de propósito:
 *
 * 1. TRAVA o que é integridade. Slug duplicado, vocabulário inventado, campo de texto
 *    vazio, ativação sem primário, percentual 0 (que é uma afirmação falsa, não uma
 *    ausência) e, principalmente, ÍNDICE DE IMAGEM APONTANDO PARA ARQUIVO QUE NÃO
 *    EXISTE. Este último é o que quebra em produção sem quebrar no build: o TypeScript
 *    não sabe se `/exercises/erros/scaption-0.webp` existe no disco.
 *
 * 2. IMPRIME a fila de trabalho do que ainda não foi preenchido, sem reprovar. Foto,
 *    análise, boneco na posição, mapa muscular, erros, variações e referência são
 *    trabalho de lote, e um guardrail vermelho por meses vira ruído que ninguém lê.
 *    Aqui eles viram uma fila contada, na ordem em que o catálogo cresce.
 *
 * A COBERTURA MUSCULAR é derivada de `ativacao[]`, não de uma tabela paralela. O
 * documento `docs/catalogo-completude.md` foi o ponto de partida, mas documento
 * envelhece em silêncio: a partir daqui a matriz é medida do próprio catálogo, e
 * músculo em zero significa que o motor NUNCA vai escolher um exercício por causa dele.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { exercises } from "../src/data/exercises";
import { muscleMapImages, getMuscleMapPose } from "../src/data/muscle-map-images";
import {
  getErroImagemPorIndice,
  getVariacaoImagemPorIndice,
  temErroImagens,
  temVariacaoImagens,
} from "../src/data/aba-imagens";
import { getExercicioRefs } from "../src/data/exercise-referencias";
import { getReferencia } from "../src/data/referencias";
import { specialGroups } from "../src/data/specialGroups";

const PUBLIC = join(process.cwd(), "public");
const problemas: string[] = [];

/* ------------------------------ Vocabulários ------------------------------ */
/*
 * Listas FECHADAS, escritas à mão. Não são derivadas do próprio catálogo de
 * propósito: derivar faria o primeiro erro de digitação virar vocabulário oficial
 * ("Peitorais" e "Peitoral" convivendo para sempre). Ampliar exige vir aqui, que é
 * exatamente a fricção que se quer.
 */
const GRUPOS = [
  "Braços",
  "Core (tronco)",
  "Corpo todo",
  "Costas",
  "Membros inferiores",
  "Ombros",
  "Peitorais",
  "Tornozelo e pé",
  "Pescoço",
];
const EQUIPAMENTOS = [
  "Barra",
  "Bicicleta ergométrica",
  "Elástico",
  "Elíptico",
  "Esteira",
  "Halter",
  "Máquina",
  "Peso corporal",
  "Piscina",
  "Polia",
];
const NIVEIS = ["Iniciante", "Intermediário", "Avançado"];
const OBJETIVOS = [
  "Aprendizado técnico",
  "Emagrecimento",
  "Força",
  "Hipertrofia",
  "Resistência muscular",
  "Retorno ao treino",
];
const TRUST = [
  "princípio biomecânico",
  "tendência prática",
  "regra pedagógica",
  "cuidado de segurança",
  "depende do contexto",
];

/**
 * A matriz de cobertura. Cada entrada é um músculo que um catálogo de prescrição
 * precisa saber treinar, com o nome CANÔNICO que `ativacao[].musculo` usa.
 *
 * `minimo` é quantos exercícios deveriam citá-lo para que o motor tenha escolha de
 * verdade: 1 significa "existe", 2 significa "dá para trocar". Não é meta arbitrária,
 * é o que o botão "Trocar" precisa para não devolver a mesma coisa.
 */
const MATRIZ: { musculo: string; minimo: number; regiao: string }[] = [
  // Ombro e manguito
  { musculo: "Deltoide anterior", minimo: 2, regiao: "Ombro" },
  { musculo: "Deltoide médio", minimo: 2, regiao: "Ombro" },
  { musculo: "Deltoide posterior", minimo: 2, regiao: "Ombro" },
  { musculo: "Supraespinal", minimo: 1, regiao: "Manguito rotador" },
  { musculo: "Infraespinal", minimo: 2, regiao: "Manguito rotador" },
  { musculo: "Redondo menor", minimo: 1, regiao: "Manguito rotador" },
  { musculo: "Subescapular", minimo: 1, regiao: "Manguito rotador" },
  // Escápula
  { musculo: "Trapézio superior", minimo: 1, regiao: "Escápula" },
  { musculo: "Trapézio médio", minimo: 2, regiao: "Escápula" },
  { musculo: "Trapézio inferior", minimo: 2, regiao: "Escápula" },
  { musculo: "Romboides", minimo: 2, regiao: "Escápula" },
  { musculo: "Serrátil anterior", minimo: 2, regiao: "Escápula" },
  // Tronco
  { musculo: "Reto abdominal", minimo: 2, regiao: "Tronco" },
  { musculo: "Oblíquos", minimo: 2, regiao: "Tronco" },
  { musculo: "Transverso do abdome", minimo: 2, regiao: "Tronco" },
  { musculo: "Eretores da espinha", minimo: 2, regiao: "Tronco" },
  { musculo: "Quadrado lombar", minimo: 1, regiao: "Tronco" },
  { musculo: "Diafragma", minimo: 1, regiao: "Tronco" },
  // Quadril
  { musculo: "Glúteo máximo", minimo: 2, regiao: "Quadril" },
  { musculo: "Glúteo médio", minimo: 2, regiao: "Quadril" },
  { musculo: "Rotadores externos do quadril", minimo: 1, regiao: "Quadril" },
  { musculo: "Iliopsoas", minimo: 1, regiao: "Quadril" },
  { musculo: "Adutores", minimo: 1, regiao: "Quadril" },
  // Coxa e perna
  { musculo: "Quadríceps", minimo: 2, regiao: "Coxa e perna" },
  { musculo: "Isquiotibiais", minimo: 2, regiao: "Coxa e perna" },
  { musculo: "Gastrocnêmio", minimo: 1, regiao: "Coxa e perna" },
  { musculo: "Sóleo", minimo: 1, regiao: "Coxa e perna" },
  { musculo: "Tibial anterior", minimo: 1, regiao: "Coxa e perna" },
  // Braço, antebraço e pegada
  { musculo: "Bíceps braquial", minimo: 2, regiao: "Braço" },
  { musculo: "Braquial", minimo: 1, regiao: "Braço" },
  { musculo: "Braquiorradial", minimo: 1, regiao: "Braço" },
  { musculo: "Tríceps braquial", minimo: 2, regiao: "Braço" },
  { musculo: "Flexores do punho", minimo: 1, regiao: "Antebraço" },
  { musculo: "Extensores do punho", minimo: 1, regiao: "Antebraço" },
  // Peito e costas
  { musculo: "Peitoral maior", minimo: 2, regiao: "Peito e costas" },
  { musculo: "Latíssimo do dorso", minimo: 2, regiao: "Peito e costas" },
  // Pescoço
  { musculo: "Flexores profundos do pescoço", minimo: 1, regiao: "Pescoço" },
];

/* ----------------------------- Coleta de texto ---------------------------- */

function textosDe(e: (typeof exercises)[number]): { campo: string; valor: string }[] {
  return [
    { campo: "nome", valor: e.nome },
    { campo: "resumoPratico", valor: e.resumoPratico },
    { campo: "anguloArticular", valor: e.anguloArticular ?? "" },
    ...Object.entries(e.conteudo).map(([k, v]) => ({ campo: `conteudo.${k}`, valor: v })),
    ...Object.entries(e.blocos).flatMap(([k, arr]) =>
      (arr as string[]).map((v, i) => ({ campo: `blocos.${k}[${i}]`, valor: v })),
    ),
    ...e.fases.flatMap((f, i) => [
      { campo: `fases[${i}].nome`, valor: f.nome },
      { campo: `fases[${i}].descricao`, valor: f.descricao },
    ]),
    ...e.hotspots.flatMap((h, i) => [
      { campo: `hotspots[${i}].titulo`, valor: h.titulo },
      ...Object.entries(h.camadas).map(([k, v]) => ({ campo: `hotspots[${i}].${k}`, valor: v })),
    ]),
    // `restricoes` saiu do modelo: era rótulo livre sem consumidor e que misturava
    // "indicado para" com "cuidado com". Ver o comentário em Exercise, em types.ts.
  ];
}

/* ------------------------------ Regras duras ------------------------------ */

const vistos = { slug: new Set<string>(), id: new Set<string>() };

for (const e of exercises) {
  const onde = `[${e.slug}]`;

  // 1. identidade única e endereçável
  if (vistos.slug.has(e.slug)) problemas.push(`${onde}: slug duplicado.`);
  if (vistos.id.has(e.id)) problemas.push(`${onde}: id "${e.id}" duplicado.`);
  vistos.slug.add(e.slug);
  vistos.id.add(e.id);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug)) {
    problemas.push(`${onde}: slug fora do padrão kebab-case (ele vira URL e nome de arquivo de imagem).`);
  }

  // 2. vocabulário fechado
  if (!GRUPOS.includes(e.grupoMuscular)) problemas.push(`${onde}: grupoMuscular "${e.grupoMuscular}" fora do vocabulário.`);
  if (!EQUIPAMENTOS.includes(e.equipamento)) problemas.push(`${onde}: equipamento "${e.equipamento}" fora do vocabulário.`);
  if (!NIVEIS.includes(e.nivel)) problemas.push(`${onde}: nivel "${e.nivel}" inválido.`);
  if (!TRUST.includes(e.trustLevel)) problemas.push(`${onde}: trustLevel "${e.trustLevel}" fora do vocabulário.`);
  if (e.objetivo.length === 0) problemas.push(`${onde}: sem objetivo (o motor nunca vai escolhê-lo).`);
  for (const o of e.objetivo) {
    if (!OBJETIVOS.includes(o)) problemas.push(`${onde}: objetivo "${o}" fora do vocabulário.`);
  }

  // 3. texto que a tela mostra não pode estar vazio
  for (const { campo, valor } of textosDe(e)) {
    if (campo === "anguloArticular") continue; // opcional de propósito
    if (!valor?.trim()) problemas.push(`${onde} ${campo}: vazio.`);
  }
  for (const [k, arr] of Object.entries(e.blocos)) {
    if ((arr as string[]).length === 0) problemas.push(`${onde} blocos.${k}: lista vazia.`);
  }
  if (e.fases.length < 2) problemas.push(`${onde}: ${e.fases.length} fase(s). Um movimento tem pelo menos início e fim.`);
  if (e.hotspots.length === 0) problemas.push(`${onde}: sem hotspot (a camada de análise fica sem nada para explicar).`);

  // 4. a casa não usa travessão (o fundador considera cara de IA)
  for (const { campo, valor } of textosDe(e)) {
    const m = valor.match(/[–—]/);
    if (m) problemas.push(`${onde} ${campo}: travessão em "${valor.slice(Math.max(0, valor.indexOf(m[0]) - 20), valor.indexOf(m[0]) + 20)}".`);
  }

  // 5. ativação honesta
  if (e.ativacao.length === 0) problemas.push(`${onde}: ativacao vazia.`);
  /*
   * PELO MENOS um primário, não exatamente um. A primeira versão desta regra exigia
   * um só, e o catálogo reprovou em agachamento, terra romeno, afundo, prancha e dead
   * bug. O dado estava certo e a regra errada: agachamento tem dois motores primários
   * de verdade, e `ExercicioSheet` já lê `primarios` como LISTA. O que não pode existir
   * é exercício com nenhum, porque aí o app cai no "de maior ativação" e o alvo passa a
   * ser decidido por um número em vez de pela anatomia.
   */
  const primarios = e.ativacao.filter((a) => a.papel === "primário");
  if (primarios.length === 0) {
    problemas.push(`${onde}: nenhum músculo primário. Sem ele o alvo do exercício vira o de maior percentual, que é decidir por número.`);
  }
  for (const a of e.ativacao) {
    if (a.percentual === 0) {
      problemas.push(
        `${onde} ativacao "${a.musculo}": percentual 0. Zero é a AFIRMAÇÃO de que o músculo não trabalha. ` +
          `Para "sem EMG publicado" o correto é não listar o músculo.`,
      );
    } else if (!(a.percentual > 0 && a.percentual <= 100)) {
      problemas.push(`${onde} ativacao "${a.musculo}": percentual ${a.percentual} fora de 1 a 100.`);
    }
  }
  const nomesAtiv = e.ativacao.map((a) => a.musculo);
  if (new Set(nomesAtiv).size !== nomesAtiv.length) problemas.push(`${onde}: músculo repetido em ativacao.`);

  // 6. índice de eficiência
  if (!(e.indiceEficiencia.score > 0 && e.indiceEficiencia.score <= 100)) {
    problemas.push(`${onde}: score ${e.indiceEficiencia.score} fora de 1 a 100.`);
  }
  for (const met of e.indiceEficiencia.metrics) {
    if (!(met.valor >= 0 && met.valor <= 100)) problemas.push(`${onde} métrica "${met.nome}": valor ${met.valor} fora de 0 a 100.`);
  }

  // 7. o perfil de restrição tem que ser coerente com a posição declarada
  const p = e.restricaoPerfil;
  if (!p) {
    problemas.push(`${onde}: sem restricaoPerfil (ver src/data/restricao-perfis.ts).`);
  } else {
    if (p.exigeIrAoChao && !["deitado", "quatro apoios", "ajoelhado"].includes(p.posicao)) {
      problemas.push(`${onde} restricaoPerfil: exigeIrAoChao com posicao "${p.posicao}". Ou a posição está errada, ou o exercício não vai ao chão.`);
    }
    if (p.exigeAjoelhar && p.posicao === "sentado") {
      problemas.push(`${onde} restricaoPerfil: exigeAjoelhar com posicao "sentado".`);
    }
  }
}

/* ------------- A CAMADA DE ANÁLISE OU EXISTE OU É EXCEÇÃO DECLARADA ------------- */
/*
 * A varredura de imagens de 19/08/2026 achou 10 exercícios sem `imagemAnalise` e 28 com uma
 * imagem que não servia (rosto sem pele, vísceras à mostra, boneco azul de outro estilo, ou a
 * pessoa VESTIDA com uma mancha vermelha por cima do tecido, que não mostra músculo nenhum).
 * As 36 que dava para refazer foram refeitas.
 *
 * As DUAS que tinham ficado de fora por motivo anatômico foram fechadas no mesmo dia, e o
 * caminho vale registrar porque não foi mais prompt: foi TROCAR A SEMENTE DE POSE.
 *
 * - `scaption`: o primário é o SUPRAESPINAL, que corre por baixo do trapézio e não aparece em
 *   superfície. Resolvido com a convenção da ilustração anatômica para músculo profundo, a
 *   mesma que o mapa muscular já usava para o diafragma: vista de trás e o músculo em janela
 *   RECORTADA no trapézio.
 * - `puxada-supinada`: o primário é o LATÍSSIMO DO DORSO, que fica nas costas, e a foto de
 *   execução é FRONTAL. Resolvido gerando a análise numa vista de TRÁS.
 *
 * Nas duas, pedir "mude a câmera para trás" ao gerador NÃO funcionou: ele devolveu vista
 * frontal as duas vezes. O que funcionou foi usar como semente de pose o BONECO na posição,
 * que já estava na vista certa. Fica registrado para a próxima vez que a câmera teimar.
 *
 * A lista de exceções está VAZIA hoje, e é para continuar assim. Ela existe como porta de
 * saída declarada, não como gaveta: quem precisar usá-la escreve o motivo anatômico aqui.
 *
 * A lista é fechada de propósito: exercício novo que nascer sem análise reprova aqui e obriga
 * quem o criou a gerar a imagem ou a escrever por que ela não pode existir. Ausência com
 * motivo é honestidade; ausência silenciosa é buraco.
 */
const SEM_ANALISE_COM_MOTIVO = new Set<string>([
  /*
   * suitcase-carry: o primário é o QUADRADO LOMBAR, que é profundo, fica de um lado só da
   * coluna, e a foto de execução é de PERFIL.
   *
   * Duas coisas se somam e fecham a porta. Primeiro, quem resiste ao suitcase carry é o
   * quadrado lombar do lado OPOSTO à carga, porque é ele que impede o tronco de tombar na
   * direção do halter; marcar o lado errado ensinaria o contrário do certo. Segundo, numa vista
   * de perfil os dois lados do tronco se sobrepõem, então nem dá para CONFERIR qual foi pintado.
   *
   * Duas gerações tentaram, em 22 e 23/08/2026. A primeira pintou o lado do peso e duplicou o
   * halter. Na segunda pedi vista de costas, que desfaria a ambiguidade, e o gerador devolveu a
   * imagem anterior sem mudar nada: é o terceiro registro do mesmo limite na skill
   * imagens-lovable, onde troca de câmera não se pede em texto.
   *
   * Imagem que não dá para verificar não entra. A tela já tem a frase honesta para este caso, e
   * os músculos envolvidos seguem listados abaixo dela.
   */
  "suitcase-carry",
]);

for (const e of exercises) {
  const temAnalise = Boolean(e.imagemAnalise);
  const ehExcecao = SEM_ANALISE_COM_MOTIVO.has(e.slug);
  if (!temAnalise && !ehExcecao)
    problemas.push(
      `[${e.slug}]: sem imagem de análise e sem estar na lista de exceções com motivo anatômico. Gere a imagem ou declare por que ela não pode existir.`,
    );
  if (temAnalise && ehExcecao)
    problemas.push(
      `[${e.slug}]: está na lista de exceções por motivo anatômico e mesmo assim declara imagem de análise. Uma das duas coisas está errada.`,
    );
}

/* ------------- O BONECO NA POSIÇÃO TAMBÉM É COBRADO, e por que ele faltava ------------- */
/*
 * A varredura de 19/08/2026 cobriu a camada de análise e deu por encerrado. Estava errado: o
 * Filipe perguntou se ainda havia treino sem imagem, e a conta refeita achou 24 exercícios sem
 * BONECO NA POSIÇÃO. O buraco passou batido porque são ÍNDICES DIFERENTES, cada um com a sua
 * lista, e conferir um não diz nada sobre o outro.
 *
 * Por isso a regra nasce ao lado da regra da análise, e não como uma verificação avulsa: as
 * duas famílias de imagem passam a ser cobradas na mesma passada, com a mesma porta de exceção
 * declarada. Quem criar exercício novo agora reprova nas duas até gerar as duas imagens.
 */
const SEM_BONECO_COM_MOTIVO = new Set<string>([]);

for (const e of exercises) {
  const temBoneco = Boolean(getMuscleMapPose(e.slug));
  const ehExcecao = SEM_BONECO_COM_MOTIVO.has(e.slug);
  if (!temBoneco && !ehExcecao)
    problemas.push(
      `[${e.slug}]: sem boneco na posição (mmp) e sem estar na lista de exceções com motivo. Gere a imagem ou declare por que ela não pode existir.`,
    );
  if (temBoneco && ehExcecao)
    problemas.push(`[${e.slug}]: está na lista de exceções do boneco e mesmo assim declara um. Uma das duas coisas está errada.`);
}

/* ------------- Regra dura: imagem declarada existe mesmo no disco ------------- */
/*
 * O TypeScript compila feliz com "/exercises/erros/scaption-0.webp" mesmo que o
 * arquivo nunca tenha sido gerado. Quem descobre é o aluno, com um quadrado quebrado
 * na tela. Índice é promessa: aqui ela é cobrada.
 */
function conferirArquivo(onde: string, caminho: string | undefined, rotulo: string) {
  if (!caminho) return;
  if (!existsSync(join(PUBLIC, caminho.replace(/^\//, "")))) {
    problemas.push(`${onde}: ${rotulo} aponta para "${caminho}", que não existe em public/.`);
  }
}

for (const e of exercises) {
  const onde = `[${e.slug}]`;
  conferirArquivo(onde, e.imagem, "imagem de execução");
  conferirArquivo(onde, e.imagemAnalise, "imagem de análise");
  conferirArquivo(onde, getMuscleMapPose(e.slug), "boneco na posição (mmp)");
  conferirArquivo(onde, muscleMapImages[e.slug]?.front, "mapa muscular frente");
  conferirArquivo(onde, muscleMapImages[e.slug]?.back, "mapa muscular costas");

  // erro e variação: além de existir, o índice tem que caber no array de texto
  for (let i = 0; i < 12; i++) {
    const erro = getErroImagemPorIndice(e.slug, i);
    if (erro) {
      if (i >= e.blocos.errosComuns.length) {
        problemas.push(`${onde}: imagem de erro no índice ${i}, mas errosComuns tem ${e.blocos.errosComuns.length} item(ns). Imagem órfã.`);
      }
      conferirArquivo(onde, erro, `imagem do erro ${i}`);
    }
    const varia = getVariacaoImagemPorIndice(e.slug, i);
    if (varia) {
      if (i >= e.blocos.variacoes.length) {
        problemas.push(`${onde}: imagem de variação no índice ${i}, mas variacoes tem ${e.blocos.variacoes.length} item(ns). Imagem órfã.`);
      }
      conferirArquivo(onde, varia, `imagem da variação ${i}`);
    }
  }

  // referência declarada tem que existir em referencias.ts
  for (const id of getExercicioRefs(e.slug)) {
    if (!getReferencia(id)) problemas.push(`${onde}: referência "${id}" não existe em referencias.ts.`);
  }
}

/* ------------------------------ Autoverificação ----------------------------- */
/*
 * O guardrail prova a si mesmo antes de julgar o catálogo: se o caso plantado passar,
 * a regra não vale nada. Cada caso abaixo é a forma exata de um erro já cometido.
 */
function autoverificar(): string[] {
  const e: string[] = [];
  const base = exercises[0];
  const casos: { rotulo: string; muda: (x: Record<string, unknown>) => void; espera: RegExp }[] = [
    { rotulo: "percentual 0", muda: (x) => { (x.ativacao as { percentual: number }[])[0].percentual = 0; }, espera: /percentual 0/ },
    { rotulo: "nenhum primário", muda: (x) => { (x.ativacao as { papel: string }[]).forEach((a) => (a.papel = "sinergista")); }, espera: /nenhum músculo primário/ },
    { rotulo: "travessão", muda: (x) => { x.resumoPratico = "um texto com travessão — aqui"; }, espera: /travessão/ },
    { rotulo: "grupo inventado", muda: (x) => { x.grupoMuscular = "Panturrilhas"; }, espera: /grupoMuscular/ },
    { rotulo: "slug com maiúscula", muda: (x) => { x.slug = "Slug-Errado"; }, espera: /kebab-case/ },
    { rotulo: "conteúdo vazio", muda: (x) => { (x.conteudo as { visaoGeral: string }).visaoGeral = "  "; }, espera: /vazio/ },
    { rotulo: "imagem inexistente", muda: (x) => { x.imagem = "/exercises/nao-existe-mesmo.webp"; }, espera: /não existe em public/ },
  ];
  for (const caso of casos) {
    const clone = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
    caso.muda(clone);
    const achados = validarUm(clone as unknown as (typeof exercises)[number]);
    if (!achados.some((a) => caso.espera.test(a))) {
      e.push(`o caso "${caso.rotulo}" deveria reprovar, e passou.`);
    }
  }
  // e o exercício real, intocado, tem que passar
  if (validarUm(base).length) e.push(`o exercício real "${base.slug}" reprovou na autoverificação, o que indica regra quebrada.`);
  return e;
}

/** As mesmas regras duras acima, aplicadas a UM exercício. Usada só pela autoverificação. */
function validarUm(e: (typeof exercises)[number]): string[] {
  const r: string[] = [];
  const onde = `[${e.slug}]`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug)) r.push(`${onde}: slug fora do padrão kebab-case.`);
  if (!GRUPOS.includes(e.grupoMuscular)) r.push(`${onde}: grupoMuscular "${e.grupoMuscular}" fora do vocabulário.`);
  if (!EQUIPAMENTOS.includes(e.equipamento)) r.push(`${onde}: equipamento fora do vocabulário.`);
  for (const { campo, valor } of textosDe(e)) {
    if (campo === "anguloArticular") continue;
    if (!valor?.trim()) r.push(`${onde} ${campo}: vazio.`);
    if (/[–—]/.test(valor ?? "")) r.push(`${onde} ${campo}: travessão.`);
  }
  const prim = e.ativacao.filter((a) => a.papel === "primário");
  if (prim.length === 0) r.push(`${onde}: nenhum músculo primário.`);
  for (const a of e.ativacao) {
    if (a.percentual === 0) r.push(`${onde} ativacao "${a.musculo}": percentual 0.`);
  }
  for (const [caminho, rotulo] of [
    [e.imagem, "imagem de execução"],
    [e.imagemAnalise, "imagem de análise"],
  ] as const) {
    if (caminho && !existsSync(join(PUBLIC, caminho.replace(/^\//, "")))) {
      r.push(`${onde}: ${rotulo} aponta para "${caminho}", que não existe em public/.`);
    }
  }
  return r;
}

const falhasDaAuto = autoverificar();

/* ------------------------- Fila de trabalho (advisória) ------------------------ */

interface Pendencia {
  slug: string;
  faltas: string[];
}
const fila: Pendencia[] = [];
for (const e of exercises) {
  const faltas: string[] = [];
  if (!e.imagem) faltas.push("execução");
  if (!e.imagemAnalise) faltas.push("análise");
  if (!getMuscleMapPose(e.slug)) faltas.push("boneco na posição");
  if (!muscleMapImages[e.slug]) faltas.push("mapa muscular");
  if (!temErroImagens(e.slug)) faltas.push(`erros (${e.blocos.errosComuns.length})`);
  if (!temVariacaoImagens(e.slug)) faltas.push(`variações (${e.blocos.variacoes.length})`);
  if (getExercicioRefs(e.slug).length === 0) faltas.push("referência");
  if (faltas.length) fila.push({ slug: e.slug, faltas });
}

const contagem = new Map<string, number>();
for (const e of exercises) for (const a of e.ativacao) contagem.set(a.musculo, (contagem.get(a.musculo) ?? 0) + 1);
const descobertos = MATRIZ.filter((m) => (contagem.get(m.musculo) ?? 0) === 0);
const rasos = MATRIZ.filter((m) => {
  const n = contagem.get(m.musculo) ?? 0;
  return n > 0 && n < m.minimo;
});

/* --------------------------------- Saída --------------------------------- */

if (falhasDaAuto.length) {
  console.error("[check:catalogo] AUTOVERIFICAÇÃO FALHOU (a regra não pega o que deveria):\n");
  for (const f of falhasDaAuto) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`[check:catalogo] autoverificação OK: os 7 casos plantados reprovam e o exercício real passa.`);

/*
 * MODALIDADE PRESCRITA NA JORNADA, SEM UM ÚNICO EXERCÍCIO NO CATÁLOGO.
 *
 * As fases das jornadas nomeiam as modalidades em foco, e três delas não têm nenhum
 * exercício correspondente:
 *
 *   m-mobilidade  prescrita em 21 das 23 jornadas, 0 exercícios
 *   m-combinado   prescrita em  4 jornadas,        0 exercícios
 *   m-natacao     prescrita em  1 jornada,         0 exercícios
 *
 * Isto NÃO quebra a prescrição: `modalidadePrincipal` só rotula o documento, e o
 * ranqueamento de exercícios não é filtrado por modalidade. É uma lacuna de conteúdo, e
 * fechá-la é autorar exercício com evidência, não mexer em código. Fica registrada aqui,
 * com o número exato, para que ninguém a descubra de novo do zero.
 *
 * A asserção não reprova as três conhecidas: reprova se aparecer uma QUARTA (a lacuna
 * cresceu em silêncio) ou se uma delas ganhar exercício e a lista ficar desatualizada.
 */
{
  const LACUNAS_CONHECIDAS = ["m-combinado", "m-mobilidade", "m-natacao"];
  const prescritas = new Set<string>();
  for (const g of specialGroups) for (const f of g.fases ?? []) for (const m of f.modalidades ?? []) prescritas.add(m);
  if (prescritas.size < 5)
    problemas.push("controle positivo: quase nenhuma modalidade prescrita foi lida das jornadas; a asserção não testa nada.");
  const vazias = [...prescritas].filter((m) => !exercises.some((e) => e.modalidade === m)).sort();
  const esperado = LACUNAS_CONHECIDAS.join(", ");
  if (vazias.join(", ") !== esperado)
    problemas.push(
      `modalidades prescritas sem exercício mudaram: agora "${vazias.join(", ") || "(nenhuma)"}", ` +
        `antes "${esperado}". Se ganhou exercício, atualize LACUNAS_CONHECIDAS; se é modalidade nova sem ` +
        `exercício, ou autore os exercícios ou tire a modalidade da jornada.`,
    );
}

if (problemas.length) {
  console.error(`\n[check:catalogo] CATÁLOGO COM PROBLEMA DE INTEGRIDADE:\n`);
  for (const p of problemas) console.error(`  - ${p}`);
  console.error(
    `\n${problemas.length} problema(s). Integridade não é fila de trabalho: índice que aponta para arquivo ` +
      `inexistente vira imagem quebrada na tela do aluno, e percentual 0 vira afirmação falsa no PDF.\n`,
  );
  process.exit(1);
}

// Cobertura: o que o catálogo ainda não sabe treinar.
console.log(`[check:catalogo] cobertura muscular: ${MATRIZ.length - descobertos.length} de ${MATRIZ.length} músculos da matriz têm ao menos 1 exercício.`);
if (descobertos.length) {
  const porRegiao = new Map<string, string[]>();
  for (const d of descobertos) porRegiao.set(d.regiao, [...(porRegiao.get(d.regiao) ?? []), d.musculo]);
  console.log(`[check:catalogo] DESCOBERTOS (o motor nunca escolhe um exercício por causa deles):`);
  for (const [regiao, ms] of porRegiao) console.log(`    ${regiao}: ${ms.join(", ")}`);
}
if (rasos.length) {
  console.log(`[check:catalogo] RASOS (existem, mas sem alternativa para o botão "Trocar"):`);
  for (const r of rasos) console.log(`    ${r.musculo}: ${contagem.get(r.musculo)} de ${r.minimo}`);
}


// Fila de imagem e de referência.
const totalFaltas = fila.reduce((s, f) => s + f.faltas.length, 0);
console.log(
  `[check:catalogo] fila de preenchimento: ${fila.length} de ${exercises.length} exercícios com pendência, ${totalFaltas} item(ns) no total.`,
);
for (const f of fila) console.log(`    ${f.slug}: ${f.faltas.join(", ")}`);

console.log(
  `\n[check:catalogo] ok: ${exercises.length} exercícios íntegros (identidade, vocabulário, texto, ativação honesta, ` +
    `perfil de restrição e toda imagem declarada existindo no disco).`,
);
