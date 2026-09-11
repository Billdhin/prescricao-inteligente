# Mídia do VSL

Este ramo guarda só o vídeo do VSL em HLS (uma pasta por versão). Ele não tem código.

- O deploy (`.github/workflows/deploy-cloudflare.yml` na main) copia este ramo para `dist/vsl/`.
- Para ver o vídeo no `npm run dev`: `npm run vsl:midia` na main.
- Versão nova: `node scripts/vsl-hls.mjs "<video.mp4>" <pasta>` na main, copiar a pasta para
  cá com a data da versão e apontar `src/vsl/videos.ts` para ela. Pasta nova, sempre: os
  pedaços vão ao ar com cache eterno.
