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
  // Onze sistemas orgânicos clássicos (Tortora, OpenStax).
  const left: [string, string, string][] = [
    ["Nervoso", "controle rápido", C.primary],
    ["Endócrino", "controle lento", "#db2777"],
    ["Cardiovascular", "transporte", "#dc2626"],
    ["Respiratório", "troca gasosa", C.primary],
    ["Esquelético", "suporte e alavancas", C.ink2],
    ["Muscular", "movimento", C.cta],
  ];
  const right: [string, string, string][] = [
    ["Digestório", "nutrientes", C.warning],
    ["Renal/urinário", "meio interno", C.analysis],
    ["Imune/linfático", "defesa", C.success],
    ["Tegumentar", "barreira e calor", C.ink3],
    ["Reprodutor", "continuidade", "#7c3aed"],
  ];
  const yL = (i: number) => 44 + i * 54;
  const yR = (i: number) => 71 + i * 54;
  return (
    <svg viewBox="0 0 720 400" {...svgProps("Onze sistemas orgânicos conectados pela homeostase, organizados como rede de controle, transporte, troca, proteção e movimento")}>
      {/* núcleo homeostase */}
      <circle cx={360} cy={200} r={60} fill={C.tint} stroke={C.primary} strokeWidth={2} />
      <CenterText cx={360} cy={192} lines={["Homeostase"]} color={C.primary} size={15} />
      <text x={360} y={216} textAnchor="middle" fontSize={11} fill={C.ink2}>eixo integrador</text>
      {left.map(([t, s, col], i) => (
        <g key={t}>
          <line x1={210} y1={yL(i)} x2={302} y2={200} stroke={C.border} strokeWidth={1.5} />
          <NodeBox x={20} y={yL(i) - 21} w={190} h={44} fill={C.surface} stroke={col}>
            <circle cx={44} cy={yL(i)} r={8} fill={col} />
            <text x={62} y={yL(i) - 2} fontSize={12.5} fontWeight={700} fill={C.ink}>{t}</text>
            <text x={62} y={yL(i) + 12} fontSize={10} fill={C.ink3}>{s}</text>
          </NodeBox>
        </g>
      ))}
      {right.map(([t, s, col], i) => (
        <g key={t}>
          <line x1={510} y1={yR(i)} x2={418} y2={200} stroke={C.border} strokeWidth={1.5} />
          <NodeBox x={510} y={yR(i) - 21} w={190} h={44} fill={C.surface} stroke={col}>
            <circle cx={534} cy={yR(i)} r={8} fill={col} />
            <text x={552} y={yR(i) - 2} fontSize={12.5} fontWeight={700} fill={C.ink}>{t}</text>
            <text x={552} y={yR(i) + 12} fontSize={10} fill={C.ink3}>{s}</text>
          </NodeBox>
        </g>
      ))}
      <rect x={150} y={366} width={420} height={30} rx={10} fill={C.ink} />
      <text x={360} y={386} textAnchor="middle" fontSize={12} fontWeight={600} fill="#fff">
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
      {/* determinantes do volume sistólico */}
      <g>
        {[
          ["Pré-carga", "retorno venoso"],
          ["Contratilidade", "força intrínseca"],
          ["Pós-carga", "pressão de ejeção"],
        ].map(([t, s], i) => {
          const bx = 360 + (i - 1) * 190;
          return (
            <g key={t as string}>
              <line x1={550} y1={208} x2={bx} y2={238} stroke={C.border} strokeWidth={1.3} />
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

/* ==================== 15. ALAVANCAS ================================== */

function FigAlavancas() {
  const rows = [
    { key: "l1", y: 72, label: "1ª classe (interfixa)", ex: "Apoio entre força e resistência. Ex.: extensão de cotovelo.", ful: 220, fx: 100, rx: 340 },
    { key: "l2", y: 186, label: "2ª classe (inter-resistente)", ex: "Resistência no meio. Ex.: elevação de panturrilha.", ful: 80, fx: 360, rx: 220 },
    { key: "l3", y: 300, label: "3ª classe (interpotente)", ex: "Força no meio, entre apoio e carga. Ex.: flexão de cotovelo.", ful: 80, fx: 180, rx: 360 },
  ];
  return (
    <svg viewBox="0 0 720 360" {...svgProps("Três classes de alavanca do corpo conforme a posição do apoio, da força e da resistência")}>
      <defs>
        <Arrowhead id="ah-alav-f" color={C.primary} />
        <Arrowhead id="ah-alav-r" color={C.cta} />
      </defs>
      {rows.map((r) => (
        <g key={r.key}>
          <line x1={60} y1={r.y} x2={380} y2={r.y} stroke={C.ink2} strokeWidth={5} strokeLinecap="round" />
          <path d={`M${r.ful - 13},${r.y + 24} L${r.ful + 13},${r.y + 24} L${r.ful},${r.y + 3} Z`} fill={C.ink3} />
          <line x1={r.fx} y1={r.y - 3} x2={r.fx} y2={r.y - 40} stroke={C.primary} strokeWidth={3} markerEnd="url(#ah-alav-f)" />
          <text x={r.fx} y={r.y - 46} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.primary}>F</text>
          <line x1={r.rx} y1={r.y + 3} x2={r.rx} y2={r.y + 40} stroke={C.cta} strokeWidth={3} markerEnd="url(#ah-alav-r)" />
          <text x={r.rx} y={r.y + 52} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--cta-text)">R</text>
          <text x={408} y={r.y - 4} fontSize={13} fontWeight={700} fill={C.ink}>{r.label}</text>
          <text x={408} y={r.y + 15} fontSize={10.5} fill={C.ink3}>{r.ex}</text>
        </g>
      ))}
      <text x={60} y={350} fontSize={11} fontWeight={600} fill={C.ink3}>F força (músculo) · R resistência (carga) · triângulo = apoio (articulação)</text>
    </svg>
  );
}

/* ==================== 16. CURVA DE RESISTÊNCIA ======================= */

function FigCurvaResistencia() {
  const x0 = 70, x1 = 690, y0 = 280, yTop = 40;
  const toX = (v: number) => x0 + (v / 100) * (x1 - x0);
  const toY = (v: number) => y0 - (v / 100) * (y0 - yTop);
  const asc = (a: number) => 22 + a * 0.68;
  const desc = (a: number) => 90 - a * 0.68;
  const bell = (a: number) => 95 - Math.abs(a - 50) * Math.abs(a - 50) * 0.03;
  const build = (fn: (a: number) => number) => {
    let d = "";
    for (let a = 0; a <= 100; a += 2) d += `${a === 0 ? "M" : "L"} ${toX(a).toFixed(1)} ${toY(fn(a)).toFixed(1)} `;
    return d;
  };
  return (
    <svg viewBox="0 0 720 340" {...svgProps("Curvas de resistência: como a dificuldade de um exercício varia ao longo da amplitude")}>
      <line x1={x0} y1={yTop} x2={x0} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      <text x={26} y={170} fontSize={12} fill={C.ink2} transform="rotate(-90 26 170)">Resistência percebida</text>
      <text x={385} y={315} textAnchor="middle" fontSize={12} fill={C.ink2}>Amplitude do movimento (início → fim)</text>
      <path d={build(asc)} fill="none" stroke={C.primary} strokeWidth={2.6} />
      <path d={build(desc)} fill="none" stroke={C.cta} strokeWidth={2.6} />
      <path d={build(bell)} fill="none" stroke={C.analysis} strokeWidth={2.6} />
      <g fontSize={11.5} fontWeight={600}>
        <line x1={430} y1={62} x2={455} y2={62} stroke={C.primary} strokeWidth={3} /><text x={460} y={66} fill={C.ink2}>Crescente (mais difícil no fim)</text>
        <line x1={430} y1={84} x2={455} y2={84} stroke={C.cta} strokeWidth={3} /><text x={460} y={88} fill={C.ink2}>Decrescente (mais difícil no início)</text>
        <line x1={430} y1={106} x2={455} y2={106} stroke={C.analysis} strokeWidth={3} /><text x={460} y={110} fill={C.ink2}>Em sino (mais difícil no meio)</text>
      </g>
    </svg>
  );
}

/* ==================== 17. TORQUE E BRAÇO DE MOMENTO ================== */

function FigTorque() {
  const px = 130, py = 250, ex = 430, ey = 120, armY = py + 70;
  return (
    <svg viewBox="0 0 720 320" {...svgProps("Torque é a força vezes o braço de momento; o braço muda com o ângulo da articulação")}>
      <defs><Arrowhead id="ah-tq" color={C.primary} /></defs>
      <circle cx={px} cy={py} r={9} fill="none" stroke={C.ink} strokeWidth={2} />
      <circle cx={px} cy={py} r={3} fill={C.ink} />
      <text x={px} y={py + 28} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.ink}>articulação (eixo)</text>
      <line x1={px} y1={py} x2={ex} y2={ey} stroke={C.ink2} strokeWidth={6} strokeLinecap="round" />
      <text x={255} y={172} fontSize={11} fill={C.ink3} transform="rotate(-24 255 172)">segmento (osso)</text>
      <circle cx={ex} cy={ey} r={12} fill={C.cta} />
      <line x1={ex} y1={ey + 12} x2={ex} y2={ey + 96} stroke={C.cta} strokeWidth={3} />
      <text x={ex + 12} y={ey + 64} fontSize={12} fontWeight={700} fill="var(--cta-text)">Força (peso)</text>
      <line x1={px} y1={armY} x2={ex} y2={armY} stroke={C.primary} strokeWidth={2} strokeDasharray="6 4" markerEnd="url(#ah-tq)" />
      <line x1={px} y1={py} x2={px} y2={armY} stroke={C.border} strokeWidth={1} />
      <line x1={ex} y1={ey} x2={ex} y2={armY} stroke={C.border} strokeWidth={1} strokeDasharray="2 3" />
      <text x={(px + ex) / 2} y={armY - 8} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.primary}>braço de momento</text>
      <rect x={420} y={215} width={280} height={68} rx={12} fill={C.soft} stroke={C.border} strokeWidth={1.4} />
      <text x={560} y={243} textAnchor="middle" fontSize={14} fontWeight={800} fill={C.ink}>Torque = Força × braço de momento</text>
      <text x={560} y={266} textAnchor="middle" fontSize={11} fill={C.ink3}>Máximo quando o segmento fica horizontal.</text>
    </svg>
  );
}

/* ==================== 18. CENTRO DE GRAVIDADE ======================= */

function FigCentroGravidade() {
  return (
    <svg viewBox="0 0 720 340" {...svgProps("Centro de gravidade e base de suporte: o equilíbrio depende da linha de gravidade cair dentro da base")}>
      <text x={360} y={34} textAnchor="middle" fontSize={12} fill={C.ink3}>Base mais larga e centro de gravidade mais baixo aumentam a estabilidade.</text>
      {/* estável */}
      <circle cx={190} cy={78} r={18} fill={C.tint} stroke={C.primary} strokeWidth={2} />
      <line x1={190} y1={96} x2={190} y2={195} stroke={C.ink2} strokeWidth={8} strokeLinecap="round" />
      <line x1={190} y1={195} x2={160} y2={272} stroke={C.ink2} strokeWidth={7} strokeLinecap="round" />
      <line x1={190} y1={195} x2={220} y2={272} stroke={C.ink2} strokeWidth={7} strokeLinecap="round" />
      <circle cx={190} cy={165} r={7} fill={C.cta} />
      <text x={205} y={162} fontSize={11} fontWeight={700} fill="var(--cta-text)">CG</text>
      <line x1={190} y1={165} x2={190} y2={286} stroke={C.cta} strokeWidth={1.6} strokeDasharray="5 4" />
      <rect x={148} y={284} width={84} height={8} rx={3} fill={C.success} opacity={0.6} />
      <text x={190} y={312} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.success}>Estável</text>
      <text x={190} y={328} textAnchor="middle" fontSize={10.5} fill={C.ink3}>linha dentro da base</text>
      {/* no limite */}
      <circle cx={510} cy={78} r={18} fill={C.tint} stroke={C.primary} strokeWidth={2} />
      <line x1={510} y1={96} x2={560} y2={190} stroke={C.ink2} strokeWidth={8} strokeLinecap="round" />
      <line x1={560} y1={190} x2={548} y2={272} stroke={C.ink2} strokeWidth={7} strokeLinecap="round" />
      <line x1={560} y1={190} x2={600} y2={272} stroke={C.ink2} strokeWidth={7} strokeLinecap="round" />
      <circle cx={548} cy={155} r={7} fill={C.cta} />
      <text x={532} y={152} textAnchor="end" fontSize={11} fontWeight={700} fill="var(--cta-text)">CG</text>
      <line x1={548} y1={155} x2={548} y2={286} stroke={C.cta} strokeWidth={1.6} strokeDasharray="5 4" />
      <rect x={548} y={284} width={70} height={8} rx={3} fill={C.warning} opacity={0.5} />
      <text x={583} y={312} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--warning)">No limite</text>
      <text x={583} y={328} textAnchor="middle" fontSize={10.5} fill={C.ink3}>linha na borda da base</text>
    </svg>
  );
}

/* ==================== 19. SUPERCOMPENSAÇÃO ========================== */

function FigSupercompensacao() {
  const x0 = 60, x1 = 690, y0 = 250, base = 178;
  const toX = (t: number) => x0 + (t / 100) * (x1 - x0);
  const pts: [number, number][] = [
    [0, 178], [12, 178], [18, 176], [24, 222], [30, 232], [40, 212], [52, 150], [60, 135], [70, 141], [82, 165], [92, 176], [100, 178],
  ];
  const path = pts.map(([t, y], i) => `${i === 0 ? "M" : "L"} ${toX(t).toFixed(1)} ${y}`).join(" ");
  return (
    <svg viewBox="0 0 720 300" {...svgProps("Curva de supercompensação: o treino gera fadiga e a recuperação eleva a capacidade acima do ponto inicial")}>
      <defs><Arrowhead id="ah-sc" color={C.cta} /></defs>
      <line x1={x0} y1={base} x2={x1} y2={base} stroke={C.border} strokeWidth={1.4} strokeDasharray="4 4" />
      <text x={x1} y={base - 6} textAnchor="end" fontSize={11} fill={C.ink3}>nível inicial</text>
      <line x1={x0} y1={30} x2={x0} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.ink2} strokeWidth={1.5} />
      <text x={26} y={150} fontSize={12} fill={C.ink2} transform="rotate(-90 26 150)">Capacidade</text>
      <text x={375} y={288} textAnchor="middle" fontSize={12} fill={C.ink2}>Tempo após a sessão</text>
      <line x1={toX(15)} y1={98} x2={toX(15)} y2={170} stroke={C.cta} strokeWidth={2.5} markerEnd="url(#ah-sc)" />
      <text x={toX(15)} y={90} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--cta-text)">estímulo</text>
      <path d={path} fill="none" stroke={C.primary} strokeWidth={3} />
      <text x={toX(30)} y={250} textAnchor="middle" fontSize={10.5} fill={C.ink3}>fadiga</text>
      <circle cx={toX(60)} cy={135} r={4} fill={C.success} />
      <text x={toX(60)} y={122} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.success}>supercompensação</text>
      <text x={toX(88)} y={200} textAnchor="middle" fontSize={10} fill={C.ink3}>volta ao início sem novo estímulo</text>
    </svg>
  );
}

/* ==================== 20. CARGA INTERNA x EXTERNA =================== */

function FigCargaInterna() {
  return (
    <svg viewBox="0 0 720 300" {...svgProps("Carga externa é o que se prescreve; passa pelo indivíduo e gera a carga interna, a resposta do organismo")}>
      <defs><Arrowhead id="ah-carga" color={C.ink3} /></defs>
      <NodeBox x={20} y={64} w={190} h={116} fill={C.soft} stroke={C.primary}>
        <text x={115} y={92} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.primary}>Carga externa</text>
        <text x={115} y={113} textAnchor="middle" fontSize={11} fill={C.ink3}>o que é prescrito</text>
        <text x={115} y={135} textAnchor="middle" fontSize={10.5} fill={C.ink2}>séries, repetições, carga,</text>
        <text x={115} y={150} textAnchor="middle" fontSize={10.5} fill={C.ink2}>distância, velocidade</text>
      </NodeBox>
      <NodeBox x={265} y={80} w={190} h={84} fill={C.tint} stroke={C.analysis}>
        <text x={360} y={106} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.analysis}>Indivíduo</text>
        <text x={360} y={128} textAnchor="middle" fontSize={10.5} fill={C.ink2}>aptidão, sono, estresse,</text>
        <text x={360} y={143} textAnchor="middle" fontSize={10.5} fill={C.ink2}>nutrição, experiência</text>
      </NodeBox>
      <NodeBox x={510} y={64} w={190} h={116} fill={C.soft} stroke={C.cta}>
        <text x={605} y={92} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--cta-text)">Carga interna</text>
        <text x={605} y={113} textAnchor="middle" fontSize={11} fill={C.ink3}>a resposta do corpo</text>
        <text x={605} y={135} textAnchor="middle" fontSize={10.5} fill={C.ink2}>percepção de esforço,</text>
        <text x={605} y={150} textAnchor="middle" fontSize={10.5} fill={C.ink2}>frequência cardíaca</text>
      </NodeBox>
      <line x1={210} y1={122} x2={263} y2={122} stroke={C.ink3} strokeWidth={2.5} markerEnd="url(#ah-carga)" />
      <line x1={455} y1={122} x2={508} y2={122} stroke={C.ink3} strokeWidth={2.5} markerEnd="url(#ah-carga)" />
      <rect x={175} y={222} width={370} height={44} rx={10} fill={C.ink} />
      <text x={360} y={249} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">sRPE = percepção de esforço × duração (min)</text>
    </svg>
  );
}

/* ==================== 21. COMPOSIÇÃO CORPORAL ====================== */

function FigComposicao() {
  const x0 = 90, w = 540, y = 96, h = 62;
  const seg: [string, number, string][] = [
    ["Água", 0.5, C.analysis],
    ["Músculo", 0.25, C.primary],
    ["Osso e órgãos", 0.12, C.ink3],
    ["Gordura", 0.13, C.cta],
  ];
  let acc = 0;
  return (
    <svg viewBox="0 0 720 300" {...svgProps("Composição corporal: a balança mostra o peso total; a composição divide massa magra e massa gorda")}>
      <text x={x0} y={y - 14} fontSize={12} fontWeight={700} fill={C.ink}>Massa corporal total (exemplo ilustrativo)</text>
      {seg.map(([label, frac, col]) => {
        const bx = x0 + acc * w;
        const bw = frac * w;
        acc += frac;
        return (
          <g key={label}>
            <rect x={bx} y={y} width={bw} height={h} fill={col} opacity={0.85} stroke="#fff" strokeWidth={1.5} />
            <text x={bx + bw / 2} y={y + h + 18} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.ink}>{label}</text>
            <text x={bx + bw / 2} y={y + h + 33} textAnchor="middle" fontSize={10.5} fill={C.ink3}>{Math.round(frac * 100)}%</text>
          </g>
        );
      })}
      <line x1={x0} y1={y + h + 46} x2={x0 + 0.87 * w} y2={y + h + 46} stroke={C.primary} strokeWidth={2} />
      <text x={x0 + 0.435 * w} y={y + h + 62} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.primary}>Massa magra</text>
      <line x1={x0 + 0.87 * w} y1={y + h + 46} x2={x0 + w} y2={y + h + 46} stroke={C.cta} strokeWidth={2} />
      <text x={x0 + 0.935 * w} y={y + h + 62} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--cta-text)">Gorda</text>
      <text x={360} y={40} textAnchor="middle" fontSize={11} fill={C.ink3}>A balança mostra só o total. A composição mostra a divisão, que muda com o treino.</text>
    </svg>
  );
}

/* ==================== 22. PIRÂMIDE DE EVIDÊNCIAS =================== */

function FigPiramideEvidencias() {
  const apexX = 360, apexY = 44, baseY = 278, halfBase = 210;
  const widthAt = (yy: number) => halfBase * ((yy - apexY) / (baseY - apexY));
  const levels: [string, number, string][] = [
    ["Revisões sistemáticas e meta-análises", 78, C.primary],
    ["Ensaios clínicos randomizados", 132, C.analysis],
    ["Estudos observacionais", 190, C.success],
    ["Relatos e opinião de especialista", 250, C.ink3],
  ];
  return (
    <svg viewBox="0 0 720 320" {...svgProps("Pirâmide de níveis de evidência, do menor ao maior grau de confiança")}>
      <defs><Arrowhead id="ah-pir" color={C.cta} /></defs>
      <polygon points={`${apexX},${apexY} ${apexX + halfBase},${baseY} ${apexX - halfBase},${baseY}`} fill={C.soft} stroke={C.border} strokeWidth={1.5} />
      {[108, 162, 220].map((yy) => (
        <line key={yy} x1={apexX - widthAt(yy)} y1={yy} x2={apexX + widthAt(yy)} y2={yy} stroke={C.border} strokeWidth={1.2} />
      ))}
      {levels.map(([t, yy, col]) => (
        <text key={t} x={apexX} y={yy} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={col}>{t}</text>
      ))}
      <line x1={612} y1={274} x2={612} y2={58} stroke={C.cta} strokeWidth={2.5} markerEnd="url(#ah-pir)" />
      <text x={628} y={166} fontSize={11} fontWeight={700} fill="var(--cta-text)" transform="rotate(90 628 166)">maior confiança, menos viés</text>
      <text x={40} y={306} fontSize={10.5} fill={C.ink3}>O topo tende a ser mais forte, mas a qualidade e o contexto do estudo também importam.</text>
    </svg>
  );
}

/* ==================== 23. FLUXO DE DECISÃO ========================= */

function FigFluxoDecisao() {
  const steps: [string, string][] = [
    ["Triagem", "segurança e contexto"],
    ["Critérios", "objetivo, restrição, nível"],
    ["Escolher", "e descartar com o porquê"],
    ["Documentar", "o registro da decisão"],
    ["Comunicar", "ao aluno, sem jargão"],
  ];
  const bw = 124, gap = 13;
  return (
    <svg viewBox="0 0 720 200" {...svgProps("Fluxo do raciocínio de prescrição: triagem, critérios, escolha, documentação e comunicação")}>
      <defs><Arrowhead id="ah-fd" color={C.ink3} /></defs>
      <text x={360} y={40} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.ink}>Do dado à conduta registrada</text>
      {steps.map(([t, s], i) => {
        const bx = 14 + i * (bw + gap);
        return (
          <g key={t}>
            <NodeBox x={bx} y={70} w={bw} h={64} fill={i === 2 ? C.tint : C.soft} stroke={i === 2 ? C.primary : C.border}>
              <text x={bx + bw / 2} y={98} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={C.ink}>{t}</text>
              <text x={bx + bw / 2} y={116} textAnchor="middle" fontSize={9} fill={C.ink3}>{s}</text>
            </NodeBox>
            {i < steps.length - 1 && <line x1={bx + bw} y1={102} x2={bx + bw + gap} y2={102} stroke={C.ink3} strokeWidth={2} markerEnd="url(#ah-fd)" />}
          </g>
        );
      })}
      <text x={360} y={166} textAnchor="middle" fontSize={11} fill={C.ink3}>Cada passo deixa um rastro: a decisão fica justificada e auditável.</text>
    </svg>
  );
}

/* ==================== 24. DOR NÃO É DANO =========================== */

function FigDorNaoDano() {
  const inputs: [string, string][] = [
    ["Nocicepção", "sinal do tecido"],
    ["Contexto", "ambiente e tarefa"],
    ["Emoção", "medo, ansiedade"],
    ["Experiências", "memória de dor"],
    ["Expectativa", "crenças, sono"],
  ];
  return (
    <svg viewBox="0 0 720 320" {...svgProps("A dor é uma interpretação do sistema nervoso a partir de vários sinais, não a medida direta do dano")}>
      <defs>
        <Arrowhead id="ah-dor" color={C.border} />
        <Arrowhead id="ah-dor2" color={C.cta} />
      </defs>
      {inputs.map(([t, s], i) => {
        const by = 24 + i * 54;
        return (
          <g key={t}>
            <NodeBox x={20} y={by} w={178} h={42} fill={C.surface} stroke={C.analysis}>
              <text x={38} y={by + 19} fontSize={12} fontWeight={700} fill={C.ink}>{t}</text>
              <text x={38} y={by + 34} fontSize={10} fill={C.ink3}>{s}</text>
            </NodeBox>
            <line x1={200} y1={by + 21} x2={330} y2={160} stroke={C.border} strokeWidth={1.4} markerEnd="url(#ah-dor)" />
          </g>
        );
      })}
      <circle cx={400} cy={160} r={62} fill={C.tint} stroke={C.primary} strokeWidth={2} />
      <CenterText cx={400} cy={152} lines={["Sistema", "nervoso"]} color={C.primary} size={13} />
      <text x={400} y={186} textAnchor="middle" fontSize={10.5} fill={C.ink2}>interpreta e pondera</text>
      <line x1={462} y1={160} x2={540} y2={160} stroke={C.cta} strokeWidth={3} markerEnd="url(#ah-dor2)" />
      <NodeBox x={545} y={132} w={150} h={56} fill={C.soft} stroke={C.cta}>
        <text x={620} y={158} textAnchor="middle" fontSize={15} fontWeight={800} fill="var(--cta-text)">Dor</text>
        <text x={620} y={176} textAnchor="middle" fontSize={10} fill={C.ink3}>experiência protetora</text>
      </NodeBox>
      <text x={360} y={304} textAnchor="middle" fontSize={11} fill={C.ink3}>Dor pode existir sem dano proporcional; é sinal de proteção, não medida da lesão.</text>
    </svg>
  );
}

/* ==================== 25. CICLO DA ADESÃO ========================= */

function FigAdesao() {
  const P: [number, number][] = [[360, 52], [560, 150], [480, 268], [240, 268], [160, 150]];
  const labels = ["Comunicação clara", "Metas realistas e tempo", "Reduzir barreiras", "Hábito e reforço", "Confiança e autonomia"];
  const cols = [C.primary, C.analysis, C.success, C.cta, "#7c3aed"];
  return (
    <svg viewBox="0 0 720 320" {...svgProps("Ciclo da adesão: comunicação, metas, redução de barreiras, hábito e confiança se reforçam")}>
      <defs><Arrowhead id="ah-ad" color={C.ink3} /></defs>
      {P.map((p, i) => {
        const qp = P[(i + 1) % P.length];
        return <line key={i} x1={p[0]} y1={p[1]} x2={qp[0]} y2={qp[1]} stroke={C.border} strokeWidth={2} markerEnd="url(#ah-ad)" />;
      })}
      <circle cx={360} cy={160} r={48} fill={C.tint} stroke={C.primary} strokeWidth={2} />
      <text x={360} y={165} textAnchor="middle" fontSize={15} fontWeight={800} fill={C.primary}>Adesão</text>
      {P.map((p, i) => (
        <g key={"n" + i}>
          <circle cx={p[0]} cy={p[1]} r={9} fill={cols[i]} />
          <text x={p[0]} y={p[1] < 160 ? p[1] - 16 : p[1] + 26} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.ink}>{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}

/* ==================== 26. SINAIS DE ALERTA (triagem) ============== */

function FigSinaisAlerta() {
  const cards: { key: string; c: string; t: string; s: string[]; x: number }[] = [
    { key: "verde", c: C.success, t: "Seguir", s: ["Sem sinais de alerta,", "esforço bem tolerado."], x: 24 },
    { key: "amarelo", c: "var(--warning)", t: "Ajustar e observar", s: ["Fadiga alta, desconforto leve.", "Reduza e monitore de perto."], x: 255 },
    { key: "vermelho", c: "#dc2626", t: "Interromper", s: ["Dor no peito, tontura, falta de ar", "desproporcional, sinal neurológico."], x: 486 },
  ];
  return (
    <svg viewBox="0 0 720 300" {...svgProps("Triagem de sinais durante a sessão: seguir, ajustar e observar, ou interromper e encaminhar")}>
      <defs><Arrowhead id="ah-sa" color={C.ink3} /></defs>
      <rect x={228} y={20} width={264} height={40} rx={10} fill={C.ink} />
      <text x={360} y={45} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">Durante a sessão, observe</text>
      {cards.map((cd) => (
        <g key={cd.key}>
          <line x1={360} y1={60} x2={cd.x + 105} y2={108} stroke={C.border} strokeWidth={1.5} markerEnd="url(#ah-sa)" />
          <rect x={cd.x} y={110} width={210} height={120} rx={12} fill={C.surface} stroke={cd.c} strokeWidth={2} />
          <circle cx={cd.x + 24} cy={140} r={9} fill={cd.c} />
          <text x={cd.x + 42} y={145} fontSize={13} fontWeight={700} fill={C.ink}>{cd.t}</text>
          {cd.s.map((line, j) => (
            <text key={j} x={cd.x + 18} y={172 + j * 18} fontSize={10.5} fill={C.ink2}>{line}</text>
          ))}
        </g>
      ))}
      <text x={360} y={270} textAnchor="middle" fontSize={11} fill={C.ink3}>A conduta clínica é do profissional de saúde; na dúvida, interrompa e encaminhe.</text>
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
  alavancas: {
    title: "Classes de alavanca do corpo",
    subtitle: "A posição do apoio, da força e da resistência define a classe.",
    Comp: FigAlavancas,
  },
  "curva-resistencia": {
    title: "Curvas de resistência",
    subtitle: "Onde o exercício é mais difícil ao longo da amplitude.",
    Comp: FigCurvaResistencia,
  },
  "torque-momento": {
    title: "Torque e braço de momento",
    subtitle: "A mesma carga exige mais força conforme o ângulo articular.",
    Comp: FigTorque,
  },
  "centro-gravidade": {
    title: "Centro de gravidade e base de suporte",
    subtitle: "O equilíbrio depende da linha de gravidade cair dentro da base.",
    Comp: FigCentroGravidade,
  },
  supercompensacao: {
    title: "Supercompensação",
    subtitle: "Estímulo, fadiga, recuperação e ganho acima do ponto inicial.",
    Comp: FigSupercompensacao,
  },
  "carga-interna-externa": {
    title: "Carga externa e carga interna",
    subtitle: "O que se prescreve passa pelo indivíduo e vira resposta do corpo.",
    Comp: FigCargaInterna,
  },
  "composicao-corporal": {
    title: "Composição corporal",
    subtitle: "A balança mostra o total; a composição divide magra e gorda.",
    Comp: FigComposicao,
  },
  "piramide-evidencias": {
    title: "Níveis de evidência",
    subtitle: "Da opinião às revisões sistemáticas, com mais e menos viés.",
    Comp: FigPiramideEvidencias,
  },
  "fluxo-decisao": {
    title: "Fluxo do raciocínio de prescrição",
    subtitle: "Do dado à conduta registrada, passo a passo.",
    Comp: FigFluxoDecisao,
  },
  "dor-nao-e-dano": {
    title: "Dor não é a medida do dano",
    subtitle: "A dor emerge da interpretação de vários sinais pelo sistema nervoso.",
    Comp: FigDorNaoDano,
  },
  adesao: {
    title: "Ciclo da adesão",
    subtitle: "Comunicação, metas, barreiras, hábito e confiança se reforçam.",
    Comp: FigAdesao,
  },
  "sinais-alerta": {
    title: "Triagem de sinais na sessão",
    subtitle: "Seguir, ajustar e observar, ou interromper e encaminhar.",
    Comp: FigSinaisAlerta,
  },
};

export function hasFigure(id: string): boolean {
  return Boolean(FIGURES[id]);
}
