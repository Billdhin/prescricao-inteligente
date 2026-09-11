import * as React from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Plus, Search, ShieldAlert, X } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { GavetaSelecao, type GrupoGaveta, type ItemGaveta } from "@/components/alunos/GavetaSelecao";
import { ObjetivoDuplo } from "@/components/gps/ObjetivoDuplo";
import { parValido } from "@/lib/gps/objetivos";
import { MedicamentosDoPerfil, SelecionadosFarmacos } from "@/components/alunos/MedicamentosDoPerfil";
import { DetalheRestricoes } from "@/components/gps/RestricoesSelector";
import { OQueIssoMudaPainel } from "@/components/alunos/OQueIssoMudaPainel";
import { useAlunos } from "@/lib/store";
import { toast } from "@/lib/toast";
import { EQUIPAMENTOS, type GpsObjetivo } from "@/lib/gps/engine";
import { descricaoOpcao } from "@/data/opcoes-wizard";
import { specialGroups } from "@/data/specialGroups";
import { farmacosAtivos, type FarmacoSelecionado } from "@/data/farmacos";
import {
  CATALOGO_RESTRICOES,
  GRUPOS_RESTRICAO,
  avaliarSeguranca,
  criarRestricao,
  restricoesAtivas,
  rotuloRestricao,
  type RestricaoTag,
} from "@/lib/gps/restricoes";
import {
  SECOES_PERFIL,
  completudeAluno,
  ehSecaoPerfil,
  secaoInicial,
  vizinhasDaSecao,
  type SecaoPerfilId,
} from "@/lib/gps/perfilAluno";
import type { Aluno } from "@/data/alunos";
import { iniciaisDe } from "@/data/alunos";
import type { Nivel } from "@/data/types";
import { cn } from "@/lib/utils";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
/** Quantas condições aparecem como atalho antes da busca abrir a lista inteira. */
const CONDICOES_ATALHO = 5;

/**
 * PERFIL DO ALUNO: onde a saúde é preenchida, e editada depois.
 *
 * O cadastro virou um modal de quatro campos e tudo o que decide prescrição veio
 * morar aqui, em seis seções que salvam sozinhas. Três escolhas sustentam a tela:
 *
 * 1. **Salva a cada toque.** Não existe botão "salvar" e não existe rascunho: o
 *    aluno é real desde o primeiro campo, e sair no meio não perde nada. É o que
 *    autoriza o rodapé a oferecer "Concluir depois" sem culpa.
 * 2. **A consequência fica ao lado.** A coluna da direita mostra o que cada coisa
 *    declarada muda no motor, no semáforo e no app do aluno. Ela é DERIVADA
 *    (src/lib/gps/oQueIssoMuda.ts): nenhuma frase sobre o aluno é escrita aqui.
 * 3. **Nada disso bloqueia o cuidado.** Perfil incompleto não tranca avaliação nem
 *    treino; quem tranca é a avaliação (gate duro) e a liberação. O perfil só
 *    informa o que falta e o que aquilo mudaria.
 */
export function AlunoPerfil() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const alunos = useAlunos((s) => s.alunos);
  const updateAluno = useAlunos((s) => s.updateAluno);
  const aluno = alunos.find((a) => a.id === id);

  // A SEÇÃO VIVE NA URL, pelo mesmo motivo da aba do aluno: guardada só em estado local,
  // ela se perdia toda vez que o profissional saía e voltava, no meio de um formulário de
  // saúde que ele estava preenchendo.
  const secaoNaUrl = params.get("secao");
  const secaoPadrao: SecaoPerfilId = aluno ? secaoInicial(aluno) : "basicos";
  const secao: SecaoPerfilId = secaoNaUrl && ehSecaoPerfil(secaoNaUrl) ? secaoNaUrl : secaoPadrao;
  const setSecao = React.useCallback(
    (nova: SecaoPerfilId) => {
      setParams(
        (atuais) => {
          const p = new URLSearchParams(atuais);
          p.set("secao", nova);
          return p;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  if (!aluno) return <Navigate to="/alunos" replace />;

  const patch = (p: Partial<Aluno>) => updateAluno(aluno.id, p);
  const completude = completudeAluno(aluno);
  const indice = SECOES_PERFIL.findIndex((s) => s.id === secao);
  const { anterior, proxima } = vizinhasDaSecao(secao);
  const atual = SECOES_PERFIL[indice];

  const nota = NOTA_DO_PASSO[secao];

  // O botão do próximo passo no tamanho do protótipo (42 px, raio 12, 13,5 px em negrito):
  // um degrau abaixo do botão de 44 da página, porque ele mora numa faixa de rodapé.
  const botaoProximo = cn(buttonClasses("primary"), "h-[42px] px-[18px] text-[13.5px] font-bold");

  return (
    <div className="mx-auto max-w-[1240px] space-y-4">
      <CabecalhoPerfil aluno={aluno} />
      <TrilhoSecoes secaoAtiva={secao} onSecao={setSecao} completude={completude} />

      {/* O corpo do protótipo de 10/09/2026: o passo em foco num cartão só, e o "O que
          isso muda" ao lado. O trilho vertical que ocupava a coluna da esquerda subiu para a
          bandeja horizontal logo acima: ele roubava 260 px de largura de um formulário que
          precisa de três colunas de cartões, para mostrar seis nomes. */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* O cartão do passo em TRÊS FAIXAS, como no protótipo: a cabeça (pergunta, limite e
            resumo) separada por um fio, o miolo, e o rodapé de navegação numa faixa cinza. Em
            bloco único o botão "próximo" parecia mais um campo do formulário. Sem sombra também
            no computador: o cartão é o assunto da tela, não um objeto flutuando sobre ela. */}
        <Card className="min-w-0 overflow-hidden p-0 lg:shadow-none">
          <div className="border-b border-surface-mute px-[22px] pb-4 pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2 className="font-display text-2xl font-bold tracking-[-0.025em] text-ink">
                {TITULO_DO_CARTAO[secao] ?? atual.titulo}
              </h2>
              {nota && <span className="text-[12.5px] text-ink-2">{nota}</span>}
            </div>
            <p className="mt-1.5 max-w-[620px] text-[13.5px] leading-[1.55] text-ink-2">{atual.resumo}</p>
            {/* No passo da medicação, o que foi declarado mora NA CABEÇA do cartão: é a
                resposta à pergunta do título, e fica à vista antes dos onze cartões. */}
            {secao === "medicamentos" && <SelecionadosDoPerfil aluno={aluno} onPatch={patch} />}
          </div>

          <div className="px-[22px] pb-[18px] pt-3.5">
            {secao === "basicos" && <SecaoBasicos aluno={aluno} onPatch={patch} />}
            {secao === "objetivo" && <SecaoObjetivo aluno={aluno} onPatch={patch} />}
            {secao === "saude" && <SecaoSaude aluno={aluno} onPatch={patch} onIrPara={setSecao} />}
            {secao === "medicamentos" && <SecaoMedicamentos aluno={aluno} onPatch={patch} />}
            {secao === "equipamentos" && <SecaoEquipamentos aluno={aluno} onPatch={patch} />}
            {secao === "notas" && <SecaoNotas aluno={aluno} onPatch={patch} />}
          </div>

          {/* Rodapé de navegação: anterior, sair sem culpa, próxima. No celular o anterior fica
              na primeira linha e o par "Concluir depois" + próxima desce inteiro para a segunda. */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-surface-mute bg-surface-soft px-[22px] py-3">
            {anterior && (
              <button
                type="button"
                onClick={() => setSecao(anterior.id)}
                className="inline-flex min-h-[40px] items-center gap-1 text-[13.5px] font-semibold text-ink-2 hover:text-ink"
              >
                <ChevronLeft aria-hidden className="h-4 w-4" /> {anterior.titulo}
              </button>
            )}
            <div className={cn("flex items-center gap-2.5", !anterior && "ml-auto")}>
              <button
                type="button"
                onClick={() => navigate(`/alunos/${aluno.id}`)}
                className="min-h-[40px] px-1 text-[13.5px] font-semibold text-primary-texto hover:underline"
              >
                Concluir depois
              </button>
              {proxima ? (
                <button type="button" onClick={() => setSecao(proxima.id)} className={botaoProximo}>
                  {proxima.titulo} <ChevronRight aria-hidden className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={() => navigate(`/alunos/${aluno.id}`)} className={botaoProximo}>
                  Ver o aluno <ChevronRight aria-hidden className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </Card>

        <OQueIssoMudaPainel aluno={aluno} secao={secao} />
      </div>
    </div>
  );
}

/**
 * A nota à direita do título do passo: o limite do que o passo pergunta, dito antes da
 * primeira resposta. Só existe onde há um limite que o profissional precisa saber para
 * responder bem; os outros passos ficam sem, em vez de ganhar uma frase de enfeite.
 */
/** O nome do passo é curto porque mora na bandeja; no cartão ele pode dizer a pergunta inteira. */
const TITULO_DO_CARTAO: Partial<Record<SecaoPerfilId, string>> = {
  medicamentos: "Medicamentos em uso",
};

const NOTA_DO_PASSO: Partial<Record<SecaoPerfilId, string>> = {
  saude: "Pode marcar mais de uma",
  medicamentos: "Só a classe: nada de dose, marca ou horário",
  notas: "Não vai para o app do aluno nem para o PDF",
};

/* ------------------------------- Cabeçalho -------------------------------- */

function CabecalhoPerfil({ aluno }: { aluno: Aluno }) {
  return (
    <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
      <div className="flex min-w-0 flex-1 basis-[340px] items-start gap-3">
        {/* O desenho é o círculo de 34 px do protótipo; o `before` estende a área de toque
            para 44 px sem aumentar o círculo. */}
        <Link
          to={`/alunos/${aluno.id}`}
          aria-label="Voltar para o aluno"
          className="relative mt-1 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border border-border bg-surface text-ink-2 transition-colors before:absolute before:-inset-[5px] before:content-[''] hover:border-ink hover:text-ink"
        >
          <ChevronLeft aria-hidden className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-[11.5px] font-semibold uppercase tracking-[0.12em] text-primary-texto">
            Perfil de {aluno.nome}
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-bold leading-[1.08] tracking-[-0.03em] text-ink md:text-[28px]">
            O que o Mapa precisa saber
          </h1>
        </div>
      </div>
      {/* No celular este bloco cai para a segunda linha colado à esquerda, como no protótipo:
          espalhado pelas bordas, o selo e o botão pareciam duas coisas sem relação. */}
      <div className="flex flex-wrap items-center gap-3 sm:self-center">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-semibold text-success">
          <Check aria-hidden className="h-4 w-4 text-success-fill" strokeWidth={2.5} /> Salva a cada resposta
        </span>
        <Link
          to={`/alunos/${aluno.id}?avaliar=1`}
          className={cn(buttonClasses("primary"), "h-10 px-4 text-[13.5px]")}
        >
          Registrar avaliação <ChevronRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/* ----------------------------- Trilho de seções --------------------------- */

/**
 * A BANDEJA DE PASSOS: os seis passos numa linha, com o check nos feitos, a pílula branca no
 * passo em foco e o número nos que faltam.
 *
 * Todo passo é clicável, feito ou não: o perfil não é um assistente que obriga a ordem, e
 * quem voltou só para trocar a medicação vai direto nela. A bandeja rola na horizontal em vez
 * de quebrar em duas linhas, que é o que fazia o passo em foco pular de lugar a cada clique.
 *
 * No celular os SEIS NOMES aparecem (protótipo mobile de 10/09/2026). Antes só o passo em
 * foco tinha nome e os outros viravam número solto: "4" não diz a ninguém que ali é a
 * medicação, e o check verde sem nome não dizia O QUE estava feito. A rolagem já resolvia
 * a largura; esconder os nomes só tirava a leitura.
 */
function TrilhoSecoes({
  secaoAtiva,
  onSecao,
  completude,
}: {
  secaoAtiva: SecaoPerfilId;
  onSecao: (s: SecaoPerfilId) => void;
  completude: ReturnType<typeof completudeAluno>;
}) {
  // Quando a bandeja não cabe (celular), o passo em foco é trazido para dentro dela, encostado
  // a 12 px da borda esquerda como no protótipo: assim os passos SEGUINTES ficam à vista, que
  // é para onde o profissional vai. Mexe só no `scrollLeft` da própria bandeja:
  // `scrollIntoView` rolaria a página inteira junto.
  const bandeja = React.useRef<HTMLOListElement>(null);
  React.useEffect(() => {
    const ol = bandeja.current;
    const ativo = ol?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!ol || !ativo) return;
    const esquerda = ativo.offsetLeft; // relativo à bandeja, que é o ancestral posicionado
    if (esquerda < ol.scrollLeft || esquerda + ativo.offsetWidth > ol.scrollLeft + ol.clientWidth)
      ol.scrollLeft = Math.max(0, esquerda - 12);
  }, [secaoAtiva]);

  return (
    <nav aria-label="Passos do perfil" className="!mt-[18px] flex flex-wrap items-center gap-x-2.5 gap-y-2">
      {/* `relative` não é enfeite: o "(preenchida)" de cada passo é `sr-only`, que é posição
          absoluta, e sem um ancestral posicionado ele escapava da rolagem da bandeja e
          alargava a página inteira. */}
      <ol
        ref={bandeja}
        className="relative flex min-w-0 flex-1 basis-full items-center gap-1.5 overflow-x-auto rounded-full bg-surface-mute p-1.5 [scrollbar-width:none] sm:basis-[420px] [&::-webkit-scrollbar]:hidden"
      >
        {completude.secoes.map((s, i) => {
          const ativo = s.secao.id === secaoAtiva;
          const ultimo = i === completude.secoes.length - 1;
          return (
            <li key={s.secao.id} className="flex shrink-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => onSecao(s.secao.id)}
                aria-current={ativo ? "step" : undefined}
                title={s.feita ? `${s.secao.titulo}: preenchida` : `${s.secao.titulo}: ${s.falta}`}
                className={cn(
                  "flex min-h-[36px] items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-[13px] transition-colors",
                  ativo
                    ? "border-ink bg-surface font-bold text-ink shadow-[0_10px_22px_-18px_rgba(11,22,40,.8)]"
                    : s.feita
                      ? "border-transparent font-semibold text-ink hover:bg-surface"
                      : "border-transparent font-semibold text-ink-2 hover:bg-surface hover:text-ink",
                )}
              >
                {/* Pendente é CONTORNADA e feita é tinta verde com check: a diferença entre as
                    duas não pode depender de o olho distinguir dois cinzas chapados. O ativo
                    que também está feito mostra o número, porque o foco manda na leitura. */}
                <span
                  aria-hidden
                  className={cn(
                    "grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-2xs font-bold",
                    ativo
                      ? "bg-ink text-surface"
                      : s.feita
                        ? "bg-success-tint text-success"
                        : "border-[1.5px] border-ink-4 text-ink-2",
                  )}
                >
                  {s.feita && !ativo ? <Check className="h-3 w-3" strokeWidth={3.5} /> : i + 1}
                </span>
                <span className="whitespace-nowrap">{s.secao.titulo}</span>
                {s.feita && <span className="sr-only">(preenchida)</span>}
              </button>
              {!ultimo && <span aria-hidden className="h-[1.5px] w-[18px] shrink-0 bg-border" />}
            </li>
          );
        })}
      </ol>
      <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-ink-2">
        {completude.feitas} de {completude.total} concluídas
      </span>
    </nav>
  );
}

/* --------------------------------- Seções --------------------------------- */

function Campo({ label, children, dica }: { label: string; children: React.ReactNode; dica?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {dica && <span className="mt-1 block text-xs text-ink-3">{dica}</span>}
    </label>
  );
}

function SecaoBasicos({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  const idadeForaDaFaixa = aluno.idade != null && (aluno.idade < 12 || aluno.idade > 100);
  return (
    <div className="space-y-4">
      <Campo label="Nome">
        <input
          value={aluno.nome}
          onChange={(e) => onPatch({ nome: e.target.value, iniciais: iniciaisDe(e.target.value) })}
          className="input"
        />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Idade" dica="Entra na classificação por faixa etária e nas escalas de referência.">
          <input
            value={aluno.idade != null ? String(aluno.idade) : ""}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 3);
              onPatch({ idade: v ? Number(v) : undefined });
            }}
            inputMode="numeric"
            aria-invalid={idadeForaDaFaixa}
            placeholder="Ex.: 34"
            className="input"
          />
          {idadeForaDaFaixa && (
            <span className="mt-1 block text-xs text-warning">Idade fora da faixa esperada (12 a 100).</span>
          )}
        </Campo>
        <Campo label="WhatsApp" dica="Usado para enviar o convite do app do aluno.">
          <input
            value={aluno.telefone ?? ""}
            onChange={(e) => onPatch({ telefone: e.target.value || undefined })}
            inputMode="tel"
            placeholder="Ex.: (11) 99999-0000"
            className="input"
          />
        </Campo>
      </div>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-ink">Nível</legend>
        <div className="flex flex-wrap gap-2">
          {NIVEIS.map((n) => (
            <ChipEscolha
              key={n}
              ativo={aluno.nivel === n}
              onClick={() =>
                onPatch({ nivel: n, nivelDesde: aluno.nivel === n ? aluno.nivelDesde : Date.now() })
              }
            >
              {n}
            </ChipEscolha>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-3">
          Trocar o nível reinicia a contagem de tempo nele, que é o que alimenta a sugestão de progressão.
        </p>
      </fieldset>
    </div>
  );
}

function SecaoObjetivo({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  // O par escolhido vive em estado local até ser VÁLIDO. A matriz oferece os pares
  // incompatíveis de propósito (com o veredito ao lado, que é o conteúdo), mas um
  // par incompatível não pode virar dado do aluno: ele contradiz a si mesmo no
  // prontuário e no plano. Então a tela mostra o veredito e não grava.
  const [par, setPar] = React.useState<{ o: GpsObjetivo; s?: GpsObjetivo }>({
    o: aluno.objetivo,
    s: aluno.objetivoSecundario,
  });
  const valido = parValido(par.o, par.s);

  const trocar = (o: GpsObjetivo, s?: GpsObjetivo) => {
    setPar({ o, s });
    if (parValido(o, s)) onPatch({ objetivo: o, objetivoSecundario: s });
  };

  return (
    <div className="space-y-3">
      <ObjetivoDuplo objetivo={par.o} objetivoSecundario={par.s} onChange={trocar} />
      {!valido && (
        <p className="rounded-card border border-danger/30 bg-danger-tint p-3 text-sm text-danger" role="alert">
          Este par não foi salvo. O objetivo do aluno segue{" "}
          <strong className="font-bold">{aluno.objetivo}</strong>
          {aluno.objetivoSecundario ? ` com ${aluno.objetivoSecundario.toLowerCase()}` : " sozinho"}. Escolha
          outro segundo objetivo, ou nenhum.
        </p>
      )}
    </div>
  );
}

function SecaoSaude({
  aluno,
  onPatch,
  onIrPara,
}: {
  aluno: Aluno;
  onPatch: (p: Partial<Aluno>) => void;
  onIrPara: (s: SecaoPerfilId) => void;
}) {
  const classesMarcadas = farmacosAtivos(aluno.farmacos).length;
  return (
    <div className="space-y-4">
      <CondicaoDeSaude aluno={aluno} onPatch={onPatch} />
      <RestricoesFisicas aluno={aluno} onPatch={onPatch} />
      {/* Ponte para a próxima seção: a medicação muda como ler FC e glicemia, e é a
          pergunta que mais some quando não é feita na mesma conversa da saúde. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-soft p-4">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-ink">Medicamentos em uso</h3>
          <p className="text-sm text-ink-2">
            {classesMarcadas > 0
              ? `${classesMarcadas} classe${classesMarcadas === 1 ? "" : "s"} marcada${classesMarcadas === 1 ? "" : "s"}.`
              : "Só a classe. Ajuda a ler frequência cardíaca e glicemia."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onIrPara("medicamentos")} className={buttonClasses("secondary", "sm")}>
            {classesMarcadas > 0 ? "Ver" : "Preencher"}
          </button>
          {/* O atalho só existe enquanto não há classe marcada: com classe declarada, "não
              sei" apagaria a declaração daqui, sem mostrar o que estava sendo apagado. E ele
              desmarca no segundo clique, como o do passo de medicamentos. */}
          {classesMarcadas === 0 && (
            <button
              type="button"
              role="checkbox"
              aria-checked={Boolean(aluno.farmacosNaoInformado)}
              onClick={() => onPatch({ farmacosNaoInformado: aluno.farmacosNaoInformado ? undefined : true })}
              className={cn(buttonClasses("ghost", "sm"), aluno.farmacosNaoInformado && "text-success")}
            >
              {aluno.farmacosNaoInformado && <Check aria-hidden className="h-4 w-4" />}
              {aluno.farmacosNaoInformado ? "Não informado" : "Não sei / não informar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CondicaoDeSaude({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  const alunos = useAlunos((s) => s.alunos);
  const [busca, setBusca] = React.useState("");
  const [verTodas, setVerTodas] = React.useState(false);

  // "Mais usadas por você" só pode ser dito quando existe uso: a frequência sai da
  // carteira do próprio profissional. Sem histórico, o rótulo muda de propósito.
  const frequencia = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const a of alunos) if (a.grupoEspecial) m.set(a.grupoEspecial, (m.get(a.grupoEspecial) ?? 0) + 1);
    return m;
  }, [alunos]);
  const temHistorico = frequencia.size > 0;

  const ordenadas = React.useMemo(
    () =>
      [...specialGroups].sort(
        (a, b) => (frequencia.get(b.slug) ?? 0) - (frequencia.get(a.slug) ?? 0) || a.nome.localeCompare(b.nome),
      ),
    [frequencia],
  );

  const q = busca.trim().toLowerCase();

  /**
   * Marcar e desmarcar condição, agora com MAIS DE UMA por aluno.
   *
   * O feedback de campo foi direto: "a parada de não poder colocar várias condições do
   * indivíduo". O modelo de dados já suportava (`grupoEspecial` + `condicoesAtencao`) e o
   * motor já sabia fundir regras pela mais conservadora; só a tela obrigava a escolher uma.
   *
   * A PRIMEIRA marcada vira a principal, porque é ela que dá o esqueleto de fases do
   * macrociclo (uma jornada clínica não se funde com outra). As demais entram como
   * condições de atenção e pesam em tudo o mais. Ao desmarcar a principal, a próxima da
   * lista assume, para o aluno nunca ficar com atenção sem principal.
   */
  const selecionadas = [aluno.grupoEspecial, ...(aluno.condicoesAtencao ?? [])].filter(Boolean) as string[];

  /*
   * O QUE ESTÁ MARCADO APARECE SEMPRE, E PRIMEIRO.
   *
   * A lista era `ordenadas.slice(0, CONDICOES_ATALHO)`, ou seja seis atalhos por frequência
   * de uso. Uma condição marcada que caísse fora desses seis simplesmente não era desenhada,
   * e o profissional ficava sem ver a própria escolha. Foi o que o Filipe relatou: teve de
   * BUSCAR "diabetes" para marcar, e depois de marcada ela sumia do quadro de novo, só
   * reaparecendo quando ele digitava. Uma tela que esconde a seleção que ela mesma guardou
   * faz o profissional duvidar do que gravou, e ele reabre, remarca, duplica.
   *
   * Agora as marcadas são fixadas no começo, inclusive durante a busca: filtrar é para achar
   * o que falta, nunca para esconder o que já foi decidido. A principal vem antes das demais,
   * porque é ela que dá o esqueleto de fases.
   */
  const naBusca = React.useMemo(
    () =>
      q
        ? ordenadas.filter((g) => g.nome.toLowerCase().includes(q) || g.descricaoCurta.toLowerCase().includes(q))
        : verTodas
          ? ordenadas
          : ordenadas.slice(0, CONDICOES_ATALHO),
    [q, verTodas, ordenadas],
  );
  const marcadas = React.useMemo(
    () =>
      selecionadas
        .map((slug) => ordenadas.find((g) => g.slug === slug))
        .filter((g): g is (typeof ordenadas)[number] => Boolean(g)),
    [selecionadas.join("|"), ordenadas],
  );
  const lista = [...marcadas, ...naBusca.filter((g) => !selecionadas.includes(g.slug))];
  /** quantas das que a busca encontrou ainda NÃO estão marcadas (o que sobra para escolher) */
  const naBuscaNaoMarcadas = naBusca.filter((g) => !selecionadas.includes(g.slug)).length;

  const alternar = (slug: string) => {
    const novas = selecionadas.includes(slug)
      ? selecionadas.filter((s) => s !== slug)
      : [...selecionadas, slug];
    onPatch({
      grupoEspecial: novas[0],
      condicoesAtencao: novas.slice(1).length ? novas.slice(1) : undefined,
      semCondicaoDeclarada: novas.length ? undefined : true,
      sugestoesDispensadas: undefined,
    });
  };

  return (
    <section aria-label="Condições de saúde" className="space-y-3">
      {/* Título em cima, apoio embaixo: as duas coisas na mesma linha brigavam por
          espaço e empurravam o link para fora do card em telas médias. */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-ink">Condições de saúde</h3>
          <p className="text-sm text-ink-2">
            Onde elas divergem, o plano aplica sempre a mais conservadora, e a primeira
            marcada dá o esqueleto de fases do treino.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVerTodas((v) => !v)}
          className="shrink-0 whitespace-nowrap text-sm font-semibold text-ink-2 underline decoration-border underline-offset-4 hover:text-ink hover:decoration-ink-3"
        >
          {verTodas ? "Mostrar menos" : `Ver as ${specialGroups.length}`}
        </button>
      </div>

      <label className="relative block">
        <span className="sr-only">Buscar condição</span>
        <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar condição (ex.: hipertensão, diabetes...)"
          className="h-12 w-full rounded-control border border-border bg-surface pl-10 pr-3 text-sm text-ink outline-none placeholder:text-ink-3 focus-visible:border-primary"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <ChipEscolha
          ativo={aluno.semCondicaoDeclarada === true && selecionadas.length === 0}
          onClick={() =>
            onPatch({ grupoEspecial: undefined, condicoesAtencao: undefined, semCondicaoDeclarada: true })
          }
        >
          Sem condição
        </ChipEscolha>
        {lista.map((g) => (
          <ChipEscolha key={g.slug} ativo={selecionadas.includes(g.slug)} onClick={() => alternar(g.slug)}>
            {/* A principal se identifica na própria etiqueta: sem isso, com duas marcadas
                ninguém saberia qual delas dá as fases do macrociclo. */}
            {g.nome}
            {aluno.grupoEspecial === g.slug && selecionadas.length > 1 ? " · principal" : ""}
          </ChipEscolha>
        ))}
      </div>

      <p className="text-xs text-ink-3">
        {/* O texto conta o que a pessoa vê: as marcadas primeiro, porque elas nunca somem, e
            depois quantas restam para escolher. O contador antigo dizia "6 de 23" incluindo
            as marcadas na conta, o que ficava errado assim que uma delas era fixada. */}
        {selecionadas.length > 0 && (
          <>
            <span className="font-semibold text-ink-2">
              {selecionadas.length} marcada{selecionadas.length === 1 ? "" : "s"}
            </span>
            , sempre à vista.{" "}
          </>
        )}
        {q
          ? `${naBuscaNaoMarcadas} outra${naBuscaNaoMarcadas === 1 ? "" : "s"} encontrada${naBuscaNaoMarcadas === 1 ? "" : "s"} de ${specialGroups.length}.`
          : temHistorico
            ? "Mais usadas por você. A busca abre a lista completa."
            : "A busca abre a lista completa."}{" "}
        Em branco, a avaliação sugere pelo IMC, pressão e idade medidos.
      </p>
    </section>
  );
}

/** Os 4 grupos do catálogo viram os 4 filtros da gaveta: mesma fonte, mesma ordem,
 *  e o rótulo curto vem declarado de lá (nunca recortado do título aqui). */
const GRUPOS_GAVETA_RESTRICAO: GrupoGaveta[] = GRUPOS_RESTRICAO.map((g) => ({
  id: g.id,
  filtro: g.curto,
  titulo: g.titulo,
}));

const ITENS_GAVETA_RESTRICAO: ItemGaveta[] = CATALOGO_RESTRICOES.map((it) => ({
  id: it.tag,
  grupo: it.grupo,
  titulo: it.titulo,
  descricao: it.descricao,
  // A consequência mostrada é a que o motor de fato aplica, autorada junto da regra.
  consequencia: it.efeitos.length ? `O motor ${it.efeitos[0].toLowerCase()}` : undefined,
  exclusivo: it.tag === "nenhuma_restricao",
}));

function RestricoesFisicas({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  const [gaveta, setGaveta] = React.useState<string | null>(null);
  const ativas = restricoesAtivas(aluno.restricoes);
  const seguranca = avaliarSeguranca(aluno.restricoes);
  const marcouNenhuma = aluno.restricoes.some((r) => r.tag === "nenhuma_restricao");

  const aplicar = (ids: string[]) => {
    const tags = ids as RestricaoTag[];
    // Preserva o que já foi detalhado (gatilhos, lado, liberação): reconstruir do
    // zero apagaria respostas que o profissional já tinha dado.
    const anteriores = new Map(aluno.restricoes.map((r) => [r.tag, r]));
    onPatch({ restricoes: tags.map((t) => anteriores.get(t) ?? criarRestricao(t)) });
    setGaveta(null);
  };

  return (
    <section aria-label="Restrições físicas" className="space-y-3 border-t border-border pt-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display font-bold text-ink">Restrições físicas</h3>
            {ativas.length > 0 && (
              <Pill tone="warning">
                {ativas.length} marcada{ativas.length === 1 ? "" : "s"}
              </Pill>
            )}
            {marcouNenhuma && <Pill tone="success">Nenhuma</Pill>}
          </div>
          <p className="text-sm text-ink-2">Mudam o que o motor escolhe, a amplitude e o apoio.</p>
        </div>
        <button
          type="button"
          onClick={() => setGaveta(GRUPOS_GAVETA_RESTRICAO[0].id)}
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-bold text-primary hover:underline"
        >
          <Plus aria-hidden className="h-4 w-4" /> Adicionar
        </button>
      </div>

      {/* As etiquetas removíveis são das restrições DE VERDADE. "Nenhuma" não entra aqui:
          desde que ela virou um chip logo abaixo, com o próprio estado marcado, listá-la
          também como etiqueta mostrava o mesmo rótulo duas vezes na mesma dobra. */}
      {ativas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {aluno.restricoes.filter((r) => r.tag !== "nenhuma_restricao").map((r) => (
            <span
              key={r.tag}
              className={cn(
                "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold",
                r.tag === "nenhuma_restricao"
                  ? "border-success/40 bg-success-tint text-success"
                  : "border-warning/40 bg-warning-tint text-warning",
              )}
            >
              {rotuloRestricao(r.tag)}
              <button
                type="button"
                aria-label={`Remover ${rotuloRestricao(r.tag)}`}
                onClick={() => onPatch({ restricoes: aluno.restricoes.filter((x) => x.tag !== r.tag) })}
                className="opacity-70 hover:opacity-100"
              >
                <X aria-hidden className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/*
        A RESPOSTA "NÃO TEM" MORA AQUI, E NÃO NO FIM DE UMA ABA.
        "Nenhuma restrição física" existe no catálogo desde sempre, no grupo `historico`, o
        quarto filtro da gaveta, abaixo de seis outros itens. Para dizer que o aluno não tem
        restrição era preciso abrir a gaveta, adivinhar a aba "Histórico", rolar até o fim,
        marcar e aplicar. O Filipe descreveu exatamente esse caminho, e a conclusão dele é a
        regra: "essa opção deveria estar muito intuitiva e na aba já inicial". Enquanto ela
        ficou escondida, a seção parecia travada, porque a única saída visível era declarar
        uma restrição que não existe.
        Agora é um clique, no mesmo lugar em que a pergunta é feita, no mesmo formato do
        "Sem condição" do card de cima. As quatro portas continuam ali para quem tem o que
        declarar.
      */}
      <div className="flex flex-wrap items-center gap-2">
        <ChipEscolha
          ativo={marcouNenhuma}
          onClick={() =>
            onPatch({
              restricoes: marcouNenhuma ? [] : [criarRestricao("nenhuma_restricao")],
            })
          }
        >
          Nenhuma restrição física
        </ChipEscolha>
        <span className="text-xs text-ink-3">
          {marcouNenhuma
            ? "Respondido. Se aparecer alguma, é só marcar abaixo."
            : "Se não houver nada a declarar, um clique resolve esta seção."}
        </span>
      </div>

      {/* As quatro portas do catálogo: cada uma abre a gaveta no seu filtro */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {GRUPOS_GAVETA_RESTRICAO.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGaveta(g.id)}
            className="flex min-h-[48px] items-center justify-between gap-2 rounded-card border border-border bg-surface px-4 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-soft hover:text-ink"
          >
            {g.filtro}
            <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-ink-3" />
          </button>
        ))}
      </div>

      {/* Detalhe do que foi marcado: gatilhos, lado, gravidade, liberação. Fica aqui
          (e não na gaveta) porque é sobre ESTE aluno, não sobre o catálogo. */}
      <DetalheRestricoes
        restricoes={aluno.restricoes}
        onChange={(next) => onPatch({ restricoes: next })}
        idBase="perfil-restr"
      />

      {seguranca.bloqueado && (
        <div className="rounded-card border border-cta/40 bg-cta/10 p-4" role="alert">
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-cta-text">
            <ShieldAlert aria-hidden className="h-4 w-4" /> Confirme a liberação antes de gerar o treino
          </div>
          <ul className="mb-2 space-y-1 text-sm text-ink">
            {seguranca.motivos.map((m) => (
              <li key={m} className="flex gap-2">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cta" />
                {m}
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-2">{seguranca.orientacao}</p>
        </div>
      )}

      {gaveta && (
        <GavetaSelecao
          titulo="Restrições físicas"
          instrucao="Marque o que limita movimento hoje."
          grupos={GRUPOS_GAVETA_RESTRICAO}
          itens={ITENS_GAVETA_RESTRICAO}
          grupoInicial={gaveta}
          selecionados={aluno.restricoes.map((r) => r.tag)}
          rotuloAplicar={["restrição", "restrições"]}
          aviso="Usado para adaptar exercício, amplitude, impacto e apoio. Não é diagnóstico nem substitui avaliação de profissional de saúde."
          onAplicar={aplicar}
          onFechar={() => setGaveta(null)}
        />
      )}
    </section>
  );
}

/** A mesma gravação para as fichas da cabeça e para o miolo: os dois campos mudam juntos. */
const gravarFarmacos =
  (onPatch: (p: Partial<Aluno>) => void) => (f: FarmacoSelecionado[], naoSei: boolean) =>
    onPatch({ farmacos: f.length ? f : undefined, farmacosNaoInformado: naoSei || undefined });

function SelecionadosDoPerfil({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  return (
    <SelecionadosFarmacos
      value={aluno.farmacos ?? []}
      naoInformado={Boolean(aluno.farmacosNaoInformado)}
      onChange={gravarFarmacos(onPatch)}
      className="mt-3.5"
    />
  );
}

function SecaoMedicamentos({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  return (
    <MedicamentosDoPerfil
      value={aluno.farmacos ?? []}
      naoInformado={Boolean(aluno.farmacosNaoInformado)}
      onChange={gravarFarmacos(onPatch)}
      idBase="perfil-farm"
      semSelecionados
    />
  );
}

const KIT_ACADEMIA = ["Máquina", "Barra", "Halter", "Polia", "Peso corporal"];

function SecaoEquipamentos({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  const confirmar = () => {
    const feitas = new Set(aluno.perfilConfirmado ?? []);
    feitas.add("equipamentos");
    onPatch({ perfilConfirmado: [...feitas] });
    toast("Equipamentos confirmados");
  };
  const confirmado = (aluno.perfilConfirmado ?? []).includes("equipamentos");
  const alternar = (eq: string) =>
    onPatch({
      equipamentos: aluno.equipamentos.includes(eq)
        ? aluno.equipamentos.filter((x) => x !== eq)
        : [...aluno.equipamentos, eq],
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm font-semibold">
        <button type="button" onClick={() => onPatch({ equipamentos: [...KIT_ACADEMIA] })} className="text-primary hover:underline">
          Kit típico de academia
        </button>
        <button type="button" onClick={() => onPatch({ equipamentos: [...EQUIPAMENTOS] })} className="text-primary hover:underline">
          Marcar todos
        </button>
        <button type="button" onClick={() => onPatch({ equipamentos: ["Peso corporal"] })} className="text-ink-3 hover:underline">
          Só peso corporal
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {EQUIPAMENTOS.map((eq) => (
          <ChipEscolha key={eq} ativo={aluno.equipamentos.includes(eq)} onClick={() => alternar(eq)} titulo={descricaoOpcao(eq)}>
            {eq}
          </ChipEscolha>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-ink-3">
          O aluno nasce com o kit típico marcado. Confirmar é o que transforma um padrão razoável
          numa informação sobre este local de treino.
        </p>
        <button
          type="button"
          onClick={confirmar}
          disabled={confirmado || aluno.equipamentos.length === 0}
          className={buttonClasses(confirmado ? "ghost" : "primary", "sm")}
        >
          {confirmado ? "Confirmado" : "Confirmar equipamentos"}
        </button>
      </div>
    </div>
  );
}

function SecaoNotas({ aluno, onPatch }: { aluno: Aluno; onPatch: (p: Partial<Aluno>) => void }) {
  const confirmado = (aluno.perfilConfirmado ?? []).includes("notas");
  return (
    <div className="space-y-4">
      <Campo
        label="Observações"
      >
        <textarea
          value={aluno.observacoes ?? ""}
          onChange={(e) => onPatch({ observacoes: e.target.value || undefined })}
          rows={5}
          placeholder="Ex.: treina cedo antes do trabalho, prefere não usar esteira."
          className="input resize-y"
        />
      </Campo>
      <div className="flex justify-end border-t border-border pt-4">
        <button
          type="button"
          onClick={() => {
            const feitas = new Set(aluno.perfilConfirmado ?? []);
            feitas.add("notas");
            onPatch({ perfilConfirmado: [...feitas] });
            toast("Perfil concluído");
          }}
          disabled={confirmado}
          className={buttonClasses(confirmado ? "ghost" : "primary", "sm")}
        >
          {confirmado ? "Perfil de saúde concluído" : "Concluir o perfil de saúde"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- Primitivo -------------------------------- */

function ChipEscolha({
  ativo,
  onClick,
  children,
  titulo,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
  titulo?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      title={titulo}
      className={cn(
        "min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors",
        ativo
          ? "border-primary bg-primary-tint font-bold text-primary"
          : "border-border bg-surface text-ink-2 hover:bg-surface-soft hover:text-ink",
      )}
    >
      {ativo && <span aria-hidden>✓ </span>}
      {children}
    </button>
  );
}

export default AlunoPerfil;
