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
      var normalizedPath = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
      rawRoot = normalizedPath.indexOf('/pages/') !== -1 ? '../' : './';
    }
    return rawRoot.charAt(rawRoot.length - 1) === '/' ? rawRoot : rawRoot + '/';
  }

  /**
   * Determine the current page filename for active link highlighting.
   */
  function getCurrentPageName() {
    var path = (window.location.pathname || '').replace(/\\/g, '/');
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
   * Build and inject the semantic header styles and HTML into #site-header.
   */
  function renderHeader(root, currentPage) {
    var headerHost = document.getElementById('site-header');
    if (!headerHost) return;

    var isMenuSection =
      currentPage === 'menu.html' ||
      currentPage === 'cold-coffee.html' ||
      (document.body && document.body.dataset && Boolean(document.body.dataset.category));

    var navItems = [
      { label: 'Home', href: root + 'index.html', file: 'index.html' },
      { label: 'About', href: root + 'pages/about.html', file: 'about.html' },
      { label: 'Menu', href: root + 'pages/menu.html', file: 'menu.html', isMenu: true },
      { label: 'Loyalty Rewards', href: root + 'pages/loyalty.html', file: 'loyalty.html' },
      { label: 'My Account', href: root + 'pages/account.html', file: 'account.html', isAccount: true },
      { label: 'Login / Register', href: root + 'pages/login.html', file: 'login.html' },
      { label: 'Cart', href: root + 'pages/cart.html', file: 'cart.html', isCart: true }
    ];

    var headerStyles =
      '<style id="tcc-header-styles">' +
      '  #site-header {' +
      '    position: sticky;' +
      '    top: 0;' +
      '    z-index: 1000;' +
      '    width: 100%;' +
      '    background: #3B2418;' +
      '  }' +
      '  #site-header .site-header {' +
      '    width: 100%;' +
      '    background: #3B2418;' +
      '    min-height: 68px;' +
      '    border-bottom: 1px solid rgba(198, 156, 109, 0.25);' +
      '  }' +
      '  #site-header .header-inner {' +
      '    display: flex;' +
      '    align-items: center;' +
      '    justify-content: space-between;' +
      '    gap: 1.25rem;' +
      '    min-height: 68px;' +
      '  }' +
      '  #site-header .brand-logo {' +
      '    display: inline-flex;' +
      '    align-items: center;' +
      '    gap: 0.65rem;' +
      '    flex-shrink: 0;' +
      '    text-decoration: none;' +
      '  }' +
      '  #site-header .brand-logo img {' +
      '    width: 36px;' +
      '    height: 36px;' +
      '    border-radius: 50%;' +
      '    object-fit: cover;' +
      '  }' +
      '  #site-header .brand-name {' +
      '    font-family: "Playfair Display", Georgia, "Times New Roman", serif;' +
      '    font-size: 1.25rem;' +
      '    font-weight: 700;' +
      '    color: #FFFFFF;' +
      '    letter-spacing: -0.01em;' +
      '  }' +
      '  #site-header .site-nav {' +
      '    display: flex;' +
      '    align-items: center;' +
      '    margin-left: auto;' +
      '  }' +
      '  #site-header .nav-list {' +
      '    display: flex;' +
      '    align-items: center;' +
      '    gap: 0.35rem;' +
      '    margin: 0;' +
      '    padding: 0;' +
      '    list-style: none;' +
      '  }' +
      '  #site-header .nav-link,' +
      '  #site-header .tcc-nav-link {' +
      '    position: relative;' +
      '    display: inline-flex;' +
      '    align-items: center;' +
      '    gap: 0.45rem;' +
      '    padding: 7px 12px;' +
      '    border-radius: 999px;' +
      '    font-size: 0.9rem;' +
      '    font-weight: 500;' +
      '    color: #F5EBDD;' +
      '    text-decoration: none;' +
      '    white-space: nowrap;' +
      '    transition: color 160ms ease, background-color 160ms ease;' +
      '  }' +
      '  #site-header .nav-link:hover,' +
      '  #site-header .tcc-nav-link:hover {' +
      '    background-color: rgba(245, 235, 221, 0.12);' +
      '    color: #FFFFFF;' +
      '  }' +
      '  #site-header .nav-link.active,' +
      '  #site-header .tcc-nav-link.active {' +
      '    background: #C69C6D;' +
      '    color: #24140D;' +
      '    border-radius: 999px;' +
      '    padding: 7px 16px;' +
      '    font-weight: 600;' +
      '  }' +
      '  #site-header .nav-link.active:hover,' +
      '  #site-header .tcc-nav-link.active:hover {' +
      '    background: #D1AA7D;' +
      '    color: #24140D;' +
      '  }' +
      '  #site-header .nav-active-dot {' +
      '    display: inline-block;' +
      '    width: 6px;' +
      '    height: 6px;' +
      '    border-radius: 50%;' +
      '    background-color: #24140D;' +
      '    flex-shrink: 0;' +
      '  }' +
      '  #site-header .nav-link-cart {' +
      '    display: inline-flex;' +
      '    align-items: center;' +
      '    gap: 0.4rem;' +
      '    padding: 7px 10px;' +
      '    color: #FFFFFF;' +
      '  }' +
      '  #site-header .nav-link-cart:hover {' +
      '    background-color: rgba(245, 235, 221, 0.14);' +
      '    color: #FFFFFF;' +
      '  }' +
      '  #site-header .nav-link-cart.active {' +
      '    background: #C69C6D;' +
      '    color: #24140D;' +
      '    border-radius: 999px;' +
      '    padding: 7px 14px;' +
      '    font-weight: 600;' +
      '  }' +
      '  #site-header .nav-link-cart.active:hover {' +
      '    background: #D1AA7D;' +
      '    color: #24140D;' +
      '  }' +
      '  #site-header .nav-link-cart.active .cart-badge {' +
      '    background-color: #3B2418;' +
      '    color: #FAF6F0;' +
      '  }' +
      '  #site-header .nav-cart-icon {' +
      '    width: 20px;' +
      '    height: 20px;' +
      '    display: block;' +
      '    flex-shrink: 0;' +
      '  }' +
      '  @media (max-width: 900px) {' +
      '    #site-header .nav-link,' +
      '    #site-header .tcc-nav-link {' +
      '      justify-content: space-between;' +
      '      padding: 0.75rem 1rem;' +
      '      font-size: 1rem;' +
      '    }' +
      '    #site-header .nav-link.active,' +
      '    #site-header .tcc-nav-link.active {' +
      '      justify-content: flex-start;' +
      '      padding: 7px 16px;' +
      '    }' +
      '  }' +
      '</style>';

    var bagIconSvg =
      '<svg class="nav-cart-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '  <path d="M6 7h12l1 13H5L6 7z" />' +
      '  <path d="M9 7V5a3 3 0 0 1 6 0v2" />' +
      '</svg>';

    var navLinksHtml = navItems
      .map(function (item) {
        var isActive = item.isMenu ? isMenuSection : currentPage === item.file;
        // Keep "My Account" free of the .nav-link selector that js/auth.js overwrites with "Account".
        var baseClass = item.isAccount ? 'tcc-nav-link' : 'nav-link';
        var classes = [baseClass];
        if (item.isCart) classes.push('nav-link-cart');
        if (isActive) classes.push('active');

        var activeAttr = isActive ? ' aria-current="page"' : '';

        if (item.isCart) {
          return (
            '<li>' +
            '<a class="' + classes.join(' ') + '" href="' + item.href + '"' + activeAttr + ' aria-label="Shopping cart">' +
            bagIconSvg +
            '<span class="cart-badge" id="nav-cart-count" aria-live="polite">0</span>' +
            '</a>' +
            '</li>'
          );
        }

        var dotHtml = isActive && item.isMenu
          ? '<span class="nav-active-dot" aria-hidden="true"></span>'
          : '';

        return (
          '<li>' +
          '<a class="' + classes.join(' ') + '" href="' + item.href + '"' + activeAttr + '>' +
          dotHtml +
          '<span>' + item.label + '</span>' +
          '</a>' +
          '</li>'
        );
      })
      .join('');

    headerHost.innerHTML =
      headerStyles +
      '<header class="site-header">' +
      '  <div class="container header-inner">' +
      '    <a class="brand-logo" href="' + root + 'index.html">' +
      '      <img src="' + root + 'images/logo.svg" alt="The Coffee Circle logo" width="36" height="36">' +
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

    if (window.Auth && typeof window.Auth.updateAccountNav === 'function') {
      window.Auth.updateAccountNav();
    }
  }

  // Expose badge updater so cart scripts can refresh the count immediately.
  window.updateCartBadge = updateCartBadge;
  window.addEventListener('storage', updateCartBadge);
  window.addEventListener('cart:updated', updateCartBadge);
  window.addEventListener('cartUpdated', updateCartBadge);
  document.addEventListener('cart:updated', updateCartBadge);
  document.addEventListener('cartUpdated', updateCartBadge);

  if (
    document.readyState !== 'loading' ||
    document.getElementById('site-header') ||
    document.getElementById('site-footer')
  ) {
    initNavigation();
  } else {
    document.addEventListener('DOMContentLoaded', initNavigation);
  }
})();
