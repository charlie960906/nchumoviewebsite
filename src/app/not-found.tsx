import type { Metadata } from "next";
import Link from "next/link";

// 需明確寫 noindex，否則會繼承 layout 的 index, follow
export const metadata: Metadata = { title: "找不到頁面", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className="container-x grid min-h-[70vh] place-items-center py-20 text-center">
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="absolute inset-0 animate-ripple-out rounded-full border border-glow/40" style={{ animationDelay: `${i * 0.8}s` }} />
          ))}
        </div>
        <p className="font-mono text-7xl font-bold text-glow">404</p>
        <h1 className="mt-4 font-serif text-3xl font-bold">這一圈漣漪，漂到了沒有岸的地方</h1>
        <p className="mt-3 text-mist/90">找不到這個頁面。可能是連結有誤，或內容已經移動。</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            回到首頁
          </Link>
          <Link href="/program" className="btn btn-ghost">
            看活動時間表
          </Link>
        </div>
      </div>
    </section>
  );
}
