import * as React from "react";
import { Settings, Crown, Check, ShieldAlert, Sparkles } from "lucide-react";
import { Card, Pill, Button, SectionHeader } from "@/components/ui/primitives";
import { useUser, planLabel, isPremiumUnlocked, type Plan } from "@/lib/store";
import { cn } from "@/lib/utils";

const planos: { value: Plan; label: string; desc: string }[] = [
  { value: "free", label: "Free", desc: "Acesso parcial, com limites." },
  { value: "assinante", label: "Profissional", desc: "Acesso completo à plataforma." },
  { value: "admin", label: "Admin", desc: "Acesso total (uso interno)." },
];

export function Account() {
  const { name, plan, cref, setPlan, setName, setCref } = useUser();
  const [confirmReset, setConfirmReset] = React.useState(false);
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  const zerar = () => {
    ["pi-progress", "pi-favorites", "pi-gps", "pi-ativacao", "pi-passos-ocultos", "pi-notif-seen"].forEach(
      (k) => localStorage.removeItem(k),
    );
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionHeader
        eyebrow="Conta"
        icon={<Settings className="h-3 w-3" />}
        title="Configurações"
        subtitle="Perfil, plano e preferências desta demonstração."
      />

      {/* Perfil */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full gradient-brand text-lg font-bold text-white">
            {initials}
          </span>
          <div>
            <div className="font-display text-lg font-bold text-ink">{name}</div>
            <div className="mt-1 flex items-center gap-2">
              <Pill tone={isPremiumUnlocked(plan) ? "success" : "neutral"} icon={<Crown className="h-3 w-3" />}>
                {planLabel[plan]}
              </Pill>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Nome profissional</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Como aparecerá nos documentos"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">CREF</span>
            <input
              value={cref}
              onChange={(e) => setCref(e.target.value)}
              className="input"
              placeholder="ex.: 012345-G/SP"
            />
            <span className="mt-1 block text-xs text-ink-3">
              Aparece no cabeçalho e no bloco de assinatura do Prontuário de Decisão.
            </span>
          </label>
        </div>
      </Card>

      {/* Plano (dev toggle) */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-bold text-ink">Plano</h3>
        <p className="mb-4 text-sm text-ink-2">
          Nesta demonstração não há cobrança; alterne o plano para testar os limites e o gating.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {planos.map((p) => {
            const active = plan === p.value;
            return (
              <button
                key={p.value}
                onClick={() => setPlan(p.value)}
                className={cn(
                  "rounded-card border p-4 text-left transition-colors",
                  active ? "border-primary bg-primary-tint" : "border-border bg-surface hover:bg-surface-soft",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{p.label}</span>
                  {active && <Check className="h-4 w-4 text-primary" />}
                </div>
                <p className="mt-1 text-xs text-ink-2">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Preferências */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-bold text-ink">Preferências</h3>
        <div className="mt-3 flex items-start gap-3 rounded-xl bg-surface-soft p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-sm text-ink-2">
            <span className="font-semibold text-ink">Movimento reduzido:</span> a plataforma respeita
            a configuração de “reduzir animações” do seu sistema operacional automaticamente
            (prefers-reduced-motion).
          </div>
        </div>
      </Card>

      {/* Zona de risco */}
      <Card className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-cta" />
          <h3 className="font-display text-lg font-bold text-ink">Zerar progresso local</h3>
        </div>
        <p className="mb-4 text-sm text-ink-2">
          Remove XP, favoritos, casos resolvidos, o contador do Prescrever e o passo a passo do painel deste navegador. Não afeta o
          plano selecionado.
        </p>
        {confirmReset ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={zerar} className="!bg-cta !bg-none">
              Confirmar e zerar
            </Button>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            Zerar progresso
          </Button>
        )}
      </Card>
    </div>
  );
}
