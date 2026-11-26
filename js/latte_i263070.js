(function () {
  /* ============================================================
     DATA
  ============================================================ */
  const LATTES = [
    {
      id: 'classic-latte',
      name: 'Classic Latte',
      basePrice: 380,
      badge: null,
      desc: 'Two shots of espresso blended with velvety steamed whole milk and a thin layer of microfoam—simple, satisfying, timeless.',
      ingredients: ['Double espresso', 'Steamed whole milk', 'Light microfoam'],
      cupLight: '#D4A875',
      cupDark: '#654321',
      foamColor: '#F5EBDD'
    },
    {
      id: 'vanilla-latte',
      name: 'Vanilla Latte',
      basePrice: 420,
      badge: null,
      desc: 'Classic latte kissed with house-made Madagascar vanilla syrup for a naturally sweet, aromatic finish.',
      ingredients: ['Double espresso', 'Steamed whole milk', 'Madagascar vanilla syrup', 'Microfoam'],
      cupLight: '#C8A07A',
      cupDark: '#7a5c35',
      foamColor: '#FAF0E6'
    },
    {
      id: 'caramel-latte',
      name: 'Caramel Latte',
      basePrice: 430,
      badge: 'Bestseller',
      desc: 'Espresso meets house-crafted salted caramel sauce swirled through steamed milk for a golden, indulgent cup.',
      ingredients: ['Double espresso', 'Steamed whole milk', 'Salted caramel sauce', 'Caramel drizzle', 'Microfoam'],
      cupLight: '#C68B59',
      cupDark: '#3B2418',
      foamColor: '#F5EBDD'
    },
    {
      id: 'hazelnut-latte',
      name: 'Hazelnut Latte',
      basePrice: 440,
      badge: null,
      desc: 'Rich espresso paired with toasted hazelnut syrup and silky steamed milk—nutty, warm and deeply comforting.',
      ingredients: ['Double espresso', 'Steamed whole milk', 'Toasted hazelnut syrup', 'Microfoam'],
      cupLight: '#B8864E',
      cupDark: '#4a3020',
      foamColor: '#EEE0CC'
    },
    {
      id: 'spanish-latte',
      name: 'Spanish Latte',
      basePrice: 480,
      badge: 'Bestseller',
      desc: 'Bold espresso poured over sweetened condensed milk, topped with lightly steamed whole milk—a creamy café classic.',
      ingredients: ['Double espresso', 'Sweetened condensed milk', 'Steamed whole milk', 'Microfoam'],
      cupLight: '#D4B896',
      cupDark: '#5a3d20',
      foamColor: '#FFF8F0'
    },
    {
      id: 'iced-latte',
      name: 'Iced Latte',
      basePrice: 450,
      badge: null,
      desc: 'Chilled espresso shaken over ice and finished with cold fresh milk—clean, refreshing, and endlessly drinkable.',
      ingredients: ['Double espresso', 'Cold whole milk', 'Ice cubes'],
      cupLight: '#90BCD8',
      cupDark: '#3B6080',
      foamColor: '#E0F0FA'
    },
    {
      id: 'mocha-latte',
      name: 'Mocha Latte',
      basePrice: 500,
      badge: null,
      desc: 'Espresso meets rich dark chocolate sauce in a steamed-milk embrace, finished with a cocoa-dusted microfoam crown.',
      ingredients: ['Double espresso', 'Dark chocolate sauce', 'Steamed whole milk', 'Cocoa powder', 'Microfoam'],
      cupLight: '#6B4226',
      cupDark: '#2d1c13',
      foamColor: '#C8A07A'
    },
    {
      id: 'cinnamon-latte',
      name: 'Cinnamon Latte',
      basePrice: 420,
      badge: null,
      desc: 'Warming espresso with Ceylon cinnamon syrup and steamed milk, dusted with freshly ground cinnamon for cosy depth.',
      ingredients: ['Double espresso', 'Ceylon cinnamon syrup', 'Steamed whole milk', 'Ground cinnamon', 'Microfoam'],
      cupLight: '#C4813A',
      cupDark: '#5c2e0e',
      foamColor: '#FAE0C8'
    }
  ];

  const SIZES = [
    { label: 'Small', adj: 0 },
    { label: 'Medium', adj: 60 },
    { label: 'Large', adj: 120 }
  ];

  const ADDONS = [
    { key: 'extra-shot', label: 'Extra espresso shot', price: 80 },
    { key: 'oat-milk', label: 'Oat milk', price: 60 },
    { key: 'extra-syrup', label: 'Extra syrup', price: 40 },
    { key: 'whipped-cream', label: 'Whipped cream', price: 50 }
  ];

  const CART_KEY = 'coffee_circle_cart';

  /* ============================================================
     SVG GENERATOR
  ============================================================ */
  function makeCupSVG(item, size = 96) {
    const { cupLight, cupDark, foamColor } = item;
    return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="52" fill="${foamColor}" opacity="0.5"/>
      <path d="M28 44h56v30a28 28 0 0 1-56 0V44Z" fill="${cupDark}"/>
      <path d="M84 50h8a9 9 0 0 1 0 18h-8" stroke="${cupLight}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="56" cy="44" rx="28" ry="7" fill="${foamColor}"/>
      <ellipse cx="56" cy="44" rx="18" ry="4" fill="${cupLight}" opacity="0.6"/>
      <path d="M44 32c0-3 2-5 2-8M60 32c0-3 2-5 2-8" stroke="${cupLight}" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
  }

  /* ============================================================
     HELPERS
  ============================================================ */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (!el) return;
    const total = getCart().reduce((s, i) => s + (i.qty || 1), 0);
    el.textContent = total;
  }

  function showToast(msg) {
    let t = document.getElementById('toast-notification');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast-notification';
      t.className = 'toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function calcUnitPrice(basePrice, sizeAdj, checkedAddons) {
    const addonTotal = checkedAddons.reduce((s, k) => {
      const a = ADDONS.find(x => x.key === k);
      return s + (a ? a.price : 0);
    }, 0);
    return basePrice + sizeAdj + addonTotal;
  }

  /* ============================================================
     CARD BUILDER
  ============================================================ */
  function buildCard(item) {
    const addonHTML = ADDONS.map(a => `
      <label class="addon-label">
        <input type="checkbox" class="addon-cb" data-price="${a.price}" data-key="${a.key}">
        ${a.label} <span class="addon-price">+PKR ${a.price}</span>
      </label>`).join('');

    const sizeOpts = SIZES.map(s =>
      `<option value="${s.adj}">${s.label}${s.adj ? ' (+' + s.adj + ')' : ''}</option>`
    ).join('');

    const badgeHTML = item.badge
      ? `<span class="product-badge">${item.badge}</span>`
      : '';

    const ingredientsHTML = item.ingredients
      .map(i => `<li>${i}</li>`).join('');

    return `
      <article class="product-card latte-card" data-id="${item.id}" data-base="${item.basePrice}">
        <div class="product-thumb">
          ${makeCupSVG(item, 88)}
          ${badgeHTML}
        </div>

        <div class="product-meta">
          <span class="product-cat">Latte</span>
          <span class="product-price" data-price>PKR ${item.basePrice}</span>
        </div>

        <h3>${item.name}</h3>
        <p class="product-desc">${item.desc}</p>

        <ul class="ingredient-list">${ingredientsHTML}</ul>

        <div class="card-controls">
          <div class="control-row">
            <label class="control-label" for="size-${item.id}">Size</label>
            <select class="size-select" id="size-${item.id}">
              ${sizeOpts}
            </select>
          </div>

          <div class="control-row">
            <label class="control-label">Qty</label>
            <div class="qty-control">
              <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">&#8722;</button>
              <span class="qty-value">1</span>
              <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">&#43;</button>
            </div>
          </div>
        </div>

        <details class="customise">
          <summary>Customise &amp; Add-ons</summary>
          <div class="addon-grid">${addonHTML}</div>
        </details>

        <div class="product-actions">
          <button type="button" class="btn btn-outline btn-sm quick-view-btn" data-id="${item.id}">Quick View</button>
          <button type="button" class="btn btn-primary btn-sm add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
        </div>
      </article>`;
  }

  /* ============================================================
     RENDER GRID
  ============================================================ */
  function renderGrid() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = LATTES.map(buildCard).join('');
  }

  /* ============================================================
     LIVE PRICE UPDATER
  ============================================================ */
  function getCardState(card) {
    const base = parseInt(card.dataset.base, 10);
    const sizeAdj = parseInt(card.querySelector('.size-select').value, 10);
    const checked = Array.from(card.querySelectorAll('.addon-cb:checked'))
      .map(cb => cb.dataset.key);
    return { base, sizeAdj, checked };
  }

  function refreshPrice(card) {
    const { base, sizeAdj, checked } = getCardState(card);
    const unit = calcUnitPrice(base, sizeAdj, checked);
    card.querySelector('[data-price]').textContent = `PKR ${unit}`;
  }

  /* ============================================================
     MODAL
  ============================================================ */
  function openModal(item) {
    let overlay = document.getElementById('qv-modal');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'qv-modal';
    overlay.className = 'modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-title');

    overlay.innerHTML = `
      <div class="modal-box">
        <button class="modal-close" aria-label="Close modal">&#x2715;</button>

        <div class="modal-visual">
          ${makeCupSVG(item, 130)}
        </div>

        <div class="modal-body">
          <span class="product-cat">Latte</span>
          ${item.badge ? `<span class="product-badge">${item.badge}</span>` : ''}
          <h2 id="modal-title">${item.name}</h2>
          <p>${item.desc}</p>

          <h3 class="modal-subheading">Ingredients</h3>
          <ul class="ingredient-list">
            ${item.ingredients.map(i => `<li>${i}</li>`).join('')}
          </ul>

          <h3 class="modal-subheading">Pricing</h3>
          <ul class="size-pricing">
            ${SIZES.map(s => `<li><strong>${s.label}:</strong> PKR ${item.basePrice + s.adj}</li>`).join('')}
          </ul>

          <a href="product-details.html?id=${item.id}" class="btn btn-caramel btn-sm" style="margin-top:1rem;">
            View Full Details
          </a>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
    overlay.querySelector('.modal-close').focus();
  }

  function closeModal() {
    const overlay = document.getElementById('qv-modal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    document.body.style.overflow = '';
  }

  /* ============================================================
     EVENT DELEGATION
  ============================================================ */
  function initEvents() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.addEventListener('change', (e) => {
      const card = e.target.closest('.latte-card');
      if (card) refreshPrice(card);
    });

    grid.addEventListener('click', (e) => {
      const minusBtn = e.target.closest('.qty-minus');
      const plusBtn  = e.target.closest('.qty-plus');
      const cartBtn  = e.target.closest('.add-to-cart-btn');
      const qvBtn    = e.target.closest('.quick-view-btn');

      if (minusBtn || plusBtn) {
        const qtyEl = (minusBtn || plusBtn).closest('.qty-control').querySelector('.qty-value');
        let v = parseInt(qtyEl.textContent, 10);
        v = minusBtn ? Math.max(1, v - 1) : Math.min(20, v + 1);
        qtyEl.textContent = v;
        return;
      }

      if (cartBtn) {
        const id   = cartBtn.dataset.id;
        const item = LATTES.find(x => x.id === id);
        const card = cartBtn.closest('.latte-card');
        const { base, sizeAdj, checked } = getCardState(card);
        const qty  = parseInt(card.querySelector('.qty-value').textContent, 10);
        const size = card.querySelector('.size-select').selectedOptions[0].text.split(' ')[0];
        const unit = calcUnitPrice(base, sizeAdj, checked);

        const cart = getCart();
        const key  = `${id}__${size}__${checked.join(',')}`;
        const existing = cart.find(x => x.key === key);
        if (existing) {
          existing.qty = Math.min(20, existing.qty + qty);
        } else {
          cart.push({ key, id, name: `${item.name} (${size})`, price: unit, qty, addons: checked });
        }
        saveCart(cart);
        updateCartCount();
        showToast(`${item.name} (${size}) added to cart`);
        return;
      }

      if (qvBtn) {
        const item = LATTES.find(x => x.id === qvBtn.dataset.id);
        if (item) openModal(item);
      }
    });

    document.addEventListener('click', (e) => {
      const overlay = document.getElementById('qv-modal');
      if (!overlay) return;
      if (e.target === overlay || e.target.closest('.modal-close')) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ============================================================
     SCROLL REVEAL (fallback for pages that don't load index.js)
  ============================================================ */
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      reveals.forEach(el => obs.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('visible'));
    }
  }

  /* ============================================================
     INIT
  ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    renderGrid();
    initEvents();
    updateCartCount();
    initReveal();
  });
})();
