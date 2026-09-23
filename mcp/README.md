# MRdrive MCP

Bu qism Claude (AI) bilan MRdrive orasida fayl almashishga imkon
beradi — xuddi web ilovada login qilib fayl yuklagandek, lekin Claude
orqali "shu faylni MRdrive'ga qo'y" yoki "u faylni menga ber" deb
so'rash orqali.

**Muhim:** bu `service_role` kalit yoki Supabase dashboard'ga kirishni
talab qilmaydi — faqat `config.js`dagi bilan bir xil ochiq `anon key` va
sizning MRdrive ilovasidagi (web sahifada login qilgan) username/parolingiz
ishlatiladi. Xavfsizlik xuddi web ilovadagi kabi RLS orqali ta'minlanadi:
Claude faqat sizning o'z fayllaringizni ko'radi/o'zgartiradi.

**Endi bu alohida Vercel loyiha emas** — asosiy MRdrive loyihasining bir
qismi. Ikkalasi bitta deploy, bitta domen ostida ishlaydi:

- `mcp/index.html` → holat sahifasi, `/mcp` manzilida ochiladi
- `api/mcp.js` → haqiqiy MCP server (Claude connector shu manzilga ulanadi): `/api/mcp`
- `api/mcp-info.js` → holat sahifasi uchun yordamchi endpoint: `/api/mcp-info`

## Tool'lar

- **push** — faylni (base64) MRdrive'ga yuklaydi (ixtiyoriy: papkaga) — web ilovada darhol ko'rinadi
- **pull** — fayl uchun ochiq (`?share=...`) link qaytaradi (default: muddatsiz)
- **list** — fayllar ro'yxati (papka, hajm, ochiq/yopiqligi bilan; papka bo'yicha filtrlash mumkin)
- **delete** — faylni butunlay o'chiradi
- **move_file** — faylni boshqa papkaga ko'chiradi / papkadan chiqaradi
- **unpublish** — faylning ochiq linkini bekor qiladi
- **refresh_link** — eski linkni bekor qilib, yangisini yaratadi
- **list_folders** — barcha papkalar ro'yxati
- **create_folder** — yangi papka yaratadi
- **delete_folder** — papkani o'chiradi (fayllar o'chmaydi, "papkasiz"ga o'tadi)

## O'rnatish

### 1. Environment variables qo'shish

Asosiy MRdrive loyihasining Vercel sozlamalarida (Project → Settings →
Environment Variables) — bular allaqachon `SUPABASE_URL` va
`SUPABASE_ANON_KEY` uchun bor bo'lishi kerak; shularga qo'shimcha
kiritilsin:

| Nom | Qiymat |
|---|---|
| `SUPABASE_URL` | (mavjud bo'lsa, o'zgarmaydi) |
| `SUPABASE_ANON_KEY` | (mavjud bo'lsa, o'zgarmaydi) |
| `MRDRIVE_USERNAME` | MRdrive web ilovasida login qiladigan username |
| `MRDRIVE_PASSWORD` | shu username uchun parol |

Qo'shgandan so'ng qayta deploy qiling (`npx vercel --prod`), aks holda
yangi o'zgaruvchilar ishlamaydi.

### 2. MCP URL'ni oling

Deploy tugagach, brauzerda `https://<sizning-domeningiz>/mcp` sahifasini
oching. U:
- MCP URL'ni **avtomatik hisoblab** ko'rsatadi (`/api/mcp`) — qaysi
  domenda turganidan qat'iy nazar (vercel.app, custom domen)
- Environment Variables to'liq kiritilganini tekshiradi (yashil/qizil nuqta)
- Ulangan hisob (`MRDRIVE_USERNAME`) qaysi ekanini ko'rsatadi — **parol
  hech qachon ko'rsatilmaydi/qaytarilmaydi**
- "Nusxalash" tugmasi bilan URL'ni bitta bosishda copy qilasiz

Shu URL'ni (`https://<domen>/api/mcp`) claude.ai → Settings → Connectors
→ "Add custom connector"ga joylashtiring.

Domen bittaligi uchun endi hech qanday alohida deploy, subdomen yoki
rewrite kerak emas — hammasi asosiy loyiha bilan birga deploy bo'ladi.

## Ishlatish

Claude bilan gaplashganda:

> "Shu faylni MRdrive'ga qo'y va linkini ber"
> "MRdrive'da nima bor?"
> "X faylni kompyuterimga tushirib beray, linkini ber"
> "Y faylni MRdrive'dan o'chir"

Kompyuterga tushirish uchun (agar `cmc`/terminal connector ham ulangan
bo'lsa), Claude olgan linkni to'g'ridan-to'g'ri ishlatadi:

```bash
curl -o fayl.zip "<pull tool qaytargan link>"
```

## Eslatma

- Har bir tool chaqiruvida server sizning nomingizdan qayta login qiladi
  (xuddi brauzerda "Login" tugmasini bosgandek) — bu bir necha yuz
  millisekund qo'shimcha vaqt oladi, lekin xavfsizlik jihatidan eng
  soddasi: alohida "service" hisob yoki maxfiy administrator kaliti
  kerak emas.
- Agar MRdrive parolingizni almashtirsangiz, shu ikkita environment
  variable'ni ham Vercel'da yangilashni unutmang.
