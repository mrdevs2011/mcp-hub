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
function openModal(title, bodyHtml, extraClass = "") {
  closeModal();
  const wrap = document.createElement("div");
  wrap.className = "modal-backdrop";
  wrap.id = "modal";
  wrap.innerHTML = `
    <div class="modal ${extraClass}" role="dialog" aria-modal="true">
      <div class="modal-head">
        <div class="modal-title">${title}</div>
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
  const m = openModal(`Tahrirlash — ${escapeHtml(c.name)}`, `
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

/* ---------- Har bir tool'ni ko'rish, tahrirlash va boshqarish ---------- */
let cToolsState = null;

async function openToolsEditor(c) {
  openModal(`Toollar — ${escapeHtml(c.name)}`, `<div class="empty-state">// toollar yuklanmoqda...</div>`, "modal-lg");
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

  cToolsState = {
    connector: c,
    prefix: data.prefix || c.prefix,
    tools: data.tools || [],
    warning: data.warning || null,
    filter: "all",
    search: "",
  };

  renderToolsView();
}

function renderToolsView() {
  if (!cToolsState) return;
  const { connector, prefix, tools, warning, filter, search } = cToolsState;

  const total = tools.length;
  const active = tools.filter(t => (t.override ? t.override.enabled !== false : true)).length;
  const disabled = total - active;
  const changed = tools.filter(t => t.override && Object.keys(t.override).length > 0).length;
  const custom = tools.filter(t => t.isCustom).length;

  // Filter tools
  const q = search.trim().toLowerCase();
  const filtered = tools.filter(t => {
    const ov = t.override || {};
    if (filter === "active" && ov.enabled === false) return false;
    if (filter === "disabled" && ov.enabled !== false) return false;
    if (filter === "changed" && (!ov || Object.keys(ov).length === 0)) return false;
    if (filter === "custom" && !t.isCustom) return false;
    if (q) {
      const matchName = t.name.toLowerCase().includes(q);
      const matchExp = (t.exposedName || "").toLowerCase().includes(q);
      const matchDesc = (ov.description || t.description || "").toLowerCase().includes(q);
      if (!matchName && !matchExp && !matchDesc) return false;
    }
    return true;
  });

  const body = $("modal-body");
  if (!body) return;

  body.innerHTML = `
    ${warning ? `
      <div class="connector-result visible err" style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px">
        <span>⚠️ Server bilan aloqa: ${escapeHtml(warning)}. Saqlangan toollar ko'rsatilmoqda.</span>
        <button class="ghost" id="tools-retry" style="font-size:11px;padding:3px 8px">Qayta urinish</button>
      </div>` : ""}

    <div class="toolbar-row">
      <div class="filter-pills">
        <button class="pill-btn ${filter === 'all' ? 'active' : ''}" data-filter="all">Barchasi (${total})</button>
        <button class="pill-btn ${filter === 'active' ? 'active' : ''}" data-filter="active">Faol (${active})</button>
        <button class="pill-btn ${filter === 'disabled' ? 'active' : ''}" data-filter="disabled">O'chiq (${disabled})</button>
        <button class="pill-btn ${filter === 'changed' ? 'active' : ''}" data-filter="changed">O'zgartirilgan (${changed})</button>
        ${custom > 0 ? `<button class="pill-btn ${filter === 'custom' ? 'active' : ''}" data-filter="custom">Maxsus (${custom})</button>` : ""}
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="search-input" id="tools-search" placeholder="Qidirish... (nomi, tavsifi)" value="${escapeHtml(search)}" />
        <button class="ok" id="btn-add-tool" style="font-size:12px;padding:6px 12px;white-space:nowrap">+ Yangi tool</button>
        <button class="ghost" id="btn-refresh-tools" style="font-size:12px;padding:6px 10px" title="Qayta yuklash">↻</button>
      </div>
    </div>

    <div class="tool-list">
      ${filtered.length === 0
        ? `<div class="empty-state">// Birorta ham tool topilmadi</div>`
        : filtered.map(t => toolCardHtml(t, prefix)).join("")
      }
    </div>
  `;

  // Bind controls
  const searchInput = $("tools-search");
  if (searchInput) {
    searchInput.oninput = (e) => {
      cToolsState.search = e.target.value;
      renderToolsView();
      const nextInput = $("tools-search");
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
      }
    };
  }

  body.querySelectorAll("[data-filter]").forEach(btn => {
    btn.onclick = () => {
      cToolsState.filter = btn.dataset.filter;
      renderToolsView();
    };
  });

  const retryBtn = $("tools-retry");
  if (retryBtn) retryBtn.onclick = () => openToolsEditor(connector);

  const refreshBtn = $("btn-refresh-tools");
  if (refreshBtn) refreshBtn.onclick = () => openToolsEditor(connector);

  const addBtn = $("btn-add-tool");
  if (addBtn) addBtn.onclick = () => openSingleToolEditor(connector, null, true);

  // Tool card actions
  body.querySelectorAll("[data-act=edit-tool]").forEach(btn => {
    btn.onclick = () => {
      const tool = tools.find(x => x.name === btn.dataset.name);
      if (tool) openSingleToolEditor(connector, tool, false);
    };
  });

  body.querySelectorAll("[data-act=test-tool]").forEach(btn => {
    btn.onclick = () => {
      const tool = tools.find(x => x.name === btn.dataset.name);
      if (tool) openToolTester(connector, tool);
    };
  });

  body.querySelectorAll("[data-act=toggle-tool]").forEach(btn => {
    btn.onclick = async () => {
      const tool = tools.find(x => x.name === btn.dataset.name);
      if (!tool) return;
      const ov = { ...(tool.override || {}) };
      const currentlyEnabled = ov.enabled !== false;
      ov.enabled = !currentlyEnabled;
      try {
        await authApi(`/api/account/${state.accountId}/connectors/${connector.id}/tools`, {
          method: "PUT",
          body: JSON.stringify({ tool: tool.name, override: ov }),
        });
        toast(ov.enabled ? "Tool yoqildi" : "Tool o'chirildi", "ok");
        await reloadToolsData(connector);
      } catch (err) { toast(err.message, "err"); }
    };
  });

  body.querySelectorAll("[data-act=reset-tool]").forEach(btn => {
    btn.onclick = async () => {
      const name = btn.dataset.name;
      try {
        await authApi(`/api/account/${state.accountId}/connectors/${connector.id}/tools`, {
          method: "DELETE",
          body: JSON.stringify({ tool: name }),
        });
        toast("Asl holiga qaytarildi", "ok");
        await reloadToolsData(connector);
      } catch (err) { toast(err.message, "err"); }
    };
  });

  body.querySelectorAll("[data-act=del-tool]").forEach(btn => {
    btn.onclick = async () => {
      const name = btn.dataset.name;
      if (!confirm(`"${name}" nomli maxsus toolni o'chirishni tasdiqlaysizmi?`)) return;
      try {
        await authApi(`/api/account/${state.accountId}/connectors/${connector.id}/tools`, {
          method: "DELETE",
          body: JSON.stringify({ tool: name }),
        });
        toast("Tool o'chirildi", "ok");
        await reloadToolsData(connector);
      } catch (err) { toast(err.message, "err"); }
    };
  });
}

async function reloadToolsData(c) {
  try {
    const data = await authApi(`/api/account/${state.accountId}/connectors/${c.id}/tools`, { method: "POST", body: "{}" });
    if (data.ok && cToolsState) {
      cToolsState.tools = data.tools || [];
      cToolsState.warning = data.warning || null;
      renderToolsView();
    }
  } catch (err) { toast(err.message, "err"); }
}

function toolCardHtml(t, prefix) {
  const ov = t.override || {};
  const isEnabled = ov.enabled !== false;
  const isChanged = ov && Object.keys(ov).length > 0;
  const isExact = Boolean(ov.exactName);
  const expName = t.exposedName || (isExact && ov.name ? ov.name : (prefix + "__" + (ov.name || t.name)));
  const desc = ov.description !== undefined ? ov.description : (t.description || "");
  const schema = ov.inputSchema || t.inputSchema || {};
  const props = (schema.properties && typeof schema.properties === "object") ? schema.properties : {};
  const reqList = Array.isArray(schema.required) ? schema.required : [];
  const propKeys = Object.keys(props);

  return `
    <div class="tool-card" id="tool-row-${escapeHtml(t.name)}">
      <div class="tool-card-top">
        <div class="tool-titles">
          <span class="tool-exposed-name">${escapeHtml(expName)}</span>
          ${t.name !== (ov.name || t.name) ? `<span class="prefix-tag" title="Backend tool nomi">asl: ${escapeHtml(t.name)}</span>` : ""}
          <span class="badge ${isEnabled ? 'on' : 'off'}">${isEnabled ? 'faol' : "o'chiq"}</span>
          ${isChanged ? `<span class="badge on">o'zgartirilgan</span>` : ""}
          ${t.isCustom ? `<span class="badge custom">maxsus</span>` : ""}
          ${isExact ? `<span class="badge exact">prefikssiz</span>` : ""}
          ${ov.readOnly ? `<span class="badge readonly">read-only</span>` : ""}
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <button class="primary" data-act="edit-tool" data-name="${escapeHtml(t.name)}" style="font-size:12px;padding:5px 12px">Tahrirlash ✏️</button>
          <button class="ghost" data-act="test-tool" data-name="${escapeHtml(t.name)}" style="font-size:12px;padding:5px 10px">Sinash ▶</button>
          <button class="secondary" data-act="toggle-tool" data-name="${escapeHtml(t.name)}" style="font-size:12px;padding:5px 10px">${isEnabled ? "O'chirish" : "Yoqish"}</button>
          ${isChanged && !t.isCustom ? `<button class="ghost" data-act="reset-tool" data-name="${escapeHtml(t.name)}" style="font-size:12px;padding:5px 10px">Asl holiga</button>` : ""}
          ${t.isCustom ? `<button class="danger" data-act="del-tool" data-name="${escapeHtml(t.name)}" style="font-size:12px;padding:5px 10px">O'chirish</button>` : ""}
        </div>
      </div>
      <div class="tool-card-desc">${escapeHtml(desc || "// Tavsif kiritilmagan")}</div>
      <div class="tool-card-params">
        ${propKeys.length === 0
          ? `<span style="opacity:0.6">// parametrlar yo'q</span>`
          : propKeys.map(k => {
              const p = props[k] || {};
              const isReq = reqList.includes(k);
              return `<span class="param-pill ${isReq ? 'req' : ''}">${escapeHtml(k)} (${escapeHtml(p.type || 'any')})${isReq ? '*' : ''}</span>`;
            }).join("")
        }
      </div>
    </div>
  `;
}

/* ---------- Bitta tool uchun TO'LIQ tahrirlash oynasi ---------- */
function openSingleToolEditor(c, tool, isNew = false) {
  const origBackendName = tool ? tool.name : "";
  const ov = (tool && tool.override) ? { ...tool.override } : {};
  const currentName = ov.name || (tool ? tool.name : "");
  const exactName = Boolean(ov.exactName);
  const backendName = ov.backendName || "";
  const enabled = ov.enabled !== false;
  const description = ov.description !== undefined ? ov.description : (tool ? tool.description || "" : "");
  const incPrefix = ov.includePrefixInDescription === true;
  const schema = ov.inputSchema || (tool && tool.inputSchema) || { type: "object", properties: {}, required: [] };
  const defaultArgs = ov.defaultArgs ? JSON.stringify(ov.defaultArgs, null, 2) : "";
  const fixedArgs = ov.fixedArgs ? JSON.stringify(ov.fixedArgs, null, 2) : "";
  const timeoutSec = ov.timeoutMs ? Math.round(ov.timeoutMs / 1000) : "";
  const readOnly = Boolean(ov.readOnly);
  const reqConf = Boolean(ov.requiresConfirmation);

  const title = isNew ? `Yangi tool qo'shish — ${escapeHtml(c.name)}` : `Tool tahrirlash — ${escapeHtml(tool.name)}`;

  // Convert schema properties to visual list
  const props = (schema.properties && typeof schema.properties === "object") ? schema.properties : {};
  const reqs = Array.isArray(schema.required) ? schema.required : [];
  let visualParams = Object.keys(props).map(k => ({
    name: k,
    type: props[k]?.type || "string",
    description: props[k]?.description || "",
    required: reqs.includes(k),
  }));

  const m = openModal(title, `
    <!-- Asosiy Identifikatorlar -->
    <div class="card" style="margin-bottom:14px;padding:14px">
      <div class="card-title" style="margin-bottom:10px">1. Tool Nomi va Identifikatorlari</div>
      <div class="grid-2">
        <div>
          <label>${isNew ? "Tool nomi / Kaliti *" : "Claude ko'radigan nom (Alias)"}</label>
          <input id="ed-name" value="${escapeHtml(currentName)}" placeholder="masalan: run_command" />
        </div>
        <div>
          <label>Backend tool nomi ${isNew ? "" : "(agar boshqa bo'lsa)"}</label>
          <input id="ed-backend-name" value="${escapeHtml(backendName)}" placeholder="${escapeHtml(origBackendName || 'backend_nomi')}" />
        </div>
      </div>
      <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin-top:10px">
        <label class="check-row" style="margin:0"><input type="checkbox" id="ed-exact-name" ${exactName ? "checked" : ""} /> Prefikssiz aniq nom (masalan "${c.prefix}__nom" emas, to'g'ridan-to'g'ri "nom")</label>
        <label class="check-row" style="margin:0"><input type="checkbox" id="ed-enabled" ${enabled ? "checked" : ""} /> Claude'ga ko'rsatilsin (Yoqilgan)</label>
      </div>
      <div style="margin-top:10px;font-size:12px;color:var(--text-muted)">
        Claude ko'radigan to'liq nom: <code class="prefix-tag" id="live-tool-preview" style="color:var(--accent)"></code>
      </div>
    </div>

    <!-- Tavsif -->
    <div class="card" style="margin-bottom:14px;padding:14px">
      <div class="card-title" style="margin-bottom:10px">2. Tavsif (Description)</div>
      <textarea id="ed-desc" rows="3" placeholder="Ushbu tool nima vazifa bajarishini batafsil tushuntiring...">${escapeHtml(description)}</textarea>
      <label class="check-row"><input type="checkbox" id="ed-inc-prefix" ${incPrefix ? "checked" : ""} /> Tavsif oldiga "[${escapeHtml(c.name)}]" belgisini qo'shish</label>
    </div>

    <!-- Parametrlar & Input Schema -->
    <div class="card" style="margin-bottom:14px;padding:14px">
      <div class="card-title" style="margin-bottom:6px">3. Parametrlar & Input Schema</div>
      <p class="hint" style="margin-top:0">Parametrlarni vizual shaklda boshqaring yoki to'liq JSON Schema formatida tahrirlang.</p>

      <div class="editor-tabs">
        <button class="editor-tab-btn active" id="tab-visual-btn">📋 Parametrlar formasi (Visual)</button>
        <button class="editor-tab-btn" id="tab-json-btn">{ } Xom JSON Schema (Raw)</button>
      </div>

      <!-- Tab: Visual Builder -->
      <div id="tab-visual-wrap">
        <div id="params-rows" class="params-table"></div>
        <button class="ghost" id="btn-add-param" style="font-size:12px;padding:6px 14px;margin-top:6px">+ Parametr qo'shish</button>
      </div>

      <!-- Tab: Raw JSON -->
      <div id="tab-json-wrap" style="display:none">
        <textarea id="ed-raw-schema" class="mono" rows="9" spellcheck="false">${escapeHtml(JSON.stringify(schema, null, 2))}</textarea>
        <div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center">
          <button class="ghost" id="btn-fmt-json" style="font-size:11px;padding:4px 10px">Formatlash (Prettify JSON)</button>
          <span id="schema-err" style="color:var(--red);font-size:12px"></span>
        </div>
      </div>
    </div>

    <!-- Kengaytirilgan Sozlamalar -->
    <div class="card" style="margin-bottom:14px;padding:14px">
      <div class="collapsible-header" id="adv-toggle">
        <span>⚙️ Kengaytirilgan sozlamalar (Default/Fixed argumentlar, Timeout, Belgilar)</span>
        <span id="adv-arrow">▼</span>
      </div>
      <div class="collapsible-body" id="adv-body" style="display:none">
        <div class="grid-2">
          <div>
            <label>Standart argumentlar (Default Args JSON)</label>
            <textarea id="ed-default-args" class="mono" rows="3" placeholder='{"format": "json"}'>${escapeHtml(defaultArgs)}</textarea>
            <p class="hint">Agar Claude bu parametrni bermasa, avtomatik to'ldiriladi.</p>
          </div>
          <div>
            <label>Majburiy argumentlar (Fixed Args JSON)</label>
            <textarea id="ed-fixed-args" class="mono" rows="3" placeholder='{"auth": "token"}'>${escapeHtml(fixedArgs)}</textarea>
            <p class="hint">Har doim backend chaqiruvida qat'iy yuboriladi.</p>
          </div>
        </div>
        <div class="grid-2" style="margin-top:10px">
          <div>
            <label>Maxsus Timeout (soniyalarda, default: 120s)</label>
            <input id="ed-timeout" type="number" min="1" max="600" value="${escapeHtml(timeoutSec)}" placeholder="120" />
          </div>
          <div style="padding-top:22px">
            <label class="check-row"><input type="checkbox" id="ed-readonly" ${readOnly ? "checked" : ""} /> Read-only hint (faqat o'qish uchun)</label>
            <label class="check-row"><input type="checkbox" id="ed-req-conf" ${reqConf ? "checked" : ""} /> Xavfli / Tasdiqlash talab qilinadi</label>
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="ok" id="ed-save-btn" style="padding:8px 20px">💾 Saqlash</button>
        ${!isNew ? `<button class="ghost" id="ed-test-btn" style="padding:8px 16px">▶ Sinash</button>` : ""}
        ${!isNew && Object.keys(ov).length ? `<button class="ghost" id="ed-reset-btn" style="padding:8px 16px">🔄 Asl holiga qaytarish</button>` : ""}
      </div>
      <button class="ghost" data-act="cancel" style="padding:8px 16px">Yopish</button>
    </div>
  `, "modal-lg");

  m.querySelector("[data-act=cancel]").onclick = () => {
    closeModal();
    openToolsEditor(c);
  };

  // Live exposed name preview
  function updateNamePreview() {
    const rawVal = $("ed-name").value.trim() || (isNew ? "tool" : origBackendName);
    const isExact = $("ed-exact-name").checked;
    const finalVal = isExact ? rawVal : `${c.prefix}__${rawVal}`;
    const el = $("live-tool-preview");
    if (el) el.textContent = finalVal;
  }
  $("ed-name").oninput = updateNamePreview;
  $("ed-exact-name").onchange = updateNamePreview;
  updateNamePreview();

  // Accordion toggle
  let advOpen = false;
  $("adv-toggle").onclick = () => {
    advOpen = !advOpen;
    $("adv-body").style.display = advOpen ? "block" : "none";
    $("adv-arrow").textContent = advOpen ? "▲" : "▼";
  };

  // Render visual parameters
  function renderVisualParams() {
    const wrap = $("params-rows");
    if (!wrap) return;
    if (visualParams.length === 0) {
      wrap.innerHTML = `<div style="padding:10px;color:var(--text-dim);font-size:12px;text-align:center">// Hech qanday parametr belgilanmagan</div>`;
      return;
    }
    wrap.innerHTML = `
      <div style="display:grid;grid-template-columns:140px 100px 1fr 80px 36px;gap:8px;font-size:11px;font-family:var(--mono);color:var(--text-muted);padding:0 10px 4px">
        <span>NOM</span><span>TUR</span><span>TAVSIF</span><span>MAJBURIY</span><span></span>
      </div>
      ${visualParams.map((p, idx) => `
        <div class="param-row" data-idx="${idx}">
          <input data-f="name" value="${escapeHtml(p.name)}" placeholder="nomi" />
          <select data-f="type">
            <option value="string" ${p.type === 'string' ? 'selected' : ''}>string</option>
            <option value="number" ${p.type === 'number' ? 'selected' : ''}>number</option>
            <option value="boolean" ${p.type === 'boolean' ? 'selected' : ''}>boolean</option>
            <option value="array" ${p.type === 'array' ? 'selected' : ''}>array</option>
            <option value="object" ${p.type === 'object' ? 'selected' : ''}>object</option>
            <option value="integer" ${p.type === 'integer' ? 'selected' : ''}>integer</option>
          </select>
          <input data-f="desc" value="${escapeHtml(p.description)}" placeholder="parametr tavsifi" />
          <label style="display:flex;align-items:center;gap:4px;font-size:11px;margin:0;cursor:pointer">
            <input type="checkbox" data-f="req" ${p.required ? 'checked' : ''} style="width:auto" /> Ha
          </label>
          <button class="param-del-btn" data-act="del-p" title="O'chirish">×</button>
        </div>
      `).join("")}
    `;

    // Bind inputs
    wrap.querySelectorAll(".param-row").forEach(row => {
      const idx = Number(row.dataset.idx);
      row.querySelector("[data-f=name]").oninput = (e) => { visualParams[idx].name = e.target.value.trim(); };
      row.querySelector("[data-f=type]").onchange = (e) => { visualParams[idx].type = e.target.value; };
      row.querySelector("[data-f=desc]").oninput = (e) => { visualParams[idx].description = e.target.value; };
      row.querySelector("[data-f=req]").onchange = (e) => { visualParams[idx].required = e.target.checked; };
      row.querySelector("[data-act=del-p]").onclick = () => {
        visualParams.splice(idx, 1);
        renderVisualParams();
      };
    });
  }

  $("btn-add-param").onclick = () => {
    visualParams.push({ name: `param_${visualParams.length + 1}`, type: "string", description: "", required: false });
    renderVisualParams();
  };

  renderVisualParams();

  // Tab switching & sync
  let activeTab = "visual";
  function buildSchemaFromVisual() {
    const properties = {};
    const required = [];
    visualParams.forEach(p => {
      const n = (p.name || "").trim();
      if (!n) return;
      properties[n] = {
        type: p.type || "string",
        ...(p.description ? { description: p.description } : {}),
      };
      if (p.required) required.push(n);
    });
    return {
      type: "object",
      properties,
      ...(required.length ? { required } : {}),
    };
  }

  function syncVisualFromJson() {
    const raw = $("ed-raw-schema").value.trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const pr = parsed.properties || {};
        const rq = Array.isArray(parsed.required) ? parsed.required : [];
        visualParams = Object.keys(pr).map(k => ({
          name: k,
          type: pr[k]?.type || "string",
          description: pr[k]?.description || "",
          required: rq.includes(k),
        }));
        renderVisualParams();
        $("schema-err").textContent = "";
      }
    } catch (err) {
      $("schema-err").textContent = "Xato: " + err.message;
    }
  }

  $("tab-visual-btn").onclick = () => {
    if (activeTab === "json") syncVisualFromJson();
    activeTab = "visual";
    $("tab-visual-btn").classList.add("active");
    $("tab-json-btn").classList.remove("active");
    $("tab-visual-wrap").style.display = "block";
    $("tab-json-wrap").style.display = "none";
  };

  $("tab-json-btn").onclick = () => {
    if (activeTab === "visual") {
      const s = buildSchemaFromVisual();
      $("ed-raw-schema").value = JSON.stringify(s, null, 2);
    }
    activeTab = "json";
    $("tab-json-btn").classList.add("active");
    $("tab-visual-btn").classList.remove("active");
    $("tab-visual-wrap").style.display = "none";
    $("tab-json-wrap").style.display = "block";
  };

  $("btn-fmt-json").onclick = () => {
    try {
      const val = JSON.parse($("ed-raw-schema").value);
      $("ed-raw-schema").value = JSON.stringify(val, null, 2);
      $("schema-err").textContent = "";
    } catch (err) {
      $("schema-err").textContent = "JSON xatosi: " + err.message;
    }
  };

  // Save handler
  $("ed-save-btn").onclick = async () => {
    const rawName = $("ed-name").value.trim();
    if (!rawName) { toast("Tool nomi bo'sh bo'lishi mumkin emas", "err"); return; }

    const targetKey = isNew ? rawName : origBackendName;
    const isExact = $("ed-exact-name").checked;
    const isEn = $("ed-enabled").checked;
    const backendNm = $("ed-backend-name").value.trim();
    const desc = $("ed-desc").value;
    const incPref = $("ed-inc-prefix").checked;

    // Build final input schema
    let finalSchema;
    if (activeTab === "visual") {
      finalSchema = buildSchemaFromVisual();
    } else {
      try {
        finalSchema = JSON.parse($("ed-raw-schema").value);
      } catch {
        toast("Input schema to'g'ri JSON emas", "err");
        return;
      }
    }

    // Default & fixed args
    let defArgs = undefined;
    const defRaw = $("ed-default-args").value.trim();
    if (defRaw) {
      try { defArgs = JSON.parse(defRaw); }
      catch { toast("Standart argumentlar JSON emas", "err"); return; }
    }

    let fixArgs = undefined;
    const fixRaw = $("ed-fixed-args").value.trim();
    if (fixRaw) {
      try { fixArgs = JSON.parse(fixRaw); }
      catch { toast("Majburiy argumentlar JSON emas", "err"); return; }
    }

    const timeoutVal = $("ed-timeout").value.trim();
    const timeoutSecNum = timeoutVal ? Number(timeoutVal) : undefined;
    const readOnlyVal = $("ed-readonly").checked;
    const reqConfVal = $("ed-req-conf").checked;

    const override = {
      name: rawName,
      exactName: isExact,
      enabled: isEn,
      description: desc,
      includePrefixInDescription: incPref,
      inputSchema: finalSchema,
      ...(backendNm ? { backendName: backendNm } : {}),
      ...(defArgs !== undefined ? { defaultArgs: defArgs } : {}),
      ...(fixArgs !== undefined ? { fixedArgs: fixArgs } : {}),
      ...(timeoutSecNum ? { timeoutMs: timeoutSecNum * 1000 } : {}),
      readOnly: readOnlyVal,
      requiresConfirmation: reqConfVal,
    };

    try {
      await authApi(`/api/account/${state.accountId}/connectors/${c.id}/tools`, {
        method: "PUT",
        body: JSON.stringify({ tool: targetKey, override }),
      });
      toast("Tool muvaffaqiyatli saqlandi!", "ok");
      closeModal();
      await openToolsEditor(c);
    } catch (err) {
      toast(err.message, "err");
    }
  };

  // Test handler
  const testBtn = $("ed-test-btn");
  if (testBtn) {
    testBtn.onclick = () => {
      const curSchema = activeTab === "visual" ? buildSchemaFromVisual() : (() => {
        try { return JSON.parse($("ed-raw-schema").value); } catch { return schema; }
      })();
      openToolTester(c, {
        name: origBackendName || $("ed-name").value.trim(),
        inputSchema: curSchema,
        override: {
          name: $("ed-name").value.trim(),
          exactName: $("ed-exact-name").checked,
          backendName: $("ed-backend-name").value.trim(),
        },
      });
    };
  }

  // Reset handler
  const resetBtn = $("ed-reset-btn");
  if (resetBtn) {
    resetBtn.onclick = async () => {
      try {
        await authApi(`/api/account/${state.accountId}/connectors/${c.id}/tools`, {
          method: "DELETE",
          body: JSON.stringify({ tool: origBackendName }),
        });
        toast("Tool asl holiga qaytarildi", "ok");
        closeModal();
        await openToolsEditor(c);
      } catch (err) { toast(err.message, "err"); }
    };
  }
}

/* ---------- Tool Tester ---------- */
function openToolTester(c, tool) {
  const schema = (tool.override && tool.override.inputSchema) || tool.inputSchema || {};
  const props = (schema.properties && typeof schema.properties === "object") ? schema.properties : {};
  const propKeys = Object.keys(props);

  // Generate initial sample arguments object
  const sampleArgs = {};
  propKeys.forEach(k => {
    const t = props[k]?.type;
    if (t === "number" || t === "integer") sampleArgs[k] = 1;
    else if (t === "boolean") sampleArgs[k] = true;
    else if (t === "array") sampleArgs[k] = [];
    else if (t === "object") sampleArgs[k] = {};
    else sampleArgs[k] = "";
  });

  const m = openModal(`Toolni sinash — ${escapeHtml(tool.name)}`, `
    <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px">
      Connector: <code class="prefix-tag">${escapeHtml(c.name)}</code> | Tool: <code class="prefix-tag">${escapeHtml(tool.name)}</code>
    </div>

    <label>Argumentlar (JSON formatida)</label>
    <textarea id="tester-args" class="mono" rows="6" spellcheck="false">${escapeHtml(JSON.stringify(sampleArgs, null, 2))}</textarea>

    <div style="margin-top:12px;display:flex;gap:10px;align-items:center">
      <button class="ok" id="tester-call-btn" style="padding:7px 18px">▶ Ishga tushirish (Call)</button>
      <span id="tester-loading" style="display:none;font-size:12px;color:var(--accent)">Bajarilmoqda...</span>
    </div>

    <div id="tester-result-wrap" style="display:none;margin-top:14px">
      <div style="font-size:12px;font-weight:600;margin-bottom:4px" id="tester-status-header">Natija:</div>
      <pre class="test-result-box" id="tester-output"></pre>
    </div>
  `);

  m.querySelector("[data-act=close]").onclick = () => {
    closeModal();
    openToolsEditor(c);
  };

  $("tester-call-btn").onclick = async () => {
    let args = {};
    const rawArgs = $("tester-args").value.trim();
    if (rawArgs) {
      try { args = JSON.parse(rawArgs); }
      catch { toast("Argumentlar JSON formatida emas", "err"); return; }
    }

    $("tester-loading").style.display = "inline";
    $("tester-call-btn").disabled = true;
    $("tester-result-wrap").style.display = "none";

    const t0 = performance.now();
    try {
      const res = await authApi(`/api/account/${state.accountId}/connectors/${c.id}/tools/call`, {
        method: "POST",
        body: JSON.stringify({ tool: tool.name, arguments: args }),
      });
      const duration = Math.round(performance.now() - t0);
      $("tester-result-wrap").style.display = "block";
      const outBox = $("tester-output");

      if (res.ok) {
        $("tester-status-header").innerHTML = `<span style="color:var(--accent)">✓ Muvaffaqiyatli (${duration}ms)</span>`;
        outBox.className = "test-result-box ok";
        outBox.textContent = JSON.stringify(res.result, null, 2);
      } else {
        $("tester-status-header").innerHTML = `<span style="color:var(--red)">✗ Xatolik (${duration}ms)</span>`;
        outBox.className = "test-result-box err";
        outBox.textContent = res.error || "Noma'lum xatolik";
      }
    } catch (err) {
      const duration = Math.round(performance.now() - t0);
      $("tester-result-wrap").style.display = "block";
      $("tester-status-header").innerHTML = `<span style="color:var(--red)">✗ Xatolik (${duration}ms)</span>`;
      const outBox = $("tester-output");
      outBox.className = "test-result-box err";
      outBox.textContent = err.message;
    } finally {
      $("tester-loading").style.display = "none";
      $("tester-call-btn").disabled = false;
    }
  };
}

loadAccount();

loadAccount();
