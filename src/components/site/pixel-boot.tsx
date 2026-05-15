"use client";

import { useEffect } from "react";

export function PixelBoot() {
  useEffect(() => {
    const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const tikTokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

    if (metaPixelId) {
      window.dispatchEvent(new CustomEvent("danatto:pixel-ready", { detail: { provider: "meta" } }));
    }

    if (tikTokPixelId) {
      window.dispatchEvent(new CustomEvent("danatto:pixel-ready", { detail: { provider: "tiktok" } }));
    }
  }, []);

  return null;
}
