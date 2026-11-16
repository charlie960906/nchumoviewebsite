"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { m } from "motion/react";
import { CalendarPlus, ChevronRight } from "lucide-react";
import { categories, days, sessions, type Category, type Session } from "@/lib/schedule";
import { googleCalUrl, sessionEvent } from "@/lib/calendar";
import LumaButton from "./LumaButton";

const filterable: Category[] = ["film", "talk", "show", "game", "market"];

/**
 * 活動時間表：以真正的 HTML <table> 呈現（利於 SEO／AEO 與螢幕閱讀器）。
 * 篩選只是切換列的顯示，兩天的完整資料始終在 DOM 中。
 */
export default function Schedule({ showFilters = true, compact = false }: { showFilters?: boolean; compact?: boolean }) {
  const [day, setDay] = useState<Session["day"]>("0319");
  const [cat, setCat] = useState<Category | "all">("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of sessions) c[s.category] = (c[s.category] ?? 0) + 1;
    return c;
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="選擇日期" className="card flex w-full gap-1 p-1 sm:inline-flex sm:w-auto">
          {days.map((d) => {
            const active = day === d.key;
            return (
              <button
                key={d.key}
                role="tab"
                id={`tab-${d.key}`}
                aria-selected={active}
                aria-controls={`panel-${d.key}`}
                onClick={() => setDay(d.key)}
                className={`relative flex-1 rounded-xl px-5 py-2.5 text-sm font-bold sm:flex-none transition-colors duration-200 ${active ? "text-night" : "text-mist hover:text-glow"}`}
              >
                {active && (
                  <m.span
                    layoutId="day-pill"
                    className="absolute inset-0 rounded-xl bg-glow"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative font-mono">
                  {d.label}
                  <span className="ml-1.5 font-sans font-medium">（{d.weekday}）</span>
                </span>
              </button>
            );
          })}
        </div>

        {showFilters && (
          <div role="group" aria-label="依活動類型篩選" className="flex flex-wrap gap-2">
            {(["all", ...filterable] as const).map((k) => {
              const active = cat === k;
              return (
                <button
                  key={k}
                  aria-pressed={active}
                  onClick={() => setCat(k)}
                  className={`tag min-h-9 cursor-pointer !px-3 transition-colors duration-200 ${active ? "tag-glow" : "hover:border-glow/60"}`}
                >
                  {k !== "all" && <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: categories[k].dot }} />}
                  {k === "all" ? "全部" : categories[k].label}
                  {k !== "all" && <span className="font-mono text-[11px] text-dim">{counts[k]}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {days.map((d) => {
        const rows = sessions.filter((s) => s.day === d.key);
        const shown = rows.filter((s) => cat === "all" || s.category === cat);
        return (
          <div key={d.key} id={`panel-${d.key}`} role="tabpanel" aria-labelledby={`tab-${d.key}`} hidden={day !== d.key} className="mt-6">
            <div className="card overflow-hidden">
              <table className="schedule-table">
                <caption className="sr-only">
                  {d.full} 活動時間表
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-[5.75rem] pl-4 sm:w-40 sm:pl-5">
                      時間
                    </th>
                    <th scope="col">活動</th>
                    <th scope="col" className="hidden w-32 md:table-cell">
                      類型
                    </th>
                    {!compact && (
                      <th scope="col" className="w-12 pr-3 text-right sm:w-44 sm:pr-5">
                        <span className="sr-only">操作</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const c = categories[s.category];
                    const visible = cat === "all" || s.category === cat;
                    return (
                      <tr key={s.id} hidden={!visible} className={s.category === "film" ? "bg-glow/[0.06]" : ""}>
                        <td className="pl-4 font-mono text-sm tabular-nums text-mist sm:pl-5">
                          {/* 手機：開始／結束上下排，結束時間淡一階；平板以上同一行 */}
                          <time dateTime={`${d.date}T${s.start}+08:00`}>{s.start}</time>
                          <span className="hidden text-dim sm:inline"> – </span>
                          <time dateTime={`${d.date}T${s.end}+08:00`} className="block text-xs text-dim sm:inline sm:text-sm sm:text-mist">
                            {s.end}
                          </time>
                        </td>
                        <th scope="row" className="font-normal">
                          <span className="flex items-start gap-2.5">
                          <span aria-hidden className="mt-[0.55rem] h-2 w-2 shrink-0 rounded-full md:hidden" style={{ background: c.dot }} />
                          <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            {s.program ? (
                              <Link href={`/program/${s.program}`} className="inline-flex items-center gap-0.5 font-medium hover:text-glow">
                                {s.title}
                                <ChevronRight aria-hidden size={15} className="text-dim" />
                              </Link>
                            ) : (
                              <span className="font-medium">{s.title}</span>
                            )}
                            {s.tentative && <span className="tag tag-warn">待定</span>}
                          </span>
                          {s.note && <span className="mt-0.5 block text-xs text-dim">{s.note}</span>}
                          </span>
                          </span>
                        </th>
                        <td className="hidden md:table-cell">
                          <span className="tag">
                            <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: c.dot }} />
                            {c.label}
                          </span>
                        </td>
                        {!compact && (
                          <td className="pr-3 text-right sm:pr-5">
                            {s.category !== "closing" && (
                              <span className="inline-flex items-center justify-end gap-2">
                                <a
                                  href={googleCalUrl(sessionEvent(s.id)!)}
                                  target="_blank"
                                  rel="noopener"
                                  className="grid h-9 w-9 place-items-center rounded-lg text-dim hover:bg-white/10 hover:text-glow"
                                  aria-label={`將 ${d.label} ${s.start} ${s.title} 加入 Google 行事曆`}
                                  title="加入行事曆"
                                >
                                  <CalendarPlus aria-hidden size={17} />
                                </a>
                                {(s.category === "film" || s.category === "talk") && (
                                  <LumaButton size="sm" icon={false} source={`schedule-${s.id}`} className="hidden sm:inline-flex">
                                    提醒我
                                  </LumaButton>
                                )}
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {shown.length === 0 && <p className="px-5 py-8 text-center text-sm text-dim">這一天沒有符合的場次。</p>}
            </div>
          </div>
        );
      })}

      <p className="mt-4 text-sm text-dim">
        標示「待定」的場次仍在安排中，確定後會同步更新本頁與 Luma 活動頁。
        <a href="/calendar/all.ics" download className="ml-1 text-glow underline-offset-4 hover:underline">
          下載完整時間表（.ics）
        </a>
      </p>
    </div>
  );
}
