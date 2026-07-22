import * as React from "react";
import type { Marco } from "@/lib/postura/vision";
import { CONEXOES, medidasDaVista, LIMIARES, type MedidaPostural } from "@/lib/postura/metrics";
import type { VistaPostural } from "@/data/postural";

/**
 * Sobreposição interativa: a foto com o esqueleto detectado, cada ponto
 * arrastável. Ao mover um ponto, as medidas recalculam na hora. É aqui que o
 * "ajuste manual do resultado" acontece na raiz: o profissional corrige onde o
 * modelo errou, e a leitura acompanha.
 */
export function PosturalAnalyzer({
  dataUrl,
  vista,
  marcos,
  onMarcos,
  onMedidas,
  cor = "var(--primary)",
}: {
  dataUrl: string;
  vista: VistaPostural;
  marcos: Marco[];
  onMarcos: (m: Marco[]) => void;
  onMedidas: (m: MedidaPostural[]) => void;
  cor?: string;
}) {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [arrastando, setArrastando] = React.useState<string | null>(null);

  const medidas = React.useMemo(() => medidasDaVista(vista, marcos), [vista, marcos]);
  React.useEffect(() => {
    onMedidas(medidas);
  }, [medidas, onMedidas]);

  const posDe = (nome: string) => marcos.find((k) => k.nome === nome);

  const mover = (clientX: number, clientY: number) => {
    if (!arrastando || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    onMarcos(marcos.map((k) => (k.nome === arrastando ? { ...k, x, y, score: Math.max(k.score, 0.6) } : k)));
  };

  return (
    <div className="space-y-2">
      <div
        ref={boxRef}
        className="relative mx-auto max-w-xs touch-none select-none overflow-hidden rounded-lg border border-border"
        onPointerMove={(e) => arrastando && mover(e.clientX, e.clientY)}
        onPointerUp={() => setArrastando(null)}
        onPointerLeave={() => setArrastando(null)}
      >
        <img src={dataUrl} alt="Foto para rastreio postural" className="block w-full" draggable={false} />

        {/* Linhas do esqueleto */}
        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
          {CONEXOES.map(([a, b]) => {
            const pa = posDe(a);
            const pb = posDe(b);
            if (!pa || !pb || pa.score < 0.2 || pb.score < 0.2) return null;
            return (
              <line
                key={`${a}-${b}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={cor}
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                opacity={0.85}
              />
            );
          })}
        </svg>

        {/* Pontos arrastáveis */}
        {marcos.map((k) =>
          k.score < 0.2 ? null : (
            <button
              key={k.nome}
              aria-label={`Ajustar ponto ${k.nome}`}
              onPointerDown={(e) => {
                e.preventDefault();
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                setArrastando(k.nome);
              }}
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white shadow active:cursor-grabbing"
              style={{
                left: `${k.x * 100}%`,
                top: `${k.y * 100}%`,
                background: k.score < LIMIARES.confiancaMin ? "var(--cta)" : cor,
              }}
            />
          ),
        )}
      </div>

      <p className="text-center text-[11px] text-ink-3">
        Arraste os pontos para corrigir onde o modelo errou. Pontos em laranja têm baixa confiança.
      </p>

      {/* Medidas calculadas */}
      {/* Rotulo+valor colados a esquerda; a classificacao vai para a direita
          com ml-auto, sem o justify-between que espalhava os tres. */}
      <div className="space-y-1">
        {medidas.map((med) => (
          <div key={med.checkpointId} className="flex items-center gap-2 rounded-md bg-surface-soft px-2.5 py-1.5 text-xs">
            <span className="font-semibold text-ink">{med.rotulo}</span>
            <span className="text-ink-3">{med.valor}</span>
            <span className={med.baixaConfianca ? "ml-auto text-cta" : "ml-auto font-semibold text-ink-2"}>
              {med.baixaConfianca ? "ajuste manual" : med.classificacao}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
