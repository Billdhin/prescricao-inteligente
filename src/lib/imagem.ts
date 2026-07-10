/**
 * Upload de imagem local → dataURL redimensionada (cabe no localStorage e nos
 * documentos impressos sem pesar). Foto de perfil: quadrado (cover). Logo:
 * mantém proporção dentro da caixa (contain), fundo transparente preservado.
 */

export function arquivoParaDataUrl(
  file: File,
  opts: { maxW: number; maxH: number; modo: "cover-quadrado" | "contain"; qualidade?: number },
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("O arquivo precisa ser uma imagem (PNG, JPG ou WebP)."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Não foi possível processar a imagem neste navegador."));
        return;
      }
      if (opts.modo === "cover-quadrado") {
        const lado = Math.min(opts.maxW, opts.maxH);
        canvas.width = lado;
        canvas.height = lado;
        const s = Math.min(img.width, img.height);
        const sx = (img.width - s) / 2;
        const sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, 0, 0, lado, lado);
      } else {
        const escala = Math.min(1, opts.maxW / img.width, opts.maxH / img.height);
        canvas.width = Math.max(1, Math.round(img.width * escala));
        canvas.height = Math.max(1, Math.round(img.height * escala));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      // PNG preserva transparência de logos; foto quadrada vai de JPEG (menor)
      const mime = opts.modo === "contain" ? "image/png" : "image/jpeg";
      resolve(canvas.toDataURL(mime, opts.qualidade ?? 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    img.src = url;
  });
}
