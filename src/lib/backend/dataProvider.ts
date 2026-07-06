/**
 * Camada de acesso a dados (ponto de troca mock → Supabase).
 *
 * Hoje o app lê os dados diretamente de `src/data/*` (mock local). Este módulo
 * define a INTERFACE assíncrona que a UI deve passar a consumir na Fase 5, para
 * que trocar o backend (Supabase/API) seja um drop-in, sem retrabalho de tela.
 *
 * - `localProvider` — implementação atual, servindo os seeds em memória.
 * - Supabase — plugará aqui uma `supabaseProvider` (mesma interface) lendo das
 *   tabelas de `supabase/migrations/0001_init.sql`. Ver supabase/README.md.
 *
 * `getContentProvider()` centraliza a escolha: enquanto não houver env do
 * Supabase configurado, devolve o provider local.
 */
import type { Exercise, PracticeCase, Track } from "@/data/types";
import type { LibEntry } from "@/data/library";
import type { AnalysisOverlayData } from "@/data/analysis-overlays";
import { exercises } from "@/data/exercises";
import { cases } from "@/data/cases";
import { tracks } from "@/data/tracks";
import { biblioteca } from "@/data/library";
import { analysisOverlays } from "@/data/analysis-overlays";
import { isSupabaseConfigured } from "@/lib/backend/supabaseClient";

export interface ContentProvider {
  getExercises(): Promise<Exercise[]>;
  getExercise(slug: string): Promise<Exercise | undefined>;
  getCases(): Promise<PracticeCase[]>;
  getCase(slug: string): Promise<PracticeCase | undefined>;
  getTracks(): Promise<Track[]>;
  getTrack(slug: string): Promise<Track | undefined>;
  getLibrary(): Promise<LibEntry[]>;
  getAnalysisOverlay(slug: string): Promise<AnalysisOverlayData | undefined>;
}

/** Implementação local (mock em memória) — fonte de verdade atual. */
export const localProvider: ContentProvider = {
  async getExercises() {
    return exercises;
  },
  async getExercise(slug) {
    return exercises.find((e) => e.slug === slug);
  },
  async getCases() {
    return cases;
  },
  async getCase(slug) {
    return cases.find((c) => c.slug === slug);
  },
  async getTracks() {
    return tracks;
  },
  async getTrack(slug) {
    return tracks.find((t) => t.slug === slug);
  },
  async getLibrary() {
    return biblioteca;
  },
  async getAnalysisOverlay(slug) {
    return analysisOverlays[slug];
  },
};

/**
 * Devolve o provider ativo. Quando `VITE_SUPABASE_URL`/`ANON_KEY` estiverem
 * configurados (Fase 5), retornar aqui a `supabaseProvider`.
 */
export function getContentProvider(): ContentProvider {
  if (isSupabaseConfigured()) {
    // Fase 5: return supabaseProvider;  (mesma interface, lendo do Postgres)
  }
  return localProvider;
}
