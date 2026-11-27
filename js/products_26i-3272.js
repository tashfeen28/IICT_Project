(function () {
  'use strict';

  const MIN_QTY = 1;
  const MAX_QTY = 99;
  const CART_KEY = 'coffee_circle_cart';

  const DEFAULT_SIZES = [
    { id: 'small', label: 'Small (8 oz)', priceDelta: 0 },
    { id: 'regular', label: 'Regular (12 oz)', priceDelta: 60 },
    { id: 'large', label: 'Large (16 oz)', priceDelta: 120 }
  ];

  const PRODUCTS = [
    {
      id: 'classic-cappuccino',
      name: 'Classic Cappuccino',
      category: 'cappuccino',
      basePrice: 350,
      bestseller: true,
      description: 'Balanced double espresso folded into silky steamed milk and topped with thick, velvety microfoam.',
      ingredients: ['Double Espresso', 'Steamed Whole Milk', 'Velvety Microfoam'],
      sizes: DEFAULT_SIZES,
      extras: [
        { id: 'extra-shot', label: 'Extra Espresso Shot', price: 90 },
        { id: 'oat-milk', label: 'Oat / Almond Milk', price: 80 },
        { id: 'vanilla-syrup', label: 'Vanilla / Caramel Syrup', price: 50 },
        { id: 'cocoa-dust', label: 'Cocoa Dusting', price: 30 }
      ],
      visual: { cupColor: '#C68B59', foamColor: '#F5EBDD', accentColor: '#654321', iced: false }
    },
    {
      id: 'vanilla-cappuccino',
      name: 'Vanilla Cappuccino',
      category: 'cappuccino',
      basePrice: 390,
      bestseller: false,
      description: 'Aromatic espresso infused with Madagascar vanilla bean syrup and finished with cloud-soft foam.',
      ingredients: ['Double Espresso', 'Madagascar Vanilla Syrup', 'Steamed Milk', 'Microfoam'],
      sizes: DEFAULT_SIZES,
      extras: [
        { id: 'extra-shot', label: 'Extra Espresso Shot', price: 90 },
        { id: 'oat-milk', label: 'Oat / Almond Milk', price: 80 },
        { id: 'extra-vanilla', label: 'Extra Vanilla Syrup', price: 50 },
        { id: 'whipped-cream', label: 'Whipped Cream', price: 60 }
      ],
      visual: { cupColor: '#B87D4B', foamColor: '#FFF8EE', accentColor: '#C68B59', iced: false }
    },
    {
      id: 'caramel-cappuccino',
      name: 'Caramel Cappuccino',
      category: 'cappuccino',
      basePrice: 400,
      bestseller: true,
      description: 'Rich roasted espresso swirled with buttery house caramel and crowned with caramel-drizzled foam.',
      ingredients: ['Double Espresso', 'Salted Caramel Sauce', 'Steamed Milk', 'Velvety Foam'],
      sizes: DEFAULT_SIZES,
      extras: [
        { id: 'extra-shot', label: 'Extra Espresso Shot', price: 90 },
        { id: 'oat-milk', label: 'Oat / Almond Milk', price: 80 },
        { id: 'extra-caramel', label: 'Extra Caramel Syrup', price: 50 },
        { id: 'whipped-cream', label: 'Whipped Cream', price: 60 }
      ],
      visual: { cupColor: '#9E6234', foamColor: '#F5EBDD', accentColor: '#C68B59', iced: false }
    },
    {
      id: 'hazelnut-cappuccino',
      name: 'Hazelnut Cappuccino',
      category: 'cappuccino',
      basePrice: 410,
      bestseller: false,
      description: 'Nutty roasted hazelnut notes paired with bold espresso and creamy microfoam for a warm finish.',
      ingredients: ['Double Espresso', 'Roasted Hazelnut Syrup', 'Steamed Milk', 'Microfoam'],
      sizes: DEFAULT_SIZES,
      extras: [
        { id: 'extra-shot', label: 'Extra Espresso Shot', price: 90 },
        { id: 'almond-milk', label: 'Almond / Oat Milk', price: 80 },
        { id: 'extra-hazelnut', label: 'Extra Hazelnut Syrup', price: 50 },
        { id: 'whipped-cream', label: 'Whipped Cream', price: 60 }
      ],
      visual: { cupColor: '#7D4F2D', foamColor: '#F2E2CE', accentColor: '#C68B59', iced: false }
    },
    {
      id: 'chocolate-cappuccino',
      name: 'Chocolate Cappuccino',
      category: 'cappuccino',
      basePrice: 420,
      bestseller: false,
      description: 'Velvety dark cocoa melted into fresh espresso and steamed milk, dusted with fine chocolate shavings.',
      ingredients: ['Double Espresso', 'Dark Belgian Cocoa', 'Steamed Milk', 'Chocolate Shavings'],
      sizes: DEFAULT_SIZES,
      extras: [
        { id: 'extra-shot', label: 'Extra Espresso Shot', price: 90 },
        { id: 'oat-milk', label: 'Oat / Almond Milk', price: 80 },
        { id: 'mocha-syrup', label: 'Mocha / Hazelnut Syrup', price: 50 },
        { id: 'whipped-cream', label: 'Whipped Cream', price: 60 }
      ],
      visual: { cupColor: '#4B2D1E', foamColor: '#E8D8C3', accentColor: '#3B2418', iced: false }
    },
    {
      id: 'iced-cappuccino',
      name: 'Iced Cappuccino',
      category: 'cappuccino',
      basePrice: 430,
      bestseller: false,
      description: 'Chilled double espresso poured over crystal ice and cold milk, topped with whipped cold foam.',
      ingredients: ['Double Espresso', 'Chilled Milk', 'Ice Cubes', 'Whipped Cold Foam'],
      sizes: DEFAULT_SIZES,
      extras: [
        { id: 'extra-shot', label: 'Extra Espresso Shot', price: 90 },
        { id: 'oat-milk', label: 'Oat / Almond Milk', price: 80 },
        { id: 'caramel-syrup', label: 'Vanilla / Caramel Syrup', price: 50 },
        { id: 'cold-foam', label: 'Salted Sweet Cold Foam', price: 70 }
      ],
      visual: { cupColor: '#654321', foamColor: '#F5EBDD', accentColor: '#C68B59', iced: true }
    },
    {
      id: 'cinnamon-cappuccino',
      name: 'Cinnamon Cappuccino',
      category: 'cappuccino',
      basePrice: 390,
      bestseller: false,
      description: 'Spiced Ceylon cinnamon steamed directly into silky milk over espresso for a cosy aromatic cup.',
      ingredients: ['Double Espresso', 'Ceylon Cinnamon', 'Steamed Milk', 'Spiced Microfoam'],
      sizes: DEFAULT_SIZES,
      extras: [
        { id: 'extra-shot', label: 'Extra Espresso Shot', price: 90 },
        { id: 'oat-milk', label: 'Oat / Almond Milk', price: 80 },
        { id: 'honey-syrup', label: 'Honey / Vanilla Syrup', price: 50 },
        { id: 'whipped-cream', label: 'Whipped Cream', price: 60 }
      ],
      visual: { cupColor: '#A86438', foamColor: '#F5EBDD', accentColor: '#8B4513', iced: false }
    },
    {
      id: 'almond-cappuccino',
      name: 'Almond Cappuccino',
      category: 'cappuccino',
      basePrice: 440,
      bestseller: false,
      description: 'Smooth espresso steamed with creamy roasted almond milk and finished with light toasted-almond foam.',
      ingredients: ['Double Espresso', 'Roasted Almond Milk', 'Almond Essence', 'Velvety Foam'],
      sizes: DEFAULT_SIZES,
      extras: [
        { id: 'extra-shot', label: 'Extra Espresso Shot', price: 90 },
        { id: 'oat-milk', label: 'Oat Milk Swap', price: 80 },
        { id: 'vanilla-syrup', label: 'Vanilla / Caramel Syrup', price: 50 },
        { id: 'almond-flakes', label: 'Toasted Almond Flakes', price: 70 }
      ],
      visual: { cupColor: '#B58963', foamColor: '#F8EFE3', accentColor: '#654321', iced: false }
    }
  ];

  window.COFFEE_PRODUCTS = PRODUCTS;
  window.getProductsByCategory = function (category) {
    if (!category || category === 'all') return PRODUCTS.slice();
    return PRODUCTS.filter((item) => item.category === category);
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatPkr(amount) {
    const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    return 'PKR ' + Math.round(safeAmount).toLocaleString('en-PK');
  }

  function sanitizeQty(rawValue) {
    const parsed = parseInt(String(rawValue).trim(), 10);
    if (!Number.isFinite(parsed) || parsed < MIN_QTY) {
      return MIN_QTY;
    }
    if (parsed > MAX_QTY) {
      return MAX_QTY;
    }
    return parsed;
  }

  function createDrinkArtwork(item) {
    const v = item.visual || { cupColor: '#C68B59', foamColor: '#F5EBDD', accentColor: '#654321', iced: false };
    const altLabel = escapeHtml(`${item.name} illustration`);
    const topFill = v.iced ? '#D9B99B' : v.cupColor;
    const steamStroke = v.iced ? '#9D7B5C' : '#C68B59';

    return `
      <svg viewBox="0 0 160 136" width="144" height="122" fill="none" role="img" aria-label="${altLabel}">
        <path d="M62 34c-3-6 3-10 0-16" stroke="${steamStroke}" stroke-width="2.4" stroke-linecap="round" opacity="0.85" />
        <path d="M80 31c-3-7 3-11 0-18" stroke="${steamStroke}" stroke-width="2.6" stroke-linecap="round" opacity="0.95" />
        <path d="M98 34c-3-6 3-10 0-16" stroke="${steamStroke}" stroke-width="2.4" stroke-linecap="round" opacity="0.85" />

        <ellipse cx="80" cy="111" rx="50" ry="10" fill="#3B2418" opacity="0.12" />
        <ellipse cx="80" cy="105" rx="48" ry="11" fill="#FFFFFF" stroke="#E0D2C2" stroke-width="1.5" />
        <ellipse cx="80" cy="103" rx="30" ry="6" fill="#EFE4D6" />

        <path d="M114 64h9a10 10 0 0 1 0 20h-11" stroke="#FFFFFF" stroke-width="6.5" stroke-linecap="round" />
        <path d="M114 64h9a10 10 0 0 1 0 20h-11" stroke="#E0D2C2" stroke-width="1.5" stroke-linecap="round" />
        <path d="M44 54h72v18c0 18-16 31-36 31S44 90 44 72V54Z" fill="#FFFFFF" stroke="#E0D2C2" stroke-width="1.5" />
        <path d="M51 64c2 15 10 26 22 30" stroke="#F4ECE1" stroke-width="3" stroke-linecap="round" opacity="0.9" />

        <ellipse cx="80" cy="54" rx="36" ry="11" fill="#FFFFFF" stroke="#E0D2C2" stroke-width="1.5" />
        <ellipse cx="80" cy="54" rx="31" ry="8.5" fill="${topFill}" />
        <ellipse cx="80" cy="53" rx="24" ry="6.2" fill="${v.foamColor}" />

        <path d="M80 49c3.5 3.2 6.5 5 6.5 8a6.5 6.5 0 0 1-13 0c0-3 3-4.8 6.5-8Z" fill="${v.accentColor}" opacity="0.72" />
        ${v.iced ? '<rect x="68" y="49" width="7" height="7" rx="1.5" transform="rotate(-14 68 49)" fill="#FFFFFF" opacity="0.75" /><rect x="85" y="48" width="6.5" height="6.5" rx="1.5" transform="rotate(16 85 48)" fill="#FFFFFF" opacity="0.7" />' : ''}
      </svg>
    `;
  }

  function getCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY));
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((entry) => entry && typeof entry === 'object' && entry.id)
        .map((entry) => {
          const qty = sanitizeQty(entry.qty);
          const unitPrice = Number.isFinite(Number(entry.unitPrice))
            ? Number(entry.unitPrice)
            : (Number.isFinite(Number(entry.price)) ? Number(entry.price) : 0);
          return {
            ...entry,
            qty,
            unitPrice,
            price: unitPrice,
            totalPrice: unitPrice * qty,
            extras: Array.isArray(entry.extras) ? entry.extras : []
          };
        });
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      return true;
    } catch {
      return false;
    }
  }

  function getCartTotals(cart) {
    return cart.reduce(
      (acc, entry) => {
        const qty = sanitizeQty(entry.qty);
        const unitPrice = Number.isFinite(Number(entry.unitPrice)) ? Number(entry.unitPrice) : 0;
        acc.count += qty;
        acc.amount += unitPrice * qty;
        return acc;
      },
      { count: 0, amount: 0 }
    );
  }

  function updateCartUI(lastAddedMessage) {
    const cart = getCart();
    const totals = getCartTotals(cart);

    const headerBadge = document.getElementById('cart-count');
    if (headerBadge) {
      headerBadge.textContent = String(totals.count);
    }

    const viewCartBadge = document.getElementById('view-cart-count');
    if (viewCartBadge) {
      viewCartBadge.textContent = String(totals.count);
    }

    const statusBanner = document.getElementById('cart-status');
    if (statusBanner) {
      if (totals.count === 0) {
        statusBanner.hidden = true;
        statusBanner.textContent = '';
      } else {
        const summary = `${totals.count} ${totals.count === 1 ? 'item' : 'items'} in cart (${formatPkr(totals.amount)})`;
        statusBanner.textContent = lastAddedMessage ? `${lastAddedMessage} — ${summary}` : `Cart saved: ${summary}`;
        statusBanner.hidden = false;
      }
    }
  }

  function showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  function computeCardPrice(item, sizeId, extraIds, qty) {
    const safeQty = sanitizeQty(qty);
    const size = item.sizes.find((s) => s.id === sizeId) || item.sizes[0];
    const extrasSum = item.extras
      .filter((e) => extraIds.includes(e.id))
      .reduce((sum, e) => sum + e.price, 0);
    const unitPrice = item.basePrice + (size ? size.priceDelta : 0) + extrasSum;
    return {
      unitPrice,
      totalPrice: unitPrice * safeQty,
      sizeLabel: size ? size.label : 'Standard',
      qty: safeQty
    };
  }

  function addItemToCart(item, selection, triggerButton) {
    const cart = getCart();
    const sortedExtraIds = selection.extras.slice().sort();
    const extraLabels = item.extras
      .filter((e) => sortedExtraIds.includes(e.id))
      .map((e) => e.label);

    const key = [item.id, selection.sizeId, sortedExtraIds.join(',')].join('::');
    const existing = cart.find((entry) => {
      if (entry.key) return entry.key === key;
      const entryExtras = Array.isArray(entry.extraIds) ? entry.extraIds.slice().sort().join(',') : '';
      return entry.id === item.id && (entry.sizeId || 'small') === selection.sizeId && entryExtras === sortedExtraIds.join(',');
    });

    if (existing) {
      existing.key = key;
      existing.qty = Math.min(MAX_QTY, sanitizeQty(existing.qty) + selection.qty);
      existing.unitPrice = selection.unitPrice;
      existing.price = selection.unitPrice;
      existing.totalPrice = selection.unitPrice * existing.qty;
      existing.size = selection.sizeLabel;
      existing.sizeId = selection.sizeId;
      existing.extras = extraLabels;
      existing.extraIds = sortedExtraIds;
    } else {
      cart.push({
        key,
        id: item.id,
        name: item.name,
        category: item.category,
        size: selection.sizeLabel,
        sizeId: selection.sizeId,
        extras: extraLabels,
        extraIds: sortedExtraIds,
        unitPrice: selection.unitPrice,
        price: selection.unitPrice,
        totalPrice: selection.unitPrice * selection.qty,
        qty: selection.qty
      });
    }

    saveCart(cart);

    const confirmText = `Added ${selection.qty}x ${item.name} (${selection.sizeLabel}) to cart`;
    updateCartUI(confirmText);
    showToast(confirmText);

    if (triggerButton) {
      const originalLabel = triggerButton.dataset.originalLabel || triggerButton.textContent;
      triggerButton.dataset.originalLabel = originalLabel;
      triggerButton.textContent = 'Added \u2713';
      triggerButton.classList.add('is-added');
      clearTimeout(triggerButton._addedTimer);
      triggerButton._addedTimer = setTimeout(() => {
        triggerButton.textContent = originalLabel;
        triggerButton.classList.remove('is-added');
      }, 1200);
    }

    if (typeof window.refreshCart === 'function') {
      window.refreshCart();
    }
  }

  function renderCard(item) {
    const sizeOptions = item.sizes
      .map((size) => {
        const deltaText = size.priceDelta > 0 ? ` (+${formatPkr(size.priceDelta)})` : '';
        return `<option value="${escapeHtml(size.id)}">${escapeHtml(size.label)}${escapeHtml(deltaText)}</option>`;
      })
      .join('');

    const extrasOptions = item.extras
      .map(
        (extra) => `
          <label class="extra-option">
            <input type="checkbox" value="${escapeHtml(extra.id)}" data-extra-price="${extra.price}">
            <span>${escapeHtml(extra.label)}</span>
            <span class="extra-price">+${formatPkr(extra.price)}</span>
          </label>
        `
      )
      .join('');

    const ingredientsText = Array.isArray(item.ingredients)
      ? item.ingredients.join(', ')
      : item.ingredients;

    const badgeHtml = item.bestseller
      ? '<span class="bestseller-badge">Bestseller</span>'
      : '';

    const panelId = `customise-${item.id}`;
    const sizeId = `size-${item.id}`;
    const qtyId = `qty-${item.id}`;

    return `
      <article class="product-card cappuccino-card" data-product-id="${escapeHtml(item.id)}">
        <div class="product-thumb">
          ${badgeHtml}
          ${createDrinkArtwork(item)}
        </div>

        <div class="card-body">
          <span class="product-cat">CAPPUCCINO</span>
          <h2 class="product-title">${escapeHtml(item.name)}</h2>
          <p class="product-desc">${escapeHtml(item.description)}</p>
          <p class="product-ingredients"><strong>Ingredients:</strong> ${escapeHtml(ingredientsText)}</p>

          <div class="card-controls">
            <div class="control-group">
              <label for="${escapeHtml(sizeId)}">Size</label>
              <select id="${escapeHtml(sizeId)}" class="size-select">
                ${sizeOptions}
              </select>
            </div>

            <div class="control-group">
              <label for="${escapeHtml(qtyId)}" class="control-label">Quantity</label>
              <div class="qty-control">
                <button type="button" class="qty-btn" data-action="decrease" aria-label="Decrease quantity for ${escapeHtml(item.name)}" disabled>&minus;</button>
                <input type="number" id="${escapeHtml(qtyId)}" class="qty-value" value="1" min="${MIN_QTY}" max="${MAX_QTY}" step="1" inputmode="numeric" aria-label="Quantity for ${escapeHtml(item.name)}">
                <button type="button" class="qty-btn" data-action="increase" aria-label="Increase quantity for ${escapeHtml(item.name)}">+</button>
              </div>
            </div>
          </div>

          <div class="customise-wrap">
            <button type="button" class="customise-toggle" aria-expanded="false" aria-controls="${escapeHtml(panelId)}">
              <span class="customise-arrow" aria-hidden="true">&#9656;</span>
              <span class="customise-label">Customise your drink</span>
            </button>
            <div class="customise-panel" id="${escapeHtml(panelId)}" hidden>
              ${extrasOptions}
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="card-price" aria-live="polite">${escapeHtml(formatPkr(item.basePrice))}</div>
          <div class="card-actions">
            <button type="button" class="btn btn-primary btn-sm add-to-cart-btn">Add to Cart</button>
            <button type="button" class="btn btn-outline btn-sm quick-view-btn">Quick View</button>
          </div>
        </div>
      </article>
    `;
  }

  function syncStepperButtons(container, qty) {
    const decBtn = container.querySelector('.qty-btn[data-action="decrease"]');
    const incBtn = container.querySelector('.qty-btn[data-action="increase"]');
    if (decBtn) decBtn.disabled = qty <= MIN_QTY;
    if (incBtn) incBtn.disabled = qty >= MAX_QTY;
  }

  function readCardSelection(card, item, normalizeInput) {
    const sizeSelect = card.querySelector('.size-select');
    const qtyInput = card.querySelector('.qty-value');
    const checkedExtras = Array.from(card.querySelectorAll('.customise-panel input[type="checkbox"]:checked'))
      .map((cb) => cb.value);

    const sizeId = sizeSelect ? sizeSelect.value : item.sizes[0].id;
    const rawQty = qtyInput ? qtyInput.value : MIN_QTY;
    const qty = sanitizeQty(rawQty);

    if (normalizeInput && qtyInput) {
      qtyInput.value = String(qty);
    }
    syncStepperButtons(card, qty);

    const pricing = computeCardPrice(item, sizeId, checkedExtras, qty);

    return {
      sizeId,
      sizeLabel: pricing.sizeLabel,
      extras: checkedExtras,
      qty: pricing.qty,
      unitPrice: pricing.unitPrice,
      totalPrice: pricing.totalPrice
    };
  }

  function updateCardDisplay(card, item, normalizeInput) {
    const selection = readCardSelection(card, item, normalizeInput);
    const priceEl = card.querySelector('.card-price');
    if (priceEl) {
      priceEl.textContent = formatPkr(selection.totalPrice);
    }

    const customLabel = card.querySelector('.customise-label');
    if (customLabel) {
      customLabel.textContent = selection.extras.length > 0
        ? `Customise your drink (${selection.extras.length} selected)`
        : 'Customise your drink';
    }
  }

  function ensureQuickViewModal() {
    let modal = document.getElementById('quick-view-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'quick-view-modal';
    modal.className = 'qv-backdrop';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'qv-title');

    modal.innerHTML = `
      <div class="qv-dialog">
        <button type="button" class="qv-close" aria-label="Close Quick View">&times;</button>
        <div class="qv-content"></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.qv-close')) {
        closeQuickView();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (modal.hidden) return;
      if (e.key === 'Escape') {
        closeQuickView();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = Array.from(
          modal.querySelectorAll('button:not([disabled]), select:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    return modal;
  }

  let lastFocusedTrigger = null;

  function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
      lastFocusedTrigger.focus();
    }
    lastFocusedTrigger = null;
  }

  function openQuickView(item, card, triggerEl) {
    const modal = ensureQuickViewModal();
    const content = modal.querySelector('.qv-content');
    const selection = readCardSelection(card, item, true);
    lastFocusedTrigger = triggerEl || document.activeElement;

    const ingredientsList = item.ingredients
      .map((ing) => `<li>${escapeHtml(ing)}</li>`)
      .join('');

    const sizeOptions = item.sizes
      .map((size) => {
        const deltaText = size.priceDelta > 0 ? ` (+${formatPkr(size.priceDelta)})` : '';
        const selected = size.id === selection.sizeId ? 'selected' : '';
        return `<option value="${escapeHtml(size.id)}" ${selected}>${escapeHtml(size.label)}${escapeHtml(deltaText)}</option>`;
      })
      .join('');

    const extrasList = item.extras
      .map((extra) => {
        const checked = selection.extras.includes(extra.id) ? 'checked' : '';
        return `
          <label class="extra-option">
            <input type="checkbox" value="${escapeHtml(extra.id)}" ${checked}>
            <span>${escapeHtml(extra.label)}</span>
            <span class="extra-price">+${formatPkr(extra.price)}</span>
          </label>
        `;
      })
      .join('');

    content.innerHTML = `
      <div class="qv-header">
        <div class="qv-art">
          ${item.bestseller ? '<span class="bestseller-badge">Bestseller</span>' : ''}
          ${createDrinkArtwork(item)}
        </div>
        <div>
          <span class="product-cat">CAPPUCCINO</span>
          <h2 id="qv-title">${escapeHtml(item.name)}</h2>
          <p class="qv-desc">${escapeHtml(item.description)}</p>
        </div>
      </div>

      <div class="qv-section">
        <h3>Full Ingredients</h3>
        <ul class="qv-ingredients">${ingredientsList}</ul>
      </div>

      <div class="qv-controls">
        <div class="control-group">
          <label for="qv-size">Size</label>
          <select id="qv-size" class="size-select">${sizeOptions}</select>
        </div>

        <div class="control-group">
          <label for="qv-qty" class="control-label">Quantity</label>
          <div class="qty-control">
            <button type="button" class="qty-btn" data-action="decrease" aria-label="Decrease quantity">&minus;</button>
            <input type="number" id="qv-qty" class="qty-value" value="${selection.qty}" min="${MIN_QTY}" max="${MAX_QTY}" step="1" inputmode="numeric">
            <button type="button" class="qty-btn" data-action="increase" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>

      <div class="qv-section">
        <h3>Extras</h3>
        <div class="qv-extras">${extrasList}</div>
      </div>

      <div class="qv-footer">
        <div class="card-price qv-price">${escapeHtml(formatPkr(selection.totalPrice))}</div>
        <button type="button" class="btn btn-primary qv-add-btn">Add to Cart</button>
      </div>
    `;

    const qvSize = content.querySelector('#qv-size');
    const qvQtyInput = content.querySelector('#qv-qty');
    const qvPriceEl = content.querySelector('.qv-price');

    function getModalSelection(normalizeInput) {
      const sizeId = qvSize.value;
      const qty = sanitizeQty(qvQtyInput.value);
      if (normalizeInput) {
        qvQtyInput.value = String(qty);
      }
      syncStepperButtons(content, qty);
      const extras = Array.from(content.querySelectorAll('.qv-extras input[type="checkbox"]:checked'))
        .map((cb) => cb.value);
      const pricing = computeCardPrice(item, sizeId, extras, qty);
      return { sizeId, extras, ...pricing };
    }

    function syncModalPrice(normalizeInput) {
      qvPriceEl.textContent = formatPkr(getModalSelection(normalizeInput).totalPrice);
    }

    syncStepperButtons(content, selection.qty);
    qvSize.addEventListener('change', () => syncModalPrice(true));
    qvQtyInput.addEventListener('input', () => syncModalPrice(false));
    qvQtyInput.addEventListener('change', () => syncModalPrice(true));
    qvQtyInput.addEventListener('blur', () => syncModalPrice(true));

    content.querySelectorAll('.qv-extras input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => syncModalPrice(true));
    });
    content.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = sanitizeQty(qvQtyInput.value);
        const next = btn.dataset.action === 'increase'
          ? Math.min(MAX_QTY, current + 1)
          : Math.max(MIN_QTY, current - 1);
        qvQtyInput.value = String(next);
        syncModalPrice(true);
      });
    });

    content.querySelector('.qv-add-btn').addEventListener('click', () => {
      addItemToCart(item, getModalSelection(true));
      closeQuickView();
    });

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.qv-close').focus();
  }

  function renderCategoryGrid() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const category = (document.body.dataset.category || '').trim().toLowerCase();
    const items = window.getProductsByCategory(category);
    const fallbackEl = document.getElementById('grid-fallback');

    if (!items.length) {
      if (fallbackEl) fallbackEl.hidden = false;
      return;
    }

    if (fallbackEl) {
      fallbackEl.hidden = true;
    }

    grid.innerHTML = items.map(renderCard).join('');

    grid.addEventListener('input', (e) => {
      if (!e.target.matches('.qty-value')) return;
      const card = e.target.closest('.cappuccino-card');
      if (!card) return;
      const item = items.find((p) => p.id === card.dataset.productId);
      if (!item) return;
      updateCardDisplay(card, item, false);
    });

    grid.addEventListener('change', (e) => {
      const card = e.target.closest('.cappuccino-card');
      if (!card) return;
      const item = items.find((p) => p.id === card.dataset.productId);
      if (!item) return;

      if (
        e.target.matches('.size-select') ||
        e.target.matches('.qty-value') ||
        e.target.matches('.customise-panel input[type="checkbox"]')
      ) {
        updateCardDisplay(card, item, true);
      }
    });

    grid.addEventListener(
      'blur',
      (e) => {
        if (!e.target.matches('.qty-value')) return;
        const card = e.target.closest('.cappuccino-card');
        if (!card) return;
        const item = items.find((p) => p.id === card.dataset.productId);
        if (!item) return;
        updateCardDisplay(card, item, true);
      },
      true
    );

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.cappuccino-card');
      if (!card) return;
      const item = items.find((p) => p.id === card.dataset.productId);
      if (!item) return;

      const qtyBtn = e.target.closest('.qty-btn');
      if (qtyBtn) {
        const qtyInput = card.querySelector('.qty-value');
        const current = sanitizeQty(qtyInput ? qtyInput.value : MIN_QTY);
        const next = qtyBtn.dataset.action === 'increase'
          ? Math.min(MAX_QTY, current + 1)
          : Math.max(MIN_QTY, current - 1);
        if (qtyInput) {
          qtyInput.value = String(next);
        }
        updateCardDisplay(card, item, true);
        return;
      }

      const toggleBtn = e.target.closest('.customise-toggle');
      if (toggleBtn) {
        const panelId = toggleBtn.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : card.querySelector('.customise-panel');
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
        if (panel) {
          panel.hidden = isExpanded;
        }
        return;
      }

      const addBtn = e.target.closest('.add-to-cart-btn');
      if (addBtn) {
        const selection = readCardSelection(card, item, true);
        updateCardDisplay(card, item, true);
        addItemToCart(item, selection, addBtn);
        return;
      }

      const quickViewBtn = e.target.closest('.quick-view-btn');
      if (quickViewBtn) {
        openQuickView(item, card, quickViewBtn);
      }
    });
  }

  function initFallbackNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const primaryNav = document.getElementById('primary-nav');

    if (navToggle && primaryNav && !navToggle.dataset.navBound) {
      navToggle.dataset.navBound = 'true';
      navToggle.addEventListener('click', () => {
        const isOpen = primaryNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });
    }

    document.querySelectorAll('.has-dropdown').forEach((dropdown) => {
      const trigger = dropdown.querySelector('.nav-link');
      if (!trigger || trigger.dataset.navBound) return;
      trigger.dataset.navBound = 'true';
      trigger.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
          e.preventDefault();
          dropdown.classList.toggle('open');
          const expanded = dropdown.classList.contains('open');
          trigger.setAttribute('aria-expanded', String(expanded));
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderCategoryGrid();
    updateCartUI();
    initFallbackNavigation();
  });
})();