/* ==========================================================================
   The Coffee Circle — Shared Header, Footer & Cart Badge Navigation
   ========================================================================== */

(function () {
  'use strict';

  /**
   * Resolve root path prefix from <body data-root="...">, defaulting to "./"
   * or "../" when opened from inside /pages/.
   */
  function getRootPath() {
    var rawRoot = document.body && document.body.dataset ? document.body.dataset.root : '';
    if (!rawRoot) {
      rawRoot = window.location.pathname.indexOf('/pages/') !== -1 ? '../' : './';
    }
    return rawRoot.charAt(rawRoot.length - 1) === '/' ? rawRoot : rawRoot + '/';
  }

  /**
   * Determine the current page filename for active link highlighting.
   */
  function getCurrentPageName() {
    var path = window.location.pathname || '';
    var segment = path.split('/').pop();
    return segment || 'index.html';
  }

  /**
   * Compute total items in cart from global cart helpers or localStorage.
   */
  function getCartItemCount() {
    if (window.Cart && typeof window.Cart.getCount === 'function') {
      var helperCount = Number(window.Cart.getCount());
      if (!Number.isNaN(helperCount)) return Math.max(0, helperCount);
    }

    if (typeof window.getCartCount === 'function') {
      var globalCount = Number(window.getCartCount());
      if (!Number.isNaN(globalCount)) return Math.max(0, globalCount);
    }

    var storageKeys = ['coffeeCircleCart', 'coffee_circle_cart', 'tcc_cart', 'cart'];
    for (var i = 0; i < storageKeys.length; i += 1) {
      try {
        var raw = window.localStorage.getItem(storageKeys[i]);
        if (!raw) continue;
        var parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          return parsed.reduce(function (total, item) {
            var qty = item && (item.quantity || item.qty || 1);
            return total + (Number(qty) > 0 ? Number(qty) : 1);
          }, 0);
        }

        if (parsed && Array.isArray(parsed.items)) {
          return parsed.items.reduce(function (total, item) {
            var qty = item && (item.quantity || item.qty || 1);
            return total + (Number(qty) > 0 ? Number(qty) : 1);
          }, 0);
        }
      } catch (err) {
        // Ignore malformed storage values and check fallback keys.
      }
    }

    return 0;
  }

  /**
   * Update the live cart count badge in the navigation header.
   */
  function updateCartBadge() {
    var badge = document.getElementById('nav-cart-count');
    if (!badge) return;
    var count = getCartItemCount();
    badge.textContent = String(count);
    badge.setAttribute('aria-label', count + (count === 1 ? ' item in cart' : ' items in cart'));
  }

  /**
   * Build and inject the semantic header into #site-header.
   */
  function renderHeader(root, currentPage) {
    var headerHost = document.getElementById('site-header');
    if (!headerHost) return;

    var navItems = [
      { label: 'Menu', href: root + 'pages/menu.html', file: 'menu.html' },
      { label: 'Cold Coffee', href: root + 'pages/cold-coffee.html', file: 'cold-coffee.html' },
      { label: 'Loyalty', href: root + 'pages/loyalty.html', file: 'loyalty.html' },
      { label: 'Account', href: root + 'pages/account.html', file: 'account.html' },
      { label: 'Cart', href: root + 'pages/cart.html', file: 'cart.html', isCart: true }
    ];

    var navLinksHtml = navItems
      .map(function (item) {
        var isActive = currentPage === item.file;
        var classes = ['nav-link'];
        if (item.isCart) classes.push('nav-link-cart');
        if (isActive) classes.push('active');

        var activeAttr = isActive ? ' aria-current="page"' : '';
        var badgeHtml = item.isCart
          ? ' <span class="cart-badge" id="nav-cart-count" aria-live="polite">0</span>'
          : '';

        return (
          '<li>' +
          '<a class="' + classes.join(' ') + '" href="' + item.href + '"' + activeAttr + '>' +
          '<span>' + item.label + '</span>' +
          badgeHtml +
          '</a>' +
          '</li>'
        );
      })
      .join('');

    headerHost.innerHTML =
      '<header class="site-header">' +
      '  <div class="container header-inner">' +
      '    <a class="brand-logo" href="' + root + 'index.html">' +
      '      <img src="' + root + 'images/logo.svg" alt="The Coffee Circle logo" width="42" height="42">' +
      '      <span class="brand-name">The Coffee Circle</span>' +
      '    </a>' +
      '    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle navigation menu">' +
      '      <span class="nav-toggle-bar" aria-hidden="true"></span>' +
      '      <span class="nav-toggle-bar" aria-hidden="true"></span>' +
      '      <span class="nav-toggle-bar" aria-hidden="true"></span>' +
      '    </button>' +
      '    <nav class="site-nav" id="primary-nav" aria-label="Primary navigation">' +
      '      <ul class="nav-list">' + navLinksHtml + '</ul>' +
      '    </nav>' +
      '  </div>' +
      '</header>';

    setupMobileMenu(headerHost);
    updateCartBadge();
  }

  /**
   * Wire up mobile hamburger toggle, outside-click dismissal, and keyboard escape.
   */
  function setupMobileMenu(headerHost) {
    var toggleBtn = headerHost.querySelector('.nav-toggle');
    var nav = headerHost.querySelector('#primary-nav');
    if (!toggleBtn || !nav) return;

    function setMenuOpen(open) {
      nav.classList.toggle('is-open', open);
      toggleBtn.classList.toggle('is-open', open);
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggleBtn.addEventListener('click', function () {
      var isOpen = nav.classList.contains('is-open');
      setMenuOpen(!isOpen);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('click', function (event) {
      if (!headerHost.contains(event.target) && nav.classList.contains('is-open')) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenuOpen(false);
        toggleBtn.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && nav.classList.contains('is-open')) {
        setMenuOpen(false);
      }
    });
  }

  /**
   * Build and inject the semantic footer into #site-footer.
   */
  function renderFooter(root) {
    var footerHost = document.getElementById('site-footer');
    if (!footerHost) return;

    var year = new Date().getFullYear();

    footerHost.innerHTML =
      '<footer class="site-footer">' +
      '  <div class="container">' +
      '    <div class="footer-grid">' +
      '      <div>' +
      '        <a class="footer-brand-link" href="' + root + 'index.html">' +
      '          <img src="' + root + 'images/logo.svg" alt="" width="38" height="38">' +
      '          <span class="footer-brand-name">The Coffee Circle</span>' +
      '        </a>' +
      '        <p class="footer-tagline">Small-batch roasted beans, cold-brewed classics, and warm neighbourhood hospitality crafted daily.</p>' +
      '      </div>' +
      '      <div>' +
      '        <h2 class="footer-heading">Explore</h2>' +
      '        <ul class="footer-links">' +
      '          <li><a href="' + root + 'index.html">Home</a></li>' +
      '          <li><a href="' + root + 'pages/menu.html">Full Menu</a></li>' +
      '          <li><a href="' + root + 'pages/cold-coffee.html">Cold Coffee</a></li>' +
      '          <li><a href="' + root + 'pages/loyalty.html">Loyalty Circle</a></li>' +
      '        </ul>' +
      '      </div>' +
      '      <div>' +
      '        <h2 class="footer-heading">Your Order</h2>' +
      '        <ul class="footer-links">' +
      '          <li><a href="' + root + 'pages/account.html">Account</a></li>' +
      '          <li><a href="' + root + 'pages/cart.html">View Cart</a></li>' +
      '        </ul>' +
      '      </div>' +
      '      <div>' +
      '        <h2 class="footer-heading">Roastery Hours</h2>' +
      '        <ul class="footer-meta">' +
      '          <li>Mon – Fri: 7:00 AM – 8:00 PM</li>' +
      '          <li>Sat – Sun: 8:00 AM – 9:00 PM</li>' +
      '          <li>hello@thecoffeecircle.com</li>' +
      '        </ul>' +
      '      </div>' +
      '    </div>' +
      '    <div class="footer-bottom">' +
      '      <p>&copy; ' + year + ' The Coffee Circle. All rights reserved.</p>' +
      '      <p>Crafted with care for coffee lovers.</p>' +
      '    </div>' +
      '  </div>' +
      '</footer>';
  }

  function initNavigation() {
    var root = getRootPath();
    var currentPage = getCurrentPageName();
    renderHeader(root, currentPage);
    renderFooter(root);
  }

  // Expose badge updater so cart scripts can refresh the count immediately.
  window.updateCartBadge = updateCartBadge;
  window.addEventListener('storage', updateCartBadge);
  window.addEventListener('cart:updated', updateCartBadge);
  window.addEventListener('cartUpdated', updateCartBadge);
  document.addEventListener('cart:updated', updateCartBadge);
  document.addEventListener('cartUpdated', updateCartBadge);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
