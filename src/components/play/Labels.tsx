"use client";

import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { RefreshCw } from "lucide-react";
import { relationLabels } from "@/lib/content";
import { track } from "@/lib/track";
import ShareCardButton from "./ShareCardButton";

const MAX = 3;
const relations = ["家人", "朋友", "室友", "伴侶", "同學", "很久沒聯絡的人"];

/** 展區「佮」貼標籤小遊戲：為一段關係貼上三張標籤，生成關係名片。資料只留在瀏覽器，不會上傳。 */
export default function Labels() {
  const [who, setWho] = useState("");
  const [rel, setRel] = useState(relations[1]);
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const toggle = (l: string) =>
    setPicked((p) => (p.includes(l) ? p.filter((x) => x !== l) : p.length < MAX ? [...p, l] : p));

  const name = who.trim() || "某個人";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="card p-6 md:p-8">
        <ol className="grid gap-8">
          <li>
            <label htmlFor="who" className="block font-bold">
              <span className="mr-2 font-mono text-glow">01</span>想到的那個人是？
            </label>
            <input
              id="who"
              value={who}
              onChange={(e) => setWho(e.target.value.slice(0, 12))}
              placeholder="暱稱就好（可留空）"
              autoComplete="off"
              className="mt-3 h-12 w-full rounded-xl border border-white/20 bg-white/5 px-4 text-moon placeholder:text-dim focus:border-glow focus:outline-none"
            />
          </li>
          <li>
            <fieldset>
              <legend className="font-bold">
                <span className="mr-2 font-mono text-glow">02</span>你們是？
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {relations.map((r) => (
                  <label key={r} className={`tag cursor-pointer !px-4 !py-1.5 !text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-glow ${rel === r ? "tag-glow" : ""}`}>
                    <input type="radio" name="rel" value={r} checked={rel === r} onChange={() => setRel(r)} className="sr-only" />
                    {r}
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
          <li>
            <fieldset>
              <legend className="font-bold">
                <span className="mr-2 font-mono text-glow">03</span>貼上三張標籤
                <span className="ml-2 font-mono text-sm font-normal text-dim">
                  {picked.length} / {MAX}
                </span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {relationLabels.map((l) => {
                  const on = picked.includes(l);
                  const full = !on && picked.length >= MAX;
                  return (
                    <m.button
                      key={l}
                      type="button"
                      aria-pressed={on}
                      disabled={full}
                      onClick={() => toggle(l)}
                      whileTap={{ scale: 0.94 }}
                      animate={{ rotate: on ? (l.length % 2 ? -2 : 2) : 0 }}
                      className={`rounded-lg border px-3.5 py-2 text-sm transition-colors duration-200 disabled:opacity-35 ${
                        on ? "border-glow bg-glow text-night" : "border-white/20 bg-white/5 text-mist hover:border-glow/60"
                      }`}
                    >
                      {l}
                    </m.button>
                  );
                })}
              </div>
            </fieldset>
          </li>
        </ol>
        <button type="button" disabled={picked.length === 0} onClick={() => (setDone(true), track("interactive_play", { game: "labels", action: "complete", item: rel }))} className="btn btn-primary mt-8">
          生成關係名片
        </button>
      </div>

      <div aria-live="polite">
        <AnimatePresence mode="wait">
          {done && picked.length > 0 ? (
            <m.div key="card" initial={{ opacity: 0, y: 24, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              <div className="card relative overflow-hidden p-7 text-center" style={{ background: "radial-gradient(80% 70% at 50% 30%, rgba(140,196,236,.2), transparent), #031C24" }}>
                <p className="eyebrow">關係名片</p>
                <p className="mt-5 font-serif text-3xl font-bold">我佮{name}</p>
                <p className="mt-1 text-sm text-dim">{rel}</p>
                <ul className="mt-6 flex flex-wrap justify-center gap-2">
                  {picked.map((l, i) => (
                    <m.li
                      key={l}
                      initial={{ opacity: 0, scale: 1.4, rotate: 8 }}
                      animate={{ opacity: 1, scale: 1, rotate: [-3, 2, -1][i] }}
                      transition={{ delay: 0.25 + i * 0.15, type: "spring", stiffness: 400, damping: 18 }}
                      className="rounded-lg bg-glow px-3.5 py-2 text-sm font-bold text-night"
                    >
                      {l}
                    </m.li>
                  ))}
                </ul>
                <p className="prose-poem mt-7 text-sm text-mist">「佮」是和、與——是終於能說出「我佮你」的那個時刻。</p>
              </div>
              <div className="mt-4 flex flex-wrap items-start gap-3">
                <ShareCardButton
                  game="labels"
                  filename="ripple-relation-card.png"
                  spec={{ kicker: `關係名片・${rel}`, lines: [`我佮${name}`, ...picked.map((p) => `「${p}」`)], sub: "展區「佮」— 泅：親情與友情" }}
                />
                <button type="button" onClick={() => (setDone(false), setPicked([]))} className="btn btn-ghost">
                  <RefreshCw aria-hidden size={17} />
                  重貼
                </button>
              </div>
            </m.div>
          ) : (
            <m.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card grid min-h-[280px] place-items-center border-dashed p-8 text-center text-dim">
              <p>
                選好標籤後，
                <br />
                你們的關係名片會出現在這裡。
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
