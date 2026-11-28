/**
 * menu_i263068.js
 * Menu page controller: search, category-chip filter, price sort,
 * live result count, empty state, and product card rendering.
 *
 * Relies on:
 *   - products_i263068.js  (loaded first on the page)
 *       └─ window.EspressoMenu.products  – the product catalogue array
 *       └─ window.EspressoMenu.createCard(product, index, root, liveRegion)
 *       └─ window.EspressoMenu.initHeader(root)
 *       └─ window.EspressoMenu.initFooter(root)
 *
 * Author scope: i263068  |  Branch: i263068
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────────────────────────────────
     MENU CATALOGUE
     All drinks rendered on pages/menu.html live here.
     The espresso items are re-exported from products_i263068.js via
     window.EspressoMenu; the other categories are defined inline.
  ──────────────────────────────────────────────────────────────────────── */

  const MENU_PRODUCTS = [
    // ── Espresso ──────────────────────────────────────────────────────
    {
      id: "classic-espresso",
      name: "Classic Espresso",
      category: "espresso",
      roast: "Medium-Dark",
      description: "A concentrated single shot with dense golden crema and balanced bittersweet depth.",
      basePrice: 250,
      sizes: [
        { label: "Single (30 ml)", priceDelta: 0 },
        { label: "Long Pull (45 ml)", priceDelta: 50 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Raw Brown Sugar", price: 30 },
        { label: "Steamed Oat Milk Splash", price: 80 }
      ],
      ingredients: ["Double-filtered brewing water (93°C)", "18g House Espresso Blend", "Natural roasted coffee crema"]
    },
    {
      id: "double-espresso",
      name: "Double Espresso",
      category: "espresso",
      roast: "Medium-Dark",
      description: "Two rich shots pulled together for fuller body, cocoa aroma, and lingering sweetness.",
      basePrice: 350,
      sizes: [
        { label: "Doppio (60 ml)", priceDelta: 0 },
        { label: "Triple (90 ml)", priceDelta: 120 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Caramel Drizzle", price: 70 },
        { label: "Sparkling Side Water", price: 0 }
      ],
      ingredients: ["Double-filtered brewing water", "20g House Espresso Blend", "Thick velvety crema"]
    },
    {
      id: "americano",
      name: "Americano",
      category: "espresso",
      roast: "Medium",
      description: "Double espresso lengthened with hot water for a clean, aromatic black coffee.",
      basePrice: 320,
      sizes: [
        { label: "Regular (8 oz)", priceDelta: 0 },
        { label: "Large (12 oz)", priceDelta: 80 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Honey Drizzle", price: 60 },
        { label: "Splash of Whole Milk", price: 50 }
      ],
      ingredients: ["Double shot house espresso (60 ml)", "Filtered hot water (180 ml)"]
    },
    {
      id: "flat-white",
      name: "Flat White",
      artVariant: "latte-heart",
      category: "espresso",
      roast: "Medium",
      description: "Twin ristretto shots folded into glossy, fine-textured steamed milk.",
      basePrice: 420,
      sizes: [
        { label: "Regular (6 oz)", priceDelta: 0 },
        { label: "Tall (8 oz)", priceDelta: 90 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Salted Caramel Syrup", price: 70 }
      ],
      ingredients: ["Double ristretto espresso (45 ml)", "Steamed whole milk (135 ml)", "Silky glossy micro-foam"]
    },

    // ── Cappuccino ────────────────────────────────────────────────────
    {
      id: "classic-cappuccino",
      name: "Classic Cappuccino",
      artVariant: "latte-heart",
      category: "cappuccino",
      roast: "Medium",
      description: "Equal thirds espresso, steamed milk, and thick velvety microfoam — the timeless Italian classic.",
      basePrice: 380,
      sizes: [
        { label: "Regular (6 oz)", priceDelta: 0 },
        { label: "Large (8 oz)", priceDelta: 80 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Cinnamon Dusting", price: 30 },
        { label: "Oat Milk Swap", price: 90 }
      ],
      ingredients: ["Double espresso (60 ml)", "Steamed whole milk (60 ml)", "Dense microfoam (60 ml)"]
    },
    {
      id: "caramel-cappuccino",
      name: "Caramel Cappuccino",
      category: "cappuccino",
      roast: "Medium-Dark",
      description: "Silky cappuccino elevated with golden caramel drizzle and a hint of butterscotch warmth.",
      basePrice: 450,
      sizes: [
        { label: "Regular (6 oz)", priceDelta: 0 },
        { label: "Large (8 oz)", priceDelta: 80 }
      ],
      extras: [
        { label: "Extra Caramel Drizzle", price: 50 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Vanilla Bean Syrup", price: 70 }
      ],
      ingredients: ["Double espresso", "Steamed milk", "Microfoam", "House caramel sauce"]
    },
    {
      id: "hazelnut-cappuccino",
      name: "Hazelnut Cappuccino",
      category: "cappuccino",
      roast: "Medium",
      description: "Creamy cappuccino with rich hazelnut syrup for a toasty nutty sweetness in every sip.",
      basePrice: 440,
      sizes: [
        { label: "Regular (6 oz)", priceDelta: 0 },
        { label: "Large (8 oz)", priceDelta: 80 }
      ],
      extras: [
        { label: "Extra Hazelnut Pump", price: 50 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Dark Cocoa Dusting", price: 40 }
      ],
      ingredients: ["Double espresso", "Steamed milk", "Microfoam", "Hazelnut syrup"]
    },

    // ── Latte ─────────────────────────────────────────────────────────
    {
      id: "classic-latte",
      name: "Classic Latte",
      artVariant: "latte-heart",
      category: "latte",
      roast: "Medium",
      description: "Smooth double espresso blanketed in gently steamed whole milk and a whisper of silky foam.",
      basePrice: 400,
      sizes: [
        { label: "Regular (8 oz)", priceDelta: 0 },
        { label: "Large (12 oz)", priceDelta: 100 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Vanilla Syrup", price: 70 }
      ],
      ingredients: ["Double espresso (60 ml)", "Steamed whole milk (230 ml)", "Light foam layer"]
    },
    {
      id: "vanilla-latte",
      name: "Vanilla Latte",
      artVariant: "latte-heart",
      category: "latte",
      roast: "Medium",
      description: "Classic latte kissed with Madagascar vanilla bean syrup for a naturally sweet, creamy finish.",
      basePrice: 460,
      sizes: [
        { label: "Regular (8 oz)", priceDelta: 0 },
        { label: "Large (12 oz)", priceDelta: 100 }
      ],
      extras: [
        { label: "Extra Vanilla Pump", price: 50 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Cinnamon Dusting", price: 30 }
      ],
      ingredients: ["Double espresso", "Steamed milk", "Madagascar vanilla bean syrup", "Light foam"]
    },
    {
      id: "mocha-latte",
      name: "Mocha Latte",
      category: "latte",
      roast: "Dark",
      description: "Rich espresso meets velvety steamed milk and house chocolate sauce for the ultimate comfort cup.",
      basePrice: 490,
      sizes: [
        { label: "Regular (8 oz)", priceDelta: 0 },
        { label: "Large (12 oz)", priceDelta: 100 }
      ],
      extras: [
        { label: "Extra Chocolate Drizzle", price: 50 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Whipped Cream", price: 60 }
      ],
      ingredients: ["Double espresso", "Steamed milk", "House chocolate sauce", "Light foam"]
    },

    // ── Cold Coffee ───────────────────────────────────────────────────
    {
      id: "cold-brew",
      name: "Cold Brew",
      category: "cold",
      roast: "Medium-Dark",
      description: "24-hour slow-steeped Arabica, poured over clear ice for a smooth, never-bitter cold coffee.",
      basePrice: 490,
      sizes: [
        { label: "Regular (12 oz)", priceDelta: 0 },
        { label: "Large (16 oz)", priceDelta: 100 }
      ],
      extras: [
        { label: "Sweet Cream Float", price: 90 },
        { label: "Vanilla Syrup", price: 70 },
        { label: "Extra Ice", price: 0 }
      ],
      ingredients: ["Coarse-ground Arabica", "Cold filtered water", "24-hour cold steep", "Clear ice cubes"]
    },
    {
      id: "iced-caramel-macchiato",
      name: "Iced Caramel Macchiato",
      category: "cold",
      roast: "Medium",
      description: "Layers of vanilla milk, bold espresso, and golden caramel — poured over ice for a stunning swirl.",
      basePrice: 530,
      sizes: [
        { label: "Regular (12 oz)", priceDelta: 0 },
        { label: "Large (16 oz)", priceDelta: 100 }
      ],
      extras: [
        { label: "Extra Caramel Drizzle", price: 50 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Extra Espresso Shot", price: 100 }
      ],
      ingredients: ["Double espresso", "Vanilla syrup", "Cold milk", "Caramel drizzle", "Ice"]
    },
    {
      id: "iced-matcha-latte",
      name: "Iced Matcha Latte",
      artVariant: "latte-heart",
      category: "cold",
      roast: "N/A",
      description: "Ceremonial-grade Japanese matcha whisked smooth, poured over ice with creamy oat milk.",
      basePrice: 520,
      sizes: [
        { label: "Regular (12 oz)", priceDelta: 0 },
        { label: "Large (16 oz)", priceDelta: 100 }
      ],
      extras: [
        { label: "Vanilla Syrup", price: 70 },
        { label: "Honey Drizzle", price: 60 },
        { label: "Oat Milk Swap", price: 90 }
      ],
      ingredients: ["Ceremonial-grade matcha powder", "Oat milk", "Filtered water", "Ice"]
    },

    // ── Signature ─────────────────────────────────────────────────────
    {
      id: "honey-cinnamon-espresso",
      name: "Honey Cinnamon Espresso",
      artVariant: "latte-heart",
      category: "signature",
      roast: "Light-Medium",
      description: "Bright double espresso infused with wildflower honey, Ceylon cinnamon, and warm milk.",
      basePrice: 440,
      sizes: [
        { label: "Regular (6 oz)", priceDelta: 0 },
        { label: "Large (10 oz)", priceDelta: 100 }
      ],
      extras: [
        { label: "Extra Espresso Shot", price: 100 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Iced Version", price: 50 }
      ],
      ingredients: ["Double shot light-medium espresso", "Raw wildflower honey", "Ground Ceylon cinnamon", "Steamed milk"]
    },
    {
      id: "rose-cardamom-latte",
      name: "Rose Cardamom Latte",
      artVariant: "latte-heart",
      category: "signature",
      roast: "Medium",
      description: "Floral rose water and aromatic cardamom elevate a velvety espresso latte to something truly special.",
      basePrice: 520,
      sizes: [
        { label: "Regular (8 oz)", priceDelta: 0 },
        { label: "Large (12 oz)", priceDelta: 100 }
      ],
      extras: [
        { label: "Extra Rose Syrup Pump", price: 50 },
        { label: "Oat Milk Swap", price: 90 },
        { label: "Dried Rose Petal Topping", price: 60 }
      ],
      ingredients: ["Double espresso", "Steamed milk", "Rose water syrup", "Ground cardamom", "Foam"]
    },
    {
      id: "dalgona-cloud-coffee",
      name: "Dalgona Cloud Coffee",
      category: "signature",
      roast: "Medium-Dark",
      description: "Whipped instant coffee cloud floated atop cold oat milk — the viral sensation, done our way.",
      basePrice: 490,
      sizes: [
        { label: "Regular (12 oz)", priceDelta: 0 },
        { label: "Large (16 oz)", priceDelta: 80 }
      ],
      extras: [
        { label: "Extra Whipped Coffee Layer", price: 70 },
        { label: "Vanilla Oat Milk", price: 90 },
        { label: "Dark Cocoa Dusting", price: 40 }
      ],
      ingredients: ["Whipped instant coffee", "Sugar", "Hot water", "Cold oat milk", "Ice"]
    }
  ];

  /* ─────────────────────────────────────────────────────────────────────
     CATEGORY CONFIGURATION
  ──────────────────────────────────────────────────────────────────────── */

  const CATEGORIES = [
    { value: "all",       label: "All Drinks" },
    { value: "espresso",  label: "Espresso" },
    { value: "cappuccino",label: "Cappuccino" },
    { value: "latte",     label: "Latte" },
    { value: "cold",      label: "Cold Coffee" },
    { value: "signature", label: "Signature" }
  ];

  /* ─────────────────────────────────────────────────────────────────────
     UTILITY HELPERS
  ──────────────────────────────────────────────────────────────────────── */

  function getRootPath() {
    const raw = document.body?.dataset?.root || "";
    return raw.endsWith("/") ? raw : (raw ? raw + "/" : "");
  }

  function formatPrice(amount) {
    return "PKR " + Math.round(Number(amount || 0)).toLocaleString("en-US");
  }

  function esc(text) {
    const d = document.createElement("div");
    d.textContent = String(text);
    return d.innerHTML;
  }

  /* ─────────────────────────────────────────────────────────────────────
     SVG COFFEE EMBLEM  (re-implemented locally so no dependency on the
     espresso module's internal buildCoffeeEmblemSvg)
  ──────────────────────────────────────────────────────────────────────── */

  function coffeeEmblemSvg(variant) {
    if (variant === "latte-heart") {
      return `
        <svg viewBox="0 0 96 96" width="136" height="136" fill="none"
             xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <ellipse cx="47" cy="79" rx="37" ry="7" fill="#D5BC9E" fill-opacity="0.7"/>
          <ellipse cx="47" cy="76.5" rx="35" ry="6" fill="#FFFFFF"/>
          <ellipse cx="47" cy="75.5" rx="28" ry="3.5" fill="#F2E7D8"/>
          <path d="M16 32H74V51C74 66.464 61.464 76.5 45 76.5C28.536 76.5 16 66.464 16 51V32Z" fill="#FFFFFF"/>
          <path d="M19 56C22 67 32.5 74 45 74C57.5 74 68 67 71 56C66.5 64 56.5 69.5 45 69.5C33.5 69.5 23.5 64 19 56Z" fill="#F3E8D9"/>
          <path d="M73 37H79.5C84.747 37 89 41.253 89 46.5C89 51.747 84.747 56 79.5 56H72.5"
                stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
          <ellipse cx="45" cy="32" rx="29" ry="9" fill="#B87A48"/>
          <ellipse cx="45" cy="32" rx="24.5" ry="6.8" fill="#F7EDE0"/>
          <path d="M45 37.2C45 37.2 35.5 32.8 35.5 28.4C35.5 26.2 37.3 24.7 39.5 24.7C41.6 24.7 43.5 25.9 45 27.6C46.5 25.9 48.4 24.7 50.5 24.7C52.7 24.7 54.5 26.2 54.5 28.4C54.5 32.8 45 37.2 45 37.2Z" fill="#7A421D"/>
          <path d="M35 19.5C33 16.5 33 13 35 10M45 18C43 15 43 11.5 45 8.5M55 19.5C53 16.5 53 13 55 10"
                stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-opacity="0.88"/>
        </svg>`;
    }
    return `
      <svg viewBox="0 0 96 96" width="136" height="136" fill="none"
           xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="47" cy="80" rx="35" ry="6.5" fill="#D5BC9E" fill-opacity="0.7"/>
        <ellipse cx="47" cy="77.5" rx="33" ry="5.5" fill="#FFFFFF"/>
        <ellipse cx="47" cy="76.5" rx="26" ry="3.2" fill="#F2E7D8"/>
        <path d="M18 35H72V53C72 67.359 60.359 77 45 77C29.641 77 18 67.359 18 53V35Z" fill="#FFFFFF"/>
        <path d="M21 57C24 67.5 33.5 74.5 45 74.5C56.5 74.5 66 67.5 69 57C64.5 64.5 55.5 70 45 70C34.5 70 25.5 64.5 21 57Z" fill="#F3E8D9"/>
        <path d="M71 40H77.5C82.47 40 86.5 44.03 86.5 49C86.5 53.97 82.47 58 77.5 58H70.5"
              stroke="#FFFFFF" stroke-width="5.8" stroke-linecap="round"/>
        <ellipse cx="45" cy="35" rx="27" ry="8" fill="#5D3219"/>
        <ellipse cx="45" cy="34.5" rx="22" ry="5.6" fill="#C68B59"/>
        <path d="M34 22C31.5 18 31.5 13.5 34 9.5M45 20.5C42.5 16.5 42.5 12 45 8M56 22C53.5 18 53.5 13.5 56 9.5"
              stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-opacity="0.95"/>
      </svg>`;
  }

  /* ─────────────────────────────────────────────────────────────────────
     PRODUCT CARD BUILDER
     Creates a full interactive product card identical to the espresso
     page style but with dynamic category label and re-using
     components_i263068.css class names.
  ──────────────────────────────────────────────────────────────────────── */

  function getCardSelection(cardEl, product) {
    const sizeSelect  = cardEl.querySelector("[data-size-select]");
    const sizeIndex   = Number(sizeSelect ? sizeSelect.value : 0);
    const chosenSize  = product.sizes[sizeIndex] || product.sizes[0];
    const qtyEl       = cardEl.querySelector("[data-qty-value]");
    const quantity    = Math.max(1, Number(qtyEl ? qtyEl.textContent : 1) || 1);
    const extraInputs = Array.from(cardEl.querySelectorAll("[data-extra-checkbox]:checked"));
    const chosenExtras = extraInputs.map(inp => product.extras[Number(inp.value)]).filter(Boolean);
    const extrasTotal  = chosenExtras.reduce((s, e) => s + e.price, 0);
    const unitPrice    = product.basePrice + chosenSize.priceDelta + extrasTotal;
    return { size: chosenSize, quantity, extras: chosenExtras, unitPrice, totalPrice: unitPrice * quantity };
  }

  function updateCardPrice(cardEl, product) {
    const priceEl = cardEl.querySelector("[data-card-price]");
    if (!priceEl) return;
    priceEl.textContent = formatPrice(getCardSelection(cardEl, product).totalPrice);
  }

  function addToCart(product, cardEl, btn, liveRegion) {
    const { size, quantity, extras, unitPrice, totalPrice } = getCardSelection(cardEl, product);
    if (window.CoffeeCart && typeof window.CoffeeCart.addItem === "function") {
      window.CoffeeCart.addItem({
        id: product.id,
        name: product.name,
        category: product.category,
        size: size.label,
        extras: extras.map(e => e.label),
        price: Math.round(unitPrice),
        totalPrice: Math.round(totalPrice),
        quantity
      });
    }
    if (window.CoffeeCart && typeof window.CoffeeCart.updateBadge === "function") {
      window.CoffeeCart.updateBadge();
    }
    if (liveRegion) {
      liveRegion.textContent = `Added ${quantity}\u00d7 ${product.name} (${size.label}) to cart.`;
    }
    if (btn) {
      const orig = btn.dataset.originalLabel || btn.textContent;
      btn.dataset.originalLabel = orig;
      btn.textContent = "Added to Cart";
      btn.classList.add("btn-added");
      clearTimeout(Number(btn.dataset.resetTimerId));
      btn.dataset.resetTimerId = String(setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove("btn-added");
      }, 1400));
    }
  }

  function openQuickViewModal(product, cardEl, onAdd) {
    // Reuse existing quickViewModal injected by products_i263068.js if present,
    // otherwise build a lightweight self-contained one.
    let modalEl = document.getElementById("quickViewModal");
    if (!modalEl) {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <div class="modal fade coffee-modal" id="quickViewModal" tabindex="-1"
             aria-labelledby="quickViewTitle" aria-hidden="true">
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
        </div>`;
      modalEl = wrap.firstElementChild;
      document.body.appendChild(modalEl);
      modalEl.addEventListener("click", ev => {
        if (window.bootstrap && window.bootstrap.Modal) return;
        if (ev.target === modalEl || ev.target.closest("[data-bs-dismiss='modal']")) {
          modalEl.classList.remove("show");
          modalEl.style.display = "none";
          modalEl.setAttribute("aria-hidden", "true");
        }
      });
    }

    const sel = getCardSelection(cardEl, product);
    const catLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    modalEl.querySelector("#quickViewCategory").textContent =
      `${catLabel}${product.roast && product.roast !== "N/A" ? " \u2022 " + product.roast + " Roast" : ""}`;
    modalEl.querySelector("#quickViewTitle").textContent = product.name;
    modalEl.querySelector("#quickViewDescription").textContent = product.description;
    modalEl.querySelector("#quickViewIngredients").innerHTML =
      product.ingredients.map(i => `<li>${esc(i)}</li>`).join("");
    const extrasLabel = sel.extras.length ? sel.extras.map(e => e.label).join(", ") : "None";
    modalEl.querySelector("#quickViewSelection").textContent =
      `${sel.size.label} \u00d7 ${sel.quantity} | Extras: ${extrasLabel} \u2014 ${formatPrice(sel.totalPrice)}`;

    const addBtn = modalEl.querySelector("#quickViewAddBtn");
    addBtn.onclick = () => onAdd(product, cardEl, addBtn);

    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    } else {
      modalEl.style.display = "block";
      modalEl.classList.add("show");
      modalEl.removeAttribute("aria-hidden");
    }
  }

  function buildProductCard(product, index, root, liveRegion) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productId = product.id;

    const artVariant = product.artVariant || ((index + 1) % 4 === 0 ? "latte-heart" : "classic");
    const extrasPanelId = `${product.id}-extras-panel`;
    const categoryLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);

    const sizeOptionsHtml = product.sizes.map((s, si) => {
      const delta = s.priceDelta > 0 ? ` (+${formatPrice(s.priceDelta)})` : "";
      return `<option value="${si}">${esc(s.label + delta)}</option>`;
    }).join("");

    const extrasHtml = product.extras.map((e, ei) => {
      const inputId = `${product.id}-extra-${ei}`;
      const priceLabel = e.price > 0 ? `+${formatPrice(e.price)}` : "Free";
      return `
        <label class="extra-option" for="${inputId}">
          <input type="checkbox" id="${inputId}" value="${ei}" data-extra-checkbox>
          <span>${esc(e.label)}</span>
          <span class="extra-price">${esc(priceLabel)}</span>
        </label>`;
    }).join("");

    card.innerHTML = `
      <div class="product-card-media is-fallback">
        <div class="product-card-fallback" aria-hidden="true">
          <div class="product-card-fallback-circle">
            ${coffeeEmblemSvg(artVariant)}
          </div>
        </div>
      </div>
      <div class="product-card-body">
        <p class="product-category-label">${esc(categoryLabel.toUpperCase())}</p>
        <h2 class="product-card-title">${esc(product.name)}</h2>
        <p class="product-card-desc">${esc(product.description)}</p>
        <p class="product-ingredients-line">
          <strong>Ingredients:</strong> ${esc(product.ingredients.join(", "))}
        </p>

        <div class="product-options">
          <div class="product-controls-row">
            <div class="control-group">
              <label class="option-label" for="${product.id}-size">Size</label>
              <select class="form-select form-select-sm coffee-select"
                      id="${product.id}-size" data-size-select>
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

          <button type="button" class="customise-toggle"
                  aria-expanded="false" aria-controls="${extrasPanelId}" data-customise-toggle>
            <span class="customise-arrow" aria-hidden="true">&#9656;</span>
            Customise your drink
          </button>

          <div class="customise-panel" id="${extrasPanelId}" hidden data-customise-panel>
            <fieldset class="product-extras">
              <legend class="visually-hidden">Drink extras for ${esc(product.name)}</legend>
              ${extrasHtml}
            </fieldset>
          </div>
        </div>

        <p class="product-price" data-card-price>${formatPrice(product.basePrice)}</p>

        <div class="product-card-actions">
          <button type="button" class="btn btn-primary btn-sm" data-add-to-cart>Add to Cart</button>
          <button type="button" class="btn btn-outline btn-sm" data-quick-view>Quick View</button>
        </div>
      </div>`;

    // ── Wire up interactions ──────────────────────────────────────────
    card.querySelector("[data-size-select]")
        .addEventListener("change", () => updateCardPrice(card, product));

    const qtyEl = card.querySelector("[data-qty-value]");
    card.querySelector("[data-qty-dec]").addEventListener("click", () => {
      const v = Number(qtyEl.textContent) || 1;
      if (v > 1) { qtyEl.textContent = String(v - 1); updateCardPrice(card, product); }
    });
    card.querySelector("[data-qty-inc]").addEventListener("click", () => {
      qtyEl.textContent = String((Number(qtyEl.textContent) || 1) + 1);
      updateCardPrice(card, product);
    });

    const customiseBtn   = card.querySelector("[data-customise-toggle]");
    const customisePanel = card.querySelector("[data-customise-panel]");
    customiseBtn.addEventListener("click", () => {
      const expanded = customiseBtn.getAttribute("aria-expanded") === "true";
      customiseBtn.setAttribute("aria-expanded", String(!expanded));
      customisePanel.hidden = expanded;
    });

    card.querySelectorAll("[data-extra-checkbox]").forEach(cb => {
      cb.addEventListener("change", () => updateCardPrice(card, product));
    });

    card.querySelector("[data-quick-view]").addEventListener("click", () => {
      openQuickViewModal(product, card, (p, el, btn) => addToCart(p, el, btn, liveRegion));
    });

    card.querySelector("[data-add-to-cart]").addEventListener("click", ev => {
      addToCart(product, card, ev.currentTarget, liveRegion);
    });

    return card;
  }

  /* ─────────────────────────────────────────────────────────────────────
     STATE
  ──────────────────────────────────────────────────────────────────────── */

  let state = {
    query:    "",     // current search term (lower-case)
    category: "all",  // active chip value
    sort:     "default"
  };

  /* ─────────────────────────────────────────────────────────────────────
     FILTER + SORT PIPELINE
     1. Category chip  → keep only products whose .category matches
     2. Search query   → further filter by name (case-insensitive includes)
     3. Sort order     → stable price sort, or original array order
  ──────────────────────────────────────────────────────────────────────── */

  function applyFilters() {
    let items = MENU_PRODUCTS.slice(); // shallow copy preserves original order

    // ① Category filter
    if (state.category !== "all") {
      items = items.filter(p => p.category === state.category);
    }

    // ② Search filter  –  match against name (trimmed, lower-case)
    const q = state.query.trim().toLowerCase();
    if (q) {
      items = items.filter(p => p.name.toLowerCase().includes(q));
    }

    // ③ Sort
    if (state.sort === "low") {
      items.sort((a, b) => a.basePrice - b.basePrice);
    } else if (state.sort === "high") {
      items.sort((a, b) => b.basePrice - a.basePrice);
    }
    // "default" keeps the original MENU_PRODUCTS insertion order

    return items;
  }

  /* ─────────────────────────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────────────────────────────── */

  function render() {
    const grid      = document.getElementById("menu-grid");
    const emptyEl   = document.getElementById("menu-empty");
    const countEl   = document.getElementById("menu-count");
    const liveRegion= document.getElementById("menu-live-region");
    if (!grid) return;

    const root   = getRootPath();
    const items  = applyFilters();
    const total  = MENU_PRODUCTS.length;

    // Clear previous cards
    grid.innerHTML = "";

    if (items.length === 0) {
      grid.setAttribute("hidden", "");
      if (emptyEl) emptyEl.removeAttribute("hidden");
    } else {
      grid.removeAttribute("hidden");
      if (emptyEl) emptyEl.setAttribute("hidden", "");
      items.forEach((product, idx) => {
        grid.appendChild(buildProductCard(product, idx, root, liveRegion));
      });
    }

    // Update count label
    if (countEl) {
      if (state.query || state.category !== "all") {
        countEl.textContent = `Showing ${items.length} of ${total} drinks`;
      } else {
        countEl.textContent = `${total} drinks`;
      }
    }
  }

  /* ─────────────────────────────────────────────────────────────────────
     CHIPS — build once, toggle active class on click
  ──────────────────────────────────────────────────────────────────────── */

  function buildChips() {
    const container = document.getElementById("menu-filters");
    if (!container) return;

    CATEGORIES.forEach(cat => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (cat.value === "all" ? " chip-active" : "");
      btn.dataset.category = cat.value;
      btn.textContent = cat.label;
      btn.addEventListener("click", () => {
        // Deactivate all, activate clicked
        container.querySelectorAll(".chip").forEach(c => c.classList.remove("chip-active"));
        btn.classList.add("chip-active");
        state.category = cat.value;
        render();
      });
      container.appendChild(btn);
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     RESET — clears search, sort, and category, re-renders
  ──────────────────────────────────────────────────────────────────────── */

  function resetFilters() {
    state.query    = "";
    state.category = "all";
    state.sort     = "default";

    const searchInput = document.getElementById("menu-search");
    const sortSelect  = document.getElementById("menu-sort");
    const chips       = document.getElementById("menu-filters");
    if (searchInput) searchInput.value = "";
    if (sortSelect)  sortSelect.value  = "default";
    if (chips) {
      chips.querySelectorAll(".chip").forEach(c => c.classList.remove("chip-active"));
      const allChip = chips.querySelector('[data-category="all"]');
      if (allChip) allChip.classList.add("chip-active");
    }
    render();
  }

  /* ─────────────────────────────────────────────────────────────────────
     BOOT
  ──────────────────────────────────────────────────────────────────────── */

  function init() {
    // Only activate on pages/menu.html — guard by presence of #menu-grid
    if (!document.getElementById("menu-grid")) return;

    const root = getRootPath();

    // Header + Footer – reuse products_i263068.js infrastructure
    // The IIFE in products_i263068.js only renders when data-category="espresso"
    // so we call the header/footer injectors directly via keepEspressoSectionRendered
    // which is also exposed via products_i263068.js → window.EspressoMenu (if exported).
    // As a robust fallback we call the internal init functions if available:
    if (window.EspressoMenu) {
      if (typeof window.EspressoMenu.initHeader === "function") window.EspressoMenu.initHeader(root);
      if (typeof window.EspressoMenu.initFooter === "function") window.EspressoMenu.initFooter(root);
    } else {
      // Fallback: inject header/footer inline (compact version)
      injectHeaderFallback(root);
      injectFooterFallback(root);
    }

    // Build filter chips
    buildChips();

    // Wire search input (debounced for performance)
    const searchInput = document.getElementById("menu-search");
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.query = searchInput.value;
          render();
        }, 220);
      });
    }

    // Wire sort select
    const sortSelect = document.getElementById("menu-sort");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        state.sort = sortSelect.value;
        render();
      });
    }

    // Wire reset button
    const resetBtn = document.getElementById("menu-reset");
    if (resetBtn) resetBtn.addEventListener("click", resetFilters);

    // Handle URL query parameter ?category=xxx  (from other pages' nav links)
    const urlCat = new URLSearchParams(window.location.search).get("category");
    if (urlCat) {
      const matched = CATEGORIES.find(c => c.value === urlCat);
      if (matched) {
        state.category = matched.value;
        // Activate the matching chip once chips are in the DOM
        const chip = document.querySelector(`.chip[data-category="${matched.value}"]`);
        if (chip) {
          document.querySelectorAll(".chip").forEach(c => c.classList.remove("chip-active"));
          chip.classList.add("chip-active");
        }
      }
    }

    // Initial render
    render();
  }

  /* ─────────────────────────────────────────────────────────────────────
     FALLBACK HEADER / FOOTER  (used when EspressoMenu is not exported)
     Mirrors the HTML from products_i263068.js renderEspressoHeader/Footer.
  ──────────────────────────────────────────────────────────────────────── */

  function injectHeaderFallback(root) {
    const host = document.getElementById("site-header");
    if (!host || host.querySelector("[data-espresso-header='true']")) return;

    host.innerHTML = `
      <header class="site-header sticky-top" data-espresso-header="true">
        <nav class="navbar navbar-expand-lg navbar-dark coffee-navbar" aria-label="Primary navigation">
          <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2" href="${root}index.html">
              <img src="${root}images/logo.svg" alt="The Coffee Circle logo"
                   width="38" height="38" class="brand-logo"
                   onerror="this.style.display='none'">
              <span class="brand-text">The Coffee Circle</span>
            </a>
            <button class="navbar-toggler" type="button"
                    aria-controls="primaryNavbar" aria-expanded="false"
                    aria-label="Toggle navigation" id="menu-nav-toggler">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="primaryNavbar">
              <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
                <li class="nav-item"><a class="nav-link" href="${root}index.html">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="${root}pages/about.html">About</a></li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle nav-menu-pill active"
                     href="${root}pages/menu.html" id="navbarMenuDropdown"
                     role="button" aria-expanded="false" aria-current="page">Menu</a>
                  <ul class="dropdown-menu dropdown-menu-end coffee-dropdown-menu"
                      aria-labelledby="navbarMenuDropdown">
                    <li><a class="dropdown-item active" href="${root}pages/menu.html">All Coffee</a></li>
                    <li><a class="dropdown-item" href="${root}pages/cappuccino.html">Cappuccino</a></li>
                    <li><a class="dropdown-item" href="${root}pages/espresso.html">Espresso</a></li>
                    <li><a class="dropdown-item" href="${root}pages/latte.html">Latte</a></li>
                    <li><a class="dropdown-item" href="${root}pages/cold-coffee.html">Cold Coffee</a></li>
                  </ul>
                </li>
                <li class="nav-item"><a class="nav-link" href="${root}pages/loyalty.html">Loyalty Rewards</a></li>
                <li class="nav-item"><a class="nav-link" href="${root}pages/account.html">My Account</a></li>
                <li class="nav-item">
                  <a class="nav-link nav-cart-link" href="${root}pages/cart.html"
                     aria-label="Shopping bag" title="View cart">
                    <svg class="nav-bag-icon" viewBox="0 0 24 24" width="20" height="20"
                         fill="none" stroke="currentColor" stroke-width="1.9"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
      </header>`;

    // Mobile toggler fallback (no Bootstrap JS)
    const toggler = host.querySelector("#menu-nav-toggler");
    const collapse = host.querySelector("#primaryNavbar");
    const ddToggle = host.querySelector("#navbarMenuDropdown");
    const ddMenu   = host.querySelector(".coffee-dropdown-menu");

    if (toggler && collapse && !(window.bootstrap && window.bootstrap.Collapse)) {
      toggler.addEventListener("click", () => {
        const open = collapse.classList.toggle("show");
        toggler.setAttribute("aria-expanded", String(open));
      });
    }
    if (ddToggle && ddMenu && !(window.bootstrap && window.bootstrap.Dropdown)) {
      ddToggle.addEventListener("click", ev => {
        ev.preventDefault();
        const open = ddMenu.classList.toggle("show");
        ddToggle.classList.toggle("show", open);
        ddToggle.setAttribute("aria-expanded", String(open));
      });
    }
    document.addEventListener("click", ev => {
      if (ddMenu && !ev.target.closest(".dropdown")) {
        ddMenu.classList.remove("show");
        if (ddToggle) { ddToggle.classList.remove("show"); ddToggle.setAttribute("aria-expanded","false"); }
      }
    });
    window.addEventListener("scroll", () => {
      const nb = host.querySelector(".coffee-navbar");
      if (nb) nb.classList.toggle("is-scrolled", window.scrollY > 16);
    }, { passive: true });

    if (window.CoffeeCart && typeof window.CoffeeCart.updateBadge === "function") {
      window.CoffeeCart.updateBadge();
    }
  }

  function injectFooterFallback(root) {
    const host = document.getElementById("site-footer");
    if (!host || host.querySelector(".footer-grid")) return;
    host.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <p class="footer-title">The Coffee Circle</p>
              <p class="footer-copy">Your Daily Dose of Comfort. Specialty coffee, made your way.</p>
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
            <p class="mb-0">&copy; 2026 The Coffee Circle. A university project. Not a real business.</p>
          </div>
        </div>
      </footer>`;
  }

  /* ─────────────────────────────────────────────────────────────────────
     ENTRY POINT
  ──────────────────────────────────────────────────────────────────────── */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
