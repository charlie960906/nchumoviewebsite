import Image from "next/image";
import Link from "next/link";
import { footerNav, site } from "@/lib/site";
import { THEME_CHAR } from "@/lib/theme";

const WEEKDAY = ["日", "一", "二", "三", "四", "五", "六"];

/** 把 ISO 時間轉成「03.19（五）」；依 site.ts 寫的 +08:00 解析，不受伺服器時區影響。 */
function day(iso: string) {
  const [, m, d] = iso.slice(0, 10).split("-");
  const w = new Date(`${iso.slice(0, 10)}T12:00:00Z`).getUTCDay();
  return `${m}.${d}（${WEEKDAY[w]}）`;
}

const linkClass = "text-mist transition-colors duration-200 hover:text-glow";

export default function Footer() {
  const social = [
    { label: "Instagram", href: site.contact.instagram },
    { label: "Threads", href: site.contact.threads },
    { label: "Facebook", href: site.contact.facebook },
  ].filter((s) => s.href);

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-night">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/60 to-transparent" />

      <div className="container-x grid gap-12 py-14 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
        {/* 品牌與活動資訊 */}
        <section aria-labelledby="footer-brand">
          <h2 id="footer-brand" className="font-serif text-[44px] font-black leading-none md:text-[56px]">
            {THEME_CHAR} <span className="font-normal italic tracking-wide">Ripple</span>
          </h2>
          <p className="mt-4 text-sm font-medium text-moon">{site.shortName}</p>
          <p className="mt-1 font-mono text-xs tracking-[0.24em] text-dim">NCHU FILM FESTIVAL {site.year}</p>
          <p className="mt-5 max-w-xs text-sm leading-7 text-mist">{site.tagline}</p>

          <dl className="mt-6 grid gap-2 text-sm">
            <div className="flex gap-3">
              <dt className="w-10 shrink-0 text-dim">日期</dt>
              <dd className="text-moon">
                {site.year}.{day(site.start)} — {day(site.end)}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-10 shrink-0 text-dim">地點</dt>
              <dd>
                <a href={site.venue.mapsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {site.venue.name} <span aria-hidden className="text-dim">↗</span>
                </a>
              </dd>
            </div>
          </dl>
        </section>

        {/* 網頁導覽 */}
        <nav aria-label="網頁導覽" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {footerNav.map((g) => (
            <div key={g.title}>
              <p className="eyebrow mb-1">{g.titleEn}</p>
              <h3 className="mb-4 text-sm font-semibold text-moon">{g.title}</h3>
              <ul className="grid gap-2.5 text-sm">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {social.length > 0 && (
            <div>
              <p className="eyebrow mb-1">Follow</p>
              <h3 className="mb-4 text-sm font-semibold text-moon">追蹤我們</h3>
              <ul className="grid gap-2.5 text-sm">
                {social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group inline-flex items-center gap-1.5 ${linkClass}`}
                    >
                      {s.label}
                      <span aria-hidden className="text-dim transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </div>

      {/* 指導與執行單位 */}
      <div className="border-t border-white/10">
        <div className="container-x flex flex-wrap gap-x-16 gap-y-8 py-8">
          {[
            { label: "指導單位", list: site.advisors },
            { label: "執行單位", list: [site.producer] },
          ].map((g) => (
            <div key={g.label}>
              <p className="text-xs tracking-widest text-dim">{g.label}</p>
              <ul className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-4">
                {g.list.map((o) => {
                  const body = (
                    <>
                      <Image
                        src={o.logo}
                        alt=""
                        width={o.logoW}
                        height={o.logoH}
                        className="h-10 w-auto max-w-[11rem] shrink-0 object-contain object-left"
                      />
                      <span className="text-sm text-mist transition-colors group-hover:text-glow">{o.name}</span>
                    </>
                  );
                  return (
                    <li key={o.name}>
                      {o.url ? (
                        <a href={o.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3">
                          {body}
                        </a>
                      ) : (
                        <div className="flex items-center gap-3">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center gap-2 py-5 text-xs leading-6 text-dim sm:flex-row sm:justify-between">
          <p className="text-center sm:text-left">
            © {site.name}
            <span aria-hidden className="mx-2 hidden sm:inline">｜</span>
            <span className="block sm:inline">
              網站設計與開發：
              <a href="https://hyjdevelop.com" target="_blank" rel="noopener noreferrer" className={linkClass}>
                HYJdevelop
              </a>
            </span>
          </p>
          <div className="flex items-center gap-5">
            {/* GA4 服務條款要求公開隱私權政策；本站的統計由 HYJdevelop 管理 */}
            <a href="https://www.hyjdevelop.com/privacy" target="_blank" rel="noopener" className={linkClass}>
              隱私權政策
            </a>
            <Link href="/update" className={linkClass}>
              Update
            </Link>
            <a href="#" className={`inline-flex items-center gap-1 ${linkClass}`}>
              回到頂端 <span aria-hidden>↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
