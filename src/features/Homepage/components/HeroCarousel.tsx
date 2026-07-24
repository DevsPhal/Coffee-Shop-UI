"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import "@/app/globals.scss";

export default function HeroCarousel() {
  return (
    <div className="hero_carousel_wrapper font-sans">
      <div className="hero_carousel_container">
        <div className="hero_carousel_flex">
          
          {/* Left Column: Text & Action Buttons */}
          <div className="hero_carousel_left">
            <h1 className="hero_carousel_title">
              EVERY SIP TELL A STORY
            </h1>
            
            <p className="hero_carousel_description">
              From single-origin pour-overs to handcrafted lattes - we brew each cup with the same obsessive care that goes into sourcing our beans.
            </p>
            
            {/* Action Buttons Row */}
            <div className="hero_carousel_actions">
              <Link href="/menu">
                <Button className="button_pill_primary cursor-pointer">
                  Browse Our Menu
                </Button>
              </Link>

              <Link
                href="/about"
                className="hero_carousel_link_story"
              >
                Our Story
              </Link>
            </div>
          </div>

          {/* Right Column: Poster Image */}
          <div className="hero_carousel_right">
            <div className="hero_carousel_image_wrapper">
              <Image
                src="/images/slideshow.svg"
                alt="590st Cafe Coffee Collection Posters"
                fill
                priority
                className="hero_carousel_image"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
