"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, ExternalLink, Navigation, Coffee } from "lucide-react";
import "@/app/globals.scss";

export function LocationpageView() {
  const router = useRouter();
  const googleMapUrl = "https://maps.app.goo.gl/DKbvJw3Hz2tsCriQA?g_st=it";

  const [menuHref, setMenuHref] = React.useState("/menu");

  React.useEffect(() => {
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
    <div className="product_detail_container font-sans">
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
      <div className="location_page_grid">
        <div className="location_page_image_box group">
          <img
            src="/images/590st%20cafe.jpg"
            alt="590st CAFE Location"
            className="location_page_image"
          />
          <div className="location_image_overlay_gradient" />
          <div className="location_image_content">
            <span className="location_badge">
              <Coffee className="w-3.5 h-3.5" /> Main Store
            </span>
            <h3 className="location_store_title">590st CAFE</h3>
            <p className="location_store_subtitle">Toul Kork, Phnom Penh</p>
          </div>
        </div>
        <div className="location_page_card">
          <div className="location_card_top">
            <div>
              <h2 className="location_card_title">590st CAFE Main Store</h2>
              <p className="location_card_description">
                Visit us to experience freshly crafted coffee, delicious beverages, and a cozy atmosphere perfect for relaxation, meeting friends, or working.
              </p>
            </div>
            <div className="location_info_group">
              <div className="location_info_item">
                <div className="location_info_icon">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="location_info_label">Address</h4>
                  <p className="location_info_text">
                    House No. 30A, Street 590, Toul Kork District, Phnom Penh 12101, Cambodia
                  </p>
                </div>
              </div>
              <div className="location_info_item">
                <div className="location_info_icon">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="location_info_label">Opening Hours</h4>
                  <p className="location_info_text">Monday - Sunday: 7:00 AM - 3:00 PM</p>
                </div>
              </div>
              <div className="location_info_item">
                <div className="location_info_icon">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="location_info_label">Contact Number</h4>
                  <p className="location_info_text">095 600 676 / 069 955 878</p>
                </div>
              </div>
            </div>
            <a
              href={googleMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="map_preview_card"
            >
              <img
                src="/images/map.png"
                alt="590st cafe location map"
                className="map_preview_image"
              />
              <div className="map_preview_overlay">
                <div className="map_button_badge">
                  <Navigation className="w-3.5 h-3.5" />
                  View on Google Maps
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </div>
              </div>
            </a>
          </div>
          <div className="action_row_border">
            <Link
              href={menuHref}
              onClick={handleExploreMenuClick}
              className="explore_menu_link"
            >
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

export default LocationpageView;
