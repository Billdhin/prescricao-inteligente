import type { Aluno, Prescricao } from "@/data/alunos";
import type { MarcaDocumento } from "@/lib/store";
import { exercises } from "@/data/exercises";
import { getModalidade } from "@/data/modalities";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { getParam } from "@/data/monitoringParameters";
import { getSpecialGroup } from "@/data/specialGroups";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const fmt = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ts));

const nomeEx = (slug: string) => exercises.find((e) => e.slug === slug);

/**
 * Exporta uma prescrição como PDF (via a caixa de impressão do navegador →
 * "Salvar como PDF"), num layout limpo com a marca do profissional. Sem
 * dependências extras. Deve ser chamada a partir de um clique do usuário.
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

  const itensHtml = presc.itens
    .map((it, i) => {
      const ex = nomeEx(it.slug);
      const nome = ex?.nome ?? it.slug;
      const resumo = ex?.resumoPratico ?? "";
      return `
      <li class="ex">
        <div class="ex-head">
          <span class="ex-num">${i + 1}</span>
          <span class="ex-nome">${esc(nome)}</span>
          <span class="ex-score">adequação ${it.score}/100</span>
        </div>
        ${resumo ? `<p class="ex-resumo">${esc(resumo)}</p>` : ""}
        ${it.series ? `<p class="ex-series">Sugestão: ${esc(it.series)}</p>` : ""}
      </li>`;
    })
    .join("");

  const params = (presc.parametrosControle ?? [])
    .map((id) => getParam(id)?.nome)
    .filter(Boolean)
    .map((n) => `<span class="tag">${esc(n as string)}</span>`)
    .join("");

  const criterios = (presc.criteriosProgressao ?? [])
    .map((c) => `<li>${esc(c)}</li>`)
    .join("");

  const jornadaHtml = grupo
    ? `
    <section class="bloco">
      <h2>Estratégia de progressão</h2>
      <p><strong>${esc(grupo.rotuloAluno)}</strong>${presc.faseJornada ? ` · Fase ${presc.faseJornada}` : ""}${
        modPrincipal ? ` · Modalidade principal: ${esc(modPrincipal.nome)}` : ""
      }</p>
      ${params ? `<p class="rot">Parâmetros a monitorar</p><div class="tags">${params}</div>` : ""}
      ${criterios ? `<p class="rot">Critérios para avançar</p><ul class="crit">${criterios}</ul>` : ""}
    </section>`
    : "";

  const raciocinioHtml = presc.raciocinio
    ? `<section class="bloco"><h2>Raciocínio</h2><p>${esc(presc.raciocinio)}</p></section>`
    : "";

  const obsHtml = presc.observacoes
    ? `<section class="bloco"><h2>Observações</h2><p>${esc(presc.observacoes)}</p></section>`
    : "";

  const restr = aluno.restricoes.length
    ? aluno.restricoes.map((r) => esc(rotuloRestricao(r.tag))).join(", ")
    : "nenhuma";

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Prescrição · ${esc(aluno.nome)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; }
    .page { max-width: 720px; margin: 0 auto; padding: 32px; }
    .brand { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #2563eb; padding-bottom: 12px; }
    .brand .prof { font-size: 20px; font-weight: 800; color: #2563eb; }
    .brand .sub { font-size: 12px; color: #64748b; }
    h1 { font-size: 22px; margin: 20px 0 2px; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 18px; }
    .aluno { background: #f4f6fb; border-radius: 10px; padding: 12px 14px; font-size: 14px; margin-bottom: 18px; }
    .aluno strong { color: #1e293b; }
    .bloco { margin: 16px 0; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .04em; color: #2563eb; margin: 0 0 8px; }
    ul.exs { list-style: none; padding: 0; margin: 0; }
    .ex { border: 1px solid #e7ecf3; border-radius: 10px; padding: 10px 12px; margin-bottom: 8px; }
    .ex-head { display: flex; align-items: center; gap: 8px; }
    .ex-num { width: 22px; height: 22px; border-radius: 50%; background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
    .ex-nome { font-weight: 700; flex: 1; }
    .ex-score { font-size: 12px; font-weight: 700; color: #16a34a; }
    .ex-resumo { font-size: 13px; color: #475569; margin: 6px 0 0; }
    .ex-series { font-size: 12px; color: #64748b; margin: 4px 0 0; }
    .rot { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #94a3b8; margin: 10px 0 4px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag { background: #eaf1fe; color: #2563eb; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 600; }
    ul.crit { margin: 4px 0; padding-left: 18px; font-size: 13px; }
    .foot { margin-top: 24px; border-top: 1px solid #e7ecf3; padding-top: 12px; font-size: 11px; color: #94a3b8; }
    @media print { .page { padding: 0; } @page { margin: 16mm; } }
  </style></head><body>
  <div class="page">
    <div class="brand">
      <div style="display:flex;align-items:center;gap:12px">
        ${marca?.logoDataUrl ? `<img src="${marca.logoDataUrl}" alt="" style="height:40px;max-width:140px;object-fit:contain" />` : ""}
        <div><div class="prof">${esc(profissional)}</div>${
          cref ? `<div class="sub" style="font-weight:700;color:#2563eb">CREF ${esc(cref)}</div>` : ""
        }${marca?.empresa ? `<div class="sub">${esc(marca.empresa)}</div>` : ""}<div class="sub">Prescrição de exercício</div></div>
      </div>
      <div class="sub" style="text-align:right">${fmt(presc.data)}${
        marca && (marca.site || marca.email || marca.telefone)
          ? `<br>${[marca.site, marca.email, marca.telefone].filter((x): x is string => Boolean(x)).map(esc).join(" · ")}`
          : ""
      }</div>
    </div>

    <h1>${esc(tituloDoc)}</h1>
    <div class="meta">Prescrição individualizada · gerada com raciocínio</div>

    <div class="aluno">
      <strong>${esc(aluno.nome)}</strong>${aluno.idade ? ` · ${aluno.idade} anos` : ""}<br>
      Objetivo: ${esc(aluno.objetivo)} · Nível: ${esc(aluno.nivel)} · Restrições: ${esc(restr)}
    </div>

    ${jornadaHtml}

    <section class="bloco">
      <h2>Exercícios recomendados</h2>
      <ul class="exs">${itensHtml}</ul>
    </section>

    ${raciocinioHtml}
    ${obsHtml}

    <div class="foot">
      Conteúdo educacional e de apoio à decisão; não substitui avaliação profissional
      individualizada nem prescrição clínica. Gerado por Prescrição Inteligente.
    </div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
  </body></html>`;

  const w = window.open("", "_blank", "width=800,height=1000");
  if (!w) {
    alert("Permita pop-ups para exportar a prescrição em PDF.");
    return;
  }
  w.document.write(html);
  w.document.close();
}
