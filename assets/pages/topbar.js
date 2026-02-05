/* ============================================
   HK POS eSignature - Topbar Page
   - Shared topbar initialization
   ============================================ */

(function () {
  'use strict';

  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  const STORAGE = window.HKPOS.STORAGE;
  const SAMPLE_STAFF = window.HKPOS.SAMPLE_STAFF;
  const DEMO = window.HKPOS.DEMO;
  const Utils = window.HKPOS.Utils;

  const { qs, setText, load, clearFlow, navTo, toast, applyLanguageState, initHelpToggle } = Utils;

  function t(key) {
    return (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.t(key)) || key;
  }

  function initTopbar() {
    initHelpToggle();
    applyLanguageState();

    const resetBtn = qs("#app-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        const msg = t("confirm.reset");
        const ok = window.confirm(typeof msg === "string" && msg !== "confirm.reset" ? msg : "데모 데이터를 초기화할까요?\n\n- 직원/고객/선택항목/서명 데이터가 삭제됩니다.\n- 이후 목록(홈) 화면으로 이동합니다.");
        if (!ok) return;
        clearFlow();
        navTo("index.html");
      });
    }

    const lang = qs("#app-language");
    if (lang) {
      lang.addEventListener("change", function () {
        const next = String(lang.value || "ko");
        if (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.setLang) {
          window.HKPOS.i18n.setLang(next).then(function () {
            toast(t("toast.title"), t("toast.langChanged"));
          });
        } else {
          localStorage.setItem(DEMO.lang, next);
          applyLanguageState(next);
          toast("언어(설계)", "현재 설계서는 한글로 작성되어 있습니다. 설계 완료 후 영문/번체를 일괄 적용합니다.");
        }
      });
    }

    const storePrefix = t("topbar.store") !== "topbar.store" ? t("topbar.store") : "매장:";
    const staffPrefix = t("topbar.staff") !== "topbar.staff" ? t("topbar.staff") : "직원:";
    const customerPrefix = t("topbar.customer") !== "topbar.customer" ? t("topbar.customer") : "고객:";

    const staff = load(STORAGE.staff, null);
    if (staff && staff.storeName) {
      const storeLabel = staff.storeId ? `${staff.storeName} (${staff.storeId})` : staff.storeName;
      setText("#app-store-pill", storePrefix + " " + storeLabel);
    } else if (staff && staff.store) {
      setText("#app-store-pill", storePrefix + " " + staff.store);
    }
    const reviewStaffId = load(STORAGE.reviewStaff, '');
    if (reviewStaffId) {
      const reviewStaff = SAMPLE_STAFF.find(s => s.staffId === reviewStaffId);
      if (reviewStaff) {
        const staffLabel = reviewStaff.name ? `${reviewStaff.staffId} • ${reviewStaff.name}` : reviewStaff.staffId;
        setText("#app-staff-pill", staffPrefix + " " + staffLabel);
      }
    } else if (staff && staff.staffId) {
      const label = staff.name ? `${staff.staffId} • ${staff.name}` : staff.staffId;
      setText("#app-staff-pill", staffPrefix + " " + label);
    }

    const customer = load(STORAGE.customer, null);
    if (customer) {
      const customerLabel = customer.id ? `${customer.name} • ${customer.id}` : customer.name;
      setText("#app-customer-pill", customerPrefix + " " + customerLabel);
    }
  }

  window.HKPOS.Pages = window.HKPOS.Pages || {};
  window.HKPOS.Pages.initTopbar = initTopbar;
})();
