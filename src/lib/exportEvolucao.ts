import type { MarcaDocumento } from "@/lib/store";
import type { Aluno, Avaliacao } from "@/data/alunos";
import { METRICAS_EVOLUCAO, type DirMetrica } from "@/components/app/EvolucaoMini";
import { getSpecialGroup } from "@/data/specialGroups";
import { cabecalhoCss, cabecalhoHtml } from "@/lib/pdfCabecalho";

/**
 * Tabela de evolução do aluno em PDF, no estilo de um resultado de exame: cada
 * variável nas linhas, cada avaliação em uma coluna cronológica, e a última coluna
 * com o quanto mudou do primeiro ao último exame. O profissional imprime para
 * mostrar ao aluno e o aluno leva para casa.
 *
 * Documento honesto: as medidas dependem do método e do dia; a evolução é
 * tendência, não valor exato. Cores literais (o papel não tem as variáveis do
 * tema). Sem travessão. O rótulo clínico do grupo NUNCA entra: se o aluno tem
 * grupo, imprime o `rotuloAluno` (linguagem digna), nunca o nome clínico.
 */

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const fmtLongo = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ts));
const fmtCurto = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "2-digit" }).format(new Date(ts));

// Mesma regra do EvolucaoMini (corDelta), em cores literais do papel: nunca
// inverte o sinal; a direção desejável da métrica decide o que é bom. Verde e
// vermelho dos demais documentos (exportProntuario/printSemaforo), fora das
// tints aposentadas.
function corDeltaPdf(dir: DirMetrica, delta: number): string {
  if (dir === "neutro" || delta === 0) return "#64748b";
  const bom = dir === "menor" ? delta < 0 : delta > 0;
  return bom ? "#147a3a" : "#b91c1c";
}

export interface EvolucaoPdfOpts {
  aluno: Aluno;
  avaliacoes: Avaliacao[];
  profissional: string;
  cref?: string;
  marca?: MarcaDocumento;
}

/**
 * Monta o HTML do documento (função pura, sem tocar em `window`), para o export
 * abaixo e para o guardrail `check:documentos` conseguir varrer a saída.
 */
export function montarEvolucaoHtml({ aluno, avaliacoes, profissional, cref, marca }: EvolucaoPdfOpts): string {
  const cor = marca?.corPrimaria || "#1b4b66";
  const cols = [...avaliacoes].sort((a, b) => a.data - b.data);
  const linhas = METRICAS_EVOLUCAO.filter((m) => cols.some((a) => a.medidas[m.key] != null));

  // Se o aluno tem grupo, o papel mostra o programa em linguagem digna
  // (rotuloAluno). O nome clínico do grupo NUNCA vai para o documento do aluno.
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;
  const programa = grupo?.rotuloAluno;

  const cabProg = programa
    ? `<div class="meta">Programa: <strong style="color:${cor}">${esc(programa)}</strong></div>`
    : "";

  const cabDatas = cols
    .map((a) => `<th style="padding:6px 8px;text-align:right;font-weight:700;color:${cor};border-bottom:2px solid #e7ecf3">${esc(fmtCurto(a.data))}</th>`)
    .join("");

  const corpo = linhas
    .map((m) => {
      const serie = cols.map((a) => a.medidas[m.key]);
      const presentes = serie.filter((v): v is number => v != null);
      const primeiro = presentes[0];
      const ultimo = presentes[presentes.length - 1];
      const delta =
        presentes.length >= 2 && primeiro != null && ultimo != null ? +(ultimo - primeiro).toFixed(1) : null;

      const celulas = serie
        .map((v) =>
          v != null
            ? `<td style="padding:6px 8px;text-align:right;color:#1e293b;border-bottom:1px solid #f1f5f9">${v}<span style="color:#94a3b8">${esc(m.unit)}</span></td>`
            : `<td style="padding:6px 8px;text-align:right;color:#94a3b8;border-bottom:1px solid #f1f5f9">·</td>`,
        )
        .join("");

      const celDelta =
        delta != null
          ? `<td style="padding:6px 8px;text-align:right;font-weight:700;color:${corDeltaPdf(m.dir, delta)};border-bottom:1px solid #f1f5f9">${delta > 0 ? "+" : ""}${delta}<span style="opacity:.7">${esc(m.unit)}</span></td>`
          : `<td style="padding:6px 8px;text-align:right;color:#94a3b8;border-bottom:1px solid #f1f5f9">·</td>`;

      return `<tr><th style="padding:6px 8px;text-align:left;font-weight:600;color:#334155;border-bottom:1px solid #f1f5f9;white-space:nowrap">${esc(m.label)}</th>${celulas}${celDelta}</tr>`;
    })
    .join("");

  const tabela =
    linhas.length && cols.length
      ? `<table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr>
              <th style="padding:6px 8px;text-align:left;font-weight:700;color:${cor};border-bottom:2px solid #e7ecf3">Medida</th>
              ${cabDatas}
              <th style="padding:6px 8px;text-align:right;font-weight:700;color:${cor};border-bottom:2px solid #e7ecf3">Evolução</th>
            </tr>
          </thead>
          <tbody>${corpo}</tbody>
        </table>`
      : `<p class="meta">Nenhuma medida numérica registrada ainda.</p>`;

  // Anotações livres do profissional por avaliação (entram no papel como escritas).
  const anotacoes = cols
    .filter((a) => a.observacoes?.trim())
    .map(
      (a) =>
        `<li><span style="color:${cor};font-weight:700">${esc(fmtLongo(a.data))}:</span> ${esc(a.observacoes!.trim())}</li>`,
    )
    .join("");

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Evolução · ${esc(aluno.nome)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; }
    .page { max-width: 820px; margin: 0 auto; padding: 32px; }
    ${cabecalhoCss(cor)}
    h1 { font-size: 22px; margin: 20px 0 2px; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 8px; }
    .tabela-wrap { overflow-x: auto; margin: 14px 0 4px; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: ${cor}; margin: 20px 0 6px; }
    .notas { font-size: 12px; color: #334155; padding-left: 18px; margin: 6px 0 0; }
    .notas li { margin: 3px 0; }
    .foot { margin-top: 24px; border-top: 1px solid #e7ecf3; padding-top: 12px; font-size: 11px; color: #94a3b8; }
    @media print { .page { padding: 0; } @page { margin: 16mm; } }
  </style></head><body>
  <div class="page">
    ${cabecalhoHtml({
      cor,
      logoDataUrl: marca?.logoDataUrl,
      profissional,
      cref,
      empresa: marca?.empresa,
      docTipo: "Evolução do aluno",
      no: 0,
      direita: `<div class="sub">${esc(fmtLongo(Date.now()))}</div>`,
    })}

    <h1>Evolução de ${esc(aluno.nome)}</h1>
    <div class="meta">Comparativo das medidas registradas ao longo do acompanhamento.</div>
    ${cabProg}

    <div class="tabela-wrap">${tabela}</div>

    ${anotacoes ? `<h2>Anotações por avaliação</h2><ul class="notas">${anotacoes}</ul>` : ""}

    <div class="foot">
      As medidas dependem do método e das condições de cada dia; leia a evolução como
      tendência, não como valor exato. Documento de apoio à conduta do profissional
      responsável. Não constitui diagnóstico. Gerado pelo Mapa da Prescrição.
    </div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
  </body></html>`;
}

export function exportEvolucaoPDF(opts: EvolucaoPdfOpts) {
  const html = montarEvolucaoHtml(opts);
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) {
    alert("Permita pop-ups para exportar a evolução em PDF.");
    return;
  }
  w.document.write(html);
  w.document.close();
}
