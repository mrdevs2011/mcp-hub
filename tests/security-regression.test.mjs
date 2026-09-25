/**
 * Security regression checks (run: node --test tests/security-regression.test.mjs)
 * These assert invariants without live network when possible.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("CMMGH must not return PAT", () => {
  const p = join(root, "../CMMGH/api/mcp.js");
  if (!existsSync(p)) return it("skip if no CMMGH", () => {});
  const src = readFileSync(p, "utf8");
  it("has no get_upload_token tool", () => {
    assert.equal(src.includes("get_upload_token"), false);
  });
  it("never JSON.stringifies env GH_TOKEN to client", () => {
    assert.equal(/JSON\.stringify\(\s*\{\s*token\s*,/.test(src), false);
    assert.equal(src.includes("process.env.GH_TOKEN"), true); // used server-side only
  });
  it("exposes upload_file", () => {
    assert.match(src, /name:\s*"upload_file"/);
  });
});

describe("MRdrive auth", () => {
  const p = join(root, "../mrdrive/api/mcp.js");
  if (!existsSync(p)) return it("skip", () => {});
  const src = readFileSync(p, "utf8");
  it("does not call listUsers", () => {
    assert.equal(src.includes("listUsers"), false);
  });
  it("uses resolve_mcp_user RPC", () => {
    assert.match(src, /resolve_mcp_user/);
  });
  it("has rate limit", () => {
    assert.match(src, /checkRateLimit|RATE_MAX/);
  });
  it("accepts Bearer", () => {
    assert.match(src, /Bearer/);
  });
});

describe("LifeMR auth", () => {
  const p = join(root, "../LifeMR/api/mcp.js");
  if (!existsSync(p)) return it("skip", () => {});
  const src = readFileSync(p, "utf8");
  it("accepts Bearer", () => {
    assert.match(src, /Bearer/);
  });
});
