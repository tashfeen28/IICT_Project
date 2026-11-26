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
        <svg viewBox="0 0 96 96" width="136" height="136" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <ellipse cx="47" cy="79" rx="37" ry="7" fill="#D5BC9E" fill-opacity="0.7"/>
          <ellipse cx="47" cy="76.5" rx="35" ry="6" fill="#FFFFFF"/>
          <ellipse cx="47" cy="75.5" rx="28" ry="3.5" fill="#F2E7D8"/>
          <path d="M16 32H74V51C74 66.464 61.464 76.5 45 76.5C28.536 76.5 16 66.464 16 51V32Z" fill="#FFFFFF"/>
          <path d="M19 56C22 67 32.5 74 45 74C57.5 74 68 67 71 56C66.5 64 56.5 69.5 45 69.5C33.5 69.5 23.5 64 19 56Z" fill="#F3E8D9"/>
          <path d="M73 37H79.5C84.747 37 89 41.253 89 46.5C89 51.747 84.747 56 79.5 56H72.5" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
          <ellipse cx="45" cy="32" rx="29" ry="9" fill="#B87A48"/>
          <ellipse cx="45" cy="32" rx="24.5" ry="6.8" fill="#F7EDE0"/>
          <path d="M45 37.2C45 37.2 35.5 32.8 35.5 28.4C35.5 26.2 37.3 24.7 39.5 24.7C41.6 24.7 43.5 25.9 45 27.6C46.5 25.9 48.4 24.7 50.5 24.7C52.7 24.7 54.5 26.2 54.5 28.4C54.5 32.8 45 37.2 45 37.2Z" fill="#7A421D"/>
          <path d="M35 19.5C33 16.5 33 13 35 10M45 18C43 15 43 11.5 45 8.5M55 19.5C53 16.5 53 13 55 10" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-opacity="0.88"/>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 96 96" width="136" height="136" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="47" cy="80" rx="35" ry="6.5" fill="#D5BC9E" fill-opacity="0.7"/>
        <ellipse cx="47" cy="77.5" rx="33" ry="5.5" fill="#FFFFFF"/>
        <ellipse cx="47" cy="76.5" rx="26" ry="3.2" fill="#F2E7D8"/>
        <path d="M18 35H72V53C72 67.359 60.359 77 45 77C29.641 77 18 67.359 18 53V35Z" fill="#FFFFFF"/>
        <path d="M21 57C24 67.5 33.5 74.5 45 74.5C56.5 74.5 66 67.5 69 57C64.5 64.5 55.5 70 45 70C34.5 70 25.5 64.5 21 57Z" fill="#F3E8D9"/>
        <path d="M71 40H77.5C82.47 40 86.5 44.03 86.5 49C86.5 53.97 82.47 58 77.5 58H70.5" stroke="#FFFFFF" stroke-width="5.8" stroke-linecap="round"/>
        <ellipse cx="45" cy="35" rx="27" ry="8" fill="#5D3219"/>
        <ellipse cx="45" cy="34.5" rx="22" ry="5.6" fill="#C68B59"/>
        <path d="M34 22C31.5 18 31.5 13.5 34 9.5M45 20.5C42.5 16.5 42.5 12 45 8M56 22C53.5 18 53.5 13.5 56 9.5" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-opacity="0.95"/>
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
    const hasPhoto = Boolean(product.hasPhoto && product.image);
    const mediaClass = hasPhoto ? "product-card-media" : "product-card-media is-fallback";
    const imgHtml = hasPhoto
      ? `<img src="${root}${product.image}" alt="${escapeHtml(product.name)}" loading="lazy">`
      : "";

    card.innerHTML = `
      <div class="${mediaClass}">
        ${imgHtml}
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
    if (productImg) {
      productImg.addEventListener("error", () => {
        mediaBox.classList.add("is-fallback");
        productImg.hidden = true;
      });
    }

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

  function renderEspressoHeader(headerHost, root) {
    headerHost.innerHTML = `
      <header class="site-header sticky-top" data-espresso-header="true">
        <nav class="navbar navbar-expand-lg navbar-dark coffee-navbar" aria-label="Primary navigation">
          <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2" href="${root}index.html">
              <img
                src="${root}images/logo.svg"
                alt="The Coffee Circle logo"
                width="38"
                height="38"
                class="brand-logo"
              >
              <span class="brand-text">The Coffee Circle</span>
            </a>

            <button
              class="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#primaryNavbar"
              aria-controls="primaryNavbar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="primaryNavbar">
              <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
                <li class="nav-item">
                  <a class="nav-link" href="${root}index.html">Home</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="${root}pages/about.html">About</a>
                </li>
                <li class="nav-item dropdown">
                  <a
                    class="nav-link dropdown-toggle nav-menu-pill active"
                    href="${root}pages/menu.html"
                    id="navbarMenuDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Menu
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end coffee-dropdown-menu" aria-labelledby="navbarMenuDropdown">
                    <li><a class="dropdown-item" href="${root}pages/menu.html">All Coffee</a></li>
                    <li><a class="dropdown-item" href="${root}pages/cappuccino.html">Cappuccino</a></li>
                    <li><a class="dropdown-item active" href="${root}pages/espresso.html" aria-current="page">Espresso</a></li>
                    <li><a class="dropdown-item" href="${root}pages/latte.html">Latte</a></li>
                    <li><a class="dropdown-item" href="${root}pages/cold-coffee.html">Cold Coffee</a></li>
                    <li><a class="dropdown-item" href="${root}pages/signature.html">Signature Drinks</a></li>
                  </ul>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="${root}pages/loyalty.html">Loyalty Rewards</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="${root}pages/account.html">My Account</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="${root}pages/login.html">Login / Register</a>
                </li>
                <li class="nav-item">
                  <a
                    class="nav-link nav-cart-link"
                    href="${root}pages/cart.html"
                    aria-label="Shopping bag"
                    title="View cart"
                  >
                    <svg
                      class="nav-bag-icon"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.9"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 7h12l1 13H5L6 7z"/>
                      <path d="M9 7V5a3 3 0 0 1 6 0v2"/>
                    </svg>
                    <span class="cart-badge nav-cart-badge" id="nav-cart-count">0</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    `;
  }

  let hasBoundGlobalHeaderListeners = false;

  function bindEspressoHeaderEvents(headerHost) {
    const navbar = headerHost.querySelector(".coffee-navbar");
    const toggler = headerHost.querySelector(".navbar-toggler");
    const navCollapse = headerHost.querySelector("#primaryNavbar");
    const dropdownToggle = headerHost.querySelector("#navbarMenuDropdown");
    const dropdownMenu = headerHost.querySelector(".coffee-dropdown-menu");

    const updateNavbarScrollState = () => {
      const activeNavbar = document.querySelector("[data-espresso-header='true'] .coffee-navbar");
      if (activeNavbar) {
        activeNavbar.classList.toggle("is-scrolled", window.scrollY > 16);
      }
    };

    const closeDropdownFallback = () => {
      if (dropdownToggle && dropdownMenu) {
        dropdownMenu.classList.remove("show");
        dropdownToggle.classList.remove("show");
        dropdownToggle.setAttribute("aria-expanded", "false");
      }
    };

    const closeMobileMenu = () => {
      if (!navCollapse || !navCollapse.classList.contains("show")) {
        return;
      }
      if (window.bootstrap && window.bootstrap.Collapse) {
        window.bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
      } else {
        navCollapse.classList.remove("show");
        if (toggler) {
          toggler.setAttribute("aria-expanded", "false");
        }
      }
    };

    if (toggler && navCollapse && !(window.bootstrap && window.bootstrap.Collapse)) {
      toggler.addEventListener("click", () => {
        const isOpen = navCollapse.classList.toggle("show");
        toggler.setAttribute("aria-expanded", String(isOpen));
      });
    }

    if (dropdownToggle && dropdownMenu && !(window.bootstrap && window.bootstrap.Dropdown)) {
      dropdownToggle.addEventListener("click", (event) => {
        event.preventDefault();
        const isOpen = dropdownMenu.classList.toggle("show");
        dropdownToggle.classList.toggle("show", isOpen);
        dropdownToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    headerHost.querySelectorAll(".nav-link:not(.dropdown-toggle), .dropdown-item").forEach((link) => {
      link.addEventListener("click", () => {
        closeDropdownFallback();
        closeMobileMenu();
      });
    });

    if (!hasBoundGlobalHeaderListeners) {
      hasBoundGlobalHeaderListeners = true;
      window.addEventListener("scroll", updateNavbarScrollState, { passive: true });
      document.addEventListener("click", (event) => {
        const activeToggle = document.querySelector("[data-espresso-header='true'] #navbarMenuDropdown");
        const activeMenu = document.querySelector("[data-espresso-header='true'] .coffee-dropdown-menu");
        if (
          activeToggle &&
          activeMenu &&
          !(window.bootstrap && window.bootstrap.Dropdown) &&
          !event.target.closest("[data-espresso-header='true'] .dropdown")
        ) {
          activeMenu.classList.remove("show");
          activeToggle.classList.remove("show");
          activeToggle.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
          return;
        }
        const activeCollapse = document.querySelector("[data-espresso-header='true'] #primaryNavbar");
        const activeToggler = document.querySelector("[data-espresso-header='true'] .navbar-toggler");
        if (activeCollapse && activeCollapse.classList.contains("show")) {
          if (window.bootstrap && window.bootstrap.Collapse) {
            window.bootstrap.Collapse.getOrCreateInstance(activeCollapse).hide();
          } else {
            activeCollapse.classList.remove("show");
            if (activeToggler) {
              activeToggler.setAttribute("aria-expanded", "false");
            }
          }
        }
      });
    }

    if (navbar) {
      updateNavbarScrollState();
    }
    if (window.CoffeeCart && typeof window.CoffeeCart.updateBadge === "function") {
      window.CoffeeCart.updateBadge();
    }
  }

  function keepEspressoSectionRendered(hostId, markerSelector, renderFn) {
    const host = document.getElementById(hostId);
    if (!host) {
      return;
    }

    let isUpdating = false;
    const apply = () => {
      if (isUpdating || host.querySelector(markerSelector)) {
        return;
      }
      isUpdating = true;
      renderFn(host);
      isUpdating = false;
    };

    const observer = new MutationObserver(() => {
      if (!host.querySelector(markerSelector)) {
        apply();
        observer.disconnect();
      }
    });

    observer.observe(host, { childList: true });
    apply();

    window.addEventListener("load", () => {
      apply();
      observer.disconnect();
    }, { once: true });
  }

  function initEspressoHeader(root) {
    keepEspressoSectionRendered("site-header", "[data-espresso-header='true']", (headerHost) => {
      renderEspressoHeader(headerHost, root);
      bindEspressoHeaderEvents(headerHost);
    });
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
    keepEspressoSectionRendered("site-footer", ".footer-grid", (footerHost) => {
      renderEspressoFooter(footerHost, root);
    });
  }

  function initEspressoProducts() {
    const category = document.body?.dataset?.category;
    const grid = document.getElementById("product-grid");
    if (category !== "espresso" || !grid) {
      return;
    }

    const root = getRootPath();
    initEspressoHeader(root);
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
