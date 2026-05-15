"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/cart/cart-provider";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Header />
      {children}
      <Footer />
    </CartProvider>
  );
}
