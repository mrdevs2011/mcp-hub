import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { exposeTool, resolveBackendToolName, dispatchTool } from "../lib/gateway.mjs";

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

  it("exactName: tool is exposed without connector prefix", () => {
    const c = { name: "CMC", prefix: "cmc", toolOverrides: { run_command: { name: "terminal_run", exactName: true } } };
    const t = exposeTool(c, tool);
    assert.equal(t.name, "terminal_run");
  });

  it("description prefix option: includePrefixInDescription: false removes [Connector] prefix", () => {
    const c = { name: "CMC", prefix: "cmc", toolOverrides: { run_command: { description: "Clean description", includePrefixInDescription: false } } };
    const t = exposeTool(c, tool);
    assert.equal(t.description, "Clean description");
  });

  it("description prefix option: includePrefixInDescription: true prepends [Connector]", () => {
    const c = { name: "CMC", prefix: "cmc", toolOverrides: { run_command: { description: "Clean description", includePrefixInDescription: true } } };
    const t = exposeTool(c, tool);
    assert.equal(t.description, "[CMC] Clean description");
  });

  it("annotations & flags (readOnly, requiresConfirmation)", () => {
    const c = { name: "CMC", prefix: "cmc", toolOverrides: { run_command: { readOnly: true, requiresConfirmation: true, annotations: { priority: 1 } } } };
    const t = exposeTool(c, tool);
    assert.equal(t.annotations.readOnlyHint, true);
    assert.equal(t.annotations.requiresConfirmation, true);
    assert.equal(t.annotations.priority, 1);
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

  it("custom backendName mapping points to target backend tool", () => {
    const c = { name: "CMC", prefix: "cmc", toolOverrides: { custom_tool: { backendName: "real_backend_tool" } } };
    assert.equal(resolveBackendToolName(c, "custom_tool"), "real_backend_tool");
  });
});
