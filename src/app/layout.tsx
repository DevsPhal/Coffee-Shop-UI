import type { Metadata } from "next";
import { Google_Sans_Flex, Noto_Sans_Khmer } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { StoreProvider } from "@/store/StoreProvider";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/components/ui/translatetokhmer";
import ScrollObserver from "@/components/common/ScrollObserver";
import PointerCapturePolyfill from "@/components/common/PointerCapturePolyfill";
import RealtimeCatalogSync from "@/components/RealtimeCatalogSync";
import OrderNotifications from "@/components/OrderNotifications";
import LoginWelcome from "@/components/LoginWelcome";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

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
  icons: {
    icon: [
      { url: "/logos/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logos/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/logos/icon-32.png",
    apple: { url: "/logos/apple-icon.png", sizes: "180x180" },
  },
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
        <StoreProvider>
          <AuthProvider>
            <CartProvider>
              <LanguageProvider>
                <ScrollObserver />
                <PointerCapturePolyfill />
                <RealtimeCatalogSync />
                <OrderNotifications />
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
