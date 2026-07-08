/* Varredura one-off: canto adaptativo escolhido + conflitos de rótulo por exercício.
   Uso: npx tsx scripts/sweep-slider-layout.mts */
import { muscleRegions } from "../src/data/muscle-regions";
import { analysisOverlays } from "../src/data/analysis-overlays";
import { exercises } from "../src/data/exercises";

const rects = {
  br: { x1: 66, y1: 64, x2: 98, y2: 98 },
  bl: { x1: 2, y1: 64, x2: 34, y2: 98 },
  tr: { x1: 66, y1: 10, x2: 98, y2: 46 },
} as const;

for (const ex of exercises) {
  const regs = muscleRegions[ex.slug];
  if (!regs) continue;
  const ov = analysisOverlays[ex.slug];
  const shapes = regs.flatMap((r) => r.shapes);
  const rot = regs
    .map((r) => ({
      n: r.musculo,
      s: r.shapes[0],
      ls: r.labelSide,
      pct: ex.ativacao.find((a) => a.musculo === r.musculo)?.percentual ?? 0,
    }))
    .filter((r) => r.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 2);

  const pts: { x: number; y: number }[] = [];
  if (ov?.force) pts.push({ x: ov.force.x1, y: ov.force.y1 }, { x: ov.force.x2, y: ov.force.y2 });
  if (ov?.angle) pts.push({ x: ov.angle.x, y: ov.angle.y });
  for (const r of rot) pts.push({ x: r.s.cx, y: r.s.cy });

  const score = (rc: { x1: number; y1: number; x2: number; y2: number }) => {
    let s = 0;
    for (const sh of shapes) {
      const w = Math.max(0, Math.min(sh.cx + sh.rx, rc.x2) - Math.max(sh.cx - sh.rx, rc.x1));
      const h = Math.max(0, Math.min(sh.cy + sh.ry, rc.y2) - Math.max(sh.cy - sh.ry, rc.y1));
      s += w * h;
    }
    for (const p of pts) if (p.x >= rc.x1 && p.x <= rc.x2 && p.y >= rc.y1 && p.y <= rc.y2) s += 150;
    return s;
  };

  const br = score(rects.br);
  const bl = score(rects.bl);
  const tr = score(rects.tr);
  let card: keyof typeof rects = "br";
  if (br > 25) {
    if (bl < br && bl <= tr) card = "bl";
    else if (tr < br && tr < bl) card = "tr";
  }
  const stripTop = score({ x1: 2, y1: 88, x2: 98, y2: 98 }) > 30;
  const cardRc = rects[card];

  const conflitos: string[] = [];
  for (const r of rot) {
    const side = r.ls ?? (r.s.cy > 55 ? -1 : 1);
    const lx = Math.max(0, Math.min(100, r.s.cx + side * (Math.max(r.s.rx, r.s.ry) * 0.55 + 9.2)));
    const cx1 = side === 1 ? lx : lx - 14;
    const cx2 = side === 1 ? lx + 14 : lx;
    if (cx2 > cardRc.x1 && cx1 < cardRc.x2 && r.s.cy > cardRc.y1 - 2 && r.s.cy < cardRc.y2 + 2)
      conflitos.push(`${r.n}@${side === 1 ? "dir" : "esq"}${lx.toFixed(0)}~card`);
    if (side === -1 && lx < 16) conflitos.push(`${r.n}:chip-estreito(${lx.toFixed(0)})`);
    if (side === 1 && lx > 84) conflitos.push(`${r.n}:sem-espaco-dir(${lx.toFixed(0)})`);
  }
  if (ov?.force) {
    const fx = Math.min(ov.force.x2 + 2.5, 78);
    const fy = Math.max(ov.force.y2, 6);
    if (fx + 14 > cardRc.x1 && fx < cardRc.x2 && fy > cardRc.y1 && fy < cardRc.y2)
      conflitos.push(`força@${fx.toFixed(0)},${fy.toFixed(0)}~card`);
  }

  console.log(
    ex.slug.padEnd(26),
    `card:${card}`,
    stripTop ? "faixa:TOPO" : "faixa:base",
    conflitos.length ? "CONFLITO: " + conflitos.join(" | ") : "ok",
  );
}
