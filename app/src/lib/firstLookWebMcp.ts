export const FIRST_LOOK_WEBMCP_TOOL = "prepare_first_look_request";
export const FIRST_LOOK_WEBMCP_MAX_MESSAGE_LENGTH = 1200;

type FirstLookToolStatus = "ready_for_review" | "draft_conflict" | "invalid_request" | "unavailable";

type WebMcpTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: {
    readOnlyHint: boolean;
    untrustedContentHint: boolean;
  };
  execute: (input: unknown) => Promise<{ status: FirstLookToolStatus }>;
};

type WebMcpModelContext = {
  registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void | Promise<void>;
};

type WebMcpDocument = {
  modelContext?: WebMcpModelContext;
};

export type FirstLookStageStatus = Extract<FirstLookToolStatus, "ready_for_review" | "draft_conflict" | "unavailable">;

type RegisterFirstLookWebMcpOptions = {
  document?: WebMcpDocument;
  stage: (message: string) => Promise<FirstLookStageStatus>;
};

function boundedMessage(input: unknown): string | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  if (Object.keys(input).some((key) => key !== "message")) return null;
  const message = (input as { message?: unknown }).message;
  if (typeof message !== "string") return null;
  const normalized = message.trim();
  if (!normalized || normalized.length > FIRST_LOOK_WEBMCP_MAX_MESSAGE_LENGTH) return null;
  return normalized;
}

/**
 * Makes the existing Tech Audit textarea available as a review-only browser
 * action where the browser supports WebMCP. The action never submits the
 * form; `stage` resolves only after the React-controlled field is visible.
 */
export function registerFirstLookWebMcp({
  document: documentOverride,
  stage,
}: RegisterFirstLookWebMcpOptions): () => void {
  const documentRef = documentOverride ?? (
    typeof document === "undefined" ? undefined : document as WebMcpDocument
  );
  const context = documentRef?.modelContext;
  if (!context?.registerTool) return () => {};

  const lifecycle = new AbortController();
  const tool: WebMcpTool = {
    name: FIRST_LOOK_WEBMCP_TOOL,
    title: "Prepare first-look request",
    description: "Put a short first-look request into the existing form. The visitor reviews it, adds contact details, and chooses whether to send it.",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          minLength: 1,
          maxLength: FIRST_LOOK_WEBMCP_MAX_MESSAGE_LENGTH,
          description: "A short request for the visitor to review before sending.",
        },
      },
      required: ["message"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      untrustedContentHint: false,
    },
    async execute(input) {
      if (lifecycle.signal.aborted) return { status: "unavailable" };
      const message = boundedMessage(input);
      if (!message) return { status: "invalid_request" };
      try {
        const status = await stage(message);
        return { status: lifecycle.signal.aborted ? "unavailable" : status };
      } catch {
        return { status: "unavailable" };
      }
    },
  };

  try {
    void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {
      lifecycle.abort();
    });
  } catch {
    lifecycle.abort();
  }

  return () => lifecycle.abort();
}
