import type { Aluno } from "@/data/alunos";
import { abrirDocumento } from "@/lib/abrirDocumento";
import { rotuloObjetivoPar } from "@/lib/gps/objetivos";
import type { MarcaDocumento } from "@/lib/store";
import type { Macrociclo, Mesociclo, Microciclo, PlanoTreino, Sessao } from "@/data/periodizacao";
import type { Nivel } from "@/data/types";
import { getModelo, getMetodo, rotuloHorizonte, rotuloFrequencia, TEND_LABEL, agruparBlocosPorMetodo, fraseDeSessoes } from "@/data/periodizacao";
import { getModalidade } from "@/data/modalities";
import { exercises } from "@/data/exercises";
import { getParam } from "@/data/monitoringParameters";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { bibliografia } from "@/data/referencias";
import { desenharProgressao, posicoesFocos, estadoSemana, ESTADO_LABEL, agregadoSemana } from "@/lib/gps/progressao";
import { temAlvoForca, tokensAlvoForca, temAlvoAerobio, tokensAlvoAerobio, regrasDaSessao } from "@/lib/gps/alvoResumo";
import { assinaturaSemana } from "@/lib/gps/assinaturaSemana";
import { topicosDoRaciocinio } from "@/lib/gps/raciocinioTopicos";
import { cabecalhoCss, cabecalhoHtml } from "@/lib/pdfCabecalho";
import { chaveDaFase, nomeDaFase, indicesDeCorDasFases } from "@/lib/gps/fasesDoPlano";
import { CORES_PDF as C } from "@/lib/pdfCores";
import { semPontoFinal } from "@/lib/pdfTexto";
import { escapar as esc, faixaNumeros, folhaHtml, rotulo } from "@/lib/pdfPapel";

const fmt = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ts));

const TIPO_SEMANA: Record<Microciclo["tipo"], string> = { carga: "carga", deload: "descarga", teste: "teste" };

/**
 * Semanas seguidas com o mesmo conteúdo viram uma linha só.
 *
 * Um bloco de 4 semanas costuma repetir a mesma estrutura e mudar só na descarga.
 * Imprimir as 4 idênticas gastaria páginas e ainda esconderia o que interessa: onde o
 * plano muda. Agrupar deixa a mudança visível.
 */
function agruparSemanas(microciclos: Microciclo[]) {
  // A chave de igualdade da semana vive em @/lib/gps/assinaturaSemana (fonte única
  // compartilhada com o guardrail check:progressao). Inclui `metodo` e `grupoMetodo`:
  // semanas que diferem só na técnica de série não se fundem numa linha.
  const grupos: { semanas: number[]; micro: Microciclo }[] = [];
  for (const m of microciclos) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && assinaturaSemana(ultimo.micro) === assinaturaSemana(m)) ultimo.semanas.push(m.semana);
    else grupos.push({ semanas: [m.semana], micro: m });
  }
  return grupos;
}

/**
 * A ASSINATURA DE CONTEÚDO de uma sessão: tudo o que ela prescreve, sem o nome.
 *
 * O plano gera "Sessão isométrica 1", "2" e "3" com conteúdo byte a byte igual. O papel
 * imprimia uma ficha para cada: 144 fichas iguais no plano de 48 semanas, e numerar três
 * coisas idênticas ainda sugere que elas diferem. Colapsadas, viram uma ficha com a
 * frequência ("3x na semana"), que é a informação que de fato existe.
 */
function assinaturaSessao(s: Sessao): string {
  // O `id` do bloco é único por bloco, então serializá-lo fazia duas sessões IDÊNTICAS
  // terem assinaturas diferentes e o agrupamento nunca acontecer: medido na folha da
  // semana 2, "Sessão isométrica 1" e "2" saíram uma embaixo da outra, palavra por
  // palavra iguais. A assinatura é do CONTEÚDO prescrito, e identidade não é conteúdo.
  const semId = s.blocos.map(({ id: _id, ...resto }) => resto);
  return JSON.stringify({ foco: s.foco ?? "", fecho: s.fecho ?? "", blocos: semId });
}

/** Sessões iguais viram uma, com quantas vezes ela se repete na semana. */
function agruparSessoes(sessoes: Sessao[]): { s: Sessao; vezes: number }[] {
  const out: { s: Sessao; vezes: number }[] = [];
  for (const s of sessoes) {
    const igual = out.find((x) => assinaturaSessao(x.s) === assinaturaSessao(s));
    if (igual) igual.vezes++;
    else out.push({ s, vezes: 1 });
  }
  return out;
}

const rotuloSemanas = (semanas: number[]) =>
  semanas.length === 1 ? `Semana ${semanas[0]}` : `Semanas ${semanas[0]} a ${semanas[semanas.length - 1]}`;

/**
 * A sessão sai como quadro: musculação em tabela e cardio em ficha à parte, cada
 * variável na sua linha. Cardio se lê por formato, duração e intensidade (percentual da
 * FCmáx, watts ou pace), não por séries e carga, então não cabe na mesma tabela da força.
 */
function sessaoHtml(s: Sessao, anotar = false, vezes = 1, comFecho = true) {
  /*
   * TRÊS QUADROS, E NÃO DOIS, desde que existe a família isométrica.
   *
   * O filtro era `tipo !== "aerobio"`, então o bloco isométrico caía na tabela de Musculação,
   * cujas colunas são Séries / Repetições / Intensidade / Intervalo. O resultado, medido: a
   * coluna Repetições saía VAZIA e o tempo de contração, que é o protocolo inteiro, não
   * aparecia em coluna nenhuma. Num documento que o profissional ASSINA, isso é a mesma
   * classe de defeito que "Bicicleta ergométrica 3 séries de 13 repetições" foi na tela.
   */
  const forca = s.blocos.filter((b) => b.tipo !== "aerobio" && b.tipo !== "isometrico");
  const cardio = s.blocos.filter((b) => b.tipo === "aerobio");
  const isometrico = s.blocos.filter((b) => b.tipo === "isometrico");

  // Linha de um exercício. `comSufixo` mostra o método entre parênteses só nos blocos SOLTOS;
  // num grupo, o método já vem na linha-cabeçalho, então a linha do bloco fica limpa.
  // Alvo concreto da semana como sub-linha do exercício (as colunas seguem sendo a faixa).
  const alvoForcaHtml = (b: (typeof forca)[number]) =>
    temAlvoForca(b)
      ? `<div class="alvo-forca">Alvo: ${tokensAlvoForca(b)
          .map((t) => `<span class="nw">${t.label === "Alvo" ? "" : esc(t.label) + " "}${esc(t.value)}</span>`)
          .join(" · ")}</div>`
      : "";

  /*
   * A FAIXA CITADA É DITA UMA VEZ, E A DOSE DA SEMANA GANHA COLUNA.
   *
   * Medido no PDF gerado de um plano de 12 semanas: 180 linhas de exercício, e nelas a coluna
   * "Séries" tinha UM valor distinto e "Intervalo" também UM. "Repetições" e "Intensidade",
   * três cada. Ou seja, quatro das cinco colunas ocupavam a largura da folha sem carregar
   * informação, enquanto o alvo da semana, o único número que muda de semana para semana (17
   * valores distintos), era uma sublinha de 10px embaixo do nome do exercício. O Filipe:
   * "a exportação em PDF do plano também está bem feia, meio quebrada, sem usar a página
   * toda". A folha usa 178 dos 210 mm da A4; o que não usava a página era o CONTEÚDO.
   *
   * A regra é auto-limitada: a faixa só sobe para o cabeçalho quando ela é a MESMA em todos os
   * exercícios da sessão. Havendo mais de uma (objetivos misturados), as colunas voltam, porque
   * aí elas de fato distinguem linhas.
   */
  const assinaturaFaixa = (b: (typeof forca)[number]) =>
    [b.series ?? "", b.reps ?? "", b.intensidade ?? "", b.intervalo ?? ""].join("|");
  const faixaUnica = forca.length > 0 && new Set(forca.map(assinaturaFaixa)).size === 1;
  const faixaNoCabecalho = faixaUnica
    ? [
        forca[0].series ? `${esc(forca[0].series)} séries` : "",
        forca[0].reps ? `${esc(forca[0].reps)} repetições` : "",
        forca[0].intensidade ? esc(forca[0].intensidade) : "",
        forca[0].intervalo && forca[0].intervalo !== "-" ? `intervalo ${esc(forca[0].intervalo)}` : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  /*
   * A coluna do rótulo na ficha do cardio e do isométrico cabe o rótulo mais longo da ficha.
   * Com largura fixa, "Descanso entre contrações" estourava a coluna, o valor encostava no
   * rótulo e cada linha começava num ponto diferente.
   */
  const larguraDoRotulo = (linhas: [string, string | undefined][]) =>
    Math.round(Math.max(68, ...linhas.filter(([, v]) => v && v !== "-").map(([r]) => r.length * 5.8 + 4)));

  /** O grupo muscular do exercício, do catálogo. Ausente para bloco sem slug (avulso). */
  const grupoDe = (b: (typeof forca)[number]) =>
    b.exercicioSlug ? (exercises.find((e) => e.slug === b.exercicioSlug)?.grupoMuscular ?? "") : "";

  /** A dose CONCRETA da semana, em coluna própria e em negrito: é o que muda semana a semana. */
  const doseDaSemana = (b: (typeof forca)[number]) =>
    temAlvoForca(b)
      ? tokensAlvoForca(b)
          .map((t) => `<span class="nw">${t.label === "Alvo" ? "" : esc(t.label) + " "}${esc(t.value)}</span>`)
          .join(" · ")
      : "";

  let ordem = 0;
  const linhaForca = (b: (typeof forca)[number], comSufixo: boolean) => {
    const nome =
      esc(b.nome ?? "") +
      (comSufixo && b.metodo && b.metodo !== "tradicional" ? ` <b>(${esc(getMetodo(b.metodo)?.nome ?? "")})</b>` : "");
    if (!faixaUnica) {
      // Sessão com faixas diferentes entre exercícios: as colunas voltam, porque aí elas
      // distinguem linhas de verdade. O alvo segue como sublinha, como sempre foi.
      return `
            <tr>
              <td class="ex">${nome}${alvoForcaHtml(b)}</td>
              <td>${esc(b.series ?? "")}</td>
              <td>${esc(b.reps ?? "")}</td>
              <td>${esc(b.intensidade ?? "")}</td>
              <td>${esc(b.intervalo && b.intervalo !== "-" ? b.intervalo : "")}</td>
            </tr>`;
    }
    ordem += 1;
    const dose = doseDaSemana(b);
    return `
            <tr>
              <td class="c-num">${ordem}</td>
              <td class="ex">${nome}</td>
              <td class="c-grupo">${esc(grupoDe(b))}</td>
              <td class="c-dose">${dose || "&mdash;"}</td>
              <td class="c-carga"></td>
            </tr>`;
  };

  const corpoForca = agruparBlocosPorMetodo(forca)
    .map((seg) => {
      if (seg.tipo === "grupo") {
        const info = getMetodo(seg.metodo);
        const nomes = seg.blocos.map((b) => esc(b.nome ?? "")).join(" + ");
        // Blocos do bi/tri/super-set imprimem juntos, sob uma linha que os nomeia ("Bi-set: A + B").
        return (
          `<tr class="grupo-metodo"><td colspan="5"><b>${esc(info?.nome ?? "")}:</b> ${nomes}` +
          (info?.descricao ? ` <span class="grupo-desc">${esc(info.descricao)}</span>` : "") +
          `</td></tr>` +
          seg.blocos.map((b) => linhaForca(b, false)).join("")
        );
      }
      return linhaForca(seg.bloco, true);
    })
    .join("");

  const tabelaForca = forca.length
    ? `<div class="quadro quadro-forca">
        <p class="quadro-tit">Musculação</p>
        ${faixaNoCabecalho ? `<p class="faixa-sessao"><b>Faixa citada, igual para todos os exercícios desta sessão:</b> ${faixaNoCabecalho}</p>` : ""}
        <table class="blocos">
          <thead><tr>${
            faixaUnica
              ? `<th class="c-num">#</th><th>Exercício</th><th>Grupo</th><th class="c-dose">Dose desta semana</th><th class="c-carga">Carga usada</th>`
              : `<th>Exercício</th><th>Séries</th><th>Repetições</th><th>Intensidade</th><th>Intervalo</th>`
          }</tr></thead>
          <tbody>${corpoForca}</tbody>
        </table>
      </div>`
    : "";

  const fichaCardio = cardio.length
    ? `<div class="quadro">
        <p class="quadro-tit">Cardio</p>
        ${cardio
          .map((b) => {
            const atividade = b.modalidade ? getModalidade(b.modalidade)?.nome : undefined;
            const linhas: [string, string | undefined][] = [
              ["Formato", b.formato],
              // O intervalado precisa sair no PDF com a estrutura dos tiros: sem ela, o aluno
              // recebe "5 a 10 min" e não sabe se é um tiro só ou vinte.
              ["Tiros", b.tiros],
              [b.tiros ? "Tempo de trabalho" : "Duração", b.duracao],
              ["Intensidade", b.intensidade],
              ["Recuperação", b.recuperacao && b.recuperacao !== "-" ? b.recuperacao : undefined],
            ];
            const alvoCardio = temAlvoAerobio(b)
              ? `<p class="cardio-linha"><span class="cardio-rot">Alvo</span><span>${tokensAlvoAerobio(b)
                  .map((t) => `<span class="nw">${t.label === "Alvo" ? "" : esc(t.label) + " "}${esc(t.value)}</span>`)
                  .join(" · ")}</span></p>`
              : "";
            return `<div class="cardio" style="--rot:${larguraDoRotulo(linhas)}px">
              <p class="cardio-nome">${esc(atividade ?? b.nome ?? "Aeróbio")}</p>
              ${linhas
                .filter(([, v]) => v)
                .map(([rot, v]) => `<p class="cardio-linha"><span class="cardio-rot">${rot}</span><span>${esc(v as string)}</span></p>`)
                .join("")}
              ${alvoCardio}
              ${b.observacao ? `<p class="cardio-obs">${esc(b.observacao)}</p>` : ""}
            </div>`;
          })
          .join("")}
      </div>`
    : "";

  /*
   * Reusa a MESMA ficha do cardio (rótulo colado ao valor), e não a tabela da musculação,
   * porque a dose isométrica se lê como a do cardio: por tempo, com rótulo em cada número.
   * A observação entra sempre que existir, e é onde mora a cautela da pressão arterial.
   */
  const fichaIsometrico = isometrico.length
    ? `<div class="quadro">
        <p class="quadro-tit">${
          isometrico.every((b) => b.sustentado)
            ? "Sustentado (dose por tempo)"
            : isometrico.some((b) => b.sustentado)
              ? "Isométrico e sustentado"
              : "Isométrico"
        }</p>
        ${isometrico
          .map((b) => {
            // Prancha e equilíbrio são séries por tempo, não contrações de protocolo: o rótulo
            // acompanha, senão o documento chama uma prancha de "contração".
            const linhas: [string, string | undefined][] = [
              [b.sustentado ? "Séries" : "Contrações", b.series],
              [b.sustentado ? "Tempo" : "Tempo de contração", b.duracao],
              [b.sustentado ? "Descanso" : "Descanso entre contrações", b.intervalo && b.intervalo !== "-" ? b.intervalo : b.recuperacao],
              ["Intensidade", b.intensidade],
            ];
            return `<div class="cardio" style="--rot:${larguraDoRotulo(linhas)}px">
              <p class="cardio-nome">${esc(b.nome ?? "Isométrico")}</p>
              ${linhas
                .filter(([, v]) => v && v !== "-")
                .map(([rot, v]) => `<p class="cardio-linha"><span class="cardio-rot">${rot}</span><span>${esc(v as string)}</span></p>`)
                .join("")}
              ${b.observacao ? `<p class="cardio-obs">${esc(b.observacao)}</p>` : ""}
            </div>`;
          })
          .join("")}
      </div>`
    : "";

  const fechoHtml = comFecho && s.fecho ? `<p class="fecho">${esc(s.fecho)}</p>` : "";
  // Sessões idênticas saem como UMA ficha, com a frequência ao lado do nome.
  // O número final do nome ("Sessão isométrica 1") só faz sentido quando há mais de uma:
  // colapsadas, o que resta é a frequência. A regex nasceu sem as barras invertidas e não
  // casava com nada, então o papel saía com "Sessão isométrica 1 · 3x na semana".
  const nome = vezes > 1 ? esc(s.nome).replace(/\s*\d+$/, "") : esc(s.nome);
  return `
    <div class="sessao">
      <p class="sessao-nome">${nome}${vezes > 1 ? ` <span class="vezes">${vezes}x na semana</span>` : ""}${s.foco ? ` <span class="foco">${esc(s.foco)}</span>` : ""}</p>
      ${
        s.blocos.length
          ? `<div class="quadros">${tabelaForca}${
              fichaIsometrico || fichaCardio ? `<div class="complementos">${fichaIsometrico}${fichaCardio}</div>` : ""
            }</div>`
          : `<p class="vazio">Sessão sem exercícios definidos.</p>`
      }
      ${fechoHtml}
      ${anotar ? `<div class="anotar"><span>Data:</span><span>Esforço da sessão (0 a 10):</span></div>` : ""}
    </div>`;
}

/** As semanas de um bloco: sessões idênticas colapsadas e fecho comum içado. */
function semanasHtml(m: Mesociclo, folha: boolean) {
  const grupos = agruparSemanas(m.microciclos);
  return grupos
    .map((g, gi) => {
      const anterior = gi > 0 ? grupos[gi - 1].micro : undefined;
      // Selo de estado só nas semanas de carga (descarga/teste já vêm rotulados ao lado).
      const estado = estadoSemana(g.micro, anterior);
      const seloEstado =
        g.micro.tipo === "carga" && estado !== "inicio"
          ? `<span class="estado estado-${estado}">${ESTADO_LABEL[estado]}</span>`
          : "";
      /*
       * NA DESCARGA, A CAUSA. O papel dizia três vezes a mesma coisa ("Objetivo da semana:
       * semana de descarga...", "Descarga: volume 36% menor", "reduza volume e intensidade"),
       * e o número vinha de MENOS SESSÕES, não de dose menor: a dose por exercício era a
       * mesma da semana de carga. Uma frase, com a causa.
       */
      let reducao = "";
      if (g.micro.tipo === "deload" && anterior) {
        const va = agregadoSemana(anterior).volume;
        const vd = agregadoSemana(g.micro).volume;
        const sa = anterior.sessoes.length;
        const sd = g.micro.sessoes.length;
        if (va > 0 && vd < va) {
          const causa = sd < sa ? `${sd} ${sd === 1 ? "sessão" : "sessões"} em vez de ${sa}` : "dose menor por exercício";
          reducao = `<p class="reducao">Descarga: ${causa}, volume da semana cerca de ${Math.round((1 - vd / va) * 100)}% menor.</p>`;
        }
      }
      const sessoes = (() => {
        const gruposSessao = agruparSessoes(g.micro.sessoes);
        /*
         * O fecho de flexibilidade costuma ser o MESMO em toda sessão: repetido por sessão,
         * eram três linhas por ficha, 144 vezes no plano de 48 semanas. Igual em todas, sobe.
         *
         * Contava a sessão SEM fecho como um fecho diferente, então bastava um complemento
         * isométrico na semana (que não tem fecho) para o içamento nunca acontecer: medido
         * na folha da semana 2, o mesmo parágrafo de flexibilidade saiu três vezes. O que
         * decide é haver um único fecho entre os que existem; quem não tem, não imprime.
         */
        const fechos = new Set(g.micro.sessoes.map((s) => s.fecho).filter(Boolean));
        const fechoComum = fechos.size === 1 ? [...fechos][0] : undefined;
        return (
          gruposSessao.map((x) => sessaoHtml(x.s, folha, x.vezes, !fechoComum)).join("") +
          (fechoComum ? `<p class="fecho fecho-semana">${esc(fechoComum)}</p>` : "")
        );
      })();
      return `
      <div class="semana">
        <p class="semana-tit">${rotuloSemanas(g.semanas)} <span class="tipo">${TIPO_SEMANA[g.micro.tipo]}</span>${seloEstado}
          <span class="freq">${fraseDeSessoes(g.micro.sessoes)} na semana</span></p>
        ${g.micro.objetivo && g.micro.tipo !== "deload" ? `<p class="objetivo-sem"><b>Objetivo da semana:</b> ${esc(g.micro.objetivo)}</p>` : ""}
        ${reducao}
        ${g.micro.nota ? `<p class="nota">${esc(g.micro.nota)}</p>` : ""}
        ${sessoes}
      </div>`;
    })
    .join("");
}

/**
 * UMA FASE do plano: o cabeçalho sai UMA vez, e as semanas de todos os blocos da fase vêm
 * embaixo.
 *
 * O papel imprimia bloco a bloco: no plano de 48 semanas, o mesmo cabeçalho de "Fase 4:
 * Autonomia" reaparecia três vezes com as mesmas capacidades, modalidades, tipos, parâmetros
 * e critérios, mudando só o intervalo de semanas, e o disco numerado do bloco ("5") ficava
 * colado no nome da fase ("Fase 4"). O gráfico já funde as continuações por `chaveDaFase`;
 * o corpo do documento passa a fazer o mesmo.
 */
function faseHtml(mesos: Mesociclo[], numero: number, folha = false) {
  const m = mesos[0];
  const params = m.parametros
    .map((id) => getParam(id)?.nome)
    .filter(Boolean)
    .map((n) => `<span class="tag">${esc(n as string)}</span>`)
    .join("");

  const lista = (t: string, itens: string[]) =>
    itens.length ? `<p class="rot">${t}</p><ul class="crit">${itens.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : "";

  const tags = (t: string, itens: string[]) =>
    itens.length ? `<p class="rot">${t}</p><div class="tags">${itens.map((c) => `<span class="tag">${esc(c)}</span>`).join("")}</div>` : "";

  // Espelha a tela: Modalidades em foco resolvidas por nome; tipos de exercício como estão.
  const modalidades = (m.modalidades ?? []).map((id) => getModalidade(id)?.nome ?? id);
  const semanaInicio = Math.min(...mesos.map((x) => x.semanaInicio));
  const semanaFim = Math.max(...mesos.map((x) => x.semanaFim));
  const reavaliar = mesos.filter((x) => x.reavaliacao).map((x) => x.semanaFim);

  return `
  <section class="meso">
    <div class="meso-cab">
      <h2 class="meso-tit"><span class="num">${numero}</span> ${esc(nomeDaFase(m))}
        <span class="range">semanas ${semanaInicio} a ${semanaFim}</span></h2>
      <p class="meso-foco">${esc(m.foco)}</p>
      ${
        /* Na folha da semana o bloco é só CONTEXTO: nome, foco e o que acompanhar. As
           capacidades, os tipos de exercício e os critérios de progressão são leitura do
           profissional e ocupavam a primeira página inteira de uma folha que existe para ir
           à academia na mão do aluno. */
        folha
          ? params ? `<p class="rot">Acompanhar</p><div class="tags">${params}</div>` : ""
          : `<p class="tend">Volume ${TEND_LABEL[m.tendenciaVolume]} · Intensidade ${TEND_LABEL[m.tendenciaIntensidade]} · Complexidade ${TEND_LABEL[m.tendenciaComplexidade]}${
              reavaliar.length ? ` · reavaliar ao fim da semana ${reavaliar.join(", ")}` : ""
            }</p>
    ${tags("Capacidades priorizadas", m.capacidades)}
    ${tags("Modalidades em foco", modalidades)}
    ${tags("Tipos de exercício", m.tiposExercicio)}
    ${params ? `<p class="rot">Acompanhar</p><div class="tags">${params}</div>` : ""}
    ${lista("Progredir quando", m.criteriosProgressao)}
    ${lista("Regredir ou revisar se", m.criteriosRegressao)}`
      }
    </div>
    ${mesos.map((x) => semanasHtml(x, folha)).join("")}
  </section>`;
}


/**
 * As famílias das faixas de fase, na ordem em que a TELA as cicla (turquesa, azul, âmbar).
 *
 * A tela pinta as faixas com alpha sobre o navy do macrociclo; no papel o fundo é branco,
 * então entram as lavadas equivalentes da mesma família, com a tinta que escreve em cada
 * uma. O que se preserva é o SIGNIFICADO da sequência, não o valor do pixel: quem viu a
 * fase 2 em azul na tela encontra a fase 2 em azul no papel.
 */
const FAIXA_FASE_PAPEL = [
  { bg: C.analiseTint, borda: C.analise, tinta: C.analise },
  { bg: C.marcaTint, borda: C.marca, tinta: C.marca },
  { bg: C.alertaTint, borda: C.alerta, tinta: C.alerta },
  { bg: C.fase4Tint, borda: C.fase4, tinta: C.fase4 },
] as const;

function graficoHtml(macro: Macrociclo, nivel?: Nivel) {
  const g = desenharProgressao(macro, 700, 250, nivel);
  if (g.vazio) return "";
  /*
   * AS TRÊS SÉRIES, com a MESMA família que a tela dá a cada uma.
   *
   * Estava trocado, e trocado de um jeito que confunde: na tela o turquesa é o VOLUME, e
   * aqui o turquesa era a COMPLEXIDADE, com o volume em azul. Quem lia o plano na tela e
   * depois no papel via a mesma cor significando duas coisas.
   *
   * A FORMA também distingue, e não por capricho: no papel branco as três tintas escuras
   * ficam entre 5,7 e 6,3 contra o branco, mas entre SI ficam em 1,03 a 1,09, ou seja,
   * praticamente a mesma luminância. Impresso em tons de cinza (que é como um plano de
   * treino costuma sair), as três linhas viravam uma só. Sólida, tracejada e pontilhada
   * sobrevivem à impressão sem cor.
   */
  const cor: Record<string, string> = { vol: C.analise, int: C.alerta, cpx: C.ink2, area: C.analise };
  const traco: Record<string, string> = { vol: "", int: "7 4", cpx: "1.5 3.5" };
  // Régua de semanas: carga = marca, descarga = âmbar (mesmo do alívio),
  // teste = turquesa (mesmo da complexidade).
  const corTick: Record<string, string> = { carga: C.marca, deload: C.alerta, teste: C.analise };
  const rotuloTick: Record<string, string> = { carga: "Carga", deload: "Descarga", teste: "Teste" };
  const tiposSemana = (["carga", "deload", "teste"] as const).filter((t) => g.microTicks.some((mt) => mt.tipo === t));
  const iconesFase = (f: (typeof g.fases)[number]) =>
    posicoesFocos(f, g.iconRowY)
      .map(
        (p) =>
          `<g transform="${p.transform}" stroke="${C.ink2}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
          p.foco.glifo.paths.map((d) => `<path d="${d}" />`).join("") +
          (p.foco.glifo.circles ?? []).map((c) => `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" />`).join("") +
          `</g>`,
      )
      .join("");
  // Identidade de fase (Onda 4): tint alternado + rótulo da fase no TOPO da faixa
  // + divisória sólida de 1px na fronteira. O tint sozinho é ~1.16:1 e não lê;
  // quem marca a fase é a divisória e o rótulo. Paridade byte-a-byte com a tela.
  /*
   * AS FASES COMO CHIPS, que é o desenho da tela hoje.
   *
   * Antes eram faixas cinzas alternadas com o nome solto por cima: o cinza não dizia nada
   * (é a mesma cor para todas as fases) e o nome flutuava sem moldura. Agora cada fase é um
   * retângulo com a cor da própria família, borda e nome dentro, na mesma ordem de cores em
   * que a tela as cicla.
   */
  /*
   * UMA FAIXA POR FASE, na cor da fase, igual à tela. Num plano anual a Fase 4 se estende em
   * blocos de continuação: eram três faixas "Fase 4: Autonomia" lado a lado, e a primeira
   * saía na cor da Fase 1. Blocos seguidos da mesma fase viram uma faixa só.
   */
  const corPorFase = indicesDeCorDasFases(macro.mesociclos);
  const fasesFundidas = g.fases.reduce<(typeof g.fases[number] & { chave: string; cor: number })[]>((acc, f) => {
    const meso = macro.mesociclos[f.indice];
    const chave = meso ? chaveDaFase(meso) : String(f.indice);
    const ultima = acc[acc.length - 1];
    if (ultima && ultima.chave === chave) {
      const fim = f.spanSemanas.split(" ").pop();
      acc[acc.length - 1] = {
        ...ultima,
        x1: f.x1,
        cx: (ultima.x0 + f.x1) / 2,
        temDescarga: ultima.temDescarga || f.temDescarga,
        spanSemanas: `${ultima.spanSemanas.split(" a ")[0]} a ${fim}`,
      };
      return acc;
    }
    const nome = meso ? nomeDaFase(meso).split(" · ")[0] : f.nome;
    acc.push({ ...f, nome, chave, cor: corPorFase.get(chave) ?? f.indice });
    return acc;
  }, []);

  const fases = fasesFundidas
    .map((f) => {
      const fam = FAIXA_FASE_PAPEL[f.cor % FAIXA_FASE_PAPEL.length];
      const largura = f.x1 - f.x0;
      /*
       * O NOME CABE NA FAIXA. Num plano anual a Fase 1 ocupa 8 de 48 semanas, e "Fase 2:
       * Construção de capacidade" atravessava a faixa vizinha. Tenta o nome inteiro, depois
       * só "Fase 2", depois só o número: o nome completo está na seção de cada bloco.
       */
      const cabe = (t: string) => t.length * 5.8 + 10 <= largura;
      const curto = f.nome.split(":")[0];
      const rotulo = cabe(f.nome) ? f.nome : cabe(curto) ? curto : curto.replace(/\D+/g, "");
      return `
      <rect x="${(f.x0 + 1).toFixed(1)}" y="0" width="${Math.max(0, largura - 2).toFixed(1)}" height="16" rx="5"
            fill="${fam.bg}" stroke="${fam.borda}" stroke-width="0.75" />
      <text x="${f.cx.toFixed(1)}" y="11.5" text-anchor="middle" fill="${fam.tinta}" font-size="9.5" font-weight="700">${esc(rotulo)}</text>
      ${iconesFase(f)}
      <text x="${f.cx.toFixed(1)}" y="${(g.faixaTop + 12).toFixed(1)}" text-anchor="middle" fill="${C.ink2}" font-size="10">${esc(f.spanSemanas)}${f.temDescarga ? " · descarga" : ""}</text>`;
    })
    .join("");
  return `
  <section class="bloco">
    ${rotulo("Progressão ao longo das semanas")}
    <p class="legenda-nota">Valores relativos, calculados das sessões (sem unidade absoluta). Volume é soma das séries e dos minutos; esforço é média ponderada. As faixas ao pé mostram cada fase e quantas semanas ela dura.</p>
    <svg viewBox="0 0 ${g.largura} ${g.altura}" width="100%" height="230">
      <defs><linearGradient id="volpdf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${cor.area}" stop-opacity="0.16" /><stop offset="100%" stop-color="${cor.area}" stop-opacity="0" />
      </linearGradient></defs>
      ${fases}
      ${/* As COLUNAS de descarga. Estavam a 9% de opacidade, ou seja, invisíveis no papel e
             perdidas de vez na impressão em cinza; a tela as desenha como coluna cheia. */ ""}
      ${g.alivios
        .map(
          (a) =>
            `<rect x="${(a.x - a.w / 2).toFixed(1)}" y="${g.plot.top}" width="${a.w.toFixed(1)}" height="${(g.plot.bottom - g.plot.top).toFixed(1)}" fill="${C.alertaTint}" stroke="${C.alerta}" stroke-width="0.5" stroke-dasharray="2 2" rx="2" />`,
        )
        .join("")}
      <text x="${g.eixo.x.toFixed(1)}" y="${g.eixo.maiorY.toFixed(1)}" text-anchor="end" fill="${C.ink2}" font-size="9">maior</text>
      <text x="${g.eixo.x.toFixed(1)}" y="${g.eixo.menorY.toFixed(1)}" text-anchor="end" fill="${C.ink2}" font-size="9">menor</text>
      <path d="${g.areaVolume}" fill="url(#volpdf)" stroke="none" />
      ${g.series
        .map(
          (s) =>
            `<path d="${s.d}" fill="none" stroke="${cor[s.id] ?? cor.area}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"${
              traco[s.id] ? ` stroke-dasharray="${traco[s.id]}"` : ""
            } />`,
        )
        .join("")}
      ${g.microTicks
        .map(
          (t) =>
            `<line x1="${t.x.toFixed(1)}" y1="${g.weekTickTop}" x2="${t.x.toFixed(1)}" y2="${g.weekTickBottom}" stroke="${corTick[t.tipo]}" stroke-width="${t.tipo === "carga" ? 1.5 : 2.5}" stroke-linecap="round" />` +
            (t.rotular ? `<text x="${t.x.toFixed(1)}" y="${g.weekLabelY.toFixed(1)}" text-anchor="middle" fill="${C.ink2}" font-size="9">S${t.semana}</text>` : ""),
        )
        .join("")}
    </svg>
    <div class="legenda">
      ${g.series
        .map((s) => {
          // A amostra da legenda é um pedaço da PRÓPRIA linha (mesma cor e mesmo traço),
          // e não um disco de cor: com três luminâncias iguais, o disco não identificava
          // nada em preto e branco.
          // A amostra da linha é SVG com o mesmo tracejado da curva. Era gradiente de fundo,
          // e fundo decorativo some na impressão: "Esforço médio" e "Complexidade" saíam na
          // legenda sem traço nenhum ao lado.
          const d = traco[s.id];
          const amostra = `<svg class="amostra" width="22" height="6" viewBox="0 0 22 6" aria-hidden="true"><line x1="1" y1="3" x2="21" y2="3" stroke="${cor[s.id] ?? cor.area}" stroke-width="2.5" stroke-linecap="round"${d ? ` stroke-dasharray="${d}"` : ""}/></svg>`;
          return `<span>${amostra}${s.nome}</span>`;
        })
        .join("")}
    </div>
    ${
      tiposSemana.length
        ? `<div class="legenda legenda-semanas"><span class="lg-rot">Semanas</span>${tiposSemana
            .map((t) => `<span><i class="tick" style="background:${corTick[t]}"></i>${rotuloTick[t]}</span>`)
            .join("")}</div>`
        : ""
    }
  </section>`;
}

/**
 * Exporta o plano de treino como PDF (via a caixa de impressão do navegador →
 * "Salvar como PDF"), com a marca do profissional, o rastro da decisão e as
 * referências que sustentam as faixas. Deve ser chamada a partir de um clique.
 */
export function exportPlanoPDF({
  aluno,
  plano,
  profissional,
  cref,
  marca,
  apenasHtml,
  somenteSemana,
}: {
  aluno: Aluno;
  plano: PlanoTreino;
  profissional: string;
  cref?: string;
  /** logo, empresa e contato do profissional (Configurações > Sua marca) */
  marca?: MarcaDocumento;
  /**
   * Só monta o HTML e devolve, sem abrir janela nem imprimir.
   *
   * Existe porque o documento que o profissional ASSINA não tinha como ser testado: a função
   * terminava em `window.open`, e fora do navegador ela nem roda. As regras mais duras do
   * produto vivem justamente aqui (o documento do aluno nunca carrega rótulo clínico, a dose
   * impressa é a mesma do plano, nenhuma referência sai sem estar resolvida), e nenhuma delas
   * era verificada contra a saída real, só contra o que o motor guarda antes de imprimir.
   *
   * A saída do caminho normal não muda em nada: o mesmo HTML segue para a janela.
   */
  apenasHtml?: boolean;
  /**
   * FOLHA DA SEMANA: imprime só a semana pedida, em vez do plano inteiro.
   *
   * O plano completo é o documento que o profissional ASSINA e arquiva, e continua sendo o
   * padrão do botão. Mas um plano de 12 semanas vira um calhamaço, e o que vai à academia é
   * uma semana só. São dois usos diferentes do mesmo dado, e forçar um a servir o outro é o
   * que deixava o PDF, nas palavras do Filipe, "meio quebrado".
   *
   * O que a folha corta é a REPETIÇÃO das outras semanas, nunca a procedência: o cabeçalho
   * assinável, o raciocínio, os cuidados e a bibliografia continuam nela, porque um documento
   * que sai da mão de um profissional não pode sair sem eles.
   */
  somenteSemana?: number;
}): string | void {
  const modelo = getModelo(plano.modeloId);
  // Documento que chega ao aluno: o título do plano já nasce com o nome de PROGRAMA do
  // grupo, nunca com o rótulo clínico, e o profissional pode reescrevê-lo. O que o grupo
  // acrescenta aqui são os cuidados, não um rótulo no cabeçalho.
  const tituloDoc = plano.titulo;

  const restr = aluno.restricoes.length ? aluno.restricoes.map((r) => rotuloRestricao(r.tag)).join(", ") : "nenhuma";
  const biblio = bibliografia(plano.refIds);
  const reavaliacoes = plano.macrociclo.mesociclos.filter((m) => m.reavaliacao).map((m) => m.semanaFim);

  /*
   * Na folha da semana, o macrociclo impresso é o mesmo objeto com os microciclos filtrados.
   * Filtrar aqui, e não em cada lugar que imprime, garante que folha e plano completo saiam
   * do MESMO caminho de renderização: o que valer num vale no outro.
   */
  const folha = somenteSemana != null;
  const mesosImpressos =
    somenteSemana == null
      ? plano.macrociclo.mesociclos
      : plano.macrociclo.mesociclos
          .map((m) => ({ ...m, microciclos: m.microciclos.filter((w) => w.semana === somenteSemana) }))
          .filter((m) => m.microciclos.length > 0);

    // Acento do documento: a cor da marca do profissional, senão a do produto.
  const corMarca = marca?.corPrimaria || C.marca;

  /*
   * ONDE O PLANO ESTÁ HOJE. A tela mostra isso no alto da aba Treino, e o papel não mostrava:
   * quem pegava o documento impresso via 48 semanas iguais, sem saber qual delas é hoje.
   * `plano.data` é o início carimbado na publicação, então a conta é do próprio dado.
   */
  const diasDesde = Math.floor((Date.now() - plano.data) / 86_400_000);
  const semanaAtual = diasDesde >= 0 ? Math.min(plano.semanas, Math.floor(diasDesde / 7) + 1) : undefined;
  const faseAtual = semanaAtual
    ? plano.macrociclo.mesociclos.find((m) => semanaAtual >= m.semanaInicio && semanaAtual <= m.semanaFim)
    : undefined;

  /* As fases para o sumário: cada uma com as semanas que cobre e onde caem as descargas. */
  const fasesSumario = (() => {
    const porFase = new Map<string, Mesociclo[]>();
    for (const m of plano.macrociclo.mesociclos) {
      const k = chaveDaFase(m);
      porFase.set(k, [...(porFase.get(k) ?? []), m]);
    }
    return [...porFase.values()].map((ms) => ({
      nome: nomeDaFase(ms[0]),
      foco: ms[0].foco,
      de: Math.min(...ms.map((x) => x.semanaInicio)),
      ate: Math.max(...ms.map((x) => x.semanaFim)),
      descargas: ms
        .flatMap((x) => x.microciclos)
        .filter((w) => w.tipo === "deload")
        .map((w) => w.semana),
    }));
  })();

  /*
   * PROCEDÊNCIA DAS DOSES. O raciocínio impresso manda o leitor conferir "a origem de cada
   * número", e essa seção não existia no papel: o texto apontava para um lugar que não havia.
   * As regras saem dos próprios blocos do plano (`origemRegraId`), então o documento cita o
   * que de fato foi aplicado, e não uma lista genérica de diretrizes.
   */
  const procedencia = (() => {
    const vistas = new Map<string, string>();
    for (const m of plano.macrociclo.mesociclos)
      for (const w of m.microciclos)
        for (const s of w.sessoes)
          for (const r of regrasDaSessao(s.blocos)) if (!vistas.has(r.criterio)) vistas.set(r.criterio, r.base);
    return [...vistas.entries()];
  })();

  const css = `
    * { box-sizing: border-box; }
    ${cabecalhoCss(corMarca)}
    .aluno { display: flex; flex-wrap: wrap; gap: 1.5mm 6mm; background: ${C.papelSuave}; border-radius: 10px; padding: 3mm 4mm; margin: 0 0 4mm; font-size: 9.5pt; }
    .agora { border-left: 3px solid ${corMarca}; background: ${C.papelSuave}; border-radius: 0 8px 8px 0; padding: 2.5mm 3.5mm; margin: 0 0 4mm; font-size: 9.5pt; }
    .rot { font-size: 7.5pt; text-transform: uppercase; letter-spacing: .08em; color: ${C.ink2}; margin: 2.5mm 0 1mm; break-after: avoid; }
    .tags { display: flex; flex-wrap: wrap; gap: 1.2mm; margin-bottom: 1mm; }
    ul.crit { margin: 0 0 1.5mm; padding-left: 5mm; font-size: 9pt; color: ${C.ink2}; }
    ul.crit li { margin-bottom: 0.6mm; }
    ol.refs { font-size: 8pt; color: ${C.ink2}; padding-left: 5mm; margin: 0; }
    ol.refs li { margin-bottom: 0.8mm; }
    .bloco { margin: 0 0 3mm; }

    /* SUMÁRIO DAS FASES: o mapa do plano em meia página, antes de qualquer semana. */
    table.sumario { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    table.sumario td { padding: 1.6mm 2.5mm; border-bottom: 1px solid ${C.linha}; vertical-align: top; }
    table.sumario tr:last-child td { border-bottom: 0; }
    table.sumario .sem { width: 32mm; white-space: nowrap; color: ${C.ink2}; font-variant-numeric: tabular-nums; }
    table.sumario .fase { font-weight: 700; }
    table.sumario .hoje { color: ${corMarca}; font-weight: 700; font-size: 8pt; text-transform: uppercase; letter-spacing: .06em; }

    /* GRÁFICO DA PERIODIZAÇÃO: largura inteira da folha, altura pelo viewBox. */
    .bloco > svg { display: block; width: 100%; height: auto; margin: 1mm 0 1.5mm; }
    .legenda { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5mm 4mm; font-size: 8pt; color: ${C.ink2}; }
    .legenda i { display: inline-block; width: 2.4mm; height: 2.4mm; border-radius: 50%; margin-right: 1.2mm; vertical-align: middle; }
    .legenda i.tick { width: 0.9mm; height: 3mm; border-radius: 1px; }
    .legenda svg.amostra { margin-right: 1.2mm; vertical-align: middle; }
    .legenda-semanas { margin-top: 1mm; }
    .legenda .lg-rot { font-weight: 700; text-transform: uppercase; letter-spacing: .08em; font-size: 7.5pt; }
    .legenda-nota { font-size: 8pt; color: ${C.ink2}; margin: 0 0 1mm; }

    /*
     * QUEBRA DE PÁGINA: a SESSÃO é atômica e nenhum título fica sozinho no pé da folha. O
     * cabeçalho da FASE não é atômico de propósito: como bloco fechado (35 linhas no plano
     * anual) ele empurrava a folha inteira e deixava dois terços dela em branco.
     */
    .meso { margin: 5mm 0 0; padding-top: 3mm; border-top: 1px solid ${C.borda}; }
    .meso-cab { break-inside: auto; }
    .meso-tit { font-size: 12pt; margin: 0 0 1mm; color: ${C.ink}; text-transform: none; letter-spacing: 0; }
    .meso-tit .num { display: inline-flex; width: 5.5mm; height: 5.5mm; border-radius: 4px; background: ${corMarca}; color: ${C.sobreMarca}; font-size: 8.5pt; align-items: center; justify-content: center; margin-right: 1.5mm; vertical-align: middle; }
    .meso-tit .range { font-size: 9pt; font-weight: 400; color: ${C.ink2}; margin-left: 1.5mm; }
    .meso-foco { font-size: 9.5pt; color: ${C.ink2}; margin: 0 0 1.5mm; }
    .tend { font-size: 8.5pt; color: ${C.ink2}; margin: 0 0 1.5mm; }

    .semana { margin: 3mm 0 0; }
    .semana-tit { font-size: 10.5pt; font-weight: 700; margin: 0 0 1mm; break-after: avoid; }
    .semana-tit .tipo { font-size: 7.5pt; font-weight: 700; color: ${C.ink2}; text-transform: uppercase; letter-spacing: .06em; margin-left: 1.5mm; }
    .semana-tit .freq { font-size: 8.5pt; font-weight: 400; color: ${C.ink2}; margin-left: 1.5mm; }
    .estado { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; border-radius: 999px; padding: 0.4mm 2mm; margin-left: 1.5mm; }
    .estado-progressao { background: ${C.sucessoTint}; color: ${C.sucesso}; }
    .estado-manutencao { background: ${C.papelSuave}; color: ${C.ink2}; }
    .estado-regressao { background: ${C.alertaTint}; color: ${C.alerta}; }
    .objetivo-sem, .nota { font-size: 9pt; color: ${C.ink2}; margin: 0 0 1mm; break-after: avoid; }
    .reducao { font-size: 8.5pt; color: ${C.alerta}; margin: 0 0 1mm; }

    /*
     * A SESSÃO NÃO É ATÔMICA; o cartão pequeno é.
     *
     * Com break-inside: avoid na sessão inteira (meia folha cada), só uma cabia por página
     * e a metade de baixo saía em branco: 48 páginas para um plano de 12 semanas, e CINCO
     * para a folha de UMA semana. O que não pode partir é o cartão de cardio ou de
     * isométrico e a linha da tabela; a tabela de musculação parte, e o cabeçalho dela
     * repete na página seguinte (table-header-group).
     */
    .sessao { margin: 2mm 0 2.5mm; }
    .sessao-nome { font-size: 9.5pt; font-weight: 700; margin: 0 0 1.2mm; break-after: avoid; }
    .sessao-nome .foco { font-weight: 400; color: ${C.ink2}; }
    .sessao-nome .vezes { font-size: 7.5pt; font-weight: 700; color: ${corMarca}; text-transform: uppercase; letter-spacing: .06em; margin-left: 1.5mm; }

    /* A musculação ocupa a largura inteira; cardio e isométrico dividem a linha de baixo. */
    .quadros > * + * { margin-top: 2mm; }
    .complementos { display: flex; flex-wrap: wrap; gap: 2mm; align-items: flex-start; }
    .complementos > .quadro { flex: 1 1 46%; min-width: 0; }
    .quadro { border: 1px solid ${C.borda}; border-radius: 8px; overflow: hidden; break-inside: avoid; }
    .quadro-forca { break-inside: auto; }
    .quadro-tit { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: ${C.ink2}; background: ${C.papelSuave}; margin: 0; padding: 1.3mm 2.5mm; border-bottom: 1px solid ${C.borda}; }
    .faixa-sessao { font-size: 8.5pt; color: ${C.ink2}; margin: 0; padding: 1.3mm 2.5mm; border-bottom: 1px solid ${C.linha}; }
    .faixa-sessao b { color: ${C.ink}; font-weight: 600; }

    table.blocos { width: 100%; border-collapse: collapse; font-size: 9pt; }
    table.blocos thead { display: table-header-group; }
    table.blocos th { text-align: left; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .06em; color: ${C.ink2}; font-weight: 700; padding: 1.3mm 2.5mm; border-bottom: 1px solid ${C.borda}; }
    table.blocos td { padding: 1.5mm 2.5mm; border-bottom: 1px solid ${C.linha}; color: ${C.ink2}; vertical-align: top; }
    table.blocos tr { break-inside: avoid; }
    table.blocos tbody tr:last-child td { border-bottom: 0; }
    table.blocos td.ex { color: ${C.ink}; font-weight: 600; }
    table.blocos tr.grupo-metodo td { background: ${C.papelSuave}; color: ${C.ink}; }
    table.blocos tr.grupo-metodo .grupo-desc { color: ${C.ink2}; font-weight: 400; }
    .blocos .c-num { width: 6mm; text-align: right; padding-right: 1mm; }
    .blocos .c-grupo { white-space: nowrap; }
    .blocos .c-dose { width: 62mm; color: ${C.ink}; font-weight: 700; }
    /* A coluna de carga sai VAZIA de propósito: é onde o aluno anota o peso que usou. */
    .blocos .c-carga { width: 26mm; }
    .blocos td.c-carga { border-bottom: 1px solid ${C.borda}; }
    .alvo-forca { font-size: 8.5pt; font-weight: 400; color: ${C.ink2}; margin: 0.5mm 0 0; }
    /* cada item da dose inteiro numa linha: a quebra cai entre itens, nunca entre "1,5" e "min" */
    .nw { white-space: nowrap; }

    .cardio { padding: 1.5mm 2.5mm; border-bottom: 1px solid ${C.linha}; }
    .cardio:last-child { border-bottom: 0; }
    .cardio-nome { font-size: 9pt; font-weight: 700; color: ${C.ink}; margin: 0 0 0.8mm; }
    .cardio-linha { font-size: 8.5pt; color: ${C.ink2}; margin: 0 0 0.5mm; display: grid; grid-template-columns: var(--rot, 26mm) 1fr; column-gap: 2mm; }
    .cardio-obs { font-size: 8pt; color: ${C.ink2}; margin: 1mm 0 0; }
    .vazio { font-size: 9pt; color: ${C.ink2}; }

    .fecho { font-size: 8.5pt; color: ${C.ink2}; background: ${C.papelSuave}; border-radius: 6px; padding: 1.3mm 2.5mm; margin: 1.2mm 0 0; }
    .fecho-semana { margin-top: 2mm; }
    /* Espaço de anotação da folha da semana: a data e o esforço percebido da sessão. */
    .anotar { display: flex; gap: 6mm; font-size: 8.5pt; color: ${C.ink2}; margin: 1.5mm 1mm 0; }
    .anotar span { flex: 1; border-bottom: 1px solid ${C.borda}; padding-bottom: 4mm; }
  `;

  const contato =
    marca && (marca.site || marca.email || marca.telefone)
      ? `<br>${[marca.site, marca.email, marca.telefone].filter((x): x is string => Boolean(x)).map(esc).join(" · ")}`
      : "";

  const html = folhaHtml({
    titulo: `${folha ? `Semana ${somenteSemana}` : "Plano de treino"} · ${aluno.nome}`,
    cor: corMarca,
    css,
    corridoEsq: `<b>${folha ? `Semana ${somenteSemana}` : "Plano de treino"}</b> · ${esc(aluno.nome)}`,
    corridoDir: `${esc(profissional)}${cref ? ` · CREF ${esc(cref)}` : ""}`,
    rodapeEsq: esc(tituloDoc),
    rodapeDir: `Início em ${esc(fmt(plano.data))} · impresso em ${esc(fmt(Date.now()))}`,
    rodapeLegal:
      "As faixas deste plano são referência de diretriz e não substituem a decisão do profissional responsável. Conteúdo educacional e de apoio à decisão; não substitui avaliação profissional individualizada nem prescrição clínica. Gerado pelo Mapa da Prescrição.",
    corpo: `
    ${cabecalhoHtml({
      cor: corMarca,
      logoDataUrl: marca?.logoDataUrl,
      profissional,
      cref,
      empresa: marca?.empresa,
      docTipo: folha ? `Folha da semana ${somenteSemana}` : "Plano de treino",
      no: 1,
      direita: `<div class="sub">Início em ${esc(fmt(plano.data))}${contato}</div>`,
    })}

    <h1>${folha ? `Semana ${somenteSemana}` : esc(tituloDoc)}</h1>
    <p class="sub">${
      // Na folha, o título do plano já diz a duração ("...: 12 semanas"); repetir o horizonte
      // e as semanas ao lado dele imprimia "12 semanas" duas vezes na mesma linha.
      folha
        ? `${esc(tituloDoc)} · ${esc(rotuloFrequencia(plano))}`
        : `${rotuloHorizonte(plano.semanas) ? esc(rotuloHorizonte(plano.semanas)!) + " · " : ""}${plano.semanas} semanas · ${esc(rotuloFrequencia(plano))} · ${esc(modelo.nome)}`
    }</p>

    <div class="aluno">
      <span><b>${esc(aluno.nome)}</b>${aluno.idade ? ` · ${aluno.idade} anos` : ""}</span>
      <span>Objetivo: <b>${esc(rotuloObjetivoPar(plano.objetivo, plano.objetivoSecundario))}</b></span>
      <span>Nível: <b>${esc(plano.nivel)}</b></span>
      <span>Restrições: <b>${esc(restr)}</b></span>
      ${plano.disponibilidade ? `<span>Disponibilidade: <b>${esc(plano.disponibilidade)}</b></span>` : ""}
    </div>

    ${
      /*
       * A FOLHA DA SEMANA É UMA FOLHA.
       *
       * Ela saía com a faixa de números, o gráfico do macrociclo e duas páginas de "Por que
       * este plano" antes da semana: seis páginas para o aluno levar à academia uma semana de
       * treino. O plano completo continua tendo tudo; a folha fica com o que se usa no dia.
       */
      folha
        ? ""
        : `${faixaNumeros([
            { rot: "Horizonte", valor: `${plano.semanas} semanas`, obs: rotuloHorizonte(plano.semanas) ?? modelo.nome },
            { rot: "Frequência", valor: rotuloFrequencia(plano) },
            { rot: "Fases", valor: String(fasesSumario.length), obs: `${plano.macrociclo.mesociclos.length} blocos de treino` },
            {
              rot: "Reavaliação",
              valor: reavaliacoes.length ? `semana ${reavaliacoes[0]}` : "sem marco",
              obs: reavaliacoes.length > 1 ? `depois nas semanas ${reavaliacoes.slice(1).join(", ")}` : undefined,
            },
          ])}
        ${
          semanaAtual && faseAtual
            ? `<div class="agora"><b>Onde o plano está hoje:</b> semana ${semanaAtual} de ${plano.semanas}, dentro de ${esc(
                nomeDaFase(faseAtual),
              )} (semanas ${faseAtual.semanaInicio} a ${faseAtual.semanaFim}).</div>`
            : ""
        }
        ${graficoHtml(plano.macrociclo, plano.nivel)}
        ${rotulo("As fases deste plano")}
        <table class="sumario"><tbody>${fasesSumario
          .map((f) => {
            const aqui = semanaAtual != null && semanaAtual >= f.de && semanaAtual <= f.ate;
            return `<tr><td class="sem">Semanas ${f.de} a ${f.ate}</td><td><span class="fase">${esc(f.nome)}</span>${
              aqui ? ` <span class="hoje">aqui</span>` : ""
            }<div class="mini">${esc(f.foco)}${
              f.descargas.length ? ` · descarga ${f.descargas.length === 1 ? "na semana" : "nas semanas"} ${f.descargas.join(", ")}` : ""
            }</div></td></tr>`;
          })
          .join("")}</tbody></table>`
    }

    ${
      folha
        ? ""
        : `${rotulo("Por que este plano")}
      ${/*
        O raciocínio impresso segue os mesmos tópicos da tela. Um parágrafo de vinte linhas
        num PDF assinado é ainda pior que na tela: no papel não há aba nem rolagem para
        recuperar o assunto que se perdeu no meio.
      */ ""}
      ${topicosDoRaciocinio(plano.raciocinio)
        .map((t) => (t.titulo ? `<p class="rot">${esc(t.titulo)}</p><p>${esc(t.texto)}</p>` : `<p>${esc(t.texto)}</p>`))
        .join("")}
      <p class="rot">Como o modelo funciona</p><p class="sub">${esc(modelo.comoFunciona)}</p>
      <p class="rot">Racional científico</p><p class="sub">${esc(modelo.racionalCientifico)}</p>
      ${reavaliacoes.length ? `<p class="rot">Reavaliação prevista</p><p class="sub">Ao fim das semanas ${reavaliacoes.join(", ")}.</p>` : ""}
      ${
        procedencia.length
          ? `${rotulo("Procedência das doses")}
             <table class="dados">
               <thead><tr><th style="width:54mm">Critério aplicado</th><th>Base</th></tr></thead>
               <tbody>${procedencia.map(([criterio, base]) => `<tr><td>${esc(criterio)}</td><td>${esc(base)}</td></tr>`).join("")}</tbody>
             </table>`
          : ""
      }`
    }

    ${folha ? "" : rotulo(`Macrociclo: ${plano.macrociclo.objetivoGeral}`)}
    ${(() => {
      // Agrupa os blocos por FASE (mesma chave do gráfico): o cabeçalho sai uma vez por fase.
      const porFase = new Map<string, Mesociclo[]>();
      for (const m of mesosImpressos) {
        const k = chaveDaFase(m);
        porFase.set(k, [...(porFase.get(k) ?? []), m]);
      }
      return [...porFase.values()].map((ms, i) => faseHtml(ms, i + 1, folha)).join("");
    })()}

    ${
      !folha && biblio.length
        ? `${rotulo("Base científica")}
            <ol class="refs">
              ${biblio
                .map(
                  (b) =>
                    `<li>${esc(semPontoFinal(b.ref.autores))}. ${esc(semPontoFinal(b.ref.titulo))}. ${esc(semPontoFinal(b.ref.fonte))}, ${b.ref.ano}.${
                      b.ref.doi ? ` doi:${esc(b.ref.doi)}` : ""
                    }</li>`,
                )
                .join("")}
            </ol>`
        : ""
    }

    <div class="assinaturas">
      <div>
        <div class="linha-ass"></div>
        <b>${esc(profissional)}</b>
        <div class="mini">Profissional de Educação Física${cref ? ` · CREF ${esc(cref)}` : ""}</div>
      </div>
      <div>
        <div class="linha-ass"></div>
        <b>${esc(aluno.nome)}</b>
        <div class="mini">Ciente do plano e das orientações</div>
      </div>
    </div>`,
  });

  if (apenasHtml) return html;

  abrirDocumento(html);
}
