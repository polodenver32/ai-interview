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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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
    if (
      finalTranscript &&
      finalTranscript.trim() !== "" &&
      !isProcessing &&
      !isPlayingAudio
    ) {
      console.log("✅ User said:", finalTranscript);
      processUserMessage(finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript, isProcessing, isPlayingAudio]);

  const startListening = () => {
    if (!isPlayingAudio) {
      SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
      });
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const processUserMessage = async (userMessage: string) => {
    if (isProcessing || !userMessage.trim()) return;

    setIsProcessing(true);
    stopListening(); // Stop listening while processing

    try {
      console.log("📨 Sending to API - User message:", userMessage);

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
      console.log("✅ API response received:");
      console.log("- User message:", data.userMessage);
      console.log("- AI response:", data.aiResponse);

      if (data.success && data.aiResponse) {
        // Add user message and AI response to conversation
        setConversation((prev) => [
          ...prev,
          { role: "user", content: data.userMessage },
          { role: "assistant", content: data.aiResponse },
        ]);

        if (data.audio) {
          // Stop listening before playing audio
          stopListening();
          setIsPlayingAudio(true);
          await playAudio(data.audio, data.audioFormat);
          setIsPlayingAudio(false);

          // Restart listening after audio finishes
          if (!isProcessing) {
            startListening();
          }
        }
      }
    } catch (error) {
      console.error("❌ Error processing speech:", error);
      // Restart listening on error
      if (!isProcessing) {
        startListening();
      }
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
              audioRef.current!.onended = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
              };
            })
            .catch((error) => {
              console.error("Error playing audio:", error);
              URL.revokeObjectURL(audioUrl);
              resolve();
            });
        } else {
          resolve();
        }
      } catch (error) {
        console.error("Error in playAudio:", error);
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
      stopListening();
    } else {
      startListening();
    }
  };

  const clearConversation = () => {
    setConversation([]);
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
              listening && !isPlayingAudio
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <div className="font-semibold mb-2">
              {isPlayingAudio
                ? "🔊 AI is speaking..."
                : isProcessing
                ? "⏳ Processing..."
                : listening
                ? "🎤 Listening... Speak now"
                : "Ready to talk"}
            </div>
            {listening && !isPlayingAudio && (
              <div className="flex justify-center items-center space-x-1">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <div className="text-sm">● LIVE</div>
              </div>
            )}
          </div>

          {/* Interim transcript */}
          {interimTranscript && !isPlayingAudio && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-1">
                Listening...
              </h3>
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
            disabled={isPlayingAudio}
            className={`px-8 py-4 rounded-full font-bold text-white transition-all ${
              listening && !isPlayingAudio
                ? "bg-red-500 hover:bg-red-600 shadow-lg"
                : isPlayingAudio
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isPlayingAudio
              ? "AI SPEAKING"
              : listening
              ? "STOP"
              : "START TALKING"}
          </button>

          {conversation.length > 0 && (
            <button
              onClick={clearConversation}
              disabled={isPlayingAudio}
              className={`px-6 py-4 rounded-full font-bold transition-all ${
                isPlayingAudio
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-gray-500 text-white hover:bg-gray-600"
              }`}
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
            {isPlayingAudio && "Microphone disabled while AI is speaking"}
          </p>
        </div>
      </div>
    </div>
  );
}
