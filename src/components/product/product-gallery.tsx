"use client";

import Image from "next/image";
import { useState } from "react";
import { clsx } from "clsx";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(images[0]);

  return (
    <div className="grid gap-4 lg:grid-cols-[88px_1fr]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:grid lg:overflow-visible">
        {images.map((image, index) => (
          <button
            key={image}
            onClick={() => setActive(image)}
            className={clsx(
              "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-white",
              active === image ? "border-navy" : "border-ink/10"
            )}
          >
            <Image src={image} alt={`${name} foto ${index + 1}`} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-lg bg-white lg:order-2">
        <Image src={active} alt={name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
    </div>
  );
}
