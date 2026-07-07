import * as React from "react";
import { Link } from "react-router-dom";
import {
  LifeBuoy,
  Mail,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
  Send,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { Accordion } from "@/components/ui/disclosure";
import { useUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const SUPORTE_EMAIL = "suporte@prescricao-inteligente.app";

const ASSUNTOS = ["Dúvida de uso", "Problema técnico", "Sugestão", "Assinatura / planos", "Outro"];

const FAQ = [
  {
    id: "pagar",
    q: "Preciso pagar para usar?",
    a: "Não. O plano gratuito já libera o essencial — Prescrever com justificativa, parte do Laboratório Visual e casos práticos. O plano Profissional abre o uso ilimitado, o comparador, os grupos especiais completos e a exportação de prescrições em PDF.",
  },
  {
    id: "dados",
    q: "Meus dados ficam salvos?",
    a: "Sim, no seu próprio navegador (armazenamento local). Você começa com o app vazio e pode “Carregar exemplos” para explorar. Conta com sincronização na nuvem está no roadmap.",
  },
  {
    id: "pdf",
    q: "Como exporto uma prescrição para o aluno?",
    a: "Na tela de resultados do Prescrever — ou no perfil do aluno — toque em “Exportar PDF”. O documento sai com a sua marca, os exercícios, as séries sugeridas e a justificativa, pronto para entregar.",
  },
  {
    id: "grupos",
    q: "O que são os Grupos Especiais?",
    a: "São jornadas educacionais para diferentes perfis (obesidade, hipertensão, idosos, dor lombar, entre outros), organizadas por modalidades, parâmetros a monitorar e 4 fases de progressão. A linguagem é prudente e não substitui avaliação médica.",
  },
  {
    id: "modos",
    q: "Qual a diferença entre Atender e Aprender?",
    a: "“Atender” é a ferramenta de trabalho: alunos, avaliações e prescrição com raciocínio. “Aprender” é o estudo: trilhas, casos práticos e seu progresso. Você alterna no seletor no topo da barra lateral.",
  },
  {
    id: "clinico",
    q: "Isso substitui avaliação médica ou profissional?",
    a: "Não. Todo o conteúdo é educacional e de apoio à decisão. Sempre valide com avaliação individualizada e com as diretrizes pertinentes a cada caso.",
  },
  {
    id: "celular",
    q: "Funciona no celular?",
    a: "Sim. A plataforma é responsiva e pode ser usada direto no navegador do celular, tablet ou computador.",
  },
];

export function Support() {
  const nomeUsuario = useUser((s) => s.name);
  const [nome, setNome] = React.useState(nomeUsuario ?? "");
  const [email, setEmail] = React.useState("");
  const [assunto, setAssunto] = React.useState(ASSUNTOS[0]);
  const [mensagem, setMensagem] = React.useState("");
  const [enviado, setEnviado] = React.useState<string | null>(null);

  const valido = nome.trim().length > 1 && /.+@.+\..+/.test(email) && mensagem.trim().length > 4;

  const enviar = () => {
    if (!valido) return;
    const protocolo = "PI-" + Date.now().toString(36).slice(-6).toUpperCase();
    try {
      const ticket = { protocolo, nome, email, assunto, mensagem, em: Date.now() };
      const arr = JSON.parse(localStorage.getItem("pi-suporte-tickets") || "[]");
      arr.push(ticket);
      localStorage.setItem("pi-suporte-tickets", JSON.stringify(arr));
    } catch {
      /* ignora falha de storage */
    }
    setEnviado(protocolo);
  };

  const mailtoHref =
    `mailto:${SUPORTE_EMAIL}?subject=` +
    encodeURIComponent(`[${assunto}] Suporte — ${nome || "usuário"}`) +
    `&body=` +
    encodeURIComponent(`${mensagem}\n\n— ${nome} (${email})`);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <SectionHeader
        eyebrow="Estamos aqui"
        icon={<LifeBuoy className="h-3 w-3" />}
        title="Suporte"
        subtitle="Tire dúvidas, relate um problema ou mande uma sugestão. Respondemos por e-mail em até 1 dia útil."
      />

      {/* Canais rápidos */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Canal
          icon={<GraduationCap className="h-5 w-5" />}
          titulo="Tutoriais"
          desc="Guias visuais passo a passo."
          to="/tutorial"
          cta="Abrir tutoriais"
        />
        <Canal
          icon={<Mail className="h-5 w-5" />}
          titulo="E-mail"
          desc={SUPORTE_EMAIL}
          href={`mailto:${SUPORTE_EMAIL}`}
          cta="Enviar e-mail"
        />
        <Canal
          icon={<MessageSquare className="h-5 w-5" />}
          titulo="Fale conosco"
          desc="Use o formulário abaixo."
          onClickAnchor="#form"
          cta="Ir ao formulário"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* FAQ */}
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Perguntas frequentes</h2>
          <Accordion
            items={FAQ.map((f) => ({
              id: f.id,
              title: f.q,
              content: <p className="text-sm text-ink-2">{f.a}</p>,
            }))}
          />
        </section>

        {/* Formulário */}
        <section id="form">
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Fale conosco</h2>
          {enviado ? (
            <Card tone="success" className="p-6 text-center">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-success text-white">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h3 className="font-display text-lg font-bold text-ink">Mensagem recebida!</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-2">
                Seu protocolo é <span className="font-semibold text-ink">{enviado}</span>. Responderemos no e-mail{" "}
                <span className="font-semibold text-ink">{email}</span> em até 1 dia útil.
              </p>
              <button
                onClick={() => {
                  setEnviado(null);
                  setMensagem("");
                }}
                className={cn(buttonClasses("secondary", "sm"), "mt-4")}
              >
                Enviar outra mensagem
              </button>
            </Card>
          ) : (
            <Card className="p-5 md:p-6">
              <div className="space-y-4">
                <Campo label="Seu nome">
                  <input value={nome} onChange={(e) => setNome(e.target.value)} className="input" placeholder="Como podemos te chamar?" />
                </Campo>
                <Campo label="Seu e-mail">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    inputMode="email"
                    className="input"
                    placeholder="para respondermos"
                  />
                </Campo>
                <Campo label="Assunto">
                  <select value={assunto} onChange={(e) => setAssunto(e.target.value)} className="input">
                    {ASSUNTOS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </Campo>
                <Campo label="Mensagem">
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    rows={4}
                    className="input"
                    placeholder="Descreva sua dúvida, o problema ou a sugestão."
                  />
                </Campo>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button onClick={enviar} disabled={!valido} className={buttonClasses("primary")}>
                  <Send className="h-4 w-4" /> Enviar mensagem
                </button>
                <a href={mailtoHref} className="text-sm font-medium text-ink-2 hover:text-ink">
                  Prefiro por e-mail
                </a>
              </div>
              <p className="mt-3 text-xs text-ink-3">
                Ao enviar, geramos um protocolo para acompanhamento. Não compartilhe senhas ou dados sensíveis.
              </p>
            </Card>
          )}
        </section>
      </div>

      {/* Status / versão */}
      <Card variant="soft" className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 text-sm">
        <span className="inline-flex items-center gap-2 font-semibold text-ink">
          <ShieldCheck className="h-4 w-4 text-success" /> Sistemas operacionais
        </span>
        <span className="text-ink-3">Versão 1.0</span>
        <Link to="/tutorial" className="ml-auto inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          Ver tutoriais <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  );
}

function Canal({
  icon,
  titulo,
  desc,
  to,
  href,
  onClickAnchor,
  cta,
}: {
  icon: React.ReactNode;
  titulo: string;
  desc: string;
  to?: string;
  href?: string;
  onClickAnchor?: string;
  cta: string;
}) {
  const inner = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="font-display font-bold text-ink">{titulo}</div>
        <div className="truncate text-xs text-ink-3">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
    </>
  );
  const cls = "flex items-center gap-3 rounded-card border border-border bg-surface p-4 shadow-soft transition-colors hover:bg-surface-soft";
  if (to) return <Link to={to} className={cls} aria-label={cta}>{inner}</Link>;
  if (href) return <a href={href} className={cls} aria-label={cta}>{inner}</a>;
  return (
    <a href={onClickAnchor} className={cls} aria-label={cta}>
      {inner}
    </a>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}
