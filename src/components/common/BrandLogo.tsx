import Image from "next/image";
import Link from "next/link";

const LOGO_WIDTH = 800;
const LOGO_HEIGHT = 539;

export interface BrandLogoProps {
  tone?: "black" | "white";
  className?: string;
  href?: string | null;
  priority?: boolean;
}

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
