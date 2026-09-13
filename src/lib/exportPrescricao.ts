import type { Aluno, Prescricao } from "@/data/alunos";
import { abrirDocumento } from "@/lib/abrirDocumento";
import { rotuloObjetivoPar } from "@/lib/gps/objetivos";
import type { MarcaDocumento } from "@/lib/store";
import { exercises } from "@/data/exercises";
import { getModalidade } from "@/data/modalities";
import { rotuloRestricao, restricoesAtivas } from "@/lib/gps/restricoes";
import { getParam } from "@/data/monitoringParameters";
import { getSpecialGroup } from "@/data/specialGroups";
import { cabecalhoCss, cabecalhoHtml } from "@/lib/pdfCabecalho";
import { CORES_PDF as C } from "@/lib/pdfCores";
import { escapar as esc, folhaHtml, rotulo } from "@/lib/pdfPapel";

const fmt = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ts));

const nomeEx = (slug: string) => exercises.find((e) => e.slug === slug);

/**
 * A PRESCRIÇÃO DO DIA no papel.
 *
 * O que mudou em 12/09/2026, medindo o papel contra a tela e contra o prontuário:
 *
 * - Parâmetros a monitorar e critérios de progressão só saíam quando o aluno tinha grupo
 *   especial (moravam dentro do bloco da jornada). O motor preenche os dois para qualquer
 *   aluno: para quem não tem grupo, o papel saía mudo.
 * - CRITÉRIOS PARA REGREDIR não eram impressos em lugar nenhum desta folha, só no
 *   prontuário. Documento que diz quando avançar e cala quando recuar é assimétrico no lado
 *   perigoso.
 * - As restrições vinham de `aluno.restricoes` cru, com a sentinela "nenhuma restrição"
 *   incluída; agora usa as que de fato entraram no cálculo (`presc.answers.restricoes`,
 *   filtradas por `restricoesAtivas`), como o prontuário já fazia.
 * - Exercício fora do catálogo imprimia o slug ("leg-press-45") no papel do aluno.
 * - Fecho do documento no padrão da família: identificação em toda folha, aviso no rodapé e
 *   linha de assinatura com CREF.
 */
export function exportPrescricaoPDF({
  aluno,
  presc,
  profissional,
  cref,
  marca,
}: {
  aluno: Aluno;
  presc: Prescricao;
  profissional: string;
  cref?: string;
  /** logo, empresa e contato do profissional (Configurações > Sua marca) */
  marca?: MarcaDocumento;
}) {
  const grupo = presc.grupoEspecial ? getSpecialGroup(presc.grupoEspecial) : undefined;
  const modPrincipal = presc.modalidadePrincipal ? getModalidade(presc.modalidadePrincipal) : undefined;
  // Documento entregue ao aluno: nome de PROGRAMA digno, nunca o rótulo clínico.
  const tituloDoc = grupo
    ? `${grupo.rotuloAluno}${presc.faseJornada ? ` · Fase ${presc.faseJornada}` : ""}`
    : presc.titulo;
  const cor = marca?.corPrimaria || C.marca;

  const itensHtml = presc.itens
    .map((it, i) => {
      const ex = nomeEx(it.slug);
      // slug no papel do aluno é vazamento de banco de dados: sem o catálogo, some o item
      if (!ex) return "";
      const resumo = ex.resumoPratico ?? "";
      return `
      <li class="ex">
        <div class="ex-head">
          <span class="ex-num">${i + 1}</span>
          <span class="ex-nome">${esc(ex.nome)}</span>
          <span class="ex-score">adequação ${it.score}/100</span>
        </div>
        ${resumo ? `<p class="ex-resumo">${esc(resumo)}</p>` : ""}
        ${
          /*
           * DOSE DE FORÇA NÃO SAI EM EXERCÍCIO AERÓBIO. "Caminhada inclinada (esteira) ·
           * 3 séries · 10 a 12 reps" é a mesma classe de defeito que "Bicicleta ergométrica
           * 3 séries de 13 repetições" foi na tela, e aqui num papel assinado. A origem já
           * foi corrigida (o motor não grava mais série em aeróbio), mas a prescrição
           * ARQUIVADA guarda o texto antigo: quem decide o que imprime é o catálogo.
           */
          it.series && !ex.doseAerobia ? `<p class="ex-series">Sugestão: ${esc(it.series)}</p>` : ""
        }
      </li>`;
    })
    .join("");

  const params = (presc.parametrosControle ?? [])
    .map((id) => getParam(id)?.nome)
    .filter(Boolean)
    .map((n) => `<span class="tag">${esc(n as string)}</span>`)
    .join("");

  const lista = (itens?: string[]) => (itens ?? []).map((c) => `<li>${esc(c)}</li>`).join("");
  const avancar = lista(presc.criteriosProgressao);
  const regredir = lista(presc.criteriosRegressao);

  // A estratégia é do grupo; os parâmetros e os critérios valem para qualquer aluno.
  const estrategiaHtml = grupo
    ? `${rotulo("Estratégia de progressão")}
       <p><b>${esc(grupo.rotuloAluno)}</b>${presc.faseJornada ? ` · Fase ${presc.faseJornada}` : ""}${
         modPrincipal ? ` · Modalidade principal: ${esc(modPrincipal.nome)}` : ""
       }</p>`
    : modPrincipal
      ? `${rotulo("Estratégia de progressão")}<p>Modalidade principal: <b>${esc(modPrincipal.nome)}</b></p>`
      : "";

  const acompanhamentoHtml =
    params || avancar || regredir
      ? `${rotulo("Acompanhamento")}
         ${params ? `<p class="rot">Parâmetros a monitorar</p><div class="tags">${params}</div>` : ""}
         <div class="duas">
           ${avancar ? `<div><p class="rot">Critérios para avançar</p><ul class="crit">${avancar}</ul></div>` : ""}
           ${regredir ? `<div><p class="rot">Critérios para regredir ou revisar</p><ul class="crit">${regredir}</ul></div>` : ""}
         </div>`
      : "";

  const raciocinioHtml = presc.raciocinio ? `${rotulo("Raciocínio")}<div class="destaque">${esc(presc.raciocinio)}</div>` : "";
  const obsHtml = presc.observacoes ? `${rotulo("Observações")}<p>${esc(presc.observacoes)}</p>` : "";

  // As restrições que ENTRARAM no cálculo, sem a sentinela "nenhuma restrição".
  const restricoes = restricoesAtivas(presc.answers?.restricoes ?? aluno.restricoes ?? []);
  const restr = restricoes.length ? restricoes.map((r) => esc(rotuloRestricao(r.tag))).join(", ") : "nenhuma";

  const css = `
    * { box-sizing: border-box; }
    /*
     * O título do programa é longo ("Condicionamento com monitoramento da pressão · Fase 2")
     * e a 20pt ele quebrava deixando "2" sozinho na segunda linha; as duas linhas ainda
     * empurravam a assinatura para uma segunda folha que só tinha ela. A 17pt o título cabe
     * numa linha e o documento fecha em uma folha, que é como ele é entregue.
     */
    h1 { font-size: 17pt; text-wrap: balance; }
    .rotulo { margin: 3.5mm 0 1.5mm; }
    .assinaturas { margin-top: 4mm; }
    ${cabecalhoCss(cor)}
    .aluno { display: flex; flex-wrap: wrap; gap: 1.5mm 6mm; background: ${C.papelSuave}; border-radius: 10px; padding: 2.5mm 3.5mm; margin: 0 0 3mm; font-size: 9.5pt; }
    ul.exs { list-style: none; padding: 0; margin: 0; }
    .ex { border: 1px solid ${C.borda}; border-radius: 10px; padding: 2.2mm 3mm; margin-bottom: 1.8mm; break-inside: avoid; }
    .ex-head { display: flex; align-items: center; gap: 2.5mm; }
    .ex-num { width: 6mm; height: 6mm; border-radius: 50%; background: ${cor}; color: ${C.sobreMarca}; font-size: 8pt; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
    .ex-nome { font-weight: 700; flex: 1; }
    .ex-score { font-size: 8.5pt; font-weight: 700; color: ${C.sucesso}; font-variant-numeric: tabular-nums; }
    .ex-resumo { font-size: 9.5pt; color: ${C.ink2}; margin: 1mm 0 0; }
    .ex-series { font-size: 9pt; color: ${C.ink2}; margin: 0.8mm 0 0; }
    .rot { font-size: 7.5pt; text-transform: uppercase; letter-spacing: .08em; color: ${C.ink2}; margin: 2mm 0 1mm; break-after: avoid; }
    .tags { display: flex; flex-wrap: wrap; gap: 1.5mm; }
    ul.crit { margin: 0; padding-left: 5mm; }
    ul.crit li { margin-bottom: 1mm; }
    .duas { display: flex; gap: 6mm; align-items: flex-start; }
    .duas > div { flex: 1; min-width: 0; }
  `;

  abrirDocumento(
    folhaHtml({
      titulo: `Prescrição · ${aluno.nome}`,
      cor,
      css,
      corridoEsq: `<b>Prescrição de exercício</b> · ${esc(aluno.nome)}`,
      corridoDir: `${esc(profissional)}${cref ? ` · CREF ${esc(cref)}` : ""}`,
      rodapeEsq: `Prescrição de ${esc(fmt(presc.data))}`,
      rodapeDir: `Impresso em ${esc(fmt(Date.now()))}`,
      rodapeLegal:
        "Conteúdo educacional e de apoio à decisão; não substitui avaliação profissional individualizada nem prescrição clínica. Gerado pelo Mapa da Prescrição.",
      corpo: `
    ${cabecalhoHtml({
      cor,
      logoDataUrl: marca?.logoDataUrl,
      profissional,
      cref,
      empresa: marca?.empresa,
      docTipo: "Prescrição de exercício",
      no: 1,
      direita: `<div class="sub">${esc(fmt(presc.data))}${
        marca && (marca.site || marca.email || marca.telefone)
          ? `<br>${[marca.site, marca.email, marca.telefone].filter((x): x is string => Boolean(x)).map(esc).join(" · ")}`
          : ""
      }</div>`,
    })}

    <h1>${esc(tituloDoc)}</h1>
    <p class="sub">Prescrição individualizada, gerada com raciocínio documentado.</p>

    <div class="aluno">
      <span><b>${esc(aluno.nome)}</b>${aluno.idade ? ` · ${aluno.idade} anos` : ""}</span>
      <span>Objetivo: <b>${esc(rotuloObjetivoPar(aluno.objetivo, aluno.objetivoSecundario))}</b></span>
      <span>Nível: <b>${esc(aluno.nivel)}</b></span>
      <span>Restrições: <b>${restr}</b></span>
    </div>

    ${estrategiaHtml}
    ${rotulo("Exercícios recomendados")}
    <ul class="exs">${itensHtml}</ul>

    ${acompanhamentoHtml}
    ${raciocinioHtml}
    ${obsHtml}

    <div class="assinaturas">
      <div>
        <div class="linha-ass"></div>
        <b>${esc(profissional)}</b>
        <div class="mini">Profissional de Educação Física${cref ? ` · CREF ${esc(cref)}` : ""}</div>
      </div>
      <div>
        <div class="linha-ass"></div>
        <b>Data</b>
        <div class="mini">Conversado com o aluno</div>
      </div>
    </div>`,
    }),
  );
}
