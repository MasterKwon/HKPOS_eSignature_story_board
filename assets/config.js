/* ============================================
   HK POS eSignature - Configuration
   - Constants, catalog, sample data
   ============================================ */

(function () {
  'use strict';

  // 전역 네임스페이스 생성
  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  // Storage keys
  window.HKPOS.STORAGE = {
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

  // Form catalog
  // 화면에 표시되는 양식 이름(다국어)은 assets/locales/*.json 의 form.<key>.title 에 정의되어 있으며,
  // 01.기획/assets/images/ 에 있는 실제 문서 양식명(예: [All Brands] 客人退款確認信_English Version,
  // [Template] SWS 會員咨詢表_English Version, SWS BL 使用美容儀器同意書 [Aqua Peel]_English Version 등)과
  // 의미적으로 대응합니다. config의 title/category/note는 기본값(한글)이며, UI에는 locale 번역이 사용됩니다.
  window.HKPOS.FORM_CATALOG = [
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
      file: "forms/03-02_form_collagen-drink-terms.html",
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

  // Sample customers (테스트 데이터)
  window.HKPOS.SAMPLE_CUSTOMERS = [
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

  // Sample staff (테스트 데이터)
  // 의도: "매장 선택 → 해당 매장 소속 직원만 목록 노출" 같은 UX를 쉽게 재현하기 위함
  // - staffId: 직원 ID (실데이터: 숫자 문자열)
  // - storeId / storeName: 소속 매장 정보(필터 기준)
  // - brandCd: 브랜드 코드(필터/표시 기준)
  // - password: 데모용 비밀번호(실서비스에서는 POS/SSO 정책 따름)
  window.HKPOS.SAMPLE_STAFF = [
    { staffId: "0101702", name: "BOWIE TSE", storeId: "HK000005", storeName: "TSSGW-GATEWAY ARCADE", brandCd: "HK10", password: "1234" },
    { staffId: "0101981", name: "KAMMI YIM", storeId: "HK000005", storeName: "TSSGW-GATEWAY ARCADE", brandCd: "HK10", password: "1234" },
    { staffId: "0102001", name: "VICKY CHAN", storeId: "HK000005", storeName: "TSSGW-GATEWAY ARCADE", brandCd: "HK10", password: "1234" },
    { staffId: "0101863", name: "STEPHANIE CHIU", storeId: "HK000047", storeName: "CWSTQ-TIME SQUARE", brandCd: "HK20", password: "1234" },
    { staffId: "0101754", name: "ROSE SO", storeId: "HK000047", storeName: "CWSTQ-TIME SQUARE", brandCd: "HK20", password: "1234" },
    { staffId: "0101715", name: "JODI LAM", storeId: "HK000047", storeName: "CWSTQ-TIME SQUARE", brandCd: "HK20", password: "1234" },
    { staffId: "0101939", name: "ESTHER YAU", storeId: "HK000047", storeName: "CWSTQ-TIME SQUARE", brandCd: "HK20", password: "1234" },
  ];

  // Sample sales / invoice line items (판매 정보 샘플: 환불 확인서 등에서 인보이스·제품 조회용)
  // - date: 판매일 (YYYY-MM-DD)
  // - invoiceNo: 인보이스 번호
  // - productCode: 제품 코드
  // - productInfo: 제품명/제품 정보
  // - price: 정가(Net Amt)
  window.HKPOS.SAMPLE_SALES = [
    { date: "2026-01-30", invoiceNo: "HK00004420260130010005", productCode: "270320578", productInfo: "SU GENTLE CLEANSING FOAM 200ML", price: 219.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010005", productCode: "270320580", productInfo: "SU GENTLE CLEANSING OIL 200ML", price: 232.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010005", productCode: "270320756", productInfo: "SU CGR CREAM RICH 50ML", price: 1309.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010005", productCode: "270327355", productInfo: "SU FCAS VI 8ML", price: 0.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010006", productCode: "270327413", productInfo: "SU FC ACTIVATING MASK 1 SHT", price: 0.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010006", productCode: "270327460", productInfo: "SU TUS GLOBAL GWP", price: 0.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010006", productCode: "270327468", productInfo: "SU GLOBAL CGR CRM RICH S 5ML 24AD", price: 0.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010007", productCode: "270320578", productInfo: "SU GENTLE CLEANSING FOAM 200ML", price: 219.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010007", productCode: "270320756", productInfo: "SU CGR CREAM RICH 50ML", price: 1309.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010008", productCode: "270320580", productInfo: "SU GENTLE CLEANSING OIL 200ML", price: 232.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010009", productCode: "270320578", productInfo: "SU GENTLE CLEANSING FOAM 200ML", price: 219.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010009", productCode: "270320580", productInfo: "SU GENTLE CLEANSING OIL 200ML", price: 232.00 },
    { date: "2026-01-30", invoiceNo: "HK00004420260130010010", productCode: "270320756", productInfo: "SU CGR CREAM RICH 50ML", price: 1309.00 },
  ];

  // Sample appointments (예약 정보 샘플: 예약 취소 면제서 등에서 Booking Search 느낌으로 조회용)
  // 회원은 이미 선택되어 있으므로 샘플데이터에는 회원 정보 없음. 누구를 선택해도 팝업 내용 동일.
  // - bookingId: 예약 ID (Booking Id)
  // - date: 예약 일자 (YYYY-MM-DD)
  // - time: 예약 시간대 (시작-종료, 예: "14:30-16:30")
  // - duration: 소요 시간(분)
  // - treatmentCode: 시술 코드
  // - treatmentName: 시술명 (Treatment Name)
  // - status: 상태 (Finished, Arrive, Reconfirm, Cancel, Time Out)
  // - shop: 매장 코드 (예: SP1PA-WO, SP1LG-LE)
  // - storeName: 매장명 (예약 위치 표시용)
  window.HKPOS.SAMPLE_APPOINTMENTS = [
    { bookingId: "1125526", date: "2026-01-30", time: "14:30-16:30", duration: 115, treatmentCode: "270551479", treatmentName: "SW SPA The Ultimate S Treatment", status: "Finished", shop: "SP1PA-WO", storeName: "TSSGW-GATEWAY ARCADE" },
    { bookingId: "1142770", date: "2026-01-30", time: "16:30-16:45", duration: 15, treatmentCode: "270550127", treatmentName: "SWS Amber Brightening Eye Treatment", status: "Arrive", shop: "SP1PA-WO", storeName: "TSSGW-GATEWAY ARCADE" },
    { bookingId: "1142771", date: "2026-01-30", time: "18:30-20:30", duration: 115, treatmentCode: "270551480", treatmentName: "Ginseng & Jade Renewing Treatment", status: "Reconfirm", shop: "SP1LG-LE", storeName: "CWSTQ-TIME SQUARE" },
    { bookingId: "1142772", date: "2026-01-30", time: "10:00-10:35", duration: 35, treatmentCode: "270550200", treatmentName: "SW Warm Amber Back x1", status: "Finished", shop: "SP1LG-LE", storeName: "CWSTQ-TIME SQUARE" },
    { bookingId: "1142773", date: "2026-01-30", time: "11:00-12:00", duration: 60, treatmentCode: "270551479", treatmentName: "SW SPA The Ultimate S Treatment", status: "Cancel", shop: "SP1PA-WO", storeName: "TSSGW-GATEWAY ARCADE" },
    { bookingId: "1142774", date: "2026-01-30", time: "09:00-09:45", duration: 45, treatmentCode: "270550128", treatmentName: "Lumiwise Brightening Facial", status: "Time Out", shop: "SP1LG-LE", storeName: "CWSTQ-TIME SQUARE" },
    { bookingId: "1142775", date: "2026-01-31", time: "10:00-11:00", duration: 60, treatmentCode: "270551479", treatmentName: "SW SPA The Ultimate S Treatment", status: "Reconfirm", shop: "SP1PA-WO", storeName: "TSSGW-GATEWAY ARCADE" },
    { bookingId: "1142776", date: "2026-01-31", time: "14:00-14:30", duration: 30, treatmentCode: "270550127", treatmentName: "SWS Amber Brightening Eye Treatment", status: "Arrive", shop: "SP1LG-LE", storeName: "CWSTQ-TIME SQUARE" },
    { bookingId: "1142777", date: "2026-01-31", time: "15:30-17:00", duration: 90, treatmentCode: "270551480", treatmentName: "Ginseng & Jade Renewing Treatment", status: "Reconfirm", shop: "SP1PA-WO", storeName: "TSSGW-GATEWAY ARCADE" },
    { bookingId: "1142778", date: "2026-02-01", time: "11:00-11:45", duration: 45, treatmentCode: "270550200", treatmentName: "SW Warm Amber Back x1", status: "Reconfirm", shop: "SP1LG-LE", storeName: "CWSTQ-TIME SQUARE" },
  ];

  // 브랜드 코드 → 브랜드명 (양식 로고/이름 컨버전: 로그인한 매장의 brandCd에 따라 표시)
  // - 양식 헤더·PDF 등에서 하드코딩 대신 HKPOS.BRAND_BY_CODE[currentStaff.brandCd] 사용
  window.HKPOS.BRAND_BY_CODE = {
    HK10: "LANEIGE",
    HK20: "Sulwhasoo",
    HK30: "AP",
  };

  // 브랜드별 로고 이미지 파일명 (동일 크기 170×75): assets/images/
  window.HKPOS.BRAND_LOGO_IMAGE = {
    HK10: "logo_laneige.png",
    HK20: "logo_sulwhasoo.png",
    HK30: "logo_ap.png",
  };

  // Flow pages configuration
  window.HKPOS.FLOW_PAGES = {
    login: { wrapper: "01_store-user-login.html", tablet: "01_login.html" },
    customerSearch: { wrapper: "02_main-customer-search.html", tablet: "02_customer-search.html" },
    consultationSelection: { wrapper: "03_consultation-selection.html", tablet: "03_consultation-selection.html" },
    tabs: { wrapper: "04_consultation-review-and-input-tabs.html", tablet: "04_tabs.html" },
    review: { wrapper: "05_consultation-review.html", tablet: "05_review.html" },
    completion: { wrapper: "06_consultation-completion.html", tablet: "06_completion.html" },
  };

  // Demo layout helpers
  window.HKPOS.DEMO = {
    helpCollapsed: "hkpos.demo.helpCollapsed",
    lang: "hkpos.demo.lang",
  };
})();
