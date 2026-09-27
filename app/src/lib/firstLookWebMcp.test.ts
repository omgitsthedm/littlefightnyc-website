import { describe, expect, it, vi } from "vitest";
import {
  FIRST_LOOK_WEBMCP_MAX_MESSAGE_LENGTH,
  FIRST_LOOK_WEBMCP_TOOL,
  registerFirstLookWebMcp,
} from "./firstLookWebMcp";

type RegisteredTool = {
  name: string;
  inputSchema: { properties: { message: { maxLength: number } } };
  execute: (input: unknown) => Promise<{ status: string }>;
};

describe("first-look WebMCP preparation", () => {
  it("stages one bounded message without returning its contents", async () => {
    let registered: RegisteredTool | undefined;
    let signal: AbortSignal | undefined;
    const stage = vi.fn(async () => "ready_for_review" as const);
    const cleanup = registerFirstLookWebMcp({
      document: {
        modelContext: {
          registerTool(tool, options) {
            registered = tool as RegisteredTool;
            signal = options?.signal;
          },
        },
      },
      stage,
    });

    expect(registered?.name).toBe(FIRST_LOOK_WEBMCP_TOOL);
    expect(registered?.inputSchema.properties.message.maxLength).toBe(FIRST_LOOK_WEBMCP_MAX_MESSAGE_LENGTH);
    await expect(registered?.execute({ message: "Check our booking path." })).resolves.toEqual({
      status: "ready_for_review",
    });
    expect(stage).toHaveBeenCalledWith("Check our booking path.");
    expect(signal?.aborted).toBe(false);
    cleanup();
    expect(signal?.aborted).toBe(true);
    await expect(registered?.execute({ message: "A stale tool cannot stage this." })).resolves.toEqual({
      status: "unavailable",
    });
    expect(stage).toHaveBeenCalledTimes(1);
  });

  it("rejects malformed or overlong input before staging it", async () => {
    let registered: RegisteredTool | undefined;
    const stage = vi.fn(async () => "ready_for_review" as const);
    registerFirstLookWebMcp({
      document: {
        modelContext: {
          registerTool(tool) {
            registered = tool as RegisteredTool;
          },
        },
      },
      stage,
    });

    await expect(registered?.execute({ message: "   " })).resolves.toEqual({ status: "invalid_request" });
    await expect(registered?.execute({ message: "x".repeat(FIRST_LOOK_WEBMCP_MAX_MESSAGE_LENGTH + 1) })).resolves.toEqual({ status: "invalid_request" });
    await expect(registered?.execute({ message: ["not text"] })).resolves.toEqual({ status: "invalid_request" });
    await expect(registered?.execute({ message: "Check the booking path.", contact: "private@example.com" })).resolves.toEqual({ status: "invalid_request" });
    expect(stage).not.toHaveBeenCalled();
  });

  it("leaves unsupported and failed registrations inert", () => {
    expect(() => registerFirstLookWebMcp({
      document: {},
      stage: async () => "ready_for_review",
    })).not.toThrow();
    expect(() => registerFirstLookWebMcp({
      document: {
        modelContext: {
          registerTool() {
            throw new Error("fixture failure");
          },
        },
      },
      stage: async () => "ready_for_review",
    })).not.toThrow();
  });
});
