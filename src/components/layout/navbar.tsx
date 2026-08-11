"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import "@/app/globals.scss";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, Language } from "@/components/ui/translatetokhmer";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Events", href: "/events" },
  { label: "Location", href: "/location" },
  { label: "Contact Us", href: "/contact" },
];

const languages = [
  { code: "en", label: "English", flag: "/images/english.svg" },
  { code: "km", label: "ខ្មែរ", flag: "/images/cambodia.svg" },
];

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const selectedLanguage = languages.find((l) => l.code === language) || languages[0];
  const { openCart, totalCount } = useCart();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const mobileNavItems = [
    { key: "Home", href: "/", icon: "/icons/home.svg" },
    { key: "Menu", href: "/menuphone", icon: "/icons/menu.svg" },
    { key: "Events", href: "/events", icon: "/icons/event.svg" },
    { key: "Location", href: "/location", icon: "/icons/location.svg" },
    { key: "Contact", href: "/contact", icon: "/icons/contact.svg" },
    {
      key: isLoggedIn ? "Profile" : "Login",
      href: isLoggedIn ? "/userprofile" : "/login",
      icon: isLoggedIn ? "/icons/user.svg" : "/icons/login.svg",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isMobileNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/menuphone") return pathname === "/menuphone" || pathname === "/menu" || pathname.startsWith("/product");
    if (href === "/events") return pathname.startsWith("/events") || pathname.startsWith("/event");
    if (href === "/userprofile" || href === "/login") return pathname.startsWith("/userprofile") || pathname.startsWith("/profile") || pathname.startsWith("/login");
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Header Navbar */}
      <header className="navbar_header">
        <nav className="navbar_container">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/Logo.svg"
              alt="590st CAFE"
              width={66}
              height={48}
              priority
            />
          </Link>

          <ul className="navbar_links">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`nav_link ${isActive(href) ? "active" : ""}`}
                >
                  {t(label)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            {/* Language Switcher Dropdown */}
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen((prev) => !prev)}
                className="nav_lang_btn flex items-center gap-2 cursor-pointer border border-gray-200 rounded-lg px-2 py-1 bg-white hover:bg-gray-50 transition-colors"
                aria-label="Select language"
              >
                <Image
                  src={selectedLanguage.flag}
                  alt={selectedLanguage.label}
                  width={24}
                  height={16}
                  className="h-5 w-5 rounded-lg object-cover"
                />
                <ChevronDown className={`h-3 w-3 text-gray-700 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 min-w-[130px] rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/10 z-50 animate-in fade-in-0 zoom-in-95">
                  {languages.map((languageItem) => (
                    <button
                      key={languageItem.code}
                      type="button"
                      onClick={() => {
                        setLanguage(languageItem.code as Language);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer text-left ${
                        language === languageItem.code
                          ? "bg-gray-100 font-semibold text-primary"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <Image
                        src={languageItem.flag}
                        alt={languageItem.label}
                        width={24}
                        height={16}
                        className="h-5 w-5 rounded-lg object-cover shrink-0"
                      />
                      <span>{languageItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => openCart()}
              className="nav_cart_link cursor-pointer border-none bg-transparent"
              aria-label="Open cart"
            >
              <span className="relative">
                <Image
                  src="/icons/shoppingcart.svg"
                  alt=""
                  width={21}
                  height={22}
                  aria-hidden
                />
                <span className="nav_cart_badge">{totalCount}</span>
              </span>
            </button>

            {/* Login / User Profile Button */}
            {isLoggedIn ? (
              <Link
                href="/userprofile"
                className="hidden sm:inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="User Profile"
              >
                <Image
                  src="/icons/user.svg"
                  alt="User Profile"
                  width={24}
                  height={24}
                  unoptimized
                  className="w-6 h-6 object-contain"
                />
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:inline-flex">
                <Button className="button_nav_login flex items-center gap-2">
                  <Image
                    src="/icons/login.svg"
                    alt="Login"
                    width={18}
                    height={18}
                    unoptimized
                    className="brightness-0 invert"
                  />
                  <span>{t("Login")}</span>
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Fixed Bottom Icon Navigation Bar for Phone Size (md:hidden) including Events & Login */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-2 px-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {mobileNavItems.map((item) => {
            const active = isMobileNavActive(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center justify-center p-2.5 rounded-full transition-all duration-200 ${
                  active ? "bg-[#A1255B]/15 scale-110" : "hover:bg-gray-100"
                }`}
              >
                <div className="icon-wrapper flex items-center justify-center">
                  <Image
                    src={item.icon}
                    alt={t(item.key)}
                    width={24}
                    height={24}
                    unoptimized
                    className={`nav-icon transition-all duration-200 ${
                      active ? "active-mobile-icon" : "opacity-60 hover:opacity-100"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Navbar;
