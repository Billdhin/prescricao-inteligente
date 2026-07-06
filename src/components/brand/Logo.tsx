import { cn } from "@/lib/utils";

export function Logo({ showWord = true, className }: { showWord?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl gradient-brand font-display text-sm font-bold text-white">
        PI
      </div>
      {showWord && (
        <span className="font-display text-[17px] font-bold leading-none text-ink">
          Prescrição <span className="text-primary">Inteligente</span>
        </span>
      )}
    </div>
  );
}
