import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

export async function POST(req: Request) {
  try {
    const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
    const body = await req.json();
    const messages = (body.messages || []) as ChatMessage[];
    const language = body.language === "kn" ? "Kannada" : "English";

    if (!apiKey || !messages.length) {
      return NextResponse.json(
        { error: "Missing OpenAI API key in environment or chat messages." },
        { status: 400 },
      );
    }

    const conversation = messages.map((message) => ({
      role: message.role,
      content: message.text,
    }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a practical sericulture assistant for Indian farmers and students. Answer only in ${language}. Keep answers simple, accurate, and actionable. Cover silkworm rearing, mulberry cultivation, cocoon quality, diseases, silk production, and market guidance. If the question is unsafe or unrelated, briefly redirect to sericulture help.`,
          },
          ...conversation,
        ],
        temperature: 0.4,
      }),
    });

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "OpenAI chat request failed." },
        { status: response.status },
      );
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({
      reply: reply || "I could not generate a response right now.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected chat error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
