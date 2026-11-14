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

  // Nom: agar exactName bo'lsa prefikssiz, aks holda prefix__nom
  let finalName;
  if (ov.name) {
    finalName = ov.exactName ? ov.name : toolName(connector.prefix, ov.name);
  } else {
    finalName = toolName(connector.prefix, tool.name);
  }

  // Tavsif: override qilingan bo'lsa (bo'sh qatordan tashqari) uni olamiz
  let description;
  if (ov.description !== undefined && ov.description !== null) {
    if (ov.includePrefixInDescription === true) {
      description = `[${connector.name}] ${ov.description}`;
    } else {
      description = ov.description;
    }
  } else {
    description = `[${connector.name}] ${tool.description || tool.name}`;
  }

  // InputSchema: to'liq JSON Schema
  const inputSchema =
    ov.inputSchema && typeof ov.inputSchema === "object"
      ? ov.inputSchema
      : tool.inputSchema || { type: "object", properties: {} };

  const exposed = {
    name: finalName,
    description,
    inputSchema,
  };

  // Annotatsiyalar va belgilar (readOnly, requiresConfirmation, custom)
  if (ov.annotations && typeof ov.annotations === "object") {
    exposed.annotations = { ...ov.annotations };
  }
  if (ov.readOnly) {
    exposed.annotations = { ...(exposed.annotations || {}), readOnlyHint: true };
  }
  if (ov.requiresConfirmation) {
    exposed.annotations = { ...(exposed.annotations || {}), requiresConfirmation: true };
  }

  return exposed;
}

// Claude chaqirgan nom -> backend dagi haqiqiy tool nomi.
export function resolveBackendToolName(connector, called) {
  const overrides = toolOverridesOf(connector);
  for (const [orig, ov] of Object.entries(overrides)) {
    if (ov && ov.enabled === false) {
      if (
        orig === called ||
        sanitizeToolName(orig) === called ||
        (ov.name && (ov.name === called || sanitizeToolName(ov.name) === called))
      ) {
        throw new Error(`Tool o‘chirilgan: ${called}`);
      }
    }
    if (ov && ov.name && (ov.name === called || sanitizeToolName(ov.name) === called)) {
      return ov.backendName || orig;
    }
  }
  for (const [orig, ov] of Object.entries(overrides)) {
    if (orig === called || sanitizeToolName(orig) === called) {
      if (ov && ov.enabled === false) throw new Error(`Tool o‘chirilgan: ${called}`);
      return ov.backendName || orig;
    }
  }
  return called;
}

export async function aggregateTools(account) {
  const tools = [];
  const warnings = [];
  for (const connector of enabledConnectors(account)) {
    let backendTools = null;
    try {
      const res = await listBackendTools(connector);
      backendTools = res.tools || [];
      connector.toolsCache = backendTools;
    } catch (err) {
      warnings.push(`${connector.name}: ${err.message}`);
      backendTools = connector.toolsCache || [];
    }

    const seenToolNames = new Set();
    for (const tool of backendTools) {
      seenToolNames.add(tool.name);
      const exposed = exposeTool(connector, tool);
      if (exposed) tools.push(exposed);
    }

    // Backend ro'yxatida bo'lmagan, lekin override'larda qo'shilgan custom/virtual toollar
    const overrides = toolOverridesOf(connector);
    for (const [toolName, ov] of Object.entries(overrides)) {
      if (!seenToolNames.has(toolName) && ov && ov.enabled !== false) {
        const mock = {
          name: toolName,
          description: ov.description || "",
          inputSchema: ov.inputSchema || { type: "object", properties: {} },
        };
        const exposed = exposeTool(connector, mock);
        if (exposed) tools.push(exposed);
      }
    }
  }
  return { tools, warnings };
}

export async function executeBackendTool(connector, toolName, override = {}, args = {}) {
  let finalArgs = { ...(args || {}) };
  if (override?.defaultArgs && typeof override.defaultArgs === "object") {
    finalArgs = { ...override.defaultArgs, ...finalArgs };
  }
  if (override?.fixedArgs && typeof override.fixedArgs === "object") {
    finalArgs = { ...finalArgs, ...override.fixedArgs };
  }

  const timeoutMs = Number(override?.timeoutMs) > 0 ? Number(override.timeoutMs) : 120000;
  try {
    return await callBackendTool(connector, toolName, finalArgs, timeoutMs);
  } catch (err) {
    const msg = String(err && err.message ? err.message : err).slice(0, 500);
    throw new Error(`[${connector.name}] ${msg}`);
  }
}

export async function dispatchTool(account, hubName, args) {
  const connectors = enabledConnectors(account);

  // 1. To'g'ridan-to'g'ri exactName yoki exposedName bo'yicha qidirish
  for (const c of connectors) {
    const overrides = toolOverridesOf(c);
    for (const [orig, ov] of Object.entries(overrides)) {
      if (ov && ov.enabled === false) continue;
      const mock = { name: orig, description: ov.description, inputSchema: ov.inputSchema };
      const exp = exposeTool(c, mock);
      if (exp && exp.name === hubName) {
        const targetName = ov.backendName || orig;
        return await executeBackendTool(c, targetName, ov, args);
      }
    }
  }

  // 2. Standart prefix__tool bo'yicha qidirish
  const { prefix, tool } = splitHubName(hubName);
  const connector = connectors.find((c) => c.prefix === prefix);
  if (!connector) {
    throw new Error(`Connector topilmadi: ${prefix || hubName}. Tool nomi prefix__tool ko‘rinishida bo‘lishi kerak.`);
  }

  const backendName = resolveBackendToolName(connector, tool);
  const ov = toolOverridesOf(connector)[backendName] || {};
  return await executeBackendTool(connector, backendName, ov, args);
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
