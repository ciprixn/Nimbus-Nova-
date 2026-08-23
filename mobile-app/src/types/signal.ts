export type SignalMode = "mock" | "ble" | "websocket";

export type ConnectionStatus = "disconnected" | "connecting" | "streaming" | "error";

export interface EmgFrame {
  /** ms epoch timestamp of this sample */
  t: number;
  /** aggregate muscle intensity 0..100 (%) */
  emg: number;
  /** per-channel intensities 0..100, one per muscle pad on the suit */
  channels: number[];
  /** heart rate in beats per minute */
  hr: number;
}

export interface Biometrics {
  /** smoothed muscle load 0..100 */
  strainIndex: number;
  /** cumulative kcal estimate for the session */
  calories: number;
}

export type StatusListener = (status: ConnectionStatus, message?: string) => void;
export type FrameListener = (frame: EmgFrame) => void;

export interface SignalSource {
  readonly mode: SignalMode;
  readonly label: string;
  start(): Promise<void>;
  stop(): void;
  onData(cb: FrameListener): () => void;
  onStatus(cb: StatusListener): () => void;
}

export interface ActivationOptions {
  url?: string;
}
