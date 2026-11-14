"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero 水波（WebGL fragment shader）。
 * - 游標移動產生細漣漪，點擊／觸控產生擴散的大漣漪。
 * - 效能守門：離開視窗或分頁隱藏即暫停；量測 frame time，過慢時逐級降低解析度，最後停用改走 CSS。
 * - prefers-reduced-motion：只渲染一張靜態畫面。
 * - 不支援 WebGL：顯示 CSS 漸層與漣漪圈作為降級。
 * 畫布僅為裝飾（aria-hidden），所有重要文字皆在 DOM。
 */

const MAX = 12;

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uDrops[${MAX}];
uniform float uAmp[${MAX}];

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float height(vec2 p){
  float h = 0.0030 * sin(p.x * 5.0 + uTime * 0.55) * sin(p.y * 8.0 - uTime * 0.38);
  h += 0.0016 * sin(p.x * 13.0 - uTime * 0.8 + p.y * 4.0);
  h += 0.0009 * sin((p.x - p.y * 0.6) * 21.0 + uTime * 1.1);
  for (int i = 0; i < ${MAX}; i++) {
    float age = uTime - uDrops[i].z;
    if (age < 0.0 || age > 7.0) continue;
    float d = distance(p, uDrops[i].xy);
    float front = age * 0.30;
    float x = d - front;
    // 波前包絡 + 隨時間的阻尼
    h += uAmp[i] * 0.02 * sin(52.0 * x) * exp(-x * x * 70.0) * exp(-age * 0.7) / (1.0 + d * 3.0);
  }
  return h;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * asp, uv.y);

  float e = 0.004;
  float h  = height(p);
  vec2 n = vec2(height(p + vec2(e, 0.0)) - h, height(p + vec2(0.0, e)) - h) / e;

  // 夜空倒影：上深下略亮的漸層
  vec3 deep = vec3(0.043, 0.098, 0.173);          // #0B192C
  vec3 mid  = vec3(0.035, 0.180, 0.290);
  vec3 col = mix(mid, deep, smoothstep(0.0, 0.85, uv.y + n.y * 0.25));

  // 月光：畫面上方偏右的柔光，被水面法線扭曲
  vec2 moon = vec2(asp * 0.72, 0.92);
  float md = distance(p + n * 0.22, moon);
  col += vec3(0.22, 0.74, 0.97) * 0.20 * exp(-md * 2.4);
  col += vec3(0.97, 0.98, 0.99) * 0.10 * exp(-md * 9.0);

  // 星點倒影
  vec2 sp = (p + n * 0.18) * 46.0;
  vec2 cell = floor(sp);
  float star = hash(cell);
  if (star > 0.965) {
    vec2 c = fract(sp) - 0.5 - (vec2(hash(cell + 1.3), hash(cell + 7.1)) - 0.5) * 0.6;
    float tw = 0.55 + 0.45 * sin(uTime * (1.0 + star * 3.0) + star * 60.0);
    col += vec3(0.85, 0.95, 1.0) * smoothstep(0.12, 0.0, length(c)) * tw * 0.9;
  }

  // 波峰流光（水泱青藍 → 流光亮藍）
  float slope = length(n);
  float spec = pow(clamp(dot(normalize(vec3(-n, 0.5)), normalize(vec3(0.3, 0.55, 0.78))), 0.0, 1.0), 40.0);
  col += vec3(0.220, 0.741, 0.973) * spec * 0.30;
  col += vec3(0.031, 0.569, 0.698) * smoothstep(0.03, 0.45, slope) * 0.22;

  // 邊緣暗角，讓文字區更沉靜
  float vig = smoothstep(1.25, 0.25, distance(uv, vec2(0.5, 0.45)));
  col *= mix(0.72, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}`;

export default function WaterCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const host = canvas.parentElement!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) {
      setFallback(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    if (!vs || !fs) {
      setFallback(true);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFallback(true);
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uDrops = gl.getUniformLocation(prog, "uDrops");
    const uAmp = gl.getUniformLocation(prog, "uAmp");

    const drops = new Float32Array(MAX * 3).fill(-100);
    const amps = new Float32Array(MAX);
    let cursor = 0;
    let scale = 1; // 解析度縮放：1 → 0.66 → 0.4
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
      w = Math.max(1, Math.floor(host.clientWidth * dpr));
      h = Math.max(1, Math.floor(host.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    const t0 = performance.now();
    const time = () => (performance.now() - t0) / 1000;

    const addDrop = (clientX: number, clientY: number, amp: number) => {
      const r = host.getBoundingClientRect();
      if (clientY < r.top || clientY > r.bottom) return;
      const x = ((clientX - r.left) / r.width) * (r.width / r.height);
      const y = 1 - (clientY - r.top) / r.height;
      drops.set([x, y, time()], cursor * 3);
      amps[cursor] = amp;
      cursor = (cursor + 1) % MAX;
    };

    const draw = () => {
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, time());
      gl.uniform3fv(uDrops, drops);
      gl.uniform1fv(uAmp, amps);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(host);

    if (reduced) {
      // 靜態：預放兩圈已擴散的漣漪
      drops.set([0.5 * (w / h), 0.45, -1.6], 0);
      amps[0] = 1;
      drops.set([0.2 * (w / h), 0.7, -0.9], 3);
      amps[1] = 0.6;
      draw();
      return () => ro.disconnect();
    }

    let raf = 0;
    let running = false;
    let visible = true;
    let last = 0;
    let acc = 0;
    let frames = 0;
    let lastAuto = 0;
    let dead = false;

    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (last) {
        acc += now - last;
        frames++;
        if (frames === 50) {
          const avg = acc / frames;
          acc = 0;
          frames = 0;
          if (avg > 30) {
            if (scale > 0.5) {
              scale = scale > 0.9 ? 0.66 : 0.4;
              resize();
            } else {
              // 仍然過慢：停用 WebGL，改走 CSS 降級
              dead = true;
              stop();
              setFallback(true);
              return;
            }
          }
        }
      }
      last = now;
      // 無互動時也保持水面有生命：偶爾落下一滴
      if (now - lastAuto > 3400) {
        lastAuto = now;
        const r = host.getBoundingClientRect();
        addDrop(r.left + r.width * (0.15 + Math.random() * 0.7), r.top + r.height * (0.2 + Math.random() * 0.6), 0.55);
      }
      draw();
    };
    const start = () => {
      if (running || dead || !visible || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
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

    let lx = 0;
    let ly = 0;
    let lt = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const now = performance.now();
      if (now - lt < 110 || Math.hypot(e.clientX - lx, e.clientY - ly) < 36) return;
      lx = e.clientX;
      ly = e.clientY;
      lt = now;
      addDrop(e.clientX, e.clientY, 0.32);
    };
    const onDown = (e: PointerEvent) => addDrop(e.clientX, e.clientY, 1);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    const onLost = (e: Event) => {
      e.preventDefault();
      dead = true;
      stop();
      setFallback(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    // 開場：一滴落在中央
    setTimeout(() => {
      const r = host.getBoundingClientRect();
      addDrop(r.left + r.width / 2, r.top + r.height * 0.42, 1);
    }, 350);

    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("webglcontextlost", onLost);
    };
  }, []);

  return (
    <div aria-hidden className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* CSS 底層：WebGL 載入前、或降級時顯示 */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_0%,#12456b_0%,#0b192c_55%)]" />
      {fallback ? (
        <div className="absolute inset-0">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="absolute left-1/2 top-[42%] h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2"
            >
              <span
                className="block h-full w-full animate-ripple-out rounded-full border border-glow/30"
                style={{ animationDelay: `${i * 1.5}s`, animationDuration: "6s" }}
              />
            </span>
          ))}
        </div>
      ) : (
        <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night" />
    </div>
  );
}
