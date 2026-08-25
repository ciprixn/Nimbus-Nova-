# 🧬 Nimbus Nova – EMG‑Powered Biomechanical Intelligence & Exoskeleton Training System:

> **Hackathon theme:** *“Signals That Shape Our World”*  
> **Built in 24 h** by **Team Nimbus Nova** – 2026 24‑hour Hackathon

![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?style=for-the-badge&logo=react)
![Hardware](https://img.shields.io/badge/Hardware-ESP32_%7C_EMG_Sensors-E73827?style=for-the-badge&logo=espressif)
![License](https://img.shields.io/badge/License-MIT-0A7D2C?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/Hackathon-24h_MVP-FF7F00?style=for-the-badge)

---

## 📌 Executive Summary

Every voluntary movement starts with an invisible **electromyographic (EMG) bio‑electrical pulse** that travels from neuron to muscle fiber. **Nimbus Nova** captures those micro‑volt signals in real time with an ESP32‑based sensor suit and turns them into actionable intelligence for two high‑impact use‑cases:

| # | Goal | What Nimbus Nova delivers |
|---|------|---------------------------|
| **1️⃣ Personal Health & Workout** | Prevent injury, maximise gains, track true calories | Live EMG oscilloscope, real‑time strain gauge, form‑guard camera overlay, injury‑risk alerts, on‑device calorie model |
| **2️⃣ AI‑Driven Exoskeleton Training** | Teach robots how humans really move | High‑frequency telemetry logger (EMG + HR + gait), one‑tap JSON/CSV export, stride‑consistency scoring, ready‑to‑train LSTM/Transformer datasets |

> **Demo‑ready out of the box** – a built‑in **Mock Signal Generator** streams synthetic EMG/HR so the app works instantly without any hardware.

---

## 👥 Team Nimbus Nova

| Member | Role / Focus |
|--------|--------------|
| **Șelaru Bogdan** | Team Lead & Embedded Systems (ESP32 firmware, EMG firmware) |
| **Radu Ciprian** | Mobile App (React Native / Expo, UI architecture, Skia + Reanimated) |
| **Vladislav Barbaros** | Data Pipeline & ML (signal processing, LSTM/Transformer pipelines) |
| **Cezar Manea** | Hardware Engineering (PCB layout, sensor calibration, BLE/Wi‑Fi stack) |

---

## 🚀 Key Features

| # | Feature | Highlights |
|---|---------|------------|
| **1️⃣ Real‑Time EMG Telemetry** | 4‑channel surface EMG @ 10 Hz, BLE (Nordic UART) & WebSocket, on‑board RMS / band‑pass filtering on ESP32 |
| **2️⃣ Muscle‑Contraction & Workout Guard** | • Live visual strain gauge (0‑100 %) <br>• **Green** Optimal 35‑80 % <br>• **Yellow** Under‑activation < 35 % <br>• **Red** Over‑exertion > 85 % <br>• Audio + visual alerts |
| **3️⃣ Camera‑Enhanced Form Guard** | Fuses live camera feed with EMG peaks → verifies joint angles vs. contraction spikes |
| **4️⃣ Exoskeleton Training Collector** | One‑tap session recorder → JSON/CSV export, stride‑consistency score, ready‑to‑train LSTM/Transformer format |
| **5️⃣ Hackathon Demo Mode** | Built‑in mock generator (synthetic EMG + HR + burst patterns) – works instantly in Expo Go without any board |

---

## 🏗️ System Architecture

```
[ Human Body ] ──(EMG/HR)──▶ [ EMG Sensors ] ──▶ [ ESP32 Wearable ]
                                                    │
                         ┌────────────────────────┴─────────────────────┐
                         ▼                                               ▼
               [ Nimbus Nova Mobile App ]                         [ AI Exoskeleton Pipeline ]
               (React Native + Expo)                               (Python / PyTorch)
                • Live waveform (Skia 60 fps)        • Session logger (JSON/CSV)
                • Strain gauge & alerts                • Stride‑consistency scoring
                • Camera form guard                    • LSTM / Transformer datasets
                • Mock / BLE / WebSocket switch        • Model export (ONNX / TFLite)
```

---

## 🛠 Technology Stack

| Layer | Stack |
|-------|-------|
| **Mobile** | React Native 0.76, Expo SDK 52, TypeScript, NativeWind (Tailwind CSS) |
| **Graphics / Motion** | `@shopify/react-native-skia` (60 fps waveform), `react-native-reanimated 3` |
| **Hardware** | ESP32‑S3, MyoWare‑style analog EMG front‑ends, LiPo + TP4056 charger, 3‑D‑printed sensor housing |
| **Wireless** | BLE 5 (Nordic UART Service `6E400001‑B5A3‑F393‑E0A9‑E50E24DCCA9E`), WebSocket (`ws://192.168.4.1:81/`) |
| **Firmware** | ESP‑IDF / Arduino, on‑chip RMS & band‑pass (0.5‑150 Hz) |
| **Data / ML** | Python 3.11, NumPy, SciPy, PyTorch 2, ONNX export, Optuna hyper‑opt |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Minimum |
|------|---------|
| Node.js | 18.x (LTS) |
| npm / yarn | ≥ 9 |
| Expo Go (Android / iOS) | latest |
| Android Studio / Xcode (optional) | for native builds |

### 1️⃣ Clone & Install

```bash
git clone https://github.com/ciprixn/Nimbus-Nova-.git
cd Nimbus-Nova-

# Mobile app
cd mobile-app
npm ci               # clean install
npx expo start       # → scan QR with Expo Go (Demo mode works out of the box)

# Web demo (separate terminal)
cd ../web-demo
npm ci
npm run dev          # → http://localhost:5173
```

### 2️⃣ Hardware (optional – for real signals)

| Step | Action |
|------|--------|
| **1. Wire EMG front‑ends** | Connect EMG front‑end outputs to ESP32 GPIOs 36 (VP) & 39 (VN) |
| **2. Flash firmware** | `cd hardware/esp32_firmware && idf.py flash monitor` (or Arduino IDE) |
| **3. Power & pair** | Power the suit → app auto‑discovers BLE peripheral `NimbusSuit` |
| **4. Demo mode** | In the app header tap **“Demo / Mock”** to enable synthetic signals (no board needed) |

> **Hackathon tip:** the app starts in **Demo mode** by default – you can demo the full UI on any phone without a single wire.

---

## 🤖 AI Chatbot (Web Demo)

The web demo embeds a floating assistant powered by **NVIDIA NIM** (Llama‑3.1‑8B‑Instruct). The API key never leaves the server – a tiny Vite middleware proxies `/api/chat`.

```bash
cd web-demo
cp .env.example .env          # create local env
# edit .env → NVIDIA_API_KEY=your_key
npm run dev                   # or: npm run build && npm run preview
```

---

## 📂 Repository Layout

```
Nimbus-Nova-/
├── mobile-app/          # Expo (React Native) – main hackathon deliverable
│   ├── src/
│   │   ├── components/  # Skia waveform, MuscleMap, ChannelBars, Gauge …
│   │   ├── screens/     # Dashboard, FormGuard, DataLab
│   │   ├── hooks/       # useEMGData, useRecorder, useReveal …
│   │   ├── services/    # BLE, WebSocket, Mock generator, SensorService
│   │   └── state/       # SensorProvider (React Context)
│   ├── app.json, eas.json, package.json
│   └── ...
├── web-demo/            # Vite + React 18 landing + live demo
│   ├── src/
│   │   ├── components/site/   # Hero, Features, HowItWorks, Spec, Ticker, Chatbot
│   │   ├── engine/            # Synthetic EMG engine (identical math to mobile)
│   │   └── hooks/
│   ├── index.html, vite.config.ts, tailwind.config.js
│   └── ...
├── hardware/            # ESP32 firmware (PlatformIO / ESP‑IDF)
│   └── esp32_firmware/
├── .github/workflows/   # EAS build, lint, type‑check
├── .env.example         # NVIDIA_API_KEY template (never commit real key!)
├── LICENSE              # MIT
└── README.md
```

---

## 🤝 Contributing

1. **Fork** the repo → create a feature branch (`feat/…` or `fix/…`).
2. Run `npm run lint && npm run typecheck` (both projects).
3. Open a **Pull Request** with a clear description + screenshots / videos for UI changes.

> **Code‑style:** TypeScript strict, ESLint + Prettier, Conventional Commits (`feat:`, `fix:`, `chore:`).

---

## 📜 License

MIT – see [`LICENSE`](LICENSE).

---

## 🙏 Acknowledgements

- **Espressif** for the ESP32 platform & BLE stack  
- **Expo & NativeWind teams** for the delightful RN + Tailwind DX  
- **Shopify** for `@shopify/react-native-skia` (silky 60 fps graphics)  
- **NVIDIA** for the free NIM inference endpoint (Llama‑3.1‑8B)  
- All open‑source libraries that made a 24‑h build possible  

---

<p align="center">
  <i>Built with ❤️ by Team Nimbus Nova for the 2026 24‑Hour Hackathon.</i><br>
  <b>“Signals That Shape Our World”</b>
</p>
