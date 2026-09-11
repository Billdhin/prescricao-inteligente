import * as React from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { PRIMARIOS, MAIS, CONTA, itemAtivo, type NavItem } from "@/components/app/nav";
import { cn } from "@/lib/utils";

/*
 * O "+" FLUTUANTE DO MOBILE, QUE ABRE EM LEQUE (pedido do Filipe em 11/09/2026).
 *
 * Antes eram duas coisas: um "+" âmbar que só cadastrava aluno (e só no Meu dia e na lista de
 * alunos) e um sexto slot "Mais" na barra de baixo, que abria uma folha. Agora o "+" é a porta
 * do que não cabe nos cinco destinos da barra: ao tocar, ele gira e vira um "×", a tela escurece
 * e os atalhos sobem um a um, cada um com o rótulo numa pílula e o ícone num círculo colorido.
 *
 * - Cadastrar aluno fica colado ao botão, que é onde o polegar já está e a ação mais usada.
 * - Estudar, Laboratório Visual e Protocolos vêm de `MAIS`; Ajuda e Configurações, de `CONTA`
 *   (nav.ts), a mesma lista que a lateral, a busca e o check:menu leem. "Sair da conta" mora em
 *   Configurações, longe de um toque acidental num leque.
 * - Os filhos (Grupos Especiais, Consultar, Comparador) não entram no leque: seis círculos
 *   empilhados é o que cabe acima da barra num celular de 320 px, e cada filho continua a um
 *   toque dentro da página do pai e na busca.
 *
 * A abertura e o fechamento são animados (o leque sobe de baixo para cima e desce ao contrário),
 * então o leque fica montado durante a saída. Com "reduzir movimento" ligado, tudo aparece
 * e some sem deslocamento.
 */

type Atalho = { item: NavItem; circulo: string };

/** A cor do círculo diz a família do destino, a mesma da folha antiga e da lateral. */
const CIRCULO: Record<string, string> = {
  "/alunos?novo=1": "bg-warning-fill text-on-warning-fill",
  "/aprender": "bg-primary text-on-primary",
  "/movement-lab": "bg-analysis-fill text-on-analysis-fill",
  "/protocols": "bg-success-fill text-on-success-fill",
};
const CIRCULO_NEUTRO = "bg-surface text-ink ring-1 ring-inset ring-border";

function montarAtalhos(): Atalho[] {
  const cadastrar = PRIMARIOS.flatMap((i) => i.children ?? []).find((c) => c.to === "/alunos?novo=1");
  // Da mais distante do polegar (topo) para a mais próxima (colada ao botão).
  const lista: NavItem[] = [...CONTA].reverse().concat([...MAIS].reverse());
  if (cadastrar) lista.push(cadastrar as NavItem);
  return lista.map((item) => ({ item, circulo: CIRCULO[item.to] ?? CIRCULO_NEUTRO }));
}

const DURACAO = 280;

export function MenuFlutuante() {
  const { pathname, search } = useLocation();
  const [montado, setMontado] = React.useState(false);
  const [aberto, setAberto] = React.useState(false);
  const botaoRef = React.useRef<HTMLButtonElement>(null);
  const primeiroRef = React.useRef<HTMLAnchorElement>(null);
  const timer = React.useRef<number>();
  const atalhos = React.useMemo(montarAtalhos, []);
  const idLeque = "menu-flutuante-leque";

  const lequeRef = React.useRef<HTMLElement>(null);
  const abrirPendente = React.useRef(false);

  const abrir = () => {
    window.clearTimeout(timer.current);
    abrirPendente.current = true;
    if (montado) setAberto(true);
    else setMontado(true);
  };

  // O leque monta FECHADO e só então abre, para a transição ter de onde partir. A leitura do
  // tamanho força o navegador a calcular o estado fechado antes da troca de classes. Era um
  // requestAnimationFrame duplo, e ele falhava quieto: com a aba sem quadro (o navegador pausa
  // o rAF), o leque montava e nunca abria.
  React.useLayoutEffect(() => {
    if (!montado || !abrirPendente.current) return;
    abrirPendente.current = false;
    lequeRef.current?.getBoundingClientRect();
    setAberto(true);
  }, [montado]);
  const fechar = React.useCallback((devolverFoco = false) => {
    abrirPendente.current = false;
    setAberto(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMontado(false), DURACAO + 120);
    if (devolverFoco) botaoRef.current?.focus();
  }, []);

  // Trocar de rota fecha na hora: o destino já foi alcançado.
  React.useEffect(() => {
    window.clearTimeout(timer.current);
    setAberto(false);
    setMontado(false);
  }, [pathname, search]);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  React.useEffect(() => {
    if (!aberto) return;
    primeiroRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && fechar(true);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aberto, fechar]);

  const aqui = pathname + search;
  const n = atalhos.length;

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        onClick={() => (aberto ? fechar() : abrir())}
        aria-expanded={aberto}
        aria-controls={montado ? idLeque : undefined}
        aria-label={aberto ? "Fechar atalhos" : "Abrir atalhos: cadastrar aluno, estudar, laboratório, protocolos, ajuda e configurações"}
        className={cn(
          "fixed bottom-[calc(86px+env(safe-area-inset-bottom))] right-4 z-50 grid h-14 w-14 place-items-center rounded-full lg:hidden",
          "transition-[background-color,box-shadow,transform] duration-300 active:scale-95 motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          aberto ? "bg-ink text-surface shadow-lift" : "bg-warning-fill text-on-warning-fill",
        )}
        style={aberto ? undefined : { boxShadow: "0 14px 28px -12px rgba(232,163,23,.8)" }}
      >
        {/* O "+" gira 135° e vira "×", com um leve passo além do fim (a mola) antes de assentar. */}
        <Plus
          aria-hidden
          strokeWidth={2.5}
          className={cn(
            "h-6 w-6 transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] motion-reduce:transition-none",
            aberto && "rotate-[135deg]",
          )}
        />
      </button>

      {montado &&
        createPortal(
          <>
            {/* O véu fica acima da barra de baixo (z-30) e abaixo do botão e do leque (z-50).
                `touch-none` impede que um arrasto no véu role a página por trás. */}
            <div
              aria-hidden
              onClick={() => fechar()}
              className={cn(
                "fixed inset-0 z-40 touch-none bg-[#0B1628]/55 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden motion-reduce:transition-none",
                aberto ? "opacity-100" : "opacity-0",
              )}
            />
            <nav
              ref={lequeRef}
              id={idLeque}
              aria-label="Atalhos"
              className="pointer-events-none fixed bottom-[calc(154px+env(safe-area-inset-bottom))] right-5 z-50 lg:hidden"
            >
              <ul className="flex flex-col items-end gap-3">
                {atalhos.map(({ item, circulo }, i) => {
                  // Abrindo, sobe primeiro o mais próximo do botão; fechando, desce primeiro o do topo.
                  const doBotao = n - 1 - i;
                  const atraso = aberto ? doBotao * 35 : i * 22;
                  const ativo = item.to.includes("?") ? aqui === item.to : itemAtivo(item, pathname);
                  const Icone = item.icon;
                  return (
                    <li
                      key={item.to}
                      className={cn(
                        "transition-[opacity,transform] duration-300 ease-[cubic-bezier(.2,.9,.3,1.2)] motion-reduce:transition-none",
                        aberto ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-75 opacity-0",
                      )}
                      style={{ transitionDelay: `${atraso}ms`, transformOrigin: "right center" }}
                    >
                      <Link
                        ref={doBotao === 0 ? primeiroRef : undefined}
                        to={item.to}
                        tabIndex={aberto ? undefined : -1}
                        aria-current={ativo ? "page" : undefined}
                        className="group flex items-center gap-3 rounded-full focus-visible:outline-none"
                      >
                        <span
                          className={cn(
                            "rounded-full bg-surface px-4 py-2 text-[14.5px] font-semibold text-ink shadow-lift ring-1 ring-inset ring-border transition-colors",
                            "group-focus-visible:ring-2 group-focus-visible:ring-primary",
                            ativo && "ring-2 ring-ink",
                          )}
                        >
                          {item.label}
                        </span>
                        <span
                          aria-hidden
                          className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-full shadow-lift", circulo)}
                        >
                          <Icone className="h-5 w-5" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </>,
          document.body,
        )}
    </>
  );
}
