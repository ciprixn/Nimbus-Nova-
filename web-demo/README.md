# Nimbus Nova — Web Demo

Browser version of the Nimbus Nova pitch demo (React 18 + Vite + TypeScript + Tailwind).
Same synthetic EMG engine as the mobile app: fatigue wave + rep rhythm + spikes +
burst holds at 10Hz, scrolling canvas oscilloscope with interpolated offset.

## Run

```bash
npm install
npm run dev        # opens on http://localhost:5173 (LAN-exposed via --host)
```

Phone on same network: open `http://<pc-ip>:5173`.

## Screens

- **TELEMETRY** - live EMG waveform, HR / strain / calories / session cards
- **FORM GUARD** - optional webcam overlay (`ENABLE CAMERA OVERLAY`), strain gauge,
  zone badges (<35 under / 35-80 optimal / >85 injury risk), rep detection
- **DATA LAB** - start/pause/stop recorder, stride consistency score,
  JSON session bundle & CSV export via browser download

Camera requires HTTPS or localhost per browser policy.
