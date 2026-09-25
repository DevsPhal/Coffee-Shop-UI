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
      {/* pt-(--nav-h): clears the fixed navbar, whose height shrinks on short (zoomed-in) viewports. */}
      {/* min-h-svh: at least one full screen tall, so the footer always starts below the fold.
          Without it, a page still loading (a skeleton, a spinner) is short, and the footer
          jumped up under the navbar on every reload before sliding back down once data landed. */}
      <main className="flex-1 min-h-svh pt-(--nav-h) site_main_content flex flex-col justify-center">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
