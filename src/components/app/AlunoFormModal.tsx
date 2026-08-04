import * as React from "react";
import { ObjetivoDuplo } from "@/components/gps/ObjetivoDuplo";
import { X, MapPin, ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/primitives";
import { uid } from "@/lib/store";
import { OBJETIVOS, type GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import { iniciaisDe, type Aluno } from "@/data/alunos";
import { descricaoOpcao } from "@/data/opcoes-wizard";
import { useDialog } from "@/lib/useDialog";
import { cn } from "@/lib/utils";

const NIVEIS: { id: Nivel; curto: string }[] = [
  { id: "Iniciante", curto: "Iniciante" },
  { id: "Intermediário", curto: "Interm." },
  { id: "Avançado", curto: "Avanç." },
];

/** Quantos objetivos aparecem antes do "+N": os quatro mais usados no dia a dia. */
const OBJETIVOS_VISIVEIS = 4;

/** Kit típico de academia. O aluno nasce com ele porque o motor precisa de algum
 *  equipamento para ter catálogo; a seção Equipamentos do perfil é quem CONFIRMA,
 *  e até lá a régua de completude conta a seção como pendente, não como conferida. */
const KIT_PADRAO = ["Máquina", "Barra", "Halter", "Polia", "Peso corporal"];

/**
 * CRIAR ALUNO EM QUATRO CAMPOS.
 *
 * Este modal já teve doze campos: objetivo duplo, condição de saúde, restrições,
 * medicamentos, equipamentos, observações. Tudo aquilo é verdade sobre o aluno, e
 * nada daquilo o profissional tem na mão quando está com o aluno na frente pedindo
 * para começar. O resultado era um formulário que ninguém terminava, preenchido no
 * chute, e um perfil que parecia completo sem ser.
 *
 * Agora o cadastro pergunta só o que se sabe de cabeça e o resto vive na página de
 * perfil (`/alunos/:id/perfil`), que é onde a saúde é preenchida E editada depois.
 * O modal não edita mais nada: quem quer mudar um aluno vai ao perfil dele.
 *
 * O que NÃO mudou: o objetivo continua obrigatório (é ele que dá sentido a tudo o
 * que vem depois) e a idade continua validada na faixa de 12 a 100.
 */
export function AlunoFormModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (a: Aluno) => void;
}) {
  const [nome, setNome] = React.useState("");
  const [idade, setIdade] = React.useState("");
  const [nivel, setNivel] = React.useState<Nivel>("Iniciante");
  // Padrão alinhado ao posicionamento (condições/emagrecimento), não "Hipertrofia".
  const [objetivo, setObjetivo] = React.useState<GpsObjetivo>("Emagrecimento");
  const [objetivoSecundario, setObjetivoSecundario] = React.useState<GpsObjetivo | undefined>();
  const [todosObjetivos, setTodosObjetivos] = React.useState(false);
  const dialogRef = useDialog<HTMLDivElement>(onClose);

  const idadeNum = idade ? Number(idade) : undefined;
  const idadeForaDaFaixa = idadeNum != null && (idadeNum < 12 || idadeNum > 100);
  const podeSalvar = Boolean(nome.trim()) && !idadeForaDaFaixa;

  const objetivosMostrados = todosObjetivos ? OBJETIVOS : OBJETIVOS.slice(0, OBJETIVOS_VISIVEIS);
  const ocultos = OBJETIVOS.length - OBJETIVOS_VISIVEIS;

  const submit = () => {
    if (!podeSalvar) return;
    const agora = Date.now();
    onSave({
      id: uid(),
      status: "ativo",
      criadoEm: agora,
      nivelDesde: agora,
      nome: nome.trim(),
      iniciais: iniciaisDe(nome),
      idade: idade ? Number(idade) : undefined,
      objetivo,
      objetivoSecundario,
      nivel,
      // Estados de partida HONESTOS: lista vazia é "ainda não perguntei", e é assim
      // que a régua do perfil vai lê-los. Nada aqui afirma nada sobre o aluno.
      restricoes: [],
      equipamentos: KIT_PADRAO,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Novo aluno"
        className="max-h-modal w-full max-w-lg overflow-auto rounded-t-card bg-surface p-5 shadow-overlay outline-none sm:rounded-card md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Alça do bottom sheet no mobile (no desktop o modal é centrado e não tem alça) */}
        <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />

        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-ink">Novo aluno</h2>
            <p className="mt-0.5 text-sm text-ink-2">Só o essencial agora. Saúde e restrições no perfil.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-soft text-ink-3 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="novo-aluno-nome" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2">
              Nome
            </label>
            <input
              id="novo-aluno-nome"
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Mariana Alves"
              className="input h-12 text-base"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,7rem)_1fr]">
            <div>
              <label htmlFor="novo-aluno-idade" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2">
                Idade
              </label>
              <input
                id="novo-aluno-idade"
                value={idade}
                onChange={(e) => setIdade(e.target.value.replace(/\D/g, "").slice(0, 3))}
                inputMode="numeric"
                placeholder="34"
                aria-invalid={idadeForaDaFaixa}
                aria-describedby={idadeForaDaFaixa ? "novo-aluno-idade-erro" : undefined}
                className="input h-12 text-base"
              />
            </div>
            <fieldset className="min-w-0">
              <legend className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-2">Nível</legend>
              <div className="grid grid-cols-3 gap-2">
                {NIVEIS.map((n) => (
                  <Opcao key={n.id} ativo={nivel === n.id} onClick={() => setNivel(n.id)} forma="caixa">
                    {n.curto}
                  </Opcao>
                ))}
              </div>
            </fieldset>
          </div>
          {idadeForaDaFaixa && (
            <p id="novo-aluno-idade-erro" className="text-xs text-warning">
              Idade fora da faixa esperada (12 a 100).
            </p>
          )}

          <fieldset>
            <legend className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-2">Objetivo principal</legend>
            <div className="flex flex-wrap gap-2">
              {objetivosMostrados.map((o) => (
                <Opcao key={o} ativo={objetivo === o} onClick={() => setObjetivo(o)} titulo={descricaoOpcao(o)}>
                  {objetivo === o && <span aria-hidden>✓ </span>}
                  {o}
                </Opcao>
              ))}
              {!todosObjetivos && ocultos > 0 && (
                <button
                  type="button"
                  onClick={() => setTodosObjetivos(true)}
                  className="min-h-[44px] rounded-full border border-border bg-surface px-4 text-sm font-semibold text-primary hover:bg-surface-soft"
                >
                  + {ocultos}
                </button>
              )}
            </div>
            {/* O SEGUNDO objetivo entra aqui, e não só no perfil.
                Antes o cadastro oferecia um objetivo e o perfil oferecia dois, e o mesmo
                aluno tinha duas verdades diferentes dependendo da porta por onde entrou.
                O modo `somenteSecundario` mantém o modal curto: acrescenta uma linha, não
                um campo, e já traz o veredito de compatibilidade do par. */}
            <div className="mt-3 border-t border-border pt-3">
              <ObjetivoDuplo
                objetivo={objetivo}
                objetivoSecundario={objetivoSecundario}
                onChange={(o, s) => {
                  setObjetivo(o);
                  setObjetivoSecundario(s);
                }}
                somenteSecundario
                compacto
              />
            </div>
          </fieldset>

          {/* Para onde este cadastro leva. Dizer isso aqui é o que autoriza o modal a
              ser tão curto: o profissional sabe que não está deixando nada para trás. */}
          <div className="flex gap-2.5 rounded-card bg-analysis-tint p-3.5 text-sm text-ink">
            <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-analysis-text" />
            <p>
              Depois de criar, o próximo passo já aparece: <strong className="font-semibold">completar a saúde</strong>,
              ou avaliar direto.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button onClick={onClose} className="text-sm font-semibold text-ink-2 hover:text-ink">
            Cancelar
          </button>
          <button onClick={submit} disabled={!podeSalvar} className={cn(buttonClasses("primary"), "gap-2")}>
            Criar e abrir perfil <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Opção única: pílula por padrão, caixa quando divide uma grade (nível). */
function Opcao({
  ativo,
  onClick,
  children,
  titulo,
  forma = "pilula",
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
  titulo?: string;
  forma?: "pilula" | "caixa";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      title={titulo}
      className={cn(
        "min-h-[44px] border px-4 text-sm font-medium transition-colors",
        forma === "caixa" ? "rounded-card" : "rounded-full",
        ativo
          ? forma === "caixa"
            ? "border-ink bg-ink font-bold text-surface"
            : "border-primary bg-primary-tint font-bold text-primary"
          : "border-border bg-surface text-ink-2 hover:bg-surface-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
