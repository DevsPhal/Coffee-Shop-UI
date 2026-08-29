"use client";

import { useEffect } from "react";

export default function PointerCapturePolyfill() {
  useEffect(() => {
    if (typeof window === "undefined" || !Element.prototype.releasePointerCapture) return;

    const originalRelease = Element.prototype.releasePointerCapture;
    Element.prototype.releasePointerCapture = function (pointerId: number) {
      try {
        if (this.hasPointerCapture && this.hasPointerCapture(pointerId)) {
          originalRelease.call(this, pointerId);
        }
      } catch (e) {
        // Safely suppress NotFoundError on mobile pointer/touch release
      }
    };

    const originalSet = Element.prototype.setPointerCapture;
    if (originalSet) {
      Element.prototype.setPointerCapture = function (pointerId: number) {
        try {
          originalSet.call(this, pointerId);
        } catch (e) {
          // Safely suppress setPointerCapture error on inactive pointer
        }
      };
    }
  }, []);

  return null;
}
