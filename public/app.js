const $ = (id) => document.getElementById(id);

const state = {
  accountId: localStorage.getItem("hub_accountId") || "",
  adminKey: localStorage.getItem("hub_adminKey") || "",
  mcpKey: localStorage.getItem("hub_mcpKey") || "",
  account: null,
};

function toast(text, type = "") {
  const el = $("toast");
  el.className = `toast ${type}`;
  el.textContent = text;
}

function saveKeys() {
  localStorage.setItem("hub_accountId", state.accountId);
  localStorage.setItem("hub_adminKey", state.adminKey);
  localStorage.setItem("hub_mcpKey", state.mcpKey);
}

function mcpUrl() {
  if (!state.accountId || !state.mcpKey) return "";
  return `${location.origin}/mcp/${state.accountId}?k=${state.mcpKey}`;
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (state.adminKey) headers.Authorization = `Bearer ${state.adminKey}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Xato ${res.status}`);
  return data;
}

function renderAuth() {
  $("auth").hidden = false;
  $("dashboard").hidden = true;
  $("top-actions").innerHTML = "";
  $("auth").innerHTML = `
    <div class="grid">
      <div>
        <h3 style="margin-top:0">Yangi hisob</h3>
        <p class="hint">Bir marta ochiladi. Kalitlarni saqlab qo‘ying.</p>
        <button id="create">Hisob ochish</button>
      </div>
      <div>
        <h3 style="margin-top:0">Mavjud hisob</h3>
        <label>Account ID</label>
        <input id="login-id" value="${state.accountId}" />
        <label>Admin kalit</label>
        <input id="login-key" value="${state.adminKey}" />
        <div class="row" style="margin-top:12px">
          <button class="secondary" id="login">Kirish</button>
          <button class="ghost" id="import-btn">Import</button>
        </div>
        <input id="import-file" type="file" accept="application/json" hidden />
      </div>
    </div>
  `;
  $("create").onclick = createAccount;
  $("login").onclick = () => {
    state.accountId = $("login-id").value.trim();
    state.adminKey = $("login-key").value.trim();
    saveKeys();
    loadAccount();
  };
  $("import-btn").onclick = () => $("import-file").click();
  $("import-file").onchange = importFile;
}

function renderDash() {
  $("auth").hidden = true;
  $("dashboard").hidden = false;
  $("top-actions").innerHTML = `
    <button class="ghost" id="reload">Yangilash</button>
    <button class="secondary" id="export">Eksport</button>
    <button class="secondary" id="logout">Chiqish</button>
  `;
  $("reload").onclick = loadAccount;
  $("export").onclick = exportAccount;
  $("logout").onclick = () => {
    state.account = null;
    renderAuth();
  };

  const url = mcpUrl();
  const connectors = state.account.connectors || [];
  $("dashboard").innerHTML = `
    <section class="card">
      <div class="kicker">Claude ga shu URL</div>
      <div class="urlbox" style="margin-top:10px">
        <input id="mcp-url" readonly value="${url}" />
        <button id="copy">Nusxa</button>
      </div>
      <div class="keys">
        <div>Account ID: ${state.accountId}</div>
        <div>Storage: ${state.account.storage}</div>
      </div>
      <p class="hint">Bu manzil o‘zgarmaydi. Pastdan yangi MCP qo‘shasiz.</p>
    </section>

    <section class="card">
      <h3 style="margin-top:0">Yangi connector</h3>
      <div class="grid">
        <div>
          <label>Nomi</label>
          <input id="c-name" placeholder="LifeMR" />
        </div>
        <div>
          <label>Prefix</label>
          <input id="c-prefix" placeholder="lifemr" />
        </div>
      </div>
      <label>MCP URL</label>
      <input id="c-url" placeholder="https://example.com/api/mcp" />
      <div class="grid">
        <div>
          <label>Header nomi (ixtiyoriy)</label>
          <input id="c-h" placeholder="Authorization" />
        </div>
        <div>
          <label>Header qiymati (ixtiyoriy)</label>
          <input id="c-v" placeholder="Bearer ..." />
        </div>
      </div>
      <div class="row" style="margin-top:14px">
        <button class="ok" id="add">Qo‘shish</button>
      </div>
    </section>

    <section class="card">
      <h3 style="margin-top:0">Connectorlar (${connectors.length})</h3>
      <div class="list" id="list"></div>
    </section>
  `;

  $("copy").onclick = async () => {
    await navigator.clipboard.writeText(url);
    toast("URL nusxalandi", "ok");
  };
  $("add").onclick = addConnector;

  const list = $("list");
  if (!connectors.length) {
    list.innerHTML = `<p class="empty">Hali connector yo‘q. Avval HTTP MCP URL qo‘shing.</p>`;
    return;
  }
  list.innerHTML = connectors
    .map(
      (c) => `
      <article class="item" data-id="${c.id}">
        <div class="row">
          <h3>${escapeHtml(c.name)}</h3>
          <span class="badge ${c.enabled === false ? "off" : "on"}">${c.enabled === false ? "o‘chiq" : "yoqilgan"}</span>
          <code>${escapeHtml(c.prefix)}__</code>
        </div>
        <p class="hint" style="word-break:break-all">${escapeHtml(c.url)}</p>
        <div class="row">
          <button class="ghost" data-act="test">Sinash</button>
          <button class="secondary" data-act="toggle">${c.enabled === false ? "Yoqish" : "O‘chirish"}</button>
          <button class="danger" data-act="del">O‘chirish</button>
        </div>
        <div class="hint result"></div>
      </article>`
    )
    .join("");

  list.querySelectorAll(".item").forEach((el) => {
    const id = el.dataset.id;
    const connector = connectors.find((x) => x.id === id);
    el.onclick = async (ev) => {
      const act = ev.target.dataset.act;
      if (!act) return;
      const box = el.querySelector(".result");
      if (act === "test") {
        box.textContent = "Tekshirilmoqda...";
        const res = await api(`/api/account/${state.accountId}/connectors/${id}/test`, { method: "POST" });
        box.textContent = res.ok
          ? `OK · ${res.count} tool: ${(res.tools || []).slice(0, 8).join(", ")}`
          : `Xato: ${res.error}`;
      }
      if (act === "toggle") {
        await api(`/api/account/${state.accountId}/connectors/${id}`, {
          method: "PUT",
          body: JSON.stringify({ ...connector, enabled: connector.enabled === false }),
        });
        await loadAccount();
      }
      if (act === "del") {
        if (!confirm("O‘chirilsinmi?")) return;
        await api(`/api/account/${state.accountId}/connectors/${id}`, { method: "DELETE" });
        await loadAccount();
      }
    };
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function createAccount() {
  try {
    const data = await api("/api/account", { method: "POST" });
    state.accountId = data.accountId;
    state.adminKey = data.adminKey;
    state.mcpKey = data.mcpKey;
    saveKeys();
    toast("Hisob ochildi. Kalitlar brauzerda saqlanadi.", "ok");
    await loadAccount();
  } catch (err) {
    toast(err.message, "err");
  }
}

async function loadAccount() {
  if (!state.accountId || !state.adminKey) {
    renderAuth();
    return;
  }
  try {
    const account = await api(`/api/account/${state.accountId}`);
    state.account = account;
    state.mcpKey = account.mcpKey;
    saveKeys();
    renderDash();
  } catch (err) {
    toast(err.message, "err");
    renderAuth();
  }
}

async function addConnector() {
  try {
    await api(`/api/account/${state.accountId}/connectors`, {
      method: "POST",
      body: JSON.stringify({
        name: $("c-name").value,
        prefix: $("c-prefix").value,
        url: $("c-url").value,
        authHeader: $("c-h").value,
        authValue: $("c-v").value,
      }),
    });
    $("c-name").value = "";
    $("c-prefix").value = "";
    $("c-url").value = "";
    $("c-h").value = "";
    $("c-v").value = "";
    toast("Connector qo‘shildi", "ok");
    await loadAccount();
  } catch (err) {
    toast(err.message, "err");
  }
}

async function exportAccount() {
  const data = await api(`/api/account/${state.accountId}/export`);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `mcp-hub-${state.accountId}.json`;
  a.click();
}

async function importFile(ev) {
  const file = ev.target.files?.[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    await api("/api/account/import", { method: "POST", body: JSON.stringify(payload) });
    state.accountId = payload.accountId;
    state.adminKey = payload.adminKey;
    state.mcpKey = payload.mcpKey;
    saveKeys();
    toast("Import qilindi", "ok");
    await loadAccount();
  } catch (err) {
    toast(err.message, "err");
  }
}

loadAccount();
