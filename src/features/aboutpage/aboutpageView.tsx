"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/app/globals.scss";

interface AboutGalleryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  colSpan?: string;
}

const ABOUT_ITEMS: AboutGalleryItem[] = [
  {
    id: "1",
    title: "590st CAFE Flagship",
    description:
      "Founded by Mr. Ith Chanti at House No. 30A, Street 590, Toul Kork, Phnom Penh, legally registered with the Ministry of Commerce.",
    image: "/images/590st%20cafe.jpg",
    colSpan: "col-span-1",
  },
  {
    id: "2",
    title: "Honesty & Quality Principle",
    description:
      "Operating with strict honesty, no cheating or low-quality ingredients, keeping customer trust at our core.",
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
    colSpan: "col-span-1",
  },
  {
    id: "3",
    title: "Craft Coffee & Beverages",
    description:
      "Offering premium hot & cold coffee, teas, fruit juices, and delicious snacks at reasonable prices for all ages.",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    colSpan: "col-span-1",
  },
  {
    id: "4",
    title: "Strict Hygiene & Selection",
    description:
      "Meticulously selecting raw materials and maintaining high hygiene standards for a safe, wholesome experience.",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    colSpan: "col-span-1",
  },
  {
    id: "5",
    title: "Cozy Study & Work Atmosphere",
    description:
      "A peaceful environment perfect for relaxing, working, or meeting friends with comfortable seating and free high-speed Wi-Fi.",
    image: "/images/590st.jpg",
    colSpan: "col-span-1 md:col-span-2",
  },
  {
    id: "6",
    title: "Community & Rewards",
    description:
      "Regular promotions and special rewards to show gratitude to both our new and valued longtime customers.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    colSpan: "col-span-1",
  },
  {
    id: "7",
    title: "Our Warm Hospitality",
    description:
      "Dedicated to welcoming every visitor with genuine Cambodian warmth, friendliness, and exceptional service.",
    image:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80",
    colSpan: "col-span-1",
  },
];

export function AboutpageView() {
  const [selectedItem, setSelectedItem] = useState<AboutGalleryItem | null>(null);

  return (
   <div className="about-container">
  <div className="about-wrapper">
    <div className="product_detail_header">
      <h1 className="product_detail_title">About Us</h1>

      <nav className="product_detail_breadcrumb" aria-label="Breadcrumb">
        <Link href="/" className="breadcrumb_link">
          Home
        </Link>
        <span className="breadcrumb_separator">»</span>
        <span className="breadcrumb_current">About Us</span>
      </nav>
    </div>
    <div className="bento-grid">
      {ABOUT_ITEMS.map((item, index) => (
        <div
          key={item.id}
          onClick={() => setSelectedItem(item)}
          className={`about-card ${item.colSpan || "span-col-1"}`}
          style={{ "--item-index": index } as React.CSSProperties}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="card-image"
          />
          <div className="card-overlay" />
          <div className="card-content">
            <h3 className="card-title">
              {item.title}
            </h3>
            <p className="card-description">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>

  </div>
  {selectedItem && (
    <div
      className="modal-backdrop"
      onClick={() => setSelectedItem(null)}
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setSelectedItem(null)}
          className="modal-close-btn"
        >
          ✕
        </button>

        <div className="modal-image-wrapper">
          <Image
            src={selectedItem.image}
            alt={selectedItem.title}
            fill
            unoptimized
            className="modal-image"
          />
        </div>

        <div className="modal-body">
          <h2 className="modal-title">
            {selectedItem.title}
          </h2>
          <p className="modal-description">
            {selectedItem.description}
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="modal-action-btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  );
}

export default AboutpageView;
