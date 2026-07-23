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
import type { MarcaDocumento } from "@/lib/store";
import { bibliografia } from "@/data/referencias";
import { rotuloRestricao, GATILHOS_OPCOES, LADO_OPCOES, LIBERACAO_OPCOES } from "@/lib/gps/restricoes";
import { getParam } from "@/data/monitoringParameters";
import { getSpecialGroup } from "@/data/specialGroups";
import { espinhaCuidadoPdf } from "@/lib/pdfSelo";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const fmt = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ts));

const SEMAFORO_LABEL = {
  verde: { nome: "LIBERADO", hex: "#147a3a" },
  amarelo: { nome: "LIBERADO COM AJUSTE", hex: "#b45309" },
  vermelho: { nome: "NÃO LIBERADO NO DIA", hex: "#b91c1c" },
} as const;

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
            `<tr><td class="crit">${esc(b.criterio)}</td><td class="pts">${b.peso > 0 ? "+" : ""}${b.peso.toFixed(1)}${
              b.pontosPossiveis > 0 ? ` / ${b.pontosPossiveis.toFixed(1)}` : ""
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
    ? `<section class="bloco"><h2>Base da semana: modalidades</h2><ul>${prontuario.modalidades
        .map((m) => `<li><strong>${esc(m.nome)}</strong>: ${esc(m.motivo)}</li>`)
        .join("")}</ul></section>`
    : "";

  // Sem o rótulo clínico do grupo no cabeçalho: o documento vai para o aluno.
  const cuidadosHtml = prontuario.cuidadosGrupo
    ? `<section class="bloco"><h2>Cuidados considerados neste perfil</h2>
       <ul>${prontuario.cuidadosGrupo.cuidados
         .map(
           (c) =>
             `<li>${esc(c)}${prontuario.cuidadosGrupo!.refs.length ? ` <span class="refn">[${prontuario.cuidadosGrupo!.refs.map(refN).filter(Boolean).join(",")}]</span>` : ""}</li>`,
         )
         .join("")}</ul></section>`
    : "";

  const sem = prontuario.semaforo;
  const semaforoHtml = sem
    ? `<section class="bloco"><h2>Semáforo de liberação do dia</h2>
       <p><strong style="color:${SEMAFORO_LABEL[sem.resultado].hex}">${SEMAFORO_LABEL[sem.resultado].nome}</strong>
       <span class="mut"> · checklist respondido em ${fmt(sem.data)}</span></p>
       ${sem.ajustes.length ? `<ul>${sem.ajustes.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}</section>`
    : "";

  const params = prontuario.parametros
    .map((id) => getParam(id))
    .filter(Boolean)
    .map(
      (p) =>
        `<li><strong>${esc(p!.nome)}</strong>: ${esc(p!.comoInterpretar)}${
          p!.refIds?.length ? ` <span class="refn">[${p!.refIds.map(refN).filter(Boolean).join(",")}]</span>` : ""
        }</li>`,
    )
    .join("");

  const criterios = (presc.criteriosProgressao ?? []).map((c) => `<li>${esc(c)}</li>`).join("");
  const regressao = (presc.criteriosRegressao ?? []).map((c) => `<li>${esc(c)}</li>`).join("");

  const biblioHtml = biblio.length
    ? `<section class="bloco"><h2>Referências</h2><ol class="refs">${biblio
        .map(
          (b) =>
            `<li>${esc(b.ref.autores)}. ${esc(b.ref.titulo)}. ${esc(b.ref.fonte)}, ${b.ref.ano}.${
              b.ref.doi ? ` <a href="https://doi.org/${esc(b.ref.doi)}">doi:${esc(b.ref.doi)}</a>` : ""
            }</li>`,
        )
        .join("")}</ol></section>`
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

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Prontuário de Decisão · ${esc(aluno.nome)} · ${docId}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; font-size: 13px; }
    .page { max-width: 760px; margin: 0 auto; padding: 32px; }
    .brand { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #0e7c8a; padding-bottom: 12px; }
    .brand .prof { font-size: 19px; font-weight: 800; color: #1e293b; }
    .brand .cref { font-size: 12px; color: #0e7c8a; font-weight: 700; }
    .brand .sub { font-size: 11px; color: #64748b; }
    .selo { text-align: right; }
    .selo .motor { display: inline-block; background: #e0f7f9; color: #0c6b77; border: 1px solid #14b8c455; border-radius: 999px; padding: 3px 10px; font-size: 11px; font-weight: 800; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: .04em; }
    .selo .docid { margin-top: 4px; font-size: 11px; color: #64748b; }
    h1 { font-size: 20px; margin: 18px 0 2px; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 14px; }
    .aluno { background: #f4f6fb; border-radius: 10px; padding: 11px 14px; margin-bottom: 14px; }
    .bloco { margin: 14px 0; }
    /* O PDF circula sozinho e leva a assinatura: a escala precisa estar definida
       DENTRO dele, e não só na tela de onde ele saiu. */
    .escala-nota { font-size: 10px; line-height: 1.5; color: #475569; margin: 0 0 10px; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #0e7c8a; margin: 0 0 6px; }
    .ex { border: 1px solid #e7ecf3; border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; page-break-inside: avoid; }
    .ex-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
    .ex-num { width: 22px; height: 22px; border-radius: 50%; background: #0e7c8a; color: #fff; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
    .ex-nome { font-weight: 800; flex: 1; }
    .ex-series { font-size: 11px; color: #64748b; }
    .ex-score { font-size: 12px; font-weight: 800; color: #147a3a; }
    table.criterios { width: 100%; border-collapse: collapse; }
    table.criterios td { border-top: 1px solid #f1f5f9; padding: 4px 6px; font-size: 11.5px; vertical-align: top; }
    td.crit { font-weight: 700; width: 160px; }
    td.pts { white-space: nowrap; width: 84px; color: #0e7c8a; font-weight: 700; }
    td.d-nome { font-weight: 700; width: 190px; }
    .caut { font-size: 11px; color: #b45309; margin: 6px 0 0; }
    table.desc { width: 100%; border-collapse: collapse; }
    table.desc td, table.desc th { border: 1px solid #e7ecf3; padding: 6px 8px; font-size: 11.5px; text-align: left; vertical-align: top; }
    table.desc th { background: #f4f6fb; font-size: 10.5px; text-transform: uppercase; letter-spacing: .04em; color: #64748b; }
    ul, ol { margin: 4px 0; padding-left: 20px; }
    li { margin-bottom: 3px; }
    .refn { color: #0e7c8a; font-weight: 700; font-size: 10.5px; }
    .refs li { font-size: 11px; color: #475569; }
    .mut { color: #94a3b8; }
    .assinatura { margin-top: 34px; page-break-inside: avoid; display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; }
    .assinatura .linha { border-top: 1.5px solid #1e293b; width: 320px; padding-top: 6px; font-size: 12px; }
    .assinatura .quem { font-weight: 800; }
    .assinatura .data { font-size: 12px; color: #475569; }
    .foot { margin-top: 20px; border-top: 1px solid #e7ecf3; padding-top: 10px; font-size: 10px; color: #94a3b8; }
    @media print { .page { padding: 0; } @page { margin: 14mm; } }
  </style></head><body>
  <div class="page">
    <div class="brand">
      <div style="display:flex;align-items:center;gap:12px">
        ${marca?.logoDataUrl ? `<img src="${marca.logoDataUrl}" alt="" style="height:40px;max-width:140px;object-fit:contain" />` : ""}
        <div>
          <div class="prof">${esc(profissional)}</div>
          ${cref ? `<div class="cref">CREF ${esc(cref)}</div>` : ""}
          ${marca?.empresa ? `<div class="sub">${esc(marca.empresa)}</div>` : ""}
          <div class="sub">Prontuário de Decisão Técnica: prescrição de exercício</div>
        </div>
      </div>
      <div class="selo">
        <span class="motor">Motor RCD · Raciocínio Clínico Documentado · ${esc(prontuario.motorVersao)}</span>
        <div class="docid">Documento ${docId} · ${fmt(prontuario.geradoEm)}</div>
        ${
          marca && (marca.site || marca.email || marca.telefone)
            ? `<div class="docid">${[marca.site, marca.email, marca.telefone].filter((x): x is string => Boolean(x)).map(esc).join(" · ")}</div>`
            : ""
        }
        <div style="display:flex;justify-content:flex-end;margin-top:6px">${espinhaCuidadoPdf(1, "#1b4b66")}</div>
      </div>
    </div>

    <h1>${esc(tituloDoc)}</h1>
    <div class="meta">Registro do raciocínio de decisão: o que foi escolhido, o que foi descartado e por quê.</div>

    <div class="aluno">
      <strong>${esc(aluno.nome)}</strong>${aluno.idade ? ` · ${aluno.idade} anos` : ""} ·
      Objetivo: ${esc(aluno.objetivo)} · Nível: ${esc(aluno.nivel)} · Restrições consideradas: ${restr}${restrNota}
    </div>

    ${semaforoHtml}
    ${cuidadosHtml}
    ${modalidadesHtml}

    <section class="bloco">
      <h2>Exercícios escolhidos: o porquê de cada critério</h2>
      <p class="escala-nota">
        A adequação vai de 0 a 100 e mede o quanto cada exercício combina com o contexto
        declarado acima (objetivo, nível, equipamento disponível, restrições e cuidados da
        condição). Não é nota do exercício em si nem medida do aluno: o mesmo exercício
        recebe adequação diferente para outro contexto. Os critérios que compõem a nota
        estão abertos exercício a exercício abaixo.
      </p>
      ${escolhidosHtml}
    </section>

    ${
      descartadosHtml
        ? `<section class="bloco"><h2>Considerados e descartados, e por quê</h2>
           <table class="desc"><tr><th>Exercício</th><th>Adequação</th><th>Critério decisivo</th></tr>${descartadosHtml}</table></section>`
        : ""
    }

    ${params ? `<section class="bloco"><h2>Parâmetros de acompanhamento</h2><ul>${params}</ul></section>` : ""}
    ${criterios ? `<section class="bloco"><h2>Critérios para avançar</h2><ul>${criterios}</ul></section>` : ""}
    ${regressao ? `<section class="bloco"><h2>Critérios para regredir</h2><ul>${regressao}</ul></section>` : ""}
    ${presc.raciocinio ? `<section class="bloco"><h2>Raciocínio da fase</h2><p>${esc(presc.raciocinio)}</p></section>` : ""}
    ${biblioHtml}

    <div class="assinatura">
      <div class="linha">
        <div class="quem">${esc(profissional)}${cref ? ` · CREF ${esc(cref)}` : ""}</div>
        <div>Assinatura do profissional responsável</div>
      </div>
      <div class="data">${fmt(Date.now())}</div>
    </div>

    <div class="foot">
      Documento de apoio à decisão gerado por Prescrição Inteligente (Motor RCD ${esc(prontuario.motorVersao)}),
      documento ${docId}. Conteúdo educacional: registra e fundamenta o raciocínio do profissional de
      Educação Física habilitado, que é o responsável pela decisão. Não é conduta médica, diagnóstica ou
      terapêutica e não substitui avaliação médica.
    </div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
  </body></html>`;

  const w = window.open("", "_blank", "width=820,height=1000");
  if (!w) {
    alert("Permita pop-ups para exportar o prontuário em PDF.");
    return;
  }
  w.document.write(html);
  w.document.close();
}
