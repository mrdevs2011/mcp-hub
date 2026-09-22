import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { token, slugify } from "./lib/ids.mjs";
import {
  createAccount,
  importAccount,
  publicAccount,
  requireAdmin,
  requireMcp,
  saveAccount,
  storageMode,
} from "./lib/store.mjs";
import {
  aggregateTools,
  dispatchTool,
  initializeResult,
  jsonRpcError,
  jsonRpcResult,
} from "./lib/gateway.mjs";
import { listBackendTools } from "./lib/mcp-client.mjs";

const PORT = Number(process.env.PORT || 8787);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

function send(res, status, body, headers = {}) {
  const payload = body == null ? "" : typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Accept, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Expose-Headers": "Mcp-Session-Id, MCP-Protocol-Version",
    "Content-Type": typeof body === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    ...headers,
  });
  res.end(payload);
}

function query(req) {
  return new URL(req.url, "http://localhost").searchParams;
}

function bearer(req) {
  return String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
}

function keyFrom(req) {
  return query(req).get("k") || query(req).get("key") || bearer(req);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

function match(pathname, pattern) {
  const a = pathname.split("/").filter(Boolean);
  const b = pattern.split("/").filter(Boolean);
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < a.length; i += 1) {
    if (b[i].startsWith(":")) params[b[i].slice(1)] = decodeURIComponent(a[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

function normalizeConnector(input, existing) {
  const url = String(input.url || "").trim();
  if (!url) {
    const err = new Error("URL kerak");
    err.status = 400;
    throw err;
  }
  const name = String(input.name || existing?.name || "MCP").trim();
  const prefix = slugify(input.prefix || existing?.prefix || name);
  return {
    id: existing?.id || token(6),
    name,
    prefix,
    url,
    authHeader: String(input.authHeader || existing?.authHeader || "").trim(),
    authValue: String(input.authValue || existing?.authValue || "").trim(),
    enabled: input.enabled === undefined ? existing?.enabled ?? true : Boolean(input.enabled),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mcpHeaders(sessionId) {
  const headers = { "MCP-Protocol-Version": "2025-03-26" };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  return headers;
}

async function handleMcp(req, res, account) {
  if (req.method === "GET") return send(res, 405, { error: "GET qollab-quvvatilmaydi" });
  if (req.method === "DELETE") {
    res.writeHead(204);
    return res.end();
  }

  let payload;
  try {
    payload = await readBody(req);
  } catch {
    return send(res, 400, jsonRpcError(null, "JSON kerak"));
  }

  const sessionId = req.headers["mcp-session-id"] || `hub_${account.accountId}`;
  const id = payload.id;
  const method = payload.method;

  try {
    if (method === "initialize") {
      return send(res, 200, jsonRpcResult(id, initializeResult()), mcpHeaders(sessionId));
    }
    if (method === "notifications/initialized" || method === "initialized") {
      res.writeHead(202, mcpHeaders(sessionId));
      return res.end();
    }
    if (method === "ping") {
      return send(res, 200, jsonRpcResult(id, {}), mcpHeaders(sessionId));
    }
    if (method === "tools/list") {
      const { tools, warnings } = await aggregateTools(account);
      const result = { tools };
      if (warnings.length) result._hubWarnings = warnings;
      return send(res, 200, jsonRpcResult(id, result), mcpHeaders(sessionId));
    }
    if (method === "tools/call") {
      const name = payload.params?.name;
      const args = payload.params?.arguments || {};
      const result = await dispatchTool(account, name, args);
      return send(res, 200, jsonRpcResult(id, result || { content: [{ type: "text", text: "OK" }] }), mcpHeaders(sessionId));
    }
    if (method === "resources/list") {
      return send(res, 200, jsonRpcResult(id, { resources: [] }), mcpHeaders(sessionId));
    }
    if (method === "prompts/list") {
      return send(res, 200, jsonRpcResult(id, { prompts: [] }), mcpHeaders(sessionId));
    }
    return send(res, 200, jsonRpcError(id, `Usul qollab-quvvatilmaydi: ${method}`, -32601), mcpHeaders(sessionId));
  } catch (err) {
    return send(res, 200, jsonRpcError(id, err.message), mcpHeaders(sessionId));
  }
}

async function staticFile(res, file) {
  try {
    const full = path.join(process.cwd(), "public", file);
    const body = await readFile(full);
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "text/plain; charset=utf-8" });
    res.end(body);
  } catch {
    send(res, 404, { error: "Topilmadi" });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, Accept, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      });
      return res.end();
    }

    const url = new URL(req.url, "http://localhost");
    const p = url.pathname;

    if (req.method === "GET" && p === "/") return staticFile(res, "index.html");
    if (req.method === "GET" && p === "/app.js") return staticFile(res, "app.js");
    if (req.method === "GET" && p === "/styles.css") return staticFile(res, "styles.css");

    if (req.method === "GET" && p === "/api/health") {
      return send(res, 200, { ok: true, name: "mcp-hub", storage: storageMode() });
    }

    if (req.method === "POST" && p === "/api/account") {
      const account = await createAccount();
      return send(res, 200, {
        accountId: account.accountId,
        adminKey: account.adminKey,
        mcpKey: account.mcpKey,
        storage: storageMode(),
      });
    }

    if (req.method === "POST" && p === "/api/account/import") {
      const body = await readBody(req);
      const account = await importAccount(body);
      return send(res, 200, publicAccount(account));
    }

    let m = match(p, "/api/account/:accountId");
    if (m && req.method === "GET") {
      const account = await requireAdmin(m.accountId, keyFrom(req));
      return send(res, 200, {
        ...publicAccount(account),
        adminKey: account.adminKey,
        mcpKey: account.mcpKey,
      });
    }

    m = match(p, "/api/account/:accountId/export");
    if (m && req.method === "GET") {
      const account = await requireAdmin(m.accountId, keyFrom(req));
      return send(res, 200, account);
    }

    m = match(p, "/api/account/:accountId/connectors");
    if (m && req.method === "POST") {
      const account = await requireAdmin(m.accountId, keyFrom(req));
      const connector = normalizeConnector(await readBody(req));
      if (account.connectors.some((x) => x.prefix === connector.prefix)) {
        connector.prefix = `${connector.prefix}_${token(2)}`;
      }
      account.connectors.push(connector);
      await saveAccount(account);
      return send(res, 201, connector);
    }

    m = match(p, "/api/account/:accountId/connectors/:id");
    if (m && req.method === "PUT") {
      const account = await requireAdmin(m.accountId, keyFrom(req));
      const current = account.connectors.find((x) => x.id === m.id);
      if (!current) return send(res, 404, { error: "Connector topilmadi" });
      const next = normalizeConnector(await readBody(req), current);
      account.connectors = account.connectors.map((x) => (x.id === current.id ? next : x));
      await saveAccount(account);
      return send(res, 200, next);
    }

    if (m && req.method === "DELETE") {
      const account = await requireAdmin(m.accountId, keyFrom(req));
      account.connectors = account.connectors.filter((x) => x.id !== m.id);
      await saveAccount(account);
      return send(res, 200, { ok: true });
    }

    m = match(p, "/api/account/:accountId/connectors/:id/test");
    if (m && req.method === "POST") {
      const account = await requireAdmin(m.accountId, keyFrom(req));
      const connector = account.connectors.find((x) => x.id === m.id);
      if (!connector) return send(res, 404, { error: "Connector topilmadi" });
      try {
        const result = await listBackendTools(connector, 20000);
        return send(res, 200, {
          ok: true,
          serverInfo: result.serverInfo,
          tools: result.tools.map((t) => t.name),
          count: result.tools.length,
        });
      } catch (err) {
        return send(res, 200, { ok: false, error: err.message });
      }
    }

    m = match(p, "/mcp/:accountId") || match(p, "/api/mcp/:accountId");
    if (m) {
      const account = await requireMcp(m.accountId, keyFrom(req));
      return handleMcp(req, res, account);
    }

    return send(res, 404, { error: "Topilmadi" });
  } catch (err) {
    return send(res, err.status || 500, { error: err.message || "Server xatosi" });
  }
});

export default function vercel(req, res) {
  server.emit("request", req, res);
}

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`MCP Hub: http://localhost:${PORT}`);
  });
}
