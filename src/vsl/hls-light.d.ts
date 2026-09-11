// O hls.js publica a versão "light" (sem legendas/DRM, ~40% menor) sem tipos próprios no
// `exports`; a API é a mesma da completa.
declare module "hls.js/light" {
  export { default } from "hls.js";
  export * from "hls.js";
}
