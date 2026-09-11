import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, Clock, Mail, MessageSquare, PlayCircle } from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { tutorials, type Tutorial } from "@/data/tutorials";
import { cn } from "@/lib/utils";

const modoPill: Record<Tutorial["modo"], { label: string; tone: "primary" | "analysis" | "neutral" }> = {
  atender: { label: "Atender", tone: "primary" },
  aprender: { label: "Aprender", tone: "analysis" },
  ambos: { label: "Atender e Aprender", tone: "neutral" },
};

/** O mesmo endereço da página de suporte: um canal só, escrito num lugar só de cada lado. */
const SUPORTE_EMAIL = "suporte@mapadaprescricao.com.br";

export function Tutorial() {
  return (
    <div className="mx-auto max-w-5xl space-y-[22px] lg:space-y-8">
      {/* O protótipo inverte os papéis (sobrelinha "Ajuda", título "Passo a passo e suporte").
          Aqui o TÍTULO continua "Ajuda", o mesmo rótulo do menu que trouxe a pessoa até aqui:
          é a regra da casa (check:menu), e chegar pelo item "Ajuda" numa tela com outro nome
          é a dessincronização de vocabulário que o menu já corrigiu uma vez. */}
      <SectionHeader
        eyebrow="Passo a passo e suporte"
        icon={<GraduationCap className="h-3 w-3" />}
        title="Ajuda"
        subtitle="Guias visuais, passo a passo, das ações principais. Cada passo tem um atalho para fazer na hora, e o suporte fica a um clique."
      />

      {/* Guia em destaque. Não existe no protótipo, mas cumpre o que promete (abre o guia pelo
          slug) e é o que o primeiro acesso precisa; fica leve para não pesar mais que a lista. */}
      <Card className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4 md:p-5 lg:shadow-none">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-primary-tint text-primary">
          <PlayCircle className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-ink">Comece por aqui</h2>
          <p className="mt-1 text-sm leading-normal text-ink-2">
            Se é seu primeiro contato, o guia <span className="font-semibold text-ink">“Prescreva para um aluno”</span> mostra
            o fluxo completo (do cadastro à prescrição em PDF) em poucos minutos.
          </p>
        </div>
        {/* O card promete "Prescreva para um aluno", então o botão abre ESSE guia pelo slug. Ele
            abria `tutorials[0]`, que é "Do semáforo ao prontuário assinado": prometia um guia e
            entregava outro. */}
        <Link to="/tutorial/prescrever-para-aluno" className={cn(buttonClasses("primary"), "self-start md:self-auto")}>
          Começar <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      {/* Tutoriais numerados no desenho do protótipo mobile: quadrado navy com o número em
          teal, e título e resumo ao lado, sem corte. O título ia numa linha só com reticências
          e, no celular, "Do semáforo ao prontuário assinado" virava "Do semáforo ao pr...". A
          numeração é a ordem real da lista; modo e nível ficam para as telas largas. */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {tutorials.map((t, i) => {
          const m = modoPill[t.modo];
          return (
            <Link
              key={t.slug}
              to={`/tutorial/${t.slug}`}
              className="group flex items-start gap-3 rounded-[16px] border border-border bg-surface p-4 transition-colors hover:bg-surface-soft"
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] font-display text-xs font-bold"
                style={{ background: "#0B1628", color: "#7FE3D8" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14.5px] font-bold leading-snug text-ink">{t.titulo}</h3>
                <p className="mt-0.5 text-[12.5px] leading-[1.4] text-ink-2">{t.resumo}</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-2xs text-ink-3">
                  <Clock aria-hidden className="h-3 w-3" /> {t.duracao} · {t.steps.length} passos
                </p>
                <div className="mt-2.5 hidden flex-wrap gap-1.5 sm:flex">
                  <Pill tone={m.tone}>{m.label}</Pill>
                  <Pill tone="neutral">{t.nivel}</Pill>
                </div>
              </div>
              <ArrowRight
                aria-hidden
                className="mt-2 hidden h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 sm:block"
              />
            </Link>
          );
        })}
      </div>

      {/* Fale com a gente: superfície navy fixa (fora do tema claro/escuro), no desenho do
          protótipo, com dois canais que EXISTEM. O protótipo põe "WhatsApp" e "Resposta do
          Filipe em até 1 dia útil": não há WhatsApp de suporte no produto, não há prazo de
          resposta combinado com ninguém, e o Filipe forma quem prescreve, não atende chamado.
          Os canais reais são o e-mail e o formulário da página de suporte. */}
      <section className="rounded-card p-[22px]" style={{ background: "#0B1628", color: "#F3F1EA" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1 basis-64">
            <b className="block font-display text-lg font-bold">Fale com a gente</b>
            <span className="mt-0.5 block text-[13.5px]" style={{ color: "#B9C6D6" }}>
              Dúvida, problema ou sugestão: o suporte responde por e-mail.
            </span>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <a
              href={`mailto:${SUPORTE_EMAIL}`}
              className="inline-flex h-10 items-center gap-2 rounded-control px-3.5 text-[13.5px] font-bold transition-[filter] hover:brightness-110"
              style={{ background: "#E8A317", color: "#0B1628" }}
            >
              <Mail className="h-4 w-4" aria-hidden /> Enviar e-mail
            </a>
            <Link
              to="/suporte#form"
              className="inline-flex h-10 items-center gap-2 rounded-control px-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,.2)" }}
            >
              <MessageSquare className="h-4 w-4" aria-hidden /> Enviar mensagem
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
