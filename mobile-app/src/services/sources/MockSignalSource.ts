import type {
  ConnectionStatus,
  EmgFrame,
  FrameListener,
  SignalSource,
  StatusListener
} from "@/types/signal";

const TICK_MS = 100;

const randn = (): number => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/**
 * Synthetic ESP32 suit simulator.
 *
 * Produces a physiologically-plausible EMG envelope every 100ms:
 * - slow fatigue wave (~7s period)
 * - contraction rhythm wave (~1.7s period, drives rep peaks for stride scoring)
 * - random spike events with exponential decay
 * - occasional multi-second "hold" bursts
 * - gaussian sensor noise
 * Heart rate chases a target derived from recent muscle load (cardiac drift).
 */
export class MockSignalSource implements SignalSource {
  readonly mode = "mock" as const;
  readonly label = "Demo Generator";

  private timer: ReturnType<typeof setInterval> | null = null;
  private frameSubs = new Set<FrameListener>();
  private statusSubs = new Set<StatusListener>();

  private t0 = Date.now();
  private phase = 0;
  private hr = 72;
  private emgEma = 30;
  private spikeEnv = 0;
  private burstUntil = 0;
  private burstAmp = 0;
  private nextBurstAt = this.t0 + 15000 + Math.random() * 20000;

  async start(): Promise<void> {
    this.t0 = Date.now();
    this.nextBurstAt = this.t0 + 12000 + Math.random() * 15000;
    this.emitStatus("streaming", "Synthetic signal generator active");
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    this.emitStatus("disconnected");
  }

  onData(cb: FrameListener): () => void {
    this.frameSubs.add(cb);
    return () => {
      this.frameSubs.delete(cb);
    };
  }

  onStatus(cb: StatusListener): () => void {
    this.statusSubs.add(cb);
    return () => {
      this.statusSubs.delete(cb);
    };
  }

  private tick(): void {
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
      now < this.burstUntil
        ? this.burstAmp * Math.min(1, (this.burstUntil - now) / 800)
        : 0;

    const noise = randn() * 2.4;
    const raw = 44 + slowWave + repWave + burst + this.spikeEnv + noise;
    const emg = Math.min(100, Math.max(0, raw));

    this.emgEma += (emg - this.emgEma) * 0.3;

    const hrTarget = 68 + this.emgEma * 0.62;
    this.hr += (hrTarget - this.hr) * 0.055;

    this.phase += 0.35;

    const channels = [
      Math.min(100, emg * (0.92 + 0.08 * Math.sin(this.phase))),
      Math.min(100, emg * (0.88 + 0.12 * Math.sin(this.phase + 1.9))),
      Math.min(100, emg * (0.95 + 0.05 * Math.sin(this.phase + 3.6))),
      Math.min(100, emg * (0.85 + 0.15 * Math.sin(this.phase + 4.8)))
    ].map((v) => Math.max(0, v));

    const frame: EmgFrame = {
      t: now,
      emg: Math.round(emg * 10) / 10,
      channels: channels.map((v) => Math.round(v * 10) / 10),
      hr: Math.round(this.hr)
    };

    this.frameSubs.forEach((cb) => cb(frame));
  }

  private emitStatus(status: ConnectionStatus, message?: string): void {
    this.statusSubs.forEach((cb) => cb(status, message));
  }
}
