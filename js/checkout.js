/* checkout.js - checkout form, saving the order, and the confirmation page.
   No real payment happens: only Cash on Delivery or Pay at Pickup. */

const ORDERS_KEY = 'cc_orders';
const LAST_ORDER_KEY = 'cc_last_order';
const CUSTOMER_KEY = 'cc_customer';

function getOrders() {
  const orders = readJSON(ORDERS_KEY, []);
  return Array.isArray(orders) ? orders.filter(function (o) { return o && o.id && Array.isArray(o.items); }) : [];
}

function makeOrderId(existing) {
  let id;
  do {
    id = 'CC-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 36).toString(36).toUpperCase();
  } while (existing.some(function (o) { return o.id === id; }));
  return id;
}

/* ---------- validation ---------- */

function validateCheckout(f, payment) {
  const errors = {};
  const phone = f.phone.value.replace(/[\s-]/g, '');
  if (f.name.value.trim().length < 2) errors.name = 'Please enter your full name.';
  if (!isValidEmail(f.email.value.trim())) errors.email = 'Please enter a valid email address.';
  if (!/^(\+92|0)?3\d{9}$/.test(phone)) errors.phone = 'Enter a Pakistani mobile number, e.g. 0300 1234567.';
  if (!payment) errors.payment = 'Please choose a payment method.';
  if (payment === 'Cash on Delivery') {
    if (f.address.value.trim().length < 10) errors.address = 'Please enter your full delivery address (at least 10 characters).';
    if (f.city.value.trim().length < 2) errors.city = 'Please enter your city.';
  }
  return errors;
}

/* ---------- checkout page ---------- */

function renderCheckoutSummary(cart) {
  const summary = document.getElementById('checkout-summary');
  const totals = cartTotals(cart);
  const user = currentUser();
  const earn = user ? pointsForAmount(totals.total) : 0;
  const lines = cart.map(function (item) {
    const p = getProduct(item.id);
    const price = item.free ? 'Free' : formatPrice(cartItemUnitPrice(item) * item.qty);
    return '<li><span>' + item.qty + ' &times; ' + escapeHtml(p.name) + ' <small class="muted">(' + item.size + ')</small></span><span>' + price + '</span></li>';
  }).join('');
  summary.innerHTML = '<h2 class="h3">Order summary</h2><ul class="summary-list">' + lines + '</ul>' +
    '<dl class="summary-rows"><div><dt>Subtotal</dt><dd>' + formatPrice(totals.subtotal) + '</dd></div>' +
    '<div><dt>Loyalty discount</dt><dd>' + (totals.discount ? '- ' + formatPrice(totals.discount) : formatPrice(0)) + '</dd></div>' +
    '<div class="total"><dt>Final amount</dt><dd>' + formatPrice(totals.total) + '</dd></div></dl>' +
    (user
      ? '<p class="points-note">You will earn <strong>' + earn + ' points</strong> with this order.</p>'
      : '<p class="points-note">Want points? <a href="' + pageUrl('auth_i263069.html') + '?next=checkout.html">Log in</a> before ordering to earn them.</p>');
}

function placeOrder(form, cart, payment) {
  const f = form.elements;
  const orders = getOrders();
  const totals = cartTotals(cart);
  const user = currentUser();
  const pickup = payment === 'Pay at Pickup';
  const earned = user ? pointsForAmount(totals.total) : 0;
  const quantity = cart.reduce(function (sum, i) { return sum + i.qty; }, 0);
  const minutes = 12 + Math.min(quantity, 8) * 2;

  const order = {
    id: makeOrderId(orders),
    date: new Date().toISOString(),
    username: user ? user.username : null,
    customer: { name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim() },
    fulfilment: pickup ? 'Pickup from The Coffee Circle' : 'Delivery',
    address: pickup ? '' : f.address.value.trim(),
    city: pickup ? '' : f.city.value.trim(),
    instructions: f.instructions.value.trim(),
    payment: payment,
    items: cart.map(function (item) {
      const p = getProduct(item.id);
      return { id: p.id, name: p.name, size: item.size, addons: describeAddons(item), qty: item.qty,
        unitPrice: cartItemUnitPrice(item), free: item.free };
    }),
    subtotal: totals.subtotal, discount: totals.discount, total: totals.total,
    pointsEarned: earned,
    prepTime: minutes + '-' + (minutes + 10) + ' minutes'
  };

  orders.push(order);
  if (!writeJSON(ORDERS_KEY, orders)) return null; /* saving failed: no points, cart untouched */
  writeJSON(LAST_ORDER_KEY, order.id);
  writeJSON(CUSTOMER_KEY, { name: order.customer.name, email: order.customer.email, phone: order.customer.phone,
    address: f.address.value.trim(), city: f.city.value.trim() });

  /* Points are given only now, after the order was saved. */
  if (user && earned > 0) awardPoints(user.username, earned, 'Order ' + order.id + ' (' + formatPrice(totals.total) + ')');
  saveCart([]);
  return order;
}

function setupCheckoutPage() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  const layout = document.getElementById('checkout-layout');
  const empty = document.getElementById('checkout-empty');
  const cart = getCart();

  if (cart.length === 0) {
    layout.hidden = true;
    empty.hidden = false;
    return;
  }

  /* A free reward belongs to the account that redeemed it. */
  const user = currentUser();
  const foreignReward = cart.some(function (i) { return i.free && (!user || i.owner !== user.username); });
  const warning = document.getElementById('reward-warning');
  if (foreignReward) {
    warning.hidden = false;
    warning.innerHTML = 'Your cart has a free reward from a loyalty account. Please <a href="' + pageUrl('auth_i263069.html') +
      '?next=checkout.html">log in to that account</a> or remove the reward from your cart to continue.';
  }

  renderCheckoutSummary(cart);

  /* Pre-fill from the logged-in user or from the last order. */
  const saved = readJSON(CUSTOMER_KEY, {});
  const f = form.elements;
  f.name.value = (user && user.fullName) || saved.name || '';
  f.email.value = (user && user.email) || saved.email || '';
  f.phone.value = saved.phone || '';
  f.address.value = saved.address || '';
  f.city.value = saved.city || '';

  const deliveryFields = document.getElementById('delivery-fields');
  function togglePickup() {
    const chosen = form.querySelector('input[name="payment"]:checked');
    deliveryFields.hidden = !!chosen && chosen.value === 'Pay at Pickup';
  }
  form.querySelectorAll('input[name="payment"]').forEach(function (r) { r.addEventListener('change', togglePickup); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const latest = getCart();
    if (latest.length === 0) { location.reload(); return; }
    if (foreignReward) { showToast('Please resolve the reward warning above first.', 'error'); return; }
    const chosen = form.querySelector('input[name="payment"]:checked');
    const payment = chosen ? chosen.value : '';
    const errors = validateCheckout(f, payment);
    showFormErrors(form, errors);
    if (Object.keys(errors).length) return;
    const order = placeOrder(form, latest, payment);
    if (!order) {
      showToast('We could not save your order (browser storage is full or blocked).', 'error');
      return;
    }
    location.href = pageUrl('confirmation.html');
  });
}

/* ---------- confirmation page ---------- */

function setupConfirmationPage() {
  const root = document.getElementById('confirmation-root');
  if (!root) return;
  const id = readJSON(LAST_ORDER_KEY, null);
  const order = getOrders().find(function (o) { return o.id === id; });

  if (!order) {
    root.innerHTML = '<div class="empty-state"><h2>No recent order found</h2>' +
      '<p>Place an order first and your confirmation will appear here.</p>' +
      '<a class="btn btn-primary" href="' + pageUrl('menu.html') + '">Browse the menu</a></div>';
    return;
  }

  const items = order.items.map(function (i) {
    return '<li><span>' + i.qty + ' &times; ' + escapeHtml(i.name) + ' <small class="muted">(' + i.size +
      (i.addons.length ? ', ' + escapeHtml(i.addons.join(', ')) : '') + ')</small></span><span>' +
      (i.free ? 'Free' : formatPrice(i.unitPrice * i.qty)) + '</span></li>';
  }).join('');
  const where = order.fulfilment === 'Delivery'
    ? escapeHtml(order.address) + ', ' + escapeHtml(order.city)
    : 'Collect from The Coffee Circle, Blue Area';

  root.innerHTML =
    '<div class="success-banner"><div class="check-circle" aria-hidden="true">&#10003;</div>' +
    '<h1>Thank you, ' + escapeHtml(order.customer.name.split(' ')[0]) + '! Your order is confirmed.</h1>' +
    '<p>Order number <strong class="order-number">' + order.id + '</strong></p></div>' +
    '<div class="confirm-grid"><section class="summary-card"><h2 class="h3">Your drinks</h2><ul class="summary-list">' + items + '</ul>' +
    '<dl class="summary-rows"><div><dt>Subtotal</dt><dd>' + formatPrice(order.subtotal) + '</dd></div>' +
    '<div><dt>Discount</dt><dd>' + (order.discount ? '- ' + formatPrice(order.discount) : formatPrice(0)) + '</dd></div>' +
    '<div class="total"><dt>Total payment</dt><dd>' + formatPrice(order.total) + '</dd></div></dl></section>' +
    '<section class="summary-card"><h2 class="h3">Order details</h2><dl class="detail-list">' +
    '<dt>Payment method</dt><dd>' + order.payment + '</dd>' +
    '<dt>' + order.fulfilment + '</dt><dd>' + where + '</dd>' +
    '<dt>Contact</dt><dd>' + escapeHtml(order.customer.phone) + '<br>' + escapeHtml(order.customer.email) + '</dd>' +
    (order.instructions ? '<dt>Instructions</dt><dd>' + escapeHtml(order.instructions) + '</dd>' : '') +
    '<dt>Estimated preparation time</dt><dd>' + order.prepTime + '</dd></dl>' +
    '<div class="points-earned">' + (order.username
      ? '<strong>+' + order.pointsEarned + ' loyalty points</strong> added to your account.'
      : 'Log in next time to earn loyalty points on your orders.') + '</div></section></div>' +
    '<div class="button-row center"><a class="btn btn-primary" href="' + pageUrl('index.html') + '">Return to Home</a>' +
    '<a class="btn btn-outline" href="' + pageUrl('menu.html') + '">Explore More Coffee</a></div>';
}

document.addEventListener('DOMContentLoaded', function () {
  setupCheckoutPage();
  setupConfirmationPage();
});
