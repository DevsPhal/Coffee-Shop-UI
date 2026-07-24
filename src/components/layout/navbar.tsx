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

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Drinks", href: "/drinks" },
  { label: "Location", href: "/location" },
  { label: "Contact Us", href: "/contact" },
];

const languages = [
  { code: "en", label: "English", flag: "/images/english.svg" },
  { code: "km", label: "ខ្មែរ", flag: "/images/cambodia.svg" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const { openCart, totalCount } = useCart();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="navbar_header">
      <nav className="navbar_container">
        <Link href="/" className="shrink-0" onClick={() => setMobileMenuOpen(false)}>
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
            onClick={() => {
              openCart();
              setMobileMenuOpen(false);
            }}
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

          <Link href="/login" className="hidden sm:inline-flex" onClick={() => setMobileMenuOpen(false)}>
            <Button className="button_nav_login">Login</Button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((open) => !open);
            }}
            className="nav_mobile_toggle_btn md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="nav_mobile_menu md:hidden">
          <ul className="nav_mobile_list">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`nav_mobile_link ${isActive(href) ? "active" : ""}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="nav_mobile_footer sm:hidden">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="button_nav_login w-full">Login</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
