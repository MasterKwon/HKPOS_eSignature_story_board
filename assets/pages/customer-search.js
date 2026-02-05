/* ============================================
   HK POS eSignature - Customer Search Page
   - Customer search page initialization
   ============================================ */

(function () {
  'use strict';

  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  const STORAGE = window.HKPOS.STORAGE;
  const SAMPLE_CUSTOMERS = window.HKPOS.SAMPLE_CUSTOMERS;
  const Utils = window.HKPOS.Utils;

  const { qs, qsa, load, normalizePhone, renderCustomerResults, navFlow, toast } = Utils;

  function t(key, params) {
    if (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.t) {
      return window.HKPOS.i18n.t(key, params);
    }
    return key;
  }

  function initCustomerSearchPage() {
    // 브랜드 로고 (로그인한 직원의 brandCd 기준)
    const staff = load(STORAGE.staff, null);
    const brandLogoEl = qs("#customer-search-brand-logo");
    const brandHeaderEl = qs("#customer-search-brand-header");
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

    const resultCard = qs("#result-card");
    let hasSearched = false;

    function setResultVisible(visible) {
      if (!resultCard) return;
      resultCard.style.display = visible ? "block" : "none";
    }
    function resetResultBox() {
      const box = qs("#search-results");
      if (box) box.innerHTML = `<div class="result-placeholder"><p>${t("app.customerSearch.resultPlaceholder")}</p></div>`;
    }

    const customer = load(STORAGE.customer, null);

    const phoneInput = qs("#search-phone");
    const nameInput = qs("#search-name");
    const emailInput = qs("#search-email");
    const searchBtn = qs("#search-btn");
    const clearBtn = qs("#clear-search");
    const resultTitle = qs("#result-title");

    const hintEl = qs("#search-hint");
    const feedbackEl = qs("#search-feedback");

    // 입력 필드 값에 따라 태두리 강조 토글
    function updateInputBorders() {
      [phoneInput, nameInput, emailInput].forEach((input) => {
        if (!input) return;
        const hasValue = String(input.value || "").trim().length > 0;
        input.classList.toggle("has-value", hasValue);
      });
    }

    function setSearchFeedback(kind, text) {
      if (!feedbackEl) return;
      const msg = String(text || "").trim();
      if (!msg) {
        feedbackEl.textContent = "";
        if (hintEl) {
          hintEl.style.display = "none";
          hintEl.style.borderLeftColor = "var(--primary-color)";
        }
        return;
      }
      feedbackEl.textContent = msg;
      if (!hintEl) return;
      hintEl.style.display = "block";
      if (kind === "error") hintEl.style.borderLeftColor = "var(--error-color)";
      else if (kind === "warn") hintEl.style.borderLeftColor = "var(--warning-color)";
      else hintEl.style.borderLeftColor = "var(--primary-color)";
    }

    function getCriteria() {
      return {
        phone: phoneInput?.value || "",
        name: nameInput?.value || "",
        email: emailInput?.value || "",
      };
    }

    function validateCriteria(criteria) {
      const phoneDigits = normalizePhone(criteria.phone);
      const name = String(criteria.name || "").trim();
      const email = String(criteria.email || "").trim();

      const hasAny = Boolean(phoneDigits || name || email);
      if (!hasAny) return { ok: false, message: "전화번호/이름/이메일 중 1개 이상 입력 후 조회해주세요." };

      if (phoneDigits && phoneDigits.length < 4) return { ok: false, message: "전화번호는 최소 4자리 이상 입력해주세요." };
      if (name && name.length < 2) return { ok: false, message: "이름은 최소 2자 이상 입력해주세요." };
      if (email) {
        const basicOk = email.length >= 6 && email.includes("@");
        if (!basicOk) {
          return { ok: false, message: "이메일은 최소 6자 이상이며 '@'를 포함해야 합니다." };
        }
      }
      return { ok: true, message: "" };
    }

    const nextBtn = qs("#to-selected");
    if (nextBtn) nextBtn.disabled = !load(STORAGE.customer, null);

    function handlePick() {
      if (nextBtn) nextBtn.disabled = false;
      // 선택 강조(border)를 반영하기 위해 결과를 다시 렌더링
      run();
    }

    const run = () => renderCustomerResults(SAMPLE_CUSTOMERS, getCriteria(), { onPick: handlePick });

    function doSearch() {
      const c = getCriteria();
      const v = validateCriteria(c);
      if (!v.ok) {
        setSearchFeedback("warn", v.message);
        return { ok: false, count: 0, message: v.message };
      }
      hasSearched = true;
      setResultVisible(true);
      setSearchFeedback("", "");
      const r = run() || { count: 0 };
      if (r.count === 0) setSearchFeedback("warn", t("app.customerSearch.noMatchHint"));
      return { ok: true, count: r.count, message: "" };
    }

    // Initial state: hide result until user searches (step-by-step flow)
    setResultVisible(false);

    if (searchBtn)
      searchBtn.addEventListener("click", function () {
        const r = doSearch();
        if (!r.ok) toast("검색 조건 확인", r.message);
      });
    [phoneInput, nameInput, emailInput].filter(Boolean).forEach((el) => {
      el.addEventListener("input", function () {
        // After first search: immediate filter
        if (!hasSearched) return;
        const c = getCriteria();
        const v = validateCriteria(c);
        if (!v.ok) {
          resetResultBox();
          setSearchFeedback("warn", v.message);
          return;
        }
        setSearchFeedback("", "");
        const r = run() || { count: 0 };
        if (r.count === 0) setSearchFeedback("warn", t("app.customerSearch.noMatchHint"));
      });
    });
    if (clearBtn)
      clearBtn.addEventListener("click", function () {
        if (phoneInput) phoneInput.value = "";
        if (nameInput) nameInput.value = "";
        if (emailInput) emailInput.value = "";
        updateInputBorders();
        hasSearched = false;
        setResultVisible(false);
        resetResultBox();
        setSearchFeedback("", "");
        localStorage.removeItem(STORAGE.customer);
        if (nextBtn) nextBtn.disabled = true;
        if (resultTitle) resultTitle.textContent = "검색 결과";
      });

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        const c = load(STORAGE.customer, null);
        if (!c) {
          setSearchFeedback("warn", t("app.customerSearch.selectOneCustomer"));
          return;
        }
        navFlow("consultationSelection");
      });
    }

    // Wrapper(설계서)에서 테스트 케이스 버튼으로 검색 조건 주입
    window.addEventListener("message", function (e) {
      const data = e && e.data;
      if (!data || data.type !== "demo.fillCustomerSearch") return;
      const c = data.criteria || {};
      if (phoneInput) phoneInput.value = String(c.phone || "");
      if (nameInput) nameInput.value = String(c.name || "");
      if (emailInput) emailInput.value = String(c.email || "");
      updateInputBorders();
    });
  }

  window.HKPOS.Pages = window.HKPOS.Pages || {};
  window.HKPOS.Pages.initCustomerSearchPage = initCustomerSearchPage;
})();
