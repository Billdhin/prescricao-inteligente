import * as React from "react";
import { X, Copy, Check, MessageCircle, Smartphone, RefreshCw, ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonClasses } from "@/components/ui/primitives";
import { useDialog } from "@/lib/useDialog";
import { useCloudAuth } from "@/lib/backend/cloudAuth";
import { criarConvite, statusAcessoAluno, revogarConvites, type ConviteAluno } from "@/lib/backend/supabaseRepo";
import { iniciaisDe, type Aluno } from "@/data/alunos";
import { useUser } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * O CICLO DE ACESSO DO ALUNO, num lugar só.
 *
 * O que existia antes era um botão "Gerar convite do aluno" que devolvia uma URL
 * e mais nada: o profissional não sabia o que o aluno faz com aquilo, se existe
 * senha, quem a define, até quando o link vale, nem se o aluno chegou a entrar.
 * Link sem resposta a essas perguntas não é acesso, é um texto na tela.
 *
 * As quatro perguntas e as respostas verdadeiras deste produto:
 *
 *  1. Como o aluno acessa? Pelo link, que abre `/aluno?convite=<token>`. O portal
 *     do aluno é a MESMA aplicação, na rota /aluno.
 *  2. Tem senha? Tem, e quem escolhe é o aluno, na hora de criar a conta (e-mail
 *     + senha dele). O profissional nunca vê nem define a senha do aluno. Não há
 *     senha compartilhada nem "senha do link".
 *  3. Até quando o link vale? O prazo vem da coluna `expira_em` do convite, e é
 *     ela que esta tela mostra. Nada de prazo escrito à mão no texto.
 *  4. Ele já entrou? `alunos.auth_user_id` preenchido é a prova, e é a mesma
 *     coluna que a RLS usa para liberar a leitura do treino. Se está preenchida,
 *     o aluno entrou de verdade.
 */
export function ConviteAlunoModal({ aluno, onClose }: { aluno: Aluno; onClose: () => void }) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const configured = useCloudAuth((s) => s.configured);
  const user = useUser();
  const primeiroNome = aluno.nome.split(" ")[0];

  const [carregando, setCarregando] = React.useState(true);
  const [gerando, setGerando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [copiado, setCopiado] = React.useState(false);
  const [status, setStatus] = React.useState<{ vinculado: boolean; vinculadoEm?: number; convite?: ConviteAluno }>({
    vinculado: false,
  });

  const carregar = React.useCallback(async () => {
    if (!configured) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      setStatus(await statusAcessoAluno(aluno.id));
    } catch (e) {
      setErro((e as Error)?.message ?? "Não consegui consultar o acesso agora.");
    } finally {
      setCarregando(false);
    }
  }, [aluno.id, configured]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  const gerar = async (substituindo: boolean) => {
    setGerando(true);
    setErro(null);
    try {
      // Link novo invalida o anterior: dois links vivos para o mesmo aluno é
      // superfície de vazamento sem nenhum ganho.
      if (substituindo) await revogarConvites(aluno.id);
      const convite = await criarConvite(aluno.id);
      setStatus((s) => ({ ...s, convite }));
      setCopiado(false);
    } catch (e) {
      setErro((e as Error)?.message ?? "Não consegui gerar o link agora.");
    } finally {
      setGerando(false);
    }
  };

  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const link = status.convite ? `${window.location.origin}${base}/aluno?convite=${status.convite.token}` : null;
  const linkCurto = link ? link.replace(/^https?:\/\//, "") : "";

  const copiar = () => {
    if (!link) return;
    navigator.clipboard?.writeText(link);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2500);
  };

  // WhatsApp com a mensagem pronta. Com telefone no cadastro, abre a conversa
  // dele; sem telefone, abre o seletor de contato do próprio WhatsApp.
  const texto = link
    ? `Oi, ${primeiroNome}! Seu treino está no app. Toque no link, crie sua conta com o seu e-mail e uma senha sua, e o treino aparece lá: ${link}`
    : "";
  const fone = (aluno.telefone ?? "").replace(/\D/g, "");
  const whats = link
    ? fone
      ? `https://wa.me/${fone.length <= 11 ? `55${fone}` : fone}?text=${encodeURIComponent(texto)}`
      : `https://wa.me/?text=${encodeURIComponent(texto)}`
    : "#";

  const fmtData = (ts: number) =>
    new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(ts));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Convidar ${primeiroNome} para o app`}
        className="max-h-modal w-full max-w-lg overflow-auto rounded-card bg-surface p-5 shadow-overlay outline-none md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink">Convidar {primeiroNome} para o app</h2>
          <button onClick={onClose} aria-label="Fechar" className="-mt-1 rounded-full p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-ink-2">
          {primeiroNome} recebe o treino no celular pelo link, com a sua marca.
        </p>

        {!configured ? (
          <div className="mt-4 rounded-card border border-border bg-surface-soft p-4">
            <p className="text-sm text-ink-2">
              O acesso online ainda não está ligado neste aparelho. A prévia mostra exatamente a tela que o aluno vê.
            </p>
            <Link to={`/alunos/${aluno.id}/preview`} className={cn(buttonClasses("secondary", "sm"), "mt-3")}>
              <Smartphone className="h-4 w-4" /> Ver a prévia do app
            </Link>
          </div>
        ) : carregando ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-ink-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Consultando o acesso de {primeiroNome}...
          </div>
        ) : status.vinculado ? (
          /* Já entrou: nada de link novo. O que falta aqui é informação, não ação. */
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3 rounded-card border border-success/40 bg-success-tint p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
              <div className="min-w-0">
                <div className="font-display font-bold text-ink">{primeiroNome} já está no app</div>
                <p className="mt-0.5 text-sm text-ink-2">
                  {status.vinculadoEm ? `Entrou em ${fmtData(status.vinculadoEm)}. ` : ""}
                  Para entrar de novo, basta abrir{" "}
                  <strong className="text-ink">{`${window.location.host}${base}/aluno`}</strong> com o e-mail e a senha
                  que escolheu no cadastro.
                </p>
              </div>
            </div>
            <PassoAPasso primeiroNome={primeiroNome} host={`${window.location.host}${base}`} />
            <Link to={`/alunos/${aluno.id}/preview`} className={buttonClasses("secondary", "sm")}>
              <Smartphone className="h-4 w-4" /> Ver o que {primeiroNome} vê
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {link ? (
              <>
                <div>
                  <label className="mb-1.5 block text-2xs font-semibold uppercase tracking-wide text-ink-3" htmlFor="convite-link">
                    Link de acesso
                  </label>
                  <input
                    id="convite-link"
                    readOnly
                    value={linkCurto}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-control border border-border bg-surface-soft px-3 py-2.5 text-sm text-ink-2"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button onClick={copiar} className={buttonClasses("secondary", "sm")}>
                      {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiado ? "Copiado" : "Copiar link"}
                    </button>
                    <a href={whats} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "sm")}>
                      <MessageCircle className="h-4 w-4" /> Enviar pelo WhatsApp
                    </a>
                    <button
                      onClick={() => void gerar(true)}
                      disabled={gerando}
                      className={buttonClasses("ghost", "sm")}
                    >
                      <RefreshCw className={cn("h-4 w-4", gerando && "animate-spin")} /> Gerar outro link
                    </button>
                  </div>
                </div>

                {status.convite && (
                  <p className="text-xs text-ink-3">
                    O link vale até {fmtData(status.convite.expiraEm)}, serve uma vez só e vincula a conta de{" "}
                    {primeiroNome} a você. Cada aluno vê apenas o próprio treino. Gerar outro link cancela este.
                  </p>
                )}

                <PassoAPasso primeiroNome={primeiroNome} host={`${window.location.host}${base}`} />
              </>
            ) : (
              <>
                <PassoAPasso primeiroNome={primeiroNome} host={`${window.location.host}${base}`} />
                <button onClick={() => void gerar(false)} disabled={gerando} className={buttonClasses("primary")}>
                  {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  {gerando ? "Gerando..." : "Gerar o link de acesso"}
                </button>
              </>
            )}
          </div>
        )}

        {erro && <p className="mt-3 text-sm text-danger">{erro}</p>}

        {/* "O que o aluno vê": a mesma pele escura do app do aluno, com a marca do
            profissional aplicada de verdade (nome e cor saem do perfil dele). */}
        <div className="mt-5">
          <div className="mb-2 text-2xs font-semibold uppercase tracking-wide text-ink-3">O que {primeiroNome} vê</div>
          <PreviaMini nomeAluno={primeiroNome} marcaNome={user.empresa || user.name || "Seu treino"} cor={user.corPrimaria || "#2064EC"} />
        </div>
      </div>
    </div>
  );
}

/** Os três passos do ciclo, com a resposta sobre a senha no passo em que ela
 *  aparece. É a informação que faltava e que fazia o link parecer quebrado. */
function PassoAPasso({ primeiroNome, host }: { primeiroNome: string; host: string }) {
  const passos = [
    { t: "Você envia o link", d: "Pelo WhatsApp, e-mail ou como preferir." },
    {
      t: `${primeiroNome} cria a conta`,
      d: "Com o próprio e-mail e uma senha escolhida na hora. Você nunca vê essa senha.",
    },
    { t: "O treino aparece no celular", d: `Depois disso a entrada é direto em ${host}/aluno.` },
  ];
  return (
    <ol className="space-y-2.5 rounded-card border border-border bg-surface-soft p-4">
      {passos.map((p, i) => (
        <li key={p.t} className="flex gap-3">
          <span className="tabular grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-2xs font-bold text-on-primary">
            {i + 1}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink">{p.t}</div>
            <div className="text-xs text-ink-2">{p.d}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Miniatura fiel do topo do app do aluno (pele escura + hero em gradiente da
 *  marca), para o profissional ver a cor e o nome dele aplicados na hora. */
function PreviaMini({ nomeAluno, marcaNome, cor }: { nomeAluno: string; marcaNome: string; cor: string }) {
  return (
    <div className="overflow-hidden rounded-card border border-border" style={{ background: "#0A0D14" }}>
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-control text-xs font-bold"
          style={{ background: cor, color: "#ffffff" }}
        >
          {iniciaisDe(marcaNome)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-2xs font-semibold" style={{ color: "#9DB2D6" }}>
            {marcaNome}
          </div>
          <div className="font-display text-base font-bold" style={{ color: "#F2F6FC" }}>
            Oi, {nomeAluno}!
          </div>
        </div>
      </div>
      <div className="mx-4 mb-4 rounded-card p-4" style={{ backgroundImage: `linear-gradient(135deg, ${cor} 0%, #14B3BA 100%)` }}>
        <div className="text-2xs font-bold uppercase tracking-wider text-white/80">Treino de hoje</div>
        <div className="mt-0.5 font-display text-lg font-bold text-white">Treino A · Inferiores</div>
        <div className="mt-3 grid h-9 place-items-center rounded-full bg-white text-sm font-bold" style={{ color: "#17202E" }}>
          Começar treino
        </div>
      </div>
    </div>
  );
}
