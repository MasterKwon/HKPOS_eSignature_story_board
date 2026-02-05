# 양식 폼 개발 체크리스트

본 문서는 HK POS eSignature System의 13개 개별 양식 폼 개발을 위한 체크리스트입니다.

## 원본 양식 위치
- **이미지(권장)**: `기획설계/01.기획/assets/images/` — 양식별 폴더 안에 페이지별 PNG (`-1.png`, `-2.png` …). **PNG는 AI/도구로 읽어 레이아웃·필드 확인 가능.**
- **PDF(참고)**: `기획설계/참고자료/` — English Version PDF. PDF는 직접 읽을 수 없으므로, 원본 확인 시 위 이미지 또는 사람이 PDF를 보고 판단.

## 전체 진행 현황
- [x] 12 / 13 완료 (1-1, 2-1~2-6, 3-1, 3-2, 4-1, 4-2, 4-3 완료, 나머지 1개 동일 패턴 적용)

---

## 1. 상담 및 정보 수집

### [x] 1-1. 회원 상담표 ✅
- **파일명**: `forms/01-01_form_member-consultation.html` / PDF: `forms/pdf/01-01_pdf_member-consultation.html`
- **키**: `member-consultation`
- **카테고리**: 상담 및 정보 수집
- **서명 필요**: ✅ 예
- **설명**: 고객의 얼굴/신체 관리 습관, 신체 상태(임신 여부, 과거 부상/수술, 장기 복용약, 알레르기, 만성 질환, 미용 기기 사용 관련 주의 사항 등), 생활 습관(운동, 흡연, 수면, 식단, 음주, 수분 섭취 등)에 대한 상세 정보를 수집하여 상담에 활용합니다.
- **원본 양식**: `01.기획/assets/images/[Template] SWS 會員咨詢表_English Version/` (페이지별 -1.png, -2.png)
- **상태**: 완료 (나머지 양식 작업 시 본 패턴 참고)
- **비고**: 
  - **구성**: 2페이지로 구성 (Page 1: 얼굴/신체 관리 습관, Page 2: 신체 상태/생활 습관)
  - **입력 필드**: 다양한 체크박스, 라디오 버튼, 텍스트 입력 필드 포함
  - **주요 섹션**: 
    - 관리 습관: 얼굴 관리 빈도, 시술 유형, 의료 미용 시술 이력, 지속 치료 필요 여부, 약물/제품 사용 이력
    - 신체 상태: 임신 상태, 부상/수술 이력, 장기 복용약, 알레르기, 만성 질환, 미용 기기 사용 금기 사항 (27개 항목)
    - 생활 습관: 운동, 흡연, 수면 품질/시간/문제, 식단 선호도, 차/커피, 음주, 수분 섭취
  - **확인 문구**: "위 정보가 정확함을 확인하며, 향후 의료 미용 시술을 받거나 피부 상태가 변경될 경우 상담 직원에게 사전에 알리겠습니다" 동의 체크박스
  - **시스템 표시**: 서명 시 Date/Time 자동 생성
  - **참고**: 입력 화면·PDF 템플릿·데이터 주입·PDF 생성 등 전체 패턴은 아래 **「완료된 양식 패턴(다음 양식 작업 시 참고)」** 참고.

  - **원본 이미지 대비 비교** (입력 화면·PDF 확인 화면 vs `01.기획/assets/images/[Template] SWS 會員咨詢表_English Version/`):
    - **잘 맞춘 점**: Store/Responsible Staff, Customer Information(이름·Title·회원번호·연락처·이메일), 852/853/86 지역코드+전화번호, 1·2·3·4 섹션 구조 및 문구, Others/Yes specify 조건부 입력, 동의 문구("I confirm that the above information is accurate..."), 서명·Date·Time, * Required fields, PDF 버튼·그룹 간격·페이지 나눔.
    - **원본 맞춤 반영 완료** (앞으로 만들 양식도 동일 적용): Date 라벨 "Date : Year / Month / Day", Date/Time 하단 "(System generated)", 동의 문구와 체크박스 한 줄 배치(PDF), 라벨 콜론 앞 공백 "Name :" 형식.
    - **다음 양식 작업 시**: 나머지 12개 양식은 **원본 이미지(`01.기획/assets/images/` 해당 폴더)를 열어 1:1로 비교** 후, 아래 「완료된 양식 패턴」의 PDF 스타일·페이지 규칙을 동일하게 적용.

---

## 완료된 양식 패턴 (다음 양식 작업 시 참고)

회원 상담표(1-1)를 기준으로 **고객 만족 기준**으로 확정된 패턴입니다. **나머지 12개 양식은 아래 내용을 동일하게 적용**하여 작업합니다. 참고 파일: `forms/01-01_form_member-consultation.html`, `forms/pdf/01-01_pdf_member-consultation.html`.

### 입력 화면 (`forms/{번호}_form_{key}.html`)

**타이포·스타일 통일 (시스템 기준)**  
원본 양식은 브랜드·제작 시기에 따라 디자인이 다를 수 있으나, **우리 시스템은 모든 양식이 동일한 기준**을 따릅니다.  
- **본문 타이포**: `assets/style.css`의 `body` 규칙을 그대로 사용 (font-family, font-size, **font-weight: 500**, line-height: 1.7, color, font-smoothing).  
- **폼 내부 `<style>`**: iframe용 **레이아웃만** 오버라이드 (padding, margin, width, min-height, overflow).  
- **금지**: 양식별로 body에 font-family / font-size / font-weight / line-height / color 를 다르게 주지 않음. 새 양식 추가 시에도 style.css 기준 동일 적용.

- **회원/개인정보 영역 (입력 화면 기준 01-01 형식 통일)**: 회원·개인정보가 있는 양식은 01-01의 **Customer Information** 구조를 따릅니다. `.customer-info-grid` + `.info-field` 사용, 필드 세로 배치(gap 16px). 연락처는 01-01과 동일하게 국가번호(852/853/86) 라디오 + 전화 입력. 양식별로 필요한 필드만 포함(예: 02-01은 Full Name EN/CN, Gender, Membership No, Contact, Email).
- **iframe + postMessage**: 부모에서 `form-data-inject` 수신 후 데이터 주입, `form-data-request` 수신 시 `form-data-collected`로 응답, `iframe-resize`로 높이 전달.
- **자동 생성 버튼** (해당 양식에 선택 항목이 많은 경우): 매장·직원 정보를 제외한 나머지 선택/입력 항목을 자동 채움. 화면 오른쪽 상단 등 고정 위치에 작게 배치.
- **초기화 버튼** (`#form-reset-btn`): 확인 후 해당 양식만 초기화. POS 연동 필드·매장/직원 정보 유지, 날짜는 오늘, 동의 체크박스 포함 초기화. **위치**: 동의·서명 섹션(Part 6 / confirmation-section + signature-section) **아래**에 배치.
- **동의 체크박스** (`#confirmation-checkbox`, required): "다음" 시 전체 양식 검증에서 필수.
- **data-field 매핑**: 수집/주입 시 사용하는 필드명은 입력·PDF 템플릿·form-handler/폼 설정과 일치.
- **조건부 입력**: Others/Yes specify 등은 항상 표시, 빈 값이어도 영역은 유지.

### PDF 템플릿 (`forms/pdf/{번호}_pdf_{key}.html`)
- **데이터 주입**: `postMessage`로 전달된 payload를 `injectPDFData(formData)`에서 처리. `.pdf-value[data-field]`, `.pdf-radio`/`.pdf-checkbox`(선택값에 `checked`), `data-conditional` 섹션, 추가 입력 필드(Others/Yes specify) 모두 주입.
- **고객명**: `customer-name`은 실명 우선(POS 고객명 fallback). 추가 입력 필드는 빈 값일 때 텍스트 없이 border만 한 줄로 표시.
- **PDF 버튼** (오른쪽 상단): html2pdf.js로 `.pdf-container`를 A4 PDF로 변환 후 다운로드. 화면에서만 표시, 인쇄 시 숨김(`.pdf-toolbar`). 버튼 포커스 가능하므로 `aria-hidden` 사용하지 않음.
- **원본 문구·라벨**: Date 라벨 "Date : Year / Month / Day", Date/Time 하단 "(System generated)", 라벨 콜론 앞 공백 "Name :" 형식, 동의 문구와 체크박스 한 줄 배치(PDF).

### PDF 스타일·페이지 규칙 (01-01 기준, 신규 양식 동일 적용)
아래 값을 그대로 적용하면 페이지 수(2~3장 수준)·글씨 잘림 없음·원본 밀도를 맞출 수 있습니다. `@media print`에도 동일 값 적용.

| 항목 | 값 |
|------|-----|
| **@page** | `size: A4; margin: 18mm 15mm 15mm 15mm;` (상단 18mm로 페이지 경계 직후 잘림 방지) |
| **body** | `font-size: 9pt; line-height: 1.25; padding-top: 2pt; orphans: 2; widows: 2;` |
| **.pdf-container** | `padding-top: 1pt;` |
| **헤더** | brand-logo 18pt, form-title 12pt, form-intro 9pt, margin 축소 |
| **섹션** | .pdf-section margin-bottom 10pt, page-break-inside: auto |
| **.section-title** | 10.5pt, margin/padding 축소, **page-break-after: avoid**, **padding-top: 2pt** |
| **.section-subtitle** | 9.5pt, **padding-top: 2pt** |
| **.question-block** | margin-bottom 8pt, **padding-top: 2pt**, **page-break-inside: avoid**, **break-inside: avoid** |
| **.question-text** | 9pt, line-height 1.25, margin-bottom 4pt |
| **.pdf-option-group** | gap 8pt, margin-bottom 6pt |
| **.pdf-option-item** | font-size 9pt, gap 4pt |
| **.conditions-grid** (해당 시) | **page-break-inside: avoid**, **break-inside: avoid** |
| **동의·서명** | .confirmation-section, .signature-section **page-break-inside: avoid** |
| **입력 필드** | min-height 14pt, padding 2pt 6pt 수준 |

- **페이지 나눔**: `.pdf-section`은 `page-break-inside: auto`. `.question-block`·동의/서명·conditions-grid는 `page-break-inside: avoid`로 블록이 페이지 중간에서 잘리지 않게 함.
- **글씨 윗부분 잘림 방지**: @page 상단 18mm, body/.pdf-container padding-top, .question-block·.section-title·.section-subtitle에 padding-top 2pt로 페이지 경계 직후 첫 줄 여유 확보.

### 공통
- **config.js**: 해당 양식이 `CONSULTATION_FORMS`(또는 동일 역할 설정)에 `{ key, title, file, requiresSignature }` 형태로 등록되어 있어야 탭/확인 화면에서 로드됨.
- **form-handler.js**: `collectFormDataFromInput` 등에서 해당 formKey에 대한 저장/복원 및 실명 덮어쓰기 처리.
- **리뷰 화면 데이터 주입 (02-01~02-04 포함)**:
  - **원인**: 입력 탭에서 해당 양식 탭을 열어야만 입력 iframe이 로드됨. 탭을 열지 않고 "다음"만 누르면 `formIframes`에 해당 formKey가 없어 데이터 수집·저장이 되지 않고, 리뷰에서 PDF에 데이터가 주입되지 않음.
  - **수정 반영**: (1) **form-handler.js** `loadFormHTML`: iframe 로드 완료 시 resolve되는 `Promise<iframe | null>` 반환(이미 로드/로딩 중 처리 포함). (2) **tabs.js** "다음" 클릭 시 `collectAllFormData`: `formIframes.has(formKey)`가 없으면 해당 입력 폼을 먼저 `loadFormHTML`로 로드한 뒤 `requestFormDataFromIframe`으로 수집. 저장 시 기존 `conditionalFormData`와 병합하여 덮어쓰기. 이제 02-01~02-04를 탭에서 열지 않아도 리뷰 화면에서 데이터 주입 정상 동작.

---

## 2. 시술 관련 동의/확인

### [x] 2-1. 미용기기 동의서 - Aqua Peel ✅
- **파일명**: `forms/02-01_form_device-consent-aqua-peel.html` / PDF: `forms/pdf/02-01_pdf_device-consent-aqua-peel.html` (01-01과 동일하게 `{번호}_form_...`, `{번호}_pdf_...` 규칙)
- **키**: `device-consent-aqua-peel`
- **카테고리**: 시술 관련 동의/확인
- **서명 필요**: ✅ 예
- **설명**: Aqua Peel 기기 시술의 원리, 위험 고지, 금기 사항, 부작용 및 주의사항에 대한 상세 정보를 제공하고 고객 동의를 수집합니다.
- **원본 양식**: `01.기획/assets/images/SWS BL 使用美容儀器同意書 [Aqua Peel]_English Version/` (페이지별 -1.png … -4.png)
- **상태**: 완료 (입력/PDF·config·form-handler 연동 완료)
- **비고**: 
  - **구성**: 4페이지로 구성
  - **Part 1 - 개인정보**: 영문/중문 이름, 이메일, 연락처, **성별**(회원정보에 없으면 양식에서만 수집·라디오 Male/Female/Other), 회원번호
  - **Part 2 - 원리 및 시술 설명**: Aqua Peel 기술 설명 (깊은 각질 제거, 모공 불순물 제거, 흡수력 향상, 터빈 스타일 설계, 영양 공급 등)
  - **Part 3 - 약물, 금기사항, 주의사항**: 15개 금기 사항 (안면 신경 마비, 간질, 근육 질환, 루푸스, 헤르페스, 심한 낭성 여드름, 상처, 림프/간 질환, 감각 상실, 발열/전염병, 임신, 전자 기기 이식, 금속 이식, 전기 자극 이상 반응, 금속 알레르기), 치료 전 확인 사항
  - **Part 4 - 위험 및 부작용**: 피부 반응 (어두운 빨강/보라색 "사" 자국, 며칠 내 또는 1주일 이상 지속), 치료 후 감각 (등부위 열감, 피로/졸림), 치료 후 주의사항 (보온, 샤워 대기 시간, 음식 제한, 운동 제한, 각질 제거 제품 중단)
  - **동의 체크박스**: 각 Part마다 확인 체크박스 포함
  - **작업 전·작업 중 확인 사항** (입력/PDF 나눠 작업 시 참고):
    1. **원본 이미지**: `01.기획/assets/images/SWS BL 使用美容儀器同意書 [Aqua Peel]_English Version/` 의 -1.png ~ -4.png를 열어 레이아웃·문구·필드 순서·Store/Responsible Staff 유무·라벨 콜론 띄어쓰기·서명/Date/Time 위치(마지막 1회인지 Part별인지) 확인.
    2. **파일명**: 기존 `form_device-consent-aqua-peel.html`이 있다면 `02-01_form_...`, `02-01_pdf_...` 로 통일할지 결정. 위 파일명 규칙 권장.
    3. **동의 체크박스 4개**: 입력 화면에서 Part별 체크박스 4개 모두 required로 할지, 마지막만 required로 할지 원본에 맞춰 결정. data-field 예: `confirmation-part1` ~ `confirmation-part4` 또는 동일 키에 part 구분.
    4. **Part 1 필드**: 영문/중문 이름·이메일·연락처·성별·회원번호 — 01-01의 customer-name, email, contact 등과 맞출지, 원본 라벨 그대로 필드명 설계. POS 연동 필드(매장/직원/고객명)는 01-01과 동일 패턴 적용 여부 확인.
    5. **Part 3 금기 15개**: 체크박스 15개 data-field 이름 일관되게 정의(예: `contraindication-facial-nerve` 등). PDF에서 선택값 주입 방식은 01-01의 .pdf-checkbox/.pdf-radio 패턴 동일.
    6. **config.js / form-handler.js**: `device-consent-aqua-peel` 키로 CONSULTATION_FORMS(또는 해당 설정)에 등록, form-handler에 저장/복원·실명 처리 추가.
    7. **PDF 스타일**: 완료된 양식 패턴의 PDF 스타일·페이지 규칙(@page, body 9pt, question-block avoid, padding-top 등) 그대로 적용. 원본 4페이지 → 출력도 4페이지 전후로 맞출지 확인.
  - **성별 보완**: 회원정보에 성별이 없으므로 Part 1에 **Gender** 필드를 양식 전용으로 두었음. 라디오 Male/Female/Other, data-field `gender`. POS 주입 시 `gender`가 있으면 선택만 하고, 없으면 직원이 양식에서만 선택.

### [x] 2-2. 미용기기 동의서 - Skincool ✅
- **파일명**: `forms/02-02_form_device-consent-skincool.html` / PDF: `forms/pdf/02-02_pdf_device-consent-skincool.html` (02-01과 동일하게 `{번호}_form_...`, `{번호}_pdf_...` 규칙)
- **키**: `device-consent-skincool`
- **카테고리**: 시술 관련 동의/확인
- **서명 필요**: ✅ 예
- **설명**: Skincool (마이크로커런트) 기기 시술의 원리, 위험 고지, 금기 사항, 부작용 및 주의사항에 대한 상세 정보를 제공하고 고객 동의를 수집합니다.
- **원본 양식**: `01.기획/assets/images/SWS SPA 使用美容儀器同意書 [Skincool]_English Version/` (페이지별 -1.png … -4.png)
- **상태**: 완료 (입력/PDF·config·form-handler 연동 완료, 02-01 패턴 적용)
- **비고**: 
  - **구성**: 4페이지로 구성
  - **Part 1 - 개인정보**: 01-01 형식 통일 — Name, Title, Membership Number, Contact Number (국가번호 852/853/86 + 전화번호), Email. (원본에 영문/중문 이름·성별 있어도 관리 수준은 01-01 항목만)
  - **Part 2 - 원리 및 시술 설명**: 
    - 바늘 없는 침투 기능 (전기 펄스, Electroporation 기술): 피부 조직 투과도 향상, 친수성 분자 침투, 세포막 투과도 최대 90% 증가, 고전압 전기 펄스로 미세 기공 일시적 개방, 에센스 솔루션 안전 전달, 차갑거나 따뜻한 감각, 경미한/일시적 홍조
    - 두 가지 모드: Cold Mode (0-10°C) - 모공 수축, 탄력 개선, 민감도 완화 / Hot Mode (37°C) - 신진대사 촉진, 콜라겐 재생 자극, 주름 감소, 피부 탄력
  - **Part 3, 4**: 금기 사항, 위험 및 부작용 (02-01과 유사한 구조·문구, 원본 이미지로 확인)
  - **작업 방식 (02-01 요청 반영)**:
    1. **입력 폼**: 02-01을 복사한 뒤 제목·Part 2 문구·필드명(key)만 Skincool용으로 수정. 레이아웃·폰트·iframe-resize·Reset 위치(Part 6 아래)·자동 생성(한글)·Reset 팝업(한글)·confirmation-checkbox 검증 유지.
    2. **PDF 템플릿**: 02-01 PDF를 복사한 뒤 제목·Part 2 문구·data-field·파일명만 Skincool용으로 수정. 회원정보 01-01 수준(연락처 `contact-number-formatted` 한 줄), 서명 60px, `form-data-inject`/`iframe-resize`/`form-data-injection-complete`, 화면 스타일(회색 없음·약간 마진만) 유지.
    3. **config.js**: `device-consent-skincool` 키로 CONSULTATION_FORMS에 등록.
    4. **form-handler.js**: 해당 formKey 저장/복원·실명 처리 이미 공통 로직으로 처리되는지 확인. 

### [x] 2-3. 미용기기 동의서 - Ultrasonic ✅
- **파일명**: `forms/02-03_form_device-consent-ultrasonic.html` / PDF: `forms/pdf/02-03_pdf_device-consent-ultrasonic.html` (02-02와 동일하게 `{번호}_form_...`, `{번호}_pdf_...` 규칙)
- **키**: `device-consent-ultrasonic`
- **카테고리**: 시술 관련 동의/확인
- **서명 필요**: ✅ 예
- **설명**: Ultrasonic (가변 주파수 음파) 기기 시술의 원리, 위험 고지, 금기 사항, 부작용 및 주의사항에 대한 상세 정보를 제공하고 고객 동의를 수집합니다.
- **원본 양식**: `01.기획/assets/images/SWS SPA 使用美容儀器同意書 [Ultransonic]_English Version/` (페이지별 -1.png … -4.png, 폴더명은 Ultransonic 오타)
- **상태**: 완료 (입력/PDF·config·form-handler 연동 완료, 02-02 패턴 적용)
- **비고**: 
  - **구성**: 4페이지로 구성. **작업 방식**: 02-02와 동일 — 02-02 복사 후 제목·Part 2 문구·key·파일명만 Ultrasonic용으로 교체, config.js 등록, form-handler 공통 로직 확인. 별도 체크 항목 없음.
  - **Part 1 - 개인정보**: 01-01 형식 통일 (02-02와 동일)
  - **Part 2 - 원리 및 시술 설명**: 
    - Nano Sound Wave: 초음파 주파수 (3/10/20 MHz)로 표피, 진피, 근육층 자극, 캐비테이션 효과, 미세 수준 기포 파열로 피부 투과도 증가 및 영양 공급, 세포 재생 촉진 및 피부 질감 개선, 경미한 따뜻함/약간의 홍조/반응 없음
    - Variable Frequency Technology: 자동 주파수 조정, 안전한 주파수 교대, 세포막 투과도 확장, 깊은 층부터 표면까지 탄력 회복, 피부 수분 및 장벽 재생 개선, 영양 흡수 향상
  - **Part 3, 4**: 금기 사항, 위험 및 부작용 (02-01/02-02와 유사한 구조, 원본 이미지로 확인) 

### [x] 2-4. 미용기기 동의서 - MRV ✅
- **파일명**: `forms/02-04_form_device-consent-mrv.html` / PDF: `forms/pdf/02-04_pdf_device-consent-mrv.html` (02-02와 동일하게 `{번호}_form_...`, `{번호}_pdf_...` 규칙)
- **키**: `device-consent-mrv`
- **카테고리**: 시술 관련 동의/확인
- **서명 필요**: ✅ 예
- **설명**: MRV (다극 라디오 주파수 / 네거티브 프레셔 흡입) 기기 시술의 원리, 위험 고지, 금기 사항, 부작용 및 주의사항에 대한 상세 정보를 제공하고 고객 동의를 수집합니다.
- **원본 양식**: `01.기획/assets/images/SWS SPA使用美容儀器同意書 [MRV]_English Version/` (페이지별 -1.png … -4.png)
- **상태**: 완료 (입력/PDF·config·form-handler 연동 완료, 02-02 패턴 적용)
- **비고**: 
  - **구성**: 4페이지로 구성. **작업 방식**: 02-02와 동일 — 02-02 복사 후 제목·Part 2 문구·key·파일명만 MRV용으로 교체, config.js 등록, form-handler 공통 로직 확인. 별도 체크 항목 없음.
  - **Part 1 - 개인정보**: 01-01 형식 통일 (02-02와 동일)
  - **Part 2 - 원리 및 시술 설명**: 
    - Multipolar Radio Frequency: 다중 전극으로 고주파 전자기파 생성, RF 열 에너지로 콜라겐 조직 깊이 수리, 조직 온도 증가, 진피 콜라겐 자극, 탄력 효과, 다극 설계 (5극)로 열 에너지 분산, 화상 위험 감소
    - Nano Light (LED 광선 요법): 다양한 파장이 다른 문제 타겟팅 (적색광 630nm - 주름 방지, 청색광 415nm - 항염증), RF와 시너지 효과, 빛 에너지로 피부 유분 및 수분 균형, 산소 함량 증가, 콜라겐 성장 및 탄력 자극, 피부 매끄럽고 빛나게
    - Negative Pressure Suction: 동적 네거티브 프레셔 마사지로 신진대사 촉진 및 노폐물 제거
    - 치료 중 감각: 흡입 및 따뜻함, 치료 후 일시적 홍조, 따뜻함, 탄력
  - **Part 3, 4**: 금기 사항, 위험 및 부작용 (02-01/02-02와 유사한 구조, 원본 이미지로 확인) 

### [x] 2-5. 시술 전환 확인서 ✅
- **파일명**: `forms/02-05_form_treatment-conversion.html` / PDF: `forms/pdf/02-05_pdf_treatment-conversion.html`
- **키**: `treatment-conversion`
- **카테고리**: 시술 관련 동의/확인
- **서명 필요**: ✅ 예
- **설명**: 회원 간 시술 패키지 전환을 기록하고 확인하는 양식입니다. 양도 회원과 수령 회원의 정보, 전환되는 시술 상세 내역, 약관 및 조건을 포함하며 고객 서명을 받습니다.
- **원본 양식**: `01.기획/assets/images/[Template] 療程轉換確認信_English Version/` (페이지별 -1.png)
- **상태**: 완료
- **비고**: 
  - **구성**: 1페이지
  - **문서 ID**: TCAL-{storeId}-YYYYMMDD-001 형식 (storeId 예: HK000005, 데모 순번 001)
  - **양도 회원**: 최초 선택 고객(읽기 전용), **수령 회원**: 폼 내 "Select Member" 버튼 → 레이어에서 샘플 회원 선택
  - **시술 상세 테이블**: "Select Packages" 버튼 → 양도 회원 보유 패키지(샘플) 레이어에서 2개 이상 다중 선택
  - **약관 및 조건** (6개 항목), 동의 체크박스, **서명**: 양도 회원만 (기존 플로우)
  - **확인 항목**: `forms/02-05_시술전환확인서_확인항목.md` 참고

### [x] 2-6. 시술 연기 확인서 ✅
- **파일명**: `forms/02-06_form_treatment-extension.html` / PDF: `forms/pdf/02-06_pdf_treatment-extension.html`
- **키**: `treatment-extension`
- **카테고리**: 시술 관련 동의/확인
- **서명 필요**: ✅ 예
- **설명**: 회원 시술 유효기간 일회성 연장을 확인하는 양식입니다. 고객 정보, 연장되는 시술 상세 내역(원래 만료일 및 연장일), 약관 및 조건을 포함하며 고객 서명을 받습니다.
- **원본 양식**: `01.기획/assets/images/[Template] 療程延期確認信_English Version/` (페이지별 -1.png, -2.png)
- **상태**: 완료
- **비고**: 
  - **구성**: 2페이지 (1페이지: 본문·테이블·약관, 2페이지: 문서 ID·서명·Date/Time)
  - **문서 ID**: TEAL-{storeId}-YYYYMMDD-001 형식 (storeId 예: HK000005, 데모 001)
  - **고객 정보**: 회원번호, 회원명(실명 우선), 매장 위치(=매장명), 담당 직원
  - **시술 상세 내역 테이블**: "Select Packages" 버튼 → 레이어에서 1개 이상 선택, 원래 만료일 POS·연장일 날짜 피커 입력, 자동 생성 시 연장일=원래 만료일+1개월
  - **약관 및 조건** (6개 항목), 동의 체크박스, **서명**: 고객 (기존 플로우)
  - **확인 항목**: `forms/02-06_시술연기확인서_확인항목.md` 참고 

---

## 3. 거래 및 계약

### [x] 3-1. 구매 시술 패키지 및 제품 패키지 약관 ✅
- **파일명**: `forms/03-01_form_package-terms.html` / PDF: `forms/pdf/03-01_pdf_package-terms.html`
- **키**: `package-terms`
- **카테고리**: 거래 및 계약
- **서명 필요**: ✅ 예
- **설명**: 시술 패키지 및 제품 패키지 구매 시 적용되는 약관 및 세칙에 동의하는 양식입니다. 개인정보, 구매 전 중요 고지사항, 약관 내용을 포함하며 고객이 확인하고 동의해야 합니다.
- **원본 양식**: `01.기획/assets/images/[Template] SWS 購買療程套票及產品套票條款及細則_English Version/` (페이지별 -1.png, -2.png, -3.png)
- **상태**: 완료
- **비고**: 
  - **구성**: 3페이지 (1페이지: Part 1·Important Notice 8개, 2페이지: Treatment 14개·Product 11개, 3페이지: Disclaimer·서명·Date/Time)
  - **Part 1 - 개인정보**: 01-01과 동일 5항목 — Name(실명 우선), Title, Membership Number, Contact(852/853/86+전화), Email. 입력화면에 Store/Responsible Staff 표시, PDF에는 원본에 없어 미표시
  - **Important Notice Before Purchase** 8개, **Treatment Packages** 14개, **Product Packages** 11개, **Disclaimer**, 동의 체크박스 1개(마지막), 서명·Date/Time
  - **확인 항목**: `forms/03-01_구매시술패키지약관_확인항목.md` 참고

### [x] 3-2. 구매 Collagen Drink 약관 ✅
- **파일명**: `forms/03-02_form_collagen-drink-terms.html` / PDF: `forms/pdf/03-02_pdf_collagen-drink-terms.html`
- **키**: `collagen-drink-terms`
- **카테고리**: 거래 및 계약
- **서명 필요**: ✅ 예
- **설명**: LANEIGE Collagen Drink 구매 시 적용되는 약관 및 세칙에 동의하는 양식입니다. 고객 정보와 17개 항목으로 구성된 상세 약관을 포함하며 고객이 확인하고 동의해야 합니다.
- **원본 양식**: `01.기획/assets/images/[Template] LNG  購買Collagen Drink 條款及細則_English Version/` (페이지별 -1.png, -2.png)
- **상태**: 완료
- **비고**: 
  - **구성**: 2페이지
  - **문서 ID**: CDTNC-storecode-YYYYMMDD-000 형식
  - **고객 정보 입력 필드**: Member No., English Full Name, Chinese Full Name, Phone, Email Address
  - **Treatment Terms and Conditions** (17개 항목): 
    - 적용 범위 및 구매 약관 (1, 3)
    - 교환 위치 및 방법 (2, 4, 11)
    - 교환 시 신분증 요구 (5)
    - 특수 건강 상태 의사 상담 (6)
    - 환불 및 교환 계산, 할인 차감 (7, 8, 9, 10, 11)
    - 만료된 시술 정책 (10)
    - 할인 결합 제한 (12)
    - 구매 금액 계산 규칙 (프로모션, 회원 포인트, 업그레이드) (13, 14, 15)
    - "더블 포인트? 배송?" 관련 질문 (16)
    - 분쟁 시 LANEIGE 최종 결정권 (17)
  - **특이사항**: 12-16번 항목은 중요한 제한 사항이므로 UI/UX 구현 시 특별한 강조나 안내 필요
  - **확인 항목**: `forms/03-02_구매CollagenDrink약관_확인항목.md` 참고
  - **결정 요약** (확인항목 답변 기준): 문서 ID CDTNC-{storeId}-YYYYMMDD-001 · 고객정보 03-01과 동일(5항목, 실명 우선) · 동의 체크박스 마지막 1개 · 12~16번 시각적 강조(색상 등)만 · 로고 1페이지 상단 1회 · PDF에 원본 없으면 Store/Staff 미표시 · 자동 생성 버튼 · 영문만

---

## 4. 고객 서비스

### [x] 4-1. 고객 환불 확인서 ✅
- **파일명**: `forms/04-01_form_customer-refund.html` / PDF: `forms/pdf/04-01_pdf_customer-refund.html`
- **키**: `customer-refund`
- **카테고리**: 고객 서비스
- **서명 필요**: ✅ 예
- **설명**: 고객의 환불 요청에 대한 상세 정보(고객 정보, 환불 상세 내역, 환불 방법)를 기록하고, 고객이 환불 금액 수령 및 처리 방식에 동의함을 확인하는 양식입니다.
- **원본 양식**: `01.기획/assets/images/[All Brands] 客人退款確認信_English Version/` (페이지별 -1.png, -2.png)
- **상태**: 완료
- **비고**: 
  - **구성**: 입력 화면 + PDF 1페이지 (여백·간격 조정으로 2페이지 분량을 1페이지에 수용)
  - **문서 ID**: RAL-{storeId}-YYYYMMDD-001
  - **관리 정보**: 입력 화면에서는 Store Registration, Responsible Staff 표시(다른 양식과 동일). PDF만 미표시(POS에서 처리).
  - **고객 정보**: 다른 양식과 동일 (실명 우선, Title, 회원번호, 국가번호+연락처, 이메일)
  - **환불 상세 내역**: 레이어 팝업에서 SAMPLE_SALES 기준 선택 (영업일자 필터, 기본 오늘, 한 건만 선택). 반품 사유 직접 입력. 통화 HKD.
  - **환불 방법**: 체크박스 복수 선택 (Cash, VISA, MASTER, AE, CUP, WeChat Pay, AliPay, Other). Other 선택 시 조건부 직접 입력(01-01 참고).
  - **환불 확인 문구**: 두 문구 모두 노출. 체크 시 해당 라인 금액 필드 환불 금액으로 기본 입력·수정 가능. 체크 해제 시 해당 라인 금액 초기화.
  - **시스템 표시**: 서명 시 Date/Time 자동 생성. 자동 생성 버튼 제공(데모용).
  - **확인 항목**: `forms/04-01_고객환불확인서_확인항목.md` 참고

### [x] 4-2. 예약 취소 면제서 ✅
- **파일명**: `forms/04-02_form_appointment-cancellation-waiver.html` / PDF: `forms/pdf/04-02_pdf_appointment-cancellation-waiver.html`
- **키**: `appointment-cancellation-waiver`
- **카테고리**: 고객 서비스
- **서명 필요**: ✅ 예
- **설명**: 고객의 예약 취소 또는 변경 시 발생할 수 있는 수수료 면제에 대한 동의서입니다. 예약 시간 24시간 전까지 통보할 경우 수수료가 면제되며, 이를 어길 시 시술 비용이 차감될 수 있다는 내용을 포함합니다.
- **원본 양식**: `01.기획/assets/images/[Template] 取消預約豁免信_English Version/` (페이지별 -1.png)
- **상태**: 완료
- **비고**: 
  - **구성**: 입력 화면 + PDF 1페이지
  - **문서 ID**: TCEL-{storeId}-YYYYMMDD-001
  - **고객 정보**: 다른 양식과 동일 5항목(실명 우선). 입력 화면 Store/Staff 표시, PDF 미표시.
  - **예약 정보**: 레이어 팝업에서 SAMPLE_APPOINTMENTS 기준 선택(영업일자 필터, 기본 오늘, 1건만 선택). 예약 일자·시간·위치(매장명)·시술 항목.
  - **예약 정책**: 고정 영문 문구(24시간 전 통보 시 수수료 면제, 미통보 시 시술 비용 차감). 동의 체크박스 1개 필수.
  - **시스템 표시**: 서명 시 Date/Time 자동 생성. 자동 생성 버튼 제공(데모용). 양식 영문, 알림 한글.
  - **확인 항목**: `forms/04-02_예약취소면제서_확인항목.md` 참고

### [x] 4-3. 교환 제품 배송 확인서 ✅
- **파일명**: `forms/04-03_form_product-exchange-delivery.html`
- **키**: `product-exchange-delivery`
- **카테고리**: 고객 서비스
- **서명 필요**: ✅ 예
- **설명**: 제품 교환 및 배송 관련 확인서입니다. 회원 정보(회원 번호, 이름), 교환/배송될 제품 목록과 수량을 기재합니다. 상세한 배송 약관 및 조건을 포함하며, 고객은 모든 배송 약관을 확인하고 동의해야 합니다.
- **원본 양식**: `01.기획/assets/images/[Template] 兌換產品_送貨確認信_English Version/` (페이지별 -1.png)
- **상태**: 완료
- **비고**: 
  - **구성**: 1페이지
  - **고객 정보**: 회원번호, 회원명
  - **제품 목록 테이블**: 제품명, 수량
  - **배송 약관 및 조건** (6개 주요 항목):
    1. 홍콩 내 주문만 접수 (해외 제외)
    2. 고객의 시간 내 수령 실패 시 조건 및 행정 수수료 ($100), 주문 취소 가능
    3. 배송 주소 변경 절차 및 배송비 ($20)
    4. "자택 배송 서비스" 조건: 올바른 수령인 정보 필요, PO Box 불가, 특정 지역 제외 (창고, 특정 전시 센터 등), 주거지 배송은 SF Express 예약 필요
    5. 배송된 상품 문제 발생 시 1 영업일 내 신고 필요 (고객명, 연락처, 송장 번호, 배송 주문 번호, 제품 사진)
    6. 기타 배송 관련 조건
  - **확인 체크박스**: "위 배송 약관 확인" 동의
  - **시스템 표시**: 서명 시 Date/Time 자동 생성
  - **확인 항목**: `forms/04-03_교환제품배송확인서_확인항목.md` 참고

---

## 5. 기타 동의/위임

### [x] 5-1. 위임장 ✅
- **파일명**: `forms/05-01_form_authorization-letter.html` / PDF: `forms/pdf/05-01_pdf_authorization-letter.html`
- **키**: `authorization-letter`
- **카테고리**: 기타 동의/위임
- **서명 필요**: ✅ 예
- **설명**: 고객(위임자)이 특정 개인(피위임자)에게 본인을 대신하여 특정 업무(예: 선물/포인트 교환 등)를 처리할 권한을 위임하는 문서입니다. 위임자와 피위임자의 정보, 위임 범위, 유효 기간, 고객 확인 및 서명으로 구성됩니다.
- **원본 양식**: `01.기획/assets/images/[All Brands] 授權信_English Version/` (페이지별 -1.png)
- **상태**: 완료
- **비고**: 
  - **구성**: 입력 화면 + PDF 1페이지
  - **문서 ID**: AL-{storeId}-YYYYMMDD-001 (storecode = storeId, 데모 001 고정)
  - **위임자 (Delegator)**: 현재 선택된 회원 고정. 입력 화면 5항목(이름 실명 우선, Title, 회원번호, 연락처, 이메일). PDF 위임자 성명 실명 우선.
  - **피위임자 (Delegatee)**: 02-05 수령 회원처럼 레이어 팝업에서 회원 선택. 성명·연락처 = 선택 회원 정보. 성명 2필드/위치 동일 표기.
  - **유효 기간**: 날짜 피커, 기본값 둘 다 오늘. 자동 생성 시 시작=오늘·종료=오늘+7일. 검증: 종료일 ≥ 시작일.
  - **위임 범위**: 체크박스 [Brand] Gift Exchange, [Brand] Points Use, Other + "Please specify" 입력란. Others 입력란은 01-01처럼 **항상 노출**. 복수 선택 가능, 최소 1개 필수. [Brand] = 브랜드명 치환. PDF에서는 01-01처럼 체크박스+Others 입력란 형태로 선택 항목 ✓ 표시.
  - **확인 문구**: 고정 영문(원본 양식 문구). 동의 체크박스 1개 하단 필수.
  - **Store/Staff**: 입력 화면 표시, PDF 미표시.
  - **서명**: 위임자만. Date/Time 서명 시점 자동 생성.
  - **전화번호**: PDF·form-handler에서 위임자·피위임자 연락처 **(국가번호) 전화번호** 형식(예: (852) 91234567) 통일.
  - **특이사항**: 입력·PDF 모두 안내 문구 포함 — (1) 회사(매장)는 피위임자 연락처·신분증명서 확인 권한 보유, (2) 유효한 증빙 실패 시 처리 거부 가능.
  - **확인 항목**: `forms/05-01_위임장_확인항목.md` 참고 (마지막 **구현 반영** 섹션에 상세 요약)

---

## 개발 가이드라인

### 공통 사항
- 모든 양식은 `forms/` 디렉토리에 위치합니다.
- 파일명은 `{번호}_form_{key}.html` 형식을 따릅니다 (예: `01-01_form_member-consultation.html`). 번호는 `forms-checklist.md`의 번호 체계와 동일합니다.
- 모든 양식은 서명이 필요합니다 (`requiresSignature: true`).
- 양식은 **iframe 방식**으로 로드되며, `app/04_tabs.html`과 `app/05_review.html`에서 표시됩니다. 각 양식은 독립적인 iframe으로 로드되어 자연스러운 CSS/JavaScript 스코핑을 제공합니다.
  - **iframe 사용 이유**: 
    - 자연스러운 CSS/JavaScript 스코핑: iframe 내부는 완전히 격리된 환경
    - 일반적인 JavaScript 작성 가능: `document.querySelector`, `DOMContentLoaded` 등 표준 JavaScript 사용
    - 구조 단순화: 복잡한 스크립트 변환 로직 불필요
    - 유지보수성 향상: 양식 파일을 독립적으로 개발하고 테스트 가능
  - **postMessage 통신**: 부모 페이지와 양식 iframe 간 통신은 `postMessage` API 사용
    - 데이터 주입: `form-data-inject` 메시지로 고객 정보, 매장 정보, 직원 정보 전송
    - 데이터 수집: `form-data-collected` 메시지로 양식 입력 데이터 전송
    - 높이 조정: `iframe-resize` 메시지로 문서 높이 전송하여 iframe 높이 자동 조정
- **PDF 전용 템플릿**: 각 양식마다 `forms/pdf/` 디렉토리에 PDF 전용 템플릿 파일을 생성합니다. 
  - 입력 화면: `{번호}_form_{key}.html` (예: `01-01_form_member-consultation.html`)
  - PDF 템플릿: `{번호}_pdf_{key}.html` (예: `01-01_pdf_member-consultation.html`)
- **PDF 전화번호 표기 (전 양식 공통)**: 연락처를 표시하는 PDF 필드(contact-number-formatted, delegator-contact-email, delegatee-contact 등)는 **(국가번호) 전화번호** 형식으로 통일합니다. 예: `(852) 91234567`. 국가번호 없이 번호만 있는 경우에는 번호만 표시.

### 양식 구조
- 각 양식은 독립적인 HTML 파일입니다.
- 양식은 iframe으로 로드되므로, 양식 파일 내에서 `document.querySelector`, `DOMContentLoaded` 등 표준 JavaScript를 그대로 사용할 수 있습니다.
- 양식 내부에는 입력 필드, 읽기 전용 필드(POS 연동), 동의 체크박스 등이 포함됩니다.
- POS 연동 필드는 읽기 전용으로 표시되어야 합니다.
- **데이터 주입**: 양식 파일에서 `window.addEventListener('message', ...)`로 `form-data-inject` 메시지를 수신하여 데이터를 주입합니다.
- **데이터 수집**: 양식 파일에서 `collectFormData()` 함수를 구현하고, `form-data-request` 메시지 수신 시 `form-data-collected` 메시지로 데이터를 전송합니다.
- **높이 조정**: 양식 파일에서 `sendHeightToParent()` 함수를 호출하여 문서 높이를 부모에게 전송합니다.
- **PDF 전용 필드**: 화면에서는 숨김 처리하되, PDF 생성 시에만 표시되는 필드가 있을 수 있습니다 (예: Store Registration, Responsible Staff). 이는 `data-pdf-only="true"` 속성과 `display: none` 스타일로 처리하며, PDF 생성 시 데이터를 주입하여 표시합니다.
- **동의 체크박스 (중요)**: 
  - 모든 양식은 하단에 고객이 직접 동의를 확인하는 체크박스가 포함되어야 합니다.
  - 체크박스의 `id`는 반드시 `confirmation-checkbox`로 지정해야 합니다.
  - 체크박스에는 `required` 속성을 추가하여 HTML5 유효성 검사를 지원합니다.
  - 예시: `<input type="checkbox" id="confirmation-checkbox" required />`
  - 동의 문구는 양식의 성격에 맞게 작성하되, 법적 요구사항을 충족해야 합니다.
- **양식 초기화 버튼 (선택)**: 
  - 양식 하단(동의 섹션 위)에 양식 초기화 버튼을 추가할 수 있습니다.
  - 초기화 버튼의 `id`는 `form-reset-btn`으로 지정합니다.
  - 초기화 시 확인 다이얼로그를 표시하여 실수로 인한 데이터 손실을 방지합니다.
  - 초기화 시 모든 입력 필드(텍스트, 숫자, 라디오, 체크박스)를 초기화하되, POS 연동 필드(읽기 전용)는 유지합니다.
  - 날짜 입력 필드는 오늘 날짜로 초기화됩니다.
  - 동의 체크박스도 초기화됩니다.

### 화면 표시 원칙 (중요)
- **종이 양식과 동일하게 모든 내용 표시**: 약관, 안내사항, 금기사항, 부작용, 주의사항 등 종이 양식에 포함된 모든 텍스트를 화면에 표시해야 합니다.
- **법적 요구사항**: 고객이 동의한 내용을 명확히 확인할 수 있어야 하며, 약관 누락 시 법적 문제가 발생할 수 있습니다.
- **투명성**: 모든 정보를 공개하여 고객이 충분히 이해하고 결정할 수 있도록 해야 합니다.
- **약관 우선 표시**: PDF 상단의 약관 및 안내 사항을 화면 상단에 크게 표시 (최소 50% 이상 권장).

### 데이터 저장 전략
- **양식 템플릿 (정적)**: 
  - 양식 구조/레이아웃은 코드베이스에 포함 (`forms/form_*.html`)
  - 약관 텍스트, 안내 문구 등은 HTML 파일에 직접 포함
  - 버전 관리로 변경 이력 추적
- **양식 인스턴스 데이터 (동적)**:
  - 고객이 입력/선택한 값만 저장 (JSON 또는 DB 테이블)
  - 약관 텍스트는 저장하지 않음 (템플릿에서 참조)
  - 저장 예시:
    ```json
    {
      "formKey": "member-consultation",
      "customerId": "123456",
      "submittedAt": "2026-01-20T10:30:00Z",
      "data": {
        "facialTreatmentFrequency": "Once a month or longer",
        "medicalAestheticHistory": "No",
        "pregnancyStatus": "Not pregnant",
        // ... 기타 입력값
      },
      "signature": "base64_encoded_signature",
      "customerRealName": "홍길동",
      "agreedAt": "2026-01-20T10:30:00Z",
      "readTime": 120, // 약관 읽기 시간 (초)
      "confirmationChecked": true // 동의 체크박스 체크 여부
    }
    ```
- **PDF 생성 (필요 시)**:
  - 법적 증적 자료가 필요할 때만 생성
  - **PDF 전용 템플릿 사용**: 입력 화면용 HTML과 별도로 `forms/pdf/` 디렉토리에 PDF 전용 템플릿 파일 생성
  - 파일명 규칙: 
    - 입력 화면: `{번호}_form_{key}.html` (예: `01-01_form_member-consultation.html`)
    - PDF 템플릿: `{번호}_pdf_{key}.html` (예: `01-01_pdf_member-consultation.html`)
  - PDF 템플릿 특징:
    - 입력 필드 → 읽기 전용 텍스트로 변환 (`.pdf-value` 클래스)
    - 라디오/체크박스 → 선택된 값만 표시 (`.pdf-radio`, `.pdf-checkbox` 클래스)
    - 조건부 입력 → `data-conditional` 속성으로 표시/숨김 제어
    - 원본 양식 레이아웃 재현 (A4 용지 크기, 인쇄 최적화)
    - 모든 약관, 안내사항 포함
  - PDF 생성 프로세스:
    1. PDF 전용 HTML 템플릿 로드 (`forms/pdf/{번호}_form_{key}.pdf.html`)
    2. `data-field` 속성을 가진 필드에 데이터 주입:
       - `data-field="store-registration"` → 매장 정보
       - `data-field="responsible-staff"` → BC 확인 단계에서 선택한 직원 정보
       - `data-field="customer-name"` → 고객 실명(고객이 입력한 실명 우선, 없으면 POS 고객명)
       - `data-field="membership-number"` → POS 연동 회원번호
       - `data-field="signature-date"` → 서명 일자 (DD-MM-YYYY 형식)
       - `data-field="signature-time"` → 서명 시간 (HH:MM 형식)
       - `data-field="signature-image"` → 서명 이미지 (base64)
    3. 고객 입력값 주입:
       - 텍스트 필드: `.pdf-value` 요소에 값 주입
       - 라디오 버튼: 선택된 값에 해당하는 `.pdf-radio`에 `checked` 클래스 추가
       - 체크박스: 선택된 값들에 해당하는 `.pdf-checkbox`에 `checked` 클래스 추가
       - 조건부 입력: `data-conditional` 속성 기반으로 표시/숨김 처리
    4. HTML을 PDF로 렌더링 (예: Puppeteer, Playwright, html-pdf 등)
    5. 생성된 PDF는 별도 스토리지에 저장 (장기 보관용)
  - **이메일 발송**: PDF 생성 후 이메일 첨부하여 발송
  - **출력**: 브라우저 인쇄 기능 또는 PDF 다운로드 제공

### 약관 읽기 감지
- **스크롤 완료 감지**: 약관 섹션의 스크롤 완료 여부를 감지하여 고객이 전체 약관을 읽었는지 확인
- **최소 읽기 시간**: 약관 길이에 따라 최소 읽기 시간을 설정하고, 해당 시간이 경과했는지 확인
- **동의 체크박스 활성화**: 약관 읽기 완료 후에만 동의 체크박스를 활성화
- **증적 자료 저장**: 약관 읽기 시작 시간, 완료 시간, 총 읽기 시간 등을 저장

### 스타일 가이드
- `../assets/style.css`와 `../app/tablet.css`를 참고하여 일관된 스타일을 유지합니다.
- 태블릿 화면(768x1024)에 최적화된 레이아웃을 사용합니다.
- 약관 텍스트는 가독성을 위해 적절한 줄 간격과 폰트 크기를 사용합니다.

### 입력 화면 레이아웃 규칙 (중요)
입력 화면은 사용자 편의를 위해 최적화된 레이아웃을 사용하며, 이는 원본 종이 양식과 다를 수 있습니다. **PDF 템플릿은 원본 종이 양식 레이아웃을 유지**해야 합니다.

#### 체크박스/라디오 버튼 그룹
- **기본 레이아웃**: `display: grid; grid-template-columns: repeat(3, 1fr);` (3열 고정)
- **간격**: 체크박스 그룹은 `gap: 10px`, 라디오 그룹은 `gap: 16px`
- **한 줄에 최대 3개**: 체크박스와 라디오 버튼은 한 줄에 최대 3개씩만 표시됩니다.

#### 조건부 입력 필드 (Conditional Input)
- **항상 표시**: 조건부 입력 필드는 항상 화면에 표시됩니다 (동적 숨김/표시 제거).
- **"Yes" 옆에 인풋박스 붙이기**: 
  - 라디오 버튼 "Yes"와 "please specify" 인풋박스를 같은 줄에 배치합니다.
  - 구조: `<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; grid-column: 2 / 4;">`로 "Yes" 라디오와 인풋박스를 감싸고, `grid-column: 2 / 4`로 2-3열을 차지하도록 설정합니다.
  - 예시: "No" (1열), "Yes" + 인풋박스 (2-3열, 같은 줄)
- **"Others" 옆에 인풋박스 붙이기**:
  - 체크박스/라디오 "Others"와 "please specify" 인풋박스를 같은 줄에 배치합니다.
  - 구조: `<div class="conditional-input" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 0; padding: 0;">`로 "Others" 체크박스/라디오와 인풋박스를 감싸고, `grid-column: 1 / -1`로 새로운 줄에서 왼쪽 정렬되도록 설정합니다.
  - "please specify:" 텍스트는 제거하고 인풋박스만 표시합니다.
- **Duration 섹션**:
  - "Duration: from [date] to [date]" 형식의 날짜 입력 필드는 새로운 줄에서 왼쪽 정렬됩니다.
  - `grid-column: 1 / -1`로 전체 너비를 차지하도록 설정합니다.
  - "Duration:" 텍스트와 날짜 입력 필드 사이의 간격은 `gap: 4px`로 설정합니다.

#### 인라인 필드 레이아웃
- **"Date of recent treatment:"**: 질문 텍스트와 날짜 입력 필드를 한 줄에 배치합니다.
  - 구조: `<div class="question-text" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">`로 질문 텍스트와 입력 필드를 감쌉니다.
- **"Sleep duration:"**: 질문 텍스트와 입력 필드를 한 줄에 배치합니다.
  - 구조: `<div class="question-text" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">`로 질문 텍스트와 입력 필드를 감쌉니다.

#### 섹션 정렬
- **form-section padding**: 외부 스타일시트의 padding 적용을 방지하기 위해 `padding: 0;`을 명시적으로 설정합니다.
- 모든 섹션("1. Facial Care Habits", "2. Body Care Habits" 등)이 동일한 왼쪽 정렬을 유지합니다.

#### 적용 대상
- 이 레이아웃 규칙은 **입력 화면(`{번호}_form_{key}.html`)**에만 적용됩니다.
- **PDF 템플릿(`{번호}_pdf_{key}.html`)**은 원본 종이 양식의 레이아웃을 유지하며, 이 규칙을 따르지 않습니다.

---

## 진행 기록

### 2026-01-20
- 체크리스트 문서 생성
- 13개 양식 목록 정리 완료
- 원본 양식 PNG 이미지 분석 완료
- 각 양식별 상세 설명 및 비고 항목 업데이트 완료
- **동의 체크박스 검증 로직 구현 완료**: 모든 양식의 동의 체크박스(`#confirmation-checkbox`) 검증 기능 추가. "다음" 버튼 클릭 시 모든 양식의 동의 체크박스가 체크되었는지 확인하며, 미체크 양식이 있으면 오류 메시지 표시 및 해당 양식으로 자동 이동. (중요)
- **양식 초기화 버튼 추가**: 각 양식 하단에 초기화 버튼(`#form-reset-btn`) 추가. 확인 다이얼로그를 통해 실수 방지, 모든 입력 필드 초기화 (POS 연동 필드 제외), 날짜 필드는 오늘 날짜로 초기화.
- **PDF 전용 템플릿 생성**: 입력 화면용 HTML과 별도로 PDF 전용 템플릿(`forms/pdf/01-01_pdf_member-consultation.html`) 생성. 원본 양식 레이아웃 재현, 입력 필드 → 읽기 전용 텍스트 변환, 라디오/체크박스 → 선택된 값만 표시, A4 용지 크기 최적화, 인쇄 스타일 적용. 이메일 발송 및 출력 기능 지원. 파일명 규칙: `{번호}_form_{key}.html` (입력 화면), `{번호}_pdf_{key}.html` (PDF 템플릿).
- **입력 화면 레이아웃 최적화**: 
  - 체크박스/라디오 버튼 그룹을 3열 grid로 변경 (`grid-template-columns: repeat(3, 1fr)`).
  - 조건부 입력 필드 항상 표시 (동적 숨김/표시 제거).
  - "Yes" 라디오 버튼 옆에 "please specify" 인풋박스 붙이기 (flex 레이아웃, `grid-column: 2 / 4`).
  - "Others" 체크박스/라디오 옆에 "please specify" 인풋박스 붙이기 (flex 레이아웃, `grid-column: 1 / -1`).
  - "Duration:" 섹션을 새로운 줄에서 왼쪽 정렬 (`grid-column: 1 / -1`, `gap: 4px`).
  - "Date of recent treatment:", "Sleep duration:" 등 인라인 필드를 한 줄로 배치 (flex 레이아웃).
  - form-section padding: 0 설정으로 외부 스타일시트 간섭 방지.
  - **중요**: 이 레이아웃 규칙은 입력 화면에만 적용되며, PDF 템플릿은 원본 종이 양식 레이아웃을 유지합니다.

### 2026-01-28
- **iframe 구조로 전환 완료**: HTML import 방식(fetch + DOMParser)에서 iframe 방식으로 전환. 양식 파일에서 표준 JavaScript 사용 가능, 구조 단순화, 유지보수성 향상.
- **postMessage 통신 구현**: 부모 페이지와 양식 iframe 간 `postMessage` API를 통한 데이터 주입/수집 구현.
- **자동 생성 버튼 추가**: `01-01_form_member-consultation.html`에 "자동 생성" 버튼 추가. 매장정보, 직원정보를 제외한 선택 항목을 자동으로 채우는 기능.
- **1-1 회원 상담표 완료**: 입력 화면·PDF 템플릿·데이터 주입·확인 화면 iframe 연동·PDF 생성까지 전체 플로우 완료. **완료된 양식 패턴** 섹션 추가하여 나머지 12개 양식은 동일 패턴(자동 생성, PDF 버튼, 그룹 간격, page-break 등)으로 작업하도록 정리.

### 2026-01-30
- **5-1 위임장(Authorization Letter) 구현 완료**: 입력 폼 `05-01_form_authorization-letter.html`, PDF `05-01_pdf_authorization-letter.html`. 문서 ID AL-{storeId}-YYYYMMDD-001, 위임자(현재 회원) 5항목·피위임자(레이어 선택) 성명 2곳·연락처, 유효기간(기본 오늘/자동생성 시 7일), 위임 범위 체크박스(Gift Exchange, Points Use, Others+직접입력) 최소 1개 필수, 확인 문구·동의 체크박스, Store/Staff 입력만 표시·PDF 미표시, 특이사항 2문구 입력·PDF 포함. form-handler·tabs 검증 반영.
- **위임장 UI 정리**: 위임 범위 "Others" 입력란을 01-01처럼 **항상 노출**(조건부 숨김 제거). PDF Scope of Authorization을 01-01처럼 **체크박스 + Others 입력란** 형태로 변경(선택 항목에 ✓ 표시).
- **PDF 전화번호 양식 전 양식 통일**: 전화번호를 표시하는 모든 PDF에서 **(국가번호) 전화번호** 형식(예: (852) 91234567)으로 통일. 수정 대상: 03-01, 03-02, 04-01, 04-02, 04-03(기존 `cc + ' ' + num` → `'(' + cc + ') ' + num`), 05-01 위임자·피위임자(form-handler 및 PDF inject). 01-01, 02-01~02-04는 이미 동일 형식. 02-05·02-06은 연락처 필드 없음.

**이어서 작업 시 참고**: 13개 양식 입력 화면·PDF·데이터 주입·검증까지 구현 완료. 다음 작업(서버 전송·저장·실제 인쇄 등) 시 본 체크리스트·개발 가이드라인·각 양식 확인항목 md(`forms/*_확인항목.md`)를 참고하면 연속적으로 진행하기 쉽습니다.
