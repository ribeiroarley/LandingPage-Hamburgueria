# Arquitetura Técnica — Bendito Burger

Este documento descreve a estrutura arquitetural, os padrões de engenharia de software, a divisão modular e as diretrizes rigorosas de segurança aplicadas no projeto **Bendito Burger**.

---

## 1. Visão Geral da Arquitetura

O projeto adota uma arquitetura **Jamstack Vanilla Modular**, priorizando:
- **Zero Dependências Externas em Runtime:** Não utiliza frameworks pesados ou bibliotecas de terceiros (sem jQuery, React ou Bootstrap), garantindo First Contentful Paint (FCP) quase instantâneo (< 500ms).
- **Separação Estrita de Responsabilidades (SoC):** Separação integral entre marcação estrutural (`index.html`), estilização em camadas (`assets/css/`), inteligência de negócios (`assets/js/main.js`) e camada de blindagem (`assets/js/security.js`).
- **Arquitetura Reativa Leve:** Gerenciamento centralizado de estado no cliente através de objetos imutáveis/reativos com persistência via `localStorage`.

---

## 2. Divisão Modular do Código

```
LandingPage-Hamburgueria/
├── index.html                         # Estrutura semântica e esqueleto da aplicação
├── manifest.json                      # Configuração Web App / PWA
├── robots.txt                         # Regras de rastreamento para motores de busca
├── sitemap.xml                        # Mapa do site canônico
├── sw.js                              # Service Worker para cache offline e resiliência
├── README.md                          # Documentação executiva e guia de início
├── assets/
│   ├── css/
│   │   ├── style.css                  # Camada 1: Design tokens, reset, variáveis e base
│   │   ├── components.css             # Camada 2: Componentes atômicos e moleculares
│   │   └── responsive.css             # Camada 3: Media queries mobile-first (480, 768, 1024, 1280px)
│   ├── js/
│   │   ├── main.js                    # Motor da aplicação, estado, carrinho e WhatsApp
│   │   └── security.js                # Sanitização contra XSS, escape HTML e validações
│   ├── img/                           # Imagens WebP otimizadas
│   └── docs/                          # Documentação técnica e histórico
```

---

## 3. Detalhamento dos Módulos

### 3.1. Estilização (`assets/css/`)

1. **`style.css` (Fundação & Tokens):**
   - Reset universal moderno (`box-sizing: border-box`, margens zeradas).
   - Design Tokens centralizados em `:root`: paleta cromática (`--marrom-900`, `--verm`, `--dourado`), tipografia (`--font-display: 'Bebas Neue'`, `--font-body: 'Montserrat'`), raios de borda e transições de curva cúbica.
   - Tipografia base, esquema escuro artesanal (*Dark Rustic Gourmet*) e acessibilidade focada em alto contraste.

2. **`components.css` (Componentes Visuais):**
   - **Cards de Produto:** Cards com layout de grade para desktop e alinhamento tátil.
   - **Chips e Seletores:** Badges de ponto da carne, botões de adicionais e opções de combo.
   - **Estrutura Rígida de Modais em 3 Camadas:**
     * `.sheet-head`: Cabeçalho fixo com puxador tátil (`.sheet-drag`), título e botão de fechar (`#shCloseBtn`).
     * `.sheet-body`: Corpo com rolagem vertical independente (`overflow-y: auto`, `overscroll-behavior: contain`).
     * `.sheet-foot`: Rodapé fixo contendo seletor de quantidade e botão de confirmação (`.pz-add` ou checkout).
   - **Barra Flutuante de Pedido (`.fab`):** Botão fixo com contagem reativa de itens, valor total e separador tipográfico (`.fab-sep`).
   - **Toasts (`.toast`):** Notificações flutuantes posicionadas com animações desacopladas do fluxo da tela.

3. **`responsive.css` (Mobile-First & Padrão iFood / 99 Food):**
   - **Mobile (`< 768px`):** Cards em lista horizontal compacta (estilo catálogo de delivery), Bottom Sheets deslizando de baixo para cima (`transform: translateY`), e barra flutuante estendida no rodapé respeitando `env(safe-area-inset-bottom)`.
   - **Desktop (`>= 1024px`):** Cards em grade multi-colunas, modais centralizados tipo diálogo com backdrop desfocado, e botão de sacola reposicionado como pill flutuante no canto inferior direito (`bottom: 28px; right: 28px;`).

---

### 3.2. Lógica e Engenharia de Scripts (`assets/js/`)

1. **`security.js` (Módulo Defensivo):**
   - Objeto global encapsulado `Security` em IIFE estrita (`"use strict"`).
   - **Sanitização de XSS:** `Security.sanitizeText(str)` remove tags executáveis, protocolos `javascript:` e caracteres maliciosos usando `DOMParser` sem renderização no DOM vivo.
   - **Escape HTML:** `Security.escapeHTML(str)` substitui `&`, `<`, `>`, `"`, `'` por entidades seguras.
   - **Validações Fortes:** Validação de formato para nomes, números de WhatsApp com DDD e integridade de endereço.
   - **Enforce de Links Externos:** Injeta automaticamente `rel="noopener noreferrer"` em links externos.

2. **`main.js` (Motor da Aplicação):**
   - **Configuração & Cardápio:** Objeto central `CONFIG` contendo dados da loja, cupons ativos e catálogo completo indexado em `ALL` para busca $O(1)$.
   - **Event Delegation Global:** Zero manipuladores `onclick` inline no HTML. Todo clique é delegado a nível de documento via atributos semânticos `data-action`.
   - **ScrollSpy & Navegação Suave:** Monitoramento de interseção para destacar a categoria ativa e rolagem suave via `scrollIntoView`.
   - **Carrinho Reativo:** Cálculos imutáveis de `subtotal()`, `descontoCupom()`, `taxaEntrega()` e `total()`.
   - **Checkout WhatsApp:** Serialização estruturada do pedido em mensagem formatada para abertura direta via API oficial do WhatsApp (`https://api.whatsapp.com/send?...`).

---

## 4. Regras de Segurança e Blindagem de Protocolo

### 4.1. Content Security Policy (CSP)
Configurada via `<meta http-equiv="Content-Security-Policy">` no cabeçalho do `index.html`:
```http
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
manifest-src 'self';
connect-src 'self';
frame-ancestors 'none';
```
- Proíbe carregamento de scripts externos não autorizados.
- Bloqueia `eval()` e injeção arbitrária de código.
- Restringe fontes e estilos às origens aprovadas.

### 4.2. Blindagem Local (`file://` vs `http://`)
Para permitir que o projeto seja testado por desenvolvedores tanto via duplo clique direto no arquivo (`file:///`) quanto em servidores HTTP (`localhost` ou produção), foram aplicadas as seguintes salvaguardas:
1. **Injeção Dinâmica do `manifest.json`:** O link para o manifesto não reside estaticamente no `<head>` (evitando erros de CORS de origem nula em navegadores Chromium ao abrir via `file://`). É injetado apenas quando `window.location.protocol.startsWith('http')`.
2. **Registro Seguro de Service Worker:** O registro de `sw.js` é executado estritamente sob protocolo HTTP/HTTPS, com captura silenciosa de erros via `console.debug`.

### 4.3. Prevenção de Sobreposição de Interface
- Ao abrir qualquer modal (`openBurger` ou `openCart`), o JavaScript atribui a classe `modal-open` ao `<body>`.
- No CSS, a regra imperativa oculta o botão flutuante:
  ```css
  body.modal-open .fab {
    display: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  ```
  Isso previne qualquer sobreposição sobre campos de endereço ou sobre o botão de envio no WhatsApp.
