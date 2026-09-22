import { randomBytes } from "node:crypto";

export function token(bytes = 16) {
  return randomBytes(bytes).toString("hex");
}

export function slugify(value, fallback = "mcp") {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
  return slug || fallback;
}

export function toolName(prefix, name) {
  const clean = String(name || "tool").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${prefix}__${clean}`;
}
