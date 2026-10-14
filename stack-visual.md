# Stack visual da loja

Catálogo do que dá a cara editorial desta loja: linguagens, frameworks, bibliotecas, técnicas de movimento, imagem e rolagem, e as decisões de interface. Serve de base para repetir o formato em outros projetos.

Os caminhos entre parênteses apontam para o código deste repositório.

## Linguagens

| Linguagem | Onde entra |
| --- | --- |
| TypeScript | Toda a lógica, inclusive os componentes de animação |
| TSX | A interface. HTML semântico sai daqui (`header`, `nav`, `main`, `section`, `button`) |
| CSS | Animações que o navegador faz sozinho, tokens de cor e tipografia. Arquivo único: `src/app/globals.css` |

Não há CSS-in-JS nem folha de estilo por componente. O visual vive em classes do Tailwind mais um bloco de CSS próprio para o que o Tailwind não expressa bem (máscaras de texto, View Transitions, rolagem).

## Frameworks

| Ferramenta | Versão neste projeto | Papel visual |
| --- | --- | --- |
| Next.js | 16.4.0 | App Router, fontes, otimização de imagem, navegação entre páginas |
| React | 19.3.0 | Componentes e o componente `ViewTransition`, que anima a troca de página |
| Tailwind CSS | 4 | Quase todo o layout, cor, espaçamento e estado de hover |

Detalhes desta versão que mudam o jeito de estilizar:

- Tailwind 4 não usa `tailwind.config.js`. O tema fica no próprio CSS, dentro de `@theme`, em `src/app/globals.css`.
- Classes novas reutilizáveis são criadas com `@utility` (aqui: `font-wide`, `eyebrow`, `no-scrollbar`).
- As fontes vêm de `next/font/google` e são aplicadas como variável CSS (`--font-archivo`, `--font-geist-sans`, `--font-geist-mono`), não por `<link>` no HTML.

## Bibliotecas

Só três bibliotecas existem por causa do visual. O resto do `package.json` é banco, login e validação, e não entra numa landing page.

| Biblioteca | Versão | Para que serve | Quando usar de novo |
| --- | --- | --- | --- |
| `motion` | 14 | Animações ligadas ao React: entrada na tela, valor acompanhando a rolagem, mola, presença | Qualquer movimento que dependa de estado ou de posição na página |
| `lenis` | 1.3 | Rolagem suave da página inteira | Sites editoriais em que a rolagem é parte da identidade |
| `lucide-react` | 1.53 | Ícones em traço fino | Ícones de interface, sem desenhar SVG na mão |
| `sonner` | 2.0 | Avisos do painel admin | Só em área logada, não na vitrine |

`motion` 14 é a continuidade do Framer Motion. A importação usada aqui é `motion/react`.

Instalação mínima para repetir o visual:

```bash
npm install motion lenis lucide-react
```

## Técnicas de movimento, imagem e rolagem

A regra que organiza tudo: o navegador anima o que é decoração repetida, e o JavaScript anima o que depende de rolagem, de estado ou de um elemento específico. Isso mantém a página leve e faz a animação parar sozinha quando a pessoa pede menos movimento no sistema.

### 1. Rolagem suave com Lenis

Arquivo: `src/components/motion/providers.tsx`.

O `ReactLenis` com `root` substitui a rolagem nativa da janela por uma interpolação. Os números usados:

- `lerp: 0.085` controla o quanto a página "alcança" o destino a cada quadro. Menor deixa mais lento e mais cinematográfico. Maior fica mais perto da rolagem normal.
- `wheelMultiplier: 0.95` reduz um pouco a distância de cada giro do scroll.
- `anchors: true` faz links com `#ancora` rolarem suavemente.

Três cuidados que evitam briga com o resto da interface:

- A rolagem suave é desligada quando o sistema está em "reduzir movimento".
- Painéis abertos (sacola, menu, busca, zoom da foto) chamam `lenis.stop()` e travam o `overflow` do `body`. Ao fechar, `lenis.start()`.
- Depois de cada troca de página, `LenisRouteSync` relê a posição real da janela, porque o Next reposiciona a rolagem por conta própria.
- Áreas com rolagem própria (a lista da sacola, o menu) levam o atributo `data-lenis-prevent`, senão o Lenis rouba o gesto.

### 2. Entrada quando o bloco aparece

Arquivo: `src/components/motion/reveal.tsx`, componente `Reveal`.

`whileInView` dispara uma vez (`viewport.once`) quando uma fração do bloco entra na tela. A animação padrão sobe 28px e vai de opacidade 0 a 1 em 0,9s, com a curva `[0.22, 1, 0.36, 1]` (saída suave, definida em `src/components/motion/ease.ts`).

Use para parágrafos, preços, grupos de links. Não use para títulos grandes: esses têm máscara.

### 3. Título que sobe por trás de uma máscara

Mesmo arquivo, componente `SplitText`.

Cada palavra (ou cada letra) fica dentro de um `span` com `overflow: hidden`. A palavra começa deslocada 118% para baixo, então fica escondida pelo próprio recorte, e anima até `0%`. As palavras entram em sequência (`delay` cresce a cada uma).

Há duas formas de disparar:

- Sozinha, quando o título entra na tela (`useInView`).
- Controlada por fora, pela prop `play`. O título do banner só começa depois que a intro da marca termina.

A detecção olha o título inteiro, não cada palavra. Se olhar a palavra, a máscara dela nunca "entra" na tela e o título fica invisível para sempre.

### 4. Texto que acende com a rolagem

Mesmo arquivo, componente `ScrollWords`. Usado no manifesto.

`useScroll` mede o quanto daquele bloco já passou pela tela (de "topo do bloco a 85% da janela" até "base do bloco a 40%"). `useTransform` converte essa fração em opacidade e um pequeno deslocamento, uma palavra por vez. A primeira palavra acende no começo do percurso e a última no fim.

É a técnica certa quando o texto deve ser lido no ritmo da rolagem, não aparecer de uma vez.

### 5. Imagem que se abre em cortina, com paralaxe

Mesmo arquivo, componente `RevealImage`. Usado no bloco editorial.

Duas animações ao mesmo tempo:

- O recipiente abre com `clip-path`, de `inset(100% 0 0 0)` para `inset(0)`. Isso cria a cortina de baixo para cima.
- A imagem interna começa em `scale: 1.25` e volta para `1`, então parece um zoom out enquanto a cortina abre.

A paralaxe é separada: `useScroll` + `useTransform` movem a imagem de `-7%` a `7%` enquanto o bloco cruza a tela. A imagem é maior que o recorte (`scale: 1.16`) para esse deslocamento não mostrar borda vazia.

### 6. Cards que entram acompanhando a rolagem, sem JavaScript

Arquivo: `src/app/globals.css`, classe `.reveal-card`.

`animation-timeline: view()` amarra a animação à posição do elemento na janela. O card vai de "90px abaixo e levemente menor" até a posição final enquanto entra na tela. Os cards da mesma linha têm `animation-range` deslocado, então entram em cascata.

Isso é CSS puro. Não observa rolagem em JavaScript e não custa nada em aparelhos fracos. O bloco está dentro de `@supports (animation-timeline: view())`, então navegadores sem o recurso simplesmente mostram os cards parados, sem quebrar.

Use para grades repetidas (produtos, posts, fotos). Use `motion` quando a entrada precisa esperar outro evento.

### 7. Faixa de texto que reage à velocidade da rolagem

Arquivo: `src/components/motion/velocity-marquee.tsx`.

A faixa anda sozinha em `useAnimationFrame`. A velocidade da rolagem vem de `useVelocity(scrollY)`, suavizada com `useSpring`. Essa velocidade faz três coisas:

- acelera a faixa;
- inverte a direção quando a pessoa rola para cima;
- inclina as letras (`skewX`) proporcionalmente à velocidade.

`useInView` pausa a conta quando a faixa está fora da tela. A função `wrap` mantém o deslocamento entre `-50%` e `0%`, e o conteúdo está duplicado lado a lado, o que dá a volta infinita sem salto.

A faixa fina do topo do site é mais simples: só `@keyframes marquee` em CSS, sem reação à velocidade.

### 8. Banner fixo com paralaxe

Arquivo: `src/components/store/hero-carousel.tsx`.

Enquanto a primeira tela é rolada para fora, três valores derivados de `useScroll` se mexem em ritmos diferentes:

- a foto desce e aumenta (`y` até 30%, `scale` até 1.12);
- o texto sobe e some (`y` até -160px, opacidade até 0);
- um véu preto fica mais forte por cima da foto.

Mover camadas em velocidades diferentes é o que cria profundidade. A troca de slide é outra animação: o slide novo abre com `clip-path` em 1,35s, e o anterior fica parado atrás até ser coberto. O título, o subtítulo e o botão entram escalonados, esperando a intro.

Por cima disso, a foto do slide ativo tem a classe `animate-kenburns`: um zoom out lento de 9s feito em CSS (`@keyframes kenburns`).

O carrossel também troca de slide ao arrastar (`pointerdown` / `pointerup`, com um mínimo de 60px) e sozinho a cada 7 segundos, com uma barrinha de progresso em CSS.

### 9. Seção que prende e rola na horizontal

Arquivo: `src/components/store/horizontal-categories.tsx`.

No desktop a seção fica mais alta do que a tela (`100svh` mais a largura que sobra do trilho). O miolo é `sticky top-0` com `h-svh`. Enquanto a pessoa rola verticalmente por essa altura extra, o código converte a posição da rolagem em `translateX` do trilho. A rolagem vertical vira movimento horizontal, e a barra de progresso da seção é o mesmo valor em `scaleX`.

A conta é direta, sem `useScroll` do `motion`: `(scrollY - topoDaSecao) / distancia`. Foi feito assim porque o valor precisa existir já no primeiro quadro, antes de qualquer animação de mola.

No celular a mesma marcação vira uma faixa nativa (`overflow-x: auto` com `snap-x`). Gesto horizontal no toque é melhor do que prender a página.

### 10. Cabeçalho que se esconde

Arquivo: `src/components/store/site-top.tsx`, estilo em `globals.css` (`.site-top`).

Um listener de `scroll` compara a posição atual com a anterior, dentro de `requestAnimationFrame` para não calcular mais de uma vez por quadro:

- passou de 24px: esconde a faixa de avisos;
- descendo depois de 240px: esconde o cabeçalho inteiro;
- subindo: traz de volta.

O estado vai para atributos `data-scrolled` e `data-hidden`. Quem anima é o CSS (`transform` em 0,7s), não o JavaScript. A barra de filtros da loja usa a classe `sticky-under-header` e sobe junto quando o cabeçalho some.

Sobre o banner da home o cabeçalho fica transparente. Nas outras páginas ele é sólido. O seletor trata um detalhe do Next 16: a página anterior continua montada e oculta (`display: none`), então a regra ignora um banner que esteja dentro de página escondida.

### 11. Botão de voltar ao topo com anel de progresso

Arquivo: `src/components/motion/back-to-top.tsx`.

`useScroll` entrega o progresso da página inteira (0 a 1). Esse número alimenta `pathLength` de um círculo SVG, suavizado com `useSpring`, então o anel acompanha a rolagem com atraso curto. O botão só existe depois de 800px (`AnimatePresence` cuida da entrada e da saída). O clique chama `lenis.scrollTo(0)` quando a rolagem suave está ativa.

### 12. Intro da marca

Arquivos: `src/components/motion/intro.tsx`, `intro-script.ts`, `intro-state.ts`.

Uma camada fixa cobre a tela. `animate()` (função imperativa do `motion`, não um componente) leva um valor de 0 a 100 em 1,5s. Esse valor vira o contador e a largura da barra. As letras do nome sobem uma a uma. No fim, a camada sai com `clip-path` de baixo para cima e libera o banner.

Para não piscar em quem já viu:

- um `<script>` minúsculo roda enquanto o HTML é lido, antes da primeira pintura, e marca `data-intro="done"` se já houver registro na `sessionStorage` ou se o sistema pedir menos movimento;
- o CSS esconde a camada quando esse atributo existe;
- a intro só acontece uma vez por aba. Outra aba mostra de novo.

`useIntroDone` avisa o banner de que pode começar a animar o título. Sem isso, o título animaria por baixo da intro e a pessoa perderia a entrada.

### 13. Troca de página

Arquivo: `src/components/motion/page-transition.tsx`, CSS `::view-transition-*` em `globals.css`.

O React 19.3 tem o componente `ViewTransition`. Envolvendo o conteúdo de cada página, a navegação do Next dispara sozinha a View Transitions API do navegador. O CSS define:

- a página que sai sobe 28px, perde opacidade e ganha 6px de desfoque em 280ms;
- a página que entra sobe 48px até o lugar, começando 160ms depois, em 750ms;
- o cabeçalho tem `viewTransitionName: site-header` e a animação dele é anulada, então ele não desliza junto com o conteúdo.

A foto do produto usa o mesmo recurso com outro efeito. O card e a galeria envolvem a imagem em `ViewTransition` com o mesmo `name` (`product-slug`) e `share="morph"`. O navegador anima a foto de um retângulo até o outro. O CSS da classe `.morph` deixa essa viagem em 800ms com um desfoque leve no meio.

Isso só aparece com fluidez em build de produção (`npm run build` e `npm start`), no Chrome, Edge e Safari recentes. Em desenvolvimento o Next não pré-carrega a página de destino, então a foto troca sem o morph. Sem suporte no navegador, a página simplesmente troca no instante.

### 14. Zoom de foto

Arquivos: `src/components/store/product-gallery.tsx` e `product-lightbox.tsx`.

A galeria abre um painel em tela cheia. Um clique amplia a imagem para `scale(2.2)`. O ponto de origem da transformação (`transform-origin`) é a posição do mouse em porcentagem, então o zoom cresce a partir de onde foi clicado e acompanha o mouse. Miniaturas e as setas do teclado trocam a foto com `AnimatePresence`.

Enquanto o painel está aberto, a rolagem suave fica pausada.

As fotos da grade e do banner usam `next/image` com `fill` e `sizes`. O navegador recebe o arquivo já no tamanho certo para aquela coluna, não o original de 2400px.

### 15. Hover de botão, sem biblioteca

Arquivos: `src/lib/ui.ts` e `src/components/motion/roll-text.tsx`.

Dois efeitos em CSS:

- **Preenchimento.** O botão tem um `::before` do tamanho dele, ancorado embaixo (`origin-bottom`) e com `scaleY(0)`. No hover ele vai a `scaleY(1)` em 0,5s. A cor sobe, em vez de trocar de uma vez.
- **Texto que rola.** `RollText` empilha duas cópias do texto. No hover do elemento pai (classe `group`), uma sobe para fora e a outra entra por baixo. Só CSS, sem medir nada.

`Magnetic` (`src/components/motion/magnetic.tsx`) é o complemento em JavaScript: no `pointermove` o botão anda uma fração da distância até o cursor, com `useSpring`, e volta ao soltar. Só reage a mouse, não a toque.

### 16. Cursor com rótulo

Arquivo: `src/components/motion/cursor.tsx`.

Um listener de `pointermove` grava a posição em dois `MotionValue`, suavizados com `useSpring` (a bolha chega atrasada de propósito). Se o elemento sob o cursor, ou um pai dele, tem `data-cursor="Ver"`, a bolha aparece com esse texto. `AnimatePresence` faz a bolha nascer e sumir em escala.

Só é montado quando `matchMedia` confirma mouse de verdade: `(hover: hover) and (pointer: fine)`. Em tela de toque ele não existe, e os `data-cursor` não atrapalham.

### 17. Microinterações de estado

Pequenas, todas com `AnimatePresence` para a entrada e a saída existirem:

- o número da sacola no cabeçalho troca deslizando para cima;
- a quantidade dentro da sacola faz o mesmo;
- o item removido escorrega para a direita antes de sair (`layout` reorganiza o resto);
- o tamanho escolhido tem um fundo que desliza até o botão novo (`layoutId`);
- tentar comprar sem tamanho faz a grade tremer (`animate` com uma lista de `x`);
- o botão de comprar troca o texto para "Adicionado" e o ícone de confirmação do pedido entra com mola (`type: "spring"`).

### 18. Acordeão com altura animada

CSS em `globals.css`, sem biblioteca.

`interpolate-size: allow-keywords` deixa o navegador animar até `height: auto`. O conteúdo do `<details>` sai de `block-size: 0` para `block-size: auto` com uma curva de 0,55s. O ícone de soma gira 45 graus pelo estado `group-open` do Tailwind.

### 19. Menos movimento

Quem liga "reduzir animações" no sistema operacional fica sem:

- rolagem suave;
- intro;
- deslocamento dos cards (`prefers-reduced-motion` dentro do `@supports`);
- qualquer animação declarada no CSS, porque o `@media` no fim de `globals.css` reduz a duração a quase zero;
- as animações do `motion`, porque `MotionConfig reducedMotion="user"` já faz isso.

As trocas de página também têm duração zerada nesse caso.

## UI e UX

O visual não vem só da animação. Estas decisões deixam o movimento com cara de editorial em vez de cara de template.

**Cor.** Fundo `#0a0a0a`, texto `#f1eee8`, uma única cor de destaque guardada na variável `--accent`. Trocar a cor no painel repinta selos, preços promocionais e detalhes sem mexer em componente. O texto que vai sobre a cor de destaque é escolhido por luminância (`readableOn` em `src/lib/utils.ts`), então uma cor clara ganha texto preto e uma cor escura ganha texto branco.

**Tipo.** Três famílias, cada uma com um trabalho:

- Archivo, com o eixo de largura em 125% (`font-wide`), só para títulos grandes;
- Geist para texto de leitura;
- Geist Mono em caixa alta com `letter-spacing: 0.2em` para rótulos pequenos (a classe `eyebrow`: "01 — Recém-chegados", "Tamanho", "Sacola").

Títulos usam `uppercase`, peso 900 e entrelinha perto de 0,85. O tamanho vem de `clamp()`, então a mesma frase ocupa a largura da tela no celular e no desktop.

**Superfície.** Cantos retos nos botões da loja. Sombra quase nenhuma. Separação por linha de 1px a 10% de branco, não por card com borda forte. Um grão fixo e quase invisível (`.grain`, um SVG de ruído a 4,5% de opacidade) tira o aspecto chapado da cor sólida.

**Hierarquia de página.** Cada página de listagem abre com um título em escala de vitrine, não com um `h1` pequeno. A primeira tela da home é 100% da altura, com o texto embaixo e a foto sangrando. O nome da marca reaparece gigante, vazado, no rodapé.

**Hover comunica a mesma coisa em todo lugar.** Foto de produto aproxima (`scale`), o nome ganha sublinhado que cresce da esquerda, e o cursor vira um rótulo dizendo o que o clique faz. A pessoa aprende o vocabulário uma vez.

**Toque é tratado à parte.** Cursor e botão magnético só existem com mouse. A rolagem horizontal vira faixa nativa no celular. O menu mobile abre em cortina (`clip-path`) com os itens subindo em sequência, em vez de um dropdown pequeno.

**Movimento tem motivo.** Cortina significa "revelar". Morph significa "é a mesma foto". Texto que acende significa "leia no meu ritmo". Nada pulsa em loop para chamar atenção, exceto a barrinha do banner e a faixa de avisos, que são informação contínua.

## Receita para o próximo projeto

Ordem em que vale montar, do que muda mais a percepção ao que é acabamento.

1. **Base.** Next.js + React 19 + Tailwind 4. Defina três cores e três fontes no `@theme` antes de desenhar qualquer seção. Use `clamp()` nos títulos.
2. **Rolagem.** Instale `lenis` e envolva o site em `ReactLenis`. Já trave a rolagem quando um painel abrir.
3. **Entradas.** Copie `Reveal`, `SplitText` e `RevealImage`. Eles cobrem texto, título e imagem.
4. **Grade.** Para listas repetidas, prefira `animation-timeline: view()` a mais um componente React.
5. **Profundidade.** Um `useScroll` com duas camadas em velocidades diferentes (foto e texto) já entrega o efeito de banner.
6. **Troca de página.** `ViewTransition` do React mais as regras `::view-transition` do CSS. Dê o mesmo `name` aos dois lados de uma foto que deve "voar".
7. **Acabamento.** `RollText`, preenchimento de botão, cursor com `data-cursor` e `Magnetic`. São os últimos, porque dependem do resto já estar estável.

Pacote mínimo de um site novo neste formato:

```bash
npx create-next-app@latest
npm install motion lenis lucide-react
```

Arquivos que valem copiar quase inteiros, porque não conhecem nada da loja:

| Arquivo | O que leva junto |
| --- | --- |
| `src/components/motion/ease.ts` | As três curvas |
| `src/components/motion/providers.tsx` | Rolagem suave e trava de painel |
| `src/components/motion/reveal.tsx` | `Reveal`, `SplitText`, `ScrollWords`, `RevealImage`, `Pop` |
| `src/components/motion/velocity-marquee.tsx` | Faixa que reage à rolagem |
| `src/components/motion/cursor.tsx` | Cursor com rótulo |
| `src/components/motion/magnetic.tsx` | Botão magnético |
| `src/components/motion/roll-text.tsx` | Texto que rola no hover |
| `src/components/motion/back-to-top.tsx` | Anel de progresso |
| `src/components/motion/page-transition.tsx` | Troca de página |
| `src/lib/ui.ts` | O preenchimento dos botões |

O bloco de `globals.css` que começa em "Cards entram conforme a rolagem" e segue até o fim do arquivo é o pedaço de CSS correspondente (cards, acordeão, View Transitions e redução de movimento).

## O que fica de fora desta stack

Prisma, SQLite, `jose`, `zod` e `server-only` resolvem dados, login e validação. Um site institucional neste visual não precisa de nenhum deles.
