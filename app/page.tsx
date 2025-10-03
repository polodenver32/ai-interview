"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Click Start to begin recording");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      stopRecording();
    };
  }, []);

  const playAudio = (base64Audio: string, format: string = 'mp3') => {
    try {
      const audioBlob = base64ToBlob(base64Audio, `audio/${format}`);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
        });
        
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setStatus("Ready for next conversation");
        };
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
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

  const startRecording = async () => {
    try {
      setStatus("Starting microphone...");
      setTranscript("");
      setAiResponse("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus("Recording... Speak now");

      resetSilenceTimer();
    } catch (error) {
      console.error("Error starting recording:", error);
      setStatus("Error accessing microphone");
    }
  };

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    silenceTimerRef.current = setTimeout(() => {
      if (isRecording) {
        setStatus("Silence detected - processing...");
        stopRecording();
      }
    }, 2000);
  };

  const stopRecording = async () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });

        await sendToSpeechToText(audioBlob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        setIsRecording(false);
      };
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsRecording(false);
      setStatus("Recording stopped");
    }
  };

  const sendToSpeechToText = async (audioBlob: Blob) => {
    try {
      setStatus("Processing...");

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      const response = await fetch("/api/main", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      console.log("API response:", data);

      if (data.success) {
        setTranscript(data.transcript);
        setAiResponse(data.aiResponse);
        
        if (data.audio) {
          setStatus("Playing AI response...");
          playAudio(data.audio, data.audioFormat);
        } else {
          setStatus("Conversion complete!");
        }
      } else {
        setStatus("Error in processing");
      }
    } catch (error) {
      console.error("Error sending to API:", error);
      setStatus("Error processing speech");
    }
  };

  const handleButtonClick = () => {
    if (isRecording) {
      setStatus("Stopping manually...");
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          AI Voice Assistant
        </h1>

        <div className="mb-6">
          <div
            className={`p-4 rounded-lg text-center ${
              isRecording
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <div className="font-semibold mb-2">{status}</div>
            {isRecording && (
              <div className="flex justify-center items-center space-x-1">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <div className="text-sm">● RECORDING</div>
              </div>
            )}
          </div>

          {transcript && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">You said:</h3>
              <p className="text-blue-700">{transcript}</p>
            </div>
          )}

          {aiResponse && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">AI Response:</h3>
              <p className="text-green-700">{aiResponse}</p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleButtonClick}
            className={`px-8 py-4 rounded-full font-bold text-white transition-all ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 shadow-lg"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isRecording ? "STOP" : "START"}
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-600 space-y-2">
          <p className="text-center">
            {isRecording
              ? "🎤 Speak now - will auto-stop after silence"
              : "✅ Ready to chat with AI"}
          </p>
        </div>
      </div>
    </div>
  );
}