"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Spotify Embed iFrame API：頁面上放一個小的官方嵌入播放器（保留 Spotify 標誌，符合條款），
 * 播放／暫停／進度由我們自己的黑膠介面控制。
 * - 訪客沒登入 Spotify：播 30 秒試聽。
 * - 訪客在同一個瀏覽器登入過 Spotify：可聽完整首（Premium 無廣告）。
 * 嵌入播放器沒有音量 API，音量由訪客的裝置或嵌入播放器本身控制。
 */

type PlaybackUpdate = { data: { isPaused: boolean; isBuffering: boolean; duration: number; position: number } };

export type EmbedController = {
  loadUri: (uri: string) => void;
  play: () => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  destroy: () => void;
  addListener: {
    (ev: "ready", cb: () => void): void;
    (ev: "playback_update", cb: (e: PlaybackUpdate) => void): void;
  };
};

type IFrameAPI = {
  createController: (
    el: HTMLElement,
    opts: { uri: string; width?: string | number; height?: string | number },
    cb: (c: EmbedController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
  }
}

let apiPromise: Promise<IFrameAPI> | null = null;

/** 只載入一次 Spotify 的 iFrame API 腳本 */
function loadApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<IFrameAPI>((resolve, reject) => {
    window.onSpotifyIframeApiReady = resolve;
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.onerror = () => {
      apiPromise = null;
      reject(new Error("Spotify iFrame API 載入失敗"));
    };
    document.body.appendChild(s);
  });
  return apiPromise;
}

export const spotifyTrackUrl = (id: string) => `https://open.spotify.com/track/${id}`;

/**
 * 在 host 元素裡建立嵌入播放器並回傳播放狀態與控制方法。
 * trackId 為 null 時不載入任何東西。autoplay 為 true 時，播放器就緒後立刻嘗試播放
 * （使用者剛點過「抽出」，瀏覽器通常允許；被擋時 paused 會維持 true，按播放鍵即可）。
 */
export function useSpotifyEmbed(trackId: string | null, autoplay: boolean) {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrl = useRef<EmbedController | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [position, setPosition] = useState(0); // 毫秒
  const [duration, setDuration] = useState(0); // 毫秒

  useEffect(() => {
    const host = hostRef.current;
    if (!trackId || !host) return;
    let cancelled = false;
    setReady(false);
    setFailed(false);
    setPaused(true);
    setPosition(0);
    setDuration(0);

    // createController 會把傳入的元素整個換成 iframe，所以另建一個子元素，不讓它動到 React 管的節點
    const slot = document.createElement("div");
    host.appendChild(slot);

    loadApi()
      .then((api) => {
        if (cancelled) return;
        api.createController(slot, { uri: `spotify:track:${trackId}`, width: "100%", height: 80 }, (c) => {
          if (cancelled) {
            c.destroy();
            return;
          }
          ctrl.current = c;
          c.addListener("ready", () => {
            if (cancelled) return;
            setReady(true);
            if (autoplay) c.play();
          });
          c.addListener("playback_update", (e) => {
            if (cancelled) return;
            setPaused(e.data.isPaused);
            setBuffering(e.data.isBuffering);
            setPosition(e.data.position);
            setDuration(e.data.duration);
          });
        });
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
      ctrl.current?.destroy();
      ctrl.current = null;
      host.replaceChildren();
    };
    // autoplay 只在建立時讀一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId]);

  const toggle = useCallback(() => ctrl.current?.togglePlay(), []);
  const pause = useCallback(() => ctrl.current?.pause(), []);
  const seek = useCallback((ms: number) => {
    ctrl.current?.seek(ms / 1000);
    setPosition(ms);
  }, []);

  return { hostRef, ready, failed, paused, buffering, position, duration, toggle, pause, seek };
}

export const fmtTime = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
