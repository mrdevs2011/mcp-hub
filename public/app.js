const $ = (id) => document.getElementById(id);

const state = {
  accountId: localStorage.getItem("hub_accountId") || "",
  password: localStorage.getItem("hub_password") || "",
  mcpKey: localStorage.getItem("hub_mcpKey") || "",
  username: localStorage.getItem("hub_username") || "",
  account: null,
};

let toastTimer;
function toast(text, type = "") {
  const el = $("toast");
  el.textContent = text;
  el.className = "toast-wrap show" + (type ? " " + type : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = "toast-wrap"; }, 3200);
}

function saveSession() {
  localStorage.setItem("hub_accountId", state.accountId);
  localStorage.setItem("hub_password", state.password);
  localStorage.setItem("hub_mcpKey", state.mcpKey);
  localStorage.setItem("hub_username", state.username);
}

function clearSession() {
  ["hub_accountId","hub_password","hub_mcpKey","hub_username"].forEach(k => localStorage.removeItem(k));
}

function mcpUrl() {
  if (!state.accountId || !state.mcpKey) return "";
  return `${location.origin}/mcp/${state.accountId}?k=${state.mcpKey}`;
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Xato ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function authApi(path, options = {}) {
  let body = {};
  if (options.body) { try { body = JSON.parse(options.body); } catch {} }
  body._password = state.password;
  body.password = state.password;
  const headers = { ...(options.headers || {}) };
  if (state.password) {
    headers.Authorization = `Bearer ${state.password}`;
  }
  return api(path, { ...options, headers, body: JSON.stringify(body) });
}

function renderTopActions() {
  $("top-actions").innerHTML = `
    <span class="user-badge">@${state.username}</span>
    <button class="ghost" id="logout" style="padding:6px 14px;font-size:13px">Chiqish</button>
  `;
  $("logout").onclick = () => {
    state.account = null; state.password = ""; state.accountId = "";
    state.username = ""; state.mcpKey = "";
    clearSession();
    $("top-actions").innerHTML = "";
    renderAuth();
  };
}

function renderAuth() {
  $("auth").hidden = false;
  $("dashboard").hidden = true;
  $("auth").innerHTML = `
    <div class="auth-grid">
      <div class="card">
        <div class="card-title">Yangi hisob</div>
        <label>Username</label>
        <input id="reg-user" placeholder="ali_dev" autocomplete="username" />
        <label>Parol</label>
        <input id="reg-pass" type="password" placeholder="••••••••" autocomplete="new-password" />
        <div style="margin-top:20px">
          <button class="primary" id="create" style="width:100%">Ro'yxatdan o'tish</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Kirish</div>
        <label>Username</label>
        <input id="login-user" value="${state.username}" autocomplete="username" />
        <label>Parol</label>
        <input id="login-pass" type="password" value="${state.password}" autocomplete="current-password" />
        <div style="margin-top:20px">
          <button class="ok" id="login" style="width:100%">Kirish →</button>
        </div>
      </div>
    </div>
  `;
  $("create").onclick = registerAccount;
  $("login").onclick = doLogin;
  ["login-user","login-pass"].forEach(id => {
    $(id).addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
  });
  ["reg-user","reg-pass"].forEach(id => {
    $(id).addEventListener("keydown", e => { if (e.key === "Enter") registerAccount(); });
  });
}

function renderDash() {
  $("auth").hidden = true;
  $("dashboard").hidden = false;
  renderTopActions();

  const url = mcpUrl();
  const connectors = state.account.connectors || [];

  $("dashboard").innerHTML = `
    <div class="card">
      <div class="card-title">Claude MCP URL</div>
      <div class="urlbox">
        <input id="mcp-url" readonly value="${url}" />
        <button id="copy-url">Nusxa</button>
      </div>
      <div class="meta-row">
        <span class="meta-item">storage: <span class="val">${state.account.storage}</span></span>
        <span class="meta-item">connectors: <span class="val">${connectors.length}</span></span>
      </div>
      <p class="hint">Bu URL o'zgarmaydi — Claude ga bir marta qo'shasiz.</p>
    </div>

    <div class="card section-gap">
      <div class="card-title">Connector qo'shish</div>
      <div class="grid-2">
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
      <div class="grid-2" style="margin-top:0">
        <div>
          <label>Auth header (ixtiyoriy)</label>
          <input id="c-h" placeholder="Authorization" />
        </div>
        <div>
          <label>Header qiymati (ixtiyoriy)</label>
          <input id="c-v" placeholder="Bearer ..." />
        </div>
      </div>
      <div style="margin-top:18px">
        <button class="ok" id="add-btn">+ Qo'shish</button>
      </div>
    </div>

    <div class="card section-gap">
      <div class="card-title">Connectorlar</div>
      <div class="connector-list" id="conn-list">
        ${connectors.length === 0
          ? `<div class="empty-state">// hali connector yo'q</div>`
          : connectors.map(c => connectorHtml(c)).join("")}
      </div>
    </div>
  `;

  $("copy-url").onclick = async () => {
    await navigator.clipboard.writeText(url);
    toast("URL nusxalandi", "ok");
  };
  $("add-btn").onclick = addConnector;

  document.querySelectorAll(".connector-item").forEach(el => {
    const id = el.dataset.id;
    const connector = connectors.find(x => x.id === id);
    el.querySelector("[data-act=test]").onclick = () => testConnector(el, id);
    el.querySelector("[data-act=tools]").onclick = () => openToolsEditor(connector);
    el.querySelector("[data-act=edit]").onclick = () => openConnectorEditor(connector);
    el.querySelector("[data-act=toggle]").onclick = () => toggleConnector(connector);
    el.querySelector("[data-act=del]").onclick = () => deleteConnector(id);
  });
}

function connectorHtml(c) {
  return `
    <div class="connector-item" data-id="${c.id}">
      <div class="connector-header">
        <span class="connector-name">${escapeHtml(c.name)}</span>
        <span class="badge ${c.enabled === false ? 'off' : 'on'}">${c.enabled === false ? 'off' : 'on'}</span>
        <span class="prefix-tag">${escapeHtml(c.prefix)}__</span>
      </div>
      <div class="connector-url">${escapeHtml(c.url)}</div>
      <div class="connector-actions">
        <button class="ghost" data-act="test" style="font-size:12px;padding:6px 12px">Test</button>
        <button class="secondary" data-act="tools" style="font-size:12px;padding:6px 12px">Toollar</button>
        <button class="secondary" data-act="edit" style="font-size:12px;padding:6px 12px">Tahrirlash</button>
        <button class="secondary" data-act="toggle" style="font-size:12px;padding:6px 12px">${c.enabled === false ? 'Yoqish' : "O'chirish"}</button>
        <button class="danger" data-act="del" style="font-size:12px;padding:6px 12px">O'chirish</button>
      </div>
      <div class="connector-result" id="res-${c.id}"></div>
    </div>`;
}

function escapeHtml(v) {
  return String(v || "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

async function testConnector(el, id) {
  const res = $(`res-${id}`);
  res.className = "connector-result visible";
  res.textContent = "// tekshirilmoqda...";
  try {
    const data = await authApi(`/api/account/${state.accountId}/connectors/${id}/test`, { method: "POST", body: "{}" });
    res.className = "connector-result visible";
    res.textContent = data.ok
      ? `// OK · ${data.count} tool: ${(data.tools||[]).slice(0,6).join(", ")}`
      : `// xato: ${data.error}`;
    if (!data.ok) res.classList.add("err");
  } catch(err) {
    res.className = "connector-result visible err";
    res.textContent = `// ${err.message}`;
  }
}

async function toggleConnector(connector) {
  await authApi(`/api/account/${state.accountId}/connectors/${connector.id}`, {
    method: "PUT",
    body: JSON.stringify({ ...connector, enabled: connector.enabled === false }),
  });
  await loadAccount();
}

async function deleteConnector(id) {
  if (!confirm("O'chirilsinmi?")) return;
  await authApi(`/api/account/${state.accountId}/connectors/${id}`, { method: "DELETE", body: "{}" });
  toast("Connector o'chirildi", "ok");
  await loadAccount();
}

async function registerAccount() {
  const username = $("reg-user").value.trim();
  const password = $("reg-pass").value;
  if (!username || !password) { toast("Username va parol kiriting", "err"); return; }
  try {
    const data = await api("/api/register", { method: "POST", body: JSON.stringify({ username, password }) });
    state.accountId = data.accountId;
    state.password = password;
    state.mcpKey = data.mcpKey;
    state.username = data.username;
    saveSession();
    toast("Hisob ochildi!", "ok");
    await loadAccount();
  } catch(err) { toast(err.message, "err"); }
}

async function doLogin() {
  const username = $("login-user").value.trim();
  const password = $("login-pass").value;
  if (!username || !password) { toast("Username va parol kiriting", "err"); return; }
  try {
    const data = await api("/api/login", { method: "POST", body: JSON.stringify({ username, password }) });
    state.accountId = data.accountId;
    state.password = password;
    state.mcpKey = data.mcpKey;
    state.username = data.username;
    saveSession();
    state.account = data;
    renderDash();
  } catch(err) { toast(err.message, "err"); }
}

async function loadAccount() {
  if (!state.accountId || !state.password) { renderAuth(); return; }
  try {
    const account = await authApi(`/api/account/${state.accountId}`, { method: "POST", body: "{}" });
    state.account = account;
    state.mcpKey = account.mcpKey;
    state.username = account.username;
    saveSession();
    renderDash();
  } catch (err) {
    // Faqat aniq auth xatolarida logout (401), boshqa xatolarda toast ko'rsatib saqlab qolamiz
    if (err.status === 401 || /parol|hisob topilmadi|noto'g'ri/i.test(err.message || "")) {
      state.account = null;
      renderAuth();
    } else {
      toast(err.message || "Yuklashda xato", "err");
      // Avvalgi sessiya bo'lsa dashboardni ko'rsatishga urinish
      if (state.account) renderDash();
      else renderAuth();
    }
  }
}

async function addConnector() {
  const name = $("c-name").value.trim();
  const url = $("c-url").value.trim();
  if (!name || !url) { toast("Nom va URL kerak", "err"); return; }
  try {
    await authApi(`/api/account/${state.accountId}/connectors`, {
      method: "POST",
      body: JSON.stringify({
        name,
        prefix: $("c-prefix").value.trim(),
        url,
        authHeader: $("c-h").value.trim(),
        authValue: $("c-v").value.trim(),
      }),
    });
    $("c-name").value = ""; $("c-prefix").value = "";
    $("c-url").value = ""; $("c-h").value = ""; $("c-v").value = "";
    toast("Connector qo'shildi", "ok");
    await loadAccount();
  } catch(err) { toast(err.message, "err"); }
}


/* ---------- Modal ---------- */
function openModal(title, bodyHtml) {
  closeModal();
  const wrap = document.createElement("div");
  wrap.className = "modal-backdrop";
  wrap.id = "modal";
  wrap.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head">
        <div class="modal-title">${escapeHtml(title)}</div>
        <button class="ghost modal-close" data-act="close" style="font-size:12px;padding:6px 12px">Yopish</button>
      </div>
      <div class="modal-body" id="modal-body">${bodyHtml}</div>
    </div>`;
  wrap.addEventListener("mousedown", (e) => { if (e.target === wrap) closeModal(); });
  wrap.querySelector("[data-act=close]").onclick = closeModal;
  document.body.appendChild(wrap);
  document.body.classList.add("modal-open");
  return wrap;
}

function closeModal() {
  const m = $("modal");
  if (m) m.remove();
  document.body.classList.remove("modal-open");
}

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

/* ---------- Connectorni to'liq tahrirlash ---------- */
function openConnectorEditor(c) {
  const m = openModal(`Tahrirlash — ${c.name}`, `
    <div class="grid-2">
      <div><label>Nomi</label><input id="e-name" value="${escapeHtml(c.name)}" /></div>
      <div><label>Prefix</label><input id="e-prefix" value="${escapeHtml(c.prefix)}" /></div>
    </div>
    <label>MCP URL</label>
    <input id="e-url" value="${escapeHtml(c.url)}" />
    <div class="grid-2" style="margin-top:0">
      <div><label>Auth header</label><input id="e-h" value="${escapeHtml(c.authHeader || "")}" placeholder="Authorization" /></div>
      <div><label>Header qiymati</label><input id="e-v" value="${escapeHtml(c.authValue || "")}" placeholder="Bearer ..." /></div>
    </div>
    <label class="check-row"><input type="checkbox" id="e-enabled" ${c.enabled === false ? "" : "checked"} /> Yoqilgan</label>
    <p class="hint">Prefix o'zgarsa, tool nomlari ham o'zgaradi (prefix__tool) — Claude'da connectorni qayta yuklash kerak bo'lishi mumkin.</p>
    <div style="margin-top:14px;display:flex;gap:10px">
      <button class="ok" id="e-save">Saqlash</button>
      <button class="ghost" data-act="cancel">Bekor qilish</button>
    </div>`);
  m.querySelector("[data-act=cancel]").onclick = closeModal;
  $("e-save").onclick = async () => {
    try {
      await authApi(`/api/account/${state.accountId}/connectors/${c.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: $("e-name").value.trim(),
          prefix: $("e-prefix").value.trim(),
          url: $("e-url").value.trim(),
          authHeader: $("e-h").value.trim(),
          authValue: $("e-v").value.trim(),
          enabled: $("e-enabled").checked,
        }),
      });
      closeModal();
      toast("Connector saqlandi", "ok");
      await loadAccount();
    } catch (err) { toast(err.message, "err"); }
  };
}

/* ---------- Har bir tool'ni tahrirlash ---------- */
async function openToolsEditor(c) {
  openModal(`Toollar — ${c.name}`, `<div class="empty-state">// toollar yuklanmoqda...</div>`);
  let data;
  try {
    data = await authApi(`/api/account/${state.accountId}/connectors/${c.id}/tools`, { method: "POST", body: "{}" });
  } catch (err) {
    $("modal-body").innerHTML = `<div class="connector-result visible err">// ${escapeHtml(err.message)}</div>`;
    return;
  }
  if (!data.ok) {
    $("modal-body").innerHTML = `<div class="connector-result visible err">// xato: ${escapeHtml(data.error)}</div>`;
    return;
  }
  const tools = data.tools || [];
  $("modal-body").innerHTML = `
    <p class="hint" style="margin-top:0">Har bir tool'ning nomi, tavsifi, input schema'si va yoqilgan/o'chirilganligini o'zgartirish mumkin. Bo'sh qoldirilgan maydon = asl qiymat.</p>
    <div class="tool-list">${tools.map((t, i) => toolEditorHtml(t, i, data.prefix)).join("") || `<div class="empty-state">// tool topilmadi</div>`}</div>`;
  tools.forEach((t, i) => wireToolEditor(c, t, i));
}

function toolEditorHtml(t, i, prefix) {
  const ov = t.override || {};
  const changed = Object.keys(ov).length > 0;
  const schemaText = JSON.stringify(ov.inputSchema || t.inputSchema || { type: "object", properties: {} }, null, 2);
  return `
    <div class="tool-item" id="tool-${i}">
      <div class="tool-head">
        <span class="tool-orig">${escapeHtml(t.name)}</span>
        <span class="prefix-tag" id="tool-exposed-${i}">${escapeHtml(t.exposedName || (prefix + "__" + t.name))}</span>
        ${changed ? `<span class="badge on">o'zgartirilgan</span>` : ""}
        ${ov.enabled === false ? `<span class="badge off">o'chiq</span>` : ""}
      </div>
      <label class="check-row"><input type="checkbox" id="t-en-${i}" ${ov.enabled === false ? "" : "checked"} /> Claude'ga ko'rsatilsin</label>
      <label>Nomi</label>
      <input id="t-name-${i}" value="${escapeHtml(ov.name || "")}" placeholder="${escapeHtml(t.name)}" />
      <label>Tavsif</label>
      <textarea id="t-desc-${i}" rows="3" placeholder="${escapeHtml(t.description)}">${escapeHtml(ov.description || "")}</textarea>
      <label>Input schema (JSON)</label>
      <textarea id="t-schema-${i}" class="mono" rows="7" spellcheck="false">${escapeHtml(schemaText)}</textarea>
      <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="ok" id="t-save-${i}" style="font-size:12px;padding:6px 14px">Saqlash</button>
        <button class="ghost" id="t-reset-${i}" style="font-size:12px;padding:6px 14px">Asl holiga</button>
      </div>
    </div>`;
}

function wireToolEditor(c, t, i) {
  const origSchema = JSON.stringify(t.inputSchema || { type: "object", properties: {} });
  $(`t-save-${i}`).onclick = async () => {
    const override = {};
    const name = $(`t-name-${i}`).value.trim();
    const description = $(`t-desc-${i}`).value.trim();
    if (name && name !== t.name) override.name = name;
    if (description && description !== (t.description || "").trim()) override.description = description;
    const schemaRaw = $(`t-schema-${i}`).value.trim();
    if (schemaRaw) {
      let parsed;
      try { parsed = JSON.parse(schemaRaw); }
      catch { toast("Input schema to'g'ri JSON emas", "err"); return; }
      if (JSON.stringify(parsed) !== origSchema) override.inputSchema = parsed;
    }
    if (!$(`t-en-${i}`).checked) override.enabled = false;
    try {
      await authApi(`/api/account/${state.accountId}/connectors/${c.id}/tools`, {
        method: "PUT",
        body: JSON.stringify({ tool: t.name, override }),
      });
      toast("Tool saqlandi", "ok");
      await openToolsEditor(c);
    } catch (err) { toast(err.message, "err"); }
  };
  $(`t-reset-${i}`).onclick = async () => {
    try {
      await authApi(`/api/account/${state.accountId}/connectors/${c.id}/tools`, {
        method: "DELETE",
        body: JSON.stringify({ tool: t.name }),
      });
      toast("Asl holiga qaytarildi", "ok");
      await openToolsEditor(c);
    } catch (err) { toast(err.message, "err"); }
  };
}

loadAccount();
