/**
 * 場地互動地圖的 three.js 場景（不依賴 React）。
 * 視覺：月光下的夜間草地，以「泱」的水波為母題 —— 舞台外圈的漣漪、選取時的光圈、
 * 市集上方的暖色串燈、放映機投向銀幕的光束。
 * 效能：共用材質／幾何、靜態陰影只烘一次、閒置時降到低幀率、離開視窗時完全停止。
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  BOOTHS, BOOTH_X, ENTRIES, PROJECTOR, SCREEN, LAWN_STAGE, STALL_POS, TENTS, TENT_HALF, TRUSS, VENUE,
  stallColor, type MapEntry,
} from "@/lib/venueMap";

const COL = {
  sky: 0x010b10,
  ground: 0x021117,
  lawn: 0x062129,
  lawnEdge: 0x8cc4ec,
  path: 0x0b2c36,
  glow: 0x8cc4ec,
  tide: 0x5a9fd4,
  moon: 0xeaf0f7,
  warm: 0xffcf8a,
  wood: 0x5b4636,
  metal: 0x9fb1c2,
  dark: 0x0b1b23,
};
const HOME_DIR = new THREE.Vector3(0, 0.66, 0.75).normalize();
// 預設視角稍微對準場地後方：後排帳篷與放映區上方的標籤才不會被玻璃工具列蓋住
const HOME_TARGET = new THREE.Vector3(0, 0, -3);

type Tween = (now: number) => boolean;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type VenueSceneOptions = {
  container: HTMLElement;
  labels: Map<string, HTMLElement>;
  labelRoot: HTMLElement;
  onPick: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onInteract?: () => void;
};

function fontOf(varName: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

export class VenueScene {
  private opts: VenueSceneOptions;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private world = new THREE.Group();
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private tmp = new THREE.Vector3();

  private mats = new Map<string, THREE.Material>();
  private geos = new Map<string, THREE.BufferGeometry>();
  private ghost = new THREE.MeshBasicMaterial({ color: 0x1a3c4a, transparent: true, opacity: 0.22, depthWrite: false });
  private hitMat = new THREE.MeshBasicMaterial({ visible: false });

  private hits: THREE.Mesh[] = [];
  private groups = new Map<string, THREE.Object3D[]>();
  private dimmed = new Set<string>();
  private anchors = new Map<string, THREE.Vector3>();

  private beams: THREE.Object3D[] = [];
  private stageLight?: THREE.PointLight;
  private selRings: THREE.Mesh[] = [];
  private hoverRing!: THREE.Mesh;
  private stars!: THREE.Points;

  private tweens: Tween[] = [];
  private flatK = 1;
  private is2D = false;
  private inset = { x: 0, y: 0 };
  /** 裝置像素比上限；畫面很大時（全螢幕）會再往下調，避免每幀要畫的像素暴增 */
  private maxDpr = 1;
  /** 標籤上一次寫入的位置／層級：沒變就不碰 DOM */
  private labelState = new Map<string, { t: string; z: number; hidden: boolean }>();
  private labelDepth: { id: string; el: HTMLElement; z: number }[] = [];
  /** 蓋在畫面上方的玻璃工具列高度（px）：畫面中心往下挪到工具列以下的區域 */
  private topInset = 0;
  private insetTarget = { x: 0, y: 0 };
  private size = { w: 1, h: 1 };
  private needsRender = true;
  private raf = 0;
  private running = false;
  private visible = true;
  private reduceMotion = false;
  private selected: string | null = null;
  private hovered: string | null = null;
  private disposers: (() => void)[] = [];
  private firstFrame?: () => void;
  private nearBand = "";
  /** 平滑縮放：目標距離與縮放中心（滑鼠指到的地面點） */
  private zoomGoal: number | null = null;
  private zoomAnchor: THREE.Vector3 | null = null;
  private lastFrame = 0;
  private ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  constructor(opts: VenueSceneOptions) {
    this.opts = opts;
    const { container } = opts;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.maxDpr = Math.min(window.devicePixelRatio, touch ? 1.75 : 2);
    this.renderer.setPixelRatio(this.maxDpr);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    const canvas = this.renderer.domElement;
    canvas.style.display = "block";
    canvas.style.touchAction = "none";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.5, 400);
    this.controls = new OrbitControls(this.camera, canvas);
    const c = this.controls;
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.screenSpacePanning = false;
    c.minDistance = 9;
    c.maxDistance = 150;
    c.maxPolarAngle = 1.32;
    c.rotateSpeed = touch ? 0.65 : 0.85;
    // 縮放改由自己處理（滾輪／雙指／按鈕都會緩動到目標距離），OrbitControls 只負責旋轉與平移
    c.enableZoom = false;
    c.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.PAN };
    c.addEventListener("change", () => (this.needsRender = true));
    c.addEventListener("start", () => opts.onInteract?.());

    this.scene.add(this.world);
    this.build(touch);

    this.resize();
    this.home(false);
    this.bindEvents(canvas);
  }

  /* ───────────────────── 公開 API ───────────────────── */

  start(onFirstFrame?: () => void) {
    this.firstFrame = onFirstFrame;
    this.running = true;
    this.loop();
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.disposers.forEach((d) => d());
    this.controls.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
        (x as THREE.MeshBasicMaterial).map?.dispose();
        x.dispose();
      });
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  setVisible(v: boolean) {
    this.visible = v;
    if (v && this.running) {
      this.needsRender = true;
      cancelAnimationFrame(this.raf);
      this.loop();
    }
  }

  /** 卡片模式下讓單指上下滑動交給頁面捲動（避免手機在地圖上卡住滑不動）；全螢幕時地圖獨佔手勢 */
  setPageScroll(allow: boolean) {
    this.renderer.domElement.style.touchAction = allow ? "pan-y" : "none";
  }

  set2D(on: boolean) {
    if (on === this.is2D) return;
    this.is2D = on;
    const c = this.controls;
    c.enableRotate = !on;
    c.mouseButtons.LEFT = on ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
    c.touches.ONE = on ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
    this.updateZoomLimit();
    const from = this.flatK, to = on ? 0.035 : 1;
    this.tween(850, (t) => this.applyFlatten(from + (to - from) * easeInOut(t)));
    this.home(true);
  }

  home(animate = true) {
    const { pos, target } = this.homeView();
    this.moveCamera(pos, target, animate ? 900 : 0);
  }

  /** factor < 1 放大、> 1 縮小；anchor 為縮放中心（不給就以畫面中心為準） */
  zoom(factor: number, anchor: THREE.Vector3 | null = null) {
    if (this.tweens.some((tw) => (tw as Tween & { cam?: boolean }).cam)) return;
    const cur = this.camera.position.distanceTo(this.controls.target);
    const { minDistance, maxDistance } = this.controls;
    this.zoomGoal = THREE.MathUtils.clamp((this.zoomGoal ?? cur) * factor, minDistance, maxDistance);
    this.zoomAnchor = anchor;
    this.needsRender = true;
    this.opts.onInteract?.();
  }

  focus(id: string) {
    const e = ENTRIES.find((x) => x.id === id);
    if (!e) return;
    const target = new THREE.Vector3(e.foot.x, 0, e.foot.z);
    // 直式畫面視野窄，拉遠一點才看得到周圍
    const narrow = THREE.MathUtils.clamp(this.camera.aspect * 1.4, 0.55, 1);
    const dist = Math.max(16, e.foot.r * 4.2) / narrow;
    const pos = this.is2D
      ? target.clone().add(new THREE.Vector3(0, dist * 1.35, 0.01))
      : target.clone().add(new THREE.Vector3(e.view[0] * dist * 0.72, dist * 0.82, e.view[1] * dist * 0.72));
    this.moveCamera(pos, target, 850);
  }

  select(id: string | null) {
    this.selected = id;
    const e = id ? ENTRIES.find((x) => x.id === id) : undefined;
    this.selRings.forEach((r) => {
      r.visible = !!e;
      if (e) {
        r.position.set(e.foot.x, 0.05, e.foot.z);
        r.scale.setScalar(e.foot.r);
      }
    });
    this.needsRender = true;
  }

  setDimmed(ids: Set<string>) {
    this.dimmed = ids;
    for (const [id, objs] of this.groups) {
      const dim = ids.has(id);
      objs.forEach((root) =>
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh || m.userData.hit || m.userData.fx) return;
          if (!m.userData.mat) m.userData.mat = m.material;
          m.material = dim ? this.ghost : m.userData.mat;
          m.castShadow = !dim && !!m.userData.cast;
        }),
      );
    }
    this.renderer.shadowMap.needsUpdate = true;
    this.needsRender = true;
  }

  /** 被面板遮住的區域（px）：左側面板寬度、底部抽屜高度，畫面中心會往剩下的區域移 */
  setInset(left: number, bottom: number) {
    this.insetTarget = { x: left, y: bottom };
    const from = { ...this.inset };
    this.tween(550, (t) => {
      const k = easeOut(t);
      this.inset.x = from.x + (this.insetTarget.x - from.x) * k;
      this.inset.y = from.y + (this.insetTarget.y - from.y) * k;
      this.applyViewOffset();
    });
  }

  /**
   * 凍結：停止重畫、也不跟著容器改尺寸，畫布保留最後一幀。
   * 全螢幕展開／收合時用：動畫期間只縮放這張靜止畫面（CSS object-fit: cover），
   * 不必每一幀都重設 WebGL 畫布大小、重畫整個場景 → 動畫順很多。
   */
  private frozen = false;

  freeze() {
    if (this.frozen) return;
    if (this.running && this.visible) this.draw(); // 先畫好最新的一幀當作靜止畫面
    this.frozen = true;
    this.renderer.domElement.style.objectFit = "cover";
  }

  /** 解凍：一次調整到最終尺寸並立刻重畫（畫布不會以空白狀態出現） */
  thaw() {
    if (!this.frozen) return;
    this.frozen = false;
    this.renderer.domElement.style.objectFit = "";
    this.size = { w: 0, h: 0 }; // 強制重新量測
    this.resize();
  }

  resize() {
    if (this.frozen) return;
    const r = this.opts.container.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === this.size.w && h === this.size.h) return;
    this.size = { w, h };
    // 每幀最多約 320 萬像素：一般卡片維持清晰，大螢幕全螢幕時自動降一點解析度換取流暢縮放
    const dpr = Math.max(1, Math.min(this.maxDpr, Math.sqrt(3.2e6 / (w * h))));
    if (Math.abs(dpr - this.renderer.getPixelRatio()) > 0.01) {
      this.renderer.setPixelRatio(dpr);
      if (this.stars) (this.stars.material as THREE.ShaderMaterial).uniforms.uPx.value = dpr;
    }
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.applyViewOffset();
    this.updateZoomLimit();
    // 改變畫布尺寸會清空畫面；若等下一個動畫幀才重畫，瀏覽器可能先顯示一幀全黑（全螢幕展開時會閃黑）。
    // 所以尺寸一變就立刻重畫，畫布永遠不會以空白的狀態被顯示出來。
    if (this.running && this.visible) this.draw();
    else this.needsRender = true;
  }

  /* ───────────────────── 相機 ───────────────────── */

  /** 最遠只能拉到「整個場地剛好放得下」再多一點，避免縮得太小、標籤擠成一團 */
  private updateZoomLimit() {
    const home = this.homeView();
    this.controls.maxDistance = home.pos.distanceTo(home.target) * 1.12;
  }

  private homeView() {
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
    if (this.is2D) {
      const fitW = (VENUE.w * 0.5 + 1) / Math.tan(hfov / 2);
      const free = Math.max(0.4, 1 - this.topInset / Math.max(1, this.size.h));
      const fitD = (VENUE.d * 0.5 + 1) / (Math.tan(vfov / 2) * free);
      return { pos: new THREE.Vector3(0, Math.min(140, Math.max(fitW, fitD)), 0.01), target: new THREE.Vector3(0, 0, 0) };
    }
    // 直式手機畫面較窄：拉遠到整個場地寬度都放得下
    const fitW = (VENUE.w * 0.5) / Math.tan(hfov / 2);
    const d = THREE.MathUtils.clamp(fitW, 46, 140);
    return { pos: HOME_TARGET.clone().addScaledVector(HOME_DIR, d), target: HOME_TARGET.clone() };
  }

  private moveCamera(pos: THREE.Vector3, target: THREE.Vector3, ms: number) {
    if (ms <= 0 || this.reduceMotion) {
      this.camera.position.copy(pos);
      this.controls.target.copy(target);
      this.controls.update();
      this.zoomGoal = null;
      this.needsRender = true;
      return;
    }
    this.zoomGoal = null;
    const p0 = this.camera.position.clone(), t0 = this.controls.target.clone();
    this.tweens = this.tweens.filter((tw) => !(tw as Tween & { cam?: boolean }).cam);
    const tw = this.tween(ms, (t) => {
      const k = easeOut(t);
      this.camera.position.lerpVectors(p0, pos, k);
      this.controls.target.lerpVectors(t0, target, k);
    }) as Tween & { cam?: boolean };
    tw.cam = true;
  }

  setTopInset(px: number) {
    if (Math.abs(px - this.topInset) < 0.5) return;
    this.topInset = px;
    this.applyViewOffset();
    this.updateZoomLimit();
  }

  private applyViewOffset() {
    const { w, h } = this.size;
    this.camera.aspect = w / h;
    const dx = -this.inset.x / 2, dy = (this.inset.y - this.topInset) / 2;
    if (Math.abs(dx) < 0.25 && Math.abs(dy) < 0.25) this.camera.clearViewOffset();
    else this.camera.setViewOffset(w, h, dx, dy, w, h);
    this.camera.updateProjectionMatrix();
    this.needsRender = true;
  }

  private tween(ms: number, step: (t: number) => void): Tween {
    const t0 = performance.now();
    const tw: Tween = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      step(t);
      return t < 1;
    };
    this.tweens.push(tw);
    this.needsRender = true;
    return tw;
  }

  private applyFlatten(k: number) {
    this.flatK = k;
    this.world.scale.y = k;
    // 光束與草地光暈壓扁後會變成刺眼的光斑，平面模式下收起來
    this.beams.forEach((b) => (b.visible = k > 0.35));
    // 2D 俯視時草地表演區中間不要有光：關掉暖色燈（只調亮度，不增減燈光數量，避免重新編譯著色器）
    if (this.stageLight) this.stageLight.intensity = 34 * THREE.MathUtils.smoothstep(k, 0.2, 0.6);
    this.renderer.shadowMap.needsUpdate = true;
  }

  /* ───────────────────── 互動 ───────────────────── */

  private bindEvents(canvas: HTMLCanvasElement) {
    let tap: { x: number; y: number; t: number; touch: boolean } | null = null;
    let hoverQueued = false;
    let lastMove: PointerEvent | null = null;

    const down = (e: PointerEvent) => {
      tap = e.isPrimary ? { x: e.clientX, y: e.clientY, t: performance.now(), touch: e.pointerType !== "mouse" } : null;
    };
    const move = (e: PointerEvent) => {
      if (tap && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > (tap.touch ? 12 : 5)) tap = null;
      if (e.pointerType !== "mouse") return;
      lastMove = e;
      if (hoverQueued) return;
      hoverQueued = true;
      requestAnimationFrame(() => {
        hoverQueued = false;
        if (!lastMove || lastMove.buttons) return;
        const id = this.pick(lastMove.clientX, lastMove.clientY, false);
        if (id !== this.hovered) this.setHover(id);
      });
    };
    const up = (e: PointerEvent) => {
      if (e.isPrimary && tap && performance.now() - tap.t < 700) {
        this.opts.onPick(this.pick(e.clientX, e.clientY, tap.touch));
      }
      tap = null;
    };
    const leave = () => this.setHover(null);
    const cancel = () => (tap = null);

    // 滾輪：往游標指著的地面點縮放，並緩動到目標距離
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
      const factor = Math.exp(THREE.MathUtils.clamp(px, -120, 120) * 0.0022);
      this.zoom(factor, this.groundAt(e.clientX, e.clientY));
    };
    // 雙指捏合：手指距離比例換算成目標距離（平移仍交給 OrbitControls）
    const touches = new Map<number, { x: number; y: number }>();
    let pinchDist = 0;
    const tDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) pinchDist = this.spread(touches);
    };
    const tMove = (e: PointerEvent) => {
      if (!touches.has(e.pointerId)) return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size !== 2 || pinchDist <= 0) return;
      const d = this.spread(touches);
      if (d > 0) {
        const [a, b] = [...touches.values()];
        this.zoom(pinchDist / d, this.groundAt((a.x + b.x) / 2, (a.y + b.y) / 2));
        pinchDist = d;
      }
    };
    const tUp = (e: PointerEvent) => {
      touches.delete(e.pointerId);
      pinchDist = touches.size === 2 ? this.spread(touches) : 0;
    };
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("pointerdown", tDown);
    canvas.addEventListener("pointermove", tMove);
    canvas.addEventListener("pointerup", tUp);
    canvas.addEventListener("pointercancel", tUp);

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", cancel);
    canvas.addEventListener("pointerleave", leave);

    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.opts.container);
    const io = new IntersectionObserver(([en]) => this.setVisible(en.isIntersecting));
    io.observe(this.opts.container);
    const vis = () => this.setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", vis);
    const lost = (ev: Event) => ev.preventDefault();
    canvas.addEventListener("webglcontextlost", lost);

    this.disposers.push(() => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("pointerdown", tDown);
      canvas.removeEventListener("pointermove", tMove);
      canvas.removeEventListener("pointerup", tUp);
      canvas.removeEventListener("pointercancel", tUp);
      document.removeEventListener("visibilitychange", vis);
      ro.disconnect();
      io.disconnect();
    });
  }

  private spread(t: Map<number, { x: number; y: number }>) {
    const [a, b] = [...t.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  /** 螢幕座標 → 地面 (y = 0) 上的點；指向天空時回傳 null */
  private groundAt(cx: number, cy: number) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const p = new THREE.Vector3();
    return this.raycaster.ray.intersectPlane(this.ground, p) ? p : null;
  }

  private setHover(id: string | null) {
    this.hovered = id;
    const e = id ? ENTRIES.find((x) => x.id === id) : undefined;
    this.hoverRing.visible = !!e && id !== this.selected;
    if (e) {
      this.hoverRing.position.set(e.foot.x, 0.04, e.foot.z);
      this.hoverRing.scale.setScalar(e.foot.r);
    }
    this.renderer.domElement.style.cursor = id ? "pointer" : "";
    this.opts.onHover(id);
    this.needsRender = true;
  }

  private pick(cx: number, cy: number, touch: boolean): string | null {
    const r = this.renderer.domElement.getBoundingClientRect();
    const offs = touch ? [[0, 0], [14, 0], [-14, 0], [0, 14], [0, -14]] : [[0, 0]];
    const live = this.hits.filter((h) => !this.dimmed.has(h.userData.id));
    for (const [dx, dy] of offs) {
      this.ndc.set(((cx + dx - r.left) / r.width) * 2 - 1, -((cy + dy - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(this.ndc, this.camera);
      const hit = this.raycaster.intersectObjects(live, false)[0];
      if (hit) return hit.object.userData.id as string;
    }
    return null;
  }

  /* ───────────────────── 迴圈 ───────────────────── */

  private loop = () => {
    if (!this.running || !this.visible) return;
    this.raf = requestAnimationFrame(this.loop);
    if (this.frozen) return;
    const now = performance.now();

    const tweening = this.tweens.length > 0;
    if (tweening) this.tweens = this.tweens.filter((tw) => tw(now));

    const dt = Math.min(0.05, (now - (this.lastFrame || now)) / 1000);
    this.lastFrame = now;

    let moved = this.controls.update();

    if (this.zoomGoal !== null) {
      const cam = this.camera.position, tg0 = this.controls.target;
      const d = cam.distanceTo(tg0);
      const goal = this.zoomGoal;
      if (Math.abs(goal - d) < 0.02 * Math.max(1, goal / 20)) {
        this.zoomGoal = null;
      } else {
        const nd = this.reduceMotion ? goal : d + (goal - d) * (1 - Math.exp(-dt * 9));
        const k = nd / d;
        const a = this.zoomAnchor ?? tg0.clone();
        cam.sub(a).multiplyScalar(k).add(a);
        tg0.sub(a).multiplyScalar(k).add(a);
        moved = true;
      }
    }
    // 不讓視角跑出場地太遠
    const tg = this.controls.target;
    const cx = THREE.MathUtils.clamp(tg.x, -26, 26), cz = THREE.MathUtils.clamp(tg.z, -20, 20);
    if (cx !== tg.x || cz !== tg.z) {
      this.camera.position.x += cx - tg.x;
      this.camera.position.z += cz - tg.z;
      tg.x = cx;
      tg.z = cz;
      moved = true;
    }

    // 只在畫面真的有變化時才重畫（沒有背景動畫，閒置時完全不耗 GPU）
    if (!this.needsRender && !tweening && !moved) return;
    this.draw();

    if (this.firstFrame) {
      const cb = this.firstFrame;
      this.firstFrame = undefined;
      requestAnimationFrame(() => cb());
    }
  };

  /** 畫一幀（並更新標籤位置） */
  private draw() {
    this.needsRender = false;
    // 霧跟著相機距離走：拉遠時場地不會被霧蓋掉，遠方地面仍自然淡出
    const fog = this.scene.fog as THREE.Fog;
    const camDist = this.camera.position.distanceTo(this.controls.target);
    fog.near = camDist + 18;
    fog.far = camDist + 95;
    this.renderer.render(this.scene, this.camera);
    this.placeLabels();
  }

  private placeLabels() {
    const { w, h } = this.size;
    const k = this.flatK;
    const dist = this.camera.position.distanceTo(this.controls.target);
    const band = dist < 34 ? "near" : dist < 62 ? "mid" : "far";
    if (band !== this.nearBand) {
      this.nearBand = band;
      this.opts.labelRoot.dataset.zoom = band;
    }
    const depth = this.labelDepth;
    depth.length = 0;
    for (const [id, el] of this.opts.labels) {
      const a = this.anchors.get(id);
      if (!a) continue;
      let st = this.labelState.get(id);
      if (!st) {
        // 標籤一開始是隱藏的（等第一次定位），所以初始狀態要記成 hidden，第一次定位時才會把它打開
        st = { t: "", z: -1, hidden: true };
        this.labelState.set(id, st);
      }
      this.tmp.set(a.x, Math.max(0.5, a.y * k), a.z).project(this.camera);
      const hidden = this.tmp.z > 1 || this.tmp.z < -1;
      if (hidden !== st.hidden) {
        el.style.visibility = hidden ? "hidden" : "";
        st.hidden = hidden;
      }
      if (hidden) continue;
      // 標籤與下方的引線永遠固定在同一個錨點上，不會被推移；
      // 靠近上緣時就從玻璃工具列底下穿過（透過玻璃仍看得到）
      const x = (this.tmp.x * 0.5 + 0.5) * w;
      const y = (-this.tmp.y * 0.5 + 0.5) * h;
      // 只有位置真的變了才寫入 DOM
      const t = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (t !== st.t) {
        el.style.transform = t;
        st.t = t;
      }
      depth.push({ id, el, z: this.tmp.z });
    }
    // 前後層級用排名（近的在上）：縮放時深度值每幀都變，但排名幾乎不變 → 很少需要重排
    depth.sort((p, q) => q.z - p.z);
    depth.forEach((d, i) => {
      const st = this.labelState.get(d.id)!;
      if (st.z !== i) {
        d.el.style.zIndex = String(i + 1);
        st.z = i;
      }
    });
  }

  /* ───────────────────── 建構場景 ───────────────────── */

  private mat<T extends THREE.Material>(key: string, make: () => T): T {
    if (!this.mats.has(key)) this.mats.set(key, make());
    return this.mats.get(key) as T;
  }
  private geo<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
    if (!this.geos.has(key)) this.geos.set(key, make());
    return this.geos.get(key) as T;
  }
  private std(key: string, color: number, extra: THREE.MeshStandardMaterialParameters = {}) {
    return this.mat(key, () => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...extra }));
  }
  private mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, cast = true) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.userData.cast = cast;
    m.receiveShadow = true;
    return m;
  }
  private box(key: string, w: number, h: number, d: number) {
    return this.geo(`box:${key}`, () => new THREE.BoxGeometry(w, h, d));
  }
  private register(id: string, obj: THREE.Object3D, hitSize: [number, number, number], hitY: number) {
    const hit = new THREE.Mesh(this.geo(`hit:${hitSize.join()}`, () => new THREE.BoxGeometry(...hitSize)), this.hitMat);
    hit.position.y = hitY;
    hit.userData = { id, hit: true };
    obj.add(hit);
    this.hits.push(hit);
    const list = this.groups.get(id) ?? [];
    list.push(obj);
    this.groups.set(id, list);
    return hit;
  }

  private build(touch: boolean) {
    this.scene.background = this.skyTexture();
    this.scene.fog = new THREE.Fog(COL.sky, 70, 150);

    // 光：冷調天光 + 月光（投影） + 草地表演區暖光 + 銀幕冷光
    this.scene.add(new THREE.HemisphereLight(0x9cc8ec, 0x01080c, 1.15));
    const moon = new THREE.DirectionalLight(0xdbe8ff, 1.9);
    moon.position.set(-20, 36, 16);
    moon.castShadow = true;
    const sc = moon.shadow.camera;
    sc.left = -30; sc.right = 30; sc.top = 24; sc.bottom = -24; sc.near = 5; sc.far = 90;
    moon.shadow.mapSize.set(touch ? 1024 : 2048, touch ? 1024 : 2048);
    moon.shadow.bias = -0.0004;
    moon.shadow.normalBias = 0.03;
    moon.shadow.radius = 3;
    this.scene.add(moon);
    const stageLight = new THREE.PointLight(COL.warm, 34, 14, 2);
    stageLight.position.set(LAWN_STAGE.x, 4.5, LAWN_STAGE.z + 1);
    this.world.add(stageLight);
    this.stageLight = stageLight;
    const screenLight = new THREE.PointLight(COL.glow, 34, 14, 2);
    screenLight.position.set(SCREEN.x, 3, SCREEN.z + 2.5);
    this.world.add(screenLight);

    this.buildGround();
    this.buildStars();
    this.buildStalls();
    this.buildStringLights();
    this.buildLawnStage();
    this.buildScreen();
    this.buildTents();
    this.buildBooths();
    this.buildTruss();
    this.buildRings();

    for (const e of ENTRIES) this.anchors.set(e.id, new THREE.Vector3(...e.anchor));
  }

  private skyTexture() {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, "#0b2a38");
    grd.addColorStop(0.45, "#031820");
    grd.addColorStop(1, "#010a0e");
    g.fillStyle = grd;
    g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  private buildGround() {
    const ground = this.mesh(new THREE.PlaneGeometry(320, 320), this.std("ground", COL.ground, { roughness: 1 }), 0, -0.02, 0, false);
    ground.rotation.x = -Math.PI / 2;
    this.world.add(ground);

    // 場地：圓角草坪，邊緣一圈微光
    const W = VENUE.w / 2, D = VENUE.d / 2, R = 3.2;
    const shape = new THREE.Shape();
    shape.moveTo(-W + R, -D);
    shape.lineTo(W - R, -D);
    shape.quadraticCurveTo(W, -D, W, -D + R);
    shape.lineTo(W, D - R);
    shape.quadraticCurveTo(W, D, W - R, D);
    shape.lineTo(-W + R, D);
    shape.quadraticCurveTo(-W, D, -W, D - R);
    shape.lineTo(-W, -D + R);
    shape.quadraticCurveTo(-W, -D, -W + R, -D);
    const lawn = this.mesh(new THREE.ShapeGeometry(shape, 8), this.std("lawn", COL.lawn, { roughness: 0.95 }), 0, 0, 0, false);
    lawn.rotation.x = -Math.PI / 2;
    this.world.add(lawn);
    const edgePts = shape.getPoints(12).map((p) => new THREE.Vector3(p.x, 0.03, -p.y));
    const edge = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(edgePts),
      new THREE.LineBasicMaterial({ color: COL.lawnEdge, transparent: true, opacity: 0.2 }),
    );
    this.world.add(edge);

    // 步道：圍繞中央草地的走道與通往市集的主動線
    const pathMat = this.std("path", COL.path, { roughness: 0.9 });
    const paths: [number, number, number, number][] = [
      [0, 9.2, 30, 1.6], [-14.6, 0, 1.4, 24], [14.6, 0, 1.4, 22], [0, -4.6, 26, 1.2],
    ];
    for (const [x, z, w, d] of paths) {
      const p = this.mesh(new THREE.PlaneGeometry(w, d), pathMat, x, 0.012, z, false);
      p.rotation.x = -Math.PI / 2;
      this.world.add(p);
    }
  }

  private buildStars() {
    const n = 900;
    const pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = Math.random(), v = Math.random() * 0.42 + 0.06;
      const th = u * Math.PI * 2, ph = Math.acos(1 - v);
      const r = 180;
      pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("seed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uPx: { value: this.renderer.getPixelRatio() } },
      vertexShader: `attribute float seed; uniform float uPx; varying float vA;
        void main(){ vA = 0.3 + 0.5 * seed;
        gl_PointSize = (0.8 + seed * 1.6) * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
        gl_FragColor = vec4(0.86, 0.93, 1.0, vA * (1.0 - d * 1.6)); }`,
      transparent: true,
      depthWrite: false,
    });
    this.stars = new THREE.Points(g, m);
    this.stars.frustumCulled = false;
    this.scene.add(this.stars);
  }

  private buildStalls() {
    const wood = this.std("wood", COL.wood, { roughness: 0.85 });
    const post = this.std("post", COL.metal, { roughness: 0.4, metalness: 0.5 });
    const goods = [this.std("g1", 0xeaf0f7), this.std("g2", 0x8cc4ec), this.std("g3", 0xf2c38b)];
    const bulb = this.mat("bulb", () => new THREE.MeshBasicMaterial({ color: COL.warm, toneMapped: false }));
    const canopyGeo = this.geo("canopy", () => {
      const g = new THREE.ConeGeometry(1.42, 0.75, 4, 1, true);
      g.rotateY(Math.PI / 4);
      return g;
    });
    const valanceGeo = this.box("valance", 2.0, 0.22, 2.0);
    const postGeo = this.geo("stallPost", () => new THREE.CylinderGeometry(0.045, 0.045, 2.15, 6));
    const bulbGeo = this.geo("bulb", () => new THREE.SphereGeometry(0.09, 10, 8));

    for (const p of STALL_POS) {
      const g = new THREE.Group();
      g.position.set(p.x, 0, p.z);
      g.rotation.y = p.ry;
      const color = new THREE.Color(stallColor(p.id)).getHex();
      const canopyMat = this.std(`canopy${color}`, color, { roughness: 0.7, side: THREE.DoubleSide, flatShading: true });

      g.add(this.mesh(this.box("counter", 1.8, 0.85, 1.1), wood, 0, 0.425, 0.2));
      g.add(this.mesh(this.box("cloth", 1.86, 0.05, 1.16), canopyMat, 0, 0.87, 0.2));
      g.add(this.mesh(this.box("gA", 0.42, 0.26, 0.34), goods[p.id % 3], -0.45, 1.02, 0.15));
      g.add(this.mesh(this.box("gB", 0.3, 0.38, 0.3), goods[(p.id + 1) % 3], 0.1, 1.08, 0.3));
      g.add(this.mesh(this.box("gC", 0.36, 0.18, 0.3), goods[(p.id + 2) % 3], 0.55, 0.98, 0.1));
      for (const [px, pz] of [[-0.88, -0.75], [0.88, -0.75], [-0.88, 0.85], [0.88, 0.85]]) {
        g.add(this.mesh(postGeo, post, px, 1.075, pz, false));
      }
      g.add(this.mesh(valanceGeo, canopyMat, 0, 2.2, 0.05));
      const canopy = this.mesh(canopyGeo, canopyMat, 0, 2.68, 0.05);
      canopy.scale.set(1, 1, 1.12);
      g.add(canopy);
      g.add(this.mesh(bulbGeo, bulb, 0, 2.0, 0.85, false));

      this.register(`stall-${p.id}`, g, [2.1, 3.0, 2.1], 1.5);
      this.world.add(g);
    }
  }

  /** 市集上方的暖色串燈：用懸鏈線取點，燈泡以 InstancedMesh 一次畫完 */
  private buildStringLights() {
    const strings: [THREE.Vector3, THREE.Vector3, number][] = [
      [new THREE.Vector3(-15.6, 3.1, 10.3), new THREE.Vector3(16, 3.1, 10.3), 22],
      [new THREE.Vector3(-15.2, 3.1, -12), new THREE.Vector3(-15.2, 3.1, 10.3), 18],
      [new THREE.Vector3(-8.5, 3.6, -7.8), new THREE.Vector3(8.5, 3.6, -7.8), 14],
      [new THREE.Vector3(15.6, 3.1, -9.5), new THREE.Vector3(15.6, 3.1, 10.3), 16],
    ];
    const bulbs: THREE.Vector3[] = [];
    const wireMat = new THREE.LineBasicMaterial({ color: 0x31434f, transparent: true, opacity: 0.8 });
    const poleMat = this.std("pole", 0x1d2d36, { roughness: 0.6, metalness: 0.4 });
    const poleGeo = this.geo("pole", () => new THREE.CylinderGeometry(0.06, 0.08, 1, 6));
    for (const [a, b, n] of strings) {
      const pts: THREE.Vector3[] = [];
      const sag = a.distanceTo(b) * 0.035;
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const p = new THREE.Vector3().lerpVectors(a, b, t);
        p.y -= sag * 4 * t * (1 - t);
        pts.push(p);
      }
      this.world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const p = new THREE.Vector3().lerpVectors(a, b, t);
        p.y -= sag * 4 * t * (1 - t) + 0.12;
        bulbs.push(p);
      }
      for (const end of [a, b]) {
        const pole = this.mesh(poleGeo, poleMat, end.x, end.y / 2, end.z, true);
        pole.scale.y = end.y;
        this.world.add(pole);
      }
    }
    const inst = new THREE.InstancedMesh(
      this.geo("strBulb", () => new THREE.SphereGeometry(0.075, 8, 6)),
      new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false }),
      bulbs.length,
    );
    const m4 = new THREE.Matrix4();
    bulbs.forEach((p, i) => inst.setMatrixAt(i, m4.makeTranslation(p.x, p.y, p.z)));
    inst.userData.fx = true;
    this.world.add(inst);

    // 燈泡的柔光：一張加色光暈貼圖，以 Points 畫
    const halo = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(bulbs),
      new THREE.PointsMaterial({
        map: this.haloTexture(), color: 0xffc070, size: 0.8, transparent: true, opacity: 0.32,
        depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, toneMapped: false,
      }),
    );
    halo.userData.fx = true;
    this.world.add(halo);
  }

  private haloTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.25, "rgba(255,255,255,0.45)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  /** 草地表演區：沒有舞台，表演就在場地中央的草皮上 —— 一圈地燈、幾位表演者與水波 */
  private buildLawnStage() {
    const { x: cx, z: cz, r: R } = LAWN_STAGE;
    const g = new THREE.Group();
    g.position.set(cx, 0, cz);

    // 稍亮的圓形草皮與一圈細光邊
    const turf = this.mesh(this.geo("turf", () => new THREE.CircleGeometry(R, 72)), this.std("turf", 0x0d3a3a, { roughness: 1 }), 0, 0.015, 0, false);
    turf.rotation.x = -Math.PI / 2;
    g.add(turf);
    const rim = new THREE.Mesh(
      this.geo("turfRim", () => new THREE.RingGeometry(R - 0.06, R, 96)),
      new THREE.MeshBasicMaterial({ color: COL.glow, transparent: true, opacity: 0.28, depthWrite: false, toneMapped: false }),
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.03;
    rim.userData.fx = true;
    g.add(rim);

    // 草地上的暖色光暈（表演者站的位置）
    const pool = new THREE.Mesh(
      this.geo("pool", () => new THREE.CircleGeometry(R * 0.72, 48)),
      new THREE.MeshBasicMaterial({ map: this.haloTexture(), color: COL.warm, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = 0.035;
    pool.userData.fx = true;
    // 草地上的暖色光暈：2D 時跟光束一起收起來
    this.beams.push(pool);
    g.add(pool);

    // 草皮上的地燈（矮柱 + 暖光燈罩）
    const lampPost = this.std("lampPost", 0x1d2d36, { roughness: 0.5, metalness: 0.4 });
    const lampGlow = this.mat("lampGlow", () => new THREE.MeshBasicMaterial({ color: COL.warm, toneMapped: false }));
    const halos: THREE.Vector3[] = [];
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n;
      const x = Math.cos(a) * (R + 0.45), z = Math.sin(a) * (R + 0.45);
      g.add(this.mesh(this.geo("lampPost", () => new THREE.CylinderGeometry(0.07, 0.09, 0.55, 8)), lampPost, x, 0.275, z));
      g.add(this.mesh(this.geo("lampHead", () => new THREE.CylinderGeometry(0.13, 0.11, 0.16, 12)), lampGlow, x, 0.62, z, false));
      halos.push(new THREE.Vector3(x, 0.66, z));
    }
    const lampHalo = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(halos),
      new THREE.PointsMaterial({
        map: this.haloTexture(), color: 0xffc070, size: 1.3, transparent: true, opacity: 0.36,
        depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, toneMapped: false,
      }),
    );
    lampHalo.userData.fx = true;
    g.add(lampHalo);

    // 地上的小音箱（背向放映區，朝向市集與觀眾）
    const spk = this.std("speaker", 0x081118, { roughness: 0.6 });
    for (const x of [-R + 0.6, R - 0.6]) {
      const box = this.mesh(this.box("floorSpk", 0.55, 0.8, 0.5), spk, x, 0.4, -R * 0.55);
      box.rotation.y = x < 0 ? 0.35 : -0.35;
      g.add(box);
    }

    // 表演者：簡化的人形剪影 + 一支麥克風架
    const body = this.std("performer", 0xeaf0f7, { roughness: 0.55 });
    const bodyGeo = this.geo("performerBody", () => new THREE.CapsuleGeometry(0.2, 0.75, 4, 10));
    const headGeo = this.geo("performerHead", () => new THREE.SphereGeometry(0.17, 14, 10));
    for (const [x, z, s] of [[-1.3, 0.1, 0.95], [0, -0.5, 1.05], [1.35, 0.25, 0.9]] as const) {
      const p = new THREE.Group();
      p.position.set(x, 0, z);
      p.scale.setScalar(s);
      p.add(this.mesh(bodyGeo, body, 0, 0.6, 0));
      p.add(this.mesh(headGeo, body, 0, 1.33, 0));
      g.add(p);
    }
    const stand = this.std("micStand", 0x9fb1c2, { metalness: 0.6, roughness: 0.35 });
    g.add(this.mesh(this.geo("micPole", () => new THREE.CylinderGeometry(0.02, 0.02, 1.35, 6)), stand, 0, 0.68, 0.25, false));
    g.add(this.mesh(this.geo("micBase", () => new THREE.CylinderGeometry(0.16, 0.18, 0.04, 12)), stand, 0, 0.02, 0.25, false));

    this.register("stage", g, [R * 2, 1.8, R * 2], 0.9);
    this.world.add(g);
  }

  private buildScreen() {
    const g = new THREE.Group();
    g.position.set(SCREEN.x, 0, SCREEN.z);
    const frame = this.std("screenFrame", 0x0c1a22, { roughness: 0.5, metalness: 0.3 });
    g.add(this.mesh(this.box("screenFrame", SCREEN.w, 5.3, 0.35), frame, 0, 3.25, 0));
    for (const x of [-SCREEN.w / 2 + 0.6, SCREEN.w / 2 - 0.6]) g.add(this.mesh(this.box("screenLeg", 0.3, 1.2, 0.9), frame, x, 0.6, 0));
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(SCREEN.w - 0.7, 4.6),
      new THREE.MeshBasicMaterial({ map: this.screenTexture(), toneMapped: false }),
    );
    screen.position.set(0, 3.25, 0.19);
    screen.userData.fx = true;
    g.add(screen);

    // 放映機 + 光束
    const pz = PROJECTOR.z - SCREEN.z;
    g.add(this.mesh(this.box("projStand", 0.7, 0.95, 0.7), this.std("projStand", 0x1b2c36, { metalness: 0.4 }), 0, 0.475, pz));
    g.add(this.mesh(this.box("projBody", 1.05, 0.38, 0.8), this.std("projBody", 0xdbe4ec, { roughness: 0.4 }), 0, 1.14, pz));
    const lens = this.mesh(this.geo("lens", () => new THREE.CylinderGeometry(0.15, 0.18, 0.28, 16)), this.std("lens", 0x05090c, { metalness: 0.6, roughness: 0.2 }), 0, 1.14, pz - 0.5, false);
    lens.rotation.x = Math.PI / 2;
    g.add(lens);
    // 鏡頭 (z = pz - 0.5, y 1.14) → 銀幕中心 (z 0.19, y 3.25)
    const dz = pz - 0.5 - 0.19, dy = 3.25 - 1.14;
    const beam = new THREE.Mesh(
      this.geo("projBeam", () => {
        const geo = new THREE.ConeGeometry(2.6, 1, 4, 1, true);
        geo.rotateY(Math.PI / 4);
        geo.translate(0, -0.5, 0);
        return geo;
      }),
      new THREE.MeshBasicMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
    );
    // 錐尖在放映機鏡頭，底面落在銀幕上
    beam.scale.set(2.9, Math.hypot(dz, dy), 1.22);
    beam.rotation.x = Math.PI / 2 + Math.atan2(dy, dz);
    beam.position.set(0, 1.14, pz - 0.55);
    beam.userData.fx = true;
    this.beams.push(beam);
    g.add(beam);

    // 野餐墊：格紋布鋪在草地上，略帶隨意的角度，面向銀幕
    const matGeo = this.box("picnicMat", 1.7, 0.03, 1.3);
    const matCols = ["#8CC4EC", "#F2C38B", "#E8A1AB", "#9FD8BF", "#EAF0F7"];
    const matMats = matCols.map((c) =>
      this.mat(`picnic${c}`, () => new THREE.MeshStandardMaterial({ map: this.ginghamTexture(c), roughness: 1 })),
    );
    let k = 0;
    for (const [row, xs] of [
      [4.5, [-4.6, -2.6, 2.6, 4.6]],
      [6.0, [-5.4, -3.4, -1.2, 1.2, 3.4, 5.4]],
    ] as const) {
      for (const x of xs) {
        const mat = this.mesh(matGeo, matMats[k % matMats.length], x, 0.03, row + ((k * 37) % 5) * 0.06, false);
        mat.rotation.y = (((k * 53) % 9) - 4) * 0.045;
        g.add(mat);
        k++;
      }
    }

    // 命中盒涵蓋銀幕到觀眾席
    this.register("movie", g, [SCREEN.w, 5.8, 7.6], 2.9).position.z = 3.6;
    this.world.add(g);
  }

  /** 野餐墊的格紋布：底色 + 半透明白色經緯線 */
  private ginghamTexture(color: string) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = color;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(255,255,255,0.38)";
    for (let i = 0; i < 128; i += 32) {
      g.fillRect(i, 0, 16, 128);
      g.fillRect(0, i, 128, 16);
    }
    g.strokeStyle = "rgba(0,18,24,0.35)";
    g.lineWidth = 4;
    g.strokeRect(2, 2, 124, 124);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  private screenTexture() {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 440;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, c.height);
    grd.addColorStop(0, "#22526a");
    grd.addColorStop(0.62, "#7fb6d9");
    grd.addColorStop(0.63, "#0d3445");
    grd.addColorStop(1, "#06202b");
    g.fillStyle = grd;
    g.fillRect(0, 0, c.width, c.height);
    // 月亮與倒影
    const mx = c.width * 0.68, my = c.height * 0.3;
    const mg = g.createRadialGradient(mx, my, 0, mx, my, 120);
    mg.addColorStop(0, "rgba(255,255,255,1)");
    mg.addColorStop(0.28, "rgba(234,240,247,0.95)");
    mg.addColorStop(0.32, "rgba(234,240,247,0.25)");
    mg.addColorStop(1, "rgba(234,240,247,0)");
    g.fillStyle = mg;
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "rgba(234,240,247,0.55)";
    for (let i = 0; i < 9; i++) {
      const y = c.height * 0.67 + i * 15;
      const w = 90 - i * 7 + (i % 2) * 18;
      g.fillRect(mx - w / 2, y, w, 3);
    }
    g.fillStyle = "rgba(0,18,24,0.5)";
    g.fillRect(0, c.height - 46, c.width, 46);
    g.fillStyle = "rgba(234,240,247,0.85)";
    g.font = `500 26px ${fontOf("--font-noto-serif", "serif")}`;
    g.textAlign = "center";
    g.fillText("— 星 空 放 映 —", c.width / 2, c.height - 16);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  private buildTents() {
    const W = TENT_HALF.w, D = TENT_HALF.d;
    const fabric = this.std("fabric", 0xe8eef4, { roughness: 0.8, side: THREE.DoubleSide, flatShading: true });
    const roofGeo = this.geo("tentRoof", () => {
      const s = new THREE.Shape();
      s.moveTo(-W / 2 - 0.15, 0);
      s.lineTo(0, 1.05);
      s.lineTo(W / 2 + 0.15, 0);
      s.lineTo(-W / 2 - 0.15, 0);
      const geo = new THREE.ExtrudeGeometry(s, { depth: D + 0.3, bevelEnabled: false });
      geo.translate(0, 0, -(D + 0.3) / 2);
      return geo;
    });
    const postGeo = this.geo("tentPost", () => new THREE.CylinderGeometry(0.06, 0.06, 2.5, 6));
    const postMat = this.std("tentPost", 0xcfd8e1, { metalness: 0.5, roughness: 0.4 });

    for (const t of TENTS) {
      const tent = new THREE.Group();
      tent.position.set(t.x, 0, t.z);
      tent.rotation.y = t.ry;
      const color = new THREE.Color(t.zone.color).getHex();
      const glass = this.mat(`glass${color}`, () => new THREE.MeshStandardMaterial({
        color, transparent: true, opacity: 0.16, roughness: 0.15, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide,
      }));
      const floor = this.mat(`floor${color}`, () => new THREE.MeshStandardMaterial({ color: 0x0d2630, emissive: color, emissiveIntensity: 0.22, roughness: 0.8 }));
      const orb = this.mat(`orb${color}`, () => new THREE.MeshBasicMaterial({ color, toneMapped: false }));
      const edgeMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });

      t.zone.rooms.forEach((room, i) => {
        const lx = (i === 0 ? -1 : 1) * (W / 2);
        const half = new THREE.Group();
        half.position.x = lx;
        half.add(this.mesh(this.box("tentFloor", W - 0.05, 0.08, D), floor, 0, 0.04, 0, false));
        const walls = new THREE.Mesh(this.box("tentWall", W - 0.1, 2.4, D - 0.1), glass);
        walls.position.y = 1.28;
        walls.renderOrder = 2;
        half.add(walls);
        const edges = new THREE.LineSegments(this.geo("tentEdges", () => new THREE.EdgesGeometry(new THREE.BoxGeometry(W - 0.1, 2.4, D - 0.1))), edgeMat);
        edges.position.y = 1.28;
        half.add(edges);
        for (const [px, pz] of [[-W / 2 + 0.08, -D / 2 + 0.08], [W / 2 - 0.08, -D / 2 + 0.08], [-W / 2 + 0.08, D / 2 - 0.08], [W / 2 - 0.08, D / 2 - 0.08]]) {
          half.add(this.mesh(postGeo, postMat, px, 1.25, pz, false));
        }
        half.add(this.mesh(roofGeo, fabric, 0, 2.5, 0));
        // 展品：台座 + 發光的水滴
        half.add(this.mesh(this.geo("plinth", () => new THREE.CylinderGeometry(0.42, 0.5, 0.9, 20)), this.std("plinth", 0xe7edf3, { roughness: 0.35 }), 0, 0.45, -0.2));
        const drop = new THREE.Mesh(this.geo("drop", () => new THREE.SphereGeometry(0.26, 20, 16)), orb);
        drop.position.set(0, 1.18, -0.2);
        drop.scale.set(1, 1.18, 1);
        half.add(drop);
        // 展區字：地面上的字樣（俯視時也看得到）
        const glyph = new THREE.Mesh(this.geo("glyphPlane", () => new THREE.PlaneGeometry(1.5, 1.5)), new THREE.MeshBasicMaterial({
          map: this.glyphTexture(room.char, t.zone.color), transparent: true, depthWrite: false, toneMapped: false,
        }));
        glyph.rotation.x = -Math.PI / 2;
        glyph.position.set(0, 0.1, 0.85);
        glyph.userData.fx = true;
        half.add(glyph);

        tent.add(half);
        this.register(`room-${room.id}`, half, [W, 3.6, D], 1.8);
      });
      tent.add(this.mesh(this.box("divider", 0.12, 2.5, D - 0.1), fabric, 0, 1.25, 0));
      this.world.add(tent);
    }
  }

  private glyphTexture(ch: string, color: string) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = color;
    g.globalAlpha = 0.9;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = color;
    g.shadowBlur = 18;
    g.font = `700 170px ${fontOf("--font-noto-serif", "serif")}`;
    g.fillText(ch, 128, 136);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  private buildBooths() {
    const counter = this.std("booth", 0x173b4a, { roughness: 0.6 });
    const top = this.std("boothTop", 0xdfe7ee, { roughness: 0.5 });
    const canopy = this.std("boothCanopy", COL.tide, { roughness: 0.55 });
    const post = this.std("post", COL.metal, { roughness: 0.4, metalness: 0.5 });
    const led = this.mat("led", () => new THREE.MeshBasicMaterial({ color: COL.glow, toneMapped: false }));
    const postGeo = this.geo("boothPost", () => new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6));
    for (const b of BOOTHS) {
      const g = new THREE.Group();
      g.position.set(BOOTH_X, 0, b.z);
      g.rotation.y = -Math.PI / 2;
      g.add(this.mesh(this.box("boothCounter", 2.0, 1.0, 1.0), counter, 0, 0.5, 0.25));
      g.add(this.mesh(this.box("boothTop", 2.1, 0.06, 1.1), top, 0, 1.03, 0.25));
      g.add(this.mesh(this.box("boothLed", 2.0, 0.04, 0.03), led, 0, 0.9, 0.77, false));
      for (const [px, pz] of [[-0.95, -0.7], [0.95, -0.7], [-0.95, 0.7], [0.95, 0.7]]) g.add(this.mesh(postGeo, post, px, 1.25, pz, false));
      const roof = this.mesh(this.box("boothRoof", 2.3, 0.14, 1.8), canopy, 0, 2.55, 0);
      roof.rotation.x = 0.12;
      g.add(roof);
      this.register(b.id, g, [2.3, 2.8, 2.0], 1.4);
      this.world.add(g);
    }
  }

  private buildTruss() {
    const g = new THREE.Group();
    g.position.set(TRUSS.x, 0, TRUSS.z);
    g.rotation.y = -Math.PI / 2;
    const metal = this.std("trussMetal", 0xaab6c2, { metalness: 0.8, roughness: 0.3 });
    const rod = this.box("rod", 0.06, 3.6, 0.06);
    for (const x of [-1.55, 1.55]) {
      for (const [dx, dz] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) g.add(this.mesh(rod, metal, x + dx, 1.8, dz, false));
      for (let y = 0.4; y < 3.6; y += 0.6) g.add(this.mesh(this.box("rung", 0.36, 0.04, 0.36), metal, x, y, 0, false));
    }
    for (const dz of [-0.15, 0.15]) for (const dy of [-0.15, 0.15]) g.add(this.mesh(this.box("trussBeam", 3.4, 0.06, 0.06), metal, 0, 3.6 + dy, dz, false));
    const banner = new THREE.Mesh(this.box("banner", 2.7, 2.7, 0.04), [
      this.std("bannerSide", 0x0b2a38), this.std("bannerSide", 0x0b2a38), this.std("bannerSide", 0x0b2a38),
      this.std("bannerSide", 0x0b2a38),
      this.mat("bannerFace", () => new THREE.MeshBasicMaterial({ map: this.bannerTexture(), toneMapped: false })),
      this.std("bannerSide", 0x0b2a38),
    ]);
    banner.position.set(0, 1.95, 0.02);
    banner.castShadow = true;
    banner.userData.cast = true;
    g.add(banner);
    this.register("truss", g, [3.4, 4.2, 1], 2.1);
    this.world.add(g);
  }

  private bannerTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, "#0b2a38");
    grd.addColorStop(1, "#001218");
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "rgba(140,196,236,0.5)";
    g.lineWidth = 3;
    for (let i = 1; i <= 4; i++) {
      g.globalAlpha = 1 - i / 5;
      g.beginPath();
      g.arc(256, 230, 60 + i * 38, 0, Math.PI * 2);
      g.stroke();
    }
    g.globalAlpha = 1;
    g.fillStyle = "#EAF0F7";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 190px ${fontOf("--font-noto-serif", "serif")}`;
    g.fillText("泱", 256, 236);
    g.fillStyle = "#8CC4EC";
    g.font = `600 30px ${fontOf("--font-jb-mono", "monospace")}`;
    g.fillText("NCHU FILM FEST", 256, 440);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /** 選取光圈（靜態的一圈細光）與滑鼠停留時的淡色圓盤 */
  private buildRings() {
    const selGeo = this.geo("selRing", () => new THREE.RingGeometry(0.93, 1, 64));
    for (let i = 0; i < 1; i++) {
      const m = new THREE.Mesh(selGeo, new THREE.MeshBasicMaterial({ color: COL.glow, transparent: true, opacity: 0.75, depthWrite: false, toneMapped: false }));
      m.rotation.x = -Math.PI / 2;
      m.visible = false;
      m.renderOrder = 3;
      this.selRings.push(m);
      this.world.add(m);
    }
    this.hoverRing = new THREE.Mesh(
      this.geo("hoverDisc", () => new THREE.CircleGeometry(1, 48)),
      new THREE.MeshBasicMaterial({ color: COL.glow, transparent: true, opacity: 0.12, depthWrite: false, toneMapped: false }),
    );
    this.hoverRing.rotation.x = -Math.PI / 2;
    this.hoverRing.visible = false;
    this.world.add(this.hoverRing);
  }
}

export type { MapEntry };
