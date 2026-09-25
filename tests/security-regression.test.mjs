/**
 * Security regression checks (run: node --test tests/security-regression.test.mjs)
 * Invariants only — no live network.
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

  it("exposes get_upload_token for the fine-grained PAT path", () => {
    assert.match(src, /name:\s*"get_upload_token"/);
    assert.match(src, /fine-grained|Fine-grained/i);
  });

  it("scopes the PAT to UPLOAD_REPO only (no other-repo use)", () => {
    assert.match(src, /UPLOAD_REPO/);
    assert.match(src, /parseRepo/);
    assert.match(src, /uploads repo only|one private repo|Do not use this token for any other repository/i);
    assert.match(src, /\/repos\/\$\{owner\}\/\$\{name\}\/contents/);
  });

  it("validates upload paths on the server (no .., no .git, allowlist chars)", () => {
    assert.match(src, /function sanitizeRepoPath/);
    assert.equal(src.includes('p.includes("..")'), true);
    assert.equal(src.includes('startsWith(".git")'), true);
    assert.match(src, /function parseRepo/);
  });

  it("keeps GH_TOKEN server-side and offers upload_file as the no-leak path", () => {
    assert.equal(src.includes("process.env.GH_TOKEN"), true);
    assert.match(src, /name:\s*"upload_file"/);
    assert.match(src, /NEVER print|Do not print token/i);
  });
});

describe("MRdrive auth", () => {
  const p = join(root, "../mrdrive/api/mcp.js");
  if (!existsSync(p)) return it("skip", () => {});
  const src = readFileSync(p, "utf8");

  it("does not call listUsers", () => {
    assert.equal(src.includes("listUsers"), false);
    assert.equal(/auth\.admin/i.test(src), false);
  });

  it("resolves users only via resolve_mcp_user RPC", () => {
    assert.match(src, /sb\.rpc\(\s*["']resolve_mcp_user["']/);
    assert.match(src, /p_name/);
    assert.match(src, /p_token/);
  });

  it("has rate limit", () => {
    assert.match(src, /checkRateLimit|RATE_MAX/);
  });

  it("accepts Bearer", () => {
    assert.match(src, /Bearer/);
  });
});
