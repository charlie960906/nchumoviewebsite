import { site } from "./site";
import { dayOf, iso, sessions } from "./schedule";

export type CalEvent = {
  uid: string;
  title: string;
  start: string; // ISO with offset
  end: string;
  description?: string;
  location?: string;
  url?: string;
  tentative?: boolean;
};

const utc = (isoStr: string) =>
  new Date(isoStr).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** RFC 5545：每行最多 75 octets，超過需折行 */
function fold(line: string) {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (enc.encode(cur + ch).length > (out.length ? 73 : 74)) {
      out.push(cur);
      cur = ch;
    } else cur += ch;
  }
  out.push(cur);
  return out.join("\r\n ");
}

export function buildIcs(events: CalEvent[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NCHU Ripple Film Festival//ZH-TW",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(site.fullName)}`,
    "X-WR-TIMEZONE:Asia/Taipei",
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@nchu-ripple-2027`,
      `DTSTAMP:${utc("2026-11-13T00:00:00+08:00")}`,
      `DTSTART:${utc(e.start)}`,
      `DTEND:${utc(e.end)}`,
      `SUMMARY:${esc(e.title)}`,
      `LOCATION:${esc(e.location ?? `${site.venue.name}（${site.venue.address}）`)}`,
      `DESCRIPTION:${esc(e.description ?? "")}`,
      `URL:${e.url ?? site.luma.url}`,
      `STATUS:${e.tentative ? "TENTATIVE" : "CONFIRMED"}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT2H",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(e.title)} 即將開始`,
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function googleCalUrl(e: CalEvent) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${utc(e.start)}/${utc(e.end)}`,
    details: `${e.description ?? ""}\n\n報名：${site.luma.url}`.trim(),
    location: e.location ?? `${site.venue.name} ${site.venue.address}`,
    ctz: "Asia/Taipei",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export const festivalEvent: CalEvent = {
  uid: "festival",
  title: site.fullName,
  start: site.start,
  end: site.end,
  description: `${site.description}`,
};

export function sessionEvent(id: string): CalEvent | null {
  const s = sessions.find((x) => x.id === id);
  if (!s) return null;
  return {
    uid: s.id,
    title: `${s.title}${s.tentative ? "（待定）" : ""}｜${site.shortName}`,
    start: iso(s.day, s.start),
    end: iso(s.day, s.end),
    description: `${site.fullName}\n${dayOf(s.day).full} ${s.start}–${s.end}${s.note ? `\n${s.note}` : ""}\n報名：${site.luma.url}`,
    tentative: s.tentative,
  };
}
