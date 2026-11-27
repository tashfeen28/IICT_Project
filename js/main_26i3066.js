/* ==========================================================================
   The Coffee Circle — Product Grid Rendering, Live Pricing & Quick View Modal
   ========================================================================== */

(function () {
  'use strict';

  var activeTriggerBtn = null;
  var toastTimer = null;

  /**
   * Resolve root path prefix from <body data-root="...">, defaulting to "./"
   * or "../" when served from /pages/.
   */
  function getRootPath() {
    var rawRoot = document.body && document.body.dataset ? document.body.dataset.root : '';
    if (!rawRoot) {
      var normalizedPath = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
      rawRoot = normalizedPath.indexOf('/pages/') !== -1 ? '../' : './';
    }
    return rawRoot.charAt(rawRoot.length - 1) === '/' ? rawRoot : rawRoot + '/';
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
    return 'PKR ' + Number(amount || 0).toLocaleString('en-US');
  }

  /**
   * Read the catalog from global products array.
   */
  function getCatalog() {
    if (Array.isArray(window.products)) return window.products;
    if (typeof products !== 'undefined' && Array.isArray(products)) return products;
    return [];
  }

  /**
   * Filter products using <body data-category="...">.
   */
  function getFilteredProducts() {
    var category =
      document.body && document.body.dataset && document.body.dataset.category
        ? document.body.dataset.category.trim().toLowerCase()
        : '';
    var catalog = getCatalog();

    if (!category || category === 'all') {
      return catalog;
    }

    return catalog.filter(function (item) {
      return item && String(item.category || '').toLowerCase() === category;
    });
  }

  /**
   * Calculate total unit price for a product given a size index and extra indices.
   */
  function calculateUnitPrice(product, sizeIndex, extraIndices) {
    var size = (product.sizes && product.sizes[sizeIndex]) || { delta: 0 };
    var extrasTotal = (extraIndices || []).reduce(function (sum, idx) {
      var extra = product.extras && product.extras[idx];
      return sum + (extra ? Number(extra.price || 0) : 0);
    }, 0);
    return Number(product.basePrice || 0) + Number(size.delta || 0) + extrasTotal;
  }

  /**
   * Inject inline-friendly artwork & badge styles once so product cards always
   * match the Cold Coffee visual spec.
   */
  function ensureProductArtworkStyles() {
    if (document.getElementById('tcc-product-artwork-styles')) return;
    var style = document.createElement('style');
    style.id = 'tcc-product-artwork-styles';
    style.textContent =
      '.product-card-media {' +
      '  background: #E8D8C3;' +
      '  border-radius: 16px;' +
      '  min-height: 225px;' +
      '  display: flex;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  position: relative;' +
      '  padding: 16px;' +
      '  overflow: hidden;' +
      '}' +
      '.bestseller-badge {' +
      '  position: absolute;' +
      '  bottom: 12px;' +
      '  right: 12px;' +
      '  background: #C69C6D;' +
      '  color: #24140D;' +
      '  font-size: 0.76rem;' +
      '  font-weight: 600;' +
      '  border-radius: 999px;' +
      '  padding: 5px 14px;' +
      '  line-height: 1.25;' +
      '}';
    document.head.appendChild(style);
  }

  /**
   * Distinct coffee, swirl, foam, and straw palettes for each iced coffee drink.
   */
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
   * Return whether a product should carry the "Bestseller" pill badge.
   */
  function isBestsellerProduct(product) {
    if (!product) return false;
    var name = String(product.name || '').toLowerCase();
    var id = String(product.id || '').toLowerCase();
    return (
      id === 'vanilla-sweet-cream-cold-brew' ||
      name === 'vanilla sweet cream cold brew'
    );
  }

  /**
   * Build the custom inline iced-coffee glass SVG artwork for a drink.
   */
  function buildDrinkSvg(product, scopePrefix) {
    var palette = DRINK_PALETTES[product.id] || DRINK_PALETTES['cold-brew-classic'];
    var safeId = String((scopePrefix || 'card') + '-' + (product.id || 'drink')).replace(
      /[^a-zA-Z0-9_-]/g,
      ''
    );
    var clipId = 'glass-clip-' + safeId;

    var drizzleMarkup = palette.hasDrizzle
      ? '<path d="M62 84 Q78 96 92 86 T120 88 T138 82" fill="none" stroke="' +
        palette.drizzle +
        '" stroke-width="3.2" stroke-linecap="round" opacity="0.85" />' +
        '<path d="M74 102 Q88 122 86 144" fill="none" stroke="' +
        palette.drizzle +
        '" stroke-width="2.6" stroke-linecap="round" opacity="0.55" />' +
        '<path d="M118 96 Q112 118 117 136" fill="none" stroke="' +
        palette.drizzle +
        '" stroke-width="2.4" stroke-linecap="round" opacity="0.5" />'
      : '';

    return (
      '<svg viewBox="0 0 200 220" width="175" height="190" role="img" aria-label="' +
      escapeHtml(product.name) +
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
      '    <rect x="85" y="106" width="20" height="18" rx="5" ry="5" fill="rgba(255, 255, 255, 0.22)" stroke="rgba(255, 255, 255, 0.42)" stroke-width="1.4" transform="rotate(8 95 115)" />' +
      '    <path d="M65 66 L74 176" stroke="rgba(255, 255, 255, 0.25)" stroke-width="3.5" stroke-linecap="round" />' +
      '  </g>' +
      '  <path d="M58 58 L69 178 Q70 188 81 188 L119 188 Q130 188 131 178 L142 58" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />' +
      '  <ellipse cx="100" cy="58" rx="42" ry="5.5" fill="none" stroke="#FFFFFF" stroke-width="4" />' +
      '</svg>'
    );
  }

  /**
   * Show a brief toast notification at the bottom-right corner.
   */
  function showToast(message) {
    var toast = document.getElementById('tcc-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tcc-toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.hidden = false;

    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 2800);
  }

  /**
   * Add customized item via window.Cart?.addItem or localStorage fallback.
   */
  function addCustomizedItemToCart(product, sizeIndex, extraIndices) {
    var selectedSize =
      (product.sizes && product.sizes[sizeIndex]) || { label: 'Small', delta: 0 };
    var selectedExtras = (extraIndices || [])
      .map(function (idx) {
        return product.extras && product.extras[idx];
      })
      .filter(Boolean);
    var unitPrice = calculateUnitPrice(product, sizeIndex, extraIndices);

    var cartItem = {
      id: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      basePrice: product.basePrice,
      size: selectedSize.label,
      sizeDelta: selectedSize.delta,
      extras: selectedExtras.map(function (extra) {
        return { id: extra.id, label: extra.label, price: extra.price };
      }),
      unitPrice: unitPrice,
      price: unitPrice,
      quantity: 1
    };

    if (window.Cart && typeof window.Cart.addItem === 'function') {
      window.Cart.addItem(cartItem);
    } else {
      try {
        var key = 'coffeeCircleCart';
        var existing = JSON.parse(window.localStorage.getItem(key) || '[]');
        if (!Array.isArray(existing)) existing = [];

        var extrasKey = cartItem.extras
          .map(function (e) {
            return e.id;
          })
          .sort()
          .join(',');

        var match = existing.find(function (entry) {
          var entryExtrasKey = Array.isArray(entry.extras)
            ? entry.extras
                .map(function (e) {
                  return e.id;
                })
                .sort()
                .join(',')
            : '';
          return (
            entry.id === cartItem.id &&
            entry.size === cartItem.size &&
            entryExtrasKey === extrasKey
          );
        });

        if (match) {
          match.quantity = Number(match.quantity || 1) + 1;
        } else {
          existing.push(cartItem);
        }

        window.localStorage.setItem(key, JSON.stringify(existing));
      } catch (err) {
        // Ignore storage quota or private-browsing errors.
      }

      if (typeof window.updateCartBadge === 'function') {
        window.updateCartBadge();
      }
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: cartItem }));
    }

    var extrasSummary =
      selectedExtras.length > 0 ? ' + ' + selectedExtras.length + ' extra(s)' : '';
    showToast(
      'Added ' +
        product.name +
        ' (' +
        selectedSize.label +
        extrasSummary +
        ') — ' +
        formatPKR(unitPrice)
    );
  }

  /**
   * Read the currently selected size index & extra indices from a container element.
   */
  function getSelectionFromContainer(container) {
    var activeSizeBtn = container.querySelector('.size-btn.active');
    var sizeIndex = activeSizeBtn ? Number(activeSizeBtn.dataset.sizeIndex || 0) : 0;

    var checkedExtras = container.querySelectorAll('input[data-extra-index]:checked');
    var extraIndices = Array.prototype.map.call(checkedExtras, function (input) {
      return Number(input.dataset.extraIndex);
    });

    return { sizeIndex: sizeIndex, extraIndices: extraIndices };
  }

  /**
   * Apply size index & extra indices onto a container and refresh its live price.
   */
  function syncContainerSelection(container, product, sizeIndex, extraIndices) {
    var sizeButtons = container.querySelectorAll('.size-btn');
    Array.prototype.forEach.call(sizeButtons, function (btn) {
      var isSelected = Number(btn.dataset.sizeIndex) === sizeIndex;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    var extraCheckboxes = container.querySelectorAll('input[data-extra-index]');
    Array.prototype.forEach.call(extraCheckboxes, function (checkbox) {
      var idx = Number(checkbox.dataset.extraIndex);
      checkbox.checked = extraIndices.indexOf(idx) !== -1;
    });

    updateContainerPrice(container, product);
  }

  /**
   * Recalculate and render the live price inside a card or modal container.
   */
  function updateContainerPrice(container, product) {
    var selection = getSelectionFromContainer(container);
    var priceEl = container.querySelector('[data-role="price"]');
    if (!priceEl) return;
    priceEl.textContent = formatPKR(
      calculateUnitPrice(product, selection.sizeIndex, selection.extraIndices)
    );
  }

  /**
   * Build HTML markup for size buttons and extras checkboxes.
   */
  function buildOptionsMarkup(product, prefix) {
    var sizesHtml = (product.sizes || [])
      .map(function (size, idx) {
        var isDefault = idx === 0;
        var deltaLabel = size.delta > 0 ? ' (+' + size.delta + ')' : '';
        return (
          '<button type="button" class="size-btn' +
          (isDefault ? ' active' : '') +
          '" data-size-index="' +
          idx +
          '" aria-pressed="' +
          (isDefault ? 'true' : 'false') +
          '">' +
          escapeHtml(size.label + deltaLabel) +
          '</button>'
        );
      })
      .join('');

    var extrasHtml = (product.extras || [])
      .map(function (extra, idx) {
        var inputId = prefix + '-' + product.id + '-extra-' + idx;
        return (
          '<label class="extra-option" for="' +
          escapeHtml(inputId) +
          '">' +
          '  <span style="display:inline-flex;align-items:center;gap:0.5rem;">' +
          '    <input type="checkbox" id="' +
          escapeHtml(inputId) +
          '" data-extra-index="' +
          idx +
          '">' +
          '    <span>' +
          escapeHtml(extra.label) +
          '</span>' +
          '  </span>' +
          '  <span class="text-muted">+' +
          escapeHtml(formatPKR(extra.price)) +
          '</span>' +
          '</label>'
        );
      })
      .join('');

    return (
      '<div class="product-options">' +
      '  <div class="option-group">' +
      '    <span class="option-label">Size</span>' +
      '    <div class="size-selector" role="group" aria-label="Choose drink size">' +
      sizesHtml +
      '    </div>' +
      '  </div>' +
      '  <div class="option-group">' +
      '    <span class="option-label">Extras</span>' +
      '    <div class="extras-list">' +
      extrasHtml +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
  }

  /**
   * Wire shared size-button, extras-checkbox, and Add-to-Cart button events on a container.
   */
  function bindOptionEvents(container, product, onSelectionChange) {
    container.addEventListener('click', function (event) {
      var sizeBtn = event.target.closest('.size-btn');
      if (sizeBtn && container.contains(sizeBtn)) {
        var chosenIndex = Number(sizeBtn.dataset.sizeIndex || 0);
        var current = getSelectionFromContainer(container);
        syncContainerSelection(container, product, chosenIndex, current.extraIndices);
        if (typeof onSelectionChange === 'function') {
          onSelectionChange(getSelectionFromContainer(container));
        }
        return;
      }

      var addBtn = event.target.closest('[data-action="add-to-cart"]');
      if (addBtn && container.contains(addBtn)) {
        var selection = getSelectionFromContainer(container);
        addCustomizedItemToCart(product, selection.sizeIndex, selection.extraIndices);

        var originalLabel = addBtn.textContent;
        addBtn.textContent = 'Added!';
        window.setTimeout(function () {
          addBtn.textContent = originalLabel;
        }, 900);
      }
    });

    container.addEventListener('change', function (event) {
      if (event.target.matches('input[data-extra-index]')) {
        updateContainerPrice(container, product);
        if (typeof onSelectionChange === 'function') {
          onSelectionChange(getSelectionFromContainer(container));
        }
      }
    });
  }

  /**
   * Create or return the singleton Quick View modal element.
   */
  function ensureQuickViewModal() {
    var existing = document.getElementById('quick-view-modal');
    if (existing) return existing;

    var modal = document.createElement('div');
    modal.id = 'quick-view-modal';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'quick-view-title');

    modal.innerHTML =
      '<div class="modal-dialog">' +
      '  <div class="modal-header">' +
      '    <h2 class="modal-title" id="quick-view-title">Quick View</h2>' +
      '    <button type="button" class="modal-close" data-action="close-modal" aria-label="Close quick view">&times;</button>' +
      '  </div>' +
      '  <div class="modal-body" id="quick-view-body"></div>' +
      '  <div class="modal-footer" id="quick-view-footer">' +
      '    <button type="button" class="btn btn-outline btn-sm" data-action="close-modal">Close</button>' +
      '    <button type="button" class="btn btn-primary" data-action="add-to-cart">Add to Cart</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(modal);

    modal.addEventListener('click', function (event) {
      if (
        event.target === modal ||
        event.target.closest('[data-action="close-modal"]')
      ) {
        closeQuickViewModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        closeQuickViewModal();
      }
    });

    return modal;
  }

  /**
   * Close the Quick View modal and restore focus to its trigger button.
   */
  function closeQuickViewModal() {
    var modal = document.getElementById('quick-view-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (activeTriggerBtn && typeof activeTriggerBtn.focus === 'function') {
      activeTriggerBtn.focus();
      activeTriggerBtn = null;
    }
  }

  /**
   * Open the Quick View modal for a product, preserving card size/extras state.
   */
  function openQuickViewModal(product, cardEl, root, triggerBtn) {
    var modal = ensureQuickViewModal();
    var titleEl = modal.querySelector('#quick-view-title');
    var bodyEl = modal.querySelector('#quick-view-body');
    var footerAddBtn = modal.querySelector('#quick-view-footer [data-action="add-to-cart"]');

    activeTriggerBtn = triggerBtn || document.activeElement;
    titleEl.textContent = product.name;

    var cardSelection = getSelectionFromContainer(cardEl);
    var ingredientsHtml = (product.ingredients || [])
      .map(function (ingredient) {
        return '<li>' + escapeHtml(ingredient) + '</li>';
      })
      .join('');

    var badgeHtml = isBestsellerProduct(product)
      ? '<span class="bestseller-badge">Bestseller</span>'
      : '';

    bodyEl.innerHTML =
      '<div class="modal-product-hero">' +
      buildDrinkSvg(product, 'modal') +
      badgeHtml +
      '</div>' +
      '<p class="product-description">' +
      escapeHtml(product.description) +
      '</p>' +
      '<div class="modal-price-row">' +
      '  <span class="option-label">Selected Total</span>' +
      '  <span class="product-price" data-role="price">' +
      escapeHtml(
        formatPKR(
          calculateUnitPrice(
            product,
            cardSelection.sizeIndex,
            cardSelection.extraIndices
          )
        )
      ) +
      '  </span>' +
      '</div>' +
      '<div class="option-group">' +
      '  <span class="option-label">Ingredients</span>' +
      '  <ul class="ingredient-list">' +
      ingredientsHtml +
      '  </ul>' +
      '</div>' +
      buildOptionsMarkup(product, 'modal');

    // Replace modal dialog listeners cleanly per product open by cloning body/footer button.
    var freshAddBtn = footerAddBtn.cloneNode(true);
    footerAddBtn.parentNode.replaceChild(freshAddBtn, footerAddBtn);

    var dialogEl = modal.querySelector('.modal-dialog');

    function handleModalSizeOrExtra(event) {
      var sizeBtn = event.target.closest('.size-btn');
      if (sizeBtn && bodyEl.contains(sizeBtn)) {
        var chosenIndex = Number(sizeBtn.dataset.sizeIndex || 0);
        var current = getSelectionFromContainer(bodyEl);
        syncContainerSelection(bodyEl, product, chosenIndex, current.extraIndices);
        syncContainerSelection(cardEl, product, chosenIndex, current.extraIndices);
      }
    }

    function handleModalCheckbox(event) {
      if (event.target.matches('input[data-extra-index]')) {
        var current = getSelectionFromContainer(bodyEl);
        updateContainerPrice(bodyEl, product);
        syncContainerSelection(cardEl, product, current.sizeIndex, current.extraIndices);
      }
    }

    // Clear any prior product-specific listeners stored on dialogEl.
    if (dialogEl._tccCleanup) {
      dialogEl._tccCleanup();
    }

    bodyEl.addEventListener('click', handleModalSizeOrExtra);
    bodyEl.addEventListener('change', handleModalCheckbox);

    freshAddBtn.addEventListener('click', function () {
      var selection = getSelectionFromContainer(bodyEl);
      addCustomizedItemToCart(product, selection.sizeIndex, selection.extraIndices);
      closeQuickViewModal();
    });

    dialogEl._tccCleanup = function () {
      bodyEl.removeEventListener('click', handleModalSizeOrExtra);
      bodyEl.removeEventListener('change', handleModalCheckbox);
    };

    syncContainerSelection(
      bodyEl,
      product,
      cardSelection.sizeIndex,
      cardSelection.extraIndices
    );

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    var closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  /**
   * Render a single product card DOM node.
   */
  function createProductCard(product, root) {
    var card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    var badgeHtml = isBestsellerProduct(product)
      ? '<span class="bestseller-badge">Bestseller</span>'
      : '';

    card.innerHTML =
      '<div class="product-card-media">' +
      buildDrinkSvg(product, 'card') +
      badgeHtml +
      '</div>' +
      '<div class="product-card-body">' +
      '  <div class="product-header">' +
      '    <h2 class="product-title">' +
      escapeHtml(product.name) +
      '</h2>' +
      '    <span class="product-price" data-role="price">' +
      escapeHtml(formatPKR(product.basePrice)) +
      '</span>' +
      '  </div>' +
      '  <p class="product-description">' +
      escapeHtml(product.description) +
      '</p>' +
      buildOptionsMarkup(product, 'card') +
      '  <div class="product-actions">' +
      '    <button type="button" class="btn btn-primary btn-sm" data-action="add-to-cart">Add to Cart</button>' +
      '    <button type="button" class="btn btn-outline btn-sm" data-action="quick-view">Quick View</button>' +
      '  </div>' +
      '</div>';

    bindOptionEvents(card, product);

    var quickViewBtn = card.querySelector('[data-action="quick-view"]');
    if (quickViewBtn) {
      quickViewBtn.addEventListener('click', function () {
        openQuickViewModal(product, card, root, quickViewBtn);
      });
    }

    return card;
  }

  /**
   * Render matching products or empty-state fallback into #product-grid.
   */
  function renderProductGrid() {
    var grid = document.getElementById('product-grid');
    if (!grid) return;

    ensureProductArtworkStyles();

    var root = getRootPath();
    var matchingProducts = getFilteredProducts();
    grid.innerHTML = '';

    if (!matchingProducts.length) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML =
        '<h2>No Drinks Available Right Now</h2>' +
        '<p>We could not find any drinks matching this collection. Explore our full menu for freshly roasted espresso and cold brews.</p>' +
        '<a href="' +
        escapeHtml(root + 'pages/menu.html') +
        '" class="btn btn-primary">Explore Full Menu</a>';
      grid.appendChild(empty);
      return;
    }

    var fragment = document.createDocumentFragment();
    matchingProducts.forEach(function (product) {
      fragment.appendChild(createProductCard(product, root));
    });
    grid.appendChild(fragment);
  }

  if (document.readyState !== 'loading' || document.getElementById('product-grid')) {
    renderProductGrid();
  } else {
    document.addEventListener('DOMContentLoaded', renderProductGrid);
  }
})();
