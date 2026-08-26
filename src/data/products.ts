export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  promoEndDate?: string;
  promoDaysLeft?: string;
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
    title: "Amacanonononononononononnno",
    price: 2.25,
    image: "/images/americano.jpg",
    description: "Smooth espresso diluted with chilled filtered water and poured over crisp ice cubes for a clean, refreshing coffee experience.",
    category: "Hot",
  },
  {
    id: "3",
    title: "Ice Latte",
    price: 2.50,
    image: "/images/iced_latte.jpg",
    description: "Perfect harmony of rich espresso and cold, velvety fresh milk, served over ice for a creamy and delightful flavor.",
    category: "Iced",
  },
  {
    id: "4",
    title: "Coca Cola",
    price: 2.00,
    image: "/images/coca.jpg",
    description: "Crafted to fuel the modern city hustle, our signature 590 Coffee is the ultimate balance of bold energy and rich, creamy indulgence.",
    category: "Soft Drink",
  },
  {
    id: "5",
    title: "Indonesia Noodle",
    price: 2.20,
    image: "/images/indomie.jpg",
    description: "Authentic Cambodian iced coffee crafted with strong dark roast coffee and rich sweet condensed milk served over crushed ice.",
    category: "Snack",
  },
  {
    id: "6",
    title: "Fresh Passion Fruit Juice",
    price: 2.50,
    image: "/images/passion.jpg",
    description: "Freshly squeezed passion fruit juice blended with ice, delivering a vibrant, sweet-and-tangy tropical refreshment.",
    category: "Material",
  },
  {
    id: "7",
    title: "Black Coffee",
    price: 2.20,
    image: "/images/black_coffee.jpg",
    description: "Bold espresso blended with milk and topped with fluffy cold foam, served over ice for a classic refreshing treat.",
    category: "Coffee",
  },
  {
    id: "8",
    title: "Cappuccino",
    price: 2.25,
    image: "/images/cappucino.jpg",
    description: "Invigorating brewed tea infused with fresh passion fruit seeds and tangy lemon slice over ice.",
    category: "Coffee",
  },
  {
    id: "9",
    title: "Cappuccino Frappe",
    price: 1.80,
    image: "/images/cappucino_frappee.jpg",
    description: "Golden, flaky, butter-layered French croissant baked fresh daily, perfect paired with your morning coffee.",
    category: "Frappe",
  },
  {
    id: "10",
    title: "Cambodia Beer",
    price: 1.50,
    image: "/images/cambodia_beer.jpg",
    description: "Rich, bold, and concentrated shot of pure coffee essence crafted from expertly roasted beans for a intense caffeine kick.",
    category: "Beer",
  },
];

export const DEFAULT_IMAGES: Record<string, string> = {
  "1": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80",
  "2": "/images/americano.jpg",
  "3": "/images/iced_latte.jpg",
  "4": "/images/coca.jpg",
  "5": "/images/indomie.jpg",
  "6": "/images/passion.jpg",
  "7": "/images/black_coffee.jpg",
  "8": "/images/cappucino.jpg",
  "9": "/images/cappucino_frappee.jpg",
  "10": "/images/cambodia_beer.jpg",
};

export const GENERIC_COFFEE_IMG =
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80";

export function getResolvedProductImage(id?: string, image?: string | null): string {
  if (image && image.trim() !== "") return image;
  if (id && DEFAULT_IMAGES[id]) return DEFAULT_IMAGES[id];
  return GENERIC_COFFEE_IMG;
}

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
