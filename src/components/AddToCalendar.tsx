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
  // 手機：兩顆按鈕各佔半寬並排（縮小左右內距以免溢出）；sm 以上回到一般 inline 排列
  const cls = compact ? "btn btn-ghost btn-sm" : "btn btn-ghost max-sm:px-2 max-sm:text-sm";
  return (
    <div className={`grid grid-cols-2 gap-2 sm:flex sm:flex-wrap ${className}`}>
      <a href={googleCalUrl(event)} target="_blank" rel="noopener" className={cls} aria-label={`將「${event.title}」加入 Google 行事曆`} data-track="calendar_add" data-track-method="google" data-track-item={icsId}>
        <CalendarPlus aria-hidden size={compact ? 15 : 18} />
        Google 行事曆
      </a>
      <a href={`/calendar/${icsId}.ics`} download className={cls} aria-label={`下載「${event.title}」的 .ics 行事曆檔（Apple／Outlook）`} data-track="calendar_add" data-track-method="ics" data-track-item={icsId}>
        <CalendarPlus aria-hidden size={compact ? 15 : 18} />
        Apple／Outlook
      </a>
    </div>
  );
}
