import { useMode } from "@/lib/store";
import { ProfessionalDashboard } from "@/pages/ProfessionalDashboard";
import { LearningDashboard } from "@/pages/LearningDashboard";

/** Painel único: modo "atender" → profissional; modo "aprender" → estudo/gamificação. */
export function Dashboard() {
  const mode = useMode((s) => s.mode);
  return mode === "atender" ? <ProfessionalDashboard /> : <LearningDashboard />;
}
