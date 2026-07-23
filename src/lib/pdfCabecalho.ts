/**
 * Cabeçalho unificado dos 6 exports/prints (PDF via caixa de impressão do
 * navegador). Uma anatomia só para o plano, a prescrição, o prontuário, o
 * rastreio postural, as fichas e o semáforo: identidade à esquerda (logo contido
 * + nome + CREF + empresa + tipo do documento) e selo à direita (carimbo RCD +
 * data/contato + espinha do cuidado da Onda 3), fechados pela régua da marca
 * (6px, gradiente da matiz do profissional).
 *
 * O documento impresso não tem as variáveis CSS da tela: as cores entram
 * literais e a matiz vem sempre de `corMarca || "#1b4b66"` (petróleo do produto).
 */
import { carimboRcdPdf, espinhaCuidadoPdf } from "@/lib/pdfSelo";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/**
 * Régua da marca. No padrão (petróleo) é o gradient-brand oficial da tela
 * (petróleo → teal); com marca branca própria, a mesma matiz clareando à direita,
 * para não impor a cor do produto sobre a do profissional.
 */
function reguaMarca(cor: string) {
  return cor.toLowerCase() === "#1b4b66"
    ? "linear-gradient(90deg,#1b4b66 0%,#0e7c8a 100%)"
    : `linear-gradient(90deg,${cor} 0%,${cor}bf 100%)`;
}

/** CSS do cabeçalho unificado + régua. Injetar dentro do <style> do documento. */
export function cabecalhoCss(cor = "#1b4b66") {
  return `
    .brand { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 12px; }
    .brand .brand-id { display: flex; align-items: center; gap: 12px; }
    .brand .prof { font-size: 20px; font-weight: 800; color: ${cor}; line-height: 1.15; }
    .brand .cref { font-size: 12px; font-weight: 700; color: ${cor}; }
    .brand .sub { font-size: 12px; color: #64748b; }
    .brand .brand-selo { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; text-align: right; }
    .regua { height: 6px; border-radius: 999px; background: ${reguaMarca(cor)}; margin: 0 0 4px; }
  `;
}

export interface CabecalhoOpts {
  /** matiz de acento (default: petróleo do produto) */
  cor?: string;
  logoDataUrl?: string;
  /** altura do logo em px (default 40) */
  logoAltura?: number;
  profissional: string;
  cref?: string;
  empresa?: string;
  /** linha "tipo do documento" abaixo do nome */
  docTipo: string;
  /** índice 0-4 do nó da espinha que o documento certifica */
  no: number;
  /** carimbo do bloco direito (default: carimboRcdPdf(cor)) */
  carimbo?: string;
  /** HTML abaixo do carimbo (data, contatos, id do documento) — já escapado */
  direita?: string;
  /** cor do nome, quando diferente do acento (ex.: prontuário usa ink) */
  nomeCor?: string;
  /** cor da espinha, quando diferente do acento (ex.: sempre petróleo) */
  espinhaCor?: string;
}

/** HTML do cabeçalho + régua. Estrutura idêntica nos 6 documentos. */
export function cabecalhoHtml(o: CabecalhoOpts) {
  const cor = o.cor ?? "#1b4b66";
  const carimbo = o.carimbo ?? carimboRcdPdf(cor);
  return `
  <div class="brand">
    <div class="brand-id">
      ${o.logoDataUrl ? `<img src="${o.logoDataUrl}" alt="" style="height:${o.logoAltura ?? 40}px;max-width:140px;object-fit:contain" />` : ""}
      <div>
        <div class="prof"${o.nomeCor ? ` style="color:${o.nomeCor}"` : ""}>${esc(o.profissional)}</div>
        ${o.cref ? `<div class="cref">CREF ${esc(o.cref)}</div>` : ""}
        ${o.empresa ? `<div class="sub">${esc(o.empresa)}</div>` : ""}
        <div class="sub">${esc(o.docTipo)}</div>
      </div>
    </div>
    <div class="brand-selo">
      ${carimbo}
      ${o.direita ?? ""}
      ${espinhaCuidadoPdf(o.no, o.espinhaCor ?? cor)}
    </div>
  </div>
  <div class="regua"></div>`;
}
