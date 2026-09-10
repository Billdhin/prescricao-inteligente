import * as React from "react";
import { createPortal } from "react-dom";
import { Camera, Trash2 } from "lucide-react";
import { arquivoParaDataUrl } from "@/lib/imagem";
import { cn } from "@/lib/utils";
import type { Aluno } from "@/data/alunos";

/**
 * A FOTO DO ALUNO: o avatar que mostra a foto quando existe e as iniciais quando não, e o
 * controle de trocar, usado pelo profissional (ficha) e pelo próprio aluno (app).
 *
 * O avatar não impõe forma nem cor: cada tela já tinha o seu (âmbar de 68 px no cabeçalho da
 * ficha, cor da marca no perfil do app), e a foto entra DENTRO dele, no mesmo tamanho e com
 * o mesmo canto. Trocar iniciais por foto não pode mudar o leiaute de nenhuma tela.
 */

/** Tamanho gravado: o maior avatar do produto tem 68 px, 136 em tela de alta densidade. */
const LADO = 160;

export function AvatarAluno({
  aluno,
  className,
  style,
}: {
  aluno: Pick<Aluno, "nome" | "iniciais" | "fotoDataUrl">;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span aria-hidden className={cn("overflow-hidden", className)} style={style}>
      {aluno.fotoDataUrl ? (
        <img src={aluno.fotoDataUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        aluno.iniciais
      )}
    </span>
  );
}

/**
 * O controle de trocar: um botão de câmera colado ao canto do avatar, e o menu com trocar e
 * remover quando já há foto. O arquivo vira um quadrado de 160 px em JPEG antes de sair do
 * aparelho, pela mesma função da foto do profissional em Conta.
 */
export function TrocarFotoAluno({
  aluno,
  onFoto,
  aviso,
  children,
}: {
  aluno: Pick<Aluno, "nome" | "fotoDataUrl">;
  /** recebe a foto já reduzida, ou null para remover */
  onFoto: (foto: string | null) => void;
  /** frase curta sob as opções (ex.: pedir a autorização do aluno) */
  aviso?: string;
  /** o avatar que o botão acompanha */
  children: React.ReactNode;
}) {
  const idArquivo = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [menu, setMenu] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [processando, setProcessando] = React.useState(false);
  const caixaRef = React.useRef<HTMLDivElement>(null);
  const botaoRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);

  /*
   * O MENU VAI PARA O BODY, preso à posição do botão.
   *
   * O avatar da ficha mora num cartão navy com `overflow-hidden` (os halos de cor precisam
   * dele), e o menu desenhado dentro do cartão saía cortado na borda de baixo: via-se
   * "Trocar foto" pela metade, e "Remover foto" e o aviso da autorização sumiam. Mesma lição
   * dos diálogos deste produto: o que flutua sai do cartão.
   */
  const posicionar = React.useCallback(() => {
    const r = botaoRef.current?.getBoundingClientRect();
    if (!r) return;
    const largura = 232;
    setPos({ top: r.bottom + 8, left: Math.max(8, Math.min(r.left - 40, window.innerWidth - largura - 8)) });
  }, []);

  // O menu fecha ao clicar fora ou com Esc. Rolar ou redimensionar o REPOSICIONA em vez de
  // fechar: no celular a barra de endereço some e volta durante a rolagem, e cada vez isso é
  // um "resize"; fechar ali derrubaria o menu no meio do toque.
  React.useEffect(() => {
    if (!menu && !erro) return;
    posicionar();
    const fora = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (caixaRef.current?.contains(alvo) || menuRef.current?.contains(alvo)) return;
      setMenu(false);
      setErro(null);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenu(false);
      setErro(null);
      botaoRef.current?.focus();
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    window.addEventListener("scroll", posicionar, true);
    window.addEventListener("resize", posicionar);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", posicionar, true);
      window.removeEventListener("resize", posicionar);
    };
  }, [menu, erro, posicionar]);

  const escolher = () => {
    setMenu(false);
    posicionar();
    inputRef.current?.click();
  };

  const ler = async (arquivo: File | undefined) => {
    if (!arquivo) return;
    setErro(null);
    setProcessando(true);
    try {
      const foto = await arquivoParaDataUrl(arquivo, { maxW: LADO, maxH: LADO, modo: "cover-quadrado", qualidade: 0.82 });
      onFoto(foto);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível usar essa imagem.");
    } finally {
      setProcessando(false);
      // Permite escolher o MESMO arquivo de novo depois de remover.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const temFoto = !!aluno.fotoDataUrl;
  const rotulo = temFoto ? `Trocar a foto de ${aluno.nome}` : `Pôr uma foto de ${aluno.nome}`;
  // Com aviso (o lado do profissional), o menu abre SEMPRE, também na primeira foto: a frase
  // sobre a autorização do aluno precisa ser lida antes da escolha, e não depois dela.
  const comMenu = temFoto || !!aviso;

  return (
    <div ref={caixaRef} className="relative inline-flex shrink-0">
      {children}
      <button
        ref={botaoRef}
        type="button"
        onClick={() => (comMenu ? setMenu((v) => !v) : escolher())}
        aria-label={rotulo}
        aria-haspopup={comMenu ? "menu" : undefined}
        aria-expanded={comMenu ? menu : undefined}
        title={rotulo}
        disabled={processando}
        className="absolute -bottom-1.5 -right-1.5 grid h-8 w-8 place-items-center rounded-full border-2 border-surface bg-ink text-surface shadow-sm transition-transform hover:scale-105 disabled:opacity-60"
      >
        <Camera className="h-4 w-4" aria-hidden />
      </button>
      <input
        ref={inputRef}
        id={idArquivo}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => void ler(e.target.files?.[0])}
      />
      {menu && pos && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ position: "fixed", top: pos.top, left: pos.left, width: 232 }}
          className="z-[60] rounded-card border border-border bg-surface p-1.5 text-ink shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={escolher}
            className="flex w-full items-center gap-2 rounded-control px-2.5 py-2 text-left text-sm font-medium hover:bg-surface-soft"
          >
            <Camera className="h-4 w-4 text-ink-3" aria-hidden /> {temFoto ? "Trocar foto" : "Escolher foto"}
          </button>
          {temFoto && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenu(false);
                onFoto(null);
              }}
              className="flex w-full items-center gap-2 rounded-control px-2.5 py-2 text-left text-sm font-medium text-danger hover:bg-danger-tint"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Remover foto
            </button>
          )}
          {aviso && <p className="px-2.5 pb-1 pt-1.5 text-2xs leading-relaxed text-ink-3">{aviso}</p>}
        </div>,
        document.body,
      )}
      {erro && pos && createPortal(
        <p
          role="alert"
          style={{ position: "fixed", top: pos.top, left: pos.left, width: 232 }}
          className="z-[60] rounded-control border border-danger/30 bg-danger-tint px-2.5 py-2 text-xs text-danger shadow-lg"
        >
          {erro}
        </p>,
        document.body,
      )}
    </div>
  );
}
