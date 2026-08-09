"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface TooltipAlertProps {
  message?: string;
}

export function TooltipAlert({ message }: TooltipAlertProps) {
  if (!message) return null;

  return (
    <div className="relative z-30 mt-2 mb-1 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
      {/* Curved Pointer Beak pointing UP to the input */}
      <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white border-t border-l border-orange-200/80 rotate-45 z-10 shadow-[-2px_-2px_4px_rgba(0,0,0,0.03)]" />

      {/* Modern Floating Alert Card */}
      <div className="relative z-20 inline-flex items-center gap-2.5 bg-gradient-to-r from-orange-50/95 via-white to-orange-50/80 border border-orange-200/90 rounded-2xl py-2.5 px-3.5 shadow-[0_10px_30px_-5px_rgba(249,87,0,0.22)] backdrop-blur-md max-w-xs transition-all duration-200">
        {/* Glowing Orange Icon Badge */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f95700] to-[#ff7d33] text-white flex items-center justify-center shadow-[0_3px_10px_rgba(249,87,0,0.4)] flex-shrink-0">
          <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        {/* Error Message */}
        <span className="text-xs font-semibold text-gray-800 tracking-tight leading-tight">
          {message}
        </span>
      </div>
    </div>
  );
}
