"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import "@/app/globals.scss";

export function AboutpageView() {
  return (
    <div className="product_detail_container font-khmer">
      {/* Header & Breadcrumb Section */}
      <div className="product_detail_header">
        <h1 className="product_detail_title font-sans">About Us</h1>

        <nav className="product_detail_breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb_link font-sans">
            Home
          </Link>
          <span className="breadcrumb_separator font-sans">»</span>
          <span className="breadcrumb_current font-sans">ABOUT US</span>
        </nav>
      </div>

      {/* Main 2-Column About Layout */}
      <div className="about_page_grid">
        {/* Left Column: Image Box */}
        <div className="about_page_image_box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/590st%20cafe.jpg"
            alt="590st Cafe"
            className="w-full h-full object-cover object-center about_page_image"
          />
        </div>

        {/* Right Column: Information & Story */}
        <div className="about_page_content">
          <p className="about_page_description">
            <span>590st CAFE</span> was founded by Mr. Ith Chanti on February 17, 2025, with an address at House No. 30A, Street 590, Toul Kork District, Phnom Penh, and is legally registered with the Ministry of Commerce. The shop operates with the principle of honesty, no cheating or supplying poor quality products to customers. Cafe 590 ST offers a variety of drinks and food, such as hot and cold coffee, tea, fruit juices and snacks, with high quality and reasonable prices to meet the needs of customers of all ages. The shop also pays attention to hygiene, selection of raw materials and services to ensure a good experience for customers. The shop has an atmosphere suitable for relaxing, meeting friends and working, with supporting facilities such as free Wi-Fi and comfortable seating. The shop also always offers promotions and special programs to attract new customers and retain old customers.
          </p>

          <div className="about_page_actions">
            <Link href="/menu">
              <Button className="button_pill_primary cursor-pointer">
                Explore Menu
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="button_pill_secondary cursor-pointer">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutpageView;
