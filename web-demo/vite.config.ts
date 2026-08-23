import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import path from "node:path";

import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";

const SYSTEM_PROMPT =
  "You are the Nimbus Nova assistant. Nimbus Nova is a 24-hour hackathon project: " +
  "an ESP32 wearable suit streams 4-channel EMG (normalized 0-100 %MVC) and PPG heart rate " +
  "at 10Hz over BLE Nordic UART or WebSocket into React Native / React apps that render live " +
  "biomechanical feedback, camera-based form coaching with injury-risk zones (<35% under-activation, " +
  "35-80% optimal, >85% danger), and export JSON/CSV telemetry for exoskeleton ML training. " +
  "Answer questions about the project, the hardware protocol, and EMG/fitness topics concisely.";

/**
 * Server-side proxy so the NVIDIA key never reaches the browser bundle.
 * Works in `vite dev`, `vite preview` (and thus behind any host of dist/).
 */
function nvidiaChatProxy(): Plugin {
  const readKey = (): string | null => {
    if (process.env.NVIDIA_API_KEY) return process.env.NVIDIA_API_KEY;
    try {
      const envPath = path.resolve(__dirname, ".env");
      if (!fs.existsSync(envPath)) return null;
      for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
        const m = /^NVIDIA_API_KEY\s*=\s*(.+)\s*$/.exec(line);
        if (m) return m[1].trim();
      }
    } catch {
      // fall through
    }
    return null;
  };

  const handler = async (req: import("http").IncomingMessage, res: import("http").ServerResponse) => {
    res.setHeader("Content-Type", "application/json");
    const key = readKey();
    if (!key) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "NVIDIA_API_KEY missing. Create web-demo/.env (see .env.example)." }));
      return;
    }

    let raw = "";
    for await (const chunk of req) raw += chunk;
    let messages: Array<{ role: string; content: string }> = [];
    try {
      messages = (JSON.parse(raw) as { messages?: typeof messages }).messages ?? [];
    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }

    try {
      const upstream = await fetch(NVIDIA_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          model: process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-12)],
          temperature: 0.6,
          top_p: 0.9,
          max_tokens: 500,
        }),
      });

      const data = (await upstream.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        detail?: unknown;
      };

      if (!upstream.ok) {
        res.statusCode = upstream.status;
        res.end(JSON.stringify({ error: `NVIDIA API ${upstream.status}`, detail: data.detail ?? null }));
        return;
      }

      res.end(JSON.stringify({ reply: data.choices?.[0]?.message?.content ?? "(empty reply)" }));
    } catch {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: "Could not reach NVIDIA API" }));
    }
  };

  return {
    name: "nvidia-chat-proxy",
    configureServer(server) {
      server.middlewares.use("/api/chat", handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/chat", handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), nvidiaChatProxy()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

declare const __dirname: string;
