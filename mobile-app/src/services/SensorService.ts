import { createSource } from "./createSource";
import { caloriesPerTick, ema } from "@/utils/metrics";
import type {
  ActivationOptions,
  Biometrics,
  ConnectionStatus,
  EmgFrame,
  FrameListener,
  SignalMode,
  StatusListener
} from "@/types/signal";

/**
 * Hardware-agnostic singleton that owns the active signal source.
 * Screens and hooks never touch BLE/WebSocket code directly - they subscribe
 * here. Derived biometrics (strain, calories) are computed once per frame.
 */
class SensorServiceImpl {
  private source: ReturnType<typeof createSource> | null = null;
  private frameSubs = new Set<FrameListener>();
  private statusSubs = new Set<StatusListener>();

  private strain = 0;
  private calories = 0;
  private totalFrames = 0;
  private hrEma: number | null = null;

  get activeMode(): SignalMode | null {
    return this.source?.mode ?? null;
  }

  get activeLabel(): string {
    return this.source?.label ?? "No source";
  }

  async activate(mode: SignalMode, opts?: ActivationOptions): Promise<void> {
    this.deactivate();
    const next = createSource(mode, opts);
    this.source = next;
    next.onData((f) => this.handleFrame(f));
    next.onStatus((s, m) => {
      this.statusSubs.forEach((cb) => cb(s, m));
    });
    try {
      await next.start();
    } catch {
      this.source = null;
      this.statusSubs.forEach((cb) => cb("error", "Source failed to start"));
    }
  }

  deactivate(): void {
    if (!this.source) return;
    try {
      this.source.stop();
    } catch {
      // source teardown is best-effort
    }
    this.source = null;
    this.hrEma = null;
  }

  resetSession(): void {
    this.strain = 0;
    this.calories = 0;
    this.totalFrames = 0;
    this.hrEma = null;
  }

  onFrame(cb: FrameListener): () => void {
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

  snapshotBiometrics(): Biometrics {
    return { strainIndex: this.strain, calories: this.calories };
  }

  snapshotTotals(): { totalFrames: number } {
    return { totalFrames: this.totalFrames };
  }

  private handleFrame(f: EmgFrame): void {
    this.totalFrames += 1;
    this.strain = ema(this.strain, f.emg, 0.12);
    this.hrEma =
      this.hrEma === null ? f.hr : ema(this.hrEma, f.hr, 0.08);
    this.calories += caloriesPerTick(f.emg, this.hrEma);
    this.frameSubs.forEach((cb) => cb(f));
  }
}

export const SensorService = new SensorServiceImpl();

export type { ConnectionStatus };
