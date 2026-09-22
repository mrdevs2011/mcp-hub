# MCP Hub

Claude Free dagi 1 ta custom connector slotiga bitta barqaror URL berasiz.
Hub orqada bir nechta MCP serverni yig‘adi. Yangi connector qo‘shilsa URL o‘zgarmaydi.

## Lokal

```bash
cd mcp-hub
node server.mjs
```

Ochiladi: http://localhost:8787

## Render (kartasiz)

1. Loyihani GitHub ga qo‘ying
2. render.com ga GitHub bilan kiring
3. New + → Web Service → shu repo
4. Start command: `node server.mjs`
5. Instance: Free
6. Health check path: `/api/health`

Free tarif 15 daqiqa tinchlikdan keyin uxlaydi. Uyqudan keyin lokal fayl yo‘qolishi mumkin.
Hisobni yo‘qotmaslik uchun paneldan **Eksport** qiling.

## Panel

1. Hisob ochish
2. Chiqqan URL ni Claude → Customize → Connectors → Add custom connector
3. Panelga MCP URL larini qo‘shing, Sinash bosing
4. Tool nomlari `prefix__tool` ko‘rinishida

Claude ga qo‘yiladigan manzil:

```
https://SIZNING-DOMEN/mcp/ACCOUNT_ID?k=MCP_KEY
```
