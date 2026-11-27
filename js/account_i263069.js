/* account.js - customer dashboard. Visitors who are not logged in go to auth.html. */

function setupAccountPage() {
  const root = document.getElementById('account-root');
  if (!root) return;

  const user = currentUser();
  if (!user) {
    location.replace(pageUrl('auth_i263069.html') + '?next=account.html');
    return;
  }

  const orders = getOrders().filter(function (o) { return o.username === user.username; })
    .sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

  /* Previous purchases: every drink ordered before, with how many times. */
  const bought = {};
  orders.forEach(function (o) {
    o.items.forEach(function (i) {
      if (i.free) return;
      bought[i.id] = bought[i.id] || { name: i.name, id: i.id, count: 0 };
      bought[i.id].count += i.qty;
    });
  });
  const purchases = Object.keys(bought).map(function (k) { return bought[k]; })
    .sort(function (a, b) { return b.count - a.count; });

  const orderHTML = orders.length
    ? orders.map(function (o) {
        return '<article class="order-card"><div class="order-head"><div><strong>' + o.id + '</strong>' +
          '<span class="muted"> &middot; ' + formatDate(o.date) + '</span></div><div class="order-total">' + formatPrice(o.total) + '</div></div>' +
          '<ul class="plain-list">' + o.items.map(function (i) {
            return '<li>' + i.qty + ' &times; ' + escapeHtml(i.name) + ' <span class="muted">(' + i.size + ')</span>' + (i.free ? ' <span class="free-tag">Free</span>' : '') + '</li>';
          }).join('') + '</ul>' +
          '<p class="muted small">' + o.payment + ' &middot; ' + o.fulfilment + ' &middot; +' + o.pointsEarned + ' points</p></article>';
      }).join('')
    : '<div class="empty-state small-state"><p>You haven\'t placed an order yet.</p><a class="btn btn-primary" href="' + pageUrl('menu.html') + '">Order your first coffee</a></div>';

  const purchaseHTML = purchases.length
    ? '<ul class="plain-list">' + purchases.map(function (p) {
        return '<li><a href="' + pageUrl('product-details.html') + '?id=' + p.id + '">' + escapeHtml(p.name) + '</a> <span class="muted">&times; ' + p.count + '</span></li>';
      }).join('') + '</ul>'
    : '<p class="muted">Drinks you order will appear here.</p>';

  const available = REWARDS.filter(function (r) { return user.points >= r.points; });
  const availableHTML = available.length
    ? '<ul class="plain-list">' + available.map(function (r) { return '<li><strong>' + r.name + '</strong> <span class="muted">(' + r.points + ' points)</span></li>'; }).join('') + '</ul>' +
      '<a class="btn btn-primary" href="' + pageUrl('loyalty.html') + '">Redeem now</a>'
    : '<p class="muted">No rewards unlocked yet. ' + nextRewardInfo(user.points).text + '.</p>';

  root.innerHTML =
    '<div class="account-grid"><aside>' +
    '<section class="summary-card profile-card"><div class="avatar" aria-hidden="true">' + escapeHtml(user.fullName.charAt(0).toUpperCase()) + '</div>' +
    '<h2 class="h3">' + escapeHtml(user.fullName) + '</h2><p class="muted">' + escapeHtml(user.email) + '</p>' +
    '<dl class="detail-list"><dt>Username</dt><dd>' + escapeHtml(user.username) + '</dd>' +
    '<dt>Member since</dt><dd>' + formatDate(user.joined) + '</dd>' +
    '<dt>Orders placed</dt><dd>' + orders.length + '</dd></dl>' +
    '<button type="button" class="btn btn-outline btn-block" id="account-logout">Logout</button></section>' +
    '<section class="balance-card compact"><div><p class="eyebrow light">Loyalty points</p>' +
    '<p class="balance-number">' + user.points + '<span> pts</span></p><p class="small">' + nextRewardInfo(user.points).text + '</p></div></section></aside>' +
    '<div><section class="section-tight"><h2>Order history</h2>' + orderHTML + '</section>' +
    '<div class="two-col"><section class="section-tight"><h2>Previous purchases</h2>' + purchaseHTML + '</section>' +
    '<section class="section-tight"><h2>Available rewards</h2>' + availableHTML + '</section></div></div></div>';

  document.getElementById('account-logout').addEventListener('click', function () {
    logoutUser();
    location.href = pageUrl('index.html');
  });
}

document.addEventListener('DOMContentLoaded', setupAccountPage);
