"use client";

import { useEffect, useRef } from "react";

/**
 * 首頁 Hero 背景：點陣圓點組成的游魚（俯視）。
 * 作法：每幀先在「一格一像素」的低解析離屏畫布上，以向量路徑畫出魚身、鰭與斑紋，
 * 再逐格取樣顏色與覆蓋率，轉成大小不一的圓點。
 * 魚種：錦鯉、琉金（大扇尾）、魟（鰭翼起伏、細長鞭尾）、銀魚（細長、側線），以及一小群跟著領頭游的幼魚。
 * 尾鰭每擺到最外側時，在尾端泛起一圈雙環漣漪。
 * - 游標靠近時魚會受驚轉向、加速擺尾。
 * - 離開視窗或分頁隱藏即暫停；prefers-reduced-motion 只畫一張靜態畫面。
 * 純裝飾（aria-hidden）。
 */

type RGB = [number, number, number];
type Spot = { s: number; side: number; r: number; color: RGB };

type Species = {
  name: "koi" | "goldfish" | "ray" | "slender" | "fry";
  /** 相對基準身長的比例 */
  lenScale: number;
  /** 最寬處半寬 / 身長 */
  width: number;
  /** 沿身長 s∈[0,1] 的寬度輪廓 */
  profile: [number, number][];
  tail: "fork" | "fan" | "whip";
  /** 尾鰭長 / 身長 */
  tailLen: number;
  /** 胸鰭、腹鰭大小（0 = 無） */
  pect: number;
  pelvic: number;
  /** 身體擺動幅度與波數 */
  amp: number;
  wave: number;
  speed: [number, number];
  /** 轉彎半徑（身長倍數） */
  turnR: number;
  /** 鰭翼起伏（魟） */
  flap: number;
  /** 側線（銀魚） */
  stripe: boolean;
  spots: [number, number];
  eye: { s: number; spread: number; r: number };
  ripple: { chance: number; size: number };
  palettes: { color: RGB; belly: RGB; spot: RGB }[];
};

const SPECIES: Record<Species["name"], Species> = {
  koi: {
    name: "koi",
    lenScale: 1,
    width: 0.16,
    profile: [
      [0, 0.52],
      [0.08, 0.88],
      [0.24, 1],
      [0.45, 0.9],
      [0.66, 0.62],
      [0.85, 0.32],
      [1, 0.2],
    ],
    tail: "fork",
    tailLen: 0.34,
    pect: 0.17,
    pelvic: 0.1,
    amp: 0.075,
    wave: 2.4,
    speed: [2.6, 3.8],
    turnR: 0.7,
    flap: 0,
    stripe: false,
    spots: [2, 4],
    eye: { s: 0.07, spread: 0.62, r: 0.6 },
    ripple: { chance: 0.6, size: 0.26 },
    palettes: [
      { color: [226, 232, 240], belly: [248, 250, 252], spot: [240, 140, 80] }, // 白底紅斑
      { color: [236, 166, 98], belly: [253, 214, 160], spot: [248, 250, 252] }, // 黃金
    ],
  },
  goldfish: {
    name: "goldfish",
    lenScale: 0.72,
    width: 0.26,
    profile: [
      [0, 0.6],
      [0.12, 0.95],
      [0.35, 1],
      [0.6, 0.78],
      [0.82, 0.42],
      [1, 0.3],
    ],
    tail: "fan",
    tailLen: 0.8,
    pect: 0.22,
    pelvic: 0.16,
    amp: 0.05,
    wave: 1.8,
    speed: [1.6, 2.4],
    turnR: 0.6,
    flap: 0,
    stripe: false,
    spots: [1, 2],
    eye: { s: 0.1, spread: 0.7, r: 0.75 },
    ripple: { chance: 0.5, size: 0.3 },
    palettes: [{ color: [248, 120, 72], belly: [254, 205, 160], spot: [255, 240, 225] }],
  },
  ray: {
    name: "ray",
    lenScale: 0.95,
    width: 0.46,
    profile: [
      [0, 0.25],
      [0.12, 0.7],
      [0.32, 1],
      [0.5, 0.8],
      [0.68, 0.28],
      [0.82, 0.1],
      [1, 0.05],
    ],
    tail: "whip",
    tailLen: 0.75,
    pect: 0,
    pelvic: 0,
    amp: 0.018,
    wave: 1.2,
    speed: [1.8, 2.6],
    turnR: 1.0,
    flap: 0.16,
    stripe: false,
    spots: [7, 10],
    eye: { s: 0.16, spread: 0.32, r: 0.55 },
    ripple: { chance: 0.45, size: 0.28 },
    palettes: [{ color: [8, 145, 178], belly: [56, 189, 248], spot: [165, 230, 250] }],
  },
  slender: {
    name: "slender",
    lenScale: 1.05,
    width: 0.085,
    profile: [
      [0, 0.45],
      [0.1, 0.85],
      [0.3, 1],
      [0.6, 0.72],
      [0.85, 0.32],
      [1, 0.18],
    ],
    tail: "fork",
    tailLen: 0.24,
    pect: 0.1,
    pelvic: 0,
    amp: 0.09,
    wave: 2.8,
    speed: [3.4, 4.8],
    turnR: 0.7,
    flap: 0,
    stripe: true,
    spots: [0, 0],
    eye: { s: 0.06, spread: 0.6, r: 0.5 },
    ripple: { chance: 0.45, size: 0.22 },
    palettes: [{ color: [148, 197, 235], belly: [224, 242, 254], spot: [224, 242, 254] }],
  },
  fry: {
    name: "fry",
    lenScale: 0.34,
    width: 0.13,
    profile: [
      [0, 0.6],
      [0.2, 1],
      [0.55, 0.7],
      [1, 0.25],
    ],
    tail: "fork",
    tailLen: 0.35,
    pect: 0,
    pelvic: 0,
    amp: 0.1,
    wave: 2.2,
    speed: [3.6, 4.4],
    turnR: 0.5,
    flap: 0,
    stripe: false,
    spots: [0, 0],
    eye: { s: 0.1, spread: 0.5, r: 0.45 },
    ripple: { chance: 0.06, size: 0.45 },
    palettes: [{ color: [56, 189, 248], belly: [186, 230, 253], spot: [186, 230, 253] }],
  },
};

type Fish = {
  sp: Species;
  x: number;
  y: number;
  heading: number;
  speed: number;
  baseSpeed: number;
  len: number;
  halfW: number;
  phase: number;
  chain: { x: number; y: number }[];
  color: RGB;
  belly: RGB;
  spots: Spot[];
  tx: number;
  ty: number;
  retarget: number;
  scared: number;
  lastBeat: number;
  /** 幼魚群：跟隨領頭的位置偏移（領頭座標系，x 朝前） */
  leader?: Fish;
  offset?: { x: number; y: number };
};

type Ripple = { x: number; y: number; age: number; life: number; strength: number; maxR: number };

const SEG = 14;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const angDiff = (a: number, b: number) => {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
};
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function profileAt(profile: [number, number][], s: number) {
  for (let i = 1; i < profile.length; i++) {
    const [s1, w1] = profile[i];
    if (s <= s1) {
      const [s0, w0] = profile[i - 1];
      const t = (s - s0) / (s1 - s0);
      return w0 + (w1 - w0) * t * t * (3 - 2 * t);
    }
  }
  return profile[profile.length - 1][1];
}

function makeFish(sp: Species, idx: number, cols: number, rows: number, baseLen: number, at?: { x: number; y: number; heading: number }): Fish {
  const pal = sp.palettes[idx % sp.palettes.length];
  const x = at?.x ?? rand(cols * 0.1, cols * 0.9);
  const y = at?.y ?? rand(rows * 0.15, rows * 0.85);
  const heading = at?.heading ?? rand(0, Math.PI * 2);
  const L = Math.max(5, baseLen * sp.lenScale * rand(0.9, 1.08));
  const seg = L / (SEG - 1);
  const chain = Array.from({ length: SEG }, (_, k) => ({
    x: x - Math.cos(heading) * seg * k,
    y: y - Math.sin(heading) * seg * k,
  }));
  const nSpots = Math.round(rand(sp.spots[0], sp.spots[1]));
  const ray = sp.name === "ray";
  const spots: Spot[] = Array.from({ length: nSpots }, () => ({
    s: rand(ray ? 0.15 : 0.12, ray ? 0.55 : 0.62),
    side: rand(ray ? -0.8 : -0.7, ray ? 0.8 : 0.7),
    r: ray ? rand(0.05, 0.09) : rand(0.25, 0.5),
    color: pal.spot,
  }));
  const baseSpeed = rand(sp.speed[0], sp.speed[1]);
  return {
    sp,
    x,
    y,
    heading,
    speed: baseSpeed,
    baseSpeed,
    len: L,
    halfW: L * sp.width,
    phase: rand(0, Math.PI * 2),
    chain,
    color: pal.color,
    belly: pal.belly,
    spots,
    tx: rand(0, cols),
    ty: rand(0, rows),
    retarget: rand(3, 7),
    scared: 0,
    lastBeat: 0,
  };
}

const LINEUP: Species["name"][] = ["koi", "goldfish", "ray", "slender", "koi"];

function makeAll(cols: number, rows: number, baseLen: number): Fish[] {
  const count = clamp(Math.round((cols * rows) / 4200), 3, 5);
  const out: Fish[] = [];
  const used: Partial<Record<Species["name"], number>> = {};
  for (let i = 0; i < count; i++) {
    const name = LINEUP[i];
    used[name] = (used[name] ?? -1) + 1;
    out.push(makeFish(SPECIES[name], used[name]!, cols, rows, baseLen));
  }
  // 一小群幼魚：第一條自由游動，其餘跟隨
  const n = cols * rows > 9000 ? 6 : 4;
  const lead = makeFish(SPECIES.fry, 0, cols, rows, baseLen);
  out.push(lead);
  for (let i = 1; i < n; i++) {
    const offset = { x: -rand(1.2, 3.2) * i * 0.6 * lead.len, y: rand(-1, 1) * lead.len * (0.6 + i * 0.25) };
    const f = makeFish(SPECIES.fry, 0, cols, rows, baseLen, {
      x: lead.x + offset.x * Math.cos(lead.heading),
      y: lead.y + offset.x * Math.sin(lead.heading) + offset.y,
      heading: lead.heading,
    });
    f.leader = lead;
    f.offset = offset;
    out.push(f);
  }
  return out;
}

export default function AsciiKoi({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!ctx || !octx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cell = 8;
    let cols = 0;
    let rows = 0;
    let dpr = 1;
    let fish: Fish[] = [];
    const ripples: Ripple[] = [];
    let field = new Float32Array(0);
    let grid: HTMLCanvasElement | null = null;
    const pointer = { x: -1e4, y: -1e4 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      // 較細的點陣，讓魚的輪廓清楚
      const nextCell = rect.width < 640 ? 6 : rect.width < 1100 ? 7 : 8;
      const changed = nextCell !== cell || cols === 0;
      cell = nextCell;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      cols = Math.ceil(rect.width / cell);
      rows = Math.ceil(rect.height / cell);
      off.width = cols;
      off.height = rows;
      field = new Float32Array(cols * rows);

      if (changed) {
        const baseLen = clamp(Math.min(cols * 0.17, rows * 0.32), 18, 36);
        fish = makeAll(cols, rows, baseLen);
        ripples.length = 0;
      }

      // 靜態底紋：極淡的點陣格
      grid = document.createElement("canvas");
      grid.width = canvas.width;
      grid.height = canvas.height;
      const g = grid.getContext("2d")!;
      g.scale(dpr, dpr);
      g.fillStyle = "rgba(148,197,235,0.07)";
      for (let r = 0; r < rows; r += 2)
        for (let c = 0; c < cols; c += 2) g.fillRect(c * cell + cell / 2 - 0.5, r * cell + cell / 2 - 0.5, 1, 1);
    };

    // 骨架加上身體波動：越往尾巴擺幅越大
    const spine = (f: Fish) => {
      const out: { x: number; y: number; nx: number; ny: number }[] = [];
      for (let k = 0; k < SEG; k++) {
        const s = k / (SEG - 1);
        const a = f.chain[Math.max(0, k - 1)];
        const b = f.chain[Math.min(SEG - 1, k + 1)];
        const tx = a.x - b.x;
        const ty = a.y - b.y;
        const tl = Math.hypot(tx, ty) || 1;
        const nx = -ty / tl;
        const ny = tx / tl;
        const amp = f.len * f.sp.amp * (0.08 + Math.pow(s, 1.6));
        const o = Math.sin(f.phase - s * f.sp.wave) * amp;
        out.push({ x: f.chain[k].x + nx * o, y: f.chain[k].y + ny * o, nx, ny });
      }
      return out;
    };

    /* ───────── 模擬 ───────── */
    const step = (dt: number) => {
      for (const f of fish) {
        let desired: number;
        let target = f.baseSpeed;

        if (f.leader && f.offset) {
          // 幼魚：維持在領頭身後的相對位置
          const L = f.leader;
          const c = Math.cos(L.heading);
          const s = Math.sin(L.heading);
          const gx = L.x + f.offset.x * c - f.offset.y * s;
          const gy = L.y + f.offset.x * s + f.offset.y * c;
          desired = Math.atan2(gy - f.y, gx - f.x);
          const d = Math.hypot(gx - f.x, gy - f.y);
          target = L.speed * clamp(0.75 + d * 0.08, 0.6, 1.6);
        } else {
          // 選新目的地：允許略為游出畫面邊緣
          f.retarget -= dt;
          const dx = f.tx - f.x;
          const dy = f.ty - f.y;
          if (f.retarget < 0 || dx * dx + dy * dy < 16) {
            f.tx = rand(-cols * 0.08, cols * 1.08);
            f.ty = rand(-rows * 0.08, rows * 1.08);
            f.retarget = rand(4, 9);
          }
          desired = Math.atan2(f.ty - f.y, f.tx - f.x);
        }

        // 游標驚嚇
        const px = f.x - pointer.x;
        const py = f.y - pointer.y;
        if (Math.hypot(px, py) < Math.max(10, f.len * 0.8)) {
          f.scared = 1;
          desired = Math.atan2(py, px);
        }
        f.scared = Math.max(0, f.scared - dt * 0.6);
        target *= 1 + f.scared * 1.6;

        // 轉彎半徑不小於 turnR 個身長，避免身體捲成一團
        const turn = (f.speed / (f.len * f.sp.turnR)) * (1 + f.scared * 0.8) * dt;
        f.heading += clamp(angDiff(desired, f.heading), -turn, turn);
        f.speed += (target - f.speed) * Math.min(1, dt * 1.5);
        f.x += Math.cos(f.heading) * f.speed * dt;
        f.y += Math.sin(f.heading) * f.speed * dt;

        // 擺尾頻率隨速度（以身長正規化，小魚擺得快）
        f.phase += dt * Math.PI * 2 * (0.45 + (f.speed / f.len) * 3.2);

        // follow-the-leader 骨架
        const seg = f.len / (SEG - 1);
        f.chain[0].x = f.x;
        f.chain[0].y = f.y;
        for (let k = 1; k < SEG; k++) {
          const a = f.chain[k - 1];
          const b = f.chain[k];
          const ex = b.x - a.x;
          const ey = b.y - a.y;
          const d = Math.hypot(ex, ey) || 1;
          b.x = a.x + (ex / d) * seg;
          b.y = a.y + (ey / d) * seg;
        }

        // 尾鰭擺到最外側 → 一圈漣漪
        const beat = Math.cos(f.phase - f.sp.wave);
        if (Math.sign(beat) !== Math.sign(f.lastBeat) && f.lastBeat !== 0 && Math.random() < f.sp.ripple.chance) {
          const sp = spine(f);
          const tail = sp[SEG - 1];
          const prev = sp[SEG - 2];
          const tl = Math.hypot(tail.x - prev.x, tail.y - prev.y) || 1;
          const ext = f.len * Math.min(0.2, f.sp.tailLen * 0.4);
          ripples.push({
            x: tail.x + ((tail.x - prev.x) / tl) * ext,
            y: tail.y + ((tail.y - prev.y) / tl) * ext,
            age: 0,
            life: rand(1.9, 2.5),
            strength: clamp(0.85 + f.speed * 0.06, 0.9, 1.25),
            maxR: f.len * f.sp.ripple.size * rand(0.85, 1.15),
          });
        }
        f.lastBeat = beat;
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].age += dt;
        if (ripples[i].age > ripples[i].life) ripples.splice(i, 1);
      }
      if (ripples.length > 36) ripples.splice(0, ripples.length - 36);
    };

    /* ───────── 繪製魚到離屏低解析畫布 ───────── */
    const drawFish = (f: Fish, t: number) => {
      const S = f.sp;
      const sp = spine(f);
      const flapAt = (s: number) => (S.flap ? 1 + S.flap * Math.sin(t * 2.6 + f.phase * 0.2 - s * 5) : 1);
      const w = (k: number) => {
        const s = k / (SEG - 1);
        return profileAt(S.profile, s) * f.halfW * flapAt(s);
      };
      const at = (s: number) => {
        const p = s * (SEG - 1);
        const i = Math.min(SEG - 2, Math.floor(p));
        const u = p - i;
        const a = sp[i];
        const b = sp[i + 1];
        return {
          x: a.x + (b.x - a.x) * u,
          y: a.y + (b.y - a.y) * u,
          nx: a.nx,
          ny: a.ny,
          w: profileAt(S.profile, s) * f.halfW * flapAt(s),
        };
      };
      const tail = sp[SEG - 1];
      const prev = sp[SEG - 2];
      const tl = Math.hypot(tail.x - prev.x, tail.y - prev.y) || 1;
      const bx = (tail.x - prev.x) / tl; // 朝後方向
      const by = (tail.y - prev.y) / tl;
      const nx = -by;
      const ny = bx;
      const F = f.len * S.tailLen;
      const lag = Math.sin(f.phase - S.wave - 0.7);

      // 尾鰭單葉：從尾柄展開成水滴形，越末端擺得越晚
      const lobe = (angle: number, length: number, spread: number, alpha: number) => {
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const dx = bx * ca - nx * sa;
        const dy = by * ca - ny * sa;
        const px = -dy;
        const py = dx;
        const sway = lag * length * 0.3;
        const tipX = tail.x + dx * length + nx * sway;
        const tipY = tail.y + dy * length + ny * sway;
        const midX = tail.x + dx * length * 0.55 + nx * sway * 0.5;
        const midY = tail.y + dy * length * 0.55 + ny * sway * 0.5;
        const wb = w(SEG - 1) * 0.9;
        octx.fillStyle = rgba(f.color, alpha);
        octx.beginPath();
        octx.moveTo(tail.x + px * wb, tail.y + py * wb);
        octx.quadraticCurveTo(midX + px * length * spread, midY + py * length * spread, tipX, tipY);
        octx.quadraticCurveTo(midX - px * length * spread, midY - py * length * spread, tail.x - px * wb, tail.y - py * wb);
        octx.closePath();
        octx.fill();
      };

      if (S.tail === "fork") {
        lobe(0.5, F, 0.2, 0.75);
        lobe(-0.5, F, 0.2, 0.75);
      } else if (S.tail === "fan") {
        // 琉金：三片寬大、飄逸的尾鰭
        lobe(0.75, F * 0.95, 0.32, 0.5);
        lobe(-0.75, F * 0.95, 0.32, 0.5);
        lobe(0, F * 0.75, 0.3, 0.55);
      } else {
        // 魟：細長鞭尾
        octx.strokeStyle = rgba(f.color, 0.85);
        octx.lineCap = "round";
        octx.lineWidth = 1.1;
        octx.beginPath();
        octx.moveTo(tail.x, tail.y);
        const sway = lag * F * 0.18;
        octx.quadraticCurveTo(
          tail.x + bx * F * 0.5 + nx * sway,
          tail.y + by * F * 0.5 + ny * sway,
          tail.x + bx * F - nx * sway * 0.6,
          tail.y + by * F - ny * sway * 0.6,
        );
        octx.stroke();
      }

      // 胸鰭、腹鰭：緩慢划動
      const fin = (s: number, size: number, flapSpeed: number, alpha: number) => {
        if (!size) return;
        const p = at(s);
        const flap = 0.55 + 0.35 * Math.sin(t * flapSpeed + f.phase * 0.3);
        for (const side of [1, -1]) {
          const rx = p.nx * side;
          const ry = p.ny * side;
          octx.fillStyle = rgba(f.color, alpha);
          octx.beginPath();
          octx.moveTo(p.x + rx * p.w * 0.7, p.y + ry * p.w * 0.7);
          octx.lineTo(
            p.x + rx * (p.w + f.len * size * flap) + bx * f.len * size * 0.9,
            p.y + ry * (p.w + f.len * size * flap) + by * f.len * size * 0.9,
          );
          octx.lineTo(p.x + bx * f.len * size * 0.7 + rx * p.w * 0.6, p.y + by * f.len * size * 0.7 + ry * p.w * 0.6);
          octx.closePath();
          octx.fill();
        }
      };
      fin(0.2, S.pect, 2.2, 0.7);
      fin(0.56, S.pelvic, 1.7, 0.6);

      // 身體輪廓
      octx.fillStyle = rgba(f.color, 1);
      octx.beginPath();
      const head = sp[0];
      octx.moveTo(head.x + head.nx * w(0), head.y + head.ny * w(0));
      for (let k = 1; k < SEG; k++) octx.lineTo(sp[k].x + sp[k].nx * w(k), sp[k].y + sp[k].ny * w(k));
      for (let k = SEG - 1; k >= 0; k--) octx.lineTo(sp[k].x - sp[k].nx * w(k), sp[k].y - sp[k].ny * w(k));
      // 圓鈍吻部
      const hx = head.x - (sp[1].x - head.x) * 0.35;
      const hy = head.y - (sp[1].y - head.y) * 0.35;
      octx.quadraticCurveTo(hx - head.nx * w(0), hy - head.ny * w(0), hx, hy);
      octx.quadraticCurveTo(hx + head.nx * w(0), hy + head.ny * w(0), head.x + head.nx * w(0), head.y + head.ny * w(0));
      octx.fill();

      // 背脊亮帶／側線
      octx.strokeStyle = rgba(f.belly, S.stripe ? 0.9 : 0.4);
      octx.lineCap = "round";
      octx.lineWidth = S.stripe ? Math.max(0.8, f.halfW * 0.5) : f.halfW * (S.name === "ray" ? 0.3 : 0.7);
      octx.beginPath();
      octx.moveTo(sp[1].x, sp[1].y);
      for (let k = 2; k < SEG - (S.stripe ? 1 : 3); k++) octx.lineTo(sp[k].x, sp[k].y);
      octx.stroke();

      // 斑紋
      for (const s of f.spots) {
        const p = at(s.s);
        octx.fillStyle = rgba(s.color, 0.85);
        octx.beginPath();
        octx.arc(p.x + p.nx * p.w * s.side * 0.55, p.y + p.ny * p.w * s.side * 0.55, Math.max(0.6, f.halfW * s.r), 0, Math.PI * 2);
        octx.fill();
      }

      // 眼睛
      const e = at(S.eye.s);
      octx.fillStyle = "rgba(6,14,26,0.95)";
      for (const side of [1, -1]) {
        octx.beginPath();
        octx.arc(e.x + e.nx * e.w * S.eye.spread * side, e.y + e.ny * e.w * S.eye.spread * side, S.eye.r, 0, Math.PI * 2);
        octx.fill();
      }
    };

    /* ───────── 合成到主畫布 ───────── */
    const render = (t: number) => {
      if (!cols) return;
      octx.clearRect(0, 0, cols, rows);
      for (const f of fish) drawFish(f, t);
      const px = octx.getImageData(0, 0, cols, rows).data;

      // 漣漪場
      field.fill(0);
      for (const r of ripples) {
        const k = r.age / r.life;
        const rad = r.maxR * (1 - Math.pow(1 - k, 2.2));
        const fade = Math.pow(1 - k, 1.6) * r.strength;
        const width = 0.9 + k * 0.9;
        const inner = rad * 0.55;
        const reach = Math.ceil(rad + width * 2);
        const c0 = Math.max(0, Math.floor(r.x - reach));
        const c1 = Math.min(cols - 1, Math.ceil(r.x + reach));
        const r0 = Math.max(0, Math.floor(r.y - reach));
        const r1 = Math.min(rows - 1, Math.ceil(r.y + reach));
        for (let y = r0; y <= r1; y++)
          for (let x = c0; x <= c1; x++) {
            // 主環 + 一道較淡、跟在後面的內環
            const dist = Math.hypot(x + 0.5 - r.x, y + 0.5 - r.y);
            const d = dist - rad;
            const d2 = dist - inner;
            const v =
              fade * Math.exp(-(d * d) / (width * width)) + fade * 0.4 * Math.exp(-(d2 * d2) / (width * width * 0.6));
            if (v > 0.02) field[y * cols + x] += v;
          }
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (grid) ctx.drawImage(grid, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dot = (x: number, y: number, r: number) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const a = px[i * 4 + 3] / 255;
          const cx = x * cell + cell / 2;
          const cy = y * cell + cell / 2;
          if (a > 0.18) {
            // 點的大小 = 覆蓋率 × 亮度：身體飽滿、邊緣與鰭漸細
            const r = px[i * 4];
            const g = px[i * 4 + 1];
            const b = px[i * 4 + 2];
            const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
            const v = clamp(a * (0.45 + 0.55 * lum), 0, 1);
            ctx.fillStyle = `rgba(${r},${g},${b},${0.6 + a * 0.4})`;
            dot(cx, cy, cell * (0.14 + 0.3 * v));
            continue;
          }
          const w = field[i];
          if (w > 0.05) {
            const v = Math.min(1, w);
            ctx.fillStyle = `rgba(186,230,253,${0.2 + v * 0.55})`;
            dot(cx, cy, cell * (0.1 + 0.18 * v));
          }
        }
      }
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) render(0);
    });
    ro.observe(canvas);

    if (reduced) {
      // 靜態：讓骨架先舒展開再畫
      for (let i = 0; i < 60; i++) step(1 / 30);
      ripples.length = 0;
      render(0);
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let visible = true;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      render(now / 1000);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / cell;
      pointer.y = (e.clientY - rect.top) / cell;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e4;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    start();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none block h-full w-full ${className}`} />;
}
