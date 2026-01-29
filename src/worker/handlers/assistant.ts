import { getSecurityHeaders } from "../helpers";
import type { Env } from "../types";

interface Message {
  role: string;
  content: string;
}

interface ChatRequest {
  messages: Message[];
  language?: string;
}

export async function handleAssistantChat(
  request: Request,
  env: Env
): Promise<Response> {
  const origin = request.headers.get("Origin") || "";
  const securityHeaders = getSecurityHeaders(origin);
  const headers = new Headers(securityHeaders);
  headers.set("Content-Type", "application/json");

  try {
    const body: ChatRequest = await request.json();
    const messages = body.messages || [];
    const languageCode = body.language || "en";
    const languageMap: Record<string, string> = {
      fr: "French",
      en: "English",
      ar: "Arabic",
    };
    const language = languageMap[languageCode] || "English";

    const systemPrompt = `You are Emmanuel, a helpful assistant for the Inventory Management System of La Société Emmanuel-Grégoire. 
    You help users manage their inventory, appliances, and repairs. 
    The system tracks items like stock, locations, and maintenance history.
    You can't add/edit/delete items in the database, you can only answer questions about the inventory.
    Be concise, professional, and friendly.
    IMPORTANT: You must answer in ${language} even if the user asks in another language. Do not use any other language.`;

    // Prepare messages with system prompt
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Reinforcement: Find the last user message and append the language instruction
    // This helps Llama-3 follow instructions even if conversation history is in another language.
    const lastUserMessageIndex = aiMessages
      .map((m) => m.role)
      .lastIndexOf("user");

    if (lastUserMessageIndex !== -1) {
      aiMessages[lastUserMessageIndex].content +=
        `\n\n(IMPORTANT: Answer in ${language} ONLY)`;
    }

    const response = await env.AI_SERVICE.run("@cf/meta/llama-3-8b-instruct", {
      messages: aiMessages,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return new Response(
      JSON.stringify({
        error: "Failed to generate AI response",
        details: errorMessage,
      }),
      {
        status: 500,
        headers,
      }
    );
  }
}
