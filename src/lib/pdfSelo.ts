/**
 * Selo de marca para o CABEÇALHO dos PDFs: carimbo RCD (chip monoespaçado) +
 * espinha do cuidado monocroma. HTML/SVG cru porque o documento impresso não tem
 * o design system da tela. Espelha o EspinhaSelo (src/components/ui/EspinhaSelo.tsx):
 * cinco nós na ordem fixa do ciclo (Avaliar > Planejar > Liberar > Acompanhar >
 * Reavaliar), monocromo petróleo, nunca coral.
 *
 * REGRA: é SELO discreto. Entra no bloco direito do cabeçalho e NUNCA desloca o
 * conteúdo clínico da página 1. O nó preenchido corresponde ao que o documento
 * certifica: avaliação/ficha = 0, prescrição/plano = 1, liberação/semáforo = 2.
 *
 * COR: sai toda de `pdfCores`, nunca literal. Este arquivo era o único que ainda
 * carregava hexes próprios, e eles ficaram para trás quando a paleta mudou: o
 * `#e6e2d8` da borda é o bege da rampa QUENTE anterior ao redesign, e continuava
 * sendo desenhado ao lado de uma identidade que já é fria. É exatamente a deriva
 * que `pdfCores` existe para impedir, e agora o `check:documentos` a trava.
 */
import { CORES_PDF as C } from "@/lib/pdfCores";

/** Chip carimbo RCD: font-mono + borda + caixa-alta = cara de carimbo de documento. */
export function carimboRcdPdf(cor = C.analise, texto = "Motor RCD") {
  return (
    `<span style="display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;` +
    `font-size:11px;line-height:1;letter-spacing:.08em;text-transform:uppercase;color:${cor};` +
    `border:1px solid ${C.borda};border-radius:10px;padding:3px 8px;white-space:nowrap">${texto}</span>`
  );
}

/**
 * Espinha do cuidado monocroma (5 discos sobre linha 1px). `atual` = índice
 * 0-4 do nó que o documento certifica; os nós até ele ficam cheios (petróleo),
 * os seguintes vazios (branco com contorno). Decorativa (aria-hidden).
 */
export function espinhaCuidadoPdf(atual: number, cor = C.analise) {
  const n = 5;
  const r = 3.5;
  const pad = 6;
  const w = 128;
  const step = (w - pad * 2) / (n - 1);
  const cy = 8;
  const x = (i: number) => pad + step * i;
  const linha = `<line x1="${x(0).toFixed(1)}" y1="${cy}" x2="${x(n - 1).toFixed(1)}" y2="${cy}" stroke="${C.borda}" stroke-width="1" />`;
  const discos = Array.from({ length: n }, (_, i) => {
    const cheio = i <= atual;
    return (
      `<circle cx="${x(i).toFixed(1)}" cy="${cy}" r="${r}" ` +
      `fill="${cheio ? cor : "#ffffff"}" stroke="${cheio ? cor : C.traco}" stroke-width="1.2" />`
    );
  }).join("");
  return `<svg width="${w}" height="16" viewBox="0 0 ${w} 16" role="presentation" aria-hidden="true" style="display:block">${linha}${discos}</svg>`;
}
