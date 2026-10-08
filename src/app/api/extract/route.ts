import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import {
  DOCUMENT_SLOTS,
  EXTRACTION_SYSTEM_PROMPT,
  type ExtractionResult,
} from "@/lib/extraction";

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

function isOverloadedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const RETRY_DELAYS_MS = [2000, 5000, 10000];

async function generateWithRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI["models"]["generateContent"]>[0],
) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error) {
      if (attempt >= RETRY_DELAYS_MS.length || !isOverloadedError(error)) {
        throw error;
      }
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY n'est pas configurée sur le serveur." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide : des images (multipart/form-data) sont attendues." },
      { status: 400 },
    );
  }

  const parts: Part[] = [{ text: EXTRACTION_SYSTEM_PROMPT }];
  let providedCount = 0;

  for (const slot of DOCUMENT_SLOTS) {
    const file = formData.get(slot.key);
    if (!(file instanceof File)) continue;

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Format d'image non supporté pour ${slot.label}: ${file.type || "inconnu"}` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    parts.push({ text: `Image suivante : ${slot.label}` });
    parts.push({ inlineData: { mimeType: file.type, data: buffer.toString("base64") } });
    providedCount++;
  }

  if (providedCount === 0) {
    return NextResponse.json(
      { error: "Aucune image fournie. Envoyez au moins un document." },
      { status: 400 },
    );
  }

  parts.push({
    text: "Analysez les images ci-dessus et renvoyez uniquement l'objet JSON décrit dans vos instructions.",
  });

  const ai = new GoogleGenAI({ apiKey });

  let responseText: string;
  try {
    const response = await generateWithRetry(ai, {
      model: "gemini-flash-lite-latest",
      contents: parts,
      config: { responseMimeType: "application/json" },
    });
    responseText = response.text ?? "";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = isOverloadedError(error) ? 503 : 502;
    const prefix = status === 503 ? "Service Gemini surchargé, réessayez dans un instant" : "Erreur API Gemini";
    return NextResponse.json({ error: `${prefix} : ${message}` }, { status });
  }

  if (!responseText) {
    return NextResponse.json(
      { error: "Réponse du modèle vide ou inattendue." },
      { status: 502 },
    );
  }

  let parsed: ExtractionResult;
  try {
    parsed = JSON.parse(stripCodeFence(responseText));
  } catch {
    return NextResponse.json(
      { error: "Impossible d'interpréter la réponse JSON du modèle.", raw: responseText },
      { status: 502 },
    );
  }

  return NextResponse.json(parsed satisfies ExtractionResult);
}
