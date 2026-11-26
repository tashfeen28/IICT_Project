/* ==========================================================================
   The Coffee Circle — Shopping Cart State & Persistence
   Persisted in localStorage under 'coffeeCircleCart'
   ========================================================================== */

(function () {
  'use strict';

  var CART_STORAGE_KEY = 'coffeeCircleCart';

  /**
   * Read and parse cart items safely from localStorage.
   */
  function readCartStorage() {
    try {
      var raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Persist cart items, refresh header badge, and broadcast cart:updated.
   */
  function saveCartStorage(items, detail) {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      // Ignore storage quota or private-browsing errors.
    }

    if (typeof window.updateCartBadge === 'function') {
      window.updateCartBadge();
    }

    var payload = {
      items: items.slice(),
      count: countItems(items),
      subtotal: sumItems(items),
      detail: detail || null
    };

    window.dispatchEvent(new CustomEvent('cart:updated', { detail: payload }));
  }

  /**
   * Build a canonical comparison key from an item's id, size, and sorted extras.
   */
  function buildItemSignature(item) {
    var id = String((item && item.id) || '').trim();
    var size = String((item && item.size) || 'Small').trim();
    var extras = Array.isArray(item && item.extras) ? item.extras : [];
    var extrasKey = extras
      .map(function (extra) {
        if (extra && typeof extra === 'object') {
          return String(extra.id || extra.label || '').trim();
        }
        return String(extra || '').trim();
      })
      .filter(Boolean)
      .sort()
      .join(',');

    return id + '__' + size + '__' + extrasKey;
  }

  /**
   * Normalize a cart item object before saving.
   */
  function normalizeCartItem(item) {
    var extras = Array.isArray(item && item.extras)
      ? item.extras.map(function (extra) {
          if (extra && typeof extra === 'object') {
            return {
              id: String(extra.id || extra.label || '').trim(),
              label: String(extra.label || extra.id || '').trim(),
              price: Number(extra.price || 0)
            };
          }
          return { id: String(extra), label: String(extra), price: 0 };
        })
      : [];

    var unitPrice = Number(
      item && item.unitPrice != null
        ? item.unitPrice
        : item && item.price != null
          ? item.price
          : item && item.basePrice != null
            ? item.basePrice
            : 0
    );

    var qty = Number(item && (item.quantity != null ? item.quantity : item.qty));
    if (!Number.isFinite(qty) || qty < 1) qty = 1;

    return {
      id: String((item && item.id) || ''),
      name: String((item && item.name) || 'Coffee Drink'),
      category: String((item && item.category) || ''),
      image: String((item && item.image) || ''),
      basePrice: Number((item && item.basePrice) || unitPrice),
      size: String((item && item.size) || 'Small'),
      sizeDelta: Number((item && item.sizeDelta) || 0),
      extras: extras,
      unitPrice: unitPrice,
      price: unitPrice,
      quantity: Math.floor(qty),
      cartKey: buildItemSignature({ id: item && item.id, size: item && item.size, extras: extras })
    };
  }

  function countItems(items) {
    return items.reduce(function (total, item) {
      var qty = Number(item && (item.quantity || item.qty || 1));
      return total + (qty > 0 ? qty : 1);
    }, 0);
  }

  function sumItems(items) {
    return items.reduce(function (total, item) {
      var unit = Number(item && (item.unitPrice != null ? item.unitPrice : item.price || 0));
      var qty = Number(item && (item.quantity || item.qty || 1));
      return total + unit * (qty > 0 ? qty : 1);
    }, 0);
  }

  /**
   * Resolve target item index by numeric index, cartKey, or item id.
   */
  function resolveItemIndex(items, indexOrKey) {
    if (typeof indexOrKey === 'number' && indexOrKey >= 0 && indexOrKey < items.length) {
      return indexOrKey;
    }

    if (typeof indexOrKey === 'string' && /^\d+$/.test(indexOrKey)) {
      var parsedIdx = Number(indexOrKey);
      if (parsedIdx >= 0 && parsedIdx < items.length) return parsedIdx;
    }

    var target = String(indexOrKey || '');
    for (var i = 0; i < items.length; i += 1) {
      var sig = items[i].cartKey || buildItemSignature(items[i]);
      if (sig === target || items[i].id === target) {
        return i;
      }
    }
    return -1;
  }

  var Cart = {
    STORAGE_KEY: CART_STORAGE_KEY,

    getItems: function () {
      return readCartStorage();
    },

    getCount: function () {
      return countItems(readCartStorage());
    },

    getSubtotal: function () {
      return sumItems(readCartStorage());
    },

    addItem: function (item) {
      if (!item || !item.id) return this.getItems();

      var items = readCartStorage();
      var normalized = normalizeCartItem(item);
      var signature = normalized.cartKey;

      var existingIndex = -1;
      for (var i = 0; i < items.length; i += 1) {
        if (buildItemSignature(items[i]) === signature) {
          existingIndex = i;
          break;
        }
      }

      if (existingIndex !== -1) {
        var currentQty = Number(items[existingIndex].quantity || 1);
        items[existingIndex].quantity = currentQty + normalized.quantity;
        items[existingIndex].cartKey = signature;
      } else {
        items.push(normalized);
      }

      saveCartStorage(items, normalized);
      return items;
    },

    updateQuantity: function (indexOrKey, quantity) {
      var items = readCartStorage();
      var idx = resolveItemIndex(items, indexOrKey);
      if (idx === -1) return items;

      var nextQty = Math.floor(Number(quantity));
      if (!Number.isFinite(nextQty) || nextQty <= 0) {
        items.splice(idx, 1);
      } else {
        items[idx].quantity = nextQty;
      }

      saveCartStorage(items);
      return items;
    },

    removeItem: function (indexOrKey) {
      var items = readCartStorage();
      var idx = resolveItemIndex(items, indexOrKey);
      if (idx === -1) return items;

      var removed = items.splice(idx, 1)[0];
      saveCartStorage(items, removed);
      return items;
    },

    clearCart: function () {
      var empty = [];
      saveCartStorage(empty);
      return empty;
    }
  };

  window.Cart = Cart;

  if (document.readyState !== 'loading' && typeof window.updateCartBadge === 'function') {
    window.updateCartBadge();
  }
})();
