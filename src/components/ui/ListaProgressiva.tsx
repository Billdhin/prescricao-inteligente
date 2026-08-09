import * as React from "react";
import { buttonClasses } from "@/components/ui/primitives";

/**
 * LISTAS LONGAS QUE NÃO NASCEM INTEIRAS.
 *
 * Medido no app rodando, a 320px de largura: o Laboratório Visual tinha **52.900px** de
 * altura, a biblioteca científica 23.066, os grupos especiais 12.510 e o comparador 8.251.
 * Cinquenta e dois mil pixels são setenta e três telas de celular numa rolagem só, sem marco
 * nenhum: quem passa do item que queria não tem como voltar a não ser rolando de novo, e a
 * barra de rolagem some de tão pequena.
 *
 * O remédio não é esconder conteúdo, é entregá-lo em lotes. A lista abre com um lote, diz
 * QUANTOS itens existem no total e oferece um botão para trazer o próximo. Três coisas que
 * este componente faz de propósito:
 *
 * - **O total aparece sempre.** "12 de 97" é informação; "12" seria omissão.
 * - **O lote volta ao início quando a lista muda.** Sem isso, filtrar depois de expandir
 *   deixaria a página gigante de novo, agora com o filtro aplicado.
 * - **Nada de rolagem infinita.** Ela rouba o rodapé e impede saber onde a lista acaba. Um
 *   botão é uma decisão do usuário, e é ele quem escolhe crescer a página.
 *
 * A busca e os filtros de cada página continuam sendo o caminho principal para achar coisa;
 * o lote é o que evita que a página inteira exista antes de alguém pedir.
 */
export function useListaProgressiva<T>(itens: T[], passo = 24) {
  const [limite, setLimite] = React.useState(passo);
  // A identidade da lista muda quando o filtro muda: o lote recomeça junto.
  const chave = itens.length;
  React.useEffect(() => setLimite(passo), [chave, passo]);
  const visiveis = itens.slice(0, limite);
  return {
    visiveis,
    total: itens.length,
    faltam: Math.max(0, itens.length - visiveis.length),
    verMais: () => setLimite((n) => n + passo),
  };
}

export function VerMais({
  faltam,
  total,
  mostrando,
  onVerMais,
  rotulo = "itens",
}: {
  faltam: number;
  total: number;
  mostrando: number;
  onVerMais: () => void;
  /** o que a lista contém, no plural (ex.: "exercícios", "referências") */
  rotulo?: string;
}) {
  if (faltam <= 0) return null;
  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <p className="text-sm text-ink-2">
        Mostrando {mostrando} de {total} {rotulo}.
      </p>
      <button type="button" onClick={onVerMais} className={buttonClasses("secondary")}>
        Ver mais {Math.min(faltam, 24)} de {faltam}
      </button>
    </div>
  );
}
