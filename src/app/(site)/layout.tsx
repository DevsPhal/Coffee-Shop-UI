import { Footer } from "@/components/layout/footter";
import { Navbar } from "@/components/layout/navbar";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
