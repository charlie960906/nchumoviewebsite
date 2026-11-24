"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, animate, m, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";
import { nav, site } from "@/lib/site";
import { THEME } from "@/lib/theme";
import LumaButton from "./LumaButton";

/** 滑動膠囊的彈簧：k = 剛度、ζ = 阻尼比（< 1 會微微回彈）。阻尼 c = 2ζ√(k·m)，m = 1 */
const PILL_K = 190;
const PILL_ZETA = 0.55;
/** stretch：前緣用 k、後緣用 k × 這個比例，後緣慢半拍，膠囊在滑動中被拉長再收回 */
const PILL_TRAIL = 0.6;
/** 首頁導覽列：最上方 #1d3352 → 滑過 Hero 後 #001218 */
const NAV_FROM = [0x1d, 0x33, 0x52];
const NAV_TO = [0x00, 0x12, 0x18];
/** 首頁導覽列從透明到完全浮現所需的捲動距離 */
const NAV_FADE = 200;
const pillSpring = (k: number) => ({ type: "spring" as const, stiffness: k, damping: 2 * PILL_ZETA * Math.sqrt(k), mass: 1 });

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  /** 桌機版目前展開的下拉選單（以父項目的 href 識別） */
  const [menu, setMenu] = useState<string | null>(null);
  /** 行動版選單中目前展開的子選單（以父項目的 href 識別） */
  const [sub, setSub] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  /** 桌機導覽列：剛點下、正在切換過去的上層項目。點下當下膠囊就先滑過去，不等頁面載入完 */
  const [pending, setPending] = useState<string | null>(null);
  /** 滑動膠囊的位置；jump 代表直接定位不滑動（從隱藏出現、或同一項目因字型載入／視窗縮放而改變尺寸） */
  const [pill, setPill] = useState<{ x: number; y: number; w: number; h: number; jump: boolean; target: string } | null>(null);
  const reduce = useReducedMotion();
  /** 膠囊左右兩個邊緣各自用彈簧追目標，寬度 = 右 − 左 */
  const pillL = useMotionValue(0);
  const pillR = useMotionValue(0);
  const pillW = useTransform([pillL, pillR], ([l, r]: number[]) => r - l);

  useEffect(() => {
    setOpen(false);
    setMenu(null);
    setPending(null);
  }, [pathname]);

  // 每次關閉選單就把子選單收回，下次打開時全部是收合狀態
  useEffect(() => {
    if (!open) setSub(null);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 首頁與使用 PageHero 的內頁：導覽列在最上方是 Hero 頂端的海軍藍，往下滑過 Hero 一個螢幕高的距離，慢慢變成頁面的深藍黑。
  // 各展區內頁（/themes/<zone>）用展區代表色當頁首，維持原本的淡入。
  const headerRef = useRef<HTMLElement>(null);
  const isHome = !/^\/themes\/[^/]+/.test(pathname);
  useEffect(() => {
    const el = headerRef.current;
    if (!el || !isHome) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const y = window.scrollY;
      const t = Math.min(1, Math.max(0, y / window.innerHeight));
      // 最上方完全透明，往下滑前 NAV_FADE px 內才慢慢浮現；行動版選單打開時直接顯示
      const a = open ? 1 : Math.min(1, Math.max(0, y / NAV_FADE));
      const c = NAV_FROM.map((v, i) => Math.round(v + (NAV_TO[i] - v) * t));
      const blur = a > 0 ? `blur(${(12 * a).toFixed(1)}px)` : "none";
      el.style.backgroundColor = `rgb(${c[0]} ${c[1]} ${c[2]} / ${(0.92 * a).toFixed(3)})`;
      el.style.setProperty("backdrop-filter", blur);
      el.style.setProperty("-webkit-backdrop-filter", blur);
      el.style.borderBottomColor = `rgb(255 255 255 / ${(0.1 * a).toFixed(3)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      el.style.backgroundColor = "";
      el.style.removeProperty("backdrop-filter");
      el.style.removeProperty("-webkit-backdrop-filter");
      el.style.borderBottomColor = "";
    };
  }, [isHome, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      navRef.current?.querySelector<HTMLButtonElement>(`[data-menu="${menu}"]`)?.focus();
      setMenu(null);
    };
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setMenu(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [menu]);

  const under = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  /** 上層項目：自己或任一子頁面（例如「關於」底下的 /team）為目前頁面時都算 active */
  const isActive = (href: string) => under(href) || !!nav.find((n) => n.href === href)?.children?.some((c) => under(c.href));
  /** 下拉選單內的子項目只做完全比對，避免「策展理念」在 /themes/siu 也被標成目前頁面 */
  const isCurrent = (href: string) => pathname === href;

  const itemClass = (active: boolean) =>
    `relative flex items-center gap-1 rounded-full px-3 py-2 text-sm transition-colors duration-200 hover:text-glow ${active ? "text-glow" : "text-mist"}`;

  const activeTop = nav.find((n) => isActive(n.href))?.href ?? null;
  /** 膠囊只停在目前頁面；點下其他項目時才滑過去（滑鼠移入不會動） */
  const pillTarget = pending ?? activeTop;
  /** 一般左鍵點擊才讓膠囊先滑；Ctrl／Cmd／Shift 點擊是開新分頁，目前頁面不變 */
  const onNavClick = (href: string) => (e: React.MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    setPending(href);
  };

  // 量測目標項目相對於 nav 的位置。LazyMotion 只載入 domAnimation（不含 layout 動畫），
  // 所以這裡自己量座標、用 x / width 做彈簧動畫。
  useLayoutEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;
    const measure = () => {
      const el = pillTarget ? navEl.querySelector<HTMLElement>(`[data-pill="${pillTarget}"]`) : null;
      const box = navEl.getBoundingClientRect();
      const r = el?.getBoundingClientRect();
      if (!r || !r.width || !box.width) {
        setPill(null);
        return;
      }
      const next = { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height };
      const target = pillTarget as string;
      setPill((prev) => {
        // ResizeObserver 一開始觀察就會回呼一次；位置沒變就不更新，免得打斷正在滑的動畫
        if (prev && prev.target === target && prev.x === next.x && prev.y === next.y && prev.w === next.w && prev.h === next.h) return prev;
        return { ...next, target, jump: prev === null || prev.target === target };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(navEl);
    return () => ro.disconnect();
  }, [pillTarget]);

  useEffect(() => {
    if (!pill) return;
    const l = pill.x;
    const r = pill.x + pill.w;
    if (pill.jump || reduce) {
      pillL.jump(l);
      pillR.jump(r);
      return;
    }
    // 往右滑時右緣領頭、左緣拖在後面；往左則相反
    const movingRight = l > pillL.get();
    const lead = pillSpring(PILL_K);
    const trail = pillSpring(PILL_K * PILL_TRAIL);
    const a = animate(pillL, l, movingRight ? trail : lead);
    const b = animate(pillR, r, movingRight ? lead : trail);
    return () => {
      a.stop();
      b.stop();
    };
  }, [pill, reduce, pillL, pillR]);

  return (
    <>
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 ${
        isHome
          ? "border-b"
          : `transition-[background-color,border-color,backdrop-filter] duration-300 ${
              scrolled || open ? "border-b border-white/10 bg-night/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"
            }`
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${site.fullName} 首頁`}>
          <span className="leading-tight">
            <span className="block font-serif text-[15px] font-bold tracking-wider">{THEME}</span>
            <span className="block text-[11px] text-dim">中興星空電影節</span>
          </span>
        </Link>

        <nav
          ref={navRef}
          aria-label="主選單"
          className="relative hidden items-center gap-1 lg:flex"
        >
          <m.span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 rounded-full bg-white/[0.06] ring-[1.5px] ring-inset ring-white/45"
            style={{ x: pillL, width: pillW, y: pill?.y ?? 0, height: pill?.h ?? 0 }}
            initial={false}
            animate={{ opacity: pill ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
          {nav.map((n) => {
            const active = isActive(n.href);
            if (!n.children) {
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  data-pill={n.href}
                  aria-current={active ? "page" : undefined}
                  className={itemClass(active)}
                  onClick={onNavClick(n.href)}
                >
                  {n.label}
                </Link>
              );
            }
            const expanded = menu === n.href;
            return (
              <div
                key={n.href}
                className="relative"
                onPointerEnter={(e) => e.pointerType === "mouse" && setMenu(n.href)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setMenu(null)}
              >
                <button
                  type="button"
                  data-menu={n.href}
                  data-pill={n.href}
                  aria-expanded={expanded}
                  aria-controls={`menu-${n.href.slice(1)}`}
                  className={itemClass(active)}
                  // 滑鼠移入時已經展開，點擊不應再把它收起來；鍵盤與觸控才用點擊切換。
                  onClick={(e) =>
                    setMenu((e.nativeEvent as PointerEvent).pointerType === "mouse" || !expanded ? n.href : null)
                  }
                >
                  {n.label}
                  <ChevronDown aria-hidden size={14} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {expanded && (
                    <m.ul
                      id={`menu-${n.href.slice(1)}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-full min-w-40 rounded-xl border border-white/10 bg-night/95 p-1.5 shadow-xl shadow-black/40 backdrop-blur-md"
                    >
                      {n.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            onClick={(e) => {
                              setMenu(null);
                              onNavClick(n.href)(e);
                            }}
                            aria-current={isCurrent(c.href) ? "page" : undefined}
                            className={`block whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors duration-200 hover:bg-white/5 hover:text-glow ${
                              isCurrent(c.href) ? "text-glow" : "text-mist"
                            }`}
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </m.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LumaButton size="sm" source="header" className="hidden sm:inline-flex" />
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-lg text-moon hover:bg-white/10 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "關閉選單" : "開啟選單"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>
        </div>
      </div>
    </header>

    {/* 行動版選單：固定浮在 header 下方的毛玻璃面板，不佔版面、不把頁面往下推。
        放在 <header> 外面，避免 header 自己的 backdrop-filter 讓這層的模糊失效。 */}
    <AnimatePresence>
      {open && (
        <>
          <m.div
            key="mobile-nav-scrim"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/30 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <m.nav
            key="mobile-nav"
            id="mobile-nav"
            aria-label="行動版選單"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-16 z-40 border-b border-white/10 bg-night/55 shadow-2xl shadow-black/40 backdrop-blur-xl backdrop-saturate-150 lg:hidden"
          >
            <ul className="container-x flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto py-4">
              {nav.map((n, i) => (
                <m.li
                  key={n.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 + i * 0.04, duration: 0.25 }}
                >
                  {n.children ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={sub === n.href}
                        aria-controls={`mobile-sub-${n.href.slice(1)}`}
                        onClick={() => setSub((s) => (s === n.href ? null : n.href))}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-lg ${
                          isActive(n.href) ? "text-glow" : "text-moon"
                        } hover:bg-white/5`}
                      >
                        {n.label}
                        <ChevronDown
                          aria-hidden
                          size={18}
                          className={`transition-transform duration-200 ${sub === n.href ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {sub === n.href && (
                          <m.ul
                            id={`mobile-sub-${n.href.slice(1)}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                            className="grid gap-1 overflow-hidden pl-4"
                          >
                            {n.children.map((c) => (
                              <li key={c.href}>
                                <Link
                                  href={c.href}
                                  aria-current={isCurrent(c.href) ? "page" : undefined}
                                  onClick={() => setOpen(false)}
                                  className={`block rounded-xl px-4 py-2.5 text-base ${
                                    isCurrent(c.href) ? "bg-white/5 text-glow" : "text-mist hover:bg-white/5"
                                  }`}
                                >
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </m.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={n.href}
                      aria-current={isActive(n.href) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`block rounded-xl px-4 py-3 text-lg ${isActive(n.href) ? "bg-white/5 text-glow" : "text-moon hover:bg-white/5"}`}
                    >
                      {n.label}
                    </Link>
                  )}
                </m.li>
              ))}
              <li className="mt-3 px-1">
                <LumaButton source="mobile-nav" className="w-full" />
              </li>
            </ul>
          </m.nav>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
