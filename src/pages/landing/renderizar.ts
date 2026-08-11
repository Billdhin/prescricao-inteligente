/**
 * INTERPRETADOR DO TEMPLATE DO PROTÓTIPO.
 *
 * O artifact não é HTML solto: ele usa uma linguagem de template própria, com `{{ nome }}`
 * para valor, `<sc-if value="{{ nome }}">` para condicional e `sc-camel-on-click` para
 * evento. Converter isso para JSX à mão seria reescrever 91 KB de marcação, que é
 * exatamente o processo que já produziu duas versões divergentes do protótipo.
 *
 * Então a marcação fica INTACTA e quem se adapta é o código: este módulo resolve os três
 * construtos contra um objeto de valores. Fidelidade vira diff de arquivo, e trocar o
 * protótipo por um novo passa a ser trocar dois arquivos.
 *
 * São 53 bindings e 4 condicionais no arquivo atual, então o interpretador é pequeno de
 * propósito: ele não é um motor de template genérico, e não deve virar um.
 */

/** Valores que o template consome: texto para exibir, booleano para condicional. */
export type Valores = Record<string, string | number | boolean | (() => void) | ((e: Event) => void)>;

/** Nome do atributo que carrega o handler já resolvido, lido pela delegação de eventos. */
export const ATTR_ACAO = "data-acao";

const RE_BIND = /\{\{\s*([a-zA-Z0-9_]+|true|false)\s*\}\}/g;

/**
 * Resolve `<sc-if value="{{ x }}">…</sc-if>`, do mais INTERNO para o mais externo.
 *
 * A ordem importa: resolvendo de fora para dentro, um `sc-if` falso levaria junto o
 * fechamento de um aninhado e a marcação quebraria no meio. O laço procura sempre um
 * bloco sem `<sc-if` dentro, que por construção é o mais interno que sobrou.
 */
function resolverCondicionais(html: string, vals: Valores): string {
  const RE_INTERNO = /<sc-if\s+value="\{\{\s*([a-zA-Z0-9_]+|true|false)\s*\}\}"[^>]*>((?:(?!<sc-if)[\s\S])*?)<\/sc-if>/;
  let saida = html;
  // O teto existe para não travar o navegador se a marcação vier malformada: sem ele,
  // um `</sc-if>` faltando faria o laço nunca convergir.
  for (let i = 0; i < 200; i++) {
    const m = RE_INTERNO.exec(saida);
    if (!m) break;
    const chave = m[1];
    const valor = chave === "true" ? true : chave === "false" ? false : Boolean(vals[chave]);
    saida = saida.slice(0, m.index) + (valor ? m[2] : "") + saida.slice(m.index + m[0].length);
  }
  return saida;
}

/**
 * Troca os handlers por um atributo que a delegação de eventos lê depois.
 *
 * Não dá para colocar a função no HTML: a marcação é injetada como texto. O nome do
 * handler vai no atributo e a página resolve no clique, olhando o mesmo objeto de valores.
 */
function resolverEventos(html: string): string {
  return html.replace(/sc-camel-on-(click|change)="\{\{\s*([a-zA-Z0-9_]+)\s*\}\}"/g, `${ATTR_ACAO}-$1="$2"`);
}

/** Substitui os `{{ nome }}` restantes pelo texto do valor. Função vira string vazia. */
function resolverValores(html: string, vals: Valores): string {
  return html.replace(RE_BIND, (_, chave: string) => {
    if (chave === "true") return "true";
    if (chave === "false") return "false";
    const v = vals[chave];
    if (typeof v === "function" || v == null) return "";
    return String(v);
  });
}

/**
 * Liga `style-hover` e `style-focus`, que o artifact autora e o navegador ignora.
 *
 * A marcação veio do editor com 34 hovers e 4 focus desenhados (botão que afunda, cartão
 * que sobe, CTA que escurece) e NENHUM funcionava: atributo custom não é estado de CSS, e
 * este interpretador nunca os processou. A página inteira ficou estática sem ninguém
 * decidir isso.
 *
 * Estilo inline não expressa `:hover`, então cada valor DISTINTO vira uma classe
 * determinística (`lh-N`/`lf-N`, na ordem de primeira aparição) e o CSS correspondente sai
 * como string para a página injetar num `<style>`. Duas aparições do mesmo estilo dividem
 * a mesma classe, e o seletor é escopado em `.landing-prototipo` porque o CSS da landing
 * é global. `style-focus` vira `:focus-visible`: o realce é do teclado, não do clique.
 */
function resolverEstadosVisuais(html: string): { html: string; cssEstados: string } {
  const classes = new Map<string, string>();
  const regras: string[] = [];
  const virarClasse = (prefixo: "lh" | "lf", pseudo: string, estilo: string): string => {
    const chave = `${prefixo}|${estilo}`;
    let classe = classes.get(chave);
    if (!classe) {
      classe = `${prefixo}-${classes.size}`;
      classes.set(chave, classe);
      // `!important` declaração a declaração, e não é capricho: a base dos elementos é
      // toda estilo INLINE, que vence qualquer seletor, inclusive com pseudo-classe. Sem
      // isto as regras existem, o devtools as mostra e o hover não muda nada (medido no
      // CTA do hero). O escopo do !important é só o estado, então nada além do
      // hover/focus é atropelado.
      const comForca = estilo
        .split(";")
        .map((d) => d.trim())
        .filter(Boolean)
        .map((d) => `${d} !important`)
        .join(";");
      regras.push(`.landing-prototipo .${classe}${pseudo}{${comForca}}`);
    }
    return classe;
  };
  const saida = html.replace(
    /\sstyle-(hover|focus)="([^"]*)"/g,
    (_, tipo: "hover" | "focus", estilo: string) =>
      ` data-classe-estado="${tipo === "hover" ? virarClasse("lh", ":hover", estilo) : virarClasse("lf", ":focus-visible", estilo)}"`,
  );
  // O atributo intermediário vira classe de verdade, fundindo com `class` existente quando
  // houver. Dois replaces porque um elemento pode ter hover E focus.
  const comClasses = saida
    .replace(/class="([^"]*)"([^>]*?)\sdata-classe-estado="([^"]+)"/g, 'class="$1 $3"$2')
    .replace(/\sdata-classe-estado="([^"]+)"/g, ' class="$1"');
  return { html: comClasses, cssEstados: regras.join("\n") };
}

/** Marcação pronta para injetar: condicionais resolvidas, eventos marcados, valores trocados. */
export function renderizar(template: string, vals: Valores): string {
  return resolverValores(resolverEventos(resolverCondicionais(template, vals)), vals);
}

/**
 * O CSS dos estados visuais do template (hover/focus autorados na marcação). Derivado só
 * do TEMPLATE, não dos valores: calcula uma vez por arquivo, não por render.
 */
export function cssDosEstados(template: string): string {
  return resolverEstadosVisuais(template).cssEstados;
}

/** `renderizar` + classes de estado no lugar dos atributos inertes. */
export function renderizarComEstados(template: string, vals: Valores): string {
  return renderizar(resolverEstadosVisuais(template).html, vals);
}
