import {
  UserPlus,
  Navigation,
  HeartPulse,
  FlaskConical,
  BookOpen,
  Repeat2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { SceneId } from "@/components/tutorial/TutorialScene";
import type { AppMode } from "@/lib/store";

export interface TutorialStep {
  titulo: string;
  descricao: string;
  scene: SceneId;
  navLabel?: string;
  cta?: { label: string; to: string };
}

export interface Tutorial {
  slug: string;
  titulo: string;
  resumo: string;
  icon: LucideIcon;
  duracao: string;
  nivel: "Básico" | "Intermediário";
  modo: AppMode | "ambos";
  steps: TutorialStep[];
}

export const tutorials: Tutorial[] = [
  {
    slug: "semaforo-ao-prontuario",
    titulo: "Do semáforo ao prontuário assinado",
    resumo: "O fluxo completo do Motor RCD: liberar a sessão, decidir documentado e assinar.",
    icon: ShieldCheck,
    duracao: "~4 min",
    nivel: "Básico",
    modo: "atender",
    steps: [
      {
        titulo: "Faça o Semáforo de Liberação",
        descricao:
          "Antes da sessão do aluno com condição especial, abra o Semáforo e responda o checklist de ~30 segundos: pressão do dia, sintomas, medicação. O resultado sai na hora (liberado, liberado com ajuste ou não liberado hoje), sempre com o porquê.",
        scene: "nav",
        navLabel: "Semáforo",
        cta: { label: "Abrir o Semáforo", to: "/semaforo" },
      },
      {
        titulo: "Registre a liberação",
        descricao:
          "Toque em “Registrar liberação”. O resultado entra no histórico do aluno e será anexado automaticamente ao prontuário da prescrição: é o seu rastro de diligência.",
        scene: "feedback",
      },
      {
        titulo: "Prescreva com o motor",
        descricao:
          "No Prescrever, o Motor RCD ranqueia os exercícios pelo perfil e pelos cuidados do grupo, e mostra também o que foi DESCARTADO e por quê.",
        scene: "recomendacao",
        cta: { label: "Ir para Prescrever", to: "/gps" },
      },
      {
        titulo: "Abra o prontuário da decisão",
        descricao:
          "Em “Ver prontuário desta decisão”, revise o raciocínio completo: escolhidos, descartados, semáforo do dia, parâmetros e referências numeradas.",
        scene: "abas",
      },
      {
        titulo: "Exporte e assine",
        descricao:
          "Salve no aluno e exporte o Prontuário de Decisão em PDF: ele sai com o seu nome, seu CREF, o ID do documento e o bloco de assinatura. É um registro que você pode assinar e arquivar.",
        scene: "pdf",
      },
    ],
  },
  {
    slug: "prescrever-para-aluno",
    titulo: "Prescreva para um aluno",
    resumo: "Do cadastro à prescrição justificada, pronta para entregar em PDF.",
    icon: Navigation,
    duracao: "~3 min",
    nivel: "Básico",
    modo: "atender",
    steps: [
      {
        titulo: "Cadastre o aluno",
        descricao:
          "Em Alunos, toque em “Novo aluno” e informe objetivo, nível, restrições e equipamentos. Esse perfil alimenta a decisão.",
        scene: "form",
        cta: { label: "Cadastrar aluno", to: "/alunos?novo=1" },
      },
      {
        titulo: "Abra o Prescrever",
        descricao:
          "No perfil do aluno, use “Prescrever”, ou abra Prescrever no menu e escolha o aluno em “Para quem?”. O perfil já vem pré-preenchido.",
        scene: "nav",
        navLabel: "Prescrever",
        cta: { label: "Ir para Prescrever", to: "/gps" },
      },
      {
        titulo: "Confirme o perfil (ou pule)",
        descricao:
          "Ajuste objetivo, músculo-alvo, nível e equipamentos, ou toque em “Pular para as recomendações” e vá direto ao resultado.",
        scene: "wizard",
      },
      {
        titulo: "Veja a recomendação e o porquê",
        descricao:
          "Você recebe os exercícios ranqueados por critérios transparentes. Toque em “Ver justificativa” para o raciocínio por trás de cada escolha.",
        scene: "recomendacao",
      },
      {
        titulo: "Salve ou exporte em PDF",
        descricao:
          "Salve a prescrição no perfil do aluno ou exporte um PDF com a sua marca (com os exercícios, séries sugeridas e a justificativa) para entregar ao aluno.",
        scene: "pdf",
      },
    ],
  },
  {
    slug: "cadastrar-avaliar-aluno",
    titulo: "Cadastre e avalie um aluno",
    resumo: "Registre medidas ao longo do tempo e acompanhe a evolução.",
    icon: UserPlus,
    duracao: "~2 min",
    nivel: "Básico",
    modo: "atender",
    steps: [
      {
        titulo: "Crie o aluno",
        descricao: "Em Alunos, use “Novo aluno”. Sem alunos ainda? Você pode “Carregar exemplos” para explorar.",
        scene: "form",
        cta: { label: "Ir para Alunos", to: "/alunos" },
      },
      {
        titulo: "Registre uma avaliação",
        descricao:
          "No perfil, toque em “Nova avaliação” e informe peso, % de gordura, dor e observações. Cada registro entra na linha do tempo.",
        scene: "avaliar",
      },
      {
        titulo: "Acompanhe a evolução",
        descricao:
          "O perfil mostra a evolução das medidas em gráfico, e “Avaliações” reúne as reavaliações pendentes de todos os alunos.",
        scene: "evolucao",
        cta: { label: "Ver Avaliações", to: "/assessments" },
      },
    ],
  },
  {
    slug: "conduzir-grupo-especial",
    titulo: "Conduza um grupo especial",
    resumo: "Prescreva por modalidades e fases para perfis como obesidade, hipertensão e dor.",
    icon: HeartPulse,
    duracao: "~2 min",
    nivel: "Intermediário",
    modo: "atender",
    steps: [
      {
        titulo: "Abra Grupos Especiais",
        descricao:
          "No menu (seção Referência), escolha o grupo que representa o perfil do aluno: cada um traz uma jornada em 4 fases.",
        scene: "nav",
        navLabel: "Grupos",
        cta: { label: "Ver Grupos Especiais", to: "/special-groups" },
      },
      {
        titulo: "Escolha a fase da jornada",
        descricao:
          "Cada fase mostra o foco, as modalidades indicadas, o que monitorar e os critérios para avançar. Comece pela fase adequada ao aluno.",
        scene: "jornada",
      },
      {
        titulo: "Prescreva pela jornada",
        descricao:
          "Toque em “Prescrever”: o contexto do grupo e da fase vai junto, e você recebe exercícios coerentes com a estratégia, com as cautelas em destaque.",
        scene: "recomendacao",
        cta: { label: "Abrir Prescrever", to: "/gps" },
      },
    ],
  },
  {
    slug: "laboratorio-visual",
    titulo: "Explore o Laboratório Visual",
    resumo: "Compare a execução real com a análise biomecânica sobre a foto.",
    icon: FlaskConical,
    duracao: "~2 min",
    nivel: "Básico",
    modo: "ambos",
    steps: [
      {
        titulo: "Abra um exercício",
        descricao: "No Laboratório Visual, escolha um exercício para ver a foto de execução e a análise.",
        scene: "nav",
        navLabel: "Laboratório",
        cta: { label: "Abrir Laboratório", to: "/movement-lab" },
      },
      {
        titulo: "Compare execução × análise",
        descricao:
          "Arraste o divisor para revelar a análise biomecânica sobre a mesma foto: músculo trabalhado, ângulo e linha de força. Funciona por mouse, toque e teclado.",
        scene: "slider",
      },
      {
        titulo: "Aprofunde nas abas",
        descricao:
          "Abaixo, as abas trazem biomecânica, fisiologia, erros comuns e prescrição prática: cada conceito em camadas, sob demanda.",
        scene: "abas",
      },
    ],
  },
  {
    slug: "casos-praticos",
    titulo: "Treine sua decisão com casos",
    resumo: "Decida em cenários reais e receba feedback do raciocínio.",
    icon: BookOpen,
    duracao: "~2 min",
    nivel: "Básico",
    modo: "aprender",
    steps: [
      {
        titulo: "Abra os Casos",
        descricao: "No modo Aprender, vá em Casos e escolha um cenário para resolver.",
        scene: "nav",
        navLabel: "Casos",
        cta: { label: "Ver Casos", to: "/aprender/casos" },
      },
      {
        titulo: "Decida no cenário",
        descricao: "Leia o contexto e escolha a alternativa que considera mais prudente. Confirme para revelar a análise.",
        scene: "caso",
      },
      {
        titulo: "Leia o feedback do raciocínio",
        descricao:
          "Você recebe por que a escolha funciona (ou não), o critério de decisão e o que lembrar. Não é só “certo ou errado”.",
        scene: "feedback",
      },
    ],
  },
  {
    slug: "atender-aprender",
    titulo: "Alterne entre Atender e Aprender",
    resumo: "Um app, dois modos: a ferramenta de trabalho e o estudo.",
    icon: Repeat2,
    duracao: "~1 min",
    nivel: "Básico",
    modo: "ambos",
    steps: [
      {
        titulo: "Use o seletor no topo",
        descricao:
          "No topo da barra lateral há um seletor Atender / Aprender. “Atender” é a ferramenta de trabalho; “Aprender” é o estudo com trilhas e casos.",
        scene: "modo",
      },
      {
        titulo: "A navegação muda com o modo",
        descricao:
          "Ao trocar, o menu e o painel se adaptam, mas sua rota atual é preservada quando faz sentido. Você pode alternar quando quiser.",
        scene: "nav",
        navLabel: "Painel",
      },
    ],
  },
];

export function getTutorial(slug: string) {
  return tutorials.find((t) => t.slug === slug);
}
