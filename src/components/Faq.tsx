import { ChevronDown } from "lucide-react";
import { faqs } from "@/lib/content";

/** FAQ 以原生 <details> 呈現：無 JS 也可操作，答案文字始終在 DOM（AEO）。 */
export default function Faq({ limit }: { limit?: number }) {
  const list = limit ? faqs.slice(0, limit) : faqs;
  return (
    <div className="grid gap-3">
      {list.map((f, i) => (
        <details
          key={f.q}
          className="card group reveal px-5 open:border-glow/40"
          style={{ "--d": `${i * 50}ms` } as React.CSSProperties}
          open={i === 0}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-bold marker:hidden [&::-webkit-details-marker]:hidden">
            <h3 className="text-[17px]">{f.q}</h3>
            <ChevronDown aria-hidden size={20} className="shrink-0 text-glow transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <p className="pb-5 text-mist/90">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
