/* ============================================
   HK POS eSignature - Login Page
   - Staff login page initialization
   ============================================ */

(function () {
  'use strict';

  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  const STORAGE = window.HKPOS.STORAGE;
  const SAMPLE_STAFF = window.HKPOS.SAMPLE_STAFF;
  const Utils = window.HKPOS.Utils;

  const { qs, save, navFlow, toast, renderLoginTestAccounts } = Utils;

  function t(key, params) {
    if (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.t) {
      return window.HKPOS.i18n.t(key, params);
    }
    return key;
  }

  function initLoginPage() {
    // Wrapper 우측 패널: 테스트 계정 렌더(i18n 로드 후에 실행해 버튼 문구가 키가 아닌 번역으로 나오도록)
    var i18n = window.HKPOS && window.HKPOS.i18n;
    if (i18n && typeof i18n.ready === "function") {
      i18n.ready().then(function () {
        renderLoginTestAccounts();
      });
    } else {
      renderLoginTestAccounts();
    }

    const toggle = qs("#password-toggle");
    const pw = qs("#staff-password");
    if (toggle && pw) {
      toggle.addEventListener("click", function () {
        const next = pw.type === "password" ? "text" : "password";
        pw.type = next;
        toggle.textContent = next === "password" ? "👁️" : "🙈";
      });
    }

    const loginBtn = qs("#login-btn");
    if (!loginBtn) return;

    loginBtn.addEventListener("click", function () {
      const staffId = (qs("#staff-id")?.value || "").trim();
      const password = (qs("#staff-password")?.value || "").trim();
      const storeFromInput = (qs("#store-id")?.value || "").trim();
      const errBox = qs("#login-error");
      if (errBox) errBox.style.display = "none";

      if (!staffId || !password) {
        if (errBox) {
          errBox.textContent = t("app.login.errorRequired");
          errBox.style.display = "block";
        }
        toast(t("toast.title"), t("app.login.toastRequired"));
        return;
      }

      // 샘플 직원 검증(데모)
      const staff = SAMPLE_STAFF.find((s) => String(s.staffId).toLowerCase() === staffId.toLowerCase());
      if (!staff) {
        if (errBox) {
          errBox.textContent = t("app.login.errorStaffNotFound");
          errBox.style.display = "block";
        }
        toast(t("toast.title"), t("app.login.toastStaffNotFound", { ids: SAMPLE_STAFF.map((s) => s.staffId).join(", ") }));
        return;
      }
      if (String(staff.password) !== password) {
        if (errBox) {
          errBox.textContent = t("app.login.errorPasswordWrong");
          errBox.style.display = "block";
        }
        toast(t("toast.title"), t("app.login.toastPasswordWrong"));
        return;
      }

      // 성공 시에만 새 세션 초기화(실패 시 기존 진행 상태를 건드리지 않음)
      localStorage.removeItem(STORAGE.customer);
      localStorage.removeItem(STORAGE.selectedForms);
      localStorage.removeItem(STORAGE.signature);

      save(STORAGE.staff, {
        staffId: staff.staffId,
        name: staff.name,
        storeId: staff.storeId,
        storeName: staff.storeName,
        brandCd: staff.brandCd,
        store: storeFromInput || staff.storeName || "HK20 • VIP Center",
        loggedInAt: new Date().toISOString(),
      });
      toast(t("toast.title"), t("app.login.toastSuccess"));
      window.setTimeout(() => navFlow("customerSearch"), 450);
    });
  }

  window.HKPOS.Pages = window.HKPOS.Pages || {};
  window.HKPOS.Pages.initLoginPage = initLoginPage;
})();
