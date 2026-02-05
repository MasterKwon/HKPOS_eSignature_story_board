/* ============================================
   HK POS eSignature - Completion Page
   - Completion/result page initialization
   ============================================ */

(function () {
  'use strict';

  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  const STORAGE = window.HKPOS.STORAGE;
  const SAMPLE_STAFF = window.HKPOS.SAMPLE_STAFF;
  const Utils = window.HKPOS.Utils;

  const { qs, load, save, formatCustomerLine, getSelectedForms, clearFlowExceptStaff, navFlow, toast } = Utils;

  function t(key, params) {
    if (!window.HKPOS || !window.HKPOS.i18n || !window.HKPOS.i18n.t) return key;
    var s = window.HKPOS.i18n.t(key, params);
    return s != null ? s : key;
  }

  function initCompletionPage() {
    const statusIcon = qs("#status-icon");
    const statusTitle = qs("#status-title");
    const statusMessage = qs("#status-message");
    const resultContent = qs("#result-content");
    const retryBtn = qs("#retry-submit");
    
    // 저장된 상태 확인 (기본값: success)
    let completionStatus = load(STORAGE.completionStatus, "success");
    let errorType = load(STORAGE.errorType, "network");
    
    const customer = load(STORAGE.customer, null);
    const forms = getSelectedForms();
    const reviewStaffId = load(STORAGE.reviewStaff, "");
    const deliveryMethod = load(STORAGE.deliveryMethod, "none");
    const bcNotes = load(STORAGE.bcNotes, "");
    
    // 담당 BC 정보 찾기
    let reviewStaff = null;
    if (reviewStaffId) {
      reviewStaff = SAMPLE_STAFF.find(s => s.staffId === reviewStaffId);
    }
    
    function deliveryLabel(method) {
      if (method === "email") return t("app.delivery.email");
      if (method === "print") return t("app.delivery.print");
      return t("app.delivery.none");
    }

    const retryableByErrorType = {
      network: true,
      validation: false,
      server: true,
      permission: false,
    };
    
    // postMessage로 상태 업데이트 받기
    window.addEventListener("message", function(e) {
      if (e.data && e.data.type === "updateCompletionStatus") {
        const newStatus = e.data.status || "success";
        const newErrorType = e.data.errorType || "network";
        
        // localStorage에 저장
        save(STORAGE.completionStatus, newStatus);
        if (newErrorType) {
          save(STORAGE.errorType, newErrorType);
        } else {
          localStorage.removeItem(STORAGE.errorType);
        }
        
        // 상태 변수 업데이트
        completionStatus = newStatus;
        errorType = newErrorType;
        
        // UI 다시 렌더링 (기존 로직 재사용)
        renderCompletionUI();
      }
    });
    
    // UI 렌더링 함수
    function renderCompletionUI() {
      // 최신 상태 다시 읽기
      const currentStatus = load(STORAGE.completionStatus, "success");
      const currentErrorType = load(STORAGE.errorType, "network");
      
      // 최신 데이터 다시 로드
      const currentCustomer = load(STORAGE.customer, null);
      const currentForms = getSelectedForms();
      const currentReviewStaffId = load(STORAGE.reviewStaff, "");
      const currentDeliveryMethod = load(STORAGE.deliveryMethod, "none");
      const currentBcNotes = load(STORAGE.bcNotes, "");
      
      let currentReviewStaff = null;
      if (currentReviewStaffId) {
        currentReviewStaff = SAMPLE_STAFF.find(s => s.staffId === currentReviewStaffId);
      }
      
      // 성공/오류 UI 업데이트
      if (currentStatus === "error") {
        const typeKey =
          currentErrorType === "validation"
            ? "validation"
            : currentErrorType === "server"
              ? "server"
              : currentErrorType === "permission"
                ? "permission"
                : "network";
        const retryable = !!retryableByErrorType[typeKey];
        
        // 아이콘 변경
        if (statusIcon) {
          statusIcon.style.background = "rgba(255, 59, 48, 0.15)";
          statusIcon.innerHTML = '<span style="font-size: 48px; color: var(--error-color, #ff3b30);">✕</span>';
        }
        
        // 제목/메시지 변경
        if (statusTitle) statusTitle.textContent = t("app.completion.error.title");
        if (statusMessage) statusMessage.textContent = t("app.completion.error." + typeKey + ".message");
        
        // 재전송 버튼 표시 (재전송 가능한 경우만)
        if (retryBtn) {
          retryBtn.style.display = retryable ? "inline-block" : "none";
        }
        
        // 오류 결과 표시
        if (resultContent) {
          const noneText = t("common.none");
          const formsCountText = t("app.tabs.formsCount", { count: currentForms.length });
          resultContent.innerHTML = `
            <div style="margin-bottom: 16px;">
              <div style="font-weight: var(--font-weight-medium); color: var(--text-primary); margin-bottom: 8px;">${t("app.completion.result.attemptInfoTitle")}</div>
              <div style="padding: 12px; background: white; border-radius: var(--border-radius); border: 1px solid var(--border-light);">
                <div style="margin-bottom: 8px;"><strong>${t("app.completion.result.customerLabel")}</strong> ${currentCustomer ? formatCustomerLine(currentCustomer) : noneText}</div>
                <div style="margin-bottom: 8px;"><strong>${t("app.completion.result.formsLabel")}</strong> ${formsCountText}</div>
                <div style="margin-bottom: 8px;"><strong>${t("app.completion.result.bcLabel")}</strong> ${currentReviewStaff ? `${currentReviewStaff.name} (${currentReviewStaff.staffId})` : noneText}</div>
                <div style="margin-bottom: 8px;"><strong>${t("app.completion.result.deliveryLabel")}</strong> ${deliveryLabel(currentDeliveryMethod)}</div>
                ${currentBcNotes ? `<div><strong>${t("app.completion.result.notesLabel")}</strong> ${currentBcNotes}</div>` : ""}
              </div>
            </div>
            <div style="padding: 12px; background: rgba(255, 59, 48, 0.10); border-radius: var(--border-radius); border: 1px solid rgba(255, 59, 48, 0.20);">
              <div style="font-weight: var(--font-weight-medium); color: var(--error-color, #ff3b30); margin-bottom: 4px;">✕ ${t("app.completion.result.sendFailedTitle")}</div>
              <div style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 8px;">${t("app.completion.error." + typeKey + ".detail")}</div>
              <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                <strong>${t("app.completion.result.errorTypeLabel")}</strong> ${t("app.completion.errorType." + typeKey)}
              </div>
            </div>
          `;
        }
      } else {
        // 성공 UI
        if (statusIcon) {
          statusIcon.style.background = "rgba(52, 199, 89, 0.15)";
          statusIcon.innerHTML = '<span style="font-size: 48px; color: var(--success-color, #34c759);">✓</span>';
        }
        
        if (statusTitle) statusTitle.textContent = t("app.completion.statusSuccess");
        if (statusMessage) statusMessage.textContent = t("app.completion.messageSuccess");
        
        // 재전송 버튼 숨김
        if (retryBtn) {
          retryBtn.style.display = "none";
        }
        
        // 성공 결과 표시
        if (resultContent) {
          const noneText = t("common.none");
          const formsCountText = t("app.tabs.formsCount", { count: currentForms.length });
          resultContent.innerHTML = `
            <div style="margin-bottom: 16px;">
              <div style="font-weight: var(--font-weight-medium); color: var(--text-primary); margin-bottom: 8px;">${t("app.completion.result.storedInfoTitle")}</div>
              <div style="padding: 12px; background: white; border-radius: var(--border-radius); border: 1px solid var(--border-light);">
                <div style="margin-bottom: 8px;"><strong>${t("app.completion.result.customerLabel")}</strong> ${currentCustomer ? formatCustomerLine(currentCustomer) : noneText}</div>
                <div style="margin-bottom: 8px;"><strong>${t("app.completion.result.formsLabel")}</strong> ${formsCountText}</div>
                <div style="margin-bottom: 8px;"><strong>${t("app.completion.result.bcLabel")}</strong> ${currentReviewStaff ? `${currentReviewStaff.name} (${currentReviewStaff.staffId})` : noneText}</div>
                <div style="margin-bottom: 8px;"><strong>${t("app.completion.result.deliveryLabel")}</strong> ${deliveryLabel(currentDeliveryMethod)}</div>
                ${currentBcNotes ? `<div><strong>${t("app.completion.result.notesLabel")}</strong> ${currentBcNotes}</div>` : ""}
              </div>
            </div>
            <div style="padding: 12px; background: rgba(52, 199, 89, 0.10); border-radius: var(--border-radius); border: 1px solid rgba(52, 199, 89, 0.20);">
              <div style="font-weight: var(--font-weight-medium); color: var(--success-color, #34c759); margin-bottom: 4px;">✓ ${t("app.completion.posSavedTitle")}</div>
              <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">${t("app.completion.posSavedDesc")}</div>
            </div>
          `;
        }
      }
    }
    
    // 초기 UI 렌더링
    renderCompletionUI();
    
    // 재전송 버튼
    if (retryBtn) {
      retryBtn.addEventListener("click", function() {
        // 재전송 시뮬레이션 (50% 확률로 성공)
        const retrySuccess = Math.random() > 0.5;
        if (retrySuccess) {
          save(STORAGE.completionStatus, "success");
          toast(t("app.completion.toastRetrySuccessTitle"), t("app.completion.toastRetrySuccessDesc"));
        } else {
          // 같은 오류 유형 유지
          toast(t("app.completion.toastRetryFailTitle"), t("app.completion.toastRetryFailDesc"));
        }
        // 페이지 새로고침하여 상태 업데이트
        setTimeout(() => {
          window.location.reload();
        }, 500);
      });
    }
    
    // 처음으로 버튼
    const backToStart = qs("#back-to-start");
    if (backToStart) {
      backToStart.addEventListener("click", function() {
        const msg = t("confirm.backToStartCompletion");
        if (confirm(typeof msg === "string" && msg !== "confirm.backToStartCompletion" ? msg : "Return to start?")) {
          clearFlowExceptStaff();
          navFlow("customerSearch");
        }
      });
    }
  }

  window.HKPOS.Pages = window.HKPOS.Pages || {};
  window.HKPOS.Pages.initCompletionPage = initCompletionPage;
})();
