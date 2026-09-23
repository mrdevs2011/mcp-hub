// ==========================================
// PUT YOUR OWN SUPABASE CREDENTIALS HERE
// Supabase Dashboard -> Settings -> API
// ==========================================

const SUPABASE_URL = "https://hharvpgnqmjbbgnfsauq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_enRXsK8Yqzn_goNRUHBocg_DPvuWUDb";

// Both of these can be PUBLIC - security is enforced through RLS
// NEVER put the SERVICE_ROLE key here or anywhere in the frontend!

// If you can't reach Supabase directly (e.g. it's blocked):
// deploy the mrdrive-proxy project to Vercel, then replace SUPABASE_URL
// with the proxy address (SUPABASE_ANON_KEY stays the same).
// Details: mrdrive-proxy/README.md
