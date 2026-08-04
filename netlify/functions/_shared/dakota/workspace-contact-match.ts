import type { DakotaOperatorRecord } from "./operator-state-schema";

export type DakotaWorkspaceRecords = Readonly<
  Record<string, Pick<DakotaOperatorRecord, "contacts">>
>;

export type DakotaWorkspaceContactMatch =
  | {
      matchState: "matched";
      candidateKey: string;
      contactId: string;
      matchedEmail: string;
    }
  | {
      matchState: "unmatched" | "ambiguous";
      candidateKey: null;
      contactId: null;
      matchedEmail: null;
    };

export type DakotaWorkspaceEmailMatcher = (
  observedEmails: readonly string[],
) => DakotaWorkspaceContactMatch;

interface PersistedEmailReference {
  candidateKey: string;
  contactId: string;
  email: string;
}

const EMAIL_TOKEN = /[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?/giu;
const EXACT_EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u;

function normalizedEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EXACT_EMAIL.test(email) ? email : "";
}

export function extractHeaderEmails(value: unknown): string[] {
  if (typeof value !== "string" || value.length > 8_192) return [];
  const emails = new Set<string>();
  for (const match of value.matchAll(EMAIL_TOKEN)) {
    const email = normalizedEmail(match[0]);
    if (email) emails.add(email);
  }
  return [...emails];
}

function persistedEmailIndex(
  records: DakotaWorkspaceRecords,
): Map<string, PersistedEmailReference[]> {
  const index = new Map<string, PersistedEmailReference[]>();
  for (const [candidateKey, record] of Object.entries(records)) {
    for (const contact of record.contacts) {
      if (contact.channel !== "email") continue;
      const email = normalizedEmail(contact.value);
      if (!email) continue;
      const references = index.get(email) ?? [];
      if (!references.some((item) => (
        item.candidateKey === candidateKey && item.contactId === contact.contactId
      ))) {
        references.push({ candidateKey, contactId: contact.contactId, email });
      }
      index.set(email, references);
    }
  }
  return index;
}

/**
 * Match normalized mailbox addresses exactly. No alias folding, plus-address
 * stripping, domain guessing, or fuzzy matching is allowed. Any ambiguity is
 * deliberately left unassigned for a human to resolve.
 */
function matchIndexedEmails(
  index: ReadonlyMap<string, readonly PersistedEmailReference[]>,
  observedEmails: readonly string[],
): DakotaWorkspaceContactMatch {
  const matches = new Map<string, PersistedEmailReference>();
  for (const observed of observedEmails) {
    const email = normalizedEmail(observed);
    if (!email) continue;
    for (const reference of index.get(email) ?? []) {
      matches.set(`${reference.candidateKey}\u0000${reference.contactId}`, reference);
    }
  }

  if (matches.size === 0) {
    return {
      matchState: "unmatched",
      candidateKey: null,
      contactId: null,
      matchedEmail: null,
    };
  }
  if (matches.size !== 1) {
    return {
      matchState: "ambiguous",
      candidateKey: null,
      contactId: null,
      matchedEmail: null,
    };
  }
  const [match] = matches.values();
  return {
    matchState: "matched",
    candidateKey: match.candidateKey,
    contactId: match.contactId,
    matchedEmail: match.email,
  };
}

export function createPersistedContactEmailMatcher(
  records: DakotaWorkspaceRecords,
): DakotaWorkspaceEmailMatcher {
  const index = persistedEmailIndex(records);
  return (observedEmails) => matchIndexedEmails(index, observedEmails);
}

export function matchPersistedContactEmails(
  records: DakotaWorkspaceRecords,
  observedEmails: readonly string[],
): DakotaWorkspaceContactMatch {
  return createPersistedContactEmailMatcher(records)(observedEmails);
}
