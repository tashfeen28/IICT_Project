(function () {
  const root = document.body.dataset.root || '';
  const category = document.body.dataset.category || '';
  const isHome = root === '' && !category;

  function link(path) {
    return `${root}${path}`;
  }

  function isCurrent(cat) {
    return category === cat ? ' aria-current="page"' : '';
  }

  const headerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a href="${link('index.html')}" class="brand" aria-label="The Coffee Circle Home">
          <svg class="brand-logo" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="30" fill="#C68B59" />
            <circle cx="32" cy="32" r="24" fill="#3B2418" />
            <path d="M21 27h18v10a9 9 0 0 1-18 0V27Z" fill="#F5EBDD" />
            <path d="M39 29h3a4 4 0 0 1 0 8h-3" stroke="#F5EBDD" stroke-width="2.6" stroke-linecap="round" />
            <path d="M26 22c0-2 1.5-3 1.5-4.5M32 22c0-2 1.5-3 1.5-4.5" stroke="#C68B59" stroke-width="2.2" stroke-linecap="round" />
          </svg>
          <span>The Coffee Circle</span>
        </a>

        <nav class="primary-nav" id="primary-nav" aria-label="Primary Navigation">
          <ul class="nav-list">
            <li><a href="${link('index.html')}" class="nav-link${isHome ? ' active' : ''}"${isHome ? ' aria-current="page"' : ''}>Home</a></li>
            <li><a href="${link('pages/about.html')}" class="nav-link">About</a></li>
            <li class="nav-dropdown has-dropdown" id="menu-dropdown">
              <a href="${link('pages/menu.html')}" class="nav-link${category ? ' active' : ''}" aria-haspopup="true" aria-expanded="false">
                Menu <span aria-hidden="true">&#9662;</span>
              </a>
              <ul class="dropdown-menu" aria-label="Coffee Categories">
                <li><a href="${link('pages/menu.html')}">All Coffee</a></li>
                <li><a href="${link('pages/menu.html?category=cappuccino')}"${isCurrent('cappuccino')}>Cappuccino</a></li>
                <li><a href="${link('pages/menu.html?category=espresso')}"${isCurrent('espresso')}>Espresso</a></li>
                <li><a href="${link('pages/latte.html')}"${isCurrent('latte')}>Latte</a></li>
                <li><a href="${link('pages/menu.html?category=cold-coffee')}"${isCurrent('cold-coffee')}>Cold Coffee</a></li>
                <li><a href="${link('pages/menu.html?category=signature')}"${isCurrent('signature')}>Signature Drinks</a></li>
              </ul>
            </li>
            <li><a href="${link('pages/loyalty.html')}" class="nav-link">Loyalty Rewards</a></li>
            <li><a href="${link('pages/account.html')}" class="nav-link">My Account</a></li>
            <li><a href="${link('pages/auth.html')}" class="nav-link">Login</a></li>
          </ul>
        </nav>

        <div class="header-actions">
          <a href="${link('pages/cart.html')}" class="cart-link" aria-label="Shopping Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span class="cart-count" id="cart-count">0</span>
          </a>
          <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="primary-nav">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  `;

  const footerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <h3>The Coffee Circle</h3>
          <p>Handcrafted coffee, small-batch roasts, and rewarding daily rituals.</p>
          <div class="footer-socials">
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="X">X</a>
          </div>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="${link('index.html')}">Home</a></li>
            <li><a href="${link('pages/about.html')}">About Us</a></li>
            <li><a href="${link('pages/loyalty.html')}">Loyalty Rewards</a></li>
            <li><a href="${link('pages/account.html')}">My Account</a></li>
          </ul>
        </div>

        <div>
          <h4>Our Menu</h4>
          <ul>
            <li><a href="${link('pages/menu.html')}">All Coffee</a></li>
            <li><a href="${link('pages/menu.html?category=cappuccino')}">Cappuccino</a></li>
            <li><a href="${link('pages/menu.html?category=espresso')}">Espresso</a></li>
            <li><a href="${link('pages/latte.html')}">Latte</a></li>
            <li><a href="${link('pages/menu.html?category=cold-coffee')}">Cold Coffee</a></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li>12 Roastery Lane, Gulberg, Lahore</li>
            <li>hello@thecoffeecircle.pk</li>
            <li>+92 300 1234567</li>
            <li>Daily: 8:00 AM &ndash; 11:00 PM</li>
          </ul>
        </div>
      </div>

      <div class="container footer-bottom">
        <p>&copy; 2026 The Coffee Circle. All rights reserved.</p>
        <p class="ai-disclosure">Note: Product illustrations are code-generated SVGs; any AI-assisted imagery is used for conceptual presentation.</p>
      </div>
    </footer>
  `;

  const headerMount = document.getElementById('site-header-mount');
  const footerMount = document.getElementById('site-footer-mount');

  if (headerMount) headerMount.outerHTML = headerHTML;
  if (footerMount) footerMount.outerHTML = footerHTML;

  function syncCartCount() {
    const countEl = document.getElementById('cart-count');
    if (!countEl) return;
    try {
      const cart = JSON.parse(localStorage.getItem('coffee_circle_cart')) || [];
      countEl.textContent = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    } catch {
      countEl.textContent = '0';
    }
  }

  function setupNav() {
    const navToggle = document.getElementById('nav-toggle');
    const primaryNav = document.getElementById('primary-nav');
    const dropdowns = document.querySelectorAll('.has-dropdown');

    if (navToggle && primaryNav) {
      navToggle.addEventListener('click', () => {
        const isOpen = primaryNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });
    }

    dropdowns.forEach((dropdown) => {
      const trigger = dropdown.querySelector('.nav-link');
      if (!trigger) return;
      trigger.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
          e.preventDefault();
          const isOpen = dropdown.classList.toggle('open');
          trigger.setAttribute('aria-expanded', String(isOpen));
        }
      });
    });
  }

  syncCartCount();
  setupNav();
})();
