import { NextRequest, NextResponse } from "next/server";
import { elevenlabs } from "@/lib/elevenlabs/init";
import main from "@/lib/gemini/init";

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationHistory } = await request.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: "No user message provided" },
        { status: 400 }
      );
    }

    console.log("📨 User message:", userMessage);
    console.log(
      "💭 Conversation history length:",
      conversationHistory?.length || 0
    );

    // Get AI response from Gemini with proper context
    const aiResponse = await main(userMessage, conversationHistory);
    console.log("🤖 AI response:", aiResponse);

    let audioBuffer = null;

    if (aiResponse) {
      // Convert AI response to speech
      const ttsResponse = await elevenlabs.textToSpeech.convert(
        "56AoDkrOh6qfVPDXZ7Pt",
        {
          text: aiResponse,
          outputFormat: "mp3_44100_128",
        }
      );

      // Convert ReadableStream to Buffer
      const reader = ttsResponse.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const audioData = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
      let offset = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, offset);
        offset += chunk.length;
      }

      audioBuffer = Buffer.from(audioData);
    }

    return NextResponse.json({
      success: true,
      userMessage: userMessage, // This is the original user message
      aiResponse: aiResponse, // This is the AI response
      audio: audioBuffer ? audioBuffer.toString("base64") : null,
      audioFormat: "mp3",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to process speech" },
      { status: 500 }
    );
  }
}
