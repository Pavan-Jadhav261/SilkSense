import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const schemaFunction = {
  name: "analyze_sericulture_image",
  description:
    "Analyzes silkworm, cocoon, mulberry leaf, or rearing environment image and returns structured advice.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      detected: { type: Type.STRING, description: "What is visible in the image." },
      healthStatus: {
        type: Type.STRING,
        description: "One of Healthy, Warning, or Critical.",
      },
      analysis: { type: Type.STRING, description: "Detailed findings from the image." },
      recommendations: { type: Type.STRING, description: "Actionable advice for the farmer." },
      confidence: { type: Type.STRING, description: "Confidence percentage." },
    },
    required: [
      "detected",
      "healthStatus",
      "analysis",
      "recommendations",
      "confidence",
    ],
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = String(body.apiKey || "");
    const imageBase64 = String(body.imageBase64 || "");
    const mimeType = String(body.mimeType || "image/jpeg");

    if (!apiKey || !imageBase64) {
      return NextResponse.json(
        { error: "Missing API key or image data." },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        },
        {
          text: `You are an expert sericulture advisor AI. Analyze the uploaded image and identify whether it shows a silkworm, cocoon, mulberry leaf, or rearing environment. Assess the health condition, detect any visible diseases or problems, and give practical recommendations to the farmer.
Format your response as:
Detected
Health Status
Analysis
Recommendations
Confidence.
Call the analyze_sericulture_image function with the final structured answer.`,
        },
      ],
      config: {
        tools: [{ functionDeclarations: [schemaFunction] }],
      },
    });

    const call = response.functionCalls?.[0];
    const raw = response.text || "";

    if (call?.args) {
      return NextResponse.json({
        detected: String(call.args.detected || "Not detected"),
        healthStatus: String(call.args.healthStatus || "Needs Attention"),
        analysis: String(call.args.analysis || "No detailed analysis."),
        recommendations: String(call.args.recommendations || "No recommendation provided."),
        confidence: String(call.args.confidence || "Not specified"),
        raw,
      });
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
