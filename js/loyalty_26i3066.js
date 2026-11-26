/* ==========================================================================
   The Coffee Circle — Loyalty Rewards & Tier Tracking
   1 point earned per PKR 100 spent, persisted under 'coffeeCircleLoyalty'
   ========================================================================== */

(function () {
  'use strict';

  var LOYALTY_STORAGE_KEY = 'coffeeCircleLoyalty';
  var PKR_PER_POINT = 100;

  var TIERS = [
    { name: 'Bronze', minPoints: 0, perk: 'Earn 1 point per PKR 100 spent' },
    { name: 'Silver', minPoints: 50, perk: 'Complimentary syrup or caramel drizzle upgrade' },
    { name: 'Gold', minPoints: 150, perk: 'Free medium cold coffee every 10th visit' },
    { name: 'Platinum', minPoints: 300, perk: 'Priority barista prep & seasonal tasting invites' }
  ];

  function readLoyaltyState() {
    try {
      var raw = window.localStorage.getItem(LOYALTY_STORAGE_KEY);
      if (!raw) return { points: 0, totalSpent: 0, history: [] };
      var parsed = JSON.parse(raw);
      return {
        points: Math.max(0, Math.floor(Number((parsed && parsed.points) || 0))),
        totalSpent: Math.max(0, Number((parsed && parsed.totalSpent) || 0)),
        history: Array.isArray(parsed && parsed.history) ? parsed.history : []
      };
    } catch (err) {
      return { points: 0, totalSpent: 0, history: [] };
    }
  }

  function writeLoyaltyState(state) {
    try {
      window.localStorage.setItem(LOYALTY_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      // Ignore storage errors in restricted environments.
    }

    window.dispatchEvent(
      new CustomEvent('loyalty:updated', {
        detail: {
          points: state.points,
          totalSpent: state.totalSpent,
          tier: resolveTier(state.points)
        }
      })
    );
  }

  function resolveTier(points) {
    var safePoints = Math.max(0, Math.floor(Number(points || 0)));
    var currentIndex = 0;

    for (var i = 0; i < TIERS.length; i += 1) {
      if (safePoints >= TIERS[i].minPoints) {
        currentIndex = i;
      }
    }

    var currentTier = TIERS[currentIndex];
    var nextTier = TIERS[currentIndex + 1] || null;

    return {
      name: currentTier.name,
      minPoints: currentTier.minPoints,
      perk: currentTier.perk,
      nextTier: nextTier ? nextTier.name : null,
      pointsToNext: nextTier ? Math.max(0, nextTier.minPoints - safePoints) : 0
    };
  }

  var Loyalty = {
    STORAGE_KEY: LOYALTY_STORAGE_KEY,
    PKR_PER_POINT: PKR_PER_POINT,
    TIERS: TIERS.slice(),

    getPoints: function () {
      return readLoyaltyState().points;
    },

    getHistory: function () {
      return readLoyaltyState().history;
    },

    calculatePoints: function (amountPKR) {
      var amount = Number(amountPKR || 0);
      if (!Number.isFinite(amount) || amount <= 0) return 0;
      return Math.floor(amount / PKR_PER_POINT);
    },

    getTier: function (pointsOverride) {
      var points =
        pointsOverride != null ? Number(pointsOverride) : readLoyaltyState().points;
      return resolveTier(points);
    },

    getSummary: function () {
      var state = readLoyaltyState();
      var tierInfo = resolveTier(state.points);
      return {
        points: state.points,
        totalSpent: state.totalSpent,
        tier: tierInfo.name,
        perk: tierInfo.perk,
        nextTier: tierInfo.nextTier,
        pointsToNext: tierInfo.pointsToNext,
        rateLabel: '1 point per PKR ' + PKR_PER_POINT,
        history: state.history
      };
    },

    awardPoints: function (amountPKR, note) {
      var amount = Math.max(0, Number(amountPKR || 0));
      var earned = this.calculatePoints(amount);
      var state = readLoyaltyState();

      state.points += earned;
      state.totalSpent += amount;
      state.history.unshift({
        type: 'earn',
        points: earned,
        amountPKR: amount,
        note: note || 'Coffee order purchase',
        date: new Date().toISOString()
      });

      writeLoyaltyState(state);

      return {
        pointsEarned: earned,
        totalPoints: state.points,
        tier: resolveTier(state.points)
      };
    },

    awardFromCart: function (note) {
      var subtotal = 0;
      if (window.Cart && typeof window.Cart.getSubtotal === 'function') {
        subtotal = window.Cart.getSubtotal();
      } else if (window.Cart && typeof window.Cart.getItems === 'function') {
        subtotal = window.Cart.getItems().reduce(function (sum, item) {
          return sum + Number(item.unitPrice || item.price || 0) * Number(item.quantity || 1);
        }, 0);
      }

      return this.awardPoints(subtotal, note || 'Cart checkout reward');
    },

    redeemPoints: function (pointsToRedeem, note) {
      var amount = Math.floor(Number(pointsToRedeem || 0));
      var state = readLoyaltyState();

      if (!Number.isFinite(amount) || amount <= 0 || amount > state.points) {
        return {
          success: false,
          remainingPoints: state.points,
          tier: resolveTier(state.points)
        };
      }

      state.points -= amount;
      state.history.unshift({
        type: 'redeem',
        points: -amount,
        amountPKR: 0,
        note: note || 'Reward redemption',
        date: new Date().toISOString()
      });

      writeLoyaltyState(state);

      return {
        success: true,
        remainingPoints: state.points,
        tier: resolveTier(state.points)
      };
    },

    reset: function () {
      var empty = { points: 0, totalSpent: 0, history: [] };
      writeLoyaltyState(empty);
      return empty;
    }
  };

  window.Loyalty = Loyalty;
})();
