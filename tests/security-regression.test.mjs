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

describe("CMMGH fine-grained PAT + server upload", () => {
  const p = join(root, "../CMMGH/api/mcp.js");
  if (!existsSync(p)) return it("skip if no CMMGH", () => {});
  const src = readFileSync(p, "utf8");
  // Fine-grained PAT is intentional: scoped to one private uploads repo only.
  // get_upload_token may return it for Claude/Skills direct git push.
  it("exposes get_upload_token for fine-grained PAT path", () => {
    assert.match(src, /name:\s*"get_upload_token"/);
    assert.match(src, /fine-grained|Fine-grained/i);
  });
  it("documents never-echo token security", () => {
    assert.match(src, /NEVER print|Do not print token/i);
  });
  it("uses process.env.GH_TOKEN server-side", () => {
    assert.equal(src.includes("process.env.GH_TOKEN"), true);
  });
  it("exposes upload_file as server-side alternative", () => {
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
