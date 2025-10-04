import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyAXqmiqMnU6cAKvuiB_w6oM1LWwNaDyxmE",
});

export default async function main(
  userMessage: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<string | undefined> {
  // Build the conversation context in proper format
  let conversationContext = "";

  if (conversationHistory && conversationHistory.length > 0) {
    conversationContext = "Here is our conversation history:\n\n";
    conversationHistory.forEach((entry) => {
      if (entry.role === "user") {
        conversationContext += `User: ${entry.content}\n`;
      } else if (entry.role === "assistant") {
        conversationContext += `AI: ${entry.content}\n`;
      }
    });
    conversationContext += "\n";
  }

  const fullPrompt = `${conversationContext}Current user message: "${userMessage}"\n\nPlease respond naturally as an AI assistant.`;

  console.log("📤 Sending to Gemini with context:");
  console.log(fullPrompt);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const aiResponse = response.text;
    console.log("📥 Gemini raw response:", aiResponse);
    return aiResponse;
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    return "I apologize, but I encountered an error. Please try again.";
  }
}
