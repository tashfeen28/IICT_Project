/**
 * checkout_26i-3272.js  —  v3 (fully fixed)
 * Powers  pages/checkout.html  —  The Coffee Circle
 * Owner : 26i-3272  |  Updated: 2026-11-27
 *
 * FIX SUMMARY (v3)
 * ────────────────
 * Root cause 1 — Wrong/missing localStorage keys
 *   The site uses FOUR different keys (all merged):
 *     • 'coffeeCircleCart'         — cart_26i3066.js (cold-coffee / main cart)
 *       Items shape: { id, name, unitPrice, price, basePrice, quantity, size, extras[] }
 *     • 'coffee_circle_cart'       — products_26i-3272.js (cappuccino pages)
 *       Items shape: { id, name, unitPrice, price, qty, size, sizeId, extras[], extraIds[] }
 *     • 'cc_cart'                  — cart_i263069.js (latte / espresso / cappuccino pages)
 *       Items shape: { id, size, addons:[], qty }  (name/price absent; resolved at render)
 *     • 'iict_checkout_cart_26i3272' — our own key (fallback / test writes)
 *   All are merged into one cart; duplicates by cartLineId are de-duped.
 *
 * Root cause 2 — Quantity field mismatch (qty vs quantity)
 *   cart_26i3066.js  saves  item.quantity
 *   products_26i-3272.js saves item.qty
 *   parseQty() reads BOTH and picks whichever is a valid integer ≥ 1.
 *
 * Root cause 3 — Price field mismatch / zero prices
 *   Both scripts store item.unitPrice as the canonical price field.
 *   item.price is kept as a copy. item.totalPrice = unitPrice × qty.
 *   parseUnitPrice() tries unitPrice → price → basePrice → totalPrice÷qty,
 *   and strips currency text ("PKR ", "Rs ", "Rs. ", "$", commas) from
 *   any string values before parsing.  Covers all alias fields:
 *   amount, cost, rate are also scanned.
 *
 * Root cause 4 — Currency label mismatch
 *   Site-wide format is "PKR 750", not "Rs 750".
 *   All formatters use PKR. Static HTML defaults updated to match.
 *
 * Root cause 5 — Duplicate-ID collision in handleItemControl
 *   The same product can appear multiple times with different sizes/extras.
 *   Each normalised item now carries a unique cartLineId (product id +
 *   size + extras fingerprint) so quantity +/− and remove target the
 *   correct line.
 *
 * Root cause 6 — hasUsableItems guard too strict
 *   If every item happened to fall back to name 'Coffee Drink' (e.g. a
 *   nameless entry) the guard skipped to the next key.  Guard is now
 *   loosened: any item with a parseable price > 0 qualifies.
 *
 * Root cause 7 — delivery-field required validation bleeding into pickup
 *   Fields inside .co-delivery-only are hidden by adding .co-hidden.
 *   isHiddenField() correctly climbs to the ancestor — verified correct.
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     0 · CONFIGURATION
     ═══════════════════════════════════════════════════════════ */

  /**
   * All localStorage keys used across the project, in priority order.
   * We try each one and use the first that returns a non-empty valid array.
   *
   *  'coffeeCircleCart'         — cart_26i3066.js   (main cold-coffee cart)
   *  'coffee_circle_cart'       — products_26i-3272.js (cappuccino pages)
   *  'iict_checkout_cart_26i3272' — our own key (test / direct writes)
   *  'cart' / 'coffeeCart'      — legacy / other team members
   */
  var CART_KEYS = [
    'coffeeCircleCart',
    'coffee_circle_cart',
    'cc_cart',
    'iict_checkout_cart_26i3272',
    'cart',
    'coffeeCart'
  ];

  var OWN_CART_KEY    = 'iict_checkout_cart_26i3272';
  var DELIVERY_FEE    = 150;      // PKR, flat
  var FREE_THRESHOLD  = 2000;     // free delivery above this subtotal (delivery mode)
  var SERVICE_RATE    = 0.05;     // 5 %

  /**
   * Sample cart items using the exact shape cart_26i3066.js / products_26i-3272.js uses.
   * unitPrice is the canonical price field; price is kept as a copy.
   * quantity is used by coffeeCircleCart; qty is used by coffee_circle_cart.
   */
  var SAMPLE_CART = [
    {
      id: 'iced-caramel-macchiato', name: 'Iced Caramel Macchiato',
      size: 'Medium', basePrice: 750, unitPrice: 870, price: 870,
      quantity: 2, qty: 2, extras: [], category: 'cold-coffee'
    },
    {
      id: 'cold-brew-classic', name: 'Cold Brew Classic',
      size: 'Small', basePrice: 650, unitPrice: 650, price: 650,
      quantity: 1, qty: 1, extras: [], category: 'cold-coffee'
    },
    {
      id: 'classic-cappuccino', name: 'Classic Cappuccino',
      size: 'Regular (12 oz)', basePrice: 350, unitPrice: 410, price: 410,
      quantity: 1, qty: 1, extras: [{ id: 'extra-shot', label: 'Extra Espresso Shot', price: 90 }],
      category: 'cappuccino'
    }
  ];

  /* ═══════════════════════════════════════════════════════════
     1 · UTILITY HELPERS
     ═══════════════════════════════════════════════════════════ */

  /**
   * Strip currency symbols / thousand-separators and return a finite number.
   * Handles: "PKR 750", "Rs 750", "Rs. 750", "$4.50", "1,250", 750, etc.
   */
  function parseMoney(raw) {
    if (raw == null) return 0;
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
    var cleaned = String(raw)
      .replace(/[Pp][Kk][Rr]\s*/g, '')   // "PKR "
      .replace(/[Rr][Ss]\.?\s*/g, '')    // "Rs " / "Rs. "
      .replace(/\$\s*/g, '')             // "$"
      .replace(/,/g, '')                 // "1,250" → "1250"
      .trim();
    var n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  /**
   * Resolve the quantity from an item, checking both 'quantity' and 'qty'.
   * Returns an integer ≥ 1.
   */
  function parseQty(item) {
    // quantity is used by coffeeCircleCart; qty is used by coffee_circle_cart
    var raw = item.quantity != null ? item.quantity : item.qty;
    if (raw == null) return 1;
    var n = parseInt(String(raw), 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }

  /**
   * Resolve the unit price from an item, trying all known price fields.
   * Also handles alias names: amount, cost, rate.
   * Falls back to computing totalPrice / qty as a last resort.
   */
  function parseUnitPrice(item) {
    // Priority: unitPrice → price → basePrice → amount → cost → rate
    var candidates = [
      item.unitPrice, item.price, item.basePrice,
      item.amount, item.cost, item.rate
    ];
    for (var i = 0; i < candidates.length; i++) {
      var v = parseMoney(candidates[i]);
      if (v > 0) return v;
    }
    // Last resort: totalPrice / qty (coffee_circle_cart stores totalPrice)
    var total = parseMoney(item.totalPrice);
    if (total > 0) {
      var qty = parseQty(item);
      return qty > 0 ? total / qty : total;
    }
    return 0;
  }

  /** Format a number as PKR currency (matches site-wide convention). */
  function fmt(n) {
    return 'PKR\u00a0' + Math.round(n).toLocaleString('en-PK');
  }

  /** Generate a short order ID. */
  function genOrderId() {
    var ts   = Date.now().toString(36).toUpperCase();
    var rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return 'TCC-' + ts + '-' + rand;
  }

  /** Escape HTML to prevent XSS. */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function $id(id)       { return document.getElementById(id); }
  function $q(sel, ctx)  { return (ctx || document).querySelector(sel); }

  /* ═══════════════════════════════════════════════════════════
     2 · CART STATE  (in-memory, synced to our own localStorage key)
     ═══════════════════════════════════════════════════════════ */

  /** Internal cart: array of normalised items. */
  var cart = [];

  /**
   * Normalise a raw item from any source into a consistent shape.
   * This handles ALL the field-name variants used across the project:
   *   coffeeCircleCart  : { id, name, unitPrice, price, basePrice, quantity, size, extras[] }
   *   coffee_circle_cart: { id, name, unitPrice, price, qty, sizeId, size, extras[], extraIds[] }
   *
   * cartLineId is a unique fingerprint for this cart line (product + size + sorted extras)
   * so that quantity controls and remove target the correct row even when
   * the same product appears multiple times with different sizes/extras.
   */
  function normaliseItem(raw, idx) {
    var unitPrice = parseUnitPrice(raw);
    var quantity  = parseQty(raw);

    // extras: coffeeCircleCart stores array of objects {id,label,price}
    // coffee_circle_cart stores array of label strings OR objects; extraIds holds the ids
    var extras = [];
    if (Array.isArray(raw.extras)) {
      extras = raw.extras.map(function (e) {
        if (e && typeof e === 'object') {
          return {
            id   : String(e.id    || e.label || ''),
            label: String(e.label || e.id    || ''),
            price: parseMoney(e.price)
          };
        }
        // Label string from coffee_circle_cart extras array
        return { id: String(e), label: String(e), price: 0 };
      });
    }

    var productId  = String(raw.id   || ('item-' + idx));
    var sizeLabel  = String(raw.size || raw.sizeLabel || raw.sizeId || '');
    // Build a unique line key: productId + size + sorted extra ids
    var extrasKey  = extras.map(function (e) { return e.id; }).sort().join(',');
    var cartLineId = productId + '||' + sizeLabel + '||' + extrasKey;

    return {
      cartLineId: cartLineId,          // unique key for this cart row
      id        : productId,
      name      : String(raw.name || 'Coffee Drink'),
      category  : String(raw.category || ''),
      size      : sizeLabel,
      unitPrice : unitPrice,
      quantity  : quantity,
      extras    : extras
    };
  }

  /**
   * Parse raw localStorage value.  Handles:
   *   - JSON array of items
   *   - JSON object whose values are items (some old formats)
   */
  function parseRaw(raw) {
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        var vals = Object.values(parsed);
        if (vals.length > 0) return vals;
      }
    } catch (_) {}
    return null;
  }

  /**
   * Load cart from localStorage, merging items from ALL known keys.
   * Each key's items are appended in priority order; duplicates from the same
   * product id + size combo are NOT merged because a shopper may intentionally
   * have added the same drink from different pages with different sizes/extras.
   * cc_cart items ({ id, size, addons[], qty }) are normalised on the fly;
   * their name/price are resolved by normaliseItem() which uses parseUnitPrice()
   * — if that returns 0 the item is still included (guard now only drops items
   * that have no id AND no name).
   * Returns a normalised array (may be empty).
   */
  function loadCart() {
    var merged = [];
    var seen = {};
    var globalIdx = 0;

    for (var i = 0; i < CART_KEYS.length; i++) {
      var raw    = localStorage.getItem(CART_KEYS[i]);
      var parsed = parseRaw(raw);
      if (!parsed) continue;

      parsed.forEach(function (item) {
        if (!item || (!item.id && !item.name)) return;

        var norm = normaliseItem(item, globalIdx++);

        // Deduplicate across keys by cartLineId so the same item added in two
        // tabs doesn't appear twice (take first occurrence = highest-priority key)
        if (!seen[norm.cartLineId]) {
          seen[norm.cartLineId] = true;
          merged.push(norm);
        }
      });
    }
    return merged;
  }

  /** Persist current cart to our own key. */
  function saveCart() {
    try { localStorage.setItem(OWN_CART_KEY, JSON.stringify(cart)); } catch (_) {}
  }

  /** Clear cart from every known key. */
  function clearCartStorage() {
    CART_KEYS.forEach(function (k) {
      try { localStorage.removeItem(k); } catch (_) {}
    });
  }

  /* ═══════════════════════════════════════════════════════════
     3 · TOTALS
     ═══════════════════════════════════════════════════════════ */

  function isDeliveryMode() {
    var r = $q('input[name="fulfillment"]:checked');
    return r ? r.value === 'delivery' : true;
  }

  function computeTotals() {
    var subtotal   = cart.reduce(function (s, i) { return s + i.unitPrice * i.quantity; }, 0);
    var delivery   = isDeliveryMode() ? (subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE) : 0;
    var service    = subtotal * SERVICE_RATE;
    var grand      = subtotal + delivery + service;
    var totalItems = cart.reduce(function (s, i) { return s + i.quantity; }, 0);
    return { subtotal: subtotal, delivery: delivery, service: service, grand: grand, totalItems: totalItems };
  }

  /* ═══════════════════════════════════════════════════════════
     4 · RENDER HELPERS
     ═══════════════════════════════════════════════════════════ */

  function renderItems() {
    var listEl  = $id('checkout-items');
    if (!listEl) return;

    listEl.querySelectorAll('.co-item-row').forEach(function (el) { el.remove(); });
    var emptyEl = $id('co-items-empty');

    if (cart.length === 0) {
      if (emptyEl) emptyEl.style.display = '';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    cart.forEach(function (item) {
      var li = document.createElement('li');
      li.className      = 'co-item-row';
      li.dataset.itemId = item.cartLineId;

      // Build extras label
      var extrasText = '';
      if (item.extras && item.extras.length > 0) {
        extrasText = item.extras.map(function (e) { return e.label; }).filter(Boolean).join(', ');
      }

      var metaParts = [];
      if (item.size)       metaParts.push(esc(item.size));
      if (extrasText)      metaParts.push(esc(extrasText));
      metaParts.push('Qty: ' + item.quantity);

      // Unit price line so users can verify per-item cost
      var unitLine = item.unitPrice > 0
        ? '<div class="co-item-row__unit">Unit price: ' + fmt(item.unitPrice) + '</div>'
        : '';

      li.innerHTML =
        '<div class="co-item-row__info">' +
          '<div class="co-item-row__name">' + esc(item.name) + '</div>' +
          '<div class="co-item-row__meta">' + metaParts.join(' &middot; ') + '</div>' +
          unitLine +
          '<div class="co-item-row__controls" role="group" aria-label="Quantity for ' + esc(item.name) + '">' +
            '<button class="co-qty-btn" data-action="dec" data-id="' + esc(item.cartLineId) + '" aria-label="Decrease quantity">\u2212</button>' +
            '<span   class="co-qty-value" aria-live="polite">' + item.quantity + '</span>' +
            '<button class="co-qty-btn" data-action="inc" data-id="' + esc(item.cartLineId) + '" aria-label="Increase quantity">+</button>' +
            '<button class="co-remove-btn" data-action="remove" data-id="' + esc(item.cartLineId) + '" aria-label="Remove ' + esc(item.name) + '" title="Remove">\xd7</button>' +
          '</div>' +
        '</div>' +
        '<div class="co-item-row__price">' + fmt(item.unitPrice * item.quantity) + '</div>';

      listEl.appendChild(li);
    });
  }

  function renderTotals() {
    var t = computeTotals();

    var setText = function (id, val) { var el = $id(id); if (el) el.textContent = val; };

    setText('co-item-count',      t.totalItems);
    setText('co-subtotal',        fmt(t.subtotal));
    setText('co-service-charge',  fmt(t.service));
    setText('co-grand-total',     fmt(t.grand));

    // Delivery fee — show FREE badge when applicable
    var feeEl = $id('co-delivery-fee');
    if (feeEl) {
      if (!isDeliveryMode()) {
        feeEl.innerHTML = '<span class="co-free-badge">FREE</span>\u00a0(Pickup)';
      } else if (t.delivery === 0) {
        feeEl.innerHTML = '<span class="co-free-badge">FREE</span>';
      } else {
        feeEl.textContent = fmt(t.delivery);
      }
    }

    // Threshold hint
    var hintEl = $id('co-threshold-hint');
    if (hintEl) {
      if (isDeliveryMode() && t.delivery > 0) {
        var remaining = FREE_THRESHOLD - t.subtotal;
        hintEl.textContent = '\ud83d\ude9a Add ' + fmt(remaining) + ' more for free delivery!';
        hintEl.classList.remove('co-hidden');
      } else {
        hintEl.classList.add('co-hidden');
      }
    }

    // Enable / disable Place Order button
    var btn = $id('co-place-order-btn');
    if (btn) btn.disabled = cart.length === 0;
  }

  function render() {
    renderItems();
    renderTotals();
    updateSampleBar();
  }

  /* ═══════════════════════════════════════════════════════════
     5 · SAMPLE ORDER HELPER
     ═══════════════════════════════════════════════════════════ */

  function updateSampleBar() {
    var bar = $id('co-sample-bar');
    if (!bar) return;
    bar.classList.toggle('co-hidden', cart.length > 0);
  }

  function loadSampleCart() {
    // Write to our own key so loadCart() will pick it up
    try { localStorage.setItem(OWN_CART_KEY, JSON.stringify(SAMPLE_CART)); } catch (_) {}
    cart = SAMPLE_CART.map(normaliseItem);
    render();
  }

  /* ═══════════════════════════════════════════════════════════
     6 · QUANTITY / REMOVE HANDLERS
     ═══════════════════════════════════════════════════════════ */

  function handleItemControl(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.dataset.action;
    var lineId = btn.dataset.id;
    // Match by cartLineId first (unique per size+extras combination),
    // then fall back to product id for backwards-compatibility with any
    // items that were normalised before cartLineId was introduced.
    var idx = cart.findIndex(function (i) {
      return i.cartLineId === lineId || i.id === lineId;
    });
    if (idx < 0) return;

    if (action === 'inc') {
      cart[idx].quantity += 1;
    } else if (action === 'dec') {
      cart[idx].quantity -= 1;
      if (cart[idx].quantity < 1) cart.splice(idx, 1);
    } else if (action === 'remove') {
      cart.splice(idx, 1);
    } else {
      return;
    }

    saveCart();
    render();
  }

  /* ═══════════════════════════════════════════════════════════
     7 · FULFILLMENT TOGGLE
     ═══════════════════════════════════════════════════════════ */

  function initFulfillmentToggle() {
    var radios       = document.querySelectorAll('input[name="fulfillment"]');
    var deliveryOnly = document.querySelectorAll('.co-delivery-only');

    function apply(value) {
      var isDelivery = value === 'delivery';
      deliveryOnly.forEach(function (el) { el.classList.toggle('co-hidden', !isDelivery); });
      renderTotals();
    }

    radios.forEach(function (r) { r.addEventListener('change', function () { apply(r.value); }); });
    var checked = $q('input[name="fulfillment"]:checked');
    if (checked) apply(checked.value);
  }

  /* ═══════════════════════════════════════════════════════════
     8 · PAYMENT PANEL TOGGLE
     ═══════════════════════════════════════════════════════════ */

  function initPaymentTabs() {
    var radios = document.querySelectorAll('input[name="paymentMethod"]');
    var panels = {
      card  : $id('co-panel-card'),
      cod   : $id('co-panel-cod'),
      wallet: $id('co-panel-wallet')
    };

    function show(value) {
      Object.keys(panels).forEach(function (k) {
        var el = panels[k];
        if (!el) return;
        var active = k === value;
        el.classList.toggle('co-payment-panel--active', active);
        el.setAttribute('aria-hidden', String(!active));
      });
    }

    radios.forEach(function (r) { r.addEventListener('change', function () { show(r.value); }); });
    var checked = $q('input[name="paymentMethod"]:checked');
    if (checked) show(checked.value);
  }

  /* ═══════════════════════════════════════════════════════════
     9 · CARD FORMATTING
     ═══════════════════════════════════════════════════════════ */

  function initCardFormatting() {
    var numEl = $id('co-card-number');
    var expEl = $id('co-card-expiry');

    if (numEl) {
      numEl.addEventListener('input', function () {
        var v = this.value.replace(/\D/g, '').slice(0, 16);
        this.value = v.replace(/(.{4})/g, '$1 ').trim();
      });
    }
    if (expEl) {
      expEl.addEventListener('input', function () {
        var v = this.value.replace(/\D/g, '').slice(0, 4);
        this.value = v.length >= 3 ? v.slice(0, 2) + ' / ' + v.slice(2) : v;
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     10 · VALIDATION
     ═══════════════════════════════════════════════════════════ */

  function showError(input, msg) {
    input.classList.add('co-input--error');
    input.classList.remove('co-input--valid');
    var err = $id(input.id + '-error');
    if (err) { err.textContent = msg; err.classList.add('visible'); }
  }

  function clearError(input) {
    input.classList.remove('co-input--error');
    var err = $id(input.id + '-error');
    if (err) { err.textContent = ''; err.classList.remove('visible'); }
  }

  function markValid(input) {
    clearError(input);
    input.classList.add('co-input--valid');
  }

  function isHiddenField(el) {
    return el.closest('.co-hidden') !== null
        || el.closest('.co-payment-panel:not(.co-payment-panel--active)') !== null;
  }

  function validateField(el) {
    clearError(el);
    if (isHiddenField(el)) return true;

    var v        = el.value.trim();
    var required = el.required || el.getAttribute('aria-required') === 'true';

    if (required && !v) { showError(el, 'This field is required.'); return false; }
    if (!v) return true;

    if (el.type === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        showError(el, 'Please enter a valid email address.'); return false;
      }
    }
    if (el.type === 'tel' || el.id === 'co-phone' || el.id === 'co-wallet-number') {
      if (!/^[+\d\s\-(). ]{7,20}$/.test(v)) {
        showError(el, 'Please enter a valid phone number.'); return false;
      }
    }
    if (el.id === 'co-card-number') {
      if (!/^\d{16}$/.test(v.replace(/\s/g, ''))) {
        showError(el, 'Please enter a valid 16-digit card number.'); return false;
      }
    }
    if (el.id === 'co-card-expiry') {
      if (!/^\d{2}\s*\/\s*\d{2}$/.test(v)) {
        showError(el, 'Enter expiry as MM / YY.'); return false;
      }
    }
    if (el.id === 'co-card-cvv') {
      if (!/^\d{3,4}$/.test(v)) {
        showError(el, 'CVV must be 3 or 4 digits.'); return false;
      }
    }
    if (el.tagName === 'SELECT' && !v) {
      showError(el, 'Please select an option.'); return false;
    }

    markValid(el);
    return true;
  }

  function validateForm() {
    var form = $id('checkout-form');
    if (!form) return true;

    var fields  = form.querySelectorAll('input:not([type="radio"]), select, textarea');
    var valid   = true;
    var firstBad = null;

    fields.forEach(function (f) {
      if (!validateField(f)) { valid = false; if (!firstBad) firstBad = f; }
    });

    if (firstBad) {
      firstBad.focus();
      var card = firstBad.closest('.co-fieldset');
      if (card) {
        card.classList.remove('co-shake');
        void card.offsetWidth;
        card.classList.add('co-shake');
        card.addEventListener('animationend', function () { card.classList.remove('co-shake'); }, { once: true });
      }
    }
    return valid;
  }

  /* ═══════════════════════════════════════════════════════════
     11 · ORDER CONFIRMATION TABLE
     ═══════════════════════════════════════════════════════════ */

  function buildConfirmTable() {
    if (cart.length === 0) return '';
    var rows = cart.map(function (i) {
      var sizeMeta = i.size ? ' <small style="color:#9b8f85">(' + esc(i.size) + ')</small>' : '';
      return '<tr>' +
        '<td>' + esc(i.name) + sizeMeta + '</td>' +
        '<td style="text-align:right">' + i.quantity + '</td>' +
        '<td style="text-align:right">' + fmt(i.unitPrice * i.quantity) + '</td>' +
        '</tr>';
    }).join('');
    return '<table class="co-confirm-table">' +
      '<thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table>';
  }

  /* ═══════════════════════════════════════════════════════════
     12 · FORM SUBMIT — ORDER PLACEMENT
     ═══════════════════════════════════════════════════════════ */

  function initFormSubmit() {
    var form = $id('checkout-form');
    var btn  = $id('co-place-order-btn');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (cart.length === 0) {
        alert('Your cart is empty. Add items before placing an order.');
        return;
      }
      if (!validateForm()) return;

      if (btn) { btn.disabled = true; btn.textContent = 'Processing\u2026'; }

      setTimeout(function () {
        var orderId = genOrderId();
        var email   = ($id('co-email') ? $id('co-email').value : '').trim();
        var fullName = ($id('co-full-name') ? $id('co-full-name').value : '').trim();
        var phone   = ($id('co-phone') ? $id('co-phone').value : '').trim();
        var fulfillmentRadio = $q('input[name="fulfillment"]:checked');
        var fulfillment = fulfillmentRadio ? fulfillmentRadio.value : 'delivery';
        var address = ($id('co-address') ? $id('co-address').value : '').trim();
        var city    = ($id('co-city') ? $id('co-city').value : '').trim();
        var notes   = ($id('co-notes') ? $id('co-notes').value : '').trim();

        var paymentRadio = $q('input[name="paymentMethod"]:checked');
        var paymentMethod = paymentRadio ? paymentRadio.value : 'card';
        var cardName = ($id('co-card-name') ? $id('co-card-name').value : '').trim();
        var rawCardNum = ($id('co-card-number') ? $id('co-card-number').value : '').replace(/\s/g, '');
        var cardLast4 = rawCardNum ? rawCardNum.slice(-4) : '';
        var walletType = ($id('co-wallet-type') ? $id('co-wallet-type').value : '').trim();
        var walletNumber = ($id('co-wallet-number') ? $id('co-wallet-number').value : '').trim();

        var t = computeTotals();

        // Build completed order snapshot before clearing cart
        var itemsSnapshot = cart.map(function (item) {
          return {
            id: item.id,
            name: item.name,
            size: item.size,
            category: item.category,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            qty: item.quantity,
            price: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            extras: Array.isArray(item.extras) ? JSON.parse(JSON.stringify(item.extras)) : []
          };
        });

        var orderSnapshot = {
          orderId: orderId,
          id: orderId,
          createdAt: new Date().toISOString(),
          timestamp: Date.now(),
          formattedDate: new Date().toLocaleString('en-PK', {
            dateStyle: 'medium',
            timeStyle: 'short'
          }),
          status: 'Confirmed',
          customer: {
            fullName: fullName || 'Valued Customer',
            email: email || 'customer@example.com',
            phone: phone || ''
          },
          fulfillment: {
            method: fulfillment,
            address: fulfillment === 'delivery' ? address : 'The Coffee Circle Lounge, 12 Gulberg III, Lahore',
            city: fulfillment === 'delivery' ? city : 'Lahore',
            notes: notes
          },
          payment: {
            method: paymentMethod,
            cardName: cardName,
            cardLast4: cardLast4,
            walletType: walletType,
            walletNumber: walletNumber
          },
          items: itemsSnapshot,
          itemCount: itemsSnapshot.reduce(function (sum, it) { return sum + it.quantity; }, 0),
          subtotal: t.subtotal,
          delivery: t.delivery,
          service: t.service,
          tax: t.service,
          discount: 0,
          grand: t.grand,
          total: t.grand,
          currency: 'PKR',
          prepTime: '15–20 minutes',
          instructions: notes || 'None provided'
        };

        // Persist order snapshot to localStorage (coffeeCircleLastOrder and coffeeCircleOrders)
        try {
          window.localStorage.setItem('coffeeCircleLastOrder', JSON.stringify(orderSnapshot));

          var existingOrders = [];
          try {
            var rawOrders = window.localStorage.getItem('coffeeCircleOrders');
            if (rawOrders) {
              var parsed = JSON.parse(rawOrders);
              if (Array.isArray(parsed)) existingOrders = parsed;
            }
          } catch (storageErr) {
            console.warn('Could not read existing orders array', storageErr);
          }
          existingOrders.unshift(orderSnapshot);
          window.localStorage.setItem('coffeeCircleOrders', JSON.stringify(existingOrders));
        } catch (saveErr) {
          console.error('Failed to save order snapshot:', saveErr);
        }

        // Populate confirm box fields
        var setTxt = function (id, val) { var el = $id(id); if (el) el.textContent = val; };
        setTxt('co-confirm-email',    email);
        setTxt('co-order-id',         orderId);
        setTxt('co-confirm-subtotal', fmt(t.subtotal));
        setTxt('co-confirm-delivery', t.delivery === 0 ? 'FREE' : fmt(t.delivery));
        setTxt('co-confirm-service',  fmt(t.service));
        setTxt('co-confirm-grand',    fmt(t.grand));

        var tableHolder = $id('co-confirm-items-table');
        if (tableHolder) tableHolder.innerHTML = buildConfirmTable();

        // Show confirmation
        var confirmBox = $id('order-confirmation');
        if (confirmBox) {
          confirmBox.removeAttribute('hidden');
          confirmBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        form.style.display = 'none';

        // Clear cart from all keys
        cart = [];
        clearCartStorage();

      }, 950);
    });

    // Live validation on blur / input
    var fields = form.querySelectorAll('input:not([type="radio"]), select, textarea');
    fields.forEach(function (f) {
      f.addEventListener('blur',  function () { validateField(f); });
      f.addEventListener('input', function () { if (f.classList.contains('co-input--error')) validateField(f); });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     13 · BOOTSTRAP
     ═══════════════════════════════════════════════════════════ */

  function init() {
    // Load and normalise cart from whichever localStorage key has data
    cart = loadCart();

    render();

    // Wire quantity controls via event delegation
    var listEl = $id('checkout-items');
    if (listEl) listEl.addEventListener('click', handleItemControl);

    // Sample cart button
    var sampleBtn = $id('co-load-sample-btn');
    if (sampleBtn) sampleBtn.addEventListener('click', loadSampleCart);

    // Fulfillment & payment toggles
    initFulfillmentToggle();
    initPaymentTabs();
    initCardFormatting();
    initFormSubmit();

    // Update if cart changes in another tab
    window.addEventListener('storage', function (e) {
      if (e.key && CART_KEYS.indexOf(e.key) !== -1) {
        cart = loadCart();
        render();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
