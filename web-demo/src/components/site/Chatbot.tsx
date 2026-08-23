import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hey! I'm the BioSignal assistant. Ask me about the ESP32 suit, the EMG protocol, form-guard zones, or the ML data pipeline.",
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? `\u26A0 ${data.error ?? "Something went wrong."}`,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "\u26A0 Could not reach the server. Is the dev server running?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[440px] w-[min(92vw,360px)] flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-bio-panel/95 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
                </svg>
              </span>
              <div>
                <div className="text-xs font-bold tracking-widest text-slate-100">BIOSIGNAL ASSISTANT</div>
                <div className="text-[9px] tracking-wider text-slate-500">powered by NVIDIA NIM</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 transition-colors hover:text-slate-200"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {loading && (
              <div className="flex gap-1.5 pl-1">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400"
                    style={{ animationDelay: `${d * 120}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-slate-800 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about the project..."
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-emerald-400/50"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="rounded-xl border border-emerald-400/50 bg-emerald-400/15 px-3 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-400/25 disabled:opacity-35"
            >
              SEND
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="group relative flex items-center justify-center self-end rounded-full border border-emerald-400/50 bg-bio-panel p-4 shadow-[0_0_28px_rgba(52,211,153,0.35)] transition-transform hover:scale-105 active:scale-95"
        aria-label="Toggle chat"
      >
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse-dot rounded-full border-2 border-bio-panel bg-emerald-400" />
        )}
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M21 12a8 8 0 01-8 8H5l-2 2V12a8 8 0 018-8h2a8 8 0 018 8z" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

function Bubble({ role, content }: Msg) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
          isUser
            ? "rounded-br-md border border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
            : "rounded-bl-md border border-slate-700/70 bg-slate-900/80 text-slate-300"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
