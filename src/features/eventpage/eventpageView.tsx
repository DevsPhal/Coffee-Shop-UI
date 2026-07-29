"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/app/globals.scss";

interface EventItem {
  id: string;
  title: string;
  description: string;
  image: string;
  colSpan?: string;
  link?: string;
}

const socialLinks = [
  { label: "", href: "#" },
  { label: "", href: "https://www.facebook.com/profile.php?id=61573086337988", icon: "/icons/facebook.svg" },
  { label: "", href: "#", icon: "/icons/tiktok.svg" },
];

// Extract Facebook link from socialLinks array
const facebookSocialLink = socialLinks.find((item) => item.icon?.includes("facebook"))?.href || socialLinks[1]?.href || "#";

const EVENT_ITEMS: EventItem[] = [
  {
    id: "5",
    title: "590St MLBB Tournament",
    description:
      "Join our exciting 590St Mobile Legends: Bang Bang tournament and win exclusive prizes!",
    image: "/images/eventmlbb.png",
    colSpan: "col-span-1 md:col-span-2",
    link: facebookSocialLink,
  },
  {
    id: "1",
    title: "Khmer New Year Celebration",
    description:
      "Celebrate Sankranta Khmer New Year with traditional games, festive coffee specials, and joyful Khmer music!",
    image: "/images/khmernewyear.png",
    colSpan: "col-span-1",
    link: facebookSocialLink,
  },
  {
    id: "2",
    title: "Live Acoustic Night",
    description:
      "Enjoy relaxing acoustic music performances while sipping handcrafted coffee.",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    colSpan: "col-span-1",
    link: facebookSocialLink,
  },
  {
    id: "4",
    title: "Board Game Gathering",
    description:
      "Gather with friends for fun board game matches and special drink discounts.",
    image:
      "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
    colSpan: "col-span-1",
    link: facebookSocialLink,
  },
  {
    id: "6",
    title: "Pastry & Brew Pairing",
    description:
      "Indulge in freshly baked French croissants paired perfectly with cold brews.",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    colSpan: "col-span-1",
    link: facebookSocialLink,
  },
  {
    id: "7",
    title: "Weekend Study & Chill",
    description:
      "Relax, work, or hang out in a cozy atmosphere with free high-speed Wi-Fi.",
    image: "/images/590st.jpg",
    colSpan: "col-span-1 md:col-span-2",
    link: facebookSocialLink,
  },
];

export function EventpageView() {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  return (
    <div className="events-container">
      <div className="events-wrapper">
        <div className="header-section">
          <h1 className="header-title">Events at 590st Cafe</h1>
          <p className="header-description">
            Discover our vibrant community gatherings, esports tournaments, live coffee brewing sessions, and special celebrations at 590st Cafe.
          </p>
        </div>
        <div className="bento-grid">
          {EVENT_ITEMS.map((item) => {
            const targetLink = item.link || facebookSocialLink;

            const cardContent = (
              <>
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
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-description">{item.description}</p>
                </div>
              </>
            );

            if (targetLink && targetLink !== "#") {
              return (
                <a
                  key={item.id}
                  href={targetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`event-card ${item.colSpan || "span-col-1"} block`}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div
                key={item.id}
                onClick={() => setSelectedEvent(item)}
                className={`event-card ${item.colSpan || "span-col-1"}`}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      {selectedEvent && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="modal-close-btn"
            >
              ✕
            </button>

            <div className="modal-image-wrapper">
              <Image
                src={selectedEvent.image}
                alt={selectedEvent.title}
                fill
                unoptimized
                className="modal-image"
              />
            </div>

            <div className="modal-body">
              <h2 className="modal-title">{selectedEvent.title}</h2>
              <p className="modal-description">{selectedEvent.description}</p>
            </div>

            <div className="modal-footer">
              {(selectedEvent.link || facebookSocialLink) && (
                <a
                  href={selectedEvent.link || facebookSocialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-action-btn mr-2"
                  style={{
                    backgroundColor: "#1877F2",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  View on Facebook
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
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

export default EventpageView;
