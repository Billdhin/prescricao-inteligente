import type { Aluno, Avaliacao, Prescricao, Liberacao } from "@/data/alunos";
import type { PerfilRemoto } from "./supabaseRepo";
import * as repo from "./supabaseRepo";
import { toast } from "@/lib/toast";

/**
 * Ponte de sincronização com a nuvem (Fase 5 — login real).
 *
 * Os stores locais (useAlunos/useUser) chamam estas funções depois de cada
 * escrita local. Quando NÃO há sessão em nuvem (`cloudOn = false`, que é o caso
 * do app 100% local), elas não fazem nada — o app segue idêntico. Quando há
 * sessão, cada escrita é espelhada no Supabase (upsert por linha).
 *
 * Este módulo importa só o repositório (não os stores), evitando ciclo de
 * import: store.ts -> cloudSync.ts -> supabaseRepo.ts (que usa só tipos do store).
 */

let cloudOn = false;

/** Liga/desliga o espelhamento (chamado pelo estado de auth ao logar/deslogar). */
export function setCloudOn(v: boolean) {
  cloudOn = v;
}

export function isCloudOn() {
  return cloudOn;
}

/**
 * Executa uma gravação em nuvem sem travar a UI. Se falhar, avisa uma vez de
 * forma não bloqueante: o dado continua salvo localmente e volta a sincronizar
 * na próxima escrita ou no próximo login (hidratação).
 */
function mirror(promise: Promise<unknown>, oQue: string) {
  promise.catch((e) => {
    console.warn(`[sync] falha ao salvar ${oQue} na nuvem:`, e?.message ?? e);
    toast(`Salvo neste aparelho. Não consegui sincronizar ${oQue} agora.`);
  });
}

export function cloudSaveAluno(a: Aluno) {
  if (cloudOn) mirror(repo.salvarAluno(a), "o aluno");
}
export function cloudRemoveAluno(id: string) {
  if (cloudOn) mirror(repo.removerAluno(id), "a remoção do aluno");
}
export function cloudSaveAvaliacao(av: Avaliacao) {
  if (cloudOn) mirror(repo.salvarAvaliacao(av), "a avaliação");
}
export function cloudSavePrescricao(p: Prescricao) {
  if (cloudOn) mirror(repo.salvarPrescricao(p), "a prescrição");
}
export function cloudSaveLiberacao(l: Liberacao) {
  if (cloudOn) mirror(repo.salvarLiberacao(l), "a liberação");
}
export function cloudSavePerfil(patch: Partial<PerfilRemoto>) {
  if (cloudOn) mirror(repo.salvarPerfil(patch), "o perfil");
}
