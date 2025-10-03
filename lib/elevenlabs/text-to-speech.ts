import { elevenlabs } from "./init";

export default async function texToSpeech(text: string) {
  const response = await elevenlabs.textToSpeech.convert("", {
    text: text,
    modelId: "",
  });
  console.log(response);

  if (response && typeof response === "object") {
  }
}
