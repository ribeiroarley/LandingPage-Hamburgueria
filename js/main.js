/**
 * NA BRASA BURGER — Aplicação Principal (main.js)
 * Gerenciamento de estado, renderização reativa, carrinho e pedidos via WhatsApp.
 */

(function () {
  "use strict";

  /* ==========================================================================
     1. CONFIGURAÇÕES & DADOS DO CARDÁPIO
     ========================================================================== */
  const CONFIG = {
    nome: "NA BRASA BURGER",
    whatsapp: "5561994024930", // Número da hamburgueria (com DDI 55 + DDD)
    instagram: "https://www.instagram.com/nabrasaburgerss?cplk=MTNtbjlpdHU3YXI0dA==",
    endereco: "Atendimento exclusivo via Delivery",
    horario: { dias: [0, 1, 2, 3, 4, 5, 6], abre: "19:00", fecha: "23:00" }, // 0=Dom ... 6=Sáb (Seg a Dom - todos os dias)
    entrega: { taxa: 8, gratisAcima: 70 },
    combo: { preco: 12, label: "Combo (batata + refri)" },
    cupons: {
      "PRIMEIRA10": { tipo: "percent", valor: 10, label: "10% de desconto" },
      "BRASA5": { tipo: "fixed", valor: 5, label: "R$ 5,00 de desconto" },
      "NABRASA5": { tipo: "fixed", valor: 5, label: "R$ 5,00 de desconto" },
      "BENDITO5": { tipo: "fixed", valor: 5, label: "R$ 5,00 de desconto" }
    }
  };

  const MENU = [
    {
      cat: "Burgers",
      key: "burgers",
      sub: "na brasa · vira combo se quiser",
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
    tipo: "entrega",
    pag: "PIX",
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
      <div class="meta-row meta-info">
        <span class="chip ${s.aberto ? "status-open" : "status-closed"}" role="status">
          <span class="dot ${s.aberto ? "on" : "off"}" aria-hidden="true"></span>
          <span>${s.aberto ? "Aberto agora" : "Fechado"}</span>
        </span>
        <span class="chip">
          <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="currentColor" aria-hidden="true"><path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-4-4zm-12 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm11 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
          <span>100% Delivery</span>
        </span>
        <span class="chip">
          <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="currentColor" aria-hidden="true"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          <span>Seg a Dom · 19h–23h</span>
        </span>
      </div>
      <div class="meta-row meta-actions">
        <a class="chip chip-action" href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp NA BRASA BURGER">
          <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          <span>WhatsApp</span>
        </a>
        <a class="chip chip-action" href="${Security.escapeHTML(CONFIG.instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram NA BRASA BURGER">
          <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          <span>Instagram</span>
        </a>
      </div>
    `;

    const footAddr = document.getElementById("footAddr");
    if (footAddr) {
      footAddr.innerHTML = `
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-4-4zm-12 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm11 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
        <span>${Security.escapeHTML(CONFIG.endereco)}</span>
      `;
    }

    const cb = document.getElementById("closedBanner");
    if (cb) {
      if (!s.aberto) {
        cb.style.display = "flex";
        cb.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          <span>Estamos fechados agora. Abrimos ${Security.escapeHTML(s.proximo || "hoje às 19:00")}. Você pode montar o pedido e enviar assim que abrirmos.</span>
        `;
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
    el.className = "card" + (it.img ? "" : " no-thumb");
    el.id = "card-" + it.id;
    el.setAttribute("role", "listitem");

    const thumb = it.img
      ? `<img class="thumb" loading="lazy" src="img/${Security.escapeHTML(it.img)}.webp" alt="${Security.escapeHTML(it.n)} — foto ilustrativa" width="92" height="92">`
      : "";

    const preco = it.burger
      ? `${brl(it.p)} <small>a partir de</small>`
      : brl(it.p);

    el.innerHTML = `
      <div class="card-left">
        <h3>${Security.escapeHTML(it.n)}</h3>
        <div class="desc">${Security.escapeHTML(it.d || "")}</div>
        <div class="card-price-row">
          <span class="price">${preco}</span>
        </div>
      </div>
      <div class="card-right">
        ${thumb}
        <div class="card-act" id="act-${it.id}"></div>
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
      leveJunto: [],
      qty: 1,
      obs: ""
    };

    const titleEl = document.getElementById("shTitle");
    if (titleEl) titleEl.textContent = it.n;

    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) clearBtn.style.display = "none";

    renderBurger();
    openSheet("burger");
  }

  function adicSum() {
    return modal.adics.reduce(function (s, a) {
      const found = ADICIONAIS.find(function (x) { return x.id === a; });
      return s + (found ? found.p : 0);
    }, 0);
  }

  function leveJuntoSum() {
    return (modal.leveJunto || []).reduce(function (s, id) {
      const found = ALL[id];
      return s + (found ? found.p : 0);
    }, 0);
  }

  function burgerPreco() {
    if (!modal.item) return 0;
    const base = modal.item.p + (modal.combo ? CONFIG.combo.preco : 0) + adicSum() + leveJuntoSum();
    return base * modal.qty;
  }

  function updateBurgerModalUI() {
    // 1. Atualiza botões de adicionais
    const adicBtns = document.querySelectorAll("#shBody [data-action='toggle-adic']");
    adicBtns.forEach(function (btn) {
      const id = btn.dataset.val;
      const isSel = modal.adics.includes(id);
      btn.classList.toggle("sel", isSel);
      btn.setAttribute("aria-pressed", isSel ? "true" : "false");
    });

    // 2. Atualiza botões de Leve Junto
    const ljBtns = document.querySelectorAll("#shBody [data-action='toggle-leve-junto']");
    ljBtns.forEach(function (btn) {
      const id = btn.dataset.id;
      const isSel = Boolean(modal.leveJunto && modal.leveJunto.includes(id));
      btn.classList.toggle("sel", isSel);
      btn.setAttribute("aria-pressed", isSel ? "true" : "false");
      const item = ALL[id];
      if (item) {
        btn.innerHTML = `${isSel ? "✓" : "+"} ${Security.escapeHTML(item.n)} <span class="chip-sep">•</span> <b>${brl(item.p)}</b>`;
      }
    });

    // 3. Atualiza botões de Combo
    const comboBtns = document.querySelectorAll("#shBody [data-action='set-combo']");
    comboBtns.forEach(function (btn) {
      const isTrue = btn.dataset.val === "true";
      const isSel = modal.combo === isTrue;
      btn.classList.toggle("sel", isSel);
      btn.setAttribute("aria-checked", isSel ? "true" : "false");
    });

    // 4. Atualiza botões de Ponto
    const pontoBtns = document.querySelectorAll("#shBody [data-action='set-ponto']");
    pontoBtns.forEach(function (btn) {
      const isSel = modal.ponto === btn.dataset.val;
      btn.classList.toggle("sel", isSel);
      btn.setAttribute("aria-checked", isSel ? "true" : "false");
    });

    // 5. Atualiza o rodapé com o preço total recalculado instantaneamente
    renderBurgerFoot();
  }

  function toggleAdic(id) {
    const i = modal.adics.indexOf(id);
    if (i >= 0) {
      modal.adics.splice(i, 1);
    } else {
      modal.adics.push(id);
    }
    updateBurgerModalUI();
  }

  function toggleLeveJunto(id) {
    if (!modal.leveJunto) modal.leveJunto = [];
    const i = modal.leveJunto.indexOf(id);
    if (i >= 0) {
      modal.leveJunto.splice(i, 1);
    } else {
      modal.leveJunto.push(id);
    }
    updateBurgerModalUI();
  }

  function setPonto(p) {
    modal.ponto = p;
    updateBurgerModalUI();
  }

  function setCombo(v) {
    modal.combo = Boolean(v);
    updateBurgerModalUI();
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
    const precoBurgerUnit = it.p + (modal.combo ? CONFIG.combo.preco : 0) + adicSum();

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
      precoUnit: precoBurgerUnit,
      qty: modal.qty,
      obs: Security.sanitizeText(modal.obs)
    });

    if (modal.leveJunto && modal.leveJunto.length) {
      modal.leveJunto.forEach(function (ljId) {
        const itemLj = ALL[ljId];
        if (itemLj) {
          const existing = cart.find(function (l) { return !l.burger && l.id === ljId; });
          if (existing) {
            existing.qty += modal.qty;
          } else {
            cart.push({
              lineId: "L" + Date.now() + Math.round(Math.random() * 999),
              id: itemLj.id,
              nome: itemLj.n,
              precoUnit: itemLj.p,
              burger: false,
              qty: modal.qty
            });
          }
        }
      });
    }

    closeAll();
    onCartChange();
    toast("Item adicionado ao pedido");
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

    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) clearBtn.style.display = "none";
  }

  /* ==========================================================================
     9. CARRINHO DE COMPRAS & CHECKOUT
     ========================================================================== */
  function openCart() {
    renderCart();
    openSheet("cart");
  }

  function clearCart() {
    cart = [];
    order.cupom = "";
    persistCart();
    onCartChange();
    toast("Carrinho esvaziado com sucesso");
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

    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) {
      clearBtn.style.display = cart.length ? "inline-flex" : "none";
    }

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

    const formEl = document.getElementById("cartCheckoutForm");
    if (formEl) {
      // Atualização granular reativa sem recriar os campos de texto no DOM (preserva digitação e foco)
      const freteBox = document.getElementById("cartFreteBox");
      if (freteBox) freteBox.innerHTML = freteBlock();

      const itemsBox = document.getElementById("cartItemsBox");
      if (itemsBox) itemsBox.innerHTML = `<div class="cart-items-list" role="list">${itemsHtml}</div>`;

      const suggestBox = document.getElementById("cartSuggestBox");
      if (suggestBox) suggestBox.innerHTML = suggestBlock();
    } else {
      // Primeira montagem do carrinho
      body.innerHTML = `
        <div id="cartFreteBox">${freteBlock()}</div>
        <div id="cartItemsBox"><div class="cart-items-list" role="list">${itemsHtml}</div></div>
        <div id="cartSuggestBox">${suggestBlock()}</div>
        <div id="cartCheckoutForm">${checkoutFormHtml()}</div>
      `;
      bindCartInputs();
    }

    renderCartFoot();
  }

  function checkoutFormHtml() {
    const e = order.end;
    const cartDiscount = descontoCupom();
    const hasDiscount = Boolean(cartDiscount && cartDiscount > 0);

    return `
      <div class="field">
        <label>Forma de entrega</label>
        <div class="delivery-notice-box" role="status">
          <span class="delivery-badge-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-4-4zm-12 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm11 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
          </span>
          <div>
            <strong>100% Delivery em Domicílio</strong>
            <small>Preencha os dados abaixo para receber quentinho no seu endereço</small>
          </div>
        </div>
      </div>

      <div class="field" role="group" aria-label="Endereço de entrega">
        <label>Endereço de entrega</label>
        <div class="row2">
          <div>
            <label for="fEndRua" class="field-sublabel">Rua / Quadra / Condomínio *</label>
            <input class="txt" id="fEndRua" placeholder="Ex: Quadra QC 03 / Rua 10" value="${Security.escapeHTML(e.rua)}" maxlength="80" autocomplete="street-address">
          </div>
          <div>
            <label for="fEndNum" class="field-sublabel">Número / Lote *</label>
            <input class="txt" id="fEndNum" placeholder="Ex: Casa 12 / Lote 05" value="${Security.escapeHTML(e.num)}" maxlength="20">
          </div>
        </div>
        <div class="row2" style="margin-top:9px">
          <div>
            <label for="fEndBairro" class="field-sublabel">Bairro / Região *</label>
            <input class="txt" id="fEndBairro" placeholder="Ex: Mangueiral, São Sebastião" value="${Security.escapeHTML(e.bairro)}" maxlength="50" autocomplete="address-level2">
          </div>
          <div>
            <label for="fEndComp" class="field-sublabel">Complemento</label>
            <input class="txt" id="fEndComp" placeholder="Ex: Bloco B, Apt 302" value="${Security.escapeHTML(e.comp)}" maxlength="40">
          </div>
        </div>
        <div style="margin-top:9px">
          <label for="fEndRef" class="field-sublabel">Ponto de referência (opcional)</label>
          <input class="txt" id="fEndRef" placeholder="Ex: Próximo à portaria / padaria" value="${Security.escapeHTML(e.ref)}" maxlength="70">
        </div>
      </div>

      <div class="field">
        <label for="fNome">Seu nome completo *</label>
        <input class="txt" id="fNome" placeholder="Ex: João da Silva" value="${Security.escapeHTML(order.nome)}" maxlength="60" autocomplete="name">
      </div>

      <div class="field">
        <label for="fTel">Seu WhatsApp *</label>
        <input class="txt" id="fTel" inputmode="tel" placeholder="(61) 99999-9999" value="${Security.escapeHTML(order.tel)}" maxlength="16" autocomplete="tel">
      </div>

      <div class="field">
        <label>Forma de pagamento *</label>
        <div class="pay3" role="radiogroup" aria-label="Forma de pagamento">
          <button type="button" class="o2 center ${order.pag === "PIX" ? "sel" : ""}" data-action="set-pag" data-val="PIX" role="radio" aria-checked="${order.pag === "PIX"}">
            💠 PIX
          </button>
          <button type="button" class="o2 center ${order.pag === "Cartão" ? "sel" : ""}" data-action="set-pag" data-val="Cartão" role="radio" aria-checked="${order.pag === "Cartão"}">
            💳 Cartão
          </button>
          <button type="button" class="o2 center ${order.pag === "Dinheiro" ? "sel" : ""}" data-action="set-pag" data-val="Dinheiro" role="radio" aria-checked="${order.pag === "Dinheiro"}">
            💵 Dinheiro
          </button>
        </div>
        <div id="trocoBox" style="display: ${order.pag === "Dinheiro" ? "block" : "none"}; margin-top: 10px;">
          <label for="fTroco" class="field-sublabel">Troco para quanto? (opcional)</label>
          <input class="txt" id="fTroco" placeholder="Ex: R$ 50,00 (ou deixe em branco se não precisar)" value="${Security.escapeHTML(order.troco)}" maxlength="30">
        </div>
      </div>

      <div class="field">
        <label>Gorjeta pro entregador (opcional)</label>
        <div class="tips" id="tipsGroup" role="radiogroup" aria-label="Gorjeta">
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

      <div class="field">
        <label for="fCupom">Cupom de desconto</label>
        <div class="coupon ${hasDiscount ? "ok" : ""}" id="couponBox">
          <input class="txt" id="fCupom" placeholder="Tem um cupom? (ex: PRIMEIRA10)" value="${Security.escapeHTML(order.cupom)}" maxlength="20">
          <button type="button" data-action="aplicar-cupom">Aplicar</button>
        </div>
      </div>
    `;
  }

  function renderCartFoot() {
    const foot = document.getElementById("shFoot");
    if (!foot) return;

    const s = statusLoja();
    const cartDiscount = descontoCupom();
    const hasDiscount = Boolean(cartDiscount && cartDiscount > 0);

    foot.innerHTML = `
      <div class="cart-foot-summary" aria-label="Resumo de valores">
        <div class="sumrow"><span>Subtotal</span><span>${brl(subtotal())}</span></div>
        ${hasDiscount ? `
          <div class="sumrow disc">
            <span>Cupom ${Security.escapeHTML(order.cupom)}</span>
            <span>- ${brl(cartDiscount)}</span>
          </div>
        ` : ""}
        <div class="sumrow">
          <span>Taxa de entrega</span>
          <span>${taxaEntrega() === 0 ? "Grátis" : brl(taxaEntrega())}</span>
        </div>
        ${order.gorjeta ? `
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
        ${s.aberto ? "Finalizar Pedido via WhatsApp" : "Enviar assim que abrir"}
      </button>
      <div class="hint">O pagamento e a confirmação são combinados na conversa do WhatsApp.</div>
    `;

    updateSendBtn();
  }

  function formatPhone(v) {
    const digits = String(v || "").replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  function bindCartInputs() {
    const fNome = document.getElementById("fNome");
    if (fNome) {
      fNome.addEventListener("input", function (e) {
        order.nome = e.target.value;
        e.target.classList.remove("input-error");
        updateSendBtn();
      });
    }

    const fTel = document.getElementById("fTel");
    if (fTel) {
      fTel.addEventListener("input", function (e) {
        const raw = e.target.value;
        const formatted = formatPhone(raw);
        e.target.value = formatted;
        order.tel = formatted;
        e.target.classList.remove("input-error");
        updateSendBtn();
      });
    }

    const fTroco = document.getElementById("fTroco");
    if (fTroco) {
      fTroco.addEventListener("input", function (e) {
        order.troco = e.target.value;
      });
    }

    const fRua = document.getElementById("fEndRua");
    if (fRua) {
      fRua.addEventListener("input", function (e) {
        order.end.rua = e.target.value;
        e.target.classList.remove("input-error");
        updateSendBtn();
      });
    }

    const fNum = document.getElementById("fEndNum");
    if (fNum) {
      fNum.addEventListener("input", function (e) {
        order.end.num = e.target.value;
        e.target.classList.remove("input-error");
        updateSendBtn();
      });
    }

    const fBairro = document.getElementById("fEndBairro");
    if (fBairro) {
      fBairro.addEventListener("input", function (e) {
        order.end.bairro = e.target.value;
        e.target.classList.remove("input-error");
        updateSendBtn();
      });
    }

    const fComp = document.getElementById("fEndComp");
    if (fComp) {
      fComp.addEventListener("input", function (e) {
        order.end.comp = e.target.value;
      });
    }

    const fRef = document.getElementById("fEndRef");
    if (fRef) {
      fRef.addEventListener("input", function (e) {
        order.end.ref = e.target.value;
      });
    }
  }

  function leveJuntoChips() {
    const ids = ["batata-frita", "milkshake", "coca-lata"];
    return ids
      .map(function (id) { return ALL[id]; })
      .filter(Boolean)
      .map(function (x) {
        const isSel = Boolean(modal.leveJunto && modal.leveJunto.includes(x.id));
        return `
          <button type="button" class="sug-chip ${isSel ? "sel" : ""}" data-action="toggle-leve-junto" data-id="${x.id}" aria-pressed="${isSel ? "true" : "false"}">
            ${isSel ? "✓" : "+"} ${Security.escapeHTML(x.n)} <span class="chip-sep">•</span> <b>${brl(x.p)}</b>
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
  }

  function setPag(p) {
    order.pag = p;
    const btns = document.querySelectorAll("[data-action='set-pag']");
    btns.forEach(function (btn) {
      const isSel = btn.getAttribute("data-val") === p;
      btn.classList.toggle("sel", isSel);
      btn.setAttribute("aria-checked", isSel ? "true" : "false");
    });

    const trocoBox = document.getElementById("trocoBox");
    if (trocoBox) {
      trocoBox.style.display = (p === "Dinheiro" ? "block" : "none");
      if (p === "Dinheiro") {
        const fTroco = document.getElementById("fTroco");
        if (fTroco) fTroco.focus();
      }
    }
    updateSendBtn();
  }

  function setGorjeta(v) {
    order.gorjeta = Number(v) || 0;
    const tipBtns = document.querySelectorAll("#tipsGroup .tip, [data-action='set-gorjeta']");
    tipBtns.forEach(function (btn) {
      const val = Number(btn.getAttribute("data-val")) || 0;
      const isSel = (val === order.gorjeta);
      btn.classList.toggle("sel", isSel);
      btn.setAttribute("aria-checked", isSel ? "true" : "false");
    });
    renderCartFoot();
  }

  function aplicarCupom() {
    const input = document.getElementById("fCupom");
    const code = Security.sanitizeCoupon(input ? input.value : "");
    order.cupom = code;

    const couponBox = document.getElementById("couponBox");
    if (CONFIG.cupons[code]) {
      toast("Cupom aplicado: " + CONFIG.cupons[code].label);
      if (couponBox) couponBox.classList.add("ok");
    } else if (code) {
      toast("Cupom inválido");
      order.cupom = "";
      if (couponBox) couponBox.classList.remove("ok");
    } else {
      if (couponBox) couponBox.classList.remove("ok");
    }

    const freteBox = document.getElementById("cartFreteBox");
    if (freteBox) freteBox.innerHTML = freteBlock();

    renderCartFoot();
  }

  function updateSendBtn() {
    const b = document.getElementById("sendBtn");
    if (!b) return;

    const ok = Security.validateName(order.nome) && Security.validatePhone(order.tel) && Security.validateAddress(order.end);
    b.classList.toggle("ready", ok);
    b.disabled = false;
  }

  /* ==========================================================================
     10. ENVIO DO PEDIDO PARA O WHATSAPP
     ========================================================================== */
  function highlightAndFocus(id, msg) {
    toast(msg);
    const el = document.getElementById(id);
    if (el) {
      el.classList.add("input-error");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(function () {
        el.focus();
      }, 250);
    }
  }

  function montarComandaWhatsApp() {
    const L = [];
    L.push("════════════════════════════");
    L.push(`🍔 *NOVO PEDIDO - ${CONFIG.nome}* 🍔`);
    L.push("════════════════════════════");
    L.push(`*Cliente:* ${order.nome.trim()}`);
    L.push(`*WhatsApp:* ${order.tel.trim()}`);
    L.push("");
    L.push("📍 *ENDEREÇO DE ENTREGA:*");
    L.push(`• Endereço: ${order.end.rua.trim()}, Nº ${order.end.num.trim()}`);
    L.push(`• Bairro/Região: ${order.end.bairro.trim()}`);
    const compRef = [
      order.end.comp ? order.end.comp.trim() : "",
      order.end.ref ? ("Ref: " + order.end.ref.trim()) : ""
    ].filter(Boolean).join(" · ");
    L.push(`• Complemento/Ref: ${compRef || "Não informado"}`);
    L.push("");
    L.push("📋 *ITENS DO PEDIDO:*");
    cart.forEach(function (l) {
      if (l.burger) {
        const nome = l.combo ? `${l.nome} — Combo (batata + refri)` : l.nome;
        L.push(`${l.qty}x ${nome} (${brl(l.precoUnit * l.qty)})`);
        const detalhes = [];
        if (l.carne && l.pontoNome) detalhes.push(`Ponto: ${l.pontoNome}`);
        if (l.adicsNome && l.adicsNome.length) detalhes.push(`Adicionais: ${l.adicsNome.join(", ")}`);
        if (l.obs && l.obs.trim()) detalhes.push(`Obs: ${l.obs.trim()}`);
        if (detalhes.length) {
          L.push(`  ↳ _${detalhes.join(" | ")}_`);
        }
      } else {
        L.push(`${l.qty}x ${l.nome} (${brl(l.precoUnit * l.qty)})`);
        if (l.obs && l.obs.trim()) {
          L.push(`  ↳ _Obs: ${l.obs.trim()}_`);
        }
      }
    });
    L.push("");
    if (descontoCupom() > 0 || order.gorjeta > 0 || taxaEntrega() > 0) {
      L.push("💵 *VALORES:*");
      L.push(`• Subtotal: ${brl(subtotal())}`);
      if (descontoCupom() > 0) {
        L.push(`• Cupom (${order.cupom}): -${brl(descontoCupom())}`);
      }
      L.push(`• Entrega: ${taxaEntrega() === 0 ? "GRÁTIS" : brl(taxaEntrega())}`);
      if (order.gorjeta > 0) {
        L.push(`• Gorjeta do entregador: ${brl(order.gorjeta)}`);
      }
      L.push("");
    }
    L.push("────────────────────────────");
    let pagStr = "PIX";
    if (order.pag === "Cartão") {
      pagStr = "Cartão na Entrega (Débito/Crédito)";
    } else if (order.pag === "Dinheiro") {
      pagStr = order.troco && order.troco.trim() ? `Dinheiro (Troco para ${order.troco.trim()})` : "Dinheiro (Não precisa de troco)";
    }
    L.push(`💳 *FORMA DE PAGAMENTO:* ${pagStr}`);
    L.push(`💰 *TOTAL DO PEDIDO:* *${brl(total())}*`);
    L.push("────────────────────────────");
    L.push("_Pedido realizado via Cardápio Online_");
    return L.join("\n");
  }

  function enviarPedido() {
    if (!cart.length) {
      toast("Seu carrinho está vazio");
      return;
    }

    const e = order.end;
    if (!e.rua || e.rua.trim().length < 2) {
      highlightAndFocus("fEndRua", "Informe a rua, quadra ou condomínio");
      return;
    }
    if (!e.num || e.num.trim().length < 1) {
      highlightAndFocus("fEndNum", "Informe o número da casa ou lote");
      return;
    }
    if (!e.bairro || e.bairro.trim().length < 2) {
      highlightAndFocus("fEndBairro", "Informe o bairro ou região");
      return;
    }
    if (!Security.validateName(order.nome)) {
      highlightAndFocus("fNome", "Digite seu nome completo");
      return;
    }
    if (!Security.validatePhone(order.tel)) {
      highlightAndFocus("fTel", "Digite seu WhatsApp com DDD (ex: 61 99999-9999)");
      return;
    }

    try {
      localStorage.setItem("bb_nome", order.nome.trim());
      localStorage.setItem("bb_tel", order.tel.trim());
      localStorage.setItem("bb_end", JSON.stringify(order.end));
      localStorage.setItem("bb_last", JSON.stringify({ cart: cart, order: { ...order } }));
    } catch (err) {
      console.warn("Não foi possível salvar no localStorage:", err);
    }

    const textoComanda = montarComandaWhatsApp();
    const whatsappUrl = `https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent(textoComanda);
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

  function syncFormInputs() {
    const fNome = document.getElementById("fNome");
    if (fNome && order.nome) fNome.value = order.nome;
    const fTel = document.getElementById("fTel");
    if (fTel && order.tel) fTel.value = order.tel;
    const fRua = document.getElementById("fEndRua");
    if (fRua && order.end.rua) fRua.value = order.end.rua;
    const fNum = document.getElementById("fEndNum");
    if (fNum && order.end.num) fNum.value = order.end.num;
    const fBairro = document.getElementById("fEndBairro");
    if (fBairro && order.end.bairro) fBairro.value = order.end.bairro;
    const fComp = document.getElementById("fEndComp");
    if (fComp && order.end.comp) fComp.value = order.end.comp;
    const fRef = document.getElementById("fEndRef");
    if (fRef && order.end.ref) fRef.value = order.end.ref;
    const fTroco = document.getElementById("fTroco");
    if (fTroco && order.troco) fTroco.value = order.troco;
    updateSendBtn();
  }

  function initRepeat() {
    try {
      const nome = localStorage.getItem("bb_nome");
      if (nome) {
        order.nome = nome;
      }
      const tel = localStorage.getItem("bb_tel");
      if (tel) {
        order.tel = tel;
      }
      const savedEnd = localStorage.getItem("bb_end");
      if (savedEnd) {
        try {
          const parsed = JSON.parse(savedEnd);
          if (parsed && typeof parsed === "object") {
            order.end = { ...order.end, ...parsed };
          }
        } catch (_) {}
      }

      const last = localStorage.getItem("bb_last");
      if (last) {
        const d = JSON.parse(last);
        if (d && d.cart && d.cart.length) {
          const btn = document.getElementById("repeatBtn");
          if (btn) {
            btn.style.display = "inline-flex";
            const resumo = d.cart.map(function (l) { return l.qty + "x " + l.nome; }).slice(0, 2).join(", ");
            btn.innerHTML = `
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
              <span>Repetir último pedido <b>· ${Security.escapeHTML(resumo)}${d.cart.length > 2 ? "…" : ""}</b></span>
            `;
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
        if (d.order.pag) setPag(d.order.pag);
        if (d.order.troco) order.troco = d.order.troco;
      }

      onCartChange();
      openCart();
      syncFormInputs();
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

  let isProgrammaticScroll = false;
  let programmaticScrollTimer = null;

  function scrollNavButton(btn) {
    const navIn = document.getElementById("nav");
    if (!navIn || !btn) return;

    const navRect = navIn.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    // Centraliza o botão dentro da barra horizontal sem mover a janela vertical
    const currentScroll = navIn.scrollLeft;
    const targetScroll = currentScroll + (btnRect.left - navRect.left) - (navRect.width / 2) + (btnRect.width / 2);

    navIn.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: "smooth"
    });
  }

  function scrollToCategory(secId, btn) {
    const sec = document.getElementById(secId);
    if (!sec) return;

    // Atualiza o estado ativo de todos os botões imediatamente
    const allButtons = document.querySelectorAll(".nav .tab-btn");
    allButtons.forEach(function (b) {
      const isMatch = (b === btn) || (b.dataset.target === secId) || (b.dataset.cid === secId);
      b.classList.toggle("active", isMatch);
      b.setAttribute("aria-selected", isMatch ? "true" : "false");
    });

    if (btn) {
      scrollNavButton(btn);
    }

    // Trava temporariamente o IntersectionObserver para evitar loops e salto de rolagem ("vai e volta")
    isProgrammaticScroll = true;
    clearTimeout(programmaticScrollTimer);

    const navEl = document.querySelector(".nav");
    const navHeight = navEl ? navEl.offsetHeight : 54;

    // Cálculo milimétrico de offset compensando a barra de navegação sticky
    const secRect = sec.getBoundingClientRect();
    const targetY = window.pageYOffset + secRect.top - navHeight - 10;

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: "smooth"
    });

    programmaticScrollTimer = setTimeout(function () {
      isProgrammaticScroll = false;
    }, 800);
  }

  function initScrollSpy() {
    const buttons = Array.from(document.querySelectorAll(".nav .tab-btn, .nav a"));
    if (!buttons.length || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(function (entries) {
      if (isProgrammaticScroll) return; // Não interfere durante a rolagem de um clique

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
            scrollNavButton(activeBtn);
          }
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });

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

    // Prevenção de salto de hash nativo (#) ou comportamento padrão na barra de categorias
    const navEl = document.getElementById("nav");
    if (navEl) {
      navEl.addEventListener("click", function (e) {
        const btn = e.target.closest("button, a");
        if (btn) {
          e.preventDefault();
        }
      }, { passive: false });
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
          e.stopPropagation();
          const targetId = target.dataset.target || target.dataset.cid;
          if (targetId) {
            scrollToCategory(targetId, target);
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
        case "toggle-leve-junto":
          e.stopPropagation();
          toggleLeveJunto(id);
          break;
        case "clear-cart":
          e.preventDefault();
          if (!cart.length) return;
          if (confirm("Deseja remover todos os itens do carrinho?")) {
            clearCart();
          }
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
  function initFAQ() {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (item.open) {
          faqItems.forEach(function (other) {
            if (other !== item && other.open) {
              other.open = false;
            }
          });
        }
      });
    });
  }

  function init() {
    renderMeta();
    renderMenu();
    setupEventListeners();
    initScrollSpy();
    initRepeat();
    initDeepLink();
    initFAQ();
    setInterval(renderMeta, 60000);
    Security.enforceExternalLinks(document.body);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
