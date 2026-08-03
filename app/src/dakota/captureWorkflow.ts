import type { DakotaTask, OperatorStatus } from "./types";

export function manualCaptureTasks(
  status: Extract<OperatorStatus, "early_signal" | "research_ready">,
  taskId: string,
  createdAt: string,
): DakotaTask[] {
  if (status === "early_signal") return [];
  return [{
    taskId,
    type: "research",
    status: "open",
    title: "Verify the public business identity and decide whether it deserves qualification.",
    dueAt: null,
    contactId: null,
    channel: "internal",
    createdAt,
    resolvedAt: null,
    resolutionNote: "",
  }];
}
