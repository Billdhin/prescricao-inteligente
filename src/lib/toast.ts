import { create } from "zustand";

/** Toast global minimalista (sem persist): confirmação visível pós-ação.
 *  Uso: `toast("Prescrição salva no perfil de Ana")` de qualquer lugar.
 *
 *  TOM E AÇÃO NÃO SÃO ENFEITE, SÃO O MOTIVO DESTE ARQUIVO TER MUDADO.
 *
 *  1. Tom. Antes o toast só sabia confirmar: a pilha inteira saía com um tique verde,
 *     inclusive "Não consegui sincronizar o plano de treino agora". O único canal de aviso
 *     de falha de gravação se disfarçava de confirmação, e quem usa aprende a ignorar
 *     exatamente a mensagem que importa. Falha agora sai com tom próprio.
 *
 *  2. Ação. Este é um produto de prontuário, e sete ações destrutivas viviam sem confirmar
 *     e sem desfazer. Não era descuido de tela: o primitivo era `msg: string` e nada mais,
 *     então "Desfazer" não existia em lugar nenhum POR CONSTRUÇÃO. Com ação, quem apagou
 *     por engano tem volta, e o toast com ação vive mais tempo, porque a leitura agora
 *     precede uma decisão.
 */
export type ToastTom = "ok" | "falha";

export interface ToastAcao {
  /** Rótulo do botão. Diz o que acontece: "Desfazer", "Tentar de novo". */
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  msg: string;
  tom: ToastTom;
  acao?: ToastAcao;
}

export interface ToastOpcoes {
  tom?: ToastTom;
  acao?: ToastAcao;
}

/** Sem ação, o toast é aviso e sai rápido. Com ação, ele é uma decisão e precisa de tempo
 *  para ser lida, alcançada e clicada, inclusive no celular com uma mão só. */
const MS_AVISO = 4200;
const MS_COM_ACAO = 9000;

interface ToastState {
  toasts: Toast[];
  push: (msg: string, opts?: ToastOpcoes) => void;
  dismiss: (id: number) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (msg, opts) => {
    const id = Date.now() + Math.random();
    const tom = opts?.tom ?? "ok";
    const acao = opts?.acao;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, msg, tom, acao }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      acao ? MS_COM_ACAO : MS_AVISO,
    );
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Confirmação (ou qualquer aviso neutro). Aceita ação: `toast("Removido", { acao })`. */
export const toast = (msg: string, opts?: ToastOpcoes) => useToast.getState().push(msg, opts);

/** Falha. Sai com tom próprio, nunca com o tique de sucesso. */
export const toastFalha = (msg: string, opts?: Omit<ToastOpcoes, "tom">) =>
  useToast.getState().push(msg, { ...opts, tom: "falha" });

/** Ação desfeita: atalho para o par "removi" + "Desfazer", que é o caso de uso que
 *  motivou a ação existir. O rótulo é fixo de propósito, para não virar dez variantes. */
export const toastDesfazer = (msg: string, desfazer: () => void) =>
  useToast.getState().push(msg, { acao: { label: "Desfazer", onClick: desfazer } });
