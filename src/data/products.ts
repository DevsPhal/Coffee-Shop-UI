export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image?: string | null;
  description: string;
  category: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "590 Coffee",
    price: 2.00,
    image: null,
    description: "Crafted to fuel the modern city hustle, our signature 590 Coffee is the ultimate balance of bold energy and rich, creamy indulgence.",
    category: "signature",
  },

  {
    id: "2",
    title: "Amacano",
    price: 1.75,
    image: null,
    description: "Smooth espresso diluted with chilled filtered water and poured over crisp ice cubes for a clean, refreshing coffee experience.",
    category: "Hot",
  },
  {
    id: "3",
    title: "Ice Latte",
    price: 2.00,
    image: null,
    description: "Perfect harmony of rich espresso and cold, velvety fresh milk, served over ice for a creamy and delightful flavor.",
    category: "Iced",
  },
  {
    id: "4",
    title: "Coca Cola",
    price: 2.00,
    image: null,
    description: "Crafted to fuel the modern city hustle, our signature 590 Coffee is the ultimate balance of bold energy and rich, creamy indulgence.",
    category: "Soft Drink",
  },
  {
    id: "5",
    title: "indonesia noodle",
    price: 2.20,
    image: null,
    description: "Authentic Cambodian iced coffee crafted with strong dark roast coffee and rich sweet condensed milk served over crushed ice.",
    category: "Snack",
  },
  {
    id: "6",
    title: "ផាសិនស្រស់",
    price: 2.50,
    image: null,
    description: "Freshly squeezed passion fruit juice blended with ice, delivering a vibrant, sweet-and-tangy tropical refreshment.",
    category: "Material",
  },
  {
    id: "7",
    title: "Americano",
    price: 2.20,
    image: null,
    description: "Bold espresso blended with milk and topped with fluffy cold foam, served over ice for a classic refreshing treat.",
    category: "Coffee",
  },
  {
    id: "8",
    title: "capuccino",
    price: 2.25,
    image: null,
    description: "Invigorating brewed tea infused with fresh passion fruit seeds and tangy lemon slice over ice.",
    category: "Coffee",
  },
  {
    id: "9",
    title: "capuccino frappe",
    price: 1.80,
    image: null,
    description: "Golden, flaky, butter-layered French croissant baked fresh daily, perfect paired with your morning coffee.",
    category: "Frappe",
  },
  {
    id: "10",
    title: "Cambodia Beer",
    price: 1.50,
    image: null,
    description: "Rich, bold, and concentrated shot of pure coffee essence crafted from expertly roasted beans for a intense caffeine kick.",
    category: "Beer",
  },
];

export function getProductByIdOrTitle(id?: string, title?: string): Product | undefined {
  if (id) {
    const found = PRODUCTS.find((p) => p.id === id);
    if (found) return found;
  }
  if (title) {
    const titleLower = title.toLowerCase();
    const found = PRODUCTS.find((p) => p.title.toLowerCase() === titleLower);
    if (found) return found;
  }
  return undefined;
}
