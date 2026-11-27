/* products.js - ALL product data lives here.
   Every page builds its product cards from the PRODUCTS array below,
   so a price or description only ever has to be changed in one place. */

const CATEGORIES = {
  cappuccino: { label: 'Cappuccino', file: 'cappuccino.html' },
  espresso: { label: 'Espresso', file: 'espresso.html' },
  latte: { label: 'Latte', file: 'latte.html' },
  'cold-coffee': { label: 'Cold Coffee', file: 'cold-coffee.html' },
  signature: { label: 'Signature Drinks', file: 'signature.html' }
};

/* Extra PKR added to the base price for each size.
   The first size in each list is the base (cheapest) size. */
const SIZE_TYPES = {
  standard: { Small: 0, Medium: 60, Large: 120 },
  shot: { Single: 0, Double: 100 },
  single: { Regular: 0 },
  premium: { Medium: 0, Large: 100 }
};

const ADDONS = [
  { id: 'extra-shot', label: 'Extra espresso shot', price: 80 },
  { id: 'oat-milk', label: 'Oat milk', price: 60 },
  { id: 'extra-syrup', label: 'Extra syrup', price: 40 },
  { id: 'whipped-cream', label: 'Whipped cream', price: 50 }
];

/* Colours used to draw each drink's illustration. */
const SHADES = {
  classic:   { liquid: '#5b3420', top: '#d9b48a', accent: '#8a5a3b', bg: '#efe2cf' },
  vanilla:   { liquid: '#6b4129', top: '#f3e3c3', accent: '#d9b86c', bg: '#f6ecd9' },
  caramel:   { liquid: '#5b3420', top: '#d49a5c', accent: '#b8732f', bg: '#f1dfc6' },
  hazelnut:  { liquid: '#53301d', top: '#c29a74', accent: '#7a4e2d', bg: '#ecdcc7' },
  chocolate: { liquid: '#3b2418', top: '#a1684a', accent: '#5a3322', bg: '#e8d5c0' },
  cinnamon:  { liquid: '#5b3420', top: '#cf9a6a', accent: '#a0522d', bg: '#f0dcc4' },
  almond:    { liquid: '#6a4a30', top: '#ecd9b8', accent: '#c9a974', bg: '#f5ead8' },
  dark:      { liquid: '#24120b', top: '#6b3d22', accent: '#c68b59', bg: '#e6d3bb' },
  gold:      { liquid: '#3b2418', top: '#e0b070', accent: '#c68b59', bg: '#f2e2c8' }
};

/* product(id, category, name, base price PKR, shade, sizeType, description, ingredients, flags) */
function product(id, category, name, price, shade, sizeType, description, ingredients, flags) {
  return Object.assign(
    { id, category, name, price, shade, sizeType, description, ingredients,
      featured: false, bestseller: false, image: '' },
    flags || {}
  );
}

const PRODUCTS = [
  /* ---------- Cappuccino ---------- */
  product('cap-classic', 'cappuccino', 'Classic Cappuccino', 350, 'classic', 'standard',
    'Equal parts espresso, steamed milk and velvety foam: the café original.',
    ['Espresso', 'Steamed milk', 'Milk foam'], { bestseller: true }),
  product('cap-vanilla', 'cappuccino', 'Vanilla Cappuccino', 390, 'vanilla', 'standard',
    'Smooth vanilla syrup folded into a silky cappuccino with a sweet, soft finish.',
    ['Espresso', 'Steamed milk', 'Vanilla syrup', 'Milk foam'], { featured: true }),
  product('cap-caramel', 'cappuccino', 'Caramel Cappuccino', 400, 'caramel', 'standard',
    'Buttery caramel swirled through rich espresso and a thick cloud of foam.',
    ['Espresso', 'Steamed milk', 'Caramel sauce', 'Milk foam'], { bestseller: true }),
  product('cap-hazelnut', 'cappuccino', 'Hazelnut Cappuccino', 410, 'hazelnut', 'standard',
    'Toasted hazelnut sweetness with a gentle nutty finish.',
    ['Espresso', 'Steamed milk', 'Hazelnut syrup', 'Milk foam'], { featured: true }),
  product('cap-chocolate', 'cappuccino', 'Chocolate Cappuccino', 420, 'chocolate', 'standard',
    'Dark chocolate melted into espresso for a dessert-like cup.',
    ['Espresso', 'Steamed milk', 'Dark chocolate sauce', 'Cocoa dusting']),
  product('cap-iced', 'cappuccino', 'Iced Cappuccino', 430, 'classic', 'standard',
    'Chilled espresso over ice, topped with cold, airy milk foam.',
    ['Espresso', 'Cold milk', 'Ice', 'Cold foam']),
  product('cap-cinnamon', 'cappuccino', 'Cinnamon Cappuccino', 390, 'cinnamon', 'standard',
    'Warm cinnamon spice dusted over a classic cappuccino.',
    ['Espresso', 'Steamed milk', 'Ground cinnamon', 'Milk foam']),
  product('cap-almond', 'cappuccino', 'Almond Cappuccino', 440, 'almond', 'standard',
    'Creamy almond milk and a hint of marzipan sweetness, lighter on the palate.',
    ['Espresso', 'Almond milk', 'Almond syrup', 'Foam']),

  /* ---------- Espresso ---------- */
  product('esp-classic', 'espresso', 'Classic Espresso', 250, 'dark', 'shot',
    'A concentrated single shot with a golden crema. Choose single or double.',
    ['Freshly ground espresso beans', 'Filtered water'], { bestseller: false }),
  product('esp-double', 'espresso', 'Double Espresso', 350, 'dark', 'single',
    'Two full shots of bold, full-bodied espresso for a serious kick.',
    ['Espresso (double shot)']),
  product('esp-ristretto', 'espresso', 'Ristretto', 300, 'dark', 'single',
    'A shorter, sweeter pull with less water and intense flavour.',
    ['Espresso (restricted pull)']),
  product('esp-americano', 'espresso', 'Americano', 320, 'classic', 'standard',
    'Espresso lengthened with hot water for a smooth, long cup.',
    ['Espresso', 'Hot water']),
  product('esp-macchiato', 'espresso', 'Macchiato', 340, 'caramel', 'single',
    'Espresso "marked" with a spoonful of silky milk foam.',
    ['Espresso', 'Milk foam'], { featured: true }),
  product('esp-panna', 'espresso', 'Espresso Con Panna', 400, 'vanilla', 'single',
    'Hot espresso crowned with a swirl of whipped cream.',
    ['Espresso', 'Whipped cream']),

  /* ---------- Latte ---------- */
  product('lat-classic', 'latte', 'Classic Latte', 380, 'classic', 'standard',
    'Smooth espresso with plenty of steamed milk and a thin layer of foam.',
    ['Espresso', 'Steamed milk']),
  product('lat-vanilla', 'latte', 'Vanilla Latte', 420, 'vanilla', 'standard',
    'A creamy latte sweetened with vanilla syrup.',
    ['Espresso', 'Steamed milk', 'Vanilla syrup']),
  product('lat-caramel', 'latte', 'Caramel Latte', 430, 'caramel', 'standard',
    'Silky latte with caramel sauce and a golden drizzle on top.',
    ['Espresso', 'Steamed milk', 'Caramel sauce'], { bestseller: true }),
  product('lat-hazelnut', 'latte', 'Hazelnut Latte', 440, 'hazelnut', 'standard',
    'Soft, nutty and comforting: hazelnut syrup in a velvety latte.',
    ['Espresso', 'Steamed milk', 'Hazelnut syrup']),
  product('lat-spanish', 'latte', 'Spanish Latte', 480, 'vanilla', 'standard',
    'Espresso and milk sweetened with condensed milk for a rich, creamy sip.',
    ['Espresso', 'Steamed milk', 'Sweetened condensed milk'], { bestseller: true }),
  product('lat-iced', 'latte', 'Iced Latte', 450, 'classic', 'standard',
    'Espresso poured over cold milk and ice, refreshing and smooth.',
    ['Espresso', 'Cold milk', 'Ice']),
  product('lat-mocha', 'latte', 'Mocha Latte', 500, 'chocolate', 'standard',
    'Espresso, steamed milk and dark chocolate with a light cocoa topping.',
    ['Espresso', 'Steamed milk', 'Dark chocolate sauce', 'Cocoa powder'], { featured: true }),
  product('lat-cinnamon', 'latte', 'Cinnamon Latte', 420, 'cinnamon', 'standard',
    'A cosy latte warmed with cinnamon syrup and a sprinkle of spice.',
    ['Espresso', 'Steamed milk', 'Cinnamon syrup']),

  /* ---------- Cold Coffee ---------- */
  product('cold-americano', 'cold-coffee', 'Iced Americano', 400, 'dark', 'standard',
    'Sharp, clean espresso over ice and cold water. Simple and refreshing.',
    ['Espresso', 'Cold water', 'Ice']),
  product('cold-latte', 'cold-coffee', 'Iced Latte', 450, 'classic', 'standard',
    'Our cold-bar version: double espresso, chilled milk and crushed ice.',
    ['Double espresso', 'Cold milk', 'Crushed ice']),
  product('cold-mocha', 'cold-coffee', 'Iced Mocha', 520, 'chocolate', 'standard',
    'Chocolate and espresso poured over ice with cold milk.',
    ['Espresso', 'Cold milk', 'Chocolate sauce', 'Ice']),
  product('cold-brew', 'cold-coffee', 'Cold Brew', 480, 'dark', 'standard',
    'Steeped for 18 hours for a naturally sweet, low-acidity coffee.',
    ['Cold-brewed coffee', 'Ice'], { bestseller: true }),
  product('frappe-caramel', 'cold-coffee', 'Caramel Frappe', 580, 'caramel', 'standard',
    'Blended coffee, ice and caramel topped with whipped cream.',
    ['Coffee', 'Milk', 'Ice', 'Caramel sauce', 'Whipped cream'], { featured: true }),
  product('frappe-chocolate', 'cold-coffee', 'Chocolate Frappe', 580, 'chocolate', 'standard',
    'Thick, icy chocolate coffee blended smooth and finished with cream.',
    ['Coffee', 'Milk', 'Ice', 'Chocolate sauce', 'Whipped cream']),
  product('frappe-vanilla', 'cold-coffee', 'Vanilla Frappe', 560, 'vanilla', 'standard',
    'A light, creamy blend of coffee, vanilla and ice.',
    ['Coffee', 'Milk', 'Ice', 'Vanilla syrup', 'Whipped cream']),
  product('cold-spanish', 'cold-coffee', 'Iced Spanish Latte', 550, 'vanilla', 'standard',
    'Iced latte sweetened with condensed milk: sweet, creamy and cold.',
    ['Espresso', 'Cold milk', 'Condensed milk', 'Ice'], { featured: true }),

  /* ---------- Signature Drinks ---------- */
  product('sig-special', 'signature', 'Circle Special Mocha', 650, 'chocolate', 'premium',
    'Our house signature: double espresso, dark chocolate, steamed milk and sea-salt cream.',
    ['Double espresso', 'Dark chocolate', 'Steamed milk', 'Sea-salt cream'], { bestseller: true }),
  product('sig-golden', 'signature', 'Golden Caramel Brew', 620, 'gold', 'premium',
    'Slow-brewed coffee with house caramel and a golden, salted foam.',
    ['Brewed coffee', 'House caramel', 'Salted foam'], { featured: true }),
  product('sig-midnight', 'signature', 'Midnight Chocolate', 680, 'dark', 'premium',
    'The darkest drink on our menu: 70% cocoa, espresso and a touch of orange zest.',
    ['Espresso', '70% dark chocolate', 'Milk', 'Orange zest']),
  product('sig-royal', 'signature', 'Royal Hazelnut Coffee', 650, 'hazelnut', 'premium',
    'Roasted hazelnut praline, espresso and steamed milk with crushed nuts.',
    ['Espresso', 'Hazelnut praline', 'Steamed milk', 'Crushed hazelnuts']),
  product('sig-dream', 'signature', 'Cinnamon Dream', 600, 'cinnamon', 'premium',
    'Cinnamon, brown sugar and vanilla in a creamy coffee that tastes like dessert.',
    ['Espresso', 'Cinnamon', 'Brown sugar', 'Vanilla', 'Milk']),
  product('sig-brown', 'signature', 'Brown Sugar Latte', 560, 'caramel', 'premium',
    'Espresso and oat-friendly milk sweetened with slow-cooked brown sugar syrup.',
    ['Espresso', 'Brown sugar syrup', 'Steamed milk'])
];

/* ---------- small helpers used on every page ---------- */

function getProduct(id) {
  return PRODUCTS.find(function (p) { return p.id === id; }) || null;
}

/* Which add-ons can this product have? (espresso drinks get fewer options) */
function addonsFor(p) {
  if (p.category === 'espresso') {
    return ADDONS.filter(function (a) { return a.id === 'extra-shot' || a.id === 'extra-syrup'; });
  }
  return ADDONS;
}

/* Price of ONE drink for a size and a list of add-on ids. */
function unitPrice(p, size, addonIds) {
  const sizes = SIZE_TYPES[p.sizeType];
  let price = p.price + (sizes[size] || 0);
  (addonIds || []).forEach(function (id) {
    const addon = ADDONS.find(function (a) { return a.id === id; });
    if (addon) price += addon.price;
  });
  return price;
}

/* ---------- drink illustrations (SVG drawn by code) ----------
   Each product gets a 400x400 picture so every card has the same size.
   To use a real photo instead, put the file in images/<category>/ and set
   the `image` field of that product, e.g. image: 'images/cappuccino/classic.jpg'.
   Paths are fixed up by productImage() below. */

function productKind(p) {
  if (/Frappe/.test(p.name)) return 'frappe';
  if (p.category === 'cold-coffee' || /^Iced/.test(p.name)) return 'cold';
  if (p.category === 'espresso' && p.id !== 'esp-americano') return 'espresso';
  return 'hot';
}

function cupImage(p) {
  const s = SHADES[p.shade] || SHADES.classic;
  const kind = productKind(p);
  const backdrop = '<rect width="400" height="400" fill="' + s.bg + '"/>' +
    '<circle cx="200" cy="200" r="175" fill="#fff" opacity=".35"/>';
  let art = '';

  if (kind === 'hot') {
    art =
      '<ellipse cx="200" cy="338" rx="150" ry="22" fill="#fff"/>' +
      '<ellipse cx="200" cy="342" rx="150" ry="22" fill="#000" opacity=".06"/>' +
      '<path d="M290 190 Q352 190 352 245 Q352 298 285 292" fill="none" stroke="#fff" stroke-width="20" stroke-linecap="round"/>' +
      '<path d="M105 165 H295 V255 Q295 328 200 328 Q105 328 105 255 Z" fill="#fff"/>' +
      '<path d="M105 255 Q105 328 200 328 Q295 328 295 255 Q295 300 200 305 Q105 300 105 255Z" fill="#000" opacity=".06"/>' +
      '<ellipse cx="200" cy="165" rx="95" ry="28" fill="' + s.liquid + '"/>' +
      '<ellipse cx="200" cy="165" rx="80" ry="22" fill="' + s.top + '"/>' +
      '<path d="M200 180 C160 160 172 146 200 158 C228 146 240 160 200 180Z" fill="' + s.accent + '" opacity=".85"/>' +
      '<g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8">' +
      '<path d="M170 120 Q155 95 172 72"/><path d="M205 118 Q190 90 207 62"/><path d="M240 120 Q225 95 242 72"/></g>';
  } else if (kind === 'espresso') {
    art =
      '<ellipse cx="200" cy="320" rx="115" ry="18" fill="#fff"/>' +
      '<ellipse cx="200" cy="324" rx="115" ry="18" fill="#000" opacity=".06"/>' +
      '<path d="M262 215 Q312 215 312 255 Q312 295 258 290" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>' +
      '<path d="M135 195 H265 V255 Q265 312 200 312 Q135 312 135 255 Z" fill="#fff"/>' +
      '<ellipse cx="200" cy="195" rx="65" ry="20" fill="' + s.liquid + '"/>' +
      '<ellipse cx="200" cy="195" rx="54" ry="14" fill="' + s.top + '"/>' +
      '<ellipse cx="200" cy="195" rx="30" ry="7" fill="' + s.accent + '" opacity=".8"/>' +
      '<g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8">' +
      '<path d="M178 160 Q166 138 180 118"/><path d="M215 158 Q203 134 217 110"/></g>';
  } else {
    const glass = 'M130 110 L270 110 L254 322 Q252 337 236 337 H164 Q148 337 146 322 Z';
    const cream = kind === 'frappe'
      ? '<circle cx="165" cy="108" r="24" fill="#fff"/><circle cx="200" cy="96" r="30" fill="#fff"/>' +
        '<circle cx="237" cy="108" r="24" fill="#fff"/>' +
        '<path d="M160 112 Q200 130 242 112" fill="none" stroke="' + s.accent + '" stroke-width="6" stroke-linecap="round"/>'
      : '';
    const ice = kind === 'frappe' ? '' :
      '<rect x="150" y="125" width="42" height="42" rx="6" fill="#fff" opacity=".4" transform="rotate(-12 171 146)"/>' +
      '<rect x="205" y="140" width="42" height="42" rx="6" fill="#fff" opacity=".35" transform="rotate(14 226 161)"/>' +
      '<rect x="168" y="195" width="42" height="42" rx="6" fill="#fff" opacity=".3" transform="rotate(8 189 216)"/>';
    art =
      '<ellipse cx="200" cy="344" rx="85" ry="12" fill="#000" opacity=".1"/>' +
      '<defs><clipPath id="g"><path d="' + glass + '"/></clipPath></defs>' +
      '<rect x="212" y="30" width="14" height="230" rx="7" fill="' + s.accent + '" transform="rotate(10 219 145)"/>' +
      '<g clip-path="url(#g)"><rect x="120" y="100" width="160" height="250" fill="' + s.top + '"/>' +
      '<rect x="120" y="' + (kind === 'frappe' ? 130 : 200) + '" width="160" height="160" fill="' + s.liquid + '" opacity="' + (kind === 'frappe' ? '.55' : '1') + '"/>' +
      ice + '</g>' +
      '<path d="' + glass + '" fill="#fff" opacity=".18"/>' +
      '<path d="' + glass + '" fill="none" stroke="#fff" stroke-width="5" opacity=".9"/>' +
      '<path d="M146 130 L156 300" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".6"/>' +
      cream;
  }

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">' + backdrop + art + '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* Returns the picture to show: a real photo if the product has one, otherwise the drawn cup. */
function productImage(p) {
  if (p.image) {
    const prefix = (document.body.dataset.root === '../') ? '../' : '';
    return prefix + p.image;
  }
  return cupImage(p);
}
