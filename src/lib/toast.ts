import { create } from "zustand";

/** Toast global minimalista (sem persist): confirmação visível pós-ação.
 *  Uso: `toast("Prescrição salva no perfil de Ana")` de qualquer lugar. */
interface Toast {
  id: number;
  msg: string;
}

interface ToastState {
  toasts: Toast[];
  push: (msg: string) => void;
  dismiss: (id: number) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (msg) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, msg }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = (msg: string) => useToast.getState().push(msg);
