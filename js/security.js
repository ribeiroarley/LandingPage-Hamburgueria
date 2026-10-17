/**
 * NA BRASA BURGER — Módulo de Segurança Front-end (Hardening)
 * Funções puras para sanitização XSS, validações de inputs e integridade de links externos.
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Security = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /**
   * Converte caracteres especiais em entidades HTML seguras.
   * @param {any} input
   * @returns {string}
   */
  function escapeHTML(input) {
    if (input === null || input === undefined) return "";
    const str = String(input);
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
      "`": "&#x60;",
      "=": "&#x3D;"
    };
    return str.replace(/[&<>"'`=/]/g, function (match) {
      return map[match];
    });
  }

  /**
   * Sanitiza strings de entrada de texto puro removendo tags HTML,
   * controles invisíveis e normalizando espaços.
   * @param {any} input
   * @returns {string}
   */
  function sanitizeText(input) {
    if (typeof input !== "string") return "";
    return input
      .replace(/<[^>]*>?/gm, "") // Remove qualquer tag HTML/XML
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove caracteres de controle ASCII
      .trim();
  }

  /**
   * Garante que links externos em um elemento tenham target="_blank" e rel="noopener noreferrer".
   * Previne ataques de Tabnabbing reverso (window.opener hijacking).
   * @param {HTMLElement|Document} container
   */
  function enforceExternalLinks(container) {
    const scope = container || document;
    const links = scope.querySelectorAll("a[href]");
    links.forEach(function (link) {
      const href = link.getAttribute("href") || "";
      const isExternal =
        /^(https?:|\/\/)/i.test(href) &&
        !href.startsWith(window.location.origin);

      if (isExternal) {
        link.setAttribute("target", "_blank");
        const existingRel = (link.getAttribute("rel") || "").split(/\s+/).filter(Boolean);
        const requiredRels = ["noopener", "noreferrer"];
        requiredRels.forEach(function (r) {
          if (!existingRel.includes(r)) {
            existingRel.push(r);
          }
        });
        link.setAttribute("rel", existingRel.join(" "));
      }
    });
  }

  /**
   * Valida e abre URLs externas de maneira estritamente segura,
   * rejeitando esquemas perigosos como javascript: ou data:.
   * @param {string} url
   * @returns {boolean} true se abriu com sucesso
   */
  function safeOpenUrl(url) {
    if (!url || typeof url !== "string") return false;
    const sanitized = url.trim();

    // Permite apenas protocolos HTTP, HTTPS e links direct wa.me / maps
    const isSafeProtocol = /^(https?:\/\/|whatsapp:\/\/)/i.test(sanitized);
    if (!isSafeProtocol) {
      console.warn("[Security] Tentativa de navegação para URL não permitida:", sanitized);
      return false;
    }

    const newWin = window.open(sanitized, "_blank", "noopener,noreferrer");
    if (newWin) {
      newWin.opener = null;
      return true;
    }
    return false;
  }

  /**
   * Validação de nome (mínimo 2 caracteres, apenas letras e espaços razoáveis)
   * @param {string} name
   * @returns {boolean}
   */
  function validateName(name) {
    const clean = sanitizeText(name);
    return clean.length >= 2 && clean.length <= 80;
  }

  /**
   * Validação de telefone (apenas números, DDD + 8 ou 9 dígitos)
   * @param {string} phone
   * @returns {boolean}
   */
  function validatePhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13;
  }

  /**
   * Validação de dados de endereço de entrega
   * @param {object} end
   * @returns {boolean}
   */
  function validateAddress(end) {
    if (!end || typeof end !== "object") return false;
    const rua = sanitizeText(end.rua);
    const num = sanitizeText(end.num);
    const bairro = sanitizeText(end.bairro);
    return rua.length >= 2 && num.length >= 1 && bairro.length >= 2;
  }

  /**
   * Validação de código de cupom
   * @param {string} code
   * @returns {string} Código limpo e em caixa alta
   */
  function sanitizeCoupon(code) {
    return sanitizeText(code).replace(/[^A-Za-z0-9_-]/g, "").toUpperCase();
  }

  return Object.freeze({
    escapeHTML: escapeHTML,
    sanitizeText: sanitizeText,
    enforceExternalLinks: enforceExternalLinks,
    safeOpenUrl: safeOpenUrl,
    validateName: validateName,
    validatePhone: validatePhone,
    validateAddress: validateAddress,
    sanitizeCoupon: sanitizeCoupon
  });
});
