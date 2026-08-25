/**
 * O MOTIVO DE EQUIPAMENTO DO CARTÃO DE HOJE.
 *
 * O herói do treino de hoje era só gradiente e texto. O protótipo pede uma imagem de
 * equipamento ali, e ela precisa cair sobre um gradiente que muda com a marca do
 * profissional, em tema claro e escuro.
 *
 * POR QUE SVG AUTORADO, E NÃO IMAGEM GERADA. Este projeto já pagou caro por deixar um
 * gerador desenhar corpo: joelho que sai para fora quando o texto diz para dentro, cotovelo
 * que descola do tronco, braço que vira outro exercício (ver a skill imagens-lovable).
 * Aqui não há corpo nenhum: é EQUIPAMENTO, que é geometria. Geometria em SVG sai exata,
 * herda a cor do cartão por `currentColor`, compõe sobre qualquer gradiente sem matte nem
 * banda, fica nítida em qualquer densidade de tela e não custa um byte de raster no bundle.
 *
 * Uma figura por modalidade (src/data/modalities.ts), com as mesmas 9 chaves, para o
 * desenho nunca discordar do que a sessão realmente é.
 *
 * Traço grosso e poucas linhas de propósito: a figura aparece com opacidade baixa, atrás do
 * conteúdo. Detalhe fino a 14% de opacidade vira sujeira, não desenho.
 */
import * as React from "react";

type Props = { className?: string };

const BASE = {
  viewBox: "0 0 200 200",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Esteira de perfil: deck da fita, coluna, console e o corrimão curto. */
function Esteira({ className }: Props) {
  return (
    <svg {...BASE} className={className} aria-hidden>
      <rect x="20" y="126" width="132" height="30" rx="15" />
      <path d="M146 132 170 72" />
      <rect x="138" y="40" width="54" height="32" rx="9" />
      <path d="M150 96h-34" />
      <path d="M40 174h96" />
    </svg>
  );
}

/** Bicicleta ergométrica de perfil: roda de inércia, quadro, selim e guidão. */
function Bike({ className }: Props) {
  return (
    <svg {...BASE} className={className} aria-hidden>
      <circle cx="58" cy="128" r="30" />
      <path d="M58 128 92 66" />
      <path d="M92 66V48" />
      <path d="M74 48h36" />
      <path d="M58 128h70" />
      <path d="M128 128V58" />
      <path d="M110 58h36" />
      <circle cx="96" cy="128" r="11" />
      <path d="M34 172h108" />
    </svg>
  );
}

/** Elíptico de perfil: roda de inércia atrás, braço longo do pedal e haste de mão. */
function Eliptico({ className }: Props) {
  return (
    <svg {...BASE} className={className} aria-hidden>
      <circle cx="52" cy="116" r="28" />
      <path d="M52 116 168 152" />
      <rect x="142" y="144" width="40" height="17" rx="8" />
      <path d="M52 116 76 36" />
      <path d="M76 36h32" />
      <path d="M24 178h84" />
    </svg>
  );
}

/** Raia de piscina: as boias da corda de raia sobre a linha d'água. */
function Piscina({ className }: Props) {
  return (
    <svg {...BASE} className={className} aria-hidden>
      <path d="M20 66h152" />
      <circle cx="40" cy="66" r="13" />
      <circle cx="78" cy="66" r="13" />
      <circle cx="116" cy="66" r="13" />
      <circle cx="154" cy="66" r="13" />
      <path d="M20 124c14-14 28-14 42 0s28 14 42 0 28-14 42 0 28 14 34 6" />
      <path d="M20 162c14-14 28-14 42 0s28 14 42 0 28-14 42 0 28 14 34 6" />
    </svg>
  );
}

/** Hidroginástica: halter flutuante sobre a linha d'água. */
function Hidro({ className }: Props) {
  return (
    <svg {...BASE} className={className} aria-hidden>
      <rect x="24" y="52" width="34" height="52" rx="14" />
      <rect x="130" y="52" width="34" height="52" rx="14" />
      <path d="M58 78h72" />
      <path d="M20 138c14-14 28-14 42 0s28 14 42 0 28-14 42 0 28 14 34 6" />
      <path d="M20 172c14-14 28-14 42 0s28 14 42 0 28-14 42 0 28 14 34 6" />
    </svg>
  );
}

/**
 * Musculação: halter de perfil, com o disco grande e o pequeno de cada lado.
 *
 * A primeira versão desenhava os discos como traços verticais soltos, e a figura lia como
 * a letra H, não como um halter. Disco é volume: com corpo arredondado ele vira halter na
 * hora, que é o que a figura vizinha do hidro já provava.
 */
function Halter({ className }: Props) {
  return (
    <svg {...BASE} className={className} aria-hidden>
      <rect x="22" y="68" width="26" height="64" rx="12" />
      <rect x="54" y="54" width="30" height="92" rx="14" />
      <rect x="116" y="54" width="30" height="92" rx="14" />
      <rect x="152" y="68" width="26" height="64" rx="12" />
      <path d="M84 100h32" />
    </svg>
  );
}

/** Funcional: kettlebell, a alça e o corpo. */
function Kettlebell({ className }: Props) {
  return (
    <svg {...BASE} className={className} aria-hidden>
      <path d="M72 74a28 28 0 0 1 56 0" />
      <path d="M72 74v10" />
      <path d="M128 74v10" />
      <path d="M76 90c-26 14-40 40-40 62h128c0-22-14-48-40-62Z" />
    </svg>
  );
}

/** Mobilidade: tapete enrolado, de perfil, com o rolo à frente. */
function Tapete({ className }: Props) {
  return (
    <svg {...BASE} className={className} aria-hidden>
      <circle cx="60" cy="118" r="34" />
      <circle cx="60" cy="118" r="12" />
      <path d="M60 84h96" />
      <path d="M60 152h96" />
      <path d="M156 84c22 0 22 68 0 68" />
    </svg>
  );
}

/** Combinado: o halter da força e a onda do aeróbio na mesma figura. */
function Combinado({ className }: Props) {
  return (
    <svg {...BASE} className={className} aria-hidden>
      <rect x="28" y="46" width="24" height="56" rx="11" />
      <rect x="58" y="34" width="27" height="80" rx="13" />
      <rect x="115" y="34" width="27" height="80" rx="13" />
      <rect x="148" y="46" width="24" height="56" rx="11" />
      <path d="M85 74h30" />
      <path d="M22 158c16-20 32-20 48 0s32 20 48 0 32-20 48 0" />
    </svg>
  );
}

/**
 * Uma figura por modalidade, com as MESMAS chaves de src/data/modalities.ts. Chave sem
 * figura própria não inventa uma: cai no halter, que é o desenho mais genérico do conjunto.
 */
const POR_MODALIDADE: Record<string, (p: Props) => React.ReactElement> = {
  "m-caminhada": Esteira,
  "m-bike": Bike,
  "m-eliptico": Eliptico,
  "m-natacao": Piscina,
  "m-hidro": Hidro,
  "m-musculacao": Halter,
  "m-funcional": Kettlebell,
  "m-mobilidade": Tapete,
  "m-combinado": Combinado,
};

export function MotivoModalidade({ modalidade, className }: { modalidade?: string; className?: string }) {
  const Figura = (modalidade && POR_MODALIDADE[modalidade]) || Halter;
  return <Figura className={className} />;
}

/** As modalidades que têm figura própria, para o guardrail conferir contra o catálogo. */
export const MODALIDADES_COM_MOTIVO = Object.keys(POR_MODALIDADE);
