/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleAssistantChat } from "../handlers/assistant";
import { createMockEnv } from "./scheduled.mocks";
import { getUser } from "../auth";
import type { Env } from "../types";

interface ChatResponse {
  response: string;
  error?: string;
  details?: string;
}

// Mock dependencies
vi.mock("postgres", () => {
  const mockSqlFn = vi.fn().mockResolvedValue([]);
  const mockClient = Object.assign(
    vi.fn((...args: unknown[]) => {
      if (Array.isArray(args[0])) {
        return mockSqlFn(...args) as Promise<unknown[]>;
      }
      return mockSqlFn;
    }),
    {
      end: vi.fn().mockResolvedValue(undefined),
    }
  );
  return {
    default: vi.fn(() => mockClient),
  };
});

vi.mock("../auth", () => ({
  getUser: vi.fn(),
}));

describe("Assistant Route Handler", () => {
  let env: Env;
  let request: Request;

  beforeEach(() => {
    vi.clearAllMocks();
    env = createMockEnv();
    vi.mocked(getUser).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });
  });

  it("should execute add_product tool when AI returns the tag", async () => {
    const aiResponse = {
      response:
        'Sure, adding it for you. [[TOOL_CALL: add_product {"name": "New Hammer", "stock": 5}]]',
    };

    vi.mocked(env.AI_SERVICE.run).mockResolvedValue(
      aiResponse as unknown as Awaited<ReturnType<typeof env.AI_SERVICE.run>>
    );

    request = {
      headers: new Headers({ Origin: "http://localhost" }),
      json: vi.fn().mockResolvedValue({
        messages: [{ role: "user", content: "Add a hammer with 5 in stock" }],
      }),
    } as unknown as Request;

    const response = await handleAssistantChat(request, env);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const data = (await response.json()) as ChatResponse;

    expect(data.response).toContain(
      "Confirmed: New Hammer has been added to inventory."
    );

    // Verify database call
    const postgres = (await import("postgres")).default;
    const client = postgres() as unknown as ReturnType<typeof vi.fn>;
    expect(client).toHaveBeenCalled();
  });

  it("should return unauthorized if user is not found", async () => {
    vi.mocked(getUser).mockResolvedValue(null);

    request = {
      headers: new Headers({ Origin: "http://localhost" }),
    } as unknown as Request;

    const response = await handleAssistantChat(request, env);
    expect(response.status).toBe(401);
  });
});
