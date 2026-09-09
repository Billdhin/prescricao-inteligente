/*
 * Documento Word de validação do motor: cenários de alunos e o plano REAL que o gerador
 * produziu para cada um, com as regras, os números e o porquê.
 *
 * Entrada: o JSON de scripts/gerar-cenarios-validacao.ts. Fora do npm run check e sem a
 * dependência do docx no repo (ver gerar-doc-word.cjs): rode com o docx instalado noutra pasta.
 * Uso: npx tsx scripts/gerar-cenarios-validacao.ts cenarios.json
 *      NODE_PATH=<pasta com docx>/node_modules node scripts/gerar-cenarios-word.cjs cenarios.json "docs/Cenarios de validacao do motor.docx"
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  LevelFormat, Footer, PageNumber, convertMillimetersToTwip, PageBreak,
} = require("docx");

const D = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const saida = process.argv[3];

const TINTA = "1F2933";
const SUAVE = "52606D";
const REGUA = "C9D2DB";
const FUNDO = "F1F4F7";
const DESTAQUE = "FFF4E5";
const LARGURA = 9638;

/* ------------------------------- helpers ------------------------------- */
const runs = (texto, base = {}) =>
  String(texto).split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((p) =>
    p.startsWith("**") ? new TextRun({ text: p.slice(2, -2), bold: true, ...base }) : new TextRun({ text: p, ...base }));

const P = (texto, opt = {}) =>
  new Paragraph({ children: runs(texto, opt.run || {}), spacing: { after: opt.after ?? 140, line: 264 }, alignment: opt.alignment, keepNext: opt.keepNext });

const NOTA = (texto) => P(texto, { run: { size: 18, color: SUAVE }, after: 120 });

const H1 = (texto) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: texto, bold: true, size: 30, color: TINTA })],
    spacing: { before: 420, after: 180 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: REGUA, space: 6 } },
    keepNext: true,
  });
const H2 = (texto) =>
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: texto, bold: true, size: 24, color: TINTA })], spacing: { before: 280, after: 120 }, keepNext: true });
const H3 = (texto) =>
  new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: texto, bold: true, size: 21, color: SUAVE })], spacing: { before: 200, after: 90 }, keepNext: true });

const LI = (texto) => new Paragraph({ children: runs(texto), numbering: { reference: "pontos", level: 0 }, spacing: { after: 90, line: 264 } });
const CHECK = (texto) => new Paragraph({ children: runs(texto), numbering: { reference: "confere", level: 0 }, spacing: { after: 90, line: 264 } });

const cel = (texto, largura, { cabecalho = false, forte = false, size = 18, fill } = {}) =>
  new TableCell({
    width: { size: largura, type: WidthType.DXA },
    shading: cabecalho ? { type: ShadingType.CLEAR, fill: FUNDO, color: "auto" } : fill ? { type: ShadingType.CLEAR, fill, color: "auto" } : undefined,
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    children: String(texto ?? "").split("\n").map((linha) => new Paragraph({ children: runs(linha, { size, ...(cabecalho || forte ? { bold: true } : {}) }), spacing: { after: 0, line: 250 } })),
  });

const tabela = (colunas, linhas, { cabecalho = true, primeiraForte = false, size = 18, fillLinha } = {}) =>
  new Table({
    columnWidths: colunas,
    width: { size: colunas.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: REGUA }, bottom: { style: BorderStyle.SINGLE, size: 4, color: REGUA },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" }, right: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: REGUA }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
    },
    rows: linhas.map((linha, i) =>
      new TableRow({
        tableHeader: cabecalho && i === 0,
        cantSplit: true,
        children: linha.map((txt, j) => cel(txt, colunas[j], { cabecalho: cabecalho && i === 0, forte: primeiraForte && j === 0 && !(cabecalho && i === 0), size, fill: fillLinha ? fillLinha(linha, i) : undefined })),
      })),
  });

const espaco = (n = 160) => new Paragraph({ text: "", spacing: { after: n } });
const quebra = () => new Paragraph({ children: [new PageBreak()] });
const ou = (v, alt = "não se aplica") => (v == null || v === "" || (Array.isArray(v) && !v.length) ? alt : Array.isArray(v) ? v.join(", ") : String(v));
const sim = (v) => (v ? "sim" : "não");
const pct = (v) => (v == null ? "" : `${v}%`);
const seg = (s) => (s == null ? "" : s >= 60 && s % 60 === 0 ? `${s / 60} min` : `${s} s`);

// "obesidade-grau-3+diabetes-tipo-2" vira "Obesidade grau III + Diabetes tipo 2": o slug é do código, o nome é do Filipe.
const NOME_REGRA = Object.fromEntries(D.regras.map((r) => [r.slug, r.nome]));
const nomeDe = (de) => (de == null ? "" : String(de).split("+").map((s) => NOME_REGRA[s] ?? s).join(" + "));

const ROTULO_PADRAO = { joelho: "dominante de joelho", quadril: "dominante de quadril", empurrar: "empurrar", puxar: "puxar", core: "tronco", panturrilha: "panturrilha", "ombro-acessorio": "ombro acessório", "quadril-acessorio": "quadril acessório", carregamento: "carregamento", equilibrio: "equilíbrio", "assoalho-pelvico": "assoalho pélvico", "acessorio-menor": "acessório menor" };
const rp = (p) => ROTULO_PADRAO[p] ?? p ?? "";

/* --------------------------- textos por cenário --------------------------- */
const CONFERIR = {
  1: [
    "A semana ondulatória alterna pesado (6 a 8 repetições, 1 a 2 de reserva), moderado e controlado: as três ênfases fazem sentido para hipertrofia em quem já treina?",
    "A cota de perna deu 6 das 15 vagas dinâmicas (40%). É a proporção que você prescreveria numa semana de hipertrofia de 4 dias?",
    "A descarga cai a cada 4 semanas (semanas 4, 8 e 12) com 3 x 14 e reserva 3. Descarga por repetição mais alta e reserva maior é o desenho que você aprova?",
    "Sem condição nenhuma, o plano não recebe isométrico nem equilíbrio. Confere que nada clínico vazou.",
  ],
  2: [
    "Reserva mínima 2 e teto de 80% de 1RM vêm da hipertensão estágio 2; a dislipidemia não pediu nada mais estrito. A fusão está certa para você?",
    "O protocolo isométrico entra em 3 sessões próprias por semana, agachamento na parede 4 x 2 min. É a dose que você validaria para controle de pressão?",
    "O aeróbio (base do emagrecimento) sobe de 20 para 40 min ao longo das 12 semanas, e o plano declara a meta de 150 a 300 min semanais. O que fica fora das sessões é orientação sua: concorda com essa divisão?",
    "A descarga vem a cada 3 semanas (e não 4) por causa da condição. Confere se é o que você espera.",
  ],
  3: [
    "Reserva mínima 3 pela idade (o objetivo já pede 5 na semana 1). Conferir se a dose de 2 x 15 com reserva 5 é o ponto de partida certo para uma idosa destreinada.",
    "O equilíbrio em um pé entra ao fim de 2 sessões (3 x 20 a 30 s por lado, perto de um apoio). Dose e quantidade de sessões estão de acordo com a sua prática?",
    "Osteoporose pede evitar flexão de coluna sob carga: confira que nenhum exercício da semana a exige e que o estímulo resistido continua progressivo.",
    "Em casa e sem ir ao chão, cada padrão precisou de opção com elástico ou peso do corpo: os exercícios escolhidos são os que você usaria?",
  ],
  4: [
    "Nenhum exercício deitado entrou na semana; a posição foi para o fim da fila. Confira a lista de evitados.",
    "O assoalho pélvico entra em toda sessão como contração sustentada (3 x 8 a 12 contrações de 5 a 8 s). A dose é convenção de prática: você a aprova ou prefere outra?",
    "O isométrico NÃO entra por conta própria (evidência medida em hipertensos, não em gestantes). Concorda com o veto automático?",
    "Esforço percebido até 6 de 10 e teto de complexidade 55. É o limite que você daria?",
  ],
  5: [
    "Baixa tolerância ao impacto vinda do pós-parto: a caminhada foi mantida como base aeróbia. É a modalidade certa ou você preferiria bicicleta?",
    "O assoalho pélvico entra nas 3 sessões. Confira o texto que o aluno lê no bloco (observação) e se a orientação de praticar fora do treino deveria estar no plano.",
    "A prancha alta entra no solo (o pós-parto não proíbe o chão). Você manteria ou preferiria a versão no banco nas primeiras semanas?",
  ],
  6: [
    "Este era o aluno que saía SEM nenhuma dobradiça de quadril e, com a dor no joelho, SEM agachar. Agora tem elevação de quadril no banco, dobradiça em pé e sentar e levantar. Os exercícios são os que você usaria com ele?",
    "Sentar e levantar entrou mesmo rebaixado pela dor no joelho (demanda 40 de 100), porque era o único dominante de joelho executável. Concorda que rebaixado é diferente de excluído?",
    "A rampa parte do piso da faixa e a descarga vem a cada 3 semanas. Confira as 12 semanas na tabela de progressão.",
    "O isométrico entra em 2 sessões como PREVENÇÃO (risco cardiometabólico), com dose menor que a de tratamento. Aprova a lógica das duas portas?",
  ],
  7: [
    "Semana 1 abre com 3 x 5 e reserva 4, e só chega a 5 x 3 com reserva 2 na semana 10. Para um avançado de força, a rampa começa leve demais?",
    "O isométrico máximo para tendão (leg press, 5 a 7 x 3 s) entra em 2 sessões por ser Força em nível avançado. Aprova essa porta de desempenho?",
    "Intervalo alvo de 200 s (faixa de 2 a 5 min). É o que você prescreveria em força máxima?",
    "Três exercícios entraram fora do objetivo (rosca, equilíbrio em um pé, dorsiflexão) para cobrir famílias. Faz sentido num plano de força ou você os trocaria?",
  ],
  8: [
    "A dor lombar declarada rebaixa exercícios de alta demanda lombar. Confira que o que entrou tem demanda baixa e que o tronco aparece toda semana.",
    "Resistência muscular: 2 x 15 com carga de 40 a 50% de 1RM e reserva 4 a 5. A carga relativa sobe 2 pontos por semana. É o passo que você daria?",
    "A prancha alta e o dead bug entraram no chão: para dor lombar inespecífica você manteria?",
  ],
  9: [
    "Com piscina declarada, o aeróbio trocou de caminhada para hidroginástica por indicação da osteoartrite. Aprova a troca automática?",
    "A força ficou em exercícios de baixa demanda de joelho (sentar e levantar, mesa flexora, agachamento com elástico). É a seleção que você faria?",
    "Obesidade grau 1 soma com a osteoartrite: baixa tolerância ao impacto e dificuldade para ajoelhar. Confira a lista de evitados.",
  ],
  10: [
    "Apenas 2 sessões por semana e o objetivo é técnica: cada sessão tem 4 exercícios e a semana cobre os cinco padrões sem trabalho miúdo. Confere?",
    "A semana 1 abre com 3 séries e a semana 2 cai para 2: isso vem da fase 1 da jornada declarar volume em queda. É intencional?",
    "Pré-diabetes coloca o isométrico como prevenção, mas ele não entrou porque a jornada de retorno tem o isométrico fora do horizonte de 2 sessões. Confira se deveria entrar.",
  ],
  11: [
    "Cinco sessões com aeróbio de 20 min em cada uma e 3 exercícios de força: é o desenho de emagrecimento que você aprova para uma intermediária?",
    "A cota de perna deu 5 de 14 vagas dinâmicas (36%). Na tela do Filipe a versão antiga mostrava 64%. Está na proporção certa agora?",
    "Sem condição, o plano não tem isométrico nem equilíbrio. A rosca, a caminhada do fazendeiro e a elevação lateral entraram para cobrir famílias que o emagrecimento não marca.",
  ],
  12: [
    "Força com 68 anos: a idade impõe reserva mínima 3 e a faixa de força para iniciante é 8 a 12 repetições em intensidade alta. A semana 1 sai com 4 x 12 e reserva 4. É força ou virou hipertrofia?",
    "A semana 1 tem 4 séries e a semana 2 cai para 3 (fase de entrada com volume em queda). Confira se a jornada da sarcopenia está desenhada como você quer.",
    "O esforço percebido fica limitado a 7 de 10 e a descarga vem a cada 4 semanas. Aprova?",
  ],
};

const ATENCAO = [
  "**Fase de entrada com volume em queda.** Nas jornadas de sarcopenia e de retorno à inatividade, a fase 1 declara tendência de volume \"reduz\". Com a rampa partindo do piso, a semana 1 abre com mais séries que a semana 2 (cenários 10 e 12: 3 x 10 caindo para 2 x 10; 4 x 12 caindo para 3 x 12). O motor está obedecendo à jornada; a pergunta é se a jornada está certa. Decisão sua: fase 1 deveria ser \"estável\" ou \"sobe\"?",
  "**Força em avançado começa longe da falha.** O cenário 7 abre com 3 x 5 e reserva 4 e só alcança reserva 2 na semana 10. A faixa de força cita 1 a 3 de reserva; o alvo da semana 1 nasce na ponta conservadora. Você aprova essa rampa para quem treina há 6 anos?",
  "**Intervalo sem alvo numérico nos objetivos Retorno ao treino e Aprendizado técnico.** A faixa existe (60 a 120 s) mas o motor não deriva um alvo por semana como faz nos outros objetivos; a tela mostra a faixa. Vale definir se deve derivar.",
  "**Padrão rebaixado virava excluído (corrigido em 09/09/2026).** Obesidade grau 3 com dor no joelho e só peso do corpo saía sem nenhum exercício de agachar, porque a cobertura só olhava exercícios sem rebaixamento. Agora o menos rebaixado entra quando não há alternativa limpa. Confira no cenário 6.",
  "**Equilíbrio em um pé contava como \"Corpo todo\" no Equilíbrio da semana (corrigido em 09/09/2026).** A família Tornozelo e pé não estava no mapa de regiões da tela. Agora o bloco de equilíbrio sai numa linha própria, como o isométrico e o assoalho pélvico.",
  "**Aeróbio fora das sessões.** Nos planos de emagrecimento com hipertensão ou diabetes, o aeróbio dentro do plano fica entre 60 e 120 min por semana; a meta citada é 150 a 300. O plano declara a meta e deixa o restante como orientação sua. Decidir se o plano deve sugerir caminhada em dias sem treino.",
  "**Diabetes tipo 2 e intensidade do resistido.** A evidência da condição favorece resistido de intensidade mais alta, e hoje ela só aparece como \"sem teto de carga\"; a intensidade continua sendo a do objetivo. Decidir se a condição deve puxar a intensidade para cima.",
  "**Imagens dos sete exercícios novos** (elevação de quadril no banco, dobradiça em pé, extensão de quadril com apoio, elevação de joelhos sentado, prancha na parede, remada com toalha, contração do assoalho pélvico) ainda não existem; a tela mostra o boneco muscular no lugar.",
];

/* ------------------------------- parte 1 ------------------------------- */
const corpo = [];

corpo.push(
  new Paragraph({ children: [new TextRun({ text: "MAPA DA PRESCRIÇÃO", bold: true, size: 18, color: SUAVE, characterSpacing: 40 })], spacing: { after: 120 } }),
  new Paragraph({ children: [new TextRun({ text: "Cenários de validação do motor", bold: true, size: 44, color: TINTA })], spacing: { after: 160 } }),
  P("Doze alunos inventados, doze planos **gerados de verdade pelo motor**, com cada regra, cada número e o porquê. Serve para você validar, cenário a cenário, se o sistema prescreve o que você prescreveria.", { run: { size: 22, color: SUAVE }, after: 200 }),
  P(`Gerado em ${new Date(D.geradoEm).toLocaleDateString("pt-BR")} a partir do código em produção. Nenhum número deste documento foi digitado à mão: tudo saiu do gerador de planos, das regras por condição e das faixas citadas.`, { run: { size: 20 } }),
  H2("Como ler"),
  LI("**Parte 1** explica como o motor decide, com os números que ele usa (faixas, cota de perna, dose por idade, descarga, camadas por indicação) e a tabela das 23 regras por condição."),
  LI("**Parte 2** traz os 12 cenários. Cada um tem: o aluno como entraria no sistema, o que o motor considerou, a primeira semana completa (exercício a exercício, com faixa e alvo), o equilíbrio da semana como a tela mede, a progressão das 8 ou 12 semanas, os exercícios evitados e por quê, o raciocínio que o plano imprime, a bibliografia, e uma lista do que conferir."),
  LI("**Parte 3** lista os pontos de atenção que a própria geração destes cenários revelou, com as decisões que são suas."),
  P("Ao validar, marque cada item de \"O que conferir\" com aprovado, ajustar ou reprovar, e anote a regra que você mudaria. O texto do raciocínio é o mesmo que vai ao PDF do plano e ao aluno.", { run: { size: 20, color: SUAVE } }),
);

corpo.push(quebra(), H1("Parte 1. Como o motor decide"));

corpo.push(
  H2("1.1 O que entra"),
  P("O plano nasce de: **objetivo** (um dos seis abaixo), **nível** (iniciante, intermediário, avançado), **frequência** semanal, **duração** em semanas, **idade**, **condição principal** (dá o esqueleto de fases da jornada) e **condições de atenção** (as demais, fundidas pela regra mais conservadora), **restrições físicas** declaradas no perfil (somam com as que a condição impõe) e **equipamentos** do local (exercício cujo equipamento o aluno não tem nunca entra; peso do corpo está sempre disponível)."),
  H2("1.2 Faixas de dose por objetivo"),
  P("A faixa é a diretriz citada; o alvo de cada semana é um ponto dentro dela, nunca fora. Repetições e intensidade podem variar por nível."),
  tabela([1500, 900, 2000, 2100, 1100, 2038],
    [["Objetivo", "Séries", "Repetições", "Intensidade", "Intervalo", "Frequência sugerida"],
      ...D.faixas.map((f) => [f.objetivo, f.series, typeof f.reps === "string" ? f.reps : Object.entries(f.reps).map(([n, v]) => `${n}: ${v}`).join("\n"), typeof f.intensidade === "string" ? f.intensidade : Object.entries(f.intensidade).map(([n, v]) => `${n}: ${v}`).join("\n"), f.intervalo, Object.entries(f.frequencia).map(([n, v]) => `${n}: ${v}`).join("\n")])],
    { size: 16 }),
  espaco(),
  P("**Ênfases da semana ondulatória** (só onde a variação diária faz sentido):"),
  ...D.faixas.filter((f) => f.enfases).map((f) => LI(`**${f.objetivo}**: ${f.enfases.map((e) => `${e.rotulo} (${e.reps} repetições, ${e.intensidade})`).join("; ")}.`)),
  P("**Aeróbio**: no Emagrecimento ele é a BASE de toda sessão (20 a 40 min, moderado, progride por semana). Nos outros objetivos entra como complemento em 1 sessão por semana, com dose menor:"),
  ...D.faixas.filter((f) => f.complemento).map((f) => LI(`**${f.objetivo}**: ${f.complemento.duracao}, ${f.complemento.intensidade}, ${f.complemento.sessoesPorSemana} sessão por semana.`)),
  P("Bandas de intensidade aeróbia que uma condição pode impor como teto:"),
  ...D.bandas.map((b) => LI(`**${b.banda}**: ${b.intensidade}`)),
);

corpo.push(
  H2("1.3 Modelos de periodização"),
  tabela([2200, 7438], [["Modelo", "O que é"], ...D.modelos.map((m) => [m.nome, m.resumo])], { size: 17 }),
  espaco(),
  P("O motor sugere o modelo pelo objetivo, nível e condição, e oferece uma alternativa. A linear é o padrão para iniciantes e para toda jornada clínica; a ondulatória para força e hipertrofia em quem já treina. A descarga fecha um bloco a cada **4 semanas** por padrão; a condição pode encurtar (obesidade grau 3 e hipertensão estágio 2 pedem a cada 3)."),
);

corpo.push(
  H2("1.4 Como os exercícios são escolhidos"),
  LI("**Pool**: os exercícios do objetivo, no nível e com o equipamento declarado. Se uma família muscular tem menos de 3 candidatos ou um padrão essencial tem menos de 6, o catálogo do nível completa (esses entram declarados como \"fora do objetivo\")."),
  LI("**Ordem de mérito**: segurança primeiro (as restrições do aluno excluem, penalizam ou preferem cada exercício), depois o peso da condição (penalidades por métrica, teto de complexidade técnica, posição a evitar, flexão de coluna sob carga, membros acima do coração), depois o objetivo primário, o secundário e a ordem do catálogo."),
  LI("**Excluído nunca entra. Rebaixado vai para o fim da fila** e só entra quando o padrão não tem alternativa limpa."),
  LI("**Cobertura**: antes de qualquer corte, um exercício por **padrão de movimento essencial** (dominante de joelho, dominante de quadril, empurrar, puxar, tronco) e um por família muscular, escolhendo entre empurrar e puxar o que está em falta."),
  LI("**Rodízio por padrão** para as vagas restantes; trabalho miúdo (punho, pescoço, tibial) fica por último e nunca ocupa vaga em semana de até 3 sessões."),
  LI("**Padrão vem do músculo primário** do exercício (dado validado do catálogo), não do rótulo da família: o terra é \"Corpo todo\" e conta como dominante de quadril; a rosca é puxar; o serrátil é acessório de ombro e não conta como empurrar."),
  H2("1.5 Como a semana é montada"),
  LI(`**Cota de perna semanal**: cerca de **38%** das vagas dinâmicas da semana (arredondado para baixo), com **pelo menos uma perna por sessão** e **nunca mais da metade de uma sessão**. Sessões isométricas de perna descontam metade da contagem a partir de 3 sessões por semana. Nasceu do plano que mostrou 64% de inferiores na tela.`),
  LI("**Vagas por sessão**: 4 exercícios de força (3 no Emagrecimento, que tem o aeróbio como base)."),
  LI("**Tronco superior**: a vaga de tronco procura equilibrar empurrar e puxar (razão máxima 3 para 1 na semana)."),
  LI("**Nenhuma sessão idêntica a outra** na mesma semana."),
  LI("**Sustentados saem por tempo**: prancha, equilíbrio e assoalho pélvico nascem com séries x segundos (a dose do próprio exercício), nunca em repetições."),
  H2("1.6 Como a dose muda semana a semana"),
  LI("Cada semana recebe um **alvo concreto** (séries, repetições, reserva, intervalo, carga relativa quando a faixa é em %1RM) dentro da faixa do objetivo. A direção vem da tendência do bloco (volume e intensidade sobem, ficam estáveis ou reduzem)."),
  LI("**Perfil clínico** pode impor: reserva mínima (RIR), teto de carga em %1RM, intervalo lendo a metade folgada da faixa, rampa partindo do piso da faixa, esforço percebido máximo, passo de progressão menor, descarga mais frequente."),
  LI(`**Idade**: a partir de ${D.constantes.IDADE_DOSE_PROPRIA} anos, reserva mínima de ${D.constantes.RIR_MINIMO_IDADE} repetições nas séries principais (metanálise de 25 ensaios: maior ganho de força com 70 a 79% de 1RM, moderada a alta e não máxima).`),
  LI("Quando duas condições pedem coisas diferentes, **vale a mais conservadora**, e o plano registra quem impôs cada número e quem perdeu a disputa (seção de procedência na tela)."),
  H2("1.7 Camadas por indicação da condição"),
  LI("**Isométrico** tem três portas, com dose própria: tratamento da hipertensão (agachamento na parede, 4 x 2 min, 3 sessões próprias por semana); prevenção por risco cardiometabólico (2 sessões); tendão e força rápida em Força avançado (leg press, 5 a 7 x 3 s, 2 sessões). Gestante veta a porta automática. Quem não casa com nenhuma porta não recebe."),
  LI("**Equilíbrio** (idoso destreinado, osteoporose): equilíbrio em um pé, 3 x 20 a 30 s por lado, ao fim de 2 sessões por semana, perto de um apoio."),
  LI("**Assoalho pélvico** (gestante, pós-parto): contração sustentada sentada, 3 x 8 a 12 contrações de 5 a 8 s, ao fim de TODAS as sessões de força."),
  LI("Bloco por indicação **não passa pela fila de mérito** (a restrição de segurança pode estar penalizando justamente o estímulo terapêutico) e **não conta no Equilíbrio da semana** (dose própria, não distribuição de volume)."),
);

corpo.push(
  H2("1.8 As 23 regras por condição"),
  P("Direto do código, sem edição. Célula vazia significa que a condição não impõe aquele item. Reserva e teto são os da condição sozinha (a idade soma depois).", { run: { size: 20, color: SUAVE } }),
  H3("Dose e progressão"),
  tabela([2100, 900, 900, 900, 900, 900, 1000, 2038],
    [["Condição", "Reserva mín.", "Teto %1RM", "Intervalo folgado", "Parte do piso", "PSE teto", "Passo", "Descarga a cada"],
      ...D.regras.map((r) => [r.nome, ou(r.rirMinimo, ""), ou(r.cargaRelativaMax, ""), r.intervaloFolgado ? "sim" : "", r.partirDoPiso ? "sim" : "", ou(r.pseTeto, ""), r.fatorIncremento != null ? `x${r.fatorIncremento}` : "", r.descargaCadaSemanas ? `${r.descargaCadaSemanas} sem` : ""])],
    { size: 15 }),
  espaco(),
  H3("Seleção de exercícios"),
  tabela([2100, 900, 1500, 2300, 2838],
    [["Condição", "Complex. máx.", "Evita", "Restrições estruturais", "Penalidades por métrica"],
      ...D.regras.map((r) => [r.nome, ou(r.complexidadeMax, ""), [r.posicoesEvitar?.length ? `posição ${r.posicoesEvitar.join("/")}` : "", r.flexao ? "flexão de coluna carregada" : "", r.coracao ? "membros acima do coração" : ""].filter(Boolean).join("\n"), r.restricoes.join("\n"), r.penalidades.join("\n")])],
    { size: 15 }),
  espaco(),
  H3("Aeróbio e camadas por indicação: o que o MOTOR aplica"),
  P("Esta tabela é o que o gerador impõe sozinho. Célula vazia significa que o motor não impõe nada naquele item, e não que não haja orientação: a orientação está na tabela seguinte.", { run: { size: 20, color: SUAVE } }),
  tabela([2100, 1100, 1100, 1900, 1100, 1000, 1338],
    [["Condição", "Banda máx.", "Intervalado", "Modalidade preferida", "Isométrico", "Equilíbrio", "Assoalho pélvico"],
      ...D.regras.map((r) => [r.nome, ou(r.bandaMax, ""), ou(r.intervalado, ""), ou(r.modalidades, ""), ou(r.isometrico, ""), r.equilibrio ? "sim" : "", r.assoalho ? "sim" : ""])],
    { size: 15 }),
  espaco(),
  H3("Orientação clínica por condição"),
  P("Revisão do Filipe, 09/09/2026. Esta tabela NÃO é executada pelo motor: ela é a leitura clínica que acompanha o plano, e é ela que responde pelos itens que dependem de avaliação do aluno (\"se houver disfunção\", \"conforme os sintomas\"). Duas células desta revisão mudaram o código, e estão marcadas no fim da seção.", { run: { size: 20, color: SUAVE } }),
  tabela([1700, 1500, 1500, 1400, 1100, 1100, 1338],
    [["Condição", "Prioridade", "Aeróbio", "Resistido", "Intervalado", "Isométrico", "Equilíbrio"],
      ...D.regras.map((r) => [r.nome, ou(r.revisao?.prioridade, ""), ou(r.revisao?.aerobio, ""), ou(r.revisao?.resistido, ""), ou(r.revisao?.intervalado, ""), ou(r.revisao?.isometrico, ""), ou(r.revisao?.equilibrio, "")])],
    { size: 15 }),
  espaco(),
  tabela([1700, 2600, 5338],
    [["Condição", "Modalidade preferida", "Assoalho pélvico e cautela específica"],
      ...D.regras.map((r) => [r.nome, ou(r.revisao?.modalidades, ""), [r.revisao?.assoalho ? `Assoalho pélvico: ${r.revisao.assoalho}` : "", r.revisao?.cautela ?? ""].filter(Boolean).join("\n")])],
    { size: 15 }),
  espaco(),
  LI("**O que esta revisão mudou no motor.** A gestante declarava veto ao exercício isométrico, e o veto de uma condição cancela a indicação de todas as outras: uma gestante com hipertensão perdia o protocolo que a evidência da hipertensão sustenta. O veto saiu, porque \"não existe veto geral a isométricos\"; o que se evita passou para os cuidados exibidos (esforço máximo prolongado, manobra de Valsalva e situações obstétricas de risco). A gestante sozinha continua sem receber o protocolo, porque ela não casa com nenhuma das três portas da camada."),
  LI("**Segunda mudança.** Ansiedade e sintomas depressivos declaravam o formato intervalado como INDICADO, deduzido de um achado sobre intensidade. Intensidade e formato são coisas diferentes, e a revisão diz \"opcional\": o campo saiu e o formato voltou a ser contínuo. O teto de banda vigorosa ficou, porque teto não é obrigação."),
);

/* ------------------------------- parte 2 ------------------------------- */
corpo.push(quebra(), H1("Parte 2. Os cenários"));

for (const c of D.cenarios) {
  if (c.n > 1) corpo.push(quebra());
  corpo.push(H1(`Cenário ${c.n}. ${c.nome}`), P(c.perfil), P(`**Por que este cenário:** ${c.porQueEsteCenario}`, { run: { color: SUAVE } }));

  corpo.push(H2("Como o aluno entra no sistema"));
  const i = c.input;
  corpo.push(tabela([2600, 7038], [
    ["Campo", "Valor"],
    ["Objetivo", `${i.objetivo}${i.objetivoSecundario ? ` (secundário: ${i.objetivoSecundario})` : ""}`],
    ["Nível", i.nivel],
    ["Frequência", `${i.frequencia} sessões por semana`],
    ["Duração", `${i.semanas} semanas`],
    ["Idade", `${i.idade} anos`],
    ["Condição principal", c.condicoes[0] ? `${c.condicoes[0].nome} (no plano: ${c.condicoes[0].rotuloAluno ?? c.condicoes[0].nome})` : "nenhuma"],
    ["Condições de atenção", c.condicoes.slice(1).length ? c.condicoes.slice(1).map((x) => x.nome).join(", ") : "nenhuma"],
    ["Restrições declaradas", ou(i.restricoes, "nenhuma")],
    ["Equipamentos", ou(i.equipamentos, "todos")],
  ], { cabecalho: true, primeiraForte: true }));

  corpo.push(H2("O que o motor considerou"));
  const r = c.regra;
  const d = c.dose;
  const linhas = [["Regra", "Valor aplicado", "De onde vem"]];
  if (!r && !d) linhas.push(["Nenhuma regra clínica", "plano só por objetivo, nível e frequência", "sem condição declarada"]);
  if (d?.rirMinimo != null) linhas.push(["Reserva mínima (RIR)", `${d.rirMinimo} repetições`, d.procedencia?.rirMinimo ? `${nomeDe(d.procedencia.rirMinimo.de)}${d.procedencia.rirMinimo.preteridos?.length ? ` (preteridos: ${d.procedencia.rirMinimo.preteridos.map((p) => `${nomeDe(p.de)} pedia ${p.valorPedido}`).join("; ")})` : ""}` : nomeDe(d.de) || "idade"]);
  if (d?.cargaRelativaMax != null) linhas.push(["Teto de carga", `${d.cargaRelativaMax}% de 1RM`, d.procedencia?.cargaRelativaMax ? `${nomeDe(d.procedencia.cargaRelativaMax.de)}${d.procedencia.cargaRelativaMax.preteridos?.length ? ` (preteridos: ${d.procedencia.cargaRelativaMax.preteridos.map((p) => `${nomeDe(p.de)} pedia ${p.valorPedido}`).join("; ")})` : ""}` : nomeDe(d.de) || "idade"]);
  if (d?.intervaloFolgado) linhas.push(["Intervalo", "lê a metade folgada da faixa", nomeDe(d.de) || "perfil"]);
  if (d?.partirDoPiso) linhas.push(["Rampa", "parte do piso da faixa citada", nomeDe(d.de) || "perfil"]);
  if (r?.modProgressao?.pseTeto != null) linhas.push(["Esforço percebido máximo", `${r.modProgressao.pseTeto} de 10`, r.modProgressao.motivo]);
  if (r?.modProgressao?.fatorIncremento != null) linhas.push(["Passo de progressão", `x${r.modProgressao.fatorIncremento} do passo padrão`, "regra fundida"]);
  if (r?.modProgressao?.descargaCadaSemanas) linhas.push(["Descarga", `a cada ${r.modProgressao.descargaCadaSemanas} semanas`, "regra fundida (padrão: 4)"]);
  if (r?.complexidadeMax != null) linhas.push(["Teto de complexidade técnica", `${r.complexidadeMax} de 100`, "acima disso o exercício vai para o fim da fila"]);
  if (r?.penalidades?.length) linhas.push(["Penalidades por métrica", r.penalidades.map((p) => `${p.metrica} a partir de ${p.limite}`).join("\n"), r.penalidades.map((p) => p.motivo).join("\n")]);
  if (r?.posicoesEvitar?.length) linhas.push(["Posição evitada", r.posicoesEvitar.join(", "), "rebaixamento forte, não exclusão"]);
  if (r?.evitarFlexaoColunaCarregada) linhas.push(["Flexão de coluna sob carga", "evitada", "rebaixamento forte"]);
  if (r?.evitarMembrosAcimaDoCoracao) linhas.push(["Membros acima do coração", "prefere alternativa", "rebaixamento leve, nomeia a alternativa"]);
  if (c.restricoesDoPlano.length) linhas.push(["Restrições que filtraram o catálogo", c.restricoesDoPlano.join("\n"), "as declaradas no perfil mais as estruturais da condição"]);
  if (r?.modAerobio) linhas.push(["Aeróbio", [r.modAerobio.bandaMax ? `banda máxima ${r.modAerobio.bandaMax}` : "", r.modAerobio.intervaladoIndicado ? "intervalado indicado" : "", r.modAerobio.intervaladoEvitar ? "sem intervalado" : "", r.modAerobio.modalidadesPreferidas?.length ? `prefere ${r.modAerobio.modalidadesPreferidas.join(", ")}` : ""].filter(Boolean).join("\n") || "sem restrição de formato", r.modAerobio.motivo]);
  if (r?.isometrico) linhas.push(["Isométrico", r.isometrico.evitar ? "VETADO pela condição" : r.isometrico.indicado ? "indicado (tratamento)" : r.isometrico.prevencao ? "indicado (prevenção)" : "sem indicação", r.isometrico.motivo]);
  if (r?.equilibrio) linhas.push(["Equilíbrio", "indicado: 2 sessões, 3 x 20 a 30 s por lado", r.equilibrio.motivo]);
  if (r?.assoalhoPelvico) linhas.push(["Assoalho pélvico", "indicado: todas as sessões de força", r.assoalhoPelvico.motivo]);
  if (r?.horizonteMinimoSemanas) linhas.push(["Horizonte mínimo da evidência", `${r.horizonteMinimoSemanas} semanas`, i.semanas < r.horizonteMinimoSemanas ? "o plano é mais curto e avisa" : "o plano cobre"]);
  if (i.idade >= D.constantes.IDADE_DOSE_PROPRIA) linhas.push(["Dose por idade", `reserva mínima ${D.constantes.RIR_MINIMO_IDADE} a partir de ${D.constantes.IDADE_DOSE_PROPRIA} anos`, "funde com a condição pela mais conservadora"]);
  if (i.equipamentos?.length) linhas.push(["Equipamento", `só ${i.equipamentos.join(", ")}`, "exclusão, não rebaixamento"]);
  corpo.push(tabela([2400, 3000, 4238], linhas, { primeiraForte: true, size: 17 }));
  if (r?.cuidados?.length) {
    corpo.push(H3("Cuidados que a condição declara (exibidos no plano)"));
    for (const cu of r.cuidados) corpo.push(LI(cu));
  }

  corpo.push(H2("Faixa do objetivo e modelo"));
  corpo.push(tabela([2600, 7038], [
    ["Item", "Valor"],
    ["Título do plano", c.titulo],
    ["Modelo principal", `${c.modelo.principal}: ${c.modelo.resumo}`],
    ["Alternativa oferecida", ou(c.modelo.alternativa, "nenhuma")],
    ["Faixa de séries", c.faixa.series],
    ["Faixa de repetições", c.faixa.reps],
    ["Intensidade", c.faixa.intensidade],
    ["Intervalo", c.faixa.intervalo],
    ["Frequência sugerida para o nível", c.faixa.frequencia],
    ["Ressalva da faixa", c.faixa.ressalva],
  ], { primeiraForte: true, size: 17 }));

  corpo.push(H3("Blocos do macrociclo"));
  corpo.push(tabela([1100, 3200, 3900, 1438],
    [["Semanas", "Bloco", "Foco", "Tendências"], ...c.mesociclos.map((m) => [m.semanas, m.nome, m.foco, `volume ${m.volume}\nintensidade ${m.intensidade}\ncomplexidade ${m.complexidade}`])], { size: 16 }));

  corpo.push(H2("Semana 1, exercício a exercício"));
  for (const s of c.semana1) {
    corpo.push(H3(`${s.nome}${s.foco ? ` (${s.foco})` : ""}${s.complemento ? " · sessão complementar, mesmo dia de uma principal" : ""}`));
    const linhasS = [["Bloco", "Padrão · região", "Faixa do objetivo", "Alvo da semana 1", "Nota do bloco"]];
    for (const b of s.blocos) {
      if (b.tipo === "aerobio") linhasS.push([`${b.nome}\n(aeróbio)`, "aeróbio", `${b.formato ?? ""}\n${b.duracao ?? ""}`, `${b.duracaoAlvoMin != null ? `${b.duracaoAlvoMin} min` : ""}\n${b.intensidade ?? ""}${b.tiros ? `\n${b.tiros}` : ""}`, (b.observacao ?? "").slice(0, 220)]);
      else if (b.tipo === "isometrico") linhasS.push([`${b.nome}\n(${b.assoalho ? "assoalho pélvico, por indicação" : b.equilibrio ? "equilíbrio, por indicação" : b.sustentado ? "sustentado, dose por tempo" : "protocolo isométrico de condição"})`, `${rp(b.padrao)}${b.regiao ? ` · ${b.regiao}` : ""}`, "dose do próprio exercício", `${b.series} x ${b.duracao}${b.intervalo ? `\ndescanso ${b.intervalo}` : ""}${b.intensidade ? `\n${b.intensidade}` : ""}`, (b.observacao ?? "").slice(0, 220)]);
      else linhasS.push([b.nome, `${rp(b.padrao)}${b.regiao ? ` · ${b.regiao}` : ""}`, `${b.series} séries\n${b.reps} repetições\n${b.intensidade}\n${b.intervalo}`, `${b.seriesAlvo ?? "?"} x ${b.repsAlvo ?? "?"}${b.rirAlvo != null ? `\nreserva ${b.rirAlvo}` : ""}${b.cargaRelativaAlvo != null ? `\n${b.cargaRelativaAlvo}% de 1RM` : ""}${b.intervaloAlvoSeg != null ? `\nintervalo ${seg(b.intervaloAlvoSeg)}` : "\nintervalo: faixa"}${b.metodo ? `\n${b.metodo}` : ""}`, (b.observacao ?? "").slice(0, 220)]);
    }
    corpo.push(tabela([2300, 1500, 1900, 1900, 2038], linhasS, { size: 15 }));
    if (s.fecho) corpo.push(NOTA(`Fecho: ${s.fecho.slice(0, 200)}`));
  }

  corpo.push(H2("Equilíbrio da semana (como a tela mede)"));
  const eq = c.equilibrio;
  corpo.push(tabela([3000, 2000, 2000, 2638], [["Região", "Séries", "% das séries", "Leitura"], ...eq.linhas.map((l) => [l.regiao, String(l.n), pct(l.pct), l.regiao === "Superiores" && l.pct >= 75 ? "concentrado (corte 75)" : l.regiao !== "Superiores" && l.pct >= 60 ? "concentrado (corte 60)" : "dentro do esperado"])], { size: 17 }));
  corpo.push(NOTA(`Percentual sobre as ${eq.series} séries de força da semana (força dinâmica mais sustentados). Fora desta conta: aeróbio ${eq.minutosAerobio} min; isométrico de condição em ${eq.sessoesIso} sessão(ões); equilíbrio por indicação em ${eq.sessoesEquilibrio ?? 0}; assoalho pélvico em ${eq.sessoesAssoalho}. Cortes de concentração da tela: Superiores 75%, as demais 60%.`));
  corpo.push(P(`**Padrões cobertos na semana:** ${c.padroes.cobertos.map(rp).join(", ")}${c.padroes.faltando.length ? `. **Faltou:** ${c.padroes.faltando.map(rp).join(", ")}` : ""}. **Perna:** ${c.padroes.perna} das ${c.padroes.dinamicos} vagas dinâmicas (${c.padroes.pct}%), pela cota semanal de cerca de 38%.`));

  corpo.push(H2(`Progressão das ${i.semanas} semanas`));
  corpo.push(NOTA("Alvo do primeiro exercício de força de cada semana (os demais seguem a mesma direção) e do aeróbio. Volume agregado = soma de séries x repetições da semana; esforço médio em 0 a 100."));
  corpo.push(tabela([700, 1900, 1000, 2500, 1100, 1100, 1338],
    [["Sem.", "Bloco", "Tipo", "Primeiro exercício: alvo", "Aeróbio", "Volume", "Esforço"],
      ...c.progressao.map((p) => [String(p.semana), p.meso.replace(/^Fase (\d+):.*/, "Fase $1").slice(0, 26), p.tipo === "deload" ? "descarga" : p.tipo, p.primeiroForca ? `${p.primeiroForca.seriesAlvo} x ${p.primeiroForca.repsAlvo}${p.primeiroForca.rirAlvo != null ? `, reserva ${p.primeiroForca.rirAlvo}` : ""}${p.primeiroForca.cargaRelativaAlvo != null ? `, ${Math.round(p.primeiroForca.cargaRelativaAlvo * 10) / 10}% 1RM` : ""}${p.primeiroForca.intervaloAlvoSeg != null ? `, ${seg(p.primeiroForca.intervaloAlvoSeg)}` : ""}` : "", p.aerobio?.duracaoAlvoMin != null ? `${p.aerobio.duracaoAlvoMin} min` : "", String(p.agregado?.volume ?? ""), p.agregado?.intensidade != null ? String(Math.round(p.agregado.intensidade)) : ""])],
    { size: 15, fillLinha: (l, k) => (k > 0 && l[2] === "descarga" ? DESTAQUE : undefined) }));
  const objetivos = [...new Set(c.progressao.map((p) => p.objetivo).filter(Boolean))];
  if (objetivos.length) corpo.push(NOTA(`Objetivos de semana que o plano declara: ${objetivos.join(" | ")}`));

  corpo.push(H2("Exercícios evitados e por quê"));
  if (c.consequencias.evitados.length) corpo.push(tabela([3200, 6438], [["Exercício", "Motivo"], ...c.consequencias.evitados.map((e) => [e.nome, e.motivo])], { size: 16 }));
  else corpo.push(P("Nenhum exercício foi evitado por condição ou restrição."));
  if (c.consequencias.totalEvitados > c.consequencias.evitados.length) corpo.push(NOTA(`Mostrando ${c.consequencias.evitados.length} de ${c.consequencias.totalEvitados}.`));
  if (c.consequencias.foraDoObjetivo.length) corpo.push(P(`**Entraram fora do objetivo** (para cobrir famílias ou padrões que o catálogo não marca para ele): ${c.consequencias.foraDoObjetivo.join(", ")}.${c.consequencias.faltouCatalogo ? " O catálogo não alcançava a frequência pedida." : ""}`));

  corpo.push(H2("O raciocínio que o plano imprime"));
  corpo.push(NOTA("Texto idêntico ao que vai ao PDF do plano e ao documento do aluno (por isso não nomeia a condição)."));
  for (const t of c.raciocinio) corpo.push(P(t.titulo ? `**${t.titulo}.** ${t.texto}` : t.texto, { run: { size: 19 }, after: 110 }));

  corpo.push(H2("Bibliografia do plano"));
  for (const ref of c.refs) corpo.push(LI(ref.titulo ? `${ref.autores} (${ref.ano}). ${ref.titulo}.` : `${ref.id} (sem entrada na bibliografia)`));

  corpo.push(H2("O que conferir neste cenário"));
  for (const q of CONFERIR[c.n] ?? []) corpo.push(CHECK(q));
}

/* ------------------------------- parte 3 ------------------------------- */
corpo.push(quebra(), H1("Parte 3. Pontos de atenção e decisões que são suas"));
corpo.push(P("Itens que a geração destes cenários deixou à vista. Os dois marcados como corrigidos já estão em produção; os demais dependem de decisão de conteúdo."));
for (const a of ATENCAO) corpo.push(LI(a));

/* ------------------------------- documento ------------------------------- */
const doc = new Document({
  creator: "Mapa da Prescrição",
  title: "Cenários de validação do motor",
  styles: {
    default: { document: { run: { font: "Calibri", size: 21, color: TINTA } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, color: TINTA }, paragraph: { spacing: { before: 420, after: 180 } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, color: TINTA }, paragraph: { spacing: { before: 280, after: 120 } } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 21, bold: true, color: SUAVE }, paragraph: { spacing: { before: 200, after: 90 } } },
    ],
  },
  numbering: {
    config: [
      { reference: "pontos", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 240 } } } }] },
      { reference: "confere", levels: [{ level: 0, format: LevelFormat.BULLET, text: "☐", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 260 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: convertMillimetersToTwip(20), bottom: convertMillimetersToTwip(18), left: convertMillimetersToTwip(20), right: convertMillimetersToTwip(20) } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Mapa da Prescrição · Cenários de validação do motor   ·   ", size: 16, color: SUAVE }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: SUAVE })] })] }) },
    children: corpo,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, buf);
  console.log(`OK ${saida} ${buf.length} bytes, ${D.cenarios.length} cenários`);
});
