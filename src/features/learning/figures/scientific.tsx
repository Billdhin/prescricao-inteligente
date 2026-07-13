import * as React from "react";

/**
 * Biblioteca de FIGURAS CIENTÍFICAS do Aprender.
 *
 * Esquemas didáticos originais, em SVG, com linguagem visual uniforme, cores da
 * marca (tokens CSS) e responsivos (viewBox). Substituem placeholders e imagens
 * proprietárias. Baseadas no "Manual de Fisiologia Humana aplicada à Educação
 * Física" (23 capítulos, figuras originais). São ESQUEMÁTICAS: priorizam clareza
 * do mecanismo sobre proporção anatômica exata (indicado na legenda quando cabe).
 *
 * Cada figura é um componente que devolve apenas o <svg>. O registro FIGURES
 * associa um id a título, subtítulo, legenda e componente. O bloco de aula
 * "figure" (ver blocks/index.tsx) renderiza a figura por id, com moldura, título
 * e legenda padronizados.
 */

/* ------------------------------- helpers -------------------------------- */

const C = {
  primary: "var(--primary)",
  analysis: "var(--analysis)",
  cta: "var(--cta)",
  success: "var(--success)",
  warning: "var(--warning)",
  ink: "var(--ink)",
  ink2: "var(--ink-2)",
  ink3: "var(--ink-3)",
  border: "var(--border)",
  surface: "var(--surface)",
  soft: "var(--surface-soft)",
  tint: "var(--primary-tint)",
};

/** Marcador de seta reutilizável (id único por figura para evitar colisão). */
function Arrowhead({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M0,0 L9,4.5 L0,9 Z" fill={color} />
    </marker>
  );
}

/** Caixa arredondada rotulada para fluxogramas. */
function NodeBox({
  x,
  y,
  w,
  h,
  fill,
  stroke,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  children: React.ReactNode;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {children}
    </g>
  );
}

/** Texto centralizado com até duas linhas. */
function CenterText({
  cx,
  cy,
  lines,
  color = C.ink,
  size = 14,
  weight = 700,
}: {
  cx: number;
  cy: number;
  lines: string[];
  color?: string;
  size?: number;
  weight?: number;
}) {
  const lh = size + 3;
  const startY = cy - ((lines.length - 1) * lh) / 2;
  return (
    <text textAnchor="middle" fill={color} fontSize={size} fontWeight={weight}>
      {lines.map((l, i) => (
        <tspan key={i} x={cx} y={startY + i * lh}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

const svgProps = (label: string) => ({
  role: "img" as const,
  "aria-label": label,
  className: "mx-auto h-auto w-full",
  preserveAspectRatio: "xMidYMid meet",
});

/* ============================ 1. HOMEOSTASE ============================= */

function FigHomeostase() {
  return (
    <svg viewBox="0 0 720 340" {...svgProps("Circuito de controle homeostático: estímulo, sensor, centro integrador, efetor, resposta e feedback negativo")}>
      <defs>
        <Arrowhead id="ah-homeo" color={C.primary} />
        <Arrowhead id="ah-homeo-fb" color={C.analysis} />
      </defs>
      {/* nós da via */}
      <NodeBox x={16} y={40} w={150} h={70} fill={C.soft} stroke={C.cta}>
        <CenterText cx={91} cy={68} lines={["Estímulo /", "perturbação"]} color={C.ink} />
        <text x={91} y={98} textAnchor="middle" fontSize={11} fill={C.ink3}>desvia a variável</text>
      </NodeBox>
      <NodeBox x={200} y={40} w={150} h={70} fill={C.soft} stroke={C.primary}>
        <CenterText cx={275} cy={68} lines={["Sensor", "(receptor)"]} color={C.primary} />
        <text x={275} y={98} textAnchor="middle" fontSize={11} fill={C.ink3}>detecta o desvio</text>
      </NodeBox>
      <NodeBox x={384} y={40} w={150} h={70} fill={C.soft} stroke={C.primary}>
        <CenterText cx={459} cy={68} lines={["Centro", "integrador"]} color={C.primary} />
        <text x={459} y={98} textAnchor="middle" fontSize={11} fill={C.ink3}>compara ao set point</text>
      </NodeBox>
      <NodeBox x={554} y={40} w={150} h={70} fill={C.soft} stroke={C.success}>
        <CenterText cx={629} cy={68} lines={["Efetor"]} color={C.success} />
        <text x={629} y={92} textAnchor="middle" fontSize={11} fill={C.ink3}>músculo, glândula,</text>
        <text x={629} y={104} textAnchor="middle" fontSize={11} fill={C.ink3}>rim, vaso</text>
      </NodeBox>
      {/* setas via */}
      <line x1={166} y1={75} x2={196} y2={75} stroke={C.primary} strokeWidth={2.5} markerEnd="url(#ah-homeo)" />
      <line x1={350} y1={75} x2={380} y2={75} stroke={C.primary} strokeWidth={2.5} markerEnd="url(#ah-homeo)" />
      <line x1={534} y1={75} x2={550} y2={75} stroke={C.primary} strokeWidth={2.5} markerEnd="url(#ah-homeo)" />
      {/* resposta */}
      <NodeBox x={554} y={175} w={150} h={64} fill={C.tint} stroke={C.primary}>
        <CenterText cx={629} cy={200} lines={["Resposta"]} color={C.primary} size={14} />
        <text x={629} y={222} textAnchor="middle" fontSize={11} fill={C.ink3}>compensatória</text>
      </NodeBox>
      <line x1={629} y1={110} x2={629} y2={171} stroke={C.success} strokeWidth={2.5} markerEnd="url(#ah-homeo)" />
      {/* feedback negativo (curva de volta ao estímulo) */}
      <path
        d="M 554 207 C 340 300, 220 300, 120 300 C 90 300, 78 250, 82 116"
        fill="none"
        stroke={C.analysis}
        strokeWidth={2.5}
        markerEnd="url(#ah-homeo-fb)"
      />
      <rect x={250} y={276} width={210} height={44} rx={10} fill={C.surface} stroke={C.analysis} strokeWidth={1.5} />
      <text x={355} y={295} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.analysis}>Feedback negativo</text>
      <text x={355} y={311} textAnchor="middle" fontSize={11} fill={C.ink2}>reduz o desvio e reaproxima da faixa</text>
      {/* nota feedforward */}
      <text x={16} y={150} fontSize={11} fill={C.ink3}>Feedforward: ajusta antes do desvio se completar.</text>
    </svg>
  );
}

/* ======================= 2. SISTEMAS INTEGRADOS ======================== */

function FigSistemas() {
  const left = [
    ["Nervoso", "controle rápido", C.primary],
    ["Endócrino", "controle lento", "#db2777"],
    ["Cardiovascular", "transporte", "#dc2626"],
    ["Respiratório", "troca gasosa", C.primary],
    ["Musculoesquelético", "movimento", C.cta],
  ];
  const right = [
    ["Digestório", "nutrientes", C.warning],
    ["Renal/urinário", "meio interno", C.analysis],
    ["Imune/linfático", "defesa", C.success],
    ["Tegumentar", "barreira e calor", C.ink2],
    ["Reprodutor", "continuidade", "#7c3aed"],
  ];
  const rowY = (i: number) => 60 + i * 62;
  return (
    <svg viewBox="0 0 720 400" {...svgProps("Onze sistemas orgânicos conectados pela homeostase, organizados como rede de controle, transporte, troca, proteção e movimento")}>
      <defs>
        <Arrowhead id="ah-sis" color={C.ink3} />
      </defs>
      {/* núcleo homeostase */}
      <circle cx={360} cy={180} r={62} fill={C.tint} stroke={C.primary} strokeWidth={2} />
      <CenterText cx={360} cy={172} lines={["Homeostase"]} color={C.primary} size={15} />
      <text x={360} y={196} textAnchor="middle" fontSize={11} fill={C.ink2}>eixo integrador</text>
      {left.map(([t, s, col], i) => (
        <g key={t}>
          <NodeBox x={20} y={rowY(i) - 22} w={190} h={46} fill={C.surface} stroke={col as string}>
            <circle cx={44} cy={rowY(i)} r={8} fill={col as string} />
            <text x={62} y={rowY(i) - 2} fontSize={13} fontWeight={700} fill={C.ink}>{t}</text>
            <text x={62} y={rowY(i) + 13} fontSize={10.5} fill={C.ink3}>{s}</text>
          </NodeBox>
          <line x1={210} y1={rowY(i)} x2={300} y2={180} stroke={C.border} strokeWidth={1.5} />
        </g>
      ))}
      {right.map(([t, s, col], i) => (
        <g key={t}>
          <NodeBox x={510} y={rowY(i) - 22} w={190} h={46} fill={C.surface} stroke={col as string}>
            <circle cx={534} cy={rowY(i)} r={8} fill={col as string} />
            <text x={552} y={rowY(i) - 2} fontSize={13} fontWeight={700} fill={C.ink}>{t}</text>
            <text x={552} y={rowY(i) + 13} fontSize={10.5} fill={C.ink3}>{s}</text>
          </NodeBox>
          <line x1={510} y1={rowY(i)} x2={420} y2={180} stroke={C.border} strokeWidth={1.5} />
        </g>
      ))}
      <rect x={150} y={356} width={420} height={34} rx={10} fill={C.ink} />
      <text x={360} y={378} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="#fff">
        Integração dinâmica, não compartimentos isolados
      </text>
    </svg>
  );
}

/* ======================= 3. POTENCIAL DE AÇÃO ========================== */

function FigPotencialAcao() {
  // eixo: x tempo (ms), y mV. viewBox 720x360, área do gráfico 90..680 x 40..300
  const x0 = 90, x1 = 680, y0 = 300, yTop = 40;
  const mvToY = (mv: number) => y0 - ((mv + 90) / 130) * (y0 - yTop); // -90..+40
  const msToX = (t: number) => x0 + (t / 6) * (x1 - x0); // 0..6 ms
  const pts: [number, number][] = [
    [0, -70], [1.0, -70], [1.4, -55], [1.7, 30], [2.0, 35], [2.4, -20],
    [2.9, -75], [3.4, -85], [4.0, -78], [5.0, -71], [6, -70],
  ];
  const path = pts.map(([t, mv], i) => `${i === 0 ? "M" : "L"} ${msToX(t).toFixed(1)} ${mvToY(mv).toFixed(1)}`).join(" ");
  const gridMv = [40, 0, -55, -70, -90];
  return (
    <svg viewBox="0 0 720 360" {...svgProps("Potencial de ação: repouso, limiar, despolarização por sódio, repolarização por potássio e hiperpolarização")}>
      {/* grade */}
      {gridMv.map((mv) => (
        <g key={mv}>
          <line x1={x0} y1={mvToY(mv)} x2={x1} y2={mvToY(mv)} stroke={C.border} strokeWidth={1} strokeDasharray="3 3" />
          <text x={x0 - 8} y={mvToY(mv) + 4} textAnchor="end" fontSize={11} fill={C.ink3}>{mv}</text>
        </g>
      ))}
      {/* eixos */}
      <line x1={x0} y1={yTop} x2={x0} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      <text x={30} y={175} fontSize={12} fill={C.ink2} transform="rotate(-90 30 175)">Potencial (mV)</text>
      <text x={385} y={335} textAnchor="middle" fontSize={12} fill={C.ink2}>Tempo (ms)</text>
      {/* limiar */}
      <line x1={x0} y1={mvToY(-55)} x2={x1} y2={mvToY(-55)} stroke={C.warning} strokeWidth={1.3} strokeDasharray="5 4" />
      <text x={x1 - 4} y={mvToY(-55) - 6} textAnchor="end" fontSize={11} fontWeight={600} fill={C.warning}>limiar (~-55 mV)</text>
      {/* curva */}
      <path d={path} fill="none" stroke={C.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {/* rótulos das fases */}
      <text x={msToX(1.55)} y={mvToY(30) - 10} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={C.cta}>Na⁺ entra (↑)</text>
      <text x={msToX(2.6)} y={mvToY(-5)} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={C.analysis}>K⁺ sai (↓)</text>
      <text x={msToX(3.5)} y={mvToY(-88) + 22} textAnchor="middle" fontSize={11} fill={C.ink3}>hiperpolarização</text>
      <text x={msToX(0.5)} y={mvToY(-70) - 8} fontSize={11} fill={C.ink3}>repouso</text>
    </svg>
  );
}

/* ===================== 4. TRANSPORTE DE MEMBRANA ======================= */

function FigTransporte() {
  const y = 150;
  return (
    <svg viewBox="0 0 720 300" {...svgProps("Transporte através da membrana: difusão simples, canal, difusão facilitada por carreador e transporte ativo pela bomba")}>
      <defs>
        <Arrowhead id="ah-tm-down" color={C.success} />
        <Arrowhead id="ah-tm-up" color={C.cta} />
      </defs>
      {/* bicamada */}
      <rect x={40} y={y - 22} width={640} height={44} fill={C.soft} />
      <line x1={40} y1={y - 22} x2={680} y2={y - 22} stroke={C.warning} strokeWidth={2} />
      <line x1={40} y1={y + 22} x2={680} y2={y + 22} stroke={C.warning} strokeWidth={2} />
      <text x={50} y={30} fontSize={11} fontWeight={600} fill={C.ink3}>Extracelular (mais Na⁺)</text>
      <text x={50} y={288} fontSize={11} fontWeight={600} fill={C.ink3}>Intracelular (mais K⁺)</text>
      {/* 1 difusão simples */}
      <text x={120} y={60} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.ink}>Difusão simples</text>
      <line x1={120} y1={70} x2={120} y2={230} stroke={C.success} strokeWidth={2.5} markerEnd="url(#ah-tm-down)" strokeDasharray="1 0" />
      <text x={120} y={252} textAnchor="middle" fontSize={10.5} fill={C.ink3}>O₂, CO₂</text>
      {/* 2 canal */}
      <text x={290} y={60} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.ink}>Canal iônico</text>
      <rect x={278} y={y - 24} width={24} height={48} rx={5} fill={C.surface} stroke={C.primary} strokeWidth={2} />
      <line x1={290} y1={80} x2={290} y2={225} stroke={C.success} strokeWidth={2.5} markerEnd="url(#ah-tm-down)" />
      <text x={290} y={252} textAnchor="middle" fontSize={10.5} fill={C.ink3}>Na⁺, K⁺, Ca²⁺</text>
      {/* 3 carreador (facilitada) */}
      <text x={455} y={60} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.ink}>Carreador (GLUT)</text>
      <rect x={438} y={y - 24} width={34} height={48} rx={9} fill={C.surface} stroke={C.analysis} strokeWidth={2} />
      <circle cx={455} cy={95} r={7} fill={C.analysis} />
      <line x1={455} y1={104} x2={455} y2={225} stroke={C.success} strokeWidth={2.5} markerEnd="url(#ah-tm-down)" />
      <text x={455} y={252} textAnchor="middle" fontSize={10.5} fill={C.ink3}>glicose (a favor)</text>
      {/* 4 bomba (ativo) */}
      <text x={610} y={60} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.ink}>Bomba Na⁺/K⁺</text>
      <rect x={590} y={y - 26} width={40} height={52} rx={9} fill={C.tint} stroke={C.cta} strokeWidth={2} />
      <text x={610} y={y + 5} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.cta}>ATP</text>
      <line x1={610} y1={225} x2={610} y2={80} stroke={C.cta} strokeWidth={2.5} markerEnd="url(#ah-tm-up)" />
      <text x={610} y={252} textAnchor="middle" fontSize={10.5} fill={C.ink3}>contra o gradiente</text>
    </svg>
  );
}

/* ======================= 5. UNIDADE MOTORA ============================= */

function FigUnidadeMotora() {
  return (
    <svg viewBox="0 0 720 320" {...svgProps("Unidade motora e dois mecanismos de graduação de força: recrutamento pelo princípio do tamanho e frequência de disparo")}>
      <defs>
        <Arrowhead id="ah-um" color={C.primary} />
      </defs>
      {/* neurônio motor + fibras (esquema) */}
      <circle cx={70} cy={70} r={18} fill={C.tint} stroke={C.primary} strokeWidth={2} />
      <text x={70} y={40} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.primary}>motoneurônio α</text>
      <line x1={88} y1={70} x2={200} y2={70} stroke={C.primary} strokeWidth={2.5} markerEnd="url(#ah-um)" />
      <text x={150} y={60} textAnchor="middle" fontSize={10.5} fill={C.ink3}>axônio</text>
      {[52, 70, 88].map((fy) => (
        <ellipse key={fy} cx={250} cy={fy} rx={44} ry={7} fill={C.cta} opacity={0.75} />
      ))}
      <text x={250} y={112} textAnchor="middle" fontSize={11} fill={C.ink3}>fibras musculares inervadas</text>
      <text x={360} y={70} fontSize={12.5} fontWeight={700} fill={C.ink}>Unidade motora =</text>
      <text x={360} y={88} fontSize={12} fill={C.ink2}>1 motoneurônio + todas as fibras que ele inerva</text>
      {/* Recrutamento */}
      <rect x={20} y={150} width={330} height={150} rx={12} fill={C.soft} stroke={C.border} strokeWidth={1.5} />
      <text x={40} y={176} fontSize={13} fontWeight={700} fill={C.primary}>Recrutamento (princípio do tamanho)</text>
      {[
        { x: 55, r: 8, c: C.analysis, l: "pequena" },
        { x: 130, r: 12, c: C.primary, l: "média" },
        { x: 220, r: 17, c: C.cta, l: "grande" },
      ].map((u) => (
        <g key={u.l}>
          <circle cx={u.x} cy={225} r={u.r} fill={u.c} opacity={0.85} />
          <text x={u.x} y={258} textAnchor="middle" fontSize={10.5} fill={C.ink3}>{u.l}</text>
        </g>
      ))}
      <line x1={45} y1={280} x2={300} y2={280} stroke={C.ink3} strokeWidth={1.5} markerEnd="url(#ah-um)" />
      <text x={175} y={295} textAnchor="middle" fontSize={10.5} fill={C.ink3}>baixo limiar → alto limiar (mais força)</text>
      {/* Rate coding */}
      <rect x={370} y={150} width={330} height={150} rx={12} fill={C.soft} stroke={C.border} strokeWidth={1.5} />
      <text x={390} y={176} fontSize={13} fontWeight={700} fill={C.primary}>Frequência de disparo (rate coding)</text>
      {/* trem de picos lento */}
      <text x={390} y={205} fontSize={10.5} fill={C.ink3}>baixa</text>
      {[440, 490, 540, 590, 640].map((px) => (
        <line key={"lo" + px} x1={px} y1={215} x2={px} y2={195} stroke={C.analysis} strokeWidth={2} />
      ))}
      <line x1={430} y1={215} x2={670} y2={215} stroke={C.border} strokeWidth={1} />
      {/* trem rápido */}
      <text x={390} y={265} fontSize={10.5} fill={C.ink3}>alta</text>
      {[430, 455, 480, 505, 530, 555, 580, 605, 630, 655].map((px) => (
        <line key={"hi" + px} x1={px} y1={275} x2={px} y2={248} stroke={C.cta} strokeWidth={2} />
      ))}
      <line x1={425} y1={275} x2={672} y2={275} stroke={C.border} strokeWidth={1} />
      <text x={535} y={296} textAnchor="middle" fontSize={10.5} fill={C.ink3}>mais disparos → maior somação e força</text>
    </svg>
  );
}

/* ======================= 6. CICLO CARDÍACO ============================= */

function FigCicloCardiaco() {
  const x0 = 70, x1 = 690, y0 = 300, yTop = 30;
  const mmToY = (p: number) => y0 - (p / 130) * (y0 - yTop); // 0..130 mmHg
  const tToX = (t: number) => x0 + t * (x1 - x0); // t 0..1
  // pressões esquemáticas
  const ventric: [number, number][] = [
    [0, 8], [0.05, 6], [0.1, 10], [0.15, 60], [0.2, 105], [0.28, 120], [0.35, 118],
    [0.42, 95], [0.45, 40], [0.5, 12], [0.6, 6], [0.75, 7], [0.9, 8], [1, 8],
  ];
  const aortic: [number, number][] = [
    [0, 80], [0.15, 80], [0.2, 100], [0.3, 118], [0.4, 112], [0.44, 100],
    [0.47, 96], [0.5, 99], [0.6, 92], [0.8, 84], [1, 80],
  ];
  const atrial: [number, number][] = [
    [0, 6], [0.1, 9], [0.15, 5], [0.4, 3], [0.6, 4], [0.85, 8], [0.9, 12], [0.95, 7], [1, 6],
  ];
  const toPath = (pts: [number, number][]) =>
    pts.map(([t, p], i) => `${i === 0 ? "M" : "L"} ${tToX(t).toFixed(1)} ${mmToY(p).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 720 360" {...svgProps("Ciclo cardíaco: pressões ventricular esquerda, aórtica e atrial na sístole e diástole")}>
      {/* faixas sístole/diástole */}
      <rect x={tToX(0.15)} y={yTop} width={tToX(0.45) - tToX(0.15)} height={y0 - yTop} fill="#fdecec" />
      <rect x={tToX(0.45)} y={yTop} width={x1 - tToX(0.45)} height={y0 - yTop} fill="#eaf1fe" />
      <text x={(tToX(0.15) + tToX(0.45)) / 2} y={yTop + 16} textAnchor="middle" fontSize={12} fontWeight={700} fill="#dc2626">Sístole</text>
      <text x={(tToX(0.45) + x1) / 2} y={yTop + 16} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.primary}>Diástole</text>
      {/* grade */}
      {[0, 40, 80, 120].map((p) => (
        <g key={p}>
          <line x1={x0} y1={mmToY(p)} x2={x1} y2={mmToY(p)} stroke={C.border} strokeWidth={1} strokeDasharray="3 3" />
          <text x={x0 - 8} y={mmToY(p) + 4} textAnchor="end" fontSize={11} fill={C.ink3}>{p}</text>
        </g>
      ))}
      <line x1={x0} y1={yTop} x2={x0} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      <text x={26} y={175} fontSize={12} fill={C.ink2} transform="rotate(-90 26 175)">Pressão (mmHg)</text>
      {/* curvas */}
      <path d={toPath(aortic)} fill="none" stroke="#dc2626" strokeWidth={2.5} />
      <path d={toPath(ventric)} fill="none" stroke={C.primary} strokeWidth={2.5} />
      <path d={toPath(atrial)} fill="none" stroke={C.success} strokeWidth={2.5} />
      {/* legenda */}
      <g fontSize={11} fontWeight={600}>
        <line x1={430} y1={330} x2={452} y2={330} stroke="#dc2626" strokeWidth={3} /><text x={456} y={334} fill={C.ink2}>Aorta</text>
        <line x1={510} y1={330} x2={532} y2={330} stroke={C.primary} strokeWidth={3} /><text x={536} y={334} fill={C.ink2}>Ventrículo E</text>
        <line x1={620} y1={330} x2={642} y2={330} stroke={C.success} strokeWidth={3} /><text x={646} y={334} fill={C.ink2}>Átrio E</text>
      </g>
      <text x={x0} y={y0 + 30} fontSize={11} fill={C.ink3}>Válvulas abrem e fecham por gradiente de pressão, não por contração própria.</text>
    </svg>
  );
}

/* ======================= 7. DÉBITO CARDÍACO ============================ */

function FigDebito() {
  return (
    <svg viewBox="0 0 720 300" {...svgProps("Débito cardíaco é frequência cardíaca vezes volume sistólico; o volume sistólico depende de pré-carga, contratilidade e pós-carga")}>
      <defs>
        <Arrowhead id="ah-dc" color={C.ink3} />
      </defs>
      <NodeBox x={250} y={24} w={220} h={64} fill={C.tint} stroke={C.primary}>
        <text x={360} y={50} textAnchor="middle" fontSize={15} fontWeight={800} fill={C.primary}>Débito cardíaco</text>
        <text x={360} y={72} textAnchor="middle" fontSize={11.5} fill={C.ink2}>~5 L/min em repouso (esquema)</text>
      </NodeBox>
      {/* = FC x VS */}
      <text x={360} y={112} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.ink}>= Frequência cardíaca × Volume sistólico</text>
      <line x1={250} y1={120} x2={190} y2={150} stroke={C.ink3} strokeWidth={1.5} markerEnd="url(#ah-dc)" />
      <line x1={470} y1={120} x2={530} y2={150} stroke={C.ink3} strokeWidth={1.5} markerEnd="url(#ah-dc)" />
      {/* FC */}
      <NodeBox x={40} y={152} w={260} h={56} fill={C.surface} stroke={C.analysis}>
        <text x={170} y={176} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.analysis}>Frequência cardíaca</text>
        <text x={170} y={195} textAnchor="middle" fontSize={11} fill={C.ink3}>nó sinoatrial, simpático e parassimpático</text>
      </NodeBox>
      {/* VS */}
      <NodeBox x={420} y={152} w={260} h={56} fill={C.surface} stroke={C.primary}>
        <text x={550} y={176} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.primary}>Volume sistólico</text>
        <text x={550} y={195} textAnchor="middle" fontSize={11} fill={C.ink3}>volume ejetado por batimento</text>
      </NodeBox>
      {/* determinantes do VS */}
      {[
        ["Pré-carga", "enchimento / retorno venoso", 420],
        ["Contratilidade", "força intrínseca", 500],
        ["Pós-carga", "pressão contra a ejeção", 580],
      ].map(([t, s, cx], i) => (
        <g key={t as string}>
          <line x1={550} y1={208} x2={(cx as number) + 30} y2={238} stroke={C.border} strokeWidth={1.3} />
          <rect x={(cx as number) - 58} y={238} width={176} height={46} rx={9} fill={C.soft} stroke={C.border} strokeWidth={1.2} transform={`translate(${i * 0} 0)`} />
        </g>
      ))}
      {/* simpler: three boxes in a row */}
      <g>
        {[
          ["Pré-carga", "retorno venoso"],
          ["Contratilidade", "força intrínseca"],
          ["Pós-carga", "pressão de ejeção"],
        ].map(([t, s], i) => {
          const bx = 360 + (i - 1) * 190;
          return (
            <g key={t as string}>
              <rect x={bx - 88} y={238} width={176} height={48} rx={9} fill={C.soft} stroke={C.border} strokeWidth={1.3} />
              <text x={bx} y={259} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.ink}>{t}</text>
              <text x={bx} y={275} textAnchor="middle" fontSize={10.5} fill={C.ink3}>{s}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* =================== 8. DISSOCIAÇÃO DA OXI-HEMOGLOBINA ================= */

function FigDissociacaoO2() {
  const x0 = 70, x1 = 690, y0 = 290, yTop = 30;
  const satToY = (s: number) => y0 - (s / 100) * (y0 - yTop);
  const poToX = (p: number) => x0 + (p / 100) * (x1 - x0); // 0..100 mmHg
  // curva sigmoide (normal) e desviada à direita (Bohr)
  const sig = (p: number, shift = 0) => {
    const p50 = 26.5 + shift;
    const n = 2.7;
    return (100 * Math.pow(p, n)) / (Math.pow(p50, n) + Math.pow(p, n));
  };
  const build = (shift: number) => {
    let d = "";
    for (let p = 0; p <= 100; p += 2) {
      d += `${p === 0 ? "M" : "L"} ${poToX(p).toFixed(1)} ${satToY(sig(p, shift)).toFixed(1)} `;
    }
    return d;
  };
  return (
    <svg viewBox="0 0 720 340" {...svgProps("Curva de dissociação da oxi-hemoglobina em S e o desvio à direita pelo efeito Bohr, que favorece a liberação de oxigênio nos tecidos ativos")}>
      {[0, 25, 50, 75, 100].map((s) => (
        <g key={s}>
          <line x1={x0} y1={satToY(s)} x2={x1} y2={satToY(s)} stroke={C.border} strokeWidth={1} strokeDasharray="3 3" />
          <text x={x0 - 8} y={satToY(s) + 4} textAnchor="end" fontSize={11} fill={C.ink3}>{s}</text>
        </g>
      ))}
      <line x1={x0} y1={yTop} x2={x0} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      {[20, 40, 60, 80, 100].map((p) => (
        <text key={p} x={poToX(p)} y={y0 + 18} textAnchor="middle" fontSize={11} fill={C.ink3}>{p}</text>
      ))}
      <text x={26} y={175} fontSize={12} fill={C.ink2} transform="rotate(-90 26 175)">Saturação de Hb (%)</text>
      <text x={385} y={324} textAnchor="middle" fontSize={12} fill={C.ink2}>Pressão parcial de O₂ (mmHg)</text>
      <path d={build(0)} fill="none" stroke={C.primary} strokeWidth={3} />
      <path d={build(14)} fill="none" stroke={C.cta} strokeWidth={3} strokeDasharray="6 4" />
      {/* pontos de referência */}
      <circle cx={poToX(100)} cy={satToY(sig(100))} r={4} fill={C.primary} />
      <text x={poToX(100) - 8} y={satToY(sig(100)) - 8} textAnchor="end" fontSize={10.5} fill={C.ink3}>pulmão</text>
      <circle cx={poToX(40)} cy={satToY(sig(40))} r={4} fill={C.primary} />
      <text x={poToX(40) + 8} y={satToY(sig(40)) - 6} fontSize={10.5} fill={C.ink3}>tecido em repouso</text>
      {/* legenda */}
      <g fontSize={11.5} fontWeight={600}>
        <line x1={430} y1={60} x2={455} y2={60} stroke={C.primary} strokeWidth={3} /><text x={460} y={64} fill={C.ink2}>normal</text>
        <line x1={540} y1={60} x2={565} y2={60} stroke={C.cta} strokeWidth={3} strokeDasharray="6 4" /><text x={570} y={64} fill={C.ink2}>desvio à direita (Bohr)</text>
      </g>
      <text x={430} y={82} fontSize={10.5} fill={C.ink3}>↑CO₂, ↑H⁺ (↓pH), ↑temperatura, ↑2,3-BPG → libera mais O₂</text>
    </svg>
  );
}

/* ===================== 9. VIAS ENERGÉTICAS ============================= */

function FigViasEnergeticas() {
  return (
    <svg viewBox="0 0 720 340" {...svgProps("Convergência de carboidratos, gorduras e proteínas para produção de ATP: glicólise, beta-oxidação, ciclo de Krebs e fosforilação oxidativa")}>
      <defs>
        <Arrowhead id="ah-ve" color={C.ink3} />
        <Arrowhead id="ah-ve-p" color={C.primary} />
      </defs>
      {/* substratos */}
      {[
        ["Carboidratos", "glicose", C.primary, 60],
        ["Gorduras", "ácidos graxos", C.warning, 150],
        ["Proteínas", "aminoácidos", C.analysis, 240],
      ].map(([t, s, col, y]) => (
        <g key={t as string}>
          <rect x={20} y={(y as number) - 22} width={150} height={44} rx={9} fill={C.surface} stroke={col as string} strokeWidth={1.6} />
          <text x={95} y={(y as number) - 2} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={C.ink}>{t}</text>
          <text x={95} y={(y as number) + 13} textAnchor="middle" fontSize={10.5} fill={C.ink3}>{s}</text>
        </g>
      ))}
      {/* glicólise (citosol) */}
      <rect x={210} y={40} width={150} height={40} rx={9} fill={C.tint} stroke={C.primary} strokeWidth={1.4} />
      <text x={285} y={58} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.primary}>Glicólise</text>
      <text x={285} y={72} textAnchor="middle" fontSize={10} fill={C.ink3}>citosol → piruvato</text>
      <line x1={170} y1={60} x2={206} y2={60} stroke={C.ink3} strokeWidth={2} markerEnd="url(#ah-ve)" />
      {/* mitocôndria */}
      <rect x={400} y={30} width={300} height={280} rx={20} fill="#f5faf6" stroke={C.success} strokeWidth={2} />
      <text x={550} y={54} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={C.success}>Mitocôndria</text>
      {/* acetil-CoA */}
      <rect x={470} y={72} width={160} height={38} rx={9} fill={C.surface} stroke={C.ink3} strokeWidth={1.3} />
      <text x={550} y={95} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.ink}>Acetil-CoA</text>
      {/* beta-ox */}
      <text x={430} y={150} fontSize={11} fontWeight={700} fill={C.warning}>β-oxidação</text>
      <line x1={170} y1={150} x2={468} y2={100} stroke={C.warning} strokeWidth={2} markerEnd="url(#ah-ve)" />
      <line x1={170} y1={240} x2={468} y2={102} stroke={C.analysis} strokeWidth={1.6} strokeDasharray="4 3" markerEnd="url(#ah-ve)" />
      <line x1={285} y1={80} x2={470} y2={95} stroke={C.primary} strokeWidth={2} markerEnd="url(#ah-ve-p)" />
      {/* Krebs */}
      <circle cx={550} cy={175} r={44} fill="none" stroke={C.ink2} strokeWidth={2} strokeDasharray="4 3" />
      <text x={550} y={172} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.ink}>Ciclo de</text>
      <text x={550} y={188} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.ink}>Krebs</text>
      <line x1={550} y1={110} x2={550} y2={129} stroke={C.ink3} strokeWidth={2} markerEnd="url(#ah-ve)" />
      <text x={620} y={175} fontSize={10.5} fill={C.ink3}>NADH,</text>
      <text x={620} y={189} fontSize={10.5} fill={C.ink3}>FADH₂</text>
      {/* fosforilação oxidativa */}
      <rect x={445} y={244} width={210} height={48} rx={10} fill={C.tint} stroke={C.primary} strokeWidth={1.6} />
      <text x={550} y={265} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.primary}>Fosforilação oxidativa</text>
      <text x={550} y={281} textAnchor="middle" fontSize={10.5} fill={C.ink3}>cadeia de elétrons + O₂ → muito ATP</text>
      <line x1={550} y1={219} x2={550} y2={241} stroke={C.ink3} strokeWidth={2} markerEnd="url(#ah-ve)" />
      <text x={230} y={300} fontSize={10.5} fill={C.ink3}>As vias operam juntas; muda a contribuição relativa (intensidade, O₂, duração, treino).</text>
    </svg>
  );
}

/* ====================== 10. SARCÔMERO / PONTES ========================= */

function FigSarcomero() {
  return (
    <svg viewBox="0 0 720 300" {...svgProps("Sarcômero e ciclo de pontes cruzadas: cálcio libera a actina, a miosina puxa o filamento e o ATP permite o desligamento")}>
      <defs>
        <Arrowhead id="ah-sar" color={C.cta} />
      </defs>
      {/* linhas Z */}
      <line x1={80} y1={40} x2={80} y2={150} stroke={C.ink} strokeWidth={3} />
      <line x1={640} y1={40} x2={640} y2={150} stroke={C.ink} strokeWidth={3} />
      <text x={80} y={168} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.ink}>linha Z</text>
      <text x={640} y={168} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.ink}>linha Z</text>
      <text x={360} y={30} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.ink2}>Sarcômero (unidade contrátil)</text>
      {/* actina (finos) das duas Z */}
      {[70, 95].map((yy) => (
        <g key={"a" + yy}>
          <line x1={80} y1={yy} x2={330} y2={yy} stroke={C.analysis} strokeWidth={5} strokeLinecap="round" />
          <line x1={640} y1={yy} x2={390} y2={yy} stroke={C.analysis} strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      {/* actina lower rows */}
      {[110, 135].map((yy) => (
        <g key={"a2" + yy}>
          <line x1={80} y1={yy} x2={330} y2={yy} stroke={C.analysis} strokeWidth={5} strokeLinecap="round" opacity={0.5} />
          <line x1={640} y1={yy} x2={390} y2={yy} stroke={C.analysis} strokeWidth={5} strokeLinecap="round" opacity={0.5} />
        </g>
      ))}
      {/* miosina (grosso, central) */}
      <line x1={250} y1={102} x2={470} y2={102} stroke={C.cta} strokeWidth={10} strokeLinecap="round" />
      {/* pontes cruzadas */}
      {[270, 300, 330, 420, 450].map((px) => (
        <line key={px} x1={px} y1={102} x2={px + (px < 360 ? -14 : 14)} y2={82} stroke={C.cta} strokeWidth={2.5} />
      ))}
      <text x={360} y={125} textAnchor="middle" fontSize={10.5} fill="#fff" fontWeight={700}>miosina</text>
      <text x={175} y={62} fontSize={11} fontWeight={700} fill={C.analysis}>actina</text>
      {/* ciclo de pontes */}
      <text x={360} y={200} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.ink}>Ciclo de pontes cruzadas</text>
      {[
        ["1. Ca²⁺ libera o sítio", C.primary],
        ["2. miosina liga a actina", C.cta],
        ["3. golpe de força (puxa)", C.cta],
        ["4. ATP desliga a ponte", C.success],
      ].map(([t, col], i) => {
        const bx = 40 + i * 168;
        return (
          <g key={t as string}>
            <rect x={bx} y={220} width={152} height={44} rx={9} fill={C.soft} stroke={col as string} strokeWidth={1.4} />
            <text x={bx + 76} y={246} textAnchor="middle" fontSize={11} fontWeight={600} fill={C.ink}>{t}</text>
            {i < 3 && <line x1={bx + 152} y1={242} x2={bx + 166} y2={242} stroke={C.ink3} strokeWidth={2} markerEnd="url(#ah-sar)" />}
          </g>
        );
      })}
    </svg>
  );
}

/* ==================== 11. COMPRIMENTO-TENSÃO =========================== */

function FigComprimentoTensao() {
  const x0 = 70, x1 = 690, y0 = 280, yTop = 30;
  const toY = (v: number) => y0 - (v / 100) * (y0 - yTop);
  const toX = (v: number) => x0 + (v / 100) * (x1 - x0); // comprimento relativo 0..100
  const active = (l: number) => {
    // pico ~55, cai para os lados
    const d = Math.abs(l - 55);
    return Math.max(0, 100 - d * d * 0.09);
  };
  const passive = (l: number) => (l < 60 ? 0 : Math.min(100, Math.pow((l - 60) / 40, 2) * 100));
  const build = (fn: (l: number) => number) => {
    let d = "";
    for (let l = 15; l <= 100; l += 2) d += `${l === 15 ? "M" : "L"} ${toX(l).toFixed(1)} ${toY(fn(l)).toFixed(1)} `;
    return d;
  };
  const total = (l: number) => Math.min(100, active(l) + passive(l));
  return (
    <svg viewBox="0 0 720 330" {...svgProps("Relação comprimento-tensão do músculo: tensão ativa das pontes cruzadas, tensão passiva dos elementos elásticos e a soma total")}>
      <line x1={x0} y1={yTop} x2={x0} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      <text x={26} y={165} fontSize={12} fill={C.ink2} transform="rotate(-90 26 165)">Tensão (relativa)</text>
      <text x={385} y={315} textAnchor="middle" fontSize={12} fill={C.ink2}>Comprimento do sarcômero (curto → longo)</text>
      <path d={build(active)} fill="none" stroke={C.primary} strokeWidth={2.6} />
      <path d={build(passive)} fill="none" stroke={C.warning} strokeWidth={2.6} strokeDasharray="6 4" />
      <path d={build(total)} fill="none" stroke={C.ink} strokeWidth={2.6} />
      {/* pico ativo */}
      <line x1={toX(55)} y1={toY(100)} x2={toX(55)} y2={y0} stroke={C.border} strokeWidth={1} strokeDasharray="3 3" />
      <text x={toX(55)} y={toY(100) - 8} textAnchor="middle" fontSize={10.5} fill={C.ink3}>sobreposição ótima</text>
      <g fontSize={11.5} fontWeight={600}>
        <line x1={430} y1={70} x2={455} y2={70} stroke={C.primary} strokeWidth={3} /><text x={460} y={74} fill={C.ink2}>ativa (pontes)</text>
        <line x1={560} y1={70} x2={585} y2={70} stroke={C.warning} strokeWidth={3} strokeDasharray="6 4" /><text x={590} y={74} fill={C.ink2}>passiva (titina)</text>
        <line x1={430} y1={92} x2={455} y2={92} stroke={C.ink} strokeWidth={3} /><text x={460} y={96} fill={C.ink2}>total (ativa + passiva)</text>
      </g>
    </svg>
  );
}

/* ========================= 12. NÉFRON ================================== */

function FigNefron() {
  return (
    <svg viewBox="0 0 720 360" {...svgProps("Néfron: filtração no glomérulo, reabsorção do túbulo para o sangue, secreção do sangue para o túbulo e excreção na urina")}>
      <defs>
        <Arrowhead id="ah-nef-f" color={C.cta} />
        <Arrowhead id="ah-nef-r" color={C.success} />
        <Arrowhead id="ah-nef-s" color="#7c3aed" />
        <Arrowhead id="ah-nef-e" color={C.warning} />
      </defs>
      {/* glomérulo */}
      <circle cx={110} cy={90} r={42} fill="none" stroke="#dc2626" strokeWidth={2} />
      <path d="M78 90 q14 -22 32 0 q14 22 32 0" fill="none" stroke="#dc2626" strokeWidth={3} />
      <path d="M78 78 q16 -14 32 0 q16 14 32 0" fill="none" stroke="#dc2626" strokeWidth={3} />
      <path d="M78 102 q16 16 32 0 q16 -16 32 0" fill="none" stroke="#dc2626" strokeWidth={3} />
      <text x={110} y={44} textAnchor="middle" fontSize={12} fontWeight={700} fill="#dc2626">Glomérulo</text>
      {/* cápsula de Bowman */}
      <path d="M152 90 a42 46 0 1 0 -0.1 0" fill="none" stroke={C.ink3} strokeWidth={1.5} />
      {/* filtração */}
      <text x={175} y={150} fontSize={11.5} fontWeight={700} fill={C.cta}>filtração</text>
      <line x1={130} y1={128} x2={175} y2={158} stroke={C.cta} strokeWidth={2.5} markerEnd="url(#ah-nef-f)" />
      {/* túbulo (proximal → alça → distal → coletor) */}
      <path
        d="M175 165 H360 C400 165 400 300 440 300 C480 300 480 165 520 165 H600 V320"
        fill="none"
        stroke="#e6b34d"
        strokeWidth={18}
        strokeLinecap="round"
        opacity={0.5}
      />
      <path
        d="M175 165 H360 C400 165 400 300 440 300 C480 300 480 165 520 165 H600 V320"
        fill="none"
        stroke="#c98f2a"
        strokeWidth={2}
      />
      <text x={265} y={150} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={C.primary}>Túbulo proximal</text>
      <text x={440} y={330} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={C.primary}>Alça de Henle</text>
      <text x={560} y={150} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={C.primary}>Distal / coletor</text>
      {/* reabsorção (setas para cima = para o sangue) */}
      {[220, 260, 300].map((px) => (
        <line key={"r" + px} x1={px} y1={180} x2={px} y2={150} stroke={C.success} strokeWidth={2.5} markerEnd="url(#ah-nef-r)" />
      ))}
      {[560, 585].map((px) => (
        <line key={"r2" + px} x1={px} y1={180} x2={px} y2={150} stroke={C.success} strokeWidth={2.5} markerEnd="url(#ah-nef-r)" />
      ))}
      {/* secreção (setas para baixo = para o túbulo) */}
      {[240, 280].map((px) => (
        <line key={"s" + px} x1={px} y1={150} x2={px} y2={180} stroke="#7c3aed" strokeWidth={2.5} markerEnd="url(#ah-nef-s)" transform="translate(15 0)" />
      ))}
      {/* excreção */}
      <line x1={600} y1={320} x2={600} y2={348} stroke={C.warning} strokeWidth={3} markerEnd="url(#ah-nef-e)" />
      <text x={608} y={342} fontSize={11.5} fontWeight={700} fill={C.warning}>excreção (urina)</text>
      {/* fórmula + legenda */}
      <rect x={20} y={215} width={330} height={120} rx={12} fill={C.soft} stroke={C.border} strokeWidth={1.4} />
      <text x={36} y={240} fontSize={12.5} fontWeight={800} fill={C.ink}>Excreção = filtração − reabsorção + secreção</text>
      <g fontSize={11}>
        <line x1={40} y1={260} x2={62} y2={260} stroke={C.cta} strokeWidth={3} markerEnd="url(#ah-nef-f)" /><text x={70} y={264} fill={C.ink2}>Filtração: sangue → túbulo</text>
        <line x1={40} y1={284} x2={62} y2={284} stroke={C.success} strokeWidth={3} markerEnd="url(#ah-nef-r)" /><text x={70} y={288} fill={C.ink2}>Reabsorção: túbulo → sangue</text>
        <line x1={40} y1={308} x2={62} y2={308} stroke="#7c3aed" strokeWidth={3} markerEnd="url(#ah-nef-s)" /><text x={70} y={312} fill={C.ink2}>Secreção: sangue → túbulo</text>
      </g>
    </svg>
  );
}

/* ==================== 13. VENTILAÇÃO E TROCA ========================== */

function FigVentilacao() {
  return (
    <svg viewBox="0 0 720 320" {...svgProps("Ventilação leva ar ao alvéolo; a difusão troca oxigênio e gás carbônico com o capilar conforme os gradientes de pressão parcial")}>
      <defs>
        <Arrowhead id="ah-vent-o2" color={C.primary} />
        <Arrowhead id="ah-vent-co2" color={C.cta} />
        <Arrowhead id="ah-vent-air" color={C.ink3} />
      </defs>
      {/* via aérea + alvéolo */}
      <path d="M40 60 q120 -10 150 40" fill="none" stroke={C.ink3} strokeWidth={10} strokeLinecap="round" opacity={0.4} />
      <text x={70} y={48} fontSize={11} fill={C.ink3}>ar inspirado</text>
      <line x1={60} y1={70} x2={150} y2={92} stroke={C.ink3} strokeWidth={2} markerEnd="url(#ah-vent-air)" />
      <circle cx={250} cy={140} r={78} fill="#eaf1fe" stroke={C.primary} strokeWidth={2} />
      <text x={250} y={140} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.primary}>Alvéolo</text>
      <text x={250} y={158} textAnchor="middle" fontSize={10.5} fill={C.ink2}>PO₂ alto · PCO₂ baixo</text>
      {/* capilar */}
      <rect x={360} y={90} width={300} height={100} rx={50} fill="#fdecec" stroke="#dc2626" strokeWidth={2} />
      <text x={510} y={135} textAnchor="middle" fontSize={13} fontWeight={700} fill="#dc2626">Capilar pulmonar</text>
      <text x={510} y={153} textAnchor="middle" fontSize={10.5} fill={C.ink2}>sangue: PO₂ baixo · PCO₂ alto</text>
      {/* membrana */}
      <line x1={330} y1={90} x2={330} y2={190} stroke={C.warning} strokeWidth={2} strokeDasharray="4 3" />
      <text x={330} y={210} textAnchor="middle" fontSize={10} fill={C.ink3}>barreira fina</text>
      {/* difusão O2 (alvéolo->sangue) e CO2 (sangue->alvéolo) */}
      <line x1={330} y1={118} x2={362} y2={118} stroke={C.primary} strokeWidth={3} markerEnd="url(#ah-vent-o2)" />
      <text x={346} y={110} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.primary}>O₂</text>
      <line x1={362} y1={162} x2={328} y2={162} stroke={C.cta} strokeWidth={3} markerEnd="url(#ah-vent-co2)" />
      <text x={346} y={178} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.cta}>CO₂</text>
      {/* legenda inferior */}
      <rect x={40} y={250} width={640} height={54} rx={12} fill={C.soft} stroke={C.border} strokeWidth={1.4} />
      <text x={56} y={272} fontSize={12} fontWeight={700} fill={C.ink}>A troca depende do gradiente de pressão parcial, da área e da espessura da barreira.</text>
      <text x={56} y={292} fontSize={11} fill={C.ink3}>Alvéolos ventilados precisam receber perfusão (relação ventilação/perfusão) para a troca ser eficiente.</text>
    </svg>
  );
}

/* ==================== 14. EIXO ENDÓCRINO ============================== */

function FigEixoEndocrino() {
  return (
    <svg viewBox="0 0 720 320" {...svgProps("Eixo hipotálamo-hipófise-glândula com feedback negativo: o hormônio final freia hipotálamo e hipófise")}>
      <defs>
        <Arrowhead id="ah-ee" color={C.primary} />
        <Arrowhead id="ah-ee-fb" color="#dc2626" />
      </defs>
      {[
        ["Hipotálamo", "hormônio liberador", 60],
        ["Hipófise", "hormônio trófico", 150],
        ["Glândula-alvo", "hormônio final", 240],
      ].map(([t, s, y], i) => (
        <g key={t as string}>
          <NodeBox x={230} y={(y as number) - 26} w={260} h={52} fill={C.soft} stroke={i === 2 ? C.success : C.primary}>
            <text x={360} y={(y as number) - 3} textAnchor="middle" fontSize={13} fontWeight={700} fill={i === 2 ? C.success : C.primary}>{t}</text>
            <text x={360} y={(y as number) + 14} textAnchor="middle" fontSize={10.5} fill={C.ink3}>{s}</text>
          </NodeBox>
        </g>
      ))}
      <line x1={360} y1={86} x2={360} y2={122} stroke={C.primary} strokeWidth={2.5} markerEnd="url(#ah-ee)" />
      <line x1={360} y1={176} x2={360} y2={212} stroke={C.primary} strokeWidth={2.5} markerEnd="url(#ah-ee)" />
      {/* efeitos */}
      <NodeBox x={230} y={280} w={260} h={34} fill={C.tint} stroke={C.primary}>
        <text x={360} y={302} textAnchor="middle" fontSize={12} fontWeight={600} fill={C.primary}>Efeito no metabolismo e tecidos</text>
      </NodeBox>
      <line x1={360} y1={266} x2={360} y2={278} stroke={C.success} strokeWidth={2.5} markerEnd="url(#ah-ee)" />
      {/* feedback negativo (alvo -> hipotálamo/hipófise) */}
      <path d="M490 240 C 620 240, 620 60, 492 60" fill="none" stroke="#dc2626" strokeWidth={2.2} strokeDasharray="6 4" markerEnd="url(#ah-ee-fb)" />
      <path d="M490 245 C 590 245, 590 150, 492 150" fill="none" stroke="#dc2626" strokeWidth={2.2} strokeDasharray="6 4" markerEnd="url(#ah-ee-fb)" />
      <text x={628} y={155} fontSize={11.5} fontWeight={700} fill="#dc2626" transform="rotate(90 628 155)">Feedback negativo</text>
      <text x={40} y={150} fontSize={11} fill={C.ink3} width={160}>O efeito depende de</text>
      <text x={40} y={166} fontSize={11} fill={C.ink3}>dose, tempo, receptor</text>
      <text x={40} y={182} fontSize={11} fill={C.ink3}>e tecido, não de um</text>
      <text x={40} y={198} fontSize={11} fill={C.ink3}>hormônio isolado.</text>
    </svg>
  );
}

/* ============================ registro ================================= */

export type FigureLegendItem = { color: string; label: string };

export type FigureDef = {
  title: string;
  subtitle?: string;
  Comp: React.ComponentType;
  legend?: FigureLegendItem[];
};

export const FIGURES: Record<string, FigureDef> = {
  "homeostase-circuito": {
    title: "Circuito de controle homeostático",
    subtitle: "A variável regulada é mantida dentro de uma faixa funcional, não em um valor fixo.",
    Comp: FigHomeostase,
  },
  "sistemas-integrados": {
    title: "Visão integrada dos sistemas",
    subtitle: "Onze sistemas orgânicos conectados pela homeostase.",
    Comp: FigSistemas,
  },
  "potencial-de-acao": {
    title: "Potencial de ação",
    subtitle: "Evento tudo-ou-nada: sódio despolariza, potássio repolariza.",
    Comp: FigPotencialAcao,
  },
  "transporte-membrana": {
    title: "Transporte através da membrana",
    subtitle: "Seletividade e direção dependem de canais, carreadores e bombas.",
    Comp: FigTransporte,
  },
  "unidade-motora": {
    title: "Unidade motora e graduação da força",
    subtitle: "Recrutamento (princípio do tamanho) e frequência de disparo.",
    Comp: FigUnidadeMotora,
  },
  "ciclo-cardiaco": {
    title: "Ciclo cardíaco: pressões",
    subtitle: "Coordenação entre pressão, válvulas e fluxo na sístole e na diástole.",
    Comp: FigCicloCardiaco,
  },
  "debito-cardiaco": {
    title: "Determinantes do débito cardíaco",
    subtitle: "Frequência cardíaca × volume sistólico (pré-carga, contratilidade, pós-carga).",
    Comp: FigDebito,
  },
  "dissociacao-o2": {
    title: "Curva de dissociação da oxi-hemoglobina",
    subtitle: "O efeito Bohr desvia a curva à direita e libera mais O₂ no tecido ativo.",
    Comp: FigDissociacaoO2,
  },
  "vias-energeticas": {
    title: "Convergência das vias energéticas",
    subtitle: "Carboidratos, gorduras e proteínas convergem para a produção de ATP.",
    Comp: FigViasEnergeticas,
  },
  "sarcomero-pontes": {
    title: "Sarcômero e ciclo de pontes cruzadas",
    subtitle: "Cálcio libera a actina; a miosina puxa; o ATP desliga a ponte.",
    Comp: FigSarcomero,
  },
  "comprimento-tensao": {
    title: "Relação comprimento-tensão",
    subtitle: "Componente ativo, passivo e total do músculo.",
    Comp: FigComprimentoTensao,
  },
  nefron: {
    title: "Processamento no néfron",
    subtitle: "Filtração, reabsorção, secreção e excreção ajustam o meio interno.",
    Comp: FigNefron,
  },
  "ventilacao-troca": {
    title: "Ventilação e troca gasosa",
    subtitle: "Ventilação conduz ar; difusão troca O₂ e CO₂ com o sangue.",
    Comp: FigVentilacao,
  },
  "eixo-endocrino": {
    title: "Eixo endócrino e feedback",
    subtitle: "Hipotálamo, hipófise e glândula-alvo com retroalimentação negativa.",
    Comp: FigEixoEndocrino,
  },
};

export function hasFigure(id: string): boolean {
  return Boolean(FIGURES[id]);
}
