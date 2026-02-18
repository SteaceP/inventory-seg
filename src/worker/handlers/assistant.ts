import postgres from "postgres";

import { getUser } from "../auth";
import { reportError } from "../errorReporting";
import { createResponse } from "../helpers";

import type {
  Env,
  WorkerChatRequest as ChatRequest,
  ProductParams,
  ApplianceParams,
} from "../types";

export async function processAssistantMessage(
  messages: ChatRequest["messages"],
  user: { id: string; email?: string }, // Typed as the return of getUser
  env: Env,
  language: string
): Promise<string> {
  const languageMap: Record<string, string> = {
    fr: "French",
    en: "English",
  };
  const languageName = languageMap[language] || "English";

  const systemPrompt = `You are an AI assistant for the Inventory Management System of ${env.COMPANY_NAME}. 
    You help users manage their inventory, appliances, and repairs. 
    The system tracks items like stock, locations, and maintenance history.
    
    You have the ability to ADD products and appliances to the system.
    To use a tool, you MUST output a special tag in your response: [[TOOL_CALL: name {params}]].
    Do NOT use markdown for the tool call tag itself, but you can use markdown for the rest of your message.
    
    AVAILABLE TOOLS:
    1. [[TOOL_CALL: add_product {"name": string, "category": string, "stock": number, "unit_cost": number, "notes": string}]]
    2. [[TOOL_CALL: add_appliance {"name": string, "brand": string, "model": string, "type": string, "location": string, "notes": string}]]
    
    When a user asks to add something, acknowledge it and then include the TOOL_CALL tag.
    Example: "Certainly! I'll add that product for you. [[TOOL_CALL: add_product {"name": "Hammer", "category": "Tools", "stock": 10}]]"
    
    Be concise, professional, and friendly.
    IMPORTANT: You must answer in ${languageName} even if the user asks in another language. Do not use any other language.`;

  // Prepare messages with system prompt
  const aiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const lastUserMessageIndex = aiMessages
    .map((m) => m.role)
    .lastIndexOf("user");

  if (lastUserMessageIndex !== -1) {
    aiMessages[lastUserMessageIndex].content +=
      `\n\n(IMPORTANT: Answer in ${languageName} ONLY)`;
  }

  // First AI run to see if it wants to call a tool
  const aiResult = (await env.AI_SERVICE.run("@cf/meta/llama-3-8b-instruct", {
    messages: aiMessages,
  })) as { response: string };

  let finalResponse = aiResult.response;
  let sql: ReturnType<typeof postgres> | undefined;

  // 2. Check for tool calls
  const toolCallMatch = finalResponse.match(
    /\[\[TOOL_CALL:\s*(\w+)\s*(\{.*\})\]\]/
  );
  if (toolCallMatch) {
    const toolName = toolCallMatch[1];
    const toolParamsStr = toolCallMatch[2];

    try {
      sql = postgres(env.HYPERDRIVE.connectionString);

      if (toolName === "add_product") {
        const params = JSON.parse(toolParamsStr) as ProductParams;
        const itemId = crypto.randomUUID();
        await sql`
            INSERT INTO inventory (id, name, category, stock, unit_cost, notes)
            VALUES (${itemId}, ${params.name}, ${params.category || "Uncategorized"}, ${params.stock || 0}, ${params.unit_cost || 0}, ${params.notes || ""})
          `;

        // Log activity
        await sql`
            INSERT INTO inventory_activity (id, inventory_id, user_id, action, item_name, changes)
            VALUES (${crypto.randomUUID()}, ${itemId}, ${user.id}, 'created', ${params.name}, ${JSON.stringify(params)})
          `;

        finalResponse = finalResponse.replace(
          toolCallMatch[0],
          `\n\n(Confirmed: ${params.name} has been added to inventory.)`
        );
      } else if (toolName === "add_appliance") {
        const params = JSON.parse(toolParamsStr) as ApplianceParams;
        const applianceId = crypto.randomUUID();
        await sql`
            INSERT INTO appliances (id, user_id, name, brand, model, type, location, notes)
            VALUES (${applianceId}, ${user.id}, ${params.name}, ${params.brand || ""}, ${params.model || ""}, ${params.type || ""}, ${params.location || ""}, ${params.notes || ""})
          `;

        // Log activity
        await sql`
            INSERT INTO inventory_activity (id, user_id, action, item_name, changes)
            VALUES (${crypto.randomUUID()}, ${user.id}, 'created_appliance', ${params.name}, ${JSON.stringify(params)})
          `;

        finalResponse = finalResponse.replace(
          toolCallMatch[0],
          `\n\n(Confirmed: ${params.name} has been added to appliances.)`
        );
      }
    } catch (toolError) {
      reportError(toolError, { context: "Tool execution" });
      finalResponse = finalResponse.replace(
        toolCallMatch[0],
        `\n\n(Error adding item: ${toolError instanceof Error ? toolError.message : "Internal error"})`
      );
    } finally {
      if (sql) await sql.end();
    }
  }

  return finalResponse;
}

export async function handleAssistantChat(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // 1. Authenticate user
    const user = await getUser(request, env);
    if (!user) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    const body: ChatRequest = await request.json();
    const messages = body.messages || [];
    const languageCode = body.language || "en";

    const finalResponse = await processAssistantMessage(
      messages,
      user,
      env,
      languageCode
    );

    return createResponse({ response: finalResponse }, 200, env, request);
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return createResponse(
      { error: "Failed to generate AI response", details: errorMessage },
      500,
      env,
      request
    );
  }
}
