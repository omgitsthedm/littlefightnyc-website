import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { DAKOTA_SIGNATURE_WINDOW_SECONDS } from "./constants";

export interface DakotaSignatureHeaders {
  timestamp: string | null;
  nonce: string | null;
  contentSha256: string | null;
  signature: string | null;
}

export type SignatureVerification =
  | { valid: true; timestamp: number; nonce: string }
  | {
      valid: false;
      code:
        | "missing_headers"
        | "invalid_timestamp"
        | "stale_timestamp"
        | "invalid_nonce"
        | "invalid_digest"
        | "invalid_signature";
    };

const LOWERCASE_SHA256 = /^[a-f0-9]{64}$/u;
const SAFE_NONCE = /^[A-Za-z0-9_-]{22,128}$/u;
const UNIX_SECONDS = /^\d{10,12}$/u;

export function sha256Hex(body: string | Uint8Array): string {
  return createHash("sha256").update(body).digest("hex");
}

export function signatureMessage(
  timestamp: string,
  nonce: string,
  contentSha256: string,
): string {
  return `v1\n${timestamp}\n${nonce}\n${contentSha256}`;
}

export function hmacSha256Hex(secret: string, message: string): string {
  return createHmac("sha256", secret).update(message).digest("hex");
}

function equalHex(left: string, right: string): boolean {
  if (!LOWERCASE_SHA256.test(left) || !LOWERCASE_SHA256.test(right)) {
    return false;
  }

  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

export function verifySignedPayload(
  body: string | Uint8Array,
  headers: DakotaSignatureHeaders,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1_000),
): SignatureVerification {
  const { timestamp, nonce, contentSha256, signature } = headers;
  if (!timestamp || !nonce || !contentSha256 || !signature) {
    return { valid: false, code: "missing_headers" };
  }

  if (!UNIX_SECONDS.test(timestamp)) {
    return { valid: false, code: "invalid_timestamp" };
  }

  const parsedTimestamp = Number(timestamp);
  if (!Number.isSafeInteger(parsedTimestamp)) {
    return { valid: false, code: "invalid_timestamp" };
  }

  if (Math.abs(nowSeconds - parsedTimestamp) > DAKOTA_SIGNATURE_WINDOW_SECONDS) {
    return { valid: false, code: "stale_timestamp" };
  }

  if (!SAFE_NONCE.test(nonce)) {
    return { valid: false, code: "invalid_nonce" };
  }

  const actualDigest = sha256Hex(body);
  if (!equalHex(contentSha256, actualDigest)) {
    return { valid: false, code: "invalid_digest" };
  }

  const expectedSignature = hmacSha256Hex(
    secret,
    signatureMessage(timestamp, nonce, contentSha256),
  );
  if (!equalHex(signature, expectedSignature)) {
    return { valid: false, code: "invalid_signature" };
  }

  return { valid: true, timestamp: parsedTimestamp, nonce };
}
