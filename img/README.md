# Catálogo de Recursos Visuais e Imagens — BRASA BURGER

Este documento cataloga todos os ativos visuais, fotografias de produtos, imagens promocionais e ícones da aplicação **BRASA BURGER**, detalhando especificações técnicas, padrões de acessibilidade (textos alternativos / `alt`), dimensões e regras de otimização contínua.

---

## 1. Diretrizes Técnicas de Imagem

- **Formato Primário:** `WebP` (Lossy otimizado a 80-85% de qualidade), proporcionando redução de 30% a 50% de peso sem perda perceptível de nitidez em relação ao JPEG/PNG tradicional.
- **Formato para Ícones PWA:** `PNG` 24-bit com transparência alfa para compatibilidade universal em navegadores, instaladores de PWA e telas retina.
- **Formato para Redes Sociais:** `JPEG` progressivo de alta qualidade (1200x630 px) na pasta `og/` para compatibilidade total com os scrapers de mensageria (WhatsApp, Telegram) e redes sociais (Facebook, LinkedIn, X/Twitter).
- **Atributos de Performance e Responsividade:**
  - Todas as tags `<img>` devem declarar explicitamente `width` e `height` para prevenir *Cumulative Layout Shift* (CLS).
  - Imagens *below-the-fold* devem utilizar `loading="lazy"`.
  - O banner de destaque (`hero-brasa.webp`) deve conter `fetchpriority="high"` e `aria-hidden="true"` quando puramente decorativo com sobreposição tipográfica.

---

## 2. Catálogo de Produtos e Pratos Principais (`/img/*.webp`)

| Arquivo | Descrição Visual | Finalidade / Uso | Dimensões Recomendadas | Alt Text Semântico Padrão |
| :--- | :--- | :--- | :--- | :--- |
| `hero-brasa.webp` | Textura premium de pedra ardósia escura, grelha de ferro fundido, brasas e faíscas sutis | Fundo panorâmico do cabeçalho (*Hero Section*) | 1920 × 1080 px | "Fundo BRASA BURGER textura na brasa e pedra ardósia" |
| `burger-classico.webp` | Burger artesanal com blend 160g, queijo prato, alface crespa, tomate, cebola e molho da casa | Cardápio: Burger Clássico e Salada | 800 × 800 px (Render: 104x104 / 400x200) | "Hambúrguer artesanal clássico com blend 160g, queijo, salada fresca no pão brioche" |
| `burger-cheddar-bacon.webp` | Blend bovino alto coberto por cascata de cheddar derretido e fatias douradas de bacon crocante | Cardápio: Cheddar Bacon | 800 × 800 px (Render: 104x104 / 400x200) | "Hambúrguer com blend bovino, queijo cheddar derretido e tiras crocantes de bacon" |
| `burger-duplo-smash.webp` | Dois discos finos smash prensados com bordas tostadas, queijo derretido duplo e picles | Cardápio: Duplo Smash | 800 × 800 px (Render: 104x104 / 400x200) | "Duplo Smash burger com discos prensados, crosta crocante, queijo duplo e picles" |
| `burger-frango.webp` | Filé de sobrecoxa/peito de frango empanado crocante, maionese artesanal e salada fresca | Cardápio: Frango Crocante | 800 × 800 px (Render: 104x104 / 400x200) | "Sanduíche de frango empanado ultra crocante com maionese da casa e salada" |
| `burger-veggie.webp` | Hambúrguer vegetal à base de grão-de-bico com especiarias, queijo derretido e cebola roxa | Cardápio: Burger Veggie | 800 × 800 px (Render: 104x104 / 400x200) | "Hambúrguer vegetariano de grão-de-bico com legumes frescos no pão brioche" |
| `burger-costela.webp` | Costela bovina desfiada marinada ao barbecue caseiro, cebola crispy e queijo prato | Cardápio: Costela Barbecue | 800 × 800 px (Render: 104x104 / 400x200) | "Hambúrguer de costela desfiada com molho barbecue e cebola crispy crocante" |
| `batata-frita.webp` | Porção de batatas fritas palito com corte rústico, douradas e crocantes | Cardápio: Acompanhamentos | 800 × 800 px (Render: 104x104 / 400x200) | "Porção individual de batatas fritas crocantes e sequinhas com sal temperado" |
| `batata-cheddar-bacon.webp` | Batatas fritas cobertas com creme de cheddar quente e cubos de bacon frito | Cardápio: Acompanhamentos | 800 × 800 px (Render: 104x104 / 400x200) | "Porção de batata frita coberta com farto queijo cheddar derretido e bacon em cubos" |
| `onion-rings.webp` | Anéis generosos de cebola fresca empanados e fritos até atingir tonalidade dourada | Cardápio: Acompanhamentos | 800 × 800 px (Render: 104x104 / 400x200) | "Porção de anéis de cebola artesanais empanados e crocantes" |
| `milkshake.webp` | Taça de milkshake cremoso batido com sorvete artesanal e calda espessa | Cardápio: Sobremesas | 800 × 800 px (Render: 104x104 / 400x200) | "Milkshake artesanal cremoso servido com calda de chocolate e chantilly" |

---

## 3. Ícones de Sistema e PWA (`/img/icons/`)

| Arquivo | Formato | Dimensões | Uso / Destino |
| :--- | :--- | :--- | :--- |
| `favicon-32.png` | PNG 24-bit | 32 × 32 px | Favicon padrão para navegadores desktop |
| `favicon-64.png` | PNG 24-bit | 64 × 64 px | Favicon para telas de alta densidade (Retina/HiDPI) |
| `apple-touch-icon.png` | PNG 24-bit | 180 × 180 px | Logotipo de cabeçalho (`<header>`) e ícone para Home Screen do iOS |
| `icon-192.png` | PNG 24-bit | 192 × 192 px | Manifesto PWA (`manifest.json`) para Android e navegadores móveis |
| `icon-512.png` | PNG 24-bit | 512 × 512 px | Splash Screen de inicialização PWA e ícone de alta resolução |

---

## 4. Compartilhamento Social & Open Graph (`/img/og/`)

| Arquivo | Formato | Dimensões | Razão de Aspecto | Uso |
| :--- | :--- | :--- | :--- | :--- |
| `og.jpg` | JPEG (sRGB) | 1200 × 630 px | 1.91:1 | Preview oficial do link no WhatsApp, Telegram, Facebook, LinkedIn e X (Twitter Cards) |

---

## 5. Boas Práticas para Inclusão de Novas Imagens

1. **Compressão:** Sempre execute novas fotografias através de compressores como `cwebp` (`cwebp -q 82 input.png -o output.webp`) ou ferramentas como *Squoosh*.
2. **Nomenclatura:** Use apenas letras minúsculas, números e hífens como separadores (kebab-case). Nunca use espaços, acentos ou caracteres especiais (ex: `combo-casal.webp`).
3. **Escala:** Para imagens de itens do cardápio, padronize na proporção quadrada 1:1 com pelo menos 600×600 px de resolução para nitidez na modal de personalização em telas retina.
