// Espresso product catalog, customization, Quick View modal, and cart integration

(function () {
  const ESPRESSO_PRODUCTS = [
    {
      id: "classic-espresso",
      name: "Classic Espresso",
      roast: "Medium-Dark",
      description: "A concentrated single shot with dense golden crema and balanced bittersweet depth.",
      basePrice: 250,
      image: "images/espresso/classic-espresso.jpg",
      sizes: [
        { label: "Single (30 ml)", priceDelta: 0 },
        { label: "Long Pull (45 ml)", priceDelta: 50 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Raw Brown Sugar", price: 30 },
        { label: "Steamed Oat Milk Splash", price: 80 }
      ],
      ingredients: [
        "Double-filtered brewing water (93°C)",
        "18g House Espresso Blend (Colombia & Brazil)",
        "Natural roasted coffee crema"
      ]
    },
    {
      id: "double-espresso",
      name: "Double Espresso",
      roast: "Medium-Dark",
      description: "Two rich shots pulled together for fuller body, cocoa aroma, and lingering sweetness.",
      basePrice: 350,
      image: "images/espresso/double-espresso.jpg",
      sizes: [
        { label: "Doppio (60 ml)", priceDelta: 0 },
        { label: "Triple (90 ml)", priceDelta: 120 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Caramel Drizzle", price: 70 },
        { label: "Sparkling Side Water", price: 0 }
      ],
      ingredients: [
        "Double-filtered brewing water",
        "20g House Espresso Blend",
        "Thick velvety crema"
      ]
    },
    {
      id: "ristretto",
      name: "Ristretto",
      roast: "Medium",
      description: "Pulled short for syrupy concentration, toasted nut notes, and softer acidity.",
      basePrice: 300,
      image: "images/espresso/ristretto.jpg",
      sizes: [
        { label: "Single Short (20 ml)", priceDelta: 0 },
        { label: "Double Short (40 ml)", priceDelta: 100 }
      ],
      extras: [
        { label: "Extra Ristretto Shot", price: 100 },
        { label: "Cinnamon Dusting", price: 30 },
        { label: "Dark Cocoa Dusting", price: 40 }
      ],
      ingredients: [
        "Double-filtered brewing water",
        "19g Single-Origin Colombian Huila espresso",
        "Fine-ground short extraction"
      ]
    },
    {
      id: "americano",
      name: "Americano",
      artVariant: "latte-heart",
      roast: "Medium",
      description: "Double espresso lengthened with hot water for a clean, aromatic black coffee.",
      basePrice: 320,
      image: "images/espresso/americano.jpg",
      sizes: [
        { label: "Regular (8 oz)", priceDelta: 0 },
        { label: "Large (12 oz)", priceDelta: 80 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Honey Drizzle", price: 60 },
        { label: "Splash of Whole Milk", price: 50 }
      ],
      ingredients: [
        "Double shot house espresso (60 ml)",
        "Filtered hot water (180 ml)"
      ]
    },
    {
      id: "cortado",
      name: "Cortado",
      roast: "Medium",
      description: "Equal parts bold espresso and lightly steamed warm milk to round off the edges.",
      basePrice: 380,
      image: "images/espresso/cortado.jpg",
      sizes: [
        { label: "Classic (4.5 oz)", priceDelta: 0 },
        { label: "Large (6 oz)", priceDelta: 90 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Vanilla Bean Syrup", price: 70 }
      ],
      ingredients: [
        "Double shot house espresso (60 ml)",
        "Steamed whole milk (70 ml)",
        "Light micro-foam cap"
      ]
    },
    {
      id: "flat-white",
      name: "Flat White",
      artVariant: "latte-heart",
      roast: "Medium",
      description: "Twin ristretto shots folded into glossy, fine-textured steamed milk.",
      basePrice: 420,
      image: "images/espresso/flat-white.jpg",
      sizes: [
        { label: "Regular (6 oz)", priceDelta: 0 },
        { label: "Tall (8 oz)", priceDelta: 90 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Salted Caramel Syrup", price: 70 }
      ],
      ingredients: [
        "Double ristretto espresso (45 ml)",
        "Steamed whole milk (135 ml)",
        "Silky glossy micro-foam"
      ]
    },
    {
      id: "espresso-macchiato",
      name: "Espresso Macchiato",
      roast: "Dark",
      description: "Intense dark-roast espresso marked with a spoonful of dense steamed milk foam.",
      basePrice: 340,
      image: "images/espresso/espresso-macchiato.jpg",
      sizes: [
        { label: "Single (2 oz)", priceDelta: 0 },
        { label: "Double (3 oz)", priceDelta: 100 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Hazelnut Syrup", price: 70 },
        { label: "Oat Foam Swap", price: 80 }
      ],
      ingredients: [
        "Dark Roast Espresso (Sumatra & Guatemala)",
        "Steamed milk foam dollop"
      ]
    },
    {
      id: "honey-cinnamon-espresso",
      name: "Honey Cinnamon Espresso",
      artVariant: "latte-heart",
      roast: "Light-Medium",
      description: "Bright double espresso infused with wildflower honey, Ceylon cinnamon, and warm milk.",
      basePrice: 440,
      image: "images/espresso/honey-cinnamon-espresso.jpg",
      sizes: [
        { label: "Regular (6 oz)", priceDelta: 0 },
        { label: "Large (10 oz)", priceDelta: 100 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Iced Over Clear Cube", price: 50 }
      ],
      ingredients: [
        "Double shot light-medium espresso",
        "Raw wildflower honey",
        "Ground Ceylon cinnamon",
        "Steamed milk"
      ]
    }
  ];

  function getRootPath() {
    const rawRoot = document.body?.dataset?.root || "";
    if (!rawRoot) {
      return "";
    }
    return rawRoot.endsWith("/") ? rawRoot : `${rawRoot}/`;
  }

  function formatPrice(amount) {
    const value = Math.round(Number(amount || 0));
    return `PKR ${value.toLocaleString("en-US")}`;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
  }

  function getCardSelection(cardEl, product) {
    const sizeSelect = cardEl.querySelector("[data-size-select]");
    const sizeIndex = Number(sizeSelect ? sizeSelect.value : 0);
    const chosenSize = product.sizes[sizeIndex] || product.sizes[0];

    const qtyValueEl = cardEl.querySelector("[data-qty-value]");
    const quantity = Math.max(1, Number(qtyValueEl ? qtyValueEl.textContent : 1) || 1);

    const extraInputs = Array.from(cardEl.querySelectorAll("[data-extra-checkbox]:checked"));
    const chosenExtras = extraInputs
      .map((input) => product.extras[Number(input.value)])
      .filter(Boolean);

    const extrasTotal = chosenExtras.reduce((sum, extra) => sum + extra.price, 0);
    const unitPrice = product.basePrice + chosenSize.priceDelta + extrasTotal;
    const totalPrice = unitPrice * quantity;

    return {
      size: chosenSize,
      quantity,
      extras: chosenExtras,
      unitPrice,
      totalPrice
    };
  }

  function updateCardPrice(cardEl, product) {
    const priceEl = cardEl.querySelector("[data-card-price]");
    if (!priceEl) {
      return;
    }
    const { totalPrice } = getCardSelection(cardEl, product);
    priceEl.textContent = formatPrice(totalPrice);
  }

  function ensureQuickViewModal() {
    let modalEl = document.getElementById("quickViewModal");
    if (modalEl) {
      return modalEl;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="modal fade coffee-modal" id="quickViewModal" tabindex="-1" aria-labelledby="quickViewTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <div>
                <p class="eyebrow mb-1" id="quickViewCategory"></p>
                <h2 class="modal-title h4 mb-0" id="quickViewTitle"></h2>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p class="mb-3" id="quickViewDescription"></p>
              <h3 class="h6 text-uppercase fw-bold mb-2">Ingredients</h3>
              <ul class="quick-view-ingredients mb-3" id="quickViewIngredients"></ul>
              <p class="quick-view-selection mb-0" id="quickViewSelection"></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline btn-sm" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary btn-sm" id="quickViewAddBtn">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    `;

    modalEl = wrapper.firstElementChild;
    document.body.appendChild(modalEl);

    modalEl.addEventListener("click", (event) => {
      if (window.bootstrap && window.bootstrap.Modal) {
        return;
      }
      if (event.target === modalEl || event.target.closest("[data-bs-dismiss='modal']")) {
        modalEl.classList.remove("show");
        modalEl.style.display = "none";
        modalEl.setAttribute("aria-hidden", "true");
      }
    });

    return modalEl;
  }

  function openQuickView(product, cardEl, onAdd) {
    const modalEl = ensureQuickViewModal();
    const selection = getCardSelection(cardEl, product);

    modalEl.querySelector("#quickViewCategory").textContent = `ESPRESSO \u2022 ${product.roast} Roast`;
    modalEl.querySelector("#quickViewTitle").textContent = product.name;
    modalEl.querySelector("#quickViewDescription").textContent = product.description;

    const ingredientsList = modalEl.querySelector("#quickViewIngredients");
    ingredientsList.innerHTML = product.ingredients
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");

    const extrasLabel = selection.extras.length
      ? selection.extras.map((extra) => extra.label).join(", ")
      : "None";

    modalEl.querySelector("#quickViewSelection").textContent =
      `${selection.size.label} \u00d7 ${selection.quantity} | Extras: ${extrasLabel} \u2014 ${formatPrice(selection.totalPrice)}`;

    const modalAddBtn = modalEl.querySelector("#quickViewAddBtn");
    modalAddBtn.onclick = () => {
      onAdd(product, cardEl, modalAddBtn);
    };

    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    } else {
      modalEl.style.display = "block";
      modalEl.classList.add("show");
      modalEl.removeAttribute("aria-hidden");
    }
  }

  function addConfiguredItemToCart(product, cardEl, triggerBtn, liveRegion) {
    const { size, quantity, extras, unitPrice, totalPrice } = getCardSelection(cardEl, product);

    if (window.CoffeeCart && typeof window.CoffeeCart.addItem === "function") {
      window.CoffeeCart.addItem({
        id: product.id,
        name: product.name,
        category: "espresso",
        size: size.label,
        extras: extras.map((extra) => extra.label),
        price: Math.round(unitPrice),
        totalPrice: Math.round(totalPrice),
        quantity
      });
    }

    if (window.CoffeeCart && typeof window.CoffeeCart.updateBadge === "function") {
      window.CoffeeCart.updateBadge();
    }

    if (liveRegion) {
      liveRegion.textContent = `Added ${quantity} ${product.name} (${size.label}) to cart.`;
    }

    if (triggerBtn) {
      const originalText = triggerBtn.dataset.originalLabel || triggerBtn.textContent;
      triggerBtn.dataset.originalLabel = originalText;
      triggerBtn.textContent = "Added to Cart";
      triggerBtn.classList.add("btn-added");
      window.clearTimeout(Number(triggerBtn.dataset.resetTimerId));
      const timerId = window.setTimeout(() => {
        triggerBtn.textContent = originalText;
        triggerBtn.classList.remove("btn-added");
      }, 1400);
      triggerBtn.dataset.resetTimerId = String(timerId);
    }
  }

  function buildCoffeeEmblemSvg(variant) {
    if (variant === "latte-heart") {
      return `
        <svg viewBox="0 0 96 96" width="84" height="84" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <ellipse cx="48" cy="74" rx="30" ry="6" fill="#F2EAE0"/>
          <ellipse cx="48" cy="72" rx="28" ry="5" fill="#FFFFFF"/>
          <path d="M22 36H70V51C70 63.703 59.703 72 46 72C32.297 72 22 63.703 22 51V36Z" fill="#FFFFFF"/>
          <path d="M70 40H75.5C79.642 40 83 43.358 83 47.5C83 51.642 79.642 55 75.5 55H69.5" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
          <ellipse cx="46" cy="36" rx="24" ry="7.5" fill="#C68B59"/>
          <ellipse cx="46" cy="36" rx="20" ry="5.5" fill="#F5EBDD"/>
          <path d="M46 40.2C46 40.2 38.5 36.8 38.5 33.4C38.5 31.7 39.9 30.5 41.6 30.5C43.2 30.5 44.7 31.4 46 32.8C47.3 31.4 48.8 30.5 50.4 30.5C52.1 30.5 53.5 31.7 53.5 33.4C53.5 36.8 46 40.2 46 40.2Z" fill="#8C5327"/>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 96 96" width="84" height="84" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="48" cy="74" rx="28" ry="5.5" fill="#F2EAE0"/>
        <ellipse cx="48" cy="72" rx="26" ry="4.5" fill="#FFFFFF"/>
        <path d="M26 37H66V52C66 63.046 57.046 71 46 71C34.954 71 26 63.046 26 52V37Z" fill="#FFFFFF"/>
        <path d="M66 41H71C74.866 41 78 44.134 78 48C78 51.866 74.866 55 71 55H65.5" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="46" cy="37" rx="20" ry="6" fill="#6E3F22"/>
        <ellipse cx="46" cy="36.5" rx="16.5" ry="4.2" fill="#C68B59"/>
        <path d="M38 25C36 22 36 18.5 38 15.5M46 24C44 21 44 17.5 46 14.5M54 25C52 22 52 18.5 54 15.5" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-opacity="0.9"/>
      </svg>
    `;
  }

  function createProductCard(product, index, root, liveRegion) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productId = product.id;

    const sizeOptionsHtml = product.sizes
      .map((size, sizeIndex) => {
        const deltaText = size.priceDelta > 0 ? ` (+${formatPrice(size.priceDelta)})` : "";
        return `<option value="${sizeIndex}">${escapeHtml(size.label + deltaText)}</option>`;
      })
      .join("");

    const extrasHtml = product.extras
      .map((extra, extraIndex) => {
        const inputId = `${product.id}-extra-${extraIndex}`;
        const priceLabel = extra.price > 0 ? `+${formatPrice(extra.price)}` : "Free";
        return `
          <label class="extra-option" for="${inputId}">
            <input type="checkbox" id="${inputId}" value="${extraIndex}" data-extra-checkbox>
            <span>${escapeHtml(extra.label)}</span>
            <span class="extra-price">${escapeHtml(priceLabel)}</span>
          </label>
        `;
      })
      .join("");

    const artVariant = product.artVariant || ((index + 1) % 4 === 0 ? "latte-heart" : "classic");
    const extrasPanelId = `${product.id}-extras-panel`;

    card.innerHTML = `
      <div class="product-card-media">
        <img
          src="${root}${product.image}"
          alt="${escapeHtml(product.name)}"
          loading="lazy"
        >
        <div class="product-card-fallback" aria-hidden="true">
          <div class="product-card-fallback-circle">
            ${buildCoffeeEmblemSvg(artVariant)}
          </div>
        </div>
      </div>
      <div class="product-card-body">
        <p class="product-category-label">ESPRESSO</p>
        <h2 class="product-card-title">${escapeHtml(product.name)}</h2>
        <p class="product-card-desc">${escapeHtml(product.description)}</p>
        <p class="product-ingredients-line">
          <strong>Ingredients:</strong> ${escapeHtml(product.ingredients.join(", "))}
        </p>

        <div class="product-options">
          <div class="product-controls-row">
            <div class="control-group">
              <label class="option-label" for="${product.id}-size">Size</label>
              <select class="form-select form-select-sm coffee-select" id="${product.id}-size" data-size-select>
                ${sizeOptionsHtml}
              </select>
            </div>
            <div class="control-group">
              <span class="option-label" id="${product.id}-qty-label">Quantity</span>
              <div class="qty-stepper" role="group" aria-labelledby="${product.id}-qty-label">
                <button type="button" class="qty-btn" data-qty-dec aria-label="Decrease quantity">&minus;</button>
                <span class="qty-value" data-qty-value>1</span>
                <button type="button" class="qty-btn" data-qty-inc aria-label="Increase quantity">+</button>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="customise-toggle"
            aria-expanded="false"
            aria-controls="${extrasPanelId}"
            data-customise-toggle
          >
            <span class="customise-arrow" aria-hidden="true">&#9656;</span>
            Customise your drink
          </button>

          <div class="customise-panel" id="${extrasPanelId}" hidden data-customise-panel>
            <fieldset class="product-extras">
              <legend class="visually-hidden">Drink extras for ${escapeHtml(product.name)}</legend>
              ${extrasHtml}
            </fieldset>
          </div>
        </div>

        <p class="product-price" data-card-price>${formatPrice(product.basePrice)}</p>

        <div class="product-card-actions">
          <button type="button" class="btn btn-primary btn-sm" data-add-to-cart>Add to Cart</button>
          <button type="button" class="btn btn-outline btn-sm" data-quick-view>Quick View</button>
        </div>
      </div>
    `;

    const mediaBox = card.querySelector(".product-card-media");
    const productImg = mediaBox.querySelector("img");
    productImg.addEventListener("error", () => {
      mediaBox.classList.add("is-fallback");
      productImg.hidden = true;
    });

    const sizeSelect = card.querySelector("[data-size-select]");
    sizeSelect.addEventListener("change", () => {
      updateCardPrice(card, product);
    });

    const qtyValueEl = card.querySelector("[data-qty-value]");
    card.querySelector("[data-qty-dec]").addEventListener("click", () => {
      const current = Number(qtyValueEl.textContent) || 1;
      if (current > 1) {
        qtyValueEl.textContent = String(current - 1);
        updateCardPrice(card, product);
      }
    });

    card.querySelector("[data-qty-inc]").addEventListener("click", () => {
      const current = Number(qtyValueEl.textContent) || 1;
      qtyValueEl.textContent = String(current + 1);
      updateCardPrice(card, product);
    });

    const customiseBtn = card.querySelector("[data-customise-toggle]");
    const customisePanel = card.querySelector("[data-customise-panel]");
    customiseBtn.addEventListener("click", () => {
      const isExpanded = customiseBtn.getAttribute("aria-expanded") === "true";
      customiseBtn.setAttribute("aria-expanded", String(!isExpanded));
      customisePanel.hidden = isExpanded;
    });

    card.querySelectorAll("[data-extra-checkbox]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateCardPrice(card, product);
      });
    });

    card.querySelector("[data-quick-view]").addEventListener("click", () => {
      openQuickView(product, card, (item, el, btn) => {
        addConfiguredItemToCart(item, el, btn, liveRegion);
      });
    });

    card.querySelector("[data-add-to-cart]").addEventListener("click", (event) => {
      addConfiguredItemToCart(product, card, event.currentTarget, liveRegion);
    });

    return card;
  }

  function renderEspressoFooter(footerHost, root) {
    footerHost.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <p class="footer-title">The Coffee Circle</p>
              <p class="footer-copy">
                Your Daily Dose of Comfort. Specialty coffee, made your way and brought to your door.
              </p>
              <div class="footer-social" aria-label="Social media">
                <button type="button" class="footer-social-btn" aria-label="Instagram">IG</button>
                <button type="button" class="footer-social-btn" aria-label="Facebook">FB</button>
                <button type="button" class="footer-social-btn" aria-label="X">X</button>
              </div>
            </div>

            <nav aria-label="Quick Links">
              <h2 class="footer-heading">QUICK LINKS</h2>
              <ul class="footer-list">
                <li><a href="${root}index.html">Home</a></li>
                <li><a href="${root}pages/about.html">About Us</a></li>
                <li><a href="${root}pages/loyalty.html">Loyalty Rewards</a></li>
                <li><a href="${root}pages/account.html">My Account</a></li>
                <li><a href="${root}pages/cart.html">Your Cart</a></li>
              </ul>
            </nav>

            <nav aria-label="Our Menu">
              <h2 class="footer-heading">OUR MENU</h2>
              <ul class="footer-list">
                <li><a href="${root}pages/menu.html">All Coffee</a></li>
                <li><a href="${root}pages/cappuccino.html">Cappuccino</a></li>
                <li><a href="${root}pages/espresso.html">Espresso</a></li>
                <li><a href="${root}pages/latte.html">Latte</a></li>
                <li><a href="${root}pages/cold-coffee.html">Cold Coffee</a></li>
                <li><a href="${root}pages/signature.html">Signature Drinks</a></li>
              </ul>
            </nav>

            <div>
              <h2 class="footer-heading">CONTACT</h2>
              <ul class="footer-list">
                <li class="footer-contact-item">Demo Street, Blue Area, Islamabad, Pakistan</li>
                <li class="footer-contact-item"><a href="mailto:hello@coffeecircle.test">hello@coffeecircle.test</a></li>
                <li class="footer-contact-item">Open daily 8:00 am &ndash; 11:00 pm</li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom-legal">
            <p class="mb-0">&copy; 2026 The Coffee Circle. A university project for CL1000 (Fall 2026). Not a real business.</p>
            <p class="footer-disclosure">
              Note: Drink illustrations shown on cards are custom SVG placeholders displayed when product photography is unavailable.
            </p>
          </div>
        </div>
      </footer>
    `;
  }

  function initEspressoFooter(root) {
    const footerHost = document.getElementById("site-footer");
    if (!footerHost) {
      return;
    }

    let isUpdating = false;
    const applyFooter = () => {
      if (isUpdating || footerHost.querySelector(".footer-grid")) {
        return;
      }
      isUpdating = true;
      renderEspressoFooter(footerHost, root);
      isUpdating = false;
    };

    const observer = new MutationObserver(() => {
      if (!footerHost.querySelector(".footer-grid")) {
        applyFooter();
        observer.disconnect();
      }
    });

    observer.observe(footerHost, { childList: true });
    applyFooter();

    window.addEventListener("load", () => {
      applyFooter();
      observer.disconnect();
    }, { once: true });
  }

  function initEspressoProducts() {
    const category = document.body?.dataset?.category;
    const grid = document.getElementById("product-grid");
    if (category !== "espresso" || !grid) {
      return;
    }

    const root = getRootPath();
    initEspressoFooter(root);
    const liveRegion = document.createElement("p");
    liveRegion.className = "visually-hidden";
    liveRegion.setAttribute("aria-live", "polite");
    grid.insertAdjacentElement("beforebegin", liveRegion);

    grid.innerHTML = "";
    ESPRESSO_PRODUCTS.forEach((product, index) => {
      grid.appendChild(createProductCard(product, index, root, liveRegion));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEspressoProducts);
  } else {
    initEspressoProducts();
  }
})();
