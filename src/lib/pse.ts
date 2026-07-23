// Helpers compartilhados da percepção de esforço da SESSÃO (PSE / sRPE), usados nos
// dois lados: o modo guiado do aluno (tela de conclusão) e o painel do profissional
// ("Como o aluno sentiu"). A escala e os rótulos vêm do parâmetro p-rpe (0 Repouso a
// 10 Máximo), para nunca inventar rótulo; a cor por faixa segue os tokens (par tint +
// texto da mesma família = AA garantido nas duas aparências).
import { getParam } from "@/data/monitoringParameters";

// A escala rotulada de p-rpe (0 Repouso a 10 Máximo), lida do parâmetro para não
// inventar rótulo. Cada entrada vira uma faixa numérica + o rótulo base (antes do ":").
const escalaPse = getParam("p-rpe")?.escala ?? [];

function faixaNumerica(valor: string): [number, number] {
  const nums = (valor.match(/\d+/g) ?? []).map(Number);
  if (nums.length === 0) return [NaN, NaN];
  return [nums[0], nums.length > 1 ? nums[1] : nums[0]];
}

// Rótulo da faixa de p-rpe de um valor (ex.: 6 -> "6-7" / "Intenso"). Usa hífen no
// intervalo (nunca travessão) e o rótulo EXATO do parâmetro (Repouso/Muito leve/...).
export function rotuloFaixaPse(n: number): { faixa: string; rotulo: string } {
  for (const e of escalaPse) {
    const [a, b] = faixaNumerica(e.valor);
    if (Number.isFinite(a) && n >= a && n <= b) {
      return { faixa: a === b ? String(a) : `${a}-${b}`, rotulo: e.rotulo.split(":")[0].trim() };
    }
  }
  return { faixa: String(n), rotulo: "" };
}

export type FamiliaPse = "success" | "warning" | "danger";

// Cor do chip por faixa: 0-3 success, 4-5 warning suave, 6-7 warning (com anel),
// 8-10 danger. Segue os tokens (tint + texto da mesma família = par com AA garantido).
export function bandaPse(n: number): { familia: FamiliaPse; forte: boolean } {
  if (n <= 3) return { familia: "success", forte: false };
  if (n <= 5) return { familia: "warning", forte: false };
  if (n <= 7) return { familia: "warning", forte: true };
  return { familia: "danger", forte: false };
}

export const TINT_PSE: Record<FamiliaPse, string> = {
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-danger-tint text-danger",
};
export const RING_PSE: Record<FamiliaPse, string> = {
  success: "ring-success/50",
  warning: "ring-warning/50",
  danger: "ring-danger/50",
};
