import Link from "next/link";
import Image from "next/image";

export function Logo({ tone = "dark", compact = false }: { tone?: "dark" | "light"; compact?: boolean }) {
  const src = tone === "light" ? "/brand/danatto-wordmark-light.png" : "/brand/danatto-wordmark-dark.png";

  return (
    <Link href="/" className="focus-ring inline-flex flex-col rounded-sm">
      <span className="relative block h-7 w-[142px] sm:h-9 sm:w-[190px]">
        <Image src={src} alt="Danatto" fill priority sizes="190px" className="object-contain" />
      </span>
      {!compact ? (
        <span className={`mt-1 hidden text-[10px] uppercase tracking-[0.24em] sm:block ${tone === "light" ? "text-white/55" : "text-ink/45"}`}>
          Selected clothing
        </span>
      ) : null}
    </Link>
  );
}
