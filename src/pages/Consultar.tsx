import { Search } from "lucide-react";
import { SectionHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { Consulta } from "@/features/learning/pages/Consulta";
import { Library } from "@/pages/Library";

/**
 * Consultar: a busca de resposta rápida do momento de trabalho, num só lugar.
 *
 * Funde os dois atalhos que viviam separados (Consulta rápida do Aprender e o
 * Glossário) sem sugar a Biblioteca científica, que segue como prova verificada
 * dentro de Estudar. Aqui o profissional resolve a dúvida do atendimento: uma
 * resposta situacional e prudente, ou a definição exata de um termo, com o
 * ponteiro PARA a evidência quando precisa aprofundar.
 */
export function Consultar() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SectionHeader
        eyebrow="Referência rápida"
        icon={<Search className="h-3 w-3" />}
        title="Consultar"
        subtitle="A resposta que você precisa no meio do atendimento: uma orientação situacional e prudente, ou a definição exata de um termo. Para aprofundar, cada resposta aponta para a evidência."
      />
      <Tabs
        items={[
          { id: "resposta", label: "Resposta rápida", content: <Consulta embedded /> },
          { id: "glossario", label: "Glossário", content: <Library embedded /> },
        ]}
      />
    </div>
  );
}
