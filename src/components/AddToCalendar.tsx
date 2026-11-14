import { CalendarPlus } from "lucide-react";
import { festivalEvent, googleCalUrl, type CalEvent } from "@/lib/calendar";

/** 行事曆同步：Google 行事曆連結 + .ics（Apple／Outlook）。 */
export default function AddToCalendar({
  event = festivalEvent,
  icsId = "festival",
  compact = false,
  className = "",
}: {
  event?: CalEvent;
  icsId?: string;
  compact?: boolean;
  className?: string;
}) {
  const cls = compact ? "btn btn-ghost btn-sm" : "btn btn-ghost";
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <a href={googleCalUrl(event)} target="_blank" rel="noopener" className={cls} aria-label={`將「${event.title}」加入 Google 行事曆`}>
        <CalendarPlus aria-hidden size={compact ? 15 : 18} />
        Google 行事曆
      </a>
      <a href={`/calendar/${icsId}.ics`} download className={cls} aria-label={`下載「${event.title}」的 .ics 行事曆檔（Apple／Outlook）`}>
        <CalendarPlus aria-hidden size={compact ? 15 : 18} />
        Apple／Outlook
      </a>
    </div>
  );
}
