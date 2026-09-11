/**
 * O SEMÁFORO COMO ÍCONE: cápsula com três luzes, o desenho da barra inferior do protótipo.
 * O lucide não tem semáforo (só o cone de trânsito), e o escudo que ocupava o lugar dizia
 * "segurança" em vez de "liberar o treino de hoje". Mesma API dos ícones do lucide.
 */
export function IconeSemaforo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="7.5" y="2.5" width="9" height="19" rx="4.5" />
      <circle cx="12" cy="7.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
