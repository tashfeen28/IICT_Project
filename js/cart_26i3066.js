/* ==========================================================================
   The Coffee Circle — Shopping Cart State, Persistence & Cart Page UI
   Persisted in localStorage under 'coffeeCircleCart'
   ========================================================================== */

(function () {
  'use strict';

  var CART_STORAGE_KEY       = 'coffeeCircleCart';
  var CART_KEY_CAPPUCCINO    = 'coffee_circle_cart';
  var CART_KEY_LATTE         = 'cc_cart';
  var ALL_CART_KEYS          = [CART_STORAGE_KEY, CART_KEY_CAPPUCCINO, CART_KEY_LATTE];
  var PROMO_STORAGE_KEY = 'coffeeCirclePromo';

  /* -------------------------------------------------------------------------
     cc_cart (i263069) stores only { id, size, addons:[], qty } — no name or
     price.  To avoid loading products_i263069.js (which declares conflicting
     globals like getCart, renderCartPage, updateCartBadge, etc.) we keep a
     small read-only lookup of every product in that catalog.
     Prices are the base prices from products_i263069.js (const PRODUCTS array).
     Size deltas: standard Small→0, Medium→+60, Large→+120
                  shot   Single→0, Double→+100
                  single Regular→0
                  premium Medium→0, Large→+100
     Add-on prices: extra-shot→80, oat-milk→60, extra-syrup→40, whipped-cream→50
  --------------------------------------------------------------------------- */
  var CC_CART_PRODUCTS = {
    'cap-classic':    { name: 'Classic Cappuccino',       base: 350, type: 'standard' },
    'cap-vanilla':    { name: 'Vanilla Cappuccino',       base: 390, type: 'standard' },
    'cap-caramel':    { name: 'Caramel Cappuccino',       base: 400, type: 'standard' },
    'cap-hazelnut':   { name: 'Hazelnut Cappuccino',      base: 410, type: 'standard' },
    'cap-chocolate':  { name: 'Chocolate Cappuccino',     base: 420, type: 'standard' },
    'cap-iced':       { name: 'Iced Cappuccino',          base: 430, type: 'standard' },
    'cap-cinnamon':   { name: 'Cinnamon Cappuccino',      base: 390, type: 'standard' },
    'cap-almond':     { name: 'Almond Cappuccino',        base: 440, type: 'standard' },
    'esp-classic':    { name: 'Classic Espresso',         base: 250, type: 'shot'     },
    'esp-double':     { name: 'Double Espresso',          base: 350, type: 'single'   },
    'esp-ristretto':  { name: 'Ristretto',                base: 300, type: 'single'   },
    'esp-americano':  { name: 'Americano',                base: 320, type: 'standard' },
    'esp-macchiato':  { name: 'Macchiato',                base: 340, type: 'single'   },
    'esp-panna':      { name: 'Espresso Con Panna',       base: 400, type: 'single'   },
    'lat-classic':    { name: 'Classic Latte',            base: 380, type: 'standard' },
    'lat-vanilla':    { name: 'Vanilla Latte',            base: 420, type: 'standard' },
    'lat-caramel':    { name: 'Caramel Latte',            base: 430, type: 'standard' },
    'lat-hazelnut':   { name: 'Hazelnut Latte',           base: 440, type: 'standard' },
    'lat-spanish':    { name: 'Spanish Latte',            base: 480, type: 'standard' },
    'lat-iced':       { name: 'Iced Latte',               base: 450, type: 'standard' },
    'lat-mocha':      { name: 'Mocha Latte',              base: 500, type: 'standard' },
    'lat-cinnamon':   { name: 'Cinnamon Latte',           base: 420, type: 'standard' },
    'cold-americano': { name: 'Iced Americano',           base: 400, type: 'standard' },
    'cold-latte':     { name: 'Iced Latte',               base: 450, type: 'standard' },
    'cold-mocha':     { name: 'Iced Mocha',               base: 520, type: 'standard' },
    'cold-brew':      { name: 'Cold Brew',                base: 480, type: 'standard' },
    'frappe-caramel': { name: 'Caramel Frappe',           base: 580, type: 'standard' },
    'frappe-chocolate':{ name:'Chocolate Frappe',         base: 580, type: 'standard' },
    'frappe-vanilla': { name: 'Vanilla Frappe',           base: 560, type: 'standard' },
    'cold-spanish':   { name: 'Iced Spanish Latte',       base: 550, type: 'standard' },
    'sig-special':    { name: 'Circle Special Mocha',     base: 650, type: 'premium'  },
    'sig-golden':     { name: 'Golden Caramel Brew',      base: 620, type: 'premium'  },
    'sig-midnight':   { name: 'Midnight Chocolate',       base: 680, type: 'premium'  },
    'sig-royal':      { name: 'Royal Hazelnut Coffee',    base: 650, type: 'premium'  },
    'sig-dream':      { name: 'Cinnamon Dream',           base: 600, type: 'premium'  },
    'sig-brown':      { name: 'Brown Sugar Latte',        base: 560, type: 'premium'  }
  };
  var CC_CART_SIZE_DELTA = {
    standard: { 'Small': 0, 'Medium': 60, 'Large': 120 },
    shot:     { 'Single': 0, 'Double': 100 },
    single:   { 'Regular': 0 },
    premium:  { 'Medium': 0, 'Large': 100 }
  };
  var CC_CART_ADDON_PRICES = {
    'extra-shot': 80, 'oat-milk': 60, 'extra-syrup': 40, 'whipped-cream': 50
  };

  /**
   * Resolve display name and unit price from a raw cc_cart item.
   * cc_cart stores { id, size, addons:[], qty }; prices come from our lookup.
   */
  function resolveCcCartItem(raw) {
    var meta = CC_CART_PRODUCTS[raw.id];
    var baseName = meta ? meta.name : String(raw.id || 'Coffee Drink');
    if (raw.free === true) {
      return { name: baseName + ' (Free Reward)', unitPrice: 0 };
    }
    if (!meta) {
      return { name: baseName, unitPrice: 0 };
    }
    var sizeDeltas = CC_CART_SIZE_DELTA[meta.type] || {};
    var delta = Number(sizeDeltas[raw.size] || 0);
    var addonsTotal = Array.isArray(raw.addons)
      ? raw.addons.reduce(function (sum, addonId) {
          return sum + (CC_CART_ADDON_PRICES[addonId] || 0);
        }, 0)
      : 0;
    return {
      name: meta.name,
      unitPrice: meta.base + delta + addonsTotal
    };
  }
  var PROMO_CODES = {
    COFFEE10: { code: 'COFFEE10', rate: 0.1, label: '10% Off' }
  };
  var TAX_RATE = 0.05;
  var LOYALTY_POINTS_PER_100 = 10;

  var activePromoCode = loadSavedPromo();
  var promoStatusMessage = '';
  var promoStatusType = '';
  var pendingOrderId = '';
  var checkoutTriggerBtn = null;

  /**
   * Load saved promo code from sessionStorage if valid.
   */
  function loadSavedPromo() {
    try {
      var saved = window.sessionStorage.getItem(PROMO_STORAGE_KEY);
      if (saved && PROMO_CODES[saved]) return saved;
    } catch (err) {
      // Ignore storage errors.
    }
    return '';
  }

  /**
   * Persist or clear active promo code in sessionStorage.
   */
  function savePromoCode(code) {
    activePromoCode = code || '';
    try {
      if (activePromoCode) {
        window.sessionStorage.setItem(PROMO_STORAGE_KEY, activePromoCode);
      } else {
        window.sessionStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch (err) {
      // Ignore storage errors.
    }
  }

  /**
   * Escape HTML special characters for safe template rendering.
   */
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Format price in Pakistani Rupees (PKR).
   */
  function formatPKR(amount) {
    return 'PKR ' + Math.round(Number(amount || 0)).toLocaleString('en-US');
  }

  /**
   * Read items from ONE localStorage key safely.  Returns [] on any error.
   */
  function readKey(key) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Write items array back to ONE localStorage key.
   */
  function writeKey(key, items) {
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch (err) {
      // Ignore storage quota or private-browsing errors.
    }
  }

  /**
   * Read cart items from ALL three keys.
   * Each returned item carries _srcKey and _srcIndex so mutations write back
   * ONLY to that item's source key without touching the other keys or fields.
   */
  function readCartStorage() {
    var all = [];

    /* ── coffeeCircleCart ───────────────────────────────────────────────── */
    readKey(CART_STORAGE_KEY).forEach(function (item, rawIdx) {
      if (!item || !item.id) return;
      var clone = Object.assign({}, item);
      clone._srcKey = CART_STORAGE_KEY;
      clone._srcIndex = rawIdx;
      all.push(clone);
    });

    /* ── coffee_circle_cart (26i-3272 / i263070 pages) ──────────────────── */
    readKey(CART_KEY_CAPPUCCINO).forEach(function (item, rawIdx) {
      if (!item || !item.id) return;
      var clone = Object.assign({}, item);
      clone._srcKey = CART_KEY_CAPPUCCINO;
      clone._srcIndex = rawIdx;
      all.push(clone);
    });

    /* ── cc_cart (i263069 — latte/espresso/etc.) ────────────────────────── */
    readKey(CART_KEY_LATTE).forEach(function (raw, rawIdx) {
      if (!raw || !raw.id) return;
      var resolved = resolveCcCartItem(raw);
      var sizeLabel = String(raw.size || '');
      var addonList = Array.isArray(raw.addons)
        ? raw.addons.map(function (addonId) {
            return {
              id: String(addonId),
              label: String(addonId),
              price: raw.free === true ? 0 : Number(CC_CART_ADDON_PRICES[addonId] || 0)
            };
          })
        : [];
      all.push({
        _srcKey   : CART_KEY_LATTE,
        _srcIndex : rawIdx,
        _ccKey    : String(raw.key || ''),
        id        : String(raw.id),
        name      : resolved.name,
        category  : '',
        image     : '',
        basePrice : resolved.unitPrice,
        size      : sizeLabel,
        sizeDelta : 0,
        extras    : addonList,
        unitPrice : resolved.unitPrice,
        price     : resolved.unitPrice,
        free      : raw.free === true,
        quantity  : Number(raw.qty) >= 1 ? Math.floor(Number(raw.qty)) : 1
      });
    });

    return all;
  }

  /**
   * Broadcast cart:updated and refresh the navigation badge.
   */
  function notifyCartUpdated(items, detail) {
    if (typeof window.updateCartBadge === 'function') {
      window.updateCartBadge();
    }

    var payload = {
      items: items.slice(),
      count: countItems(items),
      subtotal: sumItems(items),
      detail: detail || null
    };

    window.dispatchEvent(new CustomEvent('cart:updated', { detail: payload }));
  }

  /**
   * Surgically update or remove a single item in its own SOURCE localStorage key.
   * Leaves the other keys and all unrelated fields on the item untouched.
   */
  function mutateSourceKeyItem(targetItem, nextQuantity) {
    if (!targetItem || !targetItem._srcKey) return readCartStorage();

    var srcKey = targetItem._srcKey;
    var rawList = readKey(srcKey);
    var sIdx = typeof targetItem._srcIndex === 'number' ? targetItem._srcIndex : -1;

    if (sIdx < 0 || sIdx >= rawList.length || !rawList[sIdx]) {
      return readCartStorage();
    }

    var shouldRemove = nextQuantity == null || !Number.isFinite(nextQuantity) || nextQuantity <= 0;
    var detail = null;

    if (shouldRemove) {
      detail = rawList.splice(sIdx, 1)[0];
    } else {
      var entry = rawList[sIdx];
      var cleanQty = Math.floor(nextQuantity);
      if (srcKey === CART_STORAGE_KEY) {
        entry.quantity = cleanQty;
      } else {
        // Teammate keys (coffee_circle_cart & cc_cart) use qty
        if ('qty' in entry || srcKey !== CART_STORAGE_KEY) {
          entry.qty = cleanQty;
        }
        if ('quantity' in entry) {
          entry.quantity = cleanQty;
        }
      }
      detail = entry;
    }

    writeKey(srcKey, rawList);

    var updated = readCartStorage();
    notifyCartUpdated(updated, detail);
    return updated;
  }

  /**
   * Build a canonical comparison key from an item's id, size, and sorted extras.
   */
  function buildItemSignature(item) {
    var id = String((item && item.id) || '').trim();
    var size = String((item && item.size) || 'Small').trim();
    var extras = Array.isArray(item && item.extras) ? item.extras : [];
    var extrasKey = extras
      .map(function (extra) {
        if (extra && typeof extra === 'object') {
          return String(extra.id || extra.label || '').trim();
        }
        return String(extra || '').trim();
      })
      .filter(Boolean)
      .sort()
      .join(',');

    return id + '__' + size + '__' + extrasKey;
  }

  /**
   * Normalize a cart item object before saving or rendering.
   */
  function normalizeCartItem(item) {
    var rawExtras = Array.isArray(item && item.extras)
      ? item.extras
      : Array.isArray(item && item.addons)
        ? item.addons
        : [];
    var extras = rawExtras.map(function (extra) {
      if (extra && typeof extra === 'object') {
        return {
          id: String(extra.id || extra.label || '').trim(),
          label: String(extra.label || extra.id || '').trim(),
          price: Number(extra.price || 0)
        };
      }
      return { id: String(extra), label: String(extra), price: 0 };
    });

    var unitPrice = Number(
      item && item.unitPrice != null
        ? item.unitPrice
        : item && item.price != null
          ? item.price
          : item && item.basePrice != null
            ? item.basePrice
            : 0
    );

    var qty = Number(item && (item.quantity != null ? item.quantity : item.qty));
    if (!Number.isFinite(qty) || qty < 1) qty = 1;

    var size = item && item.size != null ? String(item.size) : '';

    return {
      id: String((item && item.id) || ''),
      name: String((item && item.name) || 'Coffee Drink'),
      category: String((item && item.category) || ''),
      image: String((item && item.image) || ''),
      basePrice: Number((item && item.basePrice) || unitPrice),
      size: size,
      sizeDelta: Number((item && item.sizeDelta) || 0),
      extras: extras,
      unitPrice: unitPrice,
      price: unitPrice,
      quantity: Math.floor(qty),
      cartKey: buildItemSignature({ id: item && item.id, size: size || 'Small', extras: extras })
    };
  }

  function countItems(items) {
    return items.reduce(function (total, item) {
      var qty = Number(item && (item.quantity || item.qty || 1));
      return total + (qty > 0 ? qty : 1);
    }, 0);
  }

  function sumItems(items) {
    return items.reduce(function (total, item) {
      var unit = Number(item && (item.unitPrice != null ? item.unitPrice : item.price || item.basePrice || 0));
      var qty = Number(item && (item.quantity || item.qty || 1));
      return total + unit * (qty > 0 ? qty : 1);
    }, 0);
  }

  /**
   * Resolve target item index by numeric index, cartKey, or item id.
   */
  function resolveItemIndex(items, indexOrKey) {
    if (typeof indexOrKey === 'number' && indexOrKey >= 0 && indexOrKey < items.length) {
      return indexOrKey;
    }

    if (typeof indexOrKey === 'string' && /^\d+$/.test(indexOrKey)) {
      var parsedIdx = Number(indexOrKey);
      if (parsedIdx >= 0 && parsedIdx < items.length) return parsedIdx;
    }

    var target = String(indexOrKey || '');
    for (var i = 0; i < items.length; i += 1) {
      var sig = items[i].cartKey || buildItemSignature(items[i]);
      if (sig === target || items[i].id === target) {
        return i;
      }
    }
    return -1;
  }

  var Cart = {
    STORAGE_KEY: CART_STORAGE_KEY,

    getItems: function () {
      return readCartStorage();
    },

    getCount: function () {
      return countItems(readCartStorage());
    },

    getSubtotal: function () {
      return sumItems(readCartStorage());
    },

    addItem: function (item) {
      if (!item || !item.id) return this.getItems();

      /* addItem always writes to our own key (coffeeCircleCart) */
      var items = readKey(CART_STORAGE_KEY);
      var normalized = normalizeCartItem(item);
      normalized._srcKey = CART_STORAGE_KEY;
      var signature = normalized.cartKey;

      var existingIndex = -1;
      for (var i = 0; i < items.length; i += 1) {
        if (buildItemSignature(items[i]) === signature) {
          existingIndex = i;
          break;
        }
      }

      if (existingIndex !== -1) {
        var currentQty = Number(items[existingIndex].quantity || 1);
        items[existingIndex].quantity = currentQty + normalized.quantity;
        items[existingIndex].cartKey = signature;
      } else {
        items.push(normalized);
      }

      writeKey(CART_STORAGE_KEY, items.map(function (it) {
        var out = {};
        Object.keys(it).forEach(function (k) { if (k !== '_srcKey' && k !== '_srcIndex' && k !== '_ccKey') out[k] = it[k]; });
        return out;
      }));

      var updated = readCartStorage();
      notifyCartUpdated(updated, normalized);
      return updated;
    },

    updateQuantity: function (indexOrKey, quantity) {
      var items = readCartStorage();
      var idx = resolveItemIndex(items, indexOrKey);
      if (idx === -1) return items;

      return mutateSourceKeyItem(items[idx], Number(quantity));
    },

    removeItem: function (indexOrKey) {
      var items = readCartStorage();
      var idx = resolveItemIndex(items, indexOrKey);
      if (idx === -1) return items;

      return mutateSourceKeyItem(items[idx], null);
    },

    clearCart: function () {
      ALL_CART_KEYS.forEach(function (k) {
        if (window.localStorage.getItem(k) !== null) {
          writeKey(k, []);
        }
      });
      var empty = readCartStorage();
      notifyCartUpdated(empty, null);
      return empty;
    }
  };

  window.Cart = Cart;

  /* ------------------------------------------------------------------------
     Cart Page Rendering & Interactivity
     ------------------------------------------------------------------------ */

  var DRINK_PALETTES = {
    'iced-caramel-macchiato': {
      coffeeBottom: '#432110',
      coffeeMid: '#8A4E28',
      foamTop: '#F3E3CE',
      drizzle: '#C68B59',
      straw: '#C69C6D',
      strawStripe: '#FAF6F0',
      hasDrizzle: true
    },
    'cold-brew-classic': {
      coffeeBottom: '#261209',
      coffeeMid: '#3E2012',
      foamTop: '#7B4E33',
      drizzle: '#5A341E',
      straw: '#3B2418',
      strawStripe: '#C69C6D',
      hasDrizzle: false
    },
    'mocha-frappe': {
      coffeeBottom: '#331A10',
      coffeeMid: '#6E3F27',
      foamTop: '#EFE0CE',
      drizzle: '#4A2511',
      straw: '#5C3D2E',
      strawStripe: '#F5ECE0',
      hasDrizzle: true
    },
    'vanilla-sweet-cream-cold-brew': {
      coffeeBottom: '#2B150B',
      coffeeMid: '#74482D',
      foamTop: '#FFF6E6',
      drizzle: '#EAD5B8',
      straw: '#C68B59',
      strawStripe: '#FFFFFF',
      hasDrizzle: true
    },
    'iced-spanish-latte': {
      coffeeBottom: '#4A2513',
      coffeeMid: '#B98354',
      foamTop: '#F7EAD7',
      drizzle: '#D8AC82',
      straw: '#A66E3E',
      strawStripe: '#FAF6F0',
      hasDrizzle: false
    },
    'hazelnut-iced-americano': {
      coffeeBottom: '#361B0E',
      coffeeMid: '#6C3D22',
      foamTop: '#C9966B',
      drizzle: '#8C5633',
      straw: '#4A2E20',
      strawStripe: '#E2B891',
      hasDrizzle: false
    }
  };

  /**
   * Look up catalog product details if products_26i3066.js is loaded.
   */
  function findCatalogProduct(itemId) {
    var list = Array.isArray(window.products) ? window.products : [];
    for (var i = 0; i < list.length; i += 1) {
      if (list[i] && list[i].id === itemId) return list[i];
    }
    return null;
  }

  /**
   * Build an inline SVG cup illustration for a cart item.
   */
  function buildCartItemSvg(item, index) {
    var palette = DRINK_PALETTES[item.id] || DRINK_PALETTES['cold-brew-classic'];
    var clipId = 'cart-glass-clip-' + index + '-' + String(item.id || 'drink').replace(/[^a-zA-Z0-9_-]/g, '');

    var drizzleMarkup = palette.hasDrizzle
      ? '<path d="M62 84 Q78 96 92 86 T120 88 T138 82" fill="none" stroke="' +
        palette.drizzle +
        '" stroke-width="3.2" stroke-linecap="round" opacity="0.85" />' +
        '<path d="M74 102 Q88 122 86 144" fill="none" stroke="' +
        palette.drizzle +
        '" stroke-width="2.6" stroke-linecap="round" opacity="0.55" />'
      : '';

    return (
      '<svg viewBox="0 0 200 220" width="94" height="104" role="img" aria-label="' +
      escapeHtml(item.name || 'Coffee Drink') +
      ' illustration">' +
      '  <defs>' +
      '    <clipPath id="' + clipId + '">' +
      '      <path d="M58 58 L69 178 Q70 188 81 188 L119 188 Q130 188 131 178 L142 58 Z" />' +
      '    </clipPath>' +
      '  </defs>' +
      '  <circle cx="100" cy="114" r="76" fill="#F5ECE0" />' +
      '  <line x1="127" y1="20" x2="112" y2="74" stroke="' + palette.straw + '" stroke-width="7" stroke-linecap="round" />' +
      '  <line x1="127" y1="20" x2="112" y2="74" stroke="' + palette.strawStripe + '" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="5 6" opacity="0.7" />' +
      '  <g clip-path="url(#' + clipId + ')">' +
      '    <rect x="54" y="56" width="92" height="136" fill="' + palette.coffeeBottom + '" />' +
      '    <path d="M54 96 Q78 88 102 96 T146 92 L146 140 Q120 148 96 138 T54 142 Z" fill="' + palette.coffeeMid + '" opacity="0.88" />' +
      '    <path d="M54 56 L146 56 L146 94 Q124 102 100 94 T54 96 Z" fill="' + palette.foamTop + '" />' +
      '    <line x1="114" y1="64" x2="102" y2="152" stroke="' + palette.straw + '" stroke-width="6.5" stroke-linecap="round" opacity="0.38" />' +
      drizzleMarkup +
      '    <rect x="72" y="76" width="21" height="19" rx="5" ry="5" fill="rgba(255, 255, 255, 0.30)" stroke="rgba(255, 255, 255, 0.55)" stroke-width="1.5" transform="rotate(-14 82 85)" />' +
      '    <rect x="104" y="80" width="22" height="20" rx="5" ry="5" fill="rgba(255, 255, 255, 0.28)" stroke="rgba(255, 255, 255, 0.52)" stroke-width="1.5" transform="rotate(16 115 90)" />' +
      '    <path d="M65 66 L74 176" stroke="rgba(255, 255, 255, 0.25)" stroke-width="3.5" stroke-linecap="round" />' +
      '  </g>' +
      '  <path d="M58 58 L69 178 Q70 188 81 188 L119 188 Q130 188 131 178 L142 58" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />' +
      '  <ellipse cx="100" cy="58" rx="42" ry="5.5" fill="none" stroke="#FFFFFF" stroke-width="4" />' +
      '</svg>'
    );
  }

  /**
   * Compute order totals, promo discount, 5% tax, and loyalty points (10 pts / PKR 100).
   */
  function calculateOrderTotals(items) {
    var subtotal = sumItems(items);
    var promo = activePromoCode && PROMO_CODES[activePromoCode] ? PROMO_CODES[activePromoCode] : null;
    var discount = promo && subtotal > 0 ? Math.round(subtotal * promo.rate) : 0;
    var discountedSubtotal = Math.max(0, subtotal - discount);
    var tax = subtotal > 0 ? Math.round(discountedSubtotal * TAX_RATE) : 0;
    var grandTotal = discountedSubtotal + tax;
    var loyaltyPoints = Math.floor(grandTotal / 100) * LOYALTY_POINTS_PER_100;

    return {
      itemCount: countItems(items),
      subtotal: subtotal,
      promo: promo,
      discount: discount,
      tax: tax,
      grandTotal: grandTotal,
      loyaltyPoints: loyaltyPoints
    };
  }

  /**
   * Generate a unique order reference ID.
   */
  function generateOrderId() {
    var randomDigits = Math.floor(100000 + Math.random() * 900000);
    return 'TCC-' + randomDigits;
  }

  /**
   * Render the left column (#cart-items-container).
   */
  function renderCartItems(items) {
    var container = document.getElementById('cart-items-container');
    if (!container) return;

    if (!items.length) {
      container.innerHTML =
        '<div class="empty-cart-card">' +
        '  <div class="empty-cart-icon" aria-hidden="true">' +
        '    <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="#3B2418" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '      <path d="M6 7h12l1 13H5L6 7z" />' +
        '      <path d="M9 7V5a3 3 0 0 1 6 0v2" />' +
        '    </svg>' +
        '  </div>' +
        '  <h2>Your Cart Is Empty</h2>' +
        '  <p>Looks like you haven\'t added any handcrafted drinks yet. Explore our cold coffee collection to start your order.</p>' +
        '  <div class="empty-cart-actions">' +
        '    <a href="cold-coffee.html" class="btn btn-primary">Browse Cold Coffee</a>' +
        '    <a href="../index.html" class="btn btn-outline">Back to Home</a>' +
        '  </div>' +
        '</div>';
      return;
    }

    var totalQty = countItems(items);
    var cardsHtml = items
      .map(function (rawItem, index) {
        var normalized = normalizeCartItem(rawItem);
        var catalogMatch = findCatalogProduct(normalized.id);
        var isFree = Boolean(rawItem && (rawItem.free || rawItem.isReward));
        var drinkName = normalized.name || (catalogMatch && catalogMatch.name) || 'Coffee Drink';
        var unitPrice = isFree
          ? 0
          : (normalized.unitPrice > 0
              ? normalized.unitPrice
              : (catalogMatch && catalogMatch.basePrice) || 0);
        var qty = normalized.quantity;
        var lineTotal = unitPrice * qty;

        var sizeMetaMarkup = normalized.size
          ? '    <div class="cart-item-meta">' +
            '      <span class="cart-meta-pill">Size: ' + escapeHtml(normalized.size) + '</span>' +
            '    </div>'
          : '';

        var extrasMarkup = normalized.extras.length
          ? normalized.extras
              .map(function (extra) {
                var priceNote = extra.price > 0 ? ' (+' + formatPKR(extra.price) + ')' : '';
                return '<span class="cart-extra-tag">' + escapeHtml(extra.label + priceNote) + '</span>';
              })
              .join('')
          : '<span class="text-muted">No add-on extras</span>';

        return (
          '<article class="cart-item-card" data-item-index="' + index + '">' +
          '  <div class="cart-item-media">' +
          buildCartItemSvg({ id: normalized.id, name: drinkName }, index) +
          '  </div>' +
          '  <div class="cart-item-details">' +
          '    <div class="cart-item-top">' +
          '      <h2 class="cart-item-title">' + escapeHtml(drinkName) + '</h2>' +
          '      <span class="cart-item-line-total">' + escapeHtml(formatPKR(lineTotal)) + '</span>' +
          '    </div>' +
          sizeMetaMarkup +
          '    <div class="cart-item-extras">' +
          '      <span>Extras:</span> ' +
          extrasMarkup +
          '    </div>' +
          '    <div class="cart-item-bottom">' +
          '      <span class="cart-unit-price">Unit Price: ' + escapeHtml(formatPKR(unitPrice)) + '</span>' +
          '      <div class="cart-item-controls">' +
          '        <div class="qty-control" role="group" aria-label="Quantity for ' + escapeHtml(drinkName) + '">' +
          '          <button type="button" class="qty-btn" data-action="decrease-qty" data-index="' + index + '" aria-label="Decrease quantity of ' + escapeHtml(drinkName) + '">&minus;</button>' +
          '          <span class="qty-value" aria-live="polite">' + qty + '</span>' +
          '          <button type="button" class="qty-btn" data-action="increase-qty" data-index="' + index + '" aria-label="Increase quantity of ' + escapeHtml(drinkName) + '">+</button>' +
          '        </div>' +
          '        <button type="button" class="btn-remove" data-action="remove-item" data-index="' + index + '">Remove</button>' +
          '      </div>' +
          '    </div>' +
          '  </div>' +
          '</article>'
        );
      })
      .join('');

    container.innerHTML =
      '<div class="cart-items-header">' +
      '  <h2 class="cart-items-heading">Selected Drinks</h2>' +
      '  <span class="cart-items-count-note">' + totalQty + (totalQty === 1 ? ' drink' : ' drinks') + ' in bag</span>' +
      '</div>' +
      '<div class="cart-items-list">' +
      cardsHtml +
      '</div>';
  }

  /**
   * Render the right column (#cart-summary).
   */
  function renderCartSummary(items) {
    var summaryHost = document.getElementById('cart-summary');
    if (!summaryHost) return;

    var totals = calculateOrderTotals(items);
    var isEmpty = items.length === 0;

    var discountRowHtml = totals.promo && totals.discount > 0
      ? '<div class="summary-row summary-row--discount">' +
        '  <span class="summary-row-label">Discount (' + escapeHtml(totals.promo.code) + ' &middot; 10% Off)</span>' +
        '  <span class="summary-row-value">&minus;' + escapeHtml(formatPKR(totals.discount)) + '</span>' +
        '</div>'
      : '';

    var appliedPromoHtml = totals.promo
      ? '<div class="promo-applied-tag">' +
        '  <span>Code <strong>' + escapeHtml(totals.promo.code) + '</strong> applied (10% off)</span>' +
        '  <button type="button" class="promo-clear-btn" data-action="remove-promo" aria-label="Remove promo code">&times;</button>' +
        '</div>'
      : '';

    var feedbackClass = promoStatusType ? ' is-' + promoStatusType : ' is-info';
    var feedbackHtml = promoStatusMessage
      ? '<p class="promo-feedback' + feedbackClass + '" id="promo-feedback">' + escapeHtml(promoStatusMessage) + '</p>'
      : '<p class="promo-feedback is-info" id="promo-feedback">Use code <strong>COFFEE10</strong> for 10% off your order.</p>';

    summaryHost.innerHTML =
      '<div class="cart-summary-card">' +
      '  <h2 class="cart-summary-title">Order Summary</h2>' +
      '  <div class="summary-rows">' +
      '    <div class="summary-row">' +
      '      <span class="summary-row-label">Subtotal (' + totals.itemCount + (totals.itemCount === 1 ? ' item' : ' items') + ')</span>' +
      '      <span class="summary-row-value" id="summary-subtotal">' + escapeHtml(formatPKR(totals.subtotal)) + '</span>' +
      '    </div>' +
      discountRowHtml +
      '    <div class="summary-row">' +
      '      <span class="summary-row-label">Tax (5%)</span>' +
      '      <span class="summary-row-value" id="summary-tax">' + escapeHtml(formatPKR(totals.tax)) + '</span>' +
      '    </div>' +
      '  </div>' +
      '  <div class="summary-loyalty-box">' +
      '    <div>' +
      '      <div class="summary-loyalty-title">Loyalty Points Earned</div>' +
      '      <div class="summary-loyalty-sub">10 pts per PKR 100 spent</div>' +
      '    </div>' +
      '    <span class="summary-loyalty-points" id="summary-loyalty-points">+' + totals.loyaltyPoints + ' pts</span>' +
      '  </div>' +
      '  <form class="promo-section" id="promo-form" novalidate>' +
      '    <label class="promo-label" for="promo-code-input">Promo Code</label>' +
      '    <div class="promo-input-group">' +
      '      <input type="text" id="promo-code-input" class="form-control" placeholder="Enter COFFEE10" value="' + escapeHtml(activePromoCode) + '" autocomplete="off">' +
      '      <button type="submit" class="btn btn-ghost btn-sm" id="apply-promo-btn">Apply</button>' +
      '    </div>' +
      appliedPromoHtml +
      feedbackHtml +
      '  </form>' +
      '  <div class="summary-total-row">' +
      '    <span class="summary-total-label">Grand Total</span>' +
      '    <span class="summary-total-value" id="summary-grand-total">' + escapeHtml(formatPKR(totals.grandTotal)) + '</span>' +
      '  </div>' +
      '  <button type="button" class="btn btn-primary btn-lg btn-block" id="checkout-btn" data-action="open-checkout"' + (isEmpty ? ' disabled' : '') + '>Proceed to Checkout</button>' +
      '  <p class="summary-secure-note">Freshly crafted to order &bull; Pick up at the espresso bar</p>' +
      '</div>';
  }

  /**
   * Ensure the singleton checkout confirmation modal exists in the DOM.
   */
  function ensureCheckoutModal() {
    var existing = document.getElementById('checkout-modal');
    if (existing) return existing;

    var modal = document.createElement('div');
    modal.id = 'checkout-modal';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'checkout-modal-title');

    modal.innerHTML =
      '<div class="modal-dialog">' +
      '  <div class="modal-header">' +
      '    <h2 class="modal-title" id="checkout-modal-title">Confirm Your Order</h2>' +
      '    <button type="button" class="modal-close" data-action="close-checkout-modal" aria-label="Close checkout confirmation">&times;</button>' +
      '  </div>' +
      '  <div class="modal-body" id="checkout-modal-body"></div>' +
      '  <div class="modal-footer" id="checkout-modal-footer"></div>' +
      '</div>';

    document.body.appendChild(modal);

    modal.addEventListener('click', function (event) {
      if (
        event.target === modal ||
        event.target.closest('[data-action="close-checkout-modal"]')
      ) {
        closeCheckoutModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        closeCheckoutModal();
      }
    });

    return modal;
  }

  /**
   * Close the checkout confirmation modal and restore focus.
   */
  function closeCheckoutModal() {
    var modal = document.getElementById('checkout-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (checkoutTriggerBtn && typeof checkoutTriggerBtn.focus === 'function') {
      checkoutTriggerBtn.focus();
      checkoutTriggerBtn = null;
    }
  }

  /**
   * Show the confirmation banner above the cart layout after order confirmation.
   */
  function showConfirmationBanner(orderId, totals) {
    var banner = document.getElementById('checkout-confirmation-banner');
    if (!banner) return;

    banner.innerHTML =
      '<div class="checkout-banner-content">' +
      '  <span class="checkout-banner-icon" aria-hidden="true">&#10003;</span>' +
      '  <div>' +
      '    <div class="checkout-banner-title">Order Confirmed &mdash; Thank You!</div>' +
      '    <div class="checkout-banner-meta">Order ID: <strong>' + escapeHtml(orderId) + '</strong> &bull; Total: <strong>' + escapeHtml(formatPKR(totals.grandTotal)) + '</strong> &bull; Earned <strong>+' + totals.loyaltyPoints + ' pts</strong></div>' +
      '  </div>' +
      '</div>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-action="dismiss-banner">Dismiss</button>';

    banner.hidden = false;

    var dismissBtn = banner.querySelector('[data-action="dismiss-banner"]');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        banner.hidden = true;
      });
    }
  }

  /**
   * Open the checkout confirmation modal with generated Order ID and summary.
   */
  function openCheckoutModal(triggerBtn) {
    var items = readCartStorage();
    if (!items.length) return;

    var totals = calculateOrderTotals(items);
    pendingOrderId = generateOrderId();
    checkoutTriggerBtn = triggerBtn || document.activeElement;

    var modal = ensureCheckoutModal();
    var titleEl = modal.querySelector('#checkout-modal-title');
    var bodyEl = modal.querySelector('#checkout-modal-body');
    var footerEl = modal.querySelector('#checkout-modal-footer');

    titleEl.textContent = 'Confirm Your Order';

    var discountLine = totals.promo && totals.discount > 0
      ? '<div class="checkout-summary-row" style="color: var(--color-success);">' +
        '  <span>Promo (' + escapeHtml(totals.promo.code) + ')</span>' +
        '  <span>&minus;' + escapeHtml(formatPKR(totals.discount)) + '</span>' +
        '</div>'
      : '';

    bodyEl.innerHTML =
      '<div class="checkout-order-id-box">' +
      '  <span class="checkout-order-id-label">Order ID</span>' +
      '  <span class="checkout-order-id-value" id="modal-order-id">' + escapeHtml(pendingOrderId) + '</span>' +
      '</div>' +
      '<p class="text-muted">Please review your order details below. Confirming will finalize your order and clear your cart.</p>' +
      '<div class="checkout-summary-list">' +
      '  <div class="checkout-summary-row"><span>Drinks</span><span>' + totals.itemCount + (totals.itemCount === 1 ? ' item' : ' items') + '</span></div>' +
      '  <div class="checkout-summary-row"><span>Subtotal</span><span>' + escapeHtml(formatPKR(totals.subtotal)) + '</span></div>' +
      discountLine +
      '  <div class="checkout-summary-row"><span>Tax (5%)</span><span>' + escapeHtml(formatPKR(totals.tax)) + '</span></div>' +
      '  <div class="checkout-summary-row"><span>Loyalty Points Earned</span><span>+' + totals.loyaltyPoints + ' pts</span></div>' +
      '  <div class="checkout-summary-row is-total"><span>Grand Total</span><span>' + escapeHtml(formatPKR(totals.grandTotal)) + '</span></div>' +
      '</div>';

    footerEl.innerHTML =
      '<button type="button" class="btn btn-outline btn-sm" data-action="close-checkout-modal">Cancel</button>' +
      '<button type="button" class="btn btn-primary" data-action="confirm-order">Confirm Order</button>';

    var confirmBtn = footerEl.querySelector('[data-action="confirm-order"]');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function () {
        var confirmedOrderId = pendingOrderId;
        var confirmedTotals = totals;

        Cart.clearCart();
        savePromoCode('');
        promoStatusMessage = '';
        promoStatusType = '';

        titleEl.textContent = 'Order Confirmed!';
        bodyEl.innerHTML =
          '<div class="checkout-success-state">' +
          '  <div class="checkout-success-badge" aria-hidden="true">&#10003;</div>' +
          '  <h3>Your drinks are being handcrafted</h3>' +
          '  <p>Show your Order ID at the barista counter. You earned <strong>+' + confirmedTotals.loyaltyPoints + ' loyalty points</strong> on this order.</p>' +
          '  <div class="checkout-order-id-box" style="width:100%;">' +
          '    <span class="checkout-order-id-label">Order ID</span>' +
          '    <span class="checkout-order-id-value">' + escapeHtml(confirmedOrderId) + '</span>' +
          '  </div>' +
          '</div>';

        footerEl.innerHTML =
          '<a href="cold-coffee.html" class="btn btn-outline btn-sm">Browse Cold Coffee</a>' +
          '<button type="button" class="btn btn-primary btn-sm" data-action="close-checkout-modal">Done</button>';

        showConfirmationBanner(confirmedOrderId, confirmedTotals);
        renderCartPage();
      });
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    var closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  /**
   * Render both columns of the Shopping Cart page.
   */
  function renderCartPage() {
    var itemsContainer = document.getElementById('cart-items-container');
    var summaryContainer = document.getElementById('cart-summary');
    if (!itemsContainer && !summaryContainer) return;

    var items = readCartStorage();
    renderCartItems(items);
    renderCartSummary(items);

    if (typeof window.updateCartBadge === 'function') {
      window.updateCartBadge();
    }
  }

  /**
   * Attach delegated event listeners for quantity controls, removal, promo, and checkout.
   */
  function bindCartPageEvents() {
    var itemsContainer = document.getElementById('cart-items-container');
    var summaryContainer = document.getElementById('cart-summary');
    if (!itemsContainer && !summaryContainer) return;

    if (itemsContainer) {
      itemsContainer.addEventListener('click', function (event) {
        var decBtn = event.target.closest('[data-action="decrease-qty"]');
        if (decBtn) {
          var decIdx = Number(decBtn.dataset.index);
          var items = readCartStorage();
          if (decIdx >= 0 && decIdx < items.length) {
            var currentQty = Number(items[decIdx].quantity || items[decIdx].qty || 1);
            Cart.updateQuantity(decIdx, currentQty - 1);
            renderCartPage();
          }
          return;
        }

        var incBtn = event.target.closest('[data-action="increase-qty"]');
        if (incBtn) {
          var incIdx = Number(incBtn.dataset.index);
          var currentItems = readCartStorage();
          if (incIdx >= 0 && incIdx < currentItems.length) {
            var qty = Number(currentItems[incIdx].quantity || currentItems[incIdx].qty || 1);
            Cart.updateQuantity(incIdx, qty + 1);
            renderCartPage();
          }
          return;
        }

        var removeBtn = event.target.closest('[data-action="remove-item"]');
        if (removeBtn) {
          var remIdx = Number(removeBtn.dataset.index);
          Cart.removeItem(remIdx);
          renderCartPage();
        }
      });
    }

    if (summaryContainer) {
      summaryContainer.addEventListener('submit', function (event) {
        if (event.target && event.target.id === 'promo-form') {
          event.preventDefault();
          var input = summaryContainer.querySelector('#promo-code-input');
          var rawCode = input ? String(input.value || '').trim().toUpperCase() : '';

          if (!rawCode) {
            savePromoCode('');
            promoStatusMessage = 'Please enter a promo code (try COFFEE10).';
            promoStatusType = 'error';
          } else if (PROMO_CODES[rawCode]) {
            savePromoCode(rawCode);
            promoStatusMessage = 'Promo code COFFEE10 applied — 10% off your subtotal!';
            promoStatusType = 'success';
          } else {
            promoStatusMessage = 'Invalid promo code "' + rawCode + '". Try COFFEE10 for 10% off.';
            promoStatusType = 'error';
          }

          renderCartSummary(readCartStorage());
        }
      });

      summaryContainer.addEventListener('click', function (event) {
        var clearPromoBtn = event.target.closest('[data-action="remove-promo"]');
        if (clearPromoBtn) {
          savePromoCode('');
          promoStatusMessage = 'Promo code removed.';
          promoStatusType = 'info';
          renderCartSummary(readCartStorage());
          return;
        }

        var checkoutBtn = event.target.closest('[data-action="open-checkout"]');
        if (checkoutBtn && !checkoutBtn.disabled) {
          openCheckoutModal(checkoutBtn);
        }
      });
    }

    window.addEventListener('storage', function (event) {
      if (!event || !event.key || ALL_CART_KEYS.indexOf(event.key) !== -1) {
        renderCartPage();
      }
    });
  }

  function initCart() {
    if (typeof window.updateCartBadge === 'function') {
      window.updateCartBadge();
    }
    bindCartPageEvents();
    renderCartPage();
  }

  if (document.readyState !== 'loading') {
    initCart();
  } else {
    document.addEventListener('DOMContentLoaded', initCart);
  }
})();
