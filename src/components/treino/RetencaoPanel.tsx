import * as React from "react";
import { Link } from "react-router-dom";
import { HeartPulse, MessageCircle, Copy, Check, ArrowRight } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import type { Aluno } from "@/data/alunos";
import type { Execucao } from "@/data/execucao";
import {
  alunosParaReativar,
  mensagensDeRetorno,
  linkWhatsApp,
  ROTULO_STATUS,
  type SinalRetencao,
} from "@/lib/retencao";
import { cn } from "@/lib/utils";

/**
 * "Reativar alunos": lê a execução real e aponta quem esfriou, com o texto de
 * WhatsApp pronto para o profissional enviar. O profissional envia; a gente não
 * dispara nada.
 *
 * ## No formato do protótipo: UM aluno em destaque, e a lista sob demanda
 *
 * O cartão abria com a lista inteira, cada linha com pílula, tempo e botão, e na coluna
 * estreita do Meu dia isso empurrava os atalhos para longe. O protótipo mostra uma frase sobre
 * o aluno mais parado e um botão. O resto da lista continua a um toque ("e mais N").
 *
 * ## Ele aparece sempre, e diz a verdade quando não há ninguém
 *
 * Com `return null` a coluna mudava de forma de um dia para o outro, e o profissional não sabia
 * que a leitura existia. São dois vazios diferentes e o texto separa os dois: ninguém parado, ou
 * parados que já estão na rota de hoje (a rota tem precedência, cada aluno aparece uma vez).
 */
export function RetencaoPanel({
  alunos,
  execucoes,
  nomeProfissional,
  paradosNaRota = 0,
}: {
  alunos: Aluno[];
  execucoes: Execucao[];
  nomeProfissional?: string;
  /** alunos parados que ficaram fora daqui porque já são parada da rota de hoje */
  paradosNaRota?: number;
}) {
  const sinais = React.useMemo(() => alunosParaReativar(alunos, execucoes), [alunos, execucoes]);
  const [aberto, setAberto] = React.useState<string | null>(null);
  const [lista, setLista] = React.useState(false);
  const [destaque, ...resto] = sinais;

  return (
    // O cartão "Reativar" do protótipo: gradiente de papel turquesa autorado
    // (analysis-tint para o fundo da página), rótulo em caixa alta turquesa.
    <Card
      className="border p-5"
      style={{ background: "linear-gradient(135deg,var(--analysis-tint),var(--bg))", borderColor: "#CFE7E4" }}
    >
      <h2 className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.12em] text-analysis">
        <HeartPulse className="h-3.5 w-3.5" aria-hidden /> Reativar
      </h2>

      {!destaque ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          {paradosNaRota > 0
            ? `${paradosNaRota === 1 ? "O aluno parado já está" : `Os ${paradosNaRota} alunos parados já estão`} na sua rota de hoje.`
            : "Ninguém parado: todos os alunos ativos registraram treino nos últimos dias."}
        </p>
      ) : (
        <>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">
            <Link to={`/alunos/${destaque.aluno.id}`} className="font-bold hover:underline">
              {destaque.aluno.nome}
            </Link>{" "}
            {destaque.semRegistro
              ? `foi cadastrado há ${destaque.diasSemTreinar} ${destaque.diasSemTreinar === 1 ? "dia" : "dias"} e ainda não registrou treino.`
              : `não registra treino há ${destaque.diasSemTreinar} ${destaque.diasSemTreinar === 1 ? "dia" : "dias"}.`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <button
              type="button"
              onClick={() => setAberto((a) => (a === destaque.aluno.id ? null : destaque.aluno.id))}
              aria-expanded={aberto === destaque.aluno.id}
              className="inline-flex h-10 items-center gap-2 rounded-control bg-ink px-3.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> Mandar mensagem
            </button>
            {resto.length > 0 && (
              <button
                type="button"
                onClick={() => setLista((v) => !v)}
                aria-expanded={lista}
                className="text-sm font-semibold text-analysis hover:underline"
              >
                {lista ? "Esconder os outros" : `e mais ${resto.length} ${resto.length === 1 ? "aluno" : "alunos"}`}
              </button>
            )}
          </div>
          {aberto === destaque.aluno.id && (
            <div className="mt-3">
              <Mensagens sinal={destaque} nomeProfissional={nomeProfissional} />
            </div>
          )}
          {lista && (
            <div className="mt-3 space-y-2.5">
              {resto.map((s) => (
                <LinhaRetencao
                  key={s.aluno.id}
                  sinal={s}
                  nomeProfissional={nomeProfissional}
                  aberto={aberto === s.aluno.id}
                  onToggle={() => setAberto((a) => (a === s.aluno.id ? null : s.aluno.id))}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/** Os textos prontos de um aluno, com o aviso de quando falta o WhatsApp no cadastro. */
function Mensagens({ sinal, nomeProfissional }: { sinal: SinalRetencao; nomeProfissional?: string }) {
  const mensagens = React.useMemo(() => mensagensDeRetorno(sinal, nomeProfissional), [sinal, nomeProfissional]);
  return (
    <div className="space-y-2">
      {!sinal.aluno.telefone && (
        <p className="text-xs text-ink-3">
          Sem WhatsApp no cadastro. Você pode copiar o texto e enviar pelo seu canal, ou{" "}
          <Link to={`/alunos/${sinal.aluno.id}`} className="font-semibold text-primary hover:underline">
            adicionar o número
          </Link>{" "}
          para abrir a conversa direto.
        </p>
      )}
      {mensagens.map((m) => (
        <ScriptCard key={m.titulo} titulo={m.titulo} texto={m.texto} telefone={sinal.aluno.telefone} />
      ))}
    </div>
  );
}

function LinhaRetencao({
  sinal,
  nomeProfissional,
  aberto,
  onToggle,
}: {
  sinal: SinalRetencao;
  nomeProfissional?: string;
  aberto: boolean;
  onToggle: () => void;
}) {
  const tempo = sinal.semRegistro
    ? `Cadastrado há ${sinal.diasSemTreinar} dia${sinal.diasSemTreinar === 1 ? "" : "s"}, sem registro`
    : `${sinal.diasSemTreinar} dia${sinal.diasSemTreinar === 1 ? "" : "s"} sem treinar`;

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-3 p-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-tint text-sm font-bold text-primary">
          {sinal.aluno.iniciais}
        </span>
        <div className="min-w-0 flex-1">
          <Link to={`/alunos/${sinal.aluno.id}`} className="block truncate font-semibold text-ink hover:underline">
            {sinal.aluno.nome}
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
            <Pill tone="neutral">{ROTULO_STATUS[sinal.status]}</Pill>
            <span>{tempo}</span>
          </div>
        </div>
        <button
          onClick={onToggle}
          aria-expanded={aberto}
          aria-label="Escrever mensagem de retorno"
          className={cn(buttonClasses("secondary", "sm"), "shrink-0")}
        >
          <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">Mensagem</span>
        </button>
      </div>

      {aberto && (
        <div className="border-t border-border p-3">
          <Mensagens sinal={sinal} nomeProfissional={nomeProfissional} />
        </div>
      )}
    </div>
  );
}

function ScriptCard({
  titulo,
  texto,
  telefone,
}: {
  titulo: string;
  texto: string;
  telefone?: string;
}) {
  const [copiado, setCopiado] = React.useState(false);
  const link = linkWhatsApp(telefone, texto);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* clipboard indisponível: o texto continua visível para seleção manual */
    }
  };

  return (
    <div className="rounded-lg bg-surface-soft p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-3">{titulo}</span>
        <div className="flex gap-1.5">
          <button
            onClick={copiar}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-ink-2 hover:bg-surface"
          >
            {copiado ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copiado ? "Copiado" : "Copiar"}
          </button>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonClasses("primary", "sm"), "!px-2.5 !py-1 text-xs")}
            >
              WhatsApp <ArrowRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      <p className="whitespace-pre-line text-sm text-ink-2">{texto}</p>
    </div>
  );
}
