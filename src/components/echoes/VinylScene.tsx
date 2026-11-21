"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import * as THREE from "three";
import type { Staff } from "@/lib/staff";

export type SceneHandle = {
  rotateTo: (i: number) => void;
  pull: (i: number) => void;
  release: () => void;
};

type Props = {
  ref?: Ref<SceneHandle>;
  staff: Staff[];
  onFocus: (i: number) => void;
  onPick: (i: number) => void;
  /** 場景無法維持順暢（或 WebGL context 遺失）時通知父層改用簡化模式 */
  onFallback: () => void;
};

/* ───────── 貼圖：黑膠本體（溝槽 + 中央圓標）、反光、光暈 ───────── */

function fontOf(varName: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

function drawVinyl(c: HTMLCanvasElement, s: Staff, cover?: HTMLImageElement) {
  const size = c.width;
  const g = c.getContext("2d")!;
  const r = size / 2;
  g.clearRect(0, 0, size, size);

  g.fillStyle = "#06080c";
  g.beginPath();
  g.arc(r, r, r, 0, Math.PI * 2);
  g.fill();

  // 溝槽
  for (let i = 0; i < 84; i++) {
    const rr = r * (0.41 + (0.56 * i) / 84);
    g.strokeStyle = `rgba(255,255,255,${0.02 + 0.055 * (((i * 7919) % 7) / 7)})`;
    g.lineWidth = Math.max(1, size / 640);
    g.beginPath();
    g.arc(r, r, rr, 0, Math.PI * 2);
    g.stroke();
  }
  // 曲目分隔帶
  for (const k of [0.56, 0.74, 0.88]) {
    g.strokeStyle = "rgba(0,0,0,0.9)";
    g.lineWidth = size / 110;
    g.beginPath();
    g.arc(r, r, r * k, 0, Math.PI * 2);
    g.stroke();
  }

  // 中央圓標
  const lr = r * 0.38;
  g.save();
  g.beginPath();
  g.arc(r, r, lr, 0, Math.PI * 2);
  g.clip();
  if (cover) {
    g.drawImage(cover, r - lr, r - lr, lr * 2, lr * 2);
    g.fillStyle = "rgba(0,18,24,0.25)";
    g.fillRect(r - lr, r - lr, lr * 2, lr * 2);
  } else {
    const lg = g.createRadialGradient(r - lr * 0.4, r - lr * 0.45, lr * 0.05, r, r, lr * 1.1);
    lg.addColorStop(0, "#ffffff");
    lg.addColorStop(0.25, s.accentColor);
    lg.addColorStop(1, "#001218");
    g.fillStyle = lg;
    g.fillRect(r - lr, r - lr, lr * 2, lr * 2);
    // 圓標上的漣漪
    g.strokeStyle = "rgba(248,250,252,0.35)";
    g.lineWidth = size / 400;
    for (let k = 1; k <= 4; k++) {
      g.beginPath();
      g.arc(r + lr * 0.25, r + lr * 0.5, lr * 0.22 * k, 0, Math.PI * 2);
      g.stroke();
    }
  }
  g.restore();

  // 文字：暱稱 + 歌名
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.shadowColor = "rgba(0,18,24,0.75)";
  g.shadowBlur = size / 60;
  g.fillStyle = "#EAF0F7";
  g.font = `700 ${size * 0.085}px ${fontOf("--font-noto-serif", "serif")}`;
  g.fillText(s.name, r, r - lr * 0.42);
  g.font = `500 ${size * 0.034}px ${fontOf("--font-noto-sans", "sans-serif")}`;
  g.fillText(s.songTitle.length > 10 ? `${s.songTitle.slice(0, 10)}…` : s.songTitle, r, r + lr * 0.5);
  g.shadowBlur = 0;

  g.strokeStyle = "rgba(248,250,252,0.5)";
  g.lineWidth = size / 500;
  g.beginPath();
  g.arc(r, r, lr, 0, Math.PI * 2);
  g.stroke();

  // 軸孔
  g.fillStyle = "#001218";
  g.beginPath();
  g.arc(r, r, r * 0.035, 0, Math.PI * 2);
  g.fill();
}

function sheenTexture() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const cg = g.createConicGradient(-0.9, size / 2, size / 2);
  const stops: [number, number][] = [
    [0, 0], [0.05, 0.34], [0.1, 0], [0.22, 0], [0.25, 0.1], [0.28, 0],
    [0.5, 0], [0.55, 0.26], [0.6, 0], [0.76, 0], [0.79, 0.08], [0.82, 0], [1, 0],
  ];
  for (const [p, a] of stops) cg.addColorStop(p, `rgba(190,235,255,${a})`);
  g.fillStyle = cg;
  g.beginPath();
  g.arc(size / 2, size / 2, size * 0.49, 0, Math.PI * 2);
  g.arc(size / 2, size / 2, size * 0.2, 0, Math.PI * 2, true);
  g.fill();
  return new THREE.CanvasTexture(c);
}

function glowTexture() {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const rg = g.createRadialGradient(size / 2, size / 2, size * 0.28, size / 2, size / 2, size / 2);
  rg.addColorStop(0, "rgba(255,255,255,0.0)");
  rg.addColorStop(0.25, "rgba(255,255,255,0.75)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

/* ───────── 光波 Shader：從唱片中心向外擴散的光環 ───────── */

const RIPPLE_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const RIPPLE_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uT;       // 爆發後經過的秒數
uniform float uTime;    // 全域時間
uniform float uPower;   // 0..1 整體強度
uniform vec3 uColor;    // 個人光效色

float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

void main(){
  vec2 p = (vUv - 0.5) * 2.0;
  float d = length(p);
  float ang = atan(p.y, p.x);
  float n = noise(vec2(ang * 3.0, d * 4.0 - uTime * 0.6));

  // 爆發波前：隨時間向外推進並衰減
  float front = uT * 0.55;
  float x = d - front + (n - 0.5) * 0.05;
  float burst = exp(-x * x * 90.0) * exp(-uT * 0.9) * 1.6;
  float trail = exp(-pow(d - front * 0.72, 2.0) * 120.0) * exp(-uT * 1.3);

  // 持續的細漣漪：播放中保持呼吸
  float rings = pow(max(0.0, sin(d * 26.0 - uTime * 2.2 + n * 1.5)), 8.0) * smoothstep(1.0, 0.25, d) * 0.22;

  // 色彩：水泱青藍 → 流光亮藍 → 個人色
  vec3 tide = vec3(0.031, 0.569, 0.698);
  vec3 glow = vec3(0.220, 0.741, 0.973);
  vec3 col = mix(mix(glow, uColor, 0.55), tide, smoothstep(0.1, 1.0, d));
  col += vec3(1.0) * burst * 0.35;

  float a = (burst + trail * 0.6 + rings) * uPower * smoothstep(1.0, 0.7, d) * smoothstep(0.16, 0.3, d);
  gl_FragColor = vec4(col * a, a);
}`;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

export default function VinylScene({ ref, staff, onFocus, onPick, onFallback }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<SceneHandle>({ rotateTo() {}, pull() {}, release() {} });
  const cb = useRef({ onFocus, onPick, onFallback });
  cb.current = { onFocus, onPick, onFallback };

  useImperativeHandle(ref, () => ({
    rotateTo: (i) => api.current.rotateTo(i),
    pull: (i) => api.current.pull(i),
    release: () => api.current.release(),
  }));

  useEffect(() => {
    const host = hostRef.current!;
    const n = staff.length;
    const step = (Math.PI * 2) / n;

    const nav = navigator as Navigator & { deviceMemory?: number };
    const low =
      (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || window.matchMedia("(max-width: 640px)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !low, alpha: true, powerPreference: "high-performance" });
    } catch {
      cb.current.onFallback();
      return;
    }
    let dprCap = low ? 1.25 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);

    const R = Math.max(2.6, 1.22 / Math.sin(Math.PI / n));
    const ring = new THREE.Group();
    scene.add(ring);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

    const discGeo = track(new THREE.CylinderGeometry(1, 1, 0.035, low ? 48 : 72));
    discGeo.rotateX(Math.PI / 2);
    const planeGeo = track(new THREE.PlaneGeometry(1, 1));
    const sheenTex = track(sheenTexture());
    const glowTex = track(glowTexture());
    const sideMat = track(new THREE.MeshBasicMaterial({ color: 0x05070a, transparent: true }));

    type Item = {
      holder: THREE.Group;
      tilt: THREE.Group;
      disc: THREE.Mesh;
      faceMat: THREE.MeshBasicMaterial;
      sheenMat: THREE.MeshBasicMaterial;
      glowMat: THREE.MeshBasicMaterial;
      color: THREE.Color;
    };

    const texSize = low ? 512 : 1024;
    const items: Item[] = staff.map((s, i) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = texSize;
      drawVinyl(canvas, s);
      const tex = track(new THREE.CanvasTexture(canvas));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = low ? 2 : 8;
      // 圓柱頂／底蓋的 UV 與畫布方向差 90°，轉正讓文字在靜止時是正的
      tex.center.set(0.5, 0.5);

      const redraw = (cover?: HTMLImageElement) => {
        drawVinyl(canvas, s, cover);
        tex.needsUpdate = true;
      };
      // 網頁字型（中文子集）載入後重繪一次
      document.fonts?.ready.then(() => redraw());
      if (s.vinylCover) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => redraw(img);
        img.src = s.vinylCover;
      }

      const faceMat = track(new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
      const disc = new THREE.Mesh(discGeo, [sideMat, faceMat, faceMat]);
      disc.userData.index = i;

      const color = new THREE.Color(s.accentColor);
      const sheenMat = track(
        new THREE.MeshBasicMaterial({ map: sheenTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      const sheen = new THREE.Mesh(planeGeo, sheenMat);
      sheen.scale.setScalar(2);
      sheen.position.z = 0.02;

      const glowMat = track(
        new THREE.MeshBasicMaterial({ map: glowTex, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      const glow = new THREE.Mesh(planeGeo, glowMat);
      glow.scale.setScalar(3.3);
      glow.position.z = -0.04;

      const tilt = new THREE.Group();
      tilt.add(glow, disc, sheen);
      const holder = new THREE.Group();
      const th = i * step;
      holder.position.set(Math.sin(th) * R, 0, Math.cos(th) * R);
      holder.rotation.y = th;
      holder.add(tilt);
      ring.add(holder);
      return { holder, tilt, disc, faceMat, sheenMat, glowMat, color };
    });

    // 光波平面
    const rippleMat = track(
      new THREE.ShaderMaterial({
        vertexShader: RIPPLE_VERT,
        fragmentShader: RIPPLE_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uT: { value: 10 }, uTime: { value: 0 }, uPower: { value: 0 }, uColor: { value: new THREE.Color("#8CC4EC") } },
      }),
    );
    const ripple = new THREE.Mesh(planeGeo, rippleMat);
    ripple.scale.setScalar(9);
    ripple.visible = false;
    scene.add(ripple);

    // 粒子
    const PCOUNT = low ? 48 : 140;
    const pGeo = track(new THREE.BufferGeometry());
    const pPos = new Float32Array(PCOUNT * 3);
    const pVel = new Float32Array(PCOUNT * 3);
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = track(
      new THREE.PointsMaterial({
        size: 0.07,
        map: glowTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: 0x38bdf8,
      }),
    );
    const points = new THREE.Points(pGeo, pMat);
    points.frustumCulled = false;
    points.visible = false;
    scene.add(points);
    let pLife = 0;

    /* ───────── 狀態 ───────── */
    let rot = 0;
    let vel = 0;
    let goto: number | null = 0;
    let focus = 0;
    let dragging = false;
    let pulled = -1; // 被抽出的索引
    let pullT = 0; // 0..1
    let pullDir = 0; // 1 抽出、-1 放回
    let bursted = false;
    let burstAt = -100;

    const nearest = (i: number) => {
      const base = i * step;
      const k = Math.round((rot - base) / (Math.PI * 2));
      return base + k * Math.PI * 2;
    };

    api.current = {
      rotateTo(i) {
        if (pulled >= 0) return;
        vel = 0;
        goto = nearest(((i % n) + n) % n);
      },
      pull(i) {
        if (pulled >= 0) return;
        vel = 0;
        goto = nearest(i);
        pulled = i;
        pullDir = 1;
        bursted = false;
        (rippleMat.uniforms.uColor.value as THREE.Color).copy(items[i].color);
        pMat.color.copy(items[i].color).lerp(new THREE.Color(0xffffff), 0.35);
      },
      release() {
        if (pulled < 0) return;
        pullDir = -1;
      },
    };

    /* ───────── 尺寸與相機 ───────── */
    const layout = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      // 橫向：看見整個圓環；直向：至少看見前方三張
      const need = aspect > 1.15 ? (2 * R + 2.8) / (2 * t * aspect) : R + 3.4 / (2 * t * aspect);
      // 前方唱片高度不超過舞台的一半左右，並把圓環往上移，讓出下方控制列
      const dist = THREE.MathUtils.clamp(need, R + 7, R + 18);
      camera.position.set(0, dist * 0.16, dist);
      camera.lookAt(0, -0.95, R * 0.35);
      camera.updateProjectionMatrix();
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(host);

    /* ───────── 互動：拖曳旋轉 + 慣性 + 點擊選取 ───────── */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    let lastX = 0;
    let lastT = 0;
    let moved = 0;
    let active = false;

    const el = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      active = true;
      dragging = false;
      moved = 0;
      downX = lastX = e.clientX;
      downY = e.clientY;
      lastT = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - lastX;
      moved = Math.max(moved, Math.abs(e.clientX - downX));
      if (!dragging) {
        // 水平位移明顯大於垂直才視為拖曳，直向滑動仍可捲動頁面
        if (Math.abs(e.clientX - downX) > 8 && Math.abs(e.clientX - downX) > Math.abs(e.clientY - downY)) {
          dragging = true;
          el.setPointerCapture(e.pointerId);
          el.style.cursor = "grabbing";
        } else return;
      }
      if (pulled >= 0) return;
      const now = performance.now();
      const k = (step * 2.4) / Math.max(320, host.clientWidth);
      const dr = -dx * k;
      rot += dr;
      goto = null;
      const dt = Math.max(1, now - lastT) / 1000;
      vel = THREE.MathUtils.lerp(vel, dr / dt, 0.5);
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = (e: PointerEvent) => {
      if (!active) return;
      active = false;
      el.style.cursor = "grab";
      if (dragging) {
        dragging = false;
        if (performance.now() - lastT > 90) vel = 0;
        vel = THREE.MathUtils.clamp(vel, -9, 9);
        return;
      }
      if (moved > 8 || Math.abs(e.clientY - downY) > 8) return;
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(items.map((it) => it.disc), false)[0];
      if (!hit) return;
      const i = hit.object.userData.index as number;
      if (pulled >= 0) return;
      if (i === focus) cb.current.onPick(i);
      else api.current.rotateTo(i);
    };
    const onCancel = () => {
      active = false;
      dragging = false;
      el.style.cursor = "grab";
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);

    /* ───────── 迴圈 ───────── */
    const clock = new THREE.Clock();
    const world = new THREE.Vector3();
    let raf = 0;
    let running = false;
    let visible = true;
    let slowFrames = 0;
    let frames = 0;
    let acc = 0;
    let downgraded = false;
    let dead = false;

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;

      // 效能守門
      acc += dt;
      frames++;
      if (frames === 60) {
        const avg = (acc / frames) * 1000;
        acc = 0;
        frames = 0;
        slowFrames = avg > 34 ? slowFrames + 1 : 0;
        if (slowFrames >= 2) {
          slowFrames = 0;
          if (!downgraded) {
            downgraded = true;
            dprCap = 1;
            renderer.setPixelRatio(1);
            layout();
          } else {
            dead = true;
            stop();
            cb.current.onFallback();
            return;
          }
        }
      }

      // 旋轉物理：慣性 → 阻尼 → 吸附到最近一張
      if (!dragging) {
        if (goto === null) {
          rot += vel * dt;
          vel *= Math.exp(-3.4 * dt);
          if (Math.abs(vel) < 0.35) goto = Math.round(rot / step) * step;
        } else {
          rot += (goto - rot) * (1 - Math.exp(-7.5 * dt));
          if (Math.abs(goto - rot) < 0.0005) rot = goto;
        }
      }
      ring.rotation.y = -rot;

      const f = (((Math.round(rot / step) % n) + n) % n) | 0;
      if (f !== focus) {
        focus = f;
        cb.current.onFocus(f);
      }

      // 取出動畫時間軸
      if (pullDir !== 0) {
        pullT = THREE.MathUtils.clamp(pullT + (pullDir * dt) / (pullDir > 0 ? 1.25 : 0.7), 0, 1);
        if (pullDir > 0 && !bursted && pullT > 0.5) {
          bursted = true;
          burstAt = time;
          // 粒子噴發
          for (let i = 0; i < PCOUNT; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 0.8 + Math.random() * 2.4;
            pPos.set([Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0], i * 3);
            pVel.set([Math.cos(a) * sp, Math.sin(a) * sp + 0.3, (Math.random() - 0.3) * 1.2], i * 3);
          }
          pLife = 1;
          points.visible = true;
        }
        if (pullT === 1 && pullDir > 0) pullDir = 0;
        if (pullT === 0 && pullDir < 0) {
          pullDir = 0;
          pulled = -1;
          ripple.visible = false;
        }
      }
      const pe = pullDir >= 0 ? easeOutBack(pullT) : easeOutCubic(pullT);
      const pc = easeOutCubic(pullT);

      for (let i = 0; i < n; i++) {
        const it = items[i];
        const delta = i * step - rot;
        const front = Math.pow((Math.cos(delta) + 1) / 2, 2.2); // 1 = 正前方
        const isPulled = i === pulled;

        // 待機：自轉 + 輕微漂浮
        it.disc.rotation.z -= dt * (isPulled ? 0.5 + pc * 2.6 : 0.18 + front * 0.25);
        const bob = Math.sin(time * 0.9 + i * 1.7) * 0.06;

        const s = 0.82 + front * 0.22 + (isPulled ? pe * 0.14 : 0);
        it.tilt.scale.setScalar(s);
        it.tilt.position.set(0, bob * (1 - (isPulled ? pc : 0)) + (isPulled ? pe * 0.12 : 0), isPulled ? pe * 1.5 : front * 0.35);
        it.tilt.rotation.x = isPulled ? -0.2 * pe : 0;
        it.tilt.rotation.z = isPulled ? Math.sin(time * 0.8) * 0.02 * pc : 0;

        const dim = isPulled ? 1 : 1 - pc * 0.82;
        const b = (0.3 + front * 0.7) * (isPulled ? 1 : 1 - pc * 0.5);
        it.faceMat.color.setScalar(b);
        it.faceMat.opacity = dim;
        it.sheenMat.opacity = (0.35 + front * 0.65) * dim;
        // 聚焦呼吸光
        const breathe = 0.55 + 0.25 * Math.sin(time * 1.6);
        it.glowMat.opacity = Math.pow(front, 6) * breathe * (isPulled ? 1 + pc * 0.5 : 1 - pc);
      }
      sideMat.opacity = 1 - pc * 0.6;

      // 光波與粒子跟著被抽出的唱片
      if (pulled >= 0) {
        items[pulled].tilt.getWorldPosition(world);
        ripple.visible = true;
        ripple.position.copy(world);
        ripple.position.z -= 0.12;
        ripple.quaternion.copy(camera.quaternion);
        rippleMat.uniforms.uT.value = time - burstAt;
        rippleMat.uniforms.uTime.value = time;
        rippleMat.uniforms.uPower.value = pc;
        points.position.copy(world);
      }
      if (pLife > 0) {
        pLife = Math.max(0, pLife - dt / 1.6);
        for (let i = 0; i < PCOUNT * 3; i += 3) {
          pPos[i] += pVel[i] * dt;
          pPos[i + 1] += pVel[i + 1] * dt;
          pPos[i + 2] += pVel[i + 2] * dt;
          pVel[i] *= 0.985;
          pVel[i + 1] = pVel[i + 1] * 0.985 - 0.35 * dt;
        }
        pGeo.attributes.position.needsUpdate = true;
        pMat.opacity = pLife * pLife;
        if (pLife === 0) points.visible = false;
      }

      renderer.render(scene, camera);
    };

    const start = () => {
      if (running || dead || !visible || document.hidden) return;
      running = true;
      clock.getDelta();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(host);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    const onLost = (e: Event) => {
      e.preventDefault();
      dead = true;
      stop();
      cb.current.onFallback();
    };
    el.addEventListener("webglcontextlost", onLost);

    cb.current.onFocus(0);
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
      el.removeEventListener("webglcontextlost", onLost);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      el.remove();
    };
  }, [staff]);

  return <div ref={hostRef} aria-hidden className="absolute inset-0" />;
}
