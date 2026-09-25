"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Home,
  UtensilsCrossed,
  LayoutGrid,
  CalendarDays,
  MapPin,
  Phone,
  User,
  LogIn,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "@/app/globals.scss";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, Language } from "@/components/ui/translatetokhmer";
import { useMounted } from "@/hooks/useMounted";
import { Skeleton } from "@/components/ui/states";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Category", href: "/category" },
  { label: "Events", href: "/events" },
  { label: "Location", href: "/location" },
  { label: "Contact Us", href: "/contact" },
];

const languages = [
  { code: "en", label: "English", flag: "/images/english.svg" },
  { code: "km", label: "ខ្មែរ", flag: "/images/cambodia.svg" },
];

export function Navbar() {
  const mounted = useMounted();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCategoryHovered, setIsCategoryHovered] = useState(false);
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const currentLangCode = mounted ? language : "en";
  const selectedLanguage = languages.find((l) => l.code === currentLangCode) || languages[0];
  const { openCart, totalCount } = useCart();
  const { status: authStatus } = useAuth();

  const userIsLoggedIn = authStatus === "signedIn";
  // Until the session is known, the account slot shows a neutral placeholder rather than
  // guessing — guessing "signed out" is what flashed a Login button at signed-in customers.
  const isCheckingAuth = authStatus === "checking";
  const displayTotalCount = mounted ? totalCount : 0;
  const displayT = (key: string) => (mounted ? t(key) : key);

  const handleCategoryMouseEnter = () => {
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    setIsCategoryHovered(true);
  };

  const handleCategoryMouseLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setIsCategoryHovered(false);
    }, 150);
  };

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

  if (pathname === "/payment" || pathname?.startsWith("/payment")) {
    return null;
  }

  const mobileNavItems: { key: string; href: string; icon: LucideIcon; pending?: boolean }[] = [
    { key: "Home", href: "/", icon: Home },
    { key: "Menu", href: "/menuphone", icon: UtensilsCrossed },
    { key: "Category", href: "/category", icon: LayoutGrid },
    { key: "Events", href: "/events", icon: CalendarDays },
    { key: "Location", href: "/location", icon: MapPin },
    { key: "Contact", href: "/contact", icon: Phone },
    {
      key: userIsLoggedIn ? "Profile" : "Login",
      href: userIsLoggedIn ? "/userprofile" : "/login",
      icon: userIsLoggedIn ? User : LogIn,
      pending: isCheckingAuth,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isMobileNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/menuphone") return pathname === "/menuphone" || pathname === "/menu" || pathname.startsWith("/product");
    if (href === "/category") return pathname.startsWith("/category");
    if (href === "/events") return pathname.startsWith("/events") || pathname.startsWith("/event");
    if (href === "/userprofile" || href === "/login") return pathname.startsWith("/userprofile") || pathname.startsWith("/profile") || pathname.startsWith("/login");
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Header Navbar */}
      <header className="navbar_header fixed top-0 left-0 right-0 z-[99999] w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <nav className="navbar_container w-full px-3 sm:px-6">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/Logo.svg"
              alt="590st CAFE"
              width={66}
              height={48}
              priority
              className="navbar_logo"
            />
          </Link>

          <ul className="navbar_links">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`nav_link ${isActive(href) ? "active" : ""}`}
                  suppressHydrationWarning
                >
                  {displayT(label)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0" suppressHydrationWarning>
            {/* Language Switcher Dropdown */}
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen((prev) => !prev)}
                className="nav_lang_btn flex items-center gap-1.5 cursor-pointer border border-gray-200 rounded-lg px-2 py-1 bg-white hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                aria-label="Select language"
              >
                <Image
                  src={selectedLanguage.flag}
                  alt={selectedLanguage.label}
                  width={20}
                  height={14}
                  className="h-4 w-4 sm:h-5 sm:w-5 rounded-lg object-cover"
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

            {/* Only shown once signed in — checkout requires an account anyway, so the cart
                icon has nothing to offer a logged-out visitor. */}
            {userIsLoggedIn && (
              <button
                type="button"
                onClick={() => openCart()}
                className="nav_cart_link cursor-pointer border-none bg-transparent shrink-0"
                aria-label="Open cart"
              >
                <span className="relative">
                  <ShoppingCart className="h-5.25 w-5.25 text-gray-700" aria-hidden />
                  <span className="nav_cart_badge" suppressHydrationWarning>{displayTotalCount}</span>
                </span>
              </button>
            )}

            {/* Login / User Profile Button */}
            {isCheckingAuth ? (
              <span className="nav_desktop_only items-center" aria-hidden>
                <Skeleton className="h-10 w-24 rounded-full" />
              </span>
            ) : userIsLoggedIn ? (
              <Link
                href="/userprofile"
                className="nav_desktop_only items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="User Profile"
              >
                <User className="h-6 w-6 text-gray-700" />
              </Link>
            ) : (
              <Link href="/login" className="nav_desktop_only">
                <Button className="button_nav_login flex items-center gap-2">
                  <LogIn className="h-4.5 w-4.5 text-white" />
                  <span>{displayT("Login")}</span>
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Fixed Bottom Icon Navigation Bar for Phone Size including Events & Login */}
      {!(
        pathname === "/checkoutdone" ||
        pathname === "/checkout-done" ||
        pathname === "/payment" ||
        pathname?.startsWith("/payment") ||
        pathname === "/checkout"
      ) && (
        <div className="mobile_nav_bottom_bar fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-2 px-1 w-full max-w-full overflow-x-hidden" suppressHydrationWarning>
          <div className="max-w-md mx-auto flex items-center justify-around gap_10">
            {mobileNavItems.map((item) => {
              const active = isMobileNavActive(item.href);
              const Icon = item.icon;

              if (item.pending) {
                return (
                  <span key="account" className="flex items-center justify-center p-2.5" aria-hidden>
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </span>
                );
              }

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center justify-center p-2.5 rounded-full transition-all duration-200 ${
                    active ? "bg-[#A1255B]/15 scale-110" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="icon-wrapper flex items-center justify-center">
                    <Icon
                      className={`nav-icon h-6 w-6 transition-all duration-200 ${
                        active ? "text-[#A1255B]" : "text-gray-500 opacity-60 hover:opacity-100"
                      }`}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
