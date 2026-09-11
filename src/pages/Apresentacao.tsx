import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { VslPlayer } from "@/vsl/VslPlayer";
import { VSL_APRESENTACAO } from "@/vsl/videos";
import {
  COBRANCA_ATIVA,
  PRECO_FUNDADOR_ANO,
  PRECO_FUNDADOR_MES,
  PRECO_MENSAL,
  VAGAS_FUNDADOR,
} from "@/data/planos";

/**
 * PÁGINA DE APRESENTAÇÃO (VSL), no formato de página da VTurb: título, o player e, embaixo,
 * a oferta escondida até o pitch. O "código de delay" é o da VTurb, sem tirar nem pôr: a
 * oferta tem a classe `esconder` e o player a revela em `VSL_APRESENTACAO.pitch` com
 * `persist`, então quem já chegou ao preço numa visita anterior vê a oferta na hora.
 *
 * FICA ATRÁS DA COBRANÇA, como a garantia da landing (check:legal bloco I). O vídeo promete
 * sete dias para testar e reembolso; enquanto COBRANCA_ATIVA for false não existe pagamento a
 * devolver, então a página só abre com o link de prévia (`?previa=1`), sem índice em buscador,
 * para conferir tudo em produção antes de ligar. O `check:vsl` trava esse portão.
 */
export function Apresentacao() {
  const { search } = useLocation();
  const previa = new URLSearchParams(search).has("previa");
  const liberada = COBRANCA_ATIVA || previa;

  useNaoIndexar();

  if (!liberada) return <Navigate to="/" replace />;

  const revelarNoPitch = (player: { displayHiddenElements: (s: number, sel: string[], o: { persist: boolean }) => void }) =>
    player.displayHiddenElements(VSL_APRESENTACAO.pitch, [".esconder"], { persist: true });

  return (
    <div className="vsl-pagina">
      <style>{CSS}</style>
      {!COBRANCA_ATIVA && (
        <p className="vsl-previa" role="note">
          Prévia interna. A cobrança ainda não está ligada, então esta página só abre com o link de prévia.
        </p>
      )}
      <header className="vsl-topo">
        <Link to="/" className="vsl-marca" aria-label="Mapa da Prescrição, página inicial">
          <img src="/brand/marca-pino.svg" alt="" width="28" height="28" />
          <span>Mapa da Prescrição</span>
        </Link>
      </header>

      <main className="vsl-conteudo">
        <p className="vsl-selo">Para profissionais de Educação Física</p>
        <h1 className="vsl-titulo">
          Existe uma parte do seu trabalho que <em>o aluno nunca vê.</em>
        </h1>
        <p className="vsl-sub">
          A apresentação do Filipe Moura Ribeiro, doutor em Educação Física, sobre como prescrever para quem chega com
          hipertensão, artrose ou medicação, com o porquê de cada decisão escrito.
        </p>

        <div className="vsl-moldura">
          <VslPlayer video={VSL_APRESENTACAO.id} aoFicarPronto={revelarNoPitch} />
        </div>
        <p className="vsl-dica">Ative o som. O botão para criar a sua conta aparece durante o vídeo.</p>

        {/* Tudo abaixo espera o pitch (classe `esconder`, revelada pelo player). */}
        <section className="vsl-oferta esconder" aria-label="Oferta">
          <p className="vsl-selo">Condição de fundador</p>
          <p className="vsl-preco">
            R$ {PRECO_FUNDADOR_ANO}
            <span>/ano</span>
          </p>
          <p className="vsl-detalhe">
            O equivalente a R$ {PRECO_FUNDADOR_MES} por mês, para as primeiras {VAGAS_FUNDADOR} contas. Depois, R${" "}
            {PRECO_MENSAL} por mês. Alunos ilimitados.
          </p>
          <a className="vsl-cta" href="/dashboard?criar=1">
            Criar minha conta
          </a>
          {COBRANCA_ATIVA && <p className="vsl-garantia">Sete dias para testar, com reembolso se não servir para você.</p>}
        </section>
      </main>

      <footer className="vsl-rodape">
        <Link to="/termos">Termos de Uso</Link>
        <span aria-hidden="true">·</span>
        <Link to="/privacidade">Política de Privacidade</Link>
      </footer>
    </div>
  );
}

/** Prévia não vai para buscador. */
function useNaoIndexar() {
  React.useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    const titulo = document.title;
    document.title = "Apresentação · Mapa da Prescrição";
    return () => {
      m.remove();
      document.title = titulo;
    };
  }, []);
}

const CSS = `
.vsl-pagina{min-height:100dvh;background:#0B1628;color:#F3F1EA;font-family:"Instrument Sans",system-ui,sans-serif;display:flex;flex-direction:column;
  background-image:radial-gradient(ellipse 70% 50% at 50% 0%,rgba(232,163,23,.14) 0%,rgba(232,163,23,0) 70%)}
.vsl-previa{margin:0;background:#E8A317;color:#0B1628;text-align:center;font-size:13.5px;font-weight:600;padding:8px 16px}
.vsl-topo{width:min(1040px,100% - 32px);margin:0 auto;padding:20px 0 0}
.vsl-marca{display:inline-flex;align-items:center;gap:10px;color:#F3F1EA;text-decoration:none;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:700;font-size:17px}
.vsl-marca:focus-visible,.vsl-cta:focus-visible,.vsl-rodape a:focus-visible{outline:3px solid #F0B429;outline-offset:3px;border-radius:6px}
.vsl-conteudo{width:min(1040px,100% - 32px);margin:0 auto;padding:clamp(28px,5vw,56px) 0 48px;display:flex;flex-direction:column;align-items:center;text-align:center;flex:1}
.vsl-selo{margin:0;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;color:#F0B429}
.vsl-titulo{margin:16px 0 0;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:700;letter-spacing:-.025em;font-size:clamp(28px,4.4vw,52px);line-height:1.06;color:#fff;max-width:18em;text-wrap:balance}
.vsl-titulo em{font-style:normal;color:#F0B429}
.vsl-sub{margin:18px 0 0;font-size:clamp(15px,1.5vw,18px);line-height:1.6;color:#B9C6D6;max-width:40em;text-wrap:pretty}
.vsl-moldura{width:100%;max-width:960px;margin-top:clamp(24px,4vw,40px);border-radius:18px;box-shadow:0 60px 110px -40px rgba(0,0,0,.9),0 0 0 1px rgba(232,163,23,.35),0 0 80px -20px rgba(232,163,23,.3);--vsl-raio:18px}
.vsl-dica{margin:16px 0 0;font-size:14px;color:#8FA0B5}
.vsl-oferta{margin-top:40px;width:100%;max-width:560px;background:#0E1A2E;border:1px solid rgba(232,163,23,.35);border-radius:20px;padding:32px 28px 30px;display:flex;flex-direction:column;align-items:center;gap:10px}
.esconder{display:none!important}
.vsl-revelado{animation:vsl-entra .6s ease both}
@keyframes vsl-entra{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.vsl-revelado{animation:none}}
.vsl-preco{margin:6px 0 0;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:800;font-size:clamp(44px,7vw,64px);line-height:1;color:#fff;font-variant-numeric:tabular-nums}
.vsl-preco span{font-size:.4em;font-weight:600;color:#B9C6D6;margin-left:4px}
.vsl-detalhe{margin:4px 0 0;font-size:15px;line-height:1.55;color:#B9C6D6;max-width:30em}
.vsl-cta{margin-top:14px;display:inline-flex;align-items:center;justify-content:center;min-height:58px;padding:0 34px;border-radius:14px;background:#E8A317;color:#17202E;
  font-weight:700;font-size:17px;text-decoration:none;box-shadow:0 14px 34px -12px rgba(232,163,23,.75);transition:transform .18s ease,background .18s ease;width:100%;max-width:380px}
.vsl-cta:hover{background:#F0B429;transform:translateY(-2px)}
.vsl-garantia{margin:6px 0 0;font-size:13.5px;color:#8FA0B5}
.vsl-rodape{display:flex;gap:10px;justify-content:center;padding:24px 16px 32px;font-size:13px;color:#8FA0B5}
.vsl-rodape a{color:#8FA0B5}
`;
