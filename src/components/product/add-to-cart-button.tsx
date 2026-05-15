"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { productPrice } from "@/lib/format";
import type { StoreProduct } from "@/lib/types";

export function AddToCartButton({ product }: { product: StoreProduct }) {
  const { addItem } = useCart();
  const disabled = product.status !== "disponible" || product.stock < 1;

  return (
    <button
      disabled={disabled}
      onClick={() =>
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
        })
      }
      className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-semibold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:bg-ink/35"
    >
      <ShoppingBag className="h-5 w-5" />
      {disabled ? "No disponible" : "Agregar al carrito"}
    </button>
  );
}
