import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { rm } from "node:fs/promises";

// Use a temporary test store file
const TEST_STORE = path.join(process.cwd(), "data", "test-store.json");
process.env.HUB_DATA_FILE = TEST_STORE;

describe("Tool editing and testing E2E", () => {
  let serverInstance;
  let baseUrl;
  let accountId;
  let password = "testpassword123";
  let connectorId;

  before(async () => {
    const { server } = await import("../server.mjs");
    serverInstance = server;

    await new Promise((resolve) => {
      serverInstance.listen(0, "127.0.0.1", () => {
        const addr = serverInstance.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (serverInstance) await new Promise((res) => serverInstance.close(res));
    await rm(TEST_STORE, { force: true }).catch(() => {});
  });

  it("1. Register new account", async () => {
    const res = await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "edit_tester", password }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.accountId);
    assert.ok(data.mcpKey);
    accountId = data.accountId;
  });

  it("2. Add connector", async () => {
    const res = await fetch(`${baseUrl}/api/account/${accountId}/connectors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({
        name: "TestConn",
        prefix: "tc",
        url: "http://127.0.0.1:9999/mcp",
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.id);
    connectorId = data.id;
  });

  it("3. List tools when connector backend is offline (resilient fallback)", async () => {
    const res = await fetch(`${baseUrl}/api/account/${accountId}/connectors/${connectorId}/tools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.ok(data.warning); // should warn that backend is offline, but NOT crash
    assert.deepEqual(data.tools, []);
  });

  it("4. Add / edit a custom tool override with all attributes", async () => {
    const override = {
      name: "my_custom_tool",
      exactName: true,
      backendName: "run_exec",
      description: "My custom tool description without prefix",
      includePrefixInDescription: false,
      inputSchema: {
        type: "object",
        properties: {
          cmd: { type: "string", description: "Command to run" },
          count: { type: "number" },
        },
        required: ["cmd"],
      },
      defaultArgs: { count: 5 },
      fixedArgs: { env: "test" },
      timeoutMs: 45000,
      readOnly: true,
      requiresConfirmation: true,
      enabled: true,
    };

    const res = await fetch(`${baseUrl}/api/account/${accountId}/connectors/${connectorId}/tools`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({
        tool: "custom_key",
        override,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.equal(data.override.name, "my_custom_tool");
    assert.equal(data.override.exactName, true);
    assert.equal(data.override.backendName, "run_exec");
    assert.equal(data.override.description, "My custom tool description without prefix");
    assert.equal(data.override.includePrefixInDescription, false);
    assert.equal(data.override.readOnly, true);
    assert.equal(data.override.requiresConfirmation, true);
    assert.deepEqual(data.override.defaultArgs, { count: 5 });
    assert.deepEqual(data.override.fixedArgs, { env: "test" });
  });

  it("5. List tools includes the newly added / edited tool", async () => {
    const res = await fetch(`${baseUrl}/api/account/${accountId}/connectors/${connectorId}/tools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.equal(data.tools.length, 1);
    const t = data.tools[0];
    assert.equal(t.name, "custom_key");
    assert.equal(t.exposedName, "my_custom_tool");
    assert.equal(t.isCustom, true);
  });

  it("6. Disable the tool", async () => {
    const res = await fetch(`${baseUrl}/api/account/${accountId}/connectors/${connectorId}/tools`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({
        tool: "custom_key",
        override: {
          name: "my_custom_tool",
          exactName: true,
          enabled: false,
        },
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.equal(data.override.enabled, false);
  });

  it("7. Reset / delete the tool override", async () => {
    const res = await fetch(`${baseUrl}/api/account/${accountId}/connectors/${connectorId}/tools`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({
        tool: "custom_key",
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);

    // Verify it is gone
    const listRes = await fetch(`${baseUrl}/api/account/${accountId}/connectors/${connectorId}/tools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({}),
    });
    const listData = await listRes.json();
    assert.equal(listData.tools.length, 0);
  });

  it("8. Tool test call endpoint handles invocation", async () => {
    const res = await fetch(`${baseUrl}/api/account/${accountId}/connectors/${connectorId}/tools/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({
        tool: "dummy_tool",
        arguments: { msg: "hello" },
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    // Since backend is offline, ok should be false with an error message
    assert.equal(data.ok, false);
    assert.ok(data.error);
  });
});
