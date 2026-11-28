/**
 * The Coffee Circle — Loyalty Rewards Module (_i263070)
 * Handles loyalty points calculation, dashboard balance & progress,
 * 4-card rewards catalogue, redemption/refund flow, and points history.
 */

(function () {
  'use strict';

  /* ============================================================
     STORAGE KEYS & CONSTANTS
     ============================================================ */
  const USERS_KEY = 'coffee_circle_users';
  const CURRENT_USER_KEY = 'coffee_circle_current_user';
  const CART_KEY = 'coffee_circle_cart';

  const REWARD_CATALOGUE = [
    {
      id: 'reward-espresso',
      drinkId: 'classic-espresso',
      name: 'Free Classic Espresso',
      desc: 'Single shot of our signature espresso, on us.',
      points: 100,
      badge: 'Starter Reward',
      cupColor: '#3B2418',
      foamColor: '#C68B59'
    },
    {
      id: 'reward-cappuccino',
      drinkId: 'classic-cappuccino',
      name: 'Free Classic Cappuccino',
      desc: 'A small Classic Cappuccino with velvety foam.',
      points: 180,
      badge: 'Popular',
      cupColor: '#C68B59',
      foamColor: '#F5EBDD'
    },
    {
      id: 'reward-latte',
      drinkId: 'classic-latte',
      name: 'Free Classic Latte',
      desc: 'A small Classic Latte, smooth and milky.',
      points: 250,
      badge: 'Favourite',
      cupColor: '#D4A875',
      foamColor: '#F5EBDD'
    },
    {
      id: 'reward-signature',
      drinkId: 'circle-special-mocha',
      name: 'Free Signature Coffee',
      desc: 'Our Circle Special Mocha, the house favourite.',
      points: 350,
      badge: 'Top Tier',
      cupColor: '#6B4226',
      foamColor: '#C8A07A'
    }
  ];

  /* ============================================================
     POINTS CALCULATION LOGIC
     Customers earn 10 points for every PKR 100 spent (whole hundreds only).
     Math.floor(amount / 100) * 10. Free reward drinks cost PKR 0 and earn 0 points.
     ============================================================ */
  function calculateEarnedPoints(amount) {
    const val = Number(amount) || 0;
    if (val <= 0) return 0;
    return Math.floor(val / 100) * 10;
  }

  /* ============================================================
     USER DATA MANAGEMENT
     ============================================================ */
  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw);
      return syncWithUsersStore(user);
    } catch (e) {
      return null;
    }
  }

  function syncWithUsersStore(user) {
    if (!user || !user.email) return user;
    try {
      const allUsers = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
      const match = allUsers.find(u => u.email === user.email);
      if (match) {
        // Ensure loyalty data structures exist
        match.points = typeof match.points === 'number' ? match.points : 120;
        match.pointsHistory = match.pointsHistory || [
          { date: '2026-11-20', activity: 'Welcome Bonus', details: 'Account Registration', points: 50 },
          { date: '2026-11-23', activity: 'Order Purchase', details: 'Order #CC-1082 (PKR 700)', points: 70 }
        ];
        match.redeemed = match.redeemed || [];
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match));
        return match;
      }
    } catch (e) {
      // fallback to user
    }

    // Default structure if not stored in users list yet
    if (typeof user.points !== 'number') user.points = 120;
    if (!user.pointsHistory) {
      user.pointsHistory = [
        { date: '2026-11-20', activity: 'Welcome Bonus', details: 'Account Registration', points: 50 },
        { date: '2026-11-23', activity: 'Order Purchase', details: 'Order #CC-1082 (PKR 700)', points: 70 }
      ];
    }
    if (!user.redeemed) user.redeemed = [];
    return user;
  }

  function saveUserData(user) {
    if (!user) return;
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      const allUsers = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
      const idx = allUsers.findIndex(u => u.email === user.email);
      if (idx !== -1) {
        allUsers[idx] = user;
        localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
      } else if (user.email) {
        allUsers.push(user);
        localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
      }
    } catch (e) {
      console.error('Error saving user loyalty data:', e);
    }
  }

  /* ============================================================
     CART MANAGEMENT & NAVBAR BADGE
     ============================================================ */
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }

  function updateNavbarCartBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    badge.textContent = count;
  }

  /* ============================================================
     REFUND HELPER (exported on window)
     When removing a free reward drink from cart, refunds the points automatically
     ============================================================ */
  function refundCartReward(cartItemKey) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.key === cartItemKey);
    if (itemIndex === -1) return false;

    const item = cart[itemIndex];
    if (item.isReward && item.rewardPoints) {
      const user = getCurrentUser();
      if (user) {
        user.points = (user.points || 0) + item.rewardPoints;
        user.pointsHistory = user.pointsHistory || [];
        user.pointsHistory.unshift({
          date: new Date().toISOString().split('T')[0],
          activity: 'Reward Refund',
          details: `Cancelled ${item.name}`,
          points: item.rewardPoints
        });

        // Also update redeemed list if present
        if (user.redeemed && user.redeemed.length > 0) {
          const rIndex = user.redeemed.findIndex(r => r.rewardId === item.rewardId);
          if (rIndex !== -1) {
            user.redeemed.splice(rIndex, 1);
          }
        }
        saveUserData(user);
      }
    }

    cart.splice(itemIndex, 1);
    saveCart(cart);
    updateNavbarCartBadge();
    renderLoyaltyDashboard();
    return true;
  }

  // Export helper globally so cart or other scripts can call it
  window.refundCartReward = refundCartReward;
  window.calculateEarnedPoints = calculateEarnedPoints;

  /* ============================================================
     TOAST NOTIFICATIONS
     ============================================================ */
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') {
      toast.style.borderColor = '#c0392b';
      toast.style.borderLeft = '4px solid #c0392b';
    } else {
      toast.style.borderColor = 'var(--caramel)';
      toast.style.borderLeft = '4px solid var(--caramel)';
    }
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3800);
  }

  /* ============================================================
     REDEMPTION FLOW
     ============================================================ */
  function handleRedemption(reward) {
    const user = getCurrentUser();
    if (!user) {
      showToast('Please log in to redeem rewards.', 'error');
      setTimeout(() => {
        window.location.href = 'auth.html?next=loyalty.html';
      }, 1500);
      return;
    }

    const currentPoints = user.points || 0;
    if (currentPoints < reward.points) {
      const missing = reward.points - currentPoints;
      showToast(`Insufficient points! You need ${missing} more points to redeem ${reward.name}.`, 'error');
      return;
    }

    // Deduct points
    user.points -= reward.points;

    // Append to history
    user.pointsHistory = user.pointsHistory || [];
    user.pointsHistory.unshift({
      date: new Date().toISOString().split('T')[0],
      activity: 'Reward Redeemed',
      details: reward.name,
      points: -reward.points
    });

    // Append to redeemed array
    user.redeemed = user.redeemed || [];
    user.redeemed.unshift({
      rewardId: reward.id,
      name: reward.name,
      date: new Date().toISOString().split('T')[0],
      points: reward.points
    });

    saveUserData(user);

    // Add that drink to localStorage cart at PKR 0 as a free reward
    const cart = getCart();
    const cartKey = `reward_${reward.id}_${Date.now()}`;
    cart.push({
      key: cartKey,
      id: reward.drinkId,
      name: `${reward.name} (Free Reward)`,
      price: 0,
      qty: 1,
      isReward: true,
      rewardId: reward.id,
      rewardPoints: reward.points,
      addons: ['Free Loyalty Reward']
    });
    saveCart(cart);

    // Update navbar cart badge
    updateNavbarCartBadge();

    // Show success toast
    showToast(`Success! ${reward.name} added to your cart for PKR 0.`);

    // Re-render dashboard
    renderLoyaltyDashboard();
  }

  /* ============================================================
     RENDERERS
     ============================================================ */
  function renderSvgCup(cupColor, foamColor) {
    return `
      <svg class="reward-cup-icon" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <circle cx="40" cy="40" r="36" fill="${foamColor}" />
        <circle cx="40" cy="40" r="30" fill="${cupColor}" />
        <path d="M40 24c5 5 10 9 10 16a10 10 0 0 1-20 0c0-7 5-11 10-16Z" fill="${foamColor}" opacity="0.9" />
        <circle cx="40" cy="40" r="2" fill="${cupColor}" />
      </svg>
    `;
  }

  function renderBalanceCard(user) {
    if (!user) {
      return `
        <div class="balance-card logged-out">
          <h2>Join The Coffee Circle Rewards</h2>
          <p>Sign in or create an account to start earning 10 points for every PKR 100 spent and redeem your favourite handcrafted drinks for free.</p>
          <div class="cta-actions">
            <a href="auth.html?next=loyalty.html" class="btn btn-primary">Log in</a>
            <a href="auth.html?mode=register&next=loyalty.html" class="btn btn-caramel">Join free</a>
          </div>
        </div>
      `;
    }

    const firstName = (user.name || user.fullName || user.email || 'Coffee Lover').split(' ')[0];
    const points = user.points || 0;

    // Count how many rewards they can afford
    const affordableCount = REWARD_CATALOGUE.filter(r => points >= r.points).length;
    let affordText = '';
    if (affordableCount === 0) {
      affordText = 'Keep sipping to unlock your first free reward!';
    } else if (affordableCount === 1) {
      affordText = '✨ You can currently afford 1 free reward drink!';
    } else {
      affordText = `✨ You can currently afford ${affordableCount} free reward drinks!`;
    }

    // Determine next reward tier
    let nextReward = REWARD_CATALOGUE.find(r => r.points > points);
    let progressPercent = 100;
    let progressLabel = '';

    if (nextReward) {
      const needed = nextReward.points - points;
      progressPercent = Math.min(100, Math.max(0, Math.round((points / nextReward.points) * 100)));
      progressLabel = `${needed} points remaining until ${nextReward.name} (${nextReward.points} pts)`;
    } else {
      progressPercent = 100;
      progressLabel = `You've unlocked all current reward tiers! Awesome job!`;
    }

    return `
      <div class="balance-card">
        <div class="balance-header">
          <div class="balance-greeting">
            <span class="section-eyebrow">Member Dashboard</span>
            <h2>Welcome back, ${firstName}!</h2>
            <p>Every sip gets you closer to your next handcrafted cup.</p>
            <div class="balance-afford">${affordText}</div>
          </div>
          <div class="points-display">
            <div class="points-label">Your Balance</div>
            <div class="points-number">${points} <span style="font-size:1.4rem; color:var(--espresso);">pts</span></div>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-labels">
            <span>Next Reward Progress</span>
            <strong>${progressLabel}</strong>
          </div>
          <div class="progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderRewardsCatalogue(user) {
    const currentPoints = user ? (user.points || 0) : 0;

    const cardsHTML = REWARD_CATALOGUE.map(item => {
      const canAfford = user && currentPoints >= item.points;
      const btnText = user ? (canAfford ? 'Redeem reward' : 'Need more points') : 'Log in to redeem';
      const disabledAttr = (user && !canAfford) ? 'disabled' : '';

      return `
        <div class="reward-card ${canAfford ? 'can-afford' : ''}">
          <span class="reward-badge">${item.badge}</span>
          <div class="reward-visual">
            ${renderSvgCup(item.cupColor, item.foamColor)}
          </div>
          <div class="reward-content">
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
          </div>
          <div class="reward-footer">
            <div class="reward-cost">${item.points} <span>pts</span></div>
            <button type="button" class="btn btn-caramel btn-redeem" data-reward-id="${item.id}" ${disabledAttr}>
              ${btnText}
            </button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="catalogue-section">
        <div class="section-header">
          <div>
            <span class="section-eyebrow">Exclusive Perks</span>
            <h2>Rewards Catalogue</h2>
          </div>
        </div>
        <div class="reward-grid">
          ${cardsHTML}
        </div>
      </div>
    `;
  }

  function renderHowItWorks() {
    return `
      <div class="how-it-works">
        <div class="how-it-works-grid">
          <div class="how-it-works-content">
            <span class="section-eyebrow">Simple &amp; Transparent</span>
            <h3>How The Coffee Circle Points Work</h3>
            <p>
              Enjoying great coffee should be simple and rewarding. For every <strong>PKR 100</strong> you spend on our handcrafted drinks, you instantly earn <strong>10 points</strong>. Points are calculated in whole hundreds—so whether you grab a daily espresso or pick up round of iced lattes for friends, your circle balance grows.
            </p>
            <p style="margin-bottom:0; font-size:0.9rem; color:var(--muted);">
              Free reward items cost PKR 0 and carry zero additional points.
            </p>
          </div>
          <div class="example-calc-card">
            <div class="example-title">Quick Example Calculation</div>
            <div class="example-math">Spend PKR 500 = Earn 50 Points</div>
            <p class="example-note">
              Math: Math.floor(500 / 100) &times; 10 = <strong>50 points</strong> added directly to your account upon checkout.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  function renderHistoryAndRedeemed(user) {
    const history = (user && user.pointsHistory && user.pointsHistory.length > 0) ? user.pointsHistory : [];
    const redeemed = (user && user.redeemed && user.redeemed.length > 0) ? user.redeemed : [];

    const historyRows = history.length > 0 ? history.map(item => {
      const isPositive = item.points > 0;
      return `
        <tr>
          <td>${item.date || '—'}</td>
          <td><strong>${item.activity || 'Activity'}</strong></td>
          <td>${item.details || '—'}</td>
          <td>
            <span class="pts-badge ${isPositive ? 'pts-plus' : 'pts-minus'}">
              ${isPositive ? '+' : ''}${item.points} pts
            </span>
          </td>
        </tr>
      `;
    }).join('') : `
      <tr>
        <td colspan="4" class="empty-state">No points history yet. Start ordering to earn points!</td>
      </tr>
    `;

    const redeemedItems = redeemed.length > 0 ? redeemed.map(item => `
      <div class="redeemed-item">
        <div class="redeemed-info">
          <h4>${item.name}</h4>
          <span class="redeemed-date">Redeemed on ${item.date}</span>
        </div>
        <div class="redeemed-pts">-${item.points} pts</div>
      </div>
    `).join('') : `
      <div class="empty-state">No rewards redeemed yet. Pick a reward from the catalogue above!</div>
    `;

    return `
      <div class="two-col">
        <div class="panel-card">
          <h3>
            <span>Points History</span>
            <span class="panel-count">${history.length} records</span>
          </h3>
          <div class="table-wrap">
            <table class="points-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Activity</th>
                  <th>Details</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                ${historyRows}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel-card">
          <h3>
            <span>Redeemed Rewards</span>
            <span class="panel-count">${redeemed.length} claimed</span>
          </h3>
          <div class="redeemed-list">
            ${redeemedItems}
          </div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     MAIN RENDER CONTROLLER
     ============================================================ */
  function renderLoyaltyDashboard() {
    const root = document.getElementById('loyalty-root');
    if (!root) return;

    const user = getCurrentUser();

    root.innerHTML = `
      ${renderBalanceCard(user)}
      ${renderRewardsCatalogue(user)}
      ${renderHowItWorks()}
      ${renderHistoryAndRedeemed(user)}
    `;

    attachCatalogueListeners();
  }

  function attachCatalogueListeners() {
    const buttons = document.querySelectorAll('.btn-redeem');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const rewardId = btn.dataset.rewardId;
        const reward = REWARD_CATALOGUE.find(r => r.id === rewardId);
        if (reward) {
          handleRedemption(reward);
        }
      });
    });
  }

  /* ============================================================
     INITIALIZATION
     ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    renderLoyaltyDashboard();
    updateNavbarCartBadge();
  });

})();
