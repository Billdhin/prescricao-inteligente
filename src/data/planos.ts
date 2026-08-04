/**
 * PREÇO: FONTE ÚNICA.
 *
 * Antes deste arquivo o produto anunciava TRÊS preços diferentes ao mesmo tempo:
 *
 *   - Landing: duas faixas, "Essencial" R$ 59 e "Profissional" R$ 97
 *   - /pricing: "um plano, tudo liberado" por R$ 59
 *   - /roi: a calculadora de retorno usava `PRECO_PRO = 59`
 *
 * O visitante que passasse pelas três telas via o mesmo produto por dois valores e
 * com dois desenhos de oferta incompatíveis (faixa dupla contra plano único). Pior:
 * a faixa "Essencial" prometia "até 20 alunos ativos", um limite que NÃO EXISTE no
 * código, ou seja, uma restrição vendida que o sistema não aplica.
 *
 * Agora as três telas leem daqui. Mudar de preço é mudar UM número neste arquivo.
 *
 * Os valores abaixo seguem a decisão de lançamento já tomada: tabela mensal de
 * R$ 97 e oferta anual de fundador a R$ 590, limitada às primeiras 30 contas.
 * Se a decisão mudar, mude aqui e mais nada.
 */

/** Preço de tabela do plano único, por mês, em reais. */
export const PRECO_MENSAL = 97;

/** Oferta anual de fundador, valor cheio do ano em reais. */
export const PRECO_ANUAL_FUNDADOR = 590;

/** Quantas contas a oferta de fundador aceita. Zero desliga a oferta nas telas. */
export const VAGAS_FUNDADOR = 30;

/** Nome do plano, usado em todas as telas para não divergir de novo. */
export const NOME_PLANO = "Profissional";

/** Equivalente mensal da oferta anual, arredondado, só para exibição. */
export const PRECO_ANUAL_EQUIV_MES = Math.round(PRECO_ANUAL_FUNDADOR / 12);

export const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * O que está incluído. Lista ÚNICA, porque o plano é único: qualquer item aqui
 * está liberado para todo assinante. Não acrescente item que o produto não faz.
 */
export const ITENS_PLANO = [
  "Alunos ilimitados",
  "Ciclo do cuidado completo e semáforo diário",
  "Motor de prescrição com justificativa e referência",
  "Periodização com progressão semana a semana",
  "App do aluno e lembretes de reavaliação",
  "Avaliação postural por visão computacional",
  "Estudar, Protocolos e Laboratório Visual",
  "Exportação de prescrição, plano e prontuário em PDF",
];
