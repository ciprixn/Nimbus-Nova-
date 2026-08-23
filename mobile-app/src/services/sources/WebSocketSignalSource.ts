import { DEFAULT_WS_URL } from "./bleConfig";
import { parseEsp32Payload, splitLines } from "@/services/protocol";
import type {
  ConnectionStatus,
  EmgFrame,
  FrameListener,
  SignalSource,
  StatusListener
} from "@/types/signal";

const RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;

/**
 * Plain WebSocket bridge to the ESP32 (typical firmware: async_tcp server on
 * port 81 pushing newline-delimited telemetry). Works in Expo Go, making it
 * the fastest real-hardware path during a hackathon demo.
 */
export class WebSocketSignalSource implements SignalSource {
  readonly mode = "websocket" as const;
  readonly label = "ESP32 WiFi";

  private ws: WebSocket | null = null;
  private frameSubs = new Set<FrameListener>();
  private statusSubs = new Set<StatusListener>();
  private buffer = "";
  private disposed = false;
  private attempts = 0;

  constructor(private url: string = DEFAULT_WS_URL) {}

  start(): Promise<void> {
    this.disposed = false;
    this.attempts = 0;
    this.emit("connecting", `Opening ${this.url} ...`);
    this.open();
    return Promise.resolve();
  }

  stop(): void {
    this.disposed = true;
    this.ws?.close();
    this.ws = null;
    this.buffer = "";
    this.emit("disconnected");
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

  private open(): void {
    try {
      const ws = new WebSocket(this.url);
      this.ws = ws;
      ws.onopen = () => {
        this.attempts = 0;
        this.emit("streaming", `Streaming over WiFi from ${this.url}`);
      };
      ws.onmessage = (event: WebSocketMessageEvent) => {
        if (typeof event.data !== "string") return;
        this.ingest(event.data);
      };
      ws.onerror = () => undefined;
      ws.onclose = () => {
        if (this.disposed) return;
        if (this.attempts < RECONNECT_ATTEMPTS) {
          this.attempts += 1;
          this.emit(
            "connecting",
            `Reconnecting (${this.attempts}/${RECONNECT_ATTEMPTS})...`
          );
          setTimeout(() => {
            if (!this.disposed) this.open();
          }, RECONNECT_DELAY_MS);
        } else {
          this.fail(`Could not reach ${this.url}. Check suit AP/credentials.`);
        }
      };
    } catch {
      this.fail(`Invalid WebSocket URL: ${this.url}`);
    }
  }

  private ingest(chunk: string): void {
    const { complete, rest } = splitLines(this.buffer + chunk);
    this.buffer = rest.slice(-512);
    for (const line of complete) {
      const frame: EmgFrame | null = parseEsp32Payload(line, Date.now());
      if (frame) this.frameSubs.forEach((cb) => cb(frame));
    }
  }

  private fail(message: string): void {
    this.disposed = true;
    this.ws?.close();
    this.ws = null;
    this.emit("error", message);
  }

  private emit(status: ConnectionStatus, message?: string): void {
    this.statusSubs.forEach((cb) => cb(status, message));
  }
}
