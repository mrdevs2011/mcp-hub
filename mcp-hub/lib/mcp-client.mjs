function header(headers, name) {
  if (!headers) return "";
  if (typeof headers.get === "function") return headers.get(name) || headers.get(name.toLowerCase()) || "";
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : "";
}

export function parseRpcBody(contentType, text) {
  const type = String(contentType || "");
  if (type.includes("text/event-stream")) {
    const messages = [];
    for (const line of String(text).split(/\r?\n/)) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        messages.push(JSON.parse(payload));
      } catch {
        // ignore keep-alives
      }
    }
    return messages.find((m) => m && (m.result !== undefined || m.error)) || messages.at(-1) || null;
  }
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}

export async function mcpRpc(url, { method, params, id, sessionId, headers = {}, notification = false, timeoutMs = 25000 }) {
  const body = notification
    ? { jsonrpc: "2.0", method, params: params || {} }
    : { jsonrpc: "2.0", id: id ?? 1, method, params: params || {} };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "MCP-Protocol-Version": "2025-03-26",
        ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`Vaqt tugadi: ${url}`);
    throw new Error(`Ulanib bo‘lmadi: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  const nextSession = header(res.headers, "mcp-session-id") || sessionId || "";

  if (notification) {
    return { sessionId: nextSession, status: res.status, result: null };
  }

  let rpc;
  try {
    rpc = parseRpcBody(res.headers.get("content-type"), text);
  } catch {
    throw new Error(`MCP javobi JSON emas (${res.status}): ${text.slice(0, 180)}`);
  }

  if (!res.ok && !rpc) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 180)}`);
  }
  if (rpc?.error) {
    const msg = rpc.error.message || JSON.stringify(rpc.error);
    throw new Error(msg);
  }
  return { sessionId: nextSession, status: res.status, result: rpc?.result ?? rpc, raw: rpc };
}

export async function openBackend(connector, timeoutMs = 20000) {
  const extra = {};
  if (connector.authHeader && connector.authValue) {
    extra[connector.authHeader] = connector.authValue;
  }
  const init = await mcpRpc(connector.url, {
    method: "initialize",
    timeoutMs,
    headers: extra,
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "mcp-hub", version: "1.0.0" },
    },
  });
  await mcpRpc(connector.url, {
    method: "notifications/initialized",
    notification: true,
    sessionId: init.sessionId,
    headers: extra,
    timeoutMs: Math.min(timeoutMs, 8000),
  }).catch(() => {});
  return { sessionId: init.sessionId, headers: extra, info: init.result };
}

export async function listBackendTools(connector, timeoutMs = 20000) {
  const opened = await openBackend(connector, timeoutMs);
  const listed = await mcpRpc(connector.url, {
    method: "tools/list",
    sessionId: opened.sessionId,
    headers: opened.headers,
    timeoutMs,
  });
  return {
    tools: listed.result?.tools || [],
    serverInfo: opened.info?.serverInfo || null,
  };
}

export async function callBackendTool(connector, name, args, timeoutMs = 120000) {
  const opened = await openBackend(connector, 20000);
  const called = await mcpRpc(connector.url, {
    method: "tools/call",
    sessionId: opened.sessionId,
    headers: opened.headers,
    timeoutMs,
    params: { name, arguments: args || {} },
  });
  return called.result;
}
