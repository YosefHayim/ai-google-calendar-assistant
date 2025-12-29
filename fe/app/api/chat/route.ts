import { NextResponse } from "next/server";
import { sendMessageToGemini } from "@/services/geminiService";

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const responseText = await sendMessageToGemini(message, history);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Gemini API Error in Route:", error);
    return NextResponse.json({ error: "Failed to get response from Gemini API" }, { status: 500 });
  }
}
