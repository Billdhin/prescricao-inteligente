import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, ScrollText } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, Pill } from "@/components/ui/primitives";
import { COBRANCA_ATIVA } from "@/data/planos";

/**
 * TERMOS DE USO E POLÍTICA DE PRIVACIDADE.
 *
 * ## Por que estes dois documentos existem
 *
 * O produto trata dado de SAÚDE de terceiros: o profissional cadastra o aluno dele e grava
 * condição clínica, medicação, pressão arterial, dor, medidas corporais e fotos do corpo. Pela
 * LGPD isso é dado pessoal SENSÍVEL (art. 5º, II) e exige base legal própria (art. 11). Até
 * aqui o produto coletava tudo isso sem dizer ao titular o que fazia com o dado, sem aceite no
 * cadastro e sem canal para o titular pedir acesso ou exclusão.
 *
 * ## O que estes textos são, e o que não são
 *
 * São a descrição HONESTA do que o sistema de fato faz hoje, escrita a partir do inventário
 * real: as tabelas de `supabase/migrations/`, o que `supabaseRepo.ts` grava e o que fica só no
 * navegador. Nenhuma promessa aqui é maior que o código.
 *
 * NÃO são parecer jurídico e não foram revisados por advogado. Antes de o produto cobrar do
 * primeiro cliente, um advogado precisa ler os dois, ajustar prazos, foro, hipóteses de
 * rescisão e limitação de responsabilidade, e confirmar o enquadramento de operador ou
 * controlador de cada parte. Os pontos que dependem de decisão do fundador estão marcados no
 * texto com "a definir", de propósito: melhor um espaço em branco visível que um número
 * inventado num documento que gera obrigação.
 *
 * ## Rodada de 11/08/2026: o que saiu de "a definir" e por quê
 *
 * Dois "a definir" eram FATO apurável, não decisão de ninguém, e viraram texto:
 *
 * 1. ONDE FICAM OS SERVIDORES. Apurado, não estimado: `db.<ref>.supabase.co` resolve para
 *    2600:1f16:c40:6e00::/…, e esse IP cai em dois prefixos da lista oficial da Amazon
 *    (ip-ranges.amazonaws.com), ambos com `region: us-east-2`. Ou seja, Ohio, Estados
 *    Unidos. Dado de saúde de brasileiro sai do país, o que é transferência internacional
 *    pelo Capítulo V da LGPD, e a Política não dizia. Agora diz, e diz também que a
 *    salvaguarda do art. 33 está em formalização, em vez de afirmar uma garantia que ainda
 *    não existe. Para reverificar a região basta refazer a consulta acima.
 * 2. O INVENTÁRIO ESTAVA INCOMPLETO. Três coisas que o código grava não estavam
 *    declaradas: o TELEFONE do aluno e os dados de COBRANÇA (valor, vencimento, situação e
 *    o meio de pagamento que o profissional cola), ambos no blob `jornada` da tabela
 *    `alunos`, e o PLANO da conta, em `profiles.plan`. Não é detalhe: uma Política que
 *    omite categoria de dado descreve um produto que não é este. `check:legal` agora
 *    reprova quando o código persiste um campo que o documento não lista, então o
 *    inventário não pode mais envelhecer em silêncio.
 *
 * O que continua "a definir" depende de decisão do Filipe ou de advogado, e por isso segue
 * em branco à vista: razão social, CNPJ e endereço; nome do encarregado (DPO); prazos de
 * retenção de backup e de guarda legal. `COBRANCA_ATIVA` em `data/planos.ts` é o tripwire:
 * ligar a cobrança com qualquer um desses em aberto reprova o build.
 */

type Secao = { titulo: string; paragrafos: string[]; lista?: string[] };

const ATUALIZADO_EM = "11 de agosto de 2026";

/* ============================== TERMOS DE USO ============================== */

const TERMOS: Secao[] = [
  {
    titulo: "1. Quem somos e o que este documento rege",
    paragrafos: [
      "O Mapa da Prescrição é uma plataforma web de apoio à decisão para profissionais de Educação Física registrados no CREF. Estes Termos regem o uso da plataforma por você, profissional, e o uso do portal do aluno pelas pessoas que você convidar.",
      "Ao criar uma conta, você declara que leu e concorda com estes Termos e com a Política de Privacidade.",
      "Identificação do fornecedor: a definir antes do lançamento comercial (razão social, CNPJ e endereço).",
    ],
  },
  {
    titulo: "2. O que a plataforma faz, e o que ela não faz",
    paragrafos: [
      "A plataforma organiza o raciocínio da prescrição de exercício, ranqueia exercícios a partir da avaliação que você registra, e documenta a justificativa técnica de cada escolha com a referência científica ao lado.",
      "A decisão é sempre sua. A plataforma NÃO diagnostica, NÃO prescreve conduta médica, NÃO substitui avaliação, liberação ou acompanhamento de profissional de saúde, e NÃO assume a responsabilidade técnica pelo treino que você entrega ao seu aluno. Quem assina o documento é você, com o seu CREF.",
      "O conteúdo científico é educacional e citado como faixa de referência, não como ordem. Sempre valide a edição vigente da diretriz no seu contexto e ajuste ao aluno concreto.",
    ],
  },
  {
    titulo: "3. Sua conta e o seu registro profissional",
    paragrafos: [
      "Você é responsável por manter sua senha em sigilo e por tudo que acontecer na sua conta. Avise imediatamente se suspeitar de acesso indevido.",
      "Você declara ser profissional de Educação Física com registro ativo no CREF, e que informará o número correto de registro nos documentos que emitir pela plataforma. Não conferimos a validade do seu registro junto ao Conselho: a responsabilidade pela veracidade é sua.",
    ],
  },
  {
    titulo: "4. Os dados dos seus alunos são responsabilidade compartilhada",
    paragrafos: [
      "Ao cadastrar um aluno, você insere na plataforma dados pessoais e de saúde de OUTRA pessoa. Perante essa pessoa, quem coleta e decide o uso é você: cabe a você obter o consentimento dela, informá-la de que os dados ficam armazenados nesta plataforma e atender aos pedidos dela de acesso, correção ou exclusão.",
      "Nós fornecemos a infraestrutura e as ferramentas para você cumprir isso, incluindo a exclusão do aluno com todos os registros vinculados. A Política de Privacidade descreve o que armazenamos e por quanto tempo.",
      "Você se compromete a não usar a plataforma para registrar dados de pessoa que não seja sua aluna, nem para finalidade diferente do acompanhamento profissional dela.",
    ],
  },
  {
    titulo: "5. Assinatura, pagamento e cancelamento",
    paragrafos: [
      "Valores, formas de pagamento, periodicidade e eventual período de teste são os informados na página de planos no momento da contratação.",
      "Você pode cancelar a qualquer momento, pela própria plataforma. O cancelamento encerra as cobranças seguintes e mantém o acesso até o fim do período já pago.",
      "Direito de arrependimento: em compras feitas pela internet, você pode desistir em até 7 dias corridos contados da contratação, com devolução integral do valor pago, conforme o art. 49 do Código de Defesa do Consumidor.",
      // Este parágrafo é verdade enquanto ninguém for cobrado, e vira MENTIRA no dia em que
      // for. Por isso ele não é texto fixo: sai sozinho quando o interruptor da cobrança
      // virar, no mesmo commit em que a cobrança liga.
      ...(COBRANCA_ATIVA
        ? []
        : [
            "Enquanto a plataforma estiver em fase de acesso liberado, sem cobrança, esta seção descreve as regras que passarão a valer quando a cobrança for ativada, e você será avisado antes.",
          ]),
    ],
  },
  {
    titulo: "6. Uso aceitável",
    paragrafos: ["Você concorda em não:"],
    lista: [
      "usar a plataforma para atividade que a legislação reserve a outra profissão regulamentada",
      "revender, sublicenciar ou compartilhar sua conta com outros profissionais",
      "extrair em massa o conteúdo científico, as imagens ou o catálogo de exercícios",
      "tentar burlar limites técnicos, testar segurança sem autorização ou sobrecarregar o serviço",
      "inserir dado de saúde de pessoa que não seja sua aluna",
    ],
  },
  {
    titulo: "7. Propriedade intelectual",
    paragrafos: [
      "O conteúdo autoral da plataforma (textos, curadoria científica, catálogo de exercícios, imagens, código e marca) é nosso ou licenciado a nós. As referências científicas citadas pertencem aos seus autores e editoras, e são citadas com atribuição.",
      "O que você produz na plataforma continua seu: os dados dos seus alunos, os planos que você monta e os documentos que você assina.",
    ],
  },
  {
    titulo: "8. Disponibilidade e limitação de responsabilidade",
    paragrafos: [
      "Trabalhamos para manter o serviço no ar, mas ele pode ficar indisponível por manutenção, falha de terceiros ou caso fortuito. Não garantimos operação ininterrupta.",
      "Não respondemos por decisão profissional tomada por você, por lesão ou dano decorrente do treino que você prescreveu, nem por dado incorreto que você tenha inserido. A ferramenta apoia; a decisão e a responsabilidade técnica são suas.",
      "Os limites de responsabilidade aplicáveis a relações de consumo seguem o Código de Defesa do Consumidor, que prevalece sobre qualquer disposição em contrário deste documento.",
    ],
  },
  {
    titulo: "9. Mudanças nestes Termos",
    paragrafos: [
      "Podemos alterar estes Termos. Mudança relevante será avisada com antecedência razoável na própria plataforma ou por e-mail, e você poderá encerrar a assinatura se não concordar.",
    ],
  },
  {
    titulo: "10. Lei aplicável e foro",
    paragrafos: [
      "Aplica-se a lei brasileira. O foro é o do domicílio do consumidor, conforme o Código de Defesa do Consumidor.",
      "Contato: suporte@mapadaprescricao.com.br",
    ],
  },
];

/* ========================= POLÍTICA DE PRIVACIDADE ========================= */

const PRIVACIDADE: Secao[] = [
  {
    titulo: "1. Em uma frase",
    paragrafos: [
      "Guardamos o que você digita sobre você e sobre seus alunos, para que a plataforma funcione e para que os documentos que você assina existam. Não vendemos dado nenhum, não usamos os dados dos seus alunos para publicidade e não os compartilhamos com terceiros além da infraestrutura que hospeda o serviço.",
    ],
  },
  {
    titulo: "2. Quem é o controlador de quê",
    paragrafos: [
      "Dos SEUS dados de cadastro (nome, e-mail, CREF, marca), o controlador somos nós.",
      "Dos dados dos SEUS ALUNOS, quem decide coletar e para que usar é você, profissional. Nesse tratamento, atuamos como operador: processamos e armazenamos seguindo as suas instruções. Isso significa que o pedido de um aluno para acessar ou apagar os dados dele deve ser dirigido a você, e nós damos a ferramenta para você atender.",
    ],
  },
  {
    titulo: "3. O que coletamos de VOCÊ, profissional",
    paragrafos: ["Ao criar a conta e usar a plataforma:"],
    lista: [
      "nome, e-mail e senha (a senha é armazenada com hash pelo provedor de autenticação; nunca a vemos)",
      "número de CREF, quando informado, para constar nos documentos que você assina",
      "dados da sua marca, quando preenchidos: logotipo, nome da empresa e contato",
      "seu progresso de estudo na seção Aprender e seu histórico de uso da plataforma",
      "o plano vinculado à sua conta, que hoje define apenas o seu nível de acesso",
      "dados técnicos de acesso gerados pelo provedor de infraestrutura, como registros de autenticação",
    ],
  },
  {
    titulo: "4. O que coletamos dos SEUS ALUNOS, e é aqui que mora o dado sensível",
    paragrafos: [
      "Tudo abaixo é digitado por você. O aluno não preenche nada disto, e por isso é você quem precisa informá-lo e obter o consentimento dele.",
    ],
    lista: [
      "identificação e contato: nome, idade, sexo e telefone, quando você o preenche",
      "condição de saúde declarada e condições adicionais de atenção (por exemplo hipertensão, diabetes, gestação)",
      "classes de medicação em uso, quando declaradas",
      "restrições físicas e limitações declaradas",
      "medidas corporais: peso, altura, IMC, perímetros, percentual de gordura",
      "sinais clínicos: pressão arterial sistólica e diastólica, frequência cardíaca de repouso",
      "dor relatada, com escala e regiões",
      "resultados de testes funcionais e observações livres que você escrever",
      "FOTOS do corpo do aluno anexadas à avaliação",
      "respostas do checklist diário de liberação, que incluem sintomas do dia",
      "planos de treino, prescrições e registros de execução, incluindo carga, repetições e esforço percebido",
      "controle financeiro da mensalidade, quando você usa a aba de cobrança: valor, dia de vencimento, situação de pago ou pendente, e o meio de pagamento que VOCÊ cola, como uma chave PIX ou um link de checkout seu",
    ],
  },
  {
    titulo: "5. Onde cada coisa fica, com honestidade",
    paragrafos: [
      "SINCRONIZA COM A NUVEM, vinculado à sua conta: cadastro de alunos (com telefone e controle de mensalidade, quando preenchidos), avaliações (incluindo as FOTOS anexadas), prescrições, planos de treino, liberações do semáforo e registros de execução. Ficam no banco de dados do nosso provedor de infraestrutura, isolados por conta, e você os acessa de qualquer aparelho ao entrar na sua conta. Sobre o país onde esse banco fica, veja a seção 8.",
      "FICA SOMENTE NO SEU APARELHO, sem cópia na nuvem: a avaliação postural por visão computacional. A imagem é processada no seu próprio navegador e não é enviada para nenhum servidor.",
      "Se em algum ponto da plataforma você ler algo diferente disto, o correto é este documento, e o texto divergente é erro nosso: avise pelo suporte.",
    ],
  },
  {
    titulo: "6. Para que usamos",
    paragrafos: ["Só para o que faz a plataforma funcionar:"],
    lista: [
      "gerar, exibir e exportar planos, prescrições, semáforos e prontuários",
      "manter o histórico do aluno para você acompanhar a evolução e reavaliar no prazo",
      "autenticar seu acesso e sincronizar seus dados entre aparelhos",
      "dar suporte quando você solicitar",
      "melhorar o produto a partir de uso agregado, sem identificar aluno",
    ],
  },
  {
    titulo: "7. Base legal",
    paragrafos: [
      "Para os seus dados de profissional: execução do contrato entre você e nós (art. 7º, V da LGPD) e cumprimento de obrigação legal, quando aplicável.",
      "Para os dados de saúde dos seus alunos: consentimento específico e destacado do titular, obtido POR VOCÊ (art. 11, I da LGPD), ou a hipótese de tutela da saúde em procedimento realizado por profissional de saúde quando for o caso (art. 11, II, f). Consentimento genérico não vale para dado sensível: precisa ser específico para esta finalidade.",
    ],
  },
  {
    titulo: "8. Com quem compartilhamos",
    paragrafos: [
      "Com a infraestrutura que hospeda o banco de dados e a autenticação, que atua como suboperador e não usa os dados para finalidade própria.",
      "Com autoridade pública, quando houver obrigação legal ou ordem judicial.",
      "Com mais ninguém. Não vendemos, não alugamos e não cedemos dados para publicidade.",
      "ONDE FICAM OS SERVIDORES: nos Estados Unidos. O banco de dados roda na região us-east-2 (Ohio) da Amazon Web Services, contratada através do nosso provedor de infraestrutura. Isso significa que os dados que você registra, inclusive os dados de saúde dos seus alunos, são armazenados fora do Brasil.",
      "Como isso é uma transferência internacional de dados na forma do Capítulo V da LGPD, você precisa saber disto antes de cadastrar alguém, e o seu aluno precisa saber antes de consentir. Estamos formalizando com o provedor de infraestrutura o contrato de tratamento com as cláusulas padrão que dão a garantia exigida pelo art. 33 da LGPD. Enquanto essa formalização não estiver concluída, este parágrafo permanece aqui dizendo exatamente em que pé está, em vez de afirmar uma salvaguarda que ainda não temos.",
    ],
  },
  {
    titulo: "9. Por quanto tempo guardamos",
    paragrafos: [
      "Enquanto a sua conta existir, os dados ficam disponíveis para você.",
      "Quando você exclui um aluno, apagamos junto as avaliações, prescrições, planos, liberações e execuções dele.",
      "Quando você encerra a conta, os dados vinculados a ela são excluídos em cascata.",
      "Prazo de retenção de cópias de segurança e prazo legal de guarda: a definir com apoio jurídico antes do lançamento comercial.",
    ],
  },
  {
    titulo: "10. Direitos do titular",
    paragrafos: [
      "Pela LGPD (art. 18), o titular pode pedir confirmação de tratamento, acesso, correção, anonimização, portabilidade, informação sobre compartilhamento, e revogação do consentimento.",
      "Se você é o PROFISSIONAL, exerça seus direitos pelo suporte.",
      "Se você é ALUNO de um profissional que usa a plataforma, procure primeiro esse profissional, que é quem decide o tratamento dos seus dados. Se não obtiver resposta, fale conosco e nós o ajudaremos a alcançá-lo.",
    ],
  },
  {
    titulo: "11. Segurança",
    paragrafos: [
      "O acesso exige autenticação, e os dados de cada conta são isolados dos das demais por regras no banco de dados. O tráfego é criptografado em trânsito.",
      "Nenhum sistema é imune. Em caso de incidente com risco relevante aos titulares, comunicaremos os afetados e a Autoridade Nacional de Proteção de Dados nos termos do art. 48 da LGPD.",
      "Recomendação prática: fotos do corpo do aluno são o dado mais sensível que a plataforma guarda. Anexe apenas quando forem necessárias ao acompanhamento, e sempre com autorização específica dele.",
    ],
  },
  {
    titulo: "12. Encarregado e contato",
    paragrafos: [
      "Encarregado pelo tratamento de dados pessoais (DPO): a definir antes do lançamento comercial.",
      "Contato para assuntos de privacidade: suporte@mapadaprescricao.com.br",
    ],
  },
  {
    titulo: "13. Mudanças nesta Política",
    paragrafos: [
      "Se mudarmos algo relevante, avisaremos na plataforma. A data de atualização no topo desta página indica a versão vigente.",
    ],
  },
];

/* ================================= Página ================================= */

function Documento({
  tipo,
}: {
  tipo: "termos" | "privacidade";
}) {
  const ehTermos = tipo === "termos";
  const secoes = ehTermos ? TERMOS : PRIVACIDADE;
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 md:px-6">
          <Logo />
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <Pill tone="primary" icon={ehTermos ? <ScrollText className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />} className="mb-3">
          {ehTermos ? "Documento" : "Privacidade"}
        </Pill>
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
          {ehTermos ? "Termos de Uso" : "Política de Privacidade"}
        </h1>
        <p className="mt-2 text-sm text-ink-3">Atualizado em {ATUALIZADO_EM}</p>

        <Card className="mt-6 border-warning/40 bg-warning-tint p-4">
          <p className="text-sm text-ink-2">
            <b className="text-ink">Versão preliminar.</b> Este texto descreve com honestidade o que o
            sistema faz hoje, mas ainda não passou por revisão jurídica. Os pontos marcados como
            "a definir" dependem de decisão do responsável pelo negócio e de orientação de
            advogado antes da cobrança do primeiro cliente.
          </p>
        </Card>

        <div className="mt-8 space-y-8">
          {secoes.map((s) => (
            <section key={s.titulo}>
              <h2 className="font-display text-lg font-bold text-ink">{s.titulo}</h2>
              {s.paragrafos.map((p, i) => (
                <p key={i} className="mt-2 text-sm leading-relaxed text-ink-2">
                  {p}
                </p>
              ))}
              {s.lista && (
                <ul className="mt-3 space-y-1.5">
                  {s.lista.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-ink-2">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-ink-2">
          {ehTermos ? (
            <>
              Veja também a{" "}
              <Link to="/privacidade" className="font-semibold text-primary hover:underline">
                Política de Privacidade
              </Link>
              .
            </>
          ) : (
            <>
              Veja também os{" "}
              <Link to="/termos" className="font-semibold text-primary hover:underline">
                Termos de Uso
              </Link>
              .
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export function Termos() {
  return <Documento tipo="termos" />;
}

export function Privacidade() {
  return <Documento tipo="privacidade" />;
}
