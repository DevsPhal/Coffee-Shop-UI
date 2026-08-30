"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";

export type Language = "en" | "km";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const staticTranslations: Record<Language, Record<string, string>> = {
  en: {
    Home: "Home",
    Menu: "Menu",
    Events: "Events",
    Location: "Location",
    "Contact Us": "Contact Us",
    Login: "Login",
    login: "Login",
    Profile: "Profile",
    Contact: "Contact",
    Info: "Info",
    "Contact for Service": "Contact for Service",
    "Contact for Partner": "Contact for Partner",
    "30a St 590, Phnom Penh 12101, Khan Toul Kork, Phnom Penh Cambodia.": "30a St 590, Phnom Penh 12101, Khan Toul Kork, Phnom Penh Cambodia.",
    "30a St 590, Phnom Penh 12101, Khan Toul Kork, Phnom Penh Cambodia": "30a St 590, Phnom Penh 12101, Khan Toul Kork, Phnom Penh Cambodia",
    "© 2026 — Copyright": "© 2026 — Copyright",
    English: "English",
    Khmer: "ខ្មែរ",
  },
  km: {
    Home: "ទំព័រដើម",
    Menu: "ម៉ឺនុយ",
    Events: "ព្រឹត្តិការណ៍",
    Location: "ទីតាំង",
    "Contact Us": "ទាក់ទងមកកាន់ពួកយើង",
    Login: "ចូលឈ្មោះ",
    login: "ចូល",
    Profile: "គណនី",
    Contact: "ទាក់ទងមកកាន់ពួកយើង",
    Info: "ព័ត៌មាន",
    "Contact for Service": "ទាក់ទងតាមសេវាកម្ម",
    "Contact for Partner": "ទាក់ទងធ្វើជាដៃគូសហការ",
    "30a St 590, Phnom Penh 12101, Khan Toul Kork, Phnom Penh Cambodia.": "៣០a ផ្លូវ៥៩០, រាជធានីភ្នំពេញ ១២១០១, ខណ្ឌទួលគោក, រាជធានីភ្នំពេញ កម្ពុជា។",
    "30a St 590, Phnom Penh 12101, Khan Toul Kork, Phnom Penh Cambodia": "30a ផ្លូវ 590, រាជធានីភ្នំពេញ 12101, ខណ្ឌទួលគោក, រាជធានីភ្នំពេញ កម្ពុជា។",
    "© 2026 — Copyright": "© 2026 — រក្សាសិទ្ធិគ្រប់យ៉ាង",
    "About Us": "អំពីយើង",
    Close: "បិទ",
    "Ready to Order?": "តើអ្នកត្រៀមខ្លួនជាស្រេចក្នុងការកុម្ម៉ង់ហើយឬនៅ?",
    "Browse our full menu, customise your drink, and pick it up at the counter or have it brought to your table.": "មើលម៉ឺនុយពេញលេញរបស់យើង ជ្រើសរើសភេសជ្ជៈតាមតម្រូវការ ហើយទទួលយកនៅបញ្ជរ ឬឱ្យយើងជូនទៅដល់តុរបស់អ្នក។",
    "Start Your Order": "ចាប់ផ្តើមកុម្ម៉ង់ឥឡូវនេះ",
    "Learn More": "ស្វែងយល់បន្ថែម",
    "Special Today": "ពិសេសថ្ងៃនេះ",
    "Handcrafted daily specials picked fresh for you": "មុខម្ហូប និងភេសជ្ជៈពិសេសប្រចាំថ្ងៃសម្រិតសម្រាំងសម្រាប់អ្នក",
    "Crafted with Passion": "ភេសជ្ជៈ និងម្ហូបដែលពេញនិយម",
    "Every item is made to order - no shortcuts, no compromises": "រាល់មុខម្ហូបត្រូវបានធ្វើឡើងភ្លាមៗតាមការកុម្ម៉ង់ គ្មានការកាត់បន្ថយ និងគ្មានការបន្ធូរបន្ថយគុណភាព",
    "590st CAFE Flagship": "ហាងកាហ្វេ 590st CAFE ទីស្នាក់ការកណ្តាល",
    "Founded by Mr. Ith Chanti at House No. 30A, Street 590, Toul Kork, Phnom Penh, legally registered with the Ministry of Commerce.": "បង្កើតឡើងដោយលោក អ៊ិត ចាន់ទី នៅផ្ទះលេខ 30A ផ្លូវ 590 ទួលគោក ភ្នំពេញ បានចុះបញ្ជីស្របច្បាប់នៅក្រសួងពាណិជ្ជកម្ម។",
    "Honesty & Quality": "ភាពស្មោះត្រង់ និងគុណភាព",
    "Our Warm Hospitality": "ការស្វាគមន៍ប្រកបដោយភាពកក់ក្តៅ",
    "Dedicated to welcoming every visitor with genuine Cambodian warmth, friendliness, and exceptional service.": "ឧទ្ទិសដល់ការស្វាគមន៍ភ្ញៀវគ្រប់រូបដោយភាពកក់ក្តៅ បរិស័ទមិត្តភាព និងសេវាកម្មដ៏ប្រពៃតាមបែបខ្មែរ។",
    // Categories
    All: "ទាំងអស់",
    all: "ទាំងអស់",
    Category: "ប្រភេទទំនិញ",
    category: "ប្រភេទទំនិញ",
    "Our Categories": "ប្រភេទទំនិញរបស់យើង",
    CATEGORIES: "ប្រភេទ",
    categories: "ប្រភេទ",
    "Soft Drink": "ភេសជ្ជៈកំប៉ុង",
    "soft drink": "ភេសជ្ជៈកំប៉ុង",
    Beverage: "ភេសជ្ជៈ",
    beverage: "ភេសជ្ជៈ",
    Snack: "អាហារសម្រន់",
    snack: "អាហារសម្រន់",
    "Ice Coffee": "កាហ្វេត្រជាក់",
    "Hot Coffee": "កាហ្វេក្តៅ",
    "Fresh Drink": "ភេសជ្ជៈស្រស់",
    "Pure Water": "ទឹកបរិសុទ្ធ",
    "pure water": "ទឹកបរិសុទ្ធ",
    "Pour Water": "ទឹកបរិសុទ្ធ",
    "pour water": "ទឹកបរិសុទ្ធ",
    "Energy Drink": "ភេសជ្ជៈបន្ថែមថាមពល",
    "energy drink": "ភេសជ្ជៈបន្ថែមថាមពល",
    Beer: "ស្រាបៀ",
    beer: "ស្រាបៀ",
    Noodle: "មី",
    noodle: "មី",
    Iced: "ត្រជាក់",
    iced: "ត្រជាក់",
    Hot: "ក្តៅ",
    hot: "ក្តៅ",
    Coffee: "កាហ្វេ",
    coffee: "កាហ្វេ",
    Frappe: "ភេសជ្ជៈក្រឡុក",
    frappe: "ភេសជ្ជៈក្រឡុក",
    Signature: "ប្រចាំហាង",
    signature: "ប្រចាំហាង",
    Water: "ទឹកបរិសុទ្ធ",
    water: "ទឹកបរិសុទ្ធ",
    Topping: "គ្រឿងបន្ថែម",
    topping: "គ្រឿងបន្ថែម",
    Toppings: "គ្រឿងបន្ថែម",
    toppings: "គ្រឿងបន្ថែម",
    Material: "សម្ភារៈ",
    material: "សម្ភារៈ",

    // Products
    "590 Coffee": "កាហ្វេ 590",
    "Amacanonononononononononnno": "អាមេរិកាណូ",
    "Americano": "អាមេរិកាណូ",
    "Ice Latte": "ឡាតេទឹកកក",
    "Iced Latte": "ឡាតេទឹកកក",
    "Coca Cola": "កូកាកូឡា",
    "Indonesia Noodle": "អ៊ិនដូមី",
    "Indomie": "អ៊ិនដូមី",
    "Fresh Passion Fruit Juice": "ទឹកប៉ាស៊ីយ៉ុងស្រស់",
    "Passion Juice": "ទឹកប៉ាស៊ីយ៉ុង",
    "Passion Fruit": "ទឹកប៉ាស៊ីយ៉ុង",
    "Black Coffee": "កាហ្វេខ្មៅ",
    "Cappuccino": "កាពូឈីណូ",
    "Cappuccino Frappe": "កាពូឈីណូក្រឡុក",
    "Cambodia Beer": "ស្រាបៀ កម្ពុជា",
    "Carlsberg Beer": "ស្រាបៀ Carlsberg",
    "Angkor Sky": "ស្រាបៀ Angkor Sky",
    "Blue soda": "សូដាពណ៌ខៀវ",
    "Hot Chocolate": "សូកូឡាក្តៅ",
    "Mocha": "ម៉ាឆា",
    "mocha": "ម៉ាឆា",
    "Matcha": "ម៉ាឆា",
    "matcha": "ម៉ាឆា",
    "Sting": "ស្ទីង",
    "Cambodia": "ទឹកសុទ្ធ កម្ពុជា",
    "Cambodia Water": "ទឹកសុទ្ធ កម្ពុជា",
    "Angkor Water": "ទឹកសុទ្ធ អង្គរ",
    "Hi-Tech Water": "ទឹកសុទ្ធ ហាយថិច",
    "Honey Lemon Tea": "តែក្រូចឆ្មាទឹកឃ្មុំ",
    "Hot Honey Lemon Tea": "តែក្រូចឆ្មាទឹកឃ្មុំក្តៅ",
    "Hot Jasmine Green Tea": "តែក្រូចឆ្មាទឹកឃ្មុំ",
    "Iced Passion Lemon Tea": "តែក្រូចឆ្មាទឹកឃ្មុំ",
    "Green Tea": "តែបៃតង",
    "Mie Jeat": "មី ជាតិ",
    "Mie jeat": "មី ជាតិ",
    "Omachi": "អូម៉ាជី",

    "All Products": "ផលិតផលទាំងអស់",
    "Featured Products": "ផលិតផលពិសេស",
    "590 Signature": "ប្រចាំហាង 590",
    "Party Together": "ជប់លៀងជាមួយគ្នា",
    "Chess Master": "កំពូលអ្នកលេងអុក",
    "Night Enjoying with Song of DJZ": "រាត្រីរីករាយជាមួយតន្ត្រី DJZ",
    "Our signature 590 Coffee, handcrafted iced espresso blends, and chilled coffee favorites.": "កាហ្វេ 590 ប្រចាំហាងរបស់យើង ភេសជ្ជៈកាហ្វេទឹកកកធ្វើដោយដៃ និងភេសជ្ជៈកាហ្វេពេញនិយម។",
    "Premium Cambodian beer brewed with European hops, crisp & cold.": "ស្រាបៀ កម្ពុជា គុណភាពខ្ពស់ ផលិតតាមស្តង់ដារអឺរ៉ុប ត្រជាក់ស្រស់ស្រាយ។",
    "Premium Cambodian lager beer brewed with European hops, crisp & cold.": "ស្រាបៀ កម្ពុជា គុណភាពខ្ពស់ ផលិតតាមស្តង់ដារអឺរ៉ុប ត្រជាក់ស្រស់ស្រាយ។",
    "Premium Cambodian beer brewed with fine European standard hops, crisp and refreshing with a smooth finish.": "ស្រាបៀ កម្ពុជា គុណភាពខ្ពស់ ផលិតតាមស្តង់ដារអឺរ៉ុប ត្រជាក់ស្រស់ស្រាយ។",
    "View All": "មើលទាំងអស់",
    "Browse collection": "ស្វែងរកប្រភេទ",
    "Browse Collection": "ស្វែងរកប្រភេទ",
    "Explore Category": "ស្វែងរកប្រភេទ",
    "Explore category": "ស្វែងរកប្រភេទ",
    "View products": "មើលផលិតផល",
    "Show More": "បង្ហាញបន្ថែម",
    "Show Less": "បង្ហាញតិចជាង",
    items: "មុខ",
    "Sort by:": "តម្រៀបតាម:",
    Newest: "ថ្មីៗ",
    "Price: Low to High": "តម្លៃ: ទាប ទៅ ខ្ពស់",
    "Price: High to Low": "តម្លៃ: ខ្ពស់ ទៅ ទាប",
    "Name: A-Z": "ឈ្មោះ: A-Z",
    "Our Full Menu": "ម៉ឺនុយពេញលេញរបស់យើង",
    "Handcrafted beverages & bites, made to order just for you.": "ភេសជ្ជៈ និងអាហារសម្រន់ធ្វើដោយដៃ ធ្វើឡើងភ្លាមៗសម្រាប់អ្នក។",
    "Sleek horizontal coffee cards customized for mobile phone screens.": "កាតកាហ្វេសម្រាប់ទូរស័ព្ទដៃ។",
    "Search...": "ស្វែងរក...",
    "Search product...": "ស្វែងរកផលិតផល...",
    Search: "ស្វែងរក",
    "No items found in this category.": "មិនមានមុខទំនិញក្នុងប្រភេទទំនិញនេះទេ។",
    "No products available in this category.": "មិនមានផលិតផលក្នុងប្រភេទទំនិញនេះទេ។",
    "Packaging Option:": "ជម្រើសវេចខ្ចប់:",
    "Can": "កំប៉ុង",
    "Bottle": "ដប",
    "Carton": "កេស",
    "Can ($0.75)": "កំប៉ុង ($0.75)",
    "Bottle ($1.25)": "ដប ($1.25)",
    "Carton ($28.00)": "កេស ($28.00)",
    "1000ml": "1000ml",
    "1500ml": "1500ml",
    "1000ml Bottle": "ដប 1000ml",
    "1500ml Bottle": "ដប 1500ml",
    "VIEW FULL DETAILS": "មើលព័ត៌មានលម្អិតពេញលេញ",
    "View Full Details": "មើលព័ត៌មានលម្អិតពេញលេញ",
    "Product Detail": "ព័ត៌មានលម្អិតនៃផលិតផល",
    Products: "ផលិតផល",
    Price: "តម្លៃ",
    "Add to Cart": "កុម្ម៉ង់",
    "បន្ថែមទៅកន្ត្រក": "កុម្ម៉ង់",
    "Buy Now": "ទិញឥឡូវនេះ",
    "Added ✓": "បានបន្ថែម ✓",
    "ADDED ✓": "បានបន្ថែម ✓",
    "+ ADD": "+ កុម្ម៉ង់",
    "បន្ថែម": "កុម្ម៉ង់",
    "+ បន្ថែម": "+ កុម្ម៉ង់",
    "Main Store": "ទីតាំងផ្ទាល់",
    "Toul Kork, Phnom Penh": "ទួលគោក, ភ្នំពេញ",
    "590st CAFE Main Store": "ទីតាំងផ្ទាល់របស់ ហាងកាហ្វេ 590st CAFE",
    "ហាងកាហ្វេ 590st CAFE ទីតាំងផ្ទាល់": "ទីតាំងផ្ទាល់របស់ ហាងកាហ្វេ 590st CAFE",
    "ទីស្នាក់ការកណ្តាល": "ទីតាំងផ្ទាល់",
    "ទីស្នាក់ការកណ្ដាល": "ទីតាំងផ្ទាល់",
    "Visit us to experience freshly crafted coffee, delicious beverages, and a cozy atmosphere perfect for relaxation, meeting friends, or working.": "អញ្ជើញមកកាន់ហាងយើងខ្ញុំដើម្បីរីករាយជាមួយកាហ្វេឆ្ងាញ់ៗ ភេសជ្ជៈ និងបរិយាកាសកក់ក្តៅ។",
    Address: "អាសយដ្ឋាន",
    "House No. 30A, Street 590, Toul Kork District, Phnom Penh 12101, Cambodia": "ផ្ទះលេខ 30A ផ្លូវ 590 ខណ្ឌទួលគោក រាជធានីភ្នំពេញ ១២១០១ កម្ពុជា",
    "Opening Hours": "ម៉ោងបើកបរិភោគ",
    "Monday - Sunday: 7:00 AM - 3:00 PM": "ច័ន្ទ - អាទិត្យ: ៧:០០ ព្រឹក - ៣:០០ រសៀល",
    "Contact Number": "លេខទូរស័ព្ទទាក់ទង",
    "View on Google Maps": "មើលលើ Google Maps",
    "Explore Our Menu": "ស្វែងរកម៉ឺនុយរបស់យើង",
    "Get in Touch Directly": "ទាក់ទងមកពួកយើងដោយផ្ទាល់",
    "Whether you want to place a custom order, ask about catering, or just say hello, we are always happy to connect!": "មិនថាអ្នកចង់កុម្ម៉ង់ ធ្វើការសាកសួរ ឬផ្តល់មតិយោបល់ ពួកយើងរីករាយស្វាគមន៍ជានិច្ច!",
    "Shopping Cart": "ទំនិញបានកុម៉្មង់",
    "កន្ត្រកទំនិញ": "ទំនិញបានកុម៉្មង់",
    "Your cart is empty": "កន្ត្រករបស់អ្នកទទេ",
    "Subtotal:": "សរុប:",
    "View Cart": "មើលការកុម្ម៉ង់",
    "មើលកន្ត្រក": "មើលការកុម្ម៉ង់",
    Checkout: "ទូទាត់ប្រាក់",
    "Drink Size:": "ទំហំភេសជ្ជៈ:",
    "Bottle Size:": "ទំហំដប:",
    "Portion Size:": "ទំហំចំណែក:",
    "Single Portion": "ធម្មតា",
    "Double Portion": "ឌុប ឬ X2",
    "1 Portion": "ធម្មតា",
    "Single (1)": "ធម្មតា (1)",
    "Single": "ធម្មតា",
    "Double": "ឌុប",
    "ផ្នែកតែមួយ": "ធម្មតា",
    "ផ្នែកទ្វេ": "ឌុប ឬ X2",
    "នៅលីវ": "ធម្មតា",
    "នៅលីវ (1)": "ធម្មតា (1)",
    Small: "តូច",
    Medium: "មធ្យម",
    Large: "ធំ",
    "S (Small)": "S (តូច)",
    "M (Medium)": "M (មធ្យម)",
    "L (Large)": "L (ធំ)",
    "Ice Level:": "កម្រិតទឹកកក:",
    "Sugar Level:": "កម្រិតស្ករ:",
    "Milk Type:": "ប្រភេទទឹកដោះគោ:",
    Normal: "ធម្មតា",
    Less: "តិច",
    "No Ice": "គ្មានទឹកកក",
    Extra: "បន្ថែម",
    "Fresh": "ស្រស់",
    Oat: "អូត",
    Almond: "អាល់ម៉ុង",
    Condensed: "ខាប់",
    "No Milk": "គ្មានទឹកដោះគោ",
    // Cart / Order Page
    "Your shopping cart is empty.": "កន្ត្រកទំនិញរបស់អ្នកទទេ",
    "Explore Menu & Add Drinks": "ស្វែងរកម៉ឺនុយ & បន្ថែមភេសជ្ជៈ",
    Product: "ផលិតផល",
    Quantity: "ចំនួន",
    Size: "ទំហំ",
    Total: "សរុប",
    "Total:": "សរុប:",
    "(Delivery Fee Not Included)": "(មិនរាប់បញ្ចូលថ្លៃដឹកជញ្ជូន)",
    "Continue Shopping": "បន្តការទិញទំនិញ",
    "Proceed to Checkout": "បន្តទៅការទូទាត់",
    "Milk:": "ទឹកដោះគោ:",

    // Checkout Page
    "Shipping Information": "ព័ត៌មានដឹកជញ្ជូន",
    "Full Name": "ឈ្មោះពេញ",
    "Email Address": "អាសយដ្ឋានអ៊ីមែល",
    "Phone Number": "លេខទូរស័ព្ទ",
    "Delivery Address": "អាសយដ្ឋានដឹកជញ្ជូន",
    "Capital / City": "រាជធានី / ក្រុង",
    District: "ខណ្ឌ / ស្រុក",
    "Select District": "ជ្រើសរើសខណ្ឌ",
    "Phnom Penh": "ភ្នំពេញ",
    "Order Summary": "សង្ខេបការបញ្ជាទិញ",
    "Delivery Method": "វិធីសាស្ត្រដឹកជញ្ជូន",
    "Pickup at Store": "មកយកនៅហាង",
    "Home Delivery": "ដឹកជញ្ជូនដល់ផ្ទះ",
    "Payment Method": "វិធីសាស្ត្រទូទាត់ប្រាក់",
    "ABA Pay / KHQR": "ABA Pay / KHQR",
    "Cash on Delivery": "ទូទាត់ប្រាក់ពេលទំនិញមកដល់",
    "Place Order": "បញ្ជាទិញឥឡូវនេះ",
    "Confirm Order": "បញ្ជាក់ការបញ្ជាទិញ",
    "Select Payment Method": "ជ្រើសរើសវិធីសាស្ត្រទូទាត់ប្រាក់",

    // Checkout Done / Order Confirmation
    "Order Successful!": "ការបញ្ជាទិញជោគជ័យ!",
    "Thank you for your order. We are preparing it for you.": "សូមអរគុណសម្រាប់ការបញ្ជាទិញ។ ពួកយើងកំពុងរៀបចំជូនអ្នក។",
    "Order ID:": "លេខសម្គាល់ការបញ្ជាទិញ:",
    "Order Date:": "កាលបរិច្ឆេទបញ្ជាទិញ:",
    "Call Staff": "ហៅបុគ្គលិក",
    "Staff has been called!": "បានហៅបុគ្គលិករួចរាល់!",
    "Back to Home": "ត្រឡប់ទៅទំព័រដើម",
    "View Order History": "មើលប្រវត្តិបញ្ជាទិញ",

    // Profile & Order History
    "User Profile": "ព័ត៌មានគណនី",
    "Personal Info": "ព័ត៌មានផ្ទាល់ខ្លួន",
    "Edit Profile": "កែប្រែព័ត៌មាន",
    "Save Changes": "រក្សាទុកការផ្លាស់ប្តូរ",
    "Change Password": "ផ្លាស់ប្តូរពាក្យសម្ងាត់",
    "Edit Photo": "កែរូបថត",
    About: "អំពី",
    "My Messages": "សាររបស់ខ្ញុំ",
    "User Id": "លេខសម្គាល់គណនី",
    "Current Password": "ពាក្យសម្ងាត់បច្ចុប្បន្ន",
    "New Password": "ពាក្យសម្ងាត់ថ្មី",
    "Confirm Password": "បញ្ជាក់ពាក្យសម្ងាត់",
    "Verify Password": "ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់",
    "Confirm Logout": "បញ្ជាក់ការចាកចេញ",
    "Are you sure you want to log out?": "តើអ្នកប្រាកដជាចង់ចាកចេញពីគណនីឬ?",
    Logout: "ចាកចេញ",
    "Order History": "ប្រវត្តិបញ្ជាទិញ",
    "No orders yet.": "មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ។",
    Reorder: "កុម្ម៉ង់ម្តងទៀត",
    // Login / Sign Up / Forgot Password
    "Login to your account": "ចូលទៅកាន់គណនីរបស់អ្នក",
    "Enter your credential to login": "បញ្ចូលព័ត៌មានរបស់អ្នកដើម្បីចូល",
    Username: "ឈ្មោះអ្នកប្រើប្រាស់",
    Password: "ពាក្យសម្ងាត់",
    "Keep me logged in": "ចងចាំការចូលគណនី",
    "Forgot password?": "ភ្លេចពាក្យសម្ងាត់?",
    "Don't have an account?": "មិនទាន់មានគណនីមែនទេ?",
    "Sign up": "ចុះឈ្មោះ",
    "Log in": "ចូលឈ្មោះ",
    "Sign Up": "ចុះឈ្មោះ",
    "Create an account": "បង្កើតគណនីថ្មី",
    "Enter your details below to create your account": "បញ្ចូលព័ត៌មានខាងក្រោមដើម្បីបង្កើតគណនី",
    "Already have an account?": "មានគណនីរួចហើយមែនទេ?",
    Gender: "ភេទ",
    Male: "ប្រុស",
    Female: "ស្រី",
    Other: "ផ្សេងៗ",
    "Forgot Password?": "ភ្លេចពាក្យសម្ងាត់?",
    "Enter your email address and we'll send you instructions to reset your password.": "បញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នកដើម្បីទទួលបានការណែនាំកំណត់ពាក្យសម្ងាត់ឡើងវិញ។",
    "Send Reset Link": "ផ្ញើតំណកំណត់ពាក្យសម្ងាត់",
    "Back to Login": "ត្រឡប់ទៅការចូលឈ្មោះ",
    // Order Details & Checkout Done
    "Order Progress Status": "ស្ថានភាពដំណើរការបញ្ជាទិញ",
    Confirmed: "បានបញ្ជាក់",
    Preparing: "កំពុងរៀបចំ",
    "Ready!": "រួចរាល់!",
    Ready: "រួចរាល់",
    Delivered: "បានដឹកជញ្ជូន",
    Delivering: "កំពុងដឹកជញ្ជូន",
    "Order details": "ព័ត៌មានលម្អិតនៃការបញ្ជាទិញ",
    "See complete details for your order": "មើលព័ត៌មានលម្អិតពេញលេញសម្រាប់ការបញ្ជាទិញរបស់អ្នក",
    "Customer:": "អតិថិជន:",
    "Payment type:": "វិធីសាស្ត្រទូទាត់:",
    "Location:": "ទីតាំង:",
    "Estimated time:": "ពេលវេលាប៉ាន់ស្មាន:",
    "Grand total:": "សរុបរួម:",
    "Staff Notified": "បានជូនដំណឹងដល់បុគ្គលិក",
    "Back to Menu": "ត្រឡប់ទៅម៉ឺនុយ",
    "A staff member has been requested and will assist you shortly.": "បុគ្គលិកត្រូវបានជូនដំណឹង ហើយនឹងមកជួយអ្នកក្នុងពេលឆាប់ៗនេះ។",
    "Got it": "យល់ព្រម",
  },
};

export const translations = staticTranslations;

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [autoTranslations, setAutoTranslations] = useState<Record<string, string>>({});
  const pendingQueue = useRef<Set<string>>(new Set());
  const isBatchProcessing = useRef<boolean>(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("app_language") as Language;
    if (savedLang === "en" || savedLang === "km") {
      setLanguageState(savedLang);
    }
    try {
      const cached = localStorage.getItem("auto_translations_km");
      if (cached) {
        setAutoTranslations(JSON.parse(cached));
      }
    } catch (e) {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_language", lang);
    }
  };

  const processBatchQueue = useCallback(async () => {
    if (isBatchProcessing.current || pendingQueue.current.size === 0) return;
    isBatchProcessing.current = true;

    const keysToTranslate = Array.from(pendingQueue.current);
    pendingQueue.current.clear();

    const newTranslations: Record<string, string> = {};

    for (const text of keysToTranslate) {
      if (!text || text.length > 500) continue;
      try {
        const res = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=km&dt=t&q=${encodeURIComponent(
            text
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && Array.isArray(data[0])) {
            let translatedText = (data[0] as Array<[string]>).map((item) => item?.[0] || "").join("");
            if (translatedText) {
              if (!text.endsWith(".")) {
                translatedText = translatedText.replace(/[\.។]+$/, "").trim();
              }
              newTranslations[text] = translatedText;
              newTranslations[text.trim()] = translatedText;
            }
          }
        }
      } catch (e) {
        try {
          const res2 = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|km`
          );
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2?.responseData?.translatedText) {
              let translatedText = data2.responseData.translatedText;
              if (!text.endsWith(".")) {
                translatedText = translatedText.replace(/[\.។]+$/, "").trim();
              }
              newTranslations[text] = translatedText;
              newTranslations[text.trim()] = translatedText;
            }
          }
        } catch (err) {}
      }
    }

    isBatchProcessing.current = false;

    if (Object.keys(newTranslations).length > 0) {
      setAutoTranslations((prev) => {
        const updated = { ...prev, ...newTranslations };
        try {
          localStorage.setItem("auto_translations_km", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  }, []);

  useEffect(() => {
    if (language === "km" && pendingQueue.current.size > 0) {
      const timer = setTimeout(() => {
        processBatchQueue();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [language, autoTranslations, processBatchQueue]);

  const t = useCallback(
    (key: string): string => {
      if (!key) return "";
      if (language === "en") return key;

      const trimmedKey = key.trim();
      const upperKey = trimmedKey.toUpperCase();

      // Force size codes S, M, L to always remain in English
      if (upperKey === "S" || upperKey === "M" || upperKey === "L") {
        return upperKey;
      }

      const lowerKey = trimmedKey.toLowerCase();

      // 1. Static Dictionary Exact match
      if (staticTranslations.km[trimmedKey]) return staticTranslations.km[trimmedKey];
      if (staticTranslations.km[key]) return staticTranslations.km[key];

      // 2. Case-insensitive dictionary match
      const staticKeys = Object.keys(staticTranslations.km);
      const foundStaticKey = staticKeys.find((k) => k.toLowerCase() === lowerKey);
      if (foundStaticKey) return staticTranslations.km[foundStaticKey];

      // 3. Smart Pattern Matching for dynamic product options (Size: M, Quantity: 2, Ice: Normal, etc.)
      if (trimmedKey.startsWith("Size:")) {
        const val = trimmedKey.replace("Size:", "").trim();
        return `ទំហំ: ${val}`;
      }
      if (trimmedKey.startsWith("Quantity:")) {
        const val = trimmedKey.replace("Quantity:", "").trim();
        return `ចំនួន: ${val}`;
      }
      if (trimmedKey.startsWith("Ice:")) {
        const val = trimmedKey.replace("Ice:", "").trim();
        const translatedVal = staticTranslations.km[val] || autoTranslations[val] || val;
        return `ទឹកកក: ${translatedVal}`;
      }
      if (trimmedKey.startsWith("Sugar:")) {
        const val = trimmedKey.replace("Sugar:", "").trim();
        const translatedVal = staticTranslations.km[val] || autoTranslations[val] || val;
        return `ស្ករ: ${translatedVal}`;
      }
      if (trimmedKey.startsWith("Milk:")) {
        const val = trimmedKey.replace("Milk:", "").trim();
        const translatedVal = staticTranslations.km[val] || autoTranslations[val] || val;
        return `ទឹកដោះគោ: ${translatedVal}`;
      }

      // 4. Cached Auto-translation match
      if (autoTranslations[trimmedKey]) return autoTranslations[trimmedKey];
      if (autoTranslations[key]) return autoTranslations[key];

      // 5. Queue untranslated keys for background batch auto-translation
      if (typeof window !== "undefined" && language === "km") {
        pendingQueue.current.add(key);
      }

      return key;
    },
    [language, autoTranslations]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: (key: string) => key,
    };
  }
  return context;
}

export default LanguageProvider;
