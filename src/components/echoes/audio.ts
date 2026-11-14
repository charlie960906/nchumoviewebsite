import type { Staff } from "@/lib/staff";

/**
 * 黑膠音訊控制。
 * - 有 audioUrl：以 HTMLAudioElement 播放（授權曲或 30 秒預覽），音量淡入。
 * - 沒有 audioUrl：以 Web Audio API 依 staff.tones 即時合成一段環境音，作為示範佔位。
 * 兩者都只會在使用者手勢（點擊／Enter）後由 play() 啟動，符合瀏覽器自動播放政策。
 */
export class EchoAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private voice: { stop: () => void } | null = null;
  private el: HTMLAudioElement | null = null;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private volume = 0.8;
  playing = false;

  private ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    return { ctx: this.ctx, master: this.master! };
  }

  async play(s: Staff) {
    this.stop(true);
    this.playing = true;
    if (s.audioUrl) {
      const el = new Audio(s.audioUrl);
      el.loop = true;
      el.volume = 0;
      this.el = el;
      try {
        await el.play();
      } catch {
        this.playing = false;
        return false;
      }
      this.fadeEl(this.volume, 1400);
      return true;
    }

    const { ctx, master } = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    const now = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = 1;

    // 柔和低通 + 回授延遲，做出水面下的空間感
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1500;
    lp.Q.value = 0.4;
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.42;
    const fb = ctx.createGain();
    fb.gain.value = 0.38;
    out.connect(lp);
    lp.connect(master);
    lp.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(master);

    const nodes: (OscillatorNode | AudioNode)[] = [out, lp, delay, fb];
    const oscs: OscillatorNode[] = [];

    // 和聲墊：每個音兩顆微幅失諧的振盪器 + 緩慢起伏
    s.tones.forEach((f, i) => {
      for (const det of [-5, 6]) {
        const o = ctx.createOscillator();
        o.type = i === 0 ? "triangle" : "sine";
        o.frequency.value = f;
        o.detune.value = det;
        const g = ctx.createGain();
        g.gain.value = 0.0;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.07 + i * 0.031;
        const lg = ctx.createGain();
        lg.gain.value = 0.022;
        lfo.connect(lg);
        lg.connect(g.gain);
        g.gain.setValueAtTime(0.045 / (1 + i * 0.25), now);
        o.connect(g);
        g.connect(out);
        o.start(now);
        lfo.start(now);
        oscs.push(o, lfo);
        nodes.push(g, lg);
      }
    });

    // 水滴般的撥音：在音階上隨機落下
    let alive = true;
    const pluck = () => {
      if (!alive || !this.ctx) return;
      if (ctx.state === "running") {
        const t = ctx.currentTime;
        const f = s.tones[Math.floor(Math.random() * s.tones.length)] * (Math.random() < 0.4 ? 4 : 2);
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(f * 1.012, t);
        o.frequency.exponentialRampToValueAtTime(f, t + 0.08);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.11, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0008, t + 2.2);
        o.connect(g);
        g.connect(out);
        o.start(t);
        o.stop(t + 2.3);
      }
      timer = setTimeout(pluck, 700 + Math.random() * 1700);
    };
    let timer = setTimeout(pluck, 500);

    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(this.volume, now + 1.6);

    this.voice = {
      stop: () => {
        alive = false;
        clearTimeout(timer);
        const t = ctx.currentTime;
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.linearRampToValueAtTime(0, t + 0.5);
        setTimeout(() => {
          oscs.forEach((o) => {
            try {
              o.stop();
            } catch {}
          });
          nodes.forEach((n) => n.disconnect());
        }, 2800);
      },
    };
    return true;
  }

  private fadeEl(to: number, ms: number, done?: () => void) {
    const el = this.el;
    if (!el) return;
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    const from = el.volume;
    const t0 = performance.now();
    this.fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k === 1) {
        clearInterval(this.fadeTimer!);
        this.fadeTimer = null;
        done?.();
      }
    }, 40);
  }

  async toggle() {
    if (this.el) {
      if (this.el.paused) await this.el.play();
      else this.el.pause();
      this.playing = !this.el.paused;
    } else if (this.ctx) {
      if (this.ctx.state === "running") await this.ctx.suspend();
      else await this.ctx.resume();
      this.playing = this.ctx.state === "running";
    }
    return this.playing;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.el) this.el.volume = v;
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  stop(immediate = false) {
    this.playing = false;
    if (this.el) {
      const el = this.el;
      if (immediate) el.pause();
      else this.fadeEl(0, 500, () => el.pause());
      if (immediate) this.el = null;
    }
    if (this.voice) {
      this.voice.stop();
      this.voice = null;
    }
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  dispose() {
    this.stop(true);
    void this.ctx?.close();
    this.ctx = null;
  }
}
