/**
 * PREÇO: FONTE ÚNICA.
 *
 * Antes deste arquivo o produto anunciava TRÊS preços diferentes ao mesmo tempo (R$ 59 na
 * landing e na /roi, R$ 59 na /pricing como "plano único", R$ 97 na landing), e uma faixa
 * "Essencial" que vendia um teto de 20 alunos que o código nunca aplicou. As três telas
 * leem daqui desde então, e `check:legal` reprova preço literal escrito fora deste arquivo.
 *
 * A estrutura de três faixas e os valores abaixo vêm do protótipo comercial aprovado pelo
 * Filipe (`docs/nova-landing-mapa-da-prescricao.html`). Mudar de preço é mudar aqui.
 */

/** Preço de TABELA do plano individual, por mês. É o valor riscado ao lado da oferta. */
export const PRECO_TABELA = 129;

/** Preço praticado do plano individual, por mês. */
export const PRECO_MENSAL = 97;

/** Plano individual pago de uma vez, no ano. */
export const PRECO_ANUAL = 1164;

/** Quanto o anual economiza contra doze meses da TABELA, no ano. */
export const ECONOMIA_ANUAL = PRECO_TABELA * 12 - PRECO_ANUAL;

/** Preço por profissional, por mês, na faixa de equipe. */
export const PRECO_ESTUDIO = 89;

/** Quantos profissionais a faixa de equipe exige, no mínimo. */
export const MIN_ESTUDIO = 3;

/** Nome do plano individual, usado em todas as telas para não divergir de novo. */
export const NOME_PLANO = "Profissional";

export const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * O que está incluído no plano individual. Não acrescente item que o produto não faz:
 * esta lista é lida pela landing E pela /pricing, então um item inventado aqui vira
 * promessa em duas telas de uma vez.
 */
export const ITENS_PLANO = [
  "Alunos ilimitados",
  "Ciclo do cuidado completo e semáforo diário",
  "Motor de prescrição com justificativa e referência",
  "Prontuário de decisão técnica assinável",
  "Periodização com progressão semana a semana",
  "App do aluno com a sua marca",
  "Avaliação postural por visão computacional",
  "Exportação de tudo em PDF",
];

/** O que a faixa de equipe acrescenta ao plano individual. */
export const ITENS_ESTUDIO = [
  `Tudo do ${NOME_PLANO}`,
  "Painel do responsável técnico",
  "Prontuário consolidado da equipe",
  "Transferência de aluno entre profissionais",
];

/** O que a faixa institucional oferece. Preço sob consulta, de propósito. */
export const ITENS_INSTITUCIONAL = [
  "Acesso gratuito ao aluno de bacharelado",
  "50% de desconto no primeiro ano após a formatura",
  "Painel do coordenador",
  "Contrato institucional",
];
