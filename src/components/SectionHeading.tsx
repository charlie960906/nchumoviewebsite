import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({
  id,
  eyebrow,
  title,
  more,
}: {
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  more?: { href: string; label: string };
}) {
  return (
    <div className="reveal flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="mt-2 font-serif text-[26px] font-bold tracking-wide md:text-[32px]">
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
