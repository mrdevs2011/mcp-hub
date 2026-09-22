import { toolName } from "./ids.mjs";
import { callBackendTool, listBackendTools } from "./mcp-client.mjs";

export function enabledConnectors(account) {
  return (account.connectors || []).filter((c) => c.enabled !== false);
}

export function splitHubName(name) {
  const raw = String(name || "");
  const idx = raw.indexOf("__");
  if (idx <= 0) return { prefix: "", tool: raw };
  return { prefix: raw.slice(0, idx), tool: raw.slice(idx + 2) };
}

export async function aggregateTools(account) {
  const tools = [];
  const warnings = [];
  for (const connector of enabledConnectors(account)) {
    try {
      const { tools: backendTools } = await listBackendTools(connector);
      for (const tool of backendTools) {
        tools.push({
          name: toolName(connector.prefix, tool.name),
          description: `[${connector.name}] ${tool.description || tool.name}`,
          inputSchema: tool.inputSchema || { type: "object", properties: {} },
        });
      }
    } catch (err) {
      warnings.push(`${connector.name}: ${err.message}`);
    }
  }
  return { tools, warnings };
}

export async function dispatchTool(account, hubName, args) {
  const { prefix, tool } = splitHubName(hubName);
  const connector = enabledConnectors(account).find((c) => c.prefix === prefix);
  if (!connector) {
    throw new Error(`Connector topilmadi: ${prefix || hubName}. Tool nomi prefix__tool ko‘rinishida bo‘lishi kerak.`);
  }
  return callBackendTool(connector, tool, args);
}

export function initializeResult() {
  return {
    protocolVersion: "2025-03-26",
    capabilities: {
      tools: { listChanged: true },
    },
    serverInfo: {
      name: "mcp-hub",
      version: "1.0.0",
    },
    instructions:
      "Bu bitta gateway. Tool nomlari prefix__tool ko‘rinishida. Har bir prefix alohida MCP connector.",
  };
}

export function jsonRpcResult(id, result) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

export function jsonRpcError(id, message, code = -32000) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}
