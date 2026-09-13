/**
 * A FOLHA A4: a anatomia comum dos documentos impressos (12/09/2026).
 *
 * Antes cada gerador montava o próprio `<html>`, a própria escala de tipo e as próprias
 * caixas. O resultado media bem em conteúdo e mal em papel: nenhum documento repetia a
 * identificação nas páginas seguintes, nenhum tinha rodapé corrido, a folha de evolução
 * gastava meia página e o plano de 48 semanas saía com 95 páginas de blocos soltos.
 *
 * ## O que foi medido no Chrome antes de escolher a técnica
 *
 * - `position: fixed` REPETE em toda página, mas resolve o deslocamento contra a primeira
 *   folha: nas seguintes o cabeçalho cai por cima do texto. Não serve.
 * - `counter(page)` fora de `@page` não existe no Chrome: numeração automática sai "0 de 0".
 *   Por isso o rodapé traz identificação, e não número de página.
 * - `<thead>`/`<tfoot>` de uma TABELA ENVOLVENTE repetem em toda página, no lugar certo, e
 *   `display: table-header-group` repete o cabeçalho das tabelas de dados. É o que usamos.
 *
 * Cor sai toda de `pdfCores` (regra do check:documentos): aqui não há hex literal.
 */
import { CORES_PDF as C, PAPEL_BASE_CSS } from "@/lib/pdfCores";

export const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/** Régua da marca: o gradiente oficial no padrão, a matiz do profissional quando há marca. */
export function reguaMarca(cor: string) {
  return cor.toLowerCase() === C.marca.toLowerCase()
    ? `linear-gradient(90deg,${C.marca} 0%,${C.marcaGradFim} 100%)`
    : `linear-gradient(90deg,${cor} 0%,${cor}bf 100%)`;
}

/**
 * CSS do papel: escala de tipo, folha com cabeçalho e rodapé corridos, e os blocos que os
 * sete documentos usam. `cor` é a matiz do profissional (ou a da marca).
 */
export function papelCss(cor = C.marca) {
  return `
    ${PAPEL_BASE_CSS}
    @page { size: A4; margin: 11mm 12mm 10mm; }
    body {
      margin: 0; color: ${C.ink};
      font: 10.5pt/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    /* A tabela envolvente é o que faz o cabeçalho e o rodapé se repetirem em toda folha. */
    table.folha { width: 100%; border-collapse: collapse; }
    table.folha > thead > tr > td, table.folha > tfoot > tr > td { padding: 0; border: 0; }
    .corrido, .rodape-corrido { font-size: 8pt; color: ${C.ink2}; display: flex; justify-content: space-between; gap: 12px; }
    .corrido { border-bottom: 1px solid ${C.linha}; padding-bottom: 2.5mm; margin-bottom: 5mm; }
    .corrido b, .rodape-corrido b { color: ${C.ink}; font-weight: 600; }
    .rodape-corrido { border-top: 1px solid ${C.linha}; padding-top: 2.5mm; margin-top: 6mm; }
    .rodape-legal { font-size: 6.8pt; line-height: 1.35; color: ${C.ink2}; padding-top: 1.2mm; }

    h1 { font-size: 20pt; line-height: 1.15; margin: 0 0 1.5mm; letter-spacing: -0.4px; }
    h2 { font-size: 12.5pt; margin: 0 0 2mm; break-after: avoid; }
    h3 { font-size: 10.5pt; margin: 0 0 1.5mm; break-after: avoid; }
    p { margin: 0 0 2mm; }
    .sub { color: ${C.ink2}; }
    .mini { font-size: 8.5pt; color: ${C.ink2}; }
    .tabular { font-variant-numeric: tabular-nums; }

    /* rótulo de seção: a régua curta na matiz + caixa alta espaçada */
    .rotulo { display: flex; align-items: center; gap: 6px; margin: 5mm 0 2mm; break-after: avoid; }
    .rotulo::before { content: ""; width: 14px; height: 3px; border-radius: 2px; background: ${cor}; }
    .rotulo span { font-size: 8pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: ${cor}; }
    .secao { break-inside: avoid; }

    .cartao { border: 1px solid ${C.borda}; border-radius: 10px; padding: 4mm; break-inside: avoid; }
    .cartao-suave { background: ${C.papelSuave}; border-radius: 10px; padding: 3mm 4mm; break-inside: avoid; }
    .destaque { border-left: 3px solid ${cor}; background: ${C.papelSuave}; border-radius: 0 8px 8px 0; padding: 3mm 4mm; break-inside: avoid; }

    /* faixa de números: o que o profissional lê de relance */
    .numeros { display: flex; gap: 3mm; margin: 0 0 4mm; }
    .numeros > div { flex: 1; border: 1px solid ${C.borda}; border-radius: 10px; padding: 2.5mm 3mm; break-inside: avoid; }
    .numeros .valor { font-size: 14pt; font-weight: 700; line-height: 1.15; }
    /* valor comprido ("3x por semana + 3 sessões isométricas") quebrava em três linhas a
       14pt e desalinhava a faixa inteira; a 10,5pt ele cabe em duas e os cartões empatam */
    .numeros .valor-longo { font-size: 10.5pt; line-height: 1.25; }
    .numeros .rot { font-size: 7.5pt; letter-spacing: .08em; text-transform: uppercase; color: ${C.ink2}; }

    table.dados { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    table.dados thead { display: table-header-group; }
    table.dados th { text-align: left; font-size: 7.5pt; letter-spacing: .08em; text-transform: uppercase; color: ${C.ink2};
      background: ${C.papelSuave}; padding: 2mm 2.5mm; border-bottom: 1px solid ${C.borda}; }
    table.dados td { padding: 1.7mm 2.5mm; border-bottom: 1px solid ${C.linha}; vertical-align: top; }
    table.dados tr { break-inside: avoid; }
    table.dados .num { text-align: right; font-variant-numeric: tabular-nums; }
    table.dados tbody tr:nth-child(even) td { background: ${C.papelSuave}80; }

    .tag { display: inline-block; font-size: 8pt; border: 1px solid ${C.borda}; border-radius: 999px; padding: 1px 8px; margin: 0 4px 4px 0; color: ${C.ink2}; }
    .tag-forte { border-color: ${cor}; color: ${cor}; }

    .assinaturas { display: flex; gap: 10mm; margin-top: 6mm; break-inside: avoid; }
    .assinaturas > div { flex: 1; }
    .assinaturas .linha-ass { border-top: 1.5px solid ${C.ink}; margin-bottom: 1.5mm; }

    .legal { font-size: 7.5pt; color: ${C.ink2}; line-height: 1.45; }
    .quebra { break-before: page; }
  `;
}

export interface FolhaOpts {
  /** título da aba e do arquivo sugerido na impressão */
  titulo: string;
  /** matiz do profissional */
  cor?: string;
  /** CSS próprio do documento, somado ao do papel */
  css?: string;
  /** lado esquerdo do cabeçalho corrido (já escapado): documento e aluno */
  corridoEsq: string;
  /** lado direito do cabeçalho corrido (já escapado): profissional e CREF */
  corridoDir: string;
  /** lado esquerdo do rodapé corrido (já escapado) */
  rodapeEsq: string;
  /** lado direito do rodapé corrido (já escapado) */
  rodapeDir: string;
  /**
   * O aviso legal. Vai no RODAPÉ, e não no fim do corpo: como parágrafo final ele empurrava
   * uma folha inteira a mais (medido na ficha de adesão), e some quando o documento é
   * separado. No rodapé ele acompanha toda folha e não cria página.
   */
  rodapeLegal?: string;
  /** corpo do documento (HTML já montado) */
  corpo: string;
}

/**
 * O documento inteiro: `<html>` com o CSS do papel e o corpo dentro da tabela envolvente,
 * para o cabeçalho e o rodapé se repetirem em toda folha.
 */
export function folhaHtml(o: FolhaOpts) {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapar(o.titulo)}</title>
<style>${papelCss(o.cor)}${o.css ?? ""}</style></head>
<body>
<table class="folha">
  <thead><tr><td>
    <div class="corrido"><span>${o.corridoEsq}</span><span>${o.corridoDir}</span></div>
  </td></tr></thead>
  <tfoot><tr><td>
    <div class="rodape-corrido"><span>${o.rodapeEsq}</span><span>${o.rodapeDir}</span></div>
    ${o.rodapeLegal ? `<div class="rodape-legal">${o.rodapeLegal}</div>` : ""}
  </td></tr></tfoot>
  <tbody><tr><td>
${o.corpo}
  </td></tr></tbody>
</table>
</body></html>`;
}

/** Faixa de números do topo: rótulo em caixa alta e valor grande. */
export function faixaNumeros(itens: { rot: string; valor: string; obs?: string }[]) {
  return `<div class="numeros">${itens
    .map(
      (i) =>
        `<div><div class="rot">${escapar(i.rot)}</div><div class="valor tabular${
          i.valor.length > 16 ? " valor-longo" : ""
        }">${escapar(i.valor)}</div>${
          i.obs ? `<div class="mini">${escapar(i.obs)}</div>` : ""
        }</div>`,
    )
    .join("")}</div>`;
}

/** Rótulo de seção com a régua curta na matiz. */
export const rotulo = (texto: string) => `<div class="rotulo"><span>${escapar(texto)}</span></div>`;
