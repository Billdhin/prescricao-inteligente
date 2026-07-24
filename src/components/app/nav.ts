import type * as React from "react";
import {
  Sunrise,
  Users,
  UserPlus,
  ClipboardCheck,
  ShieldCheck,
  CalendarRange,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  ClipboardList,
  FlaskConical,
  Search,
  HelpCircle,
  LifeBuoy,
  Settings,
} from "lucide-react";

// Filho de um item: aparece indentado sob o pai na sidebar/drawer (nunca no rail
// colapsado). `acao: true` marca link de AÇÃO (ex.: Cadastrar aluno): abre algo,
// não "é um lugar", então nunca acende como ativo (o pathname /alunos acenderia
// pai e filho juntos e mentiria a localização).
export type NavChild = {
  to: string; // pode conter query (ex.: /alunos?novo=1)
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  acao?: boolean;
};

export type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  // Prefixos extra que também acendem este item (ex.: "Estudar" acende nas
  // rotas irmãs de trilhas e mapa, que são abas da mesma porta).
  match?: string[];
  // Rótulo curto para a barra inferior do mobile (onde o espaço é apertado).
  short?: string;
  children?: NavChild[];
};

// collapsible: o grupo pode ser comprimido/expandido pelo usuário. O header do
// grupo vira botão com chevron e o estado (aberto/fechado) persiste em useUI
// POR LABEL: renomear o label de um grupo comprimível exige migrar o persist
// (ver comentário em store.ts), senão o estado órfã e o grupo abre expandido.
// Fonte única da verdade da navegação: a busca global DERIVA daqui (nada de
// lista paralela para dessincronizar).
export type NavSection = { label?: string; items: NavItem[]; collapsible?: boolean };

// UMA navegação, com o "Dia a dia" na ordem do ciclo do cuidado (abrir o dia,
// carteira de alunos, avaliar, prescrever, liberar) e todo rótulo dizendo O QUE
// SE FAZ ali, na língua do personal: nada de substantivo solto. O Treino do dia
// (/gps) vive DENTRO de Prescrever treino porque o exercício é a visão diária
// do treino. "Estudar e referência" e "Ajuda e conta" nascem comprimidos
// (referência, não rotina) e abrem sob demanda.
export const NAV: NavSection[] = [
  {
    label: "Dia a dia",
    items: [
      { to: "/dashboard", label: "Meu dia", icon: Sunrise, short: "Meu dia" },
      {
        to: "/alunos",
        label: "Meus alunos",
        icon: Users,
        short: "Alunos",
        children: [{ to: "/alunos?novo=1", label: "Cadastrar aluno", icon: UserPlus, acao: true }],
      },
      { to: "/assessments", label: "Avaliar e reavaliar", icon: ClipboardCheck, short: "Avaliar" },
      {
        to: "/prescrever-treino",
        label: "Prescrever treino",
        icon: CalendarRange,
        short: "Treino",
        children: [{ to: "/gps", label: "Treino do dia", icon: Dumbbell }],
      },
      { to: "/semaforo", label: "Fazer o semáforo do dia", icon: ShieldCheck, short: "Semáforo" },
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

// Barra inferior do mobile: os 5 destinos do dia, na mesma ordem do ciclo do
// cuidado. "Estudar" sai (referência, não rotina; segue no drawer). A aba
// "Treino" acende também no Treino do dia (/gps), que é a visão diária do
// treino. 5 abas de ~64px cabem a 320px; o maior rótulo ("Semáforo", 8 chars a
// 11px) entra sem truncar, e overflow de rótulo é bug visível de propósito.
export const BOTTOM: NavItem[] = [
  { to: "/dashboard", label: "Meu dia", icon: Sunrise, short: "Meu dia" },
  { to: "/alunos", label: "Meus alunos", icon: Users, short: "Alunos" },
  { to: "/assessments", label: "Avaliar e reavaliar", icon: ClipboardCheck, short: "Avaliar" },
  { to: "/prescrever-treino", label: "Prescrever treino", icon: CalendarRange, short: "Treino", match: ["/gps"] },
  { to: "/semaforo", label: "Fazer o semáforo do dia", icon: ShieldCheck, short: "Semáforo" },
];
