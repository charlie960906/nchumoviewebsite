import { buildIcs, festivalEvent, sessionEvent, type CalEvent } from "@/lib/calendar";
import { sessions } from "@/lib/schedule";

/**
 * 靜態匯出的行事曆檔：/calendar/festival.ics、/calendar/all.ics、/calendar/<sessionId>.ics
 * 於建置時全部產生，不需要伺服器。
 */
export const dynamic = "force-static";
export const dynamicParams = false;

const listed = sessions.filter((s) => s.category !== "closing");

export function generateStaticParams() {
  return ["festival", "all", ...listed.map((s) => s.id)].map((id) => ({ file: `${id}.ics` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const id = (await params).file.replace(/\.ics$/, "");
  let events: CalEvent[];
  if (id === "festival") events = [festivalEvent];
  else if (id === "all") events = listed.map((s) => sessionEvent(s.id)!);
  else {
    const e = sessionEvent(id);
    if (!e) return new Response("Not found", { status: 404 });
    events = [e];
  }
  return new Response(buildIcs(events), { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
}
