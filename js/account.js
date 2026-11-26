/* account.js - customer dashboard. Visitors who are not logged in go to auth.html. */

/* Safe helpers: use shared functions from main.js / auth.js / loyalty.js / checkout.js
   when loaded, and fall back safely if any shared script is not present. */
function safeReadJSON(key, fallback) {
  if (typeof readJSON === 'function') return readJSON(key, fallback);
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function safePageUrl(file) {
  if (typeof pageUrl === 'function') return pageUrl(file);
  const root = document.body.dataset.root || '';
  if (file === 'index.html') return root + 'index.html';
  return (root ? '' : 'pages/') + file;
}

function safeEscapeHtml(text) {
  if (typeof escapeHtml === 'function') return escapeHtml(text);
  return String(text || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function safeFormatPrice(amount) {
  if (typeof formatPrice === 'function') return formatPrice(amount);
  const value = Number(amount);
  return 'PKR ' + (isNaN(value) ? 0 : value).toLocaleString('en-US');
}

function safeFormatDate(iso) {
  if (typeof formatDate === 'function') return formatDate(iso);
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function safeCurrentUser() {
  if (typeof currentUser === 'function') return currentUser();
  const username = safeReadJSON('cc_session', null);
  const users = safeReadJSON('cc_users', []);
  if (typeof username !== 'string' || !Array.isArray(users)) return null;
  return users.find(function (u) { return u && u.username === username; }) || null;
}

function safeLogoutUser() {
  if (typeof logoutUser === 'function') {
    logoutUser();
    return;
  }
  try { localStorage.removeItem('cc_session'); } catch (error) { /* ignore */ }
}

function safeGetOrders() {
  if (typeof getOrders === 'function') return getOrders();
  const orders = safeReadJSON('cc_orders', []);
  return Array.isArray(orders)
    ? orders.filter(function (o) { return o && o.id && Array.isArray(o.items); })
    : [];
}

function safeRewards() {
  if (typeof REWARDS !== 'undefined' && Array.isArray(REWARDS)) return REWARDS;
  return [
    { id: 'espresso', name: 'Free Classic Espresso', points: 100 },
    { id: 'cappuccino', name: 'Free Classic Cappuccino', points: 180 },
    { id: 'latte', name: 'Free Classic Latte', points: 250 },
    { id: 'signature', name: 'Free Signature Coffee', points: 350 }
  ];
}

function safeNextRewardInfo(points) {
  if (typeof nextRewardInfo === 'function') return nextRewardInfo(points);
  const next = safeRewards().find(function (r) { return r.points > points; });
  if (!next) return { text: 'You can afford every reward. Treat yourself!', percent: 100, next: null };
  return {
    text: (next.points - points) + ' points to your ' + next.name,
    percent: Math.min(100, Math.round((points / next.points) * 100)),
    next: next
  };
}

function setupAccountPage() {
  const root = document.getElementById('account-root');
  if (!root) return;

  const user = safeCurrentUser();
  if (!user) {
    const loginHref = safePageUrl('auth.html') + '?next=account.html';
    root.innerHTML = '<div class="empty-state"><h2>Please log in</h2>' +
      '<p>Redirecting you to the login page...</p>' +
      '<a class="btn btn-primary" href="' + loginHref + '">Log in</a></div>';
    location.replace(loginHref);
    return;
  }

  const orders = safeGetOrders().filter(function (o) { return o.username === user.username; })
    .sort(function (a, b) { return (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0); });

  /* Previous purchases: every drink ordered before, with how many times. */
  const bought = {};
  orders.forEach(function (o) {
    (o.items || []).forEach(function (i) {
      if (!i || i.free || !i.id) return;
      const qty = Math.max(1, parseInt(i.qty, 10) || 1);
      bought[i.id] = bought[i.id] || { name: i.name || 'Coffee item', id: i.id, count: 0 };
      bought[i.id].count += qty;
    });
  });
  const purchases = Object.keys(bought).map(function (k) { return bought[k]; })
    .sort(function (a, b) { return b.count - a.count; });

  const orderHTML = orders.length
    ? orders.map(function (o) {
        return '<article class="order-card"><div class="order-head"><div><strong>' + safeEscapeHtml(o.id) + '</strong>' +
          '<span class="muted"> &middot; ' + safeFormatDate(o.date) + '</span></div><div class="order-total">' + safeFormatPrice(o.total) + '</div></div>' +
          '<ul class="plain-list">' + (o.items || []).map(function (i) {
            const qty = Math.max(1, parseInt(i && i.qty, 10) || 1);
            return '<li>' + qty + ' &times; ' + safeEscapeHtml((i && i.name) || 'Coffee item') +
              ' <span class="muted">(' + safeEscapeHtml((i && i.size) || 'Regular') + ')</span>' +
              (i && i.free ? ' <span class="free-tag">Free</span>' : '') + '</li>';
          }).join('') + '</ul>' +
          '<p class="muted small">' + safeEscapeHtml(o.payment || 'Standard') + ' &middot; ' +
          safeEscapeHtml(o.fulfilment || 'Order') + ' &middot; +' + (Number(o.pointsEarned) || 0) + ' points</p></article>';
      }).join('')
    : '<div class="empty-state small-state"><p>You haven\'t placed an order yet.</p><a class="btn btn-primary" href="' + safePageUrl('menu.html') + '">Order your first coffee</a></div>';

  const purchaseHTML = purchases.length
    ? '<ul class="plain-list">' + purchases.map(function (p) {
        return '<li><a href="' + safePageUrl('product-details.html') + '?id=' + encodeURIComponent(p.id) + '">' + safeEscapeHtml(p.name) + '</a> <span class="muted">&times; ' + p.count + '</span></li>';
      }).join('') + '</ul>'
    : '<p class="muted">Drinks you order will appear here.</p>';

  const points = Math.max(0, Number(user.points) || 0);
  const available = safeRewards().filter(function (r) { return points >= r.points; });
  const nextInfo = safeNextRewardInfo(points);
  const availableHTML = available.length
    ? '<ul class="plain-list">' + available.map(function (r) {
        return '<li><strong>' + safeEscapeHtml(r.name) + '</strong> <span class="muted">(' + r.points + ' points)</span></li>';
      }).join('') + '</ul>' +
      '<a class="btn btn-primary" href="' + safePageUrl('loyalty.html') + '">Redeem now</a>'
    : '<p class="muted">No rewards unlocked yet. ' + safeEscapeHtml(nextInfo.text) + '.</p>';

  const displayName = (user.fullName && user.fullName.trim()) ? user.fullName.trim() : (user.username || '?');

  root.innerHTML =
    '<div class="account-grid"><aside>' +
    '<section class="summary-card profile-card"><div class="avatar" aria-hidden="true">' + safeEscapeHtml(displayName.charAt(0).toUpperCase()) + '</div>' +
    '<h2 class="h3">' + safeEscapeHtml(displayName) + '</h2><p class="muted">' + safeEscapeHtml(user.email || '') + '</p>' +
    '<dl class="detail-list"><dt>Username</dt><dd>' + safeEscapeHtml(user.username) + '</dd>' +
    '<dt>Member since</dt><dd>' + (safeFormatDate(user.joined) || 'Recently') + '</dd>' +
    '<dt>Orders placed</dt><dd>' + orders.length + '</dd></dl>' +
    '<button type="button" class="btn btn-outline btn-block" id="account-logout">Logout</button></section>' +
    '<section class="balance-card compact"><div><p class="eyebrow light">Loyalty points</p>' +
    '<p class="balance-number">' + points + '<span> pts</span></p><p class="small">' + safeEscapeHtml(nextInfo.text) + '</p></div></section></aside>' +
    '<div><section class="section-tight"><h2>Order history</h2>' + orderHTML + '</section>' +
    '<div class="two-col"><section class="section-tight"><h2>Previous purchases</h2>' + purchaseHTML + '</section>' +
    '<section class="section-tight"><h2>Available rewards</h2>' + availableHTML + '</section></div></div></div>';

  document.getElementById('account-logout').addEventListener('click', function () {
    safeLogoutUser();
    location.href = safePageUrl('index.html');
  });
}

document.addEventListener('DOMContentLoaded', setupAccountPage);
