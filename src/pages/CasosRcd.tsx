import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileSearch } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, Pill } from "@/components/ui/primitives";
import { SeloRCD } from "@/components/rcd/SeloRCD";
import { casosDocumentados } from "@/data/casosDocumentados";
import { getSpecialGroup } from "@/data/specialGroups";

/** /casos-rcd — biblioteca pública de casos documentados (prova de mecanismo). */
export function CasosRcd() {
  React.useEffect(() => {
    document.title = "Casos documentados pelo Motor RCD | Prescrição Inteligente";
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-14 md:px-6">
        <div className="text-center">
          <Pill tone="primary" icon={<FileSearch className="h-3 w-3" />} className="mb-3">
            Biblioteca pública, sem cadastro
          </Pill>
          <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">
            Veja o Motor RCD decidir casos reais
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-2">
            Não são exemplos escritos à mão: cada página abaixo roda o mesmo motor de raciocínio
            do produto, ao vivo: escolhas, descartes e o porquê de cada um.
          </p>
          <div className="mt-4 flex justify-center">
            <SeloRCD />
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {casosDocumentados.map((c) => {
            const grupo = c.grupoSlug ? getSpecialGroup(c.grupoSlug) : undefined;
            return (
              <Link key={c.slug} to={`/casos-rcd/${c.slug}`} className="group">
                <Card className="h-full p-5 transition-shadow group-hover:shadow-elevated">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {grupo && <Pill tone="warning">{grupo.nome}</Pill>}
                    <Pill tone="neutral">{c.answers.nivel}</Pill>
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink group-hover:text-primary">
                    {c.titulo}
                  </h2>
                  <p className="mt-1.5 text-sm text-ink-2">{c.contexto}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Ver a decisão documentada <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-ink-3">
          Conteúdo educacional de apoio à decisão do profissional habilitado (CREF): casos
          ilustrativos; a decisão em cada atendimento real é sempre do profissional.
        </p>
      </div>
    </div>
  );
}
