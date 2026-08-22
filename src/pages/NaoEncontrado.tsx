import { Link, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";
import { buttonClasses } from "@/components/ui/primitives";

/**
 * Rota desconhecida DENTRO do shell.
 *
 * Antes, qualquer URL que não existisse era redirecionada em silêncio para o painel. Quem
 * seguiu um link velho, digitou errado ou salvou um favorito de uma tela que mudou de nome
 * chegava no Meu dia sem entender por quê, e concluía que tinha perdido o caminho, ou pior,
 * que o dado sumiu. Dizer "não achei esta tela" e oferecer as portas certas custa menos e
 * mente menos.
 */
export default function NaoEncontrado() {
  const { pathname } = useLocation();
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-card border border-border bg-surface p-6 md:p-8">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-soft text-ink-2">
        <Compass className="h-5 w-5" />
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-ink">Não achei esta tela</h1>
        <p className="text-sm leading-relaxed text-ink-2">
          O endereço <code className="rounded bg-surface-soft px-1.5 py-0.5 text-2xs">{pathname}</code>{" "}
          não existe no sistema. Pode ser um link antigo, de uma tela que mudou de nome. Nada foi
          apagado e nenhum aluno foi perdido.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link className={buttonClasses("primary")} to="/dashboard">
          Ir para o Meu dia
        </Link>
        <Link className={buttonClasses("secondary")} to="/alunos">
          Ver meus alunos
        </Link>
        <Link className={buttonClasses("ghost")} to="/suporte">
          Falar com o suporte
        </Link>
      </div>
    </div>
  );
}
