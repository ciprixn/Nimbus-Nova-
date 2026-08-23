import { PermissionsAndroid, Platform } from "react-native";

import { parseEsp32Payload, splitLines } from "@/services/protocol";
import type {
  ConnectionStatus,
  EmgFrame,
  FrameListener,
  SignalSource,
  StatusListener
} from "@/types/signal";
import {
  NUS_SERVICE_UUID,
  NUS_TX_CHAR_UUID,
  SCAN_TIMEOUT_MS,
  DEVICE_NAME_PREFIXES
} from "./bleConfig";

type AnyBleManager = {
  destroy(): void;
  state(): Promise<string>;
  startDeviceScan(
    services: string[] | null,
    options: Record<string, unknown> | null,
    listener: (error: unknown | null, device: AnyBleDevice | null) => void
  ): void;
  stopDeviceScan(): void;
  connectToDevice(
    id: string,
    options?: Record<string, unknown>
  ): Promise<AnyBleDevice>;
  discoverAllServicesAndCharacteristics(device: AnyBleDevice): Promise<AnyBleDevice>;
  stopDeviceNotificationsForCharacteristic(
    device: AnyBleDevice,
    serviceUuid: string,
    charUuid: string
  ): Promise<void>;
};

type AnyBleSubscription = { remove(): void };

type AnyBleDevice = {
  id: string;
  name: string | null;
  localName?: string | null;
  monitorCharacteristicForService(
    serviceUuid: string,
    charUuid: string,
    listener: (error: unknown | null, char: AnyBleChar | null) => void
  ): Promise<AnyBleSubscription>;
};

type AnyBleChar = { value: string | null };

let cachedManager: AnyBleManager | null = null;

/**
 * react-native-ble-plx ships native code: it only exists in a custom dev
 * build, never in Expo Go. We resolve it lazily so the app boots cleanly
 * everywhere and degrades to an actionable error message instead of crashing.
 */
export function loadBleManager(): AnyBleManager | null {
  if (cachedManager) return cachedManager;
  try {
    const mod = require("react-native-ble-plx") as {
      BleManager: new () => AnyBleManager;
    };
    cachedManager = new mod.BleManager();
    return cachedManager;
  } catch {
    return null;
  }
}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const base64Decode = (value: string): string => {
  let out = "";
  let bits = 0;
  let acc = 0;
  for (let i = 0; i < value.length; i++) {
    const idx = B64.indexOf(value[i]);
    if (idx < 0) continue;
    acc = (acc << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out += String.fromCharCode((acc >> bits) & 0xff);
    }
  }
  return out;
};

async function ensureAndroidPermissions(): Promise<boolean> {
  if (Platform.OS !== "android" || Platform.Version < 31) return true;
  try {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ]);
    return (
      results["android.permission.BLUETOOTH_CONNECT"] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      results["android.permission.BLUETOOTH_SCAN"] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
}

export class BleSignalSource implements SignalSource {
  readonly mode = "ble" as const;
  readonly label = "ESP32 BLE";

  private manager: AnyBleManager | null = null;
  private device: AnyBleDevice | null = null;
  private notifySub: AnyBleSubscription | null = null;
  private frameSubs = new Set<FrameListener>();
  private statusSubs = new Set<StatusListener>();
  private buffer = "";

  async start(): Promise<void> {
    this.emit("connecting", "Scanning for ESP32 suit (Nordic UART)...");
    this.manager = loadBleManager();
    if (!this.manager) {
      this.fail(
        "BLE native module unavailable. Run `npx expo prebuild` + a dev build (Expo Go cannot use BLE)."
      );
      return;
    }

    const poweredOn = await this.manager.state().then((s) => s === "PoweredOn").catch(() => false);
    if (!poweredOn) {
      this.fail("Bluetooth is powered off or unauthorized.");
      return;
    }
    await ensureAndroidPermissions();

    const found = await this.scanAndPick();
    if (!found) {
      this.fail(`No device matching ${DEVICE_NAME_PREFIXES.join("/")} with NUS service found.`);
      return;
    }

    this.emit("connecting", `Connecting to ${found.name ?? "suit"}...`);
    try {
      const connected = await this.manager.connectToDevice(found.id, { autoConnect: false });
      this.device = await this.manager.discoverAllServicesAndCharacteristics(connected);
    } catch {
      this.fail("Connection failed. Make sure the suit is powered and in range.");
      return;
    }
    if (!this.device || !this.manager) return;

    this.emit("streaming", `Streaming from ${this.device.name ?? "ESP32 suit"}`);
    const subPromise = this.device.monitorCharacteristicForService(
      NUS_SERVICE_UUID,
      NUS_TX_CHAR_UUID,
      (_error, char) => {
        if (!char?.value) return;
        this.ingest(base64Decode(char.value));
      }
    );
    this.notifySub = await subPromise.catch(() => null);
  }

  stop(): void {
    this.notifySub?.remove();
    this.notifySub = null;
    if (this.manager && this.device) {
      void this.manager.stopDeviceNotificationsForCharacteristic(
        this.device,
        NUS_SERVICE_UUID,
        NUS_TX_CHAR_UUID
      ).catch(() => undefined);
    }
    this.device = null;
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

  private scanAndPick(): Promise<{ id: string; name: string | null } | null> {
    const manager = this.manager;
    if (!manager) return Promise.resolve(null);
    return new Promise((resolve) => {
      let settled = false;
      const done = (result: { id: string; name: string } | null) => {
        if (settled) return;
        settled = true;
        manager.stopDeviceScan();
        resolve(result);
      };
      manager.startDeviceScan([NUS_SERVICE_UUID], null, (_err, device) => {
        if (!device) return;
        const name = device.name ?? device.localName ?? "";
        if (
          name.length === 0 ||
          DEVICE_NAME_PREFIXES.some((p) => name.toUpperCase().startsWith(p))
        ) {
          done({ id: device.id, name });
        }
      });
      setTimeout(() => done(null), SCAN_TIMEOUT_MS);
    });
  }

  private ingest(textChunk: string): void {
    this.buffer += textChunk;
    const { complete, rest } = splitLines(this.buffer);
    this.buffer = rest.slice(-512);
    for (const line of complete) {
      const frame: EmgFrame | null = parseEsp32Payload(line, Date.now());
      if (frame) this.frameSubs.forEach((cb) => cb(frame));
    }
  }

  private fail(message: string): void {
    this.emit("error", message);
  }

  private emit(status: ConnectionStatus, message?: string): void {
    this.statusSubs.forEach((cb) => cb(status, message));
  }
}
