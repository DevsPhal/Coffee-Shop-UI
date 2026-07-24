"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, ExternalLink, Navigation, Coffee } from "lucide-react";
import "@/app/globals.scss";

export function LocationpageView() {
  const googleMapUrl = "https://maps.app.goo.gl/DKbvJw3Hz2tsCriQA?g_st=it";

  return (
    <div className="product_detail_container font-sans">
      {/* Header & Breadcrumb */}
      <div className="product_detail_header">
        <h1 className="product_detail_title">Location</h1>
        <nav className="product_detail_breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb_link">
            Home
          </Link>
          <span className="breadcrumb_separator">»</span>
          <span className="breadcrumb_current">Location</span>
        </nav>
      </div>

      {/* Main Grid Layout using globals.scss classes */}
      <div className="location_page_grid">
        {/* Left Column: Store Image Box */}
        <div className="location_page_image_box group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/590st%20cafe.jpg"
            alt="590st CAFE Location"
            className="location_page_image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 text-white z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-600/90 text-white mb-2 backdrop-blur-sm shadow-sm">
              <Coffee className="w-3.5 h-3.5" /> Main Store
            </span>
            <h3 className="text-2xl font-bold drop-shadow-sm">590st CAFE</h3>
            <p className="text-sm text-gray-200">Toul Kork, Phnom Penh</p>
          </div>
        </div>

        {/* Right Column: Store Information Card */}
        <div className="location_page_card">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">590st CAFE Main Store</h2>
            <p className="product_description">
              Visit us to experience freshly crafted coffee, delicious beverages, and a cozy atmosphere perfect for relaxation, meeting friends, or working.
            </p>
          </div>

          <div className="location_info_group">
            {/* Address */}
            <div className="location_info_item">
              <div className="location_info_icon">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Address</h4>
                <p className="text-sm text-gray-600">
                  House No. 30A, Street 590, Toul Kork District, Phnom Penh 12101, Cambodia
                </p>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="location_info_item">
              <div className="location_info_icon">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Opening Hours</h4>
                <p className="text-sm text-gray-600">Monday - Sunday: 7:00 AM - 11:00 PM</p>
              </div>
            </div>

            {/* Phone & Contact */}
            <div className="location_info_item">
              <div className="location_info_icon">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Contact Number</h4>
                <p className="text-sm text-gray-600">095 600 676 / 069 955 878</p>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="location_actions_row">
            <a
              href={googleMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button className="button_pill_primary cursor-pointer flex items-center justify-center gap-2">
                <Navigation className="w-4 h-4" />
                View on Google Maps
                <ExternalLink className="w-4 h-4 ml-0.5 opacity-70" />
              </Button>
            </a>

            <Link href="/menu" className="inline-flex">
              <Button className="button_pill_secondary cursor-pointer flex items-center justify-center gap-2">
                Explore Our Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationpageView;
