/**
 * GA4 自訂事件：推進 GTM 的 dataLayer，再由 GTM 轉發給 GA4。
 * 事件名稱與參數的說明見 docs/GA4教學.md。
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** 所有事件共用的參數名稱；GTM 裡每個都要建一個「資料層變數」 */
const KEYS = ["source", "method", "item", "item_name", "game", "action", "search_term", "results"] as const;

type Key = (typeof KEYS)[number];
export type TrackParams = Partial<Record<Key, string | number>>;

export function track(event: string, params: TrackParams = {}) {
  if (typeof window === "undefined") return;
  // GTM 的資料層會保留上一個事件的值；沒用到的參數明確清成 undefined，避免串到下一個事件
  const payload: Record<string, unknown> = { event };
  for (const k of KEYS) payload[k] = params[k];
  (window.dataLayer = window.dataLayer || []).push(payload);
}

/**
 * 讓伺服器元件也能記錄點擊：在元素加上
 *   data-track="calendar_add" data-track-method="google" data-track-item="festival"
 * 由 <TrackClicks /> 統一監聽。
 */
export function trackFromElement(el: HTMLElement) {
  const event = el.dataset.track;
  if (!event) return;
  const params: TrackParams = {};
  for (const k of KEYS) {
    const attr = "track" + k.replace(/(^|_)(\w)/g, (_, __, c: string) => c.toUpperCase());
    const v = el.dataset[attr];
    if (v !== undefined) params[k] = v;
  }
  track(event, params);
}
