import { cn, withBase } from "@/lib/utils";
import { useBrand, iniciaisDaMarca } from "@/lib/brand/BrandContext";

/** Marca do Mapa da Prescrição: o pino de mapa com a rota de 3 nós, a arte
 *  ESCOLHIDA pelo Filipe (24/07/2026) entre as geradas no Lovable, tratada
 *  (fundo transparente + recorte) em /brand/marca-pino.webp. Fundo
 *  transparente: funciona em claro e escuro. */
export function MarcaPino({ className }: { className?: string }) {
  return (
    <img
      src={withBase("/brand/marca-pino.webp")}
      alt=""
      aria-hidden="true"
      className={cn("object-contain", className)}
    />
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
      {showWord && (
        <span className="whitespace-nowrap font-display text-[17px] font-bold leading-none text-ink">
          Mapa da <span className="text-primary">Prescrição</span>
        </span>
      )}
    </div>
  );
}
