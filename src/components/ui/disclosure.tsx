import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------- Tabs --------------------------------- */

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function Tabs({ items, initial }: { items: TabItem[]; initial?: string }) {
  const [active, setActive] = React.useState(initial ?? items[0]?.id);
  const current = items.find((i) => i.id === active) ?? items[0];
  return (
    <div>
      <div
        role="tablist"
        aria-label="Seções do exercício"
        className="flex flex-wrap gap-1 rounded-control bg-surface-soft p-1"
      >
        {items.map((it) => {
          const selected = it.id === active;
          return (
            <button
              key={it.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(it.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                selected ? "bg-surface text-primary shadow-soft" : "text-ink-2 hover:text-ink",
              )}
            >
              {it.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-5">
        {current?.content}
      </div>
    </div>
  );
}

/* ------------------------------- Accordion ------------------------------- */

export interface AccordionItemData {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [open, setOpen] = React.useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const isOpen = open.has(it.id);
        return (
          <div key={it.id} className="overflow-hidden rounded-xl border border-border bg-surface">
            <button
              onClick={() => toggle(it.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-analysis" />
                <span className="font-semibold text-ink">{it.title}</span>
              </span>
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 text-ink-3 transition-transform", isOpen && "rotate-180")}
              />
            </button>
            {isOpen && <div className="px-4 pb-4">{it.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
