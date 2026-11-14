import Image from "next/image";
import Link from "next/link";
import { footerNav, site } from "@/lib/site";
import LumaButton from "./LumaButton";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-night">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-xl font-bold tracking-wider">{site.fullName}</p>
          <p className="mt-3 max-w-md text-sm text-dim">
            2027 年 3 月 19 日（五）– 3 月 20 日（六）
            <br />
            {site.venue.name}｜{site.venue.address}
          </p>
          <div className="mt-6">
            <LumaButton source="footer" />
          </div>
        </div>

        <nav aria-label="頁尾選單">
          <p className="eyebrow mb-4">Sitemap</p>
          <ul className="grid gap-2 text-sm">
            {footerNav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-mist hover:text-glow">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/register" className="text-mist hover:text-glow">
                即刻報名
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-4">Organizers</p>
          <ul className="grid gap-5">
            {site.organizers.map((o) => (
              <li key={o.name} className="flex items-center gap-3">
                <Image
                  src={o.logo}
                  alt={`${o.name} 標誌`}
                  width={o.logoW}
                  height={o.logoH}
                  className="h-9 w-auto max-w-[9rem] object-contain"
                />
                <span className="text-sm leading-snug">
                  <span className="block text-xs text-dim">{o.role}</span>
                  {o.url ? (
                    <a href={o.url} target="_blank" rel="noopener" className="hover:text-glow">
                      {o.name}
                    </a>
                  ) : (
                    o.name
                  )}
                </span>
              </li>
            ))}
          </ul>
          <Image
            src="/brand/nchu.png"
            alt="國立中興大學 National Chung Hsing University"
            width={854}
            height={201}
            className="mt-6 h-9 w-auto opacity-90"
          />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 text-center text-xs text-dim">
          <p>
            © 2027 興大國際星空電影節 ｜ 網站設計與開發：
            <a
              href="https://hyjdevelop.com"
              target="_blank"
              rel="noopener"
              className="text-mist hover:text-glow"
            >
              HYJdevelop
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
