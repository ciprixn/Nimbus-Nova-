Act as a Senior React Native & Embedded Systems Mobile Engineer. Build a high-performance, polished React Native (Expo) mobile app for a 24-hour hackathon project named "BioSignal AI".

THE PROJECT VISION:
An app that reads real-time EMG (muscle contraction) and Heart Rate signals from an ESP32 wearable suit. It provides live biomechanical feedback, workout form correction, and logs high-frequency movement telemetry to train AI models for mobility exoskeletons.

TECH STACK PREFERENCES:
- Framework: React Native with Expo (TypeScript)
- Styling: NativeWind / TailwindCSS (Dark theme, bio-tech futuristic UI)
- Charts & Animations: React Native Reanimated, Victory Native (or Canvas/Skia for real-time line charts)
- Sensors/Hardware Connectivity: BLE / WebSocket service layer with a fallback Mock Signal Generator toggle.
- Camera: Expo Camera / VisionCamera for workout posture scanning.

CORE SCREENS & FEATURES TO IMPLEMENT:

1. Real-Time Telemetry Dashboard
- Live EMG Signal Graph: Smooth, scrolling line graph showing electrical muscle activity (0-100% intensity).
- Biometric Cards: Live Heart Rate (BPM), Muscle Strain Index, and estimated Calories Burned (calculated using EMG intensity * time + HR).
- Bluetooth/ESP32 Status Indicator: Connected/Disconnected status with an easily accessible toggle switch for "Demo / Mock Data Mode".

2. AI Exercise & Form Guard (Camera View)
- Camera live-view overlay showing an active workout (e.g., Bicep Curls or Squats).
- Visual Strain Gauge: Displays real-time muscle load level.
- Smart Feedback Badges:
  * "Under-activating" (Signal < 35%): Prompt to squeeze harder.
  * "Optimal Zone" (35% - 80%): Green status check.
  * "Over-exertion / Injury Risk" (Signal > 85%): Red alert warning.

3. Exoskeleton AI Training Data Collector
- A dedicated section for data logging.
- Controls: "Start Telemetry Recording", "Pause", and "Export JSON/CSV".
- Displays metadata: Time elapsed, total signal data points collected, and walking stride consistency score.

DEVELOPMENT GUIDELINES:
- Implement clean, modular code separating BLE hardware state from the UI components.
- Include a built-in Mock Data Generator hook (`useEMGData`) that emits smooth synthetic sinusoidal and spike data every 100ms so the app works out-of-the-box for UI testing and pitch demos.
- Focus on striking visual design: Dark slate background, neon emerald accents for active signals, red/cyan alerts, and smooth 60fps animations.

Please write the complete project architecture, main App components, navigation setup, and the custom hook for real-time sensor streaming.
