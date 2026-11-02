import type { TechAuditLeadIntent } from "@/lib/techAuditContact";
import copy from "../../preview-content/inquiry-copy.json";

export type InquiryCopy = {
  assurance?: string;
  faq?: { question: string; answer: string }[];
  accent: string;
  eyebrow: string;
  title: string;
  summary: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
};

type RawInquiryCopy = {
  assurance?: string;
  faq?: { question: string; answer: string }[];
  accent: string;
  eyebrow: string;
  title: string;
  summary: string;
  messageLabel: string;
  placeholder: string;
  submit: string;
};

const INQUIRY_COPY = copy as Record<TechAuditLeadIntent, RawInquiryCopy>;

export function inquiryCopyForIntent(intent: TechAuditLeadIntent): InquiryCopy {
  const entry = INQUIRY_COPY[intent];
  return {
    ...entry,
    messagePlaceholder: entry.placeholder,
    submitLabel: entry.submit,
  };
}
