import { describe, expect, it } from "vitest";
import { manualCaptureTasks } from "./captureWorkflow";

describe("manual Dakota capture", () => {
  it("keeps early signals taskless and gives research-ready records one durable task", () => {
    const taskId = "550e8400-e29b-41d4-a716-446655440099";
    const createdAt = "2026-08-03T14:00:00.000Z";
    expect(manualCaptureTasks("early_signal", taskId, createdAt)).toEqual([]);
    expect(manualCaptureTasks("research_ready", taskId, createdAt)).toEqual([expect.objectContaining({
      taskId,
      type: "research",
      status: "open",
      channel: "internal",
      contactId: null,
      createdAt,
    })]);
  });
});
