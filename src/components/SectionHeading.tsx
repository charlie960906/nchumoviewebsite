import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({
  id,
  index,
  eyebrow,
  title,
  more,
}: {
  id?: string;
  /** 段落編號（如 1 → 「01 —」），讓長頁面有章節節奏 */
  index?: number;
  eyebrow: string;
  title: React.ReactNode;
  more?: { href: string; label: string };
}) {
  return (
    <div className="reveal flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div>
        <p className="eyebrow">
          {index != null && <span className="eyebrow-num">{String(index).padStart(2, "0")} —</span>}
          {eyebrow}
        </p>
        <h2 id={id} className="mt-3 font-serif text-[28px] font-black leading-tight tracking-wide md:text-[40px]">
          {title}
        </h2>
      </div>
      {more && (
        <Link href={more.href} className="-my-2 inline-flex items-center gap-1 py-2 text-sm font-bold text-glow hover:underline">
          {more.label} <ArrowRight aria-hidden size={15} />
        </Link>
      )}
    </div>
  );
}
