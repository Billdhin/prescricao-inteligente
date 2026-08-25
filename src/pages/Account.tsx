import * as React from "react";
import { Settings, Crown, Check, ShieldAlert, Sparkles, Camera, ImageIcon, Trash2, Lock, KeyRound } from "lucide-react";
import { Card, Pill, Button, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { useUser, planLabel, isPremiumUnlocked, type Plan } from "@/lib/store";
import { hashSenha, novoSalt, abrirSessao, encerrarSessao } from "@/lib/auth";
import { useCloudAuth } from "@/lib/backend/cloudAuth";
import { signOut } from "@/lib/backend/supabaseAuth";
import { arquivoParaDataUrl } from "@/lib/imagem";
import { SeletorTema } from "@/components/theme/SeletorTema";
import { CORES_DE_MARCA, corDeContraste } from "@/lib/theme/palettes";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function Account() {
  const user = useUser();
  const { name, plan, cref, email, telefone, empresa, site, fotoDataUrl, logoDataUrl, corPrimaria, senhaHash } = user;
  // Cor efetiva da prévia: a cor da marca quando definida, senão a do produto.
  const corMarca = corPrimaria || "var(--primary)";
  const cloudConfigured = useCloudAuth((s) => s.configured);
  const [confirmReset, setConfirmReset] = React.useState(false);

  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  const zerar = () => {
    ["pi-progress", "pi-favorites", "pi-ativacao", "pi-passos-ocultos", "pi-notif-seen"].forEach(
      (k) => localStorage.removeItem(k),
    );
    window.location.reload();
  };

  const carregarImagem = async (file: File | undefined, tipo: "foto" | "logo") => {
    if (!file) return;
    try {
      const dataUrl = await arquivoParaDataUrl(
        file,
        tipo === "foto"
          ? { maxW: 256, maxH: 256, modo: "cover-quadrado" }
          : { maxW: 560, maxH: 200, modo: "contain" },
      );
      user.setPerfil(tipo === "foto" ? { fotoDataUrl: dataUrl } : { logoDataUrl: dataUrl });
      toast(tipo === "foto" ? "Foto atualizada" : "Logo atualizada");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível carregar a imagem.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionHeader
        eyebrow="Conta"
        icon={<Settings className="h-3 w-3" />}
        title="Sua conta"
        subtitle="Perfil, marca, acesso e plano. O que você preencher aqui assina os documentos entregues aos alunos."
      />

      {/* Perfil profissional */}
      <Card className="p-6">
        <h3 className="mb-4 font-display text-lg font-bold text-ink">Perfil profissional</h3>
        <div className="flex flex-wrap items-center gap-4">
          {fotoDataUrl ? (
            <img src={fotoDataUrl} alt="Sua foto" className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full gradient-brand text-lg font-bold text-white">
              {initials}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <label className={cn(buttonClasses("secondary", "sm"), "cursor-pointer")}>
              <Camera className="h-4 w-4" /> {fotoDataUrl ? "Trocar foto" : "Adicionar foto"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  carregarImagem(e.target.files?.[0], "foto");
                  e.target.value = "";
                }}
              />
            </label>
            {fotoDataUrl && (
              <button
                onClick={() => {
                  user.setPerfil({ fotoDataUrl: "" });
                  toast("Foto removida");
                }}
                className={buttonClasses("ghost", "sm")}
              >
                <Trash2 className="h-4 w-4" /> Remover
              </button>
            )}
          </div>
          <Pill tone={isPremiumUnlocked(plan) ? "success" : "neutral"} icon={<Crown className="h-3 w-3" />} className="ml-auto">
            {planLabel[plan]}
          </Pill>
        </div>

        <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Nome profissional</span>
            <input
              value={name}
              onChange={(e) => user.setName(e.target.value)}
              className="input"
              placeholder="Como aparece nos documentos"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">CREF</span>
            <input value={cref} onChange={(e) => user.setCref(e.target.value)} className="input" placeholder="ex.: 012345-G/SP" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">E-mail de contato</span>
            <input
              type="email"
              value={email}
              onChange={(e) => user.setPerfil({ email: e.target.value })}
              className="input"
              placeholder="voce@exemplo.com"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Telefone / WhatsApp</span>
            <input
              value={telefone}
              onChange={(e) => user.setPerfil({ telefone: e.target.value })}
              className="input"
              placeholder="(11) 99999-0000"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-ink-3">
          Nome e CREF assinam o Prontuário de Decisão; e-mail e telefone entram no rodapé dos
          documentos como canal de contato do aluno com você. O telefone é também o que faz
          o botão "Falar com" aparecer no app do aluno: sem ele, o aluno não tem por onde
          chamar você ali.
        </p>
      </Card>

      {/* Aparência: só do profissional, e por isso longe da marca. */}
      <Card className="p-6">
        <h3 className="mb-1 font-display text-lg font-bold text-ink">Aparência do seu app</h3>
        <p className="mb-4 text-sm text-ink-2">Como este app se parece na sua tela.</p>
        <SeletorTema />
      </Card>

      {/* Marca */}
      <Card className="p-6">
        <h3 className="mb-1 font-display text-lg font-bold text-ink">Sua marca nos documentos</h3>
        <p className="mb-4 text-sm text-ink-2">
          A logo e os dados da empresa aparecem no cabeçalho dos PDFs entregues ao aluno
          (prescrição, prontuário, fichas e semáforo).
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {logoDataUrl ? (
            <img src={logoDataUrl} alt="Sua logo" className="h-14 max-w-[220px] rounded-lg border border-border bg-surface object-contain p-1.5" />
          ) : (
            <span className="grid h-14 w-36 place-items-center rounded-lg border border-dashed border-border text-ink-3">
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
                  carregarImagem(e.target.files?.[0], "logo");
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
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Empresa / estúdio</span>
            <input
              value={empresa}
              onChange={(e) => user.setPerfil({ empresa: e.target.value })}
              className="input"
              placeholder="ex.: Studio Movimento"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Site ou rede social</span>
            <input
              value={site}
              onChange={(e) => user.setPerfil({ site: e.target.value })}
              className="input"
              placeholder="ex.: instagram.com/seuperfil"
            />
          </label>
        </div>

        {/* Cor da marca: lista FECHADA, não seletor livre. Com cinco valores o
            contraste de cada um é conhecido e verificado no CI; com um seletor
            livre, um amarelo claro deixaria o app do aluno ilegível sem
            ninguém perceber. */}
        <div className="mt-4">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Cor da marca</span>
          <div className="flex flex-wrap items-center gap-2">
            {CORES_DE_MARCA.map((c) => {
              const on = (corPrimaria || CORES_DE_MARCA[0].hex).toUpperCase() === c.hex.toUpperCase();
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => user.setPerfil({ corPrimaria: c.hex })}
                  aria-pressed={on}
                  title={c.nome}
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-full ring-1 ring-black/10",
                    on && "outline outline-2 outline-offset-2 outline-primary",
                  )}
                  style={{ background: c.hex }}
                >
                  {on && <Check className="h-5 w-5" style={{ color: corDeContraste(c.hex) }} />}
                  <span className="sr-only">{c.nome}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-ink-3">
            Uma escolha só, que vale nos dois lugares: o app do aluno e o cabeçalho dos seus
            documentos. O seu app continua na identidade do Mapa da Prescrição.
          </p>
        </div>

        {/* AS DUAS SUPERFÍCIES ONDE A COR APARECE, LADO A LADO.
            A escolha de cor é abstrata até você ver onde ela cai: antes o card
            mostrava só o cabeçalho do documento, e a metade que o aluno vê (que é
            a que importa para o profissional) ficava na imaginação. */}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
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

      {/* Acesso: conta em nuvem quando o backend está ligado; senão, senha local. */}
      {cloudConfigured ? <ContaNuvemCard /> : <SenhaCard temSenha={Boolean(senhaHash)} />}

      {/* Preferências */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-bold text-ink">Preferências</h3>
        <div className="mt-3 flex items-start gap-3 rounded-xl bg-surface-soft p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-sm text-ink-2">
            <span className="font-semibold text-ink">Movimento reduzido:</span> a plataforma respeita
            a configuração de “reduzir animações” do seu sistema operacional automaticamente
            (prefers-reduced-motion).
          </div>
        </div>
      </Card>

      {/* Zona de risco */}
      <Card className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-cta" />
          <h3 className="font-display text-lg font-bold text-ink">Zerar progresso local</h3>
        </div>
        <p className="mb-4 text-sm text-ink-2">
          Remove XP, favoritos, casos resolvidos e o passo a passo do painel deste navegador. Não afeta o
          plano selecionado nem seus alunos.
        </p>
        {confirmReset ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={zerar} className="!bg-cta !bg-none">
              Confirmar e zerar
            </Button>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            Zerar progresso
          </Button>
        )}
      </Card>
    </div>
  );
}

/** Identidade da conta em nuvem (quando o backend Supabase está ligado). */
/* ----------------------------- Prévias da marca ---------------------------- */

/** Moldura comum das duas prévias, para elas se lerem como um par. */
function Previa({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-card border border-border bg-surface">
      <div className="border-b border-border px-3 py-2 text-2xs font-semibold uppercase tracking-wider text-ink-3">
        {titulo}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

/**
 * Como a cor cai no portal do aluno: cabeçalho em gradiente da marca, a logo do
 * profissional e o botão de ação positiva.
 *
 * Simplificada de propósito (não é um espelho pixel a pixel do StudentApp), mas
 * fiel no que decide a escolha: a cor de fundo, o texto por cima dela e a logo
 * no tamanho real do avatar. É por isso que ela também revela logo cortada.
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
      <div className="overflow-hidden rounded-control" style={{ background: "#0D1524" }}>
        <div className="flex items-center gap-2.5 p-3" style={{ background: cor }}>
          <LogoQuadrada logoDataUrl={logoDataUrl} nome={nome || empresa} cor={cor} tinta={tinta} />
          <div className="min-w-0">
            <div className="truncate text-2xs font-semibold" style={{ color: tinta, opacity: 0.85 }}>
              Seu treino com
            </div>
            <div className="truncate text-sm font-bold" style={{ color: tinta }}>
              {empresa || nome || "Seu nome"}
            </div>
          </div>
        </div>
        <div className="space-y-2 p-3">
          <div className="rounded-control p-2.5" style={{ background: "#131D31" }}>
            <div className="text-2xs" style={{ color: "#8FA1BD" }}>
              Treino de hoje
            </div>
            <div className="text-sm font-semibold" style={{ color: "#F2F6FC" }}>
              Sessão A · Inferiores
            </div>
          </div>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="w-full rounded-full py-2 text-sm font-bold"
            style={{ background: cor, color: tinta }}
          >
            Começar treino
          </button>
        </div>
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
      <div className="rounded-control bg-white p-3">
        <div
          className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b-2 pb-2.5"
          style={{ borderColor: cor }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {logoDataUrl && <img src={logoDataUrl} alt="" className="h-9 max-w-[110px] object-contain" />}
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-bold" style={{ color: cor }}>
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
        <div className="pt-2.5">
          <div className="text-2xs font-semibold uppercase tracking-wider" style={{ color: cor }}>
            Prescrição de treino
          </div>
          <div className="mt-1 h-1.5 w-3/4 rounded-full bg-[#E8E6DF]" />
          <div className="mt-1 h-1.5 w-1/2 rounded-full bg-[#E8E6DF]" />
        </div>
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

function ContaNuvemCard() {
  const user = useCloudAuth((s) => s.user);
  const emailConta = user?.email ?? "";
  const [saindo, setSaindo] = React.useState(false);

  return (
    <Card className="p-6">
      <h3 className="font-display text-lg font-bold text-ink">Conta</h3>
      <p className="mb-4 text-sm text-ink-2">
        Você está conectado. Seus alunos, avaliações e prescrições ficam salvos na sua conta e
        aparecem em qualquer aparelho onde você entrar.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-soft p-3">
        <div className="min-w-0">
          <div className="text-2xs font-semibold uppercase tracking-wider text-ink-3">E-mail da conta</div>
          <div className="truncate text-sm font-semibold text-ink">{emailConta || "conta conectada"}</div>
        </div>
        <button
          onClick={async () => {
            setSaindo(true);
            await signOut();
            window.location.reload();
          }}
          disabled={saindo}
          className={cn(buttonClasses("outline"), saindo && "opacity-60")}
        >
          <Lock className="h-4 w-4" /> {saindo ? "Saindo…" : "Sair da conta"}
        </button>
      </div>
      <p className="mt-3 text-xs text-ink-3">
        Os dados trafegam protegidos e cada profissional só enxerga os próprios (segurança por
        linha, no banco).
      </p>
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
    <Card className="p-6">
      <div className="mb-1 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold text-ink">Acesso com senha</h3>
        {temSenha && <Pill tone="success">Ativo</Pill>}
      </div>
      <p className="mb-4 text-sm text-ink-2">
        {temSenha
          ? "O app pede esta senha uma vez por sessão do navegador. Use Sair no menu do topo para bloquear."
          : "Crie uma senha para o app pedir acesso ao abrir: útil em computador compartilhado (recepção, notebook do estúdio)."}
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {temSenha && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Senha atual</span>
            <input type="password" value={atual} onChange={(e) => setAtual(e.target.value)} className="input" autoComplete="current-password" />
          </label>
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">{temSenha ? "Nova senha" : "Senha"}</span>
          <input type="password" value={nova} onChange={(e) => setNova(e.target.value)} className="input" autoComplete="new-password" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Confirmar</span>
          <input type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} className="input" autoComplete="new-password" />
        </label>
      </div>
      {erro && <p className="mt-2 text-sm font-medium text-danger">{erro}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={salvar} disabled={salvando} className={cn(buttonClasses("primary", "sm"), salvando && "opacity-60")}>
          <Lock className="h-4 w-4" /> {temSenha ? "Alterar senha" : "Criar senha"}
        </button>
        {temSenha && (
          <button onClick={remover} disabled={salvando} className={buttonClasses("ghost", "sm")}>
            Remover senha
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-3">
        Proteção de acesso local deste dispositivo (a senha nunca sai do seu navegador). O login em
        nuvem, com acesso de qualquer aparelho, chega com a fase de contas online.
      </p>
    </Card>
  );
}
