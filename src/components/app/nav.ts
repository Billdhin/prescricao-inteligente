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
  Scale,
  Search,
  LifeBuoy,
  Settings,
} from "lucide-react";

// Filho de um item: aparece indentado sob o pai no menu "Mais" e na busca (nunca
// na barra superior, que só carrega os primários). `acao: true` marca link de
// AÇÃO (ex.: Cadastrar aluno): abre algo, não "é um lugar", então nunca acende
// como ativo (o pathname /alunos acenderia pai e filho juntos e mentiria a
// localização).
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
  // Uma linha dizendo o que se faz ali. O Design System pede descrição de uma
  // linha em TODA opção clicável; é o que o menu "Mais" mostra sob o rótulo.
  hint?: string;
  children?: NavChild[];
};

export type NavSection = { label?: string; items: NavItem[]; collapsible?: boolean };

/**
 * OS 5 DESTINOS DO DIA, na ordem do ciclo do cuidado: abrir o dia, carteira de
 * alunos, avaliar, prescrever, liberar. Todo rótulo diz O QUE SE FAZ ali, na
 * língua do personal, nada de substantivo solto.
 *
 * Esta é a lista que aparece na barra superior (desktop) E na barra inferior
 * (mobile): `BOTTOM` é a MESMA referência, de propósito. Antes eram duas listas
 * paralelas que já tinham divergido (o /gps era filho de um lado e tinha `match`
 * próprio do outro), e nada obrigava as duas a concordar.
 */
export const PRIMARIOS: NavItem[] = [
  {
    to: "/dashboard",
    label: "Meu dia",
    icon: Sunrise,
    short: "Meu dia",
    hint: "O que precisa de você hoje.",
  },
  {
    to: "/alunos",
    label: "Meus alunos",
    icon: Users,
    short: "Alunos",
    hint: "Sua carteira e o próximo passo de cada um.",
    children: [{ to: "/alunos?novo=1", label: "Cadastrar aluno", icon: UserPlus, acao: true }],
  },
  {
    to: "/assessments",
    label: "Avaliar e reavaliar",
    icon: ClipboardCheck,
    short: "Avaliar",
    hint: "Medidas, postura e quem já venceu o prazo.",
  },
  {
    to: "/prescrever-treino",
    label: "Prescrever treino",
    icon: CalendarRange,
    short: "Treinos",
    // A aba acende também no Treino do dia (/gps), que é a visão diária do mesmo
    // treino: em /gps o usuário continua "em Prescrever treino".
    match: ["/gps"],
    hint: "Periodização do ciclo e o treino de hoje.",
    children: [{ to: "/gps", label: "Treino do dia", icon: Dumbbell }],
  },
  {
    to: "/semaforo",
    label: "Fazer o semáforo do dia",
    icon: ShieldCheck,
    short: "Semáforo",
    hint: "Liberar, ajustar ou segurar o treino de hoje.",
  },
];

/**
 * O MENU "MAIS": os 8 destinos de referência e de conta. Não são rotina diária,
 * e por isso saíram da linha de frente; nenhum deles sumiu.
 *
 * O Comparador virou item de primeira classe (antes acendia como "Laboratório
 * Visual" por um `match`, o que fazia o menu apontar um lugar e a tela mostrar
 * outro). Tutoriais e Suporte viraram uma porta só, "Ajuda": a página de
 * tutoriais já leva ao suporte em dois pontos, e dois itens para o mesmo pedido
 * ("me ajuda") é escolha sem conteúdo.
 */
export const MAIS: NavItem[] = [
  {
    to: "/aprender",
    label: "Estudar",
    icon: GraduationCap,
    match: ["/aprender", "/tracks"],
    short: "Estudar",
    hint: "Disciplinas, casos e o mapa do conhecimento.",
  },
  {
    to: "/movement-lab",
    label: "Laboratório Visual",
    icon: FlaskConical,
    hint: "Execução, músculos e erros de cada exercício.",
  },
  {
    to: "/comparador",
    label: "Comparador",
    icon: Scale,
    hint: "Dois exercícios lado a lado, com a evidência.",
  },
  {
    to: "/special-groups",
    label: "Grupos Especiais",
    icon: HeartPulse,
    hint: "O que muda na prescrição de cada condição.",
  },
  {
    to: "/protocols",
    label: "Protocolos",
    icon: ClipboardList,
    hint: "Rotinas prontas com respaldo para adaptar.",
  },
  {
    to: "/consultar",
    label: "Consultar",
    icon: Search,
    match: ["/consultar", "/library"],
    hint: "Glossário e resposta rápida na hora da dúvida.",
  },
  {
    to: "/tutorial",
    label: "Ajuda",
    icon: LifeBuoy,
    match: ["/tutorial", "/suporte"],
    hint: "Passo a passo do sistema e fale com a gente.",
  },
  {
    to: "/account",
    label: "Configurações",
    icon: Settings,
    hint: "Sua marca, seu perfil e o acesso.",
  },
];

/**
 * NAV é DERIVADO: existe para as superfícies que precisam do menu agrupado (a
 * busca global e o check:menu), sem virar uma terceira lista para dessincronizar.
 */
export const NAV: NavSection[] = [
  { label: "Dia a dia", items: PRIMARIOS },
  { label: "Mais", items: MAIS },
];

/** Barra inferior do mobile: os MESMOS 5 primários, por identidade referencial. */
export const BOTTOM: NavItem[] = PRIMARIOS;

/** Rota de um filho não-ação está ativa? (filho de ação nunca conta como lugar.) */
export function filhoAtivo(item: NavItem, pathname: string): boolean {
  return item.children?.some((c) => !c.acao && (pathname === c.to || pathname.startsWith(c.to + "/"))) ?? false;
}

/**
 * O predicado ÚNICO de "este item é o lugar onde estou". Antes cada superfície
 * (rail, drawer, barra inferior) recalculava isso do seu jeito e as três já
 * discordavam em /gps. Regra: rota exata, prefixo de segmento, um dos `match`
 * declarados, ou a rota de um filho de verdade.
 */
export function itemAtivo(item: NavItem, pathname: string): boolean {
  return (
    pathname === item.to ||
    pathname.startsWith(item.to + "/") ||
    (item.match?.some((p) => pathname === p || pathname.startsWith(p + "/")) ?? false) ||
    filhoAtivo(item, pathname)
  );
}
