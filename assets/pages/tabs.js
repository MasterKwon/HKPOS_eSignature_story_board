/* ============================================
   HK POS eSignature - Tabs Page
   - Form input tabs page initialization
   ============================================ */

(function () {
  'use strict';

  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  const STORAGE = window.HKPOS.STORAGE;
  const Utils = window.HKPOS.Utils;
  const FormHandler = window.HKPOS.FormHandler;

  const { qs, qsa, load, save, setText, formatCustomerLine, getSelectedForms, needsSignature, navFlow, toast } = Utils;
  const { requestFormDataFromIframe, loadFormHTML } = FormHandler;

  function t(key) {
    return (window.HKPOS && window.HKPOS.i18n && window.HKPOS.i18n.t(key)) || key;
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

    // 상단: 양식 썸네일 목록 (썸네일에는 titleShort, 툴팁에는 전체 제목)
    tabMenu.innerHTML = forms
      .map(
        (f, idx) => {
          var shortKey = "form." + f.key + ".titleShort";
          var fullKey = "form." + f.key + ".title";
          var shortT = t(shortKey);
          var fullT = t(fullKey);
          var label = (shortT !== shortKey ? shortT : fullT !== fullKey ? fullT : f.title);
          var tooltip = (fullT !== fullKey ? fullT : f.title);
          return `
          <div class="form-thumbnail ${idx === 0 ? "active" : ""}" data-form-key="${f.key}" role="button" tabindex="0" title="${String(tooltip).replace(/"/g, "&quot;")}">
            <div class="form-thumbnail-icon">📄</div>
            <div class="form-thumbnail-title">${label}</div>
          </div>
        `;
        }
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

    // 서명 패드 초기화
    if (window.HKPOS.Pages && window.HKPOS.Pages.initSignaturePad) {
      window.HKPOS.Pages.initSignaturePad();
    } else {
      // signature.js가 아직 로드되지 않았을 수 있으므로 약간의 지연 후 재시도
      setTimeout(() => {
        if (window.HKPOS.Pages && window.HKPOS.Pages.initSignaturePad) {
          window.HKPOS.Pages.initSignaturePad();
        } else {
          console.warn('[Tabs] initSignaturePad not found');
        }
      }, 100);
    }

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
                    // 04-01 고객 환불 확인서: confirm-cash 또는 confirm-original 중 하나라도 체크되면 통과
                    if (formKey === 'customer-refund') {
                      if (!data['confirm-cash'] && !data['confirm-original']) {
                        const formThumbnail = qs(`.form-thumbnail[data-form-key="${formKey}"]`);
                        const formTitle = formThumbnail ? formThumbnail.querySelector('.form-thumbnail-title')?.textContent : (formKey || '알 수 없는 양식');
                        uncheckedForms.push({ title: formTitle, formKey: formKey, formSectionItem: formSectionItem });
                      }
                      return;
                    }
                    // 05-01 위임장: 위임 범위 최소 1개 + 동의 체크박스 필수
                    if (formKey === 'authorization-letter') {
                      const scopeOk = Array.isArray(data['scope']) && data['scope'].length >= 1;
                      const confirmOk = !!data['confirmation-checkbox'];
                      if (!scopeOk || !confirmOk) {
                        const formThumbnail = qs(`.form-thumbnail[data-form-key="${formKey}"]`);
                        const formTitle = formThumbnail ? formThumbnail.querySelector('.form-thumbnail-title')?.textContent : (formKey || '알 수 없는 양식');
                        uncheckedForms.push({ title: formTitle, formKey: formKey, formSectionItem: formSectionItem });
                      }
                      return;
                    }
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
            
            // 모든 양식의 데이터를 비동기로 수집 (미로드 양식은 먼저 로드 후 수집 — 02-01~02-04 리뷰 데이터 주입 대비)
            const collectAllFormData = async () => {
              for (const formSectionItem of formSectionItems) {
                const formKey = formSectionItem.getAttribute('data-form-key');
                if (!formKey) continue;
                
                const contentEl = formSectionItem.querySelector('.form-section-content');
                const formPath = contentEl ? contentEl.getAttribute('data-form-path') : null;
                
                // iframe이 아직 로드되지 않은 양식(탭 미클릭)은 먼저 입력 폼 로드
                if (!window.formIframes || !window.formIframes.has(formKey)) {
                  if (contentEl && formPath) {
                    await loadFormHTML(contentEl, formPath, formKey);
                  }
                }
                
                // iframe 방식으로 데이터 수집
                if (window.formIframes && window.formIframes.has(formKey)) {
                  try {
                    const data = await requestFormDataFromIframe(formKey);
                    if (data && Object.keys(data).length > 0) {
                      allFormData[formKey] = data;
                    }
                  } catch (e) {
                    console.warn('[Tabs] Form data request failed for:', formKey, e);
                  }
                } else {
                  // 폴백: 기존 방식 (formWrapper 직접 접근)
                  const formWrapper = formSectionItem.querySelector('.form-wrapper');
                  if (formWrapper && formKey) {
                    if (!allFormData[formKey]) {
                      allFormData[formKey] = {};
                    }
                    
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
              }
              
              // 호칭 (Title) 및 국가번호 저장 (첫 번째 양식에서)
              if (allFormData['member-consultation']) {
                if (allFormData['member-consultation']['title']) {
                  save(STORAGE.formTitle, allFormData['member-consultation']['title']);
                }
                if (allFormData['member-consultation']['country-code']) {
                  save(STORAGE.formCountryCode, allFormData['member-consultation']['country-code']);
                }
              } else {
                // 회원 상담표가 없어도 다른 양식에서 title/country-code 사용
                const firstWithTitle = Object.values(allFormData).find(d => d && d['title']);
                if (firstWithTitle && firstWithTitle['title']) {
                  save(STORAGE.formTitle, firstWithTitle['title']);
                }
                const firstWithCountry = Object.values(allFormData).find(d => d && d['country-code']);
                if (firstWithCountry && firstWithCountry['country-code']) {
                  save(STORAGE.formCountryCode, firstWithCountry['country-code']);
                }
              }
              
              // 수집한 조건부 필드 데이터를 localStorage에 저장 (기존 데이터와 병합)
              const existing = load(STORAGE.conditionalFormData, {});
              Object.keys(allFormData).forEach(k => {
                if (allFormData[k] && Object.keys(allFormData[k]).length > 0) {
                  existing[k] = allFormData[k];
                }
              });
              save(STORAGE.conditionalFormData, existing);
              
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

  window.HKPOS.Pages = window.HKPOS.Pages || {};
  window.HKPOS.Pages.initTabsPage = initTabsPage;
})();
