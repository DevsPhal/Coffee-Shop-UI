"use client";

import { useEffect } from "react";

export default function ScrollObserver() {
  useEffect(() => {
    const selector = [
      ".animate-appear",
      ".scroll-appear",
      "section",
      "footer",
      ".card_item",
      ".phone-card",
      ".event_card",
      ".menu-header",
      ".menu-view-container",
      ".events_container",
      ".events_wrapper",
      ".header_section",
      ".homepage_section_header",
      ".about_page_image_box",
      ".about_page_content",
      ".product_image_container",
      ".product_info_box",
      ".order_page_summary_card",
    ].join(",");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      {
        rootMargin: "0px 0px -20px 0px",
        threshold: 0.05,
      }
    );

    const observeAll = () => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => observer.observe(el));
    };

    // Defer initial observation until after React hydration completes
    const timer = setTimeout(() => {
      observeAll();
    }, 0);

    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
