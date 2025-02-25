import { chatSession } from "@/config/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { prompt } = await req.json();

  try {
    const result = await chatSession.sendMessage(prompt);
    const aiResp = result.response.text();
    return NextResponse.json({ result: aiResp });
  } catch (e) {
    console.error("API Error:", e); // Add this for server-side debugging
    return NextResponse.json({ error: e.message });
  }
}