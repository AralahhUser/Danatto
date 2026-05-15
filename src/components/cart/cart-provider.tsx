"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "danatto-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      items,
      count,
      subtotal,
      addItem(item) {
        setItems((current) => {
          const exists = current.find((entry) => entry.productId === item.productId);
          if (exists) {
            return current.map((entry) =>
              entry.productId === item.productId
                ? { ...entry, quantity: Math.min(entry.quantity + 1, entry.stock) }
                : entry
            );
          }
          return [...current, item];
        });
      },
      removeItem(productId) {
        setItems((current) => current.filter((item) => item.productId !== productId));
      },
      setQuantity(productId, quantity) {
        setItems((current) =>
          current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
              : item
          )
        );
      },
      clear() {
        setItems([]);
      }
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
