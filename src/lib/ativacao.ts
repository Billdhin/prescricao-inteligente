/**
 * Instrumentação de ATIVAÇÃO — a métrica-mãe dos primeiros 30 dias:
 * "Primeiro Caso Real resolvido em <10 minutos". Marcos gravados uma única
 * vez em localStorage (sem backend): início do uso, primeira recomendação
 * gerada e primeira prescrição salva.
 */

const KEY = "pi-ativacao";

export interface Ativacao {
  inicio?: number;
  primeiroResultado?: number;
  primeiroSalvo?: number;
  /** o Painel já celebrou o primeiro caso (mostrar 1x) */
  celebrado?: boolean;
}

export function getAtivacao(): Ativacao {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Ativacao;
  } catch {
    return {};
  }
}

function save(a: Ativacao) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* storage indisponível — instrumentação é melhor-esforço */
  }
}

/** Grava o marco apenas na primeira ocorrência. */
export function marcarAtivacao(marco: "inicio" | "primeiroResultado" | "primeiroSalvo") {
  const a = getAtivacao();
  if (a[marco]) return;
  if (marco !== "inicio" && !a.inicio) a.inicio = Date.now();
  a[marco] = Date.now();
  save(a);
}

export function marcarCelebrado() {
  const a = getAtivacao();
  a.celebrado = true;
  save(a);
}

/** Minutos entre o início e o primeiro caso salvo (null se ainda não houve, ou
 *  se a sessão atravessou horas/dias e o número deixaria de fazer sentido). */
export function minutosPrimeiroCaso(): number | null {
  const a = getAtivacao();
  if (!a.inicio || !a.primeiroSalvo) return null;
  const min = Math.round((a.primeiroSalvo - a.inicio) / 60_000);
  // Acima de ~2h a métrica "resolveu em X min" perde o sentido (o onboarding
  // começou noutra sessão); melhor omitir o tempo do que mostrar "4281 min".
  if (min < 1 || min > 120) return null;
  return min;
}
