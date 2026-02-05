# 다국어(영어/중국어) 적용 계획

상단 언어 선택(한국어 / English / 繁體中文)에 따라 **양식 입력·PDF 출력을 제외한** UI(로그인, 회원검색, 화면설명 등)를 번역하는 작업의 순서와, 진행 전에 확인이 필요한 사항을 정리했습니다.

---

## 1. 번역 범위 요약

| 구분 | 번역 여부 | 비고 |
|------|-----------|------|
| **양식 입력** (forms/*.html) | ❌ 영문 유지 | 기존대로 |
| **PDF 출력** (forms/pdf/*.html) | ❌ 영문 유지 | 기존대로 |
| **상단 톱바** | ✅ | 매장/직원/고객 pill, 초기화·설명 버튼, 언어 선택 옵션 표시 |
| **래퍼 페이지** | ✅ | 각 HTML의 `data-layout-title`, `data-layout-subtitle`, 화면 설명·컬럼 설명·사용법·테스트 데이터·설계 노트 등 |
| **앱 iframe** (app/*.html) | ✅ | 로그인, 고객검색, 양식선택, 내용입력, 최종확인, 전송완료 — 라벨·버튼·플레이스홀더·스텝퍼 텍스트 |
| **index / process-flow** | ✅ | 업무 프로세스, 데모 사용 방법, 버튼 문구 등 |
| **config.js 양식 카탈로그** | ⚠️ 확인 필요 | 양식 선택 화면에 나오는 `title` / `category` / `note` — 번역할지 여부 |

---

## 2. 권장 진행 방식 (빠르게 적용하기)

### 방식 A: 로케일 JSON + 키 기반 치환 (권장)

- **구조**: `assets/locales/ko.json`, `en.json`, `zh-Hant.json` (또는 `zh-Hans.json`) 생성.  
  각 키에 해당 언어 문자열 매핑.  
  예: `{ "topbar.reset": "초기화", "login.staffId": "직원 ID", "screen.list.subtitle": "화면설계 (iPad / Tablet)" }`
- **동작**:  
  - 페이지 로드 시 `localStorage`의 언어 값(또는 기본값)을 읽어 해당 로케일 JSON 로드.  
  - `document.documentElement.lang` 및 톱바 셀렉트는 기존처럼 유지.  
  - **래퍼 페이지**: `data-layout-title`, `data-layout-subtitle` 등을 **data-i18n 키**로 두고, `layout.js` 또는 전용 `i18n.js`에서 키→문자열 치환.  
  - **화면 설명 등 본문**: 문단/리스트를 키 단위로 쪼개어 같은 방식으로 치환하거나, 래퍼별로 “화면 설명 블록” 전체를 키 하나에 매핑.
- **앱 iframe**:  
  - 각 app/*.html 내 텍스트(라벨, 버튼, placeholder, 스텝퍼)를 `data-i18n` 또는 id/class로 마킹.  
  - iframe 로드 후 부모에서 언어 전달하거나, iframe 내부에서 `localStorage` 언어 읽어 동일 로케일 JSON으로 치환.
- **장점**: 한 곳(JSON)에서 번역 관리, 키로 일관성 유지, 나중에 언어 추가 용이.  
- **단점**: 초기에 키 설계와 HTML 마킹 작업 필요.

### 방식 B: data-i18n + 단일 스크립트

- **구조**: HTML에 `data-i18n="key.path"` 속성만 부여.  
  하나의 JS 객체(또는 JSON)에 `key.path` → { ko: "...", en: "...", "zh-Hant": "..." } 형태로 보관.
- **동작**: 공통 스크립트가 DOM 순회하며 `data-i18n`이 있는 노드의 텍스트를 현재 언어로 치환.
- **장점**: HTML 수정이 최소화되고, 스크립트 한 곳에서 처리.  
- **단점**: 긴 문단은 키가 많아지거나, HTML 구조를 조금 더 쪼개야 할 수 있음.

### 방식 C: 언어별 HTML 분리

- **구조**: 예) `01_store-user-login.html`, `01_store-user-login.en.html`, `01_store-user-login.zh-Hant.html` 등.
- **동작**: 언어 변경 시 해당 언어용 HTML로 이동하거나, 서버/스크립트에서 언어에 따라 다른 HTML 제공.
- **단점**: 중복이 많아지고, 수정 시 여러 파일 동기화 필요. **비권장**.

---

**정리**: 빠르고 유지보수하기 좋은 쪽은 **방식 A(로케일 JSON + 키 기반)** 입니다.  
먼저 톱바·래퍼 제목/부제·한두 개 앱 화면(예: 로그인)만 키/JSON으로 적용한 뒤, 나머지 화면과 설명 문단을 단계적으로 키화하면 됩니다.

---

## 3. 작업 순서 제안

1. **로케일 파일 구조 확정**
   - 지원 언어: `ko`, `en`, `zh-Hant` (또는 `zh-Hans` — 아래 “확인 필요” 참고).
   - `assets/locales/ko.json`, `en.json`, `zh-Hant.json` 생성.
   - 공통 키 이름 규칙 정하기 (예: `topbar.*`, `login.*`, `customerSearch.*`, `screen.01.*`, `screen.04.*` 등).

2. **공통 i18n 로직**
   - `assets/utils.js`의 `applyLanguageState` 확장: 언어 변경 시 로케일 JSON 로드(또는 이미 로드된 객체 사용).
   - `t(key)` 또는 `HKPOS.i18n.t(key)` 같은 번역 함수 추가.  
   - (선택) `layout.js`에서 래퍼 페이지 로드 시점에 `data-layout-title` / `data-layout-subtitle`를 키로 해석해 치환.

3. **톱바**
   - 톱바 내 텍스트(매장/직원/고객 라벨, “초기화”, “설명 숨기기/보이기” 등)를 로케일 키로 교체.  
   - 언어 선택 변경 시 `applyLanguageState` 호출 후, 톱바 텍스트 다시 그리기 + 필요 시 현재 페이지 본문도 다시 치환.

4. **래퍼 페이지 (화면설계서 본문)**
   - `index.html`, `01_store-user-login.html`, `02_main-customer-search.html`, `03_consultation-selection.html`, `04_consultation-review-and-input-tabs.html`, `05_consultation-review.html`, `06_consultation-completion.html`, `process-flow.html`
   - 각 페이지의 `data-layout-title`, `data-layout-subtitle`를 로케일 키로 전환 (또는 키로 치환).
   - “화면 설명”, “컬럼 설명”, “사용법”, “테스트 데이터”, “설계 노트” 등 문단/리스트를 키 단위로 쪼개어 JSON에 넣고, 로드 시 치환.

5. **앱 iframe (app/*.html)**
   - `01_login.html`, `02_customer-search.html`, `03_consultation-selection.html`, `04_tabs.html`, `05_review.html`, `06_completion.html`
   - 각 화면의 라벨·버튼·placeholder·스텝퍼 텍스트를 로케일 키로 치환.  
   - iframe은 부모와 같은 로케일을 쓰도록 `localStorage` 언어 값을 참조하거나, 부모에서 postMessage로 언어 전달.

6. **config.js 양식 카탈로그**
   - 양식 선택 화면에 쓰이는 `title`, `category`, `note`를 번역할 경우:  
     로케일 JSON에 `form.*.title`, `form.*.category`, `form.*.note` 형태로 추가하고, 목록 렌더링 시 `t(...)` 사용.  
   - 번역하지 않기로 하면: 기존 한글(또는 영문) 그대로 유지.

7. **테스트 및 정리**
   - 언어 전환 시 톱바·래퍼·앱 iframe이 모두 선택한 언어로 바뀌는지 확인.  
   - 양식 입력/PDF는 항상 영문인지 확인.  
   - `document.documentElement.lang`과 톱바 셀렉트 값이 선택 언어와 일치하는지 확인.

---

## 4. 진행 전에 확인이 필요한 정보

아래 항목에 대해 답해 주시면, 그에 맞춰 키 설계와 로케일 파일 예시를 더 구체화할 수 있습니다.

1. **중국어 종류**  
   - **繁體中文 (zh-Hant)** / **简体中文 (zh-Hans)** 중 어떤 것을 사용할 예정인가요?  
   - (현재 톱바에는 “繁體中文 (CHT)” 옵션이 있습니다.)
   답변 : 중국어 (번체)로 진행할거야.

2. **초기 기본 언어**  
   - 첫 방문 시 기본 언어를 **한국어**로 유지할까요, 아니면 **영어**로 바꿀 예정인가요?
   답변 : 한국어로 유지

3. **번역 문구 제공**  
   - 영문/중국어 문구는 **직접 작성**하시나요, **번역 업체/내부 팀**에게 요청하시나요, 아니면 **초안만 먼저 (예: 기계 번역)** 넣고 나중에 수정할 계획인가요?  
   - 이에 따라 “빈 키”나 placeholder를 먼저 넣고 나중에 채우는 방식으로 진행할 수 있습니다.
   답변 : 일단 니가 번역해줘. 나중에 개발 단계에서 변경될 수 있지만 지금은 데모기준이라 따로 번역팀이 작업을 하지 않아.

4. **양식 선택 화면의 양식명·카테고리**  
   - `config.js`의 `FORM_CATALOG`에 있는 `title`, `category`, `note`(예: “회원 상담표”, “상담 및 정보 수집”)를 **번역 대상**에 포함할까요?  
   - 포함한다면: 양식 입력/PDF는 영문 유지하고, **선택 화면에서만** 번역된 이름/카테고리/설명을 보여주는 방식이 됩니다.
   답변 : 번역해줘. 실제 양식/pdf는 언어에 상관없이 영문으로 유지할거야. (이유 : 보통 영문이 길어지는 경우가 많아서 UI를 고려할때 영문 기준으로 진행했었음)

5. **schemas 등 기타 문서**  
   - `schemas/view-form-schemas.html`, `forms-checklist.md` 등 **화면설계서 외 문서**는 이번에 번역 범위에 넣을 계획이 있으신가요? (있으면 로케일 대상 목록에 포함할 수 있습니다.)
   답변 : 스키마등 기타문서는 한국인 개발자가 볼 화면이라 번역하지 않아도 괜찮아.

---

위 내용을 바탕으로 답변 주시면, 다음 단계(키 목록 초안, 로케일 JSON 샘플, 수정할 파일 목록)를 이어서 정리하겠습니다.
