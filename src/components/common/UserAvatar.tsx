"use client";

import Image from "next/image";
import { useState, type CSSProperties, type ReactNode } from "react";
import { UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { initials } from "@/lib/welcomeToast";

/**
 * A customer's profile photo (their own upload, or the one synced from Telegram), shown the same way everywhere.
 * With no photo, or one that fails to load, it falls back to the person's initials.
 */
export function UserAvatar({
  src,
  name,
  sizes,
  alt = "",
  className,
  imageClassName,
  imageStyle,
  priority = false,
  children,
}: {
  src?: string | null;
  name?: string | null;
  /** Rendered width, for next/image, e.g. "32px". */
  sizes: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  imageStyle?: CSSProperties;
  priority?: boolean;
  /** Overlays such as an edit button. */
  children?: ReactNode;
}) {
  // Remember which URL failed rather than a flag, so a newly synced photo gets a fresh chance to load.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const photo = src && src !== failedSrc ? src : null;
  const letters = name?.trim() ? initials(name) : "";

  return (
    <span
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-[#fdf2f7] font-bold text-[#A1255B]",
        className
      )}
    >
      {photo ? (
        <Image
          src={photo}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized
          className={cn("object-cover", imageClassName)}
          style={imageStyle}
          onError={() => setFailedSrc(photo)}
        />
      ) : letters ? (
        <span aria-hidden>{letters}</span>
      ) : (
        <UserRound className="h-1/2 w-1/2" strokeWidth={1.75} aria-hidden />
      )}
      {children}
    </span>
  );
}
