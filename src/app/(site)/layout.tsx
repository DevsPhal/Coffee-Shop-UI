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
      {/* justify-center only has any visible effect when a page's content is shorter than the
          space between the nav and footer (an empty cart, "no orders found", a short profile
          card) — it centers that short content in the gap instead of leaving it pinned to the
          top with a large dead void above the footer. Pages with enough content to fill or
          exceed that space flow from the top exactly as before. */}
      <main className="flex-1 pt-20 site_main_content flex flex-col justify-center">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
