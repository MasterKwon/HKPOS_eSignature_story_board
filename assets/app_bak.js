/* ============================================
   HK POS eSignature - Screen Spec (Tablet)
   - Lightweight interactions only (spec-level)
   - Uses localStorage to simulate flow between separate HTML pages
   ============================================ */

(function () {
  const STORAGE = {
    staff: "hkpos.esign.staff",
    customer: "hkpos.esign.customer",
    selectedForms: "hkpos.esign.selectedForms",
    signature: "hkpos.esign.signature",
    customerRealName: "hkpos.esign.customerRealName",
    reviewStaff: "hkpos.esign.reviewStaff",
    bcNotes: "hkpos.esign.bcNotes",
    deliveryMethod: "hkpos.esign.deliveryMethod",
    completionStatus: "hkpos.esign.completionStatus", // "success" | "error"
    errorType: "hkpos.esign.errorType", // "network" | "validation" | "server" | "permission"
    formTitle: "hkpos.esign.formTitle", // 입력 양식에서 선택된 호칭
    formCountryCode: "hkpos.esign.formCountryCode", // 입력 양식에서 선택된 국가번호
    conditionalFormData: "hkpos.esign.conditionalFormData", // 조건부 필드 데이터 (양식별)
  };

  // 홍콩 날짜 포맷 유틸리티 (DD-MM-YYYY)
  function formatDateHK(date) {
    const d = date || new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // 홍콩 시간 포맷 유틸리티 (HH:MM)
  function formatTimeHK(date) {
    const d = date || new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const FORM_CATALOG = [
    // 1. 상담 및 정보 수집
    {
      key: "member-consultation",
      title: "회원 상담표",
      category: "상담 및 정보 수집",
      requiresSignature: true,
      file: "forms/01-01_form_member-consultation.html",
      note: "상담을 위해 생활/건강/피부 고민 정보를 수집합니다.",
    },
    // 2. 시술 관련 동의/확인
    {
      key: "device-consent-aqua-peel",
      title: "미용기기 동의서 - Aqua Peel",
      category: "시술 관련 동의/확인",
      requiresSignature: true,
      file: "forms/02-01_form_device-consent-aqua-peel.html",
      note: "Aqua Peel 기기 시술의 위험 고지 및 고객 동의를 수집합니다.",
    },
    {
      key: "device-consent-skincool",
      title: "미용기기 동의서 - Skincool",
      category: "시술 관련 동의/확인",
      requiresSignature: true,
      file: "forms/02-02_form_device-consent-skincool.html",
      note: "Skincool 기기 시술의 위험 고지 및 고객 동의를 수집합니다.",
    },
    {
      key: "device-consent-ultrasonic",
      title: "미용기기 동의서 - Ultrasonic",
      category: "시술 관련 동의/확인",
      requiresSignature: true,
      file: "forms/02-03_form_device-consent-ultrasonic.html",
      note: "Ultrasonic 기기 시술의 위험 고지 및 고객 동의를 수집합니다.",
    },
    {
      key: "device-consent-mrv",
      title: "미용기기 동의서 - MRV",
      category: "시술 관련 동의/확인",
      requiresSignature: true,
      file: "forms/02-04_form_device-consent-mrv.html",
      note: "MRV 기기 시술의 위험 고지 및 고객 동의를 수집합니다.",
    },
    {
      key: "treatment-conversion",
      title: "시술 전환 확인서",
      category: "시술 관련 동의/확인",
      requiresSignature: true,
      file: "forms/02-05_form_treatment-conversion.html",
      note: "POS 내역을 기반으로 시술/패키지 전환을 확인합니다.",
    },
    {
      key: "treatment-extension",
      title: "시술 연기 확인서",
      category: "시술 관련 동의/확인",
      requiresSignature: true,
      file: "forms/02-06_form_treatment-extension.html",
      note: "시술 유효기간 연장을 확인합니다.",
    },
    // 3. 거래 및 계약
    {
      key: "package-terms",
      title: "구매 시술 패키지 및 제품 패키지 약관",
      category: "거래 및 계약",
      requiresSignature: true,
      file: "forms/03-01_form_package-terms.html",
      note: "시술 패키지 및 제품 패키지 구매 시 약관 및 세칙에 동의합니다.",
    },
    {
      key: "collagen-drink-terms",
      title: "구매 Collagen Drink 약관",
      category: "거래 및 계약",
      requiresSignature: true,
      file: "forms/form_collagen-drink-terms.html",
      note: "Collagen Drink 구매 시 약관 및 세칙에 동의합니다.",
    },
    // 4. 고객 서비스
    {
      key: "customer-refund",
      title: "고객 환불 확인서",
      category: "고객 서비스",
      requiresSignature: true,
      file: "forms/04-01_form_customer-refund.html",
      note: "환불 사유 및 금액을 확인하고 동의합니다.",
    },
    {
      key: "appointment-cancellation-waiver",
      title: "예약 취소 면제서",
      category: "고객 서비스",
      requiresSignature: true,
      file: "forms/04-02_form_appointment-cancellation-waiver.html",
      note: "예약 취소 시 면제 조건에 동의합니다.",
    },
    {
      key: "product-exchange-delivery",
      title: "교환 제품 배송 확인서",
      category: "고객 서비스",
      requiresSignature: true,
      file: "forms/04-03_form_product-exchange-delivery.html",
      note: "제품 교환 및 배송 정보를 확인하고 동의합니다.",
    },
    // 5. 기타 동의/위임
    {
      key: "authorization-letter",
      title: "위임장",
      category: "기타 동의/위임",
      requiresSignature: true,
      file: "forms/05-01_form_authorization-letter.html",
      note: "제3자에게 권한을 위임하는 내용에 동의합니다.",
    },
  ];

  const SAMPLE_CUSTOMERS = [
    {
      id: "S000120034",
      name: "Chloe Chan",
      phone: "91234567",
      email: "chloe.chan@example.com",
      title: "Ms", // 호칭: Ms/Mrs/Mr
      countryCode: "852", // 국가번호: 852(홍콩), 853(마카오), 86(중국)
      tier: "Diamond",
      availablePackages: [
        { packageName: "BL Summer Recovery Plan 2024", remainValue: 3900, expiryDate: "2025.07.19", issueStoreName: "BL1TR-TIMESQUARE 15/F", issueStoreCode: "HK000066", voucherNumber: "HK047363866229", issueDate: "2024.06.17", status: "Issued" },
        { packageName: "Aqua Peel Package", remainQty: 5, expiryDate: "2026.06.30", issueStoreName: "BL1LG-LEE GARDEN 23/F", issueStoreCode: "HK000199", voucherNumber: "HK047363866230", issueDate: "2024.08.15", status: "Issued" },
      ],
    },
    {
      id: "S000084991",
      name: "Amy Wong",
      phone: "62341188",
      email: "amy.wong@example.com",
      title: "Ms",
      countryCode: "852",
      tier: "Gold",
      availablePackages: [
        { packageName: "Ultrasonic Treatment", remainQty: 2, expiryDate: "2026.02.28", issueStoreName: "BL1TR-TIMESQUARE 15/F", issueStoreCode: "HK000066", voucherNumber: "HK047363866231", issueDate: "2024.11.20", status: "Issued" },
        { packageName: "Aqua Peel Package", remainQty: 5, expiryDate: "2026.06.30", issueStoreName: "BL1LG-LEE GARDEN 23/F", issueStoreCode: "HK000199", voucherNumber: "HK047363866232", issueDate: "2024.08.15", status: "Issued" },
        { packageName: "SkinCool Package", remainQty: 3, expiryDate: "2026.03.31", issueStoreName: "BL1TR-TIMESQUARE 15/F", issueStoreCode: "HK000066", voucherNumber: "HK047363866233", issueDate: "2024.09.10", status: "Issued" },
      ],
    },
    {
      id: "S000018220",
      name: "Jason Lee",
      phone: "53329001",
      email: "jason.lee@example.com",
      title: "Mr",
      countryCode: "852",
      tier: "Silver",
      availablePackages: [],
    },
    {
      id: "S000217845",
      name: "Annie Wong",
      phone: "91239876",
      email: "annie.wong@example.com",
      title: "Ms",
      countryCode: "852",
      tier: "Diamond",
      availablePackages: [
        { packageName: "Aqua Peel Package", remainQty: 1, expiryDate: "2026.01.31", issueStoreName: "BL1LG-LEE GARDEN 23/F", issueStoreCode: "HK000199", voucherNumber: "HK047363866234", issueDate: "2024.12.05", status: "Issued" },
      ],
    },
    {
      id: "S000305117",
      name: "Jamie Lee",
      phone: "53320011",
      email: "jamie.lee@example.com",
      title: "Ms",
      countryCode: "852",
      tier: "Gold",
      availablePackages: [
        { packageName: "SkinCool Package", remainQty: 1, expiryDate: "2026.02.15", issueStoreName: "BL1TR-TIMESQUARE 15/F", issueStoreCode: "HK000066", voucherNumber: "HK047363866235", issueDate: "2024.10.18", status: "Issued" },
      ],
    },
    {
      id: "S000441902",
      name: "Kelly Chan",
      phone: "91230001",
      email: "kelly.chan@example.com",
      title: "Ms",
      countryCode: "852",
      tier: "Silver",
      availablePackages: [],
    },
    {
      id: "S000558730",
      name: "Chris Chan",
      phone: "91231234",
      email: "chris.chan@example.com",
      title: "Mr",
      countryCode: "852",
      tier: "Diamond",
      availablePackages: [
        { packageName: "Ultrasonic Treatment", remainQty: 4, expiryDate: "2026.04.30", issueStoreName: "BL1LG-LEE GARDEN 23/F", issueStoreCode: "HK000199", voucherNumber: "HK047363866236", issueDate: "2024.07.22", status: "Issued" },
      ],
    },
  ];

  // 직원 샘플(로그인/직원선택 데모용)
  // 의도: "매장 선택 → 해당 매장 소속 직원만 목록 노출" 같은 UX를 쉽게 재현하기 위함
  // - staffId: 직원 ID (실데이터: 숫자 문자열)
  // - storeId / storeName: 소속 매장 정보(필터 기준)
  // - brandCd: 브랜드 코드(필터/표시 기준)
  // - password: 데모용 비밀번호(실서비스에서는 POS/SSO 정책 따름)
  const SAMPLE_STAFF = [
    { staffId: "0101702", name: "BOWIE TSE", storeId: "HK000005", storeName: "TSSGW-GATEWAY ARCADE", brandCd: "HK10", password: "1234" },
    { staffId: "0101981", name: "KAMMI YIM", storeId: "HK000005", storeName: "TSSGW-GATEWAY ARCADE", brandCd: "HK10", password: "1234" },
    { staffId: "0102001", name: "VICKY CHAN", storeId: "HK000005", storeName: "TSSGW-GATEWAY ARCADE", brandCd: "HK10", password: "1234" },
    { staffId: "0101863", name: "STEPHANIE CHIU", storeId: "HK000047", storeName: "CWSTQ-TIME SQUARE", brandCd: "HK20", password: "1234" },
    { staffId: "0101754", name: "ROSE SO", storeId: "HK000047", storeName: "CWSTQ-TIME SQUARE", brandCd: "HK20", password: "1234" },
    { staffId: "0101715", name: "JODI LAM", storeId: "HK000047", storeName: "CWSTQ-TIME SQUARE", brandCd: "HK20", password: "1234" },
    { staffId: "0101939", name: "ESTHER YAU", storeId: "HK000047", storeName: "CWSTQ-TIME SQUARE", brandCd: "HK20", password: "1234" },
  ];

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
                <button class="demo-btn-secondary" type="button" data-fill-login="${s.staffId}" style="min-width: 78px; min-height: 36px; padding: 6px 10px;">입력</button>
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
          toast("자동 입력", "좌측 로그인 화면을 찾지 못했습니다. (iframe 로드 후 다시 시도)");
          return;
        }
        win.postMessage({ type: "demo.fillLogin", staffId: staff.staffId, password: staff.password }, "*");
        toast("자동 입력", `직원ID ${staff.staffId}가 입력되었습니다.`);
      });
    });
  }

  // ---------- helpers ----------
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
    console.log('navTo called with href:', href);
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

  const FLOW_PAGES = {
    login: { wrapper: "01_store-user-login.html", tablet: "01_login.html" },
    customerSearch: { wrapper: "02_main-customer-search.html", tablet: "02_customer-search.html" },
    consultationSelection: { wrapper: "03_consultation-selection.html", tablet: "03_consultation-selection.html" },
    tabs: { wrapper: "04_consultation-review-and-input-tabs.html", tablet: "04_tabs.html" },
    review: { wrapper: "05_consultation-review.html", tablet: "05_review.html" },
    completion: { wrapper: "06_consultation-completion.html", tablet: "06_completion.html" },
  };

  function navFlow(key) {
    const cfg = FLOW_PAGES[key];
    if (!cfg) return;
    if (isTabletApp()) {
      // When tablet UI runs inside wrapper iframe, move the parent page
      // so the right-side description matches the current step.
      if (isEmbeddedPreview()) {
        window.parent.location.href = `../${cfg.wrapper}`;
      } else {
        navTo(cfg.tablet);
      }
    } else {
      navTo(cfg.wrapper);
    }
  }

  // ---------- demo layout helpers ----------
  const DEMO = {
    helpCollapsed: "hkpos.demo.helpCollapsed",
    lang: "hkpos.demo.lang",
  };

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
    if (btn) btn.textContent = collapsed ? "설명 보이기" : "설명 숨기기";
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
  function formatCustomerLine(c) {
    return `${c.name} • ${c.phone} • ${c.id}`;
  }
  function renderCustomerDetail(customer) {
    const host = qs("#customer-detail");
    if (!host || !customer) return;
    const packages = Array.isArray(customer.availablePackages) ? customer.availablePackages : [];
    const hasPackages = packages.length > 0;
    host.innerHTML = `
      <div style="margin-top: 4px; display:grid; gap: 8px;">
        <div style="color: var(--text-secondary); font-size: var(--font-size-base); line-height:1.5;">
          <div style="margin-bottom: 4px;"><strong>이름:</strong> ${customer.name} <span class="app-badge" style="margin-left:6px;">${customer.tier}</span></div>
          <div style="margin-bottom: 4px;"><strong>전화번호:</strong> ${customer.phone}</div>
          <div style="margin-bottom: 4px;"><strong>이메일:</strong> ${customer.email}</div>
          <div><strong>고객번호:</strong> ${customer.id}</div>
        </div>
        <div style="padding-top: 8px; border-top: 1px solid var(--border-light);">
          <button type="button" id="toggle-packages" style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 0; background: none; border: none; cursor: pointer; text-align: left;">
            <div style="font-weight: var(--font-weight-medium); color: var(--text-primary); font-size: var(--font-size-base);">사용 가능한 Package ${hasPackages ? `<span style="color: var(--text-secondary); font-weight: normal; font-size: var(--font-size-sm);">(${packages.length}건)</span>` : ""}</div>
            <span id="toggle-packages-icon" style="color: var(--text-secondary); font-size: 12px; flex: 0 0 auto;">▼</span>
          </button>
          <div id="packages-content" style="display: none; margin-top: 6px; overflow-x: auto;">
            ${
              hasPackages
                ? `
                  <table style="width: 100%; border-collapse: collapse; font-size: var(--font-size-sm);">
                    <thead>
                      <tr style="border-bottom: 1px solid var(--border-light); background: var(--bg-secondary);">
                        <th style="padding: 8px 6px; text-align: left; font-weight: var(--font-weight-medium); color: var(--text-primary);">Package명</th>
                        <th style="padding: 8px 6px; text-align: right; font-weight: var(--font-weight-medium); color: var(--text-primary);">남은 수량/가치</th>
                        <th style="padding: 8px 6px; text-align: center; font-weight: var(--font-weight-medium); color: var(--text-primary);">만료일</th>
                        <th style="padding: 8px 6px; text-align: left; font-weight: var(--font-weight-medium); color: var(--text-primary);">발급 매장</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${packages
                        .map(
                          (p) => `
                        <tr style="border-bottom: 1px solid var(--border-light);">
                          <td style="padding: 10px 6px; color: var(--text-primary);">${p.packageName}</td>
                          <td style="padding: 10px 6px; text-align: right; color: var(--text-secondary);">${p.remainQty ? `${p.remainQty}회` : `HK$${p.remainValue?.toLocaleString() || 0}`}</td>
                          <td style="padding: 10px 6px; text-align: center; color: var(--text-secondary);">${p.expiryDate}</td>
                          <td style="padding: 10px 6px; color: var(--text-secondary); font-size: 11px;">${p.issueStoreName}<br><span style="color: var(--text-light);">${p.issueStoreCode}</span></td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                `
                : `<div style="color: var(--text-secondary); font-size: var(--font-size-sm);">사용 가능한 Package가 없습니다.</div>`
            }
          </div>
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
  function getSelectedForms() {
    const keys = load(STORAGE.selectedForms, []);
    return keys
      .map((k) => FORM_CATALOG.find((f) => f.key === k))
      .filter(Boolean);
  }
  function needsSignature(forms) {
    return forms.some((f) => !!f.requiresSignature);
  }

  // ---------- shared topbar ----------
  function initTopbar() {
    initHelpToggle();
    applyLanguageState();

    const resetBtn = qs("#app-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        const ok = window.confirm("데모 데이터를 초기화할까요?\n\n- 직원/고객/선택항목/서명 데이터가 삭제됩니다.\n- 이후 목록(홈) 화면으로 이동합니다.");
        if (!ok) return;
        clearFlow();
        navTo("index.html");
      });
    }

    const lang = qs("#app-language");
    if (lang) {
      lang.addEventListener("change", function () {
        const next = String(lang.value || "ko");
        localStorage.setItem(DEMO.lang, next);
        applyLanguageState(next);
        toast("언어(설계)", "현재 설계서는 한글로 작성되어 있습니다. 설계 완료 후 영문/번체를 일괄 적용합니다.");
      });
    }

    const staff = load(STORAGE.staff, null);
    if (staff && staff.storeName) {
      const storeLabel = staff.storeId ? `${staff.storeName} (${staff.storeId})` : staff.storeName;
      setText("#app-store-pill", storeLabel);
    } else if (staff && staff.store) {
      // backward compatibility
      setText("#app-store-pill", staff.store);
    }
    // 담당 BC 정보 업데이트 (실제 선택한 BC가 있으면 우선 표시)
    const reviewStaffId = load(STORAGE.reviewStaff, '');
    if (reviewStaffId) {
      const reviewStaff = SAMPLE_STAFF.find(s => s.staffId === reviewStaffId);
      if (reviewStaff) {
        const staffLabel = reviewStaff.name ? `직원: ${reviewStaff.staffId} • ${reviewStaff.name}` : `직원: ${reviewStaff.staffId}`;
        setText("#app-staff-pill", staffLabel);
      }
    } else if (staff && staff.staffId) {
      // BC가 선택되지 않았으면 로그인한 직원 정보 표시
      const label = staff.name ? `직원: ${staff.staffId} • ${staff.name}` : `직원: ${staff.staffId}`;
      setText("#app-staff-pill", label);
    }

    // 고객 정보 업데이트 (실제 선택한 고객)
    const customer = load(STORAGE.customer, null);
    if (customer) {
      const customerLabel = customer.id ? `고객: ${customer.name} • ${customer.id}` : `고객: ${customer.name}`;
      setText("#app-customer-pill", customerLabel);
    }
  }

  // ---------- page: list ----------
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

  // ---------- page: login ----------
  function initLoginPage() {
    // Wrapper 우측 패널: 테스트 계정 렌더(있을 때만)
    renderLoginTestAccounts();

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
          errBox.textContent = "직원 ID와 비밀번호를 입력해주세요.";
          errBox.style.display = "block";
        }
        toast("입력 필요", "직원 ID와 비밀번호를 입력해주세요. (설계용 유효성 검사)");
        return;
      }

      // 샘플 직원 검증(데모)
      const staff = SAMPLE_STAFF.find((s) => String(s.staffId).toLowerCase() === staffId.toLowerCase());
      if (!staff) {
        if (errBox) {
          errBox.textContent = "등록되지 않은 직원 ID입니다. 우측 ‘테스트 계정’을 사용해주세요.";
          errBox.style.display = "block";
        }
        toast("직원 ID 확인", `등록되지 않은 직원 ID입니다. (예: ${SAMPLE_STAFF.map((s) => s.staffId).join(", ")})`);
        return;
      }
      if (String(staff.password) !== password) {
        if (errBox) {
          errBox.textContent = "비밀번호가 올바르지 않습니다. (데모 기본 비밀번호: 1234)";
          errBox.style.display = "block";
        }
        toast("비밀번호 불일치", "비밀번호를 다시 확인해주세요. (데모 계정 기본 비밀번호: 1234)");
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
      toast("로그인 완료(설계)", "매장 식별을 위한 세션이 생성되었습니다.");
      window.setTimeout(() => navFlow("customerSearch"), 450);
    });
  }

  // ---------- page: customer search ----------
  function normalizePhone(value) {
    return String(value || "").replaceAll(/[^0-9]/g, "");
  }

  function renderCustomerResults(list, criteria, opts) {
    const box = qs("#search-results");
    if (!box) return;
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

    // 검색 결과 제목 업데이트
    const resultTitleEl = qs("#result-title");
    if (resultTitleEl) {
      resultTitleEl.textContent = filtered.length === 0 ? "검색 결과 (0건)" : `검색 결과 (${filtered.length}건)`;
    }

    if (filtered.length === 0) {
      box.innerHTML = `<div class="result-placeholder"><p>일치하는 고객이 없습니다.</p></div>`;
      return { count: 0 };
    }

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
                      <div style="color: var(--text-light); font-size: 12px; margin-top: 4px;">고객번호: ${c.id}</div>
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

    // 카드 전체 클릭 이벤트
    qsa(".customer-card").forEach((card) => {
      card.addEventListener("click", function (e) {
        // 버튼 클릭은 이벤트 전파 방지 (중복 방지)
        if (e.target.closest("button")) return;
        const id = card.getAttribute("data-customer");
        const customer = SAMPLE_CUSTOMERS.find((c) => c.id === id);
        if (!customer) return;
        save(STORAGE.customer, customer);
        toast("고객 선택됨", formatCustomerLine(customer));
        setText("#app-customer-pill", customer.name);
        if (onPick) onPick(customer);
      });
    });

    return { count: filtered.length };
  }

  function initCustomerSearchPage() {
    const resultCard = qs("#result-card");
    let hasSearched = false;

    function setResultVisible(visible) {
      if (!resultCard) return;
      resultCard.style.display = visible ? "block" : "none";
    }
    function resetResultBox() {
      const box = qs("#search-results");
      if (box) box.innerHTML = `<div class="result-placeholder"><p>검색 결과가 여기에 표시됩니다.</p></div>`;
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
        if (!basicOk) return { ok: false, message: "이메일은 최소 6자 이상이며 “@”를 포함해야 합니다." };
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
      if (r.count === 0) setSearchFeedback("warn", "일치하는 고객이 없습니다. 입력값을 확인해주세요.");
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
        if (r.count === 0) setSearchFeedback("warn", "일치하는 고객이 없습니다. 입력값을 확인해주세요.");
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
          setSearchFeedback("warn", "검색 결과에서 고객 1명을 선택해주세요.");
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


  function renderCustomerSearchTestCases() {
    const host = qs("#demo-customer-search-cases");
    if (!host) return;

    const cases = [
      { label: "1건(전화번호 정확)", criteria: { phone: "62341188", name: "", email: "" }, expect: "1건" },
      { label: "2건+(이름 LIKE)", criteria: { phone: "", name: "Lee", email: "" }, expect: "2건" },
      { label: "0건(이메일)", criteria: { phone: "", name: "", email: "no.result@example.com" }, expect: "0건" },
    ];

    host.innerHTML = `
      <div style="display:grid; gap: 8px;">
        ${cases
          .map((c, idx) => {
            const line = `${c.label} • ${c.expect}`;
            const detail = [
              c.criteria.phone ? `전화:${c.criteria.phone}` : "",
              c.criteria.name ? `이름:${c.criteria.name}` : "",
              c.criteria.email ? `이메일:${c.criteria.email}` : "",
            ]
              .filter(Boolean)
              .join(" | ");
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; gap: 10px; padding: 8px 10px; border: 1px solid var(--border-light); border-radius: var(--border-radius); background: var(--bg-primary);">
                <div style="min-width: 0; color: var(--text-secondary); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  <span style="color: var(--text-primary); font-weight: var(--font-weight-medium);">${line}</span>
                  <span style="color: var(--text-light);"> • ${detail}</span>
                </div>
                <button class="demo-btn-secondary" type="button" data-fill-search-case="${idx}" style="min-width: 78px; min-height: 36px; padding: 6px 10px;">입력</button>
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
        const win = iframe && iframe.contentWindow;
        if (!win) {
          toast("자동 입력", "좌측 고객검색 화면을 찾지 못했습니다. (iframe 로드 후 다시 시도)");
          return;
        }
        // 테스트 케이스는 "입력만" 수행하고, 실제 조회는 태블릿 화면에서 사용자가 조회 버튼을 눌렀을 때 실행
        win.postMessage({ type: "demo.fillCustomerSearch", criteria: picked.criteria, autoSearch: false }, "*");
        toast("자동 입력", "검색 조건이 입력되었습니다. 좌측에서 조회를 눌러주세요.");
      });
    });
  }

  // ---------- page: consultation selection ----------
  function initConsultationSelectionPage() {
    const customer = load(STORAGE.customer, null);
    if (!customer) {
      toast("고객 정보 없음", "설계 플로우 기준, 고객검색 화면부터 진행해주세요.");
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

      // 카테고리 순서대로 정렬하여 렌더링
      container.innerHTML = categoryOrder
        .filter((cat) => byCat[cat] && byCat[cat].length > 0)
        .map((cat) => {
          const items = byCat[cat];
          return `
            <div class="form-category">
              <h4>${cat}</h4>
              <div class="form-category-items">
                ${items
                  .map(
                    (f) => `
                      <label class="checkbox-label">
                        <input class="form-checkbox" type="checkbox" value="${f.key}">
                        <div class="checkbox-content">
                          <div class="checkbox-title">${f.title}</div>
                          <div class="checkbox-note">${f.note}</div>
                        </div>
                      </label>
                    `
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
                  <div style="color: var(--text-secondary); font-size: var(--font-size-sm); margin-top: 2px;">직원 ID: ${staff.staffId}</div>
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
          
          toast("담당 BC 선택됨", `${staff.name} (${staff.staffId})`);
        });
      });
    }

    const nextBtn = qs("#go-tabs");
    const counter = qs("#selected-count");
    const update = () => {
      const keys = qsa(".form-checkbox:checked").map((c) => c.value);
      if (counter) counter.textContent = String(keys.length);
      if (nextBtn) nextBtn.disabled = keys.length === 0;
    };
    qsa(".form-checkbox").forEach((cb) => cb.addEventListener("change", update));
    update();

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        const keys = qsa(".form-checkbox:checked").map((c) => c.value);
        if (keys.length === 0) {
          toast("양식 선택 필요", "최소 1개 이상의 양식을 선택해주세요.");
          return;
        }
        
        // BC 선택 검증
        const selectedStaffId = load(STORAGE.reviewStaff, "");
        if (!selectedStaffId) {
          toast("BC 선택 필요", "담당 BC를 선택해주세요.");
          if (consultationStaffList) {
            consultationStaffList.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          return;
        }
        
        save(STORAGE.selectedForms, keys);
        toast("상담내용 선택됨", `다음 화면에서 ${keys.length}개의 탭이 생성됩니다.`);
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

  // ---------- page: tabs (review & input) ----------
  // iframe에 데이터 전송 (postMessage 방식)
  // iframe에서 양식 데이터 수집 요청 (postMessage 방식) - 전역 함수
  function requestFormDataFromIframe(formKey) {
    return new Promise((resolve, reject) => {
      if (!window.formIframes || !window.formIframes.has(formKey)) {
        console.warn(`[App] Iframe not found for form: ${formKey}`);
        resolve({});
        return;
      }
      
      const iframe = window.formIframes.get(formKey);
      if (!iframe || !iframe.contentWindow) {
        console.warn(`[App] Iframe contentWindow not available for form: ${formKey}`);
        resolve({});
        return;
      }
      
      // 핸들러 등록 (데이터 수집 완료 시 호출)
      if (!window.iframeMessageHandlers) {
        window.iframeMessageHandlers = new Map();
      }
      
      const timeout = setTimeout(() => {
        window.iframeMessageHandlers.delete(formKey);
        console.warn(`[App] Timeout waiting for form data from: ${formKey}`);
        resolve({});
      }, 3000); // 3초 타임아웃
      
      window.iframeMessageHandlers.set(formKey, (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
      
      // iframe에 데이터 수집 요청
      iframe.contentWindow.postMessage({
        type: 'form-data-request',
        formKey: formKey
      }, '*');
      
      console.log(`[App] Requested form data from iframe: ${formKey}`);
    });
  }

  function sendDataToForm(iframe, formKey) {
    console.log('[App] sendDataToForm called', { formKey, iframe: !!iframe, hasContentWindow: !!(iframe && iframe.contentWindow) });
    
    try {
      const customer = load(STORAGE.customer, null);
      const currentStaff = load(STORAGE.staff, null);
      const reviewStaffId = load(STORAGE.reviewStaff, '');
      
      console.log('[App] Data loaded from storage', { 
        hasCustomer: !!customer, 
        hasStaff: !!currentStaff, 
        reviewStaffId: reviewStaffId 
      });
      
      const now = new Date();
      const dateStr = formatDateHK(now);
      const timeStr = formatTimeHK(now);
      
      // 담당 직원 정보
      let responsibleStaffName = '';
      if (reviewStaffId) {
        const reviewStaff = SAMPLE_STAFF.find(s => s.staffId === reviewStaffId);
        if (reviewStaff) {
          responsibleStaffName = reviewStaff.name;
        }
      } else if (currentStaff) {
        responsibleStaffName = currentStaff.name;
      }
      
      // 전송할 데이터 구성
      const formData = {
        type: 'form-data-inject',
        formKey: formKey,
        data: {
          // 매장 정보
          'store-registration': currentStaff && currentStaff.storeName ? currentStaff.storeName : '',
          // 담당 직원 정보
          'responsible-staff': responsibleStaffName,
          // 고객 정보
          'customer-name': customer ? customer.name : '',
          'membership-number': customer ? customer.id : '',
          'title': customer ? customer.title : '',
          'country-code': customer ? customer.countryCode : '',
          'contact-number': customer ? customer.phone : '',
          'email': customer ? customer.email : '',
          // 서명 날짜/시간 (텍스트 필드용, DD-MM-YYYY 형식)
          'signature-date': dateStr,
          'signature-time': timeStr,
          // 일반 날짜 필드 기본값 (ISO 형식 YYYY-MM-DD, 브라우저 기본 형식)
          'recent-treatment-date': `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
          'medication-duration-from': `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
          'medication-duration-to': `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        }
      };
      
      console.log('[App] Form data prepared:', formData);
      
      // iframe에 데이터 전송
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(formData, '*');
        console.log(`[App] Data sent to form iframe: ${formKey}`, formData);
      } else {
        console.warn('[App] Cannot send data: iframe or contentWindow is not available', { 
          iframe: !!iframe, 
          contentWindow: !!(iframe && iframe.contentWindow) 
        });
      }
    } catch (e) {
      console.error('[App] Error sending data to form:', e);
    }
  }
  
  // PDF 템플릿용 데이터 주입 함수 (formWrapper 직접 접근)
  // 주의: 입력 화면은 iframe + postMessage 방식 사용, 이 함수는 PDF 템플릿에서만 사용
  function fillFormData(formWrapper, customer, formKey) {
    const now = new Date();
    const dateStr = formatDateHK(now);
    const timeStr = formatTimeHK(now);
    
    // 매장 정보 (Store Registration)
    const storeField = formWrapper.querySelector('[data-field="store-registration"]');
    if (storeField) {
      const currentStaff = load(STORAGE.staff, null);
      if (currentStaff && currentStaff.storeName) {
        storeField.value = currentStaff.storeName;
      }
    }
    
    // 담당 직원 정보 (Responsible Staff)
    const staffField = formWrapper.querySelector('[data-field="responsible-staff"]');
    if (staffField) {
      const reviewStaffId = load(STORAGE.reviewStaff, '');
      if (reviewStaffId) {
        const reviewStaff = SAMPLE_STAFF.find(s => s.staffId === reviewStaffId);
        if (reviewStaff) {
          staffField.value = reviewStaff.name;
        }
      } else {
        // reviewStaff가 없으면 현재 로그인한 직원 정보 사용
        const currentStaff = load(STORAGE.staff, null);
        if (currentStaff) {
          staffField.value = currentStaff.name;
        }
      }
    }
    
    // 고객명
    const nameInput = formWrapper.querySelector('#customer-name');
    if (nameInput && customer.name) {
      nameInput.value = customer.name;
    }
    
    // 호칭 (Title)
    if (customer.title) {
      const titleRadio = formWrapper.querySelector(`input[name="title"][value="${customer.title}"]`);
      if (titleRadio) {
        titleRadio.checked = true;
      }
    }
    
    // 회원번호
    const membershipInput = formWrapper.querySelector('#membership-number');
    if (membershipInput && customer.id) {
      membershipInput.value = customer.id;
    }
    
    // 국가번호 (Country Code)
    if (customer.countryCode) {
      const countryCodeRadio = formWrapper.querySelector(`input[name="country-code"][value="${customer.countryCode}"]`);
      if (countryCodeRadio) {
        countryCodeRadio.checked = true;
      }
    }
    
    // 연락처
    const contactInput = formWrapper.querySelector('#contact-number');
    if (contactInput && customer.phone) {
      contactInput.value = customer.phone;
    }
    
    // 이메일
    const emailInput = formWrapper.querySelector('#email');
    if (emailInput && customer.email) {
      emailInput.value = customer.email;
    }
    
    // 서명 날짜 (DD-MM-YYYY 형식, 텍스트 필드)
    const signatureDateInput = formWrapper.querySelector('#signature-date');
    if (signatureDateInput) {
      signatureDateInput.value = dateStr;
    }
    
    // 서명 시간 (HH:MM 형식)
    const signatureTimeInput = formWrapper.querySelector('#signature-time');
    if (signatureTimeInput) {
      signatureTimeInput.value = timeStr;
    }
    
    // 일반 날짜 입력 필드들에 오늘 날짜 기본값 설정 (DD-MM-YYYY 형식)
    const recentTreatmentDateInput = formWrapper.querySelector('#recent-treatment-date');
    if (recentTreatmentDateInput && !recentTreatmentDateInput.value) {
      recentTreatmentDateInput.value = dateStr;
    }
    
    const medicationDurationFromInput = formWrapper.querySelector('#medication-duration-from');
    if (medicationDurationFromInput && !medicationDurationFromInput.value) {
      medicationDurationFromInput.value = dateStr;
    }
    
    const medicationDurationToInput = formWrapper.querySelector('#medication-duration-to');
    if (medicationDurationToInput && !medicationDurationToInput.value) {
      medicationDurationToInput.value = dateStr;
    }
  }

  // iframe 방식으로 양식 로드 (전역 함수)
  async function loadFormHTML(formContentEl, formPath, formKey, options = {}) {
      // 중복 로딩 방지
      if (formContentEl.hasAttribute('data-loading') || formContentEl.hasAttribute('data-loaded')) {
        return;
      }
      
      formContentEl.setAttribute('data-loading', 'true');
      
      try {
        // iframe 요소 생성
        const iframe = document.createElement('iframe');
        iframe.id = `form-iframe-${formKey}`;
        iframe.style.cssText = 'width: 100%; height: 500px; border: none; display: block; overflow: hidden;';
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('frameborder', '0');
        
        // postMessage 수신: iframe 높이 조정
        // 각 iframe별로 개별 리스너 등록 (클로저로 formKey와 iframe 참조 유지)
        const handleMessage = function(event) {
          // 보안: 같은 origin에서만 처리 (또는 신뢰할 수 있는 origin 확인)
          // if (event.origin !== window.location.origin) return;
          
          if (event.data && event.data.type === 'iframe-resize') {
            // 이 메시지가 이 iframe에서 온 것인지 확인
            // event.source를 통해 확인하거나, iframe의 contentWindow와 비교
            try {
              if (event.source === iframe.contentWindow) {
                const height = event.data.height;
                if (height && height > 0) {
                  iframe.style.height = height + 'px';
                  console.log(`[App] Iframe height adjusted to ${height}px for form: ${formKey}`);
                }
              }
            } catch (e) {
              // cross-origin 에러 무시 (같은 origin이면 발생하지 않음)
            }
          }
          
          // form-data-collected 메시지 처리 (Phase 4)
          if (event.data && event.data.type === 'form-data-collected') {
            try {
              const collectedFormKey = event.data.formKey;
              const collectedData = event.data.data || {};
              
              console.log(`[App] Form data collected from iframe: ${collectedFormKey}`, collectedData);
              
              // 데이터를 localStorage에 저장 (기존 방식과 호환)
              const savedConditionalData = load(STORAGE.conditionalFormData, {});
              if (!savedConditionalData[collectedFormKey]) {
                savedConditionalData[collectedFormKey] = {};
              }
              Object.assign(savedConditionalData[collectedFormKey], collectedData);
              save(STORAGE.conditionalFormData, savedConditionalData);
              
              // 핸들러가 등록되어 있으면 호출 (Promise resolve 등)
              if (window.iframeMessageHandlers && window.iframeMessageHandlers.has(collectedFormKey)) {
                const handler = window.iframeMessageHandlers.get(collectedFormKey);
                if (handler) {
                  handler(collectedData);
                  window.iframeMessageHandlers.delete(collectedFormKey);
                }
              }
            } catch (e) {
              console.error('[App] Error handling form data collection:', e);
            }
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // iframe 참조를 저장하여 나중에 데이터 수집 요청 시 사용
        if (!window.formIframes) {
          window.formIframes = new Map();
        }
        window.formIframes.set(formKey, iframe);
        
        // iframe이 제거될 때 리스너도 제거 (메모리 누수 방지)
        // 이는 나중에 구현 가능
        
        // iframe 로드 완료 대기
        iframe.addEventListener('load', function() {
          // 404 에러 체크: iframe의 contentDocument가 없거나 에러 페이지인 경우
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const isErrorPage = iframeDoc.body && (
              iframeDoc.body.textContent.includes('404') || 
              iframeDoc.body.textContent.includes('Not Found') ||
              iframeDoc.title.includes('404')
            );
            
            if (isErrorPage) {
              console.warn(`[App] Form file not found (404): ${formPath}`);
              formContentEl.removeAttribute('data-loading');
              formContentEl.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
                  <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">
                    양식 파일을 찾을 수 없습니다
                  </div>
                  <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">
                    양식 경로: ${formPath}
                  </div>
                  <div style="font-size: 12px; color: var(--text-tertiary);">
                    이 양식은 아직 구현되지 않았습니다.
                  </div>
                </div>
              `;
              return;
            }
          } catch (e) {
            // cross-origin 에러는 무시 (같은 origin이면 발생하지 않음)
            console.warn(`[App] Cannot check iframe content (may be cross-origin): ${formPath}`);
          }
          
          console.log(`[App] Form iframe loaded: ${formKey}`, { 
            skipFillData: options.skipFillData,
            iframe: !!iframe,
            contentWindow: !!(iframe && iframe.contentWindow)
          });
          formContentEl.removeAttribute('data-loading');
          formContentEl.setAttribute('data-loaded', 'true');
          
          // 데이터 주입 (Phase 3)
          if (!options.skipFillData) {
            console.log(`[App] Scheduling data injection for form: ${formKey}`);
            // iframe이 완전히 로드된 후 데이터 전송
            setTimeout(() => {
              console.log(`[App] Executing data injection for form: ${formKey}`);
              sendDataToForm(iframe, formKey);
            }, 100);
          } else {
            console.log(`[App] Skipping data injection for form: ${formKey} (skipFillData=true)`);
          }
        });
        
        // iframe 로드 에러 처리 (404 등)
        iframe.addEventListener('error', function() {
          console.warn(`[App] Form iframe load error: ${formPath}`);
          formContentEl.removeAttribute('data-loading');
          formContentEl.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
              <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">
                양식을 불러올 수 없습니다
              </div>
              <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">
                양식 경로: ${formPath}
              </div>
              <div style="font-size: 12px; color: var(--text-tertiary);">
                이 양식은 아직 구현되지 않았습니다.
              </div>
            </div>
          `;
        });
        
        // iframe에 src 설정
        iframe.src = formPath;
        
        // 부모 컨테이너에 스크롤 활성화 (iframe 내부 스크롤 대신 부모에서 스크롤)
        if (formContentEl.classList.contains('form-section-content')) {
          formContentEl.style.overflow = 'auto';
          formContentEl.style.overflowX = 'hidden';
        }
        
        // 기존 로딩 메시지 제거하고 iframe 삽입
        formContentEl.innerHTML = '';
        formContentEl.appendChild(iframe);
        
        return iframe;
      } catch (error) {
        formContentEl.removeAttribute('data-loading');
        console.error('Error loading form:', error, 'Path:', formPath);
        formContentEl.innerHTML = `
          <div style="padding: 40px; text-align: center; color: #ff3b30;">
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
              양식을 불러오는 중 오류가 발생했습니다.
            </div>
            <div style="font-size: 14px; color: #666;">
              ${error.message || '알 수 없는 오류'}
            </div>
          </div>
        `;
        return null;
      }
  }
  
  function initTabsPage() {
    // 중복 초기화 방지
    if (document.body.hasAttribute('data-tabs-initialized')) {
      return;
    }
    document.body.setAttribute('data-tabs-initialized', 'true');
    
    const customer = load(STORAGE.customer, null);
    const forms = getSelectedForms();

    if (customer) setText("#selected-customer", formatCustomerLine(customer));
    setText("#tab-count", String(forms.length));
    const selectedList = qs("#selected-forms-list");
    if (selectedList) {
      selectedList.innerHTML = forms.length
        ? `<ul style="margin-left: 18px; color: var(--text-secondary); line-height: 1.7;">
            ${forms
              .map((f) => `<li>${f.title} ${f.requiresSignature ? '<span class="app-badge" style="margin-left:6px;">서명</span>' : ""}</li>`)
              .join("")}
          </ul>`
        : "-";
    }

    const tabMenu = qs("#tab-menu");
    const tabHost = qs("#tab-host");
    if (!tabMenu || !tabHost) return;

    if (forms.length === 0) {
      tabMenu.innerHTML = "";
      tabHost.innerHTML = `<div class="result-placeholder"><p>선택된 항목이 없습니다. 이전 화면에서 1개 이상 선택해주세요.</p></div>`;
      return;
    }

    // stepper 높이 계산 및 form-selection-header top 설정
    const stepper = qs(".t-stepper");
    const formSelectionHeader = qs(".form-selection-header");
    
    if (stepper && formSelectionHeader) {
      const stepperHeight = stepper.offsetHeight;
      // stepper 바로 아래에 위치하도록 top 설정
      formSelectionHeader.style.top = `${stepperHeight - 12}px`; // stepper의 margin-bottom 12px 고려
    }

    // 상단: 양식 썸네일 목록
    tabMenu.innerHTML = forms
      .map(
        (f, idx) => `
          <div class="form-thumbnail ${idx === 0 ? "active" : ""}" data-form-key="${f.key}" role="button" tabindex="0">
            <div class="form-thumbnail-icon">📄</div>
            <div class="form-thumbnail-title">${f.title}</div>
          </div>
        `
      )
      .join("");

    // 하단: 양식 섹션 리스트 (Tab 방식 - HTML Import)
    tabHost.innerHTML = forms
      .map(
        (f, idx) => {
          // app/04_tabs.html에서 forms/ 경로로 접근하려면 ../forms/ 필요
          const formPath = f.file.startsWith('../') ? f.file : `../${f.file}`;
          return `
          <div class="form-section-item tab-pane ${idx === 0 ? 'active' : ''}" data-form-key="${f.key}" id="form-${f.key}">
            <div class="form-section-content" data-form-path="${formPath}">
              <div class="form-loading" style="padding: 40px; text-align: center; color: var(--text-secondary);">
                양식을 불러오는 중...
              </div>
            </div>
          </div>
        `;
        }
      )
      .join("");

    // 참고: 날짜 선택기는 양식 파일에서 직접 처리 (표준 HTML5 type="date" 사용)
    // fillFormData는 전역 함수로 이동됨 (위쪽 참조)
    
    // 모든 양식 로드 (비동기 처리)
    (async () => {
      const formContents = qsa(".form-section-content", tabHost);
      for (const contentEl of formContents) {
        const formPath = contentEl.getAttribute("data-form-path");
        const formItem = contentEl.closest(".form-section-item");
        const formKey = formItem ? formItem.getAttribute("data-form-key") : "";
        
        if (formPath) {
          // iframe 방식으로 양식 로드 (날짜 선택기는 양식 파일에서 직접 초기화됨)
          await loadFormHTML(contentEl, formPath, formKey);
        }
      }
    })();

    // 상단 썸네일 클릭 시 Tab 전환
    qsa(".form-thumbnail", tabMenu).forEach((thumb) => {
      thumb.addEventListener("click", function () {
        const formKey = this.getAttribute("data-form-key");
        
        // 상단 썸네일 활성화 상태 업데이트
        qsa(".form-thumbnail", tabMenu).forEach((t) => t.classList.remove("active"));
        this.classList.add("active");
        
        // 하단 양식 섹션 Tab 전환
        qsa(".form-section-item", tabHost).forEach((item) => {
          item.classList.remove("active");
        });
        
        const formSection = qs(`[data-form-key="${formKey}"]`, tabHost);
        if (formSection) {
          formSection.classList.add("active");
          
          // Tab 전환 시 스크롤을 맨 위로
          const scrollContainer = qs(".t-body");
          if (scrollContainer) {
            scrollContainer.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
          
          // 양식 래퍼 내부 스크롤도 맨 위로
          const formWrapper = formSection.querySelector('.form-wrapper');
          if (formWrapper) {
            formWrapper.scrollTop = 0;
          }
        }
      });
      
      // 키보드 접근성
      thumb.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    // Signature (shared)
    const sigWrap = qs("#signature-block");
    if (sigWrap) {
      sigWrap.style.display = needsSignature(forms) ? "block" : "none";
    }

    // 고객 실명 입력 필드 초기화
    const realNameInput = qs("#customer-real-name");
    if (realNameInput) {
      const savedRealName = load(STORAGE.customerRealName, "");
      if (savedRealName) {
        realNameInput.value = savedRealName;
      }
      // 입력 시 저장
      realNameInput.addEventListener("input", function() {
        save(STORAGE.customerRealName, this.value.trim());
      });
    }

    initSignaturePad();

    const validate = qs("#validate-next");
    if (validate) {
      validate.addEventListener("click", function () {
        console.log('Validate button clicked');
        // 모든 양식의 동의 체크박스 확인 (iframe 방식)
        const tabHost = qs("#tab-host");
        if (tabHost) {
          const formSectionItems = tabHost.querySelectorAll('.form-section-item');
          const uncheckedForms = [];
          
          // iframe에서 동의 체크박스 확인
          const checkCheckboxes = async () => {
            const promises = [];
            
            formSectionItems.forEach((formSectionItem) => {
              const formKey = formSectionItem.getAttribute('data-form-key');
              if (!formKey) return;
              
              // iframe 방식으로 체크박스 확인
              if (window.formIframes && window.formIframes.has(formKey)) {
                promises.push(
                  requestFormDataFromIframe(formKey).then(data => {
                    if (!data['confirmation-checkbox']) {
                      // 양식 제목 찾기
                      const formThumbnail = qs(`.form-thumbnail[data-form-key="${formKey}"]`);
                      const formTitle = formThumbnail ? formThumbnail.querySelector('.form-thumbnail-title')?.textContent : (formKey || '알 수 없는 양식');
                      uncheckedForms.push({ title: formTitle, formKey: formKey, formSectionItem: formSectionItem });
                    }
                  })
                );
              } else {
                // 폴백: 기존 방식 (formWrapper 직접 접근)
                const formWrapper = formSectionItem.querySelector('.form-wrapper');
                if (formWrapper) {
                  const confirmationCheckbox = formWrapper.querySelector('#confirmation-checkbox');
                  if (confirmationCheckbox && !confirmationCheckbox.checked) {
                    // 양식 제목 찾기
                    const formThumbnail = qs(`.form-thumbnail[data-form-key="${formKey}"]`);
                    const formTitle = formThumbnail ? formThumbnail.querySelector('.form-thumbnail-title')?.textContent : (formKey || '알 수 없는 양식');
                    uncheckedForms.push({ title: formTitle, formKey: formKey, checkbox: confirmationCheckbox, formSectionItem: formSectionItem });
                  }
                }
              }
            });
            
            await Promise.all(promises);
            
            if (uncheckedForms.length > 0) {
              console.log('Unchecked forms found:', uncheckedForms);
              const formTitles = uncheckedForms.map(f => f.title).join(', ');
              toast("검증 오류", `다음 양식의 동의 체크박스를 확인해주세요:\n${formTitles}`);
              // 첫 번째 미체크 양식으로 이동
              const firstUnchecked = uncheckedForms[0];
              if (firstUnchecked.formKey) {
                // 해당 양식 탭으로 전환
                const thumbnail = qs(`.form-thumbnail[data-form-key="${firstUnchecked.formKey}"]`);
                if (thumbnail) {
                  thumbnail.click();
                }
                // 체크박스로 스크롤 및 포커스 (iframe인 경우 처리 불가)
                if (firstUnchecked.checkbox) {
                  setTimeout(() => {
                    firstUnchecked.checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => firstUnchecked.checkbox.focus(), 300);
                  }, 100);
                }
              }
              return false; // 검증 실패
            }
            
            return true; // 검증 성공
          };
          
          checkCheckboxes().then(isValid => {
            if (!isValid) return; // 검증 실패 시 중단
          
            console.log('Checkbox validation passed');
            
            // 서명이 필요한 경우 실명 필수 검증
            if (needsSignature(forms)) {
              console.log('Signature required, validating...');
              const realNameInput = qs("#customer-real-name");
              const realName = realNameInput ? realNameInput.value.trim() : "";
              if (!realName) {
                console.log('Real name validation failed');
                toast("검증 오류", "서명이 필요한 양식이 있으므로 실명을 입력해주세요.");
                if (realNameInput) {
                  realNameInput.focus();
                }
                return;
              }
              
              // 서명 확인
              const signature = load(STORAGE.signature, null);
              if (!signature || !signature.dataUrl) {
                console.log('Signature validation failed');
                toast("검증 오류", "서명이 필요합니다.");
                return;
              }
            }
            
            // 모든 검증 통과 후 다음 단계로 진행
            console.log('All validation passed, proceeding to data collection...');
            
            // 입력 양식에서 선택된 값들을 localStorage에 저장 (확인 화면에서 사용)
            // 모든 양식의 데이터를 수집하여 저장 (iframe 방식)
            const formSectionItems = tabHost.querySelectorAll('.form-section-item');
            const allFormData = {};
            
            // 모든 양식의 데이터를 비동기로 수집
            const collectAllFormData = async () => {
              const promises = [];
              
              formSectionItems.forEach((formSectionItem) => {
                const formKey = formSectionItem.getAttribute('data-form-key');
                if (!formKey) return;
                
                // iframe 방식으로 데이터 수집
                if (window.formIframes && window.formIframes.has(formKey)) {
                  promises.push(
                    requestFormDataFromIframe(formKey).then(data => {
                      if (data && Object.keys(data).length > 0) {
                        allFormData[formKey] = data;
                      }
                    })
                  );
                } else {
                  // 폴백: 기존 방식 (formWrapper 직접 접근)
                  const formWrapper = formSectionItem.querySelector('.form-wrapper');
                  if (formWrapper && formKey) {
                    if (!allFormData[formKey]) {
                      allFormData[formKey] = {};
                    }
                    
                    // 호칭 (Title) 및 국가번호는 iframe에서 수집된 데이터에서 가져오기
                    // (iframe 방식에서는 이미 수집된 데이터에 포함되어 있음)
                    
                    // 조건부 필드 값 수집
                    const conditionalFields = {
                      'treatment-type-others': '#treatment-others-input input',
                      'medical-aesthetic-details': '#medical-aesthetic-input input',
                      'medication-products-details': '#medication-products-input input',
                      'medication-duration-from': '#medication-duration-from',
                      'medication-duration-to': '#medication-duration-to',
                      'body-treatment-type': '#body-treatment-type-block input',
                      'massage-pressure-others': '#massage-pressure-input input',
                      'injuries-details': '#injuries-input input',
                      'surgeries-details': '#surgeries-input input',
                      'long-term-medication-details': '#long-term-medication-input input',
                      'allergies-details': '#allergies-input input',
                      'chronic-conditions-others': '#chronic-conditions-input input'
                    };
                    
                    Object.keys(conditionalFields).forEach(fieldKey => {
                      const selector = conditionalFields[fieldKey];
                      let input = null;
                      
                      if (selector.includes('#body-treatment-type-block')) {
                        const block = formWrapper.querySelector('#body-treatment-type-block');
                        if (block && block.style.display !== 'none') {
                          input = block.querySelector('input');
                        }
                      } else {
                        input = formWrapper.querySelector(selector);
                      }
                      
                      if (input && input.value) {
                        allFormData[formKey][fieldKey] = input.value;
                      }
                    });
                  }
                }
              });
              
              // 모든 데이터 수집 완료 대기
              await Promise.all(promises);
              
              // 호칭 (Title) 및 국가번호 저장 (첫 번째 양식에서)
              if (allFormData['member-consultation']) {
                if (allFormData['member-consultation']['title']) {
                  save(STORAGE.formTitle, allFormData['member-consultation']['title']);
                }
                if (allFormData['member-consultation']['country-code']) {
                  save(STORAGE.formCountryCode, allFormData['member-consultation']['country-code']);
                }
              }
              
              // 수집한 조건부 필드 데이터를 localStorage에 저장
              save(STORAGE.conditionalFormData, allFormData);
              
              // 모든 검증 통과 시 다음 페이지로 이동
              console.log('All validation passed, navigating to review page');
              navFlow("review");
            };
            
            collectAllFormData();
          });
        }
      });
    } else {
      console.error('Validate button not found');
    }

    const backBtn = qs("#back-to-consultation-selection");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        if (confirm("양식을 다시 선택하시겠습니까?\n작성 중인 내용이 모두 초기화됩니다.")) {
          navFlow("consultationSelection");
        }
      });
    }
  }

  function initReviewPage() {
    const customer = load(STORAGE.customer, null);
    const forms = getSelectedForms();

    if (customer) setText("#selected-customer", formatCustomerLine(customer));
    setText("#tab-count", String(forms.length));
    const selectedList = qs("#selected-forms-list");
    if (selectedList) {
      selectedList.innerHTML = forms.length
        ? `<ul style="margin-left: 18px; color: var(--text-secondary); line-height: 1.7;">
            ${forms
              .map((f) => `<li>${f.title} ${f.requiresSignature ? '<span class="app-badge" style="margin-left:6px;">서명</span>' : ""}</li>`)
              .join("")}
          </ul>`
        : "-";
    }

    const tabMenu = qs("#tab-menu");
    const tabHost = qs("#tab-host");
    if (!tabMenu || !tabHost) return;

    if (forms.length === 0) {
      tabMenu.innerHTML = "";
      tabHost.innerHTML = `<div class="result-placeholder"><p>확인할 항목이 없습니다.</p></div>`;
      return;
    }

    // stepper 높이 계산 및 form-selection-header top 설정
    const stepper = qs(".t-stepper");
    const formHeader = qs(".form-selection-header");
    if (stepper && formHeader) {
      const stepperHeight = stepper.offsetHeight;
      formHeader.style.top = `${stepperHeight}px`;
    }

    // 상단: 양식 썸네일 목록
    tabMenu.innerHTML = forms
      .map(
        (f, idx) => `
          <div class="form-thumbnail ${idx === 0 ? "active" : ""}" data-form-key="${f.key}" role="button" tabindex="0">
            <div class="form-thumbnail-icon">📄</div>
            <div class="form-thumbnail-title">${f.title}</div>
          </div>
        `
      )
      .join("");

    // 하단: 양식 섹션 리스트 (입력 화면과 동일한 구조 사용)
    tabHost.innerHTML = forms
      .map(
        (f, idx) => {
          // PDF 템플릿 경로: forms/pdf/{번호}_pdf_{key}.html
          // 예: forms/01-01_form_member-consultation.html -> forms/pdf/01-01_pdf_member-consultation.html
          const formFileName = f.file.split('/').pop(); // 01-01_form_member-consultation.html
          const pdfFileName = formFileName.replace('_form_', '_pdf_'); // 01-01_pdf_member-consultation.html
          const pdfPath = `../forms/pdf/${pdfFileName}`;
          
          // 입력 화면과 동일한 구조 (tab-pane은 제거, 확인 화면은 아코디언 방식)
          return `
          <div class="form-section-item" data-form-key="${f.key}" id="form-${f.key}">
            <div class="form-section-content" data-form-path="${pdfPath}">
              <div class="form-loading" style="padding: 40px; text-align: center; color: var(--text-secondary);">
                양식을 불러오는 중...
              </div>
            </div>
          </div>
        `;
        }
      )
      .join("");

    // ============================================
    // PDF 템플릿 로드 및 데이터 주입 함수들
    // (입력 화면의 loadFormHTML, fillFormData와 완전히 분리)
    // ============================================
    
    // 입력 양식에서 데이터 수집 (iframe 방식 우선, 폴백으로 formWrapper 직접 접근)
    // 주의: 입력 화면은 iframe 방식 사용, 폴백은 PDF 템플릿용
    async function collectFormDataFromInput(formKey) {
      // iframe 방식으로 데이터 수집 시도 (입력 화면)
      if (window.formIframes && window.formIframes.has(formKey)) {
        try {
          const formData = await requestFormDataFromIframe(formKey);
          if (formData && Object.keys(formData).length > 0) {
            console.log(`[App] Form data collected from iframe: ${formKey}`, formData);
            return formData;
          }
        } catch (e) {
          console.error(`[App] Error collecting form data from iframe: ${formKey}`, e);
        }
      }
      
      // 폴백: formWrapper 직접 접근 (PDF 템플릿용)
      const formData = {};
      
      // 입력 양식에서 직접 값 수집 시도 (현재 활성화된 탭의 양식) - PDF 템플릿용
      const activeFormItem = qs(`.form-section-item[data-form-key="${formKey}"].active, .form-section-item[data-form-key="${formKey}"]`);
      let formWrapper = null;
      if (activeFormItem) {
        formWrapper = activeFormItem.querySelector('.form-wrapper');
      }
      
      // 고객 정보 (실명 우선, 없으면 POS 데이터 사용)
      const customerRealName = load(STORAGE.customerRealName, '');
      if (customer) {
        // 실명이 입력된 경우 실명을 사용, 없으면 POS 데이터의 이름 사용
        formData['customer-name'] = customerRealName || customer.name || '';
        
        // 호칭 (Title) - 저장된 값 우선, 없으면 입력 양식에서 선택된 값, 없으면 POS 데이터 사용
        const savedTitle = load(STORAGE.formTitle, '');
        if (savedTitle) {
          formData['title'] = savedTitle;
        } else if (formWrapper) {
          const titleRadio = formWrapper.querySelector('input[name="title"]:checked');
          if (titleRadio) {
            formData['title'] = titleRadio.value;
          } else {
            formData['title'] = customer.title || '';
          }
        } else {
          formData['title'] = customer.title || '';
        }
        
        formData['membership-number'] = customer.id || '';
        
        // 국가번호 (Country Code) - 저장된 값 우선, 없으면 입력 양식에서 선택된 값, 없으면 POS 데이터 사용
        const savedCountryCode = load(STORAGE.formCountryCode, '');
        if (savedCountryCode) {
          formData['country-code'] = savedCountryCode;
        } else if (formWrapper) {
          const countryCodeRadio = formWrapper.querySelector('input[name="country-code"]:checked');
          if (countryCodeRadio) {
            formData['country-code'] = countryCodeRadio.value;
          } else {
            formData['country-code'] = customer.countryCode || '';
          }
        } else {
          formData['country-code'] = customer.countryCode || '';
        }
        
        // 연락처 - 입력 양식에서 입력된 값 우선, 없으면 POS 데이터 사용
        if (formWrapper) {
          const contactInput = formWrapper.querySelector('#contact-number');
          if (contactInput && contactInput.value) {
            formData['contact-number'] = contactInput.value;
          } else {
            formData['contact-number'] = customer.phone || '';
          }
        } else {
          formData['contact-number'] = customer.phone || '';
        }
        
        // 이메일 - 입력 양식에서 입력된 값 우선, 없으면 POS 데이터 사용
        if (formWrapper) {
          const emailInput = formWrapper.querySelector('#email');
          if (emailInput && emailInput.value) {
            formData['email'] = emailInput.value;
          } else {
            formData['email'] = customer.email || '';
          }
        } else {
          formData['email'] = customer.email || '';
        }
      }
      
      // 조건부 입력 필드 값 수집
      // 1. localStorage에서 저장된 값 우선 사용 (입력 화면에서 저장된 값)
      const savedConditionalData = load(STORAGE.conditionalFormData, {});
      if (savedConditionalData[formKey]) {
        Object.assign(formData, savedConditionalData[formKey]);
      }
      
      // 2. 입력 양식에서 직접 읽기 (입력 화면에서만 가능)
      if (formWrapper) {
        // Treatment type others
        const treatmentOthersInput = formWrapper.querySelector('#treatment-others-input input');
        if (treatmentOthersInput && treatmentOthersInput.value) {
          formData['treatment-type-others'] = treatmentOthersInput.value;
        }
        
        // Medical aesthetic details
        const medicalAestheticInput = formWrapper.querySelector('#medical-aesthetic-input input');
        if (medicalAestheticInput && medicalAestheticInput.value) {
          formData['medical-aesthetic-details'] = medicalAestheticInput.value;
        }
        
        // Medication products details
        const medicationProductsInput = formWrapper.querySelector('#medication-products-input input');
        if (medicationProductsInput && medicationProductsInput.value) {
          formData['medication-products-details'] = medicationProductsInput.value;
        }
        
        // Medication duration (from/to)
        const medicationDurationFrom = formWrapper.querySelector('#medication-duration-from');
        if (medicationDurationFrom && medicationDurationFrom.value) {
          formData['medication-duration-from'] = medicationDurationFrom.value;
        }
        const medicationDurationTo = formWrapper.querySelector('#medication-duration-to');
        if (medicationDurationTo && medicationDurationTo.value) {
          formData['medication-duration-to'] = medicationDurationTo.value;
        }
        
        // Body treatment type
        const bodyTreatmentTypeBlock = formWrapper.querySelector('#body-treatment-type-block');
        if (bodyTreatmentTypeBlock && bodyTreatmentTypeBlock.style.display !== 'none') {
          const bodyTreatmentTypeInput = bodyTreatmentTypeBlock.querySelector('input');
          if (bodyTreatmentTypeInput && bodyTreatmentTypeInput.value) {
            formData['body-treatment-type'] = bodyTreatmentTypeInput.value;
          }
        }
        
        // Massage pressure others
        const massagePressureInput = formWrapper.querySelector('#massage-pressure-input input');
        if (massagePressureInput && massagePressureInput.value) {
          formData['massage-pressure-others'] = massagePressureInput.value;
        }
        
        // Injuries details
        const injuriesInput = formWrapper.querySelector('#injuries-input input');
        if (injuriesInput && injuriesInput.value) {
          formData['injuries-details'] = injuriesInput.value;
        }
        
        // Surgeries details
        const surgeriesInput = formWrapper.querySelector('#surgeries-input input');
        if (surgeriesInput && surgeriesInput.value) {
          formData['surgeries-details'] = surgeriesInput.value;
        }
        
        // Long-term medication details
        const longTermMedicationInput = formWrapper.querySelector('#long-term-medication-input input');
        if (longTermMedicationInput && longTermMedicationInput.value) {
          formData['long-term-medication-details'] = longTermMedicationInput.value;
        }
        
        // Allergies details
        const allergiesInput = formWrapper.querySelector('#allergies-input input');
        if (allergiesInput && allergiesInput.value) {
          formData['allergies-details'] = allergiesInput.value;
        }
        
        // Chronic conditions others
        const chronicConditionsInput = formWrapper.querySelector('#chronic-conditions-input input');
        if (chronicConditionsInput && chronicConditionsInput.value) {
          formData['chronic-conditions-others'] = chronicConditionsInput.value;
        }
      }
      
      // 서명 정보
      const signature = load(STORAGE.signature, null);
      if (signature && signature.dataUrl) {
        formData['signature-image'] = signature.dataUrl;
      }
      
      // 서명 날짜/시간
      const now = new Date();
      formData['signature-date'] = formatDateHK(now);
      formData['signature-time'] = formatTimeHK(now);
      
      return formData;
    }
    
    // PDF 템플릿에 데이터 주입
    // formWrapper는 실제로는 iframe의 contentDocument.body 또는 DOM 요소
    function injectPDFDataToTemplate(formWrapper, formData, formKey) {
      // PDF 템플릿 내부의 injectPDFData 함수 호출 (formWrapper 내부에서만 작동하도록 수정)
      const injectScript = formWrapper.querySelector ? formWrapper.querySelector('script') : null;
      if (injectScript && injectScript.textContent.includes('function injectPDFData')) {
        try {
          // injectPDFData 함수를 formWrapper 내부에서만 작동하도록 수정하여 호출
          const injectFunctionCode = injectScript.textContent.replace(
            /document\.querySelectorAll/g,
            'formWrapper.querySelectorAll'
          );
          const executeInject = new Function('formData', 'formWrapper', `
            ${injectFunctionCode}
            return injectPDFData(formData);
          `);
          executeInject(formData, formWrapper);
        } catch (e) {
          console.warn('PDF data injection error:', e);
        }
      }
      
      // 직접 데이터 주입 (formWrapper 내부에서만)
      // 디버깅: formData 확인
      console.log('[injectPDFDataToTemplate] formData:', {
        title: formData['title'],
        'country-code': formData['country-code'],
        'customer-name': formData['customer-name']
      });
      
      // 1. pdf-value 요소 처리
      formWrapper.querySelectorAll('.pdf-value[data-field]').forEach(element => {
        const fieldName = element.getAttribute('data-field');
        const value = formData[fieldName];
        if (value !== undefined && value !== null && value !== '') {
          element.textContent = value;
        } else {
          element.textContent = '________________';
        }
      });
      
      // 2. pdf-radio 요소 처리 (호칭, 국가번호 등) - 직접 찾아서 처리
      formWrapper.querySelectorAll('.pdf-radio').forEach(element => {
        const fieldGroup = element.closest('.pdf-option-group[data-field]');
        if (fieldGroup) {
          const groupFieldName = fieldGroup.getAttribute('data-field');
          const groupValue = formData[groupFieldName];
          const elementValue = element.getAttribute('data-value');
          
          // 디버깅: 각 라디오 버튼 확인
          if (groupFieldName === 'title' || groupFieldName === 'country-code') {
            console.log(`[injectPDFDataToTemplate] ${groupFieldName}:`, {
              groupValue,
              elementValue,
              match: groupValue === elementValue || String(groupValue) === String(elementValue)
            });
          }
          
          // 값이 정확히 일치하면 선택 표시
          if (groupValue === elementValue || String(groupValue) === String(elementValue)) {
            element.classList.add('checked');
            console.log(`[injectPDFDataToTemplate] Added 'checked' class to ${groupFieldName} = ${elementValue}`);
          }
        }
      });
      
      // 3. pdf-checkbox 요소 처리
      formWrapper.querySelectorAll('.pdf-checkbox').forEach(element => {
        const fieldGroup = element.closest('[data-field]');
        if (fieldGroup) {
          const groupFieldName = fieldGroup.getAttribute('data-field');
          const groupValue = formData[groupFieldName];
          const elementValue = element.getAttribute('data-value');
          if (Array.isArray(groupValue) && groupValue.includes(elementValue)) {
            element.classList.add('checked');
          } else if (typeof groupValue === 'string' && groupValue.split(',').includes(elementValue)) {
            element.classList.add('checked');
          } else if (groupValue === true || groupValue === 'true') {
            // 약관동의 체크박스는 boolean true로 처리
            element.classList.add('checked');
          }
        }
      });
      
      // 4. 기타 data-field 요소 처리 (pdf-value가 아닌 경우)
      formWrapper.querySelectorAll('[data-field]').forEach(element => {
        if (element.classList.contains('pdf-value') || 
            element.classList.contains('pdf-radio') || 
            element.classList.contains('pdf-checkbox') ||
            element.classList.contains('pdf-option-group')) {
          // 이미 처리된 요소는 건너뛰기
          return;
        }
        const fieldName = element.getAttribute('data-field');
        const value = formData[fieldName];
        if (value !== undefined && value !== null && value !== '') {
          element.textContent = value;
        }
      });
      
      // 5. 조건부 섹션 표시/숨김 처리
      formWrapper.querySelectorAll('[data-conditional]').forEach(element => {
        const conditionalField = element.getAttribute('data-conditional');
        const conditionalValues = element.getAttribute('data-conditional-values').split(',').map(v => v.trim());
        const fieldValue = formData[conditionalField];
        
        // 체크박스의 경우 배열이나 쉼표로 구분된 문자열일 수 있음
        let shouldShow = false;
        if (Array.isArray(fieldValue)) {
          shouldShow = conditionalValues.some(cv => fieldValue.includes(cv));
        } else if (typeof fieldValue === 'string' && fieldValue.includes(',')) {
          const fieldValues = fieldValue.split(',').map(v => v.trim());
          shouldShow = conditionalValues.some(cv => fieldValues.includes(cv));
        } else {
          shouldShow = conditionalValues.includes(String(fieldValue));
        }
        
        if (shouldShow) {
          element.style.display = 'block';
        } else {
          element.style.display = 'none';
        }
      });
      
      // 서명 이미지 직접 주입 (div.signature-line에 img 태그 생성)
      const signatureLine = formWrapper.querySelector('[data-field="signature-image"]');
      if (signatureLine && formData['signature-image']) {
        // 기존 이미지 제거
        signatureLine.innerHTML = '';
        // 새 이미지 생성
        const img = document.createElement('img');
        img.src = formData['signature-image'];
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.maxHeight = '100px';
        signatureLine.appendChild(img);
      }
      
      // 약관동의 체크박스 체크 (필수이므로 항상 체크됨)
      const confirmationCheckbox = formWrapper.querySelector('[data-field="confirmation-checkbox"]');
      if (confirmationCheckbox) {
        confirmationCheckbox.classList.add('checked');
      }
      
      // 매장/직원 정보 주입 (PDF 전용 필드)
      const currentStaff = load(STORAGE.staff, null);
      const reviewStaffId = load(STORAGE.reviewStaff, '');
      const reviewStaff = SAMPLE_STAFF.find(s => s.staffId === reviewStaffId);
      
      // 매장 정보 (currentStaff 또는 reviewStaff에서 가져오기)
      if (currentStaff && currentStaff.storeId) {
        const storeField = formWrapper.querySelector('[data-field="store-registration"]');
        if (storeField) {
          storeField.textContent = currentStaff.storeName || currentStaff.storeId;
        }
      } else if (reviewStaff && reviewStaff.storeId) {
        const storeField = formWrapper.querySelector('[data-field="store-registration"]');
        if (storeField) {
          storeField.textContent = reviewStaff.storeName || reviewStaff.storeId;
        }
      }
      
      // 담당 직원 정보
      if (reviewStaff) {
        const staffField = formWrapper.querySelector('[data-field="responsible-staff"]');
        if (staffField) {
          staffField.textContent = reviewStaff.name || reviewStaff.staffId;
        }
      }
    }
    
    // 입력 화면의 loadFormHTML 함수를 그대로 사용 (PDF 템플릿 경로만 전달)
    // 모든 PDF 템플릿 로드 (입력 화면과 동일한 방식)
    // DOM이 완전히 렌더링된 후 실행
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        try {
          if (!tabHost) {
            console.error('Review page: tabHost not found');
            return;
          }
          
          const formContents = qsa(".form-section-content", tabHost);
          console.log('Review page: Found form contents:', formContents.length);
          
          if (formContents.length === 0) {
            console.warn('Review page: No form contents found');
            return;
          }
          
          for (const contentEl of formContents) {
            const formPath = contentEl.getAttribute("data-form-path");
            const formItem = contentEl.closest(".form-section-item");
            const formKey = formItem ? formItem.getAttribute("data-form-key") : "";
            
            console.log('Review page: Loading form', { formKey, formPath });
            
            if (formPath) {
              try {
                // 입력 화면의 loadFormHTML 함수를 그대로 사용 (skipFillData 옵션으로 fillFormData 건너뛰기)
                const formWrapper = await loadFormHTML(contentEl, formPath, formKey, { skipFillData: true });
                
                console.log('Review page: Form loaded', { formKey, formPath, formWrapper: !!formWrapper });
                
                // PDF 템플릿에 데이터 주입 (loadFormHTML 후)
                // loadFormHTML은 iframe을 반환하므로, iframe 내부의 document에 접근
                if (formWrapper) {
                  // formWrapper는 실제로 iframe 요소
                  const iframe = formWrapper;
                  const formData = await collectFormDataFromInput(formKey);
                  console.log('Review page: Injecting data', { formKey, formData });
                  
                  // iframe 내부의 document에 접근하여 데이터 주입
                  try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDoc) {
                      injectPDFDataToTemplate(iframeDoc.body, formData, formKey);
                      
                      // 데이터 주입을 다시 한 번 실행 (스크립트 실행 후)
                      setTimeout(() => {
                        injectPDFDataToTemplate(iframeDoc.body, formData, formKey);
                      }, 100);
                      
                      // 추가 안전장치: 데이터 주입을 한 번 더 실행 (더 긴 지연 후)
                      setTimeout(() => {
                        injectPDFDataToTemplate(iframeDoc.body, formData, formKey);
                      }, 300);
                    }
                  } catch (e) {
                    console.error('Review page: Cannot access iframe content', e);
                  }
                } else {
                  // formWrapper가 null이면 에러 메시지 표시
                  console.error('Review page: Form wrapper is null', { formKey, formPath });
                  if (contentEl.querySelector('.form-loading')) {
                    contentEl.innerHTML = `
                      <div style="padding: 40px; text-align: center; color: #ff3b30;">
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                          양식을 불러올 수 없습니다
                        </div>
                        <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                          양식 경로: ${formPath}
                        </div>
                        <div style="font-size: 12px; color: #999;">
                          콘솔을 확인하세요 (F12)
                        </div>
                      </div>
                    `;
                  }
                }
              } catch (error) {
                console.error('Review page: Error loading form', { formKey, formPath, error });
                // 에러 발생 시 에러 메시지 표시
                if (contentEl.querySelector('.form-loading') || contentEl.hasAttribute('data-loading')) {
                  contentEl.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #ff3b30;">
                      <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                        양식을 불러오는 중 오류가 발생했습니다
                      </div>
                      <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                        ${error.message || '알 수 없는 오류'}
                      </div>
                      <div style="font-size: 12px; color: #999;">
                        양식 경로: ${formPath}
                      </div>
                    </div>
                  `;
                  contentEl.removeAttribute('data-loading');
                }
              }
            } else {
              console.warn('Review page: No form path found', { formKey });
            }
          }
        } catch (error) {
          console.error('Review page: Error in form loading loop', error);
        }
      });
    });

    // 상단 썸네일 클릭 시 하단 PDF 템플릿으로 스크롤
    qsa(".form-thumbnail", tabMenu).forEach((thumb) => {
      thumb.addEventListener("click", function () {
        const formKey = this.getAttribute("data-form-key");
        
        // 상단 썸네일 활성화 상태 업데이트
        qsa(".form-thumbnail", tabMenu).forEach((t) => t.classList.remove("active"));
        this.classList.add("active");
        
        // 하단 PDF 템플릿 섹션 찾기 및 스크롤
        const formSection = qs(`[data-form-key="${formKey}"]`, tabHost);
        if (formSection) {
          // 스크롤 (stepper + sticky header 높이 고려)
          setTimeout(() => {
            const stepper = qs(".t-stepper");
            const stickyHeader = qs(".form-selection-header");
            const stepperHeight = stepper ? stepper.offsetHeight : 0;
            const stickyHeight = stickyHeader ? stickyHeader.offsetHeight : 0;
            const totalStickyHeight = stepperHeight + stickyHeight;
            const scrollContainer = qs(".t-body");
            
            if (scrollContainer) {
              const containerRect = scrollContainer.getBoundingClientRect();
              const elementRect = formSection.getBoundingClientRect();
              
              // 스크롤 컨테이너 기준 상대 위치 계산
              const relativeTop = elementRect.top - containerRect.top + scrollContainer.scrollTop;
              const offsetPosition = relativeTop - totalStickyHeight - 8; // 8px 여유 공간
              
              // smooth scroll 지원 여부 확인
              if (scrollContainer.scrollTo) {
                scrollContainer.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth"
                });
              } else {
                // fallback: 직접 scrollTop 설정
                scrollContainer.scrollTop = offsetPosition;
              }
            } else {
              // fallback: window 스크롤
              const elementRect = formSection.getBoundingClientRect();
              const offsetPosition = elementRect.top + window.pageYOffset - totalStickyHeight - 8;
              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
              });
            }
          }, 50);
        }
      });
      
      // 키보드 접근성
      thumb.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    // 스크롤 시 현재 보이는 양식에 따라 썸네일 자동 활성화
    if (typeof IntersectionObserver !== 'undefined') {
      const observerOptions = {
        root: qs(".t-body"),
        rootMargin: '-20% 0px -60% 0px', // 상단 20% 지점에 들어오면 활성화
        threshold: 0
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const formKey = entry.target.getAttribute("data-form-key");
            const thumb = qs(`[data-form-key="${formKey}"]`, tabMenu);
            if (thumb) {
              // 썸네일 클릭으로 인한 스크롤이 아닐 때만 업데이트
              if (!thumb.classList.contains("active")) {
                qsa(".form-thumbnail", tabMenu).forEach((t) => t.classList.remove("active"));
                thumb.classList.add("active");
              }
            }
          }
        });
      }, observerOptions);

      // 모든 양식 섹션 관찰
      qsa(".form-section-item", tabHost).forEach(section => {
        observer.observe(section);
      });
    }

    // 고객 확인 섹션은 PDF에 주입되므로 화면에서 제거됨
    // 실명과 서명은 PDF 템플릿에 자동으로 주입됨

    // BC 정보 섹션 제거됨 (Step 2에서 이미 선택되었으므로 불필요)

    // 고객 전달 방법 선택 초기화
    const deliveryMethodList = qs("#delivery-method-list");
    if (deliveryMethodList) {
      const deliveryMethods = [
        { value: "email", label: "이메일 발송" },
        { value: "print", label: "출력" },
        { value: "none", label: "전달 안함" }
      ];
      
      const savedMethod = load(STORAGE.deliveryMethod, "none"); // 기본값: 전달 안함
      
      // 전달 방법 카드 렌더링
      deliveryMethodList.innerHTML = deliveryMethods
        .map(method => {
          const isSelected = savedMethod === method.value;
          return `
            <div class="delivery-method-card" data-method="${method.value}" style="border:1px solid ${isSelected ? "rgba(0, 122, 255, 0.65)" : "var(--border-light)"}; box-shadow: ${isSelected ? "0 0 0 3px rgba(0, 122, 255, 0.10)" : "none"}; border-radius: var(--border-radius); padding: 12px; cursor: pointer; transition: all 0.2s;">
              <div style="display:flex; align-items:center; gap: 12px;">
                <div style="flex: 0 0 auto; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: var(--border-radius); background: ${isSelected ? "rgba(0, 122, 255, 0.10)" : "transparent"};">
                  ${isSelected ? '<span style="color: var(--primary-color); font-size: 18px; font-weight: bold;">✓</span>' : ''}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: var(--font-weight-medium); color: var(--text-primary);">${method.label}</div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
      
      // 전달 방법 카드 클릭 이벤트
      qsa(".delivery-method-card", deliveryMethodList).forEach((card) => {
        card.addEventListener("click", function() {
          const methodValue = card.getAttribute("data-method");
          
          // 선택 상태 업데이트
          save(STORAGE.deliveryMethod, methodValue);
          
          // UI 업데이트
          qsa(".delivery-method-card", deliveryMethodList).forEach(c => {
            const isSelected = c.getAttribute("data-method") === methodValue;
            c.style.border = isSelected ? "1px solid rgba(0, 122, 255, 0.65)" : "1px solid var(--border-light)";
            c.style.boxShadow = isSelected ? "0 0 0 3px rgba(0, 122, 255, 0.10)" : "none";
            const iconArea = c.querySelector("div[style*='width: 36px']");
            if (iconArea) {
              iconArea.style.background = isSelected ? "rgba(0, 122, 255, 0.10)" : "transparent";
              iconArea.innerHTML = isSelected ? '<span style="color: var(--primary-color); font-size: 18px; font-weight: bold;">✓</span>' : '';
            }
          });
          
          const selectedMethod = deliveryMethods.find(m => m.value === methodValue);
          toast("전달 방법 선택됨", selectedMethod ? selectedMethod.label : "");
        });
      });
    }

    // 기타사항 입력 필드 초기화 (저장된 값이 있으면 복원)
    const bcNotes = qs("#bc-notes");
    if (bcNotes) {
      const savedNotes = load(STORAGE.bcNotes, "");
      if (savedNotes) {
        bcNotes.value = savedNotes;
      }
      // 입력 시 저장
      bcNotes.addEventListener("input", function() {
        save(STORAGE.bcNotes, this.value);
      });
    }

    const backBtn = qs("#back-to-input");
    if (backBtn) backBtn.addEventListener("click", () => navFlow("tabs"));

    const confirmBtn = qs("#confirm-next");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", function () {
        // 완료 페이지로 이동 (기본값: 성공)
        // 테스트를 위해 오류 상태를 확인하려면 wrapper 페이지의 테스트 데이터 버튼 사용
        // BC 선택은 Step 2에서 이미 완료되었으므로 여기서는 검증하지 않음
        save(STORAGE.completionStatus, "success");
        navFlow("completion");
      });
    }
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
    
    // 전달 방법 라벨
    const deliveryMethodLabels = {
      email: "이메일 발송",
      print: "출력",
      none: "전달 안함"
    };
    
    // 오류 메시지 정의
    const errorMessages = {
      network: {
        title: "전송 실패",
        message: "네트워크 오류로 인해 전송에 실패했습니다.",
        detail: "인터넷 연결을 확인하고 다시 시도해주세요.",
        retryable: true
      },
      validation: {
        title: "전송 실패",
        message: "데이터 검증 오류가 발생했습니다.",
        detail: "입력한 내용을 확인하고 수정 후 다시 시도해주세요.",
        retryable: false
      },
      server: {
        title: "전송 실패",
        message: "서버 오류가 발생했습니다.",
        detail: "잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의하세요.",
        retryable: true
      },
      permission: {
        title: "전송 실패",
        message: "권한 오류가 발생했습니다.",
        detail: "전송 권한이 없습니다. 관리자에게 문의하세요.",
        retryable: false
      }
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
      
      const currentDeliveryMethodLabels = {
        email: "이메일 발송",
        print: "출력",
        none: "전달 안함"
      };
      
      // 성공/오류 UI 업데이트
      if (currentStatus === "error") {
        const error = errorMessages[currentErrorType] || errorMessages.network;
        const errorTypeLabel = currentErrorType === "network" ? "네트워크 오류" : 
                              currentErrorType === "validation" ? "데이터 검증 오류" : 
                              currentErrorType === "server" ? "서버 오류" : "권한 오류";
        
        // 아이콘 변경
        if (statusIcon) {
          statusIcon.style.background = "rgba(255, 59, 48, 0.15)";
          statusIcon.innerHTML = '<span style="font-size: 48px; color: var(--error-color, #ff3b30);">✕</span>';
        }
        
        // 제목/메시지 변경
        if (statusTitle) statusTitle.textContent = error.title;
        if (statusMessage) statusMessage.textContent = error.message;
        
        // 재전송 버튼 표시 (재전송 가능한 경우만)
        if (retryBtn) {
          retryBtn.style.display = error.retryable ? "inline-block" : "none";
        }
        
        // 오류 결과 표시
        if (resultContent) {
          resultContent.innerHTML = `
            <div style="margin-bottom: 16px;">
              <div style="font-weight: var(--font-weight-medium); color: var(--text-primary); margin-bottom: 8px;">전송 시도 정보</div>
              <div style="padding: 12px; background: white; border-radius: var(--border-radius); border: 1px solid var(--border-light);">
                <div style="margin-bottom: 8px;"><strong>고객:</strong> ${currentCustomer ? formatCustomerLine(currentCustomer) : "(없음)"}</div>
                <div style="margin-bottom: 8px;"><strong>선택된 양식:</strong> ${currentForms.length}개</div>
                <div style="margin-bottom: 8px;"><strong>담당 BC:</strong> ${currentReviewStaff ? `${currentReviewStaff.name} (${currentReviewStaff.staffId})` : "(없음)"}</div>
                <div style="margin-bottom: 8px;"><strong>고객 전달 방법:</strong> ${currentDeliveryMethodLabels[currentDeliveryMethod] || "전달 안함"}</div>
                ${currentBcNotes ? `<div><strong>기타사항:</strong> ${currentBcNotes}</div>` : ""}
              </div>
            </div>
            <div style="padding: 12px; background: rgba(255, 59, 48, 0.10); border-radius: var(--border-radius); border: 1px solid rgba(255, 59, 48, 0.20);">
              <div style="font-weight: var(--font-weight-medium); color: var(--error-color, #ff3b30); margin-bottom: 4px;">✕ 전송 실패</div>
              <div style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 8px;">${error.detail}</div>
              <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                <strong>오류 유형:</strong> ${errorTypeLabel}
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
        
        if (statusTitle) statusTitle.textContent = "전송이 완료되었습니다";
        if (statusMessage) statusMessage.textContent = "상담 정보가 성공적으로 저장되었습니다.";
        
        // 재전송 버튼 숨김
        if (retryBtn) {
          retryBtn.style.display = "none";
        }
        
        // 성공 결과 표시
        if (resultContent) {
          resultContent.innerHTML = `
            <div style="margin-bottom: 16px;">
              <div style="font-weight: var(--font-weight-medium); color: var(--text-primary); margin-bottom: 8px;">저장된 상담 정보</div>
              <div style="padding: 12px; background: white; border-radius: var(--border-radius); border: 1px solid var(--border-light);">
                <div style="margin-bottom: 8px;"><strong>고객:</strong> ${currentCustomer ? formatCustomerLine(currentCustomer) : "(없음)"}</div>
                <div style="margin-bottom: 8px;"><strong>선택된 양식:</strong> ${currentForms.length}개</div>
                <div style="margin-bottom: 8px;"><strong>담당 BC:</strong> ${currentReviewStaff ? `${currentReviewStaff.name} (${currentReviewStaff.staffId})` : "(없음)"}</div>
                <div style="margin-bottom: 8px;"><strong>고객 전달 방법:</strong> ${currentDeliveryMethodLabels[currentDeliveryMethod] || "전달 안함"}</div>
                ${currentBcNotes ? `<div><strong>기타사항:</strong> ${currentBcNotes}</div>` : ""}
              </div>
            </div>
            <div style="padding: 12px; background: rgba(52, 199, 89, 0.10); border-radius: var(--border-radius); border: 1px solid rgba(52, 199, 89, 0.20);">
              <div style="font-weight: var(--font-weight-medium); color: var(--success-color, #34c759); margin-bottom: 4px;">✓ POS 저장 완료</div>
              <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">상담 정보가 POS 시스템에 성공적으로 저장되었습니다.</div>
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
          toast("재전송 성공", "상담 정보가 성공적으로 저장되었습니다.");
        } else {
          // 같은 오류 유형 유지
          toast("재전송 실패", "다시 시도해주세요.");
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
        if (confirm("처음으로 돌아가시겠습니까?\n모든 입력 내용이 초기화됩니다.")) {
          clearFlow();
          navFlow("login");
        }
      });
    }
  }

  function initSignaturePad() {
    const canvas = qs("#signature-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1f1f1f";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    // match CSS size with device pixels
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const saved = load(STORAGE.signature, null);
      if (saved && typeof saved.dataUrl === "string") {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = saved.dataUrl;
      }
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let drawing = false;
    let last = null;
    function pointFromEvent(e) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      return { x, y };
    }

    function start(e) {
      drawing = true;
      last = pointFromEvent(e);
      e.preventDefault();
    }
    function move(e) {
      if (!drawing) return;
      const p = pointFromEvent(e);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
      e.preventDefault();
    }
    function end() {
      if (!drawing) return;
      drawing = false;
      last = null;
      save(STORAGE.signature, { dataUrl: canvas.toDataURL("image/png"), savedAt: new Date().toISOString() });
      toast("서명 저장됨", "1회 수집된 서명이 모든 서명 필요 양식에 공통 적용됩니다(설계).");
    }

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);

    const clearBtn = qs("#clear-signature");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        localStorage.removeItem(STORAGE.signature);
        // 실명도 함께 삭제 (서명과 함께 증적 자료이므로)
        const realNameInput = qs("#customer-real-name");
        if (realNameInput) {
          realNameInput.value = "";
          localStorage.removeItem(STORAGE.customerRealName);
        }
        toast("서명 삭제됨", "서명과 실명이 삭제되었습니다. 고객이 다시 입력해야 합니다(설계).");
      });
    }
  }

  // ---------- boot ----------
  function initWrapperPage() {
    // Wrapper 페이지에서 테스트 데이터 표시
    const forms = getSelectedForms();
    const selectedList = qs("#selected-forms-list");
    if (selectedList) {
      selectedList.innerHTML = forms.length
        ? `<ul style="margin-left: 18px; color: var(--text-secondary); line-height: 1.7;">
            ${forms
              .map((f) => `<li>${f.title} ${f.requiresSignature ? '<span class="app-badge" style="margin-left:6px;">서명</span>' : ""}</li>`)
              .join("")}
          </ul>`
        : "-";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTopbar();
    renderCustomerSearchTestCases();
    const page = document.body.getAttribute("data-app-page") || "";
    if (page === "list") initListPage();
    if (page === "login") initLoginPage();
    if (page === "customer-search") initCustomerSearchPage();
    if (page === "consultation-selection") initConsultationSelectionPage();
    if (page === "tabs") initTabsPage();
    if (page === "review") initReviewPage();
    if (page === "completion") initCompletionPage();
    if (page === "wrapper") initWrapperPage();
  });
})();

