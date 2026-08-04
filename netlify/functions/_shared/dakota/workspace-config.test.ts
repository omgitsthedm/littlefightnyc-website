import { describe, expect, it } from "vitest";

import {
  DAKOTA_WORKSPACE_CONFIG,
  parseWorkspaceConfig,
  resolveWorkspaceContext,
  type WorkspaceConfig,
} from "./workspace-config";

type Mutable<T> = {
  -readonly [Key in keyof T]: T[Key] extends readonly (infer Item)[]
    ? Mutable<Item>[]
    : T[Key] extends object
      ? Mutable<T[Key]>
      : T[Key];
};

function mutableConfig(): Mutable<WorkspaceConfig> {
  return structuredClone(DAKOTA_WORKSPACE_CONFIG) as Mutable<WorkspaceConfig>;
}

describe("Dakota server workspace configuration", () => {
  it("resolves only the fixed LFNYC workspace with the existing operating policy", () => {
    const context = resolveWorkspaceContext();

    expect(resolveWorkspaceContext.length).toBe(0);
    expect(context).toBe(resolveWorkspaceContext());
    expect(context).toEqual({
      workspaceId: "lfnyc",
      config: {
        schemaVersion: "dakota.workspace-config.v1",
        workspaceId: "lfnyc",
        identity: { displayName: "Little Fight NYC" },
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
      },
    });
  });

  it("deep-freezes the context, policy objects, and role and schedule arrays", () => {
    const context = resolveWorkspaceContext();

    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.config)).toBe(true);
    expect(Object.isFrozen(context.config.operator)).toBe(true);
    expect(Object.isFrozen(context.config.operator.roles)).toBe(true);
    expect(Object.isFrozen(context.config.responseWindow)).toBe(true);
    expect(Object.isFrozen(context.config.responseWindow.weekdays)).toBe(true);
    expect(Object.isFrozen(context.config.meetingHours)).toBe(true);
    expect(Object.isFrozen(context.config.meetingHours.weekdays)).toBe(true);
    expect(Object.isFrozen(context.config.operatorAlerts.sender)).toBe(true);
    expect(() => {
      (context.config.identity as { displayName: string }).displayName = "Changed";
    }).toThrow(TypeError);
  });

  it("rejects an alternate workspace or unexpected config surface", () => {
    const alternate = mutableConfig();
    (alternate as unknown as Record<string, unknown>).workspaceId = "attacker-selected";
    expect(() => parseWorkspaceConfig(alternate)).toThrow("workspaceId");

    const extra = mutableConfig();
    (extra as unknown as Record<string, unknown>).requestWorkspaceId = "from-browser";
    expect(() => parseWorkspaceConfig(extra)).toThrow("root");
  });

  it("rejects malformed identity, schedule, URL, and alert policy", () => {
    const badRole = mutableConfig();
    badRole.operator.roles = ["dakota_operator", "dakota_operator"];
    expect(() => parseWorkspaceConfig(badRole)).toThrow("operator.roles");

    const badTimeZone = mutableConfig();
    badTimeZone.timeZone = "Not/A_Time_Zone";
    expect(() => parseWorkspaceConfig(badTimeZone)).toThrow("timeZone");

    const badInterval = mutableConfig();
    badInterval.responseWindow.opensAt = "21:00";
    badInterval.responseWindow.closesAt = "09:00";
    expect(() => parseWorkspaceConfig(badInterval)).toThrow("responseWindow.interval");

    const duplicateMeetingDay = mutableConfig();
    duplicateMeetingDay.meetingHours.weekdays = ["monday", "monday"];
    expect(() => parseWorkspaceConfig(duplicateMeetingDay)).toThrow("meetingHours.weekdays");

    const unsafeUrl = mutableConfig();
    unsafeUrl.app.operatorUrl = "http://www.dakota.littlefightnyc.com/app/";
    expect(() => parseWorkspaceConfig(unsafeUrl)).toThrow("app.operatorUrl");

    const badSender = mutableConfig();
    badSender.operatorAlerts.sender.email = "Hello@LittleFightNYC.com";
    expect(() => parseWorkspaceConfig(badSender)).toThrow("operatorAlerts.sender.email");
  });
});
