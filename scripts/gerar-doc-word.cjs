/*
 * Gera a versão Word de docs/logica-da-prescricao.md, com layout autoral.
 *
 * Fora do `npm run check` e fora do package.json de propósito: é ferramenta de entrega
 * avulsa e não vale carregar a dependência do `docx` no build do produto. Para rodar:
 *
 *   npm i docx            (em qualquer pasta de trabalho, não neste repo)
 *   node scripts/gerar-doc-word.cjs "docs/A logica por tras da prescricao.docx"
 *
 * O PDF sai do próprio Word, por automação, e não deste script.
 *
 * O conteúdo aqui é transcrição do markdown. Mexeu num, mexa no outro.
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  LevelFormat, Footer, PageNumber, convertMillimetersToTwip,
} = require("docx");

const TINTA = "1F2933";
const SUAVE = "52606D";
const REGUA = "C9D2DB";
const FUNDO = "F1F4F7";
const LARGURA = 9638; // A4 com margens de 2 cm

/* ---- inline: **negrito** vira TextRun com bold ---- */
const runs = (texto, base = {}) =>
  texto.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((p) =>
    p.startsWith("**")
      ? new TextRun({ text: p.slice(2, -2), bold: true, ...base })
      : new TextRun({ text: p, ...base }));

const P = (texto, opt = {}) =>
  new Paragraph({
    children: runs(texto, opt.run || {}),
    spacing: { after: opt.after ?? 160, line: 276 },
    alignment: opt.alignment,
    ...(opt.extra || {}),
  });

const H1 = (texto) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: texto, bold: true, size: 30, color: TINTA })],
    spacing: { before: 420, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: REGUA, space: 6 } },
  });

const H2 = (texto) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: texto, bold: true, size: 24, color: TINTA })],
    spacing: { before: 300, after: 140 },
  });

const LI = (texto) =>
  new Paragraph({
    children: runs(texto),
    numbering: { reference: "pontos", level: 0 },
    spacing: { after: 110, line: 276 },
  });

/*
 * Cada lista numerada tem REFERENCE própria. Duas tentativas até acertar, e as duas
 * falhas só apareceram no PDF renderizado, nunca no código:
 *   1. uma reference só para as três listas: a da seção 6 começou em 6, herdando a da 2;
 *   2. mesma reference com `instance` diferente: continuou herdando.
 * Reference separada é o que de fato reinicia o contador.
 */
const NUM = (texto, lista) =>
  new Paragraph({
    children: runs(texto),
    numbering: { reference: "passos" + lista, level: 0 },
    spacing: { after: 110, line: 276 },
  });

/* ---- tabelas ---- */
const cel = (texto, largura, { cabecalho = false, forte = false } = {}) =>
  new TableCell({
    width: { size: largura, type: WidthType.DXA },
    shading: cabecalho ? { type: ShadingType.CLEAR, fill: FUNDO, color: "auto" } : undefined,
    margins: { top: 90, bottom: 90, left: 130, right: 130 },
    children: [new Paragraph({
      children: runs(texto, cabecalho || forte ? { bold: true } : {}),
      spacing: { after: 0, line: 264 },
    })],
  });

const tabela = (colunas, linhas, { cabecalho = false, primeiraForte = false } = {}) =>
  new Table({
    columnWidths: colunas,
    width: { size: colunas.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: REGUA },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: REGUA },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: REGUA },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
    },
    rows: linhas.map((linha, i) =>
      new TableRow({
        tableHeader: cabecalho && i === 0,
        children: linha.map((txt, j) =>
          cel(txt, colunas[j], {
            cabecalho: cabecalho && i === 0,
            forte: primeiraForte && j === 0 && !(cabecalho && i === 0),
          })),
      })),
  });

const espaco = (n = 200) => new Paragraph({ text: "", spacing: { after: n } });

/* ------------------------------- conteúdo ------------------------------- */

const corpo = [
  new Paragraph({
    children: [new TextRun({ text: "MAPA DA PRESCRIÇÃO", bold: true, size: 18, color: SUAVE, characterSpacing: 40 })],
    spacing: { after: 120 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "A lógica por trás da prescrição", bold: true, size: 44, color: TINTA })],
    spacing: { after: 160 },
  }),
  new Paragraph({
    children: runs(
      "Documento para o profissional de Educação Física. Explica **como o sistema decide**, em linguagem de treino, não de software.",
      { size: 22, color: SUAVE },
    ),
    spacing: { after: 100, line: 276 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Atualizado em 06 de agosto de 2026", size: 20, color: SUAVE })],
    spacing: { after: 260 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TINTA, space: 10 } },
  }),
  espaco(120),

  H1("1. O acervo, em números"),
  tabela([5600, 4038], [
    ["Referências no motor de prescrição", "**108**"],
    ["Com DOI", "94"],
    ["Com PMID", "46"],
    ["Sem identificador conferível", "12 (diretrizes, livros e clássicos anteriores ao DOI)"],
    ["Condições de saúde com regra própria", "23"],
    ["Referências distintas sustentando as regras clínicas", "47"],
    ["Média de referências por condição", "4,0 (mínimo 2, máximo 8)"],
  ], { primeiraForte: true }),
  espaco(200),
  P("Distribuição por época: 7 anteriores a 2000, 20 de 2000 a 2009, 16 de 2010 a 2014, 23 de 2015 a 2019 e **42 de 2020 em diante**. Quase 40% do acervo é da década atual."),
  P("Esses números não aparecem no site, por decisão do fundador, e a razão é boa: contagem exposta é contagem contestável, e o valor não está no tamanho do acervo e sim em cada recomendação ter fonte própria."),

  H1("2. A pergunta que o sistema responde"),
  P("Não é \"qual o melhor exercício\". É **\"o que muda no treino desta pessoa por causa do que ela tem\"**, e a resposta se monta em camadas que se aplicam nesta ordem:"),
  NUM("**O objetivo** define a faixa de trabalho (séries, repetições, intensidade, intervalo).", 0),
  NUM("**A condição de saúde** aperta ou desloca essa faixa, e escolhe ênfase de modalidade.", 0),
  NUM("**As restrições físicas** removem ou rebaixam exercícios incompatíveis.", 0),
  NUM("**Os fármacos** podem invalidar um instrumento de monitoramento.", 0),
  NUM("**O semáforo do dia** decide se a sessão acontece como planejada.", 0),
  espaco(80),
  P("Cada camada só aperta. Nenhuma delas afrouxa o que a anterior restringiu. Quando o aluno tem duas condições, vale sempre a regra mais conservadora entre elas."),

  H1("3. O que a condição de saúde muda, concretamente"),
  H2("3.1 A dose de força"),
  LI("**Reserva mínima de repetições.** Quantas repetições sobram no fim da série. Perfis com cautela cardiovascular recebem um piso, para a série não terminar no esforço máximo."),
  LI("**Teto de carga relativa**, onde a faixa do objetivo expressa percentual de 1RM."),
  LI("**Passo de progressão.** Quanto a dose sobe de semana para semana. Perfis de maior cautela progridem em passo menor."),
  LI("**Teto de complexidade técnica**, que rebaixa exercícios exigentes demais para o momento."),

  H2("3.2 A dose aeróbia"),
  P("Três bandas de intensidade, tiradas da tabela de classificação do posicionamento do ACSM:"),
  tabela([2600, 3400, 3638], [
    ["Banda", "Percentual da FCmáx", "Percepção de esforço (0 a 10)"],
    ["Leve", "57 a 63%", "3 a 4"],
    ["Moderada", "64 a 76%", "5 a 6"],
    ["Vigorosa", "77 a 95%", "7 a 8"],
  ], { cabecalho: true, primeiraForte: true }),
  espaco(200),
  P("A condição escolhe até qual banda o aluno pode ir, e quando há duas condições vale a mais contida. O formato, contínuo ou intervalado, também vem da condição, e o intervalado só aparece onde há evidência específica de benefício naquele perfil."),

  H2("3.3 A composição da sessão"),
  P("Aqui entra a **ênfase de modalidade**, que responde à pergunta \"nesta condição, o que pesa mais\". Ela só acrescenta e nunca subtrai: uma condição pode ganhar mais uma sessão aeróbia na semana, e jamais perder a parte de força. Ênfase que subtrai seria contraindicação disfarçada, e contraindicação passa pelo semáforo, não pela dose."),

  H2("3.4 O descanso e o horizonte"),
  LI("**Cadência de descarga.** Cada quantas semanas o aluno alivia. A condição pode encurtar esse intervalo, nunca alongar."),
  LI("**Horizonte mínimo.** Algumas condições só mostraram efeito em acompanhamentos acima de um certo tempo. O sistema não muda a duração que você escolheu; ele **avisa** no raciocínio quando o plano está abaixo do que a evidência daquela jornada mediu. Quem decide é você."),

  H1("4. O princípio que mais importa: onde o treino pesa muda por condição"),
  P("Esta é a descoberta mais útil da última revisão de evidência, e vale como conduta."),
  tabela([2900, 6738], [
    ["Condição", "O lugar do exercício"],
    ["**Pré-diabetes**", "**Protagonista.** O exercício foi mais eficaz que a metformina em hemoglobina glicada, glicemia de 2 horas e resistência à insulina."],
    ["**Diabetes tipo 2**", "**Divide.** A metformina supera o exercício nos mesmos desfechos, e a combinação dos dois supera cada um isolado."],
    ["**Esteatose hepática**", "**Não lidera.** Numa rede com 174 ensaios, os primeiros lugares são de medicamento. O treino é parte do cuidado, não o tratamento principal."],
  ], { cabecalho: true }),
  espaco(200),
  P("Saber onde você não é o protagonista é o que torna confiável a sua afirmação de onde você é."),

  H1("5. Onde uma modalidade realmente lidera, e onde nenhuma lidera"),
  P("Na maioria das condições, o ranking das modalidades **muda conforme o desfecho** e nenhuma vence em tudo. Isso desmonta a ideia de \"o melhor exercício para a condição X\". Nesses casos o sistema mantém o treino combinado e não elege vencedora."),
  P("As exceções, em que uma modalidade de fato lidera:"),
  LI("**Dislipidemia:** o aeróbio foi o único a mover os quatro marcadores lipídicos. O resistido move dois."),
  LI("**Hipertensão:** o aeróbio leve a moderado foi superior para a **sistólica** e o único a melhorar o conjunto de fatores de risco. Já o resistido de alta intensidade é um dos dois que reduzem a **diastólica**. Duas modalidades ganhando em desfechos diferentes."),
  LI("**Sarcopenia:** o resistido em primeiro para força de preensão e o único a reduzir massa gorda."),
  LI("**Diabetes tipo 2:** o resistido de **alta** intensidade em primeiro para hemoglobina glicada, e a única modalidade com redução significativa da sistólica."),
  LI("**Osteoporose:** resistido e impacto de alta intensidade, com carga acima de 85% de 1RM sob supervisão, aumentaram densidade óssea e função. O reflexo de aliviar a carga é o que a evidência contraria."),

  H1("6. Cinco coisas que a evidência corrigiu no próprio sistema"),
  P("Vale mais registrar o que mudou de ideia do que o que se confirmou."),
  NUM("**Dor lombar:** numa rede com 118 ensaios e 9.710 participantes, praticamente todo tipo de exercício melhorou dor e incapacidade, com duas exceções. **Alongamento não reduziu dor** e o método McKenzie não reduziu incapacidade. Alongar por causa de dor lombar é o reflexo mais comum do campo, e é o que a rede não sustenta.", 1),
  NUM("**Sarcopenia:** nenhuma intervenção mostrou vantagem significativa sobre o cuidado usual para índice de massa muscular. Força e composição melhoram; **ganho de massa é incerto** e saiu das promessas do sistema.", 1),
  NUM("**Ansiedade e sintomas depressivos:** o texto dizia que a constância vale mais que a intensidade. Uma revisão de 97 revisões e 128 mil participantes mostra o contrário: **intensidade maior associou-se a melhora maior**, e o efeito diminui em intervenções longas.", 1),
  NUM("**Idoso destreinado:** para prevenir queda, a ênfase que mais aumenta a eficácia é **equilíbrio e treino funcional**, não força isolada.", 1),
  NUM("**Apneia do sono:** o índice de apneia caiu **sem mudança de peso**, e o combinado reduziu mais que o aeróbio isolado. Condicionar o benefício à balança faz abandonar um programa que está funcionando.", 1),

  H1("7. Duas condições em que a resposta foi \"a dose não muda\""),
  P("Isso é conclusão, não lacuna, e o sistema diz por quê."),
  LI("**Asma controlada.** A revisão Cochrane mostra melhora de capacidade funcional e de qualidade de vida, e efeito **pequeno e incerto sobre o controle da asma**. A evidência sustenta uma promessa distinta, não uma dose distinta. Inventar um teto só para a condição parecer diferente seria encaixar o aluno numa regra que ninguém mediu."),
  LI("**Gestante.** Cinco buscas em bases diferentes não encontraram comparação de modalidades. A produção científica da gestação se organiza por **contraindicação e desfecho obstétrico**, não por comparação de treinos. Coerente com isso, a especificidade da gestante no sistema vive na camada de **segurança**: o semáforo pergunta as oito contraindicações absolutas e os sinais do dia."),

  H1("8. Como uma afirmação vira regra"),
  NUM("A pergunta é formulada por condição **e por modalidade**, não por condição só.", 2),
  NUM("A busca é no PubMed, com preferência por metanálise em rede, que compara modalidades entre si em vez de comparar uma modalidade com nada.", 2),
  NUM("**O tipo do trabalho é conferido no registro do artigo, nunca no filtro da busca.** O filtro de tipo do PubMed não é confiável: pedindo apenas metanálise, ele já devolveu um relato de caso de um único paciente.", 2),
  NUM("A magnitude, a direção e as **limitações declaradas pelos autores** entram junto. Certeza baixa, amostra pequena, população diferente e ausência de cegamento viajam com a citação.", 2),
  NUM("Onde a direção vem da evidência mas o número é prudência da casa, isso fica marcado como cautela declarada, e não é apresentado como achado.", 2),
  NUM("Uma referência genérica, que vale para qualquer adulto, **não** pode ser a única sustentação de uma condição específica. Há uma trava automática para isso.", 2),

  H1("9. O que o sistema recusa fazer"),
  LI("Inventar número de dose onde a literatura não deu número."),
  LI("Usar uma diretriz geral como resposta para uma realidade clínica específica."),
  LI("Prometer desfecho que a evidência da condição não sustenta."),
  LI("Deixar a condição de saúde do aluno aparecer no documento que vai para as mãos dele."),
  LI("Tirar exercício do plano em nome de uma ênfase. Restrição é assunto do semáforo."),

  H1("10. Como isso é verificado"),
  P("O sistema tem 25 verificações automáticas que bloqueiam a publicação, entre elas: toda regra aprovada precisa de referência real; nenhuma condição pode se sustentar só em diretriz genérica; nenhum campo clínico pode ser declarado e não aplicado; e a dose gerada precisa ficar dentro da faixa citada pelo próprio objetivo."),
  P("Além delas, uma bancada gera **4.320 planos** no cruzamento de condição, objetivo, nível, horizonte e frequência, e procura incoerência entre o que o plano diz e o que ele prescreve. A bancada é testada quebrando o motor de propósito, para provar que ela enxerga.", { after: 0 }),
];

const doc = new Document({
  creator: "Mapa da Prescrição",
  title: "A lógica por trás da prescrição",
  description: "Como o sistema decide a prescrição, em linguagem de treino.",
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22, color: TINTA }, paragraph: { spacing: { line: 276 } } },
    },
  },
  numbering: {
    config: [
      {
        reference: "pontos",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 420, hanging: 240 } } },
        }],
      },
      {
        reference: "passos0",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 480, hanging: 300 } } },
        }],
      },
      {
        reference: "passos1",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 480, hanging: 300 } } },
        }],
      },
      {
        reference: "passos2",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 480, hanging: 300 } } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: {
          top: convertMillimetersToTwip(22), bottom: convertMillimetersToTwip(20),
          left: convertMillimetersToTwip(20), right: convertMillimetersToTwip(20),
        },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Mapa da Prescrição   ·   ", size: 16, color: SUAVE }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: SUAVE })],
        })],
      }),
    },
    children: corpo,
  }],
});

/*
 * Pós-processo: dar nsid próprio a cada lista.
 *
 * O docx não emite <w:nsid> nenhum, e sem nsid o Word trata todas as listas decimais do
 * arquivo como UMA só e continua a contagem: a seção 6 saiu começando em 6 e a seção 8 em
 * 11. Reference separada e instance separada não resolveram, porque o problema não está no
 * numId, está no Word não ter como distinguir as listas. O nsid é o identificador que ele
 * usa para isso.
 *
 * O nsid é o primeiro filho de <w:abstractNum>; a ordem dos filhos é validada pelo esquema.
 */
const comNsid = (xml) =>
  xml.replace(/(<w:abstractNum w:abstractNumId="(\d+)"[^>]*>)/g,
    (todo, tag, id) => `${tag}<w:nsid w:val="${(0x4D50_0001 + Number(id)).toString(16).toUpperCase()}"/>`);

const saida = process.argv[2];
Packer.toBuffer(doc).then(async (buf) => {
  const JSZip = require("jszip");
  const zip = await JSZip.loadAsync(buf);
  zip.file("word/numbering.xml", comNsid(await zip.file("word/numbering.xml").async("string")));
  const final = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, final);
  console.log("OK " + saida + " " + final.length + " bytes");
});
