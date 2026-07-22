import { ProfessionalDashboard } from "@/pages/ProfessionalDashboard";

/**
 * "Hoje": o painel do profissional. Com a navegação única (sem os dois modos),
 * este é sempre o painel de trabalho; o estudo vive em /aprender.
 */
export function Dashboard() {
  return <ProfessionalDashboard />;
}
