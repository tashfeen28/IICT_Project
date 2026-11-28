/**
 * confirmation_26i-3272.js
 * Powers pages/confirmation.html — The Coffee Circle
 * Owner : 26i-3272
 *
 * Requirements:
 * 1. Warm cream/parchment canvas (#f5efe4) layout with dark espresso nav & buttons.
 * 2. Solid forest-green circular checkmark badge (#3a7d44) above bold serif heading:
 *    "Thank you, <customer name>! Your order is confirmed."
 * 3. Order number followed by soft tan pill badge showing order code.
 * 4. Balanced two-column card grid:
 *    - Left card ("Your drinks"): <qty> × <Item Name> (<Size/Customization>) and PKR <amount>,
 *      Subtotal, Discount (- PKR <amount> when applicable), and bold Total payment in PKR.
 *    - Right card ("Order details"): Uppercase micro-labels for:
 *      PAYMENT METHOD, PICKUP FROM THE COFFEE CIRCLE / DELIVERY LOCATION,
 *      CONTACT, INSTRUCTIONS, ESTIMATED PREPARATION TIME,
 *      finished with dark espresso banner ("Log in next time to earn loyalty points on your orders.").
 * 5. Action buttons centered: primary "Return to Home", secondary "Explore More Coffee".
 * 6. Dynamic data populated from localStorage (coffeeCircleLastOrder, coffeeCircleOrders,
 *    and fallback to coffeeCircleCart or clean empty state).
 */

(function () {
  'use strict';

  var ORDER_STORAGE_KEYS = [
    'coffeeCircleLastOrder',
    'coffeeCircleOrders',
    'iict_last_order_26i3272',
    'lastOrder',
    'coffee_circle_last_order'
  ];

  var CART_FALLBACK_KEYS = [
    'coffeeCircleCart',
    'coffee_circle_cart',
    'iict_checkout_cart_26i3272',
    'cart',
    'coffeeCart'
  ];

  /* ─────────────────────────────────────────────────────────────
     HELPERS & PARSERS
     ───────────────────────────────────────────────────────────── */

  function parseMoney(raw) {
    if (raw == null) return 0;
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
    var cleaned = String(raw)
      .replace(/[Pp][Kk][Rr]\s*/g, '')
      .replace(/[Rr][Ss]\.?\s*/g, '')
      .replace(/\$\s*/g, '')
      .replace(/,/g, '')
      .trim();
    var n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  function fmtPKR(n) {
    return 'PKR ' + Math.round(Number(n || 0)).toLocaleString('en-US');
  }

  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ─────────────────────────────────────────────────────────────
     ITEM & ORDER NORMALIZATION
     ───────────────────────────────────────────────────────────── */

  function normalizeItem(raw, idx) {
    if (!raw || typeof raw !== 'object') {
      return {
        id: 'item-' + idx,
        name: 'Specialty Coffee',
        size: '',
        unitPrice: 0,
        quantity: 1,
        totalPrice: 0,
        customizationLabel: ''
      };
    }

    var qty = parseInt(raw.quantity != null ? raw.quantity : raw.qty, 10);
    if (!Number.isFinite(qty) || qty < 1) qty = 1;

    var unitPrice = 0;
    var candidates = [raw.unitPrice, raw.price, raw.basePrice, raw.amount, raw.cost, raw.rate];
    for (var i = 0; i < candidates.length; i++) {
      var p = parseMoney(candidates[i]);
      if (p > 0) {
        unitPrice = p;
        break;
      }
    }

    if (unitPrice === 0 && raw.totalPrice) {
      var tot = parseMoney(raw.totalPrice);
      if (tot > 0) unitPrice = tot / qty;
    }

    var extras = [];
    if (Array.isArray(raw.extras)) {
      extras = raw.extras.map(function (e) {
        if (e && typeof e === 'object') {
          return String(e.label || e.id || e.name || 'Extra');
        }
        return String(e);
      });
    }

    var size = String(raw.size || raw.sizeLabel || raw.sizeId || '').trim();
    var customsParts = [];
    if (size) customsParts.push(size);
    if (extras.length > 0) {
      extras.forEach(function (ex) {
        customsParts.push('+' + ex);
      });
    }
    var customizationLabel = customsParts.length > 0 ? customsParts.join(', ') : '';

    var totalPrice = parseMoney(raw.totalPrice) || (unitPrice * qty);

    return {
      id: String(raw.id || ('coffee-' + idx)),
      name: String(raw.name || raw.title || 'Handcrafted Coffee'),
      size: size,
      unitPrice: unitPrice,
      quantity: qty,
      totalPrice: totalPrice,
      customizationLabel: customizationLabel
    };
  }

  function normalizeOrder(rawOrder) {
    if (!rawOrder || typeof rawOrder !== 'object') return null;

    var rawId = rawOrder.orderId || rawOrder.id || rawOrder.orderNumber;
    var orderCode = rawId ? String(rawId).replace(/^#/, '') : ('TCC-' + Math.floor(100000 + Math.random() * 900000));

    var rawItems = rawOrder.items || rawOrder.products || rawOrder.cart || [];
    if (!Array.isArray(rawItems) && rawOrder.items && typeof rawOrder.items === 'object') {
      rawItems = Object.keys(rawOrder.items).map(function (k) { return rawOrder.items[k]; });
    }
    if (!Array.isArray(rawItems)) rawItems = [];

    var items = rawItems.map(normalizeItem);

    var subtotal = parseMoney(rawOrder.subtotal);
    if (subtotal <= 0) {
      subtotal = items.reduce(function (sum, it) { return sum + it.totalPrice; }, 0);
    }

    var discount = parseMoney(rawOrder.discount);
    var delivery = rawOrder.delivery != null ? parseMoney(rawOrder.delivery) : 0;
    var service = parseMoney(rawOrder.service != null ? rawOrder.service : rawOrder.tax);

    var grand = parseMoney(rawOrder.grand != null ? rawOrder.grand : (rawOrder.total || rawOrder.grandTotal));
    if (grand <= 0) {
      grand = Math.max(0, subtotal - discount + delivery + service);
    }

    var cust = rawOrder.customer || {};
    var fullName = cust.fullName || cust.name || rawOrder.fullName || rawOrder.customerName || 'Coffee Lover';
    var email = cust.email || rawOrder.email || 'customer@thecoffeecircle.pk';
    var phone = cust.phone || rawOrder.phone || '+92 300 1234567';

    var ful = rawOrder.fulfillment || {};
    var fulfillmentMethod = (ful.method || rawOrder.fulfillmentMethod || 'pickup').toLowerCase();
    var isPickup = fulfillmentMethod === 'pickup';

    var address = ful.address || rawOrder.address || (isPickup
      ? 'The Coffee Circle Counter · 12 Gulberg III, Lahore'
      : 'Gulberg III, Lahore');
    var city = ful.city || rawOrder.city || 'Lahore';

    var notes = ful.notes || rawOrder.notes || rawOrder.instructions || '';
    var instructions = notes && notes.trim().length > 0 ? notes.trim() : 'None provided';

    var pay = rawOrder.payment || {};
    var paymentMethod = (pay.method || rawOrder.paymentMethod || 'card').toLowerCase();
    var paymentLabel = 'Credit Card';
    if (paymentMethod === 'cod') {
      paymentLabel = 'Cash on Delivery';
    } else if (paymentMethod === 'wallet') {
      var w = pay.walletType || 'Digital Wallet';
      paymentLabel = w.charAt(0).toUpperCase() + w.slice(1);
      if (pay.walletNumber) paymentLabel += ' (' + pay.walletNumber + ')';
    } else if (pay.cardLast4) {
      paymentLabel = 'Credit Card (ending in ' + pay.cardLast4 + ')';
    } else if (pay.cardName) {
      paymentLabel = 'Credit Card (' + pay.cardName + ')';
    }

    var prepTime = rawOrder.prepTime || '15–20 minutes';

    return {
      orderCode: orderCode,
      customerName: fullName,
      email: email,
      phone: phone,
      isPickup: isPickup,
      fulfillmentLabel: isPickup ? 'PICKUP FROM THE COFFEE CIRCLE' : 'DELIVERY LOCATION',
      locationAddress: address + (isPickup ? '' : (city ? ', ' + city : '')),
      instructions: instructions,
      paymentMethod: paymentLabel,
      prepTime: prepTime,
      items: items,
      subtotal: subtotal,
      discount: discount,
      delivery: delivery,
      grand: grand
    };
  }

  /* ─────────────────────────────────────────────────────────────
     DATA RETRIEVAL
     ───────────────────────────────────────────────────────────── */

  function fetchRecentOrder() {
    for (var i = 0; i < ORDER_STORAGE_KEYS.length; i++) {
      var key = ORDER_STORAGE_KEYS[i];
      try {
        var raw = window.localStorage.getItem(key);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            var norm = normalizeOrder(parsed[0]);
            if (norm && norm.items.length > 0) return norm;
          } else if (parsed && typeof parsed === 'object') {
            var normObj = normalizeOrder(parsed);
            if (normObj && normObj.items.length > 0) return normObj;
          }
        }
      } catch (e) {
        console.warn('Could not read key:', key, e);
      }
    }

    // Fallback: active cart
    for (var j = 0; j < CART_FALLBACK_KEYS.length; j++) {
      var cartKey = CART_FALLBACK_KEYS[j];
      try {
        var cartRaw = window.localStorage.getItem(cartKey);
        if (cartRaw) {
          var cartParsed = JSON.parse(cartRaw);
          var itemsList = [];
          if (Array.isArray(cartParsed)) itemsList = cartParsed;
          else if (cartParsed && Array.isArray(cartParsed.items)) itemsList = cartParsed.items;

          if (itemsList.length > 0) {
            return normalizeOrder({
              orderId: 'TCC-' + Math.floor(100000 + Math.random() * 900000),
              status: 'Confirmed',
              items: itemsList,
              customer: { fullName: 'Valued Customer', email: 'customer@thecoffeecircle.pk', phone: '+92 300 0000000' },
              fulfillment: { method: 'pickup', address: 'The Coffee Circle Counter · 12 Gulberg III, Lahore' },
              payment: { method: 'card', cardLast4: '4242' },
              instructions: 'Active cart checkout'
            });
          }
        }
      } catch (err) {}
    }

    return null;
  }

  function updateNavCartCount() {
    var countEl = document.getElementById('cf-nav-cart-count');
    if (!countEl) return;
    var totalQty = 0;
    try {
      var raw = window.localStorage.getItem('coffeeCircleCart') || window.localStorage.getItem('coffee_circle_cart');
      if (raw) {
        var items = JSON.parse(raw);
        if (Array.isArray(items)) {
          totalQty = items.reduce(function (sum, it) {
            return sum + (parseInt(it.quantity || it.qty, 10) || 1);
          }, 0);
        }
      }
    } catch (e) {}
    countEl.textContent = String(totalQty);
  }

  /* ─────────────────────────────────────────────────────────────
     RENDER CONFIRMATION TEMPLATE
     ───────────────────────────────────────────────────────────── */

  function renderConfirmation(order) {
    // Items markup
    var itemsHtml = order.items.map(function (item) {
      var label = item.quantity + ' \u00d7 ' + esc(item.name);
      if (item.customizationLabel) {
        label += ' (' + esc(item.customizationLabel) + ')';
      }

      return '' +
        '<div class="cf-drink-row">' +
          '<div class="cf-drink-info">' +
            '<span class="cf-drink-name">' + label + '</span>' +
          '</div>' +
          '<span class="cf-drink-price">' + fmtPKR(item.totalPrice) + '</span>' +
        '</div>';
    }).join('');

    // Optional discount row
    var discountRowHtml = '';
    if (order.discount > 0) {
      discountRowHtml = '' +
        '<div class="cf-total-line cf-total-line--discount">' +
          '<span>Discount</span>' +
          '<span>- ' + fmtPKR(order.discount) + '</span>' +
        '</div>';
    }

    // Optional delivery row
    var deliveryRowHtml = '';
    if (!order.isPickup) {
      deliveryRowHtml = '' +
        '<div class="cf-total-line">' +
          '<span>Delivery</span>' +
          '<span>' + (order.delivery > 0 ? fmtPKR(order.delivery) : 'FREE') + '</span>' +
        '</div>';
    }

    return '' +
      '<!-- Centered Forest-Green Checkmark Badge & Heading -->' +
      '<div class="cf-hero-header">' +
        '<div class="cf-check-badge" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
        '</div>' +
        '<h1 class="cf-confirm-title">Thank you, ' + esc(order.customerName) + '! Your order is confirmed.</h1>' +
        '<div class="cf-order-num-row">' +
          '<span>Order number</span>' +
          '<span class="cf-order-pill">#' + esc(order.orderCode) + '</span>' +
        '</div>' +
      '</div>' +

      '<!-- Balanced Two-Column Card Grid -->' +
      '<div class="cf-grid">' +

        '<!-- Left Card: Your drinks -->' +
        '<div class="cf-card" aria-label="Ordered drinks summary">' +
          '<h2 class="cf-card__title">Your drinks</h2>' +
          '<div class="cf-drinks-list">' +
            itemsHtml +
          '</div>' +

          '<div class="cf-totals-list">' +
            '<div class="cf-total-line">' +
              '<span>Subtotal</span>' +
              '<strong>' + fmtPKR(order.subtotal) + '</strong>' +
            '</div>' +
            discountRowHtml +
            deliveryRowHtml +
            '<div class="cf-total-divider"></div>' +
            '<div class="cf-total-line cf-total-line--grand">' +
              '<span>Total payment</span>' +
              '<span class="cf-grand-val">' + fmtPKR(order.grand) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<!-- Right Card: Order details -->' +
        '<div class="cf-card" aria-label="Order fulfillment details">' +
          '<h2 class="cf-card__title">Order details</h2>' +
          '<div class="cf-details-stack">' +

            '<div class="cf-detail-group">' +
              '<span class="cf-micro-label">PAYMENT METHOD</span>' +
              '<span class="cf-detail-val cf-detail-val--strong">' + esc(order.paymentMethod) + '</span>' +
            '</div>' +

            '<div class="cf-detail-group">' +
              '<span class="cf-micro-label">' + esc(order.fulfillmentLabel) + '</span>' +
              '<span class="cf-detail-val">' + esc(order.locationAddress) + '</span>' +
            '</div>' +

            '<div class="cf-detail-group">' +
              '<span class="cf-micro-label">CONTACT</span>' +
              '<span class="cf-detail-val">' + esc(order.customerName) + ' &bull; ' + esc(order.phone) + '</span>' +
              '<span class="cf-detail-sub">' + esc(order.email) + '</span>' +
            '</div>' +

            '<div class="cf-detail-group">' +
              '<span class="cf-micro-label">INSTRUCTIONS</span>' +
              '<span class="cf-detail-val">' + esc(order.instructions) + '</span>' +
            '</div>' +

            '<div class="cf-detail-group">' +
              '<span class="cf-micro-label">ESTIMATED PREPARATION TIME</span>' +
              '<span class="cf-detail-val cf-detail-val--strong">' + esc(order.prepTime) + '</span>' +
            '</div>' +

          '</div>' +

          '<!-- Dark Espresso Loyalty Banner -->' +
          '<div class="cf-loyalty-banner">' +
            '<span class="cf-loyalty-banner__icon" aria-hidden="true">☕</span>' +
            '<span class="cf-loyalty-banner__text">Log in next time to earn loyalty points on your orders.</span>' +
          '</div>' +
        '</div>' +

      '</div>' +

      '<!-- Centered Action Buttons -->' +
      '<div class="cf-actions-wrap no-print">' +
        '<a href="../index.html" class="cf-btn cf-btn--primary">Return to Home</a>' +
        '<a href="cold-coffee.html" class="cf-btn cf-btn--secondary">Explore More Coffee</a>' +
      '</div>';
  }

  function renderEmptyState() {
    return '' +
      '<div class="cf-empty-card" role="status">' +
        '<span class="cf-empty-icon" aria-hidden="true">☕</span>' +
        '<h2 class="cf-empty-title">No Recent Order Found</h2>' +
        '<p class="cf-empty-desc">' +
          'We couldn&rsquo;t find an active or completed coffee order on this device. ' +
          'Browse our signature roasts and handcrafted drinks to start a fresh order.' +
        '</p>' +
        '<div class="cf-actions-wrap" style="margin-top:0;">' +
          '<a href="../index.html" class="cf-btn cf-btn--primary">Return to Home</a>' +
          '<a href="cold-coffee.html" class="cf-btn cf-btn--secondary">Explore More Coffee</a>' +
          '<button type="button" class="cf-btn cf-btn--secondary" id="cf-sample-btn" style="border-style:dashed;">Load Sample Order</button>' +
        '</div>' +
      '</div>';
  }

  function loadSample() {
    var sample = {
      orderId: 'TCC-' + Math.floor(100000 + Math.random() * 900000),
      customer: {
        fullName: 'Aisha Rahman',
        email: 'aisha.rahman@example.com',
        phone: '+92 301 8456789'
      },
      fulfillment: {
        method: 'pickup',
        address: 'The Coffee Circle Counter · 12 Gulberg III, Lahore'
      },
      payment: {
        method: 'card',
        cardLast4: '4242'
      },
      instructions: 'Extra hot with cinnamon on top, please.',
      prepTime: '15–20 minutes',
      items: [
        {
          name: 'Classic Italian Cappuccino',
          size: 'Regular (12 oz)',
          unitPrice: 420,
          quantity: 2,
          totalPrice: 840,
          extras: ['Extra Espresso Shot']
        },
        {
          name: 'Iced Caramel Macchiato',
          size: 'Medium (16 oz)',
          unitPrice: 750,
          quantity: 1,
          totalPrice: 750,
          extras: ['Oat Milk Sub']
        }
      ],
      subtotal: 1590,
      discount: 0,
      delivery: 0,
      grand: 1590
    };

    try {
      window.localStorage.setItem('coffeeCircleLastOrder', JSON.stringify(sample));
    } catch (e) {}

    render();
  }

  function render() {
    var root = document.getElementById('confirmation-root');
    if (!root) return;

    updateNavCartCount();

    var order = fetchRecentOrder();
    if (order) {
      root.innerHTML = renderConfirmation(order);
    } else {
      root.innerHTML = renderEmptyState();
      var sampleBtn = document.getElementById('cf-sample-btn');
      if (sampleBtn) {
        sampleBtn.addEventListener('click', loadSample);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

})();
