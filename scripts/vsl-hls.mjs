/**
 * Gera a pasta HLS de um VSL (o que a VTurb faz no upload): 4 qualidades (1080, 720, 480,
 * 360), pedaços de 4 s em fMP4, qualidade adaptativa com teto de banda e a capa.
 *
 *   node scripts/vsl-hls.mjs "<video.mp4>" <pasta-de-saida> [segundo-da-capa]
 *
 * Depois: copiar a pasta para o ramo `vsl-midia` com o nome da versão (ex.: 2026-09-11) e
 * apontar `src`/`capa` em src/vsl/videos.ts para ela. Pasta nova a cada versão, porque os
 * pedaços vão com cache eterno.
 *
 * Por que fMP4 (.m4s) e não .ts: dentro de um projeto TypeScript, arquivo .ts em public/ é
 * lido como código pelo servidor de desenvolvimento e por ferramenta que varre o repositório.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const [entrada, saida, capaEm = "5"] = process.argv.slice(2);
if (!entrada || !saida || !existsSync(entrada)) {
  console.error('uso: node scripts/vsl-hls.mjs "<video.mp4>" <pasta-de-saida> [segundo-da-capa]');
  process.exit(1);
}
mkdirSync(saida, { recursive: true });
const Q = [
  { nome: "1080", w: 1920, h: 1080, crf: 22, max: "3800k", buf: "7600k", aud: "128k" },
  { nome: "720", w: 1280, h: 720, crf: 22, max: "2000k", buf: "4000k", aud: "128k" },
  { nome: "480", w: 854, h: 480, crf: 23, max: "950k", buf: "1900k", aud: "96k" },
  { nome: "360", w: 640, h: 360, crf: 24, max: "550k", buf: "1100k", aud: "80k" },
];
const split = `[0:v]split=${Q.length}${Q.map((_, i) => `[v${i}]`).join("")};` + Q.map((q, i) => `[v${i}]scale=${q.w}:${q.h}:flags=lanczos[o${i}]`).join(";");
const args = ["-v", "error", "-y", "-i", entrada, "-filter_complex", split];
Q.forEach((_, i) => args.push("-map", `[o${i}]`));
Q.forEach(() => args.push("-map", "0:a"));
args.push("-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-g", "60", "-keyint_min", "60", "-sc_threshold", "0");
Q.forEach((q, i) => args.push(`-crf:v:${i}`, String(q.crf), `-maxrate:v:${i}`, q.max, `-bufsize:v:${i}`, q.buf));
args.push("-c:a", "aac", "-ac", "2", "-ar", "48000");
Q.forEach((q, i) => args.push(`-b:a:${i}`, q.aud));
args.push(
  "-f", "hls", "-hls_time", "4", "-hls_playlist_type", "vod", "-hls_flags", "independent_segments",
  "-hls_segment_type", "fmp4", "-hls_fmp4_init_filename", "init.mp4",
  "-hls_segment_filename", "v%v/s%03d.m4s", "-master_pl_name", "master.m3u8",
  "-var_stream_map", Q.map((q, i) => `v:${i},a:${i},name:${q.nome}`).join(" "), "v%v/index.m3u8",
);
console.log("gerando HLS (demora alguns minutos)...");
execFileSync("ffmpeg", args, { cwd: saida, stdio: "inherit" });
execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", capaEm, "-i", entrada, "-frames:v", "1", "-vf", "scale=1280:-2:flags=lanczos", "-c:v", "libwebp", "-quality", "82", join(saida, "capa.webp")]);
console.log("pronto:", saida);
