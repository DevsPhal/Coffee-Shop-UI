import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { DineInPill } from "@/components/layout/DineInPill";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StaffAccountGuard } from "@/components/common/StaffAccountGuard";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <StaffAccountGuard>
      <Navbar />
      <main className="flex-1 min-h-svh pt-(--nav-h) site_main_content flex flex-col justify-center">{children}</main>
      <Footer />
      <DineInPill />
      <CartDrawer />
      </StaffAccountGuard>
    </CartProvider>
  );
}
