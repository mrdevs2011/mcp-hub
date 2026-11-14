import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { token, slugify } from "./lib/ids.mjs";
import {
  createAccount,
  loginAccount,
  publicAccount,
  requireAdmin,
  requireMcp,
  saveAccount,
  storageMode,
} from "./lib/store.mjs";
import {
  aggregateTools,
  dispatchTool,
  executeBackendTool,
  exposeTool,
  initializeResult,
  jsonRpcError,
  jsonRpcResult,
  toolOverridesOf,
} from "./lib/gateway.mjs";
import { listBackendTools } from "./lib/mcp-client.mjs";

const PORT = Number(process.env.PORT || 8787);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
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

function passwordFrom(req) {
  return query(req).get("p") || query(req).get("pass") || bearer(req);
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

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function normalizeConnector(input, existing) {
  const url = String(input.url ?? existing?.url ?? "").trim();
  if (!url) throw httpError(400, "URL kerak");
  if (!/^https?:\/\//i.test(url)) throw httpError(400, "URL http:// yoki https:// bilan boshlanishi kerak");
  const name = String(input.name || existing?.name || "MCP").trim();
  const prefix = slugify(input.prefix || existing?.prefix || name);
  // Tahrirda maydonni bo'sh qoldirib tozalash mumkin (undefined = o'zgartirilmaydi).
  const pick = (key) => (input[key] !== undefined ? String(input[key] ?? "").trim() : String(existing?.[key] || ""));
  return {
    id: existing?.id || token(6),
    name,
    prefix,
    url,
    authHeader: pick("authHeader"),
    authValue: pick("authValue"),
    enabled: input.enabled === undefined ? existing?.enabled ?? true : Boolean(input.enabled),
    toolOverrides: existing?.toolOverrides || {},
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Bitta tool uchun to'liq tahrir: nom, exactName, backendName, tavsif, inputSchema,
// defaultArgs, fixedArgs, timeoutMs, readOnly, requiresConfirmation, annotations, yoqilgan/o'chirilgan.
function normalizeToolOverride(input, prefix) {
  if (!input || typeof input !== "object") return null;
  const out = {};

  const name = String(input?.name ?? "").trim();
  if (name) {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(name)) {
      throw httpError(400, "Tool nomi: faqat harf, raqam, _ va - (1-64 belgi)");
    }
    const exactName = Boolean(input.exactName);
    if (!exactName && `${prefix}__${name}`.length > 64) {
      throw httpError(400, "prefix__nom 64 belgidan oshmasin");
    }
    out.name = name;
    if (exactName) out.exactName = true;
  }

  const backendName = String(input?.backendName ?? "").trim();
  if (backendName) {
    out.backendName = backendName;
  }

  if (input?.description !== undefined && input?.description !== null) {
    out.description = String(input.description).slice(0, 8000);
  }
  if (input?.includePrefixInDescription !== undefined) {
    out.includePrefixInDescription = Boolean(input.includePrefixInDescription);
  }

  if (input?.inputSchema !== undefined && input.inputSchema !== null && input.inputSchema !== "") {
    let schema = input.inputSchema;
    if (typeof schema === "string") {
      try {
        schema = JSON.parse(schema);
      } catch {
        throw httpError(400, "inputSchema to'g'ri JSON emas");
      }
    }
    if (!schema || typeof schema !== "object" || Array.isArray(schema) || schema.type !== "object") {
      throw httpError(400, "inputSchema obyekt bo'lishi va type: \"object\" bo'lishi kerak");
    }
    out.inputSchema = schema;
  }

  if (input?.defaultArgs !== undefined && input.defaultArgs !== null) {
    let dArgs = input.defaultArgs;
    if (typeof dArgs === "string" && dArgs.trim()) {
      try { dArgs = JSON.parse(dArgs); } catch { throw httpError(400, "defaultArgs to'g'ri JSON emas"); }
    }
    if (dArgs && typeof dArgs === "object" && !Array.isArray(dArgs)) {
      out.defaultArgs = dArgs;
    }
  }

  if (input?.fixedArgs !== undefined && input.fixedArgs !== null) {
    let fArgs = input.fixedArgs;
    if (typeof fArgs === "string" && fArgs.trim()) {
      try { fArgs = JSON.parse(fArgs); } catch { throw httpError(400, "fixedArgs to'g'ri JSON emas"); }
    }
    if (fArgs && typeof fArgs === "object" && !Array.isArray(fArgs)) {
      out.fixedArgs = fArgs;
    }
  }

  if (input?.timeoutMs !== undefined && input.timeoutMs !== null && input.timeoutMs !== "") {
    const t = Number(input.timeoutMs);
    if (!Number.isNaN(t) && t > 0) {
      out.timeoutMs = t <= 600 ? t * 1000 : t;
    }
  }

  if (input?.readOnly !== undefined) out.readOnly = Boolean(input.readOnly);
  if (input?.requiresConfirmation !== undefined) out.requiresConfirmation = Boolean(input.requiresConfirmation);
  if (input?.annotations && typeof input.annotations === "object" && !Array.isArray(input.annotations)) {
    out.annotations = input.annotations;
  }

  if (input?.enabled !== undefined) out.enabled = Boolean(input.enabled);

  return Object.keys(out).length ? out : null;
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

    // Haqiqiy public origin (Render/Vercel proxy orqali)
    const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
    const host = String(req.headers["x-forwarded-host"] || req.headers.host || "localhost").split(",")[0].trim();
    const origin = `${proto}://${host}`;
    const url = new URL(req.url, origin);
    const p = url.pathname;

    if (req.method === "GET" && p === "/") return staticFile(res, "index.html");
    if (req.method === "GET" && p === "/app.js") return staticFile(res, "app.js");
    if (req.method === "GET" && p === "/styles.css") return staticFile(res, "styles.css");

    // Static assets (favicon, logo, etc.)
    if (req.method === "GET" && /^\/(favicon|logo|apple-touch-icon)/.test(p)) {
      return staticFile(res, path.basename(p));
    }

    if (req.method === "GET" && p === "/api/health") {
      return send(res, 200, { ok: true, name: "mcp-hub", storage: storageMode() });
    }

    // --- Minimal OAuth shim (Claude.ai custom connector uchun) ---
    // Haqiqiy login yo'q: URL dagi ?k= kaliti asosiy himoya.

    if (req.method === "GET" && (p === "/.well-known/oauth-protected-resource" || p.startsWith("/.well-known/oauth-protected-resource"))) {
      return send(res, 200, {
        resource: origin,
        authorization_servers: [origin],
        scopes_supported: ["mcp"],
        bearer_methods_supported: ["header"],
      });
    }

    if (req.method === "GET" && (p === "/.well-known/oauth-authorization-server" || p === "/.well-known/openid-configuration")) {
      return send(res, 200, {
        issuer: origin,
        authorization_endpoint: `${origin}/oauth/authorize`,
        token_endpoint: `${origin}/oauth/token`,
        registration_endpoint: `${origin}/oauth/register`,
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code", "refresh_token"],
        code_challenge_methods_supported: ["S256", "plain"],
        token_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"],
        scopes_supported: ["mcp"],
      });
    }

    if (req.method === "POST" && p === "/oauth/register") {
      const body = await readBody(req).catch(() => ({}));
      const clientId = "mcp-hub-public-client";
      return send(res, 201, {
        client_id: clientId,
        client_id_issued_at: Math.floor(Date.now() / 1000),
        client_secret_expires_at: 0,
        redirect_uris: body.redirect_uris || ["https://claude.ai/api/mcp/auth_callback"],
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
        client_name: body.client_name || "Claude",
      });
    }

    if (req.method === "GET" && p === "/oauth/authorize") {
      const redirectUri = url.searchParams.get("redirect_uri") || "https://claude.ai/api/mcp/auth_callback";
      const state = url.searchParams.get("state") || "";
      const code = "hub_ok_" + token(12);
      const sep = redirectUri.includes("?") ? "&" : "?";
      const loc = `${redirectUri}${sep}code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
      res.writeHead(302, { Location: loc, "Access-Control-Allow-Origin": "*" });
      return res.end();
    }

    if (req.method === "POST" && p === "/oauth/token") {
      // Dummy token — asosiy himoya URL dagi k= kaliti
      return send(res, 200, {
        access_token: "hub_token_" + token(16),
        token_type: "Bearer",
        expires_in: 3600 * 24 * 365,
        scope: "mcp",
      });
    }
    // --- OAuth shim tugadi ---

    // Ro'yxatdan o'tish
    if (req.method === "POST" && p === "/api/register") {
      const body = await readBody(req);
      const account = await createAccount({ username: body.username, password: body.password });
      return send(res, 200, {
        accountId: account.accountId,
        username: account.username,
        mcpKey: account.mcpKey,
        storage: storageMode(),
      });
    }

    // Kirish
    if (req.method === "POST" && p === "/api/login") {
      const body = await readBody(req);
      const account = await loginAccount({ username: body.username, password: body.password });
      return send(res, 200, {
        ...publicAccount(account),
        mcpKey: account.mcpKey,
      });
    }

    // Hisob ma'lumotlari (parol bilan)
    let m = match(p, "/api/account/:accountId");
    if (m && (req.method === "GET" || req.method === "POST")) {
      const body = await readBody(req);
      const pass = passwordFrom(req) || body?._password || body?.password;
      const account = await requireAdmin(m.accountId, pass);
      return send(res, 200, publicAccount(account));
    }

    // Connector qo'shish
    m = match(p, "/api/account/:accountId/connectors");
    if (m && req.method === "POST") {
      const body = await readBody(req);
      const pass = passwordFrom(req) || body?._password || body?.password;
      const account = await requireAdmin(m.accountId, pass);
      const { _password: _p1, password: _p2, ...connBody } = body;
      const connector = normalizeConnector(connBody);
      if (account.connectors.some((x) => x.prefix === connector.prefix)) {
        connector.prefix = `${connector.prefix}_${token(2)}`;
      }
      account.connectors.push(connector);
      await saveAccount(account);
      return send(res, 201, connector);
    }

    // Connector tahrirlash / o'chirish
    m = match(p, "/api/account/:accountId/connectors/:id");
    if (m && req.method === "PUT") {
      const body = await readBody(req);
      const pass = passwordFrom(req) || body?._password || body?.password;
      const account = await requireAdmin(m.accountId, pass);
      const current = account.connectors.find((x) => x.id === m.id);
      if (!current) return send(res, 404, { error: "Connector topilmadi" });
      const { _password: _p3, password: _p4, ...putBody } = body;
      const next = normalizeConnector(putBody, current);
      if (account.connectors.some((x) => x.id !== current.id && x.prefix === next.prefix)) {
        return send(res, 409, { error: "Bu prefix band — boshqa prefix tanlang" });
      }
      account.connectors = account.connectors.map((x) => (x.id === current.id ? next : x));
      await saveAccount(account);
      return send(res, 200, next);
    }

    if (m && req.method === "DELETE") {
      const body = await readBody(req);
      const pass = passwordFrom(req) || body?._password || body?.password;
      const account = await requireAdmin(m.accountId, pass);
      account.connectors = account.connectors.filter((x) => x.id !== m.id);
      await saveAccount(account);
      return send(res, 200, { ok: true });
    }

    // Connector sinash
    m = match(p, "/api/account/:accountId/connectors/:id/test");
    if (m && req.method === "POST") {
      const body = await readBody(req);
      const pass = passwordFrom(req) || body?._password || body?.password;
      const account = await requireAdmin(m.accountId, pass);
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

    // Connector tool'ini test qilish (call)
    m = match(p, "/api/account/:accountId/connectors/:id/tools/call");
    if (m && req.method === "POST") {
      const body = await readBody(req);
      const pass = passwordFrom(req) || body?._password || body?.password;
      const account = await requireAdmin(m.accountId, pass);
      const connector = account.connectors.find((x) => x.id === m.id);
      if (!connector) return send(res, 404, { error: "Connector topilmadi" });

      const toolKey = String(body?.tool || "").trim();
      if (!toolKey) return send(res, 400, { error: "tool nomi kerak" });
      const overrides = toolOverridesOf(connector);
      const ov = overrides[toolKey] || {};
      const backendName = ov.backendName || toolKey;
      const args = body.arguments && typeof body.arguments === "object" ? body.arguments : {};
      try {
        const result = await executeBackendTool(connector, backendName, ov, args);
        return send(res, 200, { ok: true, result });
      } catch (err) {
        return send(res, 200, { ok: false, error: err.message });
      }
    }

    // Connector tool'lari: ro'yxat (GET/POST), tahrirlash (PUT), asl holiga qaytarish (DELETE)
    m = match(p, "/api/account/:accountId/connectors/:id/tools");
    if (m && (req.method === "POST" || req.method === "GET" || req.method === "PUT" || req.method === "DELETE")) {
      const body = await readBody(req).catch(() => ({}));
      const pass = passwordFrom(req) || body?._password || body?.password;
      const account = await requireAdmin(m.accountId, pass);
      const connector = account.connectors.find((x) => x.id === m.id);
      if (!connector) return send(res, 404, { error: "Connector topilmadi" });

      if (req.method === "POST" || req.method === "GET") {
        let result = null;
        let warning = null;
        try {
          result = await listBackendTools(connector, 15000);
          connector.toolsCache = result.tools;
          await saveAccount(account);
        } catch (err) {
          warning = err.message;
        }

        const overrides = toolOverridesOf(connector);
        const backendTools = result?.tools || connector.toolsCache || [];
        const toolMap = new Map();

        for (const t of backendTools) {
          toolMap.set(t.name, {
            name: t.name,
            description: t.description || "",
            inputSchema: t.inputSchema || { type: "object", properties: {} },
            override: overrides[t.name] || null,
            exposedName: exposeTool(connector, t)?.name || null,
            isCustom: false,
          });
        }

        // Custom toollar (backend ro'yxatida yo'q, lekin overrides da bor)
        for (const [toolName, ov] of Object.entries(overrides)) {
          if (!toolMap.has(toolName) && ov) {
            const mock = {
              name: toolName,
              description: ov.description || "",
              inputSchema: ov.inputSchema || { type: "object", properties: {} },
            };
            toolMap.set(toolName, {
              name: toolName,
              description: ov.description || "",
              inputSchema: ov.inputSchema || { type: "object", properties: {} },
              override: ov,
              exposedName: exposeTool(connector, mock)?.name || null,
              isCustom: true,
            });
          }
        }

        return send(res, 200, {
          ok: true,
          warning,
          serverInfo: result?.serverInfo || null,
          prefix: connector.prefix,
          tools: Array.from(toolMap.values()),
        });
      }

      const toolKey = String(body?.tool || "").trim();
      if (!toolKey) return send(res, 400, { error: "tool nomi kerak" });
      const overrides = { ...toolOverridesOf(connector) };

      if (req.method === "DELETE") {
        delete overrides[toolKey];
      } else {
        const clean = normalizeToolOverride(body?.override ?? body, connector.prefix);
        if (clean) overrides[toolKey] = clean;
        else delete overrides[toolKey];
        if (clean?.name) {
          // Nom to'qnashuvini tekshirish (backend tool'lari + boshqa nomi o'zgargan tool'lar)
          let backendTools = connector.toolsCache || null;
          if (!backendTools) {
            try {
              backendTools = (await listBackendTools(connector, 10000)).tools;
            } catch {
              /* backend javob bermasa, mavjud cache/overrides orqali tekshiramiz */
            }
          }
          const probe = { ...connector, toolOverrides: overrides };
          const seen = new Set();
          const names = backendTools
            ? backendTools.map((t) => exposeTool(probe, t)?.name).filter(Boolean)
            : Object.values(overrides)
                .filter((o) => o.name && o.enabled !== false)
                .map((o) => (o.exactName ? o.name : `${connector.prefix}__${o.name}`));
          for (const n of names) {
            if (seen.has(n)) return send(res, 409, { error: `Bu nom band: ${n}` });
            seen.add(n);
          }
        }
      }

      connector.toolOverrides = overrides;
      connector.updatedAt = new Date().toISOString();
      await saveAccount(account);
      return send(res, 200, { ok: true, override: overrides[toolKey] || null });
    }

    // MCP endpoint
    m = match(p, "/mcp/:accountId") || match(p, "/api/mcp/:accountId");
    if (m) {
      const account = await requireMcp(m.accountId, query(req).get("k") || bearer(req));
      return handleMcp(req, res, account);
    }

    return send(res, 404, { error: "Topilmadi" });
  } catch (err) {
    return send(res, err.status || 500, { error: err.message || "Server xatosi" });
  }
});

export { server };

export default function vercel(req, res) {
  server.emit("request", req, res);
}

if (!process.env.VERCEL && !process.env.NODE_TEST_CONTEXT) {
  server.listen(PORT, () => {
    console.log(`MCP Hub: http://localhost:${PORT}`);
  });
}
