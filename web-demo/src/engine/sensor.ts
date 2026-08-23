import { caloriesPerTick, ema, type EmgFrame } from "./core";

const TICK_MS = 100;
const HISTORY_CAP = 600;

const randn = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

type Listener = (f: EmgFrame) => void;

/**
 * Synthetic ESP32 suit simulator - same model as the mobile app:
 * fatigue wave (~7s) + rep rhythm (~1.7s) + decaying spikes + burst holds
 * + gaussian noise; heart-rate drifts toward a load-derived target.
 */
class SensorEngine {
  latest: EmgFrame | null = null;
  strain = 0;
  calories = 0;
  totalFrames = 0;
  history: number[] = [];
  sessionStartedAt = Date.now();

  private timer: number | null = null;
  private subs = new Set<Listener>();
  private t0 = Date.now();
  private phase = 0;
  private hr = 72;
  private emgEma = 30;
  private spikeEnv = 0;
  private burstUntil = 0;
  private burstAmp = 0;
  private nextBurstAt = Date.now() + 14000;

  start() {
    if (this.timer !== null) return;
    this.timer = window.setInterval(() => this.tick(), TICK_MS);
  }

  subscribe(cb: Listener): () => void {
    this.subs.add(cb);
    return () => {
      this.subs.delete(cb);
    };
  }

  resetSession() {
    this.strain = 0;
    this.calories = 0;
    this.totalFrames = 0;
    this.history.length = 0;
    this.sessionStartedAt = Date.now();
  }

  private tick() {
    const now = Date.now();
    const elapsed = now - this.t0;

    if (now >= this.nextBurstAt && now > this.burstUntil) {
      this.burstUntil = now + 3500 + Math.random() * 3000;
      this.burstAmp = 28 + Math.random() * 22;
      this.nextBurstAt = now + 18000 + Math.random() * 22000;
      this.spikeEnv = 40;
    }

    const slowWave = 26 * Math.sin((2 * Math.PI * elapsed) / 7000);
    const repWave = 14 * Math.sin((2 * Math.PI * elapsed) / 1700 + 1.1);

    if (Math.random() < 0.008) this.spikeEnv += 25 + Math.random() * 30;
    this.spikeEnv *= 0.9;

    const burst =
      now < this.burstUntil ? this.burstAmp * Math.min(1, (this.burstUntil - now) / 800) : 0;

    const emg = clampRaw(44 + slowWave + repWave + burst + this.spikeEnv + randn() * 2.4);
    this.emgEma += (emg - this.emgEma) * 0.3;

    const hrTarget = 68 + this.emgEma * 0.62;
    this.hr += (hrTarget - this.hr) * 0.055;

    this.phase += 0.35;
    const channels = [0.92, 0.88, 0.95, 0.85].map(
      (g, i) => clampRaw(emg * (g + (i % 2 === 0 ? 0.08 : 0.12) * Math.sin(this.phase + i * 1.7)))
    );

    const frame: EmgFrame = {
      t: now,
      emg: round1(emg),
      channels: channels.map(round1),
      hr: Math.round(this.hr),
    };

    this.latest = frame;
    this.totalFrames += 1;
    this.strain = ema(this.strain, frame.emg, 0.12);
    this.calories += caloriesPerTick(frame.emg, this.hr);
    this.history.push(frame.emg);
    if (this.history.length > HISTORY_CAP) this.history.shift();

    this.subs.forEach((cb) => cb(frame));
  }
}

const clampRaw = (v: number) => Math.min(100, Math.max(0, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

export const sensor = new SensorEngine();
sensor.start();
