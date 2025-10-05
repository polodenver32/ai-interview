import { elevenlabs } from "./init";

// Define proper interfaces for the response types
interface TextResponse {
  text: string;
}

interface TranscriptResponse {
  transcript: string;
}

interface Channel {
  text?: string;
}

interface MultichannelResponse {
  channels: Channel[];
}

// Type guard functions
function isTextResponse(obj: unknown): obj is TextResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "text" in obj &&
    typeof (obj as TextResponse).text === "string"
  );
}

function isTranscriptResponse(obj: unknown): obj is TranscriptResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "transcript" in obj &&
    typeof (obj as TranscriptResponse).transcript === "string"
  );
}

function isMultichannelResponse(obj: unknown): obj is MultichannelResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "channels" in obj &&
    Array.isArray((obj as MultichannelResponse).channels)
  );
}

function isString(obj: unknown): obj is string {
  return typeof obj === "string";
}

export default async function speechToText(
  file: File | Buffer | Blob
): Promise<string> {
  const response = await elevenlabs.speechToText.convert({
    modelId: "scribe_v1",
    file: file,
  });

  console.log("Response type:", typeof response);
  console.log("Response keys:", Object.keys(response));

  let transcriptText = "";

  // Handle the response based on its actual structure
  if (isTextResponse(response)) {
    transcriptText = response.text;
  } else if (isTranscriptResponse(response)) {
    transcriptText = response.transcript;
  } else if (isMultichannelResponse(response)) {
    if (response.channels.length > 0 && response.channels[0].text) {
      transcriptText = response.channels[0].text;
    }
  } else if (isString(response)) {
    transcriptText = response;
  } else {
    // Last resort: stringify if it's an object but we can't find text
    transcriptText = JSON.stringify(response);
  }

  console.log("Extracted transcript:", transcriptText);
  return transcriptText;
}
