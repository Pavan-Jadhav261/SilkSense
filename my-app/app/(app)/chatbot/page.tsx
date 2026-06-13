"use client";

import { FormEvent, useState } from "react";
import { useApp } from "../../providers";

type Message = { role: "user" | "assistant"; text: string };

export default function ChatbotPage() {
  const { lang, logActivity } = useApp();
  const [messages, setMessages] = useState<Message[]>(() => [
    { role: "assistant", text: lang === "kn" ? "ನಮಸ್ಕಾರ, ನಾನು ನಿಮ್ಮ ರೇಷ್ಮೆ ಸಹಾಯಕ. ಪ್ರಶ್ನೆ ಕೇಳಿ." : "Hello, I am your sericulture assistant. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    const nextMessages = [...messages, { role: "user" as const, text: question }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");
    logActivity("chat_message", question);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, language: lang }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chat request failed.");
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected chat error.";
      setError(message);
      setMessages((prev) => [...prev, { role: "assistant", text: message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="section-panel">
        <h1 className="section-title">{lang === "kn" ? "AI ಚಾಟ್‌ಬಾಟ್" : "AI Chatbot"}</h1>
        <p className="mt-2 text-slate-600">{lang === "kn" ? "ಸಲಹೆಗಳು, ರೋಗ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ." : "Advice, disease guidance, and market information."}</p>
      </section>
      <section className="mx-auto max-w-3xl rounded-3xl border border-emerald-100 bg-white shadow-lg">
        <div className="border-b border-emerald-100 px-4 py-3 font-semibold text-[#2d6a4f]">
          {lang === "kn" ? "ವಾಟ್ಸಾಪ್ ಶೈಲಿಯ ಚಾಟ್" : "WhatsApp-style Chat"}
        </div>
        <div className="space-y-3 p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "ml-auto bg-[#2d6a4f] text-white" : "bg-emerald-50 text-slate-700"}`}
            >
              {message.text}
            </div>
          ))}
          {loading && (
            <div className="max-w-[80%] rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-slate-700">
              {lang === "kn" ? "ಟೈಪ್ ಮಾಡುತ್ತಿದೆ..." : "Typing..."}
            </div>
          )}
        </div>
        {error && <p className="mx-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <form onSubmit={send} className="flex gap-2 border-t border-emerald-100 p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-emerald-200 px-4 py-3"
            placeholder={lang === "kn" ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆ" : "Type your question"}
          />
          <button className="rounded-xl bg-[#f4a261] px-5 py-3 font-semibold text-[#43240f]" type="submit" disabled={loading}>
            {lang === "kn" ? "ಕಳುಹಿಸಿ" : "Send"}
          </button>
        </form>
      </section>
    </div>
  );
}
