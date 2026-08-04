export const DAKOTA_WORKSPACE_CONFIG_SCHEMA = "dakota.workspace-config.v1" as const;
export const DAKOTA_WORKSPACE_ID = "lfnyc" as const;

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type DakotaWorkspaceId = typeof DAKOTA_WORKSPACE_ID;
export type DakotaBusinessWeekday = (typeof WEEKDAYS)[number];

export interface WorkspaceOperatingWindow {
  readonly weekdays: readonly DakotaBusinessWeekday[];
  readonly opensAt: string;
  readonly closesAt: string;
}

export interface WorkspaceConfig {
  readonly schemaVersion: typeof DAKOTA_WORKSPACE_CONFIG_SCHEMA;
  readonly workspaceId: DakotaWorkspaceId;
  readonly identity: {
    readonly displayName: string;
  };
  readonly operator: {
    readonly email: string;
    readonly roles: readonly [string, ...string[]];
  };
  readonly timeZone: string;
  readonly responseWindow: WorkspaceOperatingWindow;
  readonly meetingHours: WorkspaceOperatingWindow;
  readonly app: {
    readonly operatorUrl: string;
  };
  readonly operatorAlerts: {
    readonly recipientEmail: string;
    readonly sender: {
      readonly name: string;
      readonly email: string;
    };
  };
}

export interface WorkspaceContext {
  readonly workspaceId: DakotaWorkspaceId;
  readonly config: WorkspaceConfig;
}

const ROOT_KEYS = [
  "schemaVersion",
  "workspaceId",
  "identity",
  "operator",
  "timeZone",
  "responseWindow",
  "meetingHours",
  "app",
  "operatorAlerts",
] as const;
const IDENTITY_KEYS = ["displayName"] as const;
const OPERATOR_KEYS = ["email", "roles"] as const;
const OPERATING_WINDOW_KEYS = ["weekdays", "opensAt", "closesAt"] as const;
const APP_KEYS = ["operatorUrl"] as const;
const OPERATOR_ALERT_KEYS = ["recipientEmail", "sender"] as const;
const ALERT_SENDER_KEYS = ["name", "email"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function isPlainText(value: unknown, maximumLength: number): value is string {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= maximumLength &&
    value.trim() === value &&
    !/[\r\n<>\p{Cc}]/u.test(value);
}

function isNormalizedEmail(value: unknown): value is string {
  return typeof value === "string" &&
    value.length <= 254 &&
    value === value.trim().toLowerCase() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);
}

function isRole(value: unknown): value is string {
  return typeof value === "string" && /^[a-z][a-z0-9_]{0,63}$/u.test(value);
}

function isTime(value: unknown): value is string {
  return typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/u.test(value);
}

function isTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2_048) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" &&
      parsed.username === "" &&
      parsed.password === "" &&
      parsed.hash === "";
  } catch {
    return false;
  }
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested);
  }
  return Object.freeze(value);
}

function invalid(field: string): never {
  throw new Error(`Invalid Dakota workspace config: ${field}`);
}

function parseOperatingWindow(
  value: unknown,
  field: "responseWindow" | "meetingHours",
): WorkspaceOperatingWindow {
  if (!isRecord(value) || !hasExactKeys(value, OPERATING_WINDOW_KEYS)) invalid(field);
  if (
    !Array.isArray(value.weekdays) ||
    value.weekdays.length === 0 ||
    value.weekdays.length > WEEKDAYS.length ||
    !value.weekdays.every((day) => (
      typeof day === "string" && WEEKDAYS.includes(day as DakotaBusinessWeekday)
    )) ||
    new Set(value.weekdays).size !== value.weekdays.length
  ) {
    invalid(`${field}.weekdays`);
  }
  if (!isTime(value.opensAt)) invalid(`${field}.opensAt`);
  if (!isTime(value.closesAt)) invalid(`${field}.closesAt`);
  if (value.opensAt >= value.closesAt) invalid(`${field}.interval`);
  return {
    weekdays: [...value.weekdays] as DakotaBusinessWeekday[],
    opensAt: value.opensAt,
    closesAt: value.closesAt,
  };
}

export function parseWorkspaceConfig(input: unknown): WorkspaceConfig {
  if (!isRecord(input) || !hasExactKeys(input, ROOT_KEYS)) invalid("root");
  if (input.schemaVersion !== DAKOTA_WORKSPACE_CONFIG_SCHEMA) invalid("schemaVersion");
  if (input.workspaceId !== DAKOTA_WORKSPACE_ID) invalid("workspaceId");

  if (!isRecord(input.identity) || !hasExactKeys(input.identity, IDENTITY_KEYS)) {
    invalid("identity");
  }
  if (!isPlainText(input.identity.displayName, 120)) invalid("identity.displayName");

  if (!isRecord(input.operator) || !hasExactKeys(input.operator, OPERATOR_KEYS)) {
    invalid("operator");
  }
  if (!isNormalizedEmail(input.operator.email)) invalid("operator.email");
  if (
    !Array.isArray(input.operator.roles) ||
    input.operator.roles.length === 0 ||
    input.operator.roles.length > 8 ||
    !input.operator.roles.every(isRole) ||
    new Set(input.operator.roles).size !== input.operator.roles.length
  ) {
    invalid("operator.roles");
  }

  if (!isTimeZone(input.timeZone)) invalid("timeZone");
  const responseWindow = parseOperatingWindow(input.responseWindow, "responseWindow");
  const meetingHours = parseOperatingWindow(input.meetingHours, "meetingHours");

  if (!isRecord(input.app) || !hasExactKeys(input.app, APP_KEYS)) invalid("app");
  if (!isHttpsUrl(input.app.operatorUrl)) invalid("app.operatorUrl");

  if (
    !isRecord(input.operatorAlerts) ||
    !hasExactKeys(input.operatorAlerts, OPERATOR_ALERT_KEYS)
  ) {
    invalid("operatorAlerts");
  }
  if (!isNormalizedEmail(input.operatorAlerts.recipientEmail)) {
    invalid("operatorAlerts.recipientEmail");
  }
  if (
    !isRecord(input.operatorAlerts.sender) ||
    !hasExactKeys(input.operatorAlerts.sender, ALERT_SENDER_KEYS)
  ) {
    invalid("operatorAlerts.sender");
  }
  if (!isPlainText(input.operatorAlerts.sender.name, 120)) {
    invalid("operatorAlerts.sender.name");
  }
  if (!isNormalizedEmail(input.operatorAlerts.sender.email)) {
    invalid("operatorAlerts.sender.email");
  }

  return deepFreeze({
    schemaVersion: DAKOTA_WORKSPACE_CONFIG_SCHEMA,
    workspaceId: DAKOTA_WORKSPACE_ID,
    identity: {
      displayName: input.identity.displayName,
    },
    operator: {
      email: input.operator.email,
      roles: [...input.operator.roles] as [string, ...string[]],
    },
    timeZone: input.timeZone,
    responseWindow,
    meetingHours,
    app: {
      operatorUrl: input.app.operatorUrl,
    },
    operatorAlerts: {
      recipientEmail: input.operatorAlerts.recipientEmail,
      sender: {
        name: input.operatorAlerts.sender.name,
        email: input.operatorAlerts.sender.email,
      },
    },
  });
}

export const DAKOTA_WORKSPACE_CONFIG = parseWorkspaceConfig({
  schemaVersion: DAKOTA_WORKSPACE_CONFIG_SCHEMA,
  workspaceId: DAKOTA_WORKSPACE_ID,
  identity: {
    displayName: "Little Fight NYC",
  },
  operator: {
    email: "hello@littlefightnyc.com",
    roles: ["dakota_operator"],
  },
  timeZone: "America/New_York",
  responseWindow: {
    weekdays: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
    opensAt: "09:00",
    closesAt: "21:00",
  },
  meetingHours: {
    weekdays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    opensAt: "09:00",
    closesAt: "17:00",
  },
  app: {
    operatorUrl: "https://www.dakota.littlefightnyc.com/app/?view=do-next",
  },
  operatorAlerts: {
    recipientEmail: "hello@littlefightnyc.com",
    sender: {
      name: "Little Fight NYC",
      email: "hello@littlefightnyc.com",
    },
  },
});

const DAKOTA_WORKSPACE_CONTEXT: WorkspaceContext = deepFreeze({
  workspaceId: DAKOTA_WORKSPACE_ID,
  config: DAKOTA_WORKSPACE_CONFIG,
});

/** Resolves the only server-owned workspace; no request or browser value is accepted. */
export function resolveWorkspaceContext(): WorkspaceContext {
  return DAKOTA_WORKSPACE_CONTEXT;
}
