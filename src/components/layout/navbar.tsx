"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "@/app/globals.scss";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

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
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const { openCart, totalCount } = useCart();
  const { isLoggedIn } = useAuth();

  const mobileNavItems = [
    { label: "Home", href: "/", icon: "/icons/home.svg" },
    { label: "Menu", href: "/menu", icon: "/icons/menu.svg" },
    { label: "Events", href: "/events", icon: "/icons/event.svg" },
    { label: "Location", href: "/location", icon: "/icons/location.svg" },
    { label: "Contact", href: "/contact", icon: "/icons/contact.svg" },
    {
      label: isLoggedIn ? "Profile" : "Login",
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
    if (href === "/menu") return pathname === "/menu";
    if (href === "/events") return pathname.startsWith("/events") || pathname.startsWith("/event");
    if (href === "/userprofile") return pathname === "/userprofile";
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
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="nav_lang_btn flex items-center gap-2"
                    aria-label="Select language"
                  >
                    <Image
                      src={selectedLanguage.flag}
                      alt={selectedLanguage.label}
                      width={24}
                      height={16}
                      className="h-5 w-5 rounded-lg object-cover"
                    />
                    <ChevronDown className="h-3 w-3 text-gray-700" />
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-[130px]">
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => setSelectedLanguage(language)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Image
                      src={language.flag}
                      alt={language.label}
                      width={24}
                      height={16}
                      className="h-5 w-5 rounded-lg object-cover"
                    />
                    <span>{language.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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
                  <span>Login</span>
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
                key={item.label}
                href={item.href}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <div className="icon-wrapper">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={22}
                    height={22}
                    unoptimized
                    className={`nav-icon ${active ? "active" : ""}`}
                  />
                </div>
                <span className="nav-label">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Navbar;
