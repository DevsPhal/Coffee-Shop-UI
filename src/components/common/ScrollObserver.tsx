"use client";

import { useEffect } from "react";

export default function ScrollObserver() {
  useEffect(() => {
    const selector = [
      ".animate-appear",
      ".scroll-appear",
      ".homepage_section_header",
      ".homepage_cards_grid > *",
      ".card_item",
      ".card_box",
      ".phone-card",
      ".event_card",
      ".about-card",
      ".menu-header",
      ".menu-view-container",
      ".events_container",
      ".events_wrapper",
      ".header_section",
      ".about_page_image_box",
      ".about_page_content",
      ".product_image_container",
      ".product_info_box",
      ".order_page_summary_card",
      ".contact_page_container",
      ".contact_page_grid",
      ".contact_page_form_card",
      ".contact_page_info_card",
      ".checkout_done_page",
      ".checkout_page_container",
      ".payment_page_container",
      ".user_profile_container",
      ".user_profile_card",
      ".user_profile_wrapper",
      ".location_page_container",
      ".bento_grid > *",
      ".bento-grid > *",
      ".product_detail_header",
      ".product_detail_container",
      ".product_detail_card",
      ".banner_section",
      ".ready_to_order_title",
      ".ready_to_order_desc",
      ".ready_to_order_actions",
      ".footer_top_row",
      ".footer_bottom_row",
    ].join(",");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          } else {
            entry.target.classList.remove("in-view");
          }
        });
      },
      {
        rootMargin: "-20px 0px -20px 0px",
        threshold: 0.05,
      }
    );

    const observeAll = () => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        observer.observe(el);
      });
    };

    observeAll();

    const timer = setTimeout(observeAll, 50);

    // Watch for DOM changes (category filtering, dynamic lists, etc.)
    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const handleScroll = () => {
      observeAll();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
}

