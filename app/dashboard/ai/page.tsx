"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiRequest, errorMessage } from "@/lib/api-client";

type Message = { role: "user" | "ai"; text: string; fresh?: boolean };

const GREETING: Message = {
  role: "ai",
  text: "สวัสดีครับ ผมคือผู้ช่วย AI ของคุณ ให้ช่วยวิเคราะห์อาการเสีย หรือสรุปงานล่าสุดได้เลยครับ",
};

const SUGGESTIONS = ["สรุปงานที่ค้างอยู่", "งานด่วนมีอะไรบ้าง", "ช่วยวิเคราะห์อาการเสีย"];

/** แสดงข้อความ AI ทีละช่วงเหมือนกำลังพิมพ์ */
function TypedText({ text, onTick }: { text: string; onTick: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    const timer = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(timer);
          return c;
        }
        return Math.min(c + 3, text.length);
      });
      onTick();
    }, 16);
    return () => clearInterval(timer);
  }, [text, onTick]);

  return <>{text.slice(0, count)}</>;
}

export default function AIPage() {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  const send = async (raw: string) => {
    const prompt = raw.trim();
    if (!prompt || isSending) return;

    setInput("");
    setMessages((current) => [...current, { role: "user", text: prompt }]);
    setIsSending(true);

    try {
      // ข้อมูลงานล่าสุดเซิร์ฟเวอร์ดึงจากฐานข้อมูลเอง ไม่ต้องส่งมาจากหน้าเว็บ
      const { text } = await apiRequest<{ text: string }>("/api/ai", {
        method: "POST",
        body: { prompt },
      });
      setMessages((current) => [...current, { role: "ai", text, fresh: true }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "ai", text: `ขออภัยครับ ${errorMessage(error)}` }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  if (isLoading || !isAuthenticated) return <FullPageSpinner />;

  return (
    <AppShell title="AI ผู้ช่วยช่าง" subtitle="ถามอาการเสีย หรือให้สรุปงานล่าสุด" flush>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-8">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div key={idx} className={`pop flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isUser ? "bg-ink text-white" : "bg-hazard text-ink"
                    }`}
                  >
                    {isUser ? <User size={17} /> : <Bot size={18} />}
                  </div>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser ? "rounded-tr-sm bg-ink text-white" : "card rounded-tl-sm text-ink"
                    }`}
                  >
                    {msg.fresh ? <TypedText text={msg.text} onTick={scrollDown} /> : msg.text}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="pop flex gap-3" aria-live="polite">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hazard text-ink">
                  <Bot size={18} />
                </div>
                <div className="card flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-4">
                  {[0, 1, 2].map((n) => (
                    <span key={n} className="typing-dot h-2 w-2 rounded-full bg-steel-2" style={{ animationDelay: `${n * 150}ms` }} />
                  ))}
                  <span className="sr-only">AI กำลังคิดคำตอบ</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-line bg-paper p-3 md:p-4">
          <div className="mx-auto max-w-3xl space-y-3">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((text, i) => (
                  <button
                    key={text}
                    onClick={() => send(text)}
                    disabled={isSending}
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="pop flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm transition hover:border-ink hover:bg-hazard-soft active:scale-95"
                  >
                    <Sparkles size={14} className="text-hazard" /> {text}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={2000}
                placeholder="ถาม AI เช่น “สรุปงานวันนี้” หรือ “Error 05 แก้ยังไง”"
                className="input flex-1 rounded-xl py-3"
                disabled={isSending}
              />
              <button type="submit" disabled={isSending || !input.trim()} aria-label="ส่งข้อความ" className="btn btn-primary rounded-xl px-4">
                <Send size={19} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
