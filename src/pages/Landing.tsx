import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  PRECO_MENSAL,
  PRECO_TABELA,
  PRECO_ANUAL,
  ECONOMIA_ANUAL,
  PRECO_ESTUDIO,
  fmtBRL,
} from "@/data/planos";
import "./landing/prototipo.css";
import marcacao from "./landing/prototipo.html?raw";

/**
 * LANDING: PORTE FIEL DO PROTÓTIPO.
 *
 * A página anterior era uma reconstrução em JSX que foi divergindo do protótipo a cada
 * rodada. O Filipe pediu fidelidade, e reconstruir 367 linhas de marcação à mão é
 * exatamente o processo que produz divergência. Então o protótipo virou a FONTE:
 * `landing/prototipo.html` e `landing/prototipo.css` são o arquivo dele, com as mesmas
 * classes, a mesma ordem de seções e as mesmas cores.
 *
 * ## O que foi alterado no porte, e por quê
 *
 * Três frases do protótipo afirmavam coisas que o sistema não faz, que é a classe de
 * defeito que este produto passou a rodada inteira eliminando:
 *
 * - "43 das 100 vagas preenchidas" contava vendas que não existem.
 * - "Testar 14 dias grátis, sem cartão" e "30 dias de garantia" prometem prazo de teste
 *   e reembolso, e não há cobrança nem contador no sistema (`isPremiumUnlocked` libera
 *   tudo e não existe gateway no repositório).
 * - O topo dizia R$ 690/ano enquanto a seção de planos do MESMO arquivo dizia R$ 1.164.
 *
 * O resto é o protótipo como ele é. A logo do sistema entrou no lugar do wordmark de
 * texto puro, como o Filipe pediu.
 *
 * ## Por que marcação injetada, e não JSX
 *
 * Fidelidade verificável. Qualquer divergência entre o que está no ar e o protótipo passa
 * a ser um diff de arquivo, e não uma caçada visual. O custo é que os links do app viram
 * navegação nativa; `useNavegacaoInterna` cobre isso interceptando os que apontam para
 * rotas do próprio app, para não recarregar a página inteira.
 */
/**
 * Preço na marcação é TOKEN, nunca literal.
 *
 * O protótipo trazia os valores escritos à mão e se contradizia sozinho: o topo anunciava
 * R$ 690/ano e a seção de planos, R$ 1.164. Aqui os tokens são trocados pela fonte única
 * em `@/data/planos`, e `check:legal` reprova qualquer "R$ nn" que reapareça no arquivo.
 */
const PRECOS: Record<string, string> = {
  "{{MENSAL}}": fmtBRL(PRECO_MENSAL),
  "{{TABELA}}": fmtBRL(PRECO_TABELA),
  "{{ANUAL}}": fmtBRL(PRECO_ANUAL),
  "{{ECONOMIA}}": fmtBRL(ECONOMIA_ANUAL),
  "{{ESTUDIO}}": fmtBRL(PRECO_ESTUDIO),
};
const MARCACAO = Object.entries(PRECOS).reduce(
  (html, [token, valor]) => html.split(token).join(valor),
  marcacao,
);

export function Landing() {
  const ref = React.useRef<HTMLDivElement>(null);
  useCalculadora(ref);
  useCtaFlutuante(ref);
  useNavegacaoInterna(ref);
  return <div ref={ref} className="landing-prototipo" dangerouslySetInnerHTML={{ __html: MARCACAO }} />;
}

/**
 * A calculadora de retorno do protótipo, portada do `<script>` dele.
 *
 * O preço vem de `@/data/planos` e não do literal 97 que estava no script: é a mesma
 * fonte única que a seção de planos usa, e é o que impede a calculadora de continuar
 * calculando com um preço velho depois de a tabela mudar.
 */
function useCalculadora(ref: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const campo = (id: string) => raiz.querySelector<HTMLInputElement>(`#${id}`);
    const saida = (id: string) => raiz.querySelector<HTMLElement>(`#${id}`);
    const entradas = ["a", "v", "s", "p"].map(campo).filter((e): e is HTMLInputElement => Boolean(e));
    if (entradas.length < 4) return;

    const fmt = (n: number) => "R$ " + Math.round(n).toLocaleString("pt-BR");
    const calcular = () => {
      const [a, v, s, p] = entradas.map((e) => Number(e.value) || 0);
      // 4,33 é a média de semanas por mês, como no protótipo.
      const mes = a * v * s * 4.33 * (p / 100);
      const oMes = saida("mes");
      const oAno = saida("ano");
      const oMeses = saida("meses");
      if (oMes) oMes.textContent = "+" + fmt(mes);
      if (oAno) oAno.textContent = "+" + fmt(mes * 12) + " por ano";
      if (oMeses) oMeses.textContent = Math.max(1, Math.floor(mes / PRECO_MENSAL)) + " meses";
    };
    entradas.forEach((e) => e.addEventListener("input", calcular));
    calcular();
    return () => entradas.forEach((e) => e.removeEventListener("input", calcular));
  }, [ref]);
}

/** A barra de ação que aparece depois do herói, portada do script do protótipo. */
function useCtaFlutuante(ref: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    const alvo = ref.current?.querySelector("#sticky");
    if (!alvo) return;
    /*
     * O ouvinte é no DOCUMENTO, em fase de CAPTURA, e não na janela.
     *
     * O script do protótipo lia `window.scrollY`, o que vale numa página solta. Dentro
     * deste app a rolagem acontece num contêiner, então `window.scrollY` fica em 0 para
     * sempre e a barra nunca aparecia. Medido no navegador: rolar até 1500 deixava
     * `scrollY` em 0 e a classe `show` nunca entrava. Evento de rolagem não borbulha, mas
     * é capturável, e por isso o `true` no fim.
     */
    const posicao = () => {
      const cont = document.scrollingElement;
      return Math.max(window.scrollY, cont ? cont.scrollTop : 0, ...[...document.querySelectorAll("main, [data-rolagem]")].map((e) => e.scrollTop));
    };
    const aoRolar = () => alvo.classList.toggle("show", posicao() > 700);
    aoRolar();
    document.addEventListener("scroll", aoRolar, { passive: true, capture: true });
    return () => document.removeEventListener("scroll", aoRolar, { capture: true });
  }, [ref]);
}

/**
 * Links que apontam para rotas do próprio app passam a navegar pelo roteador.
 *
 * Sem isto, clicar em "Entrar" recarrega a aplicação inteira: o visitante espera o bundle
 * de novo para chegar numa tela que já estava carregada. Âncoras (#secao) e links externos
 * seguem intocados, porque para eles o comportamento nativo é o certo.
 */
function useNavegacaoInterna(ref: React.RefObject<HTMLDivElement | null>) {
  const navegar = useNavigate();
  React.useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const aoClicar = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      // Só rota interna: âncora, link externo, nova aba e clique com modificador ficam nativos.
      if (!href || !href.startsWith("/") || e.metaKey || e.ctrlKey || e.shiftKey || a?.target === "_blank") return;
      e.preventDefault();
      navegar(href);
    };
    raiz.addEventListener("click", aoClicar);
    return () => raiz.removeEventListener("click", aoClicar);
  }, [ref, navegar]);
}
