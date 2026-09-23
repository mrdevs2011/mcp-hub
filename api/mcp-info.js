// Parol HECH QACHON bu yerda ishlatilmaydi/qaytarilmaydi — faqat
// tasdiqlash uchun username va hisoblangan MCP URL qaytariladi.
export default function handler(req, res) {
  const username = process.env.MRDRIVE_USERNAME || null;
  const hasCredentials = Boolean(
    process.env.MRDRIVE_USERNAME &&
      process.env.MRDRIVE_PASSWORD &&
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY
  );

  // Domen/muhit qanday bo'lishidan qat'iy nazar (vercel.app, custom
  // domen, preview deploy) to'g'ri manzilni beradi — hech narsa
  // qo'lda yozilmagan.
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const mcpUrl = `${proto}://${host}/api/mcp`;

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ username, hasCredentials, mcpUrl });
}
