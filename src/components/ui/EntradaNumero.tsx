import * as React from "react";
import { soNumero, numeroOuAusente } from "@/lib/numeroDigitado";

/**
 * CAMPO NUMÉRICO CONTROLADO POR NÚMERO, com o texto guardado enquanto se digita.
 *
 * Os campos de perímetro da avaliação estavam presos direto ao número
 * (`value={String(p.valor)}`), e isso quebrava de dois jeitos ao mesmo tempo. Digitar "70,"
 * reconvertia para 70 e o campo reescrevia "70" por cima: a vírgula era impossível de
 * digitar, e com ela toda medida com casa decimal. E digitar letra escrevia literalmente
 * "NaN" dentro do campo.
 *
 * Guardar o TEXTO resolve os dois: o separador sobrevive enquanto o número ainda não fechou,
 * e o que sai para o modelo continua sendo número ou ausência, nunca NaN.
 *
 * Onde o estado do formulário JÁ é texto, não precisa deste componente: basta passar o
 * digitado por `soNumero` no onChange. Este aqui existe para o caso em que o estado é o
 * número em si.
 */
export function EntradaNumero({
  valor,
  onValor,
  inteiroAte99 = false,
  ...resto
}: {
  valor?: number;
  onValor: (n: number | undefined) => void;
  /** escalas de 0 a 10 e afins: sem separador, no máximo dois dígitos */
  inteiroAte99?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  const texto = (n?: number) => (n != null ? String(n).replace(".", ",") : "");
  const [bruto, setBruto] = React.useState(() => texto(valor));

  /*
   * Re-sincroniza quando o NÚMERO de fora deixa de bater com o que este texto representa (o
   * pai trocou de linha, carregou outra avaliação, limpou o formulário). A comparação é pelo
   * VALOR, nunca pelo texto: comparar texto reescreveria "70," como "70" a cada tecla, que é
   * exatamente o defeito que este componente existe para não ter.
   */
  React.useEffect(() => {
    const atual = numeroOuAusente(bruto);
    if (valor !== atual) setBruto(texto(valor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return (
    <input
      inputMode={inteiroAte99 ? "numeric" : "decimal"}
      {...resto}
      value={bruto}
      onChange={(e) => {
        const t = soNumero(e.target.value, inteiroAte99);
        setBruto(t);
        onValor(numeroOuAusente(t));
      }}
    />
  );
}
