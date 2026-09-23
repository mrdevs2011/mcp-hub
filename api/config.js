// Bu endpoint statik config.js o'rnini bosadi: haqiqiy SUPABASE_URL va
// SUPABASE_ANON_KEY qiymatlari endi repo/kodda emas, faqat Vercel
// Environment Variables'da saqlanadi. Brauzer /api/config.js manzilini
// chaqiradi, bu funksiya esa env'dan o'qib, xuddi statik config.js kabi
// JavaScript matnini qaytaradi.
export default function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  // Brauzer keshi bir necha daqiqa saqlasin, lekin abadiy emas —
  // kalitlarni almashtirsangiz tezroq yangilanishi uchun.
  res.setHeader("Cache-Control", "public, max-age=300");
  res.status(200).send(
    `const SUPABASE_URL = ${JSON.stringify(SUPABASE_URL)};\n` +
      `const SUPABASE_ANON_KEY = ${JSON.stringify(SUPABASE_ANON_KEY)};\n`
  );
}
