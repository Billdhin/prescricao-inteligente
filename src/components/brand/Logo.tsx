import { cn } from "@/lib/utils";
import { useBrand, iniciaisDaMarca } from "@/lib/brand/BrandContext";

/** Marca do Mapa da Prescrição: pino de mapa cujo interior guarda a rota de 3
 *  nós (opção escolhida pelo Filipe em 24/07/2026, vetorizada do conceito
 *  aprovado). Azul da marca + teal da análise; funciona em claro e escuro. */
export function MarcaPino({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <path
        d="M32 3C18.7 3 8 13.7 8 27c0 10.3 6.8 18.6 16.2 26.4L32 61l7.8-7.6C49.2 45.6 56 37.3 56 27 56 13.7 45.3 3 32 3Z"
        fill="#2563eb"
      />
      <circle cx="32" cy="27" r="15.5" fill="#ffffff" />
      <path
        d="M38 20v5.5L27 31.5V38"
        fill="none"
        stroke="#14b8c4"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="38" cy="20" r="3.4" fill="#14b8c4" />
      <circle cx="32.5" cy="28.5" r="3.4" fill="#14b8c4" />
      <circle cx="27" cy="38" r="3.4" fill="#14b8c4" />
    </svg>
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
