/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do projeto Supabase (Fase 5). Ex.: https://xxxx.supabase.co */
  readonly VITE_SUPABASE_URL?: string;
  /** Chave anônima (pública) do Supabase (Fase 5). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
