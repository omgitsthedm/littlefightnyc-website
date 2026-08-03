import { describe, expect, it } from "vitest";

import {
  hmacSha256Hex,
  sha256Hex,
  signatureMessage,
  verifySignedPayload,
} from "./signing";

const SECRET = "test-secret-that-is-at-least-thirty-two-bytes";
const TIMESTAMP = "1785758400";
const NOW = Number(TIMESTAMP);
const NONCE = "abcdefghijklmnopqrstuvwxyz_123456";
const BODY = '{"schema_version":"dakota.queue.v1"}';

function signedHeaders() {
  const digest = sha256Hex(BODY);
  return {
    timestamp: TIMESTAMP,
    nonce: NONCE,
    contentSha256: digest,
    signature: hmacSha256Hex(
      SECRET,
      signatureMessage(TIMESTAMP, NONCE, digest),
    ),
  };
}

describe("verifySignedPayload", () => {
  it("matches the Python publisher's SHA-256 and HMAC vector", () => {
    expect(sha256Hex(BODY)).toBe(
      "f441dae79ea1136baaccc321e5e0e605c5a02f13a8020467efa764fd1441ae26",
    );
    expect(signedHeaders().signature).toBe(
      "2c546125ff6c6f391f58aae182f3f4c42907124c4d3292e7aa6c88fae082120a",
    );
  });

  it("accepts the v1 canonical HMAC", () => {
    expect(verifySignedPayload(BODY, signedHeaders(), SECRET, NOW)).toEqual({
      valid: true,
      timestamp: NOW,
      nonce: NONCE,
    });
  });

  it("rejects changed bodies", () => {
    expect(
      verifySignedPayload(`${BODY} `, signedHeaders(), SECRET, NOW),
    ).toEqual({ valid: false, code: "invalid_digest" });
  });

  it("rejects stale timestamps", () => {
    expect(
      verifySignedPayload(BODY, signedHeaders(), SECRET, NOW + 301),
    ).toEqual({ valid: false, code: "stale_timestamp" });
  });

  it("rejects malformed nonces and signatures", () => {
    expect(
      verifySignedPayload(
        BODY,
        { ...signedHeaders(), nonce: "too-short" },
        SECRET,
        NOW,
      ),
    ).toEqual({ valid: false, code: "invalid_nonce" });
    expect(
      verifySignedPayload(
        BODY,
        { ...signedHeaders(), signature: "0".repeat(64) },
        SECRET,
        NOW,
      ),
    ).toEqual({ valid: false, code: "invalid_signature" });
  });
});
