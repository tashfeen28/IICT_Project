/* cart.js - shopping cart stored in localStorage ("cc_cart").
   A cart line stores only: product id, size, add-on ids, quantity.
   Prices are always recalculated from products.js, so they can never go stale. */

const CART_KEY = 'cc_cart';
const MAX_QTY = 20;
const DISCOUNT_THRESHOLD = 2000; /* orders of PKR 2,000 or more... */
const DISCOUNT_RATE = 0.10;      /* ...get 10% off */

/* Clean one stored line. Returns null if it is broken (so it gets dropped). */
function cleanCartItem(item) {
  if (!item || typeof item !== 'object') return null;
  const p = getProduct(item.id);
  if (!p) return null;
  const sizes = SIZE_TYPES[p.sizeType];
  if (!Object.prototype.hasOwnProperty.call(sizes, item.size)) return null;
  let qty = parseInt(item.qty, 10);
  if (isNaN(qty) || qty < 1) qty = 1;
  qty = Math.min(qty, MAX_QTY);
  const validAddons = addonsFor(p).map(function (a) { return a.id; });
  const addons = (Array.isArray(item.addons) ? item.addons : [])
    .filter(function (id) { return validAddons.indexOf(id) !== -1; }).sort();
  const free = item.free === true;
  return {
    key: String(item.key || ''),
    id: p.id, size: item.size, addons: addons,
    qty: free ? 1 : qty,
    free: free,
    rewardId: free ? item.rewardId : undefined,
    cost: free ? Number(item.cost) || 0 : undefined,
    owner: free ? item.owner : undefined
  };
}

function getCart() {
  const stored = readJSON(CART_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored.map(cleanCartItem).filter(function (item) { return item !== null && item.key; });
}

function saveCart(cart) {
  writeJSON(CART_KEY, cart);
  updateCartBadge();
}

function getCartCount() {
  return getCart().reduce(function (sum, item) { return sum + item.qty; }, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(function (el) {
    el.textContent = count;
    el.hidden = count === 0;
  });
}

function cartItemUnitPrice(item) {
  if (item.free) return 0;
  return unitPrice(getProduct(item.id), item.size, item.addons);
}

/* Add a normal (paid) drink. Same drink + size + add-ons merges into one line. */
function addToCart(productId, size, qty, addons) {
  const p = getProduct(productId);
  if (!p) return { ok: false, message: 'Sorry, that drink could not be found.' };
  if (!Object.prototype.hasOwnProperty.call(SIZE_TYPES[p.sizeType], size)) {
    return { ok: false, message: 'Please choose a valid size.' };
  }
  const amount = parseInt(qty, 10);
  if (isNaN(amount) || amount < 1 || amount > MAX_QTY) {
    return { ok: false, message: 'Please choose a quantity between 1 and ' + MAX_QTY + '.' };
  }
  const cleanAddons = (addons || []).slice().sort();
  const key = [p.id, size, cleanAddons.join('+')].join('|');
  const cart = getCart();
  const existing = cart.find(function (item) { return item.key === key && !item.free; });
  if (existing) {
    if (existing.qty + amount > MAX_QTY) {
      return { ok: false, message: 'You can order at most ' + MAX_QTY + ' of the same drink.' };
    }
    existing.qty += amount;
  } else {
    cart.push({ key: key, id: p.id, size: size, addons: cleanAddons, qty: amount, free: false });
  }
  saveCart(cart);
  return { ok: true, message: amount + ' x ' + p.name + ' added to your cart.' };
}

/* Add a free reward drink (called by loyalty.js after points are deducted). */
function addFreeRewardToCart(reward, username) {
  const cart = getCart();
  cart.push({
    key: 'reward-' + reward.id + '-' + Date.now(),
    id: reward.productId, size: reward.size, addons: [], qty: 1,
    free: true, rewardId: reward.id, cost: reward.points, owner: username
  });
  saveCart(cart);
}

function setCartQty(key, value) {
  const cart = getCart();
  const item = cart.find(function (i) { return i.key === key; });
  if (!item || item.free) return { ok: false, message: 'Free rewards always have a quantity of 1.' };
  const qty = parseInt(value, 10);
  if (isNaN(qty) || qty < 1 || qty > MAX_QTY) {
    return { ok: false, message: 'Quantity must be a whole number from 1 to ' + MAX_QTY + '.' };
  }
  item.qty = qty;
  saveCart(cart);
  return { ok: true };
}

function removeCartItem(key) {
  const cart = getCart();
  const item = cart.find(function (i) { return i.key === key; });
  if (!item) return null;
  saveCart(cart.filter(function (i) { return i.key !== key; }));
  if (item.free && typeof refundReward === 'function') refundReward(item); /* give points back */
  return item;
}

/* Subtotal -> discount -> total. Free rewards cost PKR 0 so they never change the totals. */
function cartTotals(cart) {
  const lines = cart || getCart();
  const subtotal = lines.reduce(function (sum, item) {
    return sum + cartItemUnitPrice(item) * item.qty;
  }, 0);
  const discount = subtotal >= DISCOUNT_THRESHOLD ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  return { subtotal: subtotal, discount: discount, total: subtotal - discount };
}

function describeAddons(item) {
  return item.addons.map(function (id) {
    const a = ADDONS.find(function (x) { return x.id === id; });
    return a ? a.label : id;
  });
}

/* ---------- cart page ---------- */

function renderCartPage() {
  const root = document.getElementById('cart-root');
  if (!root) return;
  const cart = getCart();

  if (cart.length === 0) {
    root.innerHTML = '<div class="empty-state"><h2>Your cart is empty</h2>' +
      '<p>Looks like you haven\'t picked a drink yet. Let\'s fix that.</p>' +
      '<a class="btn btn-primary" href="' + pageUrl('menu.html') + '">Browse the menu</a></div>';
    return;
  }

  const totals = cartTotals(cart);
  const rows = cart.map(function (item) {
    const p = getProduct(item.id);
    const extras = describeAddons(item);
    const unit = cartItemUnitPrice(item);
    const qtyControl = item.free
      ? '<span class="free-tag">Free reward</span>'
      : '<div class="qty-control"><button type="button" data-cart="minus" aria-label="Decrease quantity of ' + escapeHtml(p.name) + '">&minus;</button>' +
        '<input type="number" class="qty-input" min="1" max="' + MAX_QTY + '" value="' + item.qty + '" data-cart="qty" aria-label="Quantity of ' + escapeHtml(p.name) + '">' +
        '<button type="button" data-cart="plus" aria-label="Increase quantity of ' + escapeHtml(p.name) + '">+</button></div>';
    return '<li class="cart-line" data-key="' + escapeHtml(item.key) + '">' +
      '<img src="' + productImage(p) + '" alt="' + escapeHtml(p.name) + '" width="96" height="96">' +
      '<div class="cart-info"><h3>' + escapeHtml(p.name) + '</h3>' +
      '<p class="muted">Size: ' + item.size + (extras.length ? ' &middot; ' + extras.join(', ') : '') + '</p>' +
      '<p class="muted">' + (item.free ? 'PKR 0 (redeemed with ' + item.cost + ' points)' : formatPrice(unit) + ' each') + '</p></div>' +
      qtyControl +
      '<div class="cart-line-total">' + (item.free ? 'Free' : formatPrice(unit * item.qty)) + '</div>' +
      '<button type="button" class="icon-btn" data-cart="remove" aria-label="Remove ' + escapeHtml(p.name) + ' from cart">&times;</button></li>';
  }).join('');

  const hint = totals.discount === 0
    ? '<p class="muted small">Spend ' + formatPrice(DISCOUNT_THRESHOLD - totals.subtotal) + ' more to unlock 10% off.</p>'
    : '';

  root.innerHTML =
    '<div class="cart-layout"><ul class="cart-list">' + rows + '</ul>' +
    '<aside class="summary-card"><h2 class="h3">Order summary</h2>' +
    '<dl class="summary-rows"><div><dt>Subtotal</dt><dd>' + formatPrice(totals.subtotal) + '</dd></div>' +
    '<div><dt>Discount (10% on PKR 2,000+)</dt><dd>' + (totals.discount ? '- ' + formatPrice(totals.discount) : formatPrice(0)) + '</dd></div>' +
    '<div class="total"><dt>Total</dt><dd>' + formatPrice(totals.total) + '</dd></div></dl>' + hint +
    '<a class="btn btn-primary btn-block" href="' + pageUrl('checkout.html') + '">Proceed to Checkout</a>' +
    '<a class="btn btn-outline btn-block" href="' + pageUrl('menu.html') + '">Continue Shopping</a></aside></div>';
}

function bindCartPage() {
  const root = document.getElementById('cart-root');
  if (!root) return;

  root.addEventListener('click', function (event) {
    const button = event.target.closest('[data-cart]');
    if (!button) return;
    const line = button.closest('.cart-line');
    const key = line.dataset.key;
    const action = button.dataset.cart;

    if (action === 'remove') {
      const removed = removeCartItem(key);
      if (removed) {
        showToast(removed.free ? 'Reward removed. Your points were refunded.' : 'Item removed from your cart.', 'info');
      }
    } else if (action === 'plus' || action === 'minus') {
      const item = getCart().find(function (i) { return i.key === key; });
      if (item) {
        const next = item.qty + (action === 'plus' ? 1 : -1);
        const result = setCartQty(key, next);
        if (!result.ok) showToast(action === 'minus' ? 'Use the × button to remove an item.' : result.message, 'error');
      }
    }
    renderCartPage();
  });

  root.addEventListener('change', function (event) {
    if (event.target.dataset.cart !== 'qty') return;
    const key = event.target.closest('.cart-line').dataset.key;
    const result = setCartQty(key, event.target.value);
    if (!result.ok) showToast(result.message, 'error');
    renderCartPage();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  updateCartBadge();
  renderCartPage();
  bindCartPage();
});

/* Keep the badge right if the cart is changed in another browser tab. */
window.addEventListener('storage', function (event) {
  if (event.key === CART_KEY) { updateCartBadge(); renderCartPage(); }
});
