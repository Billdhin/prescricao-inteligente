import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { Card, buttonClasses } from "@/components/ui/primitives";
import { SemaforoLiberacao } from "@/components/rcd/SemaforoLiberacao";
import { specialGroups, getSpecialGroup } from "@/data/specialGroups";
import type { Aluno } from "@/data/alunos";
import { useAlunos, useUser, isPremiumUnlocked } from "@/lib/store";
import { estadoSemaforo, type EstadoSemaforo } from "@/lib/gps/semaforoDiario";
import { cn } from "@/lib/utils";
import { AvatarAluno } from "@/components/alunos/FotoAluno";
import { tintaDoAluno, TINTAS_AVATAR_NEUTRAS } from "@/components/alunos/tintaAvatar";

/**
 * /semaforo é o "Semáforo do dia": o painel operacional da carteira. Quem já fez o
 * semáforo hoje, quem segue com pendência (vermelho não reaberto) e quem falta,
 * com 1 clique para a aba Semáforo do aluno. O caminho POR ALUNO é a lista; o
 * fluxo AVULSO (sem aluno, por grupo) fica embaixo, para uma liberação rápida que
 * não pertence a ninguém da carteira.
 */

const fmtDDMM = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(ts));
const fmtHora = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(ts));

/**
 * A TRIAGEM DA LISTA, na ordem do protótipo: o que reabre a sessão (vermelho pendente), o que
 * ainda falta fazer (sem registro hoje), o que foi liberado com ajuste e, por último, quem já
 * está liberado. Antes só o vermelho subia, e quem faltava ficava misturado aos verdes.
 */
function ordemDaLinha(e: EstadoSemaforo): number {
  if (e.vermelhoPendente) return 0;
  if (!e.hoje) return 1;
  return e.hoje.resultado === "amarelo" ? 2 : 3;
}

export function Semaforo() {
  const [params] = useSearchParams();
  const alunos = useAlunos((s) => s.alunos);
  const liberacoes = useAlunos((s) => s.liberacoes);
  const { plan } = useUser();
  const unlocked = isPremiumUnlocked(plan);

  const ativos = alunos.filter((a) => a.status === "ativo");
  // Estado de HOJE de cada aluno ativo, da fonte única, na ordem da triagem.
  const linhas = ativos
    .map((a) => ({ aluno: a, estado: estadoSemaforo(a.id, liberacoes) }))
    .sort(
      (x, y) =>
        ordemDaLinha(x.estado) - ordemDaLinha(y.estado) || x.aluno.nome.localeCompare(y.aluno.nome, "pt-BR"),
    );
  // Falta liberar = sem registro de hoje, ou com um "não liberado" ainda aberto.
  const faltam = linhas.filter((l) => !l.estado.hoje || l.estado.vermelhoPendente).length;

  // Avulso (sem aluno): mantém só o seletor de GRUPO. O caminho por aluno agora é a
  // lista acima, então o seletor de aluno saiu daqui. Aceita ?grupo e ?fase para os
  // atalhos que ainda caem no semáforo avulso (ex.: prescrição sem aluno).
  const [grupoSlug, setGrupoSlug] = React.useState(() => {
    const g = params.get("grupo");
    return g && getSpecialGroup(g) ? g : "geral";
  });
  const fase = Number(params.get("fase")) || undefined;
  // Quem chega por um atalho com ?grupo= veio PARA a liberação avulsa: encontrá-la fechada
  // obrigava a achar e abrir o recolhido para ver o que o atalho prometeu.
  const [avulsaAberta, setAvulsaAberta] = React.useState(() => params.has("grupo"));

  // As três luzes do protótipo, contadas da mesma fonte da lista: verde e
  // amarelo REGISTRADOS HOJE, e o vermelho pendente (de qualquer dia), que é o
  // que reabre a sessão.
  const verdes = linhas.filter((l) => !l.estado.vermelhoPendente && l.estado.hoje?.resultado === "verde").length;
  const amarelos = linhas.filter((l) => !l.estado.vermelhoPendente && l.estado.hoje?.resultado === "amarelo").length;
  const vermelhos = linhas.filter((l) => !!l.estado.vermelhoPendente).length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Cabeçalho do protótipo, o mesmo de Avaliar e reavaliar: sobretítulo sem ícone e o
          título de 26px no celular. Sem subtítulo: a pílula e as três luzes logo abaixo já
          dizem quem foi liberado e quem falta, e a frase repetia os dois. */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-[1_1_320px]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Rotina do dia</p>
          <h1 className="mt-2 font-display text-[clamp(26px,3vw,36px)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
            Semáforo do dia
          </h1>
        </div>
        {faltam > 0 ? (
          <span className="tabular rounded-full bg-warning-tint px-3.5 py-[9px] text-[13px] font-bold text-warning">
            {faltam} para liberar
          </span>
        ) : ativos.length > 0 ? (
          <span className="rounded-full bg-success-tint px-3.5 py-[9px] text-[13px] font-bold text-success">
            Todos liberados
          </span>
        ) : null}
      </div>

      {/* As três luzes do dia, no vocabulário do protótipo: círculo cheio com
          halo, número grande e rótulo, cada família na sua tinta AA. O vermelho
          pulsa só quando existe pendência. */}
      {ativos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 lg:gap-3">
          <LuzDoDia n={verdes} rotulo={verdes === 1 ? "liberado" : "liberados"} familia="verde" />
          <LuzDoDia n={amarelos} rotulo="com ajuste" familia="amarelo" />
          <LuzDoDia n={vermelhos} rotulo={vermelhos === 1 ? "não liberado" : "não liberados"} familia="vermelho" pulsa={vermelhos > 0} />
        </div>
      )}

      {/* Lista dos alunos ativos com o estado de hoje */}
      {ativos.length === 0 ? (
        <Card className="!mt-[18px] flex flex-col items-center gap-3 p-8 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-tint text-primary">
            <Users className="h-6 w-6" />
          </span>
          <p className="max-w-sm text-sm text-ink-2">
            Você ainda não tem alunos ativos. Cadastre um aluno para fazer o semáforo de liberação
            antes das sessões.
          </p>
          <Link to="/alunos" className={buttonClasses("primary", "sm")}>
            <Users className="h-4 w-4" /> Ir para Alunos
          </Link>
        </Card>
      ) : (
        // Sem divisórias entre as linhas, como o protótipo: cada linha já é um bloco com
        // raio próprio e fundo no toque, e o filete entre elas só somava ruído.
        <Card className="!mt-[18px] p-2.5">
          <ul>
            {linhas.map(({ aluno, estado }) => {
              const falta = !estado.hoje || !!estado.vermelhoPendente;
              return (
                <li key={aluno.id}>
                  <Link
                    to={`/alunos/${aluno.id}?aba=semaforo`}
                    className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[14px] p-3 transition-colors duration-200 hover:bg-surface-soft"
                  >
                    <AvatarAluno
                      aluno={aluno}
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-[14px] font-display text-[13px] font-bold",
                        tintaDoAluno(aluno.id, TINTAS_AVATAR_NEUTRAS),
                      )}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[14.5px] font-semibold text-ink">{aluno.nome}</div>
                      <EstadoHoje estado={estado} aluno={aluno} />
                    </div>
                    {/* A ação é sempre uma pílula escrita: "Fazer" escura quando falta, "Ver"
                        clara quando já foi feito. Fica como span: a linha inteira já é o link,
                        e um botão dentro dele seria um interativo aninhado. */}
                    {falta ? (
                      <span className="whitespace-nowrap rounded-full bg-ink px-3 py-[7px] text-[13px] font-semibold text-surface">
                        Fazer
                      </span>
                    ) : (
                      <span className="whitespace-nowrap rounded-full bg-bg px-3 py-[7px] text-[13px] font-semibold text-ink">
                        Ver
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* Semáforo avulso (sem aluno): recolhido, como o "Liberação avulsa →" do
          mockup. É exceção, não rotina; aberto por padrão competia com a lista. */}
      <details className="group" open={avulsaAberta} onToggle={(e) => setAvulsaAberta(e.currentTarget.open)}>
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-[13.5px] font-semibold text-primary hover:underline">
          Liberação avulsa (sem aluno)
          <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden />
        </summary>
        <p className="mt-2 text-sm text-ink-2">
          Uma liberação rápida que não fica no histórico de ninguém. O semáforo de um aluno da carteira se faz no perfil
          dele, pela lista acima.
        </p>

        <Card className="mt-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Grupo / condição</span>
            <select value={grupoSlug} onChange={(e) => setGrupoSlug(e.target.value)} className="input">
              <option value="geral">Sem condição especial (checklist geral)</option>
              {/* Desde a rodada de gates clínicos, TODA condição tem checklist próprio, e
                  `check:semaforo` trava a volta do "cai no geral". O aviso que existia aqui
                  saiu junto com a causa dele. */}
              {specialGroups.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.nome}
                  {g.premium && !unlocked ? " (Premium)" : ""}
                </option>
              ))}
            </select>
          </label>
        </Card>

        <div className="mt-4">
          <SemaforoLiberacao grupoSlug={grupoSlug} fase={fase} />
        </div>
      </details>
    </div>
  );
}

/** Uma das três luzes do topo: círculo cheio com halo na cor da família e o
 *  número na tinta que escreve. As cores vêm dos tokens (fill acende, texto
 *  escreve, tint forra), nunca de par inventado. */
function LuzDoDia({
  n,
  rotulo,
  familia,
  pulsa,
}: {
  n: number;
  rotulo: string;
  familia: "verde" | "amarelo" | "vermelho";
  pulsa?: boolean;
}) {
  const f =
    familia === "verde"
      ? { caixa: "border-success-fill/25 bg-success-tint", luz: "var(--success-fill)", halo: "rgba(29,181,108,.18)", tinta: "var(--success)" }
      : familia === "amarelo"
        ? { caixa: "border-warning-fill/30 bg-warning-tint", luz: "var(--warning-fill)", halo: "rgba(232,163,23,.18)", tinta: "var(--warning)" }
        : { caixa: "border-danger-fill/25 bg-danger-tint", luz: "var(--danger-fill)", halo: "rgba(229,72,77,.18)", tinta: "var(--danger)" };
  return (
    // No celular a luz vai EM CIMA do número, tudo centrado, como o protótipo: lado a lado,
    // os três cartões deixavam 30px para o rótulo, e "não liberados" precisa de 77. O rótulo
    // é o que dá sentido ao número, por isso ele quebra em vez de cortar.
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-card border px-2 py-3 text-center lg:flex-row lg:gap-3.5 lg:p-[18px] lg:text-left",
        f.caixa,
      )}
    >
      <span
        aria-hidden
        // O pulso é de OPACIDADE (1 a .35), como o protótipo, e só com pendência: pulsar com
        // zero seria alarme falso.
        className={cn("h-7 w-7 shrink-0 rounded-full lg:h-11 lg:w-11", pulsa && "motion-safe:animate-pulso")}
        style={{ background: f.luz, boxShadow: `0 0 0 6px ${f.halo}` }}
      />
      <span className="min-w-0">
        <b className="tabular block font-display text-[28px] font-bold leading-none tracking-[-0.03em]" style={{ color: f.tinta }}>
          {n}
        </b>
        <span className="block text-[12.5px] leading-tight" style={{ color: f.tinta }}>
          {rotulo}
        </span>
      </span>
    </div>
  );
}

/**
 * O ESTADO DE HOJE, escrito na cor da família e aberto por um ponto de 10px (cheio quando
 * houve registro, vazado quando ainda falta). Texto e não pílula, como o protótipo: a pílula
 * com fundo e ícone repetia três vezes o sinal que o ponto e a cor já dão.
 *
 * Só dado que existe: a HORA vem do registro (`data` é timestamp); o "treina às 09:00" do
 * protótipo não entra porque o aluno não tem horário de treino gravado, e no lugar dele vai a
 * data do último semáforo. A pressão e a dor em número ("PA 160/100", "dor 4/10") também não:
 * o registro guarda a OPÇÃO marcada no checklist, não o valor medido.
 *
 * Ordem: vermelho pendente (de qualquer dia) primeiro; senão o resultado registrado hoje;
 * senão "Sem semáforo hoje", neutro, porque ausência de registro não é pendência clínica.
 */
function EstadoHoje({ estado, aluno }: { estado: EstadoSemaforo; aluno: Aluno }) {
  // Flexiona só quando o sexo está preenchido; sem ele, fica o masculino genérico.
  const a = aluno.sexo === "F" ? "a" : "o";
  let texto: string;
  let cor: string;
  let ponto: string | null;
  const vermelho = estado.vermelhoPendente ?? (estado.hoje?.resultado === "vermelho" ? estado.hoje : undefined);
  if (vermelho) {
    texto = `Não liberad${a} em ${fmtDDMM(vermelho.data)}`;
    cor = "text-danger";
    ponto = "bg-danger-fill";
  } else if (estado.hoje) {
    const verde = estado.hoje.resultado === "verde";
    texto = `${verde ? `Liberad${a}` : `Liberad${a} com ajuste`} · ${fmtHora(estado.hoje.data)}`;
    cor = verde ? "text-success" : "text-warning";
    ponto = verde ? "bg-success-fill" : "bg-warning-fill";
  } else {
    texto = estado.ultimo ? `Sem semáforo hoje · último em ${fmtDDMM(estado.ultimo.data)}` : "Sem semáforo hoje";
    cor = "text-ink-2";
    ponto = null;
  }
  // Quando a conduta divergiu do semáforo, o registro dela existe; a lista avisa que existe.
  const registro = vermelho ?? estado.hoje;
  if (registro?.decisaoContraria) texto += " · conduta registrada";

  return (
    <div className={cn("mt-1 flex items-start gap-2 text-[12.5px] font-semibold leading-snug", cor)}>
      {/* Decorativo: o estado está todo no texto (nunca só em cor ou forma). */}
      <span aria-hidden className={cn("mt-[3.5px] h-2.5 w-2.5 shrink-0 rounded-full", ponto ?? "border-2 border-ink-4")} />
      <span className="min-w-0">{texto}</span>
    </div>
  );
}
