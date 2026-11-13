import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { exposeTool, resolveBackendToolName } from "../lib/gateway.mjs";

const tool = { name: "run_command", description: "Run", inputSchema: { type: "object", properties: { a: { type: "string" } } } };

describe("tool overrides", () => {
  it("defaults: prefixed name + [connector] description", () => {
    const c = { name: "CMC", prefix: "cmc" };
    const t = exposeTool(c, tool);
    assert.equal(t.name, "cmc__run_command");
    assert.equal(t.description, "[CMC] Run");
  });

  it("override name/description/schema", () => {
    const c = { name: "CMC", prefix: "cmc", toolOverrides: { run_command: { name: "exec", description: "Custom", inputSchema: { type: "object", properties: {} } } } };
    const t = exposeTool(c, tool);
    assert.equal(t.name, "cmc__exec");
    assert.equal(t.description, "Custom");
    assert.deepEqual(t.inputSchema, { type: "object", properties: {} });
  });

  it("disabled tool is hidden and cannot be called", () => {
    const c = { name: "CMC", prefix: "cmc", toolOverrides: { run_command: { enabled: false } } };
    assert.equal(exposeTool(c, tool), null);
    assert.throws(() => resolveBackendToolName(c, "run_command"));
  });

  it("renamed tool resolves back to the backend name", () => {
    const c = { name: "CMC", prefix: "cmc", toolOverrides: { run_command: { name: "exec" } } };
    assert.equal(resolveBackendToolName(c, "exec"), "run_command");
    assert.equal(resolveBackendToolName(c, "other"), "other");
  });
});
