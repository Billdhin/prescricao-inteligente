import { Navigate } from "react-router-dom";
import { useMode } from "@/lib/store";
import { ProfessionalDashboard } from "@/pages/ProfessionalDashboard";

/**
 * Painel. No modo atender é o painel profissional. No modo aprender existe uma
 * home única (/aprender), então aqui redirecionamos para ela em vez de manter
 * uma segunda tela inicial de estudo.
 */
export function Dashboard() {
  const mode = useMode((s) => s.mode);
  if (mode === "aprender") return <Navigate to="/aprender" replace />;
  return <ProfessionalDashboard />;
}
