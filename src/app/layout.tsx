import type { Metadata } from "next";
import { Google_Sans_Flex, Noto_Sans_Khmer } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { StoreProvider } from "@/store/StoreProvider";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/components/ui/translatetokhmer";
import ScrollObserver from "@/components/common/ScrollObserver";
import PointerCapturePolyfill from "@/components/common/PointerCapturePolyfill";
import RealtimeCatalogSync from "@/components/RealtimeCatalogSync";
import LoginWelcome from "@/components/LoginWelcome";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

// Self-hosted by Next.js at build time (next/font/google) — no runtime request to Google's
// servers, so this stays fast on mobile. Google Sans Flex only ships a latin/latin-ext charset,
// so Khmer text still needs Noto Sans Khmer layered in behind it (wired up as the `--font-khmer`
// fallback in globals.css); this just supplies the variable so both are available as CSS vars.
const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-google-sans",
  display: "swap",
});

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-khmer",
  display: "swap",
});

export const metadata: Metadata = {
  title: "590st Cafe Shop",
  description: "Customer UI for 590st Cafe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased font-sans ${googleSansFlex.variable} ${notoSansKhmer.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Outermost, so every screen and the other providers can reach the API cache. */}
        <StoreProvider>
          <AuthProvider>
            <CartProvider>
              <LanguageProvider>
                <ScrollObserver />
                <PointerCapturePolyfill />
                <RealtimeCatalogSync />
                <LoginWelcome />
                {children}
                <Toaster />
              </LanguageProvider>
            </CartProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
