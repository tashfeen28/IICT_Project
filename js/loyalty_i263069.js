/* loyalty.js - The Coffee Circle Rewards.
   Earning:  every PKR 100 spent = 10 points  (pointsForAmount)
   Spending: points are exchanged for free drinks (REWARDS) that go into the cart at PKR 0.
   Points, history and redeemed rewards are saved on the user's record in localStorage. */

const POINTS_PER_100_PKR = 10;

const REWARDS = [
  { id: 'espresso', name: 'Free Classic Espresso', points: 100, productId: 'esp-classic', size: 'Single',
    blurb: 'A single shot of our signature espresso, on us.' },
  { id: 'cappuccino', name: 'Free Classic Cappuccino', points: 180, productId: 'cap-classic', size: 'Small',
    blurb: 'A small Classic Cappuccino with velvety foam.' },
  { id: 'latte', name: 'Free Classic Latte', points: 250, productId: 'lat-classic', size: 'Small',
    blurb: 'A small Classic Latte, smooth and milky.' },
  { id: 'signature', name: 'Free Signature Coffee', points: 350, productId: 'sig-special', size: 'Medium',
    blurb: 'Our Circle Special Mocha, the house favourite.' }
];

/* PKR 500 -> 500 / 100 x 10 = 50 points. Only whole hundreds count. */
function pointsForAmount(amount) {
  const value = Number(amount);
  if (isNaN(value) || value <= 0) return 0;
  return Math.floor(value / 100) * POINTS_PER_100_PKR;
}

/* Called by checkout.js AFTER an order has been saved successfully. */
function awardPoints(username, points, note) {
  if (!points || points <= 0) return;
  updateUser(username, function (user) {
    user.points = (Number(user.points) || 0) + points;
    user.history.push({ type: 'earned', points: points, note: note, date: new Date().toISOString() });
  });
}

function getReward(id) {
  return REWARDS.find(function (r) { return r.id === id; }) || null;
}

/* The five redemption steps from the brief. */
function redeemReward(rewardId) {
  const user = currentUser();
  const reward = getReward(rewardId);
  if (!reward) return { ok: false, error: 'That reward does not exist.' };
  if (!user) return { ok: false, needLogin: true, error: 'Please log in to redeem rewards.' };

  /* 1. enough points? */
  if (user.points < reward.points) {
    return { ok: false, error: 'You need ' + (reward.points - user.points) + ' more points for the ' + reward.name + '.' };
  }
  /* 2. deduct points (and remember it) */
  updateUser(user.username, function (u) {
    u.points -= reward.points;
    const now = new Date().toISOString();
    u.history.push({ type: 'redeemed', points: -reward.points, note: 'Redeemed: ' + reward.name, date: now });
    u.redeemed.push({ rewardId: reward.id, name: reward.name, points: reward.points, date: now });
  });
  /* 3. add the free drink to the cart at PKR 0 */
  addFreeRewardToCart(reward, user.username);
  /* 4 + 5. balance is already updated; caller shows the success message */
  return { ok: true, reward: reward };
}

/* If a free reward is removed from the cart before ordering, give the points back. */
function refundReward(item) {
  const user = currentUser();
  if (!user || item.owner !== user.username || !item.cost) return;
  updateUser(user.username, function (u) {
    u.points += item.cost;
    u.history.push({ type: 'refund', points: item.cost, note: 'Refund: reward removed from cart', date: new Date().toISOString() });
    for (let i = u.redeemed.length - 1; i >= 0; i--) {
      if (u.redeemed[i].rewardId === item.rewardId) { u.redeemed.splice(i, 1); break; }
    }
  });
}

/* ---------- shared HTML pieces (also used by account.js) ---------- */

function nextRewardInfo(points) {
  const next = REWARDS.find(function (r) { return r.points > points; });
  if (!next) return { text: 'You can afford every reward. Treat yourself!', percent: 100, next: null };
  return {
    text: (next.points - points) + ' points to your ' + next.name,
    percent: Math.min(100, Math.round(points / next.points * 100)),
    next: next
  };
}

function rewardCardHTML(reward, points, loggedIn) {
  const enough = loggedIn && points >= reward.points;
  const missing = reward.points - points;
  const buttonLabel = !loggedIn ? 'Log in to redeem' : enough ? 'Redeem reward' : 'Need ' + missing + ' more points';
  return '<article class="reward-card' + (enough ? ' available' : '') + '">' +
    '<div class="reward-points"><strong>' + reward.points + '</strong><span>points</span></div>' +
    '<h3>' + reward.name + '</h3><p class="muted">' + reward.blurb + '</p>' +
    '<button type="button" class="btn ' + (enough ? 'btn-primary' : 'btn-outline') + '" data-redeem="' + reward.id + '"' +
    (loggedIn && !enough ? ' aria-disabled="true"' : '') + '>' + buttonLabel + '</button></article>';
}

function historyLabel(type) {
  return { earned: 'Earned', redeemed: 'Redeemed', refund: 'Refund', bonus: 'Bonus' }[type] || type;
}

/* ---------- loyalty page ---------- */

function renderLoyaltyPage() {
  const root = document.getElementById('loyalty-root');
  if (!root) return;
  const user = currentUser();
  const points = user ? user.points : 0;
  const info = nextRewardInfo(points);

  let top;
  if (user) {
    const affordable = REWARDS.filter(function (r) { return points >= r.points; });
    top = '<div class="balance-card"><div><p class="eyebrow light">Hello, ' + escapeHtml(user.fullName.split(' ')[0]) + '</p>' +
      '<p class="balance-number" aria-live="polite">' + points + '<span> points</span></p>' +
      '<p>' + (affordable.length
        ? 'You can redeem ' + affordable.length + (affordable.length === 1 ? ' free coffee' : ' free coffees') + ' right now.'
        : 'Keep sipping. Your first reward is close.') + '</p></div>' +
      '<div class="progress-block"><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + info.percent + '" aria-label="Progress to next reward">' +
      '<div class="progress-fill" style="width:' + info.percent + '%"></div></div><p class="small">' + info.text + '</p></div></div>';
  } else {
    top = '<div class="balance-card"><div><p class="eyebrow light">Members earn more</p>' +
      '<h2 class="light">Join The Coffee Circle Rewards</h2>' +
      '<p>Create a free account, order your favourites and watch the points add up.</p></div>' +
      '<div class="balance-actions"><a class="btn btn-light" href="' + pageUrl('auth.html') + '?next=loyalty.html">Log in</a>' +
      '<a class="btn btn-outline-light" href="' + pageUrl('auth.html') + '?mode=register&next=loyalty.html">Join free</a></div></div>';
  }

  const history = user && user.history.length
    ? '<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Activity</th><th>Details</th><th class="num">Points</th></tr></thead><tbody>' +
      user.history.slice().reverse().map(function (h) {
        return '<tr><td>' + formatDate(h.date) + '</td><td>' + historyLabel(h.type) + '</td><td>' + escapeHtml(h.note || '') +
          '</td><td class="num ' + (h.points >= 0 ? 'plus' : 'minus') + '">' + (h.points >= 0 ? '+' : '') + h.points + '</td></tr>';
      }).join('') + '</tbody></table></div>'
    : '<p class="muted">' + (user ? 'No points activity yet. Place an order to start earning.' : 'Log in to see your points history.') + '</p>';

  const redeemed = user && user.redeemed.length
    ? '<ul class="plain-list">' + user.redeemed.slice().reverse().map(function (r) {
        return '<li><strong>' + escapeHtml(r.name) + '</strong> <span class="muted">(' + r.points + ' points, ' + formatDate(r.date) + ')</span></li>';
      }).join('') + '</ul>'
    : '<p class="muted">' + (user ? 'You haven\'t redeemed a reward yet.' : 'Log in to see your redeemed rewards.') + '</p>';

  root.innerHTML = top +
    '<section class="section-tight"><h2>Rewards catalogue</h2><div class="reward-grid">' +
    REWARDS.map(function (r) { return rewardCardHTML(r, points, !!user); }).join('') + '</div></section>' +
    '<section class="section-tight how-it-works"><h2>How points work</h2>' +
    '<p>Every <strong>PKR 100</strong> you spend earns <strong>10 points</strong>. For example, a PKR 500 order earns 500 &divide; 100 &times; 10 = <strong>50 points</strong>. ' +
    'Points are added once your order is confirmed. Free reward drinks cost PKR 0 and do not earn points.</p></section>' +
    '<div class="two-col"><section class="section-tight"><h2>Points history</h2>' + history + '</section>' +
    '<section class="section-tight"><h2>Redeemed rewards</h2>' + redeemed + '</section></div>';
}

function bindLoyaltyPage() {
  const root = document.getElementById('loyalty-root');
  if (!root) return;
  root.addEventListener('click', function (event) {
    const button = event.target.closest('[data-redeem]');
    if (!button) return;
    const result = redeemReward(button.dataset.redeem);
    if (result.needLogin) {
      location.href = pageUrl('auth.html') + '?next=loyalty.html';
      return;
    }
    if (!result.ok) {
      showToast(result.error, 'error');
    } else {
      showToast(result.reward.name + ' redeemed! It has been added to your cart for PKR 0.', 'success');
    }
    renderLoyaltyPage();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  renderLoyaltyPage();
  bindLoyaltyPage();
});
