# Molde de um arquivo de disciplina

Copie o bloco abaixo para `src/features/learning/mocks/<slug>.ts`, troque `SLUG`/ids e
preencha as aulas. Depois registre em `mocks/index.ts` e ajuste `disciplines.ts`. Nada de
travessão; nada de número ou referência sem fonte. Leia o [PLAYBOOK](./PLAYBOOK.md) antes.

```ts
import { deepLesson, deepModule, q } from "./authoring";
import type { Module, Lesson } from "../types";

const DISC = "SLUG"; // = disciplines.ts slug, ex.: "treinamento-de-forca"
const K = "NOME CURTO DA DISCIPLINA"; // kicker editorial, ex.: "TREINAMENTO DE FORÇA"

// Referências reais desta disciplina. Adicione as entradas em mocks/references.ts
// (validationStatus "validada" só após conferir no PubMed). Aqui vão só os ids.
const REF_BASE = ["ref-...", "ref-..."];

/* ------------------------------- Aula 1 ------------------------------- */
const aula1 = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-MODULO`,
  moduleSlug: "MODULO",
  slug: `${DISC}--SLUG-DA-AULA`,
  title: "Título que promete uma resposta, não um tema",
  subtitle: "Uma linha de contexto",
  description: "Frase que diz o que o profissional sai sabendo fazer.",
  level: "intermediario", // "iniciante" | "intermediario" | "avancado"
  minutes: 12,
  type: "mecanismo", // ver LessonType em types.ts
  kicker: K,
  tags: ["...", "..."],
  hero: "Por que isto importa para a decisão de treino.",
  question: "A pergunta de prescrição real que esta aula responde.",
  concepts: [
    { term: "Conceito-chave", definition: "Definição precisa e aplicada." },
  ],
  // Figura opcional: id de figures/scientific.tsx (SVG registrada OU webp integrada).
  figure: { id: "ID-DA-FIGURA" },
  // Mecanismo. Para virar prancha de atlas, cada passo segue o padrão do manual:
  // "descrição. Sequência: (1) ...; (2) ...; (3) ...; (4) .... Relação: .... Aplicação ao
  // exercício: .... Como medir: .... Erro frequente: ...."
  mechanism: {
    title: "Entenda o mecanismo",
    steps: [
      { label: "Núcleo 1", detail: "..." },
    ],
  },
  apply: "O que muda na prescrição por causa disto.",
  specialTitle: "Medida e interpretação",
  special: [
    "A variável X representa Y. Limite: onde ela cala.",
  ],
  mistake: {
    mistake: "O erro comum, dito sem culpar.",
    instead: "O que fazer no lugar, e por quê.",
  },
  professionalCase: {
    prompt: "Um aluno real, uma decisão a tomar.",
    choices: [
      { id: "c1", label: "Conduta A", tone: "recomendada", feedback: "Por que é coerente." },
      { id: "c2", label: "Conduta B", tone: "aceitavel", feedback: "Quando serve." },
      { id: "c3", label: "Conduta C", tone: "cautela", feedback: "Por que segurar." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Enunciado?", [
      { id: "a", label: "Correta" },
      { id: "b", label: "Distratora" },
    ], "a", "Comentário que ensina, não só corrige."),
  ],
  uncertainty: "O que ainda é incerto, e o limite da atuação do profissional.",
  related: [
    { title: "Aula relacionada", href: `/aprender/conteudos/${DISC}--OUTRA`, type: "conceito" },
  ],
  refs: [...REF_BASE],
  applyRx: "Resumo de bolso para aplicar no atendimento.",
});

/* ------------------------------- Módulos ------------------------------ */
export const SLUGModules: Module[] = [
  deepModule({
    id: `m-${DISC}-MODULO`,
    disciplineId: "d-XXX", // = disciplines.ts id
    slug: "MODULO",
    title: "Título do módulo",
    objective: "O que o módulo entrega.",
    order: 1,
    level: "intermediario",
    lessons: [aula1],
  }),
];

export const SLUGLessons: Lesson[] = [aula1];
```

## Registrar

1. Em `mocks/index.ts`, importe `SLUGModules`/`SLUGLessons` e some nos spreads de
   `curriculoModules`/`curriculoLessons` (ou no agregador correspondente).
2. Em `disciplines.ts`, atualize a disciplina: `status`, `moduleCount`, `lessonCount`,
   `caseCount`, `reviewedAt`, `reviewedBy`.
3. Rode `npx tsc --noEmit`, `npm run check:aprender`, `npm run check:nucleos`.
