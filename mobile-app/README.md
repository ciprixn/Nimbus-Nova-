# BioSignal AI

Real-time EMG + heart-rate telemetry for an ESP32 wearable suit. Live biomechanical
feedback, workout form guard with camera overlay, and high-frequency data logging
for exoskeleton AI training. Ships with a synthetic signal generator so it demos
out-of-the-box - no hardware required.

## Stack

- Expo SDK 52 / React Native 0.76 / TypeScript (strict)
- NativeWind 4 (Tailwind) - dark bio-tech theme (`slate-950` + neon emerald/cyan/amber/red)
- React Native Reanimated 3 + @shopify/react-native-skia - 60fps scrolling oscilloscope & gauges
- React Navigation 7 (bottom tabs, custom tab bar)
- expo-camera (form guard), expo-file-system + expo-sharing (JSON/CSV export)
- react-native-ble-plx (optional native BLE; lazily loaded so Expo Go never crashes)

## Run

```bash
npm install
npx expo start        # Demo mode active by default
```

For real BLE: `npx expo prebuild` then `npx expo run:ios` / `run:android`
(Expo Go cannot host BLE native modules - the app tells you this instead of crashing).

## Architecture

```
src/
├── services/                 # Hardware layer (no UI imports)
│   ├── SensorService.ts      #   Singleton facade: owns active source, derives biometrics
│   ├── createSource.ts       #   Factory: mock | ble | websocket
│   ├── protocol.ts           #   ESP32 payload parser (JSON lines / "E:42,H:118")
│   └── sources/
│       ├── MockSignalSource.ts     # 100ms ticks: sinusoids + spikes + bursts + HR drift
│       ├── BleSignalSource.ts      # Nordic UART scan/connect/notify (lazy native import)
│       ├── WebSocketSignalSource.ts# ws://ESP32:81/ with auto-reconnect
│       └── bleConfig.ts            # UUIDs, timeouts, default URL
├── state/SensorProvider.tsx  # Split contexts: ControlContext (mode/status/actions,
│                             # stable) + LiveContext (frame/biometrics at signal rate)
│   useEMGData()              # Real-time streaming hook (10 Hz samples + derived metrics)
│   useSensorControl()        # Transport switching, session reset
├── hooks/useRecorder.ts      # Recording state machine, stride consistency scoring
├── components/
│   ├── charts/EmgWaveformChart.tsx # Skia path rebuilt at 10Hz, scroll offset interpolated
│   │                               # on the UI thread every frame -> buttery 60fps
│   ├── StrainGauge.tsx       # Spring-driven circular arc gauge (Skia)
│   ├── FeedbackBadge.tsx     # Zone badges w/ pulse-on-danger
│   ├── BiometricCard.tsx, ConnectionStatusBar.tsx, Controls.tsx, NeonButton.tsx
├── screens/
│   ├── DashboardScreen.tsx   # Waveform, HR / strain / calories cards, source panel
│   ├── FormGuardScreen.tsx   # CameraView overlay: zones (<35 under / 35-80 optimal /
│   │                         # >85 injury risk), rep detection, danger border alarm
│   └── DataCollectorScreen.tsx # Start/pause/resume/stop, export JSON/CSV via share sheet
└── navigation/RootNavigator.tsx # Custom bottom tabs (TELEMETRY / FORM GUARD / DATA LAB)
```

### Data flow

```
ESP32 (BLE NUS or WebSocket)          MockSignalSource (default)
            └───────────────┬─────────────────┘
                     SignalSource interface
                              │ frames (100ms)
                      SensorService (singleton)
                 strain EMA · calorie model · fan-out
              ┌──────────────────┴───────────────────┐
       SensorProvider contexts                direct subscriptions
   useEMGData() → React UI (cards,        EmgWaveformChart → shared values →
   badges, recorder) re-render 10Hz       Skia worklets render at 60fps, no JS work
```

### ESP32 firmware contract

Newline-delimited text over Nordic UART TX characteristic
(`6E400001-B5A3-F393-E0A9-E50E24DCCA9E`, TX `...0003`) or a WebSocket:

```json
{"emg":[62.4,58.1,70.2,55.0],"hr":118}
{"emg":62.4,"hr":118}
E:62.4,H:118
```

`emg` values are normalized 0-100 (% MVC). Default WiFi endpoint:
`ws://192.168.4.1:81/`.

### Derived metrics

- **Strain Index** - exponential moving average of aggregate EMG (alpha 0.12).
- **Calories** - per-tick blend of EMG mechanical work and HR cardiac load,
  tuned to ~5 kcal/min at 50% activation / 120 bpm.
- **Stride Consistency** - peak-detection on the EMG envelope; score = 1 - CV
  of peak-to-peak intervals (0-100%).

## Hackathon demo tips

1. Open in **Demo mode** - waveform, zones and calories all animate immediately.
2. Form Guard works without camera permission (EMG overlay still runs); grant
   camera for the full pitch visual.
3. Record ~30s of telemetry, export CSV, show the file in Numbers/Excel for the
   "training data pipeline" slide.
