const COFFEE_ITEMS = [
  {
    id: 'classic-cappuccino',
    name: 'Classic Cappuccino',
    category: 'Cappuccino',
    price: 550,
    badge: 'Featured',
    section: 'featured',
    cupColor: '#C68B59',
    foamColor: '#F5EBDD',
    desc: 'Rich double espresso topped with velvety steamed milk and thick microfoam.'
  },
  {
    id: 'caramel-latte',
    name: 'Salted Caramel Latte',
    category: 'Latte',
    price: 650,
    badge: 'Featured',
    section: 'featured',
    cupColor: '#654321',
    foamColor: '#E8D8C3',
    desc: 'Smooth espresso swirled with house-made salted caramel and silky milk.'
  },
  {
    id: 'iced-spanish-latte',
    name: 'Iced Spanish Latte',
    category: 'Cold Coffee',
    price: 680,
    badge: 'Featured',
    section: 'featured',
    cupColor: '#3B2418',
    foamColor: '#F5EBDD',
    desc: 'Chilled espresso over ice with sweetened condensed milk and a creamy finish.'
  },
  {
    id: 'classic-espresso',
    name: 'Classic Espresso',
    category: 'Espresso',
    price: 420,
    badge: 'Bestseller',
    section: 'bestseller',
    cupColor: '#3B2418',
    foamColor: '#C68B59',
    desc: 'Bold, aromatic single-origin shot with a rich golden-brown crema.'
  },
  {
    id: 'hazelnut-mocha',
    name: 'Hazelnut Mocha',
    category: 'Signature Drinks',
    price: 720,
    badge: 'Bestseller',
    section: 'bestseller',
    cupColor: '#654321',
    foamColor: '#C68B59',
    desc: 'Dark cocoa, roasted hazelnut, and espresso finished with light cream.'
  },
  {
    id: 'vanilla-cold-brew',
    name: 'Vanilla Cold Brew',
    category: 'Cold Coffee',
    price: 620,
    badge: 'Bestseller',
    section: 'bestseller',
    cupColor: '#2d1c13',
    foamColor: '#E8D8C3',
    desc: '16-hour slow-steeped cold brew infused with Madagascar vanilla.'
  }
];

const CART_KEY = 'coffee_circle_cart';
const NEWSLETTER_KEY = 'coffee_circle_newsletter';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  if (!countEl) return;
  const total = getCart().reduce((sum, item) => sum + (item.qty || 1), 0);
  countEl.textContent = total;
}

function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

function createCupSVG(cupColor, foamColor) {
  return `
    <svg viewBox="0 0 120 120" width="96" height="96" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="52" fill="#F5EBDD" />
      <path d="M34 48h44v22a22 22 0 0 1-44 0V48Z" fill="${cupColor}" />
      <path d="M78 52h7a8 8 0 0 1 0 16h-7" stroke="${cupColor}" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="56" cy="48" rx="22" ry="6" fill="${foamColor}" />
      <path d="M48 34c0-3 2-5 2-8M62 34c0-3 2-5 2-8" stroke="#C68B59" stroke-width="2.5" stroke-linecap="round" />
    </svg>
  `;
}

function renderProducts(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = items.map((item) => `
    <article class="product-card">
      <div class="product-thumb">
        ${createCupSVG(item.cupColor, item.foamColor)}
      </div>
      <div class="product-meta">
        <span class="product-cat">${item.category}</span>
        <span class="product-price">PKR ${item.price}</span>
      </div>
      <h3>${item.name}</h3>
      <p class="product-desc">${item.desc}</p>
      <div class="product-actions">
        <a href="pages/product-details.html?id=${item.id}" class="btn btn-outline btn-sm">View Details</a>
        <button type="button" class="btn btn-primary btn-sm add-to-cart" data-id="${item.id}">Add to Cart</button>
      </div>
    </article>
  `).join('');
}

function addToCart(id) {
  const product = COFFEE_ITEMS.find((item) => item.id === id);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  showToast(`${product.name} added to cart`);
}

function initNavigation() {
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

function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('newsletter-email');
  const messageEl = document.getElementById('newsletter-message');
  if (!form || !emailInput || !messageEl) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) {
      messageEl.textContent = 'Please enter a valid email address.';
      messageEl.className = 'form-message error';
      return;
    }

    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(NEWSLETTER_KEY)) || [];
    } catch {
      saved = [];
    }

    if (!saved.includes(email)) {
      saved.push(email);
      localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(saved));
    }

    messageEl.textContent = 'Thanks for subscribing! Watch your inbox for fresh brews.';
    messageEl.className = 'form-message success';
    form.reset();
  });
}

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderProducts(COFFEE_ITEMS.filter((i) => i.section === 'featured'), 'featured-grid');
  renderProducts(COFFEE_ITEMS.filter((i) => i.section === 'bestseller'), 'bestseller-grid');
  updateCartCount();
  initNewsletter();
  initScrollReveal();

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (btn) {
      addToCart(btn.dataset.id);
    }
  });
});
