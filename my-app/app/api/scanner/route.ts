import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OpenAIResponse = {
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
  output_text?: string;
};

type ScannerPayload = {
  detected: string;
  healthStatus: string;
  analysis: string;
  recommendations: string;
  confidence: string;
  raw: string;
};

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

function extractText(data: OpenAIResponse) {
  return (
    data.output?.flatMap((item) => item.content || [])
      .filter((part) => part.type === "output_text" && typeof part.text === "string")
      .map((part) => part.text || "")
      .join("")
      .trim() || data.output_text || ""
  );
}

function parseScannerJson(raw: string): ScannerPayload | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) return null;

  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Partial<ScannerPayload>;
    return {
      detected: String(parsed.detected || "Not detected"),
      healthStatus: String(parsed.healthStatus || "Needs Attention"),
      analysis: String(parsed.analysis || "No detailed analysis."),
      recommendations: String(parsed.recommendations || "No recommendation provided."),
      confidence: String(parsed.confidence || "Not specified"),
      raw,
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
    const body = await req.json();
    const imageBase64 = String(body.imageBase64 || "");
    const mimeType = String(body.mimeType || "image/jpeg");

    if (!apiKey || !imageBase64) {
      return NextResponse.json(
        { error: "Missing OpenAI API key in environment or image data." },
        { status: 400 },
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: "You are an expert sericulture advisor AI. Analyze the uploaded image and identify whether it shows a silkworm, cocoon, mulberry leaf, or rearing environment. Assess the health condition, detect any visible diseases or problems, and give practical recommendations to the farmer. Return a JSON object with keys detected, healthStatus, analysis, recommendations, and confidence only.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Analyze this sericulture image.",
              },
              {
                type: "input_image",
                image_url: `data:${mimeType};base64,${imageBase64}`,
              },
            ],
          },
        ],
      }),
    });

    const data = (await response.json()) as OpenAIResponse;

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "OpenAI image request failed." },
        { status: response.status },
      );
    }

    const raw = extractText(data);
    const parsed = parseScannerJson(raw);

    if (parsed) {
      return NextResponse.json(parsed);
    }

    return NextResponse.json({
      detected: "Not clearly provided",
      healthStatus: "Needs Attention",
      analysis: raw || "No analysis generated.",
      recommendations: "Please retry with a clearer image.",
      confidence: "Not specified",
      raw,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected scanner error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
