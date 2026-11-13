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

function sanitizeToolName(name) {
  return String(name || "tool").replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function toolOverridesOf(connector) {
  const o = connector && connector.toolOverrides;
  return o && typeof o === "object" && !Array.isArray(o) ? o : {};
}

// Backend tool + connector.toolOverrides[tool.name] -> Claude ko'radigan tool (yoki null, agar o'chirilgan bo'lsa).
export function exposeTool(connector, tool) {
  const ov = toolOverridesOf(connector)[tool.name] || {};
  if (ov.enabled === false) return null;
  const description =
    typeof ov.description === "string" && ov.description !== ""
      ? ov.description
      : `[${connector.name}] ${tool.description || tool.name}`;
  const inputSchema =
    ov.inputSchema && typeof ov.inputSchema === "object"
      ? ov.inputSchema
      : tool.inputSchema || { type: "object", properties: {} };
  return {
    name: toolName(connector.prefix, ov.name || tool.name),
    description,
    inputSchema,
  };
}

// Claude chaqirgan (o'zgartirilgan bo'lishi mumkin) nom -> backend dagi haqiqiy tool nomi.
export function resolveBackendToolName(connector, called) {
  const overrides = toolOverridesOf(connector);
  for (const [orig, ov] of Object.entries(overrides)) {
    if (ov && ov.name && sanitizeToolName(ov.name) === called) {
      if (ov.enabled === false) throw new Error(`Tool o‘chirilgan: ${called}`);
      return orig;
    }
  }
  for (const [orig, ov] of Object.entries(overrides)) {
    if (orig === called || sanitizeToolName(orig) === called) {
      if (ov && ov.enabled === false) throw new Error(`Tool o‘chirilgan: ${called}`);
      return orig;
    }
  }
  return called;
}

export async function aggregateTools(account) {
  const tools = [];
  const warnings = [];
  for (const connector of enabledConnectors(account)) {
    try {
      const { tools: backendTools } = await listBackendTools(connector);
      for (const tool of backendTools) {
        const exposed = exposeTool(connector, tool);
        if (exposed) tools.push(exposed);
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
  try {
    return await callBackendTool(connector, resolveBackendToolName(connector, tool), args);
  } catch (err) {
    // Isolate backend failure: do not crash hub process; return structured error to client.
    const msg = String(err && err.message ? err.message : err).slice(0, 500);
    throw new Error(`[${connector.name}] ${msg}`);
  }
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
