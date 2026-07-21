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
 * dispara nada. Só aparece quando há alguém para reativar.
 */
export function RetencaoPanel({
  alunos,
  execucoes,
  nomeProfissional,
}: {
  alunos: Aluno[];
  execucoes: Execucao[];
  nomeProfissional?: string;
}) {
  const sinais = React.useMemo(() => alunosParaReativar(alunos, execucoes), [alunos, execucoes]);
  const [aberto, setAberto] = React.useState<string | null>(null);

  if (sinais.length === 0) return null;

  return (
    <Card variant="raised" className="border-l-4 border-l-cta p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#fdeceb] text-cta">
          <HeartPulse className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Reativar alunos</h2>
          <p className="text-sm text-ink-3">
            {sinais.length} aluno{sinais.length > 1 ? "s" : ""} sem registrar treino há dias
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {sinais.map((s) => (
          <LinhaRetencao
            key={s.aluno.id}
            sinal={s}
            nomeProfissional={nomeProfissional}
            aberto={aberto === s.aluno.id}
            onToggle={() => setAberto((a) => (a === s.aluno.id ? null : s.aluno.id))}
          />
        ))}
      </div>
    </Card>
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
  const mensagens = React.useMemo(
    () => mensagensDeRetorno(sinal, nomeProfissional),
    [sinal, nomeProfissional],
  );
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
          <div className="flex items-center gap-2">
            <Link to={`/alunos/${sinal.aluno.id}`} className="truncate font-semibold text-ink hover:underline">
              {sinal.aluno.nome}
            </Link>
            <Pill tone={sinal.status === "sumido" ? "warning" : "cta"}>{ROTULO_STATUS[sinal.status]}</Pill>
          </div>
          <p className="mt-0.5 text-xs text-ink-3">{tempo}</p>
        </div>
        <button
          onClick={onToggle}
          aria-expanded={aberto}
          className={buttonClasses("secondary", "sm")}
        >
          <MessageCircle className="h-4 w-4" /> Mensagem
        </button>
      </div>

      {aberto && (
        <div className="space-y-2 border-t border-border p-3">
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
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-ink-2 hover:bg-surface"
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
