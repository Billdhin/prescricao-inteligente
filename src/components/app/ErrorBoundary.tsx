import React from "react";
import { AlertTriangle, RotateCcw, LifeBuoy } from "lucide-react";
import { buttonClasses } from "@/components/ui/primitives";

/**
 * REDE DE PROTEÇÃO DO SHELL.
 *
 * O projeto não tinha nenhum boundary: uma exceção de render entregava tela branca no meio
 * de um atendimento, com o aluno na frente do profissional e o rascunho perdido. Numa
 * ferramenta que se usa entre uma pessoa e outra, tela branca não é bug de front, é o
 * atendimento parado.
 *
 * A regra aqui é: NÃO PERDER O TRABALHO. O boundary não limpa nada, não redireciona sozinho
 * e não fecha o rascunho que vive em sessionStorage. Ele para, explica em português o que
 * aconteceu, garante por escrito que o que foi salvo continua salvo, e oferece dois
 * caminhos: tentar de novo a mesma tela (que resolve a falha transitória) ou voltar ao
 * painel (que resolve a falha da tela específica).
 */

interface Props {
  children: React.ReactNode;
  /** Muda quando a rota muda: um erro numa tela não deve contaminar a próxima. */
  chaveDeReset?: string;
}

interface State {
  erro: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { erro: null };

  static getDerivedStateFromError(erro: Error): State {
    return { erro };
  }

  componentDidCatch(erro: Error, info: React.ErrorInfo) {
    // Sem serviço de telemetria neste produto: o console é o registro que existe, e ele
    // precisa carregar a pilha do componente, senão a stack minificada não diz nada.
    console.error("[erro de tela]", erro, info.componentStack);
  }

  componentDidUpdate(anterior: Props) {
    if (this.state.erro && anterior.chaveDeReset !== this.props.chaveDeReset) {
      this.setState({ erro: null });
    }
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-card border border-border bg-surface p-6 md:p-8">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-warning-tint text-warning">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-ink">Esta tela parou de responder</h1>
          <p className="text-sm leading-relaxed text-ink-2">
            Alguma coisa quebrou ao montar esta página. Não foi você e nada foi apagado: o que já
            estava salvo continua salvo, e o rascunho que você tinha em aberto segue guardado neste
            aparelho.
          </p>
          <p className="text-sm leading-relaxed text-ink-2">
            Tentar de novo costuma resolver quando a falha foi passageira. Se voltar a acontecer na
            mesma tela, fale com o suporte e diga em que aluno estava.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={buttonClasses("primary")} onClick={() => this.setState({ erro: null })}>
            <RotateCcw className="h-4 w-4" />
            Tentar de novo
          </button>
          <a className={buttonClasses("secondary")} href="/dashboard">
            Voltar ao Meu dia
          </a>
          <a className={buttonClasses("ghost")} href="/suporte">
            <LifeBuoy className="h-4 w-4" />
            Falar com o suporte
          </a>
        </div>
        <details className="w-full">
          <summary className="cursor-pointer text-xs font-medium text-ink-3">
            Detalhe técnico, para mandar ao suporte
          </summary>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-surface-soft p-3 text-2xs leading-relaxed text-ink-2">
            {this.state.erro.message}
          </pre>
        </details>
      </div>
    );
  }
}
