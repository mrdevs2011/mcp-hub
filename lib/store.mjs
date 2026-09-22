import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { token } from "./ids.mjs";

const FILE = process.env.HUB_DATA_FILE || path.join(process.cwd(), "data", "store.json");
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || "";
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const KEY = process.env.HUB_STORE_KEY || "mcp-hub:store";

function emptyStore() {
  return { accounts: {} };
}

async function redis(command) {
  const res = await fetch(`${UPSTASH_URL.replace(/\/$/, "")}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) {
    throw new Error(`Upstash xato: ${res.status}`);
  }
  const json = await res.json();
  return json.result;
}

async function readStore() {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    const raw = await redis(["GET", KEY]);
    if (!raw) return emptyStore();
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  }
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return emptyStore();
  }
}

async function writeStore(store) {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    await redis(["SET", KEY, JSON.stringify(store)]);
    return;
  }
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
}

export function storageMode() {
  if (UPSTASH_URL && UPSTASH_TOKEN) return "upstash";
  return "file";
}

export async function createAccount() {
  const store = await readStore();
  const accountId = token(8);
  const adminKey = token(24);
  const mcpKey = token(24);
  store.accounts[accountId] = {
    accountId,
    adminKey,
    mcpKey,
    createdAt: new Date().toISOString(),
    connectors: [],
  };
  await writeStore(store);
  return store.accounts[accountId];
}

export async function getAccount(accountId) {
  const store = await readStore();
  return store.accounts[accountId] || null;
}

export async function requireAdmin(accountId, adminKey) {
  const account = await getAccount(accountId);
  if (!account || account.adminKey !== adminKey) {
    const err = new Error("Hisob topilmadi yoki kalit noto‘g‘ri");
    err.status = 401;
    throw err;
  }
  return account;
}

export async function requireMcp(accountId, mcpKey) {
  const account = await getAccount(accountId);
  if (!account || account.mcpKey !== mcpKey) {
    const err = new Error("MCP kaliti noto‘g‘ri");
    err.status = 401;
    throw err;
  }
  return account;
}

export async function saveAccount(account) {
  const store = await readStore();
  store.accounts[account.accountId] = account;
  await writeStore(store);
  return account;
}

export async function importAccount(payload) {
  if (!payload?.accountId || !payload?.adminKey || !payload?.mcpKey) {
    throw new Error("Import faylida accountId, adminKey, mcpKey kerak");
  }
  const store = await readStore();
  store.accounts[payload.accountId] = {
    accountId: payload.accountId,
    adminKey: payload.adminKey,
    mcpKey: payload.mcpKey,
    createdAt: payload.createdAt || new Date().toISOString(),
    connectors: Array.isArray(payload.connectors) ? payload.connectors : [],
  };
  await writeStore(store);
  return store.accounts[payload.accountId];
}

export function publicAccount(account) {
  return {
    accountId: account.accountId,
    createdAt: account.createdAt,
    connectors: account.connectors,
    storage: storageMode(),
  };
}
