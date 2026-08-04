import { describe, expect, it } from "vitest";

import {
  extractHeaderEmails,
  matchPersistedContactEmails,
  type DakotaWorkspaceRecords,
} from "./workspace-contact-match";

const CONTACT = {
  contactId: "550e8400-e29b-41d4-a716-446655440001",
  name: "Ari Owner",
  role: "Owner",
  channel: "email" as const,
  value: "ari@example.com",
  sourceUrl: "https://example.com/contact",
  verifiedAt: "2026-08-01",
  consentClassification: "existing_relationship" as const,
};

function records(): DakotaWorkspaceRecords {
  return { "manual:one": { contacts: [CONTACT] } };
}

describe("Dakota persisted email matching", () => {
  it("extracts RFC-style header addresses and matches case-insensitively by exact address", () => {
    const emails = extractHeaderEmails(
      '"Ari Owner" <ARI@EXAMPLE.COM>, Other Person <other@example.net>',
    );
    expect(emails).toEqual(["ari@example.com", "other@example.net"]);
    expect(matchPersistedContactEmails(records(), emails)).toEqual({
      matchState: "matched",
      candidateKey: "manual:one",
      contactId: CONTACT.contactId,
      matchedEmail: "ari@example.com",
    });
  });

  it("does not apply plus-address, substring, or domain alias guessing", () => {
    expect(matchPersistedContactEmails(records(), [
      "ari+sales@example.com",
      "notari@example.com",
      "ari@example.net",
    ])).toEqual({
      matchState: "unmatched",
      candidateKey: null,
      contactId: null,
      matchedEmail: null,
    });
  });

  it("leaves a shared persisted address unassigned instead of guessing a record", () => {
    const ambiguous: DakotaWorkspaceRecords = {
      ...records(),
      "manual:two": {
        contacts: [{ ...CONTACT, contactId: "550e8400-e29b-41d4-a716-446655440002" }],
      },
    };
    expect(matchPersistedContactEmails(ambiguous, ["ari@example.com"])).toEqual({
      matchState: "ambiguous",
      candidateKey: null,
      contactId: null,
      matchedEmail: null,
    });
  });
});
