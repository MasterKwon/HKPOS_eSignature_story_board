# 사용하지 않는 JS 함수 정리 보고서

app.js 분리 및 개발 방식 변경(iframe + postMessage) 이후, 정의만 있고 **호출되지 않는 함수** 및 **동작하지 않는 코드**를 정리한 결과입니다.

---

## 1. 호출처가 없는 함수 (삭제/주석 후보)

### 1.1 `assets/form-handler.js`

| 함수 | 설명 | 이유 |
|------|------|------|
| **fillFormData(formWrapper, customer, formKey)** | PDF 템플릿용 DOM 직접 접근으로 입력 필드 채우기 | 입력 화면은 **sendDataToForm**으로 postMessage 전송, 리뷰 화면은 **postMessage**로 PDF iframe에 데이터 전달. DOM 직접 채우기 방식은 사용하지 않음. |
| **injectPDFDataToTemplate(formWrapper, formData, formKey)** | PDF 템플릿 DOM에 수집 데이터 주입 (`.pdf-value`, `.pdf-radio` 등) | **review.js**는 `form-data-inject` postMessage로 PDF iframe에 데이터를 보내고, PDF 쪽 스크립트가 주입 처리. 이 함수는 어디에서도 호출되지 않음. |

- **권장**: 두 함수는 “이전 방식(직접 DOM 주입)” 잔재이므로, 서버 측 PDF 생성 등 다른 경로에서 쓰지 않는다면 **삭제** 또는 **deprecated 주석 + 내부 구현 비우기** 처리 가능.

---

## 2. 호출은 되지만 실제로는 동작하지 않는 코드

### 2.1 `assets/pages/list.js` — `initListPage()`

- **호출**: `app.js`에서 `data-app-page="list"`일 때 호출됨 (예: **index.html**).
- **내부 동작**: `#open-flow` 요소에 클릭 시 `clearFlow()` + `navFlow("login")` 실행.
- **문제**: 현재 **index.html**에는 **`#open-flow` id를 가진 요소가 없음**. “시작하기”는 `<a href="01_store-user-login.html">` 링크로만 있어서, `initListPage()`가 붙이는 이벤트는 절대 실행되지 않음.
- **권장**:
  - **A)** index.html의 “시작하기” 링크에 `id="open-flow"`를 부여하고, list.js에서 `preventDefault` 후 `clearFlow()` + `navFlow("login")` 호출하도록 하면 기존 의도(데이터 초기화 후 로그인으로 이동)가 복구됨.
  - **B)** “시작하기”는 그냥 링크로 두고, `initListPage()`에서 `#open-flow` 관련 코드를 제거하고 빈 함수로 두거나, list 페이지 초기화가 더 이상 필요 없으면 호출 자체를 app.js에서 제거.

---

## 3. 백업 파일

### 3.1 `assets/app_bak.js`

- 분리 전 단일 app 파일의 백업. 현재 **어떤 HTML/스크립트에서도 로드하지 않음**.
- 사용 중인 코드가 아니므로, “사용 안 하는 함수” 정리 시에는 **제외**하고, 프로젝트 정리 시 **삭제 또는 보관용으로만 유지** 여부만 결정하면 됨.

---

## 4. 참고: 사용 중인 모듈/함수 요약

- **Pages**: initListPage, initTopbar, initLoginPage, initCustomerSearchPage, initConsultationSelectionPage, initTabsPage, initReviewPage, initCompletionPage, initWrapperPage, initSignaturePad — 모두 호출처 있음 (initSignaturePad는 tabs.js에서 서명 탭 표시 시 호출).
- **Utils**: formatDateHK, formatTimeHK, clearFlowExceptStaff, navFlow, navTo, applyHelpCollapsedState, renderLoginTestAccounts, renderCustomerSearchTestCases, renderCustomerDetail, renderCustomerResults, getSelectedForms, needsSignature, formatCustomerLine, normalizePhone, getDemoStaffByStore 등 — 각각 다른 페이지/모듈에서 사용 중.
- **FormHandler**: requestFormDataFromIframe, sendDataToForm, loadFormHTML, collectFormDataFromInput — 사용 중. **fillFormData**, **injectPDFDataToTemplate** 만 미사용.
- **layout.js**: renderTopbar, ensureToast, initPreviewIframes — layout.js의 `run()` 및 i18n applyPage에서 사용 중.

---

## 5. 요약

| 구분 | 대상 | 권장 조치 |
|------|------|------------|
| 미호출 함수 | `FormHandler.fillFormData` | 삭제 또는 deprecated 처리 |
| 미호출 함수 | `FormHandler.injectPDFDataToTemplate` | 삭제 또는 deprecated 처리 |
| 동작 안 함 | `list.js` — `#open-flow` 없음 | index에 `#open-flow` 부여 후 사용하거나, list 초기화 로직 정리 |
| 백업 파일 | `app_bak.js` | 삭제/보관 결정만 (현재 미로드) |

이대로 적용하면 분리된 JS 구조에서 사용하지 않는 함수와 죽은 코드만 정리할 수 있습니다.
