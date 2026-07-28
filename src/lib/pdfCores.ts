/**
 * PALETA DO PAPEL — fonte única de cor dos geradores de documento (PDF).
 *
 * O documento é montado como HTML numa janela nova: não existe ali o `data-theme`
 * do app nem as variáveis CSS do design system, então toda cor precisa entrar
 * literal. Enquanto cada gerador carregava a própria lista de hexes, a identidade
 * da tela e a do papel andavam separadas: bastava a tela trocar de paleta para o
 * documento continuar na cor antiga sem ninguém perceber.
 *
 * Por isso a cor aqui é DERIVADA da paleta "Rota" (a identidade do produto) pelo
 * mesmo `tokensDe()` que alimenta a tela, e não copiada à mão. Sempre no modo
 * CLARO: papel é papel, e o documento não segue o modo escuro que o profissional
 * escolheu para a tela.
 *
 * Vive em arquivo próprio, e não dentro de `pdfCabecalho.ts`, porque o cabeçalho
 * é a ANATOMIA de um bloco (HTML + CSS) e é ele mesmo um consumidor destas cores;
 * documentos que nem desenham cabeçalho (o gráfico do plano, as tabelas) também
 * precisam da paleta e não deveriam importar o cabeçalho para isso.
 */
import { PALETA_ROTA, tokensDe } from "@/lib/theme/palettes";

/** Tokens da identidade no modo claro. Chave = mesmo nome da variável CSS da tela. */
const T = tokensDe(PALETA_ROTA, false);

export const CORES_PDF = {
  /** acento da marca. É o fallback quando o profissional não tem marca própria. */
  marca: T.primary,
  /**
   * fim da régua da marca no padrão. A régua do cabeçalho é o `gradient-brand` da
   * tela (azul da marca → turquesa da marca), então as duas pontas saem dos dois
   * tokens fixos do logo, que não seguem a paleta escolhida.
   */
  marcaGradFim: T["brand-turquesa"],
  /** o que se escreve POR CIMA da marca (número em disco, chip cheio). */
  sobreMarca: T["on-primary"],
  /** lavada da marca: fundo de tag/chip que precisa da matiz sem virar bloco. */
  marcaTint: T["primary-tint"],

  /** texto principal do documento, e o filete grosso da linha de assinatura. */
  ink: T.ink,
  /**
   * texto secundário: legenda, meta, nota de rodapé, rótulo de tabela. O papel
   * tinha DOIS cinzas fracos (#64748b e #94a3b8) e o mais claro não passava AA
   * nem na tela; os dois viraram este, que é o cinza de texto da identidade.
   */
  ink2: T["ink-2"],
  /**
   * cinza DECORATIVO (o `ink-4` da paleta): filete de campo para preencher à mão,
   * traço de ícone, régua. Nunca texto: como texto ele reprova AA, e é essa a
   * regra que o guardrail token-nao-textual protege na tela.
   */
  traco: T["ink-4"],

  /** moldura: borda de tabela, de cartão, de quadro e filete de seção. */
  borda: T.border,
  /**
   * filete INTERNO de tabela (separador de linha), um degrau mais fraco que a
   * moldura. Não existe token de "linha de tabela" na tela porque lá isso é
   * `border` com alpha, que no papel não temos; o quarto degrau de superfície
   * (`surface-mute`) é exatamente esse tom.
   */
  linha: T["surface-mute"],
  /** fundo de bloco em destaque: faixa do aluno, cabeçalho de tabela, fecho. */
  papelSuave: T["surface-soft"],

  /** acento de análise (Motor RCD, prontuário): turquesa escuro, legível como texto. */
  analise: T["analysis-text"],
  /** lavada do turquesa: fundo do carimbo do motor. */
  analiseTint: T["analysis-tint"],
  /**
   * turquesa VIVO da marca. É preenchimento e contorno, nunca texto (2,52:1);
   * no papel entra só na borda do carimbo do motor.
   */
  analiseFill: T["analysis-fill"],

  /** semáforo e deltas: liberado / atenção / não liberado. */
  sucesso: T.success,
  sucessoTint: T["success-tint"],
  alerta: T.warning,
  alertaTint: T["warning-tint"],
  perigo: T.danger,
  perigoTint: T["danger-tint"],

  /** série de intensidade do gráfico de progressão (mesma cor de dado da tela). */
  intensidade: T["data-intensidade"],
} as const;
