import * as React from "react";
import { useSearchParams } from "react-router-dom";

/**
 * A NAVEGAÇÃO DO APP DO ALUNO VIVE NA URL.
 *
 * Feedback de campo do Filipe, usando o app: "cliquei em voltar e saiu da página".
 *
 * A causa era estrutural. Os três níveis de navegação (a aba, a sessão aberta e o treino
 * guiado) eram `useState` puro, e nenhum deles tocava a URL. Para o navegador, nada nunca
 * navegou: o botão voltar então faz a única coisa que pode fazer, que é sair do site.
 *
 * No celular isso é pior do que parece, porque o gesto de voltar do Android é O jeito de
 * voltar. Um aluno no meio de uma série que desliza para trás esperando fechar o exercício
 * saía do treino inteiro.
 *
 * O empilhamento aqui é deliberado:
 *
 * - TROCAR DE ABA substitui (`replace`). Voltar não desfaz cliques de aba um a um; ele sai
 *   do app, que é o que se espera de uma barra de abas.
 * - ABRIR UMA SESSÃO empilha. Voltar fecha a sessão e devolve a lista.
 * - COMEÇAR O TREINO empilha. Voltar sai do modo guiado e volta para a sessão, NUNCA para
 *   fora do app. É o caso que mais dói errar, porque acontece com o aluno no meio do
 *   exercício, de mãos suadas.
 *
 * Efeito colateral bem-vindo: a tela agora é linkável e sobrevive a recarregar.
 */
export type AbaAluno = "hoje" | "treinos" | "progresso" | "perfil";

const ABAS_VALIDAS = new Set<string>(["hoje", "treinos", "progresso", "perfil"]);

export interface NavegacaoAluno {
  aba: AbaAluno;
  /** id da sessão aberta em modo leitura (a visão antes de começar) */
  sessaoId: string | null;
  /** id da sessão em modo guiado (treino rodando) */
  guiadoId: string | null;
  irParaAba: (a: AbaAluno) => void;
  abrirSessao: (id: string) => void;
  fecharSessao: () => void;
  comecarGuiado: (id: string) => void;
  sairDoGuiado: () => void;
}

export function useNavegacaoAluno(): NavegacaoAluno {
  const [params, setParams] = useSearchParams();

  const abaBruta = params.get("aba");
  const aba: AbaAluno = abaBruta && ABAS_VALIDAS.has(abaBruta) ? (abaBruta as AbaAluno) : "hoje";
  const sessaoId = params.get("sessao");
  const guiadoId = params.get("guiado");

  const escrever = React.useCallback(
    (mudar: (p: URLSearchParams) => void, substituir: boolean) => {
      setParams(
        (atuais) => {
          const p = new URLSearchParams(atuais);
          mudar(p);
          return p;
        },
        { replace: substituir },
      );
    },
    [setParams],
  );

  return {
    aba,
    sessaoId,
    guiadoId,
    irParaAba: React.useCallback(
      (a) =>
        escrever((p) => {
          // A aba padrão não suja a barra de endereço.
          if (a === "hoje") p.delete("aba");
          else p.set("aba", a);
          // Trocar de aba fecha o que estava aberto por cima dela.
          p.delete("sessao");
          p.delete("guiado");
        }, true),
      [escrever],
    ),
    abrirSessao: React.useCallback(
      (id) =>
        escrever((p) => {
          p.set("sessao", id);
          p.delete("guiado");
        }, false),
      [escrever],
    ),
    fecharSessao: React.useCallback(() => escrever((p) => p.delete("sessao"), false), [escrever]),
    comecarGuiado: React.useCallback((id) => escrever((p) => p.set("guiado", id), false), [escrever]),
    sairDoGuiado: React.useCallback(() => escrever((p) => p.delete("guiado"), false), [escrever]),
  };
}
