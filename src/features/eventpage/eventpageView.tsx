"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/components/ui/translatetokhmer";
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
    image: "/images/event.png",
    colSpan: "span_col_2",
    link: facebookSocialLink,
  },
  {
    id: "1",
    title: "Khmer New Year Celebration",
    description:
      "Celebrate Sankranta Khmer New Year with traditional games, festive coffee specials, and joyful Khmer music!",
    image: "/images/newyear.png",
    colSpan: "span_col_1",
    link: facebookSocialLink,
  },
  {
    id: "2",
    title: "Night Enjoying Acoustic Music",
    description:
      "Enjoy relaxing acoustic music performances while sipping handcrafted coffee.",
    image: "/images/music.png",
    colSpan: "span_col_1",
    link: facebookSocialLink,
  },
  {
    id: "4",
    title: "Chess Game Night",
    description:
      "Gather with friends for fun board game matches and special drink discounts.",
    image: "/images/chess.jpg",
    colSpan: "span_col_1",
    link: facebookSocialLink,
  },
  {
    id: "6",
    title: "Brew Pairing",
    description:
      "Indulge in freshly baked French croissants paired perfectly with cold brews.",
    image: "/images/beer.jpg",
    colSpan: "span_col_1",
    link: facebookSocialLink,
  },
  {
    id: "7",
    title: "Weekend Study & Chill",
    description:
      "Relax, work, or hang out in a cozy atmosphere with free high-speed Wi-Fi.",
    image: "/images/590st.jpg",
    colSpan: "span_col_2",
    link: facebookSocialLink,
  },
];

export function EventpageView() {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const { t } = useLanguage();

  return (
    <div className="events_container">
      <div className="events_wrapper">
        <div className="header_section">
          <h1 className="header_title">{t("Events at 590st Cafe")}</h1>
          <p className="header_description">
            {t("Discover our vibrant community gatherings, esports tournaments, live coffee brewing sessions, and special celebrations at 590st Cafe.")}
          </p>
        </div>
        <div className="bento_grid">
          {EVENT_ITEMS.map((item) => {
            const targetLink = item.link || facebookSocialLink;

            const cardContent = (
              <>
                <Image
                  src={item.image}
                  alt={t(item.title)}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="card_image"
                />
                <div className="card_overlay" />
                <div className="card_content">
                  <h3 className="card_title text-white font-bold text-lg" style={{ color: "#ffffff" }}>{t(item.title)}</h3>
                  <p className="card_description">{t(item.description)}</p>
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
                  className={`event_card ${item.colSpan || "span_col_1"}`}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div
                key={item.id}
                onClick={() => setSelectedEvent(item)}
                className={`event_card ${item.colSpan || "span_col_1"}`}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      {selectedEvent && (
        <div
          className="modal_backdrop"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="modal_container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="modal_close-btn"
            >
              ✕
            </button>

            <div className="modal_image-wrapper">
              <Image
                src={selectedEvent.image}
                alt={t(selectedEvent.title)}
                fill
                unoptimized
                className="modal_image"
              />
            </div>

            <div className="modal_body">
              <h2 className="modal_title">{t(selectedEvent.title)}</h2>
              <p className="modal_description">{t(selectedEvent.description)}</p>
            </div>

            <div className="modal_footer">
              {(selectedEvent.link || facebookSocialLink) && (
                <a
                  href={selectedEvent.link || facebookSocialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal_action_btn modal_action_facebook"
                >
                  {t("View on Facebook")}
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="modal_action_btn"
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventpageView;
