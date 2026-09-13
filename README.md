# 🍔 Bendito Burger — Landing Page & Web App Delivery

Aplicação web estática, ultrarrápida e responsiva voltada para delivery gastronômico artesanal. Desenvolvida sob padrão de usabilidade mobile-first inspirado nas melhores experiências de delivery (iFood e 99 Food), com carrinho interativo, cálculo de cupons em tempo real e fechamento de pedidos direto no WhatsApp.

---

## 🚀 Visão Geral

- **Zero Dependências Pesadas:** 100% Vanilla (HTML5 semântico, CSS3 e JavaScript modular). Carregamento instantâneo com nota máxima no Lighthouse.
- **Padrão Delivery Moderno (iFood / 99 Food):** Cards compactos em lista no mobile, personalização de hambúrguer em Bottom Sheets de 3 camadas rígidas e barra flutuante de sacola desacoplada.
- **Checkout Inteligente via WhatsApp:** Validação rigorosa de nome, telefone, modalidade (entrega/retirada), troco e endereço completo, gerando uma mensagem estruturada pronta para envio.
- **Progressive Web App (PWA):** Service Worker para suporte offline (`sw.js`), instalação na tela inicial via `manifest.json` e banner responsivo para dispositivos móveis.
- **Segurança Rigorosa:** Sanitização contra ataques de injeção/XSS (`assets/js/security.js`), Content Security Policy (CSP) ativada e fallback para ambiente local.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Semântica estrita, acessibilidade com atributos ARIA e metadados Open Graph / SEO completos.
- **CSS3 Moderno:** Flexbox, CSS Grid, Design Tokens via CSS Variables, animações cúbicas e breakpoints mobile-first (480px, 768px, 1024px e 1280px).
- **JavaScript (ES6+ Modular):** Event delegation global, gerenciamento de estado desacoplado, sem inline handlers, estruturado em IIFE (`use strict`).
- **Service Worker & Manifest:** Cache de ativos essenciais para resiliência de rede e instalação em smartphones.
- **Schema.org JSON-LD:** Marcação estruturada de restaurante para indexação aprimorada no Google e mecanismos de busca.

---

## 💻 Como Executar Localmente

Você pode executar o projeto de três maneiras práticas:

### Opção 1: VS Code Live Server (Recomendado para Desenvolvimento)
1. Abra a pasta do projeto no **Visual Studio Code**.
2. Instale a extensão **Live Server** (caso ainda não possua).
3. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.
4. O navegador abrirá automaticamente em `http://127.0.0.1:5500`.

### Opção 2: Servidor Local via Terminal
Você pode utilizar Node.js ou Python para iniciar um servidor local estático:

- **Via Node.js (npx):**
  ```bash
  npx serve .
  ```
- **Via Python:**
  ```bash
  python -m http.server 3000
  ```
  Acesse `http://localhost:3000` no seu navegador.

### Opção 3: Abertura Direta (`file://`)
- O projeto possui proteção de protocolo embutida. Você pode abrir o arquivo `index.html` dando um **duplo clique** direto no seu explorador de arquivos.
- A injeção do `manifest.json` e o registro do `sw.js` são automaticamente pausados para evitar alertas de CORS nulo no console do DevTools. Toda a navegação, carrinho e personalização funcionam 100% normalmente.

---

## 📂 Estrutura de Diretórios

```
LandingPage-Hamburgueria/
├── index.html                           # Página principal e ponto de entrada da aplicação
├── manifest.json                        # Manifesto PWA com metadados do aplicativo
├── robots.txt                           # Diretrizes de indexação para bots de busca
├── sitemap.xml                          # Mapa do site oficial
├── sw.js                                # Service Worker para cache e PWA
├── README.md                            # Guia oficial do projeto
└── assets/
    ├── css/
    │   ├── style.css                    # Design tokens, variáveis globais, reset e tipografia
    │   ├── components.css               # Componentes (cards, modais em 3 camadas, FAB, toasts)
    │   └── responsive.css               # Media queries mobile-first e adaptações desktop
    ├── js/
    │   ├── main.js                      # Regras de negócio, catálogo, carrinho e WhatsApp
    │   └── security.js                  # Sanitização contra XSS, escape HTML e validações
    ├── img/
    │   ├── icons/                       # Ícones e favicons da aplicação
    │   ├── og/                          # Imagens de compartilhamento para redes sociais
    │   └── *.webp                       # Imagens compactadas em alta definição dos produtos
    └── docs/
        ├── ARQUITETURA.md               # Documentação técnica aprofundada do sistema
        ├── schema-restaurant.example.json# Exemplo técnico de Schema.org JSON-LD
        ├── LEGACY_COMECE-AQUI.md        # Documentação original arquivada
        └── LEGACY_PROMPT_ORIGINAL.md    # Especificações de contexto originais arquivadas
```

---

## ⚙️ Customização Rápida

Para alterar os dados do estabelecimento, edite o objeto `CONFIG` no início de [`assets/js/main.js`](file:///C:/Users/arsx_/Documents/LandingPage-Hamburgueria/assets/js/main.js):
- **WhatsApp:** Substitua pelo número oficial com DDI e DDD (ex: `"5511999999999"`).
- **Nome & Endereço:** Modifique os dados de exibição física e links do Google Maps.
- **Cupons de Desconto:** Cadastre novos cupons no formato fixo (`fixed`) ou percentual (`percent`).
- **Cardápio:** Atualize itens, descrições, preços e adicionais diretamente no array `MENU`.

---

## 📄 Licença
Site oficial desenvolvido para **Bendito Burger**. Todos os direitos reservados.
