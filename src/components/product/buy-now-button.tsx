"use client";

import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { productPrice } from "@/lib/format";
import type { StoreProduct } from "@/lib/types";

export function BuyNowButton({ product }: { product: StoreProduct }) {
  const router = useRouter();
  const { addItem } = useCart();
  const disabled = product.status !== "disponible" || product.stock < 1;

  return (
    <button
      disabled={disabled}
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand.name,
          size: product.size,
          price: productPrice(product.price, product.salePrice),
          image: product.images[0],
          quantity: 1,
          stock: product.stock
        });
        router.push("/checkout");
      }}
      className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-champagne px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-black transition hover:bg-[#c8aa70] disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/45 sm:py-4"
    >
      <CreditCard className="h-5 w-5" />
      {disabled ? "No disponible" : "Comprar ahora"}
    </button>
  );
}
