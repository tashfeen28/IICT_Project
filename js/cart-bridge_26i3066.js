/* ==========================================================================
   The Coffee Circle — Cart Bridge for Window.CoffeeCart Callers
   Normalizes items and forwards to window.Cart or localStorage "coffeeCircleCart"
   ========================================================================== */

(function () {
  'use strict';

  if (typeof window.CoffeeCart !== 'undefined') {
    return;
  }

  var CART_STORAGE_KEY = 'coffeeCircleCart';

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

  function normalizeExtras(rawExtras) {
    if (!Array.isArray(rawExtras)) return [];
    return rawExtras.map(function (extra) {
      if (extra && typeof extra === 'object') {
        var id = String(extra.id || extra.label || '').trim();
        var label = String(extra.label || extra.id || '').trim();
        var price = Number(extra.price || 0);
        return {
          id: id,
          label: label,
          price: Number.isFinite(price) ? price : 0
        };
      }
      var text = String(extra == null ? '' : extra).trim();
      return { id: text, label: text, price: 0 };
    });
  }

  function normalizeItem(item) {
    var extras = normalizeExtras(item && item.extras);
    var rawUnitPrice =
      item && item.unitPrice != null
        ? item.unitPrice
        : item && item.price != null
          ? item.price
          : item && item.basePrice != null
            ? item.basePrice
            : 0;
    var unitPrice = Number(rawUnitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) unitPrice = 0;

    var rawBasePrice = item && item.basePrice != null ? Number(item.basePrice) : unitPrice;
    var basePrice = Number.isFinite(rawBasePrice) && rawBasePrice >= 0 ? rawBasePrice : unitPrice;

    var rawSizeDelta = Number((item && item.sizeDelta) || 0);
    var sizeDelta = Number.isFinite(rawSizeDelta) ? rawSizeDelta : 0;

    var rawQty = Number(item && (item.quantity != null ? item.quantity : item.qty));
    var quantity = Number.isFinite(rawQty) && rawQty >= 1 ? Math.floor(rawQty) : 1;

    return {
      id: String((item && item.id) || ''),
      name: String((item && item.name) || 'Coffee Drink'),
      category: String((item && item.category) || ''),
      image: String((item && item.image) || ''),
      basePrice: basePrice,
      size: String((item && item.size) || 'Small'),
      sizeDelta: sizeDelta,
      extras: extras,
      unitPrice: unitPrice,
      price: unitPrice,
      quantity: quantity
    };
  }

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

  function writeCartStorage(items) {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      // Ignore storage quota or private-browsing errors.
    }
  }

  function addItem(item) {
    if (!item || !item.id) return [];

    var normalized = normalizeItem(item);

    if (window.Cart && typeof window.Cart.addItem === 'function') {
      return window.Cart.addItem(normalized);
    }

    var items = readCartStorage();
    var signature = buildItemSignature(normalized);
    var existingIndex = -1;

    for (var i = 0; i < items.length; i += 1) {
      if (buildItemSignature(items[i]) === signature) {
        existingIndex = i;
        break;
      }
    }

    if (existingIndex !== -1) {
      var currentQty = Number(items[existingIndex].quantity != null ? items[existingIndex].quantity : items[existingIndex].qty || 1);
      if (!Number.isFinite(currentQty) || currentQty < 1) currentQty = 1;
      items[existingIndex].quantity = Math.floor(currentQty) + normalized.quantity;
    } else {
      items.push(normalized);
    }

    writeCartStorage(items);
    return items;
  }

  function updateBadge() {
    if (typeof window.updateCartBadge === 'function') {
      window.updateCartBadge();
    }
  }

  window.CoffeeCart = {
    addItem: addItem,
    updateBadge: updateBadge
  };
})();
