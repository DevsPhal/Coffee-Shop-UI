import Image from "next/image";
import Link from "next/link";

/** Intrinsic size of the /public/logos wordmarks (shared with the admin app). */
const LOGO_WIDTH = 800;
const LOGO_HEIGHT = 539;

export interface BrandLogoProps {
  /** "black" on light surfaces, "white" on dark ones — same pair the admin app uses. */
  tone?: "black" | "white";
  /** Sizing is by height (the width follows the wordmark's aspect ratio), e.g. "h-10". */
  className?: string;
  /** Link target; pass `null` where the logo sits inside another control and must not navigate. */
  href?: string | null;
  priority?: boolean;
}

/**
 * The 590st CAFE wordmark. Everywhere it appears as navigation (navbar, footer, login screens)
 * it links home, so customers can always get back with one click — the one convention every
 * shop site shares.
 */
export function BrandLogo({ tone = "black", className = "h-10", href = "/", priority = false }: BrandLogoProps) {
  const image = (
    <Image
      src={tone === "white" ? "/logos/logo-white.png" : "/logos/logo-black.png"}
      alt="590st CAFE"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );

  if (href === null) return image;

  return (
    <Link
      href={href}
      aria-label="590st CAFE — Home"
      title="590st CAFE — Home"
      className="inline-flex shrink-0 items-center rounded-md transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A1255B]"
    >
      {image}
    </Link>
  );
}

export default BrandLogo;
