/* ============================================
   HK POS eSignature - Consultation Selection Page
   - Consultation form selection and BC selection page initialization
   ============================================ */

(function () {
  'use strict';

  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  const STORAGE = window.HKPOS.STORAGE;
  const FORM_CATALOG = window.HKPOS.FORM_CATALOG;
  const SAMPLE_STAFF = window.HKPOS.SAMPLE_STAFF;
  const Utils = window.HKPOS.Utils;

  const { qs, qsa, load, save, navFlow, toast, renderCustomerDetail } = Utils;

  function t(key, params) {
    if (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.t) {
      return window.HKPOS.i18n.t(key, params) || key;
    }
    return key;
  }

  function initConsultationSelectionPage() {
    // 브랜드 로고 (로그인한 직원의 brandCd 기준)
    const staff = load(STORAGE.staff, null);
    const brandLogoEl = qs("#customer-detail-brand-logo");
    const brandHeaderEl = qs("#customer-detail-brand-header");
    if (brandLogoEl && brandHeaderEl) {
      const brandCd = staff && staff.brandCd ? staff.brandCd : null;
      const logoFilename = brandCd && window.HKPOS && window.HKPOS.BRAND_LOGO_IMAGE ? window.HKPOS.BRAND_LOGO_IMAGE[brandCd] : null;
      const brandName = brandCd && window.HKPOS && window.HKPOS.BRAND_BY_CODE ? window.HKPOS.BRAND_BY_CODE[brandCd] : "";
      if (logoFilename) {
        const img = new Image();
        const logoUrl = "../assets/images/" + logoFilename;
        img.onload = function () {
          brandLogoEl.style.backgroundImage = "url(" + logoUrl + ")";
          brandLogoEl.style.backgroundSize = "170px 75px";
          brandLogoEl.textContent = "";
        };
        img.onerror = function () {
          brandLogoEl.textContent = brandName || "Brand";
          brandLogoEl.style.backgroundImage = "";
        };
        img.src = logoUrl;
      } else if (brandName) {
        brandLogoEl.textContent = brandName;
        brandLogoEl.style.backgroundImage = "";
      } else {
        brandHeaderEl.style.display = "none";
      }
    }

    const customer = load(STORAGE.customer, null);
    if (!customer) {
      toast(t("app.consultationSelection.noCustomerToastTitle"), t("app.consultationSelection.noCustomerToastDesc"));
      navFlow("customerSearch");
    } else {
      renderCustomerDetail(customer);
    }

    const container = qs("#form-selection");
    if (container) {
      // 카테고리 순서 정의
      const categoryOrder = [
        "상담 및 정보 수집",
        "시술 관련 동의/확인",
        "거래 및 계약",
        "고객 서비스",
        "기타 동의/위임",
      ];

      // group by category
      const byCat = FORM_CATALOG.reduce((acc, f) => {
        acc[f.category] = acc[f.category] || [];
        acc[f.category].push(f);
        return acc;
      }, {});

      // 카테고리 순서대로 정렬하여 렌더링 (title/note/category는 i18n 적용)
      container.innerHTML = categoryOrder
        .filter((cat) => byCat[cat] && byCat[cat].length > 0)
        .map((cat) => {
          const items = byCat[cat];
          const catKey = items[0] ? "form." + items[0].key + ".category" : "";
          const catTitle = (catKey && t(catKey) !== catKey) ? t(catKey) : cat;
          return `
            <div class="form-category">
              <h4>${catTitle}</h4>
              <div class="form-category-items">
                ${items
                  .map(
                    (f) => {
                      const titleT = t("form." + f.key + ".title");
                      const noteT = t("form." + f.key + ".note");
                      return `
                      <label class="checkbox-label">
                        <input class="form-checkbox" type="checkbox" value="${f.key}">
                        <div class="checkbox-content">
                          <div class="checkbox-title">${titleT !== "form." + f.key + ".title" ? titleT : f.title}</div>
                          <div class="checkbox-note">${noteT !== "form." + f.key + ".note" ? noteT : f.note}</div>
                        </div>
                      </label>
                    `;
                    }
                  )
                  .join("")}
              </div>
            </div>
          `;
        })
        .join("");
    }

    // BC 선택 초기화
    const consultationStaffList = qs("#consultation-staff-list");
    if (consultationStaffList) {
      const currentStaff = load(STORAGE.staff, null);
      const savedReviewStaffId = load(STORAGE.reviewStaff, "");
      
      // 같은 매장의 직원 목록 필터링
      let staffList = [];
      if (currentStaff && currentStaff.storeId) {
        staffList = SAMPLE_STAFF.filter(s => s.storeId === currentStaff.storeId);
      }
      
      // 같은 매장 직원이 없으면 전체 직원 목록 표시 (fallback)
      if (staffList.length === 0) {
        staffList = SAMPLE_STAFF;
      }
      
      // 직원 카드 렌더링
      consultationStaffList.innerHTML = staffList
        .map(staff => {
          const isSelected = savedReviewStaffId === staff.staffId;
          return `
            <div class="staff-card" data-staff-id="${staff.staffId}" style="border:1px solid ${isSelected ? "rgba(0, 122, 255, 0.65)" : "var(--border-light)"}; box-shadow: ${isSelected ? "0 0 0 3px rgba(0, 122, 255, 0.10)" : "none"}; border-radius: var(--border-radius); padding: 12px; cursor: pointer; transition: all 0.2s; background: var(--bg-primary);">
              <div style="display:flex; align-items:center; gap: 12px;">
                <div style="flex: 0 0 auto; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: var(--border-radius); background: ${isSelected ? "rgba(0, 122, 255, 0.10)" : "transparent"};">
                  ${isSelected ? '<span style="color: var(--primary-color); font-size: 18px; font-weight: bold;">✓</span>' : ''}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: var(--font-weight-medium); color: var(--text-primary); min-width: 0; overflow:hidden; text-overflow: ellipsis; white-space: nowrap;">${staff.name}</div>
                  <div style="color: var(--text-secondary); font-size: var(--font-size-sm); margin-top: 2px;">${t("app.login.staffId")}: ${staff.staffId}</div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
      
      // 직원 카드 클릭 이벤트
      qsa(".staff-card", consultationStaffList).forEach((card) => {
        card.addEventListener("click", function() {
          const staffId = card.getAttribute("data-staff-id");
          const staff = staffList.find(s => s.staffId === staffId);
          if (!staff) return;
          
          // 선택 상태 업데이트
          save(STORAGE.reviewStaff, staffId);
          
          // UI 업데이트
          qsa(".staff-card", consultationStaffList).forEach(c => {
            const isSelected = c.getAttribute("data-staff-id") === staffId;
            c.style.border = isSelected ? "1px solid rgba(0, 122, 255, 0.65)" : "1px solid var(--border-light)";
            c.style.boxShadow = isSelected ? "0 0 0 3px rgba(0, 122, 255, 0.10)" : "none";
            const iconArea = c.querySelector("div[style*='width: 36px']");
            if (iconArea) {
              iconArea.style.background = isSelected ? "rgba(0, 122, 255, 0.10)" : "transparent";
              iconArea.innerHTML = isSelected ? '<span style="color: var(--primary-color); font-size: 18px; font-weight: bold;">✓</span>' : '';
            }
          });
          
          toast(t("app.consultationSelection.bcSelectedToast"), `${staff.name} (${staff.staffId})`);
        });
      });
    }

    const nextBtn = qs("#go-tabs");
    const messageEl = qs("#selected-forms-message");
    const update = () => {
      const keys = qsa(".form-checkbox:checked").map((c) => c.value);
      if (messageEl) messageEl.textContent = t("app.consultationSelection.selectedCount", { count: keys.length });
      if (nextBtn) nextBtn.disabled = keys.length === 0;
    };
    qsa(".form-checkbox").forEach((cb) => cb.addEventListener("change", update));
    update();

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        const keys = qsa(".form-checkbox:checked").map((c) => c.value);
        if (keys.length === 0) {
          toast(t("app.consultationSelection.formRequiredToast"), t("app.consultationSelection.formRequiredDesc"));
          return;
        }
        
        // BC 선택 검증
        const selectedStaffId = load(STORAGE.reviewStaff, "");
        if (!selectedStaffId) {
          toast(t("app.consultationSelection.bcRequiredToast"), t("app.consultationSelection.bcRequiredDesc"));
          if (consultationStaffList) {
            consultationStaffList.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          return;
        }
        
        save(STORAGE.selectedForms, keys);
        toast(t("app.consultationSelection.formsSelectedToast"), t("app.consultationSelection.formsSelectedDesc", { count: keys.length }));
        window.setTimeout(() => navFlow("tabs"), 450);
      });
    }

    const changeBtn = qs("#change-customer");
    if (changeBtn)
      changeBtn.addEventListener("click", () => {
        localStorage.removeItem(STORAGE.customer);
        navFlow("customerSearch");
      });
  }

  window.HKPOS.Pages = window.HKPOS.Pages || {};
  window.HKPOS.Pages.initConsultationSelectionPage = initConsultationSelectionPage;
})();
