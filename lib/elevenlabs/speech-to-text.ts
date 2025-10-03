import { elevenlabs } from "./init";

export default async function speechToText(file: any) {
  const response = await elevenlabs.speechToText.convert({
    modelId: "scribe_v1",
    file: file,
  });
  console.log("Response type:", typeof response);
  console.log("Response keys:", Object.keys(response));

  // Handle the response based on its actual structure
  let transcriptText = "";

  // Check if it's the expected response structure
  if (response && typeof response === "object") {
    // Try to access the text property (might be different in actual response)
    if ("text" in response) {
      transcriptText = (response as any).text;
    }
    // If it's a different structure, try to find the text
    else if ("transcript" in response) {
      transcriptText = (response as any).transcript;
    }
    // If it's the multichannel response, handle that
    else if ("channels" in response) {
      const channels = (response as any).channels;
      if (Array.isArray(channels) && channels.length > 0) {
        transcriptText = channels[0].text || "";
      }
    }
    // Last resort: stringify if it's an object but we can't find text
    else {
      transcriptText = JSON.stringify(response);
    }
  } else if (typeof response === "string") {
    transcriptText = response;
  }

  console.log("Extracted transcript:", transcriptText);
}
