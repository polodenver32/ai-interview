import { elevenlabs } from "./init";

export default function speechToText(file: FileLike): string {
  const response = elevenlabs.speechToText.convert({
    modelId: "",
    file:
  });
}
