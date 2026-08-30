"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Mail, Clock, Send, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/ui/translatetokhmer";
import ContactForm from "./components/ContactForm";
import "@/app/globals.scss";

export function ContactpageView() {
  const router = useRouter();
  const { t } = useLanguage();
  const googleMapUrl = "https://maps.app.goo.gl/DKbvJw3Hz2tsCriQA?g_st=it";
  const [menuHref, setMenuHref] = useState("/menu");

  useEffect(() => {
    const updateHref = () => {
      if (window.innerWidth < 768) {
        setMenuHref("/menuphone");
      } else {
        setMenuHref("/menu");
      }
    };
    updateHref();
    window.addEventListener("resize", updateHref);
    return () => window.removeEventListener("resize", updateHref);
  }, []);

  const handleExploreMenuClick = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) {
      e.preventDefault();
      router.push("/menuphone");
    }
  };

  return (
    <div className="contact_page_container font-sans">
      <div className="product_detail_header">
        <h1 className="product_detail_title">{t("Contact Us")}</h1>
        <nav className="product_detail_breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb_link">
            {t("Home")}
          </Link>
          <span className="breadcrumb_separator">»</span>
          <span className="breadcrumb_current">{t("Contact Us")}</span>
        </nav>
      </div>
      <div className="contact_page_grid">
        <div>
          <ContactForm />
        </div>
        <div className="contact_page_info_card">
          <div>
            <h2 className="contact_info_title">{t("Get in Touch Directly")}</h2>
            <p className="contact_info_desc">
              {t("Whether you want to place a custom order, ask about catering, or just say hello, we are always happy to connect!")}
            </p>
          </div>

          <div className="contact_info_group">
            <div className="contact_info_item">
              <div className="contact_info_icon">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="contact_info_label">{t("Address")}</h4>
                <p className="contact_info_value">
                  {t("House No. 30A, Street 590, Toul Kork District, Phnom Penh 12101, Cambodia")}
                </p>
              </div>
            </div>
            <div className="contact_info_item">
              <div className="contact_info_icon">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="contact_info_label">{t("Opening Hours")}</h4>
                <p className="contact_info_value">{t("Monday - Sunday: 7:00 AM - 3:00 PM")}</p>
              </div>
            </div>
            <div className="contact_info_item">
              <div className="contact_info_icon">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="contact_info_label">{t("Contact Number")}</h4>
                <p className="contact_info_value">
                  <a href="tel:095600676">095 600 676</a> / <a href="tel:069955878">069 955 878</a>
                </p>
              </div>
            </div>
            <div className="contact_info_item">
              <div className="contact_info_icon">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="contact_info_label">Telegram</h4>
                <a
                  href="tg://resolve?domain=069 955 878"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer_email_link"
                >
                  @069 955 878 
                </a>
              </div>
            </div>
            <div className="contact_info_item">
              <div className="contact_info_icon">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="contact_info_label">{t("Email")}</h4>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=lengsokpunlork611@gmail.com"
                  className="footer_email_link"
                >
                  lengsokpunlork611@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="action_row_border">
            <Link
              href={menuHref}
              onClick={handleExploreMenuClick}
              className="explore_menu_link"
            >
              <Button className="button_explore_menu">
                {t("Explore Our Menu")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactpageView;
