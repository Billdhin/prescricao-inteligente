# Prompts das imagens de erro comum

Gerado a partir dos erros reais em `src/data/exercises.ts` e `exercises-extra.ts`.

## Por que refazer

Hoje existe UMA imagem por exercício (`erros/<slug>.webp`) servindo para os 2 a 4 erros daquele exercício. Uma figura não mostra "joelho valgo" e "lombar em flexão" ao mesmo tempo, então ela não remete a erro nenhum. As variações ficaram boas porque têm uma foto por variação. Os erros passam a seguir o mesmo padrão: uma imagem por erro.

## Regras para todas as imagens

Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo.

Cada imagem mostra o ERRO exagerado o suficiente para ser reconhecido de relance, com a REGIÃO SOBRECARREGADA destacada em vermelho translúcido. Nunca mostrar a execução correta: o objetivo é o profissional reconhecer o erro.

## Onde salvar

`public/exercises/erros/<slug>-<indice>.webp` (índice começa em 0, na ordem listada abaixo). Depois de salvar, registrar os índices em `ERRO_IMGS` de `src/data/aba-imagens.ts` e a aba passa a exibir sozinha.

---

## Leg press 45° (`leg-press-45`)

### `leg-press-45-0.webp`

**Erro que a imagem deve mostrar:** Descer além do ponto em que a pelve começa a se retroverter.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Leg press 45° cometendo especificamente este erro: Descer além do ponto em que a pelve começa a se retroverter. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `leg-press-45-1.webp`

**Erro que a imagem deve mostrar:** Travar completamente os joelhos ao final da fase concêntrica.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Leg press 45° cometendo especificamente este erro: Travar completamente os joelhos ao final da fase concêntrica. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `leg-press-45-2.webp`

**Erro que a imagem deve mostrar:** Escolher amplitude única sem considerar a mobilidade individual.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Leg press 45° cometendo especificamente este erro: Escolher amplitude única sem considerar a mobilidade individual. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Agachamento livre (`agachamento-livre`)

### `agachamento-livre-0.webp`

**Erro que a imagem deve mostrar:** Flexão lombar acentuada no ponto mais baixo sob carga elevada.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Agachamento livre cometendo especificamente este erro: Flexão lombar acentuada no ponto mais baixo sob carga elevada. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `agachamento-livre-1.webp`

**Erro que a imagem deve mostrar:** Descolamento dos calcanhares por falta de mobilidade de tornozelo.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Agachamento livre cometendo especificamente este erro: Descolamento dos calcanhares por falta de mobilidade de tornozelo. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `agachamento-livre-2.webp`

**Erro que a imagem deve mostrar:** Escolher amplitude e carga incompatíveis com o nível técnico.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Agachamento livre cometendo especificamente este erro: Escolher amplitude e carga incompatíveis com o nível técnico. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Supino reto com barra (`supino-reto-barra`)

### `supino-reto-barra-0.webp`

**Erro que a imagem deve mostrar:** Abrir demais os cotovelos, elevando a demanda no ombro.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Supino reto com barra cometendo especificamente este erro: Abrir demais os cotovelos, elevando a demanda no ombro. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `supino-reto-barra-1.webp`

**Erro que a imagem deve mostrar:** Perder a retração escapular ao empurrar.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Supino reto com barra cometendo especificamente este erro: Perder a retração escapular ao empurrar. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `supino-reto-barra-2.webp`

**Erro que a imagem deve mostrar:** Quicar a barra no peito para vencer a carga.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Supino reto com barra cometendo especificamente este erro: Quicar a barra no peito para vencer a carga. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Cadeira extensora (`cadeira-extensora`)

### `cadeira-extensora-0.webp`

**Erro que a imagem deve mostrar:** Usar impulso e soltar o peso na descida.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Cadeira extensora cometendo especificamente este erro: Usar impulso e soltar o peso na descida. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `cadeira-extensora-1.webp`

**Erro que a imagem deve mostrar:** Buscar amplitude à custa de dor.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Cadeira extensora cometendo especificamente este erro: Buscar amplitude à custa de dor. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Mesa flexora (`mesa-flexora`)

### `mesa-flexora-0.webp`

**Erro que a imagem deve mostrar:** Levantar a pelve para ajudar.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Mesa flexora cometendo especificamente este erro: Levantar a pelve para ajudar. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `mesa-flexora-1.webp`

**Erro que a imagem deve mostrar:** Retorno sem controle.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Mesa flexora cometendo especificamente este erro: Retorno sem controle. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Levantamento terra romeno (stiff) (`levantamento-terra-romeno`)

### `levantamento-terra-romeno-0.webp`

**Erro que a imagem deve mostrar:** Arredondar a lombar ao descer.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Levantamento terra romeno (stiff) cometendo especificamente este erro: Arredondar a lombar ao descer. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `levantamento-terra-romeno-1.webp`

**Erro que a imagem deve mostrar:** Transformar em agachamento flexionando muito os joelhos.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Levantamento terra romeno (stiff) cometendo especificamente este erro: Transformar em agachamento flexionando muito os joelhos. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Hip thrust (elevação pélvica) (`hip-thrust`)

### `hip-thrust-0.webp`

**Erro que a imagem deve mostrar:** Empurrar com a lombar em vez do quadril.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Hip thrust (elevação pélvica) cometendo especificamente este erro: Empurrar com a lombar em vez do quadril. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `hip-thrust-1.webp`

**Erro que a imagem deve mostrar:** Amplitude curta demais no topo.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Hip thrust (elevação pélvica) cometendo especificamente este erro: Amplitude curta demais no topo. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Afundo (passada) (`afundo-passada`)

### `afundo-passada-0.webp`

**Erro que a imagem deve mostrar:** Joelho colapsando para dentro.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Afundo (passada) cometendo especificamente este erro: Joelho colapsando para dentro. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `afundo-passada-1.webp`

**Erro que a imagem deve mostrar:** Passada curta demais.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Afundo (passada) cometendo especificamente este erro: Passada curta demais. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `afundo-passada-2.webp`

**Erro que a imagem deve mostrar:** Tronco desabando à frente.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Afundo (passada) cometendo especificamente este erro: Tronco desabando à frente. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Puxada alta (pulldown) (`puxada-alta`)

### `puxada-alta-0.webp`

**Erro que a imagem deve mostrar:** Puxar só com os braços.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Puxada alta (pulldown) cometendo especificamente este erro: Puxar só com os braços. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `puxada-alta-1.webp`

**Erro que a imagem deve mostrar:** Balançar o tronco.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Puxada alta (pulldown) cometendo especificamente este erro: Balançar o tronco. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `puxada-alta-2.webp`

**Erro que a imagem deve mostrar:** Puxar a barra atrás da nuca sem necessidade.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Puxada alta (pulldown) cometendo especificamente este erro: Puxar a barra atrás da nuca sem necessidade. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Remada baixa (`remada-baixa`)

### `remada-baixa-0.webp`

**Erro que a imagem deve mostrar:** Usar impulso de tronco.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Remada baixa cometendo especificamente este erro: Usar impulso de tronco. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `remada-baixa-1.webp`

**Erro que a imagem deve mostrar:** Encolher os ombros.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Remada baixa cometendo especificamente este erro: Encolher os ombros. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `remada-baixa-2.webp`

**Erro que a imagem deve mostrar:** Amplitude curta.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Remada baixa cometendo especificamente este erro: Amplitude curta. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Desenvolvimento de ombros (`desenvolvimento-ombros`)

### `desenvolvimento-ombros-0.webp`

**Erro que a imagem deve mostrar:** Hiperestender a lombar para empurrar.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Desenvolvimento de ombros cometendo especificamente este erro: Hiperestender a lombar para empurrar. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `desenvolvimento-ombros-1.webp`

**Erro que a imagem deve mostrar:** Amplitude excessiva desconfortável.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Desenvolvimento de ombros cometendo especificamente este erro: Amplitude excessiva desconfortável. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Rosca direta (`rosca-direta`)

### `rosca-direta-0.webp`

**Erro que a imagem deve mostrar:** Balançar o corpo.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Rosca direta cometendo especificamente este erro: Balançar o corpo. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `rosca-direta-1.webp`

**Erro que a imagem deve mostrar:** Mover o cotovelo para frente.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Rosca direta cometendo especificamente este erro: Mover o cotovelo para frente. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Tríceps na polia (`triceps-polia`)

### `triceps-polia-0.webp`

**Erro que a imagem deve mostrar:** Abrir os cotovelos.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Tríceps na polia cometendo especificamente este erro: Abrir os cotovelos. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `triceps-polia-1.webp`

**Erro que a imagem deve mostrar:** Curvar o corpo para empurrar.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Tríceps na polia cometendo especificamente este erro: Curvar o corpo para empurrar. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Caminhada inclinada (esteira) (`caminhada-esteira`)

### `caminhada-esteira-0.webp`

**Erro que a imagem deve mostrar:** Segurar no apoio o tempo todo (descarrega o peso corporal).

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Caminhada inclinada (esteira) cometendo especificamente este erro: Segurar no apoio o tempo todo (descarrega o peso corporal). Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `caminhada-esteira-1.webp`

**Erro que a imagem deve mostrar:** Aumentar velocidade e inclinação ao mesmo tempo.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Caminhada inclinada (esteira) cometendo especificamente este erro: Aumentar velocidade e inclinação ao mesmo tempo. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `caminhada-esteira-2.webp`

**Erro que a imagem deve mostrar:** Ignorar o teste da fala e progredir só pela velocidade.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Caminhada inclinada (esteira) cometendo especificamente este erro: Ignorar o teste da fala e progredir só pela velocidade. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Bicicleta ergométrica (`bicicleta-ergometrica`)

### `bicicleta-ergometrica-0.webp`

**Erro que a imagem deve mostrar:** Banco baixo demais (joelho muito flexionado sob carga).

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Bicicleta ergométrica cometendo especificamente este erro: Banco baixo demais (joelho muito flexionado sob carga). Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `bicicleta-ergometrica-1.webp`

**Erro que a imagem deve mostrar:** Apoiar o peso nos punhos e tensionar os ombros.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Bicicleta ergométrica cometendo especificamente este erro: Apoiar o peso nos punhos e tensionar os ombros. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `bicicleta-ergometrica-2.webp`

**Erro que a imagem deve mostrar:** Progredir carga sem consolidar tempo de sessão.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Bicicleta ergométrica cometendo especificamente este erro: Progredir carga sem consolidar tempo de sessão. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Elíptico (`eliptico`)

### `eliptico-0.webp`

**Erro que a imagem deve mostrar:** Apoiar-se no console e 'desligar' o tronco.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Elíptico cometendo especificamente este erro: Apoiar-se no console e 'desligar' o tronco. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `eliptico-1.webp`

**Erro que a imagem deve mostrar:** Resistência alta demais logo no início.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Elíptico cometendo especificamente este erro: Resistência alta demais logo no início. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `eliptico-2.webp`

**Erro que a imagem deve mostrar:** Pedalar só com as pernas, sem usar as alças.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Elíptico cometendo especificamente este erro: Pedalar só com as pernas, sem usar as alças. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Marcha aquática (hidro) (`marcha-aquatica`)

### `marcha-aquatica-0.webp`

**Erro que a imagem deve mostrar:** Água rasa demais (aumenta o impacto que se queria evitar).

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Marcha aquática (hidro) cometendo especificamente este erro: Água rasa demais (aumenta o impacto que se queria evitar). Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `marcha-aquatica-1.webp`

**Erro que a imagem deve mostrar:** Andar 'passeando' sem usar braços nem ritmo: estímulo insuficiente.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Marcha aquática (hidro) cometendo especificamente este erro: Andar 'passeando' sem usar braços nem ritmo: estímulo insuficiente. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `marcha-aquatica-2.webp`

**Erro que a imagem deve mostrar:** Tentar guiar a intensidade pela FC dentro da água.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Marcha aquática (hidro) cometendo especificamente este erro: Tentar guiar a intensidade pela FC dentro da água. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Sentar e levantar (banco) (`sentar-levantar`)

### `sentar-levantar-0.webp`

**Erro que a imagem deve mostrar:** Usar impulso de tronco em vez de força de pernas.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Sentar e levantar (banco) cometendo especificamente este erro: Usar impulso de tronco em vez de força de pernas. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `sentar-levantar-1.webp`

**Erro que a imagem deve mostrar:** Pés distantes da cadeira (joelhos viram 'dobradiça' sobrecarregada).

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Sentar e levantar (banco) cometendo especificamente este erro: Pés distantes da cadeira (joelhos viram 'dobradiça' sobrecarregada). Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `sentar-levantar-2.webp`

**Erro que a imagem deve mostrar:** Descer sem controle, 'caindo' no assento.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Sentar e levantar (banco) cometendo especificamente este erro: Descer sem controle, 'caindo' no assento. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Ponte de glúteos (solo) (`ponte-gluteos`)

### `ponte-gluteos-0.webp`

**Erro que a imagem deve mostrar:** Hiperextender a lombar no topo do movimento.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Ponte de glúteos (solo) cometendo especificamente este erro: Hiperextender a lombar no topo do movimento. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `ponte-gluteos-1.webp`

**Erro que a imagem deve mostrar:** Empurrar pela ponta dos pés em vez dos calcanhares.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Ponte de glúteos (solo) cometendo especificamente este erro: Empurrar pela ponta dos pés em vez dos calcanhares. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `ponte-gluteos-2.webp`

**Erro que a imagem deve mostrar:** Subir e descer rápido, sem pausa no topo.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Ponte de glúteos (solo) cometendo especificamente este erro: Subir e descer rápido, sem pausa no topo. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Prancha alta (`prancha-frontal`)

### `prancha-frontal-0.webp`

**Erro que a imagem deve mostrar:** Quadril caído (lombar em hiperextensão).

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Prancha alta cometendo especificamente este erro: Quadril caído (lombar em hiperextensão). Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `prancha-frontal-1.webp`

**Erro que a imagem deve mostrar:** Prender a respiração a série inteira.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Prancha alta cometendo especificamente este erro: Prender a respiração a série inteira. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `prancha-frontal-2.webp`

**Erro que a imagem deve mostrar:** Buscar tempo máximo em vez de qualidade de posição.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Prancha alta cometendo especificamente este erro: Buscar tempo máximo em vez de qualidade de posição. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Dead bug (controle de core) (`dead-bug`)

### `dead-bug-0.webp`

**Erro que a imagem deve mostrar:** Deixar a lombar arquear na extensão dos membros.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Dead bug (controle de core) cometendo especificamente este erro: Deixar a lombar arquear na extensão dos membros. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `dead-bug-1.webp`

**Erro que a imagem deve mostrar:** Mover braço e perna do MESMO lado (perde o desafio rotacional).

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Dead bug (controle de core) cometendo especificamente este erro: Mover braço e perna do MESMO lado (perde o desafio rotacional). Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `dead-bug-2.webp`

**Erro que a imagem deve mostrar:** Fazer rápido demais, com impulso.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Dead bug (controle de core) cometendo especificamente este erro: Fazer rápido demais, com impulso. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Remada com elástico (`remada-elastica`)

### `remada-elastica-0.webp`

**Erro que a imagem deve mostrar:** Puxar só com os braços, sem retração escapular.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Remada com elástico cometendo especificamente este erro: Puxar só com os braços, sem retração escapular. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `remada-elastica-1.webp`

**Erro que a imagem deve mostrar:** Devolver o elástico rápido, sem resistir.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Remada com elástico cometendo especificamente este erro: Devolver o elástico rápido, sem resistir. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `remada-elastica-2.webp`

**Erro que a imagem deve mostrar:** Tronco balançando para 'ajudar' a puxada.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Remada com elástico cometendo especificamente este erro: Tronco balançando para 'ajudar' a puxada. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


## Elevação de panturrilha em pé (`panturrilha-em-pe`)

### `panturrilha-em-pe-0.webp`

**Erro que a imagem deve mostrar:** Quicar no fundo usando o reflexo elástico.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Elevação de panturrilha em pé cometendo especificamente este erro: Quicar no fundo usando o reflexo elástico. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `panturrilha-em-pe-1.webp`

**Erro que a imagem deve mostrar:** Amplitude parcial, sem alongamento nem pico.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Elevação de panturrilha em pé cometendo especificamente este erro: Amplitude parcial, sem alongamento nem pico. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.

### `panturrilha-em-pe-2.webp`

**Erro que a imagem deve mostrar:** Pressa: a panturrilha responde a repetições lentas e completas.

**Prompt para o Lovable:**

> Boneco 3D estilizado cinza neutro (mesmo personagem e mesmo estilo do boneco do mapa muscular do produto), sem rosto, fundo branco liso, enquadramento quadrado 1:1, figura inteira visível, luz suave de estúdio, sem nenhum texto na imagem, sem marca e sem logotipo. O boneco executa Elevação de panturrilha em pé cometendo especificamente este erro: Pressa: a panturrilha responde a repetições lentas e completas. Exagere o desvio postural desse erro para ficar inequívoco à primeira vista. Destaque em vermelho translúcido a região anatômica sobrecarregada por esse erro específico. Mostre apenas o erro, nunca a execução correta.


---

**Total: 62 imagens** em 23 exercícios.
