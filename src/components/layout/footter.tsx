"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import "@/app/globals.scss";

const infoLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Drinks", href: "/drinks" },
  { label: "Location", href: "/location" },
  { label: "Contact Us", href: "/contact" },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/", icon: "/icons/instagram.svg" },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61573086337988",
    icon: "/icons/facebook.svg",
  },
  { label: "TikTok", href: "https://www.tiktok.com/en/", icon: "/icons/tiktok.svg" },
];

export function Footer() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <footer className="footer_wrapper font-sans">
      <div className="footer_container">
        <div className="footer_top_row">
          {/* Brand */}
          <div className="footer_brand">
            <Link href="/" className="footer_logo_link" aria-label="590st CAFE home">
              <Image src="/images/Logo.svg" alt="590st CAFE" width={66} height={48} />
            </Link>
            <p className="footer_address_text">
              <MapPin className="footer_address_icon" aria-hidden />
              <span>
                30a St 590, Phnom Penh 12101, Khan Toul Kork, Phnom Penh
                Cambodia.
              </span>
            </p>
          </div>

          {/* Explore — two columns on mobile so five links take three rows */}
          <nav className="footer_column footer_column_info" aria-label="Footer">
            <h3 className="footer_column_title">Explore</h3>
            <ul className="footer_link_grid">
              {infoLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`footer_link ${isActive(href) ? "active" : ""}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="footer_column">
            <h3 className="footer_column_title">Contact</h3>
            <ul className="footer_contact_list">
              <li>
                <a
                  href="https://t.me/+855699558789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer_contact_item"
                >
                  <Send className="footer_contact_icon" aria-hidden />
                  <span>
                    069 955 878
                    <small className="footer_contact_note">Telegram</small>
                  </span>
                </a>
              </li>
              <li>
                <a href="tel:+85595600676" className="footer_contact_item">
                  <Phone className="footer_contact_icon" aria-hidden />
                  <span>
                    095 600 676
                    <small className="footer_contact_note">Partners</small>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:lengsokpunlork611@gmail.com"
                  className="footer_contact_item"
                >
                  <Mail className="footer_contact_icon" aria-hidden />
                  <span className="footer_contact_email">
                    lengsokpunlork611@gmail.com
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer_bottom_row">
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
                <Image src={icon} alt="" width={18} height={18} />
              </a>
            ))}
          </div>

          <p className="footer_copyright_text">
            © 2026 590st CAFE · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
