/**
 * Fichas imprimíveis dos parâmetros de monitoramento (via caixa de impressão
 * do navegador → "Salvar como PDF"), com a marca do produto. Duas variantes:
 *  - "escala": cartão de bolso com a escala + como aplicar (PSE, dispneia, dor, fala)
 *  - "adesao": ficha semanal de registro de adesão personalizada (nome/objetivo)
 * Sem dependências extras. Chamar a partir de um clique do usuário.
 */

import type { MonitoringParameter } from "@/data/monitoringParameters";
import { cabecalhoCss, cabecalhoHtml } from "@/lib/pdfCabecalho";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const AVISO =
  "Conteúdo educacional de apoio à decisão do profissional de Educação Física: não é conduta médica e não substitui avaliação profissional individualizada. Gerado por Prescrição Inteligente.";

const CSS = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; }
  .page { max-width: 720px; margin: 0 auto; padding: 32px; }
  ${cabecalhoCss("#1b4b66")}
  h1 { font-size: 22px; margin: 20px 0 2px; }
  .meta { font-size: 13px; color: #64748b; margin-bottom: 18px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #1b4b66; margin: 18px 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #e7ecf3; padding: 8px 10px; font-size: 13px; text-align: left; vertical-align: top; }
  th { background: #f4f6fb; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #64748b; }
  td.v { font-weight: 800; white-space: nowrap; width: 110px; color: #1b4b66; }
  ol { margin: 4px 0; padding-left: 20px; font-size: 13px; }
  ol li { margin-bottom: 4px; }
  .ref { font-size: 11px; color: #64748b; margin-top: 14px; border-top: 1px solid #e7ecf3; padding-top: 10px; }
  .foot { margin-top: 18px; font-size: 10.5px; color: #94a3b8; }
  .campo { display: inline-block; min-width: 220px; border-bottom: 1px solid #94a3b8; padding: 0 4px 1px; font-weight: 700; }
  .linha-campos { font-size: 13px; margin: 6px 0; color: #475569; }
  td.reg { height: 34px; }
  .legenda { font-size: 11.5px; color: #64748b; margin-top: 8px; }
  @media print { .page { padding: 0; } @page { margin: 14mm; } }
`;

function abrir(html: string) {
  const w = window.open("", "_blank", "width=800,height=1000");
  if (!w) {
    alert("Permita pop-ups para imprimir/baixar a ficha.");
    return;
  }
  w.document.write(html);
  w.document.close();
}

function shell(titulo: string, corpo: string, ident?: IdentProf) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>${esc(titulo)}</title><style>${CSS}</style></head><body>
  <div class="page">
    ${cabecalhoHtml({
      logoDataUrl: ident?.logoDataUrl,
      logoAltura: 36,
      profissional: ident?.nome || "Prescrição Inteligente",
      cref: ident?.cref,
      docTipo: "Ficha de apoio ao profissional",
      no: 0,
      direita: `<div class="sub">${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date())}</div>`,
    })}
    ${corpo}
    <div class="foot">${AVISO}</div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
  </body></html>`;
}

export interface IdentProf {
  nome?: string;
  cref?: string;
  logoDataUrl?: string;
}

/** Cartão de escala (PSE, dispneia, dor, teste da fala) + como aplicar. */
export function printEscalaFicha(p: MonitoringParameter, ident?: IdentProf) {
  const escala = (p.escala ?? [])
    .map((e) => `<tr><td class="v">${esc(e.valor)}</td><td>${esc(e.rotulo)}</td></tr>`)
    .join("");
  const passos = (p.comoAplicar ?? []).map((s) => `<li>${esc(s)}</li>`).join("");

  abrir(
    shell(
      `Escala: ${p.nome}`,
      `
      <h1>${esc(p.nome)}${p.sigla ? ` (${esc(p.sigla)})` : ""}</h1>
      <div class="meta">${esc(p.resumo)}</div>
      ${passos ? `<h2>Como aplicar</h2><ol>${passos}</ol>` : ""}
      ${escala ? `<h2>Escala de referência</h2><table><tbody>${escala}</tbody></table>` : ""}
      <h2>Como interpretar</h2><p style="font-size:13px">${esc(p.comoInterpretar)}</p>
      <h2>Se estiver alterado</h2><p style="font-size:13px">${esc(p.seAlterado)}</p>
      ${p.referencia ? `<div class="ref">Referência: ${esc(p.referencia)}</div>` : ""}
      `,
      ident,
    ),
  );
}

/** Ficha semanal de adesão personalizada (registro compartilhado com o aluno). */
export function printAdesaoFicha(
  p: MonitoringParameter,
  ctx?: { alunoNome?: string; objetivo?: string },
  ident?: IdentProf,
) {
  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const head = `<tr><th>Semana</th>${dias.map((d) => `<th style="width:52px;text-align:center">${d}</th>`).join("")}<th style="width:70px">PSE média</th><th>Observações (dor, sono, disposição…)</th></tr>`;
  const linhas = [1, 2, 3, 4]
    .map(
      (n) =>
        `<tr><td class="v">Semana ${n}</td>${dias.map(() => `<td class="reg"></td>`).join("")}<td class="reg"></td><td class="reg"></td></tr>`,
    )
    .join("");
  const passos = (p.comoAplicar ?? []).map((s) => `<li>${esc(s)}</li>`).join("");

  abrir(
    shell(
      `Ficha de adesão${ctx?.alunoNome ? `: ${ctx.alunoNome}` : ""}`,
      `
      <h1>Ficha semanal de adesão</h1>
      <div class="meta">Registro combinado entre profissional e aluno: marque ✓ em cada sessão realizada.</div>
      <div class="linha-campos">Aluno(a): <span class="campo">${esc(ctx?.alunoNome ?? "")}</span>
        &nbsp;&nbsp;Objetivo: <span class="campo">${esc(ctx?.objetivo ?? "")}</span></div>
      <div class="linha-campos">Meta semanal combinada: <span class="campo" style="min-width:120px"></span> sessões
        &nbsp;&nbsp;Período: <span class="campo" style="min-width:160px"></span></div>
      <h2>Registro (4 semanas)</h2>
      <table>${head}${linhas}</table>
      <p class="legenda">✓ sessão realizada · ◐ sessão parcial · ✗ não realizada. PSE: esforço percebido de 0 a 10.</p>
      ${passos ? `<h2>Como usar</h2><ol>${passos}</ol>` : ""}
      <h2>Leitura prática</h2><p style="font-size:13px">${esc(p.comoInterpretar)} ${esc(p.seAlterado)}</p>
      `,
      ident,
    ),
  );
}

export function printFichaParametro(
  p: MonitoringParameter,
  ctx?: { alunoNome?: string; objetivo?: string },
  ident?: IdentProf,
) {
  if (p.ficha === "adesao") printAdesaoFicha(p, ctx, ident);
  else printEscalaFicha(p, ident);
}
