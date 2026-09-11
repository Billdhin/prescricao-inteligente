import * as React from "react";
import type { Modo } from "@/lib/theme/palettes";
import { useUser } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Aparência do app: claro, escuro ou o que o sistema estiver usando.
 *
 * A COR DE MARCA NÃO MORA MAIS AQUI. Ela estava neste componente E de novo no
 * card "Sua marca nos documentos", duas grades idênticas mexendo no MESMO campo
 * (`corPrimaria`), com dois títulos diferentes ("Sua cor no app do aluno" e "Cor
 * da marca") como se fossem coisas distintas. Quem clicasse numa via a outra
 * mudar sozinha, o que é a definição de configuração confusa. Agora existe uma
 * escolha só, no card da marca, ao lado da prévia que mostra onde ela aparece.
 *
 * Aqui fica o que de fato é do profissional e de mais ninguém: como o app dele
 * se parece na tela dele.
 *
 * O desenho é o segmentado do protótipo (10/09/2026): trilho cinza de largura total, o
 * ativo em papel branco com sombra fina, sem ícones. Com as três palavras curtas lado a lado
 * o ícone não acrescentava nada, e a pílula escura do ativo competia com a ação principal.
 */

/** O sistema está escuro agora? Acompanha a troca ao vivo (o celular muda sozinho à noite). */
function useSistemaEscuro(): boolean {
  const consulta = "(prefers-color-scheme: dark)";
  const [escuro, setEscuro] = React.useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.(consulta).matches,
  );
  React.useEffect(() => {
    const mq = window.matchMedia?.(consulta);
    if (!mq) return;
    const mudou = () => setEscuro(mq.matches);
    mq.addEventListener("change", mudou);
    return () => mq.removeEventListener("change", mudou);
  }, []);
  return escuro;
}

const MODOS: { id: Modo; label: string }[] = [
  { id: "claro", label: "Claro" },
  { id: "escuro", label: "Escuro" },
  { id: "sistema", label: "Sistema" },
];

export function SeletorTema() {
  const modo = (useUser((s) => s.modo) || "claro") as Modo;
  const setPerfil = useUser((s) => s.setPerfil);
  const sistemaEscuro = useSistemaEscuro();

  // "Sistema" sozinho não diz o que a pessoa está vendo; o rodapé resolve para o tema de fato.
  const agora =
    modo === "claro" ? "Claro" : modo === "escuro" ? "Escuro" : `Sistema (${sistemaEscuro ? "escuro" : "claro"})`;

  return (
    <div>
      <div role="group" aria-label="Aparência" className="mt-3 flex w-full gap-0.5 rounded-[15px] bg-bg p-[3px]">
        {MODOS.map(({ id, label }) => {
          const on = id === modo;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPerfil({ modo: id })}
              aria-pressed={on}
              className={cn(
                "flex-1 justify-center rounded-control p-2 text-center text-[12.5px] transition-colors",
                on ? "bg-surface font-bold text-ink shadow-[0_1px_2px_rgba(0,0,0,.08)]" : "font-semibold text-ink-2 hover:text-ink",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      {/* As duas afirmações são conferidas no código: o modo não sobe para a nuvem (só a cor
          de marca sobe), e a pele do app do aluno é escura sempre (palettes.ts). */}
      <p className="mt-2.5 text-[12.5px] text-ink-2">
        Agora: <b className="font-semibold text-ink">{agora}</b>. Vale só para você, neste navegador; o app do
        aluno segue escuro sempre, com a sua cor de marca.
      </p>
    </div>
  );
}
