"use client";

import Image from "next/image";
import { BrandLogo } from "@/components/common/BrandLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, Send } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useMounted } from "@/hooks/useMounted";
import "@/app/globals.scss";

const infoLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Events", href: "/events" },
  { label: "Location", href: "/location" },
  { label: "Contact Us", href: "/contact" },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/", icon: "/icons/instagram.svg" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61573086337988", icon: "/icons/facebook.svg" },
  { label: "TikTok", href: "https://www.tiktok.com/en/", icon: "/icons/tiktok.svg" },
];

export function Footer() {
  const mounted = useMounted();
  const pathname = usePathname();
  const { t } = useLanguage();

  const displayT = (key: string) => (mounted ? t(key) : key);

  if (pathname === "/payment" || pathname?.startsWith("/payment")) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <footer className="footer_wrapper font-sans">
      <div className="footer_container">
        <div className="footer_top_row">
          <div className="footer_address_box">
            <span className="footer_logo_link">
              <BrandLogo className="h-12" />
            </span>
            <p className="footer_address_text">
              {displayT("30a St 590, Phnom Penh 12101, Khan Toul Kork, Phnom Penh Cambodia.")}
            </p>
          </div>

          <div className="footer_links_grid">
            <div>
              <h3 className="footer_column_title">
                {displayT("Info")}
              </h3>
              <ul className="footer_list">
                {infoLinks.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`footer_link ${isActive(href) ? "active" : ""}`}
                    >
                      {displayT(label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="footer_column_title">
                {displayT("Contact for Service")}
              </h3>
              <ul className="footer_list">
                <li>
                  <a
                    href="tg://resolve?domain=069 955 878"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer_link footer_link_icon"
                  >
                    <Send className="footer_link_icon_glyph" />
                    069 955 878
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="footer_column_title">
                {displayT("Contact for Partner")}
              </h3>

              <ul className="footer_list">
                <li>
                  <a href="tel:+85595600676" className="footer_link footer_link_icon">
                    <Phone className="footer_link_icon_glyph" />
                    095 600 676
                  </a>
                </li>
                <li>
                  <a href="tel:+85569955878" className="footer_link footer_link_icon">
                    <Phone className="footer_link_icon_glyph" />
                    069 955 878
                  </a>
                </li>
                <li>
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=lengsokpunlork611@gmail.com"
                    className="footer_link footer_link_icon footer_email_link"
                  >
                    <Mail className="footer_link_icon_glyph" />
                    lengsokpunlork611@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer_bottom_row">
          <p className="footer_copyright_text" suppressHydrationWarning>{displayT("copyright-© 2026 590stcafe.shop")}</p>

          <div className="footer_social_links">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="footer_social_item"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image src={icon} alt={label} width={20} height={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
