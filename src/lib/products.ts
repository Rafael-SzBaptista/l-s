export type Category =
  | "Papetes"
  | "Rasteirinhas"
  | "Sandálias"
  | "Scarpins"
  | "Tamancos"
  | "Tênis"
  | "Fechados";

export type ProductImage = {
  src: string;
  alt: string;
  position?: string;
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: Category;
  summary: string;
  description: string;
  details: { title: string; body: string }[];
  sizes: string[];
  images: ProductImage[];
  /** Aparece na vitrine "Recém-chegados" da home. */
  featured?: boolean;
};

export const categories: Array<"Todos" | Category> = [
  "Todos",
  "Papetes",
  "Rasteirinhas",
  "Sandálias",
  "Scarpins",
  "Tamancos",
  "Tênis",
  "Fechados",
];

// Catálogo Primavera-Verão 2026/27. O catálogo traz só o tipo de cada peça
// ("Papete", "Tênis"…); os nomes de modelo abaixo foram dados a partir da foto.
const PRICE = 250;
const SIZES = ["34", "35", "36", "37", "38", "39"];

const STEP: Record<Category, string> = {
  Papetes: "Base anatômica e tiras largas: segura o pé sem apertar, do café ao fim da tarde.",
  Rasteirinhas: "Rente ao chão e leve na mão. Entra na bolsa e sai no fim do dia.",
  Sandálias: "Tiras que acompanham o movimento do pé, sem marcar.",
  Scarpins: "Bico fino e salto desenhado, com palmilha pensada para o dia inteiro.",
  Tamancos: "Calça num gesto. O salto dá presença sem tirar o equilíbrio.",
  Tênis: "Solado macio e cabedal que respira, para quem anda a cidade a pé.",
  Fechados: "Fechado na frente, livre no passo. Calça fácil e acompanha o dia.",
};

type Seed = {
  slug: string;
  name: string;
  category: Category;
  summary: string;
  description: string;
  alts: string[];
  /** Enquadramento das fotos: o calçado costuma estar na metade de baixo. */
  position?: string;
  featured?: boolean;
};

function make(seed: Seed): Product {
  return {
    slug: seed.slug,
    name: seed.name,
    price: PRICE,
    category: seed.category,
    summary: seed.summary,
    description: seed.description,
    details: [
      {
        title: "Material",
        body: "Coleção feita predominantemente em couro legítimo; alguns modelos usam materiais sintéticos selecionados. Confirme o material deste modelo na loja.",
      },
      { title: "O passo", body: STEP[seed.category] },
      {
        title: "A coleção",
        body: "Primavera-Verão 2026/27. Qualidade, conforto, tendência e custo-benefício no mesmo par.",
      },
    ],
    sizes: SIZES,
    featured: seed.featured,
    images: seed.alts.map((alt, index) => ({
      src: `/catalogo/${seed.slug}-${index + 1}.jpg`,
      alt,
      position: seed.position ?? "center 72%",
    })),
  };
}

export const products: Product[] = [
  make({
    slug: "papete-flor-prata",
    name: "Papete Flor Prata",
    category: "Papetes",
    summary: "Prata metalizada com flores aplicadas.",
    description: "Tiras largas em prata metalizada, cada uma com uma flor em relevo. O brilho fica no detalhe, não no par inteiro.",
    alts: [
      "Papete prata com flores metalizadas nas tiras, nos pés da modelo.",
      "Modelo ajustando a papete prata com flores aplicadas.",
    ],
    featured: true,
  }),
  make({
    slug: "papete-cabochao-terracota",
    name: "Papete Cabochão Terracota",
    category: "Papetes",
    summary: "Duas tiras terracota com cabochões.",
    description: "Duas tiras em terracota com cabochões redondos e tira no calcanhar. A base marrom deixa a cor da tira aparecer.",
    alts: [
      "Papete terracota de duas tiras com cabochões, vista de frente.",
      "Papete terracota com cabochões ao lado do mocassim da mesma cor.",
    ],
  }),
  make({
    slug: "mocassim-cabochao-terracota",
    name: "Mocassim Cabochão",
    category: "Fechados",
    summary: "Mocassim terracota com cabochões no peito do pé.",
    description: "Bico quadrado e cabochões na frente, no mesmo tom da papete. Fechado para os dias de vento, sem perder a cor.",
    alts: ["Mocassim terracota de bico quadrado com cabochões no peito do pé."],
    position: "center 78%",
  }),
  make({
    slug: "papete-h-coral",
    name: "Papete H Coral",
    category: "Papetes",
    summary: "Tiras em H no tom coral.",
    description: "A tira em H abraça o peito do pé e a cor coral esquenta o look de linho e algodão.",
    alts: ["Papete coral com tiras em H, nos pés da modelo."],
  }),
  make({
    slug: "papete-h-off-white",
    name: "Papete H Off-White",
    category: "Papetes",
    summary: "Tiras em H em off-white.",
    description: "A mesma tira em H em off-white e base preta: contraste limpo que vai bem com calça escura.",
    alts: ["Papete off-white com tiras em H e base preta, com calça preta."],
  }),
  make({
    slug: "rasteirinha-fio-metalizado",
    name: "Rasteirinha Fio Metalizado",
    category: "Rasteirinhas",
    summary: "Fios finos de dedo, em prata e dourado.",
    description: "Fios finos entre os dedos e no tornozelo, com acabamento metalizado. Quase some no pé, de propósito.",
    alts: [
      "Par de rasteirinhas de fio metalizado, prata e nude, lado a lado.",
      "Modelo fechando a rasteirinha de fio prata no tornozelo.",
      "Rasteirinha de fio metalizado nos pés da modelo.",
    ],
  }),
  make({
    slug: "clog-trama-cafe",
    name: "Clog Trama Café",
    category: "Fechados",
    summary: "Clog em trama café com dourado.",
    description: "Trama de tiras café com fios dourados e calcanhar livre. Um fechado que respira.",
    alts: [
      "Close do clog em trama café com fios dourados.",
      "Clog em trama café nos pés da modelo.",
    ],
    position: "center 60%",
  }),
  make({
    slug: "papete-cristais-caramelo",
    name: "Papete Cristais Caramelo",
    category: "Papetes",
    summary: "Caramelo com cristais coloridos e fivela.",
    description: "Base e tiras caramelo com cristais coloridos aplicados e fivela dourada. Brilho de dia, sem pedir ocasião.",
    alts: [
      "Papete caramelo com cristais coloridos nas tiras.",
      "Close da papete caramelo com cristais e fivela dourada.",
    ],
  }),
  make({
    slug: "tenis-faixa-terracota",
    name: "Tênis Faixa Terracota",
    category: "Tênis",
    summary: "Tênis terracota com faixas laterais claras.",
    description: "Terracota, faixas laterais em tom claro e solado de borracha. Retrô na medida.",
    alts: ["Tênis terracota com faixas laterais claras, nos pés da modelo."],
  }),
  make({
    slug: "tenis-onca",
    name: "Tênis Onça",
    category: "Tênis",
    summary: "Off-white com detalhe vermelho e onça.",
    description: "Cabedal off-white, recorte vermelho e calcanhar em estampa de onça. O tênis que conversa com o resto do armário.",
    alts: ["Tênis off-white com recorte vermelho e calcanhar em estampa de onça."],
  }),
  make({
    slug: "tamanco-salto-noite",
    name: "Tamanco Salto Noite",
    category: "Tamancos",
    summary: "Preto, tira no peito do pé e salto escultural.",
    description: "Tira preta cruzada e salto escultural médio. Da reunião ao jantar sem trocar de par.",
    alts: ["Tamanco preto de salto escultural, com bolsa preta na mão da modelo."],
  }),
  make({
    slug: "tamanco-dourado",
    name: "Tamanco Dourado",
    category: "Tamancos",
    summary: "Dourado de salto baixo e bico aberto.",
    description: "Dourado suave, bico aberto e salto bloco baixo. O metal vira neutro.",
    alts: ["Tamanco dourado de salto bloco baixo, nos pés da modelo."],
  }),
  make({
    slug: "tenis-branco-areia",
    name: "Tênis Branco Areia",
    category: "Tênis",
    summary: "Branco com recortes em areia.",
    description: "Base branca, recortes em areia e solado alto na medida. O tênis branco que não é só branco.",
    alts: [
      "Tênis branco com recortes areia, vista lateral.",
      "Par do tênis branco areia nos pés da modelo sentada.",
      "Tênis branco areia sobre fundo claro.",
    ],
  }),
  make({
    slug: "tenis-retro-creme",
    name: "Tênis Retrô Creme",
    category: "Tênis",
    summary: "Creme com faixas e biqueira bege.",
    description: "Creme, faixas laterais e biqueira bege, sobre solado de borracha clara.",
    alts: [
      "Tênis retrô creme com faixas laterais, de perto.",
      "Tênis retrô creme nos pés da modelo.",
    ],
    featured: true,
  }),
  make({
    slug: "tenis-perfurado-nude",
    name: "Tênis Perfurado Nude",
    category: "Tênis",
    summary: "Nude com cabedal perfurado.",
    description: "Cabedal nude perfurado, que deixa o pé respirar, e cadarço no mesmo tom.",
    alts: [
      "Tênis nude perfurado nos pés da modelo.",
      "Tênis nude perfurado com a modelo sentada.",
    ],
  }),
  make({
    slug: "sandalia-pelo-onca",
    name: "Sandália Pelo Onça",
    category: "Sandálias",
    summary: "Estampa de onça e salto bloco.",
    description: "Tiras com textura de pelo e estampa de onça, tornozeleira e salto bloco. A peça que muda o look.",
    alts: ["Sandália de salto bloco em pelo estampado de onça, uma calçada e outra na mão."],
    position: "center 68%",
  }),
  make({
    slug: "sandalia-bloco-caramelo",
    name: "Sandália Bloco Caramelo",
    category: "Sandálias",
    summary: "Caramelo, fivela no tornozelo e salto bloco.",
    description: "Caramelo, tira no tornozelo com fivela e salto bloco médio. O conforto do bloco com cara de ocasião.",
    alts: [
      "Sandália caramelo de salto bloco, com a modelo segurando uma bolsa.",
      "Sandália caramelo de salto bloco de perto.",
    ],
    featured: true,
  }),
  make({
    slug: "scarpin-cafe",
    name: "Scarpin Café",
    category: "Scarpins",
    summary: "Scarpin de bico fino, café.",
    description: "Bico fino, salto médio desenhado e acabamento café brilhante. Clássico que não envelhece.",
    alts: [
      "Scarpin café de bico fino, com bolsa de ilhoses na mão da modelo.",
      "Close do scarpin café ao lado da bolsa de ilhoses dourados.",
    ],
  }),
  make({
    slug: "sandalia-tira-cafe",
    name: "Sandália Tira Café",
    category: "Sandálias",
    summary: "Tira fina no tornozelo e salto escultural.",
    description: "Tira frontal, tornozeleira fina e salto escultural, em café.",
    alts: [
      "Sandália café de tira fina no tornozelo e salto escultural.",
      "Sandália café de salto, com bolsa café com fivela.",
    ],
  }),
  make({
    slug: "sandalia-tachas-ouro",
    name: "Sandália Tachas Ouro",
    category: "Sandálias",
    summary: "Rasteira de dedo com tachas douradas.",
    description: "Tiras douradas de dedo com tachas pirâmide e base caramelo. Plana, para o passo do dia todo.",
    alts: [
      "Sandália dourada de dedo com tachas, nos pés da modelo.",
      "Close da sandália de dedo dourada com tachas pirâmide.",
    ],
    featured: true,
  }),
  make({
    slug: "sandalia-pedras-bronze",
    name: "Sandália Pedras Bronze",
    category: "Sandálias",
    summary: "Bronze com pedras douradas aplicadas.",
    description: "Tiras em bronze com pedras douradas grandes e tira no calcanhar.",
    alts: [
      "Sandália bronze de dedo com pedras douradas aplicadas.",
      "Modelo ajustando a sandália bronze com pedras douradas.",
    ],
  }),
  make({
    slug: "scarpin-slingback-preto",
    name: "Scarpin Slingback Preto",
    category: "Scarpins",
    summary: "Slingback preto de salto kitten.",
    description: "Bico fino, tira no calcanhar e salto baixo kitten. Elegante sem cansar.",
    alts: ["Scarpin slingback preto de salto baixo, com bolsa preta de corrente."],
  }),
  make({
    slug: "sandalia-tachas-preta",
    name: "Sandália Tachas Preta",
    category: "Sandálias",
    summary: "Preta de salto baixo com tachas.",
    description: "Tiras pretas com tachas, salto bloco baixo e tornozeleira. O lançamento da coleção.",
    alts: ["Sandália preta de salto baixo com tachas, com a modelo segurando o jornal de lançamento."],
  }),
  make({
    slug: "papete-gota-dourada",
    name: "Papete Gota Dourada",
    category: "Papetes",
    summary: "Café com metal dourado orgânico.",
    description: "Duas tiras café com uma peça de metal dourado em forma orgânica em cada uma.",
    alts: [
      "Close da papete café com metal dourado orgânico.",
      "Papete café com metal dourado nos pés da modelo.",
      "Modelo calçando a papete café com metal dourado.",
    ],
  }),
  make({
    slug: "mule-trama-rose",
    name: "Mule Trama Rosé",
    category: "Fechados",
    summary: "Mule em trama metalizada rosé.",
    description: "Trama metalizada em rosé dourado, bico fino e calcanhar livre.",
    alts: [
      "Close da mule em trama metalizada rosé.",
      "Mule em trama rosé nos pés da modelo.",
    ],
    position: "center 65%",
  }),
  make({
    slug: "papete-corrente-ouro",
    name: "Papete Corrente Ouro",
    category: "Papetes",
    summary: "Dourada com tiras trançadas em corrente.",
    description: "Tiras douradas trançadas como corrente e tira no calcanhar com fivela.",
    alts: [
      "Papete dourada de tiras trançadas, com saia de crochê.",
      "Close da papete dourada de tiras trançadas.",
    ],
  }),
  make({
    slug: "rasteirinha-pedras-verdes",
    name: "Rasteirinha Pedras Verdes",
    category: "Rasteirinhas",
    summary: "Café com pedras verdes e douradas.",
    description: "Base café com pespontos e uma tira de pedras verdes e douradas. Joia para os pés.",
    alts: [
      "Par de rasteirinhas café com pedras verdes e douradas, de cima.",
      "Rasteirinha café com pedras verdes nos pés da modelo.",
    ],
  }),
  make({
    slug: "sandalia-ambar",
    name: "Sandália Âmbar",
    category: "Sandálias",
    summary: "Off-white com pedras âmbar.",
    description: "Tiras off-white com pedras âmbar e douradas, de dedo, com tira no calcanhar.",
    alts: ["Sandália off-white de dedo com pedras âmbar, nos pés da modelo."],
  }),
  make({
    slug: "sapatilha-trama-dourada",
    name: "Sapatilha Trama Dourada",
    category: "Fechados",
    summary: "Boneca em trama dourada com fivela.",
    description: "Sapatilha boneca em trama dourada, com tira e fivela no peito do pé.",
    alts: [
      "Sapatilha boneca em trama dourada nos pés da modelo.",
      "Par de sapatilhas em trama dourada sobre fundo claro.",
    ],
  }),
  make({
    slug: "rasteirinha-cruzada-ouro",
    name: "Rasteirinha Cruzada Ouro",
    category: "Rasteirinhas",
    summary: "Slide dourado de tiras cruzadas.",
    description: "Tiras douradas largas que se cruzam no peito do pé. Calça sem fivela.",
    alts: ["Modelo calçando a rasteirinha dourada de tiras cruzadas."],
  }),
  make({
    slug: "rasteirinha-trancada",
    name: "Rasteirinha Trançada",
    category: "Rasteirinhas",
    summary: "Fina de dedo, com tira trançada.",
    description: "Rasteirinha de dedo com tiras trançadas em dois tons. Leve como um chinelo, arrumada como sandália.",
    alts: ["Modelo calçando a rasteirinha de dedo com tira trançada."],
  }),
  make({
    slug: "papete-perola",
    name: "Papete Pérola",
    category: "Papetes",
    summary: "Off-white com pedras coloridas.",
    description: "Tira larga off-white com pedras coloridas, de dedo, sobre base macia.",
    alts: ["Papete off-white de dedo com pedras coloridas, nos pés da modelo."],
  }),
  make({
    slug: "papete-tachas-ouro",
    name: "Papete Tachas Ouro",
    category: "Papetes",
    summary: "Dourada com tachas e pedras.",
    description: "Tira larga dourada coberta de tachas e pedras, de dedo. Para quando o pé é o acessório.",
    alts: ["Papete dourada de dedo com tachas e pedras, nos pés da modelo."],
  }),
  make({
    slug: "tamanco-tranca-dourado",
    name: "Tamanco Trança Dourado",
    category: "Tamancos",
    summary: "Trança dourada e salto de madeira.",
    description: "Tira em trança dourada e salto de madeira baixo. Verão de cidade.",
    alts: ["Modelo calçando o tamanco de trança dourada com salto de madeira."],
  }),
  make({
    slug: "papete-cruzada-pedras",
    name: "Papete Cruzada Pedras",
    category: "Papetes",
    summary: "Café com tiras cruzadas e pedras.",
    description: "Tiras café cruzadas com pedras douradas e coloridas, sobre base caramelo.",
    alts: ["Papete café de tiras cruzadas com pedras, nos pés da modelo."],
  }),
  make({
    slug: "rasteira-placa-ouro",
    name: "Rasteira Placa Ouro",
    category: "Rasteirinhas",
    summary: "Café com placa dourada martelada.",
    description: "Rasteira de dedo café com uma placa dourada martelada no centro.",
    alts: [
      "Rasteira café de dedo com placa dourada martelada, nos pés da modelo.",
      "Rasteira café com placa dourada, de perfil.",
    ],
  }),
];

export const featuredProducts = products.filter((product) => product.featured);

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function relatedProducts(slug: string) {
  const product = getProduct(slug);
  const others = products.filter((item) => item.slug !== slug);
  // Primeiro os da mesma categoria; a página mostra uma linha curta.
  const same = others.filter((item) => item.category === product?.category);
  const rest = others.filter((item) => item.category !== product?.category);
  return [...same, ...rest].slice(0, 3);
}
