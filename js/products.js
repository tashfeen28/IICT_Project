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
  }
];

window.products = products;
