/**
 * Impressão do resultado do Semáforo de Liberação (via caixa de impressão do
 * navegador → "Salvar como PDF"). Registro simples do gate pré-sessão: itens
 * respondidos, resultado e ações — para anexar ao prontuário físico do aluno.
 */

import type { ChecklistSemaforo, ResultadoSemaforo } from "@/data/semaforo";
import { getReferencia } from "@/data/referencias";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const COR = {
  verde: { nome: "LIBERADO", hex: "#16a34a", bg: "#eafaf0" },
  amarelo: { nome: "LIBERADO COM AJUSTE", hex: "#b45309", bg: "#fef7e8" },
  vermelho: { nome: "NÃO LIBERADO HOJE", hex: "#b91c1c", bg: "#fdecec" },
} as const;

export function printSemaforo(
  grupoNome: string,
  checklist: ChecklistSemaforo,
  respostas: Record<string, string>,
  resultado: ResultadoSemaforo,
  alunoNome?: string,
) {
  const cor = COR[resultado.cor];

  const linhas = checklist.itens
    .map((item) => {
      const op = item.opcoes.find((o) => o.valor === respostas[item.id]);
      if (!op) return "";
      const c = COR[op.cor];
      return `<tr>
        <td>${esc(item.pergunta)}</td>
        <td style="white-space:nowrap"><span class="dot" style="background:${c.hex}"></span>${esc(op.rotulo)}</td>
      </tr>`;
    })
    .join("");

  const acoes = resultado.ajustes.map((a) => `<li>${esc(a.acao)}</li>`).join("");

  const refs = resultado.refs
    .map(getReferencia)
    .filter(Boolean)
    .map((r) => `<li>${esc(r!.autores)}. ${esc(r!.titulo)}. ${esc(r!.fonte)}, ${r!.ano}.</li>`)
    .join("");

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Semáforo de Liberação · ${esc(grupoNome)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; }
    .page { max-width: 720px; margin: 0 auto; padding: 32px; }
    .brand { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #14b8c4; padding-bottom: 12px; }
    .brand .prof { font-size: 18px; font-weight: 800; color: #0e7c8a; }
    .brand .sub { font-size: 12px; color: #64748b; }
    h1 { font-size: 20px; margin: 18px 0 2px; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 14px; }
    .resultado { border-radius: 12px; padding: 14px 16px; margin: 14px 0; background: ${cor.bg}; border: 1px solid ${cor.hex}44; }
    .resultado .titulo { font-size: 18px; font-weight: 800; color: ${cor.hex}; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #e7ecf3; padding: 7px 10px; font-size: 13px; text-align: left; }
    th { background: #f4f6fb; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #64748b; }
    .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 6px; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #0e7c8a; margin: 16px 0 6px; }
    ul { margin: 4px 0; padding-left: 20px; font-size: 13px; }
    ul li { margin-bottom: 4px; }
    .refs li { font-size: 11px; color: #64748b; }
    .foot { margin-top: 20px; border-top: 1px solid #e7ecf3; padding-top: 10px; font-size: 10.5px; color: #94a3b8; }
    @media print { .page { padding: 0; } @page { margin: 14mm; } }
  </style></head><body>
  <div class="page">
    <div class="brand">
      <div><div class="prof">Motor RCD · Raciocínio Clínico Documentado</div><div class="sub">Semáforo de Liberação: gate pré-sessão</div></div>
      <div class="sub">${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date())}</div>
    </div>

    <h1>${esc(grupoNome)}${alunoNome ? `: ${esc(alunoNome)}` : ""}</h1>
    <div class="meta">Checklist de segurança pré-sessão respondido pelo profissional.</div>

    <div class="resultado"><div class="titulo">${cor.nome}</div></div>

    <h2>Itens verificados</h2>
    <table><tr><th>Pergunta</th><th>Resposta</th></tr>${linhas}</table>

    ${acoes ? `<h2>Ações registradas</h2><ul>${acoes}</ul>` : ""}
    ${refs ? `<h2>Base consultada</h2><ul class="refs">${refs}</ul>` : ""}

    <div class="foot">
      Conteúdo educacional de apoio à decisão do profissional de Educação Física; não é conduta
      médica e não substitui avaliação profissional individualizada. A decisão de liberar, ajustar ou
      adiar a sessão é do profissional habilitado. Gerado por Prescrição Inteligente (Motor RCD).
    </div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
  </body></html>`;

  const w = window.open("", "_blank", "width=800,height=1000");
  if (!w) {
    alert("Permita pop-ups para imprimir o semáforo.");
    return;
  }
  w.document.write(html);
  w.document.close();
}
