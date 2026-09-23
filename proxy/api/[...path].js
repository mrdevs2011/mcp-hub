export const config = { runtime: "edge" };

// ==========================================
// PUT YOUR OWN SUPABASE PROJECT URL HERE
// (the old SUPABASE_URL from config.js goes here)
// ==========================================
const SUPABASE_PROJECT_URL = "https://hharvpgnqmjbbgnfsauq.supabase.co";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "access-control-allow-headers": "*",
  "access-control-expose-headers": "*",
};

export default async function handler(req) {
  // Answer preflight requests right away
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  // vercel.json rewrite turns /foo/bar into /api/foo/bar,
  // so we strip the /api prefix to restore the original Supabase path
  const targetPath = url.pathname.replace(/^\/api/, "") || "/";
  const targetUrl = SUPABASE_PROJECT_URL + targetPath + url.search;

  const outHeaders = new Headers(req.headers);
  outHeaders.delete("host");
  outHeaders.delete("connection");
  outHeaders.delete("accept-encoding");

  const hasBody = !["GET", "HEAD"].includes(req.method);

  let upstreamResp;
  try {
    upstreamResp = await fetch(targetUrl, {
      method: req.method,
      headers: outHeaders,
      body: hasBody ? req.body : undefined,
      // Node/Edge fetch requires this: a streamed body needs duplex
      duplex: hasBody ? "half" : undefined,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Proxy error: " + err.message }),
      {
        status: 502,
        headers: { "content-type": "application/json", ...CORS_HEADERS },
      }
    );
  }

  const respHeaders = new Headers(upstreamResp.headers);
  // Drop headers that may conflict with streaming
  respHeaders.delete("content-encoding");
  respHeaders.delete("content-length");
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    respHeaders.set(k, v);
  }

  return new Response(upstreamResp.body, {
    status: upstreamResp.status,
    statusText: upstreamResp.statusText,
    headers: respHeaders,
  });
}
