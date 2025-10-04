"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Click Start to begin conversation");
  const [conversation, setConversation] = useState<
    { user: string; ai: string }[]
  >([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice activity detection with noise calibration
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const animationFrameRef = useRef<number>(0);
  const noiseFloorRef = useRef<number>(0);
  const isCalibratedRef = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const calibrateNoiseFloor = (
    analyser: AnalyserNode,
    dataArray: Uint8Array
  ): Promise<number> => {
    return new Promise((resolve) => {
      console.log(
        "🔧 Calibrating noise floor... Please be silent for 2 seconds"
      );
      setStatus("Calibrating microphone... Please be silent");

      let samples: number[] = [];
      let sampleCount = 0;
      const maxSamples = 40; // 2 seconds at 50ms intervals

      const takeSample = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const averageVolume = sum / dataArray.length;
        samples.push(averageVolume);
        sampleCount++;

        if (sampleCount < maxSamples) {
          setTimeout(takeSample, 50);
        } else {
          // Calculate noise floor (average of lowest 50% of samples)
          samples.sort((a, b) => a - b);
          const noiseSamples = samples.slice(0, Math.floor(samples.length / 2));
          const noiseFloor =
            noiseSamples.reduce((a, b) => a + b, 0) / noiseSamples.length;

          console.log("📊 Noise floor calibrated:", noiseFloor.toFixed(2));
          console.log(
            "📈 Sample range:",
            Math.min(...samples).toFixed(2),
            "-",
            Math.max(...samples).toFixed(2)
          );
          setStatus("Listening... Speak now");
          resolve(noiseFloor);
        }
      };

      takeSample();
    });
  };

  const startRecording = async () => {
    try {
      console.log("🚀 Starting recording...");
      setStatus("Starting...");
      setConversation([]);
      isCalibratedRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });

      console.log("🎤 Microphone access granted");
      streamRef.current = stream;

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start(100);
      console.log("🔴 Recording started");
      setIsRecording(true);

      // Setup voice activity detection with calibration
      await setupSmartVoiceDetection(stream);
    } catch (error) {
      console.error("❌ Error starting recording:", error);
      setStatus("Error accessing microphone");
    }
  };

  const setupSmartVoiceDetection = async (stream: MediaStream) => {
    console.log("🎵 Setting up smart voice detection...");
    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();

    analyserRef.current.fftSize = 1024;
    analyserRef.current.smoothingTimeConstant = 0.3;
    analyserRef.current.minDecibels = -45;
    analyserRef.current.maxDecibels = -10;

    source.connect(analyserRef.current);

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    // Calibrate noise floor first
    noiseFloorRef.current = await calibrateNoiseFloor(
      analyserRef.current,
      dataArray
    );
    isCalibratedRef.current = true;

    startSmartVoiceDetection();
  };

  const startSmartVoiceDetection = () => {
    if (!analyserRef.current || !isCalibratedRef.current) {
      console.log("❌ Voice detection not ready");
      return;
    }

    console.log("🎯 Starting smart voice detection");
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let speechStartTime = 0;
    let isCurrentlySpeaking = false;
    let consecutiveSpeechFrames = 0;
    let consecutiveSilenceFrames = 0;

    const detectVoice = () => {
      if (!isRecording || isProcessingRef.current) return;

      analyser.getByteFrequencyData(dataArray);

      // Calculate volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const averageVolume = sum / dataArray.length;

      // Smart voice detection logic
      const NOISE_FLOOR = noiseFloorRef.current;
      const SPEECH_THRESHOLD = NOISE_FLOOR + 15; // Voice must be 15 above noise floor
      const SILENCE_THRESHOLD = NOISE_FLOOR + 5; // Below this is considered silence

      // Check if this is speech
      const isSpeech = averageVolume > SPEECH_THRESHOLD;

      if (isSpeech) {
        consecutiveSpeechFrames++;
        consecutiveSilenceFrames = 0;

        // Only consider it actual speech after 3 consecutive frames (150ms)
        if (consecutiveSpeechFrames >= 3 && !isCurrentlySpeaking) {
          console.log(
            "🎤 Speech START detected, volume:",
            averageVolume.toFixed(2),
            "Noise floor:",
            NOISE_FLOOR.toFixed(2)
          );
          isCurrentlySpeaking = true;
          speechStartTime = Date.now();
          setStatus("🎤 Speaking...");
        }

        // Reset silence timer when speech is detected
        if (isCurrentlySpeaking && silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      } else {
        consecutiveSilenceFrames++;
        consecutiveSpeechFrames = 0;

        // If we were speaking and now have silence
        if (isCurrentlySpeaking && consecutiveSilenceFrames >= 6) {
          // 300ms of silence
          const speechDuration = Date.now() - speechStartTime;
          console.log(
            "🔇 Speech END detected, duration:",
            speechDuration,
            "ms"
          );

          // Only process if speech was meaningful (at least 1 second)
          if (speechDuration > 1000) {
            console.log("✅ Processing meaningful speech");
            processRecordedSpeech();
          } else {
            console.log("❌ Speech too short, ignoring");
          }

          isCurrentlySpeaking = false;
          consecutiveSilenceFrames = 0;
        }
      }

      // Set silence timer for continuous speech with pauses
      if (isCurrentlySpeaking && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          if (isCurrentlySpeaking && isRecording && !isProcessingRef.current) {
            const speechDuration = Date.now() - speechStartTime;
            console.log(
              "⏰ Continuous speech timeout, duration:",
              speechDuration,
              "ms"
            );
            if (speechDuration > 1000) {
              processRecordedSpeech();
            }
            isCurrentlySpeaking = false;
          }
        }, 2500); // 2.5 seconds of continuous speech
      }

      // Continue monitoring
      if (isRecording && !isProcessingRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectVoice);
      }
    };

    detectVoice();
  };

  const processRecordedSpeech = async () => {
    if (isProcessingRef.current || audioChunksRef.current.length === 0) return;

    isProcessingRef.current = true;
    setStatus("Processing...");

    // Stop current recording
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    const audioBlob = new Blob(audioChunksRef.current, {
      type: "audio/webm;codecs=opus",
    });
    console.log("📦 Processing audio, size:", audioBlob.size, "bytes");
    audioChunksRef.current = [];

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.webm");

      const response = await fetch("/api/main", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      if (data.success) {
        setConversation((prev) => [
          ...prev,
          { user: data.transcript, ai: data.aiResponse },
        ]);

        if (data.audio) {
          setStatus("AI is responding...");
          await playAudio(data.audio, data.audioFormat);
        }

        // Resume recording for next input
        if (isRecording && mediaRecorderRef.current) {
          audioChunksRef.current = [];
          mediaRecorderRef.current.start(100);
          setStatus("Listening... Speak now");
        }
      }
    } catch (error) {
      console.error("Error processing speech:", error);
      setStatus("Error - try speaking again");

      if (isRecording && mediaRecorderRef.current) {
        audioChunksRef.current = [];
        mediaRecorderRef.current.start(100);
        setStatus("Listening... Speak now");
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    isProcessingRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    cleanup();
    setStatus("Conversation ended");
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
    if (isRecording) {
      setStatus("Stopping...");
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
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
                <div className="text-sm">● LIVE</div>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
            {conversation.map((chat, index) => (
              <div key={index} className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-1">You:</h3>
                  <p className="text-blue-700">{chat.user}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-1">AI:</h3>
                  <p className="text-green-700">{chat.ai}</p>
                </div>
              </div>
            ))}
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
            {isRecording ? "STOP" : "START TALKING"}
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-600 text-center">
          <p>
            {isRecording
              ? "Speak naturally - Smart detection active"
              : "Click START (will calibrate for 2 seconds first)"}
          </p>
        </div>
      </div>
    </div>
  );
}
