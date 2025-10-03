import { elevenlabs } from "./init";

export default async function speechToText(file: any) {
  const response = await elevenlabs.speechToText.convert({
    modelId: "scribe_v1",
    file: file,
  });
  console.log(response);
}
