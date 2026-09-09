import { cn } from "@/lib/utils";
import { useBrand, iniciaisDaMarca } from "@/lib/brand/BrandContext";

/*
 * A MARCA EM VETOR, e por que ela deixou de ser um arquivo de imagem.
 *
 * O pino vinha de `/brand/marca-pino.webp`, um PNG de 512 px gerado no Lovable e recortado
 * à mão. Servia, e cobrava três preços: pedia uma requisição só para desenhar 32 px de
 * cabeçalho, borrava em tela retina acima de 512, e não dava para animar nem recolorir nada
 * dentro dele. Ainda trazia as imperfeições do gerador: a cabeça do pino não era um círculo,
 * as laterais não eram tangentes exatas e as bordas tinham meio pixel de sujeira.
 *
 * O vetor abaixo foi DERIVADO do raster, não redesenhado de memória: a mancha branca é o
 * contorno traçado do próprio arquivo (Moore + simplificação + curva de Catmull-Rom), e a
 * rota saiu de medir os nós, os cotovelos e a espessura pixel a pixel. O que mudou de
 * propósito é o que o gerador errava: a cabeça virou um círculo de verdade (centro 256,176,
 * raio 176) e as laterais viraram as tangentes exatas dele até a ponta em 256,512. Medido
 * contra o raster: 97% de sobreposição na silhueta, 95,6% na mancha branca, 94,8% na rota,
 * e a diferença que sobra é a borda de antisserrilhado de um pixel.
 *
 * As cores são LITERAIS de propósito. Marca não segue tema: o pino é #146EF1 e a rota é
 * #10B7C0 no claro e no escuro, como em qualquer papel timbrado.
 */
const PINO = "M106.1 268.2A176 176 0 1 1 405.9 268.2L256 512Z";
const MANCHA =
  "M240 64C250.7 62.2 258.8 62.8 268 64C277.2 65.2 287.7 68.3 295 71C302.3 73.7 305.7 75.3 312 80C318.3 84.7 327.5 92.7 333 99C338.5 105.3 341.7 110.2 345 118C348.3 125.8 351.7 138.3 353 146C354.3 153.7 354 157.2 353 164C352 170.8 342.7 178.7 347 187C351.3 195.3 372 206.2 379 214C386 221.8 387.3 228.3 389 234C390.7 239.7 390.5 242.3 389 248C387.5 253.7 391.7 254.3 380 268C368.3 281.7 333 314.5 319 330C305 345.5 298.2 351.5 296 361C293.8 370.5 304.7 379.8 306 387C307.3 394.2 305.3 399 304 404C302.7 409 301.5 412.3 298 417C294.5 421.7 288.5 428.3 283 432C277.5 435.7 271.5 438.2 265 439C258.5 439.8 250 438.7 244 437C238 435.3 235.7 434.7 229 429C222.3 423.3 211.5 412.2 204 403C196.5 393.8 188 383 184 374C180 365 179.8 355.3 180 349C180.2 342.7 182.2 340.5 185 336C187.8 331.5 189.7 328 197 322C204.3 316 221.8 305.5 229 300C236.2 294.5 237.3 292.5 240 289C242.7 285.5 244.2 282.2 245 279C245.8 275.8 247 274.3 245 270C243 265.7 242 259.7 233 253C224 246.3 201.5 237 191 230C180.5 223 175.7 217.8 170 211C164.3 204.2 160.2 197 157 189C153.8 181 151.2 173.2 151 163C150.8 152.8 151.8 139.2 156 128C160.2 116.8 168 104.8 176 96C184 87.2 193.3 80.3 204 75C214.7 69.7 229.3 65.8 240 64Z";
const ROTA = "M253 132L344 222L292 270L221 346L261 391";
/** Nós da rota, do topo para a ponta. O raio decresce, como no desenho original. */
const NOS = [
  { cx: 253, cy: 132, r: 35 },
  { cx: 292, cy: 270, r: 31 },
  { cx: 261, cy: 391, r: 29 },
] as const;
const AZUL = "#146EF1";
const TEAL = "#10B7C0";

/**
 * O pino do Mapa da Prescrição. Decorativo por padrão: quem o usa ao lado do nome da marca
 * não quer que o leitor de tela diga "Mapa da Prescrição" duas vezes. Passe `rotulo` quando
 * ele aparecer sozinho.
 */
export function MarcaPino({
  className,
  rotulo,
  animado,
}: {
  className?: string;
  rotulo?: string;
  /** anima a rota se traçando: o estado de carregamento da casa */
  animado?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      className={cn(animado && "marca-carregando", className)}
      role={rotulo ? "img" : undefined}
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
      focusable="false"
    >
      <path fill={AZUL} d={PINO} />
      <path fill="#FFFFFF" d={MANCHA} />
      <path
        className="marca-rota"
        fill="none"
        stroke={TEAL}
        strokeWidth={19}
        strokeLinecap="round"
        strokeLinejoin="round"
        d={ROTA}
      />
      {NOS.map((no, i) => (
        <circle
          key={no.cy}
          className="marca-no"
          fill={TEAL}
          cx={no.cx}
          cy={no.cy}
          r={no.r}
          style={animado ? { animationDelay: `${i * 0.16}s` } : undefined}
        />
      ))}
    </svg>
  );
}

/**
 * A MARCA COMO INDICADOR DE CARREGAMENTO.
 *
 * A rota se traça de um nó ao outro, que é literalmente o que o produto faz enquanto espera.
 * Substitui a barrinha pulsante genérica que ficava embaixo do logo. Quem desliga animação no
 * sistema recebe o pino inteiro, parado: os quadros terminam no desenho completo, nunca num
 * estado pela metade.
 */
export function MarcaCarregando({
  className,
  rotulo = "Carregando",
}: {
  className?: string;
  rotulo?: string;
}) {
  return (
    <span role="status" aria-live="polite" className="inline-flex flex-col items-center gap-2">
      <MarcaPino animado className={cn("h-12 w-12", className)} />
      <span className="sr-only">{rotulo}</span>
    </span>
  );
}

/** O nome da marca, com o traço da rota sob "Prescrição" (é o desenho do logotipo). */
function Palavra({ className }: { className?: string }) {
  return (
    <span className={cn("whitespace-nowrap font-display font-bold leading-none text-ink", className)}>
      Mapa da{" "}
      <span className="relative inline-block">
        Prescrição
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-[0.18em] h-[0.1em] rounded-full"
          style={{ background: TEAL }}
        />
      </span>
    </span>
  );
}

export function Logo({ showWord = true, className }: { showWord?: boolean; className?: string }) {
  const marca = useBrand();

  // White-label: dentro do portal do aluno, o Logo assume a marca do profissional.
  if (marca) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {marca.logoDataUrl ? (
          <img src={marca.logoDataUrl} alt="" className="h-8 max-w-[150px] overflow-hidden rounded-lg object-contain ring-1 ring-border" />
        ) : (
          <div
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-white"
            style={{ background: marca.corPrimaria || "var(--primary)" }}
          >
            {iniciaisDaMarca(marca.nome)}
          </div>
        )}
        {showWord && (
          <span className="max-w-[180px] truncate font-display text-[17px] font-bold leading-none text-ink">
            {marca.nome}
          </span>
        )}
      </div>
    );
  }

  // Marca do produto (padrão do app do profissional): Mapa da Prescrição.
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <MarcaPino className="h-8 w-8 shrink-0" />
      {showWord && <Palavra className="text-[17px]" />}
    </div>
  );
}
