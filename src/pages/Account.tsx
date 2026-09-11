import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ImageIcon, Lock, Trash2 } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { useUser, planLabel, type Plan } from "@/lib/store";
import { COBRANCA_ATIVA, ITENS_PLANO } from "@/data/planos";
import { hashSenha, novoSalt, abrirSessao, encerrarSessao } from "@/lib/auth";
import { useCloudAuth } from "@/lib/backend/cloudAuth";
import { atualizarSenha, signOut, traduzErroAuth } from "@/lib/backend/supabaseAuth";
import { arquivoParaDataUrl } from "@/lib/imagem";
import { SeletorTema } from "@/components/theme/SeletorTema";
import { CORES_DE_MARCA, corDeContraste } from "@/lib/theme/palettes";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { AlternarEspaco } from "@/components/app/AlternarEspaco";
import { TrocarFotoAluno } from "@/components/alunos/FotoAluno";
import { CampoSenha } from "@/components/app/CampoSenha";

/** Rótulo dos campos da conta: 12.5px como o protótipo, colado ao campo. */
const ROTULO = "mb-1.5 block text-[12.5px] font-semibold text-ink";
/** Campo da conta: a altura de 44px do `.input` fica (alvo de toque), o fundo é o papel suave. */
const CAMPO = "input bg-surface-soft";

export function Account() {
  const user = useUser();
  const { name, plan, cref, email, telefone, empresa, site, fotoDataUrl, logoDataUrl, corPrimaria, senhaHash } = user;
  // Cor efetiva da prévia: a cor da marca quando definida, senão a do produto.
  const corMarca = corPrimaria || "var(--primary)";
  const cloudConfigured = useCloudAuth((s) => s.configured);
  const [confirmReset, setConfirmReset] = React.useState(false);

  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  // "CREF · e-mail" embaixo do nome, como o protótipo; some quando os dois estão vazios.
  const identidade = [cref && `CREF ${cref}`, email].filter(Boolean).join(" · ");

  const zerar = () => {
    ["pi-progress", "pi-favorites", "pi-ativacao", "pi-passos-ocultos", "pi-notif-seen"].forEach(
      (k) => localStorage.removeItem(k),
    );
    window.location.reload();
  };

  const carregarLogo = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await arquivoParaDataUrl(file, { maxW: 560, maxH: 200, modo: "contain" });
      user.setPerfil({ logoDataUrl: dataUrl });
      toast("Logo atualizada");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível carregar a imagem.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-[22px]">
      {/* Cabeçalho do protótipo (o mesmo de Avaliar e do Semáforo): sobretítulo sem ícone,
          título de 26px no celular e a frase que diz para que serve a tela. */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Conta</p>
        <h1 className="mt-2 font-display text-[clamp(26px,3vw,36px)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
          Sua conta e sua marca
        </h1>
        <p className="mt-2 max-w-[560px] text-[14.5px] leading-[1.55] text-ink-2">
          O que você preencher aqui assina os documentos entregues aos alunos.
        </p>
      </div>

      {/* Volta para o espaço do aluno. Só aparece quando alguém de fato atende esta conta:
          sem vínculo, não há treino a ver, e o botão seria uma porta para lugar nenhum. */}
      <AlternarEspaco />

      {/* Duas colunas no desktop (protótipo 08/09): à esquerda o que assina os
          documentos (perfil e marca), à direita a conta em si (plano, suporte, acesso,
          aparência, preferências e a zona de risco). No celular tudo empilha nessa ordem. */}
      <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-[18px]">
          {/* Perfil: a identidade no alto, como o protótipo, e os campos embaixo. */}
          <Card className="p-4 lg:p-[22px]">
            <div className="flex flex-wrap items-center gap-4">
              {/* A foto com o botão de câmera no canto, o mesmo controle da foto do aluno: a
                  fileira "Adicionar foto / Remover" ao lado disputava a linha com o nome, que é
                  o que a tela quer mostrar. O nome passado ("perfil") é só para o rótulo do
                  botão ler "Trocar a foto de perfil". */}
              <TrocarFotoAluno
                aluno={{ nome: "perfil", fotoDataUrl }}
                onFoto={(f) => {
                  user.setPerfil({ fotoDataUrl: f ?? "" });
                  toast(f ? "Foto atualizada" : "Foto removida");
                }}
              >
                {/* O navy é fixo (fora do tema); o filete claro é o que mantém a forma visível
                    sobre o cartão escuro, e some no claro. Vale também para a pílula do plano. */}
                <span
                  className="grid h-16 w-16 place-items-center overflow-hidden rounded-card font-display text-lg font-bold ring-1 ring-inset ring-white/10"
                  style={{ background: "#0B1628", color: "#F3F1EA" }}
                >
                  {fotoDataUrl ? <img src={fotoDataUrl} alt="Sua foto" className="h-full w-full object-cover" /> : initials}
                </span>
              </TrocarFotoAluno>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-lg font-bold text-ink">{name || "Seu nome"}</h2>
                {identidade && <p className="text-[13px] text-ink-2 [overflow-wrap:anywhere]">{identidade}</p>}
              </div>
              {/* A pílula do protótipo diz "Fundador", que não tem fonte por conta (a oferta de
                  fundador é um contador global, não uma marca desta conta). Ela mostra o plano
                  REAL, o mesmo do cartão Plano. */}
              <span
                className="rounded-full px-2.5 py-[5px] text-[11.5px] font-bold ring-1 ring-inset ring-white/10"
                style={{ background: "#0B1628", color: "#F0B429" }}
              >
                {planLabel[plan]}
              </span>
            </div>

            {/* Os seis dados que assinam e identificam os documentos, na ordem do protótipo e
                com os dois que ele não tem (e-mail e site, reais: vão para o cabeçalho do PDF).
                Empresa e site moravam no cartão da cor, misturando dado pessoal com escolha
                visual. */}
            <div className="mt-[18px] grid gap-3 border-t border-surface-mute pt-[18px] lg:grid-cols-2">
              <label className="block">
                <span className={ROTULO}>Nome profissional</span>
                <input
                  value={name}
                  onChange={(e) => user.setName(e.target.value)}
                  className={CAMPO}
                  placeholder="Como aparece nos documentos"
                />
              </label>
              <label className="block">
                <span className={ROTULO}>CREF</span>
                <input value={cref} onChange={(e) => user.setCref(e.target.value)} className={CAMPO} placeholder="ex.: 012345-G/SP" />
              </label>
              <label className="block">
                <span className={ROTULO}>Telefone / WhatsApp</span>
                <input
                  value={telefone}
                  onChange={(e) => user.setPerfil({ telefone: e.target.value })}
                  className={CAMPO}
                  placeholder="(11) 99999-0000"
                />
              </label>
              <label className="block">
                <span className={ROTULO}>Empresa / estúdio</span>
                <input
                  value={empresa}
                  onChange={(e) => user.setPerfil({ empresa: e.target.value })}
                  className={CAMPO}
                  placeholder="ex.: Studio Movimento"
                />
              </label>
              <label className="block">
                <span className={ROTULO}>E-mail de contato</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => user.setPerfil({ email: e.target.value })}
                  className={CAMPO}
                  placeholder="voce@exemplo.com"
                />
              </label>
              <label className="block">
                <span className={ROTULO}>Site ou rede social</span>
                <input
                  value={site}
                  onChange={(e) => user.setPerfil({ site: e.target.value })}
                  className={CAMPO}
                  placeholder="ex.: instagram.com/seuperfil"
                />
              </label>
            </div>
            {/* "Cabeçalho", e não "rodapé": é onde os exports (prescrição, plano, prontuário)
                de fato escrevem site, e-mail e telefone. */}
            <p className="mt-3 text-xs text-ink-3">
              Nome e CREF assinam o Prontuário de Decisão. Empresa, site, e-mail e telefone entram no
              cabeçalho dos documentos; os três últimos, como canal de contato do aluno com você. O
              telefone é também o que faz o botão "Falar com" aparecer no app do aluno: sem ele, o
              aluno não tem por onde chamar você ali.
            </p>
          </Card>

          {/* Marca */}
          <Card className="p-4 lg:p-[22px]">
            <h2 className="font-display text-[17px] font-bold text-ink">Cor e logo da marca</h2>
            <p className="mt-1 text-[13px] text-ink-2">Valem no app do aluno e no cabeçalho dos documentos.</p>

            {/* Cor da marca: lista FECHADA, não seletor livre. Com cinco valores o
                contraste de cada um é conhecido e verificado no CI; com um seletor
                livre, um amarelo claro deixaria o app do aluno ilegível sem
                ninguém perceber.
                A escolhida ganha o anel NA PRÓPRIA COR, separado por um vão de papel, como o
                protótipo, e mantém o check: a cor nunca é o único sinal. O filete interno
                (tinta a 12%) é o que deixa o grafite visível no tema escuro. */}
            <div role="group" aria-label="Cor da marca" className="mt-3.5 flex flex-wrap gap-2.5">
              {CORES_DE_MARCA.map((c) => {
                const on = (corPrimaria || CORES_DE_MARCA[0].hex).toUpperCase() === c.hex.toUpperCase();
                const filete = "inset 0 0 0 1px rgb(var(--ink-rgb) / .12)";
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => user.setPerfil({ corPrimaria: c.hex })}
                    aria-pressed={on}
                    title={c.nome}
                    className="grid h-10 w-10 place-items-center rounded-full"
                    style={{
                      background: c.hex,
                      boxShadow: on ? `${filete}, 0 0 0 3px rgb(var(--surface-rgb)), 0 0 0 5px ${c.hex}` : filete,
                    }}
                  >
                    {on && <Check className="h-5 w-5" style={{ color: corDeContraste(c.hex) }} />}
                    <span className="sr-only">{c.nome}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-xs text-ink-3">O seu app continua na identidade do Mapa da Prescrição.</p>

            {/* A logo é recurso real (entra no PDF e no app do aluno) que o protótipo não tem:
                fica, numa linha compacta depois das cores. */}
            <div className="mt-4">
              <span className={ROTULO}>Logo</span>
              <div className="flex flex-wrap items-center gap-3">
                {logoDataUrl ? (
                  <img src={logoDataUrl} alt="Sua logo" className="h-14 max-w-[220px] rounded-[14px] border border-border bg-surface object-contain p-1.5" />
                ) : (
                  <span className="grid h-14 w-36 place-items-center rounded-[14px] border border-dashed border-border text-ink-3">
                    <ImageIcon className="h-5 w-5" />
                  </span>
                )}
                <div className="flex flex-wrap gap-2">
                  <label className={cn(buttonClasses("secondary", "sm"), "cursor-pointer")}>
                    <ImageIcon className="h-4 w-4" /> {logoDataUrl ? "Trocar logo" : "Adicionar logo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        carregarLogo(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {logoDataUrl && (
                    <button
                      onClick={() => {
                        user.setPerfil({ logoDataUrl: "" });
                        toast("Logo removida");
                      }}
                      className={buttonClasses("ghost", "sm")}
                    >
                      <Trash2 className="h-4 w-4" /> Remover
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1.5 text-xs text-ink-3">
                Aparece no cabeçalho dos PDFs entregues ao aluno (prescrição, prontuário, fichas e semáforo).
              </p>
            </div>

            {/* AS DUAS SUPERFÍCIES ONDE A COR APARECE, LADO A LADO.
                A escolha de cor é abstrata até você ver onde ela cai: antes o card
                mostrava só o cabeçalho do documento, e a metade que o aluno vê (que é
                a que importa para o profissional) ficava na imaginação. */}
            <div className="mt-[18px] grid gap-3 lg:grid-cols-2">
              <PreviaAppDoAluno cor={corMarca} nome={name} empresa={empresa} logoDataUrl={logoDataUrl} />
              <PreviaDocumento
                cor={corMarca}
                nome={name}
                cref={cref}
                empresa={empresa}
                site={site}
                email={email}
                telefone={telefone}
                logoDataUrl={logoDataUrl}
              />
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-[18px]">
          {/* Plano: superfície navy fixa (fora do tema claro/escuro, de propósito). */}
          <PlanoCard plan={plan} />

          <SuporteCard />

          {/* Acesso: conta em nuvem quando o backend está ligado; senão, senha local. */}
          {cloudConfigured ? <ContaNuvemCard /> : <SenhaCard temSenha={Boolean(senhaHash)} />}

          {/* Aparência: só do profissional, e por isso longe da marca. */}
          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-ink">Aparência do seu app</h2>
            <p className="mt-1 text-[13px] text-ink-2">Só na sua tela; o app do aluno segue a sua marca.</p>
            <SeletorTema />
          </Card>

          {/* Preferências. A afirmação é verdadeira e conferida: o index.css zera animação e
              transição quando o sistema pede movimento reduzido. */}
          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-ink">Preferências</h2>
            <p className="mt-2 text-[13px] leading-normal text-ink-2">
              <b className="font-semibold text-ink">Movimento reduzido:</b> respeita a configuração do seu sistema
              automaticamente.
            </p>
          </Card>

          {/* Zona de risco: título em vermelho no lugar do ícone, e a confirmação em dois passos
              (a ação não tem volta). O texto nomeia o XP porque `pi-progress` o guarda. */}
          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-danger">Zerar progresso local</h2>
            <p className="mt-1.5 text-[13px] leading-normal text-ink-2">
              Remove XP, favoritos, casos resolvidos e o passo a passo do painel deste navegador. Não afeta o
              plano selecionado nem seus alunos.
            </p>
            {confirmReset ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {/* `text-surface` e não branco: no tema escuro o vermelho de texto é claro, e o
                    papel escuro por cima dele é o que mantém o contraste nos dois temas. */}
                <button type="button" onClick={zerar} className={cn(buttonClasses("primary", "sm"), "bg-danger text-surface shadow-none")}>
                  Confirmar e zerar
                </button>
                <button type="button" onClick={() => setConfirmReset(false)} className={buttonClasses("outline", "sm")}>
                  Cancelar
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className={cn(buttonClasses("outline", "sm"), "mt-3")}>
                Zerar progresso
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Plano ----------------------------------- */

/**
 * Os três itens do cartão, os mesmos três do protótipo na versão que o produto de fato tem
 * ("Prontuário e PDF assinável" é o "Prontuário de decisão técnica assinável" da lista).
 * Filtrados pela lista real: se um item sair do plano, ele sai daqui junto, em vez de o
 * cartão prometer o que a página de preços não promete mais.
 */
const ITENS_DO_CARTAO = ["Alunos ilimitados", "App do aluno com a sua marca", "Prontuário de decisão técnica assinável"];

/**
 * O plano REAL da conta, no card navy do protótipo. Sem preço e sem promessa de
 * renovação de propósito: enquanto `COBRANCA_ATIVA` é falso nenhuma assinatura é
 * cobrada, e imprimir "R$ NN/mês · renova em..." aqui seria o produto afirmando
 * uma cobrança que o código desmente. A tabela anunciada vive em /pricing. Pelo mesmo
 * motivo o botão não diz "Gerenciar assinatura": não há assinatura a gerenciar.
 */
function PlanoCard({ plan }: { plan: Plan }) {
  const itens = ITENS_DO_CARTAO.filter((i) => ITENS_PLANO.includes(i));
  return (
    <section
      className="relative overflow-hidden rounded-card p-4 lg:p-[22px]"
      style={{ background: "#0B1628", color: "#F3F1EA" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[60px] -top-[80px] h-[220px] w-[220px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(232,163,23,.3),rgba(232,163,23,0) 65%)" }}
      />
      <div className="relative">
        <p className="text-2xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#F0B429" }}>
          Plano
        </p>
        <p className="mt-2.5 font-display text-[34px] font-bold leading-none tracking-[-0.03em]">
          {planLabel[plan]}
        </p>
        {!COBRANCA_ATIVA && (
          <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "#B9C6D6" }}>
            Acesso completo liberado. Nenhuma cobrança está ativa nesta conta hoje.
          </p>
        )}
        <div className="mt-3.5 flex flex-col gap-1.5 text-[13px]" style={{ color: "#D6DFEA" }}>
          {itens.map((item) => (
            <span key={item} className="inline-flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {item}
            </span>
          ))}
        </div>
        <Link
          to="/pricing"
          className="mt-4 inline-flex h-10 items-center rounded-control border px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
          style={{ borderColor: "rgba(255,255,255,.2)" }}
        >
          Ver planos e preços
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------- Suporte ---------------------------------- */

/**
 * O cartão de Suporte do protótipo, com o que existe de verdade. O protótipo diz "Resposta
 * do Filipe em até 1 dia útil" e oferece WhatsApp: não há número de WhatsApp de suporte em
 * lugar nenhum do produto, nenhum prazo de resposta registrado, e o Filipe forma quem
 * prescreve, não atende chamado. O canal real é o e-mail da página de Suporte (com o
 * formulário), e o passo a passo é o Tutorial.
 */
function SuporteCard() {
  return (
    <Card className="p-3.5 lg:p-5">
      <h2 className="font-display text-base font-bold text-ink">Suporte</h2>
      <p className="mt-1.5 text-[13.5px] leading-normal text-ink-2">
        Dúvidas, problemas ou sugestões: fale com a gente por e-mail.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to="/suporte" className={buttonClasses("primary", "sm")}>
          Falar com o suporte
        </Link>
        <Link to="/tutorial" className={buttonClasses("outline", "sm")}>
          Passo a passo
        </Link>
      </div>
    </Card>
  );
}

/* ----------------------------- Prévias da marca ---------------------------- */

/** Moldura comum das duas prévias, para elas se lerem como um par. */
function Previa({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[16px] border border-border bg-surface">
      <div className="border-b border-surface-mute px-3 py-2 text-2xs font-semibold uppercase tracking-[0.1em] text-ink-3">
        {titulo}
      </div>
      {children}
    </div>
  );
}

/**
 * Como a cor cai no portal do aluno: a faixa na cor da marca com a logo do
 * profissional, o cartão do treino e o botão de ação positiva.
 *
 * Simplificada de propósito (não é um espelho pixel a pixel do StudentApp), mas
 * fiel no que decide a escolha: a cor de fundo, o texto por cima dela e a logo
 * no tamanho real do avatar. É por isso que ela também revela logo cortada.
 * O navy e o cartão são os da pele real do app do aluno (palettes.ts), não os do
 * protótipo, e o botão "Começar treino" fica: é a única parte da prévia que testa
 * texto corrido em cima da cor escolhida.
 */
function PreviaAppDoAluno({
  cor,
  nome,
  empresa,
  logoDataUrl,
}: {
  cor: string;
  nome: string;
  empresa: string;
  logoDataUrl: string;
}) {
  const tinta = corDeContraste(cor);
  return (
    <Previa titulo="No app do aluno">
      {/* A moldura escura é a skin real do portal do aluno (navy), não decoração:
          mostrar a cor sobre fundo claro enganaria sobre o contraste. */}
      <div className="p-3" style={{ background: "#0D1524" }}>
        <div className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5" style={{ background: cor }}>
          <LogoQuadrada logoDataUrl={logoDataUrl} nome={nome || empresa} cor={cor} tinta={tinta} />
          <div className="min-w-0 text-xs leading-[1.3]">
            <div className="truncate" style={{ color: tinta, opacity: 0.85 }}>
              Seu treino com
            </div>
            <div className="truncate font-bold" style={{ color: tinta }}>
              {empresa || nome || "Seu nome"}
            </div>
          </div>
        </div>
        <div className="mt-2 rounded-[10px] px-3 py-2.5 text-xs" style={{ background: "#131D31" }}>
          <div className="text-2xs" style={{ color: "#8FA1BD" }}>
            Treino de hoje
          </div>
          <div className="font-semibold" style={{ color: "#F2F6FC" }}>
            Sessão A · Inferiores
          </div>
        </div>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          className="mt-2 w-full rounded-full py-2 text-sm font-bold"
          style={{ background: cor, color: tinta }}
        >
          Começar treino
        </button>
      </div>
    </Previa>
  );
}

/** Como a cor cai no cabeçalho dos PDFs que o aluno recebe. */
function PreviaDocumento({
  cor,
  nome,
  cref,
  empresa,
  site,
  email,
  telefone,
  logoDataUrl,
}: {
  cor: string;
  nome: string;
  cref: string;
  empresa: string;
  site: string;
  email: string;
  telefone: string;
  logoDataUrl: string;
}) {
  return (
    <Previa titulo="No cabeçalho dos documentos">
      {/* Papel é sempre claro, independente do tema do profissional: o PDF não
          herda o modo escuro dele, e a prévia não pode dar a entender que herda. */}
      <div className="bg-white p-3.5">
        <div
          className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b-2 pb-2"
          style={{ borderColor: cor }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {logoDataUrl && <img src={logoDataUrl} alt="" className="h-9 max-w-[110px] object-contain" />}
            <div className="min-w-0 leading-[1.3]">
              <div className="truncate font-display text-xs font-bold" style={{ color: cor }}>
                {nome || "Seu nome"}
              </div>
              {cref && (
                <div className="text-2xs font-bold" style={{ color: cor }}>
                  CREF {cref}
                </div>
              )}
              {empresa && <div className="truncate text-2xs text-[#6A7180]">{empresa}</div>}
            </div>
          </div>
          <div className="min-w-0 break-words text-2xs text-[#9AA1AC] sm:text-right">
            {[site, email, telefone].filter(Boolean).join(" · ") || "site · e-mail · telefone"}
          </div>
        </div>
        <div className="mt-2 text-2xs font-semibold uppercase tracking-[0.1em]" style={{ color: cor }}>
          Prescrição de treino
        </div>
        <div className="mt-1.5 h-[5px] w-[70%] rounded-[3px] bg-[#EEEFEA]" />
        <div className="mt-1 h-[5px] w-[45%] rounded-[3px] bg-[#EEEFEA]" />
      </div>
    </Previa>
  );
}

/**
 * A logo dentro de um quadrado, SEM CORTAR.
 *
 * Era `object-cover` num quadrado de 44px: logo horizontal (a maioria delas, que
 * é nome por extenso ao lado de um símbolo) entrava esticada e com as pontas
 * comidas. `object-contain` sobre papel branco preserva a marca inteira, que é o
 * mínimo que se deve a quem subiu a própria logo.
 */
function LogoQuadrada({
  logoDataUrl,
  nome,
  cor,
  tinta,
}: {
  logoDataUrl: string;
  nome: string;
  cor: string;
  tinta: string;
}) {
  if (!logoDataUrl) {
    return (
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-control font-display text-sm font-bold"
        style={{ background: tinta, color: cor }}
      >
        {(nome || "?").trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-control bg-white p-1">
      <img src={logoDataUrl} alt="" className="max-h-full max-w-full object-contain" />
    </span>
  );
}

/* -------------------------------- Acesso ---------------------------------- */

/** A nota de segurança e o caminho para a política: ficam nos dois modos de acesso. */
function NotaDeDados({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-xs text-ink-3">
      {children}{" "}
      <Link to="/privacidade" className="font-semibold text-primary hover:underline">
        Como tratamos os dados
      </Link>
    </p>
  );
}

/**
 * Identidade da conta em nuvem (quando o backend Supabase está ligado), no formato do
 * protótipo: uma frase e duas ações escritas. "Alterar senha" abre o formulário ali mesmo e
 * grava pela mesma chamada da senha nova do link de redefinição.
 */
function ContaNuvemCard() {
  const user = useCloudAuth((s) => s.user);
  const emailConta = user?.email ?? "";
  const [saindo, setSaindo] = React.useState(false);
  const [trocando, setTrocando] = React.useState(false);
  const [senha, setSenha] = React.useState("");
  const [confirma, setConfirma] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);
  const [salvando, setSalvando] = React.useState(false);
  const idSenha = React.useId();
  const idConfirma = React.useId();

  const fecharTroca = () => {
    setTrocando(false);
    setSenha("");
    setConfirma("");
    setErro(null);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (senha.length < 6) return setErro("A senha precisa de pelo menos 6 caracteres.");
    if (senha !== confirma) return setErro("As duas senhas não são iguais.");
    setSalvando(true);
    // Falha de rede não pode deixar o botão preso em "Salvando...": vira erro legível.
    const r = await atualizarSenha(senha).catch((err: unknown) => ({ error: (err as Error)?.message ?? "network" }));
    setSalvando(false);
    if (r.error) return setErro(traduzErroAuth(r.error));
    fecharTroca();
    toast("Senha nova salva. Use ela da próxima vez que entrar.");
  };

  return (
    <Card className="p-3.5 lg:p-5">
      <h2 className="font-display text-base font-bold text-ink">Acesso</h2>
      <p className="mt-1.5 text-[13.5px] leading-normal text-ink-2">
        {emailConta ? (
          <>
            Conectado como <b className="font-semibold text-ink [overflow-wrap:anywhere]">{emailConta}</b>.
          </>
        ) : (
          "Você está conectado."
        )}{" "}
        Seus alunos, avaliações e prescrições ficam na sua conta e aparecem em qualquer aparelho onde você entrar.
      </p>

      {trocando ? (
        <form onSubmit={salvar} className="mt-3 space-y-3">
          <div>
            <label htmlFor={idSenha} className={ROTULO}>
              Senha nova
            </label>
            <CampoSenha id={idSenha} value={senha} onChange={setSenha} autoComplete="new-password" placeholder="Pelo menos 6 caracteres" className={CAMPO} required />
          </div>
          <div>
            <label htmlFor={idConfirma} className={ROTULO}>
              Repita a senha
            </label>
            <CampoSenha id={idConfirma} value={confirma} onChange={setConfirma} autoComplete="new-password" className={CAMPO} required />
          </div>
          {erro && (
            <p className="text-sm font-medium text-danger" role="alert">
              {erro}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={salvando} className={buttonClasses("primary", "sm")}>
              <Lock className="h-4 w-4" aria-hidden /> {salvando ? "Salvando..." : "Salvar a senha nova"}
            </button>
            <button type="button" onClick={fecharTroca} className={buttonClasses("ghost", "sm")}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] font-semibold">
          <button
            type="button"
            onClick={() => setTrocando(true)}
            className="inline-flex items-center gap-1 rounded-control py-1 text-primary hover:underline"
          >
            Alterar senha <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={async () => {
              setSaindo(true);
              await signOut();
              window.location.reload();
            }}
            disabled={saindo}
            className="rounded-control py-1 text-ink-2 hover:text-ink disabled:opacity-60"
          >
            {saindo ? "Saindo…" : "Sair da conta"}
          </button>
        </div>
      )}
      <NotaDeDados>
        Os dados trafegam protegidos e cada profissional só enxerga os próprios (segurança por linha, no banco).
      </NotaDeDados>
    </Card>
  );
}

/** Criar/alterar/remover a senha de acesso local, com linguagem honesta sobre o alcance. */
function SenhaCard({ temSenha }: { temSenha: boolean }) {
  const { senhaHash, senhaSalt, setSenha, limparSenha } = useUser();
  const [atual, setAtual] = React.useState("");
  const [nova, setNova] = React.useState("");
  const [confirma, setConfirma] = React.useState("");
  const [erro, setErro] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);

  const limpar = () => {
    setAtual("");
    setNova("");
    setConfirma("");
    setErro("");
  };

  const validarAtual = async () => {
    if (!temSenha) return true;
    const h = await hashSenha(atual, senhaSalt);
    return h === senhaHash;
  };

  const salvar = async () => {
    setErro("");
    if (nova.length < 4) {
      setErro("A senha precisa ter pelo menos 4 caracteres.");
      return;
    }
    if (nova !== confirma) {
      setErro("A confirmação não confere com a nova senha.");
      return;
    }
    setSalvando(true);
    if (!(await validarAtual())) {
      setSalvando(false);
      setErro("Senha atual incorreta.");
      return;
    }
    const salt = novoSalt();
    setSenha(await hashSenha(nova, salt), salt);
    abrirSessao();
    setSalvando(false);
    limpar();
    toast(temSenha ? "Senha alterada" : "Senha de acesso criada");
  };

  const remover = async () => {
    setErro("");
    setSalvando(true);
    if (!(await validarAtual())) {
      setSalvando(false);
      setErro("Senha atual incorreta.");
      return;
    }
    limparSenha();
    encerrarSessao();
    setSalvando(false);
    limpar();
    toast("Senha removida: o app abre sem pedir acesso");
  };

  return (
    <Card className="p-3.5 lg:p-5">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-base font-bold text-ink">Acesso</h2>
        {temSenha && <Pill tone="success">Ativo</Pill>}
      </div>
      {/* "Sessão protegida por senha", como diz o protótipo, só é verdade depois que a senha
          existe; sem ela, a frase convida a criar uma. */}
      <p className="mt-1.5 text-[13.5px] leading-normal text-ink-2">
        {temSenha
          ? "O app pede esta senha uma vez por sessão do navegador. Use Sair no menu do topo para bloquear."
          : "Crie uma senha para o app pedir acesso ao abrir: útil em computador compartilhado (recepção, notebook do estúdio)."}
      </p>

      {/* No desktop este card vive na coluna estreita da direita: os campos
          empilham (lg:grid-cols-1) para não espremer três senhas lado a lado. */}
      <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {temSenha && (
          <label className="block">
            <span className={ROTULO}>Senha atual</span>
            <input type="password" value={atual} onChange={(e) => setAtual(e.target.value)} className={CAMPO} autoComplete="current-password" />
          </label>
        )}
        <label className="block">
          <span className={ROTULO}>{temSenha ? "Nova senha" : "Senha"}</span>
          <input type="password" value={nova} onChange={(e) => setNova(e.target.value)} className={CAMPO} autoComplete="new-password" />
        </label>
        <label className="block">
          <span className={ROTULO}>Confirmar</span>
          <input type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} className={CAMPO} autoComplete="new-password" />
        </label>
      </div>
      {erro && <p className="mt-2 text-sm font-medium text-danger">{erro}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={salvar} disabled={salvando} className={cn(buttonClasses("primary", "sm"), salvando && "opacity-60")}>
          <Lock className="h-4 w-4" /> {temSenha ? "Alterar senha" : "Criar senha"}
        </button>
        {temSenha && (
          <button onClick={remover} disabled={salvando} className={buttonClasses("ghost", "sm")}>
            Remover senha
          </button>
        )}
      </div>
      <NotaDeDados>
        Proteção de acesso local deste dispositivo (a senha nunca sai do seu navegador). O login em
        nuvem, com acesso de qualquer aparelho, chega com a fase de contas online.
      </NotaDeDados>
    </Card>
  );
}
