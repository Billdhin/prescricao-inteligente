import type * as React from "react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  ShieldCheck,
  CalendarRange,
  Navigation,
  GraduationCap,
  HeartPulse,
  ClipboardList,
  FlaskConical,
  Search,
  HelpCircle,
  LifeBuoy,
  Settings,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  // Prefixos extra que também acendem este item (ex.: "Estudar" acende nas
  // rotas irmãs de trilhas e mapa, que são abas da mesma porta).
  match?: string[];
  // Rótulo curto para a barra inferior do mobile (onde o espaço é apertado).
  short?: string;
};

// collapsible: o grupo pode ser comprimido/expandido pelo usuário. O header do
// grupo vira botão com chevron e o estado (aberto/fechado) persiste em useUI.
// Fonte única da verdade da navegação: a busca global DERIVA daqui (nada de
// lista paralela para dessincronizar).
export type NavSection = { label?: string; items: NavItem[]; collapsible?: boolean };

// UMA navegação, agrupada pelas FASES DO DIA (não por categoria de software).
// "Dia a dia" primeiro (o que se toca toda hora, com Avaliações que é início do
// trilho, não ferramenta); "Prescrever" com o treino (o principal) antes do
// exercício (a exceção diária); "Estudar e referência" e "Ajuda e conta"
// nascem comprimidos (referência, não rotina) e abrem sob demanda.
export const NAV: NavSection[] = [
  {
    label: "Dia a dia",
    items: [
      { to: "/dashboard", label: "Hoje", icon: LayoutDashboard, short: "Hoje" },
      { to: "/alunos", label: "Alunos", icon: Users, short: "Alunos" },
      { to: "/assessments", label: "Avaliações", icon: BarChart3, short: "Avaliar" },
      { to: "/semaforo", label: "Semáforo", icon: ShieldCheck, short: "Semáforo" },
    ],
  },
  {
    label: "Prescrever",
    items: [
      { to: "/prescrever-treino", label: "Prescrever treino", icon: CalendarRange, short: "Treino" },
      { to: "/gps", label: "Prescrever exercício", icon: Navigation, short: "Exercício" },
    ],
  },
  {
    label: "Estudar e referência",
    collapsible: true,
    items: [
      { to: "/aprender", label: "Estudar", icon: GraduationCap, match: ["/aprender", "/tracks"], short: "Estudar" },
      { to: "/special-groups", label: "Grupos Especiais", icon: HeartPulse },
      { to: "/protocols", label: "Protocolos", icon: ClipboardList },
      { to: "/movement-lab", label: "Laboratório Visual", icon: FlaskConical, match: ["/movement-lab", "/comparador"] },
      { to: "/consultar", label: "Consultar", icon: Search, match: ["/consultar", "/library"] },
    ],
  },
  {
    label: "Ajuda e conta",
    collapsible: true,
    items: [
      { to: "/tutorial", label: "Tutoriais", icon: HelpCircle },
      { to: "/suporte", label: "Suporte", icon: LifeBuoy },
      { to: "/account", label: "Configurações", icon: Settings },
    ],
  },
];

// Barra inferior do mobile: os destinos mais tocados no dia. Avaliações (início
// do trilho) entra com o rótulo curto "Avaliar"; /gps (a exceção diária) SAI
// daqui e vive na sidebar mobile e no contexto do aluno. 6 itens cabem a partir
// de 390px (cada aba ~65px, rótulos curtos sem truncar).
export const BOTTOM: NavItem[] = [
  { to: "/dashboard", label: "Hoje", icon: LayoutDashboard, short: "Hoje" },
  { to: "/alunos", label: "Alunos", icon: Users, short: "Alunos" },
  { to: "/assessments", label: "Avaliações", icon: BarChart3, short: "Avaliar" },
  { to: "/prescrever-treino", label: "Prescrever treino", icon: CalendarRange, short: "Treino" },
  { to: "/semaforo", label: "Semáforo", icon: ShieldCheck, short: "Semáforo" },
  { to: "/aprender", label: "Estudar", icon: GraduationCap, match: ["/aprender", "/tracks"], short: "Estudar" },
];
