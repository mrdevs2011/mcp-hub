/**
 * MCP Hub Frontend Application
 * Ultra-clean, modern, accessible design with zero emojis and pure inline SVG icons.
 */

const $ = (id) => document.getElementById(id);

// Pure inline SVG icon system
const ICONS = {
  check: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  copy: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  edit: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  tools: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  play: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  gear: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  refresh: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  save: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  alert: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  chevronDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevronUp: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
  power: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`,
  user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  key: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-1.5 1.5L14 9l-3 3-2 2-3 3 2 2 3-3 2-2 3.5-3.5a5.5 5.5 0 1 0-7.78-7.78z"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>`,
  logout: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  link: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  code: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  list: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  filter: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  spinner: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="spin"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`
};

function icon(name) {
  return ICONS[name] || "";
}

const state = {
  accountId: localStorage.getItem("hub_accountId") || "",
  password: localStorage.getItem("hub_password") || "",
  mcpKey: localStorage.getItem("hub_mcpKey") || "",
  username: localStorage.getItem("hub_username") || "",
  account: null,
  authTab: "login", // 'login' | 'register'
};

let toastTimer;
function toast(text, type = "") {
  const el = $("toast");
  const iconMarkup = type === "ok" ? icon("check") : type === "err" ? icon("alert") : "";
  el.innerHTML = `${iconMarkup}<span>${escapeHtml(text)}</span>`;
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
    <span class="user-badge">${icon("user")} @${escapeHtml(state.username)}</span>
    <button class="ghost" id="logout" style="padding:6px 14px;font-size:13px">
      ${icon("logout")} Chiqish
    </button>
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
    <div class="auth-container">
      <div class="auth-tabs">
        <button class="auth-tab-btn ${state.authTab === 'login' ? 'active' : ''}" id="tab-login-btn">
          ${icon("user")} Kirish
        </button>
        <button class="auth-tab-btn ${state.authTab === 'register' ? 'active' : ''}" id="tab-register-btn">
          ${icon("plus")} Ro'yxatdan o'tish
        </button>
      </div>

      <!-- Login View -->
      <div id="auth-login-panel" style="${state.authTab === 'login' ? '' : 'display:none;'}">
        <label>Username</label>
        <div class="input-with-icon">
          <span class="input-icon">${icon("user")}</span>
          <input id="login-user" value="${escapeHtml(state.username)}" placeholder="username" autocomplete="username" />
        </div>

        <label>Parol</label>
        <div class="input-with-icon">
          <span class="input-icon">${icon("key")}</span>
          <input id="login-pass" type="password" value="${escapeHtml(state.password)}" placeholder="••••••••" autocomplete="current-password" />
        </div>

        <div style="margin-top:24px">
          <button class="primary" id="login" style="width:100%;padding:11px">
            Kirish ${icon("play")}
          </button>
        </div>
      </div>

      <!-- Register View -->
      <div id="auth-register-panel" style="${state.authTab === 'register' ? '' : 'display:none;'}">
        <label>Username tanlang</label>
        <div class="input-with-icon">
          <span class="input-icon">${icon("user")}</span>
          <input id="reg-user" placeholder="masalan: ali_dev" autocomplete="username" />
        </div>

        <label>Parol o'rnating</label>
        <div class="input-with-icon">
          <span class="input-icon">${icon("key")}</span>
          <input id="reg-pass" type="password" placeholder="kuchli parol kiriting" autocomplete="new-password" />
        </div>

        <div style="margin-top:24px">
          <button class="ok" id="create" style="width:100%;padding:11px">
            ${icon("plus")} Yangi hisob ochish
          </button>
        </div>
      </div>
    </div>
  `;

  $("tab-login-btn").onclick = () => {
    state.authTab = "login";
    renderAuth();
    $("login-user")?.focus();
  };

  $("tab-register-btn").onclick = () => {
    state.authTab = "register";
    renderAuth();
    $("reg-user")?.focus();
  };

  $("login")?.addEventListener("click", doLogin);
  $("create")?.addEventListener("click", registerAccount);

  ["login-user","login-pass"].forEach(id => {
    $(id)?.addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
  });
  ["reg-user","reg-pass"].forEach(id => {
    $(id)?.addEventListener("keydown", e => { if (e.key === "Enter") registerAccount(); });
  });
}

function renderDash() {
  $("auth").hidden = true;
  $("dashboard").hidden = false;
  renderTopActions();

  const url = mcpUrl();
  const connectors = state.account.connectors || [];

  $("dashboard").innerHTML = `
    <!-- Claude MCP URL Card -->
    <div class="card">
      <div class="card-title">
        ${icon("link")} Claude MCP Gateway URL
      </div>
      <div class="urlbox">
        <input id="mcp-url" readonly value="${url}" />
        <button id="copy-url">
          ${icon("copy")} Nusxa
        </button>
      </div>
      <div class="meta-row">
        <span class="meta-item">${icon("gear")} storage: <span class="val">${escapeHtml(state.account.storage)}</span></span>
        <span class="meta-item">${icon("tools")} connectorlar: <span class="val">${connectors.length}</span></span>
        <span class="meta-item"><span class="dot"></span> holat: <span class="val" style="color:var(--accent)">Online</span></span>
      </div>
      <p class="hint">Ushbu URL o'zgarmasdir. Uni bir marta Claude Desktop yoki Claude Web sozlamalariga kiritsangiz kifoya.</p>
    </div>

    <!-- Connector qo'shish kartasi (Presets & Auth Dropdowns bilan) -->
    <div class="card section-gap">
      <div class="card-title">
        ${icon("plus")} Yangi Connector Qo'shish
      </div>

      <!-- Presets Dropdown -->
      <label>Shablondan tanlash (ixtiyoriy)</label>
      <select id="c-preset">
        <option value="">-- Shablondan avtomatik to'ldirish (ixtiyoriy) --</option>
        <option value="cmcomputer">CMComputer (Mahalliy terminal va kompyuterni boshqarish)</option>
        <option value="github">GitHub MCP (Repozitoriylar, pull requestlar va kod)</option>
        <option value="memory">Memory MCP (Bilimlar bazasi va doimiy xotira)</option>
        <option value="fetch">Fetch MCP (Veb-sahifalar va API so'rovlari)</option>
        <option value="custom">Maxsus / Custom MCP Server</option>
      </select>

      <div class="grid-2" style="margin-top:14px">
        <div>
          <label>Nomi *</label>
          <input id="c-name" placeholder="masalan: LifeMR yoki CMC" />
        </div>
        <div>
          <label>Prefix *</label>
          <input id="c-prefix" placeholder="masalan: cmc yoki lifemr" />
        </div>
      </div>

      <label>MCP URL *</label>
      <input id="c-url" placeholder="https://example.com/api/mcp" />

      <!-- Auth Type Dropdown & Custom Headers -->
      <div class="grid-3" style="margin-top:14px">
        <div>
          <label>Autentifikatsiya turi</label>
          <select id="c-auth-type">
            <option value="none">Autentifikatsiyasiz (Ochiq)</option>
            <option value="bearer">Bearer Token (Authorization)</option>
            <option value="api-key">API Key (X-API-Key)</option>
            <option value="custom">Boshqa maxsus header</option>
          </select>
        </div>
        <div>
          <label>Auth header nomi</label>
          <input id="c-h" placeholder="Authorization" />
        </div>
        <div>
          <label>Header qiymati / Token</label>
          <input id="c-v" placeholder="Bearer ..." />
        </div>
      </div>

      <div style="margin-top:20px;display:flex;justify-content:flex-end">
        <button class="ok" id="add-btn" style="padding:10px 22px">
          ${icon("plus")} Connector Qo'shish
        </button>
      </div>
    </div>

    <!-- Connectorlar Ro'yxati -->
    <div class="section-gap">
      <div class="section-head">
        <div class="section-title">
          ${icon("tools")} Ulangan Connectorlar (${connectors.length})
        </div>
      </div>
      <div class="connector-list" id="conn-list">
        ${connectors.length === 0
          ? `<div class="empty-state">
              ${icon("tools")}
              <span>Hozircha birorta ham connector ulanmagan. Yuqoridagi formadan qo'shing.</span>
            </div>`
          : connectors.map(c => connectorHtml(c)).join("")}
      </div>
    </div>
  `;

  // Bind Preset Template Dropdown
  const presetSel = $("c-preset");
  if (presetSel) {
    presetSel.onchange = (e) => {
      const val = e.target.value;
      if (val === "cmcomputer") {
        $("c-name").value = "CMComputer";
        $("c-prefix").value = "cmc";
        $("c-url").value = "http://127.0.0.1:3847/mcp";
        $("c-auth-type").value = "bearer";
        $("c-h").value = "Authorization";
        $("c-v").value = "Bearer cmc-session-token";
      } else if (val === "github") {
        $("c-name").value = "GitHub";
        $("c-prefix").value = "gh";
        $("c-url").value = "https://api.github.com/mcp";
        $("c-auth-type").value = "bearer";
        $("c-h").value = "Authorization";
        $("c-v").value = "Bearer ghp_...";
      } else if (val === "memory") {
        $("c-name").value = "Memory";
        $("c-prefix").value = "mem";
        $("c-url").value = "http://localhost:8080/mcp";
        $("c-auth-type").value = "none";
        $("c-h").value = "";
        $("c-v").value = "";
      } else if (val === "fetch") {
        $("c-name").value = "Fetch";
        $("c-prefix").value = "fetch";
        $("c-url").value = "http://localhost:8081/mcp";
        $("c-auth-type").value = "none";
        $("c-h").value = "";
        $("c-v").value = "";
      }
    };
  }

  // Bind Auth Type Dropdown
  const authTypeSel = $("c-auth-type");
  if (authTypeSel) {
    authTypeSel.onchange = (e) => {
      const val = e.target.value;
      if (val === "none") {
        $("c-h").value = "";
        $("c-v").value = "";
      } else if (val === "bearer") {
        $("c-h").value = "Authorization";
        if (!$("c-v").value.startsWith("Bearer ")) {
          $("c-v").value = "Bearer ";
        }
      } else if (val === "api-key") {
        $("c-h").value = "X-API-Key";
      }
    };
  }

  $("copy-url").onclick = async () => {
    await navigator.clipboard.writeText(url);
    const btn = $("copy-url");
    btn.innerHTML = `${icon("check")} Nusxalandi!`;
    setTimeout(() => {
      btn.innerHTML = `${icon("copy")} Nusxa`;
    }, 2000);
    toast("URL buferga nusxalandi", "ok");
  };

  $("add-btn").onclick = addConnector;

  document.querySelectorAll(".connector-item").forEach(el => {
    const id = el.dataset.id;
    const connector = connectors.find(x => x.id === id);
    if (!connector) return;
    el.querySelector("[data-act=test]").onclick = () => testConnector(el, id);
    el.querySelector("[data-act=tools]").onclick = () => openToolsEditor(connector);
    el.querySelector("[data-act=edit]").onclick = () => openConnectorEditor(connector);
    el.querySelector("[data-act=toggle]").onclick = () => toggleConnector(connector);
    el.querySelector("[data-act=del]").onclick = () => deleteConnector(id);
  });
}

function connectorHtml(c) {
  const isEnabled = c.enabled !== false;
  return `
    <div class="connector-item ${isEnabled ? 'active' : ''}" data-id="${c.id}">
      <div class="connector-header">
        <span class="connector-name">
          ${escapeHtml(c.name)}
        </span>
        <span class="badge ${isEnabled ? 'on' : 'off'}">
          ${isEnabled ? `${icon("check")} faol` : `${icon("power")} to'xtatilgan`}
        </span>
        <span class="prefix-tag">${escapeHtml(c.prefix)}__</span>
      </div>
      <div class="connector-url">
        ${icon("link")}
        <span>${escapeHtml(c.url)}</span>
      </div>
      <div class="connector-actions">
        <button class="ghost" data-act="test" style="font-size:12px;padding:6px 13px">
          ${icon("play")} Test
        </button>
        <button class="secondary" data-act="tools" style="font-size:12px;padding:6px 13px">
          ${icon("tools")} Toollar
        </button>
        <button class="secondary" data-act="edit" style="font-size:12px;padding:6px 13px">
          ${icon("edit")} Tahrirlash
        </button>
        <button class="secondary" data-act="toggle" style="font-size:12px;padding:6px 13px">
          ${icon("power")} ${isEnabled ? "O'chirish" : "Yoqish"}
        </button>
        <button class="danger" data-act="del" style="font-size:12px;padding:6px 13px">
          ${icon("trash")} O'chirish
        </button>
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
  res.innerHTML = `${icon("spinner")} <span>Tekshirilmoqda...</span>`;
  try {
    const data = await authApi(`/api/account/${state.accountId}/connectors/${id}/test`, { method: "POST", body: "{}" });
    res.className = "connector-result visible";
    if (data.ok) {
      res.innerHTML = `${icon("check")} <span>Muvaffaqiyatli: ${data.count} tool mavjud (${(data.tools||[]).slice(0,6).join(", ")})</span>`;
    } else {
      res.classList.add("err");
      res.innerHTML = `${icon("alert")} <span>Xatolik: ${escapeHtml(data.error)}</span>`;
    }
  } catch(err) {
    res.className = "connector-result visible err";
    res.innerHTML = `${icon("alert")} <span>${escapeHtml(err.message)}</span>`;
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
  if (!confirm("Ushbu connectorni rostdan ham o'chirmoqchimisiz?")) return;
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
    toast("Hisob muvaffaqiyatli ochildi!", "ok");
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
    if (err.status === 401 || /parol|hisob topilmadi|noto'g'ri/i.test(err.message || "")) {
      state.account = null;
      renderAuth();
    } else {
      toast(err.message || "Yuklashda xato", "err");
      if (state.account) renderDash();
      else renderAuth();
    }
  }
}

async function addConnector() {
  const name = $("c-name").value.trim();
  const url = $("c-url").value.trim();
  if (!name || !url) { toast("Nom va URL kiritilishi shart", "err"); return; }
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

/* ---------- Modal Framework ---------- */
function openModal(title, bodyHtml, extraClass = "") {
  closeModal();
  const wrap = document.createElement("div");
  wrap.className = "modal-backdrop";
  wrap.id = "modal";
  wrap.innerHTML = `
    <div class="modal ${extraClass}" role="dialog" aria-modal="true">
      <div class="modal-head">
        <div class="modal-title">${title}</div>
        <button class="ghost modal-close" data-act="close" style="font-size:12px;padding:6px 12px">
          ${icon("x")} Yopish
        </button>
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

/* ---------- Connector tahrirlash oynasi ---------- */
function openConnectorEditor(c) {
  const m = openModal(`Tahrirlash: ${escapeHtml(c.name)}`, `
    <div class="grid-2">
      <div><label>Nomi</label><input id="e-name" value="${escapeHtml(c.name)}" /></div>
      <div><label>Prefix</label><input id="e-prefix" value="${escapeHtml(c.prefix)}" /></div>
    </div>
    <label>MCP URL</label>
    <input id="e-url" value="${escapeHtml(c.url)}" />
    <div class="grid-2" style="margin-top:0">
      <div><label>Auth Header</label><input id="e-h" value="${escapeHtml(c.authHeader || "")}" placeholder="Authorization" /></div>
      <div><label>Header Qiymati</label><input id="e-v" value="${escapeHtml(c.authValue || "")}" placeholder="Bearer ..." /></div>
    </div>
    <label class="check-row"><input type="checkbox" id="e-enabled" ${c.enabled === false ? "" : "checked"} /> Faol (Yoqilgan)</label>
    <p class="hint">Prefix o'zgarsa, Claude ko'radigan tool nomlari ham o'zgaradi (masalan: prefix__tool).</p>
    <div style="margin-top:18px;display:flex;gap:10px">
      <button class="ok" id="e-save">${icon("save")} Saqlash</button>
      <button class="ghost" data-act="cancel">${icon("x")} Bekor qilish</button>
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

/* ---------- Toollar menejeri (Ko'rish, Filtrlash, Tahrirlash) ---------- */
let cToolsState = null;

async function openToolsEditor(c) {
  openModal(`Toollar: ${escapeHtml(c.name)}`, `<div class="empty-state">${icon("spinner")} <span>Toollar yuklanmoqda...</span></div>`, "modal-lg");
  let data;
  try {
    data = await authApi(`/api/account/${state.accountId}/connectors/${c.id}/tools`, { method: "POST", body: "{}" });
  } catch (err) {
    $("modal-body").innerHTML = `<div class="connector-result visible err">${icon("alert")} <span>${escapeHtml(err.message)}</span></div>`;
    return;
  }
  if (!data.ok) {
    $("modal-body").innerHTML = `<div class="connector-result visible err">${icon("alert")} <span>Xatolik: ${escapeHtml(data.error)}</span></div>`;
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
      <div class="connector-result visible err" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:10px">
        <span style="display:flex;align-items:center;gap:7px">
          ${icon("alert")} Server bilan aloqa: ${escapeHtml(warning)}. Saqlangan toollar ko'rsatilmoqda.
        </span>
        <button class="ghost" id="tools-retry" style="font-size:11px;padding:3px 9px">Qayta urinish</button>
      </div>` : ""}

    <div class="toolbar-row">
      <!-- Filter Pills -->
      <div class="filter-pills">
        <button class="pill-btn ${filter === 'all' ? 'active' : ''}" data-filter="all">Barchasi (${total})</button>
        <button class="pill-btn ${filter === 'active' ? 'active' : ''}" data-filter="active">Faol (${active})</button>
        <button class="pill-btn ${filter === 'disabled' ? 'active' : ''}" data-filter="disabled">O'chiq (${disabled})</button>
        <button class="pill-btn ${filter === 'changed' ? 'active' : ''}" data-filter="changed">O'zgartirilgan (${changed})</button>
        ${custom > 0 ? `<button class="pill-btn ${filter === 'custom' ? 'active' : ''}" data-filter="custom">Maxsus (${custom})</button>` : ""}
      </div>

      <!-- Search & Action Controls -->
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <!-- Quick Filter Dropdown -->
        <select id="tools-filter-dropdown" style="width:auto;min-width:140px;padding:7px 34px 7px 12px;font-size:12px">
          <option value="all" ${filter === 'all' ? 'selected' : ''}>Barchasi (${total})</option>
          <option value="active" ${filter === 'active' ? 'selected' : ''}>Faol (${active})</option>
          <option value="disabled" ${filter === 'disabled' ? 'selected' : ''}>O'chiq (${disabled})</option>
          <option value="changed" ${filter === 'changed' ? 'selected' : ''}>O'zgartirilgan (${changed})</option>
          ${custom > 0 ? `<option value="custom" ${filter === 'custom' ? 'selected' : ''}>Maxsus (${custom})</option>` : ''}
        </select>

        <div class="search-box">
          ${icon("search")}
          <input id="tools-search" placeholder="Qidirish..." value="${escapeHtml(search)}" />
        </div>
        <button class="ok" id="btn-add-tool" style="font-size:12px;padding:7px 14px">
          ${icon("plus")} Yangi Tool
        </button>
        <button class="ghost" id="btn-refresh-tools" style="font-size:12px;padding:7px 11px" title="Qayta yuklash">
          ${icon("refresh")}
        </button>
      </div>
    </div>

    <div class="tool-list">
      ${filtered.length === 0
        ? `<div class="empty-state">
            ${icon("search")}
            <span>Birorta ham mos keladigan tool topilmadi</span>
          </div>`
        : filtered.map(t => toolCardHtml(t, prefix)).join("")
      }
    </div>
  `;

  // Filter dropdown handler
  const filterDropdown = $("tools-filter-dropdown");
  if (filterDropdown) {
    filterDropdown.onchange = (e) => {
      cToolsState.filter = e.target.value;
      renderToolsView();
    };
  }

  // Search input handler
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

  // Tool card action buttons
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
        toast(ov.enabled ? "Tool faollashtirildi" : "Tool o'chirib qo'yildi", "ok");
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
        toast("Maxsus tool o'chirildi", "ok");
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
          ${t.name !== (ov.name || t.name) ? `<span class="prefix-tag" title="Backend tool asl nomi">asl: ${escapeHtml(t.name)}</span>` : ""}
          <span class="badge ${isEnabled ? 'on' : 'off'}">${isEnabled ? `${icon("check")} faol` : `${icon("power")} o'chiq`}</span>
          ${isChanged ? `<span class="badge on">${icon("edit")} o'zgartirilgan</span>` : ""}
          ${t.isCustom ? `<span class="badge custom">${icon("plus")} maxsus</span>` : ""}
          ${isExact ? `<span class="badge exact">prefikssiz</span>` : ""}
          ${ov.readOnly ? `<span class="badge readonly">read-only</span>` : ""}
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <button class="primary" data-act="edit-tool" data-name="${escapeHtml(t.name)}" style="font-size:12px;padding:5px 12px">
            ${icon("edit")} Tahrirlash
          </button>
          <button class="ghost" data-act="test-tool" data-name="${escapeHtml(t.name)}" style="font-size:12px;padding:5px 10px">
            ${icon("play")} Sinash
          </button>
          <button class="secondary" data-act="toggle-tool" data-name="${escapeHtml(t.name)}" style="font-size:12px;padding:5px 10px">
            ${icon("power")} ${isEnabled ? "O'chirish" : "Yoqish"}
          </button>
          ${isChanged && !t.isCustom ? `
            <button class="ghost" data-act="reset-tool" data-name="${escapeHtml(t.name)}" style="font-size:12px;padding:5px 10px" title="Asl holiga qaytarish">
              ${icon("refresh")}
            </button>` : ""}
          ${t.isCustom ? `
            <button class="danger" data-act="del-tool" data-name="${escapeHtml(t.name)}" style="font-size:12px;padding:5px 10px" title="O'chirish">
              ${icon("trash")}
            </button>` : ""}
        </div>
      </div>
      <div class="tool-card-desc">${escapeHtml(desc || "Tavsif kiritilmagan")}</div>
      <div class="tool-card-params">
        ${propKeys.length === 0
          ? `<span style="opacity:0.55;font-size:11px">parametrlar talab etilmaydi</span>`
          : propKeys.map(k => {
              const p = props[k] || {};
              const isReq = reqList.includes(k);
              return `<span class="param-pill ${isReq ? 'req' : ''}">${escapeHtml(k)}: ${escapeHtml(p.type || 'any')}${isReq ? ' *' : ''}</span>`;
            }).join("")
        }
      </div>
    </div>
  `;
}

/* ---------- Bitta tool uchun to'liq tahrirlash oynasi ---------- */
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

  const title = isNew ? `Yangi tool qo'shish: ${escapeHtml(c.name)}` : `Toolni tahrirlash: ${escapeHtml(tool.name)}`;

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
    <div class="card" style="margin-bottom:14px;padding:16px">
      <div class="card-title" style="margin-bottom:12px">
        ${icon("gear")} 1. Identifikatorlar va Nomlar
      </div>
      <div class="grid-2">
        <div>
          <label>${isNew ? "Tool Nomi / Kaliti *" : "Claude Ko'radigan Nom (Alias) *"}</label>
          <input id="ed-name" value="${escapeHtml(currentName)}" placeholder="masalan: run_command" />
        </div>
        <div>
          <label>Backend Tool Nomi ${isNew ? "" : "(agar aslidan farq qilsa)"}</label>
          <input id="ed-backend-name" value="${escapeHtml(backendName)}" placeholder="${escapeHtml(origBackendName || 'backend_nomi')}" />
        </div>
      </div>
      <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin-top:12px">
        <label class="check-row" style="margin:0">
          <input type="checkbox" id="ed-exact-name" ${exactName ? "checked" : ""} /> Prefikssiz aniq nom ("${c.prefix}__nom" emas, to'g'ridan-to'g'ri "nom")
        </label>
        <label class="check-row" style="margin:0">
          <input type="checkbox" id="ed-enabled" ${enabled ? "checked" : ""} /> Claude uchun yoqilgan (Faol)
        </label>
      </div>
      <div style="margin-top:12px;font-size:12.5px;color:var(--text-muted)">
        Claude ko'radigan to'liq chaqiruv nomi: <code class="prefix-tag" id="live-tool-preview" style="color:var(--accent);font-weight:600"></code>
      </div>
    </div>

    <!-- Tavsif -->
    <div class="card" style="margin-bottom:14px;padding:16px">
      <div class="card-title" style="margin-bottom:10px">
        ${icon("list")} 2. Tavsif (Description)
      </div>
      <textarea id="ed-desc" rows="3" placeholder="Ushbu tool nima vazifa bajarishini AI tushunadigan tilda batafsil yozing...">${escapeHtml(description)}</textarea>
      <label class="check-row" style="margin-top:8px">
        <input type="checkbox" id="ed-inc-prefix" ${incPrefix ? "checked" : ""} /> Tavsif oldiga "[${escapeHtml(c.name)}]" belgisini qo'shish
      </label>
    </div>

    <!-- Parametrlar & Input Schema -->
    <div class="card" style="margin-bottom:14px;padding:16px">
      <div class="card-title" style="margin-bottom:6px">
        ${icon("code")} 3. Parametrlar & Input Schema
      </div>
      <p class="hint" style="margin-top:0">Parametrlarni vizual shaklda boshqaring yoki to'liq JSON Schema formatida tahrirlang.</p>

      <div class="editor-tabs">
        <button class="editor-tab-btn active" id="tab-visual-btn">
          ${icon("list")} Parametrlar Formasi (Visual)
        </button>
        <button class="editor-tab-btn" id="tab-json-btn">
          ${icon("code")} Xom JSON Schema (Raw)
        </button>
      </div>

      <!-- Tab 1: Visual Form -->
      <div id="tab-visual-wrap">
        <div id="params-rows" class="params-table"></div>
        <button class="ghost" id="btn-add-param" style="font-size:12px;padding:7px 16px;margin-top:6px">
          ${icon("plus")} Parametr Qo'shish
        </button>
      </div>

      <!-- Tab 2: Raw JSON -->
      <div id="tab-json-wrap" style="display:none">
        <textarea id="ed-raw-schema" class="mono" rows="9" spellcheck="false">${escapeHtml(JSON.stringify(schema, null, 2))}</textarea>
        <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">
          <button class="ghost" id="btn-fmt-json" style="font-size:11.5px;padding:5px 12px">
            ${icon("code")} Formatlash (Prettify JSON)
          </button>
          <span id="schema-err" style="color:var(--red);font-size:12px"></span>
        </div>
      </div>
    </div>

    <!-- Kengaytirilgan Sozlamalar Accordion -->
    <div class="card" style="margin-bottom:14px;padding:16px">
      <div class="collapsible-header" id="adv-toggle">
        <span style="display:flex;align-items:center;gap:8px">
          ${icon("gear")} Kengaytirilgan Sozlamalar (Default/Fixed argumentlar, Timeout, Belgilar)
        </span>
        <span id="adv-arrow">${icon("chevronDown")}</span>
      </div>
      <div class="collapsible-body" id="adv-body" style="display:none">
        <div class="grid-2">
          <div>
            <label>Standart Argumentlar (Default Args JSON)</label>
            <textarea id="ed-default-args" class="mono" rows="3" placeholder='{"format": "json"}'>${escapeHtml(defaultArgs)}</textarea>
            <p class="hint">Agar AI ushbu parametrni bermasa, avtomatik to'ldiriladi.</p>
          </div>
          <div>
            <label>Majburiy Argumentlar (Fixed Args JSON)</label>
            <textarea id="ed-fixed-args" class="mono" rows="3" placeholder='{"auth": "token"}'>${escapeHtml(fixedArgs)}</textarea>
            <p class="hint">Har doim backend chaqiruvida qat'iy yuboriladi.</p>
          </div>
        </div>
        <div class="grid-2" style="margin-top:12px">
          <div>
            <label>Maxsus Timeout (soniyalarda, default: 120s)</label>
            <input id="ed-timeout" type="number" min="1" max="600" value="${escapeHtml(timeoutSec)}" placeholder="120" />
          </div>
          <div style="padding-top:22px">
            <label class="check-row"><input type="checkbox" id="ed-readonly" ${readOnly ? "checked" : ""} /> Read-only belgisi (faqat o'qish uchun)</label>
            <label class="check-row"><input type="checkbox" id="ed-req-conf" ${reqConf ? "checked" : ""} /> Xavfli / Tasdiqlash talab qilinadi</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer Actions -->
    <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="ok" id="ed-save-btn" style="padding:9px 22px">
          ${icon("save")} Saqlash
        </button>
        ${!isNew ? `
          <button class="ghost" id="ed-test-btn" style="padding:9px 16px">
            ${icon("play")} Sinash
          </button>` : ""}
        ${!isNew && Object.keys(ov).length ? `
          <button class="ghost" id="ed-reset-btn" style="padding:9px 16px">
            ${icon("refresh")} Asl holiga qaytarish
          </button>` : ""}
      </div>
      <button class="ghost" data-act="cancel" style="padding:9px 18px">
        ${icon("x")} Yopish
      </button>
    </div>
  `, "modal-lg");

  m.querySelector("[data-act=cancel]").onclick = () => {
    closeModal();
    openToolsEditor(c);
  };

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
    $("adv-arrow").innerHTML = advOpen ? icon("chevronUp") : icon("chevronDown");
  };

  // Render visual parameters
  function renderVisualParams() {
    const wrap = $("params-rows");
    if (!wrap) return;
    if (visualParams.length === 0) {
      wrap.innerHTML = `<div style="padding:14px;color:var(--text-dim);font-size:12.5px;text-align:center">Hech qanday parametr kiritilmagan. Yuqoridagi tugma orqali qo'shing.</div>`;
      return;
    }
    wrap.innerHTML = `
      <div style="display:grid;grid-template-columns:140px 140px 1fr 90px 36px;gap:8px;font-size:11px;font-family:var(--mono);color:var(--text-muted);padding:0 12px 6px">
        <span>NOM</span><span>TUR (SELECT)</span><span>TAVSIF</span><span>MAJBURIY</span><span></span>
      </div>
      ${visualParams.map((p, idx) => `
        <div class="param-row" data-idx="${idx}">
          <input data-f="name" value="${escapeHtml(p.name)}" placeholder="nomi" />
          <select data-f="type">
            <option value="string" ${p.type === 'string' ? 'selected' : ''}>string (matn)</option>
            <option value="number" ${p.type === 'number' ? 'selected' : ''}>number (son)</option>
            <option value="boolean" ${p.type === 'boolean' ? 'selected' : ''}>boolean (ha/yo'q)</option>
            <option value="array" ${p.type === 'array' ? 'selected' : ''}>array (ro'yxat)</option>
            <option value="object" ${p.type === 'object' ? 'selected' : ''}>object (lug'at)</option>
            <option value="integer" ${p.type === 'integer' ? 'selected' : ''}>integer (butun)</option>
          </select>
          <input data-f="desc" value="${escapeHtml(p.description)}" placeholder="parametr tavsifi" />
          <label style="display:flex;align-items:center;gap:5px;font-size:11.5px;margin:0;cursor:pointer">
            <input type="checkbox" data-f="req" ${p.required ? 'checked' : ''} style="width:auto" /> Ha
          </label>
          <button class="param-del-btn" data-act="del-p" title="O'chirish">
            ${icon("trash")}
          </button>
        </div>
      `).join("")}
    `;

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
      $("schema-err").textContent = "JSON xatosi: " + err.message;
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
    if (!rawName) { toast("Tool nomi kiritilishi shart", "err"); return; }

    const targetKey = isNew ? rawName : origBackendName;
    const isExact = $("ed-exact-name").checked;
    const isEn = $("ed-enabled").checked;
    const backendNm = $("ed-backend-name").value.trim();
    const desc = $("ed-desc").value;
    const incPref = $("ed-inc-prefix").checked;

    let finalSchema;
    if (activeTab === "visual") {
      finalSchema = buildSchemaFromVisual();
    } else {
      try {
        finalSchema = JSON.parse($("ed-raw-schema").value);
      } catch {
        toast("Input schema to'g'ri JSON formatida emas", "err");
        return;
      }
    }

    let defArgs = undefined;
    const defRaw = $("ed-default-args").value.trim();
    if (defRaw) {
      try { defArgs = JSON.parse(defRaw); }
      catch { toast("Standart argumentlar to'g'ri JSON emas", "err"); return; }
    }

    let fixArgs = undefined;
    const fixRaw = $("ed-fixed-args").value.trim();
    if (fixRaw) {
      try { fixArgs = JSON.parse(fixRaw); }
      catch { toast("Majburiy argumentlar to'g'ri JSON emas", "err"); return; }
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

  const sampleArgs = {};
  propKeys.forEach(k => {
    const t = props[k]?.type;
    if (t === "number" || t === "integer") sampleArgs[k] = 1;
    else if (t === "boolean") sampleArgs[k] = true;
    else if (t === "array") sampleArgs[k] = [];
    else if (t === "object") sampleArgs[k] = {};
    else sampleArgs[k] = "";
  });

  const m = openModal(`Toolni sinash: ${escapeHtml(tool.name)}`, `
    <div style="font-size:13px;color:var(--text-muted);margin-bottom:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
      <span>Connector: <code class="prefix-tag">${escapeHtml(c.name)}</code></span>
      <span>Tool: <code class="prefix-tag">${escapeHtml(tool.name)}</code></span>
    </div>

    <label>Argumentlar (JSON formatida)</label>
    <textarea id="tester-args" class="mono" rows="6" spellcheck="false">${escapeHtml(JSON.stringify(sampleArgs, null, 2))}</textarea>

    <div style="margin-top:14px;display:flex;gap:12px;align-items:center">
      <button class="ok" id="tester-call-btn" style="padding:8px 20px">
        ${icon("play")} Ishga tushirish (Call)
      </button>
      <span id="tester-loading" style="display:none;font-size:12.5px;color:var(--accent);display:inline-flex;align-items:center;gap:6px">
        ${icon("spinner")} Bajarilmoqda...
      </span>
    </div>

    <div id="tester-result-wrap" style="display:none;margin-top:16px">
      <div style="font-size:12.5px;font-weight:600;margin-bottom:6px" id="tester-status-header">Natija:</div>
      <pre class="test-result-box" id="tester-output"></pre>
    </div>
  `);

  $("tester-loading").style.display = "none";

  m.querySelector("[data-act=close]").onclick = () => {
    closeModal();
    openToolsEditor(c);
  };

  $("tester-call-btn").onclick = async () => {
    let args = {};
    const rawArgs = $("tester-args").value.trim();
    if (rawArgs) {
      try { args = JSON.parse(rawArgs); }
      catch { toast("Argumentlar to'g'ri JSON formatida emas", "err"); return; }
    }

    $("tester-loading").style.display = "inline-flex";
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
        $("tester-status-header").innerHTML = `<span style="color:var(--accent);display:inline-flex;align-items:center;gap:6px">${icon("check")} Muvaffaqiyatli (${duration}ms)</span>`;
        outBox.className = "test-result-box ok";
        outBox.textContent = JSON.stringify(res.result, null, 2);
      } else {
        $("tester-status-header").innerHTML = `<span style="color:var(--red);display:inline-flex;align-items:center;gap:6px">${icon("alert")} Xatolik (${duration}ms)</span>`;
        outBox.className = "test-result-box err";
        outBox.textContent = res.error || "Noma'lum xatolik";
      }
    } catch (err) {
      const duration = Math.round(performance.now() - t0);
      $("tester-result-wrap").style.display = "block";
      $("tester-status-header").innerHTML = `<span style="color:var(--red);display:inline-flex;align-items:center;gap:6px">${icon("alert")} Xatolik (${duration}ms)</span>`;
      const outBox = $("tester-output");
      outBox.className = "test-result-box err";
      outBox.textContent = err.message;
    } finally {
      $("tester-loading").style.display = "none";
      $("tester-call-btn").disabled = false;
    }
  };
}

// Spin animation style injected dynamically if needed
if (!document.getElementById("spin-style")) {
  const style = document.createElement("style");
  style.id = "spin-style";
  style.textContent = `
    .spin { animation: spinAround 1s linear infinite; }
    @keyframes spinAround { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

loadAccount();
