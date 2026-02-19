/* ============================================
   HK POS eSignature - Utilities
   - Helper functions, DOM manipulation, localStorage, navigation
   ============================================ */

(function () {
  'use strict';

  // 네임스페이스 확인
  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  const STORAGE = window.HKPOS.STORAGE;
  const FORM_CATALOG = window.HKPOS.FORM_CATALOG;
  const SAMPLE_CUSTOMERS = window.HKPOS.SAMPLE_CUSTOMERS;
  const SAMPLE_STAFF = window.HKPOS.SAMPLE_STAFF;
  const FLOW_PAGES = window.HKPOS.FLOW_PAGES;
  const DEMO = window.HKPOS.DEMO;

  // ---------- Date/Time Formatting ----------
  function formatDateHK(date) {
    const d = date || new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function formatTimeHK(date) {
    const d = date || new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // ---------- DOM Helpers ----------
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function setText(sel, text) {
    const el = qs(sel);
    if (el) el.textContent = text;
  }

  // ---------- localStorage Helpers ----------
  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function load(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return safeJsonParse(raw, fallback);
  }

  function clearFlow() {
    localStorage.removeItem(STORAGE.staff);
    localStorage.removeItem(STORAGE.customer);
    localStorage.removeItem(STORAGE.selectedForms);
    localStorage.removeItem(STORAGE.signature);
    localStorage.removeItem(STORAGE.customerRealName);
    localStorage.removeItem(STORAGE.reviewStaff);
    localStorage.removeItem(STORAGE.bcNotes);
    localStorage.removeItem(STORAGE.deliveryMethod);
    localStorage.removeItem(STORAGE.completionStatus);
    localStorage.removeItem(STORAGE.errorType);
  }

  function clearFlowExceptStaff() {
    localStorage.removeItem(STORAGE.customer);
    localStorage.removeItem(STORAGE.selectedForms);
    localStorage.removeItem(STORAGE.signature);
    localStorage.removeItem(STORAGE.customerRealName);
    localStorage.removeItem(STORAGE.reviewStaff);
    localStorage.removeItem(STORAGE.bcNotes);
    localStorage.removeItem(STORAGE.deliveryMethod);
    localStorage.removeItem(STORAGE.completionStatus);
    localStorage.removeItem(STORAGE.errorType);
  }

  // ---------- UI Helpers ----------
  function toast(title, desc) {
    const el = qs("#app-toast");
    if (!el) return;
    setText("#app-toast-title", title);
    setText("#app-toast-desc", desc);
    el.classList.add("show");
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => el.classList.remove("show"), 2600);
  }

  function navTo(href) {
    window.location.href = href;
  }

  function isTabletApp() {
    const p = decodeURIComponent(window.location.pathname || "").toLowerCase();
    return p.includes("/app/");
  }

  function isEmbeddedPreview() {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  function navFlow(key) {
    const cfg = FLOW_PAGES[key];
    if (!cfg) return;
    if (isTabletApp()) {
      if (isEmbeddedPreview()) {
        try {
          const parentPath = window.parent.location.pathname;
          const parentDir = parentPath.substring(0, parentPath.lastIndexOf('/') + 1);
          window.parent.location.href = parentDir + cfg.wrapper;
        } catch (e) {
          window.parent.location.href = cfg.wrapper;
        }
      } else {
        navTo(cfg.tablet);
      }
    } else {
      navTo(cfg.wrapper);
    }
  }

  // ---------- Demo Layout Helpers ----------
  function applyLanguageState(nextLang) {
    const lang = nextLang || localStorage.getItem(DEMO.lang) || document.documentElement.lang || "ko";
    document.documentElement.lang = lang;
    const sel = qs("#app-language");
    if (sel) sel.value = lang;
  }

  function applyHelpCollapsedState() {
    const collapsed = localStorage.getItem(DEMO.helpCollapsed) === "1";
    document.body.classList.toggle("help-collapsed", collapsed);
    const btn = qs("#toggle-help");
    if (btn) {
      const showT = window.HKPOS && window.HKPOS.i18n ? window.HKPOS.i18n.t("topbar.helpShow") : "설명 보이기";
      const hideT = window.HKPOS && window.HKPOS.i18n ? window.HKPOS.i18n.t("topbar.helpHide") : "설명 숨기기";
      btn.textContent = collapsed ? (showT !== "topbar.helpShow" ? showT : "설명 보이기") : (hideT !== "topbar.helpHide" ? hideT : "설명 숨기기");
    }
  }

  function initHelpToggle() {
    const btn = qs("#toggle-help");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const next = !(document.body.classList.contains("help-collapsed"));
      localStorage.setItem(DEMO.helpCollapsed, next ? "1" : "0");
      applyHelpCollapsedState();
    });
    applyHelpCollapsedState();
  }

  // ---------- Customer Helpers ----------
  function formatCustomerLine(c) {
    return `${c.name} • ${c.phone} • ${c.id}`;
  }

  function renderCustomerDetail(customer) {
    const host = qs("#customer-detail");
    if (!host || !customer) return;
    const t = (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.t)
      ? window.HKPOS.i18n.t.bind(window.HKPOS.i18n) : function (k, p) { if (p && p.count !== undefined) return String(k).replace("{count}", p.count); return k; };
    // 6행 구조: Ms. Mrs. Mr. | Name | Member No. | Phone No. | Email | Member Grade
    const setVal = (id, val) => { const el = qs("#" + id); if (el) el.textContent = val != null && val !== "" ? String(val) : ""; };
    setVal("customer-val-title", customer.title || customer.honorific || "");
    setVal("customer-val-name", customer.name || "");
    setVal("customer-val-memberNo", customer.id || "");
    setVal("customer-val-phone", customer.phone || "");
    setVal("customer-val-email", customer.email || "");
    setVal("customer-val-grade", customer.tier || "");
    const packages = Array.isArray(customer.availablePackages) ? customer.availablePackages : [];
    const hasPackages = packages.length > 0;
    const availPkg = t("app.customerSearch.availablePackages");
    const pkgCount = hasPackages ? t("app.customerSearch.packagesCount", { count: packages.length }) : "";
    const pkgName = t("app.customerSearch.packageName");
    const remainL = t("app.customerSearch.remainQtyValue");
    const expiryL = t("app.customerSearch.expiryDate");
    const issueL = t("app.customerSearch.issueStore");
    const noPkg = t("app.customerSearch.noPackages");
    const remainUnit = t("app.customerSearch.remainQtyUnit");
    host.innerHTML = `
      <div style="display: none; padding-top: 8px; border-top: 1px solid var(--border-light);">
        <button type="button" id="toggle-packages" style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 0; background: none; border: none; cursor: pointer; text-align: left;">
          <div style="font-weight: var(--font-weight-medium); color: var(--text-primary); font-size: var(--font-size-base);">${availPkg} ${hasPackages ? `<span style="color: var(--text-secondary); font-weight: normal; font-size: var(--font-size-sm);">${pkgCount}</span>` : ""}</div>
          <span id="toggle-packages-icon" style="color: var(--text-secondary); font-size: 12px; flex: 0 0 auto;">▼</span>
        </button>
        <div id="packages-content" style="display: none; margin-top: 6px; overflow-x: auto;">
          ${
            hasPackages
              ? `
                <table style="width: 100%; border-collapse: collapse; font-size: var(--font-size-sm);">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border-light); background: var(--bg-secondary);">
                    <th style="padding: 8px 6px; text-align: left; font-weight: var(--font-weight-medium); color: var(--text-primary);">${pkgName}</th>
                    <th style="padding: 8px 6px; text-align: right; font-weight: var(--font-weight-medium); color: var(--text-primary);">${remainL}</th>
                    <th style="padding: 8px 6px; text-align: center; font-weight: var(--font-weight-medium); color: var(--text-primary);">${expiryL}</th>
                    <th style="padding: 8px 6px; text-align: left; font-weight: var(--font-weight-medium); color: var(--text-primary);">${issueL}</th>
                  </tr>
                  </thead>
                  <tbody>
                    ${packages
                      .map(
                        (p) => `
                      <tr style="border-bottom: 1px solid var(--border-light);">
                        <td style="padding: 10px 6px; color: var(--text-primary);">${p.packageName}</td>
                        <td style="padding: 10px 6px; text-align: right; color: var(--text-secondary);">${p.remainQty ? `${p.remainQty}${remainUnit}` : `HK$${p.remainValue?.toLocaleString() || 0}`}</td>
                        <td style="padding: 10px 6px; text-align: center; color: var(--text-secondary);">${p.expiryDate}</td>
                        <td style="padding: 10px 6px; color: var(--text-secondary); font-size: 11px;">${p.issueStoreName}<br><span style="color: var(--text-light);">${p.issueStoreCode}</span></td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
              : `<div style="color: var(--text-secondary); font-size: var(--font-size-sm);">${noPkg}</div>`
          }
        </div>
      </div>
    `;

    // 접기/펼치기 토글
    const toggleBtn = qs("#toggle-packages", host);
    const toggleIcon = qs("#toggle-packages-icon", host);
    const content = qs("#packages-content", host);
    if (toggleBtn && toggleIcon && content) {
      toggleBtn.addEventListener("click", function () {
        const isExpanded = content.style.display !== "none";
        content.style.display = isExpanded ? "none" : "block";
        toggleIcon.textContent = isExpanded ? "▼" : "▲";
      });
    }
  }

  // ---------- Form Helpers ----------
  function getSelectedForms() {
    const keys = load(STORAGE.selectedForms, []);
    return keys
      .map((k) => FORM_CATALOG.find((f) => f.key === k))
      .filter(Boolean);
  }

  function needsSignature(forms) {
    return forms.some((f) => !!f.requiresSignature);
  }

  // ---------- Demo Helpers ----------
  function getDemoStaffByStore(staffList) {
    const list = Array.isArray(staffList) ? staffList : [];
    const byStore = new Map();
    for (const s of list) {
      if (!s || !s.storeId) continue;
      if (!byStore.has(s.storeId)) byStore.set(s.storeId, s);
    }
    return Array.from(byStore.values());
  }

  function renderLoginTestAccounts() {
    const host = qs("#demo-staff-accounts");
    if (!host) return;

    const t = (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.t)
      ? window.HKPOS.i18n.t.bind(window.HKPOS.i18n) : function (k, p) { return (p && p.staffId) ? k.replace("{staffId}", p.staffId) : k; };
    const fillBtnText = t("common.fillButton");
    const toastTitle = t("toast.title");

    const picks = getDemoStaffByStore(SAMPLE_STAFF);
    if (!picks.length) {
      host.textContent = "-";
      return;
    }

    host.innerHTML = `
      <div style="display:grid; gap: 8px;">
        ${picks
          .map((s) => {
            const line = `${s.storeId} | ${s.staffId} | ${s.name}`;
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; gap: 10px; padding: 8px 10px; border: 1px solid var(--border-light); border-radius: var(--border-radius); background: var(--bg-primary);">
                <div style="min-width: 0; color: var(--text-secondary); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  <span style="color: var(--text-primary); font-weight: var(--font-weight-medium);">${line}</span>
                  <span style="color: var(--text-light);"> • PW ${s.password}</span>
                </div>
                <button class="demo-btn-secondary" type="button" data-fill-login="${s.staffId}" style="min-width: 78px; min-height: 36px; padding: 6px 10px;">${fillBtnText}</button>
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    // Click → fill into the login iframe
    qsa("[data-fill-login]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const staffId = btn.getAttribute("data-fill-login") || "";
        const staff = SAMPLE_STAFF.find((x) => x.staffId === staffId);
        if (!staff) return;

        const iframe = qs("#login-preview-iframe");
        const win = iframe && iframe.contentWindow;
        if (!win) {
          toast(toastTitle, t("toast.fillLoginNotFound"));
          return;
        }
        win.postMessage({ type: "demo.fillLogin", staffId: staff.staffId, password: staff.password }, "*");
        toast(toastTitle, t("toast.fillLoginDone", { staffId: staff.staffId }));
      });
    });
  }

  // ---------- Customer Search Helpers ----------
  function normalizePhone(value) {
    return String(value || "").replaceAll(/[^0-9]/g, "");
  }

  function renderCustomerResults(list, criteria, opts) {
    const box = qs("#search-results");
    if (!box) return;
    const t = (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.t)
      ? window.HKPOS.i18n.t.bind(window.HKPOS.i18n) : function (k, p) { if (p && p.count !== undefined) return String(k).replace("{count}", p.count); return k; };
    const onPick = opts && typeof opts.onPick === "function" ? opts.onPick : null;
    const selected = load(STORAGE.customer, null);
    const selectedId = selected && selected.id ? String(selected.id) : "";
    const c = criteria || {};
    const phone = normalizePhone(c.phone);
    const name = String(c.name || "").trim().toLowerCase();
    const email = String(c.email || "").trim().toLowerCase();

    const filtered = list.filter((c) => {
      // AND 조건: 입력된 필드만 교집합 필터
      if (phone && !normalizePhone(c.phone).includes(phone)) return false;
      if (name && !c.name.toLowerCase().includes(name)) return false;
      if (email && !c.email.toLowerCase().includes(email)) return false;
      return true;
    });

    const resultTitleEl = qs("#result-title");
    if (resultTitleEl) {
      resultTitleEl.textContent = t("app.customerSearch.resultCount", { count: filtered.length });
    }

    if (filtered.length === 0) {
      box.innerHTML = `<div class="result-placeholder"><p>${t("app.customerSearch.noMatch")}</p></div>`;
      return { count: 0 };
    }

    const customerIdLabel = t("app.customerSearch.customerIdLabel");
    box.innerHTML = `
      <div class="customer-result">
        <div style="margin-top: 0; display: grid; gap: 10px;">
          ${filtered
            .map(
              (c) => {
                const isSelected = selectedId === c.id;
                return `
                <div class="customer-card" data-customer="${c.id}" style="border:1px solid ${isSelected ? "rgba(0, 122, 255, 0.65)" : "var(--border-light)"}; box-shadow: ${isSelected ? "0 0 0 3px rgba(0, 122, 255, 0.10)" : "none"}; border-radius: var(--border-radius); padding: 12px; cursor: pointer; transition: all 0.2s;">
                  <div style="display:flex; align-items:center; gap: 12px;">
                    <div style="flex: 0 0 auto; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: var(--border-radius); background: ${isSelected ? "rgba(0, 122, 255, 0.10)" : "transparent"};">
                      ${isSelected ? '<span style="color: var(--primary-color); font-size: 18px; font-weight: bold;">✓</span>' : ''}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: var(--font-weight-medium); color: var(--text-primary); min-width: 0; overflow:hidden; text-overflow: ellipsis; white-space: nowrap;">${c.name} <span style="color: var(--text-secondary); font-weight: normal;">[${c.tier}]</span></div>
                      <div style="color: var(--text-secondary); font-size: var(--font-size-sm); margin-top: 2px;">${c.phone} • ${c.email}</div>
                      <div style="color: var(--text-light); font-size: 12px; margin-top: 4px;">${customerIdLabel} ${c.id}</div>
                    </div>
                  </div>
                </div>
              `
              }
            )
            .join("")}
        </div>
      </div>
    `;

    qsa(".customer-card").forEach((card) => {
      card.addEventListener("click", function (e) {
        if (e.target.closest("button")) return;
        const id = card.getAttribute("data-customer");
        const customer = SAMPLE_CUSTOMERS.find((c) => c.id === id);
        if (!customer) return;
        save(STORAGE.customer, customer);
        toast(t("toast.customerSelected"), formatCustomerLine(customer));
        setText("#app-customer-pill", customer.name);
        if (onPick) onPick(customer);
      });
    });

    return { count: filtered.length };
  }

  function renderCustomerSearchTestCases() {
    const host = qs("#demo-customer-search-cases");
    if (!host) return;

    const t = (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.t)
      ? window.HKPOS.i18n.t.bind(window.HKPOS.i18n) : function (k) { return k; };
    const fillBtnText = t("common.fillButton");
    const toastTitle = t("toast.fillSearchTitle");
    const phoneLabel = t("app.customerSearch.phoneLabel");
    const nameLabel = t("app.customerSearch.nameLabel");
    const emailLabel = t("app.customerSearch.emailLabel");

    const cases = [
      { labelKey: "testData.searchCase1", expectKey: "testData.searchCase1Expect", criteria: { phone: "62341188", name: "", email: "" } },
      { labelKey: "testData.searchCase2", expectKey: "testData.searchCase2Expect", criteria: { phone: "", name: "Lee", email: "" } },
      { labelKey: "testData.searchCase3", expectKey: "testData.searchCase3Expect", criteria: { phone: "", name: "", email: "no.result@example.com" } },
    ];

    host.innerHTML = `
      <div style="display:grid; gap: 8px;">
        ${cases
          .map((c, idx) => {
            const label = t(c.labelKey);
            const expect = t(c.expectKey);
            const line = `${label} • ${expect}`;
            const detail = [
              c.criteria.phone ? `${phoneLabel}${c.criteria.phone}` : "",
              c.criteria.name ? `${nameLabel}${c.criteria.name}` : "",
              c.criteria.email ? `${emailLabel}${c.criteria.email}` : "",
            ]
              .filter(Boolean)
              .join(" | ");
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; gap: 10px; padding: 8px 10px; border: 1px solid var(--border-light); border-radius: var(--border-radius); background: var(--bg-primary);">
                <div style="min-width: 0; color: var(--text-secondary); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  <span style="color: var(--text-primary); font-weight: var(--font-weight-medium);">${line}</span>
                  <span style="color: var(--text-light);"> • ${detail}</span>
                </div>
                <button class="demo-btn-secondary" type="button" data-fill-search-case="${idx}" style="min-width: 78px; min-height: 36px; padding: 6px 10px;">${fillBtnText}</button>
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    qsa("[data-fill-search-case]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const idx = Number(btn.getAttribute("data-fill-search-case"));
        const picked = cases[idx];
        if (!picked) return;

        const iframe = qs("#customer-search-preview-iframe");
        if (!iframe) {
          toast(toastTitle, t("toast.fillSearchNotFound"));
          return;
        }

        const sendMessage = function() {
          const win = iframe.contentWindow;
          if (!win) {
            toast(toastTitle, t("toast.fillSearchNotFoundIframe"));
            return;
          }
          win.postMessage({ type: "demo.fillCustomerSearch", criteria: picked.criteria, autoSearch: false }, "*");
          toast(toastTitle, t("toast.fillSearchDone"));
        };

        if (iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
          sendMessage();
        } else {
          iframe.addEventListener("load", sendMessage, { once: true });
          setTimeout(function() {
            if (!iframe.contentWindow) {
              toast(toastTitle, t("toast.fillSearchTimeout"));
            }
          }, 5000);
        }
      });
    });
  }

  // ---------- Export to window.HKPOS ----------
  window.HKPOS.Utils = {
    // Date/Time
    formatDateHK,
    formatTimeHK,
    // DOM
    qs,
    qsa,
    setText,
    // localStorage
    save,
    load,
    clearFlow,
    clearFlowExceptStaff,
    // UI
    toast,
    navTo,
    navFlow,
    isTabletApp,
    isEmbeddedPreview,
    // Demo Layout
    applyLanguageState,
    applyHelpCollapsedState,
    initHelpToggle,
    // Customer
    formatCustomerLine,
    renderCustomerDetail,
    normalizePhone,
    renderCustomerResults,
    renderCustomerSearchTestCases,
    // Form
    getSelectedForms,
    needsSignature,
    // Demo
    getDemoStaffByStore,
    renderLoginTestAccounts,
  };
})();
