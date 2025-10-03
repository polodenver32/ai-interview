import { NextRequest, NextResponse } from "next/server";
import { elevenlabs } from "@/lib/elevenlabs/init";
import main from "@/lib/gemini/init";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert File to Buffer for ElevenLabs
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call ElevenLabs speech-to-text
    const response = (await elevenlabs.speechToText.convert({
      modelId: "scribe_v1",
      file: buffer,
    })) as any;

    console.log("Full response:", response);

    const transcriptText = response.text;
    console.log("Extracted transcript:", transcriptText);

    // Get AI response from Gemini
    const aiResponse = await main(transcriptText);
    console.log("AI Response:", aiResponse);

    let audioBuffer = null;

    if (aiResponse) {
      // Convert AI response to speech - returns a ReadableStream
      const ttsResponse = await elevenlabs.textToSpeech.convert(
        "56AoDkrOh6qfVPDXZ7Pt", // Your voice ID
        {
          text: aiResponse,
          modelId: "eleven_flash_v2_5",
          outputFormat: "mp3_44100_128", // Use MP3 for better compatibility
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

      // Combine all chunks into a single Uint8Array
      const audioData = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
      let offset = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, offset);
        offset += chunk.length;
      }

      audioBuffer = Buffer.from(audioData);
      console.log("Audio generated:", audioBuffer.length, "bytes");
    }

    return NextResponse.json({
      success: true,
      transcript: transcriptText,
      aiResponse: aiResponse,
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
