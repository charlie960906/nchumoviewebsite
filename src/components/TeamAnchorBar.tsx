"use client";

import { useEffect, useRef, useState } from "react";

/** 團隊頁底部浮動的部門錨點列：捲動時標示目前所在部門，點擊平滑跳轉。 */
export default function TeamAnchorBar({ groups }: { groups: { id: string; label: string }[] }) {
  const [active, setActive] = useState(groups[0]?.id);
  const [visible, setVisible] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = groups.map((g) => document.getElementById(`crew-${g.id}`)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const onScroll = () => {
      const line = window.innerHeight * 0.35;
      let cur = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id;
      setActive(cur.replace("crew-", ""));
      const first = els[0].getBoundingClientRect().top;
      const last = els[els.length - 1].getBoundingClientRect().bottom;
      setVisible(first < window.innerHeight * 0.8 && last > window.innerHeight * 0.3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [groups]);

  // 手機寬度時，讓目前部門的按鈕保持在錨點列的可視範圍內。
  // 只橫向捲動錨點列本身；不可用 scrollIntoView，否則會連帶捲動整頁、打斷換頁時回到頂端的捲動。
  useEffect(() => {
    const list = listRef.current;
    const btn = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !btn || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: btn.offsetLeft - (list.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="部門快速導覽"
      className={`fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div
        ref={listRef}
        className="no-scrollbar relative flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-night/70 p-1.5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.6)] backdrop-blur-xl"
      >
        {groups.map((g) => {
          const on = g.id === active;
          return (
            <a
              key={g.id}
              data-id={g.id}
              href={`#crew-${g.id}`}
              aria-current={on ? "true" : undefined}
              tabIndex={visible ? 0 : -1}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                on ? "bg-glow/15 font-bold text-glow" : "text-dim hover:text-mist"
              }`}
            >
              {g.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
