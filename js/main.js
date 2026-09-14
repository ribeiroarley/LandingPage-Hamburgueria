/**
 * Bendito Burger — Aplicação Principal (main.js)
 * Gerenciamento de estado, renderização reativa, carrinho e pedidos via WhatsApp.
 */

(function () {
  "use strict";

  /* ==========================================================================
     1. CONFIGURAÇÕES & DADOS DO CARDÁPIO
     ========================================================================== */
  const CONFIG = {
    nome: "Bendito Burger",
    whatsapp: "5511999999999", // Número da hamburgueria (com DDI 55 + DDD)
    endereco: "Rua Augusta, 1420 — Consolação, São Paulo/SP",
    maps: "https://maps.google.com/?q=Rua+Augusta+1420+Consolacao+Sao+Paulo",
    horario: { dias: [2, 3, 4, 5, 6, 0], abre: "18:00", fecha: "23:00" }, // 0=Dom ... 6=Sáb (segunda fecha)
    entrega: { taxa: 8, gratisAcima: 70 },
    combo: { preco: 12, label: "Combo (batata + refri)" },
    cupons: {
      "PRIMEIRA10": { tipo: "percent", valor: 10, label: "10% de desconto" },
      "BENDITO5": { tipo: "fixed", valor: 5, label: "R$ 5,00 de desconto" }
    }
  };

  const MENU = [
    {
      cat: "Burgers",
      key: "burgers",
      sub: "na chapa · vira combo se quiser",
      burger: true,
      items: [
        { id: "classico", n: "Clássico", d: "blend bovino 160g, queijo, alface, tomate, cebola e molho da casa no pão brioche", p: 28, img: "burger-classico", carne: true },
        { id: "cheddar-bacon", n: "Cheddar Bacon", d: "blend 160g, cheddar derretido, bacon crocante e cebola no pão brioche", p: 34, img: "burger-cheddar-bacon", carne: true },
        { id: "duplo-smash", n: "Duplo Smash", d: "dois discos smash, queijo duplo, picles e molho especial", p: 39, img: "burger-duplo-smash", carne: true },
        { id: "frango", n: "Frango Crocante", d: "filé de frango empanado crocante, alface, tomate e maionese temperada", p: 32, img: "burger-frango", carne: false },
        { id: "veggie", n: "Veggie", d: "burger de grão-de-bico e legumes, alface, tomate e cebola roxa", p: 30, img: "burger-veggie", carne: false },
        { id: "costela", n: "Costela Barbecue", d: "costela desfiada, molho barbecue, cebola crispy e queijo prato", p: 37, img: "burger-costela", carne: true },
        { id: "salada", n: "Salada", d: "blend bovino 160g, muita salada fresca, queijo e molho leve", p: 29, img: "burger-classico", carne: true }
      ]
    },
    {
      cat: "Acompanhamentos",
      key: "acomp",
      sub: "pra completar",
      burger: false,
      items: [
        { id: "batata-frita", n: "Batata Frita", d: "porção crocante e sequinha", p: 15, img: "batata-frita" },
        { id: "batata-cheddar", n: "Batata c/ Cheddar e Bacon", d: "cheddar cremoso e bacon crocante", p: 24, img: "batata-cheddar-bacon" },
        { id: "onion-rings", n: "Onion Rings", d: "anéis de cebola empanados e dourados", p: 18, img: "onion-rings" },
        { id: "nuggets", n: "Nuggets (8un)", d: "crocante por fora, macio por dentro", p: 16 }
      ]
    },
    {
      cat: "Bebidas",
      key: "bebidas",
      burger: false,
      items: [
        { id: "coca-lata", n: "Coca-Cola Lata", d: "350ml gelada", p: 6 },
        { id: "guarana-lata", n: "Guaraná Lata", d: "350ml gelada", p: 6 },
        { id: "suco", n: "Suco 500ml", d: "laranja ou maracujá", p: 8 },
        { id: "agua", n: "Água Mineral", d: "com ou sem gás", p: 4 },
        { id: "cerveja", n: "Cerveja Long Neck", d: "gelada", p: 9 }
      ]
    },
    {
      cat: "Sobremesas",
      key: "sobremesas",
      burger: false,
      items: [
        { id: "milkshake", n: "Milkshake", d: "chocolate, morango ou baunilha", p: 18, img: "milkshake" },
        { id: "brownie", n: "Brownie c/ Sorvete", d: "quentinho com sorvete de creme", p: 16 }
      ]
    }
  ];

  const PONTOS = [
    { id: "mal", n: "Mal passada" },
    { id: "ponto", n: "Ao ponto" },
    { id: "bem", n: "Bem passada" }
  ];

  const ADICIONAIS = [
    { id: "bacon", n: "Bacon crocante", p: 5 },
    { id: "cheddar", n: "Cheddar extra", p: 4 },
    { id: "ovo", n: "Ovo frito", p: 3 },
    { id: "cebola", n: "Cebola caramelizada", p: 4 }
  ];

  const EMOJI = { acomp: "🍟", bebidas: "🥤", sobremesas: "🍰" };

  const ALL = {};
  MENU.forEach(function (c) {
    c.items.forEach(function (i) {
      i.cat = c.cat;
      i.catKey = c.key;
      i.burger = Boolean(c.burger);
      ALL[i.id] = i;
    });
  });

  const brl = function (v) {
    return "R$ " + Number(v || 0).toFixed(2).replace(".", ",");
  };

  /* ==========================================================================
     2. ESTADO DA APLICAÇÃO
     ========================================================================== */
  let cart = [];
  let order = {
    tipo: "",
    pag: "",
    nome: "",
    tel: "",
    troco: "",
    cupom: "",
    gorjeta: 0,
    end: { rua: "", num: "", bairro: "", comp: "", ref: "" }
  };
  let modal = { item: null, ponto: "ponto", combo: false, adics: [], qty: 1, obs: "" };
  let sheetMode = "";

  /* ==========================================================================
     3. HORÁRIO E FUNCIONAMENTO
     ========================================================================== */
  function statusLoja() {
    const now = new Date();
    const dia = now.getDay();
    const abreParts = CONFIG.horario.abre.split(":").map(Number);
    const fechaParts = CONFIG.horario.fecha.split(":").map(Number);
    const ah = abreParts[0], am = abreParts[1];
    const fh = fechaParts[0], fm = fechaParts[1];
    const min = now.getHours() * 60 + now.getMinutes();
    const aberto = CONFIG.horario.dias.includes(dia) && min >= (ah * 60 + am) && min <= (fh * 60 + fm);

    let proximo = "";
    if (!aberto) {
      for (let i = 0; i < 7; i++) {
        const d = (dia + i) % 7;
        if (CONFIG.horario.dias.includes(d)) {
          if (i === 0 && min < (ah * 60 + am)) {
            proximo = "hoje às " + CONFIG.horario.abre;
            break;
          }
          if (i === 0) continue;
          const diaNome = i === 1 ? "amanhã" : ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"][d];
          proximo = diaNome + " às " + CONFIG.horario.abre;
          break;
        }
      }
    }
    return { aberto: aberto, proximo: proximo };
  }

  /* ==========================================================================
     4. RENDERIZAÇÃO DO CABEÇALHO & CARDÁPIO
     ========================================================================== */
  function renderMeta() {
    const s = statusLoja();
    const metaEl = document.getElementById("meta");
    if (!metaEl) return;

    metaEl.innerHTML = `
      <span class="chip ${s.aberto ? "status-open" : "status-closed"}" role="status">
        <span class="dot ${s.aberto ? "on" : "off"}" aria-hidden="true"></span>
        ${s.aberto ? "Aberto agora" : "Fechado"}
      </span>
      <span class="chip">
        <a href="${Security.escapeHTML(CONFIG.maps)}" target="_blank" rel="noopener noreferrer" aria-label="Ver localização no mapa">
          📍 Como chegar
        </a>
      </span>
      <span class="chip">🕐 Ter a Dom · 18h–23h</span>
    `;

    const footAddr = document.getElementById("footAddr");
    if (footAddr) {
      footAddr.textContent = "📍 " + CONFIG.endereco;
    }

    const cb = document.getElementById("closedBanner");
    if (cb) {
      if (!s.aberto) {
        cb.style.display = "block";
        cb.textContent = "🕐 Estamos fechados agora. Abrimos " + (s.proximo || "em breve") + ". Você pode montar o pedido e enviar assim que abrirmos.";
      } else {
        cb.style.display = "none";
      }
    }

    Security.enforceExternalLinks(metaEl);
  }

  function renderMenu() {
    const nav = document.getElementById("nav");
    const menu = document.getElementById("menu");
    if (!nav || !menu) return;

    nav.innerHTML = "";
    menu.innerHTML = "";

    MENU.forEach(function (c, i) {
      const cid = "cat-" + c.key;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab-btn" + (i === 0 ? " active" : "");
      btn.textContent = c.cat;
      btn.dataset.action = "filter-cat";
      btn.dataset.target = cid;
      btn.dataset.cid = cid;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.setAttribute("aria-controls", cid);
      nav.appendChild(btn);

      const semImg = c.items.every(function (it) { return !it.img; });
      const sec = document.createElement("section");
      sec.className = "sec" + (semImg ? " simple" : "");
      sec.id = cid;
      sec.setAttribute("aria-labelledby", "title-" + cid);

      const secHeader = `
        <div class="sec-h">
          <h2 id="title-${cid}">${Security.escapeHTML(c.cat)}</h2>
          ${c.sub ? `<span class="sub">${Security.escapeHTML(c.sub)}</span>` : ""}
        </div>
      `;

      const g = document.createElement("div");
      g.className = "grid";
      g.setAttribute("role", "list");

      c.items.forEach(function (it) {
        g.appendChild(createCardEl(it));
      });

      sec.innerHTML = secHeader;
      sec.appendChild(g);
      menu.appendChild(sec);
    });

    syncCards();
  }

  function createCardEl(it) {
    const el = document.createElement("article");
    el.className = "card";
    el.id = "card-" + it.id;
    el.setAttribute("role", "listitem");

    const thumb = it.img
      ? `<img class="thumb" loading="lazy" src="img/${Security.escapeHTML(it.img)}.webp" alt="${Security.escapeHTML(it.n)} — foto ilustrativa" width="104" height="104">`
      : "";

    const preco = it.burger
      ? `${brl(it.p)} <small>a partir de</small>`
      : brl(it.p);

    el.innerHTML = `
      ${thumb}
      <div class="txt">
        <h3>${Security.escapeHTML(it.n)}</h3>
        <div class="desc">${Security.escapeHTML(it.d || "")}</div>
        <div class="bot">
          <span class="price">${preco}</span>
          <span id="act-${it.id}"></span>
        </div>
      </div>
    `;

    return el;
  }

  function actEl(it) {
    if (it.burger) {
      return `<button class="add" data-action="open-burger" data-id="${it.id}" aria-label="Montar ${Security.escapeHTML(it.n)}">Montar</button>`;
    }
    const q = qtySimple(it.id);
    if (q === 0) {
      return `<button class="add" data-action="add-simple" data-id="${it.id}" aria-label="Adicionar ${Security.escapeHTML(it.n)}">Adicionar</button>`;
    }
    return `
      <span class="qtc">
        <button data-action="dec-simple" data-id="${it.id}" aria-label="Diminuir quantidade de ${Security.escapeHTML(it.n)}">−</button>
        <span aria-live="polite">${q}</span>
        <button data-action="add-simple" data-id="${it.id}" aria-label="Aumentar quantidade de ${Security.escapeHTML(it.n)}">+</button>
      </span>
    `;
  }

  function syncCards() {
    MENU.forEach(function (c) {
      c.items.forEach(function (it) {
        const s = document.getElementById("act-" + it.id);
        if (s) {
          s.innerHTML = actEl(it);
        }
      });
    });
  }

  /* ==========================================================================
     5. ITENS SIMPLES (ACOMPANHAMENTOS, BEBIDAS, SOBREMESAS)
     ========================================================================== */
  function qtySimple(id) {
    return cart
      .filter(function (l) { return l.id === id && !l.burger; })
      .reduce(function (s, l) { return s + l.qty; }, 0);
  }

  function addSimple(id) {
    const it = ALL[id];
    if (!it) return;

    const line = cart.find(function (l) { return l.id === id && !l.burger; });
    if (line) {
      line.qty++;
    } else {
      cart.push({
        lineId: "L" + Date.now() + Math.round(Math.random() * 999),
        id: it.id,
        nome: it.n,
        base: it.p,
        burger: false,
        precoUnit: it.p,
        qty: 1,
        obs: ""
      });
    }
    onCartChange();
    toast(it.n + " adicionado");
  }

  function decSimple(id) {
    const line = cart.find(function (l) { return l.id === id && !l.burger; });
    if (!line) return;
    line.qty--;
    if (line.qty <= 0) {
      cart = cart.filter(function (l) { return l !== line; });
    }
    onCartChange();
  }

  /* ==========================================================================
     6. MODAL DO BURGER CUSTOMIZADO
     ========================================================================== */
  function openBurger(id) {
    const it = ALL[id];
    if (!it) return;

    modal = {
      item: it,
      ponto: "ponto",
      combo: false,
      adics: [],
      qty: 1,
      obs: ""
    };

    const titleEl = document.getElementById("shTitle");
    if (titleEl) titleEl.textContent = it.n;

    renderBurger();
    openSheet("burger");
  }

  function adicSum() {
    return modal.adics.reduce(function (s, a) {
      const found = ADICIONAIS.find(function (x) { return x.id === a; });
      return s + (found ? found.p : 0);
    }, 0);
  }

  function burgerPreco() {
    if (!modal.item) return 0;
    const base = modal.item.p + (modal.combo ? CONFIG.combo.preco : 0) + adicSum();
    return base * modal.qty;
  }

  function toggleAdic(id) {
    const i = modal.adics.indexOf(id);
    if (i >= 0) {
      modal.adics.splice(i, 1);
    } else {
      modal.adics.push(id);
    }
    renderBurger();
  }

  function setPonto(p) {
    modal.ponto = p;
    renderBurger();
  }

  function setCombo(v) {
    modal.combo = Boolean(v);
    renderBurger();
  }

  function renderBurger() {
    const it = modal.item;
    if (!it) return;

    const body = document.getElementById("shBody");
    if (!body) return;

    const imgTag = it.img
      ? `<img class="pz-img" src="img/${Security.escapeHTML(it.img)}.webp" alt="${Security.escapeHTML(it.n)}" width="400" height="200">`
      : "";

    const pontosHtml = it.carne
      ? `
        <div class="opt-group">
          <label>Ponto da carne</label>
          <div class="opt-row" role="radiogroup" aria-label="Escolha o ponto da carne">
            ${PONTOS.map(function (p) {
              const isSel = modal.ponto === p.id;
              return `
                <button type="button" class="opt ${isSel ? "sel" : ""}" data-action="set-ponto" data-val="${p.id}" role="radio" aria-checked="${isSel}">
                  ${Security.escapeHTML(p.n)}
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `
      : "";

    const comboHtml = `
      <div class="opt-group">
        <label>Vira combo?</label>
        <div class="combo-box">
          <div class="ct">Adicione <b>batata + refri</b> por só <b>+${brl(CONFIG.combo.preco)}</b></div>
          <div class="combo-row" role="radiogroup" aria-label="Opção de combo">
            <button type="button" class="opt ${!modal.combo ? "sel" : ""}" data-action="set-combo" data-val="false" role="radio" aria-checked="${!modal.combo}">
              Só o burger
            </button>
            <button type="button" class="opt ${modal.combo ? "sel" : ""}" data-action="set-combo" data-val="true" role="radio" aria-checked="${modal.combo}">
              Vira combo <span class="pl">• +${brl(CONFIG.combo.preco)}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const adicsHtml = `
      <div class="opt-group">
        <label>Adicionais</label>
        <div class="opt-row" role="group" aria-label="Adicionais disponíveis">
          ${ADICIONAIS.map(function (a) {
            const isSel = modal.adics.includes(a.id);
            return `
              <button type="button" class="opt ${isSel ? "sel" : ""}" data-action="toggle-adic" data-val="${a.id}" aria-pressed="${isSel}">
                + ${Security.escapeHTML(a.n)} <span class="pl">• ${brl(a.p)}</span>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;

    const obsHtml = `
      <div class="opt-group">
        <label for="bgObs">Alguma observação?</label>
        <input class="obs-in" id="bgObs" placeholder="ex: sem cebola, pão bem tostado…" value="${Security.escapeHTML(modal.obs)}" maxlength="140">
      </div>
    `;

    const leveJuntoHtml = `
      <div class="opt-group">
        <label>Leve junto</label>
        <div class="sug-row">${leveJuntoChips()}</div>
      </div>
    `;

    body.innerHTML = imgTag +
      `<div class="pz-desc">${Security.escapeHTML(it.d || "")}</div>` +
      pontosHtml +
      comboHtml +
      adicsHtml +
      obsHtml +
      leveJuntoHtml;

    // Listener para o input de observação
    const obsInput = document.getElementById("bgObs");
    if (obsInput) {
      obsInput.addEventListener("input", function (e) {
        modal.obs = Security.sanitizeText(e.target.value);
      });
    }

    renderBurgerFoot();
  }

  function renderBurgerFoot() {
    const foot = document.getElementById("shFoot");
    if (!foot) return;

    foot.innerHTML = `
      <div class="pz-foot-bar">
        <div class="qty-control" aria-label="Seletor de quantidade">
          <button type="button" data-action="burger-dec-qty" aria-label="Diminuir quantidade">−</button>
          <span aria-live="polite">${modal.qty}</span>
          <button type="button" data-action="burger-inc-qty" aria-label="Aumentar quantidade">+</button>
        </div>
        <button type="button" class="pz-add" data-action="add-burger-confirm" aria-label="Adicionar item ao pedido">
          <span>Adicionar</span>
          <span>${brl(burgerPreco())}</span>
        </button>
      </div>
    `;
  }

  function addBurger() {
    const it = modal.item;
    if (!it) return;

    const adicsNome = modal.adics.map(function (a) {
      const f = ADICIONAIS.find(function (x) { return x.id === a; });
      return f ? f.n : a;
    });

    const pontoObj = PONTOS.find(function (p) { return p.id === modal.ponto; });
    const pontoNome = pontoObj ? pontoObj.n : "";

    cart.push({
      lineId: "L" + Date.now() + Math.round(Math.random() * 999),
      id: it.id,
      nome: it.n,
      base: it.p,
      burger: true,
      carne: Boolean(it.carne),
      ponto: modal.ponto,
      pontoNome: pontoNome,
      combo: modal.combo,
      adics: modal.adics.slice(),
      adicsNome: adicsNome,
      precoUnit: burgerPreco() / modal.qty,
      qty: modal.qty,
      obs: Security.sanitizeText(modal.obs)
    });

    closeAll();
    onCartChange();
    toast("Burger adicionado ao pedido");
  }

  /* ==========================================================================
     7. CÁLCULO DE TOTAIS & CUPONS
     ========================================================================== */
  function count() {
    return cart.reduce(function (s, l) { return s + l.qty; }, 0);
  }

  function subtotal() {
    return cart.reduce(function (s, l) { return s + l.precoUnit * l.qty; }, 0);
  }

  function descontoCupom() {
    const c = CONFIG.cupons[order.cupom];
    if (!c) return 0;
    return c.tipo === "percent" ? (subtotal() * c.valor) / 100 : c.valor;
  }

  function taxaEntrega() {
    if (order.tipo !== "entrega") return 0;
    const sub = subtotal() - descontoCupom();
    return sub >= CONFIG.entrega.gratisAcima ? 0 : CONFIG.entrega.taxa;
  }

  function total() {
    const calc = subtotal() - descontoCupom() + taxaEntrega() + (order.tipo === "entrega" ? order.gorjeta : 0);
    return Math.max(0, calc);
  }

  function onCartChange() {
    syncCards();
    persistCart();
    const n = count();

    const fabCount = document.getElementById("fabCount");
    if (fabCount) fabCount.textContent = n;

    const fabTotal = document.getElementById("fabTotal");
    if (fabTotal) fabTotal.textContent = brl(total());

    const fab = document.getElementById("fab");
    if (fab) fab.classList.toggle("hide", n === 0);

    const sheet = document.getElementById("sheet");
    if (sheet && sheet.classList.contains("on") && sheetMode === "cart") {
      renderCart();
    }
  }

  /* ==========================================================================
     8. CONTROLE DE MODAL / BOTTOM SHEET
     ========================================================================== */
  function openSheet(m) {
    sheetMode = m || "burger";
    const overlay = document.getElementById("overlay");
    const sheet = document.getElementById("sheet");
    if (overlay) overlay.classList.add("on");
    if (sheet) sheet.classList.add("on");
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
  }

  function closeAll() {
    const overlay = document.getElementById("overlay");
    const sheet = document.getElementById("sheet");
    if (overlay) overlay.classList.remove("on");
    if (sheet) sheet.classList.remove("on");
    document.body.style.overflow = "";
    document.body.classList.remove("modal-open");
    sheetMode = "";
  }

  /* ==========================================================================
     9. CARRINHO DE COMPRAS & CHECKOUT
     ========================================================================== */
  function openCart() {
    renderCart();
    openSheet("cart");
  }

  function lineDesc(l) {
    if (!l.burger) return l.obs ? `obs: ${Security.escapeHTML(l.obs)}` : "";
    const parts = [];
    if (l.carne && l.pontoNome) parts.push(Security.escapeHTML(l.pontoNome));
    if (l.combo) parts.push("Combo (batata + refri)");
    if (l.adicsNome && l.adicsNome.length) {
      parts.push("+ " + l.adicsNome.map(Security.escapeHTML).join(", "));
    }
    if (l.obs) parts.push(Security.escapeHTML(l.obs));
    return parts.join(" · ");
  }

  function renderCart() {
    const titleEl = document.getElementById("shTitle");
    if (titleEl) titleEl.textContent = "Seu pedido";

    const body = document.getElementById("shBody");
    const foot = document.getElementById("shFoot");
    if (!body || !foot) return;

    if (!cart.length) {
      body.innerHTML = `
        <div class="empty">
          <div class="em" aria-hidden="true">🍔</div>
          Seu pedido está vazio.<br>Escolha suas delícias no cardápio acima.
        </div>
      `;
      foot.innerHTML = "";
      return;
    }

    const s = statusLoja();
    const cartDiscount = descontoCupom();
    const hasDiscount = Boolean(cartDiscount && cartDiscount > 0);

    const itemsHtml = cart.map(function (l) {
      const it = ALL[l.id] || { n: l.nome, catKey: "burgers" };
      const img = it.img
        ? `<img src="img/${Security.escapeHTML(it.img)}.webp" alt="${Security.escapeHTML(l.nome)}" width="54" height="54">`
        : `<div class="ni" aria-hidden="true">${EMOJI[it.catKey] || "🍔"}</div>`;

      return `
        <div class="citem">
          ${img}
          <div class="ci-t">
            <h4>${Security.escapeHTML(l.nome)}</h4>
            <div class="cfg">${lineDesc(l)}</div>
          </div>
          <div class="ci-r">
            <span class="lp">${brl(l.precoUnit * l.qty)}</span>
            <span class="qtc">
              <button type="button" data-action="dec-line" data-id="${l.lineId}" aria-label="Diminuir ${Security.escapeHTML(l.nome)}">−</button>
              <span aria-live="polite">${l.qty}</span>
              <button type="button" data-action="inc-line" data-id="${l.lineId}" aria-label="Aumentar ${Security.escapeHTML(l.nome)}">+</button>
            </span>
          </div>
        </div>
      `;
    }).join("");

    body.innerHTML = `
      ${freteBlock()}
      <div class="cart-items-list" role="list">${itemsHtml}</div>
      ${suggestBlock()}

      <div class="field">
        <label>Como você quer receber?</label>
        <div class="opts2" role="radiogroup" aria-label="Tipo de entrega">
          <button type="button" class="o2 ${order.tipo === "entrega" ? "sel" : ""}" data-action="set-tipo" data-val="entrega" role="radio" aria-checked="${order.tipo === "entrega"}">
            🛵 Entrega <small>na sua casa</small>
          </button>
          <button type="button" class="o2 ${order.tipo === "retirada" ? "sel" : ""}" data-action="set-tipo" data-val="retirada" role="radio" aria-checked="${order.tipo === "retirada"}">
            🏠 Retirada <small>no balcão</small>
          </button>
        </div>
      </div>

      ${order.tipo === "entrega" ? enderecoFormHtml() : ""}

      <div class="field">
        <label for="fNome">Seu nome</label>
        <input class="txt" id="fNome" placeholder="Nome de quem recebe" value="${Security.escapeHTML(order.nome)}" maxlength="60">
      </div>

      <div class="field">
        <label for="fTel">Seu WhatsApp</label>
        <input class="txt" id="fTel" inputmode="tel" placeholder="(11) 90000-0000" value="${Security.escapeHTML(order.tel)}" maxlength="16">
      </div>

      <div class="field">
        <label>Forma de pagamento</label>
        <div class="pay3" role="radiogroup" aria-label="Forma de pagamento">
          <button type="button" class="o2 center ${order.pag === "PIX" ? "sel" : ""}" data-action="set-pag" data-val="PIX" role="radio" aria-checked="${order.pag === "PIX"}">
            💠 PIX
          </button>
          <button type="button" class="o2 center ${order.pag === "Dinheiro" ? "sel" : ""}" data-action="set-pag" data-val="Dinheiro" role="radio" aria-checked="${order.pag === "Dinheiro"}">
            💵 Dinheiro
          </button>
          <button type="button" class="o2 center ${order.pag === "Cartão" ? "sel" : ""}" data-action="set-pag" data-val="Cartão" role="radio" aria-checked="${order.pag === "Cartão"}">
            💳 Cartão
          </button>
        </div>
        ${order.pag === "Dinheiro" ? `
          <input class="txt" id="fTroco" style="margin-top:9px" placeholder="Troco para quanto? (opcional)" value="${Security.escapeHTML(order.troco)}" maxlength="20">
        ` : ""}
      </div>

      ${order.tipo === "entrega" ? `
        <div class="field">
          <label>Gorjeta pro entregador (opcional)</label>
          <div class="tips" role="radiogroup" aria-label="Gorjeta">
            ${[0, 2, 5].map(function (v) {
              const isSel = order.gorjeta === v;
              return `
                <button type="button" class="tip ${isSel ? "sel" : ""}" data-action="set-gorjeta" data-val="${v}" role="radio" aria-checked="${isSel}">
                  ${v === 0 ? "Não" : brl(v)}
                </button>
              `;
            }).join("")}
          </div>
        </div>
      ` : ""}

      <div class="field">
        <label for="fCupom">Cupom de desconto</label>
        <div class="coupon ${hasDiscount ? "ok" : ""}">
          <input class="txt" id="fCupom" placeholder="Tem um cupom? (ex: PRIMEIRA10)" value="${Security.escapeHTML(order.cupom)}" maxlength="20">
          <button type="button" data-action="aplicar-cupom">Aplicar</button>
        </div>
      </div>
    `;

    foot.innerHTML = `
      <div class="cart-foot-summary" aria-label="Resumo de valores">
        <div class="sumrow"><span>Subtotal</span><span>${brl(subtotal())}</span></div>
        ${hasDiscount ? `
          <div class="sumrow disc">
            <span>Cupom ${Security.escapeHTML(order.cupom)}</span>
            <span>- ${brl(cartDiscount)}</span>
          </div>
        ` : ""}
        ${order.tipo === "entrega" ? `
          <div class="sumrow">
            <span>Taxa de entrega</span>
            <span>${taxaEntrega() === 0 ? "Grátis" : brl(taxaEntrega())}</span>
          </div>
        ` : ""}
        ${order.tipo === "entrega" && order.gorjeta ? `
          <div class="sumrow">
            <span>Gorjeta</span>
            <span>${brl(order.gorjeta)}</span>
          </div>
        ` : ""}
        <div class="totrow">
          <span style="font-weight:600">Total</span>
          <span class="tv">${brl(total())}</span>
        </div>
      </div>

      <button type="button" class="send" id="sendBtn" data-action="enviar-pedido">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.5 1.8 1 .9 1.8 1.1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.1Z"/></svg>
        ${s.aberto ? "Enviar pedido no WhatsApp" : "Enviar assim que abrir"}
      </button>
      <div class="hint">O pagamento e a confirmação são combinados na conversa do WhatsApp.</div>
    `;

    bindCartInputs();
    updateSendBtn();
  }

  function enderecoFormHtml() {
    const e = order.end;
    return `
      <div class="field" role="group" aria-label="Endereço de entrega">
        <label>Endereço de entrega</label>
        <div class="row2">
          <input class="txt" id="fEndRua" placeholder="Rua / Avenida" value="${Security.escapeHTML(e.rua)}" maxlength="80">
          <input class="txt" id="fEndNum" placeholder="Número" value="${Security.escapeHTML(e.num)}" maxlength="15">
        </div>
        <div class="row2" style="margin-top:9px">
          <input class="txt" id="fEndBairro" placeholder="Bairro" value="${Security.escapeHTML(e.bairro)}" maxlength="40">
          <input class="txt" id="fEndComp" placeholder="Complemento" value="${Security.escapeHTML(e.comp)}" maxlength="30">
        </div>
        <input class="txt" id="fEndRef" style="margin-top:9px" placeholder="Ponto de referência (opcional)" value="${Security.escapeHTML(e.ref)}" maxlength="60">
      </div>
    `;
  }

  function bindCartInputs() {
    const fNome = document.getElementById("fNome");
    if (fNome) {
      fNome.addEventListener("input", function (e) {
        order.nome = Security.sanitizeText(e.target.value);
        updateSendBtn();
      });
    }

    const fTel = document.getElementById("fTel");
    if (fTel) {
      fTel.addEventListener("input", function (e) {
        order.tel = Security.sanitizeText(e.target.value);
        updateSendBtn();
      });
    }

    const fTroco = document.getElementById("fTroco");
    if (fTroco) {
      fTroco.addEventListener("input", function (e) {
        order.troco = Security.sanitizeText(e.target.value);
      });
    }

    const fRua = document.getElementById("fEndRua");
    if (fRua) {
      fRua.addEventListener("input", function (e) {
        order.end.rua = Security.sanitizeText(e.target.value);
        updateSendBtn();
      });
    }

    const fNum = document.getElementById("fEndNum");
    if (fNum) {
      fNum.addEventListener("input", function (e) {
        order.end.num = Security.sanitizeText(e.target.value);
        updateSendBtn();
      });
    }

    const fBairro = document.getElementById("fEndBairro");
    if (fBairro) {
      fBairro.addEventListener("input", function (e) {
        order.end.bairro = Security.sanitizeText(e.target.value);
        updateSendBtn();
      });
    }

    const fComp = document.getElementById("fEndComp");
    if (fComp) {
      fComp.addEventListener("input", function (e) {
        order.end.comp = Security.sanitizeText(e.target.value);
      });
    }

    const fRef = document.getElementById("fEndRef");
    if (fRef) {
      fRef.addEventListener("input", function (e) {
        order.end.ref = Security.sanitizeText(e.target.value);
      });
    }
  }

  function leveJuntoChips() {
    const ids = ["batata-frita", "milkshake", "coca-lata"];
    return ids
      .map(function (id) { return ALL[id]; })
      .filter(Boolean)
      .map(function (x) {
        return `
          <button type="button" class="sug-chip" data-action="add-simple-chip" data-id="${x.id}">
            + ${Security.escapeHTML(x.n)} <span class="chip-sep">•</span> <b>${brl(x.p)}</b>
          </button>
        `;
      }).join("");
  }

  function suggestBlock() {
    const temAcomp = cart.some(function (l) { return ALL[l.id] && ALL[l.id].catKey === "acomp"; });
    const temBebida = cart.some(function (l) { return ALL[l.id] && ALL[l.id].catKey === "bebidas"; });
    const temSobre = cart.some(function (l) { return ALL[l.id] && ALL[l.id].catKey === "sobremesas"; });
    const chips = [];

    if (!temAcomp) {
      const acompCat = MENU.find(function (c) { return c.key === "acomp"; });
      if (acompCat) chips.push.apply(chips, acompCat.items.slice(0, 2));
    }
    if (!temBebida) {
      const bebCat = MENU.find(function (c) { return c.key === "bebidas"; });
      if (bebCat) chips.push.apply(chips, bebCat.items.slice(0, 2));
    }
    if (!temSobre) {
      const sobCat = MENU.find(function (c) { return c.key === "sobremesas"; });
      if (sobCat) chips.push.apply(chips, sobCat.items.slice(0, 1));
    }
    if (!chips.length) return "";

    return `
      <div class="suggest">
        <b>Complete seu pedido</b>
        <div class="sug-row">
          ${chips.map(function (x) {
            return `
              <button type="button" class="sug-chip" data-action="add-simple-chip" data-id="${x.id}">
                + ${Security.escapeHTML(x.n)} <span class="chip-sep">•</span> <b>${brl(x.p)}</b>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function freteBlock() {
    if (subtotal() <= 0) return "";
    const base = subtotal() - descontoCupom();
    const falta = CONFIG.entrega.gratisAcima - base;

    if (falta > 0.01) {
      const pct = Math.min(100, (base / CONFIG.entrega.gratisAcima) * 100);
      return `
        <div class="frete">
          <div class="frete-t">Faltam <b>${brl(falta)}</b> para ganhar <b>ENTREGA GRÁTIS</b></div>
          <div class="frete-bar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100">
            <span style="width:${pct}%"></span>
          </div>
        </div>
      `;
    }
    return `
      <div class="frete ok">
        <div class="frete-t">Você ganhou <b>ENTREGA GRÁTIS</b>! Aproveite.</div>
      </div>
    `;
  }

  function incLine(id) {
    const l = cart.find(function (x) { return x.lineId === id; });
    if (l) {
      l.qty++;
      onCartChange();
    }
  }

  function decLine(id) {
    const l = cart.find(function (x) { return x.lineId === id; });
    if (!l) return;
    l.qty--;
    if (l.qty <= 0) {
      cart = cart.filter(function (x) { return x !== l; });
    }
    onCartChange();
  }

  function setTipo(t) {
    order.tipo = t;
    renderCart();
  }

  function setPag(p) {
    order.pag = p;
    renderCart();
  }

  function setGorjeta(v) {
    order.gorjeta = Number(v) || 0;
    renderCart();
  }

  function aplicarCupom() {
    const input = document.getElementById("fCupom");
    const code = Security.sanitizeCoupon(input ? input.value : "");
    order.cupom = code;

    if (CONFIG.cupons[code]) {
      toast("Cupom aplicado: " + CONFIG.cupons[code].label);
    } else if (code) {
      toast("Cupom inválido");
      order.cupom = "";
    }
    renderCart();
  }

  function updateSendBtn() {
    const b = document.getElementById("sendBtn");
    if (!b) return;

    let ok = Boolean(order.tipo) && Security.validateName(order.nome) && Security.validatePhone(order.tel);
    if (order.tipo === "entrega") {
      ok = ok && Security.validateAddress(order.end);
    }
    b.disabled = !ok;
  }

  /* ==========================================================================
     10. ENVIO DO PEDIDO PARA O WHATSAPP
     ========================================================================== */
  function enviarPedido() {
    if (!order.tipo) {
      toast("Escolha entrega ou retirada");
      return;
    }
    if (!Security.validateName(order.nome)) {
      toast("Digite seu nome completo");
      return;
    }
    if (!Security.validatePhone(order.tel)) {
      toast("Digite seu WhatsApp com DDD");
      return;
    }
    if (order.tipo === "entrega" && !Security.validateAddress(order.end)) {
      toast("Complete o endereço (rua, número e bairro)");
      return;
    }

    const L = [];
    L.push(`*PEDIDO — ${CONFIG.nome}*`);
    L.push("");
    L.push(`*Cliente:* ${order.nome.trim()}`);
    L.push(`*WhatsApp:* ${order.tel.trim()}`);

    if (order.tipo === "entrega") {
      const e = order.end;
      L.push(`*Entrega:* ${e.rua}, ${e.num}${e.comp ? " - " + e.comp : ""} - ${e.bairro}`);
      if (e.ref) L.push(`*Referência:* ${e.ref}`);
    } else {
      L.push(`*Retirada no balcão*`);
    }

    L.push("");
    L.push("*Itens do Pedido:*");

    cart.forEach(function (l) {
      if (l.burger) {
        const nome = l.combo ? `${l.nome} — Combo (batata + refri)` : l.nome;
        L.push(`• ${l.qty}x ${nome} — ${brl(l.precoUnit * l.qty)}`);
        if (l.carne && l.pontoNome) L.push(`   Ponto: ${l.pontoNome}`);
        if (l.adicsNome && l.adicsNome.length) L.push(`   Adicionais: ${l.adicsNome.join(", ")}`);
        if (l.obs) L.push(`   _Obs: ${l.obs}_`);
      } else {
        L.push(`• ${l.qty}x ${l.nome} — ${brl(l.precoUnit * l.qty)}`);
        if (l.obs) L.push(`   _Obs: ${l.obs}_`);
      }
    });

    L.push("");
    L.push(`*Subtotal:* ${brl(subtotal())}`);

    if (descontoCupom() > 0) {
      L.push(`*Cupom ${order.cupom}:* -${brl(descontoCupom())}`);
    }

    if (order.tipo === "entrega") {
      L.push(`*Taxa de entrega:* ${taxaEntrega() === 0 ? "Grátis" : brl(taxaEntrega())}`);
    }

    if (order.tipo === "entrega" && order.gorjeta) {
      L.push(`*Gorjeta:* ${brl(order.gorjeta)}`);
    }

    L.push(`*TOTAL:* ${brl(total())}`);

    if (order.pag) {
      const trocoTxt = order.pag === "Dinheiro" && order.troco ? ` (troco p/ ${order.troco})` : "";
      L.push(`*Pagamento:* ${order.pag}${trocoTxt}`);
    }

    L.push("");
    L.push("_Pedido gerado pelo site oficial_");

    try {
      localStorage.setItem("bb_last", JSON.stringify({ cart: cart, order: { ...order } }));
      localStorage.setItem("bb_nome", order.nome.trim());
      localStorage.setItem("bb_tel", order.tel.trim());
    } catch (err) {
      console.warn("Não foi possível salvar no localStorage:", err);
    }

    const whatsappUrl = `https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent(L.join("\n"));
    Security.safeOpenUrl(whatsappUrl);
  }

  /* ==========================================================================
     11. REPETIR PEDIDO & PERSISTÊNCIA
     ========================================================================== */
  function persistCart() {
    try {
      localStorage.setItem("bb_cart", JSON.stringify(cart));
    } catch (e) {
      // Ignora erro em modo privado
    }
  }

  function initRepeat() {
    try {
      const nome = localStorage.getItem("bb_nome");
      if (nome) {
        order.nome = nome;
        order.tel = localStorage.getItem("bb_tel") || "";
      }

      const last = localStorage.getItem("bb_last");
      if (last) {
        const d = JSON.parse(last);
        if (d && d.cart && d.cart.length) {
          const btn = document.getElementById("repeatBtn");
          if (btn) {
            btn.style.display = "block";
            const resumo = d.cart.map(function (l) { return l.qty + "x " + l.nome; }).slice(0, 2).join(", ");
            btn.innerHTML = `🔁 Repetir último pedido <b>· ${Security.escapeHTML(resumo)}${d.cart.length > 2 ? "…" : ""}</b>`;
          }
        }
      }
    } catch (e) {
      console.warn("Erro ao ler repeat data:", e);
    }
  }

  function repeatLast() {
    try {
      const last = localStorage.getItem("bb_last");
      if (!last) return;
      const d = JSON.parse(last);
      if (!d || !d.cart) return;

      cart = d.cart.map(function (l) {
        return { ...l, lineId: "L" + Date.now() + Math.round(Math.random() * 9999) };
      });

      if (d.order) {
        order.nome = d.order.nome || order.nome;
        order.tel = d.order.tel || order.tel;
        order.tipo = d.order.tipo || "";
        order.end = d.order.end || order.end;
      }

      onCartChange();
      openCart();
      toast("Pedido anterior carregado!");
    } catch (e) {
      toast("Erro ao carregar pedido anterior");
    }
  }

  /* ==========================================================================
     12. DEEP LINK (?item=) & SCROLLSPY
     ========================================================================== */
  function initDeepLink() {
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("item");
      if (p && ALL[p]) {
        setTimeout(function () {
          if (ALL[p].burger) {
            openBurger(p);
          } else {
            addSimple(p);
            openCart();
          }
        }, 350);
      }
    } catch (e) {}
  }

  function initScrollSpy() {
    const buttons = Array.from(document.querySelectorAll(".nav .tab-btn, .nav a"));
    if (!buttons.length || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          buttons.forEach(function (b) {
            const match = (b.dataset.target === e.target.id) || (b.dataset.cid === e.target.id);
            b.classList.toggle("active", match);
            b.setAttribute("aria-selected", match ? "true" : "false");
          });
          const activeBtn = buttons.find(function (b) {
            return (b.dataset.target === e.target.id) || (b.dataset.cid === e.target.id);
          });
          if (activeBtn) {
            activeBtn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
          }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    document.querySelectorAll(".sec").forEach(function (s) {
      io.observe(s);
    });
  }

  /* ==========================================================================
     13. PWA & SERVICE WORKER
     ========================================================================== */
  let deferredPrompt = null;
  const isMobile = Boolean(window.matchMedia && (window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(pointer: coarse)").matches));

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    const pwaBar = document.getElementById("pwaBar");
    if (isMobile && pwaBar) {
      pwaBar.style.display = "flex";
    }
  });

  function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () {
      deferredPrompt = null;
      const pwaBar = document.getElementById("pwaBar");
      if (pwaBar) pwaBar.style.display = "none";
    });
  }

  // Injeção condicional de Manifest e Service Worker (segurança contra erros de CORS no file://)
  if (window.location.protocol.startsWith("http")) {
    const manifestLink = document.createElement("link");
    manifestLink.rel = "manifest";
    manifestLink.href = "manifest.json";
    document.head.appendChild(manifestLink);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(function (err) {
        console.debug("SW:", err);
      });
    }
  }

  /* ==========================================================================
     14. NOTIFICAÇÕES (TOAST)
     ========================================================================== */
  let toastTimer;
  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove("on");
    }, 2500);
  }

  /* ==========================================================================
     15. EVENT DELEGATION GLOBAL (SEM INLINE HANDLERS)
     ========================================================================== */
  function setupEventListeners() {
    // Abertura do carrinho pelo FAB
    const fab = document.getElementById("fab");
    if (fab) {
      fab.addEventListener("click", openCart);
    }

    // Fechamento de modal e sheets
    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.addEventListener("click", closeAll);
    }

    const shClose = document.getElementById("shCloseBtn");
    if (shClose) {
      shClose.addEventListener("click", closeAll);
    }

    // Botão de repetir pedido no hero
    const repeatBtn = document.getElementById("repeatBtn");
    if (repeatBtn) {
      repeatBtn.addEventListener("click", repeatLast);
    }

    // Banner PWA
    const pwaInstallBtn = document.getElementById("pwaInstallBtn");
    if (pwaInstallBtn) {
      pwaInstallBtn.addEventListener("click", installPWA);
    }

    const pwaCloseBtn = document.getElementById("pwaCloseBtn");
    if (pwaCloseBtn) {
      pwaCloseBtn.addEventListener("click", function () {
        const pwaBar = document.getElementById("pwaBar");
        if (pwaBar) pwaBar.style.display = "none";
      });
    }

    // Delegação de cliques no documento
    document.addEventListener("click", function (e) {
      const target = e.target.closest("[data-action]");
      if (!target) return;

      const action = target.dataset.action;
      const id = target.dataset.id;
      const val = target.dataset.val;

      switch (action) {
        case "filter-cat": {
          e.preventDefault();
          const targetId = target.dataset.target || target.dataset.cid;
          const sec = document.getElementById(targetId);
          if (sec) {
            sec.scrollIntoView({ behavior: "smooth", block: "start" });
            document.querySelectorAll(".nav .tab-btn").forEach(function (b) {
              const isMatch = b === target;
              b.classList.toggle("active", isMatch);
              b.setAttribute("aria-selected", isMatch ? "true" : "false");
            });
          }
          break;
        }
        case "open-burger":
          openBurger(id);
          break;
        case "add-simple":
          addSimple(id);
          break;
        case "dec-simple":
          decSimple(id);
          break;
        case "add-simple-chip":
          e.stopPropagation();
          addSimple(id);
          break;
        case "set-ponto":
          setPonto(val);
          break;
        case "set-combo":
          setCombo(val === "true");
          break;
        case "toggle-adic":
          toggleAdic(val);
          break;
        case "burger-dec-qty":
          modal.qty = Math.max(1, modal.qty - 1);
          renderBurgerFoot();
          break;
        case "burger-inc-qty":
          modal.qty++;
          renderBurgerFoot();
          break;
        case "add-burger-confirm":
          addBurger();
          break;
        case "inc-line":
          incLine(id);
          break;
        case "dec-line":
          decLine(id);
          break;
        case "set-tipo":
          setTipo(val);
          break;
        case "set-pag":
          setPag(val);
          break;
        case "set-gorjeta":
          setGorjeta(val);
          break;
        case "aplicar-cupom":
          aplicarCupom();
          break;
        case "enviar-pedido":
          enviarPedido();
          break;
        default:
          break;
      }
    });

    // Tecla ESC para fechar sheet/modal
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sheetMode) {
        closeAll();
      }
    });
  }

  /* ==========================================================================
     16. INICIALIZAÇÃO
     ========================================================================== */
  function init() {
    renderMeta();
    renderMenu();
    setupEventListeners();
    initScrollSpy();
    initRepeat();
    initDeepLink();
    setInterval(renderMeta, 60000);
    Security.enforceExternalLinks(document.body);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
