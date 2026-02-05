/* ============================================
   HK POS eSignature - Screen Spec (Layout)
   - Common header/toast renderer for wrapper pages
   - Keeps HTML pages lightweight (data-* driven)
   ============================================ */

(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function ensureToast() {
    if (qs("#app-toast")) return;
    const el = document.createElement("div");
    el.className = "app-toast";
    el.id = "app-toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.innerHTML = `
      <div class="app-toast-title" id="app-toast-title">알림</div>
      <div class="app-toast-desc" id="app-toast-desc">메시지</div>
    `;
    document.body.appendChild(el);
  }

  function t(key) {
    return (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.t(key)) || key;
  }

  function renderTopbar(header) {
    const d = document.body.dataset || {};
    const titleKey = d.layoutTitleI18n;
    const subtitleKey = d.layoutSubtitleI18n;
    const title = (titleKey && t(titleKey) !== titleKey ? t(titleKey) : null) || d.layoutTitle || "";
    const subtitle = (subtitleKey && t(subtitleKey) !== subtitleKey ? t(subtitleKey) : null) || d.layoutSubtitle || "";
    const showCustomer = d.layoutShowCustomer !== "0";

    const storeLabel = t("topbar.store");
    const staffLabel = t("topbar.staff");
    const customerLabel = t("topbar.customer");
    const storeUnset = t("topbar.storeUnset");
    const staffUnset = t("topbar.staffUnset");
    const customerUnset = t("topbar.customerUnselected");
    const resetBtn = t("topbar.reset") !== "topbar.reset" ? t("topbar.reset") : "초기화";
    const helpBtn = t("topbar.helpHide") !== "topbar.helpHide" ? t("topbar.helpHide") : "설명 숨기기";
    const langKo = t("topbar.lang.ko");
    const langEn = t("topbar.lang.en");
    const langZh = t("topbar.lang.zh-Hant");

    const subtitleHtml = subtitle
      ? ` <span class="app-brand-subtitle app-brand-subtitle--inline">${esc(subtitle)}</span>`
      : "";

    const currentLang = (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.getLang()) || document.documentElement.lang || "ko";
    const selKo = currentLang === "ko" ? " selected" : "";
    const selEn = currentLang === "en" ? " selected" : "";
    const selZh = currentLang === "zh-Hant" ? " selected" : "";

    header.innerHTML = `
      <div class="app-brand">
        <div class="app-brand-row">
          <img class="app-logo" src="assets/logo.png" alt="AMOREPACIFIC" />
        </div>
        <div class="app-brand-title">${esc(title)}${subtitleHtml}</div>
      </div>
      <div class="app-topbar-actions">
        <span class="app-pill" id="app-store-pill">${esc(storeLabel)} ${esc(storeUnset)}</span>
        <span class="app-pill" id="app-staff-pill">${esc(staffLabel)} ${esc(staffUnset)}</span>
        ${showCustomer ? `<span class="app-pill" id="app-customer-pill">${esc(customerLabel)} ${esc(customerUnset)}</span>` : ""}
        <select id="app-language" class="language-select" aria-label="Language">
          <option value="ko"${selKo}>${esc(langKo)}</option>
          <option value="en"${selEn}>${esc(langEn)}</option>
          <option value="zh-Hant"${selZh}>${esc(langZh)}</option>
        </select>
        <button class="demo-btn-secondary" id="app-reset" type="button">${esc(resetBtn)}</button>
        <button class="demo-btn-secondary" id="toggle-help" type="button">${esc(helpBtn)}</button>
      </div>
    `;
  }

  window.HKPOS = window.HKPOS || {};
  window.HKPOS.renderTopbar = renderTopbar;

  function initPreviewIframes() {
    // Avoid "double-load" flicker by delaying the real src assignment.
    // Use data-src on the iframe and set the cache-busted src once here.
    const iframes = Array.from(document.querySelectorAll("iframe.device-frame__iframe"));
    if (!iframes.length) return;

    const stamp = String(Date.now());
    iframes.forEach((iframe) => {
      const dataSrc = iframe.getAttribute("data-src");
      if (!dataSrc) return;
      const sep = dataSrc.includes("?") ? "&" : "?";
      iframe.setAttribute("src", `${dataSrc}${sep}v=${stamp}`);
    });
  }

  function run() {
    // Only pages opting-in via attribute
    const header = qs('header[data-layout="topbar"]');
    if (header) renderTopbar(header);
    ensureToast();
    initPreviewIframes();
  }

  run();
})();

