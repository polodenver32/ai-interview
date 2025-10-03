"use client";

import { useState, useRef, useEffect } from "react";

export default function VoiceCaptureWidget() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Click Start to begin recording");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      stopRecording();
    };
  }, []);

  const detectSilence = (analyser: AnalyserNode, callback: () => void) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;

    // If volume is below threshold, consider it silence
    if (average < 10) {
      // Adjust this threshold as needed
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = setTimeout(callback, 2000); // 2 seconds of silence
    } else {
      // Sound detected, reset silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    }

    // Continue monitoring
    if (isRecording) {
      requestAnimationFrame(() => detectSilence(analyser, callback));
    }
  };

  const startRecording = async () => {
    try {
      setStatus("Starting microphone...");

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      // Setup audio context for silence detection
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });

        // Create download link
        const audioUrl = URL.createObjectURL(audioBlob);
        const a = document.createElement("a");
        a.href = audioUrl;
        a.download = `recording-${new Date().getTime()}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(audioUrl);

        setStatus("Recording saved! Click Start to record again");
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setStatus("Recording... Speak now");

      // Start silence detection
      if (analyserRef.current) {
        detectSilence(analyserRef.current, () => {
          setStatus("Silence detected - stopping recording");
          stopRecording();
        });
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      setStatus("Error accessing microphone");
    }
  };

  const stopRecording = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
  };

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
      setStatus("Stopped manually");
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Audio Capture Widget
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
            {isRecording ? "🎤 Recording audio..." : "✅ Ready to record audio"}
          </p>
          <p className="text-center">
            Recording will automatically stop after 2 seconds of silence
          </p>
          <p className="text-center text-xs">
            Audio will be saved as WAV file when recording stops
          </p>
        </div>
      </div>
    </div>
  );
}
