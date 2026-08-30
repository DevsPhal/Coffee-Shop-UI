export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountType?: "percentage" | "fixed";
  discountAmount?: number;
  promoEndDate?: string;
  promoDaysLeft?: string;
  image?: string | null;
  description: string;
  category: string;
  isPromotionOnly?: boolean;
}

export const getFuturePromoDate = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "590 Coffee",
    price: 1.50,
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80",
    description: "Our signature iced espresso blend, crafted with bold dark-roast coffee, sweet milk, and served over chilled ice for the perfect morning boost.",
    category: "Iced Coffee",
  },
  {
    id: "2",
    title: "Americano",
    price: 1.75,
    image: "/images/americano.jpg",
    description: "Rich double-shot espresso poured over hot purified water, delivering a smooth, aromatic black coffee with a golden crema.",
    category: "Hot Coffee",
  },
  {
    id: "3",
    title: "Ice Latte",
    price: 1.50,
    image: "/images/iced_latte.jpg",
    description: "Perfect harmony of rich espresso and cold, velvety fresh milk, served over ice for a creamy and delightful flavor.",
    category: "Ice Coffee",
  },
  {
    id: "4",
    title: "Coca Cola",
    price: 1.50,
    image: "/images/coca.jpg",
    description: "Classic, ice-cold Coca Cola sparkling soft drink with iconic crisp carbonation and refreshing cola flavor.",
    category: "Energy Drink",
  },
  {
    id: "5",
    title: "Indomie",
    price: 1.00,
    image: "/images/indomie.jpg",
    description: "Savory Indonesian fried instant noodles tossed with aromatic seasoning, garlic oil, chili, and sweet soy sauce.",
    category: "Noodle",
  },
  {
    id: "6",
    title: "Fresh Passion Fruit Juice",
    price: 1.50,
    image: "/images/passion.jpg",
    description: "Freshly squeezed natural passion fruit juice served over ice, packed with vibrant tangy-sweet tropical flavor.",
    category: "Iced Tea",
  },
  {
    id: "7",
    title: "Black Coffee",
    price: 1.75,
    image: "/images/black_coffee.jpg",
    description: "Strong, bold iced black coffee brewed from dark roasted beans, served ice-cold for a pure, uncompromised coffee kick.",
    category: "Ice Coffee",
  },
  {
    id: "8",
    title: "Cappuccino",
    price: 1.25,
    image: "/images/cappucino.jpg",
    description: "Rich espresso base topped with equal parts warm milk and thick, velvety milk foam.",
    category: "Ice Coffee",
  },
  {
    id: "9",
    title: "Cappuccino Frappe",
    price: 1.50,
    image: "/images/cappucino_frappee.jpg",
    description: "Decadent blended cappuccino slushie with rich espresso, milk, and crushed ice.",
    category: "Ice Coffee",
  },
  {
    id: "10",
    title: "Cambodia Beer",
    price: 0.75,
    image: "/images/cambodia_beer.jpg",
    description: "Premium Cambodian beer brewed with fine European standard hops, crisp and refreshing with a smooth finish.",
    category: "Beer",
  },
  {
    id: "11",
    title: "Blue soda",
    price: 1.50,
    originalPrice: 2.00,
    discountType: "percentage",
    promoEndDate: getFuturePromoDate(15),
    promoDaysLeft: "15 days left",
    image: "/images/soda.jpg",
    description: "Refreshing blue curaçao soda infused with sparkling water and crushed ice.",
    category: "Iced Tea",
  },
  {
    id: "12",
    title: "Hot Chocolate",
    price: 1.00,
    originalPrice: 1.50,
    discountType: "fixed",
    discountAmount: 0.50,
    promoEndDate: getFuturePromoDate(7),
    promoDaysLeft: "7 days left",
    image: "/images/chocolate.jpg",
    description: "Rich cocoa blended with steamed milk and topped with creamy froth.",
    category: "Hot Coffee",
  },
  {
    id: "13",
    title: "Sting",
    price: 0.60,
    originalPrice: 1.00,
    discountType: "percentage",
    promoEndDate: getFuturePromoDate(2),
    promoDaysLeft: "2 days left",
    image: "/images/sting.png",
    description: "Invigorating red Sting energy drink with ginseng and B-vitamins, served ice-cold for an instant energetic boost.",
    category: "Energy Drink",
  },
  {
    id: "14",
    title: "Cambodia Water",
    price: 0.35,
    image: "/images/water.jpg",
    description: "Pure, clean, and refreshing natural drinking water bottled to the highest European quality standards for daily hydration.",
    category: "Pure Water",
  },
  {
    id: "15",
    title: "Green Tea",
    price: 2.25,
    image: "/images/greentea.jpg",
    description: "Refreshing chilled green tea brewed from premium tea leaves and served ice-cold.",
    category: "Iced Tea",
  },
  {
    id: "16",
    title: "Honey Lemon Tea",
    price: 1.50,
    image: "/images/hothoneylemon.jpg",
    description: "Soothing hot green tea infused with natural honey and fresh lemon, served warm for comforting moments.",
    category: "Hot Tea",
  },
  {
    id: "17",
    title: "Fried Egg",
    price: 0.25,
    image: "/images/egg.jpg",
    description: "Freshly fried sunny-side-up egg seasoned with salt, pepper, and garlic oil, perfect as a snack or dish topping.",
    category: "Topping",
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
  "11": "/images/soda.jpg",
  "12": "/images/chocolate.jpg",
  "13": "/images/sting.png",
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
    const baseId = id.split("-")[0];
    if (baseId) {
      const foundBase = PRODUCTS.find((p) => p.id === baseId);
      if (foundBase) return foundBase;
    }
  }
  if (title) {
    const titleLower = title.toLowerCase();
    const found = PRODUCTS.find((p) => p.title.toLowerCase() === titleLower);
    if (found) return found;
  }
  return undefined;
}

export interface CustomizationConfig {
  hasSize: boolean;
  sizeOptions: string[];
  hasIce: boolean;
  hasSugar: boolean;
  hasMilk: boolean;
}

export function getItemCustomizationConfig(title: string, category?: string): CustomizationConfig {
  const prod = getProductByIdOrTitle(undefined, title);
  const cat = (category || prod?.category || "").trim();
  const lowerCat = cat.toLowerCase();
  const lowerTitle = (title || "").toLowerCase();

  // Beer: Packaging options (Can - $0.75, Bottle - $1.25, Carton - $28.00)
  if (lowerCat === "beer" || lowerTitle.includes("beer")) {
    return {
      hasSize: true,
      sizeOptions: ["Can", "Bottle", "Carton"],
      hasIce: false,
      hasSugar: false,
      hasMilk: false,
    };
  }

  // Water / Pure Water: bottle sizes (1000ml and 1500ml)
  if (
    lowerCat === "pure water" ||
    lowerCat === "pour water" ||
    lowerCat === "water" ||
    lowerTitle.includes("water")
  ) {
    return {
      hasSize: true,
      sizeOptions: ["1000ml", "1500ml"],
      hasIce: false,
      hasSugar: false,
      hasMilk: false,
    };
  }

  // Snack / Noodle: size (1 or Double)
  if (
    lowerCat === "noodle" ||
    lowerCat === "snack" ||
    lowerTitle.includes("noodle") ||
    lowerTitle.includes("indomie")
  ) {
    return {
      hasSize: true,
      sizeOptions: ["1", "Double"],
      hasIce: false,
      hasSugar: false,
      hasMilk: false,
    };
  }

  // Energy Drink / Soft Drink: has icedlevel
  if (
    lowerCat === "energy drink" ||
    lowerCat === "soft drink" ||
    lowerTitle.includes("coca") ||
    lowerTitle.includes("sting") ||
    lowerTitle.includes("soda")
  ) {
    return {
      hasSize: true,
      sizeOptions: ["M", "L"],
      hasIce: true,
      hasSugar: false,
      hasMilk: false,
    };
  }

  // Hot Coffee / Hot Tea / Hot Drinks: size (M, L), sugarlevel, milktype, NO icedlevel (hasIce: false)
  if (
    lowerCat === "hot coffee" ||
    lowerCat === "hot tea" ||
    lowerCat === "hot" ||
    lowerTitle.includes("hot") ||
    lowerTitle.includes("chocolate") ||
    lowerTitle.includes("honey lemon")
  ) {
    return {
      hasSize: true,
      sizeOptions: ["M", "L"],
      hasIce: false,
      hasSugar: true,
      hasMilk: true,
    };
  }

  // Fresh Drink / Material: has icedlevel
  if (
    lowerCat === "fresh drink" ||
    lowerCat === "material" ||
    lowerTitle.includes("juice") ||
    lowerTitle.includes("passion")
  ) {
    return {
      hasSize: true,
      sizeOptions: ["M", "L"],
      hasIce: true,
      hasSugar: false,
      hasMilk: false,
    };
  }

  // Topping / Eggs / Food Add-Ons: No drink options (no size, ice, sugar, or milk)
  if (
    lowerCat === "topping" ||
    lowerCat === "toppings" ||
    lowerCat === "eggs" ||
    lowerCat === "egg" ||
    lowerTitle.includes("egg") ||
    lowerTitle.includes("topping")
  ) {
    return {
      hasSize: false,
      sizeOptions: [],
      hasIce: false,
      hasSugar: false,
      hasMilk: false,
    };
  }

  // Ice Coffee, Frappe, Signature, Coffee: has icedlevel, sugarlevel, and milktype
  return {
    hasSize: true,
    sizeOptions: ["M", "L"],
    hasIce: true,
    hasSugar: true,
    hasMilk: true,
  };
}

export interface SubCategoryConfig {
  id: string;
  name: string;
  rawCategories: string[];
  icon: string;
}

export interface MainCategoryConfig {
  id: string;
  name: string;
  icon: string;
  subCategories: SubCategoryConfig[];
}

export const MAIN_CATEGORIES: MainCategoryConfig[] = [
  {
    id: "fresh_drink",
    name: "Fresh Drink",
    icon: "/icons/material.svg",
    subCategories: [
      {
        id: "iced_coffee",
        name: "Iced Coffee",
        rawCategories: ["Iced Coffee", "Ice Coffee", "Iced", "Coffee", "signature", "Frappe"],
        icon: "/icons/iced.svg",
      },
      {
        id: "hot_coffee",
        name: "Hot Coffee",
        rawCategories: ["Hot Coffee", "Hot"],
        icon: "/icons/hot.svg",
      },
      {
        id: "iced_tea",
        name: "Iced Tea",
        rawCategories: ["Iced Tea", "Ice Tea", "Tea", "Passion", "Fresh Drink", "Material"],
        icon: "/icons/material.svg",
      },
      {
        id: "hot_tea",
        name: "Hot Tea",
        rawCategories: ["Hot Tea"],
        icon: "/icons/hot.svg",
      },
    ],
  },
  {
    id: "beverage",
    name: "Beverage",
    icon: "/icons/coffee.svg",
    subCategories: [
      {
        id: "beer",
        name: "Beer",
        rawCategories: ["Beer"],
        icon: "/icons/beer.svg",
      },
      {
        id: "soft_drink",
        name: "Soft Drink",
        rawCategories: ["Soft Drink", "Energy Drink", "Soda"],
        icon: "/icons/soft_drink.svg",
      },
      {
        id: "pure_water",
        name: "Pure Water",
        rawCategories: ["Pure Water", "Pour Water", "Water"],
        icon: "/icons/water.svg",
      },
    ],
  },
  {
    id: "snack",
    name: "Snack",
    icon: "/icons/snack.svg",
    subCategories: [
      {
        id: "noddle",
        name: "Noddle",
        rawCategories: ["Noddle", "Noodle", "Snack"],
        icon: "/icons/snack.svg",
      },
      {
        id: "eggs",
        name: "Topping",
        rawCategories: ["Topping", "Toppings", "Eggs", "Egg"],
        icon: "/icons/snack.svg",
      },
    ],
  },
];

export interface EditorialCategoryConfig {
  id: string;
  categoryName: string;
  title: string;
  editTag: string;
  description: string;
  image: string;
}

export const EDITORIAL_CATEGORIES: EditorialCategoryConfig[] = [
  {
    id: "iced_coffee",
    categoryName: "Iced Coffee",
    title: "Iced Coffee Cravings",
    editTag: "THE COFFEE EDIT",
    description: "Our signature 590 Coffee, handcrafted iced espresso blends & chilled coffees",
    image: "/images/iced_latte.jpg",
  },
  {
    id: "hot_coffee",
    categoryName: "Hot Coffee",
    title: "Warm Comfort Brews",
    editTag: "BARISTA SPECIALS",
    description: "Americano, Espresso & Hot Chocolate",
    image: "/images/americano.jpg",
  },
  {
    id: "iced_tea",
    categoryName: "Iced Tea",
    title: "Refreshing Iced Teas",
    editTag: "CHILLED TEA EDIT",
    description: "Chilled Passion Fruit Tea, Green Tea & Lemon Tea",
    image: "/images/greentea.jpg",
  },
  {
    id: "hot_tea",
    categoryName: "Hot Tea",
    title: "Aromatic Hot Teas",
    editTag: "HERBAL BREWS",
    description: "Hot Jasmine Tea, Green Tea & Honey Lemon",
    image: "/images/hothoneylemon.jpg",
  },
  {
    id: "beer",
    categoryName: "Beer",
    title: "Beer",
    editTag: "CRAFT BEER EDIT",
    description: "Cambodia Beer, Stout & Premium Lagers",
    image: "/images/cambodia_beer.jpg",
  },
  {
    id: "soft_drink",
    categoryName: "Soft Drink",
    title: "Sparkling Soft Drinks",
    editTag: "SODAS & ENERGY",
    description: "Coca Cola, Sting Energy & Sparkling Sodas",
    image: "/images/coca.jpg",
  },
  {
    id: "pure_water",
    categoryName: "Pure Water",
    title: "Pure Water",
    editTag: "HYDRATION EDIT",
    description: "Clean Purified Mineral Water Bottles",
    image: "/images/water.jpg",
  },
  {
    id: "noddle",
    categoryName: "Noddle",
    title: "Noodle",
    editTag: "QUICK NOODLE EDIT",
    description: "Indonesian Fried Noodles & Garlic Seasoned Bites",
    image: "/images/indomie.jpg",
  },
  {
    id: "eggs",
    categoryName: "Topping",
    title: "Topping",
    editTag: "FOOD TOPPINGS EDIT",
    description: "Delicious egg toppings, fried eggs & savory add-ons for all products",
    image: "/images/egg.jpg",
  },
];

export function filterProductsByCategory(categoryName: string, searchQuery?: string): Product[] {
  const normCat = (categoryName || "All").trim();

  let categoryFiltered: Product[] = [];

  if (normCat === "All" || normCat === "all") {
    categoryFiltered = PRODUCTS;
  } else if (normCat.toLowerCase().includes("featured")) {
    // Filter products that have active discounts or promotions
    categoryFiltered = PRODUCTS.filter(
      (p) =>
        (p.originalPrice && p.originalPrice > p.price) ||
        p.discountAmount !== undefined ||
        Boolean(p.discountType) ||
        Boolean(p.promoDaysLeft) ||
        Boolean(p.promoEndDate)
    );
  } else {
    // Check if normCat matches a Main Category name
    const mainMatch = MAIN_CATEGORIES.find(
      (m) => m.name.toLowerCase() === normCat.toLowerCase() || m.id === normCat.toLowerCase()
    );

    if (mainMatch) {
      const allSubRaw = mainMatch.subCategories.flatMap((sub) => sub.rawCategories.map((c) => c.toLowerCase()));
      categoryFiltered = PRODUCTS.filter((p) =>
        allSubRaw.includes((p.category || "").toLowerCase())
      );
    } else {
      // Check if normCat matches a Sub Category name
      let subMatchRaw: string[] | undefined = undefined;
      for (const main of MAIN_CATEGORIES) {
        const foundSub = main.subCategories.find(
          (s) => s.name.toLowerCase() === normCat.toLowerCase() || s.id === normCat.toLowerCase()
        );
        if (foundSub) {
          subMatchRaw = foundSub.rawCategories.map((c) => c.toLowerCase());
          break;
        }
      }

      if (subMatchRaw) {
        categoryFiltered = PRODUCTS.filter((p) =>
          subMatchRaw!.includes((p.category || "").toLowerCase())
        );
      } else {
        // Direct category match fallback
        categoryFiltered = PRODUCTS.filter(
          (p) => (p.category || "").toLowerCase() === normCat.toLowerCase()
        );
      }
    }
  }

  if (!searchQuery || !searchQuery.trim()) {
    return categoryFiltered;
  }

  const queryLower = searchQuery.trim().toLowerCase();
  return categoryFiltered.filter((p) => p.title.toLowerCase().includes(queryLower));
}

export function getCategoryItemCount(categoryName: string): number {
  return filterProductsByCategory(categoryName).length;
}
