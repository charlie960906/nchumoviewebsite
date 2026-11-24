"use client";

import Link from "next/link";
import { useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { CalendarPlus, ChevronRight } from "lucide-react";
import { days, sessions, type Session } from "@/lib/schedule";
import { googleCalUrl, sessionEvent } from "@/lib/calendar";
import SplitFlap from "./SplitFlap";
import { useSlidingPill } from "@/lib/useSlidingPill";

/**
 * 活動時間表：以真正的 HTML <table> 呈現（利於 SEO／AEO 與螢幕閱讀器）。
 * 日期切換放在表頭「活動」那一列右側；切換只是切換顯示，兩天的完整資料始終在 DOM 中。
 */
export default function Schedule({ compact = false }: { compact?: boolean }) {
  const [day, setDay] = useState<Session["day"]>("0319");
  // 第一次渲染不播進場動畫（避免 SSR 內容先隱形），使用者切換日期後才播
  const [switched, setSwitched] = useState(false);
  const reduce = useReducedMotion();
  const current = days.find((d) => d.key === day)!;

  // Tabs sliding（transitions.dev）：膠囊滑到選中的日期，邏輯在 useSlidingPill
  const { pillRef, tabRef, ready: pillReady } = useSlidingPill(day);

  return (
    <div>
      <div className="card overflow-hidden">
        <table className="schedule-table">
          <caption className="sr-only">{current.full} 活動時間表</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[5.75rem] pl-4 sm:w-44 sm:pl-5">
                時間
              </th>
              {/* 「活動」標題與日期切換同一列：日期切換靠右，橫跨活動欄與操作欄 */}
              <th scope="col" colSpan={compact ? 1 : 2} className="pr-3 sm:pr-5">
                <span className="flex items-center justify-between gap-3">
                  <span>活動</span>
                  <span role="group" aria-label="選擇日期" className="t-tabs relative flex gap-1 rounded-lg bg-white/[0.04] p-1 tracking-normal">
                    <span ref={pillRef} aria-hidden className="t-tabs-pill rounded-md bg-glow" />
                    {days.map((d, i) => {
                      const active = day === d.key;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          ref={tabRef(d.key)}
                          aria-pressed={active}
                          onClick={() => {
                            if (active) return;
                            setSwitched(true);
                            setDay(d.key);
                          }}
                          className={`t-tab relative z-[1] rounded-md px-2.5 py-1.5 sm:px-3.5 ${active ? "text-night" : "text-mist hover:text-glow"} ${active && !pillReady ? "bg-glow" : ""}`}
                        >
                          <span className="relative flex items-baseline gap-1.5 whitespace-nowrap">
                            <span className="font-mono text-sm font-bold tabular-nums">{d.date.slice(5).replace("-", ".")}</span>
                            <span className="hidden text-[11px] font-medium sm:inline">
                              週{d.weekday}・第{i === 0 ? "一" : "二"}夜
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          {/* 兩天的資料都留在 DOM（利於 SEO），只切換顯示；切到哪天就重新掛載那天的 tbody，時間欄播放翻頁板動畫 */}
          {days.map((d) => {
            const rows = sessions.filter((s) => s.day === d.key);
            const active = day === d.key;
            return (
              <tbody key={`${d.key}-${active}`} id={`panel-${d.key}`} hidden={!active}>
                  {rows.map((s, i) => {
                    // 切換日期時，時間以機械翻頁板方式翻到新的數字
                    const flapIn = active && switched && !reduce;
                    return (
                      <m.tr
                        key={s.id}
                        className={s.category === "film" ? "bg-shore/[0.07]" : ""}
                        initial={flapIn ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.18, delay: i * 0.035 }}
                      >
                        <td className={`pl-4 font-mono text-sm tabular-nums sm:pl-5 ${s.category === "film" ? "font-bold text-shore" : "text-mist"}`}>
                          {/* 手機：開始／結束上下排，結束時間淡一階；平板以上同一行 */}
                          <time dateTime={`${d.date}T${s.start}+08:00`}>
                            <SplitFlap text={s.start} animate={flapIn} delay={i * 60} />
                          </time>
                          <span className="hidden text-dim sm:inline"> – </span>
                          <time dateTime={`${d.date}T${s.end}+08:00`} className="block text-xs text-dim sm:inline sm:text-sm sm:text-mist">
                            <SplitFlap text={s.end} animate={flapIn} delay={i * 60 + 120} />
                          </time>
                        </td>
                        <th scope="row" className="font-normal">
                          <span className="flex items-start gap-2.5">
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
                        {!compact && (
                          <td className="w-12 pr-3 text-right sm:w-16 sm:pr-5">
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
                              </span>
                            )}
                          </td>
                        )}
                      </m.tr>
                    );
                  })}
              </tbody>
            );
          })}
        </table>
      </div>

      <p className="mt-4 text-sm text-dim">
        標示「待定」的場次仍在安排中，確定後會同步更新本頁與 Luma 活動頁。
        <a href="/calendar/all.ics" download data-track="calendar_add" data-track-method="ics" data-track-item="all" className="ml-1 text-glow underline-offset-4 hover:underline">
          下載完整時間表（.ics）
        </a>
      </p>
    </div>
  );
}
