import { getUser } from "../auth";
import { createResponse } from "../helpers";
import { processAssistantMessage } from "./assistant";

import type { Env, WorkerAssistantMessage } from "../types";

export async function handleVoiceChat(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // 1. Authenticate
    const user = await getUser(request, env);
    if (!user) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const audioFileEntry = formData.get("audio");
    const language = formData.get("language")?.toString() || "en";
    const historyStr = formData.get("messages")?.toString() || "";

    // Parse history if available, otherwise empty
    let history: WorkerAssistantMessage[] = [];
    if (historyStr) {
      try {
        history = JSON.parse(historyStr) as WorkerAssistantMessage[];

        // Remove the last message if it is the placeholder
        if (history.length > 0 && history[history.length - 1].role === "user") {
          history.pop();
        }
      } catch (e) {
        console.warn("Failed to parse history", e);
      }
    }

    if (!audioFileEntry || typeof audioFileEntry === "string") {
      return createResponse(
        { error: "No audio file provided" },
        400,
        env,
        request
      );
    }

    // Cast to File explicitly to satisfy TS and usage
    const audioFile = audioFileEntry as unknown as File;

    // We need to convert File to ArrayBuffer for the AI binding
    const audioArrayBuffer = await audioFile.arrayBuffer();

    // We cast to proper type or object to satisfy the binding.
    const transcriptionResult = (await env.AI_SERVICE.run(
      "@cf/deepgram/nova-3",
      {
        audio: {
          body: audioArrayBuffer as unknown as object,
          contentType: "audio/webm", // or match request content type
        },
      }
    )) as { text: string };

    const transcribedText = transcriptionResult.text;

    if (!transcribedText) {
      return createResponse(
        { error: "Failed to transcribe audio" },
        500,
        env,
        request
      );
    }

    // Add the transcribed text as the user message
    const newMessages = [
      ...history,
      { role: "user", content: transcribedText },
    ];

    const textResponse = await processAssistantMessage(
      newMessages,
      user,
      env,
      language
    );

    // Output type is string, according to types. typically base64 or binary string.

    const speechResult = (await env.AI_SERVICE.run("@cf/deepgram/aura-1", {
      text: textResponse,
    })) as unknown as string;

    // If it's a string, it's likely base64.
    const base64Audio = speechResult;

    return createResponse(
      {
        text: textResponse,
        audio: base64Audio,
        transcript: transcribedText,
      },
      200,
      env,
      request
    );
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return createResponse(
      { error: "Voice processing failed", details: errorMessage },
      500,
      env,
      request
    );
  }
}
