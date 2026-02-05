/* ============================================
   HK POS eSignature - Main Entry Point
   - Initializes pages based on data-app-page attribute
   - Requires: config.js, utils.js, form-handler.js, pages/*.js
   ============================================ */

(function () {
  'use strict';

  // 네임스페이스 확인
  if (!window.HKPOS || !window.HKPOS.Pages || !window.HKPOS.Utils) {
    console.error('[App] Required modules not loaded. Make sure config.js, utils.js, and pages/*.js are loaded first.');
    return;
  }

  const Pages = window.HKPOS.Pages;
  const Utils = window.HKPOS.Utils;

  // 부모(래퍼)에서 언어 변경 시 postMessage로 전달받아 iframe 내부 언어 즉시 전환 (locale + applyPage + 페이지 init 재실행)
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'hkpos.setLang') return;
    var lang = e.data.lang;
    if (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.setLang) {
      window.HKPOS.i18n.setLang(lang).then(function () {
        if (window.HKPOS.i18n.applyPage) window.HKPOS.i18n.applyPage();
        var page = document.body && document.body.getAttribute('data-app-page');
        if (page && window.HKPOS.Pages) {
          if (page === 'tabs') document.body.removeAttribute('data-tabs-initialized');
          var runPageInit = function () {
            if (page === 'login' && window.HKPOS.Pages.initLoginPage) window.HKPOS.Pages.initLoginPage();
            else if (page === 'customer-search' && window.HKPOS.Pages.initCustomerSearchPage) window.HKPOS.Pages.initCustomerSearchPage();
            else if (page === 'consultation-selection' && window.HKPOS.Pages.initConsultationSelectionPage) window.HKPOS.Pages.initConsultationSelectionPage();
            else if (page === 'tabs' && window.HKPOS.Pages.initTabsPage) window.HKPOS.Pages.initTabsPage();
            else if (page === 'review' && window.HKPOS.Pages.initReviewPage) window.HKPOS.Pages.initReviewPage();
            else if (page === 'completion' && window.HKPOS.Pages.initCompletionPage) window.HKPOS.Pages.initCompletionPage();
          };
          if (page === 'tabs') requestAnimationFrame(runPageInit);
          else runPageInit();
        }
      });
    }
  });

  // 페이지 초기화
  document.addEventListener("DOMContentLoaded", function () {
    // 공통: 상단바 초기화
    if (Pages.initTopbar) {
      Pages.initTopbar();
    }

    // 공통: 고객 검색 테스트 케이스 렌더링 (i18n 로드 후 실행해 테스트 데이터 문구가 선택 언어로 나오도록)
    if (Utils.renderCustomerSearchTestCases && document.querySelector("#demo-customer-search-cases")) {
      var i18n = window.HKPOS && window.HKPOS.i18n;
      if (i18n && typeof i18n.ready === "function") {
        i18n.ready().then(function () {
          Utils.renderCustomerSearchTestCases();
        });
      } else {
        Utils.renderCustomerSearchTestCases();
      }
    }

    // 페이지별 초기화 (앱 iframe은 locale 로드 후 실행해 t()가 키가 아닌 번역문 반환하도록)
    var page = document.body.getAttribute("data-app-page") || "";
    var i18n = window.HKPOS && window.HKPOS.i18n;
    var runPageInit = function () {
      if (page === "list" && Pages.initListPage) {
        Pages.initListPage();
      } else if (page === "login" && Pages.initLoginPage) {
        Pages.initLoginPage();
      } else if (page === "customer-search" && Pages.initCustomerSearchPage) {
        Pages.initCustomerSearchPage();
      } else if (page === "consultation-selection" && Pages.initConsultationSelectionPage) {
        Pages.initConsultationSelectionPage();
      } else if (page === "tabs" && Pages.initTabsPage) {
        Pages.initTabsPage();
      } else if (page === "review" && Pages.initReviewPage) {
        Pages.initReviewPage();
      } else if (page === "completion" && Pages.initCompletionPage) {
        Pages.initCompletionPage();
      } else if (page === "wrapper" && Pages.initWrapperPage) {
        Pages.initWrapperPage();
      }
    };
    var needsI18n = ["login", "customer-search", "consultation-selection", "tabs", "review", "completion", "wrapper"].indexOf(page) !== -1;
    if (needsI18n && i18n && typeof i18n.ready === "function") {
      i18n.ready().then(runPageInit);
    } else {
      runPageInit();
    }
  });
})();
