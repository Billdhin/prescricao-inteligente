/**
 * PRONTUÁRIO DE DECISÃO TÉCNICA — exportação (janela de impressão → PDF).
 * O documento-assinatura do Motor RCD: registra POR QUE cada exercício foi
 * escolhido, quais foram considerados e descartados (e por quê), o semáforo do
 * dia, os parâmetros de acompanhamento e a bibliografia numerada — com bloco
 * de assinatura do profissional (nome + CREF) e ID único do documento.
 *
 * "O ChatGPT te dá um treino. Isto é um registro que você pode assinar."
 */

import type { Aluno, Prescricao, ProntuarioSnapshot } from "@/data/alunos";
import { abrirDocumento } from "@/lib/abrirDocumento";
import { rotuloObjetivoPar } from "@/lib/gps/objetivos";
import type { MarcaDocumento } from "@/lib/store";
import { bibliografia } from "@/data/referencias";
import { rotuloRestricao, GATILHOS_OPCOES, LADO_OPCOES, LIBERACAO_OPCOES } from "@/lib/gps/restricoes";
import { getParam } from "@/data/monitoringParameters";
import { getSpecialGroup } from "@/data/specialGroups";
import { cabecalhoCss, cabecalhoHtml } from "@/lib/pdfCabecalho";
import { CORES_PDF as C } from "@/lib/pdfCores";
import { escapar as escP, folhaHtml, rotulo } from "@/lib/pdfPapel";
import { numeroBR, semPontoFinal } from "@/lib/pdfTexto";
import { rotuloSemaforo } from "@/data/semaforo";
import { farmacosAtivos, rotuloFarmaco } from "@/data/farmacos";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const fmt = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ts));

/**
 * A COR de cada resultado; o NOME vem de `data/semaforo` (rotuloSemaforo). Aqui havia uma
 * quarta cópia do vocabulário, e ela já tinha divergido: dizia "NÃO LIBERADO NO DIA" enquanto
 * a tela, o histórico e o PDF do semáforo diziam "Não liberado hoje".
 */
const SEMAFORO_COR = { verde: C.sucesso, amarelo: C.alerta, vermelho: C.perigo } as const;

/** ID legível e estável do documento (deriva do id da prescrição). */
export function idDocumento(prescId: string) {
  let h = 0;
  for (let i = 0; i < prescId.length; i++) h = (h * 31 + prescId.charCodeAt(i)) >>> 0;
  return `RCD-${h.toString(36).toUpperCase().padStart(7, "0").slice(0, 7)}`;
}

export function exportProntuarioPDF({
  aluno,
  presc,
  prontuario,
  profissional,
  cref,
  marca,
}: {
  aluno: Aluno;
  presc: Prescricao;
  prontuario: ProntuarioSnapshot;
  profissional: string;
  cref?: string;
  /** logo, empresa e contato do profissional (Configurações > Sua marca) */
  marca?: MarcaDocumento;
}) {
  const docId = idDocumento(presc.id);
  const biblio = bibliografia(prontuario.refIds);
  const refN = (id: string) => biblio.find((b) => b.ref.id === id)?.n;

  // Título voltado ao ALUNO: nome de programa digno, nunca o rótulo clínico do
  // grupo ("Idoso frágil", "Obesidade mórbida"). Prescrições antigas persistidas
  // podem ter o rótulo clínico no título; recalcula a partir do grupo.
  const grupoDoc = presc.grupoEspecial ? getSpecialGroup(presc.grupoEspecial) : undefined;
  const tituloDoc = grupoDoc
    ? `${grupoDoc.rotuloAluno}${presc.faseJornada ? ` · Fase ${presc.faseJornada}` : ""}`
    : presc.titulo;

  const escolhidosHtml = prontuario.escolhidos
    .map((e, i) => {
      const criterios = e.breakdown
        .map(
          (b) =>
            `<tr><td class="crit">${esc(b.criterio)}</td><td class="pts">${b.peso > 0 ? "+" : ""}${numeroBR(b.peso, 1)}${
              b.pontosPossiveis > 0 ? ` / ${numeroBR(b.pontosPossiveis, 1)}` : ""
            }</td><td>${esc(b.detalhe)}</td></tr>`,
        )
        .join("");
      const cautions = e.cautions.length
        ? `<p class="caut">Cautelas: ${e.cautions.map(esc).join(" · ")}</p>`
        : "";
      return `
      <div class="ex">
        <div class="ex-head">
          <span class="ex-num">${i + 1}</span>
          <span class="ex-nome">${esc(e.nome)}</span>
          ${e.series ? `<span class="ex-series">${esc(e.series)}</span>` : ""}
          <span class="ex-score">adequação ${e.score}/100</span>
        </div>
        <table class="criterios"><tbody>${criterios}</tbody></table>
        ${cautions}
      </div>`;
    })
    .join("");

  const descartadosHtml = prontuario.descartados
    .map(
      (d) =>
        `<tr><td class="d-nome">${esc(d.nome)}</td><td class="pts">${d.score}/100</td><td>${esc(d.motivoPrincipal)}</td></tr>`,
    )
    .join("");

  const modalidadesHtml = prontuario.modalidades?.length
    ? `${rotulo("Base da semana: modalidades")}<ul>${prontuario.modalidades
        .map((m) => `<li><strong>${esc(m.nome)}</strong>: ${esc(m.motivo)}</li>`)
        .join("")}</ul>`
    : "";

  // Dois objetivos: sai no papel só quando existe secundário. O texto vem pronto da matriz
  // (linhaObjetivos), para o PDF nunca reescrever a regra por conta própria.
  const objetivosHtml = prontuario.objetivos
    ? `${rotulo(`Dois objetivos (${prontuario.objetivos.estado})`)}<p>${esc(prontuario.objetivos.linha)}</p>`
    : "";

  // Sem o rótulo clínico do grupo no cabeçalho: o documento vai para o aluno.
  // A referência é do CONJUNTO de regras, não de cada bala: repetida linha a linha, ela
  // ensinava o leitor a ignorar o marcador. Vai uma vez, no fim do bloco.
  const cuidadosHtml = prontuario.cuidadosGrupo
    ? `${rotulo("Cuidados considerados neste perfil")}
       <ul>${prontuario.cuidadosGrupo.cuidados.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
       ${prontuario.cuidadosGrupo.refs.length
         ? `<p class="mut">Base destes cuidados: <span class="refn">[${prontuario.cuidadosGrupo.refs.map(refN).filter(Boolean).join(",")}]</span></p>`
         : ""}`
    : "";

  const sem = prontuario.semaforo;
  const fmtHora = (ts: number) =>
    new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
  const semaforoHtml = sem
    ? `${rotulo("Semáforo de liberação do dia")}
       <p><b style="color:${SEMAFORO_COR[sem.resultado]}">${esc(rotuloSemaforo(sem.resultado))}</b>
       <span class="mut"> · checklist respondido em ${fmtHora(sem.data)}</span></p>
       ${sem.ajustes.length ? `<ul>${sem.ajustes.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}`
    : "";

  // Qual instrumento saiu de guia e qual entrou. Só sai no papel quando algo de fato mudou; um
  // bloco vazio ensinaria o leitor a pular a seção justamente no dia em que ela tem conteúdo.
  const mon = prontuario.monitoramento;
  const nomeParam = (id: string) => esc(getParam(id)?.nome ?? id);
  const monitoramentoHtml =
    mon && mon.saiu.length
      ? `${rotulo("Como a intensidade foi guiada neste aluno")}
         <p><strong>Deixou de guiar:</strong> ${mon.saiu.map(nomeParam).join(", ")}.
         <strong>Passou a guiar:</strong> ${mon.entrou.map(nomeParam).join(", ")}.${
           mon.refIds.length ? ` <span class="refn">[${mon.refIds.map(refN).filter(Boolean).join(",")}]</span>` : ""
         }</p>
         <p>${esc(mon.motivo)}</p>${
           mon.reforcados?.length
             ? `<p><strong>Sob vigilância maior:</strong> ${mon.reforcados.map(nomeParam).join(", ")}.</p>`
             : ""
         }</section>`
      : "";

  /*
   * A MEDICAÇÃO DECLARADA. O motor já usa a classe para escolher o instrumento de intensidade
   * e para acrescentar cuidado, mas o documento assinável não dizia que havia medicação: o
   * cuidado saía como bala anônima. Os três estados do perfil são diferentes e todos importam
   * aqui: classes declaradas, "nenhuma medicação contínua" e "não sei informar" (silêncio não
   * é resposta). Só a CLASSE, nunca dose, marca ou horário: é o que o dado comporta.
   */
  const classes = farmacosAtivos(aluno.farmacos);
  const medicacaoHtml = (() => {
    if (classes.length) {
      return `${rotulo("Medicação declarada no perfil")}
        <p>${classes.map((f) => `<span class="tagp">${esc(rotuloFarmaco(f.classe))}</span>`).join(" ")}</p>
        <p class="mut">Classe de uso contínuo declarada pelo profissional. O documento registra a classe porque ela participa das decisões acima; a conduta sobre a medicação é do profissional de saúde que a prescreveu.</p>`;
    }
    if (aluno.farmacosNenhum) return `${rotulo("Medicação declarada no perfil")}<p>Nenhuma medicação contínua declarada.</p>`;
    if (aluno.farmacosNaoInformado)
      return `${rotulo("Medicação declarada no perfil")}<p>Não informada. As decisões acima foram tomadas sem esse dado.</p>`;
    return "";
  })();

  const params = prontuario.parametros
    .map((id) => getParam(id))
    .filter(Boolean)
    .map(
      (p) =>
        `<li><b>${esc(p!.nome)}</b>: ${esc(p!.comoInterpretar)}${
          p!.refIds?.length ? ` <span class="refn">[${p!.refIds.map(refN).filter(Boolean).join(",")}]</span>` : ""
        }<div class="mut">Se estiver alterado: ${esc(p!.seAlterado)}</div></li>`,
    )
    .join("");

  const criterios = (presc.criteriosProgressao ?? []).map((c) => `<li>${esc(c)}</li>`).join("");
  const regressao = (presc.criteriosRegressao ?? []).map((c) => `<li>${esc(c)}</li>`).join("");

  /*
   * A BIBLIOGRAFIA PARTE, E A ASSINATURA VAI COM A ÚLTIMA REFERÊNCIA.
   *
   * Como bloco fechado ela media ~117 mm e não cabia no vão de ~113 mm que sobrava: o
   * conjunto inteiro pulava para uma quarta folha e deixava 44% da terceira em branco.
   * Tentei encurtar a altura em duas colunas, primeiro por `column-count` e depois por
   * tabela, e medi a MESMA quebra nas duas: na impressão o Chrome não encaixa um bloco de
   * múltiplas colunas (nem um container flex) no que resta da folha, ele empurra inteiro.
   * O que resolve é deixar a lista partir como qualquer texto e prender a assinatura à
   * parte de baixo dela (`break-before: avoid`), que era o medo original: assinatura sozinha.
   */
  const itemRef = (b: (typeof biblio)[number]) =>
    `<li>${esc(semPontoFinal(b.ref.autores))}. ${esc(semPontoFinal(b.ref.titulo))}. ${esc(b.ref.fonte)}, ${b.ref.ano}.${
      b.ref.doi ? ` <a href="https://doi.org/${esc(b.ref.doi)}">doi:${esc(b.ref.doi)}</a>` : ""
    }</li>`;
  const biblioHtml = biblio.length
    ? `${rotulo("Referências")}<ol class="refs">${biblio.map(itemRef).join("")}</ol>`
    : "";

  // O documento é assinável: ele só pode afirmar o que o motor de fato considerou.
  // Por isso a fonte é presc.answers.restricoes (o que entrou no cálculo), não o
  // cadastro do aluno. Se o profissional declarou algo no perfil e não marcou no
  // wizard, isso aparece separado como "declarada, não aplicada ao ranqueamento".
  const usadas = presc.answers.restricoes ?? [];
  const usadasTags = new Set(usadas.map((r) => r.tag));
  const naoAplicadas = aluno.restricoes.filter((r) => !usadasTags.has(r.tag));
  // Detalha cada restrição considerada (rótulo + gatilhos/lado/gravidade/liberação),
  // porque o documento precisa dizer O QUE foi levado em conta, não só que "havia algo".
  const detalheRestricao = (r: (typeof usadas)[number]): string => {
    const partes: string[] = [];
    if (r.gatilhos?.length) partes.push(`aparece ${r.gatilhos.map((g) => (GATILHOS_OPCOES[g] ?? g).toLowerCase()).join(", ")}`);
    if (r.lado) partes.push(`lado ${(LADO_OPCOES.find((l) => l.id === r.lado)?.rotulo ?? r.lado).toLowerCase()}`);
    if (r.regiao) partes.push(`região ${r.regiao.toLowerCase()}`);
    if (r.gravidade) partes.push(`dor ${r.gravidade}`);
    if (r.liberacaoMedica) partes.push(`liberação: ${LIBERACAO_OPCOES.find((l) => l.id === r.liberacaoMedica)?.rotulo.toLowerCase() ?? r.liberacaoMedica}`);
    if (r.dispositivo) partes.push(`dispositivo: ${r.dispositivo.toLowerCase()}`);
    if (r.texto?.trim()) partes.push(`obs.: ${r.texto.trim()}`);
    const rot = esc(rotuloRestricao(r.tag));
    return partes.length ? `${rot} (${esc(partes.join("; "))})` : rot;
  };
  const restr = usadas.length ? usadas.map(detalheRestricao).join("; ") : "nenhuma aplicada";
  const restrNota = naoAplicadas.length
    ? ` (declaradas no cadastro e não aplicadas ao ranqueamento: ${naoAplicadas.map((r) => esc(rotuloRestricao(r.tag))).join(", ")})`
    : "";

  const css = `
    * { box-sizing: border-box; }
    ${cabecalhoCss(C.analise)}
    .motor { display: inline-block; background: ${C.analiseTint}; color: ${C.analise}; border: 1px solid ${C.analiseFill}55; border-radius: 999px; padding: 2px 8px; font-size: 7.5pt; font-weight: 800; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: .04em; }
    .docid { font-size: 8pt; color: ${C.ink2}; }
    .aluno { display: flex; flex-wrap: wrap; gap: 2mm 6mm; background: ${C.papelSuave}; border-radius: 10px; padding: 3mm 4mm; margin: 0 0 4mm; font-size: 9.5pt; }
    .escala-nota { font-size: 8.5pt; line-height: 1.45; color: ${C.ink2}; margin: 0 0 3mm; }
    /* O cartão do exercício pode partir entre folhas: como bloco atômico ele empurrava
       tudo e deixava um terço da folha em branco (medido). O que não parte é a LINHA de
       critério e o cabeçalho, que segue junto das primeiras linhas. */
    .ex { border: 1px solid ${C.borda}; border-radius: 10px; padding: 3mm 3.5mm; margin-bottom: 2.5mm; break-inside: auto; }
    .ex-head { break-after: avoid; }
    table.criterios tr { break-inside: avoid; }
    .ex-head { display: flex; align-items: center; gap: 2.5mm; flex-wrap: wrap; margin-bottom: 1.5mm; }
    .ex-num { width: 6mm; height: 6mm; border-radius: 50%; background: ${C.analise}; color: ${C.sobreMarca}; font-size: 8pt; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
    .ex-nome { font-weight: 800; flex: 1; }
    .ex-series { font-size: 8.5pt; color: ${C.ink2}; }
    .ex-score { font-size: 9pt; font-weight: 800; color: ${C.sucesso}; font-variant-numeric: tabular-nums; }
    table.criterios { width: 100%; border-collapse: collapse; }
    table.criterios td { border-top: 1px solid ${C.linha}; padding: 1.2mm 2mm; font-size: 8.5pt; vertical-align: top; }
    td.crit { font-weight: 700; width: 38mm; }
    td.pts { white-space: nowrap; width: 22mm; color: ${C.analise}; font-weight: 700; font-variant-numeric: tabular-nums; }
    td.d-nome { font-weight: 700; width: 48mm; }
    .caut { font-size: 8.5pt; color: ${C.alerta}; margin: 1.5mm 0 0; }
    ul, ol { margin: 0 0 2mm; padding-left: 5mm; }
    li { margin-bottom: 1mm; }
    .refn { color: ${C.analise}; font-weight: 700; font-size: 8pt; }
    /*
     * DUAS COLUNAS EM TABELA, e não em flex. Medido no Chrome: um container flex não é
     * encaixado no que resta da folha, ele é EMPURRADO inteiro para a próxima, mesmo cabendo
     * (104 mm de bloco em 113 mm de vão). Trocando só o flex por tabela, o mesmo conteúdo
     * fecha em três folhas em vez de quatro. Tabela fragmenta; flex, na impressão, não.
     */
    .refs li { font-size: 8pt; line-height: 1.4; color: ${C.ink2}; margin-bottom: 0.6mm; break-inside: avoid; }
    /*
     * O PASSO DAS SEÇÕES, medido contra a folha. Com o espaçamento padrão do papel o
     * prontuário fechava em quatro folhas com a terceira 44% vazia: a bibliografia mais a
     * assinatura mediam 117 mm e sobravam 105 mm. São dez rótulos de seção e trinta itens de
     * lista, então o que devolve a folha é o passo, não uma margem isolada.
     */
    .rotulo { margin: 3.5mm 0 1.5mm; }
    .assinaturas { margin-top: 4mm; }
    ul li, ol li { margin-bottom: 0.7mm; }
    .mut { color: ${C.ink2}; font-size: 8.5pt; }
    .tagp { display: inline-block; border: 1px solid ${C.analiseFill}66; background: ${C.analiseTint}; color: ${C.analise}; border-radius: 999px; padding: 1px 8px; font-size: 8.5pt; font-weight: 700; margin: 0 3px 3px 0; }
    /*
     * Referências e assinatura andam juntas, mas o que não parte é a BIBLIOGRAFIA, não o
     * fecho inteiro. Com \`break-inside: avoid\` no fecho, o Chrome se recusa a encaixar o
     * bloco de múltiplas colunas no vão que sobrou e empurrava o conjunto para uma folha
     * nova, deixando metade da anterior em branco. Preso o bloco de referências (que cabe em
     * duas colunas), a assinatura vem logo abaixo, na mesma folha.
     */
    .assinaturas { break-before: avoid; }
  `;

  const html = folhaHtml({
    titulo: `Prontuário de Decisão · ${aluno.nome} · ${docId}`,
    cor: C.analise,
    css,
    corridoEsq: `<b>Prontuário de Decisão Técnica</b> · ${escP(aluno.nome)}`,
    corridoDir: `${escP(profissional)}${cref ? ` · CREF ${escP(cref)}` : ""} · ${docId}`,
    rodapeEsq: `Documento ${docId} · decisão de ${escP(fmt(prontuario.geradoEm))}`,
    rodapeDir: `Impresso em ${escP(fmt(Date.now()))}`,
    rodapeLegal: `Documento de apoio à decisão gerado pelo Mapa da Prescrição (Motor ${escP(prontuario.motorVersao)}). Conteúdo educacional: registra e fundamenta o raciocínio do profissional de Educação Física habilitado, que é o responsável pela decisão. Não é conduta médica, diagnóstica ou terapêutica e não substitui avaliação médica.`,
    corpo: `
    ${cabecalhoHtml({
      cor: C.analise,
      nomeCor: C.ink,
      espinhaCor: marca?.corPrimaria || C.marca,
      logoDataUrl: marca?.logoDataUrl,
      profissional,
      cref,
      empresa: marca?.empresa,
      docTipo: "Prontuário de Decisão Técnica: prescrição de exercício",
      no: 1,
      carimbo: `<span class="motor">Motor RCD · ${esc(prontuario.motorVersao)}</span>`,
      direita:
        `<div class="docid">Documento ${docId} · ${fmt(prontuario.geradoEm)}</div>` +
        (marca && (marca.site || marca.email || marca.telefone)
          ? `<div class="docid">${[marca.site, marca.email, marca.telefone].filter((x): x is string => Boolean(x)).map(esc).join(" · ")}</div>`
          : ""),
    })}

    <h1>${esc(tituloDoc)}</h1>
    <p class="sub">Registro do raciocínio de decisão: o que foi escolhido, o que foi descartado e por quê.</p>

    <div class="aluno">
      <span><b>${esc(aluno.nome)}</b>${aluno.idade ? ` · ${aluno.idade} anos` : ""}</span>
      <span>Objetivo: <b>${esc(rotuloObjetivoPar(aluno.objetivo, aluno.objetivoSecundario))}</b></span>
      <span>Nível: <b>${esc(aluno.nivel)}</b></span>
      <span>Restrições consideradas: <b>${restr}</b>${restrNota}</span>
    </div>

    ${semaforoHtml}
    ${medicacaoHtml}
    ${objetivosHtml}
    ${cuidadosHtml}
    ${monitoramentoHtml}
    ${modalidadesHtml}

    ${rotulo("Exercícios escolhidos: o porquê de cada critério")}
    <p class="escala-nota">
      A adequação vai de 0 a 100 e mede o quanto cada exercício combina com o contexto
      declarado acima (objetivo, nível, equipamento disponível, restrições e cuidados da
      condição). Não é nota do exercício em si nem medida do aluno: o mesmo exercício
      recebe adequação diferente para outro contexto.
    </p>
    ${escolhidosHtml}

    ${
      descartadosHtml
        ? `${rotulo("Considerados e descartados, e por quê")}
           <table class="dados"><thead><tr><th>Exercício</th><th class="num">Adequação</th><th>Critério decisivo</th></tr></thead><tbody>${descartadosHtml}</tbody></table>`
        : ""
    }

    ${params ? `${rotulo("Parâmetros de acompanhamento")}<ul>${params}</ul>` : ""}
    ${criterios ? `${rotulo("Critérios para avançar")}<ul>${criterios}</ul>` : ""}
    ${regressao ? `${rotulo("Critérios para regredir")}<ul>${regressao}</ul>` : ""}
    ${presc.raciocinio ? `${rotulo("Raciocínio da fase")}<div class="destaque">${esc(presc.raciocinio)}</div>` : ""}

    <div class="fecho">
      ${biblioHtml}
      <div class="assinaturas">
        <div>
          <div class="linha-ass"></div>
          <b>${esc(profissional)}${cref ? ` · CREF ${esc(cref)}` : ""}</b>
          <div class="mini">Assinatura do profissional responsável</div>
        </div>
        <div>
          <div class="linha-ass"></div>
          <b>Decisão registrada em ${esc(fmt(prontuario.geradoEm))}</b>
          <div class="mini">Documento ${docId}</div>
        </div>
      </div>
    </div>`,
  });

  abrirDocumento(html);
}
