import type { MarcaDocumento } from "@/lib/store";
import type { Aluno } from "@/data/alunos";
import {
  type AvaliacaoPostural,
  CHECKPOINTS_POSTURAIS,
  ROTULO_VISTA,
  montarLaudo,
  ehReferencia,
  type VistaPostural,
} from "@/data/postural";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const fmt = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ts));

/**
 * Laudo de rastreio postural com a marca do profissional. Documento honesto: diz
 * que é rastreio visual, não medição por imagem, e lista só o que foi observado.
 */
export function exportPosturalPDF({
  aluno,
  avaliacao,
  profissional,
  cref,
  marca,
}: {
  aluno: Aluno;
  avaliacao: AvaliacaoPostural;
  profissional: string;
  cref?: string;
  marca?: MarcaDocumento;
}) {
  const cor = marca?.corPrimaria || "#1b4b66";
  const laudo = avaliacao.resumo?.trim() ? avaliacao.resumo : montarLaudo(avaliacao, aluno.nome);
  const porId = new Map(CHECKPOINTS_POSTURAIS.map((c) => [c.id, c]));
  const vistas: VistaPostural[] = ["anterior", "lateral", "posterior"];

  const fotosHtml = vistas
    .map((v) => {
      const f = avaliacao.fotos?.[v];
      if (!f) return "";
      return `<figure style="margin:0;text-align:center"><img src="${f}" alt="" style="max-height:220px;max-width:100%;border-radius:8px;border:1px solid #e7ecf3" /><figcaption style="font-size:11px;color:#94a3b8;margin-top:4px">${esc(ROTULO_VISTA[v])}</figcaption></figure>`;
    })
    .join("");

  const tabela = vistas
    .map((v) => {
      const obs = avaliacao.observacoes.filter((o) => porId.get(o.checkpointId)?.vista === v);
      if (obs.length === 0) return "";
      const linhas = obs
        .map((o) => {
          const cp = porId.get(o.checkpointId)!;
          const ref = ehReferencia(cp, o.achado);
          const cell = ref
            ? `<span style="color:#64748b">${esc(o.achado)}</span>`
            : `<strong style="color:${cor}">${esc(o.achado)}</strong>`;
          const nota = o.nota ? ` <span style="color:#94a3b8">(${esc(o.nota)})</span>` : "";
          return `<tr><td style="padding:3px 6px;border-bottom:1px solid #f1f5f9">${esc(cp.regiao)}</td><td style="padding:3px 6px;border-bottom:1px solid #f1f5f9">${cell}${nota}</td></tr>`;
        })
        .join("");
      return `<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:${cor};margin:16px 0 6px">${esc(ROTULO_VISTA[v])}</h2><table style="width:100%;border-collapse:collapse;font-size:12px">${linhas}</table>`;
    })
    .join("");

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Rastreio postural · ${esc(aluno.nome)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; }
    .page { max-width: 720px; margin: 0 auto; padding: 32px; }
    .brand { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid ${cor}; padding-bottom: 12px; }
    .brand .prof { font-size: 20px; font-weight: 800; color: ${cor}; }
    .brand .sub { font-size: 12px; color: #64748b; }
    h1 { font-size: 22px; margin: 20px 0 2px; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 18px; }
    .fotos { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 12px 0 20px; }
    .laudo { white-space: pre-line; font-size: 13px; color: #334155; background: #f4f6fb; border-radius: 10px; padding: 14px 16px; margin-top: 18px; }
    .foot { margin-top: 24px; border-top: 1px solid #e7ecf3; padding-top: 12px; font-size: 11px; color: #94a3b8; }
    @media print { .page { padding: 0; } @page { margin: 16mm; } }
  </style></head><body>
  <div class="page">
    <div class="brand">
      <div style="display:flex;align-items:center;gap:12px">
        ${marca?.logoDataUrl ? `<img src="${marca.logoDataUrl}" alt="" style="height:40px;max-width:140px;object-fit:contain" />` : ""}
        <div><div class="prof">${esc(profissional)}</div>${cref ? `<div class="sub" style="font-weight:700;color:${cor}">CREF ${esc(cref)}</div>` : ""}${marca?.empresa ? `<div class="sub">${esc(marca.empresa)}</div>` : ""}<div class="sub">Rastreio postural</div></div>
      </div>
      <div class="sub" style="text-align:right">${fmt(avaliacao.data)}</div>
    </div>

    <h1>Rastreio postural de ${esc(aluno.nome)}</h1>
    <div class="meta">Rastreio visual assistido. Não substitui exame nem medição instrumental.</div>

    ${fotosHtml ? `<div class="fotos">${fotosHtml}</div>` : ""}
    ${tabela}
    <div class="laudo">${esc(laudo)}</div>

    <div class="foot">
      Rastreio visual de apoio à conduta do profissional responsável. Não constitui diagnóstico
      nem medição por imagem. Gerado por Prescrição Inteligente.
    </div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
  </body></html>`;

  const w = window.open("", "_blank", "width=800,height=1000");
  if (!w) {
    alert("Permita pop-ups para exportar o laudo em PDF.");
    return;
  }
  w.document.write(html);
  w.document.close();
}
