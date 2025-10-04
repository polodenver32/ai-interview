"use client";

import { useState, useRef, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export default function Home() {
  const [conversation, setConversation] = useState<
    { role: string; content: string }[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAIResponse, setLastAIResponse] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

  useEffect(() => {
    if (finalTranscript && finalTranscript.trim() !== "" && !isProcessing) {
      console.log("🎤 RAW SPEECH DETECTED:", finalTranscript);

      // Check if this matches the last AI response
      if (lastAIResponse) {
        const similarity = calculateSimilarity(finalTranscript, lastAIResponse);
        console.log(`🔍 SIMILARITY CHECK:`);
        console.log(`   Detected: "${finalTranscript}"`);
        console.log(`   AI Response: "${lastAIResponse}"`);
        console.log(`   Similarity: ${(similarity * 100).toFixed(1)}%`);

        if (similarity > 0.4) {
          // Lowered threshold to 40%
          console.log(
            `🚫 IGNORING - AI SPEECH DETECTED (${(similarity * 100).toFixed(
              1
            )}% match)`
          );
          resetTranscript();
          return;
        } else {
          console.log(
            `✅ ACCEPTING - USER SPEECH (${(similarity * 100).toFixed(
              1
            )}% match)`
          );
        }
      } else {
        console.log("✅ ACCEPTING - NO PREVIOUS AI RESPONSE TO COMPARE");
      }

      processUserMessage(finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript, isProcessing, lastAIResponse]);

  // Enhanced similarity calculation
  const calculateSimilarity = (text1: string, text2: string): number => {
    if (!text1 || !text2) return 0;

    // Clean and normalize texts
    const cleanText1 = text1
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const cleanText2 = text2
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    console.log(`   Cleaned detected: "${cleanText1}"`);
    console.log(`   Cleaned AI: "${cleanText2}"`);

    const words1 = cleanText1.split(" ");
    const words2 = cleanText2.split(" ");

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    const similarity = union.size > 0 ? intersection.size / union.size : 0;

    console.log(`   Words intersection: ${intersection.size}`);
    console.log(`   Words union: ${union.size}`);
    console.log(`   Calculated similarity: ${(similarity * 100).toFixed(1)}%`);

    return similarity;
  };

  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const processUserMessage = async (userMessage: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      console.log("📨 SENDING TO API - User message:", userMessage);

      const response = await fetch("/api/main", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: userMessage,
          conversationHistory: conversation,
        }),
      });

      if (!response.ok)
        throw new Error(`API request failed: ${response.status}`);

      const data = await response.json();
      console.log("✅ API RESPONSE RECEIVED");
      console.log("   User message:", data.userMessage);
      console.log("   AI response:", data.aiResponse);

      if (data.success && data.aiResponse) {
        // Store the AI response for comparison
        setLastAIResponse(data.aiResponse);
        console.log("💾 STORED AI RESPONSE FOR COMPARISON:", data.aiResponse);

        // Add user message and AI response to conversation
        setConversation((prev) => [
          ...prev,
          { role: "user", content: data.userMessage },
          { role: "assistant", content: data.aiResponse },
        ]);

        if (data.audio) {
          console.log("🔊 PLAYING AI AUDIO RESPONSE");
          await playAudio(data.audio, data.audioFormat);
          console.log("🔊 AI AUDIO FINISHED PLAYING");
        }
      }
    } catch (error) {
      console.error("❌ ERROR PROCESSING SPEECH:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (
    base64Audio: string,
    format: string = "mp3"
  ): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const audioBlob = base64ToBlob(base64Audio, `audio/${format}`);
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current
            .play()
            .then(() => {
              console.log("▶️ AUDIO PLAYBACK STARTED");
              audioRef.current!.onended = () => {
                console.log("⏹️ AUDIO PLAYBACK ENDED");
                URL.revokeObjectURL(audioUrl);
                resolve();
              };
            })
            .catch((error) => {
              console.error("❌ ERROR PLAYING AUDIO:", error);
              URL.revokeObjectURL(audioUrl);
              resolve();
            });
        } else {
          console.log("❌ NO AUDIO ELEMENT");
          resolve();
        }
      } catch (error) {
        console.error("❌ ERROR IN playAudio:", error);
        resolve();
      }
    });
  };

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  };

  const handleButtonClick = () => {
    if (listening) {
      console.log("⏸️ MANUALLY PAUSING LISTENER");
      stopListening();
    } else {
      console.log("▶️ STARTING LISTENER");
      startListening();
    }
  };

  const clearConversation = () => {
    console.log("🧹 CLEARING CONVERSATION AND AI RESPONSE");
    setConversation([]);
    setLastAIResponse("");
    resetTranscript();
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">
          Browser doesn't support speech recognition.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          AI Voice Assistant
        </h1>

        <div className="mb-6">
          <div
            className={`p-4 rounded-lg text-center ${
              listening
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <div className="font-semibold mb-2">
              {isProcessing
                ? "⏳ Processing..."
                : listening
                ? "🎤 Always Listening..."
                : "Ready - Click Start"}
            </div>
            {listening && (
              <div className="flex justify-center items-center space-x-1">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <div className="text-sm">● ALWAYS ON</div>
              </div>
            )}
          </div>

          {/* Interim transcript */}
          {interimTranscript && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-1">Listening:</h3>
              <p className="text-yellow-700">{interimTranscript}</p>
            </div>
          )}

          {/* Conversation History */}
          <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
            {conversation.map((entry, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  entry.role === "user"
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <h3
                  className={`font-semibold mb-1 ${
                    entry.role === "user" ? "text-blue-800" : "text-green-800"
                  }`}
                >
                  {entry.role === "user" ? "You:" : "AI:"}
                </h3>
                <p
                  className={
                    entry.role === "user" ? "text-blue-700" : "text-green-700"
                  }
                >
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleButtonClick}
            className={`px-8 py-4 rounded-full font-bold text-white transition-all ${
              listening
                ? "bg-red-500 hover:bg-red-600 shadow-lg"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {listening ? "PAUSE" : "START"}
          </button>

          {conversation.length > 0 && (
            <button
              onClick={clearConversation}
              className="px-6 py-4 bg-gray-500 text-white rounded-full font-bold hover:bg-gray-600 transition-all"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>
            Conversation turns:{" "}
            {conversation.filter((msg) => msg.role === "user").length}
          </p>
          <p className="text-xs mt-1">
            Check browser console for detailed similarity logs
          </p>
        </div>
      </div>
    </div>
  );
}
