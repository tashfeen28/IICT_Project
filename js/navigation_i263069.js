/* navigation.js - builds the header and footer that appear on every page. */

const MENU_LINKS = [
  ['All Coffee', 'menu.html'],
  ['Cappuccino', 'cappuccino.html'],
  ['Espresso', 'espresso.html'],
  ['Latte', 'latte.html'],
  ['Cold Coffee', 'cold-coffee.html'],
  ['Signature Drinks', 'signature.html']
];

function currentFileName() {
  return location.pathname.split('/').pop() || 'index.html';
}

function navLink(label, file) {
  const active = currentFileName() === file ? ' aria-current="page"' : '';
  return '<a href="' + pageUrl(file) + '"' + active + '>' + label + '</a>';
}

function authLinkHTML() {
  const user = currentUser();
  if (user) {
    return '<button type="button" class="link-btn" id="logout-btn">Logout <span class="muted-light">(' + escapeHtml(user.username) + ')</span></button>';
  }
  return navLink('Login / Register', 'auth_i263069.html');
}

function renderHeader() {
  const holder = document.getElementById('site-header');
  if (!holder) return;
  const menuItems = MENU_LINKS.map(function (item) {
    return '<li>' + navLink(item[0], item[1]) + '</li>';
  }).join('');
  const onMenuPage = MENU_LINKS.some(function (item) { return item[1] === currentFileName(); });

  holder.innerHTML =
    '<header class="site-header"><div class="container header-inner">' +
    '<a class="brand" href="' + pageUrl('index.html') + '" aria-label="The Coffee Circle home">' +
    '<svg class="brand-mark" viewBox="0 0 64 64" width="38" height="38" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#C68B59"/>' +
    '<circle cx="32" cy="32" r="22" fill="none" stroke="#3B2418" stroke-width="3"/><path d="M20 28h22v8a11 11 0 0 1-22 0z" fill="#3B2418"/>' +
    '<path d="M42 30h3a4 4 0 0 1 0 8h-3" fill="none" stroke="#3B2418" stroke-width="2.5"/></svg>' +
    '<span class="brand-text">The Coffee Circle</span></a>' +
    '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">' +
    '<span></span><span></span><span></span></button>' +
    '<nav id="primary-nav" class="primary-nav" aria-label="Main"><ul>' +
    '<li>' + navLink('Home', 'index.html') + '</li>' +
    '<li>' + navLink('About', 'about.html') + '</li>' +
    '<li class="has-dropdown' + (onMenuPage ? ' current' : '') + '">' +
    '<button type="button" class="dropdown-toggle" aria-expanded="false" aria-haspopup="true">Menu <span aria-hidden="true">&#9662;</span></button>' +
    '<ul class="dropdown">' + menuItems + '</ul></li>' +
    '<li>' + navLink('Loyalty Rewards', 'loyalty.html') + '</li>' +
    '<li>' + navLink('My Account', 'account.html') + '</li>' +
    '<li id="auth-slot">' + authLinkHTML() + '</li>' +
    '<li><a class="cart-link" href="' + pageUrl('cart.html') + '" aria-label="Shopping cart">' +
    '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<path d="M9 7a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>' +
    '<span class="cart-count" hidden>0</span></a></li>' +
    '</ul></nav></div></header>';

  bindHeader();
}

/* Re-draw only the login/logout link (used right after logging in). */
function updateHeaderAuth() {
  const slot = document.getElementById('auth-slot');
  if (!slot) return;
  slot.innerHTML = authLinkHTML();
  bindLogout();
}

function bindLogout() {
  const button = document.getElementById('logout-btn');
  if (!button) return;
  button.addEventListener('click', function () {
    logoutUser();
    location.href = pageUrl('index.html');
  });
}

function bindHeader() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  const dropToggle = document.querySelector('.dropdown-toggle');
  const dropItem = document.querySelector('.has-dropdown');

  toggle.addEventListener('click', function () {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  dropToggle.addEventListener('click', function (event) {
    event.stopPropagation();
    const open = dropItem.classList.toggle('open');
    dropToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (event) {
    if (!dropItem.contains(event.target)) {
      dropItem.classList.remove('open');
      dropToggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      dropItem.classList.remove('open');
      dropToggle.setAttribute('aria-expanded', 'false');
    }
  });
  bindLogout();
}

function renderFooter() {
  const holder = document.getElementById('site-footer');
  if (!holder) return;
  const menuLinks = MENU_LINKS.map(function (item) {
    return '<li>' + navLink(item[0], item[1]) + '</li>';
  }).join('');
  holder.innerHTML =
    '<footer class="site-footer"><div class="container footer-grid">' +
    '<div><p class="footer-brand">The Coffee Circle</p>' +
    '<p>Your Daily Dose of Comfort. Specialty coffee, made your way and brought to your door.</p>' +
    '<div class="socials"><a href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="The Coffee Circle on Instagram">IG</a>' +
    '<a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="The Coffee Circle on Facebook">FB</a>' +
    '<a href="https://x.com/" target="_blank" rel="noopener" aria-label="The Coffee Circle on X">X</a></div></div>' +
    '<div><h2 class="footer-title">Quick links</h2><ul>' +
    '<li>' + navLink('Home', 'index.html') + '</li><li>' + navLink('About Us', 'about.html') + '</li>' +
    '<li>' + navLink('Loyalty Rewards', 'loyalty.html') + '</li><li>' + navLink('My Account', 'account.html') + '</li>' +
    '<li>' + navLink('Your Cart', 'cart.html') + '</li></ul></div>' +
    '<div><h2 class="footer-title">Our menu</h2><ul>' + menuLinks + '</ul></div>' +
    '<div><h2 class="footer-title">Contact</h2><address>' +
    '<p>Demo Street, Blue Area<br>Islamabad, Pakistan</p>' +
    '<p><a href="mailto:hello@coffeecircle.test">hello@coffeecircle.test</a></p>' +
    '<p>Open daily 8:00 am &ndash; 11:00 pm</p></address></div></div>' +
    '<div class="footer-bottom"><div class="container">' +
    '<p>&copy; 2026 The Coffee Circle. A university project for CL1000 (Fall 2026). Not a real business.</p>' +
    '<p class="small">Image disclosure: the drink pictures are vector illustrations written as code with the help of an AI assistant (Claude, by Anthropic). No AI image-generation tool was used.</p>' +
    '</div></div></footer>';
}

document.addEventListener('DOMContentLoaded', function () {
  renderHeader();
  renderFooter();
  updateCartBadge();
});
