# MRdrive Supabase Proxy

This small project is for when you can't reach Supabase directly: instead of
the browser, this proxy talks to Supabase. The MRdrive frontend calls this
proxy address instead of `*.supabase.co`, and the proxy forwards the requests
to Supabase.

## Setup

1. **Upload this folder (`mrdrive-proxy`) as a separate GitHub repo** (or
   deploy it directly with the Vercel CLI).

2. **Import it into Vercel as a new project**
   - vercel.com -> Add New -> Project -> pick this repo -> Deploy.
   - No build settings are needed, the defaults work.

3. **Check `SUPABASE_PROJECT_URL` inside `api/[...path].js`** — it is already
   filled in with your real Supabase project URL (taken from `config.js`).
   If you ever switch Supabase projects, update it there.

4. After the deploy finishes, you'll get an address like:
   `https://mrdrive-proxy-xxxx.vercel.app`

5. **In MRdrive's Vercel project** (Project → Settings → Environment
   Variables), replace the `SUPABASE_URL` value with the proxy address:
   ```
   SUPABASE_URL = https://mrdrive-proxy-xxxx.vercel.app
   SUPABASE_ANON_KEY = ...   // this stays the same
   ```
   Then redeploy MRdrive. (`SUPABASE_URL` is read at runtime by
   `api/config.js`, not hardcoded in a committed file — see the main
   README.)

That's it — MRdrive now talks to this Vercel address instead of hitting
Supabase directly, and the proxy talks to Supabase in the background. Login,
file upload, download, public links — everything goes through the proxy
(signed URLs are generated from SUPABASE_URL too, so they use the proxy
address as well).

## Notes

- This only proxies auth/rest/storage (plain HTTP) requests.
  MRdrive doesn't use realtime (websockets), so that's enough.
- `SUPABASE_ANON_KEY` is still public — security is enforced through Supabase
  RLS, the proxy doesn't change that.
- If Vercel domains get blocked too, the same `api/[...path].js` logic can be
  deployed as a Cloudflare Worker — just ask and I'll prepare that version.
