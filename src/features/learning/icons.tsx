import {
  PersonStanding,
  HeartPulse,
  FlaskConical,
  Scale,
  Brain,
  Activity,
  Ruler,
  Dumbbell,
  Wind,
  ClipboardCheck,
  Gauge,
  CalendarRange,
  Workflow,
  BookOpenCheck,
  MessagesSquare,
  ShieldCheck,
  Atom,
  GitCompare,
  Lightbulb,
  Stethoscope,
  Target,
  TrendingUp,
  HelpCircle,
  Move,
  StretchHorizontal,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

/**
 * Mapeia os nomes de ícone usados nos dados (string) para componentes lucide.
 * Nomes desconhecidos caem em BookOpen (fallback seguro, nunca quebra o build).
 */
const MAP: Record<string, LucideIcon> = {
  PersonStanding,
  HeartPulse,
  FlaskConical,
  Scale,
  Brain,
  Activity,
  ActivitySquare: Activity,
  Ruler,
  Dumbbell,
  Wind,
  ClipboardCheck,
  Gauge,
  CalendarRange,
  Workflow,
  BookOpenCheck,
  MessagesSquare,
  ShieldCheck,
  Atom,
  GitCompare,
  Lightbulb,
  Stethoscope,
  Target,
  TrendingUp,
  HelpCircle,
  CircleHelp: HelpCircle,
  Move3d: Move,
  StretchHorizontal,
};

export function iconByName(name?: string): LucideIcon {
  return (name && MAP[name]) || BookOpen;
}
