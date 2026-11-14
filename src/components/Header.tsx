"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";
import { nav, site } from "@/lib/site";
import { THEME } from "@/lib/theme";
import LumaButton from "./LumaButton";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  /** 桌機版目前展開的下拉選單（以父項目的 href 識別） */
  const [menu, setMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    `relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors duration-200 hover:text-glow ${active ? "text-glow" : "text-mist"}`;

  const underline = (
    <motion.span
      layoutId="nav-underline"
      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-glow"
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    />
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open ? "border-b border-white/10 bg-night/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${site.fullName} 首頁`}>
          <span className="leading-tight">
            <span className="block font-serif text-[15px] font-bold tracking-wider">{THEME}</span>
            <span className="block text-[11px] text-dim">興大國際星空電影節</span>
          </span>
        </Link>

        <nav ref={navRef} aria-label="主選單" className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => {
            const active = isActive(n.href);
            if (!n.children) {
              return (
                <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={itemClass(active)}>
                  {n.label}
                  {active && underline}
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
                  {active && underline}
                </button>
                <AnimatePresence>
                  {expanded && (
                    <motion.ul
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
                            onClick={() => setMenu(null)}
                            aria-current={isCurrent(c.href) ? "page" : undefined}
                            className={`block whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors duration-200 hover:bg-white/5 hover:text-glow ${
                              isCurrent(c.href) ? "text-glow" : "text-mist"
                            }`}
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
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

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="行動版選單"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/10 bg-night/95 lg:hidden"
          >
            <ul className="container-x flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto py-4">
              {nav.map((n, i) => (
                <motion.li
                  key={n.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 + i * 0.05, duration: 0.3 }}
                >
                  {n.children ? (
                    <>
                      <p className={`px-4 pb-1 pt-3 text-xs tracking-widest ${isActive(n.href) ? "text-glow" : "text-dim"}`}>{n.label}</p>
                      <ul className="grid gap-1">
                        {n.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              aria-current={isCurrent(c.href) ? "page" : undefined}
                              onClick={() => setOpen(false)}
                              className={`block rounded-xl px-4 py-3 text-lg ${isCurrent(c.href) ? "bg-glow/10 text-glow" : "text-moon hover:bg-white/5"}`}
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={n.href}
                      aria-current={isActive(n.href) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`block rounded-xl px-4 py-3 text-lg ${isActive(n.href) ? "bg-glow/10 text-glow" : "text-moon hover:bg-white/5"}`}
                    >
                      {n.label}
                    </Link>
                  )}
                </motion.li>
              ))}
              <li className="mt-3 px-1">
                <LumaButton source="mobile-nav" className="w-full" />
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
