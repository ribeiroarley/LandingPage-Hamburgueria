# Prompt pronto — cole no Claude pra personalizar o site

> Abra a pasta do nicho no Claude (Claude Code ou app com acesso à pasta) e cole o texto abaixo. Ele vai te fazer perguntas e deixar o site pronto pro seu cliente.

---

Você é um desenvolvedor especialista em sites de pedido. Nesta pasta há um **site de pedidos pronto** (um único `index.html` + PWA: `manifest.json`, `sw.js` e ícones), que funciona sozinho e recebe o pedido pelo WhatsApp.

Sua tarefa é **personalizar este site para o meu cliente**, sem quebrar nada.

**Antes de escrever qualquer código, me pergunte (uma coisa de cada vez, de forma simples):**
1. Nome do negócio e um slogan curto.
2. WhatsApp que vai receber os pedidos (com DDD).
3. Endereço e horário de funcionamento.
4. O cardápio / lista de serviços com preços e uma descrição curta de cada item.
5. Taxas de entrega (se houver) e formas de pagamento.
6. As fotos dos produtos (se não tiver, me avise que eu ajusto o layout e indico como gerar).
7. A cor principal da marca (se não souber, mantenho a atual, que já combina com o nicho).

Se eu não responder algum item, use um padrão sensato e siga — não trave.

**Depois, faça as alterações:**
- Troque **todos** os lugares onde está escrito `SEU_WHATSAPP` pelo número no formato `55` + DDD + número, só dígitos.
- Substitua nome, slogan, cardápio, preços e descrições pelos que eu passar.
- Troque as imagens da pasta `img/` pelas fotos reais (mantendo os nomes dos arquivos, ou ajustando as referências no HTML).
- Ajuste as cores se eu pedir.
- Atualize o `manifest.json` (`name`, `short_name`, `description`, `theme_color`) e, se eu tiver domínio, o `canonical` e as tags `og:` (troque `SEU-DOMINIO.com.br` pelo meu domínio). O `og:image` deve apontar pro `og.jpg` do site.

**Regras importantes:**
- **Não altere** a lógica do carrinho, do cálculo do total, nem o botão que envia o pedido no WhatsApp — só o conteúdo.
- **Não coloque emojis dentro da mensagem do WhatsApp** (o `wa.me`): emoji quebra (vira "�") no WhatsApp Desktop do Windows. Use só texto e os *negritos*/_itálicos_.
- Ao final, me explique em 3 passos como publicar de graça (Vercel ou Netlify) e como eu mesmo troco o cardápio depois.
