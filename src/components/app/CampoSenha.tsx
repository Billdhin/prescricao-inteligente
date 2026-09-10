import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * O CAMPO DE SENHA, com "mostrar".
 *
 * No celular a senha é digitada às cegas num teclado pequeno, e um erro de uma letra só vira
 * "e-mail ou senha incorretos" sem pista nenhuma do que houve. O olho deixa conferir antes de
 * enviar. O botão fica DENTRO do campo e não recebe foco ao tocar (`onMouseDown` evita o
 * blur), para quem está digitando não perder o teclado ao conferir.
 */
export function CampoSenha({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  className,
  required,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  /** classes do <input> (a borda, a altura e o fundo de cada tela) */
  className?: string;
  required?: boolean;
}) {
  const [visivel, setVisivel] = React.useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visivel ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder={placeholder}
        required={required}
        className={cn(className, "pr-12")}
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? "Esconder a senha" : "Mostrar a senha"}
        aria-pressed={visivel}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-3 hover:text-ink"
      >
        {visivel ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
}

/** Atributos do campo de e-mail para o teclado do celular: sem maiúscula e sem corretor. */
export const ATRIBUTOS_EMAIL = {
  type: "email",
  inputMode: "email",
  autoComplete: "email",
  autoCapitalize: "none",
  autoCorrect: "off",
  spellCheck: false,
} as const;
