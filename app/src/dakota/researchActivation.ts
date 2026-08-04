import { candidateKey, operatorRecordFor } from "./revenue";
import { collectReadyActions } from "./workflow";
import type { Candidate, DakotaResearchDisposition, OperatorRecord, OperatorRecordInput } from "./types";

export const RESEARCH_PURSUIT_TASK_TITLE = "Review the verified research and decide whether to approve manual pursuit.";

export type ResearchPursuitPlan =
  | {
      outcome: "already_ready";
      record: OperatorRecordInput;
      expectedUpdatedAt: string;
    }
  | {
      outcome: "save_required";
      record: OperatorRecordInput;
      expectedUpdatedAt: string | null;
    }
  | {
      outcome: "blocked";
      reason: string;
    };

const CLOSED_RESEARCH_STATUSES = new Set(["lost", "not_fit", "do_not_contact", "paid"]);

export function assertResearchDispositionCompatible(
  disposition: Exclude<DakotaResearchDisposition, "unreviewed">,
  saved: OperatorRecord | undefined,
): void {
  if (disposition === "pursue" || !saved) return;
  const pursuitTaskOpen = saved.tasks.some((task) =>
    task.status === "open" &&
    task.type === "qualify" &&
    task.channel === "internal" &&
    task.contactId === null &&
    task.title === RESEARCH_PURSUIT_TASK_TITLE
  );
  if (pursuitTaskOpen) {
    throw new Error("Resolve the durable pursuit-review task in the core dossier before changing this research disposition.");
  }
}

export function planResearchPursuitActivation(
  candidate: Candidate,
  saved: OperatorRecord | undefined,
  now: Date,
  taskId: string,
): ResearchPursuitPlan {
  const key = candidateKey(candidate);
  const editable = operatorRecordFor(saved ? { [key]: saved } : {}, candidate);

  if (saved && CLOSED_RESEARCH_STATUSES.has(saved.status)) {
    return {
      outcome: "blocked",
      reason: "This core record is closed or paid. Reopen or review that durable outcome before marking the research signal pursue.",
    };
  }

  const openTask = editable.tasks.find((task) => task.status === "open");
  if (openTask) {
    const isResearchReviewTask = (
      openTask.type === "qualify" &&
      openTask.channel === "internal" &&
      openTask.contactId === null &&
      openTask.title === RESEARCH_PURSUIT_TASK_TITLE
    );
    const isVisibleInDoNext = saved && collectReadyActions({ [key]: saved }, now)
      .some((action) => action.task?.taskId === openTask.taskId);
    if (isResearchReviewTask && isVisibleInDoNext) {
      return { outcome: "already_ready", record: editable, expectedUpdatedAt: saved.updated_at };
    }
    return {
      outcome: "blocked",
      reason: "This record already has a different, scheduled, or hidden open task. Review that task in the core dossier before marking the research signal pursue.",
    };
  }

  const createdAt = now.toISOString();
  const status = ["early_signal", "research_ready", "snoozed"].includes(editable.status)
    ? "research_ready" as const
    : editable.status;
  const record: OperatorRecordInput = {
    ...editable,
    status,
    dueDate: status === "research_ready" ? "" : editable.dueDate,
    nextAction: RESEARCH_PURSUIT_TASK_TITLE,
    tasks: [...editable.tasks, {
      taskId,
      type: "qualify",
      status: "open",
      title: RESEARCH_PURSUIT_TASK_TITLE,
      dueAt: createdAt,
      contactId: null,
      channel: "internal",
      createdAt,
      resolvedAt: null,
      resolutionNote: "",
    }],
  };

  return {
    outcome: "save_required",
    record,
    expectedUpdatedAt: saved?.updated_at ?? null,
  };
}

export async function commitResearchReview(
  disposition: Exclude<DakotaResearchDisposition, "unreviewed">,
  plan: ResearchPursuitPlan | null,
  saveCore: (record: OperatorRecordInput, expectedUpdatedAt: string | null) => Promise<void>,
  saveBridge: () => Promise<void>,
): Promise<void> {
  let corePrepared = false;
  if (disposition === "pursue") {
    if (!plan) throw new Error("A core activation plan is required before marking research pursue.");
    if (plan.outcome === "blocked") throw new Error(plan.reason);
    await saveCore(plan.record, plan.expectedUpdatedAt);
    corePrepared = true;
  }

  try {
    await saveBridge();
  } catch (error) {
    if (corePrepared) {
      const message = error instanceof Error ? error.message : "The Revenue Bridge review could not be saved.";
      throw new Error(`${message} The core human-review task is saved and CAS-verified, but the pursue disposition was not. Retry Save review.`);
    }
    throw error;
  }
}
