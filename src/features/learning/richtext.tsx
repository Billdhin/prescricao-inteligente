import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Camada de leitura do Aprender.
 *
 * O conteúdo das aulas é texto. Sem tratamento, um parágrafo longo vira uma parede que
 * ninguém lê. Esta camada dá ao autor duas ferramentas leves, sem HTML solto no dado:
 *   - **negrito** com `**...**` para ancorar o olho no que decide;
 *   - quebra de parágrafo com linha em branco (`\n\n`) para picar a parede em blocos.
 *
 * `RichText` devolve blocos (`<p>`), então substitui um `<p>{texto}</p>` inteiro.
 * `RichInline` devolve só os trechos (negrito + texto), para quando o container já é um
 * `<p>`/`<span>` e não pode ter um bloco dentro. Ver o guardrail `check:legibilidade` e a
 * rubrica de excelência em `authoring/RUBRICA.md`.
 */

/** Quebra "**negrito**" em nós, mantendo o resto literal. */
function inlineNodes(text: string, keyBase: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g);
  return parts.map((part, i) => {
    const m = /^\*\*([^*\n]+)\*\*$/.exec(part);
    if (m) {
      return (
        <strong key={`${keyBase}-${i}`} className="font-semibold text-ink">
          {m[1]}
        </strong>
      );
    }
    return <React.Fragment key={`${keyBase}-${i}`}>{part}</React.Fragment>;
  });
}

/** Só os trechos inline (negrito + texto), sem bloco. Use dentro de um <p>/<span> existente. */
export function RichInline({ text }: { text: string }) {
  return <>{inlineNodes(text, "ri")}</>;
}

/**
 * Texto com negrito e quebras de parágrafo. Substitui `<p className>{texto}</p>`.
 * `className` vai em cada parágrafo, preservando o estilo do bloco de origem.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const paras = text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  const list = paras.length ? paras : [text];
  if (list.length === 1) {
    return <p className={className}>{inlineNodes(list[0], "p")}</p>;
  }
  return (
    <div className="space-y-2.5">
      {list.map((p, i) => (
        <p key={i} className={className}>
          {inlineNodes(p, `p${i}`)}
        </p>
      ))}
    </div>
  );
}

/** true quando o texto tem marcação de leitura (negrito ou quebra de parágrafo). */
export function temMarcacaoDeLeitura(text: string): boolean {
  return /\*\*[^*\n]+\*\*/.test(text) || /\n{2,}/.test(text);
}

/** Aproxima o "peso de leitura" de um trecho: caracteres, ignorando a marcação. */
export function pesoDeLeitura(text: string): number {
  return text.replace(/\*\*/g, "").length;
}
