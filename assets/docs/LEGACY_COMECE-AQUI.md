# KIT — 17 sites de pedido prontos

Cada pasta aqui é um **site de pedidos completo e independente** (um nicho por pasta). O cliente abre o link, monta o pedido no celular e ele cai pronto no WhatsApp do dono — sem app, sem mensalidade, sem comissão.

Nichos inclusos: pizzaria, hamburgueria, pastelaria, marmitaria, hortifruti, distribuidora, barbearia, salão, studio de unhas, petshop, dentista, personal, quadra society, loja de roupa, materiais de construção, pousada, aluguel de festa.

## Como usar (3 passos)

1. **Escolha a pasta** do nicho mais parecido com o negócio do seu cliente.
2. **Personalize** — o jeito mais fácil é abrir a pasta no Claude e colar o texto do arquivo `PROMPT-PARA-O-CLAUDE.md`. Ele vai te perguntar as informações e trocar tudo.
3. **Publique** — arraste a pasta pronta pro [vercel.com](https://vercel.com) ou [netlify.com/drop](https://app.netlify.com/drop). Fica no ar de graça em segundos.

## O que precisa ser trocado em cada site

Está tudo marcado com **placeholder** pra ficar fácil de achar:

- **`SEU_WHATSAPP`** → o número que vai receber os pedidos. Formato: `55` + DDD + número, só dígitos (ex: `5551999998888`). Aparece no arquivo `index.html`.
- **Nome, slogan, cardápio, preços e descrições** → estão dentro do `index.html`, todos fictícios. Troque pelos do seu cliente.
- **Fotos** → estão na pasta `img/`. Troque pelas fotos reais dos produtos (mesma proporção). Sem foto boa? O Claude te ajuda a gerar.
- **Cores** → dá pra ajustar pra combinar com a marca do cliente.
- **`SEU-DOMINIO.com.br`** → se for usar domínio próprio, troque no `canonical` e nas tags `og:` (isso melhora o preview do link no WhatsApp). Se não tiver domínio, pode deixar — não quebra nada.
- **`manifest.json`** → nome e cor do "app" quando o cliente salva na tela inicial. Troque nome e `theme_color`.

## Regra de ouro

**Não mude a lógica do carrinho nem o botão de enviar no WhatsApp** — é o coração do site e já está testado. Mexa só no conteúdo (nome, cardápio, preços, fotos, cores, número).

## Dica de venda

Cada site já vem com **sugestão de produtos** (o famoso "leve junto") que aumenta o valor do pedido sozinha. É um ótimo argumento pra cobrar do cliente: *"esse sistema não só recebe o pedido, ele faz o cliente gastar mais."*
