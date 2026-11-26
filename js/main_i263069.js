/* main.js - shared helpers + product catalogue pages
   (home grids, menu page, category pages, product details, newsletter) */

document.documentElement.classList.add('js');

/* ---------- paths ----------
   index.html lives in the project root, every other page lives in /pages.
   <body data-root="../"> tells us which one we are on. */
const ROOT = document.body.dataset.root || '';

function pageUrl(file) {
  if (file === 'index.html') return ROOT + 'index.html';
  return (ROOT ? '' : 'pages/') + file;
}

/* ---------- localStorage helpers (never crash on bad data) ---------- */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

/* ---------- small utilities ---------- */
function formatPrice(amount) {
  return 'PKR ' + Number(amount).toLocaleString('en-US');
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(message, type) {
  let region = document.getElementById('toast-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'toast-region';
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'success');
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(function () { toast.classList.add('toast-hide'); }, 3200);
  setTimeout(function () { toast.remove(); }, 3700);
}

/* ---------- product cards ---------- */

function productCardHTML(p, full) {
  const sizeNames = Object.keys(SIZE_TYPES[p.sizeType]);
  const detailsUrl = pageUrl('product-details.html') + '?id=' + encodeURIComponent(p.id);
  const label = CATEGORIES[p.category].label;
  let options = '';

  if (full) {
    const sizeField = sizeNames.length > 1
      ? '<label class="field-inline">Size<select class="size-select">' +
        sizeNames.map(function (s) {
          return '<option value="' + s + '">' + s + ' - ' + formatPrice(unitPrice(p, s, [])) + '</option>';
        }).join('') + '</select></label>'
      : '<div class="field-inline">Size<span class="static-size">' + sizeNames[0] +
        '</span><input type="hidden" class="size-select" value="' + sizeNames[0] + '"></div>';

    const addons = addonsFor(p).map(function (a) {
      return '<label class="check"><input type="checkbox" class="addon-check" value="' + a.id + '"> ' +
        a.label + ' <small>(+' + a.price + ')</small></label>';
    }).join('');

    options =
      '<p class="ingredients"><strong>Ingredients:</strong> ' + p.ingredients.join(', ') + '</p>' +
      '<div class="card-options">' + sizeField +
      '<div class="field-inline">Quantity<div class="qty-control">' +
      '<button type="button" data-action="qty-minus" aria-label="Decrease quantity">&minus;</button>' +
      '<input type="number" class="qty-input" min="1" max="20" value="1" aria-label="Quantity for ' + escapeHtml(p.name) + '">' +
      '<button type="button" data-action="qty-plus" aria-label="Increase quantity">+</button></div></div></div>' +
      '<details class="customise"><summary>Customise your drink</summary>' + addons + '</details>';
  }

  const priceText = full ? formatPrice(unitPrice(p, sizeNames[0], [])) : 'From ' + formatPrice(p.price);
  const secondButton = full
    ? '<button type="button" class="btn btn-outline" data-action="quickview">Quick View</button>'
    : '<a class="btn btn-outline" href="' + detailsUrl + '">View Details</a>';

  return '<article class="product-card reveal" data-id="' + p.id + '">' +
    '<a class="card-img" href="' + detailsUrl + '" aria-label="View ' + escapeHtml(p.name) + '">' +
    '<img src="' + productImage(p) + '" alt="' + escapeHtml(p.name) + ' illustration" width="400" height="400" loading="lazy"></a>' +
    '<div class="card-body">' +
    (p.bestseller ? '<span class="badge">Bestseller</span>' : '') +
    '<span class="tag">' + label + '</span>' +
    '<h3>' + escapeHtml(p.name) + '</h3>' +
    '<p class="desc">' + escapeHtml(p.description) + '</p>' + options +
    '<div class="card-footer"><span class="price" data-price>' + priceText + '</span>' +
    '<div class="card-buttons"><button type="button" class="btn btn-primary" data-action="add">Add to Cart</button>' +
    secondButton + '</div></div></div></article>';
}

/* Read size / quantity / add-ons the customer picked on a card. */
function readCardOptions(card) {
  const p = getProduct(card.dataset.id);
  const sizeInput = card.querySelector('.size-select');
  const qtyInput = card.querySelector('.qty-input');
  const size = sizeInput ? sizeInput.value : Object.keys(SIZE_TYPES[p.sizeType])[0];
  const qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
  const addons = Array.prototype.slice.call(card.querySelectorAll('.addon-check:checked'))
    .map(function (box) { return box.value; });
  return { p: p, size: size, qty: qty, addons: addons };
}

function updateCardPrice(card) {
  const o = readCardOptions(card);
  const priceEl = card.querySelector('[data-price]');
  if (priceEl && card.querySelector('.size-select')) {
    priceEl.textContent = formatPrice(unitPrice(o.p, o.size, o.addons));
  }
}

function bindProductGrid(grid) {
  grid.addEventListener('click', function (event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const card = button.closest('.product-card');
    const action = button.dataset.action;
    const qtyInput = card.querySelector('.qty-input');

    if (action === 'qty-plus' || action === 'qty-minus') {
      let value = parseInt(qtyInput.value, 10);
      if (isNaN(value)) value = 1;
      qtyInput.value = Math.min(20, Math.max(1, value + (action === 'qty-plus' ? 1 : -1)));
    } else if (action === 'add') {
      const o = readCardOptions(card);
      const result = addToCart(o.p.id, o.size, o.qty, o.addons);
      showToast(result.message, result.ok ? 'success' : 'error');
      if (!result.ok && qtyInput) qtyInput.value = 1;
    } else if (action === 'quickview') {
      openProductModal(card.dataset.id);
    }
  });
  grid.addEventListener('change', function (event) {
    const card = event.target.closest('.product-card');
    if (card) updateCardPrice(card);
  });
}

/* ---------- quick-view modal ---------- */
let lastFocusedElement = null;

function ensureModal() {
  let modal = document.getElementById('product-modal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'product-modal';
  modal.className = 'modal';
  modal.hidden = true;
  modal.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
    '<button type="button" class="modal-close" aria-label="Close details">&times;</button>' +
    '<div id="modal-content"></div></div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function (event) {
    if (event.target === modal || event.target.closest('.modal-close')) closeModal();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });
  return modal;
}

function openProductModal(id) {
  const p = getProduct(id);
  if (!p) return;
  const modal = ensureModal();
  const sizes = Object.keys(SIZE_TYPES[p.sizeType]).map(function (s) {
    return s + ' (' + formatPrice(unitPrice(p, s, [])) + ')';
  }).join(' &middot; ');
  document.getElementById('modal-content').innerHTML =
    '<div class="modal-grid"><img src="' + productImage(p) + '" alt="' + escapeHtml(p.name) + '" width="400" height="400">' +
    '<div><span class="tag">' + CATEGORIES[p.category].label + '</span>' +
    '<h2 id="modal-title">' + escapeHtml(p.name) + '</h2>' +
    '<p>' + escapeHtml(p.description) + '</p>' +
    '<h3>Ingredients</h3><ul class="plain-list">' +
    p.ingredients.map(function (i) { return '<li>' + escapeHtml(i) + '</li>'; }).join('') + '</ul>' +
    '<p><strong>Sizes:</strong> ' + sizes + '</p>' +
    '<a class="btn btn-primary" href="' + pageUrl('product-details.html') + '?id=' + p.id + '">Open full details</a>' +
    '</div></div>';
  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  document.body.classList.add('no-scroll');
  modal.querySelector('.modal-close').focus();
}

function closeModal() {
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('no-scroll');
  if (lastFocusedElement) lastFocusedElement.focus();
}

/* ---------- reveal-on-scroll animation ---------- */
function setupReveal() {
  const items = document.querySelectorAll('.reveal:not(.in)');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  items.forEach(function (el) { observer.observe(el); });
}

/* ---------- page initialisers ---------- */

function renderGrid(grid, list, full) {
  grid.innerHTML = list.map(function (p) { return productCardHTML(p, full); }).join('');
  setupReveal();
}

function initHome() {
  const hero = document.getElementById('hero-art');
  if (hero) hero.src = cupImage(getProduct('cap-classic'));
  const featured = document.getElementById('featured-grid');
  const best = document.getElementById('bestseller-grid');
  if (featured) {
    renderGrid(featured, PRODUCTS.filter(function (p) { return p.featured; }).slice(0, 6), false);
    bindProductGrid(featured);
  }
  if (best) {
    renderGrid(best, PRODUCTS.filter(function (p) { return p.bestseller; }).slice(0, 6), false);
    bindProductGrid(best);
  }
}

/* About page: fill the image section with drink illustrations. */
function initAboutGallery() {
  const box = document.getElementById('about-gallery');
  if (!box) return;
  ['cap-classic', 'lat-caramel', 'cold-brew', 'esp-classic', 'frappe-caramel', 'sig-special'].forEach(function (id) {
    const p = getProduct(id);
    box.insertAdjacentHTML('beforeend', '<img src="' + productImage(p) + '" alt="' + escapeHtml(p.name) + '" width="400" height="400">');
  });
}

function initCategoryPage() {
  const grid = document.getElementById('product-grid');
  const category = document.body.dataset.category;
  if (!grid || !category) return;
  renderGrid(grid, PRODUCTS.filter(function (p) { return p.category === category; }), true);
  bindProductGrid(grid);
}

function initMenuPage() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  const searchBox = document.getElementById('menu-search');
  const sortBox = document.getElementById('menu-sort');
  const filterBar = document.getElementById('menu-filters');
  const emptyMessage = document.getElementById('menu-empty');
  const countLabel = document.getElementById('menu-count');
  const state = { category: 'all', query: '', sort: 'default' };

  const wanted = new URLSearchParams(location.search).get('cat');
  if (wanted && CATEGORIES[wanted]) state.category = wanted;

  filterBar.innerHTML = '<button type="button" class="chip" data-cat="all">All</button>' +
    Object.keys(CATEGORIES).map(function (key) {
      return '<button type="button" class="chip" data-cat="' + key + '">' + CATEGORIES[key].label + '</button>';
    }).join('');

  function render() {
    let list = PRODUCTS.filter(function (p) {
      const inCategory = state.category === 'all' || p.category === state.category;
      const matches = p.name.toLowerCase().indexOf(state.query) !== -1;
      return inCategory && matches;
    });
    if (state.sort === 'low') list.sort(function (a, b) { return a.price - b.price; });
    if (state.sort === 'high') list.sort(function (a, b) { return b.price - a.price; });

    filterBar.querySelectorAll('.chip').forEach(function (chip) {
      const active = chip.dataset.cat === state.category;
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    renderGrid(grid, list, false);
    emptyMessage.hidden = list.length > 0;
    countLabel.textContent = list.length + (list.length === 1 ? ' drink' : ' drinks');
  }

  filterBar.addEventListener('click', function (event) {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    state.category = chip.dataset.cat;
    render();
  });
  searchBox.addEventListener('input', function () {
    state.query = searchBox.value.trim().toLowerCase();
    render();
  });
  sortBox.addEventListener('change', function () {
    state.sort = sortBox.value;
    render();
  });
  document.getElementById('menu-reset').addEventListener('click', function () {
    state.category = 'all';
    state.query = '';
    state.sort = 'default';
    searchBox.value = '';
    sortBox.value = 'default';
    render();
  });
  bindProductGrid(grid);
  render();
}

function initProductDetails() {
  const root = document.getElementById('product-detail');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('id');
  const p = getProduct(id);

  if (!p) {
    root.innerHTML = '<div class="empty-state"><h2>We couldn\'t find that drink</h2>' +
      '<p>The link may be old. Browse the full menu to pick your coffee.</p>' +
      '<a class="btn btn-primary" href="' + pageUrl('menu.html') + '">Go to the menu</a></div>';
    return;
  }

  document.title = p.name + ' | The Coffee Circle';
  const sizeNames = Object.keys(SIZE_TYPES[p.sizeType]);
  const sizeHTML = sizeNames.map(function (s, index) {
    return '<label class="size-option"><input type="radio" name="size" value="' + s + '"' + (index === 0 ? ' checked' : '') + '>' +
      '<span>' + s + '<small>' + formatPrice(unitPrice(p, s, [])) + '</small></span></label>';
  }).join('');
  const addonHTML = addonsFor(p).map(function (a) {
    return '<label class="check"><input type="checkbox" class="addon-check" value="' + a.id + '"> ' +
      a.label + ' <small>(+' + a.price + ')</small></label>';
  }).join('');

  root.innerHTML =
    '<div class="detail-grid">' +
    '<div class="detail-photo"><img src="' + productImage(p) + '" alt="' + escapeHtml(p.name) + '" width="400" height="400"></div>' +
    '<div class="detail-info"><span class="tag">' + CATEGORIES[p.category].label + '</span>' +
    '<h1>' + escapeHtml(p.name) + '</h1>' +
    '<p class="lead">' + escapeHtml(p.description) + '</p>' +
    '<h2 class="h3">Ingredients</h2><ul class="plain-list inline">' +
    p.ingredients.map(function (i) { return '<li>' + escapeHtml(i) + '</li>'; }).join('') + '</ul>' +
    '<fieldset class="field-group"><legend>Choose a size</legend><div class="size-options">' + sizeHTML + '</div></fieldset>' +
    '<fieldset class="field-group"><legend>Customise</legend>' + addonHTML + '</fieldset>' +
    '<div class="field-group"><span class="legend-like">Quantity</span><div class="qty-control">' +
    '<button type="button" id="d-minus" aria-label="Decrease quantity">&minus;</button>' +
    '<input type="number" id="d-qty" class="qty-input" min="1" max="20" value="1" aria-label="Quantity">' +
    '<button type="button" id="d-plus" aria-label="Increase quantity">+</button></div></div>' +
    '<div class="detail-buy"><div><span class="muted">Total</span><div class="price price-large" id="d-price"></div></div>' +
    '<button type="button" class="btn btn-primary btn-lg" id="d-add">Add to Cart</button></div></div></div>';

  const qtyInput = document.getElementById('d-qty');
  const priceEl = document.getElementById('d-price');

  function currentChoice() {
    const sizeInput = root.querySelector('input[name="size"]:checked');
    const addons = Array.prototype.slice.call(root.querySelectorAll('.addon-check:checked'))
      .map(function (b) { return b.value; });
    let qty = parseInt(qtyInput.value, 10);
    return { size: sizeInput.value, addons: addons, qty: qty };
  }
  function refreshPrice() {
    const c = currentChoice();
    const qty = (isNaN(c.qty) || c.qty < 1) ? 1 : Math.min(c.qty, 20);
    priceEl.textContent = formatPrice(unitPrice(p, c.size, c.addons) * qty);
  }
  root.addEventListener('change', refreshPrice);
  qtyInput.addEventListener('input', refreshPrice);
  document.getElementById('d-minus').addEventListener('click', function () {
    qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
    refreshPrice();
  });
  document.getElementById('d-plus').addEventListener('click', function () {
    qtyInput.value = Math.min(20, (parseInt(qtyInput.value, 10) || 1) + 1);
    refreshPrice();
  });
  document.getElementById('d-add').addEventListener('click', function () {
    const c = currentChoice();
    const result = addToCart(p.id, c.size, c.qty, c.addons);
    showToast(result.message, result.ok ? 'success' : 'error');
    if (!result.ok) { qtyInput.value = 1; refreshPrice(); }
  });
  refreshPrice();

  const related = document.getElementById('related-grid');
  if (related) {
    const others = PRODUCTS.filter(function (x) { return x.category === p.category && x.id !== p.id; }).slice(0, 3);
    renderGrid(related, others, false);
    bindProductGrid(related);
  }
}

function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const input = document.getElementById('newsletter-email');
    const message = document.getElementById('newsletter-message');
    const email = input.value.trim();
    if (!isValidEmail(email)) {
      message.textContent = 'Please enter a valid email address, e.g. name@example.com.';
      message.className = 'form-message error';
      return;
    }
    const list = readJSON('cc_newsletter', []);
    const emails = Array.isArray(list) ? list : [];
    if (emails.indexOf(email.toLowerCase()) !== -1) {
      message.textContent = 'You are already on our list. Thank you!';
    } else {
      emails.push(email.toLowerCase());
      writeJSON('cc_newsletter', emails);
      message.textContent = 'Welcome to the Circle! Your first offer is on its way.';
    }
    message.className = 'form-message success';
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initHome();
  initAboutGallery();
  initCategoryPage();
  initMenuPage();
  initProductDetails();
  initNewsletter();
  setupReveal();
});
