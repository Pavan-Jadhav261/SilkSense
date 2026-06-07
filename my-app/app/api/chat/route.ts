import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

const GEMINI_MODEL = "gemini-2.5-flash";

function getReply(data: GeminiResponse) {
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || ""
  );
}

export async function POST(req: Request) {
  try {
    const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
    const body = await req.json();
    const messages = (body.messages || []) as ChatMessage[];
    const language = body.language === "kn" ? "Kannada" : "English";

    if (!apiKey || !messages.length) {
      return NextResponse.json(
        { error: "Missing Gemini API key in environment or chat messages." },
        { status: 400 },
      );
    }

    const contents = messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.text }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: `You are a practical sericulture assistant for Indian farmers and students. Answer only in ${language}. Keep answers simple, accurate, and actionable. Cover silkworm rearing, mulberry cultivation, cocoon quality, diseases, silk production, and market guidance. If the question is unsafe or unrelated, briefly redirect to sericulture help.`,
              },
            ],
          },
          contents,
        }),
      },
    );

    const data = (await response.json()) as GeminiResponse;

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Gemini chat request failed." },
        { status: response.status },
      );
    }

    return NextResponse.json({
      reply: getReply(data) || "I could not generate a response right now.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected chat error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
