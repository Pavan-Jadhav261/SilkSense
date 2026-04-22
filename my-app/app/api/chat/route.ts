import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

const replyFunction = {
  name: "sericulture_assistant_reply",
  description: "Returns a clear and practical sericulture answer for the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      answer: { type: Type.STRING, description: "Main response to user question." },
      priority: {
        type: Type.STRING,
        description: "Low, Medium, or High urgency based on risk.",
      },
      tips: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Short actionable tips.",
      },
    },
    required: ["answer", "priority", "tips"],
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = String(body.apiKey || "");
    const messages = (body.messages || []) as ChatMessage[];

    if (!apiKey || !messages.length) {
      return NextResponse.json(
        { error: "Missing API key or chat messages." },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt =
      "You are a smart sericulture assistant. Answer questions about silkworm rearing, silk production, cocoon quality, mulberry cultivation, diseases, market prices, and farming tips. Be friendly, simple, and practical.";

    const contents = [
      { role: "user" as const, parts: [{ text: prompt }] },
      ...messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    ];

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
      config: {
        tools: [{ functionDeclarations: [replyFunction] }],
      },
    });

    const call = response.functionCalls?.[0];
    if (call?.args) {
      const tips = Array.isArray(call.args.tips)
        ? call.args.tips.map((tip) => `- ${String(tip)}`).join("\n")
        : "";
      const finalReply = `${String(call.args.answer || "")}\n\nPriority: ${String(call.args.priority || "Medium")}${tips ? `\n${tips}` : ""}`.trim();
      return NextResponse.json({ reply: finalReply });
    }

    return NextResponse.json({
      reply: response.text || "I could not generate a response right now.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected chat error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
