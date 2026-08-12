"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "km";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const translations: Record<Language, Record<string, string>> = {
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
    "30a St 590, Phnom Penh 12101, Khan Toul Kork, Phnom Penh Cambodia.": "៣០a ផ្លូវ៥៩០, រាជធានីភ្នំពេញ​​ ១២១០១, ខណ្ឌទួលគោក, រាជធានីភ្នំពេញ កម្ពុជា។",
    "30a St 590, Phnom Penh 12101, Khan Toul Kork, Phnom Penh Cambodia": "30a ផ្លូវ 590, រាជធានីភ្នំពេញ 12101, ខណ្ឌទួលគោក, រាជធានីភ្នំពេញ កម្ពុជា។",
    "© 2026 — Copyright": "© 2026 — រក្សាសិទ្ធិគ្រប់យ៉ាង",
    English: "English",
    Khmer: "ខ្មែរ",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("app_language") as Language;
    if (savedLang === "en" || savedLang === "km") {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_language", lang);
    }
  };

  const t = (key: string): string => {
    if (!key) return "";
    const trimmedKey = key.trim();
    const lowerKey = trimmedKey.toLowerCase();
    return (
      translations[language]?.[trimmedKey] ||
      translations[language]?.[key] ||
      translations[language]?.[lowerKey] ||
      key
    );
  };

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
