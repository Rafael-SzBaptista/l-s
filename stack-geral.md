# Stack base para qualquer projeto

Este arquivo descreve o sistema visual por trás da loja, separado do que é específico de e-commerce. A implementação de referência continua neste repositório. O catálogo amarrado à vitrine está em `stack-visual.md`.

Use este documento para portfólio, institucional, editorial, landing, documentação ou aplicativo. A loja é uma aplicação da base, com pele escura, tipografia expandida e peças de vitrine. Em outro projeto a pele muda. O jeito de animar, estruturar a página e decidir o que entra permanece.

## O que fica, o que muda, o que sai

| Camada | O que é | No próximo projeto |
| --- | --- | --- |
| Núcleo | TypeScript, React, Tailwind, tokens de cor e tipo, primitivos de movimento, redução de movimento | Copia inteiro |
| Pele | Paleta escura, Archivo expandida, cantos retos, grão, caixa alta | Troca pelos valores da marca |
| Peças opcionais | Rolagem suave, intro, cursor, botão magnético, faixa de velocidade, seção presa | Entram só quando o projeto pede |
| Vitrine | Sacola, grade de produto, zoom de foto, carrossel de campanha, morph de produto | Ficam na loja |

## Linguagens e frameworks

| Linguagem | Papel |
| --- | --- |
| TypeScript | Lógica e componentes de animação |
| TSX | Interface em HTML semântico (`header`, `nav`, `main`, `section`, `button`, `dialog`) |
| CSS | Tokens, tipografia e animações que o navegador faz sozinho |

| Ferramenta | Versão de referência | Papel |
| --- | --- | --- |
| Next.js | 16.4 | Rotas, fontes, imagem, navegação |
| React | 19.3 | Componentes e `ViewTransition` |
| Tailwind CSS | 4 | Layout, cor, espaçamento, hover |

Tailwind 4 guarda o tema no CSS, dentro de `@theme`, sem `tailwind.config.js`. Classes reutilizáveis nascem com `@utility`. As fontes vêm de `next/font` e viram variável CSS, sem `<link>` no HTML.

Um site estático, um blog ou um painel usam a mesma base. O que muda é a intensidade do movimento, descrita mais abaixo.

## Bibliotecas

| Biblioteca | Versão | Função | Entra quando |
| --- | --- | --- | --- |
| `motion` | 14 | Entrada, valor ligado à rolagem, mola, presença | Sempre que houver movimento dependente de estado ou de posição |
| `lenis` | 1.3 | Rolagem suave da janela | O site é longo e a rolagem faz parte da leitura |
| `lucide-react` | 1.53 | Ícones em traço | Há ícones de interface |
| `sonner` | 2.0 | Avisos breves | Uma ação precisa confirmar sucesso ou erro |

`motion` 14 se importa de `motion/react`.

```bash
npm install motion lucide-react
npm install lenis
```

`lenis` fica na segunda linha porque um painel, um formulário longo ou uma documentação densa ficam melhores com a rolagem nativa.

## Regra do movimento

O navegador anima decoração repetida. O JavaScript anima o que depende de rolagem, de estado ou de um elemento específico.

Cada efeito carrega um significado. Se o significado não existe na página, o efeito não entra.

| Efeito | Significa |
| --- | --- |
| Bloco que sobe ao aparecer | Este conteúdo chegou |
| Título atrás de máscara | Este título é o ponto da seção |
| Palavras que acendem com a rolagem | Leia no ritmo da página |
| Imagem em cortina | Esta mídia está sendo revelada |
| Camadas em velocidades diferentes | Há profundidade |
| Morph entre duas telas | É o mesmo objeto, agora em detalhe |
| Troca de página com desfoque curto | Você mudou de lugar |
| Fundo que desliza entre opções | A seleção mudou, o controle é o mesmo |

Nada pulsa em loop para chamar atenção. Um loop só existe quando a informação é contínua: progresso de um slide, faixa de avisos, estado de carregamento.

## Fundação

Estes três arquivos sustentam o resto. A referência está em `src/components/motion/`.

**Curvas** (`ease.ts`). Três curvas cobrem o sistema:

- saída suave `[0.22, 1, 0.36, 1]` para entradas de conteúdo;
- entrada e saída `[0.76, 0, 0.24, 1]` para painéis, menus e cortinas;
- exponencial `[0.16, 1, 0.3, 1]` para a página que entra.

**Provedor** (`providers.tsx`). `MotionConfig` com `reducedMotion="user"` faz o `motion` respeitar o sistema operacional. `ReactLenis` com `root` só monta quando a redução de movimento está desligada. Os números de partida são `lerp: 0.085`, `wheelMultiplier: 0.95` e `anchors: true`. `lerp` menor deixa a rolagem mais lenta.

**Trava de painel.** Qualquer camada que cubra a página (menu, busca, diálogo, lightbox) chama `lenis.stop()` e põe `overflow: hidden` no `body`. Ao fechar, devolve os dois. A área interna que rola sozinha leva `data-lenis-prevent`.

**Troca de rota.** Depois de cada navegação, a posição real da janela é relida (`scrollTo` imediato mais `resize`). O Next reposiciona a rolagem por conta própria e o Lenis precisa acompanhar.

**Menos movimento.** Além do `MotionConfig`, um `@media (prefers-reduced-motion: reduce)` no fim do CSS reduz durações a quase zero. Intro, Lenis e deslocamento de cards ficam desligados. A página continua usável, só sem o espetáculo.

## Primitivos de conteúdo

Ficam num único módulo, `reveal.tsx`. Servem para qualquer seção.

**Reveal.** O bloco sobe 28px e vai de opacidade 0 a 1 em 0,9s, uma vez, quando uma fração entra na tela (`whileInView`, `viewport.once`). Serve para parágrafos, listas curtas, grupos de links e legendas. Título grande usa máscara.

**SplitText.** Cada palavra fica num recipiente com `overflow: hidden`, começa em `translateY(118%)` e sobe até `0%`, em sequência. A detecção de entrada olha o título inteiro (`useInView` no bloco, `amount: 0.3`). Olhar cada palavra faz a máscara dela nunca cruzar a tela, e o título fica invisível. A prop `play` segura a animação até outro evento terminar, por exemplo uma intro.

**ScrollWords.** `useScroll` mede o bloco de "topo a 85% da janela" até "base a 40%". `useTransform` converte essa fração em opacidade, uma palavra por vez. Serve para um parágrafo-manifesto, uma citação ou uma frase de abertura. Um texto de leitura corrida permanece estático.

**RevealImage.** O recipiente abre com `clip-path` de `inset(100% 0 0 0)` até `inset(0)` em 1,3s. A imagem interna sai de `scale: 1.25` para `1`. Com paralaxe ligada, um segundo `useScroll` desloca a imagem de `-7%` a `7%`, e ela fica em `scale: 1.16` para o recorte não mostrar borda.

**Pop.** Escala de 0 a 1 com rotação, em mola (`stiffness: 260`, `damping: 16`). Serve para um ícone de confirmação ou um selo, não para blocos de texto.

**Cards em CSS.** A classe `.reveal-card` usa `animation-timeline: view()`. O card entra de 90px abaixo e `scale(0.96)` até a posição final. Os irmãos da mesma linha têm `animation-range` deslocado e entram em cascata. O bloco fica dentro de `@supports`, então um navegador sem o recurso mostra os cards parados. Use em qualquer grade repetida: projetos, artigos, pessoas, fotos. Se a entrada precisa esperar outro evento, use `Reveal`.

## Rolagem como narrativa

Estas peças transformam a rolagem em leitura. Entram em páginas longas. Em uma ferramenta de uso diário, ficam de fora.

**Profundidade na primeira tela.** `useScroll` no banner produz três valores ao mesmo tempo: a imagem desce e cresce, o texto sobe e some, um véu escurece por cima. A referência de números está no carrossel da home (`y` da foto até 30%, `scale` até 1.12, texto até `-160px`). Um hero de uma imagem só, sem slides, usa a mesma conta. O zoom lento de 9s (`@keyframes kenburns`) é opcional e combina com foto, não com ilustração técnica.

**Seção presa.** A seção fica mais alta que a tela (`100svh` mais a largura que sobra do trilho). O miolo é `sticky` com `h-svh`. A rolagem vertical vira `translateX`. A conta é direta: `(scrollY - topo) / distância`, sem mola, para o valor existir no primeiro quadro. No toque, o mesmo conteúdo vira faixa nativa com `overflow-x: auto` e `snap-x`. Serve para um processo, uma linha do tempo, um antes-e-depois ou uma sequência de cases. Não serve para uma lista que a pessoa precisa varrer rápido.

**Faixa de velocidade.** `useAnimationFrame` move um texto duplicado. `useVelocity(scrollY)`, suavizado com `useSpring`, acelera, inverte e inclina (`skewX`). `useInView` pausa fora da tela. `wrap` mantém o deslocamento entre `-50%` e `0`. É atmosfera, entre duas seções. Uma faixa de aviso simples usa só `@keyframes`, sem JavaScript.

**Cabeçalho que se esconde.** Um listener em `requestAnimationFrame` compara a posição atual com a anterior e grava `data-scrolled` e `data-hidden`. O CSS anima o `transform` em 0,7s. Partida usada na loja: a faixa extra some depois de 24px, o cabeçalho some ao descer depois de 240px e volta ao subir. Uma barra sticky abaixo dele sobe junto. Em páginas curtas ou num painel, o cabeçalho permanece fixo.

**Progresso da página.** `useScroll` da janela alimenta `pathLength` de um círculo SVG, com `useSpring`. O botão de voltar ao topo só existe depois de 800px. O clique usa `lenis.scrollTo(0)` quando a rolagem suave está ativa. Em um artigo longo ou uma documentação, o mesmo anel pode ficar no canto sem ser um botão.

## Continuidade entre telas

`ViewTransition` do React 19 envolve o conteúdo da página. A navegação do Next dispara a View Transitions API. O CSS de referência:

- a página que sai sobe 28px, perde opacidade e ganha 6px de desfoque, em 280ms;
- a página que entra começa 48px abaixo e chega no lugar em 750ms, com 160ms de atraso;
- o cabeçalho tem um `viewTransitionName` estável e a animação dele é anulada, para não deslizar junto.

**Morph.** Dois elementos com o mesmo `name` e `share="morph"` são o mesmo objeto em duas rotas: miniatura de projeto e capa do case, capa de artigo e imagem do texto, avatar da lista e avatar do perfil. A viagem dura 800ms, com um desfoque leve no meio. O nome precisa ser único na tela.

Isso fica fluido em produção (`npm run build` e `npm start`), no Chrome, Edge e Safari recentes. Sem suporte, a troca é instantânea. Com redução de movimento, a duração vai a zero.

## Interação

**Preenchimento de botão.** Um `::before` do tamanho do botão, com `transform-origin: bottom` e `scaleY(0)`, vai a `scaleY(1)` em 0,5s no hover. A cor sobe. Funciona em tema claro ou escuro porque a cor vem do token, não de um valor fixo.

**Texto que rola.** `RollText` empilha duas cópias. No hover do pai (classe `group`), uma sai por cima e a outra entra por baixo. Só CSS. O pai precisa ser `group`.

**Magnético.** No `pointermove`, o controle anda uma fração da distância até o cursor, com `useSpring`, e volta ao soltar. Só com mouse. Reserve para um ou dois botões principais, não para cada link.

**Cursor com rótulo.** A posição vai para `MotionValue` suavizados com `useSpring`. Um ancestral com `data-cursor="Abrir"` mostra esse texto numa bolha. `AnimatePresence` faz a bolha nascer e sumir. O componente só monta com `(hover: hover) and (pointer: fine)`. Em toque, os atributos não fazem nada. O rótulo diz a ação ("Abrir", "Ver", "Arrastar"), não repete o nome do item.

**Estado que se move.** `layoutId` faz um fundo deslizar entre a opção antiga e a nova: abas, filtros, segmentos. `layout` reorganiza uma lista quando um item sai. `AnimatePresence` dá saída a qualquer coisa que deixa de existir: um aviso, um item, um painel. Uma negação (campo inválido, ação incompleta) pode tremer no eixo X por uma lista curta de keyframes. Confirmação usa mola, não um fade genérico.

**Acordeão.** `<details>` com `interpolate-size: allow-keywords` anima de `block-size: 0` até `auto` em 0,55s. O ícone gira pelo estado `group-open`. Sem biblioteca.

**Mídia ampliada.** Um painel em tela cheia trava a rolagem. O clique amplia com `scale(2.2)` e `transform-origin` na posição do ponteiro. Troca de item usa `AnimatePresence`. Imagens de grade usam `next/image` com `fill` e `sizes`, no tamanho da coluna.

**Menu em tela pequena.** Abre em cortina (`clip-path`) com os links subindo em sequência. Um dropdown estreito numa navegação de cinco itens perde a escala do resto do site.

**Intro.** Uma camada cobre a primeira visita, conta de 0 a 100 em 1,5s e sai com `clip-path`. Um script inline, lido antes da pintura, marca `data-intro="done"` se a sessão já viu ou se o sistema pede menos movimento. Isso evita o piscar. O herói só anima o título depois que a intro termina. Use uma vez por sessão, com clique para pular, e só quando a chegada é parte da marca. Um aplicativo, um login e uma documentação abrem direto no conteúdo.

## Sistema de interface

A loja usa fundo `#0a0a0a`, texto `#f1eee8` e um acento. Esses valores são a pele. A estrutura abaixo vale com qualquer paleta.

**Seis papéis de cor, e só esses.**

| Token | Função |
| --- | --- |
| `--surface` | Fundo da página |
| `--surface-raised` | Painel, menu, diálogo |
| `--text` | Texto principal |
| `--muted` | Texto secundário |
| `--line` | Divisão a cerca de 10% do texto |
| `--accent` | A única cor de destaque |
| `--accent-fg` | Texto sobre o acento |

`--accent-fg` sai da luminância do acento (`readableOn`): cor clara recebe texto escuro, cor escura recebe texto claro. Trocar o acento repinta selos, links de destaque e detalhes sem abrir componente.

**Três papéis de tipo.**

| Papel | Uso | Tratamento |
| --- | --- | --- |
| Display | Títulos de seção e de página | Uma família com personalidade. Tamanho em `clamp()` |
| Texto | Parágrafos, formulários, listas | Uma família de leitura, entrelinha folgada |
| Rótulo | Números de seção, metas, legendas | Mono ou sans estreita, caixa alta, `letter-spacing` perto de `0.2em` |

Na loja o display é Archivo com eixo de largura 125, peso 900 e entrelinha perto de 0,85. Num projeto sóbrio o display pode ser uma serifada em caixa baixa, com entrelinha 1. O que permanece é a separação dos três papéis. Display não entra em botão, rótulo não entra em parágrafo.

**Página.** Cada rota abre com um título na escala de display, não com um `h1` do tamanho do corpo. A primeira tela pode ocupar `100svh` quando há uma imagem ou uma frase de abertura. Seções seguintes respiram com o mesmo ritmo vertical (`py` grande e constante). O nome do projeto pode reaparecer no rodapé, em escala de display, como fechamento.

**Superfície.** Separação por linha de 1px no token `--line`. Sombra só quando um painel flutua de verdade (diálogo, menu). Cantos, grão e espessura de traço são decisão de pele: a loja usa canto reto, ruído SVG a 4,5% de opacidade e ícones com `strokeWidth` 1.5. Um produto digital pode usar raio de 8px e nenhuma textura. Escolha uma vez e aplique em tudo.

**Um vocabulário de hover.** Imagem aproxima em `scale`. Texto ganha sublinhado que cresce da esquerda. Controle principal ganha o preenchimento. Cursor, quando existe, diz a ação. A pessoa aprende o vocabulário na primeira seção e o reconhece no resto do site.

**Ponteiro e toque são dois projetos.** Cursor, magnético e arrastar para trocar slide existem só com mouse fino. Toque ganha faixa com scroll nativo, alvos grandes e menu em cortina. `matchMedia` decide o que montar. Não se esconde hover com CSS e se deixa um listener de mouse ativo no celular.

## Intensidade por tipo de projeto

A mesma base, com peças diferentes ligadas.

| Tipo | Rolagem suave | Intro | Cursor e magnético | Seção presa e faixa | Morph | Cards com `view()` |
| --- | --- | --- | --- | --- | --- | --- |
| Portfólio, institucional, campanha | Sim | Opcional, uma vez por sessão | Sim, em poucos controles | Sim, numa sequência | Sim, do card para o detalhe | Sim |
| Editorial, blog, estudo de caso | Sim | Não | Não | Só se o texto pedir uma frase no ritmo da rolagem | Sim, da capa para o artigo | Sim |
| Landing de uma oferta | Sim | Só se a marca justificar | No botão principal | Uma seção no máximo | Raro | Sim |
| Documentação, ajuda | Não | Não | Não | Não | Não | Não |
| Painel, ferramenta, área logada | Não | Não | Não | Não | Não | Não |

No painel e na documentação permanecem os tokens, o tipo, o preenchimento de botão, `layoutId` em abas, `AnimatePresence` em avisos e a troca de página bem curta, ou nenhuma. Movimento de leitura atrapalha quem volta todo dia para trabalhar.

## Ordem para começar um projeto

1. **Tokens.** Três famílias de tipo e os sete papéis de cor no `@theme`, antes de qualquer seção. `--accent-fg` calculado pela luminância.
2. **Esqueleto.** Cabeçalho, `main`, rodapé. Título de página em display com `clamp()`.
3. **Fundação de movimento.** `ease.ts`, `MotionConfig` e a trava de painel. Lenis só se a tabela acima disser sim.
4. **Conteúdo.** `Reveal`, `SplitText`, `RevealImage`. Grade repetida com `.reveal-card`.
5. **Uma narrativa de rolagem.** Profundidade na primeira tela, ou uma seção presa, ou um `ScrollWords`. Uma, não as três na mesma dobra.
6. **Continuidade.** `ViewTransition` na troca de página. Morph só onde o mesmo objeto aparece nas duas rotas.
7. **Acabamento.** Preenchimento, `RollText`, e então cursor e magnético se o tipo de projeto permitir.

```bash
npx create-next-app@latest
npm install motion lucide-react
```

`lenis` entra no passo 3, quando a decisão estiver tomada.

## Arquivos de referência para copiar

Estes não conhecem produto, preço nem sacola.

| Arquivo | Leva |
| --- | --- |
| `src/components/motion/ease.ts` | As três curvas |
| `src/components/motion/use-media-query.ts` | Redução de movimento e detecção de mouse |
| `src/components/motion/providers.tsx` | Provedor, sincronia de rota, trava de rolagem |
| `src/components/motion/reveal.tsx` | `Reveal`, `SplitText`, `ScrollWords`, `RevealImage`, `Pop` |
| `src/components/motion/page-transition.tsx` | Troca de página |
| `src/components/motion/roll-text.tsx` | Texto que rola no hover |
| `src/components/motion/back-to-top.tsx` | Anel de progresso |
| `src/components/motion/magnetic.tsx` | Deslocamento em direção ao cursor |
| `src/components/motion/cursor.tsx` | Rótulo que segue o ponteiro |
| `src/components/motion/velocity-marquee.tsx` | Faixa ligada à velocidade |
| `src/lib/ui.ts` | Preenchimento do botão |

No `globals.css`, o trecho que começa em "Cards entram conforme a rolagem" e vai até o fim do arquivo leva os cards, o acordeão, as View Transitions e a redução de movimento.

Intro, cabeçalho e seção presa estão acoplados ao layout da loja. Vale reescrever em cima da descrição deste arquivo, em vez de copiar o componente da vitrine.

## O que não atravessa da loja

Sacola, checkout, grade de produto, carrossel de campanha, zoom de catálogo e a paleta escura com tipografia expandida. Também ficam de fora Prisma, SQLite, sessão e validação de formulário: resolvem dados, não interface.

Para uma loja nova, parta de `stack-visual.md`, que já aplica esta base ao comércio. Para qualquer outro projeto, parta daqui e ligue só as peças da tabela de intensidade.
