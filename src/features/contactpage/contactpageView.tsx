"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Send, ExternalLink, Coffee, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactForm from "./components/ContactForm";
import "@/app/globals.scss";

export function ContactpageView() {
  const googleMapUrl = "https://maps.app.goo.gl/DKbvJw3Hz2tsCriQA?g_st=it";

  return (
    <div className="product_detail_container font-sans">
      {/* Header & Breadcrumbs matching Location & Product Detail style */}
      <div className="product_detail_header">
        <h1 className="product_detail_title">Contact Us</h1>
        <nav className="product_detail_breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb_link">
            Home
          </Link>
          <span className="breadcrumb_separator">»</span>
          <span className="breadcrumb_current">Contact Us</span>
        </nav>
      </div>

      {/* Main Grid Layout */}
      <div className="contact_page_grid">
        {/* Left Column: Interactive Contact Form */}
        <div>
          <ContactForm />
        </div>

        {/* Right Column: Store Contact Details Card */}
        <div className="contact_page_info_card">
          <div>
            <div className="contact_info_badge">
              <Coffee className="w-3.5 h-3.5 mr-1" /> 590st CAFE
            </div>
            <h2 className="contact_info_title">Get in Touch Directly</h2>
            <p className="contact_info_desc">
              Whether you want to place a custom order, ask about catering, or just say hello, we are always happy to connect!
            </p>
          </div>

          <div className="contact_info_group">
            {/* Address */}
            <div className="contact_info_item">
              <div className="contact_info_icon">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="contact_info_label">Address</h4>
                <p className="contact_info_value">
                  House No. 30A, Street 590, Toul Kork District, Phnom Penh 12101, Cambodia
                </p>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="contact_info_item">
              <div className="contact_info_icon">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="contact_info_label">Opening Hours</h4>
                <p className="contact_info_value">Monday - Sunday: 7:00 AM - 11:00 PM</p>
              </div>
            </div>

            {/* Phone */}
            <div className="contact_info_item">
              <div className="contact_info_icon">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="contact_info_label">Contact Number</h4>
                <p className="contact_info_value">
                  <a href="tel:095600676">095 600 676</a> / <a href="tel:069955878">069 955 878</a>
                </p>
              </div>
            </div>

            {/* Telegram */}
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

            {/* Email */}
            <div className="contact_info_item">
              <div className="contact_info_icon">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="contact_info_label">Email</h4>
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
            <Link href="/menu" className="explore_menu_link">
              <Button className="button_explore_menu">
                Explore Our Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactpageView;
