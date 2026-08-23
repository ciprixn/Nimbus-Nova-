import type {
  ActivationOptions,
  ConnectionStatus,
  EmgFrame,
  FrameListener,
  SignalMode,
  SignalSource,
  StatusListener
} from "@/types/signal";
import { MockSignalSource } from "./sources/MockSignalSource";
import { BleSignalSource } from "./sources/BleSignalSource";
import { WebSocketSignalSource } from "./sources/WebSocketSignalSource";

export function createSource(
  mode: SignalMode,
  opts?: ActivationOptions
): SignalSource {
  switch (mode) {
    case "ble":
      return new BleSignalSource();
    case "websocket":
      return new WebSocketSignalSource(opts?.url);
    case "mock":
    default:
      return new MockSignalSource();
  }
}

export type { ConnectionStatus, EmgFrame, FrameListener, StatusListener };
