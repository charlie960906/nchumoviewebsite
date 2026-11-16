"use client";

import { useEffect } from "react";
import { BellRing } from "lucide-react";
import { site } from "@/lib/site";

declare global {
  interface Window {
    luma?: { initCheckout?: () => void };
  }
}

type Props = {
  children?: React.ReactNode;
  className?: string;
  size?: "md" | "sm";
  variant?: "primary" | "ghost";
  icon?: boolean;
  /** 來源標記（Luma 後台可依 utm_source 分析） */
  source?: string;
};

/**
 * 訂閱 Luma 活動提醒（活動本身不需報名，可直接到場）：點擊後由 Luma checkout 腳本開啟站內彈窗。
 * 腳本尚未載入或被阻擋時，連結本身即為 Luma 活動頁（新分頁）。
 */
export default function LumaButton({
  children = "訂閱活動提醒",
  className = "",
  size = "md",
  variant = "primary",
  icon = true,
  source = "official-site",
}: Props) {
  useEffect(() => {
    // SPA 換頁後新出現的按鈕需要重新綁定
    window.luma?.initCheckout?.();
  }, []);

  return (
    <a
      href={`${site.luma.url}?utm_source=${source}`}
      target="_blank"
      rel="noopener"
      className={`btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${size === "sm" ? "btn-sm" : ""} ${className}`}
      data-luma-action="checkout"
      data-luma-event-id={site.luma.eventId}
    >
      {icon && <BellRing aria-hidden size={size === "sm" ? 15 : 18} />}
      {children}
    </a>
  );
}
