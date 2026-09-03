import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PRECO_MENSAL, PRECO_TABELA, PRECO_ANUAL, fmtBRL } from "@/data/planos";
import { renderizarComEstados, cssDosEstados, ATTR_ACAO, type Valores } from "./landing/renderizar";
import "./landing/prototipo.css";
import template from "./landing/prototipo.html?raw";

// O CSS dos hovers/focus autorados no template depende SÓ do template: uma vez por módulo.
const CSS_ESTADOS = cssDosEstados(template);

/**
 * LANDING: PORTE DO PROTÓTIPO DO CANVAS (02/09/2026).
 *
 * A marcação vive em `landing/prototipo.html` e este componente só a injeta e liga o
 * comportamento; `renderizar` interpreta a linguagem de template (`{{ }}`, `<sc-if>`,
 * `sc-camel-on-click`, `style-hover`). A fonte do desenho é o canvas aprovado pelo Filipe
 * em 02/09/2026 (desktop em blocos de cor inteiros; celular desenhado à parte), que por sua
 * vez segue a estrutura da LP v5: apresentação, como funciona, periodização, condição,
 * edição, aluno, comparação, quem construiu, oferta e perguntas.
 *
 * ## O que o protótipo dizia e o site NÃO diz, e por quê
 *
 * - "7 dias de garantia, reembolso integral": a cobrança está desligada (COBRANCA_ATIVA em
 *   planos.ts). Sem transação não há valor a devolver, e `check:legal` reprova a promessa.
 *   A página diz o que é verdade hoje: cria a conta e usa sem cartão, avisado antes de
 *   qualquer cobrança.
 * - "Condição de fundador no checkout": não existe checkout. Saiu.
 * - Nome completo, anos de docência e foto do Filipe entre colchetes: placeholder não vai ao
 *   ar (`check:legal`, bloco D). Fica "Filipe, doutor em Educação Física", que é o que está
 *   confirmado, e a inicial no lugar da foto até a foto real existir.
 * - O vídeo de apresentação ainda não existe: o quadro fica sem botão de play, com o aviso
 *   "em breve", em vez de um botão que não abre nada.
 * - Preço só por binding da fonte única (`@/data/planos`); literal de preço no template é
 *   exatamente como as tabelas divergiram antes.
 *
 * ## O que saiu da versão anterior
 *
 * Calculadora de retorno, abas "por dentro do app", barra fixa de preço, seletor mensal x
 * anual e a carta do fundador que o colocava atendendo clientes (ele forma quem prescreve;
 * nunca prescreveu para clientes). O menu do celular, o reveal por scroll e a preservação
 * do FAQ ficaram.
 */
export function Landing() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [st, setSt] = React.useState({ mobile: false, menu: false });
  const mudar = React.useCallback((p: Partial<typeof st>) => setSt((s) => ({ ...s, ...p })), []);

  useJanela(mudar);

  const vals = React.useMemo<Valores>(() => construirValores(st, mudar), [st, mudar]);
  const html = React.useMemo(() => renderizarComEstados(template, vals), [vals]);

  useDelegacao(ref, vals);
  useNavegacaoInterna(ref);
  useRevelarPorScroll(ref, html);
  usePreservarFaq(ref, html);

  // Porta das animações de load (hero): depois do primeiro segundo, a raiz ganha
  // `lp-carregada` e as entradas não replayam quando o DOM for recriado por estado (abrir
  // o menu do celular no topo era o caso visível). A classe vai na RAIZ porque ela é o
  // único nó que o dangerouslySetInnerHTML não destrói.
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const t = window.setTimeout(() => raiz.classList.add("lp-carregada"), 1100);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <style>{CSS_ESTADOS}</style>
      <div ref={ref} className="landing-prototipo" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

/**
 * REVEAL POR SCROLL QUE SOBREVIVE À RECRIAÇÃO DO DOM.
 *
 * Cada mudança de estado (menu do celular, largura) re-injeta o HTML inteiro e destrói o
 * DOM anterior, então o observer não pode guardar estado em nó nenhum. O que já foi
 * revelado vive num Set de rótulos (`data-screen-label`) num ref, e a cada render: seção
 * já vista recebe `lp-visto` direto (sem re-animar, sem piscar); seção nova entra oculta e
 * é observada. Quem esconde é o JS, não o CSS: se nada disto rodar, a página fica inteira
 * visível, que é o fallback certo.
 *
 * Header e hero ficam fora: o header é a casca, e o hero está acima da dobra com entrada
 * própria no load (ver `lp-entrada` no CSS).
 */
const SEM_REVEAL = new Set(["Header", "Hero"]);
function useRevelarPorScroll(ref: React.RefObject<HTMLDivElement | null>, html: string) {
  const vistos = React.useRef(new Set<string>());
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const ent of entradas) {
          if (!ent.isIntersecting) continue;
          const rotulo = (ent.target as HTMLElement).dataset.screenLabel ?? "";
          vistos.current.add(rotulo);
          ent.target.classList.remove("lp-oculto");
          ent.target.classList.add("lp-visto");
          obs.unobserve(ent.target);
        }
      },
      // 0.05 e não mais: o rodapé divide a última dobra, e exigir 12% dele visível deixava
      // os links legais invisíveis numa rolagem rápida.
      { threshold: 0.05 },
    );
    const alvos: HTMLElement[] = [];
    for (const sec of raiz.querySelectorAll<HTMLElement>("[data-screen-label]")) {
      const rotulo = sec.dataset.screenLabel ?? "";
      if (SEM_REVEAL.has(rotulo)) continue;
      if (vistos.current.has(rotulo)) sec.classList.add("lp-visto");
      else alvos.push(sec);
    }

    const revelarTudo = () => {
      for (const sec of alvos) {
        sec.classList.remove("lp-oculto");
        sec.classList.add("lp-visto");
        vistos.current.add(sec.dataset.screenLabel ?? "");
      }
      obs.disconnect();
    };

    // Só esconde no PRÓXIMO QUADRO. Numa aba que não compõe, o quadro não vem, e a página
    // simplesmente nunca some. Esconder de forma síncrona era o que criava a janela em que
    // "invisível" virava estado final.
    let socorro = 0;
    const quadro = requestAnimationFrame(() => {
      for (const sec of alvos) {
        sec.classList.add("lp-oculto");
        obs.observe(sec);
      }
      // Rede de segurança: sem nenhuma entrega em 2 s, a animação é abandonada e o
      // conteúdo aparece. Página legível vale mais que fade.
      socorro = window.setTimeout(() => {
        if (!raiz.querySelector(".lp-visto")) revelarTudo();
      }, 2000);
    });

    return () => {
      cancelAnimationFrame(quadro);
      if (socorro) clearTimeout(socorro);
      obs.disconnect();
    };
  }, [ref, html]);
}

/**
 * Mantém abertas as respostas do FAQ (e os acordeões da condição) que o visitante abriu,
 * através das recriações do DOM.
 *
 * A chave é o texto do resumo, não o índice: se a ordem do template mudar, o índice abriria
 * a resposta errada, que é pior que fechar todas.
 */
function usePreservarFaq(ref: React.RefObject<HTMLDivElement | null>, html: string) {
  const abertos = React.useRef(new Set<string>());
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const chave = (d: HTMLDetailsElement) => d.querySelector("summary")?.textContent?.trim() ?? "";
    const lista = [...raiz.querySelectorAll<HTMLDetailsElement>("details")];

    // Reaplica o que já estava aberto antes desta recriação.
    for (const d of lista) {
      const k = chave(d);
      if (!k) continue;
      if (abertos.current.has(k)) d.open = true;
      else if (d.open) abertos.current.add(k);
    }

    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement;
      const k = chave(d);
      if (!k) return;
      if (d.open) abertos.current.add(k);
      else abertos.current.delete(k);
    };
    for (const d of lista) d.addEventListener("toggle", onToggle);
    return () => {
      for (const d of lista) d.removeEventListener("toggle", onToggle);
    };
  }, [ref, html]);
}

/** Os valores que o template consome. Preço da FONTE ÚNICA, sem o "R$" (o template imprime o cifrão). */
function construirValores(st: { mobile: boolean; menu: boolean }, mudar: (p: Partial<typeof st>) => void): Valores {
  return {
    isMobile: st.mobile,
    isDesktop: !st.mobile,
    menuOpen: st.menu && st.mobile,
    toggleMenu: () => mudar({ menu: !st.menu }),
    fecharMenu: () => mudar({ menu: false }),
    proPreco: String(PRECO_MENSAL),
    proSub: `${fmtBRL(PRECO_ANUAL)} por ano, em 12x de ${fmtBRL(PRECO_MENSAL)}, ou ${fmtBRL(PRECO_TABELA)} mês a mês, sem fidelidade.`,
  };
}

/** Largura da janela: decide o menu do celular. Redimensionar fecha o menu. */
function useJanela(mudar: (p: { mobile?: boolean; menu?: boolean }) => void) {
  React.useEffect(() => {
    const aoRedimensionar = () => mudar({ mobile: window.innerWidth < 761, menu: false });
    aoRedimensionar();
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, [mudar]);
}

/**
 * Delegação de eventos: o clique encontra o handler pelo atributo.
 *
 * A marcação é injetada como texto, então não há como pendurar função nela. O `renderizar`
 * deixa o NOME do handler num atributo e aqui ele é resolvido no objeto de valores, que é o
 * mesmo que alimentou a renderização.
 */
function useDelegacao(ref: React.RefObject<HTMLDivElement | null>, vals: Valores) {
  const ultimo = React.useRef(vals);
  ultimo.current = vals;
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const aoClicar = (e: Event) => {
      const alvo = (e.target as HTMLElement | null)?.closest?.(`[${ATTR_ACAO}-click]`);
      const nome = alvo?.getAttribute(`${ATTR_ACAO}-click`);
      if (!nome) return;
      const fn = ultimo.current[nome];
      if (typeof fn === "function") (fn as (ev: Event) => void)(e);
    };
    raiz.addEventListener("click", aoClicar);
    return () => raiz.removeEventListener("click", aoClicar);
  }, [ref]);
}

/** Links para rotas do app navegam pelo roteador, em vez de recarregar tudo. */
function useNavegacaoInterna(ref: React.RefObject<HTMLDivElement | null>) {
  const navegar = useNavigate();
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const aoClicar = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!href || !href.startsWith("/") || e.metaKey || e.ctrlKey || e.shiftKey || a?.target === "_blank") return;
      e.preventDefault();
      navegar(href);
    };
    raiz.addEventListener("click", aoClicar);
    return () => raiz.removeEventListener("click", aoClicar);
  }, [ref, navegar]);
}
