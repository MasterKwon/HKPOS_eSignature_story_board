/* ============================================
   HK POS eSignature - List Page
   - Home/landing page initialization
   ============================================ */

(function () {
  'use strict';

  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  const Utils = window.HKPOS.Utils;

  const { qs, clearFlow, navFlow } = Utils;

  function initListPage() {
    const openFlow = qs("#open-flow");
    if (openFlow) {
      openFlow.addEventListener("click", function (e) {
        e.preventDefault();
        clearFlow();
        navFlow("login");
      });
    }
  }

  window.HKPOS.Pages = window.HKPOS.Pages || {};
  window.HKPOS.Pages.initListPage = initListPage;
})();
