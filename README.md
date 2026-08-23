# 🧬 BioSignal AI — EMG-Powered Biomechanical Intelligence & Exoskeleton Training System

> **Hackathon Theme:** *"Signals That Shape Our World"*  
> Developed for a 24-Hour Hackathon by **Team Nimbus Nova**

---

[![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Hardware](https://img.shields.io/badge/Hardware-ESP32_%7C_EMG_Sensors-red?style=for-the-badge&logo=espressif)](https://www.espressif.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Build](https://img.shields.io/badge/Hackathon-24h_MVP-orange?style=for-the-badge)]()

---

## 📌 Executive Summary

Every movement of the human body begins with an invisible signal: **electromyographic (EMG) bio-electrical pulses** emitted by neurons to contract muscle fibers. 

**BioSignal AI** is an end-to-end wearable hardware and mobile solution that intercepts these micro-volt signals in real time using an ESP32-powered sensor suit. By translating raw bio-signals into actionable intelligence, BioSignal AI serves two revolutionary purposes:

1. **Immediate Personal Health & Workout Optimization:** Prevents sports injuries, detects muscle over-exertion / under-activation, measures real calorie consumption based on actual muscular effort, and guides exercise posture using camera sensor fusion.
2. **AI-Driven Exoskeleton Mobility Models:** Logs high-frequency kinematic and muscular telemetry to train Machine Learning models. These models learn natural gait dynamics to drive next-generation physical rehabilitation exoskeletons for individuals with motor impairments.

---

## 👥 Team Nimbus Nova

| Member | Role / Contribution |
| :--- | :--- |
| **Șelaru Bogdan** | Team Lead & Embedded Systems (ESP32 / EMG Firmware) |
| **Radu Ciprian** | Mobile App Developer (React Native / UI Architecture) |
| **Vladislav Barbaros** | Data Pipeline & Machine Learning / Signal Processing |
| **Cezar Manea** | Hardware Engineering & Sensor Calibration / Testing |

---

## 🚀 Key Features

### 1. 📈 Real-Time EMG Telemetry Stream
- High-rate analog signal sampling from surface EMG sensors positioned over key muscle groups (e.g., biceps, quadriceps, gastrocnemius).
- Live Bluetooth Low Energy (BLE) / WebSocket telemetry streaming directly into the React Native mobile dashboard.
- Digital filtering & signal smoothing algorithm (Moving RMS / Bandpass filter) built directly into the ESP32 micro-controller.

### 2. ⚡ Muscle Contraction & Workout Guard
- **Visual Strain Gauge:** Live visual response indicating muscle activation intensity (0 – 100%).
- **Form Guard & Exertion Alerts:**
  - 🟢 **Optimal Zone (35% – 80%):** Peak activation for maximum strength/hypertrophy gains.
  - 🟡 **Under-Activation (< 35%):** Prompts user to squeeze harder or adjust posture.
  - 🔴 **Over-Exertion (> 85%):** Audio-visual warning to prevent muscle tears or tendon strain.

### 3. 📷 Camera-Enhanced Form Correction
- Combines live video feed with bio-signal intensity to verify exercise posture.
- Correlates peak joint angles with peak EMG contraction spikes to ensure exercises are executed safely and effectively.

### 4. 🦿 Exoskeleton Training Telemetry Collector
- Dedicated session recorder logging high-frequency gait dynamics, pulse rate, and contraction spikes.
- Exports structured telemetry datasets (`.json` / `.csv`) formatted specifically for offline Neural Network training (LSTM / Transformer models) predicting natural human movement intent.

### 5. 🎛️ Hackathon Demo Mode (Built-in Mock Generator)
- Includes a dedicated **Mock Data Switch** inside the app. If hardware sensors are disconnected during demonstrations, the app automatically emits real-time synthetic bio-signals for seamless presentation.

---

## 🏗️ System Architecture

```
                                  [ HUMAN BODY ]
                                         │
                             (Bio-electrical Signals)
                                         ▼
                            [ Surface EMG Sensors ]
                                         │
                                  (Analog Voltage)
                                         ▼
                      [ ESP32 Wearable Microcontroller ]
                     └─ Moving Average / RMS Filtering
                                         │
                             (Bluetooth LE / WebSockets)
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │      BioSignal AI Mobile App           │
                    │       (React Native + Expo)             │
                    └──────────────────┬──────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
 [ Real-Time User Feedback ]                          [ AI Exoskeleton Pipeline ]
  • Live Contraction Waveform                          • Telemetry Data Logging
  • Form & Injury Warnings                             • Stride & Intent Modeling
  • Real-Time Calorie Calculation                      • Exoskeleton Control Export
```

---

## 🛠️ Technology Stack

- **Mobile Application:** React Native, Expo, TypeScript, TailwindCSS / NativeWind
- **Data Visualization & Animations:** Victory Native / Reanimated / Skia
- **Hardware Components:** ESP32 Microcontroller, MyoWare / Analog EMG Bio-Sensors, Electrodes, LiPo Power Management
- **Hardware Protocols:** Bluetooth Low Energy (BLE) GATT profile, WebSockets, Serial UART
- **Data Processing & ML:** Python (NumPy, SciPy, PyTorch) for signal processing & gesture classification

---

## 📥 Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn
- Expo Go app installed on your Android/iOS device (or Android Studio / Xcode simulators)

### Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/nimbus-nova/biosignal-ai.git
   cd biosignal-ai
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Launch Development Server:**
   ```bash
   npx expo start
   ```

4. **Run on Device:**
   Scan the QR code printed in the terminal using the **Expo Go** application (Android) or **Camera app** (iOS).

---

## 🔌 Hardware Setup (ESP32)

1. Connect the analog signal pins of your EMG sensors to GPIO `A0` / `VP` (36) on the ESP32.
2. Flash the microcontroller firmware located in the `/hardware/esp32_firmware` directory using Arduino IDE or PlatformIO.
3. Power on the ESP32 board. The mobile app will auto-discover the BLE peripheral named `BioSignal_ESP32`.

> **Note for Hackathon Evaluators:** No physical board? Enable **"Demo / Mock Data"** mode via the top status bar toggle inside the app to simulate incoming live signals instantly.

---

## 🎯 Pitch & Theme Alignment

Our project aligns directly with the theme **"Signals That Shape Our World"** by demonstrating how invisible biological signals can be captured, deciphered, and repurposed. 

By bridging the gap between human bio-mechanics and robotics, **Nimbus Nova** is laying the foundation for a future where personal wellness is powered by bio-feedback, and mobility impairments are overcome through adaptive AI exoskeletons.

---

<p center="align">
  <i>Developed with ❤️ by Team Nimbus Nova for the 2026 24-Hour Hackathon.</i>
</p>

---

## BioSignal AI (hackathon)

Real-time EMG + heart-rate telemetry for an ESP32 wearable suit.

- [mobile-app/](./mobile-app) — React Native (Expo SDK 52) app: live EMG oscilloscope (Skia + Reanimated 60fps), AI Form Guard with camera overlay, telemetry recorder with JSON/CSV export. BLE (Nordic UART) / WebSocket transports with a built-in mock signal generator.
  - 
pm install then 
px expo start (Demo mode works out of the box)
  - Android APK: eas build -p android --profile preview
- [web-demo/](./web-demo) — React 18 + Vite web demo: same synthetic EMG engine, canvas oscilloscope, webcam form guard, JSON/CSV export.
  - 
pm install then 
pm run dev -> http://localhost:5173
