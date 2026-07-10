import type { ReactNode } from "react";

/**
 * Ilustrações do passo a passo (mockups abstratos, na paleta do produto).
 * Cada cena é um SVG leve e temático — nada de screenshots pesados.
 */

export type SceneId =
  | "nav"
  | "form"
  | "wizard"
  | "recomendacao"
  | "pdf"
  | "avaliar"
  | "evolucao"
  | "jornada"
  | "slider"
  | "abas"
  | "caso"
  | "feedback"
  | "modo";

const VB = "0 0 340 210";
const FONT = "Inter, ui-sans-serif, system-ui, sans-serif";

function Svg({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox={VB} role="img" aria-label={label} className="h-auto w-full" style={{ fontFamily: FONT }}>
      <rect x="0.5" y="0.5" width="339" height="209" rx="14" fill="var(--surface)" stroke="var(--border)" />
      {children}
    </svg>
  );
}

/* Moldura de app: barra lateral (item ativo destacado) + topo. Conteúdo no slot. */
function Chrome({
  active = 0,
  count = 5,
  activeText,
  children,
}: {
  active?: number;
  count?: number;
  activeText?: string;
  children?: ReactNode;
}) {
  return (
    <>
      <rect x="12" y="12" width="84" height="186" rx="10" fill="var(--surface-soft)" />
      {/* logo */}
      <circle cx="26" cy="28" r="7" fill="var(--primary)" />
      <rect x="37" y="24" width="40" height="8" rx="4" fill="var(--ink-3)" opacity="0.4" />
      {Array.from({ length: count }).map((_, i) => {
        const y = 48 + i * 24;
        const on = i === active;
        return (
          <g key={i}>
            <rect
              x="20"
              y={y}
              width="68"
              height="18"
              rx="6"
              fill={on ? "var(--primary-tint)" : "transparent"}
            />
            <rect x="26" y={y + 6} width="6" height="6" rx="1.5" fill={on ? "var(--primary)" : "var(--ink-3)"} opacity={on ? 1 : 0.5} />
            {on && activeText ? (
              <text x="37" y={y + 13} fontSize="8.5" fontWeight="700" fill="var(--primary)">
                {activeText}
              </text>
            ) : (
              <rect x="37" y={y + 6} width={on ? 46 : 38} height="6" rx="3" fill={on ? "var(--primary)" : "var(--ink-3)"} opacity={on ? 0.85 : 0.4} />
            )}
          </g>
        );
      })}
      <rect x="108" y="12" width="220" height="18" rx="9" fill="var(--surface-soft)" />
      <circle cx="120" cy="21" r="3" fill="var(--ink-3)" opacity="0.5" />
      <rect x="128" y="18" width="70" height="6" rx="3" fill="var(--ink-3)" opacity="0.35" />
      <g transform="translate(108,40)">{children}</g>
    </>
  );
}

function Title({ x = 0, y = 8, w = 90 }: { x?: number; y?: number; w?: number }) {
  return <rect x={x} y={y} width={w} height="9" rx="4.5" fill="var(--ink)" opacity="0.85" />;
}

function Line({ x = 0, y = 0, w = 120, o = 0.35 }: { x?: number; y?: number; w?: number; o?: number }) {
  return <rect x={x} y={y} width={w} height="5" rx="2.5" fill="var(--ink-3)" opacity={o} />;
}

/* ------------------------------- Cenas ---------------------------------- */

function SceneNav({ label }: { label?: string }) {
  return (
    <Chrome active={2} activeText={label ?? "Abrir"}>
      <Title w={110} />
      <Line y={24} w={160} />
      <Line y={34} w={130} />
      <rect x="0" y="52" width="210" height="96" rx="10" fill="var(--surface-soft)" opacity="0.6" />
    </Chrome>
  );
}

function SceneForm() {
  return (
    <Chrome active={1} activeText="Alunos">
      <Title w={120} />
      {/* cartão de formulário */}
      <rect x="0" y="24" width="210" height="126" rx="10" fill="var(--surface)" stroke="var(--border)" />
      <Line x={14} y={40} w={40} o={0.5} />
      <rect x="14" y={50} width="182" height="16" rx="6" fill="var(--surface-soft)" />
      <Line x={14} y={78} w={40} o={0.5} />
      <rect x="14" y={88} width="86" height="16" rx="6" fill="var(--surface-soft)" />
      <Line x={110} y={78} w={40} o={0.5} />
      <rect x="110" y={88} width="86" height="16" rx="6" fill="var(--surface-soft)" />
      {/* botão primário destacado */}
      <rect x="120" y="120" width="76" height="18" rx="9" fill="var(--cta)" />
      <text x="158" y="132" fontSize="8.5" fontWeight="700" fill="#fff" textAnchor="middle">
        Cadastrar
      </text>
    </Chrome>
  );
}

function SceneWizard() {
  return (
    <Chrome active={2} activeText="Prescrever">
      {/* barra de progresso */}
      <Line y={6} w={60} o={0.5} />
      <rect x="0" y="18" width="210" height="6" rx="3" fill="var(--surface-soft)" />
      <rect x="0" y="18" width="84" height="6" rx="3" fill="var(--primary)" />
      <Title x={0} y={34} w={120} />
      {/* opções (uma selecionada) */}
      {[0, 1, 2, 3].map((i) => {
        const y = 56 + (i % 2) * 30;
        const x = (i < 2 ? 0 : 108);
        const on = i === 0;
        return (
          <g key={i}>
            <rect x={x} y={y} width="100" height="22" rx="7" fill={on ? "var(--primary-tint)" : "var(--surface)"} stroke={on ? "var(--primary)" : "var(--border)"} />
            <circle cx={x + 13} cy={y + 11} r="5" fill="none" stroke={on ? "var(--primary)" : "var(--ink-3)"} strokeWidth="2" />
            {on && <circle cx={x + 13} cy={y + 11} r="2.4" fill="var(--primary)" />}
            <rect x={x + 24} y={y + 8} width="60" height="6" rx="3" fill={on ? "var(--primary)" : "var(--ink-3)"} opacity={on ? 0.8 : 0.4} />
          </g>
        );
      })}
      <rect x="128" y="126" width="82" height="18" rx="9" fill="var(--cta)" />
      <text x="169" y="138" fontSize="8" fontWeight="700" fill="#fff" textAnchor="middle">
        Ver recomendações
      </text>
    </Chrome>
  );
}

function SceneRecomendacao() {
  return (
    <Chrome active={2} activeText="Prescrever">
      {/* cartão âncora "melhor recomendação" */}
      <rect x="0" y="6" width="210" height="142" rx="10" fill="var(--surface)" stroke="var(--border)" />
      <rect x="0" y="6" width="210" height="16" rx="10" fill="var(--primary)" />
      <text x="10" y="18" fontSize="8" fontWeight="700" fill="#fff">
        MELHOR RECOMENDAÇÃO
      </text>
      {/* anel de score */}
      <circle cx="34" cy="58" r="20" fill="none" stroke="var(--surface-soft)" strokeWidth="6" />
      <circle cx="34" cy="58" r="20" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray="100 126" transform="rotate(-90 34 58)" />
      <text x="34" y="62" fontSize="12" fontWeight="800" fill="var(--ink)" textAnchor="middle">
        82
      </text>
      <Title x={66} y={40} w={110} />
      <Line x={66} y={56} w={130} />
      <Line x={66} y={66} w={90} />
      {/* pills de motivo */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={66 + i * 44} y={80} width="40" height="12" rx="6" fill="var(--primary-tint)" />
      ))}
      {/* botão justificativa (primário) */}
      <rect x="14" y="112" width="96" height="20" rx="10" fill="var(--cta)" />
      <text x="62" y="125" fontSize="8.5" fontWeight="700" fill="#fff" textAnchor="middle">
        Ver justificativa
      </text>
      <rect x="120" y="112" width="76" height="20" rx="10" fill="var(--surface)" stroke="var(--border)" />
    </Chrome>
  );
}

function ScenePdf() {
  return (
    <Svg label="Prescrição em PDF com a marca do profissional">
      <Chrome active={1} activeText="Alunos">
        <rect x="30" y="4" width="150" height="150" rx="8" fill="#fff" stroke="var(--border)" />
        {/* cabeçalho branded */}
        <rect x="30" y="4" width="150" height="26" rx="8" fill="var(--primary)" />
        <rect x="42" y="13" width="70" height="8" rx="4" fill="#fff" opacity="0.95" />
        <rect x="140" y="14" width="28" height="6" rx="3" fill="#fff" opacity="0.6" />
        <Line x={42} y={40} w={80} o={0.6} />
        {[0, 1, 2].map((i) => {
          const y = 58 + i * 26;
          return (
            <g key={i}>
              <circle cx={48} cy={y + 8} r="7" fill="var(--primary-tint)" />
              <text x={48} y={y + 11} fontSize="7" fontWeight="700" fill="var(--primary)" textAnchor="middle">
                {i + 1}
              </text>
              <rect x={62} y={y} width="100" height="7" rx="3.5" fill="var(--ink)" opacity="0.75" />
              <rect x={62} y={y + 11} width="70" height="5" rx="2.5" fill="var(--ink-3)" opacity="0.4" />
            </g>
          );
        })}
      </Chrome>
    </Svg>
  );
}

function SceneAvaliar() {
  return (
    <Chrome active={1} activeText="Alunos">
      <Title w={100} />
      <rect x="0" y="24" width="210" height="126" rx="10" fill="var(--surface)" stroke="var(--border)" />
      <text x="14" y="42" fontSize="9" fontWeight="700" fill="var(--ink)">
        Registrar avaliação
      </text>
      {[
        ["Peso", 60],
        ["% gordura", 90],
        ["Dor (0–10)", 70],
      ].map(([lbl, w], i) => (
        <g key={i}>
          <Line x={14} y={56 + i * 26} w={w as number} o={0.5} />
          <rect x={120} y={52 + i * 26} width="76" height="14" rx="6" fill="var(--surface-soft)" />
        </g>
      ))}
      <rect x="120" y="126" width="76" height="16" rx="8" fill="var(--cta)" />
      <text x="158" y="137" fontSize="8" fontWeight="700" fill="#fff" textAnchor="middle">
        Salvar
      </text>
    </Chrome>
  );
}

function SceneEvolucao() {
  const pts = [140, 120, 128, 96, 104, 72, 80];
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${10 + i * 30} ${p}`).join(" ");
  return (
    <Chrome active={4} activeText="Avaliações">
      <Title w={110} />
      <rect x="0" y="24" width="210" height="126" rx="10" fill="var(--surface)" stroke="var(--border)" />
      {/* grid */}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="10" x2="200" y1={50 + i * 24} y2={50 + i * 24} stroke="var(--border)" strokeDasharray="2 3" />
      ))}
      <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={10 + i * 30} cy={p} r="3" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" />
      ))}
    </Chrome>
  );
}

function SceneJornada() {
  return (
    <Chrome active={3} activeText="Grupos">
      <Title w={130} />
      <Line y={24} w={150} />
      {/* fases 1-2-3-4 */}
      {[1, 2, 3, 4].map((n, i) => {
        const on = n === 2;
        const x = i * 52;
        return (
          <g key={n}>
            {i < 3 && <line x1={x + 40} x2={x + 52} y1={54} y2={54} stroke="var(--border)" strokeWidth="2" />}
            <circle cx={x + 20} cy={54} r="15" fill={on ? "var(--primary)" : "var(--surface-soft)"} stroke={on ? "var(--primary)" : "var(--border)"} strokeWidth="2" />
            <text x={x + 20} y={58} fontSize="12" fontWeight="800" fill={on ? "#fff" : "var(--ink-3)"} textAnchor="middle">
              {n}
            </text>
          </g>
        );
      })}
      <rect x="0" y="86" width="210" height="62" rx="10" fill="var(--primary-tint)" opacity="0.5" />
      <text x="12" y="104" fontSize="8" fontWeight="700" fill="var(--primary)">
        FOCO DA FASE
      </text>
      <Line x={12} y={114} w={150} o={0.5} />
      <Line x={12} y={126} w={120} o={0.4} />
    </Chrome>
  );
}

function SceneSlider() {
  return (
    <Svg label="Comparar execução e análise biomecânica">
      {/* imagem dividida */}
      <clipPath id="tut-clip">
        <rect x="24" y="18" width="292" height="150" rx="12" />
      </clipPath>
      <g clipPath="url(#tut-clip)">
        <rect x="24" y="18" width="292" height="150" fill="var(--surface-soft)" />
        <rect x="170" y="18" width="146" height="150" fill="var(--primary-tint)" opacity="0.55" />
        {/* silhueta simples */}
        <circle cx="120" cy="70" r="14" fill="var(--ink-3)" opacity="0.35" />
        <rect x="104" y="88" width="32" height="46" rx="12" fill="var(--ink-3)" opacity="0.35" />
        {/* marcadores de análise no lado direito */}
        <circle cx="214" cy="92" r="6" fill="var(--analysis)" />
        <line x1="196" y1="120" x2="240" y2="86" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="4 3" />
        <text x="250" y="60" fontSize="8" fontWeight="700" fill="var(--analysis)">
          análise
        </text>
      </g>
      {/* divisor arrastável */}
      <line x1="170" y1="18" x2="170" y2="168" stroke="#fff" strokeWidth="3" />
      <circle cx="170" cy="93" r="12" fill="#fff" stroke="var(--border)" />
      <path d="M166 89 l-3 4 3 4 M174 89 l3 4 -3 4" stroke="var(--ink-2)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <text x="40" y="34" fontSize="8" fontWeight="700" fill="var(--ink-2)">
        Execução
      </text>
    </Svg>
  );
}

function SceneAbas() {
  return (
    <Svg label="Abas de aprofundamento">
      <rect x="24" y="24" width="292" height="26" rx="8" fill="var(--surface-soft)" />
      {["Visão geral", "Biomecânica", "Fisiologia"].map((t, i) => {
        const on = i === 1;
        return (
          <g key={t}>
            <rect x={30 + i * 96} y={29} width="90" height="16" rx="6" fill={on ? "var(--surface)" : "transparent"} stroke={on ? "var(--border)" : "transparent"} />
            <text x={75 + i * 96} y={40} fontSize="7.5" fontWeight="700" fill={on ? "var(--primary)" : "var(--ink-3)"} textAnchor="middle">
              {t}
            </text>
          </g>
        );
      })}
      <rect x="24" y="60" width="292" height="120" rx="10" fill="var(--surface)" stroke="var(--border)" />
      <Line x={40} y={80} w={200} o={0.45} />
      <Line x={40} y={94} w={230} o={0.35} />
      {/* accordion */}
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={40} y={112 + i * 26} width="260" height="20" rx="6" fill="var(--surface-soft)" />
          <rect x={48} y={119 + i * 26} width="120" height="6" rx="3" fill="var(--ink)" opacity="0.6" />
          <path d={`M288 ${119 + i * 26} l4 4 4 -4`} stroke="var(--ink-3)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </Svg>
  );
}

function SceneCaso() {
  return (
    <Chrome active={2} activeText="Casos">
      <Title w={140} />
      <rect x="0" y="24" width="210" height="34" rx="8" fill="var(--surface-soft)" />
      <Line x={12} y={34} w={180} o={0.5} />
      <Line x={12} y={44} w={140} o={0.4} />
      {[0, 1, 2].map((i) => {
        const on = i === 1;
        return (
          <g key={i}>
            <rect x="0" y={68 + i * 26} width="210" height="20" rx="7" fill={on ? "var(--primary-tint)" : "var(--surface)"} stroke={on ? "var(--primary)" : "var(--border)"} />
            <circle cx="14" cy={78 + i * 26} r="5" fill="none" stroke={on ? "var(--primary)" : "var(--ink-3)"} strokeWidth="2" />
            {on && <circle cx="14" cy={78 + i * 26} r="2.4" fill="var(--primary)" />}
            <rect x="26" y={75 + i * 26} width="150" height="6" rx="3" fill="var(--ink-3)" opacity={on ? 0.7 : 0.4} />
          </g>
        );
      })}
    </Chrome>
  );
}

function SceneFeedback() {
  return (
    <Svg label="Feedback do raciocínio">
      <rect x="24" y="24" width="292" height="30" rx="9" fill="#e7f8ed" />
      <circle cx="44" cy="39" r="9" fill="var(--success)" />
      <path d="M40 39 l3 3 5 -6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="60" y="43" fontSize="9" fontWeight="700" fill="var(--ink)">
        Escolha adequada
      </text>
      {[
        ["Por que funciona", "var(--success)", "#e7f8ed"],
        ["Critério de decisão", "var(--primary)", "var(--primary-tint)"],
        ["O que lembrar", "var(--analysis)", "#e0f7f9"],
      ].map(([t, c, bg], i) => {
        const x = 24 + (i % 2) * 150;
        const y = 66 + Math.floor(i / 2) * 58;
        return (
          <g key={i as number}>
            <rect x={x} y={y} width="142" height="50" rx="9" fill="var(--surface)" stroke="var(--border)" />
            <rect x={x + 10} y={y + 10} width="16" height="16" rx="5" fill={bg as string} />
            <circle cx={x + 18} cy={y + 18} r="3" fill={c as string} />
            <rect x={x + 32} y={y + 13} width="90" height="6" rx="3" fill={c as string} opacity="0.8" />
            <Line x={x + 10} y={y + 33} w={120} o={0.35} />
          </g>
        );
      })}
    </Svg>
  );
}

function SceneModo() {
  return (
    <Chrome active={0} activeText="Painel">
      {/* seletor de modo em destaque */}
      <text x="0" y="8" fontSize="8" fontWeight="700" fill="var(--ink-3)">
        NO TOPO DA BARRA LATERAL
      </text>
      <rect x="0" y="18" width="150" height="30" rx="10" fill="var(--surface-soft)" />
      <rect x="4" y="22" width="71" height="22" rx="8" fill="var(--surface)" stroke="var(--border)" />
      <text x="40" y="37" fontSize="9" fontWeight="700" fill="var(--ink)" textAnchor="middle">
        Atender
      </text>
      <text x="112" y="37" fontSize="9" fontWeight="700" fill="var(--ink-3)" textAnchor="middle">
        Aprender
      </text>
      <path d="M166 33 h30 m0 0 l-6 -4 m6 4 l-6 4" stroke="var(--primary)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="0" y="66" width="210" height="82" rx="10" fill="var(--surface-soft)" opacity="0.6" />
    </Chrome>
  );
}

const SCENES: Record<SceneId, (props: { navLabel?: string }) => ReactNode> = {
  nav: ({ navLabel }) => <SceneNav label={navLabel} />,
  form: () => <SceneForm />,
  wizard: () => <SceneWizard />,
  recomendacao: () => <SceneRecomendacao />,
  pdf: () => <ScenePdf />,
  avaliar: () => <SceneAvaliar />,
  evolucao: () => <SceneEvolucao />,
  jornada: () => <SceneJornada />,
  slider: () => <SceneSlider />,
  abas: () => <SceneAbas />,
  caso: () => <SceneCaso />,
  feedback: () => <SceneFeedback />,
  modo: () => <SceneModo />,
};

// Cenas que já desenham a própria moldura via <Svg> (não usam Chrome dentro de Svg).
const STANDALONE: SceneId[] = ["pdf", "slider", "abas", "feedback"];

export function TutorialScene({ id, navLabel, label }: { id: SceneId; navLabel?: string; label: string }) {
  const content = SCENES[id]({ navLabel });
  if (STANDALONE.includes(id)) return <>{content}</>;
  return <Svg label={label}>{content}</Svg>;
}
