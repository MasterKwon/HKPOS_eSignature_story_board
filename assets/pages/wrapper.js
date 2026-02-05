/* ============================================
   HK POS eSignature - Wrapper Page
   - Wrapper page initialization (reserved for future use)
   ============================================ */

(function () {
  'use strict';

  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  function initWrapperPage() {
    // 테스트 데이터 동적 목록 제거됨. 필요 시 여기서 래퍼 전용 초기화 추가.
  }

  window.HKPOS.Pages = window.HKPOS.Pages || {};
  window.HKPOS.Pages.initWrapperPage = initWrapperPage;
})();
