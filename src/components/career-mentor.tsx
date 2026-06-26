import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useServerFn } from "@tanstack/react-start";
import { getMentorContext } from "@/lib/mentor-context.functions";
import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Sparkles, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "mentor.messages.v1";
const QUICK_PROMPTS = [
  "Review my resume strengths",
  "What should I learn next?",
  "Top tips for my next interview",
  "Suggest a project for my portfolio",
];

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CareerMentor() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [ctx, setCtx] = useState<unknown>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fetchCtx = useServerFn(getMentorContext);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => { if (mounted) setSignedIn(!!data.user); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session?.user));
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: "career-mentor",
    messages: loadMessages(),
    transport: new DefaultChatTransport({
      api: "/api/mentor",
      prepareSendMessagesRequest: ({ messages, id }) => ({
        body: { id, messages, context: ctx },
      }),
    }),
  });

  // persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
  }, [messages]);

  // load context when opened
  useEffect(() => {
    if (open && signedIn && !ctx) {
      fetchCtx({}).then(setCtx).catch(() => setCtx({}));
    }
  }, [open, signedIn, ctx, fetchCtx]);

  // auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // focus
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  if (!signedIn) return null;

  const busy = status === "submitted" || status === "streaming";

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    await sendMessage({ text: t });
  }

  function renderText(m: UIMessage) {
    return m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null));
  }

  return (
    <div className="fixed bottom-24 right-6 z-[60]">
      {open && (
        <div className="mb-3 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-8rem)] rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in-0">
          <div className="bg-gradient-primary p-4 text-primary-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-white/15 grid place-items-center"><Sparkles className="size-5" /></div>
              <div>
                <div className="font-semibold leading-tight">Career Mentor</div>
                <div className="text-[11px] opacity-90">Personalized AI guidance</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button onClick={() => { setMessages([]); try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ } }}
                  title="Clear chat" className="p-1.5 rounded-lg hover:bg-white/15"><Trash2 className="size-4" /></button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/15"><X className="size-4" /></button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-6">
                <div className="size-12 mx-auto rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-3">
                  <Bot className="size-6 text-primary-foreground" />
                </div>
                <div className="font-semibold">Hi! I'm your Career Mentor</div>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Ask anything about your career, resume, skills or interviews.</p>
                <div className="grid gap-2">
                  {QUICK_PROMPTS.map((q) => (
                    <button key={q} onClick={() => send(q)}
                      className="text-left text-xs px-3 py-2 rounded-lg border border-border bg-background/40 hover:border-primary hover:bg-primary/5 transition">{q}</button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-primary text-primary-foreground px-3 py-2 rounded-2xl rounded-br-sm shadow-sm"
                      : "text-foreground"
                  }`}>{renderText(m)}</div>
                </div>
              ))
            )}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" /> Thinking…</div>
            )}
            {error && <div className="text-xs text-destructive">{error.message}</div>}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); void send(input); }}
            className="border-t border-border p-3 flex items-end gap-2 bg-background/60"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
              placeholder="Ask your career mentor…"
              rows={1}
              className="flex-1 resize-none bg-input border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-ring max-h-32"
            />
            <button type="submit" disabled={busy || !input.trim()}
              className="size-9 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow disabled:opacity-50 hover:opacity-95 transition">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} aria-label="Open Career Mentor"
        className="size-14 rounded-full bg-gradient-primary text-primary-foreground shadow-glow flex items-center justify-center hover:scale-105 transition-transform relative">
        {open ? <X className="size-6" /> : <Bot className="size-6" />}
        {!open && <span className="absolute -top-1 -right-1 size-3 rounded-full bg-success ring-2 ring-background" />}
      </button>
    </div>
  );
}
