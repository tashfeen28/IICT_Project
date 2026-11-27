/* ==========================================================================
   The Coffee Circle — Product Catalog Data
   Prices are in Pakistani Rupees (PKR)
   ========================================================================== */

var products = [
  {
    id: 'iced-caramel-macchiato',
    name: 'Iced Caramel Macchiato',
    category: 'cold-coffee',
    badge: 'Signature',
    description:
      'Chilled velvety milk layered over ice, marked with freshly pulled double espresso and finished with house-made salted caramel drizzle.',
    basePrice: 750,
    image: 'images/cold-coffee/iced-caramel-macchiato.jpg',
    ingredients: [
      'Double Shot Arabica Espresso',
      'Chilled Fresh Milk',
      'House Salted Caramel Sauce',
      'Madagascar Vanilla Syrup',
      'Filtered Ice Cubes'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 120 },
      { label: 'Large', delta: 240 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'whipped-cream', label: 'Whipped Cream', price: 120 },
      { id: 'caramel-drizzle', label: 'Caramel Drizzle', price: 100 },
      { id: 'oat-milk', label: 'Oat Milk', price: 180 }
    ]
  },
  {
    id: 'cold-brew-classic',
    name: 'Cold Brew Classic',
    category: 'cold-coffee',
    badge: '18-Hr Steeped',
    description:
      'Coarsely ground single-origin beans steeped cold for 18 hours for naturally sweet cocoa notes, low acidity, and a crisp clean finish.',
    basePrice: 650,
    image: 'images/cold-coffee/cold-brew-classic.jpg',
    ingredients: [
      '18-Hour Slow-Steeped Arabica Concentrate',
      'Triple-Filtered Chilled Water',
      'Crystal Ice'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 110 },
      { label: 'Large', delta: 220 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'vanilla-foam', label: 'Vanilla Cold Foam', price: 140 },
      { id: 'caramel-drizzle', label: 'Caramel Drizzle', price: 100 },
      { id: 'oat-milk', label: 'Oat Milk', price: 180 }
    ]
  },
  {
    id: 'mocha-frappe',
    name: 'Mocha Frappe',
    category: 'cold-coffee',
    badge: 'Blended',
    description:
      'Rich espresso blended with dark Belgian cocoa, cold milk, and crushed ice into a frost-smooth indulgence topped with whipped cream.',
    basePrice: 820,
    image: 'images/cold-coffee/mocha-frappe.jpg',
    ingredients: [
      'Double Espresso Roast',
      'Dark Belgian Cocoa Sauce',
      'Chilled Whole Milk',
      'Crushed Ice',
      'Dark Chocolate Shavings'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 130 },
      { label: 'Large', delta: 260 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'whipped-cream', label: 'Whipped Cream', price: 120 },
      { id: 'caramel-drizzle', label: 'Caramel Drizzle', price: 100 },
      { id: 'oat-milk', label: 'Oat Milk', price: 180 }
    ]
  },
  {
    id: 'vanilla-sweet-cream-cold-brew',
    name: 'Vanilla Sweet Cream Cold Brew',
    category: 'cold-coffee',
    badge: 'Best Seller',
    description:
      'Our slow-steeped cold brew crowned with cascading house-whipped vanilla sweet cream that ribbons smoothly through every sip.',
    basePrice: 780,
    image: 'images/cold-coffee/vanilla-sweet-cream-cold-brew.jpg',
    ingredients: [
      '18-Hour Cold Brew Coffee',
      'House Vanilla Sweet Cream',
      'Pure Madagascar Vanilla Bean Syrup',
      'Filtered Ice'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 120 },
      { label: 'Large', delta: 240 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'whipped-cream', label: 'Whipped Cream', price: 120 },
      { id: 'caramel-drizzle', label: 'Caramel Drizzle', price: 100 },
      { id: 'oat-milk', label: 'Oat Milk', price: 180 }
    ]
  },
  {
    id: 'iced-spanish-latte',
    name: 'Iced Spanish Latte',
    category: 'cold-coffee',
    badge: 'Creamy',
    description:
      'Bold artisan espresso shaken over ice with silky condensed milk and fresh chilled milk for a balanced, caramel-kissed sweetness.',
    basePrice: 790,
    image: 'images/cold-coffee/iced-spanish-latte.jpg',
    ingredients: [
      'Double Espresso Shot',
      'Sweetened Condensed Milk',
      'Chilled Whole Milk',
      'Pinch of Sea Salt',
      'Ice Cubes'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 120 },
      { label: 'Large', delta: 240 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'whipped-cream', label: 'Whipped Cream', price: 120 },
      { id: 'caramel-drizzle', label: 'Caramel Drizzle', price: 100 },
      { id: 'oat-milk', label: 'Oat Milk', price: 180 }
    ]
  },
  {
    id: 'hazelnut-iced-americano',
    name: 'Hazelnut Iced Americano',
    category: 'cold-coffee',
    badge: 'Light & Nutty',
    description:
      'Crisp double espresso poured over cold filtered water and ice with a subtle swirl of roasted Piedmont hazelnut syrup.',
    basePrice: 620,
    image: 'images/cold-coffee/hazelnut-iced-americano.jpg',
    ingredients: [
      'Double Shot Medium-Dark Espresso',
      'Chilled Filtered Water',
      'Roasted Hazelnut Syrup',
      'Filtered Ice Cubes'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 100 },
      { label: 'Large', delta: 200 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'whipped-cream', label: 'Whipped Cream', price: 120 },
      { id: 'caramel-drizzle', label: 'Caramel Drizzle', price: 100 },
      { id: 'oat-milk', label: 'Oat Milk', price: 180 }
    ]
  },
  {
    id: 'spiced-cardamom-rose-latte',
    name: 'Spiced Cardamom Rose Latte',
    category: 'signature-drinks',
    badge: 'Best Seller',
    description:
      'Velvety double espresso infused with freshly crushed green cardamom pods and Damascus rosewater, topped with blush rose cream foam.',
    basePrice: 850,
    image: 'images/signature-drinks/spiced-cardamom-rose-latte.jpg',
    ingredients: [
      'Double Shot Single-Origin Espresso',
      'Freshly Crushed Green Cardamom',
      'Damascus Rosewater Infusion',
      'Chilled Micro-Foam Milk',
      'Dried Rose Petals'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 130 },
      { label: 'Large', delta: 260 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'rose-foam', label: 'Rose Petal Cold Foam', price: 140 },
      { id: 'cardamom-syrup', label: 'Cardamom Spiced Syrup', price: 110 },
      { id: 'oat-milk', label: 'Oat Milk', price: 180 }
    ]
  },
  {
    id: 'salted-caramel-honeycomb-macchiato',
    name: 'Salted Caramel Honeycomb Macchiato',
    category: 'signature-drinks',
    badge: 'House Favorite',
    description:
      'Layered artisan espresso over golden salted caramel milk, crowned with house-whipped cream and crisp caramelized honeycomb shards.',
    basePrice: 880,
    image: 'images/signature-drinks/salted-caramel-honeycomb-macchiato.jpg',
    ingredients: [
      'Double Shot Arabica Espresso',
      'House Salted Caramel Sauce',
      'Artisan Honeycomb Crisp',
      'Chilled Whole Milk',
      'Sea Salt Flakes'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 130 },
      { label: 'Large', delta: 260 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'honeycomb-crumble', label: 'Extra Honeycomb Crumble', price: 160 },
      { id: 'whipped-cream', label: 'Whipped Cream', price: 120 },
      { id: 'oat-milk', label: 'Oat Milk', price: 180 }
    ]
  },
  {
    id: 'pistachio-saffron-cortado',
    name: 'Pistachio Saffron Cortado',
    category: 'signature-drinks',
    badge: 'Artisan',
    description:
      'Balanced double ristretto swirled with aromatic saffron-steeped cream and roasted Iranian pistachio butter for a nutty, golden finish.',
    basePrice: 920,
    image: 'images/signature-drinks/pistachio-saffron-cortado.jpg',
    ingredients: [
      'Double Ristretto Espresso',
      'Roasted Pistachio Cream',
      'Kashmiri Saffron Threads',
      'Steamed & Chilled Milk',
      'Crushed Pistachio Dust'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 140 },
      { label: 'Large', delta: 280 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'crushed-pistachio', label: 'Roasted Pistachio Crunch', price: 170 },
      { id: 'saffron-foam', label: 'Saffron Sweet Foam', price: 150 },
      { id: 'oat-milk', label: 'Oat Milk', price: 180 }
    ]
  },
  {
    id: 'dark-mocha-hazelnut-velvet',
    name: 'Dark Mocha Hazelnut Velvet',
    category: 'signature-drinks',
    badge: 'Rich & Silky',
    description:
      '70% single-origin dark chocolate ganache melted into bold espresso with roasted Piedmont hazelnut praline and silky cocoa cream.',
    basePrice: 860,
    image: 'images/signature-drinks/dark-mocha-hazelnut-velvet.jpg',
    ingredients: [
      'Double Dark-Roast Espresso',
      '70% Dark Belgian Chocolate Ganache',
      'Roasted Hazelnut Praline',
      'Velvety Whole Milk',
      'Dark Cocoa Shavings'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 130 },
      { label: 'Large', delta: 260 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'whipped-cream', label: 'Whipped Cream', price: 120 },
      { id: 'chocolate-shavings', label: 'Dark Chocolate Shavings', price: 130 },
      { id: 'oat-milk', label: 'Oat Milk', price: 180 }
    ]
  },
  {
    id: 'cinnamon-maple-espresso-tonic',
    name: 'Cinnamon Maple Espresso Tonic',
    category: 'signature-drinks',
    badge: 'Sparkling',
    description:
      'Bright citrus-forward espresso floated gently over botanical tonic water, pure Canadian maple syrup, and warm Ceylon cinnamon spice.',
    basePrice: 790,
    image: 'images/signature-drinks/cinnamon-maple-espresso-tonic.jpg',
    ingredients: [
      'Bright Ethiopian Double Espresso',
      'Craft Botanical Tonic Water',
      'Pure Grade-A Maple Syrup',
      'Ceylon Cinnamon Infusion',
      'Candied Blood Orange Slice'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 120 },
      { label: 'Large', delta: 240 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'maple-drizzle', label: 'Pure Maple Drizzle', price: 130 },
      { id: 'citrus-zest', label: 'Candied Orange Peel', price: 110 },
      { id: 'vanilla-foam', label: 'Vanilla Cold Foam', price: 140 }
    ]
  },
  {
    id: 'toasted-coconut-vanilla-cloud',
    name: 'Toasted Coconut Vanilla Cloud',
    category: 'signature-drinks',
    badge: 'Signature Cloud',
    description:
      'Smooth cold-extracted espresso layered with creamy coconut milk, Madagascar vanilla bean, and an airy cloud topped with toasted coconut.',
    basePrice: 840,
    image: 'images/signature-drinks/toasted-coconut-vanilla-cloud.jpg',
    ingredients: [
      'Smooth Double Espresso',
      'Creamy Coconut Milk Blend',
      'Madagascar Vanilla Bean Syrup',
      'Whipped Vanilla Cloud Foam',
      'Toasted Coconut Flakes'
    ],
    sizes: [
      { label: 'Small', delta: 0 },
      { label: 'Medium', delta: 120 },
      { label: 'Large', delta: 240 }
    ],
    extras: [
      { id: 'extra-shot', label: 'Extra Espresso Shot', price: 150 },
      { id: 'coconut-flakes', label: 'Extra Toasted Coconut', price: 130 },
      { id: 'vanilla-cloud', label: 'Vanilla Cloud Foam', price: 140 },
      { id: 'oat-milk', label: 'Oat Milk', price: 180 }
    ]
  }
];

window.products = products;
