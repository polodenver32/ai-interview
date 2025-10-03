import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyAXqmiqMnU6cAKvuiB_w6oM1LWwNaDyxmE",
});

export default async function main(
  contents: string
): Promise<string | undefined> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
  });
  console.log(response.text);
  return response.text;
}
